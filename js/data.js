/* Chargement et préparation des données des projets du portfolio. */

// Promesse mémorisée : le fichier JSON n'est téléchargé qu'une seule fois par page.
let projectsPromise;

export function loadProjects() {
  projectsPromise ??= fetch("data/projects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Impossible de charger les projets (${response.status}).`);
      }
      return response.json();
    })
    // En cas d'échec, on oublie la promesse pour permettre un nouvel essai.
    .catch((error) => {
      projectsPromise = undefined;
      throw error;
    });
  return projectsPromise;
}
