import { inject } from "@vercel/analytics";

declare global {
  interface Window {
    __lcVercelAnalyticsInjected?: boolean;
  }
}

export function initializeVercelAnalytics() {
  if (typeof window === "undefined") return;
  if (window.__lcVercelAnalyticsInjected) return;

  const loadAnalytics = () => {
    if (window.__lcVercelAnalyticsInjected) return;
    inject();
    window.__lcVercelAnalyticsInjected = true;
  };

  const schedule = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 2500 });
      return;
    }

    globalThis.setTimeout(loadAnalytics, 2500);
  };

  if (document.readyState === "complete") {
    schedule();
    return;
  }

  window.addEventListener("load", schedule, { once: true });
}
