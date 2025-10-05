/**
 * Auto-initialisation des exports PDF/CSV - Version simplifiée
 * Détecte automatiquement le calculateur et configure l'export
 */

document.addEventListener("DOMContentLoaded", () => {
  // Configuration des calculateurs
  const calculatorConfigs = {
    notaire: {
      name: "Frais de Notaire",
      resultsId: "notaire-calculator",
      formId: "notaire-form",
      notes: ["Calculs basés sur les barèmes officiels 2025."],
      type: "CalculatorFrame",
    },
    pret: {
      name: "Capacité d'Emprunt",
      resultsId: "results",
      formId: "pret-form",
      notes: ["Simulation indicative selon critères bancaires standard."],
    },
    financement: {
      name: "Financement Personnel",
      resultsId: "results",
      formId: "financement-form",
      notes: ["Estimation basée sur des critères standards."],
    },
    ik: {
      name: "Indemnités Kilométriques",
      resultsId: "ik-calculator",
      formId: "ik-form",
      notes: ["Barèmes fiscaux officiels 2025."],
      type: "CalculatorFrame",
    },
    ponts: {
      name: "Calcul des Ponts",
      resultsId: "ponts-calendar",
      formId: "ponts-form",
      notes: ["Calendrier officiel des jours fériés 2025-2026."],
      type: "CalculatorFrame",
    },
    taxe: {
      name: "Taxe Foncière",
      resultsId: "taxe-calculator",
      formId: "taxe-form",
      notes: ["Estimation basée sur les taux moyens nationaux."],
      type: "CalculatorFrame",
    },
    travail: {
      name: "Durée Légale du Travail",
      resultsId: "travail-calculator",
      formId: "travail-form",
      notes: ["Calculs selon le Code du travail français."],
      type: "CalculatorFrame",
    },
    "plus-value": {
      name: "Plus-Value Immobilière",
      resultsId: "results",
      formId: "plus-value-form",
      notes: ["Calculs fiscaux selon la réglementation 2025."],
    },
    crypto: {
      name: "Plus-Value Crypto & Bourse",
      resultsId: "results",
      formId: "crypto-bourse-form",
      notes: ["Calculs fiscaux basés sur la réglementation française 2025."],
    },
  };

  // Détection du calculateur actuel
  const currentPath = window.location.pathname;
  let currentCalculator = null;
  let calculatorConfig = null;

  for (const [key, config] of Object.entries(calculatorConfigs)) {
    if (currentPath.includes(key) || document.getElementById(config.formId)) {
      currentCalculator = key;
      calculatorConfig = config;
      break;
    }
  }

  if (!calculatorConfig) return;

  // Chargement du module PDF
  const script = document.createElement("script");
  script.src = "../utils/universalPDFExport.js";
  script.onload = () => {
    initPDFExport(calculatorConfig);
  };
  document.head.appendChild(script);
});

function initPDFExport(config) {
  const isCalculatorFrame = config.type === "CalculatorFrame";

  if (isCalculatorFrame) {
    console.log(`Initialisation CalculatorFrame pour ${config.name}`);

    const observer = new MutationObserver((mutations) => {
      const calculatorDiv = document.getElementById(config.resultsId);
      if (calculatorDiv) {
        const resultDiv = calculatorDiv.querySelector("#calculator-result");
        if (resultDiv && !resultDiv.classList.contains("hidden")) {
          console.log(`Résultats visibles pour ${config.name}`);
          setupExportButtons(config);
          observer.disconnect();
        }
      }
    });

    const calculatorDiv = document.getElementById(config.resultsId);
    if (calculatorDiv) {
      observer.observe(calculatorDiv, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });

      // Vérifier si les résultats sont déjà présents
      const resultDiv = calculatorDiv.querySelector("#calculator-result");
      if (resultDiv && !resultDiv.classList.contains("hidden")) {
        console.log(`Résultats déjà présents pour ${config.name}`);
        setupExportButtons(config);
      }
    }
  } else {
    // Logique originale pour les calculateurs avec class "hidden"
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          !mutation.target.classList.contains("hidden")
        ) {
          const resultsDiv = document.getElementById(config.resultsId);
          if (resultsDiv && !resultsDiv.classList.contains("hidden")) {
            setupExportButtons(config);
            observer.disconnect();
          }
        }
      });
    });

    const resultsDiv = document.getElementById(config.resultsId);
    if (resultsDiv) {
      observer.observe(resultsDiv, {
        attributes: true,
        attributeFilter: ["class"],
      });

      if (!resultsDiv.classList.contains("hidden")) {
        setupExportButtons(config);
      }
    }
  }
}

