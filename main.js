// ===== Newsletter: echten Endpoint hier eintragen =====
const NEWSLETTER_ENDPOINT = ""; // z.B. "https://formspree.io/f/XXXXYYYY"

// Footer-Jahr
const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Drawer (Mobile)
const body    = document.body;
const scrim   = document.querySelector('.scrim');
const leftBtn = document.querySelector('.toggle-left');
const rightBtn= document.querySelector('.toggle-right');
function closeDrawers(){
  body.classList.remove('drawer-left-open','drawer-right-open');
  leftBtn?.setAttribute('aria-expanded','false');
  rightBtn?.setAttribute('aria-expanded','false');
}
leftBtn?.addEventListener('click', e=>{e.preventDefault(); const on=body.classList.toggle('drawer-left-open'); leftBtn.setAttribute('aria-expanded', String(on)); body.classList.remove('drawer-right-open');});
rightBtn?.addEventListener('click',e=>{e.preventDefault(); const on=body.classList.toggle('drawer-right-open'); rightBtn.setAttribute('aria-expanded', String(on)); body.classList.remove('drawer-left-open');});
scrim?.addEventListener('click', closeDrawers);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawers(); });

// ===== Scroll-Spy (genau ein Link aktiv) =====
const spyLinks = [...document.querySelectorAll('.sidecard a.spy')];
const sections = spyLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);

function setActive(id){
  spyLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#'+id));
}
function updateActive(){
  const offset = 84; // identisch zu scroll-margin-top
  let bestId = null, bestDist = Infinity;
  sections.forEach(sec=>{
    const rect = sec.getBoundingClientRect();
    const dist = Math.abs(rect.top - offset);
    if (dist < bestDist){ bestDist = dist; bestId = sec.id; }
  });
  if (bestId) setActive(bestId);
}
window.addEventListener('scroll', updateActive, {passive:true});
window.addEventListener('resize', updateActive);
updateActive();

// Anker-Scroll + Drawer zu
spyLinks.forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    closeDrawers();
    setTimeout(updateActive, 250);
  });
});

// ===== Newsletter Submit =====
const form = document.querySelector('.newsletter-form');
const okMsg = document.querySelector('.form-msg');
const errMsg = document.querySelector('.form-err');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value.trim();
    if (!email) return;
    if (!NEWSLETTER_ENDPOINT){ // Demo
      okMsg.hidden = false; errMsg.hidden = true; setTimeout(()=> okMsg.hidden = true, 6000); form.reset(); return;
    }
    try{
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({ email })
      });
      if (res.ok){ okMsg.hidden=false; errMsg.hidden=true; setTimeout(()=> okMsg.hidden=true, 6000); form.reset(); }
      else throw new Error('HTTP '+res.status);
    }catch(err){ errMsg.hidden=false; okMsg.hidden=true; console.error(err); }
  });
}

// ===== Back-to-Top =====
const toTop = document.getElementById('toTop');
function toggleToTop(){
  const y = window.scrollY || document.documentElement.scrollTop;
  if (y > 600) toTop?.classList.add('show'); else toTop?.classList.remove('show');
}
window.addEventListener('scroll', toggleToTop, {passive:true}); toggleToTop();
toTop?.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

// ===== News-Feed rendern (nur anzeigen, wenn Einträge existieren) =====
function renderNews(){
  const listEl = document.getElementById('news-list');
  const cardEl = document.getElementById('news');
  if (!listEl || !cardEl) return;

  const items = Array.isArray(window.AEON_NEWS) ? window.AEON_NEWS.slice() : [];

  if (!items.length){
    // Keine News -> Sektion bleibt unsichtbar
    cardEl.hidden = true;
    listEl.innerHTML = "";
    return;
  }

  // News vorhanden -> anzeigen
  cardEl.hidden = false;
  items.sort((a,b)=> new Date(b.date) - new Date(a.date));
  listEl.innerHTML = items.map(item=>{
    const date = new Date(item.date);
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth()+1).padStart(2,'0');
    const yyyy = date.getFullYear();
    const fresh = (Date.now()-date.getTime())/(1000*60*60*24) <= 14;
    const tag = fresh ? '<span class="tag">NEU</span>' : (item.tag ? `<span class="tag">${item.tag}</span>` : '');
    const link = item.link ? ` <a href="${item.link}" target="_blank" rel="noopener">Weiterlesen →</a>` : '';
    return `
      <article class="news-item">
        <div class="meta"><strong>${dd}.${mm}.${yyyy}</strong>${tag}</div>
        <div class="title">${item.title}</div>
        <div class="body">${item.body || ""}${link}</div>
      </article>`;
  }).join('');
}
document.addEventListener('DOMContentLoaded', renderNews);
