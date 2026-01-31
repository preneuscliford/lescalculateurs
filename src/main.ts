import "./tailwind.css";
import { initializeScrollButtons } from "./utils/scrollButtons";

// Simple routing for SPA-like navigation (optional)
export function initializeApp() {
  // Add any global initialization logic here

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
