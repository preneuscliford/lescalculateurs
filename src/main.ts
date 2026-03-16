import "./tailwind.css";
import { initializeScrollButtons } from "./utils/scrollButtons";
import { initializeVercelAnalytics } from "./utils/vercelAnalytics";

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
