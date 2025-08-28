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

// ===== Scroll-Spy (IntersectionObserver, kein Default-Active) =====
const spyLinks = [...document.querySelectorAll('.sidecard a.spy')];
const sections = spyLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function clearActive(){
  spyLinks.forEach(a => {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });
}
function setActive(id){
  spyLinks.forEach(a => {
    const on = a.getAttribute('href') === '#'+id;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current','true');
    else a.removeAttribute('aria-current');
  });
}
clearActive(); // am Start: nichts aktiv

const io = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length){
      setActive(visible[0].target.id);
    } else {
      // Wenn ganz oben / keine Section dominierend
      const anyVisible = sections.some(sec => {
        const r = sec.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      if (!anyVisible) clearActive();
    }
  },
  // Top-Offset für feste Topbar, und ~55% Sichtbarkeit als Schwelle
  { rootMargin: '-84px 0px -55% 0px', threshold: [0, 0.55, 1] }
);
sections.forEach(sec => io.observe(sec));

// Anker-Scroll + Drawer zu
spyLinks.forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    clearActive();                 // während Smooth-Scroll
    setTimeout(()=> setActive(id), 300);
    closeDrawers();
  });
});

// ===== Newsletter Submit =====
const form   = document.querySelector('.newsletter-form');
const okMsg  = document.querySelector('.form-msg');
const errMsg = document.querySelector('.form-err');

if (form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value.trim();
    if (!email) return;

    // Demo-Verhalten ohne echten Endpoint
    if (!NEWSLETTER_ENDPOINT){
      okMsg.hidden = false; errMsg.hidden = true;
      setTimeout(()=> okMsg.hidden = true, 6000);
      form.reset();
      return;
    }

    try{
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({ email })
      });
      if (res.ok){
        okMsg.hidden = false; errMsg.hidden = true;
        setTimeout(()=> okMsg.hidden = true, 6000);
        form.reset();
      } else {
        throw new Error('HTTP '+res.status);
      }
    }catch(err){
      errMsg.hidden = false; okMsg.hidden = true;
      console.error(err);
    }
  });
}

// ===== Back-to-Top =====
const toTop = document.getElementById('toTop');
function toggleToTop(){
  const y = window.scrollY || document.documentElement.scrollTop;
  if (y > 600) toTop?.classList.add('show'); else toTop?.classList.remove('show');
}
window.addEventListener('scroll', toggleToTop, {passive:true});
toggleToTop();
toTop?.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

// ===== News-Feed rendern (nur anzeigen, wenn Einträge existieren) =====
function renderNews(){
  const listEl = document.getElementById('news-list');
  const cardEl = document.getElementById('news');
  if (!listEl || !cardEl) return;

  const items = Array.isArray(window.AEON_NEWS) ? window.AEON_NEWS.slice() : [];
  if (!items.length){
    cardEl.hidden = true;
    listEl.innerHTML = "";
    return;
  }

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
