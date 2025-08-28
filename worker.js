const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const allow = env.CORS_ORIGIN || "*";

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": allow,
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400",
        },
      });
    }

    if (url.pathname === "/api/subscribe" && req.method === "POST") {
      const data = await readJson(req);
      const email = (data?.email || "").trim().toLowerCase();
      if (!isEmail(email)) return bad(422, "Invalid email", allow);

      await env.SUBS.put(`sub:${email}`, "1");

      const now = new Date().toISOString();
      const ua  = req.headers.get("user-agent") || "";
      await sendMail(env, {
        to: [env.AEON_INBOX],
        subject: "A.E.O.N Newsletter – neues Abo",
        text: `Neues Abo\nEmail: ${email}\nTime: ${now}\nUA: ${ua}\n`,
        html: `<p><strong>Neues Abo</strong></p>
               <p>Email: <code>${escapeHtml(email)}</code><br>
               Time: <code>${now}</code><br>
               UA: <code>${escapeHtml(ua)}</code></p>`,
        replyTo: email,
      });

      return ok({ status: "ok" }, allow);
    }

    if (url.pathname === "/api/send" && req.method === "POST") {
      const data = await readJson(req);
      const title   = (data?.title   || "").trim();
      const body    = (data?.body    || "").trim();
      const link    = (data?.link    || "").trim();
      const subject = (data?.subject || title || "A.E.O.N — Update").trim();
      if (!title || !body) return bad(422, "title/body required", allow);

      const subs = await listSubscribers(env.SUBS);
      if (subs.length === 0) return bad(404, "no subscribers", allow);

      const { text, html } = buildMail({ title, body, link });
      const size = 50;
      for (let i = 0; i < subs.length; i += size) {
        await sendMail(env, { to: subs.slice(i, i + size), subject, text, html });
      }
      return ok({ sent: subs.length }, allow);
    }

    return new Response("Not found", { status: 404 });
  }
};

async function sendMail(env, { to, subject, text, html, replyTo }) {
  const key = env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL || "A.E.O.N <no-reply@resend.dev>",
      to, subject, text, html, reply_to: replyTo
    })
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

function buildMail({ title, body, link }) {
  const text = `${title}\n\n${body}${link ? `\n\nWeiterlesen: ${link}` : ""}\n\n— A.E.O.N`;
  const html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1426;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#0e1b34;border-radius:14px;border:1px solid rgba(255,255,255,.08);padding:20px;color:#e7f9ff;font-family:Inter,Arial,sans-serif;">
        <tr><td style="font-size:12px;color:#23e5ff;text-transform:uppercase;letter-spacing:.08em;">Newsletter</td></tr>
        <tr><td style="font-size:24px;font-weight:800;padding:6px 0 10px;color:#b8f8ff;">${escapeHtml(title)}</td></tr>
        <tr><td style="font-size:15px;line-height:1.7;color:#9cc9e6;">${escapeHtml(body).replace(/\n/g,"<br>")}</td></tr>
        ${link ? `<tr><td style="padding-top:16px;"><a href="${escapeAttr(link)}" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#18cfdf;color:#001018;text-decoration:none;font-weight:700">Weiterlesen →</a></td></tr>` : ""}
        <tr><td style="padding-top:18px;font-size:12px;color:#87b9d4;">Du bekommst Inhalte i.d.R. <strong>eine Woche früher</strong> als auf der Webseite – kostenlos.</td></tr>
      </table>
    </td></tr>
  </table>`;
  return { text, html };
}

async function listSubscribers(KV) {
  let cursor, emails = [];
  do {
    const page = await KV.list({ prefix: "sub:", cursor });
    for (const k of page.keys) emails.push(k.name.slice(4));
    cursor = page.cursor;
  } while (cursor);
  return emails;
}

function ok(data, allow) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...JSON_HEADERS, "access-control-allow-origin": allow }
  });
}
function bad(status, msg, allow) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...JSON_HEADERS, "access-control-allow-origin": allow }
  });
}
async function readJson(req) { try { return await req.json(); } catch { return {}; } }
function isEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }
function escapeHtml(s){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeAttr(s){ return s.replace(/"/g,'&quot;'); }
