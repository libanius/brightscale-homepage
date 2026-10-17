import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";

// sms-funnel — appointment confirmation by text, over the approved A2P campaign.
//
//   POST {action:"test_propose", phone, name?, email?}   (JSON)
//       Finds the first open video-consultation slot tomorrow (sales-booking),
//       stores it in private.sms_bookings and texts the proposal. Only sends to the
//       owner's control phones (private.sales_agent_config.control_phones).
//
//   POST from Twilio (form-encoded, Messaging Service incoming webhook)
//       YES / SIM / SÍ  -> books the proposed slot in Google Calendar with a Meet link
//                          and replies with the confirmation
//       1 / 2 / 3       -> books that alternative (offered when the first slot is taken)
//       CALL            -> asks Brighty (Vapi) to call back, when VAPI_API_KEY is set
//       anything else   -> forwarded to Telegram, polite holding reply
//       STOP / HELP     -> handled by Twilio's opt-out management (no reply here)
//
// Secrets (typed by Paulo in Supabase > Edge Functions > Secrets):
//   TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET   needed to send texts
//   TWILIO_AUTH_TOKEN                           optional; enables webhook signature checks
//   VAPI_API_KEY, VAPI_PHONE_NUMBER_ID          optional; enables the CALL reply

const dbUrl = Deno.env.get("SUPABASE_DB_URL");
if (!dbUrl) throw new Error("SUPABASE_DB_URL is not available");

const VERSION = 1;
const FROM_NUMBER = "+19547872738";
const BOOKING_URL = "https://hyvoatfozlpsevsbkxxm.supabase.co/functions/v1/sales-booking";
const BRAND = "BrightScale Remodeling";
const VAPI_ASSISTANT_ID = "bb28e915-1cf4-484c-8e2f-abc552db4226"; // Brighty
const env = (k: string) => (Deno.env.get(k) || "").trim();
const ACCOUNT_SID = env("TWILIO_ACCOUNT_SID");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
function twiml(message?: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = message ? `<Response><Message>${esc(message)}</Message></Response>` : "<Response/>";
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, { headers: { "content-type": "text/xml" } });
}
function e164(v: unknown) {
  const d = String(v ?? "").replace(/\D/g, "");
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d.startsWith("1")) return "+" + d;
  return d ? "+" + d : "";
}
function etLabel(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", month: "2-digit", day: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }).format(d);
  return `${day.replace(",", ",")} at ${time}`;
}
function etDate(iso: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(iso));
}

async function bookingCall(sql: any, payload: Record<string, unknown>) {
  const c = (await sql`select admin_secret from private.zernio_integration_config where singleton=true limit 1`)[0];
  if (!c?.admin_secret) throw new Error("Internal auth config missing");
  const r = await fetch(BOOKING_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-brightscale-internal": String(c.admin_secret) },
    body: JSON.stringify(payload),
  });
  const t = await r.text();
  let d: any = {};
  try { d = t ? JSON.parse(t) : {}; } catch { d = {}; }
  return { ok: r.ok && d?.ok !== false, data: d, error: String(d?.error || (r.ok ? "" : r.status)) };
}

async function sendSms(sql: any, to: string, body: string, bookingId: string | null) {
  const sid = env("TWILIO_API_KEY_SID"), secret = env("TWILIO_API_KEY_SECRET");
  if (!sid || !secret || !ACCOUNT_SID) throw new Error("twilio_not_configured");
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(`${sid}:${secret}`), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ From: FROM_NUMBER, To: to, Body: body }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Twilio ${r.status}: ${String(d?.message || "").slice(0, 200)}`);
  await sql`insert into private.sms_messages (direction, phone, body, twilio_sid, booking_id) values ('out', ${to}, ${body}, ${String(d.sid || "")}, ${bookingId})`;
  return String(d.sid || "");
}

async function telegram(sql: any, text: string) {
  try {
    const v = await sql`select name, decrypted_secret from vault.decrypted_secrets where name in ('telegram_bot_token','telegram_chat_id')`;
    const s: Record<string, string> = {};
    for (const r of v) s[String(r.name)] = String(r.decrypted_secret || "");
    if (!s.telegram_bot_token || !s.telegram_chat_id) return;
    await fetch(`https://api.telegram.org/bot${s.telegram_bot_token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: s.telegram_chat_id, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (e) { console.error("telegram", String((e as Error).message || e)); }
}
const h = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Twilio request signature (only when TWILIO_AUTH_TOKEN is configured).
async function validTwilioSignature(req: Request, params: URLSearchParams) {
  const token = env("TWILIO_AUTH_TOKEN");
  if (!token) return true;
  const sig = req.headers.get("x-twilio-signature") || "";
  const url = req.url.replace(/^http:/, "https:");
  const keys = [...new Set([...params.keys()])].sort();
  const data = url + keys.map((k) => k + params.get(k)).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(token), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  const expected = btoa(String.fromCharCode(...mac));
  return expected === sig;
}

