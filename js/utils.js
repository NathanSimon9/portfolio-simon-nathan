/* Fonctions utilitaires partagées par la page d'accueil et la page projet. */

// Table de correspondance pour neutraliser les caractères spéciaux du HTML.
const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/**
 * Échappe une valeur avant de l'insérer dans un gabarit HTML (innerHTML).
 * Protège contre les caractères qui casseraient le balisage (guillemets, chevrons…).
 */
export const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);

/** Vrai si la personne demande de réduire les animations dans son système. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Appelle `callback(true | false)` quand un élément entre ou sort de l'écran.
 * Sert à mettre en pause les animations coûteuses (canvas, vidéo, CSS) hors champ.
 * Sans IntersectionObserver (très vieux navigateurs), l'élément est considéré visible.
 */
export function onVisibilityChange(element, callback, rootMargin = "0px") {
  if (!("IntersectionObserver" in window)) {
    callback(true);
    return;
  }
  const observer = new IntersectionObserver(
    // Si plusieurs changements arrivent d'un coup, seul le dernier compte.
    (entries) => callback(entries[entries.length - 1].isIntersecting),
    { rootMargin }
  );
  observer.observe(element);
}
