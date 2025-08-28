// Footer-Jahr
document.getElementById('y').textContent = new Date().getFullYear();

// Newsletter Demo – zeigt sofort Erfolgsmeldung
const form = document.querySelector('.newsletter-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.querySelector('.form-msg');
    if (msg) {
      msg.hidden = false;
      setTimeout(() => (msg.hidden = true), 6000);
    }
    form.reset();
  });
}

/*
 Für echten Versand später:
 <form action="https://formspree.io/f/DEIN_ID" method="POST"> ... </form>
 oder Buttondown/Brevo/Mailchimp Einbettung. Styling bleibt gleich.
*/
