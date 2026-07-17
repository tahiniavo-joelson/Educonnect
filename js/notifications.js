/**
 * Fichier: js/notifications.js
 * Rôle: Système de notifications flottantes (toasts) affichées en haut
 *       à droite de l'écran, et gestion des notifications persistées
 *       (page notifications.html, cloche du tableau de bord).
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

const Notify = (() => {
  function ensureContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  /** Affiche un toast temporaire. type: success | error | info */
  function toast(title, message = '', type = 'info', duration = 4000) {
    const container = ensureContainer();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <i class="fa-solid ${ICONS[type] || ICONS.info}" style="color:${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'}"></i>
      <div>
        <strong>${title}</strong>
        ${message ? `<p>${message}</p>` : ''}
      </div>
    `;
    container.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'slideIn .25s ease reverse';
      setTimeout(() => el.remove(), 250);
    }, duration);
  }

  /** Nombre de notifications non lues pour un utilisateur */
  function unreadCount(userId) {
    return DB.getAll(DB.KEYS.NOTIFICATIONS).filter(n => n.destinataireId === userId && !n.lue).length;
  }

  /** Met à jour tous les badges de cloche présents sur la page */
  function refreshBell(userId) {
    const count = unreadCount(userId);
    document.querySelectorAll('.bell-btn .dot').forEach(dot => {
      dot.style.display = count > 0 ? 'block' : 'none';
    });
  }

  function markAllRead(userId) {
    const all = DB.getAll(DB.KEYS.NOTIFICATIONS);
    all.forEach(n => { if (n.destinataireId === userId) n.lue = true; });
    DB.setAll(DB.KEYS.NOTIFICATIONS, all);
  }

  return { toast, unreadCount, refreshBell, markAllRead };
})();
