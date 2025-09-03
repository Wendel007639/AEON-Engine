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

    // Zielgröße: groß genug, um Hero üppig zu umrahmen, aber ohne Clipping
    const minWanted = heroR.width + 700;      // großzügig
    const maxByW    = scr.width  * 1.35;
    const maxByH    = window.innerHeight * 1.6;
    const size      = clamp(Math.max(1400, minWanted), 1200, Math.min(3200, maxByW, maxByH));
    root.style.setProperty('--wm-size', Math.round(size) + 'px');

    // Ankerpunkt ~36% der Hero-Höhe – gefühlt „Mitte über Headline“
    const anchor = parseFloat(getComputedStyle(root).getPropertyValue('--wm-anchor')) || 0.36;

    // Dokument-Koordinaten -> innerhalb .screen positionieren
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
