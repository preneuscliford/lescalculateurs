/**
 * Gestion de la comparaison multi-scénarios pour APL
 */

// Fonction de formatage (définie en premier)
function formatCurrency(value: number | undefined) {
  if (value === undefined || value === null || isNaN(value)) return "0 €";
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export interface CalculAPL {
  id: string;
  timestamp: number;
  situation: string;
  revenus: number;
  nombreEnfants: number;
  typeLogement: string;
  zone: string;
  apl: number;
  label: string;
  emoji: string;
}

class ComparaisonAPL {
  private calculs: CalculAPL[] = [];
  private maxComparaisons = 3;
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

    const situationLabels: Record<string, string> = {
      seul: "Célibataire",
      couple: "Couple",
      couple_enfant: "Couple + 1 enfant",
      couple_enfants: "Couple + enfants",
      monoparental: "Monoparental",
      autre: "Autre",
    };

    const zoneLabels: Record<string, string> = {
      zone_1: "Zone 1 (IDF)",
      zone_2: "Zone 2 (Province)",
      zone_3: "Zone 3 (DOM-TOM)",
      idf: "Zone 1 (IDF)",
      province: "Zone 2 (Province)",
      dom: "Zone 3 (DOM-TOM)",
    };

    const typeLogementLabels: Record<string, string> = {
      location: "Location",
      accession: "Accession à la propriété",
      hlm: "HLM",
    };

    const emojis = ["🏠", "🏡", "🏘️", "🏢", "🏬"];
    const situationLabel =
      situationLabels[values.situation] || values.situation;
    const zoneLabel = zoneLabels[values.zone] || values.zone;

    const label = `${situationLabel} • ${zoneLabel} • ${formatCurrency(
      values.revenus
    )}`;

    const calcul: CalculAPL = {
      id: `calcul-${Date.now()}`,
      timestamp: Date.now(),
      situation: values.situation,
      revenus: Number(values.revenus) || 0,
      nombreEnfants: Number(values.nombre_enfants) || 0,
      typeLogement: values.type_logement,
      zone: values.zone,
      apl: result.data.apl || 0,
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
      localStorage.setItem("comparaison_apl", JSON.stringify(payload));
    } catch (_) {}
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem("comparaison_apl");
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
    const maxAPL = Math.max(...this.calculs.map((c) => c.apl));

    const headers = this.calculs
      .map(
        (c) =>
          `<th class="p-3 text-center border-r border-gray-200">
          <div class="text-xl mb-1">${c.emoji}</div>
          <div class="text-xs font-semibold text-gray-700">${c.label}</div>
          <button onclick="window.comparaisonAPL.supprimerCalcul('${c.id}')" class="text-xs text-red-600 hover:text-red-800 mt-1">✕</button>
        </th>`
      )
      .join("");

    return `
    <div class="bg-white rounded-lg shadow-lg p-6 mt-8 border-2 border-purple-300">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">📊 Comparaison APL</h3>
        <button id="apl-reset-compare" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm">
          🔄 Réinitialiser
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-purple-50">
              <th class="p-3 text-left font-semibold border-r border-gray-200">Critère</th>
              ${headers}
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-purple-50 bg-white">
              <td class="p-3 font-bold border-r border-gray-200 text-lg">💰 APL mensuelle</td>
              ${this.calculs
                .map((c, idx) => {
                  const isMaxAPL = c.apl === maxAPL;
                  const diff = idx === 0 ? 0 : c.apl - this.calculs[0].apl;
                  const diffPct =
                    idx === 0
                      ? 0
                      : ((c.apl - this.calculs[0].apl) / this.calculs[0].apl) *
                        100;
                  const showDiff = idx > 0 && this.calculs[0].apl > 0;

                  return `
                  <td class="p-3 text-center font-bold text-lg ${
                    isMaxAPL ? "bg-green-100 text-green-900" : "text-gray-900"
                  } border-r border-gray-200">
                    <div>${formatCurrency(c.apl)}</div>
                    ${
                      showDiff
                        ? `<div class="text-xs ${
                            diff > 0 ? "text-green-600" : "text-red-600"
                          } mt-1">
                        ${diff > 0 ? "+" : ""}${formatCurrency(diff)} 
                        <span class="text-xs">(${
                          diffPct > 0 ? "+" : ""
                        }${diffPct.toFixed(1)}%)</span>
                      </div>`
                        : ""
                    }
                  </td>`;
                })
                .join("")}
            </tr>
            <tr class="bg-gray-50 hover:bg-gray-100">
              <td class="p-3 font-semibold border-r border-gray-200">Type de logement</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 text-sm border-r border-gray-200">${c.typeLogement}</td>`
                )
                .join("")}
            </tr>
            <tr class="hover:bg-purple-50">
              <td class="p-3 font-semibold border-r border-gray-200">Revenus nets/mois</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 border-r border-gray-200">${formatCurrency(
                      c.revenus
                    )}</td>`
                )
                .join("")}
            </tr>
            <tr class="bg-gray-50 hover:bg-gray-100">
              <td class="p-3 font-semibold border-r border-gray-200">Situation familiale</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 text-sm border-r border-gray-200">${c.situation}</td>`
                )
                .join("")}
            </tr>
            <tr class="hover:bg-purple-50">
              <td class="p-3 font-semibold border-r border-gray-200">Enfants</td>
              ${this.calculs
                .map(
                  (c) =>
                    `<td class="p-3 text-center text-gray-700 border-r border-gray-200">${
                      c.nombreEnfants || 0
                    }</td>`
                )
                .join("")}
            </tr>
            <tr class="bg-purple-50 font-bold text-lg border-2 border-purple-300">
              <td class="p-3 border-r border-gray-200">📅 APL annuelle</td>
              ${this.calculs
                .map(
                  (c) => `
                <td class="p-3 text-center ${
                  c.apl === maxAPL ? "text-green-700" : "text-gray-900"
                } border-r border-gray-200">
                  ${formatCurrency(c.apl * 12)}
                </td>`
                )
                .join("")}
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Conseils pédagogiques -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-bold text-blue-900 mb-2">📊 Ce que vous voyez</h4>
          <p class="text-sm text-blue-800">
            Les différences d'APL entre vos scénarios. Comparez les montants pour voir quelle situation vous est la plus favorable.
          </p>
        </div>
        <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h4 class="font-bold text-green-900 mb-2">💡 Comment l'utiliser</h4>
          <p class="text-sm text-green-800">
            Testez différentes configurations (type de logement, loyer, revenus) pour trouver l'option qui maximise votre aide.
          </p>
        </div>
      </div>

      <div class="mt-4 p-4 bg-orange-50 rounded-lg text-sm text-orange-800 border-l-4 border-orange-500">
        <strong>⚠️ Important :</strong> Cette simulation est à titre indicatif. <a href="https://www.caf.fr" target="_blank" class="underline font-medium hover:no-underline">Consultez la CAF</a> pour connaître votre droit réel à l'APL.
      </div>

      <!-- 🧠 PROPOSITION 3: Comparateur "honnête" + disclaimer SEO/IA -->
      <div class="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
        <p class="mb-1">📊 Les scénarios affichés respectent les plafonds de loyer et de ressources généralement appliqués par la CAF.</p>
        <p class="italic">Sources et règles basées sur les barèmes CAF, observatoires logement et pratiques constatées (simulation non contractuelle).</p>
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
      localStorage.removeItem("comparaison_apl");
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

export default ComparaisonAPL;
