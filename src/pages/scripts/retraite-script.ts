/**
 * Simulateur âge de départ à la retraite — Form Handler (2026)
 */

import {
  calculerAgeLegalRetraite,
  formatRetraiteResult,
  type RetraiteData,
} from "../../utils/retraiteCalculEngine";

const form = document.getElementById("retraite-form") as HTMLFormElement;
const resultDiv = document.getElementById("retraite-result") as HTMLDivElement;
const scrollButton = document.getElementById("retraite-scroll-to-form") as HTMLButtonElement;

function readNumberParam(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function applyPrefillFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  const naissance = params.get("retraite-naissance");
  const trimestres = readNumberParam(params, "retraite-trimestres");
  const autoSubmit = params.get("retraite-autosubmit") === "1";

  const naissanceInput = document.getElementById("retraite-naissance") as HTMLInputElement | null;
  const trimestresInput = document.getElementById(
    "retraite-trimestres",
  ) as HTMLInputElement | null;

  if (naissance && naissanceInput) naissanceInput.value = naissance;
  if (trimestres !== null && trimestresInput) trimestresInput.value = String(trimestres);

  if (autoSubmit && form) {
    requestAnimationFrame(() => {
      form.requestSubmit();
    });
  }
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const naissanceValue = (document.getElementById("retraite-naissance") as HTMLInputElement)
      ?.value;
    const trimestresValue = (document.getElementById("retraite-trimestres") as HTMLInputElement)
      ?.value;

    if (!naissanceValue) {
      alert("Veuillez renseigner votre date de naissance");
      return;
    }

    const dateNaissance = new Date(`${naissanceValue}T00:00:00Z`);
    if (Number.isNaN(dateNaissance.getTime())) {
      alert("Date de naissance invalide");
      return;
    }

    const trimestresValides =
      trimestresValue && trimestresValue.trim() !== "" ? parseInt(trimestresValue, 10) : null;

    const data: RetraiteData = {
      dateNaissance,
      trimestresValides,
    };

    const result = calculerAgeLegalRetraite(data);
    const formatted = formatRetraiteResult(result);

    const ageDisplay = document.getElementById("retraite-age") as HTMLElement;
    const dateAgeDisplay = document.getElementById("retraite-date-age") as HTMLElement;
    const explicationDisplay = document.getElementById("retraite-explication") as HTMLElement;

    if (ageDisplay) {
      ageDisplay.textContent = formatted.ageLegalDisplay;
    }
    if (dateAgeDisplay) {
      dateAgeDisplay.textContent = `Soit le ${formatted.dateAgeLegalDisplay}`;
    }
    if (explicationDisplay) {
      explicationDisplay.textContent = formatted.statutTrimestresDisplay;
    }

    const detailsDiv = document.getElementById("retraite-details");
    const detailsContent = document.getElementById("retraite-details-content");
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
