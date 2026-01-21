/**
 * Modal pour ajouter un scénario de comparaison avec saisie de données
 * Réutilisable pour tous les calculateurs
 */

export interface ModalField {
  id: string;
  label: string;
  type: "number" | "select" | "text";
  value: any;
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ModalConfig {
  title: string;
  fields: ModalField[];
  onConfirm: (values: Record<string, any>) => void;
  onCancel?: () => void;
}

export class ComparisonModal {
  private config: ModalConfig;
  private modalElement: HTMLElement | null = null;
  private values: Record<string, any> = {};

  constructor(config: ModalConfig) {
    this.config = config;
    this.values = {};
    config.fields.forEach((field) => {
      this.values[field.id] = field.value;
    });
  }

  public open(): void {
    this.render();
    const modal = document.getElementById("comparison-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  public close(): void {
    const modal = document.getElementById("comparison-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  private render(): void {
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById("comparison-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "comparison-modal";
      modal.className =
        "fixed inset-0 bg-black/50 hidden items-center justify-center z-50";
      document.body.appendChild(modal);
    }

    // Créer le contenu du modal
    const fieldsHTML = this.config.fields
      .map((field) => this.renderField(field))
      .join("");

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">${this.config.title}</h2>
        
        <form id="comparison-form" class="space-y-4">
          ${fieldsHTML}
          
          <!-- Avertissement colocation (affiché dynamiquement) -->
          <div id="colocation-warning" class="hidden p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500 text-sm">
            <p class="text-purple-800">
              <strong>⚠️ Colocation :</strong> La CAF applique des plafonds de loyer plus stricts, 
              ce qui peut réduire fortement voire annuler l'APL.
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
              ✅ Ajouter
            </button>
            <button type="button" id="modal-cancel" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
              ✕ Annuler
            </button>
          </div>
        </form>
      </div>
    `;

    // Attacher les event listeners
    const form = modal.querySelector("#comparison-form") as HTMLFormElement;
    const cancelBtn = modal.querySelector("#modal-cancel") as HTMLButtonElement;

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.close();
        if (this.config.onCancel) {
          this.config.onCancel();
        }
      });
    }

    // Fermer le modal au clic sur le fond
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.close();
        if (this.config.onCancel) {
          this.config.onCancel();
        }
      }
    });

    // 🟢 Afficher/masquer avertissement colocation dynamiquement
    this.setupColocationWarning();
  }

  private setupColocationWarning(): void {
    const typeLogementField = document.getElementById(
      "type_logement"
    ) as HTMLSelectElement;
    const warning = document.getElementById("colocation-warning");

    if (typeLogementField && warning) {
      const checkColocation = () => {
        const value = typeLogementField.value.toLowerCase();
        if (value.includes("colocation") || value.includes("chambre")) {
          warning.classList.remove("hidden");
        } else {
          warning.classList.add("hidden");
        }
      };

      typeLogementField.addEventListener("change", checkColocation);
      // Vérifier aussi à l'ouverture
      checkColocation();
    }
  }

  private renderField(field: ModalField): string {
    const baseClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const required = field.required ? "required" : "";

    switch (field.type) {
      case "select":
        return `
          <div>
            <label for="${
              field.id
            }" class="block text-sm font-medium text-gray-700 mb-1">
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
                      `<option value="${opt.value}" ${
                        opt.value === field.value ? "selected" : ""
                      }>${opt.label}</option>`
                  )
                  .join("") || ""
              }
            </select>
          </div>
        `;

      case "number":
        return `
          <div>
            <label for="${
              field.id
            }" class="block text-sm font-medium text-gray-700 mb-1">
              ${field.label} ${field.required ? "*" : ""}
            </label>
            <input 
              type="number" 
              id="${field.id}" 
              name="${field.id}" 
              class="${baseClasses}" 
              value="${field.value || ""}"
              placeholder="${field.placeholder || ""}"
              min="${field.min || ""}"
              max="${field.max || ""}"
              step="${field.step || "any"}"
              ${required}
            >
          </div>
        `;

      default:
        return `
          <div>
            <label for="${
              field.id
            }" class="block text-sm font-medium text-gray-700 mb-1">
              ${field.label} ${field.required ? "*" : ""}
            </label>
            <input 
              type="text" 
              id="${field.id}" 
              name="${field.id}" 
              class="${baseClasses}" 
              value="${field.value || ""}"
              placeholder="${field.placeholder || ""}"
              ${required}
            >
          </div>
        `;
    }
  }

  private handleSubmit(): void {
    const form = document.getElementById("comparison-form") as HTMLFormElement;
    if (!form) return;

    // Collecter les valeurs
    this.config.fields.forEach((field) => {
      const input = form.querySelector(`#${field.id}`) as
        | HTMLInputElement
        | HTMLSelectElement;
      if (input) {
        if (input.type === "number") {
          this.values[field.id] = parseFloat(input.value) || 0;
        } else {
          this.values[field.id] = input.value;
        }
      }
    });

    // Valider les champs requis (0 est une valeur valide pour les champs numériques)
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
      alert(
        `Veuillez remplir les champs obligatoires : ${missingFields.join(", ")}`
      );
      return;
    }

    // Appeler le callback
    this.config.onConfirm(this.values);
    this.close();
  }

  static addComparison(namespace: string, scenario: Record<string, any>): void {
    const stored = this.getComparisons(namespace);
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    stored.push({ id, ...scenario });
    this.saveComparisons(namespace, stored);
    this.renderComparisons(namespace);
  }

  static resetComparison(namespace: string): void {
    localStorage.removeItem(this.storageKey(namespace));
    this.renderComparisons(namespace);
  }

  static init(namespace: string): void {
    this.renderComparisons(namespace);
  }

  static count(namespace: string): number {
    return this.getComparisons(namespace).length;
  }

  private static storageKey(namespace: string): string {
    return `comparaison_${namespace}`;
  }

  private static getComparisons(namespace: string): Array<Record<string, any>> {
    try {
      const raw = localStorage.getItem(this.storageKey(namespace));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private static saveComparisons(
    namespace: string,
    scenarios: Array<Record<string, any>>,
  ): void {
    try {
      localStorage.setItem(this.storageKey(namespace), JSON.stringify(scenarios));
    } catch {}
  }

  private static renderComparisons(namespace: string): void {
    const container = document.getElementById(`${namespace}-comparaison`);
    if (!container) return;

    const scenarios = this.getComparisons(namespace);
    if (scenarios.length === 0) {
      container.innerHTML = "";
      container.classList.add("hidden");
      return;
    }
    container.classList.remove("hidden");

    const fieldSet = new Set<string>();
    scenarios.forEach((s) => {
      Object.keys(s).forEach((k) => {
        if (k === "id" || k === "label") return;
        fieldSet.add(k);
      });
    });
    const fields = Array.from(fieldSet);

    const headerCells = scenarios
      .map((s, idx) => {
        const label = typeof s.label === "string" && s.label.trim() ? s.label : `Scénario ${idx + 1}`;
        return `<th class="p-3 text-center font-semibold">
          ${label}
          <br>
          <button class="text-xs text-red-600 hover:text-red-800 mt-1" data-delete-id="${s.id}">✕ Supprimer</button>
        </th>`;
      })
      .join("");

    const rows = fields
      .map((field) => {
        const label = field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (m) => m.toUpperCase());
        const tds = scenarios
          .map((s) => {
            const v = s[field];
            const value =
              v === undefined || v === null || v === ""
                ? "—"
                : typeof v === "boolean"
                ? v
                  ? "Oui"
                  : "Non"
                : String(v);
            return `<td class="p-3 text-center">${value}</td>`;
          })
          .join("");
        return `<tr class="hover:bg-gray-50"><td class="p-3 font-medium">${label}</td>${tds}</tr>`;
      })
      .join("");

    container.innerHTML = `
      <div class="bg-white border-2 border-orange-500 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Comparaison des scénarios</h3>
          <button id="${namespace}-clear-all" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold">
            🔄 Réinitialiser tout
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead>
              <tr class="bg-blue-50">
                <th class="p-3 text-left font-semibold">Critère</th>
                ${headerCells}
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container
      .querySelectorAll("button[data-delete-id]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = (btn as HTMLButtonElement).dataset.deleteId;
          const next = this.getComparisons(namespace).filter((s) => s.id !== id);
          this.saveComparisons(namespace, next);
          this.renderComparisons(namespace);
        });
      });

    container
      .querySelector(`#${namespace}-clear-all`)
      ?.addEventListener("click", () => {
        this.resetComparison(namespace);
      });
  }
}
