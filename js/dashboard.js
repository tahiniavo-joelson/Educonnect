/**
 * Fichier: js/dashboard.js
 * Rôle: Logique des tableaux de bord étudiant et enseignant — chargement
 *       des widgets (cours, devoirs, notes, notifications, calendrier,
 *       statistiques de participation), publication de cours/devoirs.
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  /* ============ DASHBOARD ÉTUDIANT ============ */
  if (body.dataset.page === 'dashboard-etudiant') {
    Auth.requireRole('etudiant');
    const user = Auth.currentUser();

    const courses = DB.getAll(DB.KEYS.COURSES);
    const assignments = DB.getAll(DB.KEYS.ASSIGNMENTS).filter(a => a.etudiantId === user.id);
    const notifications = DB.getAll(DB.KEYS.NOTIFICATIONS).filter(n => n.destinataireId === user.id);

    // KPI
    setText('kpi-courses', courses.length);
    setText('kpi-pending', assignments.filter(a => a.statut === 'a_rendre').length);
    setText('kpi-avg', '14.5/20');
    setText('kpi-notifications', Notify.unreadCount(user.id));
    Notify.refreshBell(user.id);

    // Mes cours
    const coursesList = document.getElementById('my-courses-list');
    if (coursesList) {
      coursesList.innerHTML = courses.slice(0, 4).map(c => `
        <div class="list-row">
          <div class="list-row-icon"><i class="fa-solid fa-book"></i></div>
          <div class="list-row-info">
            <strong>${c.titre}</strong>
            <span>${c.matiere} · ${c.enseignant}</span>
          </div>
          <span class="badge badge-primary">${c.progression}%</span>
        </div>
      `).join('');
    }

    // Devoirs à rendre
    const dueList = document.getElementById('due-assignments-list');
    if (dueList) {
      const pending = assignments.filter(a => a.statut === 'a_rendre');
      dueList.innerHTML = pending.length ? pending.map(a => `
        <div class="list-row">
          <div class="list-row-icon" style="background:#FEE2E2;color:var(--color-error);"><i class="fa-solid fa-file-pen"></i></div>
          <div class="list-row-info">
            <strong>${a.titre}</strong>
            <span>${a.matiere} · Limite : ${formatDate(a.dateLimite)}</span>
          </div>
          <a href="devoir.html" class="btn btn-sm btn-outline">Soumettre</a>
        </div>
      `).join('') : `<div class="empty-state"><i class="fa-solid fa-champagne-glasses"></i><h3>Tout est à jour</h3></div>`;
    }

    // Dernières notes (démo statique cohérente)
    const gradesTable = document.getElementById('grades-table-body');
    if (gradesTable) {
      const demoGrades = [
        { matiere: 'Algorithmique', devoir: 'TP Structures de données', note: '16/20' },
        { matiere: 'Mathématiques', devoir: 'Dissertation suites', note: '13/20' },
        { matiere: 'Anglais', devoir: 'Essay writing', note: '15/20' }
      ];
      gradesTable.innerHTML = demoGrades.map(g => `
        <tr><td>${g.matiere}</td><td>${g.devoir}</td><td><span class="badge badge-success">${g.note}</span></td></tr>
      `).join('');
    }

    // Notifications récentes
    const notifList = document.getElementById('recent-notifications-list');
    if (notifList) {
      notifList.innerHTML = notifications.slice(0, 4).map(n => `
        <div class="list-row">
          <div class="list-row-icon"><i class="fa-solid fa-bell"></i></div>
          <div class="list-row-info">
            <strong>${n.titre}</strong>
            <span>${n.message}</span>
          </div>
        </div>
      `).join('');
    }

    renderMiniCalendar();
  }

  /* ============ DASHBOARD ENSEIGNANT ============ */
  if (body.dataset.page === 'dashboard-enseignant') {
    Auth.requireRole('enseignant');
    const user = Auth.currentUser();

    const courses = DB.getAll(DB.KEYS.COURSES);
    const submissions = DB.getAll(DB.KEYS.SUBMISSIONS);
    const students = DB.getAll(DB.KEYS.USERS).filter(u => u.role === 'etudiant');

    setText('kpi-courses', courses.length);
    setText('kpi-students', students.length);
    setText('kpi-submissions', submissions.length);
    setText('kpi-notifications', Notify.unreadCount(user.id));
    Notify.refreshBell(user.id);

    // Liste des cours publiés
    const coursesList = document.getElementById('teacher-courses-list');
    if (coursesList) {
      coursesList.innerHTML = courses.map(c => `
        <div class="list-row">
          <div class="list-row-icon"><i class="fa-solid fa-chalkboard"></i></div>
          <div class="list-row-info">
            <strong>${c.titre}</strong>
            <span>${c.matiere}</span>
          </div>
          <span class="badge badge-neutral">${c.progression}% suivi</span>
        </div>
      `).join('');
    }

    // Soumissions reçues
    const subTable = document.getElementById('submissions-table-body');
    if (subTable) {
      subTable.innerHTML = submissions.length ? submissions.map(s => `
        <tr>
          <td>${s.etudiantNom}</td>
          <td>${s.titre}</td>
          <td>${s.matiere}</td>
          <td><span class="badge badge-success">Soumis</span></td>
        </tr>
      `).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:2rem;">Aucune soumission pour le moment.</td></tr>`;
    }

    // Étudiants
    const studentsList = document.getElementById('students-list');
    if (studentsList) {
      studentsList.innerHTML = students.map(s => `
        <div class="list-row">
          <img src="${s.avatar}" alt="Photo de ${s.nom}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;">
          <div class="list-row-info">
            <strong>${s.nom}</strong>
            <span>${s.email}</span>
          </div>
        </div>
      `).join('');
    }

    // Formulaire: publier un cours
    const courseForm = document.getElementById('publish-course-form');
    if (courseForm) {
      courseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titre = document.getElementById('nouveau-cours-titre').value.trim();
        const matiere = document.getElementById('nouveau-cours-matiere').value.trim();
        const description = document.getElementById('nouveau-cours-description').value.trim();
        if (!titre || !matiere || !description) {
          Notify.toast('Champs manquants', 'Merci de remplir tous les champs du cours.', 'error');
          return;
        }
        DB.insert(DB.KEYS.COURSES, {
          titre, matiere, description, enseignant: user.nom, progression: 0,
          image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600'
        });
        Notify.toast('Cours publié', `"${titre}" est maintenant visible par les étudiants.`, 'success');
        courseForm.reset();
        location.reload();
      });
    }

    // Formulaire: ajouter un devoir
    const assignmentForm = document.getElementById('publish-assignment-form');
    if (assignmentForm) {
      assignmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titre = document.getElementById('nouveau-devoir-titre').value.trim();
        const matiere = document.getElementById('nouveau-devoir-matiere').value.trim();
        const dateLimite = document.getElementById('nouveau-devoir-date').value;
        if (!titre || !matiere || !dateLimite) {
          Notify.toast('Champs manquants', 'Merci de remplir tous les champs du devoir.', 'error');
          return;
        }
        students.forEach(s => {
          DB.insert(DB.KEYS.ASSIGNMENTS, { titre, matiere, description: '', dateLimite, statut: 'a_rendre', etudiantId: s.id });
        });
        Notify.toast('Devoir publié', `"${titre}" a été assigné à ${students.length} étudiant(s).`, 'success');
        assignmentForm.reset();
      });
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function renderMiniCalendar() {
    const cal = document.getElementById('mini-calendar-days');
    if (!cal) return;
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // lundi en premier
    let html = '';
    for (let i = 0; i < offset; i++) html += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === now.getDate();
      html += `<div class="cal-day ${isToday ? 'today' : ''}">${d}</div>`;
    }
    cal.innerHTML = html;
  }
});
