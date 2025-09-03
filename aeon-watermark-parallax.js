/* /AEON-Engine/aeon-watermark-parallax.js */
(() => {
  const root   = document.documentElement;
  const screen = document.querySelector('.screen');
  const center = document.querySelector('.center');
  const hero   = center?.querySelector('.hero');
  if (!screen || !center || !hero) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function update(){
    const scr   = screen.getBoundingClientRect();
    const heroR = hero.getBoundingClientRect();

    // Bild soll KOMPLETT sichtbar sein → contain
    // Größe: so groß wie möglich, aber voll sichtbar in Screen/Viewport
    const maxSquare = Math.min(scr.width * 1.05, window.innerHeight * 1.05);
    const minWanted = Math.max(heroR.width + 400, 1200);
    const size      = clamp(Math.max(minWanted, maxSquare), 1000, 3600);

    root.style.setProperty('--wm-size', Math.round(size) + 'px');

    // Ankerpunkt ~36% der Hero-Höhe (wirkt „über der Headline“)
    const anchor = parseFloat(getComputedStyle(root).getPropertyValue('--wm-anchor')) || 0.36;

    // Dokument-Koordinaten → relativ zur .screen-Bühne
    const docY   = window.scrollY;
    const scrTop = scr.top  + docY;
    const heroTop= heroR.top + docY;

    const centerY= heroTop - scrTop + (heroR.height * anchor);
    const top    = Math.round(centerY - (size / 2));
    root.style.setProperty('--wm-top', top + 'px');
  }

  const ro = new ResizeObserver(update);
  ro.observe(hero);
  ro.observe(screen);

  window.addEventListener('resize', update, { passive:true });
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('load',   update, { passive:true });
  document.fonts?.ready?.then(update);

  update();
})();
