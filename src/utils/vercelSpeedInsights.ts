import { injectSpeedInsights } from "@vercel/speed-insights";

declare global {
  interface Window {
    __lcVercelSpeedInsightsInjected?: boolean;
  }
}

export function initializeVercelSpeedInsights() {
  if (typeof window === "undefined") return;
  if (window.__lcVercelSpeedInsightsInjected) return;

  const loadSpeedInsights = () => {
    if (window.__lcVercelSpeedInsightsInjected) return;
    injectSpeedInsights();
    window.__lcVercelSpeedInsightsInjected = true;
  };

  const schedule = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadSpeedInsights, { timeout: 2500 });
      return;
    }

    globalThis.setTimeout(loadSpeedInsights, 2500);
  };

  if (document.readyState === "complete") {
    schedule();
    return;
  }

  window.addEventListener("load", schedule, { once: true });
}
