import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";

// crm-painel — backend for brightscalegroup.com/painel (lead-conversion CRM).
//
// Auth (own, no Supabase Auth): only e-mails in private.crm_users can sign in.
//   request_link -> one-time link (20 min) e-mailed from the business Gmail;
//                   Paulo also gets a Telegram notice (and the link itself if e-mail fails)
//   exchange     -> trades the one-time token for a 30-day session token
// Only SHA-256 hashes of tokens are stored.
//
// Data: joins Home Depot (hd_leads + sms_messages), Brighty calls (phone_leads),
// site form (web_leads) and live WhatsApp (sales_agent_conversations) with
// appointments/bookings and the manual outcomes (won/lost/value/reason).
//
// verify_jwt is off: every action except request_link/exchange requires a session.

const dbUrl = Deno.env.get("SUPABASE_DB_URL");
if (!dbUrl) throw new Error("SUPABASE_DB_URL is not available");

const VERSION = 2;
const SITE = "https://brightscalegroup.com";
const LOGIN_MINUTES = 20;
const SESSION_DAYS = 30;
const googleClientId = (Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") || "").trim();
const googleClientSecret = (Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") || "").trim();
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?brightscalegroup\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?brightscale-homepage\.pages\.dev$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];
const SOURCES = ["home_depot", "brighty_call", "site", "whatsapp"];
const OUTCOMES = ["open", "won", "lost", "test"];

const okOrigin = (o: string | null) => !!o && ALLOWED_ORIGINS.some((r) => r.test(o));
function corsFor(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : SITE,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Vary": "Origin",
  };
}
function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" } });
}
const clean = (v: unknown, max = 500) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const p10 = (v: unknown) => String(v ?? "").replace(/\D/g, "").slice(-10);

