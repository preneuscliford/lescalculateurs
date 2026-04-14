import { injectSpeedInsights } from "@vercel/speed-insights";

declare global {
  interface Window {
    __lcVercelSpeedInsightsInjected?: boolean;
  }
}

export function initializeVercelSpeedInsights() {
  if (typeof window === "undefined") return;
  if (window.__lcVercelSpeedInsightsInjected) return;

  injectSpeedInsights();
  window.__lcVercelSpeedInsightsInjected = true;
}