async function confirmBooking(sql: any, b: any, start: string) {
  const res = await bookingCall(sql, {
    action: "create_event", booking_type: b.booking_type, start,
    customer_name: b.customer_name, customer_email: b.customer_email, customer_phone: b.phone,
    service_summary: b.summary || "BrightScale video consultation (confirmed by text).",
  });
  if (!res.ok) return { ok: false, error: res.error };
  const meet = String(res.data?.google_meet_url || "");
  await sql`update private.sms_bookings set status='confirmed', proposed_start=${String(res.data.start || start)},
    proposed_label=${etLabel(String(res.data.start || start))}, meet_url=${meet || null}, event_id=${String(res.data.event_id || "") || null},
    updated_at=now() where id=${b.id}`;
  return { ok: true, start: String(res.data.start || start), meet };
}

async function handleInbound(sql: any, req: Request) {
  const raw = await req.text();
  const p = new URLSearchParams(raw);
  if ((ACCOUNT_SID && p.get("AccountSid") !== ACCOUNT_SID) || e164(p.get("To")) !== FROM_NUMBER) return twiml();
  if (!(await validTwilioSignature(req, p))) return new Response("forbidden", { status: 403 });

  const from = e164(p.get("From"));
  const body = String(p.get("Body") || "").trim();
  const word = body.toUpperCase().replace(/[^A-ZÁÍ0-9 ]/g, "").trim();
  const b = (await sql`select * from private.sms_bookings where phone=${from} and status='proposed'
    and created_at > now() - interval '72 hours' order by created_at desc limit 1`)[0];
  await sql`insert into private.sms_messages (direction, phone, body, twilio_sid, booking_id) values ('in', ${from}, ${body}, ${p.get("MessageSid")}, ${b?.id || null})`;
  if (b) await sql`update private.sms_bookings set last_inbound=${body.slice(0, 500)}, updated_at=now() where id=${b.id}`;

  if (["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "HELP", "INFO", "START", "UNSTOP"].includes(word)) return twiml();

  const yes = /^(YES|Y|SIM|SI|SÍ|OK|CONFIRM|CONFIRMO|CONFIRMADO)\b/.test(word);
  const pick = /^[123]$/.test(word) ? Number(word) : 0;

  if (b && (yes || pick)) {
    const alts: string[] = Array.isArray(b.alternatives) ? b.alternatives : [];
    const start = pick ? alts[pick - 1] : new Date(b.proposed_start).toISOString();
    if (!start) return twiml(`${BRAND}: Please reply 1, 2 or 3 to choose a time, or call 954-553-9535.`);
    const r = await confirmBooking(sql, b, start);
    if (r.ok) {
      const label = etLabel(r.start);
      await telegram(sql, `✅ <b>Confirmado por SMS</b>\n${h(b.customer_name || from)} · ${h(from)}\nVídeo: ${h(label)} (ET)${r.meet ? `\nMeet: ${h(r.meet)}` : ""}`);
      return twiml(`${BRAND}: Your video call is confirmed for ${label} (ET).${r.meet ? ` Join here: ${r.meet}` : ""} A calendar invite was sent to your email. Reply HELP for help or STOP to opt out.`);
    }
    // Slot was taken: offer the next three.
    const s = await bookingCall(sql, { action: "find_slots", booking_type: b.booking_type, limit: 3, horizon_days: 7, start_offset_days: 0 });
    const slots: any[] = Array.isArray(s.data?.slots) ? s.data.slots.slice(0, 3) : [];
    if (!slots.length) {
      await telegram(sql, `⚠️ <b>SMS: horário indisponível e sem alternativas</b>\n${h(from)} respondeu "${h(body)}". Erro: ${h(r.error)}`);
      return twiml(`${BRAND}: That time is no longer open. Our team will text you new options shortly. Reply STOP to opt out.`);
    }
    await sql`update private.sms_bookings set alternatives=${sql.json(slots.map((x) => x.start))}, updated_at=now() where id=${b.id}`;
    const list = slots.map((x, i) => `${i + 1}) ${etLabel(x.start)}`).join("  ");
    return twiml(`${BRAND}: That time was just taken. Reply 1, 2 or 3: ${list} (ET). Reply STOP to opt out.`);
  }

  if (/^CALL\b|^LIGA|^LLAMA/.test(word)) {
    const key = env("VAPI_API_KEY"), num = env("VAPI_PHONE_NUMBER_ID");
    if (key && num) {
      const r = await fetch("https://api.vapi.ai/call", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ assistantId: VAPI_ASSISTANT_ID, phoneNumberId: num, customer: { number: from } }),
      });
      await telegram(sql, `📞 <b>SMS: cliente pediu ligação</b>\n${h(from)} · Brighty ${r.ok ? "ligando agora" : "não conseguiu ligar (" + r.status + ")"}`);
      if (r.ok) return twiml(`${BRAND}: Brighty will call you in a moment. Reply STOP to opt out.`);
    } else {
      await telegram(sql, `📞 <b>SMS: cliente pediu ligação</b>\n${h(from)} respondeu CALL. Ligar de volta.`);
    }
    return twiml(`${BRAND}: Thanks! We will call you shortly. Reply STOP to opt out.`);
  }

  await telegram(sql, `💬 <b>Resposta por SMS</b>\n${h(b?.customer_name || "")} ${h(from)}\n"${h(body.slice(0, 600))}"`);
  return twiml(b
    ? `${BRAND}: Got it, thanks. Our team will reply shortly. To keep the proposed time, reply YES. Reply STOP to opt out.`
    : `${BRAND}: Thanks for your message. Our team will reply shortly, or call 954-553-9535. Reply STOP to opt out.`);
}

