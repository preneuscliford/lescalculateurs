/**
 * Page "impact combiné" — Rupture conventionnelle 2026.
 * Combine deux moteurs de calcul existants (indemnité de licenciement +
 * ARE) à partir des mêmes informations utilisateur. Aucun des deux
 * organismes officiels (employeur / France Travail) ne calcule l'autre
 * dispositif : c'est le format que ce site est seul à pouvoir proposer.
 */

import {
  calculerIndemniteLicenciement,
  formatAnciennete,
  formatEuro as formatEuroIndemnite,
} from "../../utils/indemniteLicenciementCalculEngine";
import { calculerARE, type AREData } from "../../utils/areCalculEngine";

const form = document.getElementById("combo-form") as HTMLFormElement;
const resultDiv = document.getElementById("combo-result") as HTMLDivElement;
const scrollButton = document.getElementById("combo-scroll-to-form") as HTMLButtonElement;

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const entreeValue = (document.getElementById("combo-entree") as HTMLInputElement)?.value;
    const sortieValue = (document.getElementById("combo-sortie") as HTMLInputElement)?.value;
    const salaireValue = (document.getElementById("combo-salaire") as HTMLInputElement)?.value;
    const ageValue = (document.getElementById("combo-age") as HTMLInputElement)?.value;
    const situationValue = (document.getElementById("combo-situation") as HTMLSelectElement)
      ?.value as AREData["situation"] | "";

    if (!entreeValue || !sortieValue || !situationValue) {
      alert("Veuillez renseigner toutes les informations demandées");
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
    const age = parseInt(ageValue || "0", 10);

    // Calcul 1 : indemnité de départ (minimum légal)
    const indemniteResult = calculerIndemniteLicenciement({
      dateEntree,
      dateSortie,
      salaireMensuelBrutMoyen,
    });

    // Calcul 2 : allocation chômage. On réutilise l'ancienneté chez cet
    // employeur comme proxy de l'ancienneté d'affiliation (cas courant
    // d'un salarié en poste continu jusqu'à la rupture).
    const areResult = calculerARE({
      situation: situationValue,
      ancienneteEmploi: indemniteResult.ancienneteMois,
      salaireReferent: salaireMensuelBrutMoyen,
      personnesCharge: 0,
      agePersonne: age,
    });

    const indemniteDisplay = document.getElementById("combo-indemnite") as HTMLElement;
    const areDisplay = document.getElementById("combo-are") as HTMLElement;
    const totalDisplay = document.getElementById("combo-total") as HTMLElement;
    const dureeDisplay = document.getElementById("combo-duree") as HTMLElement;
    const explicationDisplay = document.getElementById("combo-explication") as HTMLElement;

    if (indemniteDisplay) {
      indemniteDisplay.textContent = indemniteResult.eligible
        ? formatEuroIndemnite(indemniteResult.montantTotal)
        : "Non éligible";
    }
    if (areDisplay) {
      areDisplay.textContent = areResult.eligible
        ? `${formatEuroIndemnite(areResult.montantEstime)} / mois`
        : "Non éligible";
    }

    const totalCombine =
      (indemniteResult.eligible ? indemniteResult.montantTotal : 0) +
      (areResult.eligible ? areResult.montantEstime * areResult.durationMax : 0);

    if (totalDisplay) totalDisplay.textContent = formatEuroIndemnite(totalCombine);
    if (dureeDisplay) {
      dureeDisplay.textContent = areResult.eligible
        ? `Indemnité versée une fois + ${areResult.durationMax} mois d'allocation chômage estimée`
        : "Indemnité seule (droits chômage non ouverts avec ces informations)";
    }

    if (explicationDisplay) {
      const anciennete = formatAnciennete(indemniteResult.ancienneteMois);
      explicationDisplay.textContent = `Avec ${anciennete} d'ancienneté, vous toucheriez d'abord l'indemnité de départ, puis l'allocation chômage mensuelle si vos droits sont ouverts. Ces deux montants viennent de calculs indépendants : le total est une addition, pas un troisième calcul officiel.`;
    }

    const detailsDiv = document.getElementById("combo-details");
    const detailsContent = document.getElementById("combo-details-content");
    if (detailsDiv && detailsContent) {
      const lines = [
        `• Indemnité de départ : ${indemniteResult.eligible ? formatEuroIndemnite(indemniteResult.montantTotal) : "non éligible (< 8 mois d'ancienneté)"}`,
        `• Allocation chômage mensuelle : ${areResult.eligible ? formatEuroIndemnite(areResult.montantEstime) : "non éligible"}`,
        areResult.eligible ? `• Durée maximale estimée des droits : ${areResult.durationMax} mois` : null,
        `• = Total combiné estimé : ${formatEuroIndemnite(totalCombine)}`,
      ].filter((l): l is string => l !== null);
      detailsContent.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
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
