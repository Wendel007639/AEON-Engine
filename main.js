/* ===== Newsletter Submit (über FormSubmit Ajax, inkl Autoresponse an Abonnent:in) ===== */
const form   = document.getElementById('aeon-news-form');
const okMsg  = document.querySelector('.form-msg');
const errMsg = document.querySelector('.form-err');

// Empfänger deiner Postfächeradresse für Eingänge
const FORM_ENDPOINT = "https://formsubmit.co/ajax/AEONAdaptivesNetzwerk@proton.me";

async function sendNewsletter(email){
  // urlencoded senden, schnell, ohne lange Preflight Wartezeit
  const params = new URLSearchParams();
  params.append('email', email);
  params.append('_subject', 'A.E.O.N Newsletter Anmeldung');
  params.append('_autoresponse', `Dies ist eine Test E Mail für die Anmeldung zum A.E.O.N Newsletter.
Vielen Dank für Ihre Registrierung.
Sie erhalten künftig kurze und klare Updates, sobald es wirklich Neuigkeiten gibt.
Diese Nachricht bestätigt den Eingang Ihrer Adresse.
Wenn Sie die Anmeldung nicht selbst veranlasst haben, ignorieren Sie diese E Mail bitte.
Es entstehen Ihnen keine weiteren Schritte.
Bei Fragen schreiben Sie an AEONAdaptivesNetzwerk@proton.me
.
Mit freundlichen Grüßen,
A.E.O.N Team.`);
  params.append('_template', 'table');

  const res = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  // Antwort robust prüfen
  let ok = res.ok;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')){
    const data = await res.json().catch(()=>null);
    if (data){
      const s = String(data.success ?? '').toLowerCase();
      const m = String(data.message ?? '');
      ok = ok && (s === 'true' || /sent|ok|success/i.test(m));
    }
  }
  if (!ok) throw new Error('Submit not acknowledged');
}

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const hp = form.querySelector('input[name="_hp"]')?.value.trim();
  if (hp) return; // Bot
  const email = form.querySelector('input[type="email"]')?.value.trim();
  if (!email) return;

  okMsg.hidden = true; errMsg.hidden = true;

  try{
    await sendNewsletter(email);
    okMsg.hidden = false;
    form.reset();
  }catch{
    errMsg.hidden = false;
  }
});
