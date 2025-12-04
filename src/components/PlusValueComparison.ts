/**
 * Gestion de la comparaison de plus-values immobilières
 */

export class PlusValueComparison {
  private static comparisons: any[] = [];
  private static container: HTMLElement | null = null;

  static initialize(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
  }

  static addComparison(data: any) {
    // Ajouter une ID unique à chaque comparaison
    const id = `comparison-${Date.now()}`;
    this.comparisons.push({
      id,
      ...data,
      timestamp: new Date(),
    });

    this.render();
    return id;
  }

  static removeComparison(id: string) {
    this.comparisons = this.comparisons.filter((c) => c.id !== id);
    this.render();
  }

  static clearAll() {
    this.comparisons = [];
    this.render();
  }

  static getComparisons() {
    return this.comparisons;
  }

  private static render() {
    if (!this.container) return;

    if (this.comparisons.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <p>Aucune comparaison pour le moment</p>
          <p class="text-sm">Cliquez sur "➕ Ajouter à la comparaison" pour commencer</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">📊 Comparaison de plus-values</h2>
          <div class="flex items-center gap-2" data-export-exclude="true">
            <button id="pv-download-png" class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-2 rounded-lg text-sm shadow-sm">PNG</button>
            <button id="pv-download-pdf" class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-2 rounded-lg text-sm shadow-sm">PDF</button>
            <button id="clear-comparisons" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">
              🗑️ Tout effacer
            </button>
          </div>
        </div>

        <!-- Tableau de comparaison -->
        <div class="overflow-x-auto mb-8">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Bien</th>
                <th class="text-right px-4 py-3 font-semibold">Prix vente</th>
                <th class="text-right px-4 py-3 font-semibold">Plus-value brute</th>
                <th class="text-right px-4 py-3 font-semibold">Impôts</th>
                <th class="text-right px-4 py-3 font-semibold">Plus-value nette</th>
                <th class="text-right px-4 py-3 font-semibold">Taux effectif</th>
                <th class="text-center px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
    `;

    this.comparisons.forEach((comp, index) => {
      const tauxEffectif =
        comp.plusValueBrute > 0
          ? ((comp.impotTotal / comp.plusValueBrute) * 100).toFixed(1)
          : 0;

      html += `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
          <td class="px-4 py-3">
            <div class="font-semibold text-gray-900">Bien ${index + 1}</div>
            <div class="text-xs text-gray-500">${comp.typeBien}</div>
          </td>
          <td class="text-right px-4 py-3 font-semibold text-gray-900">
            ${this.formatCurrency(comp.prixVente)}
          </td>
          <td class="text-right px-4 py-3 font-semibold text-blue-600">
            ${this.formatCurrency(comp.plusValueBrute)}
          </td>
          <td class="text-right px-4 py-3 font-semibold text-red-600">
            ${this.formatCurrency(comp.impotTotal)}
          </td>
          <td class="text-right px-4 py-3 font-semibold text-green-600">
            ${this.formatCurrency(comp.plusValueNette)}
          </td>
          <td class="text-right px-4 py-3 font-semibold text-orange-600">
            ${tauxEffectif}%
          </td>
          <td class="text-center px-4 py-3">
            <button class="remove-comparison px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs" data-id="${
              comp.id
            }">
              ✕
            </button>
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>

        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Total plus-values brutes</p>
            <p class="text-2xl font-bold text-blue-600">
              ${this.formatCurrency(
                this.comparisons.reduce((sum, c) => sum + c.plusValueBrute, 0)
              )}
            </p>
          </div>
          <div class="bg-red-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Total impôts</p>
            <p class="text-2xl font-bold text-red-600">
              ${this.formatCurrency(
                this.comparisons.reduce((sum, c) => sum + c.impotTotal, 0)
              )}
            </p>
          </div>
          <div class="bg-green-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Total plus-values nettes</p>
            <p class="text-2xl font-bold text-green-600">
              ${this.formatCurrency(
                this.comparisons.reduce((sum, c) => sum + c.plusValueNette, 0)
              )}
            </p>
          </div>
          <div class="bg-purple-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Taux moyen</p>
            <p class="text-2xl font-bold text-purple-600">
              ${(
                this.comparisons.reduce(
                  (sum, c) => sum + (c.impotTotal / c.plusValueBrute) * 100,
                  0
                ) / this.comparisons.length
              ).toFixed(1)}%
            </p>
          </div>
        </div>

        <!-- Graphique de comparaison -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">📈 Comparaison graphique</h3>
          <canvas id="comparison-chart" style="max-height: 400px;"></canvas>
        </div>
      </div>
    `;

    this.container!.innerHTML = html;

    // Attacher les event listeners
    document
      .getElementById("clear-comparisons")
      ?.addEventListener("click", () => {
        this.clearAll();
      });

    document.querySelectorAll(".remove-comparison").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.target as HTMLElement).getAttribute("data-id");
        if (id) this.removeComparison(id);
      });
    });

    document.getElementById("pv-download-png")?.addEventListener("click", () => {
      this.exportPNG();
    });
    document.getElementById("pv-download-pdf")?.addEventListener("click", () => {
      this.exportPDF();
    });

    // Générer le graphique
    if (this.comparisons.length > 0) {
      setTimeout(() => this.renderChart(), 100);
    }
  }

  private static renderChart() {
    const canvas = document.getElementById(
      "comparison-chart"
    ) as HTMLCanvasElement;
    const Chart = (window as any).Chart;
    if (!canvas || !Chart) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const labels = this.comparisons.map((_, i) => `Bien ${i + 1}`);
    const impotIRData = this.comparisons.map((c) => c.impotIR);
    const surtaxeData = this.comparisons.map((c) => c.surtaxe);
    const impotPSData = this.comparisons.map((c) => c.impotPS);

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Impôt sur revenu",
            data: impotIRData,
            backgroundColor: "#ef4444",
          },
          {
            label: "Surtaxe",
            data: surtaxeData,
            backgroundColor: "#f59e0b",
          },
          {
            label: "Prélèvements sociaux",
            data: impotPSData,
            backgroundColor: "#8b5cf6",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: { stacked: false },
          y: { stacked: false },
        },
      },
    });
  }

  private static async exportPNG(): Promise<void> {
    try {
      if (!this.container) return;
      const { default: html2canvas } = await import("html2canvas");
      const excludeEls = Array.from(document.querySelectorAll('[data-export-exclude="true"]')) as HTMLElement[];
      const prevDisplay = excludeEls.map((el) => el.style.display || "");
      excludeEls.forEach((el) => (el.style.display = "none"));
      const canvas = await html2canvas(this.container, {
        useCORS: true,
        scale: Math.max(2, Math.ceil(window.devicePixelRatio || 1)),
        backgroundColor: "#ffffff",
        logging: false,
      });
      excludeEls.forEach((el, i) => (el.style.display = prevDisplay[i]));
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `comparaison-plusvalue-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {}
  }

