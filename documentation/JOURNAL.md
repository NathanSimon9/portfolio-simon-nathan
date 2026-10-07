# portfolio-simon-nathan

# Bloc 1

## Qu'est-ce que j'ai accompli depuis le dernier bloc? (Vous pouvez faire référence à vos commits).
J'ai complété mon moodboard pour le portfolio ainsi que le design dans Figma, en format desktop et mobile. J'ai aussi complété les fichiers planification.md et journal.md.

## Quelle a été ma principale difficulté et comment je l'ai surmontée?
Tout ce que j'avais fait lors du premier cours n'a pas été sauvegardé sur GitHub, malgré le fait que je croyais avoir fait un commit. J'ai donc refait tout ce que j'avais réalisé et j'ai compris qu'il faut aussi synchroniser les changements après avoir fait le commit. Maintenant, je ne ferai plus cette erreur.

## Qu'est-ce que j'ai appris que je ne savais pas avant?
J'ai appris qu'il faut aussi synchroniser les changements après avoir fait le commit. J'ai aussi appris, grâce à l'IA, qu'un fichier JSON externe est une bonne solution pour un portfolio statique, car il permet de stocker les données des projets séparément du code HTML. J'ai compris que la récupération asynchrone avec fetch() permet de charger ces données au moment où la page s'ouvre, sans bloquer l'affichage, et que cela facilite la mise à jour des projets.

## Quelle est ma prochaine étape concrète?
Importer les bibliothèques dont j'ai besoin pour mon projet et commencer le codage afin de réaliser le portfolio.

## Est-ce que j'ai utilisé l'IA? Si oui, pour quoi et qu'est-ce que ça m'a appris?
Oui, et cela a servi pour la partie gestion des données. Je lui ai demandé ce qui serait le mieux pour mon projet et il m'a dit : "fichier externe JSON" et "récupération asynchrone avec fetch() en JavaScript". Je lui ai ensuite demandé ce que cela faisait exactement, et il m'a expliqué, en résumé, que cela permettait de :
- garder les projets séparés du code
- modifier facilement les informations
- charger les données sans rendre la page lourde
- utiliser un hébergement statique comme GitHub Pages

<br>

# IA

## Date : 
09 septembre 2026

## Prompt :

### 1
 "Quel est le meilleur type de gestion de données pour mon portfolio ? Je veux utiliser un fichier externe et récupérer les données de façon asynchrone au chargement de la page."

### 2
 "Explique-moi ce que fait fetch() avec un fichier JSON et pourquoi c'est utile pour afficher des projets dans mon portfolio."

## Outil : 
Copilot

## Résultat :

### 1
 L'IA m'a recommandé d'utiliser un fichier JSON externe pour stocker les données des projets, puis de les récupérer avec fetch() en JavaScript au chargement de la page.

### 2
 L'IA m'a expliqué que fetch() permet de lire un fichier JSON externe, de le transformer en objet JavaScript et de l'afficher dynamiquement dans la page. Elle m'a aussi clarifié que cette méthode est asynchrone, ce qui signifie que la page continue de se charger sans blocage pendant que les données arrivent. J'ai utilisé cette explication pour mieux comprendre la technique que j'applique dans mon portfolio.



## Date : 
17 septembre 2026

## Prompt :

### 1
 "J'ai besoin d'une section héro. la section héro a un fond noir et des particules representant des étoiles.Les etoiles doive subtilement essayer de ne pas toucher à mon curseur. "

 ### 2
 "La prochaine section doit etre un degrader du noir de la section de avant à un bleu ciel.Une fois le bleu ciel atteint il me faut 100vh du bleu ciel en couleur unis puis sur cette parti la ajoute limage des nuages dans mon fichier image avec une legere animation pour reproduire le mouvement naturelle des nuages. "

## Outil : 
Copilot

## Résultat :

### 1
 L'IA a créé exactement les background hero que j'avais en tête

 ### 2
 L'IA a créé exactement la deuxieme section que j'avais en tête


 ## Date : 
25 septembre 2026

## Prompt :

### 1
 "J'ai besoin d'une effet sur mon image d'océan pour reproduire le mouvement de leau "

 ### 2
 "Je veu un effet de parralaxe de ma derniere section. Je veux que le parralaxe commence 10vh avant que lon apercoit la derniere section "


## Outil : 
Copilot

chatgpt

## Résultat :

### 1
 L'IA a créé avec des animation css une animation recréant le mouvement de l'eau

### 2

ChatGPT a créé le paralaxe donc la derniere section monte plus vite que cell du ciel

## Date : 
1er oct 2026

## Prompt :

### 1
 "met mon video du dossier video qui jou en boucle et qui jou automatiquement ajoute un bouton subtile pour activer et desactiver le sons "

 ### 2
 "je veux des ligne de competence animer avec du anim js pour montre mes competence et que quand on lest vois ya une animation photo shop fais la ligne monter jusqua 95% davinci 98% after effect 80% maya 75% unity 75%"


