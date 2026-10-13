/**
 * Module PDF Export - Version statique avec imports npm
 * Fonctionne en dev ET en prod (Vercel)
 */
import siteUpdate from "../data/site-update.json";

/** Mention ajoutée en bas de chaque PDF : estimation, date des barèmes, sources. */
function mentionLegale() {
  const page = window.location.origin + window.location.pathname.replace(/\.html$/, "");
  return [
    "Estimation indicative et non contractuelle : seul l'organisme compétent (CAF, impots.gouv.fr, notaire, employeur…) fixe le montant définitif.",
    `Barèmes vérifiés le ${siteUpdate.label} sur les sources officielles.`,
    `Détail du calcul et sources officielles : ${page}`,
  ];
}
/**
 * Exporte les résultats du calculateur en PDF
 */
/**
 * Exporte les résultats du calculateur en PDF avec chargement lazy des dépendances
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

    // Convertir les Canvas Chart.js en images pour qu'ils soient capturés correctement
    const canvases = resultsDiv.querySelectorAll("canvas");
    console.log("🎨 Nombre de Canvas trouvés:", canvases.length);
    const canvasImages = [];

    canvases.forEach((canvas, index) => {
      try {
        const imgData = canvas.toDataURL("image/png");
        console.log(
          "📊 Canvas #" + index + " ID:",
          canvas.id,
          "Dimensions:",
          canvas.width,
          "x",
          canvas.height
        );
        // Trouver le canvas correspondant dans le clone par position
        const clonedCanvases = clonedDiv.querySelectorAll("canvas");
        // Essayer de faire correspondre par ID si disponible, sinon par index
        let clonedCanvas = null;
        if (canvas.id) {
          clonedCanvas = clonedDiv.querySelector(`#${CSS.escape(canvas.id)}`);
        }
        if (!clonedCanvas) {
          clonedCanvas = clonedCanvases[index] || null;
        }
        if (clonedCanvas) {
          const img = document.createElement("img");
          img.src = imgData;

          // Utiliser les dimensions réelles du canvas
          let width = canvas.width || canvas.offsetWidth;
          let height = canvas.height || canvas.offsetHeight;
          if (!width || !height) {
            const rect = canvas.getBoundingClientRect();
            width = rect.width || 600;
            height = rect.height || 300;
          }

          img.style.width = width + "px";
          img.style.height = height + "px";
          img.style.display = "block";
          img.style.margin = "0 auto";

          clonedCanvas.parentNode && clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
          console.log(
            "✅ Canvas #" +
              index +
              " converti en image (" +
              width +
              "x" +
              height +
              ")"
          );
        }
      } catch (e) {
        console.warn("⚠️ Impossible de convertir canvas #" + index + ":", e);
      }
    });

    // Supprimer les boutons d'export du clone pour ne pas les capturer dans le PDF
    const exportButtons = clonedDiv.querySelectorAll(
      "#pdf-export-btn, #csv-export-btn"
    );
    exportButtons.forEach((btn) => {
      btn.style.display = "none";
      if (btn.parentElement) {
        btn.parentElement.style.display = "none";
      }
    });

    // Nettoyer les emojis et caractères spéciaux problématiques
    const cleanText = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Remplacer les emojis courants par du texte
        let text = node.textContent;
        text = text.replace(
          /📊|📈|📉|💰|💵|💶|💷|🏦|🏠|🏡|📋|✅|❌|⚠️|ℹ️|📄|🔍|📌/g,
          ""
        );
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
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    const canvas = await html2canvas(clonedDiv, {
      useCORS: true,
      scale: Math.max(2, Math.ceil(window.devicePixelRatio || 1)),
      backgroundColor: "#ffffff",
      logging: false,
      removeContainer: true,
    });

    // Supprimer le clone
    document.body.removeChild(clonedDiv);

    console.log("✅ Canvas créé:", canvas.width, "x", canvas.height);

    // Créer le PDF
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
    // JPEG compressé : en PNG, une capture pleine page pesait plusieurs dizaines de Mo
    const imgData = canvas.toDataURL("image/jpeg", 0.85);

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

        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.85);
        pdf.addImage(sliceData, "JPEG", 10, yPosition, imgWidth, sliceHeight);

        remainingHeight -= sliceHeight;
        sourceY += sourceHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = 10;
        }
      }
    } else {
      pdf.addImage(imgData, "JPEG", 10, yPosition, imgWidth, imgHeight);
    }

    // Notes du calculateur + mention obligatoire (estimation, date, sources)
    pdf.addPage();
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39);
    pdf.text("Notes", 10, 20);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    let noteY = 30;
    // Les notes arrivent soit en tableau, soit dans un objet { notes: [...] }
    const notesCalculateur = Array.isArray(notes)
      ? notes
      : Array.isArray(notes?.notes)
        ? notes.notes
        : [];
    [...notesCalculateur, ...mentionLegale()].forEach((note) => {
      const lines = pdf.splitTextToSize(note, pdfWidth - 20);
      pdf.text(lines, 10, noteY);
      noteY += lines.length * 5 + 2;
    });

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

  // Le bouton CSV est géré par le calculateur pour éviter les doublons

  return button;
}

/**
 * Met à jour l'état du bouton selon si des résultats sont présents
 */
