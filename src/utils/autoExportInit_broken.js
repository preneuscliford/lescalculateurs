/**
 * Auto-initialisation des exports PDF/CSV - Version simplifiée
 * Détecte automatiquement le calculateur et configure l'export
 */

// Fonction pour extraire les données depuis la structure HTML des calculateurs
function extractFromHTMLStructure(resultDiv) {
  const results = {};
  
  console.log("=== Début extraction HTML ===");
  console.log("HTML complet:", resultDiv.innerHTML);
  
  // Chercher les éléments avec flex justify-between (structure notaire)
  const flexElements = resultDiv.querySelectorAll('.flex.justify-between');
  console.log(`Trouvé ${flexElements.length} éléments flex justify-between`);
  
  flexElements.forEach((element, index) => {
    const spans = element.querySelectorAll('span');
    console.log(`Élément ${index}: ${spans.length} spans trouvés`);
    
    if (spans.length >= 2) {
      const label = spans[0].textContent?.trim();
      const value = spans[1].textContent?.trim();
      
      console.log(`  Label: "${label}", Value: "${value}"`);
      
      if (label && value && label.includes(':') === false) {
        // Nettoyer le label (enlever le ':')
        const cleanLabel = label.replace(/:$/, '').trim();
        
        // Nettoyer la valeur (remplacer € par EUR, etc.)
        let cleanValue = value;
        if (cleanValue.includes('€')) {
          cleanValue = cleanValue.replace(/€/g, ' EUR');
        }
        if (cleanValue.includes('/')) {
          cleanValue = cleanValue.replace(/(\d+)\s*\/\s*(\d{3})/g, '$1 $2');
        }
        
        results[cleanLabel] = cleanValue;
        console.log(`  ✅ Ajouté: "${cleanLabel}" = "${cleanValue}"`);
      }
    }
  });
  
  // Chercher les éléments avec font-medium (valeurs importantes)
  const mediumElements = resultDiv.querySelectorAll('.font-medium');
  console.log(`Trouvé ${mediumElements.length} éléments font-medium`);
  
  mediumElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Font-medium ${index}: "${text}"`);
    
    if (text && (text.includes('EUR') || text.includes('€'))) {
      // Essayer de trouver le label associé
      let label = '';
      
      // Chercher dans l'élément parent
      if (element.parentElement) {
        const parentText = element.parentElement.textContent?.trim() || '';
        const beforeValue = parentText.split(text)[0]?.trim();
        if (beforeValue && beforeValue.length > 0 && beforeValue.length < 50) {
          label = beforeValue.replace(/:$/, '').trim();
        }
      }
      
      if (label && !results[label]) {
        let cleanValue = text;
        if (cleanValue.includes('€')) {
          cleanValue = cleanValue.replace(/€/g, ' EUR');
        }
        results[label] = cleanValue;
        console.log(`  ✅ Ajouté font-medium: "${label}" = "${cleanValue}"`);
      }
    }
  });
  
  // Chercher les éléments avec text-green-600 (total)
  const greenElements = resultDiv.querySelectorAll('.text-green-600');
  console.log(`Trouvé ${greenElements.length} éléments text-green-600`);
  
  greenElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Green ${index}: "${text}"`);
    
    if (text && (text.includes('EUR') || text.includes('€'))) {
      let label = 'Total';
      
      // Essayer de trouver un label plus spécifique
      if (element.parentElement) {
        const parentText = element.parentElement.textContent?.trim() || '';
        const beforeValue = parentText.split(text)[0]?.trim();
        if (beforeValue && beforeValue.length > 0 && beforeValue.length < 50) {
          label = beforeValue.replace(/:$/, '').trim();
        }
      }
      
      let cleanValue = text;
      if (cleanValue.includes('€')) {
        cleanValue = cleanValue.replace(/€/g, ' EUR');
      }
      
      results[label] = cleanValue;
      console.log(`  ✅ Ajouté total: "${label}" = "${cleanValue}"`);
    }
  });
  
  console.log("Résultats finaux de l'extraction HTML:", results);
  console.log("=== Fin extraction HTML ===");
  
  return results;
}

