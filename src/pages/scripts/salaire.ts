import { CalculatorFrame } from "../../components/CalculatorFrame.ts";
import { ComparisonModal } from "../../components/ComparisonModal.ts";
import { formatCurrency } from "../../main.ts";
import { calculerSalaire } from "../../utils/salaireCalculEngine.ts";

const salaireConfig = {
  title: "Simulateur salaire brut/net 2026",
  description: "Estimez votre net mensuel et annuel avec PAS.",
  fields: [
    {
      id: "brut",
      label: "Salaire brut mensuel (€)",
      type: "number" as const,
      required: true,
      placeholder: "3000",
      min: 500,
      step: 1,
      quickValues: [
        { label: "1 800 € Non-cadre", value: 1800 },
        { label: "1 800 € Cadre", value: 1800 },
        { label: "2 500 € Non-cadre", value: 2500 },
        { label: "2 500 € Cadre", value: 2500 },
      ],
    },
    {
      id: "statut",
      label: "Statut",
      type: "select" as const,
      required: true,
      options: [
        { value: "non_cadre", label: "Non‑cadre" },
        { value: "cadre", label: "Cadre" },
      ],
      quickValues: [
        { label: "Non-cadre", value: "non_cadre" },
        { label: "Cadre", value: "cadre" },
      ],
    },
    {
      id: "taux_pas",
      label: "Taux PAS (%)",
      type: "number" as const,
      required: false,
      placeholder: "0 à 30",
      min: 0,
      max: 30,
      step: 0.1,
      quickValues: [
        { label: "0%", value: 0 },
        { label: "10%", value: 10 },
        { label: "15%", value: 15 },
        { label: "20%", value: 20 },
      ],
    },
  ],
  calculate: (values: Record<string, any>) => {
    try {
      const brut = Number(values.brut);
      const statut = values.statut;
      const tauxPAS = Number(values.taux_pas) || 0;
      const r = calculerSalaire({
        brutMensuel: brut,
        statut,
        tauxPAS,
      });
      return {
        success: true,
        data: {
          brut: r.brut,
          statut: r.statut,
          tauxSalarial: r.tauxSalarial,
          netAvantImpot: r.netAvantImpot,
          pasMensuel: r.pasMensuel,
          netApresImpot: r.netApresImpot,
          brutAnnuel: r.brutAnnuel,
          netAvantImpotAnnuel: r.netAvantImpotAnnuel,
          pasAnnuel: r.pasAnnuel,
          netApresImpotAnnuel: r.netApresImpotAnnuel,
          tauxPAS: r.tauxPAS,
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
          <h4 class="font-semibold text-gray-800">Net mensuel avant impôt</h4>
          <p class="text-xl font-bold text-primary-600">${formatCurrency(d.netAvantImpot)}</p>
          <p class="text-sm text-gray-600">Taux cotisations salariales ~ ${(
            d.tauxSalarial * 100
          ).toFixed(1)}%</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-800">Net mensuel après PAS</h4>
          <p class="text-xl font-bold text-green-600">${formatCurrency(d.netApresImpot)}</p>
          <p class="text-sm text-gray-600">PAS mensuel: ${formatCurrency(
            d.pasMensuel,
          )} (${Number(d.tauxPAS || 0).toFixed(1)}% )</p>
        </div>
      </div>
      <div class="border-t pt-4">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span>Brut annuel :</span><span class="font-medium">${formatCurrency(
            d.brutAnnuel,
          )}</span></div>
          <div class="flex justify-between"><span>Net annuel avant impôt :</span><span class="font-medium">${formatCurrency(
            d.netAvantImpotAnnuel,
          )}</span></div>
          <div class="flex justify-between"><span>PAS annuel :</span><span class="font-medium">${formatCurrency(
            d.pasAnnuel,
          )}</span></div>
          <div class="flex justify-between"><span>Net annuel après impôt :</span><span class="font-medium">${formatCurrency(
            d.netApresImpotAnnuel,
          )}</span></div>
        </div>
      </div>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2">
        <p class="text-sm text-yellow-800">Cette estimation repose sur des taux moyens de cotisations. Les montants réels varient selon convention, mutuelle et spécificités du contrat.</p>
      </div>
    </div>
    `;
  },
};

new CalculatorFrame("salaire-calculator", salaireConfig);

const compState: Array<{
  label: string;
  brut: number;
  netAvantImpot: number;
  pasMensuel: number;
  netApresImpot: number;
}> = [];

// Palette de couleurs pour les différents scénarios
const colors = [
  { bg: "rgba(59,130,246,0.8)", border: "rgba(59,130,246,1)" }, // Bleu
  { bg: "rgba(34,197,94,0.8)", border: "rgba(34,197,94,1)" }, // Vert
  { bg: "rgba(249,115,22,0.8)", border: "rgba(249,115,22,1)" }, // Orange
  { bg: "rgba(168,85,247,0.8)", border: "rgba(168,85,247,1)" }, // Violet
  { bg: "rgba(236,72,153,0.8)", border: "rgba(236,72,153,1)" }, // Rose
  { bg: "rgba(14,165,233,0.8)", border: "rgba(14,165,233,1)" }, // Cyan
];

// Listener pour auto-ajouter le premier calcul à la comparaison
window.addEventListener("calculator-updated", (event: any) => {
  if (event.detail?.elementId !== "salaire-calculator") return;

  const last = (window as any)["dernierCalcul_salaire-calculator"];
  if (!last?.result?.success || compState.length > 0) return;

  const d = last.result.data;
  const statut = d.statut === "cadre" ? "Cadre" : "Non‑cadre";
  const label = `${statut} • Brut ${formatEUR(d.brut)}`;

  compState.push({
    label,
    brut: d.brut,
    netAvantImpot: d.netAvantImpot,
    pasMensuel: d.pasMensuel,
    netApresImpot: d.netApresImpot,
  });
  renderSalaireComparaison();
});

function formatEUR(v: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

function renderSalaireComparaison() {
  const container = document.getElementById("salaire-comparaison");
  if (!container) {
    return;
  }
  if (compState.length === 0) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }
  container.classList.remove("hidden");
  const chartId = `chart-salaire-${Date.now()}`;
  const headers = compState.map((c) => c.label);
  const dataNet = compState.map((c) => c.netApresImpot);
  const html = `
  <div class="bg-white border-2 border-blue-500 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Comparaison des scénarios</h3>
      <button id="salaire-clear-all" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold">
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
              `<th class=\"p-3 text-center font-semibold\">${h}<br><button class="text-xs text-red-600 hover:text-red-800 mt-1" onclick="deleteSalaireScenario(${idx})">✕ Supprimer</button></th>`,
          )
          .join("")}</tr></thead>
        <tbody>
          <tr class="hover:bg-gray-50"><td class="p-3">Brut mensuel</td>${compState
            .map((c) => `<td class=\"p-3 text-center\">${formatEUR(c.brut)}</td>`)
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Net mensuel avant impôt</td>${compState
            .map((c) => `<td class=\"p-3 text-center\">${formatEUR(c.netAvantImpot)}</td>`)
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">PAS mensuel</td>${compState
            .map((c) => `<td class=\"p-3 text-center\">${formatEUR(c.pasMensuel)}</td>`)
            .join("")}</tr>
          <tr class="bg-green-50 font-semibold"><td class="p-3">Net mensuel après impôt</td>${compState
            .map((c) => `<td class=\"p-3 text-center\">${formatEUR(c.netApresImpot)}</td>`)
            .join("")}</tr>
          <tr class="bg-gray-100"><td class="p-3" colspan="${compState.length + 1}">Annuel</td></tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Brut annuel</td>${compState
            .map((c) => `<td class=\"p-3 text-center\">${formatEUR(c.brut * 12)}</td>`)
            .join("")}</tr>
          <tr class="hover:bg-gray-50"><td class="p-3">Net annuel après impôt</td>${compState
            .map((c) => `<td class=\"p-3 text-center\">${formatEUR(c.netApresImpot * 12)}</td>`)
            .join("")}</tr>
        </tbody>
      </table>
    </div>
  </div>`;
  container.innerHTML = html;

  // Ajouter le listener pour le bouton "Réinitialiser tout"
  document.getElementById("salaire-clear-all")?.addEventListener("click", () => {
    compState.length = 0;
    renderSalaireComparaison();
  });

  import("chart.js").then(
    ({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend }) => {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
      const canvas = document.getElementById(chartId) as HTMLCanvasElement | null;
      const ctx = canvas ? canvas.getContext("2d") : null;
      if (!ctx) {
        return;
      }

      // Créer des datasets avec des couleurs différentes pour chaque scénario
      const datasets = compState.map((scenario, index) => {
        const color = colors[index % colors.length];
        return {
          label: scenario.label,
          data: [scenario.netApresImpot],
          backgroundColor: color.bg,
          borderColor: color.border,
          borderWidth: 2,
          borderRadius: 8,
        };
      });

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Net mensuel après impôt"],
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
    },
  );
}

function deleteSalaireScenario(index: number) {
  compState.splice(index, 1);
  renderSalaireComparaison();
}
(window as any).deleteSalaireScenario = deleteSalaireScenario;

document.getElementById("salaire-add-to-compare")?.addEventListener("click", () => {
  const last = (window as any)["dernierCalcul_salaire-calculator"];
  if (!last || !last.result?.success) {
    alert("Veuillez d'abord effectuer un calcul.");
    return;
  }

  const d = last.result.data;
  const modal = new ComparisonModal({
    title: "Ajouter un scénario à la comparaison",
    fields: [
      {
        id: "brut",
        label: "Salaire brut mensuel (€)",
        type: "number",
        value: d.brut,
        required: true,
        min: 500,
        step: 1,
      },
      {
        id: "statut",
        label: "Statut",
        type: "select",
        value: d.statut,
        required: true,
        options: [
          { value: "non_cadre", label: "Non‑cadre" },
          { value: "cadre", label: "Cadre" },
        ],
      },
      {
        id: "taux_pas",
        label: "Taux PAS (%)",
        type: "number",
        value: d.tauxPAS || 0,
        required: false,
        placeholder: "0 à 30",
        min: 0,
        max: 30,
        step: 0.1,
      },
    ],
    onConfirm: (values) => {
      const brut = Number(values.brut);
      const statut = values.statut;
      const tauxPAS = Number(values.taux_pas) || 0;
      const r = calculerSalaire({
        brutMensuel: brut,
        statut,
        tauxPAS,
      });

      const label = `${
        statut === "cadre" ? "Cadre" : "Non‑cadre"
      } • PAS ${Number(tauxPAS || 0).toFixed(1)}% • Brut ${formatEUR(brut)}`;

      compState.push({
        label,
        brut: r.brut,
        netAvantImpot: r.netAvantImpot,
        pasMensuel: r.pasMensuel,
        netApresImpot: r.netApresImpot,
      });
      renderSalaireComparaison();
    },
  });

  modal.open();
});
document.getElementById("salaire-reset-compare")?.addEventListener("click", () => {
  compState.length = 0;
  renderSalaireComparaison();
});

async function downloadBlocPNG() {
  const container = document.getElementById("salaire-comparaison");
  if (!container) return;
  const { default: html2canvas } = await import("html2canvas");
  const excl = [...document.querySelectorAll('[data-export-exclude="true"]')];
  const prev = excl.map((el) => (el instanceof HTMLElement ? el.style.display : ""));
  excl.forEach((el) => {
    if (el instanceof HTMLElement) el.style.display = "none";
  });
  const canvas = await html2canvas(container, {
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
  a.download = `comparaison-salaire-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
async function downloadBlocPDF() {
  const container = document.getElementById("salaire-comparaison");
  if (!container) return;
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");
  const excl = [...document.querySelectorAll('[data-export-exclude="true"]')];
  const prev = excl.map((el) => (el instanceof HTMLElement ? el.style.display : ""));
  excl.forEach((el) => {
    if (el instanceof HTMLElement) el.style.display = "none";
  });
  const canvas = await html2canvas(container, {
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
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
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
  pdf.save(`comparaison-salaire-${Date.now()}.pdf`);
}
document.getElementById("salaire-download-png")?.addEventListener("click", downloadBlocPNG);
document.getElementById("salaire-download-pdf")?.addEventListener("click", downloadBlocPDF);

/**
 * Preset situation buttons for quick filling
 */
document.querySelectorAll(".preset-situation-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const brut = (btn as HTMLElement).getAttribute("data-brut");
    const statut = (btn as HTMLElement).getAttribute("data-statut");
    const pas = (btn as HTMLElement).getAttribute("data-pas");

    if (brut && statut && pas !== null) {
      const form = document.querySelector("#salaire-calculator form") as HTMLFormElement | null;
      const brutInput = document.querySelector("#brut") as HTMLInputElement | null;
      const statutSelect = document.querySelector("#statut") as HTMLSelectElement | null;
      const pasInput = document.querySelector("#taux_pas") as HTMLInputElement | null;

      if (!form || !brutInput || !statutSelect || !pasInput) return;

      brutInput.value = brut;
      statutSelect.value = statut;
      pasInput.value = pas;

      brutInput.dispatchEvent(new Event("input", { bubbles: true }));
      brutInput.dispatchEvent(new Event("change", { bubbles: true }));
      statutSelect.dispatchEvent(new Event("change", { bubbles: true }));
      pasInput.dispatchEvent(new Event("input", { bubbles: true }));
      pasInput.dispatchEvent(new Event("change", { bubbles: true }));

      if (typeof form.requestSubmit === "function") {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }
    }
  });
});
