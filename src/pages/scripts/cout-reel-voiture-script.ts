import {
  calculerCoutReelVoiture,
  formatCoutReelVoitureResult,
} from "../../utils/coutReelVoitureCalculEngine";

/**
 * Script multietape - Calculateur Cout reel voiture
 * Avec localStorage et comparaison des couts
 */

// ===== MULTI-STEP FORM MANAGEMENT =====
let currentStep = 1;
const totalSteps = 3;

const form = document.getElementById("voiture-form") as HTMLFormElement;
const step1 = document.getElementById("step-1") as HTMLElement;
const step2 = document.getElementById("step-2") as HTMLElement;
const step3 = document.getElementById("step-3") as HTMLElement;
const prevBtn = document.getElementById("prev-btn") as HTMLButtonElement;
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const currentStepDisplay = document.getElementById("current-step") as HTMLElement | null;
const progressBar = document.getElementById("progress-bar") as HTMLElement | null;
const loadSavedBtn = document.getElementById("load-saved") as HTMLElement;

// Form inputs
const kmAnnuelInput = form.elements.namedItem("kmAnnuel") as HTMLInputElement;
const fuelTypeSelect = form.elements.namedItem("fuelType") as HTMLSelectElement;
const prixCarburantInput = form.elements.namedItem("prixCarburant") as HTMLInputElement;
const consommationInput = form.elements.namedItem("consommation") as HTMLInputElement;
const assuranceMensuelInput = form.elements.namedItem("assuranceMensuel") as HTMLInputElement;
const entretienAnnuelInput = form.elements.namedItem("entretienAnnuel") as HTMLInputElement;
const parkingMensuelInput = form.elements.namedItem("parkingMensuel") as HTMLInputElement;
const othersMensuelInput = form.elements.namedItem("othersMensuel") as HTMLInputElement;
const creditMensuelInput = form.elements.namedItem("creditMensuel") as HTMLInputElement;

// Result elements
const resultsDiv = document.getElementById("voiture-results") as HTMLDivElement;
const montantDisplay = document.getElementById("voiture-montant") as HTMLElement;
const explDisplay = document.getElementById("voiture-explication") as HTMLElement;
const coutAnnuelDisplay = document.getElementById("voiture-annuel") as HTMLElement;
const detailsDiv = document.getElementById("voiture-details") as HTMLDivElement;
const detailsContent = document.getElementById("voiture-details-content") as HTMLElement;
const suggestionsList = document.getElementById("suggestions-list") as HTMLElement;
const coutKmDisplay = document.getElementById("voiture-km") as HTMLElement | null;
const carburantDisplay = document.getElementById("voiture-carburant") as HTMLElement | null;

// ===== MULTI-STEP NAVIGATION =====
function showStep(stepNum: number): void {
  if (stepNum < 1 || stepNum > totalSteps) return;

  currentStep = stepNum;

  // Hide all steps
  [step1, step2, step3].forEach((s) => {
    if (s) s.classList.add("hidden");
  });

  // Show current step
  const steps = [step1, step2, step3];
  if (steps[stepNum - 1]) steps[stepNum - 1].classList.remove("hidden");

  // Update progress
  if (currentStepDisplay) currentStepDisplay.textContent = stepNum.toString();
  const progress = (stepNum / totalSteps) * 100;
  if (progressBar) progressBar.style.width = progress + "%";

  // Update buttons
  if (prevBtn) prevBtn.classList.toggle("hidden", stepNum === 1);
  if (nextBtn) nextBtn.classList.toggle("hidden", stepNum === totalSteps);
  if (submitBtn) submitBtn.classList.toggle("hidden", stepNum !== totalSteps);
}

// ===== SAVE/LOAD =====
function saveSimulation(): void {
  const data = {
    kmAnnuel: kmAnnuelInput?.value || "0",
    fuelType: fuelTypeSelect?.value || "essence",
    prixCarburant: prixCarburantInput?.value || "0",
    consommation: consommationInput?.value || "0",
    assuranceMensuel: assuranceMensuelInput?.value || "0",
    entretienAnnuel: entretienAnnuelInput?.value || "0",
    parkingMensuel: parkingMensuelInput?.value || "0",
    othersMensuel: othersMensuelInput?.value || "0",
    creditMensuel: creditMensuelInput?.value || "0",
    timestamp: Date.now(),
  };
  localStorage.setItem("cout-reel-voiture-simulation", JSON.stringify(data));
}

function loadSimulation(): void {
  const saved = localStorage.getItem("cout-reel-voiture-simulation");
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    if (kmAnnuelInput) kmAnnuelInput.value = data.kmAnnuel;
    if (fuelTypeSelect) fuelTypeSelect.value = data.fuelType;
    if (prixCarburantInput) prixCarburantInput.value = data.prixCarburant;
    if (consommationInput) consommationInput.value = data.consommation;
    if (assuranceMensuelInput) assuranceMensuelInput.value = data.assuranceMensuel;
    if (entretienAnnuelInput) entretienAnnuelInput.value = data.entretienAnnuel;
    if (parkingMensuelInput) parkingMensuelInput.value = data.parkingMensuel;
    if (othersMensuelInput) othersMensuelInput.value = data.othersMensuel;
    if (creditMensuelInput) creditMensuelInput.value = data.creditMensuel;

    form.requestSubmit();
  } catch (e) {
    console.error("Erreur chargement simulation:", e);
  }
}

