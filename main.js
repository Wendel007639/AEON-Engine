// Footer-Jahr
document.getElementById('y').textContent = new Date().getFullYear();

// ===== Akzentsteuerung =====
// Für jetzt ALLES in CYAN halten:
const FORCE_CYAN = true;

// Wenn später gewünscht, auf false setzen, dann greift die Auto-Zuordnung.
document.querySelectorAll('section.meta').forEach(sec => {
  if (FORCE_CYAN) {
    sec.dataset.accent = 'cyan';
    return;
  }
  // Auto-Mapping (nur wenn kein data-accent gesetzt)
  if (sec.dataset.accent) return;
  const label = (sec.querySelector('.badge')?.textContent || '').toLowerCase();
  if (/(introspection|introspektion)/.test(label)) {
    sec.dataset.accent = 'cyan';
  } else if (/(decision|entscheid|context)/.test(label)) {
    sec.dataset.accent = 'amber';
  }
});
