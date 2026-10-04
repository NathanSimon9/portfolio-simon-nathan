export function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";
  article.innerHTML = `
    <a class="project-card__link" href="project.html?id=${project.id}">
      ${project.image ? `<div class="project-card__media"><img src="${project.image}" alt="Aperçu du projet ${project.title}" loading="lazy"></div>` : ""}
      <div class="project-card__body">
      <h2>${project.title}</h2>
      <p>${project.shortDescription}</p>
      <ul class="project-card__tags" aria-label="Technologies du projet">
        ${project.tags.map((tag) => `<li>${tag}</li>`).join("")}
      </ul>
      <span class="project-card__action">Voir le projet <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  `;
  return article;
}
