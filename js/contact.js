// Contact form mock submission
const contactForm = document.getElementById('contactForm');
const contactMsg = document.getElementById('contactMsg');
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  contactMsg.textContent = 'Sending...';
  setTimeout(()=>{
    contactMsg.textContent = 'Message sent! We will reply within 1 business day.';
    contactForm.reset();
  }, 800);
});
