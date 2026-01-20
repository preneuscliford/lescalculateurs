import {
  calculerPrimeActivite,
  formatPrimeActiviteResult,
} from "../../utils/primeActiviteCalculEngine";

/**
 * Script de gestion du calculateur Prime d'activité
 */

// Éléments du formulaire
const form = document.getElementById("prime-form") as HTMLFormElement;
const situationSelect = document.getElementById(
  "prime-situation",
) as HTMLSelectElement;
const enfantsInput = document.getElementById(
  "prime-enfants",
) as HTMLInputElement;
const revenosProfInput = document.getElementById(
  "prime-revenus-pro",
) as HTMLInputElement;
const autresRevenusInput = document.getElementById(
  "prime-autres-revenus",
) as HTMLInputElement;
const logementSelect = document.getElementById(
  "prime-logement",
) as HTMLSelectElement;
const typeActiviteSelect = document.getElementById(
  "prime-type-activite",
) as HTMLSelectElement;

// Éléments de résultat
const resultDiv = document.getElementById("prime-result") as HTMLDivElement;
const montantDisplay = document.getElementById("prime-montant") as HTMLElement;
const explDisplay = document.getElementById("prime-explication") as HTMLElement;

// Bouton de scroll
const scrollButton = document.getElementById(
  "prime-scroll-to-form",
) as HTMLButtonElement;

/**
 * Gestion du formulaire
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    situation: situationSelect.value,
    enfants: parseInt(enfantsInput.value) || 0,
    revenusProf: parseInt(revenosProfInput.value) || 0,
    autresRevenus: parseInt(autresRevenusInput.value) || 0,
    logement: logementSelect.value,
    typeActivite: typeActiviteSelect.value,
  };

  // Calcul
  const result = calculerPrimeActivite(data);

  // Affichage des résultats
  if (result.success) {
    const formatted = formatPrimeActiviteResult(result);
    montantDisplay.textContent = formatted.montantDisplay;
    explDisplay.textContent = formatted.explDisplay;

    // Affichage du bloc résultat
    resultDiv.classList.remove("hidden");
    resultDiv.scrollIntoView({ behavior: "smooth" });

    // Dispatch événement personnalisé pour suivi
    window.dispatchEvent(
      new CustomEvent("prime-activite-calculated", {
        detail: result,
      }),
    );
  }
});

/**
 * Bouton de scroll vers le formulaire
 */
if (scrollButton) {
  scrollButton.addEventListener("click", () => {
    form.scrollIntoView({ behavior: "smooth" });
    situationSelect.focus();
  });
}

/**
 * Masquer le résultat quand on modifie le formulaire
 */
[
  situationSelect,
  enfantsInput,
  revenosProfInput,
  autresRevenusInput,
  logementSelect,
  typeActiviteSelect,
].forEach((elem) => {
  elem.addEventListener("change", () => {
    resultDiv.classList.add("hidden");
  });
});