function randomToken() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function b64utf8(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/* ---------------- Gmail + Telegram ---------------- */
async function sendGmail(sql: any, to: string, subject: string, html: string, text: string) {
  const cfg = (await sql`select refresh_token, calendar_id, granted_scope from private.google_calendar_oauth_config where singleton=true limit 1`)[0];
  if (!cfg?.refresh_token) throw new Error("Google account is not connected");
  if (!String(cfg.granted_scope || "").includes("gmail.send")) throw new Error("Google connection lacks gmail.send");
  if (!googleClientId || !googleClientSecret) throw new Error("Google OAuth secrets missing");
  const form = new URLSearchParams({ client_id: googleClientId, client_secret: googleClientSecret, refresh_token: String(cfg.refresh_token), grant_type: "refresh_token" });
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  const td = await tr.json();
  if (!tr.ok || !td?.access_token) throw new Error(`Google token refresh failed: ${String(td?.error || tr.status)}`);
  const from = String(cfg.calendar_id || "");
  const boundary = "bs" + crypto.randomUUID().replace(/-/g, "");
  const wrap = (s: string) => (b64utf8(s).match(/.{1,76}/g) || []).join("\r\n");
  const mime = [
    `From: BrightScale Painel <${from}>`, `To: ${to}`, `Subject: =?UTF-8?B?${b64utf8(subject)}?=`,
    "MIME-Version: 1.0", `Content-Type: multipart/alternative; boundary="${boundary}"`, "",
    `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", wrap(text),
    `--${boundary}`, 'Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", wrap(html),
    `--${boundary}--`,
  ].join("\r\n");
  const raw = b64utf8(mime).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", headers: { Authorization: `Bearer ${td.access_token}`, "content-type": "application/json" }, body: JSON.stringify({ raw }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(`Gmail send ${r.status}: ${String(d?.error?.message || "").slice(0, 160)}`);
  }
}

async function telegram(sql: any, text: string, button?: { text: string; url: string }) {
  const v = await sql`select name, decrypted_secret from vault.decrypted_secrets where name in ('telegram_bot_token','telegram_chat_id')`;
  const vault: Record<string, string> = {};
  for (const r of v) vault[String(r.name)] = String(r.decrypted_secret || "");
  if (!vault.telegram_bot_token || !vault.telegram_chat_id) throw new Error("Telegram credentials missing");
  const body: any = { chat_id: vault.telegram_chat_id, text, parse_mode: "HTML", disable_web_page_preview: true };
  if (button) body.reply_markup = { inline_keyboard: [[button]] };
  const r = await fetch(`https://api.telegram.org/bot${vault.telegram_bot_token}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d?.ok !== true) throw new Error(`Telegram ${String(d?.description || r.status).slice(0, 160)}`);
}

function loginEmail(name: string, link: string) {
  const html = `<!doctype html><html><body style="margin:0;background:#F5F5F5;font-family:Montserrat,'Segoe UI',Helvetica,Arial,sans-serif;color:#000;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;background:#fff;border:2px solid #000;">
<tr><td style="background:#000;color:#fff;padding:18px 24px;font-weight:800;font-size:16px;">BrightScale · Painel de leads</td></tr>
<tr><td style="height:6px;background:#18C95F;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:24px;">
<p style="margin:0 0 12px;font-size:16px;font-weight:700;">Olá${name ? " " + esc(name) : ""},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5;">Toque no botão para entrar no painel. O link vale por ${LOGIN_MINUTES} minutos e só funciona uma vez.</p>
<a href="${esc(link)}" style="display:inline-block;background:#18C95F;color:#000;font-weight:800;text-decoration:none;padding:14px 22px;border:2px solid #000;">Entrar no painel</a>
<p style="margin:20px 0 0;font-size:12px;color:#777;">Se não foi você que pediu, ignore este e-mail.</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = `Entrar no painel BrightScale (vale ${LOGIN_MINUTES} min, uso único): ${link}`;
  return { html, text };
}

/* ---------------- Lead assembly ---------------- */
type Msg = { dir: string; at: string; body: string };

function msgVersion(body: string) {
  if (/we received your service request/i.test(body)) return "v1_empresa";
  if (/this is Paulo from BrightScale/i.test(body)) return "v2_paulo";
  return "outra";
}

async function buildData(sql: any) {
  const [hd, sms, calls, web, wa, appts, bookings, outcomes, changelog, callbacks, testPhones] = await Promise.all([
    sql`select id, customer_name, first_name, phone, job, city, zip, status, channel_choice, first_sms_at, reminder_sent_at, created_at from private.hd_leads`,
    sql`select direction, phone, body, created_at from private.sms_messages order by created_at`,
    sql`select id, customer_name, coalesce(nullif(callback_phone,''), caller_phone) phone, service, city, lead_type, urgent, language,
               left(summary, 600) summary, duration_seconds, created_at from private.phone_leads`,
    sql`select id, name, phone, project, zip, language, created_at from private.web_leads`,
    sql`select id, contact_name, coalesce(external_phone, contact_phone) phone, status, left(summary, 600) summary, created_at, last_customer_at
        from private.sales_agent_conversations where mode = 'live'`,
    sql`select customer_phone phone, booking_type, status, stripe_payment_status, fee_amount, scheduled_start, created_at from private.sales_agent_appointments`,
    sql`select phone, booking_type, status, proposed_start, created_at, source from private.sms_bookings where coalesce(source,'') <> 'test'`,
    sql`select source, lead_id, outcome, job_value, lost_reason, notes, updated_by, updated_at from private.lead_outcomes`,
    sql`select id, happened_on, title, details, created_by from private.crm_changelog order by happened_on desc, created_at desc`,
    sql`select lead_id, status, created_at from private.callback_requests`,
    sql`select phone10 from private.crm_test_phones`,
  ]);
  // Paulo's own phones: everything from/to them is a test.
  const testSet = new Set<string>(testPhones.map((r: any) => String(r.phone10)));

  const smsBy: Record<string, Msg[]> = {};
  for (const m of sms) {
    const k = p10(m.phone);
    if (!k || testSet.has(k)) continue;
    (smsBy[k] ||= []).push({ dir: String(m.direction), at: new Date(m.created_at).toISOString(), body: String(m.body || "") });
  }
  const bookBy: Record<string, any[]> = {};
  for (const a of appts) {
    const k = p10(a.phone);
    if (!k) continue;
    (bookBy[k] ||= []).push({
      type: a.booking_type === "video" ? "video" : "visita", status: a.status, paid: a.stripe_payment_status === "paid",
      fee: a.fee_amount ? Number(a.fee_amount) : null, at: a.scheduled_start || a.created_at, created_at: a.created_at,
    });
  }
  for (const b of bookings) {
    const k = p10(b.phone);
    if (!k) continue;
    (bookBy[k] ||= []).push({ type: b.booking_type === "video" ? "video" : (b.booking_type || "agendamento"), status: b.status, paid: false, fee: null, at: b.proposed_start || b.created_at, created_at: b.created_at });
  }
  const outBy: Record<string, any> = {};
  for (const o of outcomes) outBy[`${o.source}:${o.lead_id}`] = o;
  const cbBy: Record<string, any> = {};
  for (const c of callbacks) if (c.lead_id) cbBy[String(c.lead_id)] = c;

  const leads: any[] = [];
  const push = (source: string, id: string, base: any) => {
    const key = p10(base.phone);
    const bk = (key && bookBy[key]) || [];
    const o = outBy[`${source}:${id}`];
    const autoTest = /^paulo\b/i.test(String(base.name || "").trim()) || (!!key && testSet.has(key));
    let outcome = o?.outcome || (autoTest ? "test" : "open");
    const booked = bk.length ? bk.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] : null;
    const paid = bk.some((b) => b.paid);
    let stage = "novo";
    if (base.contacted_at) stage = "contatado";
    if (base.replied_at) stage = "respondeu";
    if (booked) stage = "agendado";
    if (paid) stage = "pago";
    if (outcome === "won") stage = "ganho";
    if (outcome === "lost") stage = "perdido";
    if (outcome === "test") stage = "teste";
    if (base.archived && outcome === "open" && !o) stage = "arquivado";
    leads.push({
      source, id, ...base, phone10: key,
      booked: booked ? { type: booked.type, status: booked.status, at: booked.at } : null, paid,
      outcome, auto_test: autoTest && !o, job_value: o?.job_value != null ? Number(o.job_value) : null,
      lost_reason: o?.lost_reason || null, notes: o?.notes || null, outcome_by: o?.updated_by || null, outcome_at: o?.updated_at || null,
      stage,
    });
  };

  // Home Depot: contact = first outbound SMS; reply = any inbound SMS after it.
  const versionStats: Record<string, { sent: number; replied: number }> = {};
  const stepStats: Record<string, { sent: number; replied: number }> = { lembrete_24h: { sent: 0, replied: 0 }, check_in: { sent: 0, replied: 0 } };
  for (const h of hd) {
    const key = p10(h.phone);
    const created = new Date(h.created_at).getTime() - 3600_000;
    const msgs = (key && smsBy[key] || []).filter((m) => new Date(m.at).getTime() >= created);
    const firstOut = msgs.find((m) => m.dir === "out" && /Home Depot/i.test(m.body)) || msgs.find((m) => m.dir === "out");
    const contactedAt = firstOut?.at || (h.first_sms_at ? new Date(h.first_sms_at).toISOString() : null);
    const firstIn = contactedAt ? msgs.find((m) => m.dir === "in" && m.at > contactedAt) : msgs.find((m) => m.dir === "in");
    const version = firstOut ? msgVersion(firstOut.body) : null;
    const archived = h.status === "ignored_old";
    const isTest = /^paulo\b/i.test(String(h.customer_name || "").trim()) || (!!key && testSet.has(key));
    if (version && !archived && !isTest) {
      versionStats[version] ||= { sent: 0, replied: 0 };
      versionStats[version].sent++;
      if (firstIn) versionStats[version].replied++;
      for (const [step, re] of [["lembrete_24h", /again, just checking in/i], ["check_in", /organize the leads/i]] as [string, RegExp][]) {
        const s = msgs.find((m) => m.dir === "out" && re.test(m.body));
        if (s) {
          stepStats[step].sent++;
          if (msgs.some((m) => m.dir === "in" && m.at > s.at)) stepStats[step].replied++;
        }
      }
    }
    push("home_depot", h.id, {
      name: h.customer_name || h.first_name || null, phone: h.phone, service: h.job, city: h.city || h.zip || null,
      created_at: h.created_at, contacted_at: contactedAt, replied_at: firstIn?.at || null, first_msg_version: version,
      channel: h.channel_choice || null, status_raw: h.status, archived, callback: cbBy[String(h.id)]?.status || null,
      sms_count: { out: msgs.filter((m) => m.dir === "out").length, in: msgs.filter((m) => m.dir === "in").length },
    });
  }
  for (const c of calls) {
    push("brighty_call", c.id, {
      name: c.customer_name, phone: c.phone, service: c.service, city: c.city, created_at: c.created_at,
      contacted_at: c.created_at, replied_at: c.created_at, qualification: c.lead_type, urgent: !!c.urgent,
      language: c.language, summary: c.summary, duration_seconds: c.duration_seconds ? Number(c.duration_seconds) : null,
      archived: c.lead_type === "other_request" || c.lead_type === "not_a_fit",
    });
  }
  for (const w of web) {
    push("site", w.id, { name: w.name, phone: w.phone, service: w.project, city: w.zip, created_at: w.created_at, contacted_at: w.created_at, replied_at: w.created_at, language: w.language });
  }
  for (const c of wa) {
    push("whatsapp", c.id, { name: c.contact_name, phone: c.phone, service: null, city: null, created_at: c.created_at, contacted_at: c.created_at, replied_at: c.last_customer_at || c.created_at, status_raw: c.status, summary: c.summary });
  }
  leads.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return { leads, changelog, messages: { first_sms: versionStats, steps: stepStats } };
}

/* ---------------- Handler ---------------- */
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const cors = corsFor(origin);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method === "GET") return json({ ok: true, service: "crm-painel", version: VERSION }, 200, cors);
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, cors);
  if (origin && !okOrigin(origin)) return json({ ok: false, error: "origin" }, 403, cors);

  let b: any;
  try { b = await req.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400, cors); }
  const action = clean(b.action, 40);
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64);
  const sql = postgres(dbUrl!, { prepare: false, max: 1 });

  try {
    /* ---- request a login link ---- */
    if (action === "request_link") {
      const email = clean(b.email, 200).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, error: "email" }, 422, cors);
      const byIp = ip ? (await sql`select count(*)::int n from private.crm_login_tokens where ip=${ip} and created_at > now() - interval '1 hour'`)[0].n : 0;
      if (byIp >= 10) return json({ ok: false, error: "rate_limited" }, 429, cors);
      const user = (await sql`select email, name from private.crm_users where email=${email} and active`)[0];
      if (!user) {
        // Same answer as success so nobody can probe which e-mails exist.
        try { await telegram(sql, `⚠️ <b>Painel</b>: pedido de acesso com e-mail não autorizado: <code>${esc(email)}</code>`); } catch (_) { /* ignore */ }
        return json({ ok: true }, 200, cors);
      }
      const recent = (await sql`select count(*)::int n from private.crm_login_tokens where email=${email} and created_at > now() - interval '1 hour'`)[0].n;
      if (recent >= 5) return json({ ok: false, error: "rate_limited" }, 429, cors);
      const token = randomToken();
      await sql`insert into private.crm_login_tokens(token_hash, email, expires_at, ip)
                values (${await sha256(token)}, ${email}, now() + make_interval(mins => ${LOGIN_MINUTES}), ${ip || null})`;
      const base = okOrigin(origin) ? origin! : SITE;
      const link = `${base}/painel/#login=${token}`;
      const m = loginEmail(user.name || "", link);
      let mailed = false;
      let mailErr = "";
      try { await sendGmail(sql, email, "Seu link de acesso ao painel BrightScale", m.html, m.text); mailed = true; }
      catch (e) { mailErr = String((e as Error).message || e); console.error("crm-painel mail", mailErr); }
      try {
        if (mailed) await telegram(sql, `🔐 <b>Painel</b>: link de acesso enviado para <code>${esc(email)}</code>.`);
        else await telegram(sql, `🔐 <b>Painel</b>: pedido de acesso de <code>${esc(email)}</code>.\nO e-mail falhou, então o link veio aqui (vale ${LOGIN_MINUTES} min, uso único).`, { text: "Entrar no painel", url: link });
      } catch (e) { console.error("crm-painel telegram", String((e as Error).message || e)); }
      return json({ ok: true, via: mailed ? "email" : "telegram" }, 200, cors);
    }

    /* ---- exchange one-time token for a session ---- */
    if (action === "exchange") {
      const token = clean(b.token, 100);
      if (token.length < 20) return json({ ok: false, error: "token" }, 400, cors);
      const row = (await sql`update private.crm_login_tokens set used_at = now()
                   where token_hash=${await sha256(token)} and used_at is null and expires_at > now() returning email`)[0];
      if (!row) return json({ ok: false, error: "expired" }, 401, cors);
      const session = randomToken();
      await sql`insert into private.crm_sessions(token_hash, email, expires_at)
                values (${await sha256(session)}, ${row.email}, now() + make_interval(days => ${SESSION_DAYS}))`;
      return json({ ok: true, session, email: row.email }, 200, cors);
    }

    /* ---- everything else needs a session ---- */
    const auth = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (auth.length < 20) return json({ ok: false, error: "auth" }, 401, cors);
    const sess = (await sql`update private.crm_sessions s set last_seen_at = now()
                  from private.crm_users u
                  where s.token_hash=${await sha256(auth)} and s.expires_at > now() and u.email = s.email and u.active
                  returning s.email, u.name`)[0];
    if (!sess) return json({ ok: false, error: "auth" }, 401, cors);

    if (action === "logout") {
      await sql`delete from private.crm_sessions where token_hash=${await sha256(auth)}`;
      return json({ ok: true }, 200, cors);
    }

    if (action === "data") {
      const data = await buildData(sql);
      return json({ ok: true, user: { email: sess.email, name: sess.name }, generated_at: new Date().toISOString(), ...data }, 200, cors);
    }

    if (action === "set_outcome") {
      const source = clean(b.source, 20);
      const leadId = clean(b.lead_id, 40);
      const outcome = clean(b.outcome, 10);
      if (!SOURCES.includes(source) || !/^[0-9a-f-]{36}$/i.test(leadId) || !OUTCOMES.includes(outcome)) return json({ ok: false, error: "invalid" }, 422, cors);
      const raw = b.job_value === null || b.job_value === "" || b.job_value === undefined ? null : Number(b.job_value);
      if (raw !== null && (!isFinite(raw) || raw < 0 || raw > 10_000_000)) return json({ ok: false, error: "value" }, 422, cors);
      const reason = outcome === "lost" ? clean(b.lost_reason, 120) || null : null;
      const notes = clean(b.notes, 2000) || null;
      await sql`insert into private.lead_outcomes(source, lead_id, outcome, job_value, lost_reason, notes, updated_by, updated_at)
                values (${source}, ${leadId}, ${outcome}, ${raw}, ${reason}, ${notes}, ${sess.email}, now())
                on conflict (source, lead_id) do update set outcome=excluded.outcome, job_value=excluded.job_value,
                  lost_reason=excluded.lost_reason, notes=excluded.notes, updated_by=excluded.updated_by, updated_at=now()`;
      return json({ ok: true }, 200, cors);
    }

    if (action === "add_change") {
      const day = clean(b.happened_on, 10);
      const title = clean(b.title, 160);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || title.length < 3) return json({ ok: false, error: "invalid" }, 422, cors);
      const row = (await sql`insert into private.crm_changelog(happened_on, title, details, created_by)
                   values (${day}, ${title}, ${clean(b.details, 1000) || null}, ${sess.email}) returning id`)[0];
      return json({ ok: true, id: row.id }, 200, cors);
    }

    if (action === "delete_change") {
      const id = clean(b.id, 40);
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false, error: "invalid" }, 422, cors);
      await sql`delete from private.crm_changelog where id=${id}`;
      return json({ ok: true }, 200, cors);
    }

    return json({ ok: false, error: "unknown_action" }, 400, cors);
  } catch (e) {
    console.error("crm-painel fatal", String((e as Error)?.message || e));
    return json({ ok: false, error: "server" }, 500, cors);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
});
