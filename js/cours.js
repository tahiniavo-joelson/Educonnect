/**
 * Fichier: js/cours.js
 * Rôle: Logique de la page cours.html — recherche en temps réel,
 *       filtre par matière, pagination simulée, modale "voir le cours".
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('courses-grid');
  const countEl = document.getElementById('courses-count');
  const searchInput = document.getElementById('course-search');
  const subjectFilter = document.getElementById('subject-filter');
  const paginationEl = document.getElementById('pagination');
  const modalOverlay = document.getElementById('course-modal');

  if (!grid) return;

  const PAGE_SIZE = 6;
  let currentPage = 1;
  let allCourses = DB.getAll(DB.KEYS.COURSES);

  function populateFilters() {
    const subjects = [...new Set(allCourses.map(c => c.matiere))];
    subjectFilter.innerHTML = '<option value="">Toutes les matières</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const subject = subjectFilter.value;
    return allCourses.filter(c => {
      const matchesQuery = !q || c.titre.toLowerCase().includes(q) || c.enseignant.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchesSubject = !subject || c.matiere === subject;
      return matchesQuery && matchesSubject;
    });
  }

  function renderCard(course) {
    return `
      <article class="card course-card">
        <div class="course-cover" style="background-image:url('${course.image}');background-size:cover;background-position:center;">
          <span>${course.matiere}</span>
        </div>
        <div class="course-body">
          <h3>${course.titre}</h3>
          <div class="course-meta">
            <span><i class="fa-solid fa-chart-line"></i> ${course.progression}% complété</span>
          </div>
          <p style="color:var(--color-text-muted);font-size:.86rem;">${course.description}</p>
          <div class="course-teacher">
            <img src="https://i.pravatar.cc/80?u=${encodeURIComponent(course.enseignant)}" alt="Photo de ${course.enseignant}">
            ${course.enseignant}
          </div>
        </div>
        <div class="course-actions">
          <button class="btn btn-outline btn-sm js-view-course" data-id="${course.id}">Voir le cours</button>
          <button class="btn btn-primary btn-sm js-download-course" data-id="${course.id}"><i class="fa-solid fa-download"></i> Support</button>
        </div>
      </article>
    `;
  }

  function render() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    countEl.textContent = `${filtered.length} cours trouvé${filtered.length > 1 ? 's' : ''}`;

    if (!pageItems.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>Aucun cours ne correspond à votre recherche</h3>
          <p>Essayez un autre mot-clé ou changez de filtre.</p>
        </div>`;
    } else {
      grid.innerHTML = pageItems.map(renderCard).join('');
    }

    renderPagination(totalPages);
    attachCardEvents();
  }

  function renderPagination(totalPages) {
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationEl.innerHTML = html;
    paginationEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page, 10);
        render();
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function attachCardEvents() {
    grid.querySelectorAll('.js-view-course').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
    grid.querySelectorAll('.js-download-course').forEach(btn => {
      btn.addEventListener('click', () => {
        Notify.toast('Téléchargement simulé', 'Dans une version connectée à un serveur, le support de cours serait téléchargé ici.', 'info');
      });
    });
  }

  function openModal(id) {
    const course = allCourses.find(c => c.id === id);
    if (!course || !modalOverlay) return;
    modalOverlay.querySelector('.modal-body').innerHTML = `
      <h2>${course.titre}</h2>
      <span class="badge badge-primary">${course.matiere}</span>
      <p style="margin-top:1rem;">${course.description}</p>
      <p><strong>Enseignant :</strong> ${course.enseignant}</p>
      <div class="hero-progress">
        <span style="font-size:.85rem;color:var(--color-text-muted);">Progression du cours</span>
        <div class="bar"><span style="width:${course.progression}%"></span></div>
      </div>
      <div style="margin-top:1.5rem;display:flex;gap:.7rem;">
        <button class="btn btn-primary">Continuer le cours</button>
        <button class="btn btn-outline js-download-course" data-id="${course.id}">Télécharger le support</button>
      </div>
    `;
    modalOverlay.classList.add('open');
    modalOverlay.querySelectorAll('.js-download-course').forEach(btn => {
      btn.addEventListener('click', () => Notify.toast('Téléchargement simulé', '', 'info'));
    });
  }

  if (modalOverlay) {
    modalOverlay.querySelector('.modal-close').addEventListener('click', () => modalOverlay.classList.remove('open'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });
  }

  searchInput.addEventListener('input', () => { currentPage = 1; render(); });
  subjectFilter.addEventListener('change', () => { currentPage = 1; render(); });

  populateFilters();
  render();
});