// ===== CALCULATE & DISPLAY =====
function calculateAndDisplay(): void {
  const data = {
    carburant: fuelTypeSelect?.value || "essence",
    kilometrageAnnuel: parseInt(kmAnnuelInput?.value || "0") || 0,
    consommation: parseFloat(consommationInput?.value || "0") || 0,
    prixCarburant: parseFloat(prixCarburantInput?.value || "0") || 0,
    assuranceAnnuelle: (parseInt(assuranceMensuelInput?.value || "0") || 0) * 12,
    carteGriseAnnuelle: 0,
    revisionAnnuelle: parseInt(entretienAnnuelInput?.value || "0") || 0,
    parking: (parseInt(parkingMensuelInput?.value || "0") || 0) * 12,
    peagesAnnuels: 0,
    contraventions: 0,
    creditMensuel: parseInt(creditMensuelInput?.value || "0") || 0,
  };

  const result = calculerCoutReelVoiture(data as any);

  if (!result.success) {
    alert("Erreur lors du calcul");
    return;
  }

  // Save to localStorage
  saveSimulation();

  // Display results
  resultsDiv.classList.remove("hidden");

  const formatted = formatCoutReelVoitureResult(result);

  montantDisplay.textContent = formatted.montantDisplay;
  explDisplay.textContent = formatted.explDisplay;
  coutAnnuelDisplay.textContent = `${result.coutAnnuelTotal.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €/an`;
  if (coutKmDisplay) {
    coutKmDisplay.textContent = `${result.coutParKm.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/km`;
  }
  if (carburantDisplay) {
    carburantDisplay.textContent = `${result.details.carburantMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mois`;
  }

  // Suggestions
  if (suggestionsList) {
    const suggestions = [];

    if (data.kilometrageAnnuel < 10000) {
      suggestions.push(
        "Vous faites peu de km. Envisagez les transports en commun ou le covoiturage",
      );
    }

    if (data.carburant === "essence" && data.kilometrageAnnuel > 15000) {
      suggestions.push("Au-delà de 15 000 km/an, un diesel ou hybride peut être plus économique");
    }

    if (data.parking > 1200) {
      suggestions.push("Votre parking est cher. Cherchez un parking moins onéreux");
    }

    if (data.creditMensuel > 300) {
      suggestions.push("Votre crédit auto est élevé. Considérez un véhicule moins cher");
    }

    suggestionsList.innerHTML =
      suggestions.length > 0
        ? suggestions
            .map(
              (s) =>
                `<li class="flex items-start gap-2"><span class="text-blue-600 font-bold">→</span> <span>${s}</span></li>`,
            )
            .join("")
        : `<li class="text-gray-600">Pas de suggestion immédiate</li>`;
  }

  // Detail breakdown
  if (detailsContent) {
    detailsContent.innerHTML = `
      <div>Coût carburant/mois : ${result.details.carburantMensuel.toFixed(2)} €</div>
      <div>Assurance/mois : ${result.details.assuranceMensuel.toFixed(2)} €</div>
      <div>Entretien/mois : ${result.details.entretienMensuel.toFixed(2)} €</div>
      <div>Parking/mois : ${result.details.parkingMensuel.toFixed(2)} €</div>
      <div>Autres/mois : ${result.details.othersMensuel.toFixed(2)} €</div>
      <div>Crédit/mois : ${result.details.creditMensuel.toFixed(2)} €</div>
      <div class="border-t border-gray-400 pt-1 font-bold">TOTAL/mois : ${result.coutMensuelTotal.toFixed(2)} €</div>
      <div class="text-sm mt-2 text-gray-600">Coût par km : ${result.coutParKm.toFixed(2)} €/km</div>
    `;
  }

  // Scroll vers resultats
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  // Analytics
  if (typeof (window as any).gtag !== "undefined") {
    (window as any).gtag("event", "calculation", {
      calculator: "cout-reel-voiture",
      result: result.coutMensuelTotal,
      km_annuel: data.kilometrageAnnuel,
      fuel_type: data.carburant,
    });
  }
}

// ===== EVENT LISTENERS =====
if (prevBtn) {
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentStep > 1) showStep(currentStep - 1);
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) showStep(currentStep + 1);
  });
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      calculateAndDisplay();
    }
  });
}

if (loadSavedBtn) {
  loadSavedBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loadSimulation();
  });
}

// Check if simulation exists to show load button
window.addEventListener("load", () => {
  const saved = localStorage.getItem("cout-reel-voiture-simulation");
  if (saved && loadSavedBtn) {
    loadSavedBtn.style.display = "block";
  }
});

// Initialize only if multi-step elements exist
if (step1 && step2 && step3) {
  showStep(1);
}
