import { calculerSalaireNet, formatSalaireNetResult } from "../../utils/salaireNetCalculEngine";

/**
 * Script de gestion du calculateur Salaire NET
 */

// Éléments du formulaire
const form = document.getElementById("salaire-form") as HTMLFormElement;
const salaireBrutInput = document.getElementById("salaire-brut") as HTMLInputElement;
const marieOrPacsSelect = document.getElementById("situation-familiale") as HTMLSelectElement;
const enfantsInput = document.getElementById("enfants") as HTMLInputElement;
const primesInput = document.getElementById("primes") as HTMLInputElement;
const heuresSupInput = document.getElementById("heures-sup") as HTMLInputElement;
const ticketsRestoInput = document.getElementById("tickets-resto") as HTMLInputElement;
const mutuelleInput = document.getElementById("mutuelle") as HTMLInputElement;

// Éléments de résultat
const resultsDiv = document.getElementById("salaire-results") as HTMLDivElement;
const montantDisplay = document.getElementById("salaire-montant") as HTMLElement;
const explDisplay = document.getElementById("salaire-explication") as HTMLElement;
const tauxDisplay = document.getElementById("salaire-taux-effectif") as HTMLElement;
const annuelDisplay = document.getElementById("salaire-annuel") as HTMLElement;
const detailsDiv = document.getElementById("salaire-details") as HTMLDivElement;
const detailsContent = document.getElementById("salaire-details-content") as HTMLDivElement;

function initFromURL(): void {
  const params = new URLSearchParams(window.location.search);
  if (!params.size) return;

  const mappings = {
    "salaire-brut": "salaire-brut",
    "situation-familiale": "situation-familiale",
    enfants: "enfants",
    primes: "primes",
    "heures-sup": "heures-sup",
    "tickets-resto": "tickets-resto",
    mutuelle: "mutuelle",
  };

  let hasValue = false;

  Object.entries(mappings).forEach(([paramKey, fieldId]) => {
    const value = params.get(paramKey);
    if (value === null) return;
    const input = document.getElementById(fieldId) as HTMLInputElement | null;
    if (!input) return;
    input.value = value;
    hasValue = true;
  });

  if (hasValue) {
    form?.requestSubmit();
  }
}

/**
 * Gestion du formulaire
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    salaireBrut: parseInt(salaireBrutInput.value) || 0,
    statut: "salarie" as const,
    primes: parseInt(primesInput.value) || 0,
    heuresSup: parseInt(heuresSupInput.value) || 0,
    ticketsResto: parseInt(ticketsRestoInput.value) || 0,
    mutuelle: parseInt(mutuelleInput.value) || 0,
    enfants: parseInt(enfantsInput.value) || 0,
    mariageOrPacs: marieOrPacsSelect.value === "true",
  };

  const result = calculerSalaireNet(data);

  if (!result.success) {
    alert("Erreur lors du calcul");
    return;
  }

  // Affichage des résultats
  resultsDiv.classList.remove("hidden");

  const formatted = formatSalaireNetResult(result);

  montantDisplay.textContent = formatted.montantDisplay;
  explDisplay.textContent = formatted.explDisplay;
  tauxDisplay.textContent = `${(result.tauxEffectif * 100).toFixed(1)}%`;
  annuelDisplay.textContent = `${result.salaireNetAnnuel.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;

  // Affichage des détails
  if (detailsDiv && detailsContent) {
    detailsContent.innerHTML = formatted.detailsDisplay
      .split("\n")
      .map((line) => `<div>${line}</div>`)
      .join("");
    detailsDiv.classList.remove("hidden");
  }

  // Scroll vers les résultats
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  // Tracking événement
  if (typeof (window as any).gtag !== "undefined") {
    (window as any).gtag("event", "calculation", {
      calculator: "salaire-net",
      result: result.salaireNetMensuel,
      salaire_brut: data.salaireBrut,
    });
  }
});

// Initialisation
initFromURL();