async function testPropose(sql: any, body: any) {
  const phone = e164(body?.phone);
  const ctl = (await sql`select control_phones from private.sales_agent_config where singleton=true limit 1`)[0];
  const allowed = (Array.isArray(ctl?.control_phones) ? ctl.control_phones : []).map((x: unknown) => e164(x));
  if (!phone || !allowed.includes(phone)) return json({ ok: false, error: "test_only_to_owner_phones" }, 403);
  const recent = await sql`select count(*)::int n from private.sms_bookings where source='test' and created_at > now() - interval '1 hour'`;
  if (recent[0].n >= 3) return json({ ok: false, error: "rate_limited" }, 429);

  const s = await bookingCall(sql, { action: "find_slots", booking_type: "video", limit: 6, horizon_days: 3, start_offset_days: 0 });
  const slots: any[] = Array.isArray(s.data?.slots) ? s.data.slots : [];
  const tomorrow = etDate(new Date(Date.now() + 24 * 3600 * 1000));
  const pickSlot = slots.find((x) => etDate(x.start) === tomorrow) || slots[0];
  if (!pickSlot) return json({ ok: false, error: "no_slots", detail: s.error }, 409);

  const name = String(body?.name || "Paulo").slice(0, 80);
  const email = String(body?.email || "brightscalegroup@gmail.com").slice(0, 200);
  const label = etLabel(pickSlot.start);
  const ins = await sql`insert into private.sms_bookings
    (phone, customer_name, customer_email, booking_type, proposed_start, proposed_label, alternatives, summary, source)
    values (${phone}, ${name}, ${email}, 'video', ${pickSlot.start}, ${label},
      ${sql.json(slots.filter((x) => x.start !== pickSlot.start).slice(0, 3).map((x) => x.start))},
      ${"Teste do funil de confirmação por SMS (consulta por vídeo)."}, 'test') returning id`;
  const id = ins[0].id;
  const text = `${BRAND}: Thanks for calling, ${name.split(" ")[0]}. Summary: free 15-minute video consultation about your project. Proposed visit: ${label} (ET). Reply YES to confirm or reply with another time. Reply STOP to opt out.`;
  try {
    const sid = await sendSms(sql, phone, text, id);
    await telegram(sql, `🧪 <b>Teste SMS enviado</b> para ${h(phone)}\nProposta: vídeo ${h(label)} (ET). Responda YES no celular.`);
    return json({ ok: true, id, sid, proposed: label });
  } catch (e) {
    const err = String((e as Error).message || e);
    await sql`update private.sms_bookings set status='failed', last_error=${err}, updated_at=now() where id=${id}`;
    return json({ ok: false, id, error: err }, 502);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, GET" } });
  if (req.method === "GET") return json({ ok: true, service: "sms-funnel", version: VERSION, twilio: !!(ACCOUNT_SID && env("TWILIO_API_KEY_SID") && env("TWILIO_API_KEY_SECRET")), signature_check: !!env("TWILIO_AUTH_TOKEN"), vapi_call: !!(env("VAPI_API_KEY") && env("VAPI_PHONE_NUMBER_ID")) });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);
  const sql = postgres(dbUrl!, { prepare: false, max: 1 });
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/x-www-form-urlencoded")) return await handleInbound(sql, req);
    const body = await req.json().catch(() => ({}));
    if (body?.action === "test_propose") return await testPropose(sql, body);
    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (e) {
    console.error("sms-funnel", String((e as Error)?.message || e));
    return json({ ok: false, error: "server" }, 500);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
});
