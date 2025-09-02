/* A.E.O.N – Mobile Redirect (GitHub Pages) */
/* Leitet echte Mobile-Devices nach /mobile/ um.
   Overrides:
   - ?mobile=1 oder ?m=1  -> erzwingt /mobile/
   - ?desktop=1 oder ?m=0 -> erzwingt Desktop (zurück aus /mobile/)
*/
(function () {
  try {
    const qs = new URLSearchParams(location.search);
    const forceDesktop = qs.has('desktop') || qs.get('m') === '0';
    const forceMobile  = qs.has('mobile')  || qs.get('m') === '1';

    const onMobilePath = /\/mobile(\/|$)/.test(location.pathname);
    const ROOT = '/AEON-Engine/';                 // Repo-Basis (anpassen falls nötig)
    const MOBILE_URL = ROOT + 'mobile/';

    // Device-Erkennung (robust, nicht nur User-Agent)
    const ua = navigator.userAgent;
    const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone|Mobi/i.test(ua);
    const narrow   = matchMedia('(max-width: 900px)').matches;
    const coarse   = matchMedia('(pointer: coarse)').matches;
    const isMobile = forceMobile || uaMobile || (narrow && coarse);

    // Zur Desktop-Variante zurück, wenn erzwungen
    if (forceDesktop && onMobilePath) {
      location.replace(ROOT);
      return;
    }

    // Auf Mobile umleiten, wenn nötig (und nicht schon dort)
    if (isMobile && !onMobilePath) {
      if (!location.href.startsWith(MOBILE_URL)) {
        location.replace(MOBILE_URL);
      }
    }
  } catch (e) {
    // still & silent
  }
})();
