/**
 * Module PDF Export Universel - LesCalculateurs.fr
 * Export PDF générique pour tous les calculateurs
 */

console.log("🟢 universalPDFExport.js CHARGÉ");

// Import dynamique de jsPDF via CDN pour éviter les problèmes de build
async function loadJsPDF() {
  if (window.jsPDF) {
    return window.jsPDF;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      resolve(window.jspdf.jsPDF);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Génère et télécharge un PDF des résultats de calcul
 */
async function exportCalculatorToPDF(
  calculatorName,
  userInputs,
  results,
  options = {}
) {
  try {
    const jsPDF = await loadJsPDF();
    const pdf = new jsPDF("p", "mm", "a4");

    let yPosition = 20;
    const leftMargin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // En-tête avec titre
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(44, 82, 130);
    pdf.text(`Résultats - ${calculatorName}`, leftMargin, yPosition);
    yPosition += 12;

    // Date de génération
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(107, 114, 128);
    const currentDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    pdf.text(`Généré le ${currentDate}`, leftMargin, yPosition);
    yPosition += 15;

    // Ligne de séparation
    pdf.setDrawColor(229, 231, 235);
    pdf.line(leftMargin, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Section données saisies (uniquement si non vide)
    const hasUserInputs = Object.keys(userInputs).length > 0;

    if (hasUserInputs) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      pdf.text("Donnees saisies", leftMargin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(75, 85, 99);
    }

    // Affichage des données utilisateur
    Object.entries(userInputs).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== 0
      ) {
        const label = formatLabel(key);
        const formattedValue = formatValue(value);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(75, 85, 99);

        // Utiliser un système de colonnes pour un meilleur alignement
        pdf.text(`${label}:`, leftMargin, yPosition);
        pdf.text(formattedValue, leftMargin + 80, yPosition);
        yPosition += 5;

        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      }
    });

    if (hasUserInputs) {
      yPosition += 8;
    }

    // Section résultats
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(31, 41, 55);
    pdf.text("Resultats du calcul", leftMargin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);

    // Affichage des résultats
    Object.entries(results).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        const label = formatLabel(key);
        const formattedValue = formatValue(value);

        // Ignorer les valeurs numériques isolées sans contexte
        if (formattedValue.match(/^\d+$/) && parseInt(formattedValue) < 1000) {
          console.log(`Ignoring isolated number: ${formattedValue}`);
          return;
        }

        // Mise en évidence des résultats principaux
        if (isMainResult(key)) {
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(16, 185, 129);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(75, 85, 99);
        }

        // Système d'alignement fixe avec colonnes
        pdf.text(`${label}:`, leftMargin, yPosition);
        pdf.text(formattedValue, leftMargin + 80, yPosition);
        yPosition += 6;

        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      }
    });

    // Notes importantes
    if (options.notes && options.notes.length > 0) {
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(185, 28, 28);
      pdf.text("Notes importantes:", leftMargin, yPosition);
      yPosition += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      options.notes.forEach((note) => {
        const lines = pdf.splitTextToSize(note, pageWidth - 40);
        pdf.text(lines, leftMargin, yPosition);
        yPosition += lines.length * 3 + 2;
      });
    }

    // Watermark sur toutes les pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // Watermark diagonal - DÉSACTIVÉ pour l'instant
      // pdf.setFontSize(30);
      // pdf.setFont("helvetica", "bold");
      // pdf.setTextColor(240, 240, 240);
      // pdf.text("LesCalculateurs.fr", pageWidth / 2, 150, {
      //   align: "center",
      //   angle: 45,
      // });

      // Footer
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(107, 114, 128);

      pdf.text("Realise avec LesCalculateurs.fr", leftMargin, 285);
      pdf.text(`Page ${i}/${totalPages}`, pageWidth - 20, 285, {
        align: "right",
      });
      pdf.text(
        "Resultats indicatifs - Consultez un professionnel",
        pageWidth / 2,
        290,
        { align: "center" }
      );
    }

    // Téléchargement
    const fileName = `${calculatorName.toLowerCase().replace(/\s+/g, "-")}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Erreur export PDF:", error);
    throw new Error("Impossible de générer le PDF");
  }
}

/**
 * Formate les labels pour l'affichage PDF (sans accents ni caractères spéciaux)
 */
function formatLabel(key) {
  const labelMap = {
    salaire: "Salaire",
    autresRevenus: "Autres Revenus",
    loyerPret: "Loyer Pret",
    autresCredits: "Autres Credits",
    assurances: "Assurances",
    chargesFixes: "Charges Fixes",
    typeAchat: "Type Achat",
    prixTotal: "Prix Total",
    apport: "Apport",
    dureeCredit: "Duree Credit",
    tauxInteret: "Taux Interet",
    mensualite: "Mensualite",
    coutTotal: "Cout Total",
    capaciteEmprunt: "Capacite Emprunt",
    montantEmprunte: "Montant Emprunte",
    tauxEndettement: "Taux Endettement",
  };

  if (labelMap[key]) {
    return labelMap[key];
  }

  // Si le label contient déjà des espaces ou des parenthèses, le retourner tel quel
  if (key.includes(" ") || key.includes("(")) {
    return key;
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/à/g, "a")
    .replace(/ç/g, "c")
    .replace(/ù/g, "u")
    .replace(/ô/g, "o")
    .trim();
}

/**
 * Formate les valeurs pour l'affichage PDF (sans caractères spéciaux)
 */
function formatValue(value) {
  // Si la valeur est déjà une chaîne avec EUR, la retourner telle quelle
  if (typeof value === "string" && value.includes("EUR")) {
    return value;
  }

  // Si la valeur est déjà une chaîne avec format date (DD/MM/YYYY), la retourner telle quelle
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  if (typeof value === "number") {
    if (Math.abs(value) >= 1000) {
      // Formatage manuel pour éviter les problèmes d'encodage
      const formatted = Math.round(value * 100) / 100; // Arrondi à 2 décimales
      const parts = formatted.toString().split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "); // Espaces pour milliers
      const decimalPart = parts[1] ? "," + parts[1].padEnd(2, "0") : ",00";
      return integerPart + decimalPart + " EUR";
    }
    // Pour les petits nombres
    return (
      value.toString() +
      (value.toString().includes("%")
        ? ""
        : value > 100
        ? " EUR"
        : value < 1 && value > 0
        ? " %"
        : "")
    );
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("fr-FR");
  }

  // Nettoyage et normalisation des chaînes de caractères
  let cleanValue = value.toString();

  // Première étape : normaliser TOUS les types d'espaces en espaces normaux
  cleanValue = cleanValue
    .replace(/\u00A0/g, " ") // Espace insécable -> espace normal
    .replace(/\u2009/g, " ") // Espace fine -> espace normal
    .replace(/\u202F/g, " ") // Espace insécable étroite -> espace normal
    .replace(/[\u2000-\u200B]/g, " "); // Tous les espaces Unicode -> espace normal

  // Supprimer TOUS les caractères problématiques d'un coup
  cleanValue = cleanValue
    // Supprimer les caractères bizarres Unicode et emojis corrompus
    .replace(/[^\x20-\x7E\u00C0-\u017F]/g, "") // Garde seulement ASCII + Latin étendu
    .replace(/Ø=Ü[ÍÎ¡]/g, "") // Supprimer spécifiquement les caractères bizarres vus
    .replace(/[ÍÎÑÕÖÔªº°]/g, "") // Autres caractères problématiques
    .replace(/💡/g, "") // Supprimer les emojis qui se corrompent
    .replace(/📍/g, "") // Supprimer les emojis qui se corrompent
    .replace(/📌/g, "") // Supprimer autres emojis potentiels
    .replace(/⚠️/g, "") // Supprimer warning emoji
    .replace(/ℹ️/g, "") // Supprimer info emoji

    // Corriger les montants mal formatés avec slashes: "1 /305,00" -> "1305,00"
    .replace(/(\d+)\s*\/\s*(\d{3})/g, "$1$2") // Enlever les slashes entre chiffres
    .replace(/(\d{1,3}(?:\s\d{3})*(?:,\d{2})?)\s*€/g, "$1 EUR") // € -> EUR

    // Reformater tous les montants pour ajouter les espaces de milliers
    .replace(/(\d{4,})(?=,\d{2}\s*EUR)/g, (match) => {
      // Ajouter des espaces aux milliers: 1305 -> 1 305
      return match.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    })

    // Corriger les montants collés comme "25000,00EUR" (sans espace avant EUR)
    .replace(/(\d{4,})(,\d{2})?EUR/g, (match, amount, decimal) => {
      // Ajouter des espaces aux milliers
      const formatted = amount.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return formatted + (decimal || ",00") + " EUR";
    })

    // Normaliser les caractères accentués
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/ñ/g, "n")

    // Nettoyer les espaces
    .replace(/\s+/g, " ")
    .trim();

  return cleanValue;
}

/**
 * Détermine si un résultat est principal (à mettre en évidence)
 */
function isMainResult(key) {
  const mainKeys = [
    "total",
    "final",
    "net",
    "montant",
    "frais",
    "cout",
    "resultat",
    "gain",
    "perte",
    "benefice",
    "economie",
  ];
  return mainKeys.some((k) => key.toLowerCase().includes(k));
}

/**
 * Crée un bouton d'export PDF générique
 */
function createPDFButton(
  containerId,
  calculatorName,
  getDataFunction,
  options = {}
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const button = document.createElement("button");
  button.id = "pdf-export-btn";
  button.className =
    "bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed";
  button.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    <span>Exporter en PDF</span>
  `;

  button.addEventListener("click", async () => {
    const originalContent = button.innerHTML;

    try {
      // État de chargement
      button.disabled = true;
      button.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Generation en cours...</span>
      `;

      // Récupération des données
      const data = getDataFunction();
      if (!data || !data.userInputs || !data.results) {
        throw new Error("Données insuffisantes pour l'export");
      }

      // Export PDF
      await exportCalculatorToPDF(
        calculatorName,
        data.userInputs,
        data.results,
        options
      );

      // État de succès
      button.innerHTML = `
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>PDF telecharge avec succes !</span>
      `;

      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalContent;
      }, 3000);
    } catch (error) {
      console.error("Erreur export:", error);

      button.innerHTML = `
        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Erreur lors de l'export</span>
      `;

      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalContent;
      }, 3000);
    }
  });

  container.appendChild(button);
}

// Export pour utilisation globale
console.log("📤 Export des fonctions vers window...");
window.createPDFButton = createPDFButton;
window.exportCalculatorToPDF = exportCalculatorToPDF;
console.log("✅ window.createPDFButton défini:", typeof window.createPDFButton);
console.log(
  "✅ window.exportCalculatorToPDF défini:",
  typeof window.exportCalculatorToPDF
);
