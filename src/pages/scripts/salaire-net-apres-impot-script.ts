import { calculerSalaireNet, formatSalaireNetResult } from "../../utils/salaireNetCalculEngine";

/**
 * Script multietape - Calculateur Salaire NET apres impots
 * Avec localStorage, graphiques et suggestions intelligentes
 */

// ===== MULTI-STEP FORM MANAGEMENT =====
let currentStep = 1;
const totalSteps = 3;

const form = document.getElementById("salaire-form") as HTMLFormElement;
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
const salaireBrutInput = form.elements.namedItem("salaireBrut") as HTMLInputElement;
const primesInput = form.elements.namedItem("primes") as HTMLInputElement;
const heuresSupInput = form.elements.namedItem("heuresSup") as HTMLInputElement;
const mariageOrPacsSelect = form.elements.namedItem("mariageOrPacs") as HTMLSelectElement;
const enfantsInput = form.elements.namedItem("enfants") as HTMLInputElement;
const ticketsRestoInput = form.elements.namedItem("ticketsResto") as HTMLInputElement;
const mutuelleInput = form.elements.namedItem("mutuelle") as HTMLInputElement;

// Result elements
const resultsDiv = document.getElementById("salaire-results") as HTMLDivElement;
const montantDisplay = document.getElementById("salaire-montant") as HTMLElement;
const explDisplay = document.getElementById("salaire-explication") as HTMLElement;
const tauxDisplay = document.getElementById("salaire-taux") as HTMLElement;
const annuelDisplay = document.getElementById("salaire-annuel") as HTMLElement;
const pourcentDisplay = document.getElementById("salaire-pourcent") as HTMLElement;
const detailsDiv = document.getElementById("salaire-details") as HTMLDivElement;
const detailsContent = document.getElementById("salaire-details-content") as HTMLElement;
const suggestionsList = document.getElementById("suggestions-list") as HTMLElement;

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
    salaireBrut: salaireBrutInput?.value || "0",
    primes: primesInput?.value || "0",
    heuresSup: heuresSupInput?.value || "0",
    mariageOrPacs: mariageOrPacsSelect?.value || "false",
    enfants: enfantsInput?.value || "0",
    ticketsResto: ticketsRestoInput?.value || "0",
    mutuelle: mutuelleInput?.value || "0",
    timestamp: Date.now(),
  };
  localStorage.setItem("salaire-net-simulation", JSON.stringify(data));
}

function loadSimulation(): void {
  const saved = localStorage.getItem("salaire-net-simulation");
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    if (salaireBrutInput) salaireBrutInput.value = data.salaireBrut;
    if (primesInput) primesInput.value = data.primes;
    if (heuresSupInput) heuresSupInput.value = data.heuresSup;
    if (mariageOrPacsSelect) mariageOrPacsSelect.value = data.mariageOrPacs;
    if (enfantsInput) enfantsInput.value = data.enfants;
    if (ticketsRestoInput) ticketsRestoInput.value = data.ticketsResto;
    if (mutuelleInput) mutuelleInput.value = data.mutuelle;

    form.requestSubmit();
  } catch (e) {
    console.error("Erreur chargement simulation:", e);
  }
}

