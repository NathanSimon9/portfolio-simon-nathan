/* Générateur réutilisable des cartes de projet affichées dans le carrousel. */
import { escapeHTML } from "../utils.js";

export function createProjectCard(project) {
  const title = escapeHTML(project.title);
  const tags = (project.tags || []).map((tag) => `<li>${escapeHTML(tag)}</li>`).join("");
  // L'image est facultative : sans image, la carte s'affiche sans bloc média.
  const media = project.image
    ? `<div class="project-card__media"><img src="${escapeHTML(project.image)}" alt="Aperçu du projet ${title}" loading="lazy" decoding="async"></div>`
    : "";

  const article = document.createElement("article");
  article.className = "project-card";
  article.innerHTML = `
    <a class="project-card__link" href="project.html?id=${encodeURIComponent(project.id)}">
      ${media}
      <div class="project-card__body">
        <h2>${title}</h2>
        <p>${escapeHTML(project.shortDescription)}</p>
        <ul class="project-card__tags" aria-label="Technologies du projet">${tags}</ul>
        <span class="project-card__action">Voir le projet <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  `;
  return article;
}
