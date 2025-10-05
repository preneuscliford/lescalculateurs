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
  const flexElements = resultDiv.querySelectorAll(".flex.justify-between");
  console.log(`Trouvé ${flexElements.length} éléments flex justify-between`);

  flexElements.forEach((element, index) => {
    const spans = element.querySelectorAll("span");
    console.log(`Élément ${index}: ${spans.length} spans trouvés`);

    if (spans.length >= 2) {
      const label = spans[0].textContent?.trim();
      const value = spans[1].textContent?.trim();

      console.log(`  Label: "${label}", Value: "${value}"`);

      if (label && value && label.includes(":") === false) {
        // Nettoyer le label (enlever le ':')
        const cleanLabel = label.replace(/:$/, "").trim();

        // Nettoyer la valeur (remplacer € par EUR, etc.)
        let cleanValue = value;
        if (cleanValue.includes("€")) {
          cleanValue = cleanValue.replace(/€/g, " EUR");
        }
        if (cleanValue.includes("/")) {
          cleanValue = cleanValue.replace(/(\d+)\s*\/\s*(\d{3})/g, "$1 $2");
        }

        results[cleanLabel] = cleanValue;
        console.log(`  ✅ Ajouté: "${cleanLabel}" = "${cleanValue}"`);
      }
    }
  });

  // Chercher les éléments avec font-medium (valeurs importantes)
  const mediumElements = resultDiv.querySelectorAll(".font-medium");
  console.log(`Trouvé ${mediumElements.length} éléments font-medium`);

  mediumElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Font-medium ${index}: "${text}"`);

    if (text && (text.includes("EUR") || text.includes("€"))) {
      // Essayer de trouver le label associé
      let label = "";

      // Chercher dans l'élément parent
      if (element.parentElement) {
        const parentText = element.parentElement.textContent?.trim() || "";
        const beforeValue = parentText.split(text)[0]?.trim();
        if (beforeValue && beforeValue.length > 0 && beforeValue.length < 50) {
          label = beforeValue.replace(/:$/, "").trim();
        }
      }

      if (label && !results[label]) {
        let cleanValue = text;
        if (cleanValue.includes("€")) {
          cleanValue = cleanValue.replace(/€/g, " EUR");
        }
        results[label] = cleanValue;
        console.log(`  ✅ Ajouté font-medium: "${label}" = "${cleanValue}"`);
      }
    }
  });

  // Chercher les éléments avec text-green-600 (total)
  const greenElements = resultDiv.querySelectorAll(".text-green-600");
  console.log(`Trouvé ${greenElements.length} éléments text-green-600`);

  greenElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    console.log(`Green ${index}: "${text}"`);

    if (text && (text.includes("EUR") || text.includes("€"))) {
      let label = "Total";

      // Essayer de trouver un label plus spécifique
      if (element.parentElement) {
        const parentText = element.parentElement.textContent?.trim() || "";
        const beforeValue = parentText.split(text)[0]?.trim();
        if (beforeValue && beforeValue.length > 0 && beforeValue.length < 50) {
          label = beforeValue.replace(/:$/, "").trim();
        }
      }

      let cleanValue = text;
      if (cleanValue.includes("€")) {
        cleanValue = cleanValue.replace(/€/g, " EUR");
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
      formId: "calculator-form",
      notes: ["Barèmes fiscaux officiels 2025."],
      type: "CalculatorFrame",
    },
    ponts: {
      name: "Calcul des Ponts",
      resultsId: "ponts-calendar",
      formId: "calculator-form",
      notes: ["Calendrier officiel des jours fériés 2025-2026."],
      type: "CalculatorFrame",
    },
    taxe: {
      name: "Taxe Foncière",
      resultsId: "taxe-calculator",
      formId: "calculator-form",
      notes: ["Estimation basée sur les taux moyens nationaux."],
      type: "CalculatorFrame",
    },
    travail: {
      name: "Durée Légale du Travail",
      resultsId: "travail-calculator",
      formId: "calculator-form",
      notes: ["Calculs selon le Code du travail français."],
      type: "CalculatorFrame",
    },
    plusvalue: {
      name: "Plus-Value Immobilière",
      resultsId: "results",
      formId: "plusvalue-form",
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
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const resultDiv = mutation.target;
          if (
            resultDiv &&
            resultDiv.id === "calculator-result" &&
            !resultDiv.classList.contains("hidden")
          ) {
            console.log(`Résultats visibles pour ${config.name}`);
            setupExportButtons(config);
            observer.disconnect();
          }
        }
      });
    });

    // Observer le div des résultats
    const resultDiv = document.getElementById("calculator-result");
    if (resultDiv) {
      observer.observe(resultDiv, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  } else {
    // Pour les anciens calculateurs - attendre que les résultats soient visibles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const resultsDiv = mutation.target;
          if (resultsDiv && !resultsDiv.classList.contains("hidden")) {
            console.log(
              `Résultats visibles pour ${config.name} (ancien calculateur)`
            );
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

      // Vérifier si les résultats sont déjà présents
      if (!resultsDiv.classList.contains("hidden")) {
        console.log(
          `Résultats déjà présents pour ${config.name} (ancien calculateur)`
        );
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
    // Pour Plus-Value Immobilière, utiliser directement window.plusValueData
    if (config.name === "Plus-Value Immobilière" && window.plusValueData) {
      const results = collectPlusValueResults();
      // Pas besoin de userInputs car tout est dans results
      return { userInputs: {}, results };
    }

    // Récupération des données du formulaire pour les autres calculateurs
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

  // Méthode améliorée : extraire les données importantes
  const textContent = resultDiv.textContent || "";

  console.log(`Contenu brut pour ${config.name}:`, textContent);

  // Essayer d'abord d'extraire depuis la structure HTML (pour les calculateurs comme notaire)
  const htmlResults = extractFromHTMLStructure(resultDiv);
  if (Object.keys(htmlResults).length > 0) {
    console.log(`Résultats extraits du HTML pour ${config.name}:`, htmlResults);
    Object.assign(results, htmlResults);
  }

  // Fallback vers l'extraction textuelle si nécessaire
  if (Object.keys(results).length < 3) {
    const lines = textContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log(`Toutes les lignes trouvées:`, lines);

    const filteredLines = lines
      .filter((line) => !line.includes("Ø")) // Exclure seulement les caractères bizarres spécifiques
      .filter((line) => !line.includes("ÜÍ")) // Exclure aussi ces caractères
      .filter((line) => !line.includes("Ü¡")) // Et ceux-là aussi
      .filter((line) => !line.includes("Ü")) // Et ceux-là aussi
      .filter((line) => !line.includes("ß")) // Et ceux-là aussi
      .filter((line) => !line.includes("¯")) // Et ceux-là aussi
      .filter((line) => !line.includes("Ê")) // Et ceux-là aussi
      .filter((line) => !line.includes("°")) // Et ceux-là aussi
      .filter((line) => !line.includes("¡")) // Et ceux-là aussi
      .filter((line) => !line.includes("Ë")) // Et ceux-là aussi
      .filter((line) => !line.includes("À")) // Et ceux-là aussi
      .filter((line) => !line.includes("Í")) // Et ceux-là aussi
      .filter((line) => line.includes(":")) // Seulement les lignes avec des labels
      .filter((line) => line.length < 200); // Éviter les lignes trop longues

    console.log(`Lignes filtrées pour ${config.name}:`, filteredLines);

    const seenLabels = new Set();

    filteredLines.forEach((line) => {
      // Pattern principal pour "Label: Valeur"
      const match = line.match(/^([^:]+?):\s*(.+)$/);
      if (match) {
        let label = match[1].trim();
        let value = match[2].trim();

        console.log(`Traitement: "${label}" = "${value}"`);

        // Nettoyer et valider le label
        if (label.length > 80 || seenLabels.has(label)) return;

        // Nettoyer la valeur
        if (value.includes("/")) {
          // Corriger les montants mal formatés "25 /000,00 €"
          value = value.replace(/(\d+)\s*\/\s*(\d{3})/g, "$1 $2");
        }

        // Corriger le formatage des montants
        if (value.includes("€")) {
          value = value.replace(/€/g, " EUR");
        }

        // Ajouter des espaces aux montants sans séparateurs
        if (value.match(/^\d{5,}(,\d{2})?EUR$/)) {
          // Par exemple: "25000,00EUR" -> "25 000,00 EUR"
          value = value
            .replace(/(\d{1,3})(\d{3})/g, "$1 $2")
            .replace(/EUR/, " EUR");
        }

        // Nettoyer les espaces multiples
        value = value.replace(/\s+/g, " ").trim();

        // Valider la valeur finale
        if (
          value &&
          value.length > 0 &&
          value.length < 100 &&
          !(value.match(/^\d+$/) && parseInt(value) < 1000)
        ) {
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

  // Diviser le texte en lignes et filtrer les caractères étranges
  const lines = textContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter(
      (line) =>
        !line.includes("Ø") &&
        !line.includes("Ü") &&
        !line.includes("ß") &&
        !line.includes("¯") &&
        !line.includes("Ê") &&
        !line.includes("°") &&
        !line.includes("¡") &&
        !line.includes("Ë") &&
        !line.includes("À") &&
        !line.includes("Í")
    )
    .filter((line) => line.includes(":") && line.length < 200);

  // Extraire les données structurées Label: Valeur
  lines.forEach((line) => {
    const match = line.match(/^([^:]+?):\s*(.+)$/);
    if (match) {
      const label = match[1].trim();
      let value = match[2].trim();

      // Nettoyer la valeur
      value = value.replace(/(\d+)\s*\/\s*(\d{3})/g, "$1 $2"); // Corriger "25 /000"
      value = value.replace(/€/g, " EUR"); // Remplacer € par EUR
      value = value.replace(/\s+/g, " ").trim(); // Nettoyer espaces

      if (label && value && !results[label]) {
        results[label] = value;
      }
    }
  });

  // Fallback vers les patterns regex si pas assez de données structurées
  if (Object.keys(results).length < 3) {
    let match;
    while ((match = euroPattern.exec(textContent)) !== null) {
      const value = match[1] + " EUR";
      const label = "Montant " + Object.keys(results).length;
      if (!results[label]) {
        results[label] = value;
      }
    }

    while ((match = percentPattern.exec(textContent)) !== null) {
      const value = match[1] + " %";
      const label = "Pourcentage " + Object.keys(results).length;
      if (!results[label]) {
        results[label] = value;
      }
    }
  }
}

function collectFinancementResults() {
  const results = {};
  const resultsDiv = document.getElementById("results");

  if (resultsDiv) {
    // Chercher tous les éléments qui peuvent contenir du texte
    const allElements = resultsDiv.querySelectorAll("*");

    allElements.forEach((element) => {
      const text = element.textContent?.trim();
      if (text && text.includes(":")) {
        // Filtrer les éléments avec des caractères étranges ou dupliqués
        const hasStrangeChars = /Ø|Ü|ß|¯|Ê|°|¡|Ë|À|Í/.test(text);
        if (hasStrangeChars || text.length > 200) {
          return;
        }

        // Éviter les duplications et les éléments parasites
        const label = text.split(":")[0]?.trim();
        if (
          results[label] ||
          label.includes("Notes") ||
          label.includes("Conseil") ||
          label.includes("À retenir")
        ) {
          return;
        }

        const [rawLabel, value] = text.split(":").map((s) => s.trim());
        if (rawLabel && value && rawLabel.length < 100 && value.length < 100) {
          // Nettoyer la valeur
          let cleanValue = value;
          // Corriger les montants mal formatés "25 /000,00 €"
          cleanValue = cleanValue.replace(/(\d+)\s*\/\s*(\d{3})/g, "$1 $2");
          // Remplacer € par EUR
          cleanValue = cleanValue.replace(/€/g, " EUR");
          // Nettoyer les espaces multiples
          cleanValue = cleanValue.replace(/\s+/g, " ").trim();

          // Ajouter les unités manquantes selon le type de champ
          if (
            rawLabel.toLowerCase().includes("durée") ||
            rawLabel.toLowerCase().includes("duree")
          ) {
            if (
              !cleanValue.toLowerCase().includes("mois") &&
              !cleanValue.toLowerCase().includes("an") &&
              !cleanValue.toLowerCase().includes("ans")
            ) {
              cleanValue += " mois";
            }
          } else if (
            rawLabel.toLowerCase().includes("taux") ||
            rawLabel.toLowerCase().includes("intérêt") ||
            rawLabel.toLowerCase().includes("interet")
          ) {
            if (!cleanValue.includes("%")) {
              cleanValue += " %";
            }
          } else if (
            (rawLabel.toLowerCase().includes("charge") ||
              rawLabel.toLowerCase().includes("frais") ||
              rawLabel.toLowerCase().includes("loyer") ||
              rawLabel.toLowerCase().includes("assurance") ||
              rawLabel.toLowerCase().includes("revenu") ||
              rawLabel.toLowerCase().includes("salaire") ||
              rawLabel.toLowerCase().includes("prix") ||
              rawLabel.toLowerCase().includes("apport") ||
              rawLabel.toLowerCase().includes("total") ||
              rawLabel.toLowerCase().includes("montant")) &&
            /^\d/.test(cleanValue) &&
            !cleanValue.toLowerCase().includes("eur")
          ) {
            cleanValue += " EUR";
          }

          results[rawLabel] = cleanValue;
        }
      }
    });
  }

  return results;
}

function collectPlusValueResults() {
  const results = {};

  // Essayer d'abord de récupérer les données structurées depuis window.plusValueData
  if (window.plusValueData) {
    const data = window.plusValueData;

    // Fonction helper pour formater les montants
    function formatCurrency(amount) {
      const formatted = new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      // Remplacer les espaces insécables par des espaces normaux
      return formatted.replace(/\s/g, " ") + " EUR";
    }

    // Fonction helper pour formater les pourcentages
    function formatPercent(value) {
      return value.toFixed(1) + "%";
    }

    // Fonction helper pour formater les dates
    function formatDate(date) {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Fonction helper pour formater la durée
    function formatDuree(dureeAnnes) {
      const anneesEntier = Math.floor(dureeAnnes);
      const mois = Math.round((dureeAnnes - anneesEntier) * 12);

      // Si proche d'une année complète, arrondir
      if (mois >= 10) {
        return `${anneesEntier + 1} ans`;
      } else if (mois > 0) {
        return `${anneesEntier} ans ${mois} mois`;
      } else {
        return `${anneesEntier} ans`;
      }
    }

    // Données saisies
    results["Prix de vente"] = formatCurrency(data.prixVente);
    results["Prix d'achat"] = formatCurrency(data.prixAchat);
    results["Frais d'achat"] = formatCurrency(data.fraisAchat);
    results["Travaux"] = formatCurrency(data.travaux);
    results["Date d'achat"] = formatDate(data.dateAchat);
    results["Date de vente"] = formatDate(data.dateVente);

    const typeBienMap = {
      secondaire: "Residence secondaire",
      investissement: "Investissement locatif",
      terrain: "Terrain a batir",
    };
    results["Type de bien"] = typeBienMap[data.typeBien] || data.typeBien;

    // Résultats du calcul
    results["Duree de detention"] = formatDuree(data.dureeDetention);
    results["Prix de revient"] = formatCurrency(data.prixRevient);
    results["Plus-value brute"] = formatCurrency(data.plusValueBrute);
    results["Abattement impot sur le revenu"] = formatPercent(
      data.abattementIR
    );
    results["Abattement prelevements sociaux"] = formatPercent(
      data.abattementPS
    );
    results["Plus-value taxable (IR)"] = formatCurrency(data.plusValueIR);
    results["Plus-value taxable (PS)"] = formatCurrency(data.plusValuePS);
    results["Impot sur le revenu (19%)"] = formatCurrency(data.impotIR);

    if (data.surtaxe > 0) {
      results["Surtaxe (plus-value > 50k€)"] = formatCurrency(data.surtaxe);
    }

    results["Prelevements sociaux (17.2%)"] = formatCurrency(data.impotPS);
    results["Total des impots"] = formatCurrency(data.impotTotal);
    results["Plus-value nette (apres impots)"] = formatCurrency(
      data.plusValueNette
    );

    const tauxImpositionEffectif =
      (data.impotTotal / data.plusValueBrute) * 100;
    results["Taux d'imposition effectif"] = formatPercent(
      tauxImpositionEffectif
    );

    return results;
  }

  // Fallback : méthode générique si window.plusValueData n'existe pas
  const resultsDiv = document.getElementById("results");

  if (resultsDiv) {
    // Chercher tous les éléments qui peuvent contenir du texte
    const allElements = resultsDiv.querySelectorAll("*");

    allElements.forEach((element) => {
      const text = element.textContent?.trim();
      if (text && text.includes(":")) {
        // Filtrer les éléments avec des caractères étranges ou dupliqués
        const hasStrangeChars = /Ø|Ü|ß|¯|Ê|°|¡|Ë|À|Í/.test(text);
        if (hasStrangeChars || text.length > 200) {
          return;
        }

        // Éviter les duplications et les éléments parasites
        const label = text.split(":")[0]?.trim();
        if (
          results[label] ||
          label.includes("Notes") ||
          label.includes("Conseil") ||
          label.includes("À retenir")
        ) {
          return;
        }

        const [rawLabel, value] = text.split(":").map((s) => s.trim());
        if (rawLabel && value && rawLabel.length < 100 && value.length < 100) {
          // Nettoyer la valeur
          let cleanValue = value;
          // Corriger les montants mal formatés "25 /000,00 €"
          cleanValue = cleanValue.replace(/(\d+)\s*\/\s*(\d{3})/g, "$1 $2");
          // Remplacer € par EUR
          cleanValue = cleanValue.replace(/€/g, " EUR");
          // Nettoyer les espaces multiples
          cleanValue = cleanValue.replace(/\s+/g, " ").trim();

          results[rawLabel] = cleanValue;
        }
      }
    });
  }

  return results;
}
