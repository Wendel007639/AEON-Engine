/* ===== KONFIG ===== */
const NEWSLETTER_ENDPOINT = "https://YOUR-ENDPOINT.example.com/subscribe"; 
// ↑ Hier DEINE URL von Cloudflare-Worker ODER Netlify-Funktion eintragen.
// Wichtig: Kein mailto, kein Client öffnet sich. Bei leerer URL -> Fehleranzeige.

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

/* ===== Sections show/hide, X-Button ===== */
const navLinks = [...document.querySelectorAll('.sidecard a.spy')];
const sections = Object.fromEntries(
  navLinks.map(a => a.getAttribute('href').slice(1))
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
function removeHash(){ const url = location.pathname + location.search; history.replaceState(null, "", url); }
function showOnly(id, pushHash=true){
  if(!sections[id]) return;
  hideAll(); sections[id].hidden = false; setActive(id);
  if (pushHash) history.replaceState(null, "", "#"+id);
  sections[id].scrollIntoView({behavior:'smooth', block:'start'});
  closeDrawers();
}
function initSections(){
  clearActive(); hideAll();
  const hash = (location.hash || "").slice(1);
  if (sections[hash]) showOnly(hash, false);
}
window.addEventListener('hashchange', ()=>{ const id = (location.hash || "").slice(1); if (sections[id]) showOnly(id, false); });
navLinks.forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    showOnly(id, true);
  });
});
document.querySelectorAll('.close-card').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    hideAll(); clearActive(); removeHash();
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

/* ===== Newsletter Submit (via fetch) ===== */
const form   = document.getElementById('aeon-news-form');
const okMsg  = document.querySelector('.form-msg');
const errMsg = document.querySelector('.form-err');

async function postSubscribe(email){
  const payload = {
    email,
    // Meta für Admin-Mail
    subject: "A.E.O.N Newsletter – neues Abo",
    to: "AEONAdaptivesNetzwerk@proton.me",
    page: location.href,
    ua: navigator.userAgent,
    ts: new Date().toISOString()
  };
  const res = await fetch(NEWSLETTER_ENDPOINT, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('HTTP '+res.status);
}

if (form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    okMsg.hidden = true; errMsg.hidden = true;

    if (!NEWSLETTER_ENDPOINT){
      errMsg.textContent = "Newsletter ist serverseitig noch nicht verbunden. Bitte Endpoint setzen.";
      errMsg.hidden = false;
      return;
    }
    const hp    = form.querySelector('input[name="_hp"]')?.value.trim();
    if (hp) return; // Bot
    const email = form.querySelector('input[type="email"]')?.value.trim();
    if (!email){ errMsg.hidden = false; return; }

    try{
      await postSubscribe(email);
      okMsg.hidden = false;
      form.reset();
    }catch(err){
      console.error(err);
      errMsg.hidden = false;
    }
  });
}

/* ===== Back-to-Top ===== */
const toTop = document.getElementById('toTop');
function toggleToTop(){
  const y = window.scrollY || document.documentElement.scrollTop;
  if (y > 600) toTop?.classList.add('show'); else toTop?.classList.remove('show');
}
window.addEventListener('scroll', toggleToTop, {passive:true});
toggleToTop();

/* ===== News rendern ===== */
function renderNews(){
  const listEl = document.getElementById('news-list');
  const cardEl = document.getElementById('news');
  if (!listEl || !cardEl) return;

  const items = Array.isArray(window.AEON_NEWS) ? window.AEON_NEWS.slice() : [];
  if (!items.length){ cardEl.hidden = true; listEl.innerHTML = ""; return; }

  cardEl.hidden = false;
  items.sort((a,b)=> new Date(b.date) - new Date(a.date));
  listEl.innerHTML = items.map(item=>{
    const date = new Date(item.date);
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth()+1).padStart(2,'0');
    const yyyy = date.getFullYear();
    const fresh = (Date.now()-date.getTime())/(1000*60*60*24) <= 14;
    const tag  = fresh ? '<span class="tag">NEU</span>' : (item.tag ? `<span class="tag">${item.tag}</span>` : '');
    const link = item.link ? ` <a href="${item.link}" target="_blank" rel="noopener">Weiterlesen →</a>` : '';
    return `
      <article class="news-item">
        <div class="meta"><strong>${dd}.${mm}.${yyyy}</strong>${tag}</div>
        <div class="title">${item.title}</div>
        <div class="body">${item.body || ""}${link}</div>
      </article>`;
  }).join('');
}
document.addEventListener('DOMContentLoaded', ()=>{
  initSections();
  renderNews();
});
