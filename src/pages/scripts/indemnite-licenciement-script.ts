/**
 * Simulateur indemnité de licenciement — Form Handler (2026)
 */

import {
  calculerIndemniteLicenciement,
  formatIndemniteLicenciementResult,
  type IndemniteLicenciementData,
} from "../../utils/indemniteLicenciementCalculEngine";

const form = document.getElementById("indemnite-form") as HTMLFormElement;
const resultDiv = document.getElementById("indemnite-result") as HTMLDivElement;
const scrollButton = document.getElementById("indemnite-scroll-to-form") as HTMLButtonElement;

function applyPrefillFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  const entree = params.get("indemnite-entree");
  const sortie = params.get("indemnite-sortie");
  const salaire = params.get("indemnite-salaire");
  const autoSubmit = params.get("indemnite-autosubmit") === "1";

  const entreeInput = document.getElementById("indemnite-entree") as HTMLInputElement | null;
  const sortieInput = document.getElementById("indemnite-sortie") as HTMLInputElement | null;
  const salaireInput = document.getElementById("indemnite-salaire") as HTMLInputElement | null;

  if (entree && entreeInput) entreeInput.value = entree;
  if (sortie && sortieInput) sortieInput.value = sortie;
  if (salaire && salaireInput) salaireInput.value = salaire;

  if (autoSubmit && form) {
    requestAnimationFrame(() => {
      form.requestSubmit();
    });
  }
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const entreeValue = (document.getElementById("indemnite-entree") as HTMLInputElement)?.value;
    const sortieValue = (document.getElementById("indemnite-sortie") as HTMLInputElement)?.value;
    const salaireValue = (document.getElementById("indemnite-salaire") as HTMLInputElement)?.value;

    if (!entreeValue || !sortieValue) {
      alert("Veuillez renseigner vos dates d'entrée et de sortie");
      return;
    }

    const dateEntree = new Date(`${entreeValue}T00:00:00Z`);
    const dateSortie = new Date(`${sortieValue}T00:00:00Z`);
    if (Number.isNaN(dateEntree.getTime()) || Number.isNaN(dateSortie.getTime())) {
      alert("Dates invalides");
      return;
    }
    if (dateSortie <= dateEntree) {
      alert("La date de fin doit être postérieure à la date d'entrée");
      return;
    }

    const salaireMensuelBrutMoyen = parseFloat(salaireValue || "0");

    const data: IndemniteLicenciementData = {
      dateEntree,
      dateSortie,
      salaireMensuelBrutMoyen,
    };

    const result = calculerIndemniteLicenciement(data);
    const formatted = formatIndemniteLicenciementResult(result);

    const montantDisplay = document.getElementById("indemnite-montant") as HTMLElement;
    const explicationDisplay = document.getElementById("indemnite-explication") as HTMLElement;

    if (montantDisplay) montantDisplay.textContent = formatted.montantDisplay;
    if (explicationDisplay) explicationDisplay.textContent = formatted.explicationDisplay;

    const detailsDiv = document.getElementById("indemnite-details");
    const detailsContent = document.getElementById("indemnite-details-content");
    if (detailsDiv && detailsContent) {
      if (formatted.detailsDisplay) {
        detailsContent.innerHTML = formatted.detailsDisplay
          .split("\n")
          .map((line) => `<div>${line}</div>`)
          .join("");
        detailsDiv.classList.remove("hidden");
      } else {
        detailsDiv.classList.add("hidden");
      }
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
