/**
 * Gestion de la comparaison multi-scénarios pour Travail (Indemnités)
 */

export interface CalculTravail {
  id: string;
  timestamp: number;
  typeIndemnite: string;
  montant: number;
  montantNet: number;
  label: string;
  emoji: string;
}

class ComparaisonTravail {
  private calculs: CalculTravail[] = [];
  private maxComparaisons = 5;
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

    const typeIndemniteLabels: Record<string, string> = {
      indemnite_licenciement: "Indemnité de licenciement",
      indemnite_rupture: "Indemnité rupture convenue",
      indemnite_depart_retraite: "Indemnité départ retraite",
      prime_participation: "Prime de participation",
      prime_interessement: "Prime intéressement",
      gratification_stage: "Gratification de stage",
      bonus: "Bonus",
    };

    const emojis = ["💰", "💵", "💴", "💶", "💷"];
    const typeLabel =
      typeIndemniteLabels[values.type_indemnite] || values.type_indemnite;

    const label = `${typeLabel} • ${formatCurrency(result.data.montant || 0)}`;

    const calcul: CalculTravail = {
      id: `calcul-${Date.now()}`,
      timestamp: Date.now(),
      typeIndemnite: values.type_indemnite,
      montant: result.data.montant || 0,
      montantNet: result.data.montantNet || 0,
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
      localStorage.setItem("comparaison_travail", JSON.stringify(payload));
    } catch (_) {}
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem("comparaison_travail");
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
    const formatCurrency = (value: number | undefined) => {
      if (value === undefined || value === null || isNaN(value)) return "0 €";
      return value.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    };

    const maxMontant = Math.max(...this.calculs.map((c) => c.montant));

    const headers = this.calculs
      .map(
        (c) =>
          `<th class="p-3 text-center border-r border-gray-200">
          <div class="text-xl mb-1">${c.emoji}</div>
          <div class="text-xs font-semibold text-gray-700">${c.label}</div>
          <button onclick="window.comparaisonTravail.supprimerCalcul('${c.id}')" class="text-xs text-red-600 hover:text-red-800 mt-1">✕</button>
        </th>`
      )
      .join("");

    return `
    <div class="bg-white rounded-lg shadow-lg p-6 mt-8 border-2 border-teal-300">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">📊 Comparaison Indemnités</h3>
        <button id="travail-reset-compare" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm">
          🔄 Réinitialiser
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-teal-50">
              <th class="p-3 text-left font-semibold border-r border-gray-200">Critère</th>
              ${headers}
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-teal-50">
              <td class="p-3 font-semibold border-r border-gray-200">Montant brut</td>
              ${this.calculs
                .map(
                  (c) => `
                <td class="p-3 text-center ${
                  c.montant === maxMontant
                    ? "bg-green-100 font-bold text-green-900"
                    : "text-gray-900"
                } border-r border-gray-200">
                  ${formatCurrency(c.montant)}
                </td>`
                )
                .join("")}
            </tr>
            <tr class="bg-gray-50 hover:bg-gray-100">
              <td class="p-3 font-semibold border-r border-gray-200">Montant net</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 border-r border-gray-200">${formatCurrency(
                      c.montantNet
                    )}</td>`
                )
                .join("")}
            </tr>
            <tr class="hover:bg-teal-50">
              <td class="p-3 font-semibold border-r border-gray-200">Type d'indemnité</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 text-xs border-r border-gray-200">${c.typeIndemnite}</td>`
                )
                .join("")}
            </tr>
            <tr class="bg-teal-50 font-bold">
              <td class="p-3 border-r border-gray-200">Retenue estimée</td>
              ${this.calculs
                .map((c) => {
                  const retenue = c.montant - c.montantNet || 0;
                  return `
                <td class="p-3 text-center ${
                  retenue > 0 ? "text-orange-700" : "text-gray-900"
                } border-r border-gray-200">
                  ${formatCurrency(retenue)}
                </td>`;
                })
                .join("")}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <strong>💡 Conseil :</strong> Comparez différents types d'indemnités pour optimiser votre plan de départ ou négociation.
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
      localStorage.removeItem("comparaison_travail");
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

// Fonction de formatage
function formatCurrency(value: number | undefined) {
  if (value === undefined || value === null || isNaN(value)) return "0 €";
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default ComparaisonTravail;
