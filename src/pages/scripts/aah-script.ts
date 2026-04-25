import { calculerAAH, formatAAHResult } from "../../utils/aahCalculEngine";

/**
 * Script de gestion du calculateur AAH
 */

// Éléments du formulaire
const form = document.getElementById("aah-form") as HTMLFormElement;
const situationSelect = document.getElementById("aah-situation") as HTMLSelectElement;
const enfantsInput = document.getElementById("aah-enfants") as HTMLInputElement;
const tauxInput = document.getElementById("aah-taux") as HTMLSelectElement;
const revenusInput = document.getElementById("aah-revenus") as HTMLInputElement;
const logementSelect = document.getElementById("aah-logement") as HTMLSelectElement;

// Éléments de résultat
const resultDiv = document.getElementById("aah-result") as HTMLDivElement;
const montantDisplay = document.getElementById("aah-montant") as HTMLElement;
const explDisplay = document.getElementById("aah-explication") as HTMLElement;

// Bouton de scroll
const scrollButton = document.getElementById("aah-scroll-to-form") as HTMLButtonElement;

/**
 * Gestion du formulaire
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    situation: situationSelect.value,
    enfants: parseInt(enfantsInput.value) || 0,
    tauxIncapacite: parseInt(tauxInput.value) || 0,
    revenus: parseInt(revenusInput.value) || 0,
    logement: logementSelect.value,
  };

  // Calcul
  const result = calculerAAH(data);

  // Affichage des résultats
  if (result.success) {
    const formatted = formatAAHResult(result);
    montantDisplay.textContent = formatted.montantDisplay;
    explDisplay.textContent = formatted.explDisplay;

    // Affichage du bloc résultat
    resultDiv.classList.remove("invisible");
    resultDiv.scrollIntoView({ behavior: "smooth" });

    // Dispatch événement personnalisé pour suivi
    window.dispatchEvent(
      new CustomEvent("aah-calculated", {
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
    const formElement = document.getElementById("aah-calculator");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
      form.focus();
    }
  });
}

/**
 * Preset buttons for quick scenarios
 */
const presetMap: Record<
  string,
  { situation: string; taux: string; enfants: string; revenus: string; logement: string }
> = {
  "seul-80-0": { situation: "seul", taux: "80", enfants: "0", revenus: "0", logement: "locataire" },
  "seul-80-500": {
    situation: "seul",
    taux: "80",
    enfants: "0",
    revenus: "500",
    logement: "locataire",
  },
  "couple-80-1000": {
    situation: "couple",
    taux: "80",
    enfants: "0",
    revenus: "1000",
    logement: "locataire",
  },
  "monoparental-80-1000": {
    situation: "monoparental",
    taux: "80",
    enfants: "1",
    revenus: "1000",
    logement: "locataire",
  },
};

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const preset = (btn as HTMLElement).getAttribute("data-preset");
    if (preset && presetMap[preset]) {
      const values = presetMap[preset];
      situationSelect.value = values.situation;
      tauxInput.value = values.taux;
      enfantsInput.value = values.enfants;
      revenusInput.value = values.revenus;
      logementSelect.value = values.logement;
      // Auto-submit the form
      form.requestSubmit();
    }
  });
});

/**
 * Quick value buttons for numeric fields
 */
document.querySelectorAll(".quick-value-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const fieldId = (btn as HTMLElement).getAttribute("data-field-id");
    const value = (btn as HTMLElement).getAttribute("data-value");
    if (fieldId && value !== null) {
      const input = document.getElementById(fieldId) as HTMLInputElement;
      if (input) {
        input.value = value;
      }
    }
  });
});
