/**
 * Gestion de la comparaison multi-scénarios pour IK (Indemnités Kilométriques)
 */

function formatCurrency(value: number | undefined) {
  if (value === undefined || value === null || isNaN(value)) return "0 €";
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface CalculIK {
  id: string;
  timestamp: number;
  typeVehicule: string;
  kilometres: number;
  puissance?: string;
  cylindree?: string;
  indemniteParKm: number;
  total: number;
  label: string;
  emoji: string;
}

class ComparaisonIK {
  private calculs: CalculIK[] = [];
  private maxComparaisons = 6;
  private containerId: string;

  constructor(containerId: string) {
    this.containerId = containerId;
    this.loadFromStorage();
  }

  /**
   * Ajoute un calcul à la comparaison
   */
  ajouterCalcul(result: any, values: any): void {
    if (this.calculs.length >= this.maxComparaisons) {
      alert(
        `Vous ne pouvez comparer que ${this.maxComparaisons} scénarios maximum`
      );
      return;
    }

    const typeVehiculeLabel =
      values.type_vehicule === "voiture" ? "Voiture" : "Deux-roues";
    const puissance = values.puissance || values.cylindree_moto;
    const emojis = ["🚗", "🚕", "🚙", "🏎️", "🛵", "🏍️"];

    const label = `${typeVehiculeLabel} • ${values.kilometres} km • ${puissance}`;

    const calcul: CalculIK = {
      id: `calcul-${Date.now()}`,
      timestamp: Date.now(),
      typeVehicule: values.type_vehicule,
      kilometres: Number(values.kilometres) || 0,
      puissance: values.puissance,
      cylindree: values.cylindree_moto,
      indemniteParKm: result.data.indemniteParKm || 0,
      total: result.data.total || 0,
      label,
      emoji: emojis[this.calculs.length % emojis.length],
    };

    this.calculs.push(calcul);
    this.afficherComparaison();
    this.saveToStorage();
  }

  /**
   * Supprime un calcul de la comparaison
   */
  supprimerCalcul(id: string): void {
    this.calculs = this.calculs.filter((c) => c.id !== id);
    this.saveToStorage();
    if (this.calculs.length === 0) {
      this.masquerComparaison();
    } else {
      this.afficherComparaison();
    }
  }

  /**
   * Affiche le tableau de comparaison
   */
  private afficherComparaison(): void {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = this.genererHTML();
    container.classList.remove("hidden");
  }

  /**
   * Masque le tableau de comparaison
   */
  private masquerComparaison(): void {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    container.classList.add("hidden");
  }

  /**
   * Persistance simple de la comparaison (localStorage)
   */
  private saveToStorage(): void {
    try {
      const payload = {
        version: "2025-01-15",
        calculs: this.calculs,
      };
      localStorage.setItem("comparaison_ik", JSON.stringify(payload));
    } catch (_) {}
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem("comparaison_ik");
      if (!raw) return;
      const data = JSON.parse(raw);
      const version = data?.version;
      const list = data?.calculs;
      if (version && Array.isArray(list)) {
        this.calculs = list;
        if (this.calculs.length > 0) this.afficherComparaison();
      }
    } catch (_) {}
  }

  /**
   * Génère le HTML du tableau comparatif
   */
  private genererHTML(): string {
    const maxTotal = Math.max(...this.calculs.map((c) => c.total));

    const headers = this.calculs
      .map(
        (c) =>
          `<th class="p-3 text-center border-r border-gray-200">
          <div class="text-xl mb-1">${c.emoji}</div>
          <div class="text-xs font-semibold text-gray-700">${c.label}</div>
          <button onclick="window.comparaisonIK.supprimerCalcul('${c.id}')" class="text-xs text-red-600 hover:text-red-800 mt-1">✕</button>
        </th>`
      )
      .join("");

    return `
    <div class="bg-white rounded-lg shadow-lg p-6 mt-8 border-2 border-orange-300">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">📊 Comparaison IK</h3>
        <button id="ik-reset-compare" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm">
          🔄 Réinitialiser
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-orange-50">
              <th class="p-3 text-left font-semibold border-r border-gray-200">Critère</th>
              ${headers}
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-orange-50">
              <td class="p-3 font-semibold border-r border-gray-200">Indemnités totales</td>
              ${this.calculs
                .map(
                  (c) => `
                <td class="p-3 text-center ${
                  c.total === maxTotal
                    ? "bg-green-100 font-bold text-green-900"
                    : "text-gray-900"
                } border-r border-gray-200">
                  ${formatCurrency(c.total)}
                </td>`
                )
                .join("")}
            </tr>
            <tr class="bg-gray-50 hover:bg-gray-100">
              <td class="p-3 font-semibold border-r border-gray-200">Type véhicule</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 border-r border-gray-200">${
                      c.typeVehicule === "voiture" ? "Voiture" : "Deux-roues"
                    }</td>`
                )
                .join("")}
            </tr>
            <tr class="hover:bg-orange-50">
              <td class="p-3 font-semibold border-r border-gray-200">Kilomètres</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 border-r border-gray-200">${c.kilometres.toLocaleString(
                      "fr-FR"
                    )}</td>`
                )
                .join("")}
            </tr>
            <tr class="bg-gray-50 hover:bg-gray-100">
              <td class="p-3 font-semibold border-r border-gray-200">Indemnité/km</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 border-r border-gray-200">${formatCurrency(
                      c.indemniteParKm
                    )}</td>`
                )
                .join("")}
            </tr>
            <tr class="bg-orange-50 font-bold">
              <td class="p-3 border-r border-gray-200">Mensuel (sur 12 mois)</td>
              ${this.calculs
                .map(
                  (c) => `
                <td class="p-3 text-center ${
                  c.total === maxTotal ? "text-green-700" : "text-gray-900"
                } border-r border-gray-200">
                  ${formatCurrency(c.total / 12)}
                </td>`
                )
                .join("")}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <strong>💡 Conseil :</strong> Comparez différentes options de véhicules et kilométrages pour optimiser votre déduction fiscale.
      </div>
    </div>
    `;
  }

  /**
   * Réinitialise complètement la comparaison
   */
  public reinitialiser(): void {
    try {
      this.calculs = [];
      localStorage.removeItem("comparaison_ik");
      const container = document.getElementById(this.containerId);
      if (container) {
        container.innerHTML = "";
      }
      this.masquerComparaison();
    } catch (_) {}
  }

  /**
   * Obtient le nombre de calculs
   */
  getNombreCalculs(): number {
    return this.calculs.length;
  }
}

export default ComparaisonIK;
