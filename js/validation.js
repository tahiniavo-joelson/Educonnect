/**
 * Fichier: js/validation.js
 * Rôle: Fonctions de validation réutilisables pour tous les formulaires
 *       (inscription, connexion, devoir, profil).
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

const Validation = (() => {

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function isPhone(value) {
    return /^[0-9+\s-]{7,15}$/.test(value.trim());
  }

  function minLength(value, len) {
    return value.trim().length >= len;
  }

  function isRequired(value) {
    return value !== undefined && value !== null && value.toString().trim().length > 0;
  }

  function isFutureOrToday(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    return target >= today;
  }

  function passwordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  /** Affiche l'état d'erreur sur un champ + message */
  function setFieldError(fieldEl, message) {
    fieldEl.classList.add('error');
    const msg = fieldEl.querySelector('.error-msg');
    if (msg) msg.textContent = message;
  }

  function clearFieldError(fieldEl) {
    fieldEl.classList.remove('error');
    const msg = fieldEl.querySelector('.error-msg');
    if (msg) msg.textContent = '';
  }

  return {
    isEmail, isPhone, minLength, isRequired, isFutureOrToday,
    passwordStrength, setFieldError, clearFieldError
  };
})();
