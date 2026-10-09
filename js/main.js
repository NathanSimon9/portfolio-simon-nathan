/* Page d'accueil : étoiles du hero, parallaxe des nuages, carrousel de projets,
   bulles, vidéo de démo, barres de compétences et ondes de l'océan.
   Chaque fonctionnalité vit dans sa propre fonction init…() et ignore
   silencieusement les éléments absents de la page. */
import { loadProjects } from "./data.js";
import { createProjectCard } from "./components/project-card.js";
import { onVisibilityChange, prefersReducedMotion } from "./utils.js";

/* Nombre aléatoire dans l'intervalle [min, max[. */
const rand = (min, max) => min + Math.random() * (max - min);

/* ------------------------------------------------------------------
   1. HERO — fond étoilé (canvas 2D)
   ------------------------------------------------------------------ */
function initHeroStars() {
  const canvas = document.querySelector(".hero-canvas");
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;

  const STAR_COUNT = 120;
  // Vitesse de référence : l'animation d'origine mettait les étoiles à jour
  // environ 120 fois par seconde. On garde ce rythme, mais indépendamment
  // du taux de rafraîchissement de l'écran (60 Hz, 144 Hz…).
  const UPDATES_PER_SECOND = 120;
  const reduceMotion = prefersReducedMotion();

  let stars = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  let lastTime = 0;

  // Crée les étoiles avec une position, une taille et une vitesse aléatoires.
  function createStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.4,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: Math.random() * 0.12 + 0.04,
      alpha: Math.random() * 0.7 + 0.15,
      drift: Math.random() * Math.PI * 2,
    }));
  }

  // Fait avancer les étoiles ; `step` = nombre de mises à jour écoulées.
  function updateStars(step) {
    for (const star of stars) {
      star.x += (star.speedX + Math.sin(star.drift) * 0.05) * step;
      star.y += star.speedY * 0.5 * step;
      star.drift += 0.008 * step;

      // On recycle les étoiles avant qu'elles atteignent le bord du canvas.
      // Cela évite que le halo (shadowBlur) soit coupé par le bas du hero
      // et crée une ligne blanche.
      const edgeMargin = 8;
      if (star.x < -edgeMargin || star.x > width + edgeMargin) {
        star.x = Math.random() * width;
      }
      if (star.y > height - edgeMargin) {
        star.y = -edgeMargin;
        star.x = Math.random() * width;
      }
    }
  }

  // Dessine toutes les étoiles (scintillement + halo léger).
  function drawStars(now) {
    ctx.clearRect(0, 0, width, height);
    ctx.shadowColor = "rgba(255,255,255,0.35)"; // réinitialisé quand le canvas est redimensionné

    for (const star of stars) {
      const twinkle = 0.8 + Math.sin((star.x + star.y) * 0.03 + now * 0.0015) * 0.2;
      const glow = 0.35 + Math.sin(star.drift) * 0.12;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, star.alpha + twinkle * 0.12)})`;
      ctx.shadowBlur = 4 * glow;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Boucle d'animation : un seul requestAnimationFrame par image.
  function frame(now) {
    // dt est plafonné pour éviter un "saut" au retour sur l'onglet.
    const dt = Math.min(50, Math.max(0, now - lastTime));
    lastTime = now;
    updateStars((dt / 1000) * UPDATES_PER_SECOND);
    drawStars(now);
    rafId = requestAnimationFrame(frame);
  }

  const start = () => {
    if (rafId || reduceMotion) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  };

  const stop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  // Adapte la résolution du canvas à sa taille réelle à l'écran (écrans Retina inclus).
  // Les étoiles ne sont recréées que si la largeur change : sur mobile, la barre
  // d'adresse qui apparaît/disparaît ne doit pas faire "clignoter" le ciel.
  function resize() {
    const newWidth = canvas.clientWidth;
    const newHeight = canvas.clientHeight;
    if (!newWidth || !newHeight) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(newWidth * dpr);
    canvas.height = Math.round(newHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const widthChanged = newWidth !== width;
    width = newWidth;
    height = newHeight;
    if (widthChanged || !stars.length) createStars();

    // Mouvement réduit : image fixe, redessinée seulement quand la taille change.
    if (reduceMotion) drawStars(performance.now());
  }

  new ResizeObserver(resize).observe(canvas);
  resize();

  // L'animation ne tourne que lorsque le hero est visible à l'écran.
  onVisibilityChange(canvas, (visible) => (visible ? start() : stop()));
}

/* ------------------------------------------------------------------
   2. TRANSITION — parallaxe de la section de nuages
   ------------------------------------------------------------------ */
function initCloudParallax() {
  const cloudSection = document.querySelector(".cloud-plain-section");
  const oceanSection = document.querySelector(".sea-transition-section");
  if (!cloudSection || !oceanSection) return;

  const MAX_SHIFT = 700; // décalage maximal en px
  const SPEED = 0.35;    // fraction de la distance parcourue convertie en décalage

  let leadPx = 0;         // avance de la parallaxe (variable CSS --cloud-parallax-lead)
  let currentShift = -1;  // dernier décalage appliqué (évite les écritures inutiles)
  let ticking = false;

  // La variable CSS peut être en vh ou en px : on la convertit en px seulement
  // au chargement et au redimensionnement (pas à chaque défilement).
  function readLead() {
    const raw = getComputedStyle(cloudSection).getPropertyValue("--cloud-parallax-lead").trim();
    const value = parseFloat(raw) || 0;
    leadPx = raw.endsWith("vh") ? (value * window.innerHeight) / 100 : value;
  }

  // Plus l'océan entre dans l'écran, plus la section de nuages descend.
  function update() {
    ticking = false;
    const distanceIntoView = Math.max(
      0,
      window.innerHeight - oceanSection.getBoundingClientRect().top + leadPx
    );
    const shift = Math.round(Math.min(MAX_SHIFT, distanceIntoView * SPEED) * 10) / 10;
    if (shift === currentShift) return;
    currentShift = shift;
    cloudSection.style.setProperty("--cloud-parallax-y", `${shift}px`);
  }

  // Regroupe les événements de défilement : un seul calcul par image.
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", () => {
    readLead();
    requestUpdate();
  });
  readLead();
  update();
}

/* ------------------------------------------------------------------
   3. PROJETS — filtres par catégorie et carrousel horizontal
   ------------------------------------------------------------------ */
function initProjects() {
  // Menus compacts pour la navigation principale et les filtres du carrousel.
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryMenu = document.querySelector("#primary-menu");
  menuToggle?.addEventListener("click", () => {
    const isOpen = primaryMenu?.classList.toggle("is-open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });
  primaryMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    primaryMenu.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  }));

  const filtersToggle = document.querySelector(".filters-toggle");
  const filtersPanel = document.querySelector("#project-filters-panel");
  filtersToggle?.addEventListener("click", () => {
    const isOpen = filtersPanel?.classList.toggle("is-open") ?? false;
    filtersToggle.setAttribute("aria-expanded", String(isOpen));
  });

  const container = document.querySelector("[data-projects]");
  if (!container) return;

  const filtersBar = document.querySelector("[data-project-filters]");
  const carousel = document.querySelector("[data-project-carousel]");
  const prevButton = document.querySelector("[data-carousel-prev]");
  const nextButton = document.querySelector("[data-carousel-next]");

  const ALL = "Tous";
  let allProjects = [];
  let activeCategory = ALL;

  // Active/désactive les flèches selon la position de défilement (marge de 2 px).
  function updateCarouselButtons() {
    if (!carousel || !prevButton || !nextButton) return;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    prevButton.disabled = carousel.scrollLeft <= 2;
    nextButton.disabled = carousel.scrollLeft >= maxScroll - 2;
  }

  // Affiche les cartes de la catégorie active et revient au début du carrousel.
  function renderProjects() {
    const visible =
      activeCategory === ALL
        ? allProjects
        : allProjects.filter((project) => project.tags?.includes(activeCategory));

    const fragment = document.createDocumentFragment();
    visible.forEach((project) => fragment.appendChild(createProjectCard(project)));
    container.replaceChildren(fragment);

    carousel?.scrollTo({ left: 0, behavior: "instant" });
    requestAnimationFrame(updateCarouselButtons);
  }

  // Crée un bouton de filtre par catégorie (les catégories viennent des tags du JSON).
  function renderFilters() {
    if (!filtersBar) return;
    const categories = [ALL, ...new Set(allProjects.flatMap((project) => project.tags || []))];
    const fragment = document.createDocumentFragment();

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "project-filter";
      button.dataset.category = category;
      button.textContent = category;
      button.setAttribute("aria-pressed", String(category === activeCategory));
      fragment.appendChild(button);
    });
    filtersBar.replaceChildren(fragment);
  }

  // Un seul écouteur pour tous les boutons de filtre (délégation d'événements).
  filtersBar?.addEventListener("click", (event) => {
    const button = event.target.closest(".project-filter");
    if (!button) return;
    activeCategory = button.dataset.category;
    filtersBar.querySelectorAll(".project-filter").forEach((filter) => {
      filter.setAttribute("aria-pressed", String(filter === button));
    });
    renderProjects();
  });

  // Les flèches font défiler d'environ 82 % de la largeur visible.
  const scrollCarousel = (direction) =>
    carousel?.scrollBy({ left: direction * carousel.clientWidth * 0.82, behavior: "smooth" });
  prevButton?.addEventListener("click", () => scrollCarousel(-1));
  nextButton?.addEventListener("click", () => scrollCarousel(1));
  carousel?.addEventListener("scroll", updateCarouselButtons, { passive: true });
  window.addEventListener("resize", updateCarouselButtons);

  loadProjects()
    .then((projects) => {
      allProjects = projects;
      renderFilters();
      renderProjects();
    })
    .catch((error) => {
      console.error(error);
      container.innerHTML = "<p>Les projets sont momentanément indisponibles.</p>";
    });
}

/* ------------------------------------------------------------------
   4. OCÉAN — bulles interactives
   ------------------------------------------------------------------ */
function initBubbles() {
  const layer = document.querySelector(".bubble-layer");
  if (!layer) return;

  const BUBBLE_COUNT = 16;
  const POP_DURATION = 260; // ms — doit rester égal à la durée de @keyframes bubblePop

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < BUBBLE_COUNT; index += 1) {
    const bubble = document.createElement("button");
    bubble.className = "ocean-bubble";
    bubble.type = "button";
    // Les bulles sont décoratives : on les retire de l'ordre de tabulation
    // pour ne pas imposer 16 arrêts au clavier.
    bubble.tabIndex = -1;
    bubble.setAttribute("aria-label", "Faire éclater la bulle");

    // Chaque bulle reçoit ses propres paramètres, lus par l'animation CSS bubbleRise.
    bubble.style.setProperty("--bubble-left", `${rand(8, 92)}%`);
    bubble.style.setProperty("--bubble-size", `${rand(0.45, 2.35)}vw`);
    bubble.style.setProperty("--bubble-duration", `${rand(7, 23)}s`);
    bubble.style.setProperty("--bubble-delay", `${-rand(0, 20)}s`);
    bubble.style.setProperty("--bubble-drift", `${rand(-3, 3)}vw`);
    bubble.style.setProperty("--bubble-rise", `${rand(85, 130)}vh`);
    bubble.style.setProperty("--bubble-opacity", `${rand(0.35, 0.85)}`);
    fragment.appendChild(bubble);
  }
  layer.appendChild(fragment);

  // Un seul écouteur pour toutes les bulles : animation d'éclatement puis suppression.
  layer.addEventListener("click", (event) => {
    const bubble = event.target.closest(".ocean-bubble");
    if (!bubble || bubble.classList.contains("is-popped")) return;
    bubble.classList.add("is-popped");
    window.setTimeout(() => bubble.remove(), POP_DURATION);
  });
}

/* ------------------------------------------------------------------
   5. DÉMO RÉEL — vidéo et bouton de son
   ------------------------------------------------------------------ */
function initDemoVideo() {
  const video = document.querySelector(".demo-video");
  if (!video) return;

  // La vidéo ne joue (et ne consomme du processeur) que lorsqu'elle est visible.
  // Cela coupe aussi le son si elle a été activée puis quittée en défilant.
  onVisibilityChange(
    video,
    (visible) => {
      if (visible) video.play().catch(() => {}); // lecture refusée par le navigateur : on ignore
      else video.pause();
    },
    "100px"
  );

  const soundToggle = document.querySelector(".video-sound-toggle");
  soundToggle?.addEventListener("click", () => {
    video.muted = !video.muted;
    soundToggle.setAttribute("aria-pressed", String(!video.muted));
    soundToggle.setAttribute("aria-label", video.muted ? "Activer le son" : "Couper le son");
    soundToggle.textContent = video.muted ? "🔇" : "🔊";
  });
}

/* ------------------------------------------------------------------
   6. LOGICIELS — barres de progression animées à l'apparition
   ------------------------------------------------------------------ */
function initSkillMeters() {
  const meters = document.querySelectorAll(".software-list .progress-bar[data-value]");
  if (!meters.length) return;

  const DURATION = 900; // ms

  // Met à jour la barre (variable CSS) et la valeur lue par les lecteurs d'écran.
  const setValue = (meter, value) => {
    meter.setAttribute("aria-valuenow", String(Math.round(value)));
    meter.style.setProperty("--meter-progress", `${value}%`);
  };

  // Remplissage avec une courbe d'accélération "ease-out" cubique.
  function animate(meter) {
    const target = Number(meter.dataset.value) || 0;
    if (prefersReducedMotion()) {
      setValue(meter, target);
      return;
    }
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, Math.max(0, (now - startTime) / DURATION));
      setValue(meter, target * (1 - (1 - progress) ** 3));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Sans IntersectionObserver : on affiche directement les valeurs finales.
  if (!("IntersectionObserver" in window)) {
    meters.forEach((meter) => setValue(meter, Number(meter.dataset.value) || 0));
    return;
  }

  // Chaque barre s'anime une seule fois, quand elle atteint 85 % de la hauteur de l'écran.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target);
      });
    },
    { rootMargin: "0px 0px -15% 0px" }
  );
  meters.forEach((meter) => observer.observe(meter));
}

/* ------------------------------------------------------------------
   7. OCÉAN — ondes blanches qui suivent le curseur (canvas 2D)
   Dessinées sur leur propre canvas : le fond animé de l'océan n'est pas touché.
   ------------------------------------------------------------------ */
function initOceanWaves() {
  const section = document.querySelector(".sea-transition-section");
  const canvas = section?.querySelector(".ocean-fluid-canvas");
  if (!section || !canvas) return;

  // Effet réservé aux appareils avec souris/trackpad : les écrans tactiles
  // ignoraient déjà l'effet, inutile de leur allouer un très grand canvas.
  const hasMouse = window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;
  if (!hasMouse || prefersReducedMotion()) return;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) return;

  const MAX_WAVES = 180;
  const waves = [];
  let width = 1;
  let height = 1;
  let previous = null; // dernière position du curseur dans la section
  let rafId = 0;
  let lastFrame = 0;

  // Ajuste la résolution du canvas à la taille de la section (DPR plafonné à 1,5).
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, section.clientWidth);
    height = Math.max(1, section.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Crée trois anneaux concentriques ; la vitesse du curseur règle taille et opacité.
  function addWave(x, y, speed) {
    const intensity = Math.min(1, speed / 30);
    for (let i = 0; i < 3; i += 1) {
      waves.push({
        x,
        y,
        radius: 4 + i * (5 + intensity * 3),
        maxRadius: 48 + intensity * 125 + i * 18,
        age: i * 0.075,
        life: 0.75 + intensity * 0.45,
        alpha: 0.08 + intensity * 0.16,
        lineWidth: 0.7 + intensity * 1.1,
        ellipticity: 0.88 + Math.random() * 0.24,
      });
    }
    if (waves.length > MAX_WAVES) waves.splice(0, waves.length - MAX_WAVES);

    // La boucle ne tourne que tant qu'il reste des ondes à dessiner.
    if (!rafId) {
      lastFrame = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  }

  function draw(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    ctx.clearRect(0, 0, width, height);

    // Parcours à rebours pour pouvoir retirer les ondes terminées.
    for (let i = waves.length - 1; i >= 0; i -= 1) {
      const wave = waves[i];
      wave.age += dt;
      if (wave.age >= wave.life) {
        waves.splice(i, 1);
        continue;
      }

      const progress = wave.age / wave.life;
      const radius = wave.radius + (wave.maxRadius - wave.radius) * (1 - (1 - progress) ** 1.5);
      const alpha = wave.alpha * (1 - progress) ** 1.8;
      if (alpha < 0.006) continue; // trop transparente pour être visible

      ctx.save();
      ctx.translate(wave.x, wave.y);
      ctx.scale(1, wave.ellipticity);
      ctx.globalCompositeOperation = "screen";
      ctx.lineWidth = wave.lineWidth * (1 - progress * 0.35);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.shadowColor = `rgba(225,245,255,${alpha * 0.45})`;
      ctx.shadowBlur = 2 + alpha * 5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (waves.length) {
      rafId = requestAnimationFrame(draw);
    } else {
      rafId = 0;
      ctx.clearRect(0, 0, width, height);
    }
  }

  section.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (previous) {
        const distance = Math.hypot(x - previous.x, y - previous.y);
        if (distance > 2.5) addWave(x, y, distance); // ignore les micro-mouvements
      }
      previous = { x, y };
    },
    { passive: true }
  );
  section.addEventListener("pointerleave", () => (previous = null), { passive: true });

  new ResizeObserver(resize).observe(section);
  resize();
}

/* ------------------------------------------------------------------
   8. PERFORMANCE — met en pause les animations CSS des sections hors écran
   Les règles CSS de la classe .is-offscreen figent les animations (nuages,
   bulles, cartes, océan) ; le filtre SVG de l'eau est mis en pause à part.
   ------------------------------------------------------------------ */
function initOffscreenPause() {
  const waterFilter = document.querySelector(".water-filter-defs");

  const watch = (selector, onChange) => {
    const section = document.querySelector(selector);
    if (!section) return;
    onVisibilityChange(
      section,
      (visible) => {
        section.classList.toggle("is-offscreen", !visible);
        onChange?.(visible);
      },
      "150px" // marge : l'animation reprend un peu avant l'arrivée à l'écran
    );
  };

  watch(".cloud-plain-section");
  watch(".sea-transition-section", (visible) => {
    if (visible) waterFilter?.unpauseAnimations?.();
    else waterFilter?.pauseAnimations?.();
  });
}

/* ------------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------------ */
initHeroStars();
initCloudParallax();
initProjects();
initBubbles();
initDemoVideo();
initSkillMeters();
initOceanWaves();
initOffscreenPause();
