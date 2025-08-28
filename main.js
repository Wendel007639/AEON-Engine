// ===== Newsletter: echten Endpoint hier eintragen =====
// Beispiel Formspree: "https://formspree.io/f/XXXXYYYY"
const NEWSLETTER_ENDPOINT = ""; // leer = Demo-Modus

// ===== Footer-Jahr =====
const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Drawer (Mobile Sidebars) =====
const body    = document.body;
const scrim   = document.querySelector('.scrim');
const leftBtn = document.querySelector('.toggle-left');
const rightBtn= document.querySelector('.toggle-right');
const leftBar = document.getElementById('drawer-left');
const rightBar= document.getElementById('drawer-right');

function openLeft(){ body.classList.add('drawer-left-open');  leftBtn?.setAttribute('aria-expanded','true');  leftBar?.querySelector('a,button,input')?.focus(); }
function openRight(){body.classList.add('drawer-right-open'); rightBtn?.setAttribute('aria-expanded','true'); rightBar?.querySelector('a,button,input')?.focus(); }
function closeDrawers(){
  body.classList.remove('drawer-left-open','drawer-right-open');
  leftBtn?.setAttribute('aria-expanded','false');
  rightBtn?.setAttribute('aria-expanded','false');
  // Fokus zurück zur zuletzt genutzten Taste
  (document.activeElement === document.body ? leftBtn : document.activeElement)?.blur();
}

leftBtn?.addEventListener('click', (e)=>{ e.preventDefault(); body.classList.contains('drawer-left-open') ? closeDrawers() : openLeft(); });
rightBtn?.addEventListener('click',(e)=>{ e.preventDefault(); body.classList.contains('drawer-right-open') ? closeDrawers() : openRight(); });
scrim?.addEventListener('click', closeDrawers);
window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeDrawers(); });

// ===== Scroll-Spy =====
const spyLinks = document.querySelectorAll('.sidecard a.spy');
const idMap = new Map([...spyLinks].map(a => [a.getAttribute('href').slice(1), a]));

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const id = entry.target.id;
    const link = idMap.get(id);
    if (!link) return;
    if (entry.isIntersecting){
      spyLinks.forEach(a=>a.classList.remove('active'));
      link.classList.add('active');
    }
  });
},{ rootMargin: '-35% 0px -50% 0px', threshold: 0.01 });

idMap.forEach((_a, id)=>{
  const sec = document.getElementById(id);
  if (sec) observer.observe(sec);
});

spyLinks.forEach(a => a.addEventListener('click', ()=> closeDrawers()));

// ===== Newsletter Submit =====
const form = document.querySelector('.newsletter-form');
const okMsg = document.querySelector('.form-msg');
const errMsg = document.querySelector('.form-err');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value.trim();
    if (!email) return;

    // Demo-Modus
    if (!NEWSLETTER_ENDPOINT) {
      okMsg.hidden = false; errMsg.hidden = true;
      setTimeout(()=> okMsg.hidden = true, 6000);
      form.reset();
      return;
    }

    try {
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        okMsg.hidden = false; errMsg.hidden = true;
        setTimeout(()=> okMsg.hidden = true, 6000);
        form.reset();
      } else {
        throw new Error('HTTP '+res.status);
      }
    } catch (err) {
      errMsg.hidden = false; okMsg.hidden = true;
      console.error('Newsletter error:', err);
    }
  });
}

// ===== Back-to-Top =====
const toTop = document.getElementById('toTop');
function toggleToTop(){
  if (!toTop) return;
  const scrolled = window.scrollY || document.documentElement.scrollTop;
  if (scrolled > 600) toTop.classList.add('show');
  else toTop.classList.remove('show');
}
window.addEventListener('scroll', toggleToTop, { passive:true });
toggleToTop();

toTop?.addEventListener('click', ()=>{
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
