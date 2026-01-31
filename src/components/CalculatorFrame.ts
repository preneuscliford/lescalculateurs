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
  exportXLSX?: {
    enabled: boolean;
    filename?: string;
    getXLSXData?: (
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
  help?: string;
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
  private containerId: string;
  private config: CalculatorConfig;
  private values: Record<string, any> = {};

  constructor(containerId: string, config: CalculatorConfig) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.containerId = containerId;
    this.config = config;
    this.render();
    this.initFromURL();
    this.autoCalculateOnLoad();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto p-6">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">🧮 ${
            this.config.title
          }</h2>
          <p class="text-gray-600 mb-6">${this.config.description}</p>
          
          <form id="calculator-form" class="space-y-4">
            ${this.config.fields
              .map((field) => this.renderField(field))
              .join("")}
            
            <button type="submit" class="calculator-button w-full">
              ▶️ Calculer
            </button>
          </form>
          
          <div id="calculator-result" class="mt-6 calculator-result invisible min-h-[220px]" aria-live="polite"></div>
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
            ${
              field.help
                ? `<p class="mt-2 text-sm text-gray-500">${field.help}</p>`
                : ""
            }
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

  /**
   * Lance automatiquement le calcul si toutes les valeurs requises sont présentes (URL ou préremplies)
   */
  private autoCalculateOnLoad(): void {
    try {
      const form = this.container.querySelector(
        "#calculator-form"
      ) as HTMLFormElement;
      const resultDiv = this.container.querySelector(
        "#calculator-result"
      ) as HTMLElement;
      if (!form || !resultDiv) return;

      // Vérifier que tous les champs requis ont une valeur
      const allRequiredFilled = this.config.fields
        .filter((f) => f.required)
        .every((f) => {
          const v = this.values[f.id];
          return v !== undefined && v !== null && String(v) !== "";
        });

      if (allRequiredFilled) {
        // Calculer et afficher directement
        const result = this.config.calculate(this.values);
        this.showResult(resultDiv, result);
        return;
      }

      // Fallback: recharger le dernier calcul depuis l'historique
      try {
        const key = `calculator_history_${this.containerId}`;
        const prev: any[] = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(prev) && prev.length > 0) {
          const last = prev[0];
          const vals = last.values || {};
          Object.keys(vals).forEach((k) => {
            const input = form.querySelector(
              `#${CSS.escape(k)}`
            ) as HTMLInputElement;
            if (!input) return;
            if (input.type === "checkbox") {
              (input as HTMLInputElement).checked = !!vals[k];
            } else {
              (input as HTMLInputElement).value = String(vals[k]);
            }
            this.updateValue(k, input as any);
          });
          const result = this.config.calculate(this.values);
          this.showResult(resultDiv, result);
        }
      } catch (_) {}
    } catch (_) {}
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
      .filter(
        (field) =>
          field.required &&
          (this.values[field.id] === undefined ||
            this.values[field.id] === null ||
            this.values[field.id] === "")
      )
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

      if (result.success) {
        const key = `dernierCalcul_${this.containerId}`;
        (window as any)[key] = { result, values: { ...this.values } };
        if (this.containerId === "notaire-calculator") {
          (window as any).dernierCalculNotaire = {
            result,
            values: { ...this.values },
          };
        }
      }

      // Sauvegarder l'historique local
      this.saveHistory(this.values, result);

      // Mettre à jour l'URL pour partage
      this.updateURL(this.values);

      // Analytics
      const dataLayer = (window as any).dataLayer || [];
      dataLayer.push({
        event: "calculator_submit",
        calculator: this.config.title,
      });
    } catch (error) {
      this.showResult(resultDiv, {
        success: false,
        error: "Erreur lors du calcul. Vérifiez vos données.",
      });
    }
  }

  private showResult(resultDiv: HTMLElement, result: CalculatorResult): void {
    resultDiv.classList.remove("invisible");

    if (result.success) {
      // Déterminer si l'export CSV est activé
      const hasExportCSV =
        this.config.exportCSV && this.config.exportCSV.enabled === true;
      const hasExportXLSX =
        this.config.exportXLSX && this.config.exportXLSX.enabled === true;

      const exportButtons = "";

      resultDiv.className = "mt-6 calculator-result min-h-[220px]";
      resultDiv.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Résultat :</h3>
        <div class="text-gray-700">
          ${this.config.formatResult(result)}
        </div>
        ${exportButtons}
      `;

      const external = document.getElementById("export-buttons");
      if (external && (hasExportCSV || hasExportXLSX)) {
        if (hasExportCSV && !document.getElementById("export-csv-btn")) {
          const csvBtn = document.createElement("button");
          csvBtn.id = "export-csv-btn";
          csvBtn.className =
            "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50";
          csvBtn.textContent = "📄 Exporter en CSV";
          csvBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleCSVExport(result);
          });
          external.appendChild(csvBtn);
        }
        if (hasExportXLSX && !document.getElementById("export-xlsx-btn")) {
          const xlsxBtn = document.createElement("button");
          xlsxBtn.id = "export-xlsx-btn";
          xlsxBtn.className =
            "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50";
          xlsxBtn.textContent = "📊 Exporter en XLSX";
          xlsxBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleXLSXExport(result);
          });
          external.appendChild(xlsxBtn);
        }
      }
      // Si le conteneur d'export n'est pas encore créé (PDF module), attendre puis ajouter les boutons
      if (!external && (hasExportCSV || hasExportXLSX)) {
        const obs = new MutationObserver((muts) => {
          const ex = document.getElementById("export-buttons");
          if (!ex) return;
          // Ajouter les boutons et arrêter l'observateur
          if (hasExportCSV && !document.getElementById("export-csv-btn")) {
            const csvBtn = document.createElement("button");
            csvBtn.id = "export-csv-btn";
            csvBtn.className =
              "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50";
            csvBtn.textContent = "📄 Exporter en CSV";
            csvBtn.addEventListener("click", (e) => {
              e.preventDefault();
              this.handleCSVExport(result);
            });
            ex.appendChild(csvBtn);
          }
          if (hasExportXLSX && !document.getElementById("export-xlsx-btn")) {
            const xlsxBtn = document.createElement("button");
            xlsxBtn.id = "export-xlsx-btn";
            xlsxBtn.className =
              "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50";
            xlsxBtn.textContent = "📊 Exporter en XLSX";
            xlsxBtn.addEventListener("click", (e) => {
              e.preventDefault();
              this.handleXLSXExport(result);
            });
            ex.appendChild(xlsxBtn);
          }
          obs.disconnect();
        });
        obs.observe(document.body, { childList: true, subtree: true });
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

  /**
   * Exporte le résultat en XLSX (Excel)
   */
  private async handleXLSXExport(result: CalculatorResult): Promise<void> {
    try {
      const { exportToXLSX } = await import("../utils/csvExport");
      let xlsxData: import("../utils/csvExport").CSVData;

      if (this.config.exportXLSX?.getXLSXData) {
        xlsxData = this.config.exportXLSX.getXLSXData(result, this.values);
      } else if (this.config.exportCSV?.getCSVData) {
        xlsxData = this.config.exportCSV.getCSVData(result, this.values);
      } else {
        xlsxData = {
          headers: ["Champ", "Valeur"],
          rows: [
            ...Object.entries(this.values).map(([key, value]) => [key, value]),
            ["Résultat", JSON.stringify(result.data)],
          ],
        };
      }

      const filename =
        this.config.exportXLSX?.filename ||
        `${this.config.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_resultats.xlsx`;
      await exportToXLSX(xlsxData, filename);
    } catch (error) {
      console.error("Erreur lors de l'export XLSX:", error);
      alert("Erreur lors de l'export XLSX. Veuillez réessayer.");
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
  /**
   * Initialise les valeurs depuis la query-string.
   */
  private initFromURL(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.size === 0) return;
      const form = this.container.querySelector(
        "#calculator-form"
      ) as HTMLFormElement;
      if (!form) return;
      params.forEach((value, key) => {
        const input = form.querySelector(
          `#${CSS.escape(key)}`
        ) as HTMLInputElement;
        if (!input) return;
        if (input.type === "checkbox") {
          input.checked = value === "true";
        } else {
          input.value = value;
        }
        this.updateValue(key, input);
      });
    } catch (_) {}
  }

  /**
   * Met à jour l'URL avec les valeurs du formulaire (partage/deep link).
   */
  private updateURL(values: Record<string, any>): void {
    try {
      const params = new URLSearchParams();
      Object.entries(values).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        params.set(k, String(v));
      });
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, document.title, url);
    } catch (_) {}
  }

  /**
   * Sauvegarde le dernier calcul dans localStorage (limité aux 10 derniers).
   */
  private saveHistory(
    values: Record<string, any>,
    result: CalculatorResult
  ): void {
    try {
      const key = `calculator_history_${this.containerId}`;
      const prev: any[] = JSON.parse(localStorage.getItem(key) || "[]");
      const entry = { ts: Date.now(), values: { ...values }, result };
      const next = [entry, ...prev].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(next));
    } catch (_) {}
  }
}