// ===== CALCULATE & DISPLAY =====
function calculateAndDisplay(): void {
  const data = {
    salaireBrut: parseInt(salaireBrutInput?.value || "0") || 0,
    statut: "salarie" as const,
    primes: parseInt(primesInput?.value || "0") || 0,
    heuresSup: parseInt(heuresSupInput?.value || "0") || 0,
    ticketsResto: parseInt(ticketsRestoInput?.value || "0") || 0,
    mutuelle: parseInt(mutuelleInput?.value || "0") || 0,
    enfants: parseInt(enfantsInput?.value || "0") || 0,
    mariageOrPacs: mariageOrPacsSelect?.value === "true",
  };

  const result = calculerSalaireNet(data);

  if (!result.success) {
    alert("Erreur lors du calcul");
    return;
  }

  // Save to localStorage
  saveSimulation();

  // Display results
  resultsDiv.classList.remove("hidden");

  const formatted = formatSalaireNetResult(result);

  montantDisplay.textContent = formatted.montantDisplay;
  explDisplay.textContent = `Après tous vos prélèvements et cotisations mensuels.`;
  tauxDisplay.textContent = `${(result.tauxEffectif * 100).toFixed(1)}%`;
  annuelDisplay.textContent = `${result.salaireNetAnnuel.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;

  // Display breakdown visualization
  const cotisations = result.cotisationsSociales;
  const impot = result.impotPasTotal;

  const breakdownBrut = document.getElementById("breakdown-brut");
  const breakdownCotisations = document.getElementById("breakdown-cotisations");
  const breakdownImpot = document.getElementById("breakdown-impot");
  const breakdownNet = document.getElementById("breakdown-net");
  const breakdownCotisationsBar = document.getElementById(
    "breakdown-cotisations-bar",
  ) as HTMLElement;
  const breakdownImpotBar = document.getElementById("breakdown-impot-bar") as HTMLElement;
  const breakdownNetBar = document.getElementById("breakdown-net-bar") as HTMLElement;

  if (breakdownBrut) breakdownBrut.textContent = `${data.salaireBrut.toLocaleString("fr-FR")} EUR`;
  if (breakdownCotisations)
    breakdownCotisations.textContent = `-${cotisations.toLocaleString("fr-FR")} EUR`;
  if (breakdownImpot) breakdownImpot.textContent = `-${impot.toLocaleString("fr-FR")} EUR`;
  if (breakdownNet)
    breakdownNet.textContent = `${result.salaireNetMensuel.toLocaleString("fr-FR")} EUR`;

  const pctCot = Math.max(0, Math.min(100, (cotisations / data.salaireBrut) * 100));
  const pctImp = Math.max(0, Math.min(100, (impot / data.salaireBrut) * 100));
  const pctNet = Math.max(0, Math.min(100, (result.salaireNetMensuel / data.salaireBrut) * 100));
  if (breakdownCotisationsBar) breakdownCotisationsBar.style.width = `${pctCot}%`;
  if (breakdownImpotBar) breakdownImpotBar.style.width = `${pctImp}%`;
  if (breakdownNetBar) breakdownNetBar.style.width = `${pctNet}%`;

  // Impact budget (% du revenu brut)
  if (pourcentDisplay) {
    const pct = (result.salaireNetMensuel / data.salaireBrut) * 100 || 0;
    pourcentDisplay.textContent = `${pct.toFixed(1)}%`;
  }

  // Suggestions
  if (suggestionsList) {
    const suggestions = [];

    if (data.enfants === 0) {
      suggestions.push("Chaque enfant à charge réduit votre impôt de 50–100 €/mois");
    }

    if (data.mariageOrPacs === false && data.enfants > 0) {
      suggestions.push("Une déclaration PACS pourrait réduire votre impôt si vous êtes en couple");
    }

    if (data.ticketsResto === 0) {
      suggestions.push(
        "Négociez des tickets-restaurant (non imposables) auprès de votre employeur",
      );
    }

    if (data.mutuelle === 0) {
      suggestions.push("Vérifiez si votre employeur prend en charge une mutuelle complémentaire");
    }

    if (data.primes === 0 && data.salaireBrut > 2000) {
      suggestions.push(
        "Négociez une prime annuelle ou mensuelle lors de votre prochaine augmentation",
      );
    }

    suggestionsList.innerHTML =
      suggestions.length > 0
        ? suggestions
            .map(
              (s) =>
                `<li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">+</span> <span>${s}</span></li>`,
            )
            .join("")
        : `<li class="text-gray-600">Aucune suggestion à ce moment</li>`;
  }

  // Detail breakdown
  if (detailsContent) {
    detailsContent.innerHTML = `
      <div>Salaire brut : ${data.salaireBrut.toLocaleString("fr-FR")} €</div>
      <div>+ Avantages (tickets, mutuelle) : ${(data.ticketsResto + data.mutuelle).toLocaleString("fr-FR")} €</div>
      <div class="text-red-600">- Cotisations sociales : ${cotisations.toFixed(2)} €</div>
      <div class="text-orange-600">- Impôt prélèvement à la source : ${impot.toFixed(2)} €</div>
      <div class="border-t border-gray-400 pt-1 text-green-600 font-bold">= Salaire NET : ${result.salaireNetMensuel.toFixed(2)} €</div>
    `;
  }

  // Scroll vers resultats
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  // Analytics
  if (typeof (window as any).gtag !== "undefined") {
    (window as any).gtag("event", "calculation", {
      calculator: "salaire-net-apres-impot",
      result: result.salaireNetMensuel,
      salaire_brut: data.salaireBrut,
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
  const saved = localStorage.getItem("salaire-net-simulation");
  if (saved && loadSavedBtn) {
    loadSavedBtn.style.display = "block";
  }
});

// Initialize only if multi-step elements exist
if (step1 && step2 && step3) {
  showStep(1);
}
