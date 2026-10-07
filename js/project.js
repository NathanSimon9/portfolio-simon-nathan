/* Page détaillée d'un projet : fond étoilé, affichage des données du projet
   demandé (?id=…) et navigation vers le projet précédent / suivant. */
import { loadProjects } from "./data.js";
import { escapeHTML, prefersReducedMotion } from "./utils.js";

const container = document.querySelector("[data-project-detail]");
const pagination = document.querySelector("[data-project-navigation]");

/* ------------------------------------------------------------------
   Fond étoilé (même ambiance que le hero de la page d'accueil)
   ------------------------------------------------------------------ */
function initSpaceBackground() {
  const canvas = document.querySelector(".project-space-canvas");
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;

  const reduceMotion = prefersReducedMotion();
  const FRAME_MS = 1000 / 60; // les vitesses ci-dessous sont exprimées par image à 60 Hz

  let stars = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  let lastTime = 0;

  // Nombre d'étoiles proportionnel à la surface de l'écran (entre 75 et 180).
  function createStars() {
    const count = Math.min(180, Math.max(75, Math.floor((width * height) / 10000)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.25 + 0.25,
      alpha: Math.random() * 0.58 + 0.16,
      drift: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.16 + 0.025,
    }));
  }

  // Dessine une image ; `step` = nombre d'images à 60 Hz écoulées depuis la précédente.
  function draw(now, step) {
    ctx.clearRect(0, 0, width, height);
    ctx.shadowColor = "rgba(132, 190, 255, 0.5)"; // réinitialisé quand le canvas est redimensionné

    for (const star of stars) {
      const twinkle = reduceMotion ? 0.9 : 0.72 + Math.sin(star.drift + now * 0.0012) * 0.28;
      ctx.beginPath();
      ctx.fillStyle = `rgba(245, 249, 255, ${star.alpha * twinkle})`;
      ctx.shadowBlur = star.radius > 1.05 ? 5 : 2;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) {
        star.drift += 0.004 * step;
        star.y += star.speed * 0.18 * step;
        // Une étoile qui sort par le bas réapparaît en haut, à une abscisse aléatoire.
        if (star.y > height + 2) {
          star.y = -2;
          star.x = Math.random() * width;
        }
      }
    }
    ctx.shadowBlur = 0;
  }

  function frame(now) {
    // dt plafonné pour éviter un saut au retour sur l'onglet.
    const step = Math.min(50, Math.max(0, now - lastTime)) / FRAME_MS;
    lastTime = now;
    draw(now, step);
    rafId = requestAnimationFrame(frame);
  }

  // Adapte la résolution à l'écran. Les étoiles ne sont recréées que si la largeur
  // change (la barre d'adresse mobile modifie seulement la hauteur).
  function resize() {
    const newWidth = canvas.clientWidth;
    const newHeight = canvas.clientHeight;
    if (!newWidth || !newHeight) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(newWidth * dpr);
    canvas.height = Math.round(newHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const widthChanged = newWidth !== width;
    width = newWidth;
    height = newHeight;
    if (widthChanged || !stars.length) createStars();

    // Mouvement réduit : une seule image fixe, redessinée à chaque redimensionnement.
    if (reduceMotion) draw(performance.now(), 0);
  }

  new ResizeObserver(resize).observe(canvas);
  resize();

  if (!reduceMotion) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }
}

/* ------------------------------------------------------------------
   Navigation entre les projets
   ------------------------------------------------------------------ */
// Affiche les liens « précédent » / « suivant ». S'il n'y a pas de projet de ce côté
// (premier ou dernier de la liste), un encadré en pointillés affiche `emptyLabel`.
function renderPagination(projects, currentIndex) {
  if (!pagination) return;

  const link = (project, label, emptyLabel, className = "") =>
    project
      ? `<a class="project-pagination__link ${className}" href="project.html?id=${encodeURIComponent(project.id)}">
          <span class="project-pagination__direction">${label}</span>
          <span class="project-pagination__title">${escapeHTML(project.title)}</span>
        </a>`
      : `<div class="project-pagination__empty">${emptyLabel}</div>`;

  pagination.innerHTML =
    link(projects[currentIndex - 1], "← PROJET PRÉCÉDENT", "Premier projet") +
    link(projects[currentIndex + 1], "PROJET SUIVANT →", "Dernier projet", "project-pagination__link--next");
}

/* ------------------------------------------------------------------
   Affichage d'un projet
   ------------------------------------------------------------------ */
// Section « Aperçu visuel » : vidéo, galerie d'images et lien vers la réalisation en ligne.
function renderShowcase(project, media, videoUrl, projectUrl) {
  if (!media.length && !videoUrl && !projectUrl) return "";

  const video = videoUrl
    ? `<div class="project-showcase__video"><video controls playsinline preload="metadata" ${project.image ? `poster="${escapeHTML(project.image)}"` : ""}><source src="${escapeHTML(videoUrl)}">Ton navigateur ne prend pas en charge la vidéo.</video></div>`
    : "";

  const gallery = media.length
    ? `<div class="project-gallery ${media.length === 1 ? "project-gallery--single" : ""}">${media
        .map(
          (src, index) =>
            `<figure class="project-gallery__item"><img src="${escapeHTML(src)}" alt="${escapeHTML(project.title)} — aperçu ${index + 1}" loading="lazy" decoding="async"><figcaption>APERÇU ${String(index + 1).padStart(2, "0")}</figcaption></figure>`
        )
        .join("")}</div>`
    : "";

  const action = projectUrl
    ? `<div class="project-showcase__actions"><a class="project-action-button project-action-button--primary" href="${escapeHTML(projectUrl)}" target="_blank" rel="noopener noreferrer">Ouvrir le projet en ligne <span aria-hidden="true">↗</span></a></div>`
    : "";

  return `
    <section class="project-showcase" aria-labelledby="project-showcase-title">
      <div class="project-showcase__heading">
        <p class="project-eyebrow">En images</p>
        <h2 class="project-section-heading" id="project-showcase-title">Aperçu visuel</h2>
      </div>
      ${video}
      ${gallery}
      ${action}
    </section>`;
}

