export function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";
  article.innerHTML = `
    <h2>${project.title}</h2>
    <p>${project.shortDescription}</p>
  `;
  return article;
}
