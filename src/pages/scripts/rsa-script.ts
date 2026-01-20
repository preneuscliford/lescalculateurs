import { calculerRSA, formatRSAResult } from "../../utils/rsaCalculEngine";

/**
 * Script de gestion du calculateur RSA
 */

// Éléments du formulaire
const form = document.getElementById("rsa-form") as HTMLFormElement;
const situationSelect = document.getElementById(
  "rsa-situation",
) as HTMLSelectElement;
const enfantsInput = document.getElementById("rsa-enfants") as HTMLInputElement;
const revenusInput = document.getElementById("rsa-revenus") as HTMLInputElement;
const logementSelect = document.getElementById(
  "rsa-logement",
) as HTMLSelectElement;
const activiteSelect = document.getElementById(
  "rsa-activite",
) as HTMLSelectElement;

// Éléments de résultat
const resultDiv = document.getElementById("rsa-result") as HTMLDivElement;
const montantDisplay = document.getElementById("rsa-montant") as HTMLElement;
const explDisplay = document.getElementById("rsa-explication") as HTMLElement;

// Bouton de scroll
const scrollButton = document.getElementById(
  "rsa-scroll-to-form",
) as HTMLButtonElement;

/**
 * Gestion du formulaire
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    situation: situationSelect.value,
    enfants: parseInt(enfantsInput.value) || 0,
    revenus: parseInt(revenusInput.value) || 0,
    logement: logementSelect.value,
    activite: activiteSelect.value,
  };

  // Calcul
  const result = calculerRSA(data);

  // Affichage des résultats
  if (result.success) {
    const formatted = formatRSAResult(result);
    montantDisplay.textContent = formatted.montantDisplay;
    explDisplay.textContent = formatted.explDisplay;

    // Affichage du bloc résultat
    resultDiv.classList.remove("hidden");
    resultDiv.scrollIntoView({ behavior: "smooth" });

    // Dispatch événement personnalisé pour suivi
    window.dispatchEvent(
      new CustomEvent("rsa-calculated", {
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
  revenusInput,
  logementSelect,
  activiteSelect,
].forEach((elem) => {
  elem.addEventListener("change", () => {
    resultDiv.classList.add("hidden");
  });
});
