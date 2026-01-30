/**
 * Attache des handlers de scroll aux éléments ayant `data-scroll-target`.
 * Optionnellement, donne le focus au premier champ trouvé pour accélérer la saisie.
 */
export function initializeScrollButtons(): void {
  const scrollTriggers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-scroll-target]"),
  );

  for (const trigger of scrollTriggers) {
    const targetSelector = trigger.getAttribute("data-scroll-target");
    if (!targetSelector) continue;

    const focusSelector =
      trigger.getAttribute("data-scroll-focus") ??
      "input, select, textarea, button";

    trigger.addEventListener("click", (event) => {
      event.preventDefault();

      const target = document.querySelector<HTMLElement>(targetSelector);
      if (!target) return;

      scrollIntoViewAndFocus(target, focusSelector);
    });
  }
}

/**
 * Scroll vers un élément, puis tente de donner le focus à un champ à l’intérieur.
 * Réessaie brièvement si le contenu est rendu après coup (ex: injection JS).
 */
function scrollIntoViewAndFocus(target: HTMLElement, focusSelector: string): void {
  target.scrollIntoView({ behavior: "smooth", block: "start" });

  const attemptFocus = (): boolean => {
    const focusable = target.querySelector<HTMLElement>(focusSelector);
    if (focusable) {
      focusable.focus();
      return true;
    }
    return false;
  };

  if (attemptFocus()) return;

  let attempts = 0;
  const maxAttempts = 12;
  const intervalMs = 120;

  const interval = window.setInterval(() => {
    attempts += 1;
    if (attemptFocus() || attempts >= maxAttempts) {
      window.clearInterval(interval);
    }
  }, intervalMs);
}

