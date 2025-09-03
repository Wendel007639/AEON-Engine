// AEON News – Beispiel-Eintrag (ersetz-/erweiterbar)
(function(){
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  const iso = `${yyyy}-${mm}-${dd}`;

  window.AEON_NEWS = [
    {
      date: iso,
      title: "[TEST-NEWSLETTER] A.E.O.N – Neues von Tim",
      body: "Dies ist ein TEST Newsletter. Abonnent:innen erhalten Inhalte grundsätzlich eine Woche früher als die Veröffentlichung auf der Webseite - kostenlos.",
      tag: "NEWSLETTER"
    }
  ];
})();