function renderProject(project, projects) {
  const currentIndex = projects.findIndex((item) => item.id === project.id);
  const number = String(currentIndex + 1).padStart(2, "0");
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const gallery = Array.isArray(project.gallery) ? project.gallery.filter(Boolean) : [];
  // L'image principale ouvre la galerie, suivie des images supplémentaires.
  const media = [project.image, ...gallery].filter(Boolean);
  // Seules les URL http(s) sont acceptées pour le lien externe (évite javascript:…).
  const projectUrl =
    typeof project.projectUrl === "string" && /^https?:\/\//i.test(project.projectUrl)
      ? project.projectUrl
      : "";
  const videoUrl = typeof project.video === "string" ? project.video.trim() : "";

  document.title = `${project.title} | Nathan Simon — Portfolio`;
  container.innerHTML = `
    <header class="project-hero">
      <div class="project-hero__main">
        <p class="project-eyebrow">Projet créatif · Portfolio</p>
        <h1 class="project-title">${escapeHTML(project.title)}</h1>
        <p class="project-summary">${escapeHTML(project.shortDescription)}</p>
      </div>
      <aside class="project-hero__meta" aria-label="Informations du projet">
        <p class="project-index-label">Projet numéro</p>
        <p class="project-index-number">${number}<span>/</span>${String(projects.length).padStart(2, "0")}</p>
        <p class="project-index-label">Outils & disciplines</p>
        <ul class="project-tags">${tags.map((tag) => `<li>${escapeHTML(tag)}</li>`).join("")}</ul>
      </aside>
    </header>

    ${renderShowcase(project, media, videoUrl, projectUrl)}

    <section aria-labelledby="project-details-title">
      <h2 class="project-section-heading" id="project-details-title">À propos du projet</h2>
      <div class="project-info-grid">
        <section class="project-info-card">
          <span class="project-info-card__number">01 / CONTEXTE</span>
          <h3>Le défi</h3>
          <p>${escapeHTML(project.context)}</p>
        </section>
        <section class="project-info-card">
          <span class="project-info-card__number">02 / CONTRIBUTION</span>
          <h3>Mon rôle</h3>
          <p>${escapeHTML(project.role)}</p>
        </section>
        <section class="project-info-card">
          <span class="project-info-card__number">03 / LIVRABLE</span>
          <h3>Le résultat</h3>
          <p>${escapeHTML(project.result)}</p>
        </section>
      </div>
    </section>

    <div class="project-actions">
      ${projectUrl ? `<a class="project-action-button project-action-button--primary" href="${escapeHTML(projectUrl)}" target="_blank" rel="noopener noreferrer">Ouvrir le projet <span aria-hidden="true">↗</span></a>` : ""}
      <a class="project-action-button" href="index.html#projets"><span aria-hidden="true">←</span> Revenir à tous les projets</a>
      <button class="project-action-button" type="button" data-copy-project><span aria-hidden="true">↗</span> Copier le lien du projet</button>
    </div>
  `;

  // Bouton « Copier le lien » : confirmation temporaire puis retour au libellé d'origine.
  const copyButton = container.querySelector("[data-copy-project]");
  const originalLabel = copyButton.innerHTML;
  let resetTimer = 0;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyButton.textContent = "✓ Lien copié";
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission refusée…).
      copyButton.textContent = "Sélectionne l’URL dans la barre d’adresse";
    }
    window.clearTimeout(resetTimer); // évite qu'un clic répété n'écourte le message
    resetTimer = window.setTimeout(() => {
      copyButton.innerHTML = originalLabel;
    }, 2200);
  });

  renderPagination(projects, currentIndex);
}

// Affiche un message d'erreur dans la zone principale (projet introuvable, chargement échoué…).
function renderError(eyebrow, title, message) {
  container.innerHTML = `
    <section class="project-error">
      <p class="project-eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p>${message}</p>
      <a class="project-action-button project-action-button--primary" href="index.html#projets">← Retour aux projets</a>
    </section>`;
}

/* ------------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------------ */
initSpaceBackground();

if (container) {
  // Le projet affiché est choisi par l'URL : project.html?id=3 (le projet 1 par défaut).
  const projectId = Number(new URLSearchParams(window.location.search).get("id")) || 1;

  loadProjects()
    .then((projects) => {
      const project = projects.find((item) => item.id === projectId);
      if (!project) {
        renderError("Erreur 404", "Projet introuvable", "Ce projet n’existe pas ou a été déplacé.");
        pagination?.remove();
        return;
      }
      renderProject(project, projects);
    })
    .catch((error) => {
      console.error(error);
      renderError(
        "Chargement impossible",
        "Une erreur est survenue",
        "Impossible de charger les informations du projet. Réessaie depuis la page des projets."
      );
    });
}
