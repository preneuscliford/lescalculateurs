import "./tailwind.css";
import { initializeScrollButtons } from "./utils/scrollButtons";
import { initializeVercelAnalytics } from "./utils/vercelAnalytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function trackGaEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

function getPageContext() {
  const body = document.body;
  return {
    page_path: window.location.pathname || "/",
    page_type: body?.dataset?.lcPageType || "hub",
    page_cluster: body?.dataset?.lcPageCluster || "global",
    page_slug: body?.dataset?.lcPageSlug || "",
  };
}

function normalizeText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizePath(href: string) {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return "";
  }
}

function initializeJourneyTracking() {
  let calculatorStartSent = false;
  let resultViewSent = false;
  const page = getPageContext();

  const sendCalculatorStart = (source: string, ctaText: string) => {
    if (calculatorStartSent) return;
    calculatorStartSent = true;
    trackGaEvent("calculator_start", {
      ...page,
      source,
      cta_text: normalizeText(ctaText).slice(0, 120),
    });
  };

  const journeySectionRegex =
    /pages utiles|aides proches|scenarios proches|scénarios proches|pont|etape suivante|étape suivante|aller plus loin|cas utiles|comparer/i;

  const isJourneyLink = (anchor: HTMLAnchorElement) => {
    const href = anchor.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return false;
    const toPath = normalizePath(href);
    if (!toPath.startsWith("/")) return false;
    const sectionHeading = anchor
      .closest("section, article, aside, nav, div")
      ?.querySelector("h2, h3, [data-lc-section-title]");
    const headingText = normalizeText(sectionHeading?.textContent);
    if (journeySectionRegex.test(headingText)) return true;
    return toPath.startsWith("/pages/");
  };

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const actionEl = target.closest("button, a, [role='button'], input[type='submit']") as
      | HTMLElement
      | null;
    if (actionEl) {
      const actionText = normalizeText(
        actionEl.textContent || actionEl.getAttribute("aria-label") || actionEl.getAttribute("value"),
      ).toLowerCase();
      if (/(calculer|simuler|estimer|lancer|obtenir|comparer ma situation)/i.test(actionText)) {
        sendCalculatorStart("click", actionText);
      }
    }

    const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
    if (!anchor || !isJourneyLink(anchor)) return;

    const href = anchor.getAttribute("href") || "";
    trackGaEvent("next_page_click", {
      ...page,
      to_path: normalizePath(href),
      link_text: normalizeText(anchor.textContent).slice(0, 120),
    });
  });

  document.addEventListener("submit", () => {
    sendCalculatorStart("form_submit", "submit");
  });

  const hasVisibleResult = () => {
    const candidates = document.querySelectorAll<HTMLElement>(
      "[id*='result'], [class*='result'], .resultat, .results, [data-lc-result]",
    );
    for (const node of candidates) {
      const text = normalizeText(node.textContent);
      if (!text) continue;
      if (node.offsetParent === null) continue;
      if (/(€|eur|montant|estimation|resultat|résultat|vous pouvez toucher)/i.test(text)) return true;
    }
    return false;
  };

  const trySendResultView = () => {
    if (resultViewSent) return;
    if (!hasVisibleResult()) return;
    resultViewSent = true;
    trackGaEvent("calculator_result_view", page);
  };

  const observer = new MutationObserver(() => {
    trySendResultView();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });

  window.setTimeout(trySendResultView, 1200);
}

function ensureGlobalFavicons() {
  const existingIcon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
  if (existingIcon) return;

  const icons: Array<{ rel: string; href: string; sizes?: string; type?: string }> = [
    { rel: "apple-touch-icon", href: "/assets/apple-touch-icon.png", sizes: "180x180" },
    { rel: "icon", href: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", href: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { rel: "manifest", href: "/assets/site.webmanifest" },
    { rel: "shortcut icon", href: "/assets/favicon.ico" },
  ];

  icons.forEach((icon) => {
    const link = document.createElement("link");
    link.rel = icon.rel;
    link.href = icon.href;
    if (icon.sizes) link.sizes = icon.sizes;
    if (icon.type) link.type = icon.type;
    document.head.appendChild(link);
  });
}

function normalizeBrandLockups() {
  const selectors = [
    'a[href="/"]',
    'a[href="/index.html"]',
    'a[href="./index.html"]',
    'a[href="../index.html"]',
    'a[href="index.html"]',
  ];

  document.querySelectorAll<HTMLAnchorElement>(selectors.join(", ")).forEach((anchor) => {
    const text = (anchor.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    const isBrandText = text.includes("les calculateurs") || text.includes("lescalculateurs");

    if (!isBrandText) return;
    if (anchor.querySelector('img[src*="lescalculateurs-new-logo.png"]')) return;

    anchor.classList.add("inline-flex", "items-center", "gap-2", "font-bold", "text-gray-900");
    anchor.innerHTML =
      '<img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs.fr" class="h-8 w-auto" width="160" height="64" loading="eager" decoding="async"><span class="whitespace-nowrap">Les Calculateurs</span>';
  });
}

// Simple routing for SPA-like navigation (optional)
export function initializeApp() {
  // Add any global initialization logic here
  initializeVercelAnalytics();
  ensureGlobalFavicons();
  normalizeBrandLockups();
  initializeJourneyTracking();

  // Initialize show more functionality
  initializeShowMore();

  // Initialize scroll-to-simulator buttons
  initializeScrollButtons();
}

// Initialize show more/less functionality for calculators
function initializeShowMore() {
  const showMoreBtn = document.getElementById("show-more-btn");
  const showLessBtn = document.getElementById("show-less-btn");
  const moreCalculators = document.getElementById("more-calculators");

  if (showMoreBtn && showLessBtn && moreCalculators) {
    showMoreBtn.addEventListener("click", () => {
      moreCalculators.style.display = "grid";
      showMoreBtn.style.display = "none";
      showLessBtn.style.display = "inline-block";

      // Smooth scroll to the new content
      moreCalculators.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    showLessBtn.addEventListener("click", () => {
      moreCalculators.style.display = "none";
      showMoreBtn.style.display = "inline-block";
      showLessBtn.style.display = "none";

      // Scroll back to the button
      showMoreBtn.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Utility function to format percentage
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Initialize app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
