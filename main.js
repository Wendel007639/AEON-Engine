/* ===== Optional: Mobile-Modus per URL aktivieren (?m=1 oder ?mobile=1) ===== */
try{
  const q = new URLSearchParams(location.search);
  if (q.has('m') || q.has('mobile')) document.body.classList.add('force-mobile');
}catch{}

/* ===== Drawer (Mobile) ===== */
const body    = document.body;
const scrim   = document.querySelector('.scrim');
const leftBtn = document.querySelector('.toggle-left');
const rightBtn= document.querySelector('.toggle-right');

function closeDrawers(){
  body.classList.remove('drawer-left-open','drawer-right-open');
  leftBtn?.setAttribute('aria-expanded','false');
  rightBtn?.setAttribute('aria-expanded','false');
}
leftBtn?.addEventListener('click', e=>{
  e.preventDefault();
  const on = body.classList.toggle('drawer-left-open');
  leftBtn.setAttribute('aria-expanded', String(on));
  body.classList.remove('drawer-right-open');
});
rightBtn?.addEventListener('click', e=>{
  e.preventDefault();
  const on = body.classList.toggle('drawer-right-open');
  rightBtn.setAttribute('aria-expanded', String(on));
  body.classList.remove('drawer-left-open');
});
scrim?.addEventListener('click', closeDrawers);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawers(); });

/* ===== Sections show/hide + Close-X ===== */
const navLinks = [...document.querySelectorAll('.sidecard a.spy')];
const sections = Object.fromEntries(
  navLinks
    .map(a => a.getAttribute('href').slice(1))
    .map(id => [id, document.getElementById(id)])
    .filter(([,el]) => !!el)
);
function clearActive(){ navLinks.forEach(a=>{ a.classList.remove('active'); a.removeAttribute('aria-current'); }); }
function hideAll(){ Object.values(sections).forEach(sec => sec.setAttribute('hidden','')); }
function setActive(id){
  navLinks.forEach(a=>{
    const on = a.getAttribute('href') === '#'+id;
    a.classList.toggle('active', on);
    if(on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
  });
}
function showOnly(id, pushHash=true){
  if(!sections[id]) return;
  hideAll();
  sections[id].hidden = false;
  setActive(id);
  if (pushHash) history.replaceState(null, "", "#"+id);
  sections[id].scrollIntoView({behavior:'smooth', block:'start'});
  closeDrawers();
}
function initSections(){
  clearActive(); hideAll();
  const id = (location.hash || "").slice(1);
  if (sections[id]) showOnly(id, false);
}
window.addEventListener('hashchange', ()=>{
  const id = (location.hash || "").slice(1);
  if (sections[id]) showOnly(id, false);
});
navLinks.forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    showOnly(a.getAttribute('href').slice(1), true);
  });
});
document.querySelectorAll('.close-card').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    hideAll(); clearActive();
    history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

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
    headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors',
    cache: 'no-store',
    redirect: 'follow'
  });
  if (!res.ok) throw new Error('HTTP '+res.status);
  const data = await res.json().catch(()=>({success:true}));
  if (data?.success !== true) throw new Error('Submit failed');
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

/* ===== Back-to-Top ===== */
const toTop = document.getElementById('toTop');
function toggleToTop(){
  const y = window.scrollY || document.documentElement.scrollTop;
  if (y > 600) toTop?.classList.add('show'); else toTop?.classList.remove('show');
}
window.addEventListener('scroll', toggleToTop, {passive:true});
toggleToTop();

/* ===== News-Feed rendern ===== */
function renderNews(){
  const listEl = document.getElementById('news-list');
  const cardEl = document.getElementById('news');
  if (!listEl || !cardEl) return;

  const items = Array.isArray(window.AEON_NEWS) ? window.AEON_NEWS.slice() : [];
  if (!items.length){ cardEl.hidden = true; listEl.innerHTML = ""; return; }
  cardEl.hidden = false;

  items.sort((a,b)=> new Date(b.date) - new Date(a.date));
  listEl.innerHTML = items.map(item=>{
    const d = new Date(item.date);
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const fresh = (Date.now()-d.getTime())/(1000*60*60*24) <= 14;
    const tag  = fresh ? '<span class="tag">NEU</span>' : (item.tag ? `<span class="tag">${item.tag}</span>` : '');
    const link = item.link ? ` <a href="${item.link}" target="_blank" rel="noopener">Weiterlesen →</a>` : '';
    return `
      <article class="news-item">
        <div class="meta"><strong>${dd}.${mm}.${yyyy}</strong>${tag}</div>
        <div class="title">${item.title || ""}</div>
        <div class="body">${(item.body || "")}${link}</div>
      </article>`;
  }).join('');
}
document.addEventListener('DOMContentLoaded', ()=>{
  initSections();
  renderNews();
});
