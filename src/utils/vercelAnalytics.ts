import { inject } from "@vercel/analytics";

declare global {
  interface Window {
    __lcVercelAnalyticsInjected?: boolean;
  }
}

export function initializeVercelAnalytics() {
  if (typeof window === "undefined") return;
  if (window.__lcVercelAnalyticsInjected) return;

  inject();
  window.__lcVercelAnalyticsInjected = true;
}
