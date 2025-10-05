/**
 * Module PDF Export - Version statique avec imports npm
 * Fonctionne en dev ET en prod (Vercel)
 */

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

console.log("🟢 pdfExport.js CHARGÉ (version statique)");

/**
 * Exporte les résultats du calculateur en PDF
 */
async function exportCalculatorToPDF(calculatorName, data, notes = []) {
  try {
    console.log("📄 Début export PDF:", calculatorName);

    // Priorité : chercher le div des résultats seulement (pas le formulaire)
    const resultsSelectors = [
      "#ponts-calendar", // Calendrier ponts
      "#calculator-result", // CalculatorFrame
      "#results", // Anciens calculateurs
      ".calculator-results", // Classe générique
      '[id$="-results"]', // IDs se terminant par -results
    ];

    let resultsDiv = null;
    for (const selector of resultsSelectors) {
      const element = document.querySelector(selector);
      if (
        element &&
        !element.classList.contains("hidden") &&
        element.textContent.trim().length > 50
      ) {
        resultsDiv = element;
        console.log("✅ Zone de résultats trouvée:", selector);
        break;
      }
    }

    if (!resultsDiv) {
      console.error("❌ Aucune zone de résultats visible trouvée");
      alert("Veuillez d'abord effectuer un calcul");
      return;
    }

    // Vérifier qu'il y a du contenu calculé
    if (resultsDiv.textContent.trim().length < 50) {
      console.error("❌ Zone de résultats vide");
      alert("Veuillez d'abord effectuer un calcul");
      return;
    }

    console.log("📸 Capture de la zone de résultats → Canvas...");
    console.log(
      "📏 Dimensions:",
      resultsDiv.offsetWidth,
      "x",
      resultsDiv.offsetHeight
    );

    // Cloner le div pour le nettoyer sans modifier l'affichage
    const clonedDiv = resultsDiv.cloneNode(true);
    document.body.appendChild(clonedDiv);
    clonedDiv.style.position = "absolute";
    clonedDiv.style.left = "-9999px";
    clonedDiv.style.background = "#ffffff";
    clonedDiv.style.padding = "20px";

    // Nettoyer les emojis et caractères spéciaux problématiques
    const cleanText = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Remplacer les emojis courants par du texte
        let text = node.textContent;
        text = text.replace(/📊|📈|📉|💰|💵|💶|💷|🏦|🏠|🏡|📋|✅|❌|⚠️|ℹ️|📄|🔍|📌/g, "");
        text = text.replace(/\s*\/\s*/g, " "); // Nettoyer les espaces avec slash
        text = text.replace(/\u00A0/g, " "); // Non-breaking space → espace normal
        text = text.replace(/\u202F/g, " "); // Narrow no-break space
        text = text.replace(/\u2009/g, " "); // Thin space
        node.textContent = text.trim();
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Parcourir récursivement
        Array.from(node.childNodes).forEach(cleanText);
      }
    };

    cleanText(clonedDiv);

    // Capturer le clone nettoyé
    const canvas = await html2canvas(clonedDiv, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      removeContainer: true,
    });

    // Supprimer le clone
    document.body.removeChild(clonedDiv);

    console.log("✅ Canvas créé:", canvas.width, "x", canvas.height);

    // Créer le PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // marges de 10mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 10;

    // Titre
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(44, 82, 130);
    pdf.text(calculatorName, 10, yPosition);
    yPosition += 10;

    // Date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(107, 114, 128);
    const dateStr = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.text(`Généré le ${dateStr}`, 10, yPosition);
    yPosition += 10;

    // Image des résultats
    if (imgHeight > pdfHeight - yPosition - 10) {
      // Si l'image est trop grande, on la découpe en plusieurs pages
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(
          remainingHeight,
          pdfHeight - yPosition - 10
        );
        const sourceHeight = (sliceHeight * canvas.height) / imgHeight;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const sliceData = sliceCanvas.toDataURL("image/png");
        pdf.addImage(sliceData, "PNG", 10, yPosition, imgWidth, sliceHeight);

        remainingHeight -= sliceHeight;
        sourceY += sourceHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = 10;
        }
      }
    } else {
      pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
    }

    // Notes en bas de page si présentes
    if (notes && notes.length > 0) {
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Notes", 10, 20);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      let noteY = 30;
      notes.forEach((note) => {
        const lines = pdf.splitTextToSize(note, pdfWidth - 20);
        pdf.text(lines, 10, noteY);
        noteY += lines.length * 5;
      });
    }

    // Télécharger
    const filename = `${calculatorName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}.pdf`;
    pdf.save(filename);
    console.log("✅ PDF généré:", filename);
  } catch (error) {
    console.error("❌ Erreur export PDF:", error);
    alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
  }
}

