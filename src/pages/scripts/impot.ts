import { CalculatorFrame } from "../../components/CalculatorFrame.ts";
import { ComparisonModal } from "../../components/ComparisonModal.ts";
import { formatCurrency } from "../../main.ts";
import { calculerIR } from "../../utils/irCalculEngine.ts";

const impotConfig = {
  title: "Impôt sur le revenu 2026",
  description: "Barème progressif et quotient familial (données officielles).",
  fields: [
    {
      id: "revenu",
      label: "Revenu imposable annuel (€)",
      type: "number" as const,
      required: true,
      placeholder: "38000",
      min: 0,
      step: 100,
    },
    {
      id: "parts",
      label: "Nombre de parts",
      type: "number" as const,
      required: true,
      placeholder: "1",
      min: 0.5,
      step: 0.5,
    },
  ],
  calculate: (values: Record<string, any>) => {
    try {
      const revenu = Number(values.revenu);
      const parts = Number(values.parts);
      const r = calculerIR({ revenu, parts });
      return {
        success: true,
        data: {
          revenu: r.revenu,
          parts: r.parts,
          qf: r.qf,
          irBrut: r.irBrut,
          tauxMoyen: r.tauxMoyen,
          tauxMarginal: r.tauxMarginal,
          mensualiteMoyenne: r.mensualiteMoyenne,
        },
      };
    } catch (e) {
      return {
        success: false,
        error: "Erreur lors du calcul. Vérifiez vos données.",
      };
    }
  },
  formatResult: (result: any) => {
    const d = result.data;
    return `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-800">IR brut estimé</h4>
          <p class="text-xl font-bold text-primary-600">${formatCurrency(
            d.irBrut
          )}</p>
          <p class="text-sm text-gray-600">Mensualité moyenne: ${formatCurrency(
            d.mensualiteMoyenne
          )}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-800">Quotient familial</h4>
          <p class="text-xl font-bold text-green-600">${formatCurrency(
            d.qf
          )}</p>
          <p class="text-sm text-gray-600">Taux marginal: ${(
            d.tauxMarginal * 100
          ).toFixed(0)}% • Taux moyen: ${(d.tauxMoyen * 100).toFixed(1)}%</p>
        </div>
      </div>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2">
        <p class="text-sm text-yellow-800">Estimation indicative selon barème progressif. Décote, réductions et crédits d’impôt ne sont pas intégrés.</p>
      </div>
    </div>
    `;
  },
};

new CalculatorFrame("impot-calculator", impotConfig);

const compIR: Array<{
  label: string;
  revenu: number;
  parts: number;
  qf: number;
  irBrut: number;
  mensualiteMoyenne: number;
  tauxMarginal: number;
  tauxMoyen: number;
}> = [];

// Palette de couleurs pour les différents scénarios
const colors = [
  { bg: "rgba(249,115,22,0.8)", border: "rgba(249,115,22,1)" }, // Orange
  { bg: "rgba(34,197,94,0.8)", border: "rgba(34,197,94,1)" }, // Vert
  { bg: "rgba(59,130,246,0.8)", border: "rgba(59,130,246,1)" }, // Bleu
  { bg: "rgba(168,85,247,0.8)", border: "rgba(168,85,247,1)" }, // Violet
  { bg: "rgba(236,72,153,0.8)", border: "rgba(236,72,153,1)" }, // Rose
  { bg: "rgba(14,165,233,0.8)", border: "rgba(14,165,233,1)" }, // Cyan
];

// Listener pour auto-ajouter le premier calcul à la comparaison
window.addEventListener("calculator-updated", (event: any) => {
  if (event.detail?.elementId !== "impot-calculator") return;

  const last = (window as any)["dernierCalcul_impot-calculator"];
  if (!last?.result?.success || compIR.length > 0) return;

  const d = last.result.data;
  const label = `${d.parts} part(s) • Revenu ${fmtEUR(d.revenu)}`;

  compIR.push({
    label,
    revenu: d.revenu,
    parts: d.parts,
    qf: d.qf,
    irBrut: d.irBrut,
    mensualiteMoyenne: d.mensualiteMoyenne,
    tauxMarginal: d.tauxMarginal,
    tauxMoyen: d.tauxMoyen,
  });
  renderIR();
});