## Outil : 
Copilot

## Résultat :

### 1
 Il a fais mon bouton et lancer automatiquement le video en boucle

### 2

il a fais lanimation demander.

### IA

## Date :

06 octobre 2026

## Prompt :

### 1

« Analyse mon code HTML, CSS et JavaScript et aide-moi à l’optimiser sans modifier ou briser les fonctionnalités déjà présentes dans mon portfolio. »

### 2

« Comment puis-je améliorer les performances de mon portfolio, notamment le chargement des images et des vidéos, tout en gardant une bonne qualité visuelle ? »

### 3

« Aide-moi à corriger et améliorer les animations, le carrousel et les interactions de mon portfolio tout en conservant le design actuel. »

## Outil :

ChatGpt

## Résultat :

### 1

L’IA m’a aidé à analyser mon HTML, CSS et JavaScript afin de repérer des erreurs et de rendre mon code plus propre et plus optimisé. Elle m’a aussi aidé à organiser certaines parties du code sans modifier les fonctionnalités principales de mon portfolio.

### 2

L’IA m’a proposé différentes façons d’améliorer les performances, notamment en réduisant le poids des médias, en utilisant des formats plus adaptés et en ajoutant `loading="lazy"` pour éviter de charger les images et les vidéos trop tôt.

### 3

L’IA m’a aussi aidé à améliorer certaines animations et interactions, notamment le carrousel, le défilement et les effets présents dans les différentes sections. J’ai cependant dû tester les modifications proposées, car certaines solutions pouvaient régler un problème tout en créant un autre problème ailleurs. Cette utilisation m’a permis de mieux comprendre mon propre code et de voir l’IA comme un outil d’aide au développement plutôt que comme une solution qui fonctionne automatiquement.
<br>

# Bloc 2

## Qu'est-ce que j'ai accompli depuis le dernier bloc?

J'ai terminé une première version bêta de mon portfolio afin de pouvoir le tester et repérer les erreurs ou les éléments qui doivent encore être améliorés. Cette version me permet maintenant d'avoir une bonne base fonctionnelle et de voir concrètement ce qui doit être corrigé avant la version finale.

## Quelle a été ma principale difficulté et comment je l'ai surmontée?

Ma principale difficulté a été l'optimisation du portfolio, puisque plusieurs de mes projets contenaient des vidéos assez lourdes. Cela pouvait ralentir le chargement du site, surtout lorsqu'il y avait plusieurs médias sur une même page.

Pour régler ce problème, j'ai réexporté mes vidéos en format MP4 en essayant de garder une bonne qualité tout en réduisant leur poids. J'ai également utilisé une technique vue dans le cours, soit `loading="lazy"`, qui permet de charger certains médias seulement lorsqu'ils sont sur le point d'être affichés. Cela permet d'éviter de charger tous les médias du portfolio dès l'ouverture de la page.

## Qu'est-ce que j'ai appris que je ne savais pas avant?

J'ai appris à utiliser `loading="lazy"` pour optimiser le chargement des médias d'une page web. J'ai aussi découvert des outils permettant d'analyser un site web et de repérer différentes erreurs ou problèmes d'accessibilité, comme un mauvais contraste entre les couleurs.

Cela m'a fait comprendre qu'un site peut fonctionner correctement tout en ayant plusieurs éléments qui peuvent encore être améliorés, notamment au niveau de l'accessibilité, des performances et de l'expérience utilisateur.

## Quelle est ma prochaine étape concrète?

Ma prochaine étape est de corriger les erreurs que je vais trouver en testant la version bêta de mon portfolio. Je vais également adapter le site pour les téléphones afin qu'il soit responsive et que la navigation, les animations et les différents projets restent fonctionnels sur un écran plus petit.

## Est-ce que j'ai utilisé l'IA? Si oui, pour quoi et qu'est-ce que ça m'a appris?

Oui, j'ai utilisé l'IA principalement pour m'aider dans le développement et l'optimisation de mon portfolio. Je l'ai utilisée pour m'aider à trouver des problèmes dans mon code HTML, CSS et JavaScript, optimiser certaines parties du site et trouver des solutions pour mes animations et mes interactions.

Je l'ai également utilisée pour m'aider à organiser certaines parties du code, notamment la structure des projets et le fonctionnement du carrousel, des animations et de certaines interactions avec le scroll. L'IA m'a surtout servi comme outil d'aide et de recherche de solutions lorsque je rencontrais un problème, plutôt que de simplement générer tout le site à ma place.

Cela m'a permis de mieux comprendre certaines techniques que je ne connaissais pas, notamment comment optimiser le chargement des médias, gérer des animations avec JavaScript et améliorer la structure de mon code. J'ai aussi appris qu'il faut toujours tester les solutions proposées par l'IA, car une modification qui semble correcte peut parfois créer des problèmes ailleurs dans le site.



<br>













