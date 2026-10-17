import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";

// web-lead — receives the brightscalegroup.com contact form.
//   1. stores the lead in private.web_leads
//   2. alerts Paulo on Telegram (same BrightScaleScannerBot as Brighty's phone leads)
//   3. emails a branded HTML copy to the business inbox
//   4. emails the customer an HTML confirmation in their language (EN / ES / PT)
//
// Email provider: Resend when RESEND_API_KEY and RESEND_FROM are set
// (RESEND_FROM must be on a domain verified in Resend, e.g.
// "BrightScale Remodeling <hello@brightscalegroup.com>"); otherwise the connected
// business Google account (gmail.send), the same one vapi-lead uses.
//
// Public endpoint (verify_jwt off). Abuse guards: allowed origins, honeypot,
// minimum fill time, field validation and a per-IP rate limit.

const dbUrl = Deno.env.get("SUPABASE_DB_URL");
if (!dbUrl) throw new Error("SUPABASE_DB_URL is not available");

const VERSION = 1;
const SITE = "https://www.brightscalegroup.com";
const BUSINESS_PHONE = "954-553-9535";
const BUSINESS_TEL = "+19545539535";
const LOGO = `${SITE}/assets/brand/remodeling/email-logo-reversed.png`;
const INTERNAL_TO = (Deno.env.get("LEADS_EMAIL_TO") || "brightscalegroup@gmail.com").trim();
const RESEND_KEY = (Deno.env.get("RESEND_API_KEY") || "").trim();
const RESEND_FROM = (Deno.env.get("RESEND_FROM") || "").trim();
const googleClientId = (Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") || "").trim();
const googleClientSecret = (Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") || "").trim();
const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?brightscalegroup\.com$/, /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];

function corsFor(origin: string | null) {
  const ok = !!origin && ALLOWED_ORIGINS.some((r) => r.test(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : SITE,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });
}

function esc(v: unknown) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function clean(v: unknown, max = 500): string {
  return String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);
}
function validEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
}
function digits(v: string) {
  return v.replace(/\D/g, "");
}
function prettyPhone(v: string) {
  const d = digits(v).slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v;
}
function b64utf8(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/* ---------------- Copy for the customer email ---------------- */
const T: Record<string, Record<string, string>> = {
  en: {
    subject: "We received your visit request — BrightScale Remodeling",
    preheader: "Thanks! We'll contact you shortly to set up a visit.",
    hi: "Hi",
    thanks: "Thanks for reaching out. We received your request and will contact you shortly to set up a visit at a time that works for you.",
    summary: "Your request",
    project: "Project", start: "Start", zip: "ZIP code", details: "Details", phone: "Phone",
    next: "What happens next",
    n1: "We review your project and call or text you to confirm the details.",
    n2: "We schedule a visit to measure and look at the space.",
    n3: "You receive a written scope and price before any work starts.",
    call: "Prefer to talk now? Call",
    brighty: "Brighty, our virtual assistant, answers 24/7 in English, Spanish and Portuguese.",
    sign: "BrightScale Remodeling",
    why: "You are receiving this email because you sent a request on brightscalegroup.com.",
  },
  es: {
    subject: "Recibimos su solicitud de visita — BrightScale Remodeling",
    preheader: "¡Gracias! Lo contactaremos pronto para agendar una visita.",
    hi: "Hola",
    thanks: "Gracias por escribirnos. Recibimos su solicitud y lo contactaremos pronto para agendar una visita en el horario que le convenga.",
    summary: "Su solicitud",
    project: "Proyecto", start: "Inicio", zip: "Código postal", details: "Detalles", phone: "Teléfono",
    next: "Próximos pasos",
    n1: "Revisamos su proyecto y lo llamamos o le escribimos para confirmar los detalles.",
    n2: "Agendamos una visita para medir y ver el espacio.",
    n3: "Recibe un alcance y un precio por escrito antes de empezar cualquier trabajo.",
    call: "¿Prefiere hablar ahora? Llame al",
    brighty: "Brighty, nuestra asistente virtual, atiende 24/7 en inglés, español y portugués.",
    sign: "BrightScale Remodeling",
    why: "Recibe este correo porque envió una solicitud en brightscalegroup.com.",
  },
  pt: {
    subject: "Recebemos seu pedido de visita — BrightScale Remodeling",
    preheader: "Obrigado! Entraremos em contato em breve para agendar a visita.",
    hi: "Olá",
    thanks: "Obrigado pelo contato. Recebemos seu pedido e vamos falar com você em breve para agendar uma visita no horário que for melhor.",
    summary: "Seu pedido",
    project: "Projeto", start: "Início", zip: "CEP (ZIP)", details: "Detalhes", phone: "Telefone",
    next: "Próximos passos",
    n1: "Analisamos o seu projeto e ligamos ou mandamos mensagem para confirmar os detalhes.",
    n2: "Agendamos uma visita para medir e ver o espaço.",
    n3: "Você recebe o escopo e o preço por escrito antes de qualquer serviço começar.",
    call: "Prefere conversar agora? Ligue",
    brighty: "A Brighty, nossa assistente virtual, atende 24h em inglês, espanhol e português.",
    sign: "BrightScale Remodeling",
    why: "Você recebeu este e-mail porque enviou um pedido em brightscalegroup.com.",
  },
};

/* ---------------- Email layout (table-based, inline styles) ---------------- */
function shell(preheader: string, inner: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#F5F5F5;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:2px solid #000000;font-family:Montserrat,'Segoe UI',Helvetica,Arial,sans-serif;color:#000000;">
<tr><td style="background:#000000;padding:20px 28px;"><img src="${LOGO}" width="133" height="56" alt="BrightScale Remodeling" style="display:block;border:0;"></td></tr>
<tr><td style="height:6px;background:#18C95F;font-size:0;line-height:0;">&nbsp;</td></tr>
${inner}
<tr><td style="background:#000000;color:#C4C4C4;padding:18px 28px;font-size:12px;line-height:1.6;">
<b style="color:#F5F5F5;">BrightScale Remodeling</b> · <a href="tel:${BUSINESS_TEL}" style="color:#18C95F;text-decoration:none;">${BUSINESS_PHONE}</a> · <a href="${SITE}" style="color:#18C95F;text-decoration:none;">brightscalegroup.com</a><br>
Parkland, FL · Miami-Dade, Broward &amp; Palm Beach</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(pairs: [string, string][]) {
  return pairs.filter(([, v]) => v).map(([k, v]) =>
    `<tr><td style="padding:9px 0;border-top:1px solid #D6D6D6;font-size:13px;color:#5B5B5B;width:120px;vertical-align:top;">${esc(k)}</td>` +
    `<td style="padding:9px 0;border-top:1px solid #D6D6D6;font-size:14px;font-weight:600;vertical-align:top;">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("");
}

function customerHtml(l: any) {
  const t = T[l.language] || T.en;
  const first = esc(String(l.name).split(/\s+/)[0]);
  const inner = `
<tr><td style="padding:28px 28px 8px;">
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;font-weight:800;">${t.hi} ${first},</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${t.thanks}</p>
<p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#5B5B5B;text-transform:uppercase;letter-spacing:.06em;">${t.summary}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows([[t.project, l.project_label || l.project], [t.start, l.start_label || l.start_when], [t.zip, l.zip], [t.phone, prettyPhone(l.phone)], [t.details, l.details]])}</table>
</td></tr>
<tr><td style="padding:16px 28px 8px;">
<p style="margin:0 0 10px;font-size:16px;font-weight:800;">${t.next}</p>
${[t.n1, t.n2, t.n3].map((s, i) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;"><tr><td style="width:28px;height:28px;background:#18C95F;font-weight:800;font-size:14px;text-align:center;vertical-align:middle;">${i + 1}</td><td style="padding-left:12px;font-size:14px;line-height:1.5;">${esc(s)}</td></tr></table>`).join("")}
</td></tr>
<tr><td style="padding:12px 28px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;border:1px solid #000000;"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.5;">
${t.call} <a href="tel:${BUSINESS_TEL}" style="color:#000000;font-weight:800;">${BUSINESS_PHONE}</a>.<br><span style="color:#5B5B5B;font-size:13px;">${t.brighty}</span>
</td></tr></table>
<p style="margin:18px 0 0;font-size:11px;color:#8A8A8A;">${t.why}</p>
</td></tr>`;
  return { subject: t.subject, html: shell(t.preheader, inner) };
}

function internalHtml(l: any) {
  const est = l.estimate && Object.keys(l.estimate).length ? `${l.estimate.size || "?"} sq ft · ${l.estimate.finish || "?"} · ${l.estimate.project || ""}` : "";
  const inner = `
<tr><td style="padding:24px 28px 8px;">
<p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#0B7A37;text-transform:uppercase;letter-spacing:.06em;">Novo lead do site</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;font-weight:800;">${esc(l.name)} — ${esc(l.project || "Projeto")}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr>
<td style="background:#18C95F;padding:12px 18px;"><a href="tel:+1${digits(l.phone).slice(-10)}" style="color:#000000;font-weight:800;text-decoration:none;font-size:15px;">Ligar ${esc(prettyPhone(l.phone))}</a></td>
<td style="width:10px;"></td>
<td style="border:2px solid #000000;padding:10px 16px;"><a href="mailto:${esc(l.email)}" style="color:#000000;font-weight:700;text-decoration:none;font-size:14px;">Responder e-mail</a></td>
</tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows([
    ["Nome", l.name], ["Telefone", prettyPhone(l.phone)], ["E-mail", l.email], ["ZIP", l.zip], ["Projeto", l.project],
    ["Início", l.start_when], ["Detalhes", l.details], ["Calculadora", est],
    ["SMS", l.sms_consent ? "Autorizou receber SMS" : "Não autorizou SMS"], ["Idioma", (l.language || "en").toUpperCase()],
    ["Página", l.page], ["Recebido", new Date().toLocaleString("pt-BR", { timeZone: "America/New_York" })],
  ])}</table>
</td></tr>
<tr><td style="padding:8px 28px 24px;font-size:12px;color:#8A8A8A;">Lead ${esc(l.id)} · salvo no Supabase (private.web_leads)</td></tr>`;
  return { subject: `Novo lead do site: ${l.name} — ${l.project || "Projeto"}`, html: shell(`${l.name} · ${l.project || ""} · ${prettyPhone(l.phone)}`, inner) };
}

function plainFromHtml(html: string) {
  return html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|tr|h1|table)>/g, "\n")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim();
}

/* ---------------- Senders ---------------- */
async function sendResend(to: string, subject: string, html: string, replyTo?: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html, text: plainFromHtml(html), ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

let gmailToken: { token: string; from: string } | null = null;
async function gmailAuth(sql: any) {
  if (gmailToken) return gmailToken;
  const cfg = (await sql`select refresh_token, calendar_id, granted_scope from private.google_calendar_oauth_config where singleton=true limit 1`)[0];
  if (!cfg?.refresh_token) throw new Error("Google account is not connected");
  if (!String(cfg.granted_scope || "").includes("gmail.send")) throw new Error("Google connection lacks gmail.send");
  if (!googleClientId || !googleClientSecret) throw new Error("Google OAuth secrets missing");
  const form = new URLSearchParams({ client_id: googleClientId, client_secret: googleClientSecret, refresh_token: String(cfg.refresh_token), grant_type: "refresh_token" });
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  const td = await tr.json();
  if (!tr.ok || !td?.access_token) throw new Error(`Google token refresh failed: ${String(td?.error || tr.status)}`);
  gmailToken = { token: String(td.access_token), from: String(cfg.calendar_id || "") };
  return gmailToken;
}

async function sendGmail(sql: any, to: string, subject: string, html: string, replyTo?: string) {
  const { token, from } = await gmailAuth(sql);
  const boundary = "bs" + crypto.randomUUID().replace(/-/g, "");
  const wrap = (s: string) => (b64utf8(s).match(/.{1,76}/g) || []).join("\r\n");
  const mime = [
    `From: BrightScale Remodeling <${from}>`,
    `To: ${to}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Subject: =?UTF-8?B?${b64utf8(subject)}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", wrap(plainFromHtml(html)),
    `--${boundary}`, 'Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", wrap(html),
    `--${boundary}--`,
  ].join("\r\n");
  const raw = b64utf8(mime).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ raw }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(`Gmail send ${r.status}: ${String(d?.error?.message || "").slice(0, 200)}`);
  }
}

const provider = RESEND_KEY && RESEND_FROM ? "resend" : "gmail";
async function sendMail(sql: any, to: string, subject: string, html: string, replyTo?: string) {
  if (provider === "resend") return sendResend(to, subject, html, replyTo);
  return sendGmail(sql, to, subject, html, replyTo);
}

function telegramText(l: any) {
  const line = (k: string, v: unknown) => (v ? `<b>${k}:</b> ${esc(v)}` : null);
  const est = l.estimate && Object.keys(l.estimate).length ? `${l.estimate.size || "?"} sq ft, ${l.estimate.finish || "?"}` : null;
  return [
    `🌐 <b>Site — novo pedido de visita</b>`,
    "",
    line("Cliente", l.name),
    line("Telefone", prettyPhone(l.phone)),
    line("E-mail", l.email),
    line("ZIP", l.zip),
    line("Projeto", l.project),
    line("Início", l.start_when),
    line("Calculadora", est),
    line("Detalhes", l.details),
    line("SMS", l.sms_consent ? "autorizou ✅" : "não autorizou"),
    line("Idioma", (l.language || "en").toUpperCase()),
  ].filter((v) => v !== null).join("\n").slice(0, 3900);
}

/* ---------------- Handler ---------------- */
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const cors = corsFor(origin);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method === "GET") return json({ ok: true, service: "web-lead", version: VERSION, email: provider }, 200, cors);
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, cors);
  if (!origin || !ALLOWED_ORIGINS.some((r) => r.test(origin))) return json({ ok: false, error: "origin" }, 403, cors);

  let b: any;
  try { b = await req.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400, cors); }

  // Bots: hidden field filled, or the form sent in under 3 seconds. Pretend success.
  if (clean(b._honey) || (Number(b.elapsed_ms) > 0 && Number(b.elapsed_ms) < 3000)) return json({ ok: true }, 200, cors);

  const lead: any = {
    name: clean(b.name, 120),
    phone: clean(b.phone, 40),
    email: clean(b.email, 200).toLowerCase(),
    zip: clean(b.zip, 10),
    project: clean(b.project, 80),
    start_when: clean(b.start, 60),
    project_label: clean(b.project_label, 80),
    start_label: clean(b.start_label, 60),
    details: clean(b.details, 3000),
    sms_consent: b.sms_consent === true || b.sms_consent === "yes",
    sms_consent_text: clean(b.sms_consent_text, 1500),
    language: ["en", "es", "pt"].includes(String(b.language)) ? String(b.language) : "en",
    page: clean(b.page, 300),
    estimate: (b.estimate && typeof b.estimate === "object") ? {
      project: clean(b.estimate.project, 20), size: clean(b.estimate.size, 10), finish: clean(b.estimate.finish, 10),
    } : {},
  };
  const bad: string[] = [];
  if (lead.name.length < 2) bad.push("name");
  if (digits(lead.phone).length < 10) bad.push("phone");
  if (!validEmail(lead.email)) bad.push("email");
  if (lead.zip && !/^\d{5}$/.test(lead.zip)) bad.push("zip");
  if (bad.length) return json({ ok: false, error: "invalid", fields: bad }, 422, cors);

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64);
  const ua = clean(req.headers.get("user-agent"), 300);
  const sql = postgres(dbUrl!, { prepare: false, max: 1 });
  try {
    const recent = await sql`select count(*)::int as n from private.web_leads where ip = ${ip} and created_at > now() - interval '10 minutes'`;
    if (ip && recent[0].n >= 5) return json({ ok: false, error: "rate_limited" }, 429, cors);

    const ins = await sql`insert into private.web_leads
      (name, phone, email, zip, project, start_when, details, sms_consent, sms_consent_text, language, page, estimate, ip, user_agent, email_provider)
      values (${lead.name}, ${lead.phone}, ${lead.email}, ${lead.zip || null}, ${lead.project || null}, ${lead.start_when || null},
              ${lead.details || null}, ${lead.sms_consent}, ${lead.sms_consent ? lead.sms_consent_text || null : null}, ${lead.language},
              ${lead.page || null}, ${sql.json(lead.estimate)}, ${ip || null}, ${ua || null}, ${provider})
      returning id`;
    lead.id = ins[0].id;
    const errors: string[] = [];

    // Telegram
    let tg = "failed";
    try {
      const v = await sql`select name, decrypted_secret from vault.decrypted_secrets where name in ('telegram_bot_token','telegram_chat_id')`;
      const vault: Record<string, string> = {};
      for (const r of v) vault[String(r.name)] = String(r.decrypted_secret || "");
      if (!vault.telegram_bot_token || !vault.telegram_chat_id) throw new Error("Telegram credentials missing");
      const r = await fetch(`https://api.telegram.org/bot${vault.telegram_bot_token}/sendMessage`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: vault.telegram_chat_id, text: telegramText(lead), parse_mode: "HTML", disable_web_page_preview: true }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d?.ok !== true) throw new Error(`Telegram ${String(d?.description || r.status).slice(0, 200)}`);
      tg = "sent";
    } catch (e) { errors.push(String((e as Error).message || e)); }

    // Business copy
    let internal = "failed";
    try { const m = internalHtml(lead); await sendMail(sql, INTERNAL_TO, m.subject, m.html, lead.email); internal = "sent"; }
    catch (e) { errors.push(String((e as Error).message || e)); }

    // Customer confirmation
    let customer = "failed";
    try { const m = customerHtml(lead); await sendMail(sql, lead.email, m.subject, m.html, INTERNAL_TO); customer = "sent"; }
    catch (e) { errors.push(String((e as Error).message || e)); }

    await sql`update private.web_leads set telegram_status=${tg}, internal_email_status=${internal},
      customer_email_status=${customer}, last_error=${errors.length ? errors.join(" | ").slice(0, 1000) : null} where id=${lead.id}`;
    if (errors.length) console.error("web-lead", lead.id, errors);

    // The lead is saved either way; the site only needs to know it arrived.
    return json({ ok: true, id: lead.id, notified: tg === "sent" || internal === "sent" }, 200, cors);
  } catch (e) {
    console.error("web-lead fatal", String((e as Error)?.message || e));
    return json({ ok: false, error: "server" }, 500, cors);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
});
