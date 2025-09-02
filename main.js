/* ===== Newsletter Submit (über FormSubmit Ajax, inkl Autoresponse an Abonnent:in) ===== */
const form   = document.getElementById('aeon-news-form');
const okMsg  = document.querySelector('.form-msg');
const errMsg = document.querySelector('.form-err');

// Empfänger deiner Postfächeradresse für Eingänge
const FORM_ENDPOINT = "https://formsubmit.co/ajax/AEONAdaptivesNetzwerk@proton.me";

async function sendNewsletter(email){
  const payload = {
    email,
    _subject: "A.E.O.N Newsletter Anmeldung",
    _autoresponse:
      "Hallo, danke für deine Anmeldung zum A.E.O.N Newsletter. " +
      "Du erhältst kurze klare Updates, wenn es wirklich etwas Neues gibt. " +
      "Wenn du das nicht warst, ignoriere diese Nachricht.",
    _template: "table",
    page: location.href,
    ua: navigator.userAgent,
    ts: new Date().toISOString()
  };

  const res = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Accept':'application/json',
      'X-Requested-With':'XMLHttpRequest'
    },
    body: JSON.stringify(payload),
    mode: 'cors',
    cache: 'no-store',
    redirect: 'follow'
  });

  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}

  const acknowledged =
    res.ok &&
    (
      !data ||
      String(data.success).toLowerCase() === 'true' ||
      /sent|ok|success/i.test(String(data.message || ''))
    );

  if (!acknowledged) throw new Error('Submit not acknowledged');
}

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const hp = form.querySelector('input[name="_hp"]')?.value.trim();
  if (hp) return;
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
