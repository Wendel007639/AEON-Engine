// main.js

// Footer-Jahr
document.getElementById('y').textContent = new Date().getFullYear();

// Auto-Akzent: falls kein data-accent gesetzt ist, aus Badge-Text ableiten
document.querySelectorAll('section.meta').forEach(sec => {
  if (sec.dataset.accent) return; // bereits gesetzt
  const badge = sec.querySelector('.badge');
  if (!badge) return;
  const t = badge.textContent.trim().toLowerCase();
  if (/(introspection|introspektion|metakognition)/.test(t)) {
    sec.dataset.accent = 'cyan';
  } else if (/(decision|entscheid|context|kontext)/.test(t)) {
    sec.dataset.accent = 'amber';
  }
});