function setupExportButtons(config) {
  let exportContainer = document.getElementById("export-buttons");
  if (!exportContainer) {
    exportContainer = document.createElement("div");
    exportContainer.id = "export-buttons";
    exportContainer.className = "mt-6 flex flex-wrap gap-4 justify-center";

    const resultsDiv = document.getElementById(config.resultsId);
    if (resultsDiv && resultsDiv.parentNode) {
      resultsDiv.parentNode.insertBefore(
        exportContainer,
        resultsDiv.nextSibling
      );
    }
  }

  if (!document.getElementById("pdf-export-btn")) {
    window.createPDFButton(
      "export-buttons",
      config.name,
      () => collectCalculatorData(config),
      { notes: config.notes }
    );
  }
}

function collectCalculatorData(config) {
  try {
    // Récupération des données du formulaire
    const form = document.getElementById(config.formId);
    const userInputs = {};

    if (form) {
      const formData = new FormData(form);
      for (const [key, value] of formData.entries()) {
        if (value === "") continue;

        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          userInputs[key] = numValue;
        } else if (value.toLowerCase() === "true") {
          userInputs[key] = true;
        } else if (value.toLowerCase() === "false") {
          userInputs[key] = false;
        } else {
          userInputs[key] = value;
        }
      }

      // Récupération des champs input supplémentaires
      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        if (input.id && input.value !== "") {
          if (input.type === "date") {
            const dateValue = new Date(input.value);
            userInputs[input.id] = dateValue.getFullYear();
          } else {
            const numValue = parseFloat(input.value);
            if (!isNaN(numValue)) {
              userInputs[input.id] = numValue;
            } else {
              userInputs[input.id] = input.value;
            }
          }
        }
      });
    }

    // Collecte spécialisée selon le type de calculateur
    let results = {};

    if (config.type === "CalculatorFrame") {
      results = collectCalculatorFrameResults(config);
    } else if (config.name === "Financement Personnel") {
      results = collectFinancementResults();
    } else if (config.name === "Plus-Value Immobilière") {
      results = collectPlusValueResults();
    } else {
      results = collectGenericResults(config);
    }

    return { userInputs, results };
  } catch (error) {
    console.error("Erreur lors de la collecte des données:", error);
    return { userInputs: {}, results: {} };
  }
}

// Fonction spécialisée simplifiée pour les calculateurs CalculatorFrame
function collectCalculatorFrameResults(config) {
  const results = {};
  const calculatorDiv = document.getElementById(config.resultsId);

  if (!calculatorDiv) {
    console.error(`Calculateur non trouvé: ${config.resultsId}`);
    return results;
  }

  const resultDiv = calculatorDiv.querySelector("#calculator-result");

  if (!resultDiv || resultDiv.classList.contains("hidden")) {
    console.log(`Aucun résultat visible pour ${config.name}`);
    return results;
  }

  // Méthode simplifiée : extraire uniquement les lignes propres avec des patterns clairs
  const textContent = resultDiv.textContent || "";
  const lines = textContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.match(/Ø|[^\w\s\-.,():€%]/)) // Exclure les caractères bizarres
    .filter((line) => line.includes(":")) // Seulement les lignes avec des labels
    .filter((line) => line.length < 100); // Éviter les lignes trop longues

  const seenLabels = new Set();

  lines.forEach((line) => {
    // Pattern principal pour "Label: Valeur"
    const match = line.match(/^([^:]+?):\s*(.+)$/);
    if (match) {
      let label = match[1].trim();
      let value = match[2].trim();

      // Nettoyer et valider le label
      if (label.length > 50 || seenLabels.has(label)) return;

      // Nettoyer et valider la valeur
      if (value.includes("/")) {
        // Corriger les montants mal formatés
        value = value.replace(/(\d+)\s*\/\s*(\d{3})/g, "$1 $2");
      }

      // Ajouter EUR si c'est un montant avec €
      if (value.includes("€")) {
        value = value.replace(/€/g, "EUR");
      }

      // Valider la valeur finale
      if (
        (value &&
          value.length > 0 &&
          value.length < 50 &&
          !value.match(/^\d+$/)) ||
        (value.match(/^\d+$/) && parseInt(value) > 1000)
      ) {
        results[label] = value;
        seenLabels.add(label);
      }
    }
  });

  console.log(`Résultats collectés pour ${config.name}:`, results);
  return results;
}

