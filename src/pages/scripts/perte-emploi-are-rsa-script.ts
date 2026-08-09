/**
 * Page "impact combiné" — Perte d'emploi : ARE puis RSA.
 * Contrairement à la page rupture-conventionnelle (addition de deux
 * calculs indépendants), ici le résultat du premier moteur (ARE) est
 * injecté comme ressource dans le second (RSA), pour refléter la vraie
 * règle de subsidiarité : l'ARE réduit ou annule le RSA.
 */

import { calculerARE, type AREData } from "../../utils/areCalculEngine";
import { calculerRSA, type RSACalculData } from "../../utils/rsaCalculEngine";

const form = document.getElementById("combo-form") as HTMLFormElement;
const resultDiv = document.getElementById("combo-result") as HTMLDivElement;
const scrollButton = document.getElementById("combo-scroll-to-form") as HTMLButtonElement;

function formatEuro(value: number): string {
  return (
    value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const anciennete = parseInt((document.getElementById("combo-anciennete") as HTMLInputElement)?.value || "0", 10);
    const salaire = parseFloat((document.getElementById("combo-salaire") as HTMLInputElement)?.value || "0");
    const age = parseInt((document.getElementById("combo-age") as HTMLInputElement)?.value || "0", 10);
    const situation = (document.getElementById("combo-situation") as HTMLSelectElement)?.value as
      | AREData["situation"]
      | "";
    const enfants = parseInt((document.getElementById("combo-enfants") as HTMLInputElement)?.value || "0", 10);
    const logement = (document.getElementById("combo-logement") as HTMLSelectElement)?.value;

    if (!situation || !logement) {
      alert("Veuillez renseigner toutes les informations demandées");
      return;
    }

    // Calcul 1 : ARE
    const areResult = calculerARE({
      situation,
      ancienneteEmploi: anciennete,
      salaireReferent: salaire,
      personnesCharge: enfants,
      agePersonne: age,
    });

    // Calcul 2 : RSA, avec l'ARE comme ressource. L'ARE n'est pas un
    // revenu d'activité : pas d'abattement favorable (activite="inactif").
    const rsaData: RSACalculData = {
      situation,
      enfants,
      revenus: areResult.eligible ? areResult.montantEstime : 0,
      logement,
      activite: "inactif",
    };
    const rsaResult = calculerRSA(rsaData);

    const areDisplay = document.getElementById("combo-are") as HTMLElement;
    const rsaDisplay = document.getElementById("combo-rsa") as HTMLElement;
    const totalDisplay = document.getElementById("combo-total") as HTMLElement;
    const explicationDisplay = document.getElementById("combo-explication") as HTMLElement;

    if (areDisplay) {
      areDisplay.textContent = areResult.eligible ? `${formatEuro(areResult.montantEstime)} / mois` : "Non éligible";
    }
    if (rsaDisplay) {
      rsaDisplay.textContent = rsaResult.success ? `${formatEuro(rsaResult.montantEstime)} / mois` : "---";
    }

    const totalMensuel = (areResult.eligible ? areResult.montantEstime : 0) + (rsaResult.success ? rsaResult.montantEstime : 0);
    if (totalDisplay) totalDisplay.textContent = `${formatEuro(totalMensuel)} / mois`;

    if (explicationDisplay) {
      if (areResult.eligible && rsaResult.montantEstime === 0) {
        explicationDisplay.textContent = `Votre ARE estimée (${formatEuro(areResult.montantEstime)}/mois) dépasse le RSA calculé pour votre foyer : le RSA est donc réduit à zéro. Votre revenu mensuel réel correspond à l'ARE seule.`;
      } else if (areResult.eligible && rsaResult.montantEstime > 0) {
        explicationDisplay.textContent = `Votre ARE (${formatEuro(areResult.montantEstime)}/mois) est inférieure au RSA de référence pour votre foyer : un complément RSA de ${formatEuro(rsaResult.montantEstime)} vient s'ajouter.`;
      } else {
        explicationDisplay.textContent = `Sans droits ARE ouverts avec ces informations, seul le RSA est calculé sur vos ressources déclarées.`;
      }
    }

    const detailsDiv = document.getElementById("combo-details");
    const detailsContent = document.getElementById("combo-details-content");
    if (detailsDiv && detailsContent) {
      const lines = [
        `• ARE mensuelle : ${areResult.eligible ? formatEuro(areResult.montantEstime) : "non éligible"}`,
        `• RSA recalculé avec l'ARE comme ressource : ${rsaResult.success ? formatEuro(rsaResult.montantEstime) : "---"}`,
        `• = Revenu mensuel réel combiné : ${formatEuro(totalMensuel)}`,
      ];
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
