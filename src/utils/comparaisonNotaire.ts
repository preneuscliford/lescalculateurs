/**
 * Gestion de la comparaison multi-villes pour les frais de notaire
 */

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrer les composants Chart.js nécessaires
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface CalculNotaire {
  id: string;
  timestamp: number;
  departement: string;
  departementLabel: string;
  typeBien: string;
  prixAchat: number;
  prixNetImmobilier: number;
  montantMobilier: number;
  typeEmprunt: string;
  montantTotalPrets: number;
  emoluments: number;
  droitsEnregistrement: number;
  fraisDivers: number;
  fraisHypotheque: number;
  fraisTerrain: number;
  tva: number;
  total: number;
  pourcentage: number;
}

class ComparaisonNotaire {
  private calculs: CalculNotaire[] = [];
  private maxComparaisons = 4;
  private containerId: string;
  private currentChart: Chart | null = null;
  private currentChartId: string = "";

  constructor(containerId: string) {
    this.containerId = containerId;
  }

  /**
   * Ajoute un calcul à la comparaison
   */
  ajouterCalcul(result: any, values: any, departementLabel: string): void {
    if (this.calculs.length >= this.maxComparaisons) {
      alert(
        `Vous ne pouvez comparer que ${this.maxComparaisons} villes maximum`
      );
      return;
    }

    // Vérifier si ce département existe déjà
    const departementExiste = this.calculs.some(
      (c) => c.departement === values.departement
    );
    if (departementExiste) {
      if (
        confirm(
          `Le département "${departementLabel}" est déjà dans la comparaison.\n\nVoulez-vous le remplacer par ce nouveau calcul ?`
        )
      ) {
        // Supprimer l'ancien calcul de ce département
        this.calculs = this.calculs.filter(
          (c) => c.departement !== values.departement
        );
      } else {
        return;
      }
    }

    const calcul: CalculNotaire = {
      id: `calcul-${Date.now()}`,
      timestamp: Date.now(),
      departement: values.departement,
      departementLabel: departementLabel,
      typeBien: values.type_bien,
      prixAchat: result.data.prixAchat,
      prixNetImmobilier: result.data.prixNetImmobilier,
      montantMobilier: result.data.montantMobilier || 0,
      typeEmprunt: values.type_emprunt,
      montantTotalPrets: result.data.montantTotalPrets || 0,
      emoluments: result.data.emoluments,
      droitsEnregistrement: result.data.droitsEnregistrement,
      fraisDivers: result.data.fraisDivers,
      fraisHypotheque: result.data.fraisHypotheque || 0,
      fraisTerrain: result.data.fraisTerrain || 0,
      tva: result.data.tva,
      total: result.data.total,
      pourcentage: result.data.pourcentage,
    };

    this.calculs.push(calcul);
    this.afficherComparaison();
  }