document.addEventListener("DOMContentLoaded", () => {
  // Configuration des calculateurs
  const calculatorConfigs = {
    notaire: {
      name: "Frais de Notaire",
      resultsId: "notaire-calculator",
      formId: "calculator-form",
      notes: ["Calculs basés sur les barèmes officiels 2025."],
      type: "CalculatorFrame"
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
      formId: "calculator-form",
      notes: ["Barèmes fiscaux officiels 2025."],
      type: "CalculatorFrame"
    },
    ponts: {
      name: "Calcul des Ponts",
      resultsId: "ponts-calendar",
      formId: "calculator-form",
      notes: ["Calendrier officiel des jours fériés 2025-2026."],
      type: "CalculatorFrame"
    },
    taxe: {
      name: "Taxe Foncière",
      resultsId: "taxe-calculator",
      formId: "calculator-form",
      notes: ["Estimation basée sur les taux moyens nationaux."],
      type: "CalculatorFrame"
    },
    travail: {
      name: "Durée Légale du Travail",
      resultsId: "travail-calculator",
      formId: "calculator-form",
      notes: ["Calculs selon le Code du travail français."],
      type: "CalculatorFrame"
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
  const isCalculatorFrame = config.type === 'CalculatorFrame';
  
  if (isCalculatorFrame) {
    console.log(`Initialisation CalculatorFrame pour ${config.name}`);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const resultDiv = mutation.target;
          if (resultDiv && resultDiv.id === 'calculator-result' && !resultDiv.classList.contains('hidden')) {
            console.log(`Résultats visibles pour ${config.name}`);
            setupExportButtons(config);
            observer.disconnect();
          }
        }
      });
    });

    const calculatorDiv = document.getElementById(config.resultsId);
    if (calculatorDiv) {
      const resultDiv = calculatorDiv.querySelector('#calculator-result');
      if (resultDiv) {
        observer.observe(resultDiv, { 
          attributes: true,
          attributeFilter: ['class']
        });

        // Vérifier si les résultats sont déjà présents
        if (!resultDiv.classList.contains('hidden')) {
          console.log(`Résultats déjà présents pour ${config.name}`);
          setupExportButtons(config);
        }
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
          if (input.type === 'date') {
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

    if (config.type === 'CalculatorFrame') {
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

  const resultDiv = calculatorDiv.querySelector('#calculator-result');
  
  if (!resultDiv || resultDiv.classList.contains('hidden')) {
    console.log(`Aucun résultat visible pour ${config.name}`);
    return results;
  }

  // Méthode améliorée : extraire les données importantes
  const textContent = resultDiv.textContent || '';
  
  console.log(`Contenu brut pour ${config.name}:`, textContent);
  
  // Essayer d'abord d'extraire depuis la structure HTML (pour les calculateurs comme notaire)
  const htmlResults = extractFromHTMLStructure(resultDiv);
  if (Object.keys(htmlResults).length > 0) {
    console.log(`Résultats extraits du HTML pour ${config.name}:`, htmlResults);
    Object.assign(results, htmlResults);
  }
  
  // Fallback vers l'extraction textuelle si nécessaire
  if (Object.keys(results).length < 3) {
    const lines = textContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
      
    console.log(`Toutes les lignes trouvées:`, lines);
      
    const filteredLines = lines
      .filter(line => !line.includes('Ø')) // Exclure seulement les caractères bizarres spécifiques
      .filter(line => !line.includes('ÜÍ')) // Exclure aussi ces caractères
      .filter(line => !line.includes('Ü¡')) // Et ceux-là aussi
      .filter(line => line.includes(':')) // Seulement les lignes avec des labels
      .filter(line => line.length < 200); // Éviter les lignes trop longues

    console.log(`Lignes filtrées pour ${config.name}:`, filteredLines);

    const seenLabels = new Set();
    
    filteredLines.forEach(line => {
      // Pattern principal pour "Label: Valeur"
      const match = line.match(/^([^:]+?):\s*(.+)$/);
      if (match) {
        let label = match[1].trim();
        let value = match[2].trim();
        
        console.log(`Traitement: "${label}" = "${value}"`);
        
        // Nettoyer et valider le label
        if (label.length > 80 || seenLabels.has(label)) return;
        
        // Nettoyer la valeur
        if (value.includes('/')) {
          // Corriger les montants mal formatés "25 /000,00 €"
          value = value.replace(/(\d+)\s*\/\s*(\d{3})/g, '$1 $2');
        }
        
        // Corriger le formatage des montants
        if (value.includes('€')) {
          value = value.replace(/€/g, ' EUR');
        }
        
        // Ajouter des espaces aux montants sans séparateurs
        if (value.match(/^\d{5,}(,\d{2})?EUR$/)) {
          // Par exemple: "25000,00EUR" -> "25 000,00 EUR"
          value = value.replace(/(\d{1,3})(\d{3})/g, '$1 $2').replace(/EUR/, ' EUR');
        }
        
        // Nettoyer les espaces multiples
        value = value.replace(/\s+/g, ' ').trim();
        
        // Valider la valeur finale
        if (value && 
            value.length > 0 && 
            value.length < 100 &&
            !(value.match(/^\d+$/) && parseInt(value) < 1000)) {
          
          console.log(`Ajout: "${label}" = "${value}"`);
          results[label] = value;
          seenLabels.add(label);
        }
      }
    });
  }

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
      "Taux endettement actuel": formatPercent(data.tauxEndettementActuel) + " %",
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
      const parts = formatted.toString().split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      const decimalPart = parts[1] ? ',' + parts[1].padEnd(2, '0') : ',00';
      return integerPart + decimalPart + ' EUR';
    };
    
    const formatPercent = (percent) => {
      const formatted = Math.round(percent * 100) / 100;
      const parts = formatted.toString().split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1] ? ',' + parts[1].padEnd(2, '0') : ',00';
      return integerPart + decimalPart;
    };
    
    return {
      'Prix de vente': formatCurrency(data.prixVente),
      'Prix de revient': formatCurrency(data.prixRevient),
      'Plus-value brute': formatCurrency(data.plusValueBrute),
      'Duree detention': data.dureeDetention.toFixed(1) + ' ans',
      'Abattement IR': formatPercent(data.abattementIR) + ' %',
      'Abattement PS': formatPercent(data.abattementPS) + ' %',
      'Plus-value IR': formatCurrency(data.plusValueIR),
      'Plus-value PS': formatCurrency(data.plusValuePS),
      'Impot sur le revenu': formatCurrency(data.impotIR),
      'Prelevements sociaux': formatCurrency(data.impotPS),
      'Surtaxe': formatCurrency(data.surtaxe),
      'Impot total': formatCurrency(data.impotTotal),
      'Plus-value nette': formatCurrency(data.plusValueNette)
    };
  }
  
  return collectGenericResults({ resultsId: "results" });
}