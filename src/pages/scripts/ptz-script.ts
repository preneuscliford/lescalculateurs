/**
 * Vérification d'éligibilité PTZ — Form Handler (2026)
 */

import {
  verifierEligibilitePTZ,
  formatPTZEligibiliteResult,
  type PTZEligibiliteData,
  type ZonePTZ,
} from "../../utils/ptzEligibiliteCalculEngine";

const form = document.getElementById("ptz-form") as HTMLFormElement;
const resultDiv = document.getElementById("ptz-result") as HTMLDivElement;
const scrollButton = document.getElementById("ptz-scroll-to-form") as HTMLButtonElement;

function applyPrefillFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  const zone = params.get("ptz-zone");
  const personnes = params.get("ptz-personnes");
  const rfr = params.get("ptz-rfr");
  const autoSubmit = params.get("ptz-autosubmit") === "1";

  const zoneInput = document.getElementById("ptz-zone") as HTMLSelectElement | null;
  const personnesInput = document.getElementById("ptz-personnes") as HTMLInputElement | null;
  const rfrInput = document.getElementById("ptz-rfr") as HTMLInputElement | null;

  if (zone && zoneInput) zoneInput.value = zone;
  if (personnes && personnesInput) personnesInput.value = personnes;
  if (rfr && rfrInput) rfrInput.value = rfr;

  if (autoSubmit && form) {
    requestAnimationFrame(() => {
      form.requestSubmit();
    });
  }
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const zone = (document.getElementById("ptz-zone") as HTMLSelectElement)?.value as ZonePTZ | "";
    const nombrePersonnes = parseInt((document.getElementById("ptz-personnes") as HTMLInputElement)?.value || "0", 10);
    const revenuFiscalReference = parseFloat((document.getElementById("ptz-rfr") as HTMLInputElement)?.value || "0");

    if (!zone) {
      alert("Veuillez sélectionner votre zone");
      return;
    }

    const data: PTZEligibiliteData = { zone, nombrePersonnes, revenuFiscalReference };
    const result = verifierEligibilitePTZ(data);
    const formatted = formatPTZEligibiliteResult(result);

    const statutDisplay = document.getElementById("ptz-statut") as HTMLElement;
    const explicationDisplay = document.getElementById("ptz-explication") as HTMLElement;

    if (statutDisplay) {
      statutDisplay.textContent = formatted.statutDisplay;
      statutDisplay.className = result.eligible
        ? "text-3xl font-bold text-emerald-600"
        : "text-3xl font-bold text-rose-600";
    }
    if (explicationDisplay) explicationDisplay.textContent = formatted.explicationDisplay;

    const detailsDiv = document.getElementById("ptz-details");
    const detailsContent = document.getElementById("ptz-details-content");
    if (detailsDiv && detailsContent) {
      detailsContent.innerHTML = formatted.detailsDisplay
        .split("\n")
        .map((line) => `<div>${line}</div>`)
        .join("");
      detailsDiv.classList.remove("hidden");
    }

    resultDiv.classList.remove("invisible");
    resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (scrollButton) {
  scrollButton.addEventListener("click", () => {
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

applyPrefillFromUrl();
