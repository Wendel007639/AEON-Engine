(() => {
  'use strict';

  const $  = (s, r=document) => r.querySelector(s);

  function todayISO() {
    const d = new Date();
    const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    return iso.slice(0, 10);
  }

  function buildTestItem() {
    return {
      date: todayISO(),
      title: "[TEST-NEWSLETTER] A.E.O.N – Early Access Infos",
      body: "Dies ist ein TEST-Newsletter. Abonnent:innen erhalten Inhalte grundsätzlich eine Woche früher als die Veröffentlichung auf der Webseite – kostenlos.",
      tag: "NEWSLETTER · TEST"
    };
  }

  function ensureNews() {
    const current = Array.isArray(window.AEON_NEWS) ? window.AEON_NEWS.slice() : [];
    const testItem = buildTestItem();
    const hasTest = current.some(n => n && n.tag === testItem.tag && n.title === testItem.title && n.date === testItem.date);
    if (!hasTest) current.push(testItem);
    Object.defineProperty(window, "AEON_NEWS", {
      value: current,
      writable: false,
      enumerable: true,
      configurable: true
    });
    return current;
  }

  function renderNews(items) {
    const newsSection = $('#news');
    const list = $('#news-list');
    if (!newsSection || !list) return;
    newsSection.hidden = false;
    list.innerHTML = '';
    items
      .slice()
      .sort((a,b) => String(b.date).localeCompare(String(a.date)))
      .forEach(n => {
        const it = document.createElement('article');
        it.className = 'news-item';
        it.innerHTML = `
          <div class="meta">
            <time datetime="${(n.date||'').toString()}">${(n.date||'').toString()}</time>
            <span class="tag">${(n.tag||'').toString()}</span>
          </div>
          <div class="title">${(n.title||'').toString()}</div>
          <div class="body">${(n.body||'').toString()}</div>
        `;
        list.appendChild(it);
      });
  }

  function init() {
    try {
      const items = ensureNews();
      renderNews(items);
    } catch(_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
