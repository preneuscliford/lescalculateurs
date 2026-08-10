/**
 * Microsoft Clarity (heatmaps + enregistrements de session) - RGPD-safe :
 * ne s'initialise que lorsque le Consent Mode Google (analytics_storage)
 * passe a "granted", en observant directement window.dataLayer plutot que
 * de dupliquer la logique de consentement (CMP Google Funding Choices)
 * deja geree par public/third-party-loader.js. Fonctionne quelle que soit
 * la source du consentement (CMP Google actuelle ou future UI maison).
 */

import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = "y0c0dfsoww";

declare global {
  interface Window {
    dataLayer?: unknown[];
    __lcClarityInitialized?: boolean;
  }
}

function isAnalyticsGrantedEntry(entry: unknown): boolean {
  if (!entry || typeof entry !== "object") return false;
  const e = entry as Record<number, unknown>;
  if (e[0] !== "consent") return false;
  if (e[1] !== "update" && e[1] !== "default") return false;
  const params = e[2] as Record<string, string> | undefined;
  return !!params && params.analytics_storage === "granted";
}

function initClarityOnce() {
  if (window.__lcClarityInitialized) return;
  if (!CLARITY_PROJECT_ID) return;
  window.__lcClarityInitialized = true;
  Clarity.init(CLARITY_PROJECT_ID);
}

export function initializeClarity() {
  if (typeof window === "undefined") return;
  if (!CLARITY_PROJECT_ID) return;

  window.dataLayer = window.dataLayer || [];
  const dataLayer = window.dataLayer;

  // Le consentement a peut-etre deja ete resolu avant le chargement de ce module.
  for (const entry of dataLayer) {
    if (isAnalyticsGrantedEntry(entry)) {
      initClarityOnce();
      return;
    }
  }

  const originalPush = dataLayer.push.bind(dataLayer);
  dataLayer.push = ((...items: unknown[]) => {
    if (!window.__lcClarityInitialized) {
      for (const item of items) {
        if (isAnalyticsGrantedEntry(item)) {
          initClarityOnce();
          break;
        }
      }
    }
    return originalPush(...items);
  }) as typeof dataLayer.push;
}
