/**
 * Fichier: js/main.js
 * Rôle: Comportements globaux du site — menu mobile (hamburger),
 *       marquage du lien de navigation actif, effets d'apparition,
 *       compteurs animés de la page d'accueil.
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ============ MENU HAMBURGER ============ */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ============ LIEN DE NAVIGATION ACTIF ============ */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  /* ============ HEADER AUTH-AWARE ============ */
  const user = typeof Auth !== 'undefined' ? Auth.currentUser() : null;
  const guestActions = document.querySelector('.js-guest-actions');
  const authActions = document.querySelector('.js-auth-actions');
  if (user) {
    if (guestActions) guestActions.style.display = 'none';
    if (authActions) authActions.style.display = 'flex';
  } else {
    if (guestActions) guestActions.style.display = 'flex';
    if (authActions) authActions.style.display = 'none';
  }

  /* ============ COMPTEURS STATISTIQUES ANIMÉS ============ */
  const statEls = document.querySelectorAll('[data-count]');
  if (statEls.length) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('fr-FR');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('fr-FR') + (el.dataset.suffix || '');
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => observer.observe(el));
  }

  /* ============ APPARITION AU SCROLL ============ */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      revealObserver.observe(el);
    });
  }

  /* ============ FORMULAIRE DE CONTACT (démo) ============ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      Notify.toast('Message envoyé', 'Nous vous répondrons sous 48h.', 'success');
      contactForm.reset();
    });
  }
});
