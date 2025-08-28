// Cloudflare Worker (Module syntax)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/subscribe') {
      const data = await request.json().catch(()=>null);
      if (!data || !data.email) return json({error:'email missing'}, 400);

      // save to KV (set will overwrite/refresh)
      const key = `sub:${data.email.toLowerCase()}`;
      await env.SUBS.put(key, JSON.stringify({
        email: data.email,
        ts: data.ts || new Date().toISOString(),
        page: data.page || '',
        ua: data.ua || ''
      }));

      // notify admin via MailChannels
      await sendMail(env, {
        to: env.ADMIN_EMAIL,
        subject: `A.E.O.N Newsletter – neues Abo: ${data.email}`,
        text: `Neues Abo\n\nE-Mail: ${data.email}\nSeite: ${data.page}\nZeit: ${data.ts}\nUA: ${data.ua}`,
        html: `<h3>Neues Abo</h3><p><b>E-Mail:</b> ${escapeHtml(data.email)}<br><b>Seite:</b> ${escapeHtml(data.page||'')}<br><b>Zeit:</b> ${escapeHtml(data.ts||'')}<br><b>UA:</b> ${escapeHtml(data.ua||'')}</p>`
      });

      return json({ok:true});
    }

    // Admin: broadcast news to all subscribers (requires X-API-Key)
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      if (request.headers.get('x-api-key') !== env.API_KEY) return json({error:'unauthorized'}, 401);
      const payload = await request.json().catch(()=>null);
      if (!payload || !payload.subject || !(payload.text || payload.html)) {
        return json({error:'subject+content required'}, 400);
      }

      // iterate subscribers
      const list = await batchListKV(env.SUBS, 'sub:');
      for (const item of list) {
        const sub = JSON.parse(item.value || '{}');
        if (!sub.email) continue;
        await sendMail(env, {
          to: sub.email,
          subject: payload.subject,
          text: payload.text || stripHtml(payload.html),
          html: payload.html || `<pre>${escapeHtml(payload.text)}</pre>`
        });
      }
      return json({ok:true, sent:list.length});
    }

    return json({ok:true, message:'A.E.O.N Worker alive'});
  }
};

/* ============== helpers ============== */
function json(obj, status=200, hdr={}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {'content-type':'application/json; charset=utf-8', ...hdr}
  });
}

async function batchListKV(ns, prefix) {
  const out = [];
  let cursor;
  do{
    const res = await ns.list({prefix, cursor, limit:1000});
    for (const k of res.keys) {
      const val = await ns.get(k.name);
      out.push({key:k.name, value:val});
    }
    cursor = res.cursor;
  }while(cursor);
  return out;
}

function stripHtml(html=''){ return html.replace(/<[^>]+>/g,''); }
function escapeHtml(s=''){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* Mail via MailChannels */
async function sendMail(env, {to, subject, text, html}) {
  const from = env.FROM_EMAIL || "no-reply@example.com"; // MUSS zu deiner Domain passen
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: "A.E.O.N" },
    subject,
    content: [
      { type: "text/plain", value: text || stripHtml(html||'') },
      { type: "text/html",  value: html || `<pre>${escapeHtml(text||'')}</pre>` }
    ]
  };
  const r = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type":"application/json" },
    body: JSON.stringify(payload)
  });
  if(!r.ok){
    const t = await r.text();
    console.log("Mail error", r.status, t);
  }
}