  private static async exportPDF(): Promise<void> {
    try {
      if (!this.container) return;
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");
      const excludeEls = Array.from(document.querySelectorAll('[data-export-exclude="true"]')) as HTMLElement[];
      const prevDisplay = excludeEls.map((el) => el.style.display || "");
      excludeEls.forEach((el) => (el.style.display = "none"));
      const canvas = await html2canvas(this.container, {
        useCORS: true,
        scale: Math.max(2, Math.ceil(window.devicePixelRatio || 1)),
        backgroundColor: "#ffffff",
        logging: false,
      });
      excludeEls.forEach((el, i) => (el.style.display = prevDisplay[i]));

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let y = 10;

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Comparaison de plus-values", 10, y);
      y += 12;

      if (imgHeight > pdfHeight - y - 10) {
        let remaining = imgHeight;
        let srcY = 0;
        while (remaining > 0) {
          const sliceH = Math.min(remaining, pdfHeight - y - 10);
          const srcH = (sliceH * canvas.height) / imgHeight;
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = srcH;
          const ctx = slice.getContext("2d");
          if (!ctx) break;
          ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          const data = slice.toDataURL("image/png");
          pdf.addImage(data, "PNG", 10, y, imgWidth, sliceH);
          remaining -= sliceH;
          srcY += srcH;
          if (remaining > 0) {
            pdf.addPage();
            y = 10;
          }
        }
      } else {
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, y, imgWidth, imgHeight);
      }

      pdf.save(`comparaison-plusvalue-${Date.now()}.pdf`);
    } catch (_) {}
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
