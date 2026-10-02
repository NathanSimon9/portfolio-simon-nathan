# Portfolio Simon Nathan

Portfolio personnel réalisé en HTML, CSS et JavaScript.

## Structure

- `index.html` : page d'accueil
- `project.html` : page de détail d'un projet
- `css/` : styles séparés par rôle
- `js/` : logique JavaScript et composants
- `data/projects.json` : données des projets
- `assets/` : images et icônes
- `exports-composants/` : exports PNG des composants Figma
- `documentation/` : planification et journal de bord
- `.github/copilot-instructions.md` : consignes pour Copilot

### Figma
https://www.figma.com/design/i1AjBwN1UPxIorXEfGYIjj/Untitled?node-id=0-1&t=zxV3yYCsrNBxEOjv-1


## Ajouter les images et le projet réel

Tous les contenus de la page projet se configurent dans `data/projects.json` :

- `image` : chemin de l’image principale (affichée sur la carte d’accueil et dans la page projet), par exemple `assets/images/projets/mon-projet.jpg`.
- `gallery` : tableau facultatif d’images supplémentaires affichées dans la galerie de la page projet.
- `video` : chemin d’une vidéo locale (par exemple `assets/images/projets/demo.mp4`) ou URL de vidéo directe compatible avec la balise HTML `video`.
- `projectUrl` : URL publique de la réalisation (site, prototype ou démo), affichée avec un bouton « Ouvrir le projet ».

Place tes fichiers dans `assets/images/projets/` (crée le dossier au besoin), puis indique leurs chemins relatifs à la racine du site. Laisse une valeur vide (`""`) ou un tableau vide (`[]`) si un média n’est pas disponible. Pour les projets hébergés ailleurs, utilise `projectUrl` : la page affiche un lien qui s’ouvre dans un nouvel onglet.
