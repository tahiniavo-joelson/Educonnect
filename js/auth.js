/**
 * Fichier: js/auth.js
 * Rôle: Gestion de l'authentification — inscription, connexion,
 *       déconnexion, persistance de session et protection des pages
 *       selon le rôle de l'utilisateur.
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

const Auth = (() => {

  function currentUser() {
    return DB.getSession();
  }

  function isLoggedIn() {
    return !!currentUser();
  }

  function login(email, password, remember) {
    const users = DB.getAll(DB.KEYS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'Aucun compte trouvé avec cet email.' };
    if (user.motdepasse !== password) return { ok: false, error: 'Mot de passe incorrect.' };

    const { motdepasse, ...safeUser } = user;
    DB.setSession(safeUser);
    if (remember) localStorage.setItem('edu_remember', email);
    else localStorage.removeItem('edu_remember');
    return { ok: true, user: safeUser };
  }

  function register(data) {
    const users = DB.getAll(DB.KEYS.USERS);
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'Un compte existe déjà avec cet email.' };
    }
    const newUser = DB.insert(DB.KEYS.USERS, {
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      role: data.role,
      motdepasse: data.motdepasse,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(data.email)}`
    });
    const { motdepasse, ...safeUser } = newUser;
    DB.setSession(safeUser);
    return { ok: true, user: safeUser };
  }

  function logout() {
    DB.clearSession();
    window.location.href = 'login.html';
  }

  /** Redirige vers login.html si aucun utilisateur n'est connecté */
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }

  /** Redirige vers le bon tableau de bord selon le rôle */
  function redirectToDashboard() {
    const user = currentUser();
    if (!user) return;
    window.location.href = user.role === 'enseignant' ? 'dashboard-enseignant.html' : 'dashboard-etudiant.html';
  }

  /** Empêche un rôle d'accéder au tableau de bord de l'autre rôle */
  function requireRole(role) {
    requireAuth();
    const user = currentUser();
    if (user && user.role !== role) {
      redirectToDashboard();
    }
  }

  /** Rempli les zones ".user-name", ".user-role", ".user-avatar" de la page */
  function injectUserWidgets() {
    const user = currentUser();
    if (!user) return;
    document.querySelectorAll('.js-user-name').forEach(el => el.textContent = user.nom);
    document.querySelectorAll('.js-user-role').forEach(el => el.textContent = user.role === 'enseignant' ? 'Enseignant' : 'Étudiant');
    document.querySelectorAll('.js-user-avatar').forEach(el => el.src = user.avatar);
    document.querySelectorAll('.js-user-email').forEach(el => el.textContent = user.email);
  }

  return { currentUser, isLoggedIn, login, register, logout, requireAuth, requireRole, redirectToDashboard, injectUserWidgets };
})();

document.addEventListener('DOMContentLoaded', () => {
  Auth.injectUserWidgets();
  const logoutBtns = document.querySelectorAll('.js-logout');
  logoutBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    Auth.logout();
  }));
});
