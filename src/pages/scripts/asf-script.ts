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

    resultDiv.classList.remove("hidden");
    resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (scrollButton) {
  scrollButton.addEventListener("click", () => {
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
