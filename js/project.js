/* Initialisation de la page détaillée et affichage des données du projet demandé. */
import { loadProjects } from "./data.js";

const container = document.querySelector("[data-project-detail]");
const pagination = document.querySelector("[data-project-navigation]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Même ambiance étoilée que le hero, dessinée directement sur la page projet. */
const spaceCanvas = document.querySelector(".project-space-canvas");
if (spaceCanvas) {
  const context = spaceCanvas.getContext("2d");
  let stars = [];
  let frame = 0;

  function resizeSpace() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    spaceCanvas.width = Math.round(width * dpr);
    spaceCanvas.height = Math.round(height * dpr);
    spaceCanvas.style.width = `${width}px`;
    spaceCanvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  function drawSpace() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    context.clearRect(0, 0, width, height);
    const now = performance.now();
    for (const star of stars) {
      const twinkle = reducedMotion ? 0.9 : 0.72 + Math.sin(star.drift + now * 0.0012) * 0.28;
      context.beginPath();
      context.fillStyle = `rgba(245, 249, 255, ${star.alpha * twinkle})`;
      context.shadowBlur = star.radius > 1.05 ? 5 : 2;
      context.shadowColor = "rgba(132, 190, 255, 0.5)";
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
      if (!reducedMotion) {
        star.drift += 0.004;
        star.y += star.speed * 0.18;
        if (star.y > height + 2) {
          star.y = -2;
          star.x = Math.random() * width;
        }
      }
    }
    context.shadowBlur = 0;
    if (!reducedMotion) frame = requestAnimationFrame(drawSpace);
  }

  resizeSpace();
  drawSpace();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(frame);
    resizeSpace();
    drawSpace();
  }, { passive: true });
}

const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

function renderPagination(projects, currentIndex) {
  if (!pagination) return;
  const previous = projects[currentIndex - 1];
  const next = projects[currentIndex + 1];
  const link = (project, direction, className = "") => project
    ? `<a class="project-pagination__link ${className}" href="project.html?id=${encodeURIComponent(project.id)}">
        <span class="project-pagination__direction">${direction}</span>
        <span class="project-pagination__title">${escapeHTML(project.title)}</span>
      </a>`
    : `<div class="project-pagination__empty">${direction === "PROJET PRÉCÉDENT" ? "Premier projet" : "Dernier projet"}</div>`;

  pagination.innerHTML = link(previous, "← PROJET PRÉCÉDENT") + link(next, "PROJET SUIVANT →", "project-pagination__link--next");
}

function renderProject(project, projects) {
  const currentIndex = projects.findIndex((item) => item.id === project.id);
  const number = String(currentIndex + 1).padStart(2, "0");
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const gallery = Array.isArray(project.gallery) ? project.gallery.filter(Boolean) : [];
  const projectMedia = [project.image, ...gallery].filter(Boolean);
  const safeProjectUrl = typeof project.projectUrl === "string" && /^https?:\/\//i.test(project.projectUrl) ? project.projectUrl : "";
  const safeVideoUrl = typeof project.video === "string" && project.video.trim() ? project.video.trim() : "";

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
        <p class="project-index-number">${number}<span style="color:var(--project-cyan)">/</span>${String(projects.length).padStart(2, "0")}</p>
        <p class="project-index-label">Outils & disciplines</p>
        <ul class="project-tags">${tags.map((tag) => `<li>${escapeHTML(tag)}</li>`).join("")}</ul>
      </aside>
    </header>

    ${projectMedia.length || safeVideoUrl || safeProjectUrl ? `
    <section class="project-showcase" aria-labelledby="project-showcase-title">
      <div class="project-showcase__heading">
        <p class="project-eyebrow">En images</p>
        <h2 class="project-section-heading" id="project-showcase-title">Aperçu visuel</h2>
      </div>
      ${safeVideoUrl ? `<div class="project-showcase__video"><video controls playsinline preload="metadata" ${project.image ? `poster="${escapeHTML(project.image)}"` : ""}><source src="${escapeHTML(safeVideoUrl)}">Ton navigateur ne prend pas en charge la vidéo.</video></div>` : ""}
      ${projectMedia.length ? `<div class="project-gallery ${projectMedia.length === 1 ? "project-gallery--single" : ""}">${projectMedia.map((src, index) => `<figure class="project-gallery__item"><img src="${escapeHTML(src)}" alt="${escapeHTML(project.title)} — aperçu ${index + 1}" loading="lazy"><figcaption>APERÇU ${String(index + 1).padStart(2, "0")}</figcaption></figure>`).join("")}</div>` : ""}
      ${safeProjectUrl ? `<div class="project-showcase__actions"><a class="project-action-button project-action-button--primary" href="${escapeHTML(safeProjectUrl)}" target="_blank" rel="noopener noreferrer">Ouvrir le projet en ligne <span aria-hidden="true">↗</span></a></div>` : ""}
    </section>` : ""}

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
      ${safeProjectUrl ? `<a class="project-action-button project-action-button--primary" href="${escapeHTML(safeProjectUrl)}" target="_blank" rel="noopener noreferrer">Ouvrir le projet <span aria-hidden="true">↗</span></a>` : ""}
      <a class="project-action-button" href="index.html#projets"><span aria-hidden="true">←</span> Revenir à tous les projets</a>
      <button class="project-action-button" type="button" data-copy-project><span aria-hidden="true">↗</span> Copier le lien du projet</button>
    </div>
  `;

  const copyButton = container.querySelector("[data-copy-project]");
  copyButton?.addEventListener("click", async () => {
    const originalLabel = "↗ Copier le lien du projet";
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyButton.textContent = "✓ Lien copié";
    } catch {
      copyButton.textContent = "Sélectionne l’URL dans la barre d’adresse";
    }
    window.setTimeout(() => {
      if (copyButton.isConnected) copyButton.textContent = originalLabel;
    }, 2200);
  });

  renderPagination(projects, currentIndex);
}

if (container) {
  const params = new URLSearchParams(window.location.search);
  const projectId = Number(params.get("id")) || 1;

  loadProjects()
    .then((projects) => {
      const project = projects.find((item) => item.id === projectId);
      if (!project) {
        container.innerHTML = `
          <section class="project-error">
            <p class="project-eyebrow">Erreur 404</p>
            <h1>Projet introuvable</h1>
            <p>Ce projet n’existe pas ou a été déplacé.</p>
            <a class="project-action-button project-action-button--primary" href="index.html#projets">← Retour aux projets</a>
          </section>`;
        if (pagination) pagination.remove();
        return;
      }
      renderProject(project, projects);
    })
    .catch((error) => {
      console.error(error);
      container.innerHTML = `
        <section class="project-error">
          <p class="project-eyebrow">Chargement impossible</p>
          <h1>Une erreur est survenue</h1>
          <p>Impossible de charger les informations du projet. Réessaie depuis la page des projets.</p>
          <a class="project-action-button project-action-button--primary" href="index.html#projets">← Retour aux projets</a>
        </section>`;
    });
}