  /**
   * Supprime un calcul de la comparaison
   */
  supprimerCalcul(id: string): void {
    this.calculs = this.calculs.filter((c) => c.id !== id);
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

    // Créer le graphique Chart.js après l'affichage du HTML
    this.creerGraphique();
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
   * Crée le graphique Chart.js
   */
  private creerGraphique(): void {
    // Détruire le graphique précédent s'il existe
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }

    // Trouver le canvas (généré dans le HTML avec un ID unique)
    const chartId = `chart-${this.currentChartId}`;
    const canvas = document.querySelector(
      `canvas[id^="chart-"]`
    ) as HTMLCanvasElement;

    if (!canvas) {
      console.error("Canvas non trouvé pour le graphique");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Préparer les données
    const labels = this.calculs.map((c) => c.departementLabel.split(" (")[0]);
    const totaux = this.calculs.map((c) => c.total);
    const minTotal = Math.min(...totaux);

    // Palette de couleurs pour chaque département
    const colorPalette = [
      { bg: "rgba(59, 130, 246, 0.8)", border: "rgba(59, 130, 246, 1)" }, // Bleu
      { bg: "rgba(147, 51, 234, 0.8)", border: "rgba(147, 51, 234, 1)" }, // Violet
      { bg: "rgba(236, 72, 153, 0.8)", border: "rgba(236, 72, 153, 1)" }, // Rose
      { bg: "rgba(249, 115, 22, 0.8)", border: "rgba(249, 115, 22, 1)" }, // Orange
    ];

    const greenColor = {
      bg: "rgba(34, 197, 94, 0.8)",
      border: "rgba(34, 197, 94, 1)",
    }; // Vert

    // Assigner une couleur unique à chaque département
    const backgroundColors = totaux.map((t, index) => {
      if (t === minTotal) {
        return greenColor.bg; // Vert pour le moins cher
      }
      return colorPalette[index % colorPalette.length].bg;
    });

    const borderColors = totaux.map((t, index) => {
      if (t === minTotal) {
        return greenColor.border;
      }
      return colorPalette[index % colorPalette.length].border;
    });

    // Créer le graphique
    this.currentChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Frais de notaire totaux (€)",
            data: totaux,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 60,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const calcul = this.calculs[context.dataIndex];
                return [
                  `Total : ${value.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}`,
                  `Soit ${calcul.pourcentage.toFixed(2)}% du prix`,
                ];
              },
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return value.toLocaleString("fr-FR") + " €";
              },
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            ticks: {
              font: {
                size: 12,
                weight: "bold",
              },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  /**
   * Génère le HTML du tableau comparatif
   */
  private genererHTML(): string {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    const getTypeBienLabel = (type: string) => {
      if (type === "ancien") return "Bien ancien";
      if (type === "neuf") return "Bien neuf";
      return "Terrain";
    };

    const minTotal = Math.min(...this.calculs.map((c) => c.total));
    const maxTotal = Math.max(...this.calculs.map((c) => c.total));

    // Générer un ID unique pour le canvas
    this.currentChartId = Date.now().toString();
    const chartId = `chart-${this.currentChartId}`;

    return `
      <div class="bg-white border-2 border-blue-500 rounded-lg p-6 mt-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">📊 Comparaison des frais de notaire</h3>
          <button 
            onclick="window.comparaisonNotaire?.reinitialiser()"
            class="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            🗑️ Tout effacer
          </button>
        </div>

        <!-- Graphique Chart.js -->
        <div class="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-5">
          <h4 class="text-base font-semibold text-gray-800 mb-4 text-center">
            📈 Comparatif visuel des frais totaux
          </h4>
          <div class="max-w-4xl mx-auto" style="height: 300px;">
            <canvas id="${chartId}"></canvas>
          </div>
          ${
            this.calculs.length > 1
              ? `
          <div class="mt-4 text-center text-sm text-gray-600">
            💡 Économie maximale possible : <span class="font-bold text-green-600">${formatCurrency(
              maxTotal - minTotal
            )}</span>
          </div>
          `
              : ""
          }
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="text-left p-3 font-semibold">Critère</th>
                ${this.calculs
                  .map(
                    (c, idx) => `
                  <th class="text-center p-3 font-semibold relative">
                    <div>${c.departementLabel}</div>
                    <button 
                      onclick="window.comparaisonNotaire?.supprimerCalcul('${c.id}')"
                      class="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </th>
                `
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <!-- Type de bien -->
              <tr class="hover:bg-gray-50">
                <td class="p-3 font-medium">Type de bien</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center">${getTypeBienLabel(
                    c.typeBien
                  )}</td>
                `
                  )
                  .join("")}
              </tr>

