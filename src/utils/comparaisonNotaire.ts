/**
 * Gestion de la comparaison multi-villes pour les frais de notaire
 */

import type { Chart } from "chart.js";
// Imports lourds chargés dynamiquement au moment de l'usage

// Enregistrement et configuration Chart.js effectués à la demande dans le rendu

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
  fraisFormalites: number;
  fraisHypotheque: number;
  fraisTerrain: number;
  tva: number;
  total: number;
  pourcentage: number;
  csi?: number;
}

class ComparaisonNotaire {
  private calculs: CalculNotaire[] = [];
  private maxComparaisons = 4;
  private containerId: string;
  private currentChart: Chart | null = null;
  private currentChartId: string = "";
  private static SCHEMA_VERSION = "2025-12-10-baremes-json";

  constructor(containerId: string) {
    this.containerId = containerId;
    this.loadFromStorage();
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
      prixAchat: result.data.prixAchat || 0,
      prixNetImmobilier: result.data.prixNetImmobilier || 0,
      montantMobilier: result.data.montantMobilier || 0,
      typeEmprunt: values.type_emprunt,
      montantTotalPrets: result.data.montantTotalPrets || 0,
      emoluments: result.data.emoluments || 0,
      droitsEnregistrement: result.data.droitsEnregistrement || 0,
      fraisDivers: result.data.debours || 0,
      fraisFormalites: result.data.formalites || 0,
      fraisHypotheque: result.data.fraisHypotheque || 0,
      fraisTerrain: result.data.fraisTerrain || 0,
      tva: result.data.tva || 0,
      total: result.data.total || 0,
      pourcentage: result.data.pourcentage || 0,
      csi: result.data.csi || 0,
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

    // Créer le graphique Chart.js après l'affichage du HTML
    this.creerGraphique();
  }

