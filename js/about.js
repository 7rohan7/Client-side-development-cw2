document.addEventListener('DOMContentLoaded', function () {
  const teamCards = document.querySelectorAll('.team-card');

  teamCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, 150 * index);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.mission-section, .team-section, .contact-section')
    .forEach(section => observer.observe(section));
});