function fmtEUR(v: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}
function renderIR() {
  const container = document.getElementById("impot-comparaison");
  if (!container) {
    return;
  }
  if (compIR.length === 0) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }
  container.classList.remove("hidden");
  const chartId = `chart-ir-${Date.now()}`;
  const headers = compIR.map((c) => c.label);
  const data = compIR.map((c) => c.irBrut);
  const html = `
  <div class="bg-white border-2 border-orange-500 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Comparaison des scénarios</h3>
      <button id="impot-clear-all" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold">
        🔄 Réinitialiser tout
      </button>
    </div>
    <div class="max-w-md mx-auto mb-6">
      <div class="h-64"><canvas id="${chartId}" class="w-full h-full"></canvas></div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200 rounded-lg text-sm">
        <thead><tr class="bg-blue-50"><th class="p-3 text-left font-semibold">Critère</th>${headers
          .map(
            (h, idx) =>
              `<th class=\"p-3 text-center font-semibold\">${h}<br><button class="text-xs text-red-600 hover:text-red-800 mt-1" onclick="deleteImpotScenario(${idx})">✕ Supprimer</button></th>`
          )
          .join("")}</tr></thead>
        <tbody>
          <tr class="hover:bg-gray-50"><td class="p-3">Revenu imposable</td>${compIR
            .map(
              (c) => `<td class=\"p-3 text-center\">${fmtEUR(c.revenu)}</td>`
            )
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Nombre de parts</td>${compIR
            .map((c) => `<td class=\"p-3 text-center\">${c.parts}</td>`)
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Quotient familial</td>${compIR
            .map((c) => `<td class=\"p-3 text-center\">${fmtEUR(c.qf)}</td>`)
            .join("")}</tr>
          <tr class="bg-green-50 font-semibold"><td class="p-3">IR brut estimé</td>${compIR
            .map(
              (c) => `<td class=\"p-3 text-center\">${fmtEUR(c.irBrut)}</td>`
            )
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Mensualité moyenne</td>${compIR
            .map(
              (c) =>
                `<td class=\"p-3 text-center\">${fmtEUR(
                  c.mensualiteMoyenne
                )}</td>`
            )
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Taux marginal</td>${compIR
            .map(
              (c) =>
                `<td class=\"p-3 text-center\">${(c.tauxMarginal * 100).toFixed(
                  0
                )}%</td>`
            )
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Taux moyen</td>${compIR
            .map(
              (c) =>
                `<td class=\"p-3 text-center\">${(c.tauxMoyen * 100).toFixed(
                  1
                )}%</td>`
            )
            .join("")}</tr>
        </tbody>
      </table>
    </div>
  </div>`;
  container.innerHTML = html;

  // Ajouter le listener pour le bouton "Réinitialiser tout"
  document.getElementById("impot-clear-all")?.addEventListener("click", () => {
    compIR.length = 0;
    renderIR();
  });

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
      const canvas = document.getElementById(
        chartId
      ) as HTMLCanvasElement | null;
      const ctx = canvas ? canvas.getContext("2d") : null;
      if (!ctx) {
        return;
      }

      // Créer des datasets avec des couleurs différentes pour chaque scénario
      const datasets = compIR.map((scenario, index) => {
        const color = colors[index % colors.length];
        return {
          label: scenario.label,
          data: [scenario.irBrut],
          backgroundColor: color.bg,
          borderColor: color.border,
          borderWidth: 2,
          borderRadius: 8,
        };
      });

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["IR brut estimé"],
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: "top" } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v: any) => v.toLocaleString("fr-FR") + " €" },
              grid: { color: "rgba(0,0,0,0.05)" },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }
  );
}

function deleteImpotScenario(index: number) {
  compIR.splice(index, 1);
  renderIR();
}
(window as any).deleteImpotScenario = deleteImpotScenario;

document
  .getElementById("impot-add-to-compare")
  ?.addEventListener("click", () => {
    const last = (window as any)["dernierCalcul_impot-calculator"];
    if (!last || !last.result?.success) {
      alert("Veuillez d'abord effectuer un calcul.");
      return;
    }

    const d = last.result.data;
    const modal = new ComparisonModal({
      title: "Ajouter un scénario à la comparaison",
      fields: [
        {
          id: "revenu",
          label: "Revenu imposable annuel (€)",
          type: "number",
          value: d.revenu,
          required: true,
          min: 0,
          step: 100,
        },
        {
          id: "parts",
          label: "Nombre de parts",
          type: "number",
          value: d.parts,
          required: true,
          min: 0.5,
          step: 0.5,
        },
      ],
      onConfirm: (values) => {
        const revenu = Number(values.revenu);
        const parts = Number(values.parts);
        const r = calculerIR({ revenu, parts });
        const label = `${fmtEUR(r.revenu)} • ${r.parts} part(s)`;
        compIR.push({
          label,
          revenu: r.revenu,
          parts: r.parts,
          qf: r.qf,
          irBrut: r.irBrut,
          mensualiteMoyenne: r.mensualiteMoyenne,
          tauxMarginal: r.tauxMarginal,
          tauxMoyen: r.tauxMoyen,
        });
        renderIR();
      },
    });

    modal.open();
  });
document
  .getElementById("impot-reset-compare")
  ?.addEventListener("click", () => {
    compIR.length = 0;
    renderIR();
  });

async function irPNG() {
  const c = document.getElementById("impot-comparaison");
  if (!c) return;
  const { default: html2canvas } = await import("html2canvas");
  const excl = [...document.querySelectorAll('[data-export-exclude="true"]')];
  const prev = excl.map((el) =>
    el instanceof HTMLElement ? el.style.display : ""
  );
  excl.forEach((el) => {
    if (el instanceof HTMLElement) el.style.display = "none";
  });
  const canvas = await html2canvas(c, {
    useCORS: true,
    scale: Math.max(2, Math.ceil((window.devicePixelRatio || 1) as number)),
    backgroundColor: "#ffffff",
    logging: false,
  });
  excl.forEach((el, i) => {
    if (el instanceof HTMLElement) el.style.display = prev[i] || "";
  });
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `comparaison-ir-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
async function irPDF() {
  const c = document.getElementById("impot-comparaison");
  if (!c) return;
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");
  const excl = [...document.querySelectorAll('[data-export-exclude="true"]')];
  const prev = excl.map((el) =>
    el instanceof HTMLElement ? el.style.display : ""
  );
  excl.forEach((el) => {
    if (el instanceof HTMLElement) el.style.display = "none";
  });
  const canvas = await html2canvas(c, {
    useCORS: true,
    scale: Math.max(2, Math.ceil((window.devicePixelRatio || 1) as number)),
    backgroundColor: "#ffffff",
    logging: false,
  });
  excl.forEach((el, i) => {
    if (el instanceof HTMLElement) el.style.display = prev[i] || "";
  });
  const pdf = new jsPDF("p", "mm", "a4");
  const imgW = pdf.internal.pageSize.getWidth() - 20;
  const imgH = (canvas.height * imgW) / canvas.width;
  const pdfH = pdf.internal.pageSize.getHeight();
  let y = 10;
  if (imgH > pdfH - y - 10) {
    let remain = imgH;
    let srcY = 0;
    while (remain > 0) {
      const sliceH = Math.min(remain, pdfH - y - 10);
      const srcH = (sliceH * canvas.height) / imgH;
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = srcH;
      const ctx = slice.getContext("2d");
      if (!ctx) break;
      ctx.drawImage(
        canvas,
        0,
        srcY,
        canvas.width,
        srcH,
        0,
        0,
        canvas.width,
        srcH
      );
      const data = slice.toDataURL("image/png");
      pdf.addImage(data, "PNG", 10, y, imgW, sliceH);
      remain -= sliceH;
      srcY += srcH;
      if (remain > 0) {
        pdf.addPage();
        y = 10;
      }
    }
  } else {
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, y, imgW, imgH);
  }
  pdf.save(`comparaison-ir-${Date.now()}.pdf`);
}
document.getElementById("impot-download-png")?.addEventListener("click", irPNG);
document.getElementById("impot-download-pdf")?.addEventListener("click", irPDF);