function updateButtonState(button, calculatorName) {
  const resultsSelectors = [
    "#ponts-calendar",
    "#calculator-result",
    "#results",
    ".calculator-results",
    '[id$="-results"]',
  ];

  let hasResults = false;
  let resultContainer = null;

  for (const selector of resultsSelectors) {
    const container = document.querySelector(selector);
    if (container && !container.classList.contains("hidden")) {
      if (selector === "#ponts-calendar" && container.children.length > 0) {
        hasResults = true;
        resultContainer = container;
        break;
      }

      const textContent = container.textContent.trim();
      const hasEnoughContent = textContent.length > 20;
      const hasNumbers = /\d/.test(textContent);
      const hasCurrencyOrPercent = /[€%]/.test(textContent);
      const hasVisuals = !!container.querySelector("canvas, table");
      const isCalendar = selector.includes("calendar") || selector.includes("ponts");

      const isValid = (hasVisuals || (hasEnoughContent && hasNumbers)) && (isCalendar || hasCurrencyOrPercent || hasVisuals);

      if (isValid) {
        hasResults = true;
        resultContainer = container;
        break;
      }
    }
  }

  if (hasResults && resultContainer) {
    // Activer le bouton PDF
    button.disabled = false;
    button.className =
      "bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center gap-2 cursor-pointer";
    button.querySelector("span").textContent = "Exporter en PDF";
    button.style.pointerEvents = "auto";

    // Activer aussi le bouton CSV
    const csvBtn = document.getElementById("csv-export-btn");
    if (csvBtn) {
      csvBtn.disabled = false;
      csvBtn.className =
        "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center gap-2 cursor-pointer";
      csvBtn.style.pointerEvents = "auto";
      console.log("✅ Bouton CSV activé");
    }

    console.log("✅ Boutons activés - Résultats valides détectés");
  } else {
    // Désactiver le bouton PDF
    button.disabled = true;
    button.className =
      "bg-gray-400 text-gray-200 font-semibold py-3 px-6 rounded-lg shadow-md flex items-center gap-2 cursor-not-allowed opacity-60";
    button.querySelector("span").textContent =
      "Effectuez un calcul pour exporter";
    button.style.pointerEvents = "none"; // Empêcher les clics

    // Désactiver aussi le bouton CSV
    const csvBtn = document.getElementById("csv-export-btn");
    if (csvBtn) {
      csvBtn.disabled = true;
      csvBtn.className =
        "bg-gray-400 text-gray-200 font-semibold py-3 px-6 rounded-lg shadow-md flex items-center gap-2 cursor-not-allowed opacity-60";
      csvBtn.style.pointerEvents = "none";
      console.log("⏸️ Bouton CSV désactivé");
    }

    console.log("⏸️ Boutons désactivés - Aucun résultat valide");
  }
}

// Exports globaux pour compatibilité
window.createPDFButton = createPDFButton;
window.exportCalculatorToPDF = exportCalculatorToPDF;
window.updateButtonState = updateButtonState;
