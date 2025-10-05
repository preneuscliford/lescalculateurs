/**
 * Composant PDF Export Button - LesCalculateurs.fr
 * Bouton réutilisable pour l'export PDF
 */

// Types importés
interface PDFExportData {
  title: string;
  subtitle?: string;
  calculatorName: string;
  userInputs: Record<string, any>;
  results: Record<string, any>;
  explanations?: string[];
  additionalNotes?: string[];
}

/**
 * Crée un bouton d'export PDF
 */
export function createPDFExportButton(
  containerId: string,
  getPDFData: () => PDFExportData,
  options: {
    buttonText?: string;
    buttonClass?: string;
    loadingText?: string;
    successText?: string;
    errorText?: string;
  } = {}
): void {
  const {
    buttonText = "📄 Exporter en PDF",
    buttonClass = "pdf-export-btn",
    loadingText = "⏳ Génération du PDF...",
    successText = "✅ PDF téléchargé !",
    errorText = "❌ Erreur lors de l'export",
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  // Création du bouton
  const button = document.createElement("button");
  button.id = "pdf-export-button";
  button.className = `${buttonClass} bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`;
  button.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    <span>${buttonText}</span>
  `;

  // Gestionnaire de clic
  button.addEventListener("click", async () => {
    try {
      // État de chargement
      button.disabled = true;
      button.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${loadingText}</span>
      `;

      // Récupération des données
      const data = getPDFData();

      // Validation des données requises
      if (!data.title || !data.calculatorName || !data.results) {
        throw new Error("Données insuffisantes pour générer le PDF");
      }

      // Import dynamique pour éviter le chargement initial
      const { exportCalculationToPDF } = await import(
        "../utils/pdfExporter.js"
      );

      // Génération du PDF
      await exportCalculationToPDF(data);

      // État de succès
      button.innerHTML = `
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${successText}</span>
      `;

      // Retour à l'état normal après 3 secondes
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>${buttonText}</span>
        `;
      }, 3000);
    } catch (error) {
      console.error("Erreur export PDF:", error);

      // État d'erreur
      button.innerHTML = `
        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>${errorText}</span>
      `;

      // Retour à l'état normal après 3 secondes
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>${buttonText}</span>
        `;
      }, 3000);
    }
  });

  // Ajout au container
  container.appendChild(button);
}

/**
 * Version simplifiée pour intégration directe en HTML
 */
export function initPDFExport(
  buttonId: string,
  getDataFunction: string,
  calculatorName: string
): void {
  const button = document.getElementById(buttonId);
  if (!button) {
    console.error(`Button with id "${buttonId}" not found`);
    return;
  }

  button.addEventListener("click", async () => {
    try {
      // Récupération de la fonction de données depuis le scope global
      const getData = (window as any)[getDataFunction];
      if (typeof getData !== "function") {
        throw new Error(
          `Function ${getDataFunction} not found in global scope`
        );
      }

      const data = getData();
      data.calculatorName = calculatorName;

      // Import et export
      const { exportCalculationToPDF } = await import(
        "../utils/pdfExporter.js"
      );
      await exportCalculationToPDF(data);
    } catch (error) {
      console.error("Erreur export PDF:", error);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    }
  });
}

/**
 * Utilitaire pour collecter automatiquement les données d'un formulaire
 */
export function collectFormData(formId: string): Record<string, any> {
  const form = document.getElementById(formId) as HTMLFormElement;
  if (!form) {
    throw new Error(`Form with id "${formId}" not found`);
  }

  const formData = new FormData(form);
  const data: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    // Conversion des types appropriés
    if (typeof value === "string") {
      // Tentative de conversion en nombre
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value.trim() !== "") {
        data[key] = numValue;
      } else if (value.toLowerCase() === "true") {
        data[key] = true;
      } else if (value.toLowerCase() === "false") {
        data[key] = false;
      } else {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }

  return data;
}

/**
 * Utilitaire pour collecter les résultats depuis le DOM
 */
export function collectResultsFromDOM(
  resultsContainerId: string
): Record<string, any> {
  const container = document.getElementById(resultsContainerId);
  if (!container) {
    throw new Error(
      `Results container with id "${resultsContainerId}" not found`
    );
  }

  const results: Record<string, any> = {};

  // Recherche des éléments avec data-result
  const resultElements = container.querySelectorAll("[data-result]");
  resultElements.forEach((element) => {
    const key = element.getAttribute("data-result");
    const value = element.textContent?.trim();
    if (key && value) {
      results[key] = value;
    }
  });

  return results;
}
