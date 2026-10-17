// google-reviews — returns BrightScale's live Google rating and latest reviews for the website.
//
// Deploy (project brightscale-scanner, hyvoatfozlpsevsbkxxm):
//   supabase functions deploy google-reviews --no-verify-jwt --project-ref hyvoatfozlpsevsbkxxm
// Secrets (Paulo types these himself in Supabase > Edge Functions > Secrets):
//   GOOGLE_PLACES_API_KEY  Google Cloud key with "Places API (New)" enabled
//   GOOGLE_PLACE_ID        optional; if missing, the place is found by GOOGLE_PLACE_QUERY
//   GOOGLE_PLACE_QUERY     optional; default below
//
// Public, read-only data. Responses are cached for 6 hours so Google is called
// a few times a day at most. Google allows at most 5 reviews per place through the API.

const QUERY_DEFAULT = "BrightScale 5851 Holmberg Rd Parkland FL 33067";
const TTL_MS = 6 * 60 * 60 * 1000;
const LANGS = new Set(["en", "es", "pt"]);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const cache = new Map<string, { at: number; body: string }>();
let placeId = Deno.env.get("GOOGLE_PLACE_ID") ?? "";

function json(body: unknown, status = 200, maxAge = 0) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": maxAge ? `public, max-age=${maxAge}` : "no-store",
    },
  });
}

async function findPlace(key: string): Promise<string> {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: Deno.env.get("GOOGLE_PLACE_QUERY") ?? QUERY_DEFAULT }),
  });
  if (!r.ok) throw new Error(`searchText ${r.status}`);
  const d = await r.json();
  const id = d.places?.[0]?.id;
  if (!id) throw new Error("place not found");
  return id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") return json({ ok: false, error: "method" }, 405);

  const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) return json({ ok: false, error: "not_configured" }, 503);

  const reqLang = new URL(req.url).searchParams.get("lang") ?? "en";
  const lang = LANGS.has(reqLang) ? reqLang : "en";

  const hit = cache.get(lang);
  if (hit && Date.now() - hit.at < TTL_MS) return json(hit.body, 200, 21600);

  try {
    if (!placeId) placeId = await findPlace(key);
    const r = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${lang}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "displayName,rating,userRatingCount,googleMapsUri,reviews",
        },
      },
    );
    if (!r.ok) throw new Error(`details ${r.status}`);
    const p = await r.json();
    const body = JSON.stringify({
      ok: true,
      name: p.displayName?.text ?? "",
      rating: p.rating ?? null,
      count: p.userRatingCount ?? 0,
      url: p.googleMapsUri ?? "",
      reviews: (p.reviews ?? []).map((v: any) => ({
        rating: v.rating ?? 0,
        // the review as the client wrote it; Google's translation only as a fallback
        text: v.originalText?.text ?? v.text?.text ?? "",
        author: v.authorAttribution?.displayName ?? "Google user",
        authorUrl: v.authorAttribution?.uri ?? "",
        when: v.relativePublishTimeDescription ?? "",
        publishTime: v.publishTime ?? "",
      })),
      fetchedAt: new Date().toISOString(),
    });
    cache.set(lang, { at: Date.now(), body });
    return json(body, 200, 21600);
  } catch (e) {
    console.error("google-reviews", e);
    if (hit) return json(hit.body, 200, 600); // serve the last good copy
    return json({ ok: false, error: "upstream" }, 502);
  }
});
