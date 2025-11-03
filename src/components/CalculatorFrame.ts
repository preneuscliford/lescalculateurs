export interface CalculatorConfig {
  title: string;
  description: string;
  fields: CalculatorField[];
  calculate: (values: Record<string, any>) => CalculatorResult;
  formatResult: (result: CalculatorResult) => string;
  exportCSV?: {
    enabled: boolean;
    filename?: string;
    getCSVData?: (
      result: CalculatorResult,
      values: Record<string, any>
    ) => import("../utils/csvExport").CSVData;
  };
}

export interface CalculatorField {
  id: string;
  label: string;
  type: "number" | "select" | "checkbox" | "text";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface CalculatorResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class CalculatorFrame {
  private container: HTMLElement;
  private config: CalculatorConfig;
  private values: Record<string, any> = {};

  constructor(containerId: string, config: CalculatorConfig) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.config = config;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto p-6">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">${
            this.config.title
          }</h2>
          <p class="text-gray-600 mb-6">${this.config.description}</p>
          
          <form id="calculator-form" class="space-y-4">
            ${this.config.fields
              .map((field) => this.renderField(field))
              .join("")}
            
            <button type="submit" class="calculator-button w-full">
              Calculer
            </button>
          </form>
          
          <div id="calculator-result" class="mt-6 hidden"></div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderField(field: CalculatorField): string {
    const baseClasses = "calculator-input";
    const required = field.required ? "required" : "";

    switch (field.type) {
      case "select":
        return `
          <div>
            <label for="${
              field.id
            }" class="block text-sm font-medium text-gray-700 mb-2">
              ${field.label} ${field.required ? "*" : ""}
            </label>
            <select id="${field.id}" name="${
          field.id
        }" class="${baseClasses}" ${required}>
              <option value="">Sélectionnez...</option>
              ${
                field.options
                  ?.map(
                    (opt) =>
                      `<option value="${opt.value}">${opt.label}</option>`
                  )
                  .join("") || ""
              }
            </select>
          </div>
        `;

      case "checkbox":
        return `
          <div class="flex items-center">
            <input type="checkbox" id="${field.id}" name="${field.id}" 
                   class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
            <label for="${field.id}" class="ml-2 block text-sm text-gray-700">
              ${field.label}
            </label>
          </div>
        `;

      case "number":
        return `
          <div>
            <label for="${
              field.id
            }" class="block text-sm font-medium text-gray-700 mb-2">
              ${field.label} ${field.required ? "*" : ""}
            </label>
            <input type="number" id="${field.id}" name="${field.id}" 
                   class="${baseClasses}" 
                   placeholder="${field.placeholder || ""}"
                   min="${field.min || ""}"
                   max="${field.max || ""}"
                   step="${field.step || "any"}"
                   ${required}>
          </div>
        `;

      default:
        return `
          <div>
            <label for="${
              field.id
            }" class="block text-sm font-medium text-gray-700 mb-2">
              ${field.label} ${field.required ? "*" : ""}
            </label>
            <input type="text" id="${field.id}" name="${field.id}" 
                   class="${baseClasses}" 
                   placeholder="${field.placeholder || ""}"
                   ${required}>
          </div>
        `;
    }
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector(
      "#calculator-form"
    ) as HTMLFormElement;
    const resultDiv = this.container.querySelector(
      "#calculator-result"
    ) as HTMLElement;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit(form, resultDiv);
    });

    // Auto-save values
    this.config.fields.forEach((field) => {
      const input = this.container.querySelector(
        `#${field.id}`
      ) as HTMLInputElement;
      if (input) {
        input.addEventListener("change", () => {
          this.updateValue(field.id, input);
        });
      }
    });
  }

  private updateValue(fieldId: string, input: HTMLInputElement): void {
    if (input.type === "checkbox") {
      this.values[fieldId] = input.checked;
    } else if (input.type === "number") {
      this.values[fieldId] = parseFloat(input.value) || 0;
    } else {
      this.values[fieldId] = input.value;
    }
  }

  private handleSubmit(form: HTMLFormElement, resultDiv: HTMLElement): void {
    // Collect all values
    this.config.fields.forEach((field) => {
      const input = form.querySelector(`#${field.id}`) as HTMLInputElement;
      if (input) {
        this.updateValue(field.id, input);
      }
    });

    // Validate required fields
    const missingFields = this.config.fields
      .filter((field) => field.required && !this.values[field.id])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      this.showResult(resultDiv, {
        success: false,
        error: `Veuillez remplir les champs obligatoires : ${missingFields.join(
          ", "
        )}`,
      });
      return;
    }

    // Calculate result
    try {
      const result = this.config.calculate(this.values);
      this.showResult(resultDiv, result);
    } catch (error) {
      this.showResult(resultDiv, {
        success: false,
        error: "Erreur lors du calcul. Vérifiez vos données.",
      });
    }
  }

  private showResult(resultDiv: HTMLElement, result: CalculatorResult): void {
    resultDiv.classList.remove("hidden");

    if (result.success) {
      // Déterminer si l'export CSV est activé
      const hasExportCSV =
        this.config.exportCSV && this.config.exportCSV.enabled === true;

      const exportButton = hasExportCSV
        ? `
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button type="button" id="export-csv-btn" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter en CSV
          </button>
        </div>
      `
        : "";

      resultDiv.className = "mt-6 calculator-result";
      resultDiv.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Résultat :</h3>
        <div class="text-gray-700">
          ${this.config.formatResult(result)}
        </div>
        ${exportButton}
      `;

      // Attacher l'événement d'export CSV si activé
      if (hasExportCSV) {
        const exportBtn = resultDiv.querySelector(
          "#export-csv-btn"
        ) as HTMLButtonElement;
        if (exportBtn) {
          exportBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleCSVExport(result);
          });
        }
      }
    } else {
      resultDiv.className =
        "mt-6 p-4 bg-red-50 border border-red-200 rounded-lg";
      resultDiv.innerHTML = `
        <div class="text-red-700">
          <strong>Erreur :</strong> ${result.error}
        </div>
      `;
    }
  }

  private async handleCSVExport(result: CalculatorResult): Promise<void> {
    try {
      // Importer dynamiquement pour éviter les dépendances circulaires
      const { exportToCSV } = await import("../utils/csvExport");

      let csvData: import("../utils/csvExport").CSVData;

      if (this.config.exportCSV?.getCSVData) {
        // Utiliser la fonction personnalisée si fournie
        csvData = this.config.exportCSV.getCSVData(result, this.values);
      } else {
        // Fallback: exporter les valeurs d'entrée et le résultat brut
        csvData = {
          headers: ["Champ", "Valeur"],
          rows: [
            ...Object.entries(this.values).map(([key, value]) => [key, value]),
            ["Résultat", JSON.stringify(result.data)],
          ],
        };
      }

      const filename =
        this.config.exportCSV?.filename ||
        `${this.config.title.toLowerCase().replace(/\s+/g, "_")}_resultats.csv`;
      exportToCSV(csvData, filename);
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      alert("Erreur lors de l'export CSV. Veuillez réessayer.");
    }
  }

  // Method to get current values (useful for debugging)
  public getValues(): Record<string, any> {
    return { ...this.values };
  }

  // Method to set values programmatically
  public setValues(newValues: Record<string, any>): void {
    Object.assign(this.values, newValues);

    // Update form inputs
    Object.entries(newValues).forEach(([key, value]) => {
      const input = this.container.querySelector(`#${key}`) as HTMLInputElement;
      if (input) {
        if (input.type === "checkbox") {
          input.checked = Boolean(value);
        } else {
          input.value = String(value);
        }
      }
    });
  }
}
