# Portfolio Simon Nathan

Portfolio personnel réalisé en HTML, CSS et JavaScript.

## Structure

- `index.html` : page d'accueil
- `project.html` : page de détail d'un projet
- `css/` : styles séparés par rôle
- `js/` : logique JavaScript (`main.js` pour l'accueil, `project.js` pour la page projet, `utils.js` pour les fonctions partagées, `data.js` pour le chargement du JSON) et `components/` pour les composants réutilisables
- `data/projects.json` : données des projets
- `assets/` : images et vidéos (`assets/images/projet/` pour les projets, `assets/images/video/` pour les vidéos)
- `image/` : logos des logiciels et icônes de contact
- `export_composant/` : exports PDF du design Figma (desktop, mobile, moodboard)
- `documentation/` : planification et journal de bord
- `.github/copilot-instructions.md` : consignes pour Copilot

### Figma
https://www.figma.com/design/i1AjBwN1UPxIorXEfGYIjj/Untitled?node-id=0-1&t=zxV3yYCsrNBxEOjv-1


## Lancer le site en local

Le site charge `data/projects.json` avec `fetch()` et des modules JavaScript : il faut donc un petit serveur local (ouvrir `index.html` directement ne fonctionne pas). Par exemple : `python3 -m http.server`, puis ouvrir http://localhost:8000.

## Ajouter les images et le projet réel

Tous les contenus de la page projet se configurent dans `data/projects.json` :

- `image` : chemin de l’image principale (affichée sur la carte d’accueil et dans la page projet), par exemple `assets/images/projet/mon-projet.jpg`.
- `gallery` : tableau facultatif d’images supplémentaires affichées dans la galerie de la page projet.
- `video` : chemin d’une vidéo locale (par exemple `assets/images/video/demo.mp4`) ou URL de vidéo directe compatible avec la balise HTML `video`.
- `projectUrl` : URL publique de la réalisation (site, prototype ou démo), affichée avec un bouton « Ouvrir le projet ».

Place tes images dans `assets/images/projet/` et tes vidéos dans `assets/images/video/` (crée les dossiers au besoin), puis indique leurs chemins relatifs à la racine du site. Laisse une valeur vide (`""`) ou un tableau vide (`[]`) si un média n’est pas disponible. Pour les projets hébergés ailleurs, utilise `projectUrl` : la page affiche un lien qui s’ouvre dans un nouvel onglet.
