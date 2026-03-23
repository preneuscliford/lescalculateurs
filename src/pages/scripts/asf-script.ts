/**
 * ASF (Allocation de Soutien Familial) Form Handler - 2026
 * Single parent and orphan support
 */

import { calculerASF, type ASFData } from "../../utils/asfCalculEngine";

const form = document.getElementById("asf-form") as HTMLFormElement;
const resultDiv = document.getElementById("asf-result") as HTMLDivElement;
const scrollButton = document.getElementById(
  "asf-scroll-to-form",
) as HTMLButtonElement;

function readNumberParam(params: URLSearchParams, key: string, fallback = 0): number {
  const value = Number(params.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

function applyPrefillFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  const situation = params.get("asf-situation");
  const enfants = readNumberParam(params, "asf-enfants", 1);
  const revenus = readNumberParam(params, "asf-revenus", 0);
  const autoSubmit = params.get("asf-autosubmit") === "1";

  const situationInput = document.getElementById("asf-situation") as HTMLSelectElement | null;
  const enfantsInput = document.getElementById("asf-enfants") as HTMLInputElement | null;
  const revenusInput = document.getElementById("asf-revenus") as HTMLInputElement | null;

  if (situation && situationInput) situationInput.value = situation;
  if (enfantsInput) enfantsInput.value = String(enfants);
  if (revenusInput) revenusInput.value = String(revenus);

  if (autoSubmit && form) {
    requestAnimationFrame(() => {
      form.requestSubmit();
    });
  }
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const situation = (
      document.getElementById("asf-situation") as HTMLSelectElement
    )?.value;
    const nombreEnfants = parseInt(
      (document.getElementById("asf-enfants") as HTMLInputElement)?.value ||
        "0",
    );
    const revenus = parseFloat(
      (document.getElementById("asf-revenus") as HTMLInputElement)?.value ||
        "0",
    );
    const enfantACharge = nombreEnfants > 0;

    if (!situation) {
      alert("Veuillez sélectionner votre situation familiale");
      return;
    }

    const data: ASFData = {
      situation: situation as "parentisole" | "orphelin" | "depourvu",
      nombreEnfants,
      revenus,
      enfantACharge,
    };

    const result = calculerASF(data);

    const montantDisplay = document.getElementById(
      "asf-montant",
    ) as HTMLElement;
    const explicationDisplay = document.getElementById(
      "asf-explication",
    ) as HTMLElement;

    if (montantDisplay) {
      montantDisplay.textContent = result.eligible
        ? `${result.montantEstime.toFixed(2)}€/mois`
        : "---";
    }
    if (explicationDisplay) {
      explicationDisplay.textContent = result.explication;
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
