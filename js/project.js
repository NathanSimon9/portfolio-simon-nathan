import { loadProjects } from "./data.js";

const container = document.querySelector("[data-project-detail]");

if (container) {
  const params = new URLSearchParams(window.location.search);
  const projectId = Number(params.get("id")) || 1;

  loadProjects()
    .then((projects) => {
      const project = projects.find((item) => item.id === projectId);

      if (!project) {
        container.innerHTML = "<p>Projet introuvable.</p>";
        return;
      }

      container.innerHTML = `
        <h1>${project.title}</h1>
        <p>${project.shortDescription}</p>
        <h2>Contexte</h2>
        <p>${project.context}</p>
        <h2>Rôle</h2>
        <p>${project.role}</p>
        <h2>Résultat</h2>
        <p>${project.result}</p>
        <p>${project.tags.map((tag) => `<span>${tag}</span>`).join(" · ")}</p>
      `;
    })
    .catch((error) => {
      console.error(error);
      container.innerHTML = "<p>Une erreur est survenue lors du chargement du projet.</p>";
    });
}