/**
 * Crée un bouton d'export PDF (toujours visible mais désactivé si pas de résultats)
 */
function createPDFButton(containerId, calculatorName, data, notes = []) {
  console.log("🎨 Création bouton PDF pour:", calculatorName);

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`❌ Conteneur ${containerId} introuvable`);
    return;
  }

  // Vérifier si le bouton existe déjà
  let button = document.getElementById("pdf-export-btn");
  if (button) {
    console.log("ℹ️ Bouton PDF déjà présent, mise à jour de l'état");
    updateButtonState(button, calculatorName);
    return button;
  }

  // Créer le bouton
  button = document.createElement("button");
  button.id = "pdf-export-btn";
  button.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <span>Exporter en PDF</span>
  `;

  button.addEventListener("click", (e) => {
    // Double vérification : empêcher le clic si le bouton est désactivé
    if (button.disabled) {
      e.preventDefault();
      e.stopPropagation();
      console.warn("⚠️ Clic bloqué : bouton désactivé");
      return false;
    }
    exportCalculatorToPDF(calculatorName, data, notes);
  });

  container.appendChild(button);

  // Définir l'état initial
  updateButtonState(button, calculatorName);

  console.log("✅ Bouton PDF créé");
  return button;
}

/**
 * Met à jour l'état du bouton selon si des résultats sont présents
 */
function updateButtonState(button, calculatorName) {
  // Chercher les zones de résultats (pas les formulaires)
  const resultsSelectors = [
    "#ponts-calendar", // Calendrier ponts (toujours actif)
    "#calculator-result", // CalculatorFrame
    "#results", // Anciens calculateurs
    ".calculator-results", // Classe générique
    '[id$="-results"]', // IDs se terminant par -results
  ];

  let hasResults = false;
  let resultContainer = null;

  for (const selector of resultsSelectors) {
    const container = document.querySelector(selector);
    if (container && !container.classList.contains("hidden")) {
      // Pour le calendrier des ponts : toujours activer si le contenu existe
      if (selector === "#ponts-calendar" && container.children.length > 0) {
        hasResults = true;
        resultContainer = container;
        console.log("✅ Calendrier ponts détecté - bouton activé automatiquement");
        break;
      }

      // Vérifier qu'il y a du contenu réel
      const textContent = container.textContent.trim();

      // Vérifications :
      // 1. Au moins 100 caractères de contenu
      // 2. Contient des chiffres (résultats de calcul ou dates)
      // 3. Pour les calculateurs financiers : doit avoir € ou %
      //    Pour les calendriers/autres : juste contenu + chiffres suffit
      const hasEnoughContent = textContent.length > 100;
      const hasNumbers = /\d/.test(textContent);
      const hasCurrencyOrPercent = /[€%]/.test(textContent);
      const isCalendar = selector.includes("calendar") || selector.includes("ponts");

      // Calendrier : juste contenu + chiffres suffit
      // Autres : besoin de € ou %
      const isValid = hasEnoughContent && hasNumbers && (isCalendar || hasCurrencyOrPercent);

      if (isValid) {
        hasResults = true;
        resultContainer = container;
        console.log("✅ Résultats valides détectés dans:", selector);
        console.log("   - Longueur:", textContent.length);
        console.log("   - A des chiffres:", hasNumbers);
        console.log("   - A € ou %:", hasCurrencyOrPercent);
        console.log("   - Est calendrier:", isCalendar);
        break;
      }
    }
  }

  if (hasResults && resultContainer) {
    // Activer le bouton
    button.disabled = false;
    button.className =
      "bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center gap-2 cursor-pointer";
    button.querySelector("span").textContent = "Exporter en PDF";
    button.style.pointerEvents = "auto";
    console.log("✅ Bouton activé - Résultats valides détectés");
  } else {
    // Désactiver le bouton
    button.disabled = true;
    button.className =
      "bg-gray-400 text-gray-200 font-semibold py-3 px-6 rounded-lg shadow-md flex items-center gap-2 cursor-not-allowed opacity-60";
    button.querySelector("span").textContent =
      "Effectuez un calcul pour exporter";
    button.style.pointerEvents = "none"; // Empêcher les clics
    console.log("⏸️ Bouton désactivé - Aucun résultat valide");
  }
}

// Exports globaux pour compatibilité
window.createPDFButton = createPDFButton;
window.exportCalculatorToPDF = exportCalculatorToPDF;
window.updateButtonState = updateButtonState;

console.log("✅ window.createPDFButton défini:", typeof window.createPDFButton);
console.log(
  "✅ window.exportCalculatorToPDF défini:",
  typeof window.exportCalculatorToPDF
);
console.log(
  "✅ window.updateButtonState défini:",
  typeof window.updateButtonState
);
