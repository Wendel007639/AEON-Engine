// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/subscribe') {
      const data = await request.json();
      const email = (data.email || '').trim().toLowerCase();
      if (!email) return new Response('Bad Request', { status: 400 });

      // in KV speichern (Set)
      await env.AEON_SUBS.put(email, '1');

      // Admin-Mail an Proton via Resend API
      const payload = {
        from: 'A.E.O.N <news@your-domain.tld>',
        to: ['AEONAdaptivesNetzwerk@proton.me'],
        subject: 'A.E.O.N Newsletter – neues Abo',
        html: `
          <h2>Neues Abo</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Seite:</strong> ${data.page || ''}</p>
          <p><strong>Agent:</strong> ${data.ua || ''}</p>
          <p><strong>Zeit:</strong> ${data.ts || new Date().toISOString()}</p>
        `
      };
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return new Response('Mail failed', { status: 502 });

      return new Response('ok', { status: 200 });
    }

    // Extra News Mail (per cURL)
    if (request.method === 'POST' && url.pathname === '/send-latest') {
      const body = await request.json(); // {subject, html}
      const subject = body.subject || 'A.E.O.N – News';
      const html = body.html || '<p>News</p>';

      // alle Abos holen
      const list = await env.AEON_SUBS.list();
      const recipients = list.keys.map(k => k.name);

      // An Admin + BCC an alle Abos senden
      const payload = {
        from: 'A.E.O.N <news@your-domain.tld>',
        to: ['AEONAdaptivesNetzwerk@proton.me'],
        bcc: recipients,
        subject,
        html
      };
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return new Response('Mail failed', { status: 502 });

      return new Response(JSON.stringify({ sent: recipients.length }), { status: 200 });
    }

    return new Response('Not found', { status: 404 });
  }
}
