import { calculerResteAVivre, formatResteAVivreResult } from "../../utils/resteAVivreCalculEngine";

/**
 * Script multietape - Calculateur Reste a vivre
 * Avec localStorage, graphiques et évaluation du risque
 */

// ===== MULTI-STEP FORM MANAGEMENT =====
let currentStep = 1;
const totalSteps = 3;

const form = document.getElementById("reste-form") as HTMLFormElement;
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
const revenuMensuelInput = form.elements.namedItem("revenuMensuel") as HTMLInputElement;
const loggInput = form.elements.namedItem("logg") as HTMLInputElement;
const transportInput = form.elements.namedItem("transport") as HTMLInputElement;
const santeInput = form.elements.namedItem("sante") as HTMLInputElement;
const alimentationInput = form.elements.namedItem("alimentation") as HTMLInputElement;
const affairesInput = form.elements.namedItem("affaires") as HTMLInputElement;
const diversesInput = form.elements.namedItem("diverses") as HTMLInputElement;

// Result elements
const resultsDiv = document.getElementById("reste-results") as HTMLDivElement;
const montantDisplay = document.getElementById("reste-montant") as HTMLElement;
const explDisplay = document.getElementById("reste-explication") as HTMLElement;
const riskDisplay = document.getElementById("reste-risk") as HTMLElement;
const tauxDisplay = document.getElementById("reste-taux") as HTMLElement;
const detailsDiv = document.getElementById("reste-details") as HTMLDivElement;
const detailsContent = document.getElementById("reste-details-content") as HTMLElement;
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
    revenuMensuel: revenuMensuelInput?.value || "0",
    logg: loggInput?.value || "0",
    transport: transportInput?.value || "0",
    sante: santeInput?.value || "0",
    alimentation: alimentationInput?.value || "0",
    affaires: affairesInput?.value || "0",
    diverses: diversesInput?.value || "0",
    timestamp: Date.now(),
  };
  localStorage.setItem("reste-a-vivre-simulation", JSON.stringify(data));
}

function loadSimulation(): void {
  const saved = localStorage.getItem("reste-a-vivre-simulation");
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    if (revenuMensuelInput) revenuMensuelInput.value = data.revenuMensuel;
    if (loggInput) loggInput.value = data.logg;
    if (transportInput) transportInput.value = data.transport;
    if (santeInput) santeInput.value = data.sante;
    if (alimentationInput) alimentationInput.value = data.alimentation;
    if (affairesInput) affairesInput.value = data.affaires;
    if (diversesInput) diversesInput.value = data.diverses;

    form.requestSubmit();
  } catch (e) {
    console.error("Erreur chargement simulation:", e);
  }
}

