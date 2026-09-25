export async function loadProjects() {
  const response = await fetch("data/projects.json");
  if (!response.ok) {
    throw new Error(`Impossible de charger les projets (${response.status}).`);
  }
  return response.json();
}