              <!-- Prix d'acquisition -->
              <tr class="hover:bg-gray-50 bg-blue-50">
                <td class="p-3 font-medium">Prix d'acquisition</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center font-semibold">${formatCurrency(
                    c.prixAchat
                  )}</td>
                `
                  )
                  .join("")}
              </tr>

              <!-- Émoluments -->
              <tr class="hover:bg-gray-50">
                <td class="p-3">Émoluments du notaire</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center">${formatCurrency(
                    c.emoluments
                  )}</td>
                `
                  )
                  .join("")}
              </tr>

              <!-- Droits d'enregistrement -->
              <tr class="hover:bg-gray-50">
                <td class="p-3">Droits d'enregistrement</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center ${
                    c.droitsEnregistrement ===
                    Math.min(...this.calculs.map((x) => x.droitsEnregistrement))
                      ? "text-green-600 font-semibold"
                      : ""
                  }">${formatCurrency(c.droitsEnregistrement)}</td>
                `
                  )
                  .join("")}
              </tr>

              <!-- Frais divers -->
              <tr class="hover:bg-gray-50">
                <td class="p-3">Frais divers</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center">${formatCurrency(
                    c.fraisDivers
                  )}</td>
                `
                  )
                  .join("")}
              </tr>

              ${
                this.calculs.some((c) => c.fraisHypotheque > 0)
                  ? `
              <tr class="hover:bg-gray-50">
                <td class="p-3">Frais d'hypothèque</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center">${
                    c.fraisHypotheque > 0
                      ? formatCurrency(c.fraisHypotheque)
                      : "-"
                  }</td>
                `
                  )
                  .join("")}
              </tr>
              `
                  : ""
              }

              <!-- TVA -->
              <tr class="hover:bg-gray-50">
                <td class="p-3">TVA (20%)</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center">${formatCurrency(c.tva)}</td>
                `
                  )
                  .join("")}
              </tr>

              <!-- TOTAL -->
              <tr class="bg-green-50 font-bold">
                <td class="p-3">TOTAL FRAIS DE NOTAIRE</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center ${
                    c.total === Math.min(...this.calculs.map((x) => x.total))
                      ? "text-green-600 text-lg"
                      : "text-gray-900"
                  }">${formatCurrency(c.total)}</td>
                `
                  )
                  .join("")}
              </tr>

              <!-- Pourcentage -->
              <tr class="bg-green-50">
                <td class="p-3">% du prix d'acquisition</td>
                ${this.calculs
                  .map(
                    (c) => `
                  <td class="p-3 text-center font-semibold">${c.pourcentage.toFixed(
                    2
                  )}%</td>
                `
                  )
                  .join("")}
              </tr>

              <!-- Économie potentielle -->
              ${
                this.calculs.length > 1
                  ? `
              <tr class="bg-yellow-50">
                <td class="p-3 font-semibold">💰 Économie vs le moins cher</td>
                ${this.calculs
                  .map((c) => {
                    const minTotal = Math.min(
                      ...this.calculs.map((x) => x.total)
                    );
                    const economie = c.total - minTotal;
                    return `
                  <td class="p-3 text-center font-semibold ${
                    economie === 0 ? "text-green-600" : "text-orange-600"
                  }">
                    ${
                      economie === 0
                        ? "✓ Le moins cher !"
                        : `+ ${formatCurrency(economie)}`
                    }
                  </td>
                `;
                  })
                  .join("")}
              </tr>
              `
                  : ""
              }
            </tbody>
          </table>
        </div>

        ${
          this.calculs.length < this.maxComparaisons
            ? `
        <div class="mt-6 flex flex-col items-center gap-3">
          <button
            onclick="window.ouvrirModaleComparaison?.()"
            class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span class="text-xl">➕</span>
            <span>Ajouter une autre ville</span>
          </button>
          <p class="text-sm text-gray-600">
            💡 Vous pouvez ajouter jusqu'à ${
              this.maxComparaisons - this.calculs.length
            } ville${
                this.maxComparaisons - this.calculs.length > 1 ? "s" : ""
              } supplémentaire${
                this.maxComparaisons - this.calculs.length > 1 ? "s" : ""
              }
          </p>
        </div>
        `
            : `
        <div class="mt-4 text-center text-sm text-gray-600">
          ⚠️ Limite de ${this.maxComparaisons} comparaisons atteinte
        </div>
        `
        }
      </div>
    `;
  }

  /**
   * Réinitialise toutes les comparaisons
   */
  reinitialiser(): void {
    if (confirm("Êtes-vous sûr de vouloir effacer toutes les comparaisons ?")) {
      this.calculs = [];
      this.masquerComparaison();
    }
  }

  /**
   * Obtient le nombre de calculs
   */
  getNombreCalculs(): number {
    return this.calculs.length;
  }

  /**
   * Exporte les comparaisons en CSV
   */
  exporterCSV(): { headers: string[]; rows: (string | number)[][] } {
    const fmt = (n: number) =>
      " " +
      n.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const headers = ["Critère", ...this.calculs.map((c) => c.departementLabel)];

    const rows: (string | number)[][] = [
      [
        "Type de bien",
        ...this.calculs.map((c) =>
          c.typeBien === "ancien"
            ? "Bien ancien"
            : c.typeBien === "neuf"
            ? "Bien neuf"
            : "Terrain"
        ),
      ],
      ["Prix d'acquisition", ...this.calculs.map((c) => fmt(c.prixAchat))],
      ["", ...this.calculs.map(() => "")],
      ["Émoluments du notaire", ...this.calculs.map((c) => fmt(c.emoluments))],
      [
        "Droits d'enregistrement",
        ...this.calculs.map((c) => fmt(c.droitsEnregistrement)),
      ],
      ["Frais divers", ...this.calculs.map((c) => fmt(c.fraisDivers))],
      ...(this.calculs.some((c) => c.fraisHypotheque > 0)
        ? [
            [
              "Frais d'hypothèque",
              ...this.calculs.map((c) =>
                c.fraisHypotheque > 0 ? fmt(c.fraisHypotheque) : "-"
              ),
            ],
          ]
        : []),
      ["TVA (20%)", ...this.calculs.map((c) => fmt(c.tva))],
      ["", ...this.calculs.map(() => "")],
      ["TOTAL FRAIS DE NOTAIRE", ...this.calculs.map((c) => fmt(c.total))],
      [
        "% du prix",
        ...this.calculs.map((c) => ` ${c.pourcentage.toFixed(2)}%`),
      ],
    ];

    return { headers, rows };
  }
}

// Export pour utilisation globale
export { ComparaisonNotaire };
export type { CalculNotaire };