  /**
   * Persistance simple de la comparaison (localStorage)
   */
  private saveToStorage(): void {
    try {
      const payload = {
        version: ComparaisonNotaire.SCHEMA_VERSION,
        calculs: this.calculs,
      };
      localStorage.setItem("comparaison_notaires", JSON.stringify(payload));
    } catch (_) {}
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem("comparaison_notaires");
      if (!raw) return;
      const payload = JSON.parse(raw);
      const version = payload?.version;
      const list = payload?.calculs;
      if (version !== ComparaisonNotaire.SCHEMA_VERSION || !Array.isArray(list)) {
        // Invalide ou ancien format → nettoyage
        localStorage.removeItem("comparaison_notaires");
        return;
      }
      this.calculs = list;
      if (this.calculs.length > 0) this.afficherComparaison();
    } catch (_) {}
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
   * Réinitialise complètement la comparaison (efface tout sans rechargement)
   */
  public reinitialiser(): void {
    try {
      this.calculs = [];
      localStorage.removeItem("comparaison_notaires");
      const container = document.getElementById(this.containerId);
      if (container) {
        container.innerHTML = "";
      }
      this.masquerComparaison();
    } catch (_) {}
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

    // Charger Chart.js et créer le graphique à la demande (code-splitting)
    import("chart.js").then(
      ({
        Chart,
        BarController,
        BarElement,
        CategoryScale,
        LinearScale,
        Tooltip,
        Legend,
      }) => {
        Chart.register(
          BarController,
          BarElement,
          CategoryScale,
          LinearScale,
          Tooltip,
          Legend
        );
        Chart.defaults.devicePixelRatio = Math.max(
          1,
          Math.ceil(window.devicePixelRatio || 1)
        );

        this.currentChart = new Chart(ctx!, {
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
            animation: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y;
                    const calcul = this.calculs[context.dataIndex];
                    const base = calcul?.prixAchat || 0;
                    const pctVal = base > 0 ? (value / base) * 100 : 0;
                    const pctStr = base > 0 ? pctVal.toFixed(2).replace(".", ",") + "%" : "—";
                    return [
                      `Total : ${value.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`,
                      `Soit ${pctStr} du prix`,
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
    );
    const btnPNG = document.getElementById("btn-download-chart-png");
    const btnPDF = document.getElementById("btn-download-chart-pdf");
    btnPNG?.addEventListener("click", () => this.telechargerBlocPNG());
    btnPDF?.addEventListener("click", () => this.telechargerBlocPDF());
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

    // Ensure all required variables are defined
    const prixList = this.calculs.map((c) => c.prixAchat);
    const allSamePrix =
      prixList.length > 0 && prixList.every((v) => v === prixList[0]);
    const prixRef = prixList[0] || 0;
    const minPrix = Math.min(...prixList);
    const maxPrix = Math.max(...prixList);
    // formatCurrency2: like formatCurrency but with 0 decimals if > 1000, else 2 decimals
    const formatCurrency2 = (value: number | undefined) => {
      if (value === undefined || value === null || isNaN(value)) return "0 €";
      return value >= 1000
        ? value.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        : value.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    };
    // getTypeBienLabel: helper for typeBien
    const getTypeBienLabel = (type: string) =>
      type === "ancien"
        ? "Bien ancien"
        : type === "neuf"
        ? "Bien neuf"
        : type === "terrain"
        ? "Terrain"
        : type;

    this.currentChartId = Date.now().toString();
    const chartId = `chart-${this.currentChartId}`;

    return `
      <div class="bg-white border-2 border-blue-500 rounded-lg p-6 mt-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">📊 Comparaison des frais de notaire</h3>
            <div class="mt-1 text-sm text-gray-700">
              ${
                allSamePrix
                  ? `Pour un prix d'acquisition de <span class="font-semibold">${formatCurrency2(
                      prixRef
                    )}</span>`
                  : prixList.length > 0
                  ? `Pour des prix d'acquisition de <span class="font-semibold">${formatCurrency2(
                      minPrix
                    )}</span> à <span class="font-semibold">${formatCurrency2(
                      maxPrix
                    )}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="flex gap-2" data-export-exclude="true">
            <button id="btn-download-chart-png" class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-2 rounded-lg text-sm shadow-sm" title="Télécharger le graphique et tableau en PNG">PNG</button>
            <button id="btn-download-chart-pdf" class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-2 rounded-lg text-sm shadow-sm" title="Télécharger le graphique et tableau en PDF">PDF</button>
            <button onclick="window.comparaisonNotaire?.reinitialiser()" class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-2 rounded-lg text-sm shadow-sm" title="Réinitialiser la comparaison">Réinitialiser</button>
          </div>
        </div>
        <div class="w-full h-72 mb-6">
          <canvas id="${chartId}" class="w-full h-full"></canvas>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead>
              <tr class="bg-blue-50">
                <th class="p-3 text-left font-semibold cursor-pointer" title="Trier">Critère</th>
                ${this.calculs
                  .map(
                    (c) =>
                      `<th class="p-3 text-center font-semibold cursor-pointer" title="Trier">${c.departementLabel}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="Type de bien (ancien, neuf, terrain)">Type de bien</td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center">${getTypeBienLabel(
                        c.typeBien
                      )}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="Prix d'acquisition du bien immobilier">Prix d'acquisition</td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center">${formatCurrency2(
                        c.prixAchat
                      )}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="bg-gray-100">
                <td class="p-3 font-semibold" colspan="${
                  this.calculs.length + 1
                }">Détail des frais</td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="Émoluments du notaire selon le barème officiel">Émoluments du notaire <span class='cursor-help' title='Rémunération réglementée du notaire, calculée selon le barème officiel.'>🛈</span></td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center">${formatCurrency(
                        c.emoluments
                      )}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="Droits d'enregistrement (ou de mutation)">Droits d'enregistrement <span class='cursor-help' title='Taxes perçues par l'État et les collectivités locales lors de la vente.'>🛈</span></td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center ${
                        c.droitsEnregistrement ===
                        Math.min(
                          ...this.calculs.map((x) => x.droitsEnregistrement)
                        )
                          ? "text-green-600 font-semibold"
                          : ""
                      }">${formatCurrency(c.droitsEnregistrement)}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="Débours (frais avancés par le notaire pour le compte de l'acquéreur)">Débours <span class='cursor-help' title='Sommes avancées par le notaire pour le compte de l’acquéreur (cadastre, conservation, etc.).'>🛈</span></td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center">${formatCurrency(
                        c.fraisDivers
                      )}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="Formalités diverses">Formalités diverses <span class='cursor-help' title='Frais de formalités diverses.'>🛈</span></td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center">${formatCurrency(
                        c.fraisFormalites
                      )}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="Contribution de Sécurité Immobilière (CSI)">Contribution de Sécurité Immobilière (CSI) <span class='cursor-help' title='Contribution de sécurité immobilière.'>🛈</span></td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center">${formatCurrency(
                        c.csi || 0
                      )}</td>`
                  )
                  .join("")}
              </tr>
              ${
                this.calculs.some((c) => c.fraisHypotheque > 0)
                  ? `<tr class="hover:bg-gray-50"><td class="p-3" title="Frais d'hypothèque (si emprunt)">Frais d'hypothèque <span class='cursor-help' title='Frais liés à la prise d’une garantie hypothécaire.'>🛈</span></td>${this.calculs
                      .map(
                        (c) =>
                          `<td class="p-3 text-center">${
                            c.fraisHypotheque > 0
                              ? formatCurrency(c.fraisHypotheque)
                              : "-"
                          }</td>`
                      )
                      .join("")}</tr>`
                  : ""
              }
              <tr class="hover:bg-gray-50">
                <td class="p-3" title="TVA sur les émoluments et certains frais">TVA (20%) <span class='cursor-help' title='Taxe sur la valeur ajoutée appliquée sur les émoluments et certains frais.'>🛈</span></td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center">${formatCurrency(
                        c.tva
                      )}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="bg-green-50 font-bold">
                <td class="p-3" title="Total des frais de notaire">TOTAL FRAIS DE NOTAIRE</td>
                ${this.calculs
                  .map(
                    (c) =>
                      `<td class="p-3 text-center ${
                        c.total ===
                        Math.min(...this.calculs.map((x) => x.total))
                          ? "text-green-600 text-lg"
                          : "text-gray-900"
                      }">${formatCurrency(c.total)}</td>`
                  )
                  .join("")}
              </tr>
              <tr class="bg-green-50">
                <td class="p-3" title="Pourcentage des frais par rapport au prix d'acquisition">% du prix d'acquisition</td>
                ${this.calculs
                  .map(
                    (c) =>
                      (() => {
                        const base = c.prixAchat || 0;
                        const pct = base > 0 ? (c.total / base) * 100 : 0;
                        const str = base > 0 ? pct.toFixed(2).replace(".", ",") + "%" : "—";
                        return `<td class="p-3 text-center font-semibold">${str}</td>`;
                      })()
                  )
                  .join("")}
              </tr>
              ${
                this.calculs.length > 1
                  ? `<tr class="bg-yellow-50"><td class="p-3 font-semibold">💰 Économie vs le moins cher</td>${this.calculs
                      .map((c) => {
                        const minTotal = Math.min(
                          ...this.calculs.map((x) => x.total)
                        );
                        const economie = c.total - minTotal;
                        return `<td class="p-3 text-center font-semibold ${
                          economie === 0 ? "text-green-600" : "text-orange-600"
                        }">${
                          economie === 0
                            ? "✓ Le moins cher !"
                            : `+ ${formatCurrency(economie)}`
                        }</td>`;
                      })
                      .join("")}</tr>`
                  : ""
              }
            </tbody>
          </table>
        </div>
        ${
          this.calculs.length < this.maxComparaisons
            ? `<div class="mt-6 flex flex-col items-center gap-3" data-export-exclude="true"><button onclick="window.ouvrirModaleComparaison?.()" class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"><span class="text-xl">➕</span><span>Ajouter une autre ville</span></button><p class="text-sm text-gray-600">💡 Vous pouvez ajouter jusqu'à ${
                this.maxComparaisons - this.calculs.length
              } ville${
                this.maxComparaisons - this.calculs.length > 1 ? "s" : ""
              } supplémentaire${
                this.maxComparaisons - this.calculs.length > 1 ? "s" : ""
              }</p></div>`
            : `<div class="mt-4 text-center text-sm text-gray-600" data-export-exclude="true">⚠️ Limite de ${this.maxComparaisons} comparaisons atteinte</div>`
        }
      </div>
    `;
  }

  /**
   * Télécharge tout le bloc de comparaison (graphique + tableau) en PNG.
   */
  private async telechargerBlocPNG(): Promise<void> {
    try {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      const { default: html2canvas } = await import("html2canvas");
      const excludeEls = Array.from(
        document.querySelectorAll('[data-export-exclude="true"]')
      ) as HTMLElement[];
      const prevDisplay = excludeEls.map((el) => el.style.display || "");
      excludeEls.forEach((el) => (el.style.display = "none"));
      const canvas = await html2canvas(container, {
        useCORS: true,
        scale: Math.max(2, Math.ceil(window.devicePixelRatio || 1)),
        backgroundColor: "#ffffff",
        logging: false,
      });
      excludeEls.forEach((el, i) => (el.style.display = prevDisplay[i]));
      const dataURL = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = `bloc-comparaison-frais-notaire-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {}
  }

  /**
   * Télécharge tout le bloc de comparaison (graphique + tableau) en PDF.
   */
  private async telechargerBlocPDF(): Promise<void> {
    try {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");
      const excludeEls = Array.from(
        document.querySelectorAll('[data-export-exclude="true"]')
      ) as HTMLElement[];
      const prevDisplay = excludeEls.map((el) => el.style.display || "");
      excludeEls.forEach((el) => (el.style.display = "none"));
      const canvas = await html2canvas(container, {
        useCORS: true,
        scale: Math.max(2, Math.ceil(window.devicePixelRatio || 1)),
        backgroundColor: "#ffffff",
        logging: false,
      });
      excludeEls.forEach((el, i) => (el.style.display = prevDisplay[i]));

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm marges
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 10;

      if (imgHeight > pdfHeight - yPosition - 10) {
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
          if (!ctx) break;
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
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
      }

      pdf.save(`bloc-comparaison-frais-notaire-${Date.now()}.pdf`);
    } catch (_) {}
  }

  /**
   * Télécharge le graphique Chart.js en PNG.
   */
  private telechargerGraphiquePNG(): void {
    try {
      const canvas = document.querySelector(
        `canvas[id^="chart-"]`
      ) as HTMLCanvasElement;
      if (!canvas) return;
      const dataURL = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = `comparaison-frais-notaire-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {}
  }

  /**
   * Télécharge le graphique Chart.js en PDF.
   */
  private async telechargerGraphiquePDF(): Promise<void> {
    try {
      const canvas = document.querySelector(
        `canvas[id^="chart-"]`
      ) as HTMLCanvasElement;
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = margin;
      if (imgHeight > pdfHeight - margin * 2) {
        const scale = (pdfHeight - margin * 2) / imgHeight;
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        pdf.addImage(
          imgData,
          "PNG",
          (pdfWidth - scaledWidth) / 2,
          y,
          scaledWidth,
          scaledHeight
        );
      } else {
        pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
      }
      const filename = `comparaison-frais-notaire-${Date.now()}.pdf`;
      pdf.save(filename);
    } catch (_) {}
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
      ["Débours", ...this.calculs.map((c) => fmt(c.fraisDivers))],
      [
        "Formalités diverses",
        ...this.calculs.map((c) => fmt(c.fraisFormalites)),
      ],
      ["CSI", ...this.calculs.map((c) => fmt(c.csi || 0))],
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

export { ComparaisonNotaire };
