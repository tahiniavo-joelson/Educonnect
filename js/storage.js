/**
 * Fichier: js/storage.js
 * Rôle: Couche d'accès aux données — simule une base de données avec
 *       localStorage. Fournit un CRUD générique pour: users, courses,
 *       assignments, submissions, notifications.
 *       Conçu pour être remplacé facilement par des appels API
 *       (fetch vers un backend PHP / Node.js / Laravel) plus tard.
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

const DB = (() => {
  const KEYS = {
    USERS: 'edu_users',
    COURSES: 'edu_courses',
    ASSIGNMENTS: 'edu_assignments',
    SUBMISSIONS: 'edu_submissions',
    NOTIFICATIONS: 'edu_notifications',
    SESSION: 'edu_session',
    SEEDED: 'edu_seeded_v1'
  };

  /** Lecture générique d'une collection */
  function getAll(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erreur de lecture LocalStorage:', key, e);
      return [];
    }
  }

  /** Écriture générique d'une collection */
  function setAll(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Erreur d\'écriture LocalStorage:', key, e);
      return false;
    }
  }

  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  /** CRUD générique */
  function insert(key, record) {
    const all = getAll(key);
    const withId = { id: generateId(key.slice(0, 3)), createdAt: new Date().toISOString(), ...record };
    all.push(withId);
    setAll(key, all);
    return withId;
  }

  function update(key, id, patch) {
    const all = getAll(key);
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    setAll(key, all);
    return all[idx];
  }

  function remove(key, id) {
    const all = getAll(key);
    const filtered = all.filter(r => r.id !== id);
    setAll(key, filtered);
    return filtered.length !== all.length;
  }

  function findById(key, id) {
    return getAll(key).find(r => r.id === id) || null;
  }

  /** Session courante */
  function getSession() {
    try {
      const raw = localStorage.getItem(KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(KEYS.SESSION);
  }

  /** Jeu de données de démonstration, injecté une seule fois */
  function seed() {
    if (localStorage.getItem(KEYS.SEEDED)) return;

    const users = [
      { id: 'usr_demo_etu', nom: 'Rovasoa Andrianina', email: 'etudiant@educonnect.mg', telephone: '0341234567', role: 'etudiant', motdepasse: 'Etudiant123', avatar: 'https://i.pravatar.cc/150?img=47', createdAt: new Date().toISOString() },
      { id: 'usr_demo_ens', nom: 'Prof. Hery Randria', email: 'enseignant@educonnect.mg', telephone: '0331234567', role: 'enseignant', motdepasse: 'Enseignant123', avatar: 'https://i.pravatar.cc/150?img=12', createdAt: new Date().toISOString() }
    ];

    const courses = [
      { id: 'crs_1', titre: 'Algorithmique et structures de données', matiere: 'Informatique', enseignant: 'Prof. Hery Randria', description: "Fondamentaux des algorithmes, complexité et structures de données classiques.", progression: 62, image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600', createdAt: new Date().toISOString() },
      { id: 'crs_2', titre: 'Bases de données relationnelles', matiere: 'Informatique', enseignant: 'Prof. Hery Randria', description: "Modélisation, SQL avancé et normalisation des schémas relationnels.", progression: 40, image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600', createdAt: new Date().toISOString() },
      { id: 'crs_3', titre: 'Développement Web Front-End', matiere: 'Informatique', enseignant: 'Prof. Hery Randria', description: "HTML5, CSS3 et JavaScript moderne pour construire des interfaces réactives.", progression: 78, image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600', createdAt: new Date().toISOString() },
      { id: 'crs_4', titre: 'Analyse mathématique III', matiere: 'Mathématiques', enseignant: 'Prof. Voahangy Rakoto', description: "Suites, séries et fonctions de plusieurs variables.", progression: 25, image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600', createdAt: new Date().toISOString() },
      { id: 'crs_5', titre: 'Anglais académique', matiere: 'Langues', enseignant: 'Prof. Fanja Rasoanaivo', description: "Rédaction académique, prise de parole et compréhension avancée.", progression: 55, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600', createdAt: new Date().toISOString() },
      { id: 'crs_6', titre: 'Réseaux informatiques', matiere: 'Informatique', enseignant: 'Prof. Hery Randria', description: "Modèle OSI, TCP/IP, routage et sécurité des réseaux.", progression: 10, image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600', createdAt: new Date().toISOString() }
    ];

    const assignments = [
      { id: 'dev_1', titre: 'Implémentation d\'une liste chaînée', matiere: 'Informatique', description: 'Implémenter une liste doublement chaînée générique en JavaScript.', dateLimite: '2026-07-25', statut: 'a_rendre', etudiantId: 'usr_demo_etu', createdAt: new Date().toISOString() },
      { id: 'dev_2', titre: 'Modèle conceptuel de données', matiere: 'Informatique', description: 'Concevoir le MCD d\'une plateforme de e-commerce.', dateLimite: '2026-07-30', statut: 'a_rendre', etudiantId: 'usr_demo_etu', createdAt: new Date().toISOString() },
      { id: 'dev_3', titre: 'Dissertation sur les suites numériques', matiere: 'Mathématiques', description: 'Rédiger une dissertation sur la convergence des suites.', dateLimite: '2026-07-20', statut: 'rendu', etudiantId: 'usr_demo_etu', createdAt: new Date().toISOString() }
    ];

    const notifications = [
      { id: 'not_1', titre: 'Nouveau devoir publié', message: 'Un nouveau devoir a été ajouté en Bases de données relationnelles.', type: 'devoir', lue: false, destinataireId: 'usr_demo_etu', createdAt: new Date().toISOString() },
      { id: 'not_2', titre: 'Note publiée', message: 'Votre note pour "Dissertation sur les suites numériques" est disponible.', type: 'note', lue: false, destinataireId: 'usr_demo_etu', createdAt: new Date().toISOString() },
      { id: 'not_3', titre: 'Rappel d\'échéance', message: 'Le devoir "Implémentation d\'une liste chaînée" est à rendre dans 3 jours.', type: 'rappel', lue: true, destinataireId: 'usr_demo_etu', createdAt: new Date().toISOString() }
    ];

    setAll(KEYS.USERS, users);
    setAll(KEYS.COURSES, courses);
    setAll(KEYS.ASSIGNMENTS, assignments);
    setAll(KEYS.SUBMISSIONS, []);
    setAll(KEYS.NOTIFICATIONS, notifications);
    localStorage.setItem(KEYS.SEEDED, 'true');
  }

  return { KEYS, getAll, setAll, insert, update, remove, findById, getSession, setSession, clearSession, seed, generateId };
})();

// Initialise les données de démonstration au premier chargement
DB.seed();