// ===== CALCULATE & DISPLAY =====
function calculateAndDisplay(): void {
  const data = {
    salaireNetMensuel: parseInt(revenuMensuelInput?.value || "0") || 0,
    autresRevenus: 0,
    primActivite: 0,
    rsa: 0,
    apl: 0,
    aah: 0,
    autresAides: 0,
    loyer: parseInt(loggInput?.value || "0") || 0,
    assuranceLogement: 0,
    electricite: 0,
    eau: 0,
    internet: 0,
    telephone: 0,
    transportRoutier: 0,
    transportPublic: parseInt(transportInput?.value || "0") || 0,
    assuranceSante: 0,
    gardienEnfants: 0,
    alimentation: parseInt(alimentationInput?.value || "0") || 0,
    hygiene: parseInt(affairesInput?.value || "0") || 0,
    vetements: 0,
    loisirs: 0,
    autres: parseInt(diversesInput?.value || "0") || 0,
    nbPersonnes: 1,
    nbEnfants: 0,
  };

  // Créer une santé input qu'on ne pas utilisé? Ou l'ignorer pour maintenant
  // Pour simplifier, on va juste mapper ce qu'on a

  const result = calculerResteAVivre(data);

  if (!result.success) {
    alert("Erreur lors du calcul");
    return;
  }

  // Save to localStorage
  saveSimulation();

  // Display results
  resultsDiv.classList.remove("hidden");

  const formatted = formatResteAVivreResult(result);

  montantDisplay.textContent = formatted.montantDisplay;
  explDisplay.textContent = formatted.explDisplay;

  // Risk level display with color
  const riskColors: { [key: string]: string } = {
    faible: "bg-emerald-100 text-emerald-900",
    modere: "bg-amber-100 text-amber-900",
    eleve: "bg-orange-100 text-orange-900",
    critique: "bg-red-100 text-red-900",
  };

  const riskLabel = result.niveauRisque.toLowerCase().replace("é", "e");
  const riskColorClass = riskColors[riskLabel] || "bg-gray-100";

  if (riskDisplay) {
    riskDisplay.textContent = result.niveauRisque.toUpperCase();
    riskDisplay.className = `text-2xl font-bold px-4 py-2 rounded-lg inline-block ${riskColorClass}`;
  }

  tauxDisplay.textContent = `${result.tauxEndettement.toFixed(1)}%`;

  // Visualization bars (stacked Charges + Reste)
  const barCharges = document.getElementById("reste-bar-charges") as HTMLElement | null;
  const barReste = document.getElementById("reste-bar-reste") as HTMLElement | null;
  const pctChargesSpan = document.getElementById("reste-pct-charges") as HTMLElement | null;
  const pctResteSpan = document.getElementById("reste-pct-reste") as HTMLElement | null;
  const pctCharges = Math.max(0, Math.min(100, (result.toutcharges / result.revenus) * 100));
  const pctReste = Math.max(0, Math.min(100, 100 - pctCharges));
  if (barCharges) barCharges.style.width = pctCharges.toFixed(0) + "%";
  if (barReste) barReste.style.width = pctReste.toFixed(0) + "%";
  if (pctChargesSpan) pctChargesSpan.textContent = pctCharges.toFixed(0) + "%";
  if (pctResteSpan) pctResteSpan.textContent = pctReste.toFixed(0) + "%";

  // Suggestions
  if (suggestionsList) {
    const suggestions = [];

    if (result.tauxEndettement > 75) {
      suggestions.push(
        "Vous êtes en situation critique. Contactez une association d'aide aux endettés",
      );
    } else if (result.tauxEndettement > 60) {
      suggestions.push("Votre endettement est élevé. Évaluez les postes de dépense redondants");
    } else if (result.tauxEndettement > 40) {
      suggestions.push("Votre situation est modérée. Vous avez peu de marge de manœuvre");
    }

    if (data.loyer > data.salaireNetMensuel * 0.33) {
      suggestions.push(
        "Votre loyer dépasse 33 % de vos revenus. Cherchez un logement moins cher si possible",
      );
    }

    if (data.transportPublic > data.salaireNetMensuel * 0.15) {
      suggestions.push(
        "Vos dépenses de transport sont élevées. Envisagez le covoiturage ou les transports en commun",
      );
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
      <div>Revenu mensuel : ${data.salaireNetMensuel.toLocaleString("fr-FR")} €</div>
      <div class="text-red-600">- Total dépenses : ${result.toutcharges.toLocaleString("fr-FR")} €</div>
      <div class="border-t border-gray-400 pt-1 text-green-600 font-bold">= Reste à vivre : ${result.resteAVivre.toFixed(2)} €</div>
      <div class="text-sm mt-2 text-gray-600">Taux d'endettement : ${result.tauxEndettement.toFixed(1)}%</div>
    `;
  }

  // Scroll vers resultats
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  // Analytics
  if (typeof (window as any).gtag !== "undefined") {
    (window as any).gtag("event", "calculation", {
      calculator: "reste-a-vivre",
      result: result.resteAVivre,
      revenu: data.salaireNetMensuel,
      risk_level: result.niveauRisque,
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
  const saved = localStorage.getItem("reste-a-vivre-simulation");
  if (saved && loadSavedBtn) {
    loadSavedBtn.style.display = "block";
  }
});

// Initialize only if multi-step elements exist
if (step1 && step2 && step3) {
  showStep(1);
}
