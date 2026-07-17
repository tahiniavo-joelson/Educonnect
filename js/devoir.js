/**
 * Fichier: js/devoir.js
 * Rôle: Logique de la page devoir.html — formulaire de soumission
 *       de devoir avec validation complète et zone de dépôt de fichier,
 *       ainsi que la liste des devoirs à venir dans la barre latérale.
 * Auteur: Tahiniavo Joelson – Étudiant en Mathématiques
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('devoir-form');
  if (!form) return;

  Auth.requireAuth();

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fichier-devoir');
  const filePreview = document.getElementById('file-preview');
  const commentaireEl = document.getElementById('commentaire');
  const charCountEl = document.getElementById('char-count');
  const listEl = document.getElementById('assignment-sidebar-list');

  let selectedFile = null;

  /* ============ ZONE DE DÉPÔT DE FICHIER ============ */
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    selectedFile = file;
    const sizeKb = (file.size / 1024).toFixed(1);
    filePreview.innerHTML = `
      <i class="fa-solid fa-file"></i>
      <span>${file.name} (${sizeKb} Ko)</span>
      <i class="fa-solid fa-xmark remove-file" role="button" tabindex="0" aria-label="Retirer le fichier"></i>
    `;
    filePreview.style.display = 'flex';
    filePreview.querySelector('.remove-file').addEventListener('click', (e) => {
      e.stopPropagation();
      selectedFile = null;
      fileInput.value = '';
      filePreview.style.display = 'none';
    });
  }

  /* ============ COMPTEUR DE CARACTÈRES ============ */
  if (commentaireEl && charCountEl) {
    commentaireEl.addEventListener('input', () => {
      charCountEl.textContent = `${commentaireEl.value.length} / 500`;
    });
  }

  /* ============ VALIDATION ET SOUMISSION ============ */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const titreField = document.getElementById('field-titre');
    const matiereField = document.getElementById('field-matiere');
    const descriptionField = document.getElementById('field-description');
    const dateField = document.getElementById('field-date');

    [titreField, matiereField, descriptionField, dateField].forEach(f => Validation.clearFieldError(f));

    const titre = document.getElementById('titre-devoir').value;
    const matiere = document.getElementById('matiere-devoir').value;
    const description = document.getElementById('description-devoir').value;
    const dateLimite = document.getElementById('date-limite').value;

    if (!Validation.isRequired(titre)) { Validation.setFieldError(titreField, 'Le titre est obligatoire.'); valid = false; }
    if (!Validation.isRequired(matiere)) { Validation.setFieldError(matiereField, 'Veuillez choisir une matière.'); valid = false; }
    if (!Validation.minLength(description, 10)) { Validation.setFieldError(descriptionField, 'Décrivez le devoir en au moins 10 caractères.'); valid = false; }
    if (!Validation.isRequired(dateLimite) || !Validation.isFutureOrToday(dateLimite)) {
      Validation.setFieldError(dateField, 'Choisissez une date limite valide (aujourd\'hui ou plus tard).'); valid = false;
    }
    if (!selectedFile) {
      Notify.toast('Fichier manquant', 'Veuillez joindre un fichier avant de soumettre.', 'error');
      valid = false;
    }

    if (!valid) return;

    const user = Auth.currentUser();
    DB.insert(DB.KEYS.SUBMISSIONS, {
      titre, matiere, description, dateLimite,
      commentaire: commentaireEl.value,
      fichierNom: selectedFile ? selectedFile.name : null,
      etudiantId: user.id,
      etudiantNom: user.nom,
      statut: 'soumis'
    });

    Notify.toast('Devoir soumis avec succès', `"${titre}" a bien été envoyé.`, 'success');
    form.reset();
    filePreview.style.display = 'none';
    selectedFile = null;
    charCountEl.textContent = '0 / 500';
    renderSidebarList();
  });

  /* ============ LISTE DES DEVOIRS À RENDRE ============ */
  function renderSidebarList() {
    if (!listEl) return;
    const user = Auth.currentUser();
    const assignments = DB.getAll(DB.KEYS.ASSIGNMENTS).filter(a => a.etudiantId === user.id && a.statut === 'a_rendre');
    if (!assignments.length) {
      listEl.innerHTML = `<p style="color:#9CA3AF;font-size:.85rem;">Aucun devoir en attente. Bravo !</p>`;
      return;
    }
    listEl.innerHTML = assignments.map(a => `
      <div class="assignment-list-item">
        <div>
          <span class="title">${a.titre}</span>
          <span class="due">${a.matiere} · Limite : ${formatDate(a.dateLimite)}</span>
        </div>
        <span class="badge badge-error">À rendre</span>
      </div>
    `).join('');
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  renderSidebarList();
});