// Fonction générique pour les autres calculateurs
function collectGenericResults(config) {
  const results = {};
  const resultsDiv = document.getElementById(config.resultsId);

  if (resultsDiv) {
    const resultElements = resultsDiv.querySelectorAll("[data-result]");
    resultElements.forEach((element) => {
      const key = element.getAttribute("data-result");
      const value = element.textContent?.trim();
      if (key && value) {
        results[key] = value;
      }
    });

    if (Object.keys(results).length === 0) {
      extractResultsFromHTML(resultsDiv, results);
    }
  }

  return results;
}

function extractResultsFromHTML(container, results) {
  const textContent = container.textContent || "";
  const euroPattern = /(\d{1,3}(?:\s?\d{3})*(?:,\d{2})?)\s*€/g;
  const percentPattern = /(\d+(?:,\d+)?)\s*%/g;

  let match;
  let index = 0;

  while ((match = euroPattern.exec(textContent)) !== null) {
    results[`Montant ${index}`] = match[1] + " EUR";
    index++;
  }

  index = 0;
  while ((match = percentPattern.exec(textContent)) !== null) {
    results[`Pourcentage ${index}`] = match[1] + " %";
    index++;
  }

  const lines = textContent
    .split("\n")
    .filter((line) => line.trim().length > 0);
  lines.forEach((line, i) => {
    if (line.includes(":") && line.length < 100) {
      const [key, value] = line.split(":").map((s) => s.trim());
      if (key && value) {
        results[`${key}`] = value;
      }
    }
  });
}

// Fonctions pour les calculateurs spécialisés (financement et plus-value)
function collectFinancementResults() {
  if (window.financementData) {
    const data = window.financementData;
    const formatCurrency = (amount) => {
      const formatted = Math.round(amount * 100) / 100;
      const parts = formatted.toString().split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      const decimalPart = parts[1] ? "," + parts[1].padEnd(2, "0") : ",00";
      return integerPart + decimalPart + " EUR";
    };

    const formatPercent = (percent) => {
      const formatted = Math.round(percent * 100) / 100;
      const parts = formatted.toString().split(".");
      const integerPart = parts[0];
      const decimalPart = parts[1] ? "," + parts[1].padEnd(2, "0") : ",00";
      return integerPart + decimalPart;
    };

    return {
      "Revenus totaux": formatCurrency(data.revenusTotaux),
      "Charges totales": formatCurrency(data.chargesTotales),
      "Reste a vivre": formatCurrency(data.resteAVivre),
      "Taux endettement actuel":
        formatPercent(data.tauxEndettementActuel) + " %",
      "Capacite emprunt maximale": formatCurrency(data.capaciteEmpruntMax),
      "Montant a emprunter": formatCurrency(data.montantAEmprunter),
      "Mensualite estimee": formatCurrency(data.mensualiteEstimee),
      "Cout total du credit": formatCurrency(data.coutTotalCredit),
      "Taux endettement final": formatPercent(data.tauxEndettementFinal) + " %",
      "Reste a vivre final": formatCurrency(data.resteAVivreFinal),
      Faisabilite: data.faisabilite,
    };
  }
  return collectGenericResults({ resultsId: "results" });
}

function collectPlusValueResults() {
  if (window.plusValueData) {
    const data = window.plusValueData;

    const formatCurrency = (amount) => {
      const formatted = Math.round(amount * 100) / 100;
      const parts = formatted.toString().split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      const decimalPart = parts[1] ? "," + parts[1].padEnd(2, "0") : ",00";
      return integerPart + decimalPart + " EUR";
    };

    const formatPercent = (percent) => {
      const formatted = Math.round(percent * 100) / 100;
      const parts = formatted.toString().split(".");
      const integerPart = parts[0];
      const decimalPart = parts[1] ? "," + parts[1].padEnd(2, "0") : ",00";
      return integerPart + decimalPart;
    };

    return {
      "Prix de vente": formatCurrency(data.prixVente),
      "Prix de revient": formatCurrency(data.prixRevient),
      "Plus-value brute": formatCurrency(data.plusValueBrute),
      "Duree detention": data.dureeDetention.toFixed(1) + " ans",
      "Abattement IR": formatPercent(data.abattementIR) + " %",
      "Abattement PS": formatPercent(data.abattementPS) + " %",
      "Plus-value IR": formatCurrency(data.plusValueIR),
      "Plus-value PS": formatCurrency(data.plusValuePS),
      "Impot sur le revenu": formatCurrency(data.impotIR),
      "Prelevements sociaux": formatCurrency(data.impotPS),
      Surtaxe: formatCurrency(data.surtaxe),
      "Impot total": formatCurrency(data.impotTotal),
      "Plus-value nette": formatCurrency(data.plusValueNette),
    };
  }

  return collectGenericResults({ resultsId: "results" });
}
