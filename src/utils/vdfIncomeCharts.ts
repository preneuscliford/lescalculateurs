type VdfChartKind = "bar" | "line" | "doughnut";
type VdfChartUnit = "euro" | "percent" | "number";

type VdfChartPayload = {
  type?: VdfChartKind;
  title?: string;
  label?: string;
  labels: string[];
  values: number[];
  unit?: VdfChartUnit;
  color?: string;
};

const chartInstances = new WeakMap<HTMLCanvasElement, { destroy: () => void }>();

function readPayload(container: HTMLElement): VdfChartPayload | null {
  const inlineScript = container.querySelector<HTMLScriptElement>(
    'script[type="application/json"][data-vdf-chart-data]',
  );
  const raw = inlineScript?.textContent || container.dataset.vdfChartData || "";
  if (!raw.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as VdfChartPayload;
    if (!Array.isArray(parsed.labels) || !Array.isArray(parsed.values)) return null;
    if (parsed.labels.length !== parsed.values.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function formatValue(value: number, unit: VdfChartUnit) {
  if (unit === "euro") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (unit === "percent") {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 1,
    }).format(value)} %`;
  }

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function ensureCanvas(container: HTMLElement) {
  const existing = container.querySelector<HTMLCanvasElement>("canvas");
  if (existing) return existing;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  container.appendChild(canvas);
  return canvas;
}

function palette(base?: string) {
  if (base === "amber") return ["#f59e0b", "#f97316", "#eab308", "#84cc16", "#14b8a6", "#0ea5e9", "#8b5cf6", "#ec4899"];
  if (base === "emerald") return ["#059669", "#10b981", "#14b8a6", "#0ea5e9", "#6366f1", "#8b5cf6", "#f59e0b", "#ef4444"];
  if (base === "rose") return ["#e11d48", "#f43f5e", "#ec4899", "#a855f7", "#6366f1", "#0ea5e9", "#f59e0b", "#10b981"];
  return ["#2563eb", "#06b6d4", "#10b981", "#84cc16", "#f59e0b", "#f97316", "#e11d48", "#8b5cf6"];
}

function colorsForValues(values: number[], colors: string[]) {
  return values.map((_, index) => colors[index % colors.length]);
}

function doughnutPalette(base?: string) {
  if (base === "amber") return ["#ff7a00", "#ffd000", "#00c853", "#00b8ff", "#7c3cff", "#ff2d75", "#111827", "#ff4d00"];
  if (base === "emerald") return ["#00c853", "#00e5ff", "#2979ff", "#7c3cff", "#ff2d75", "#ff7a00", "#ffd000", "#111827"];
  if (base === "rose") return ["#ff1744", "#ff2d75", "#d500f9", "#7c3cff", "#2979ff", "#00e5ff", "#ffd000", "#00c853"];
  return ["#0057ff", "#00d4ff", "#00c853", "#ffd000", "#ff7a00", "#ff1744", "#d500f9", "#7c3cff"];
}

export async function initializeVdfIncomeCharts() {
  const containers = Array.from(document.querySelectorAll<HTMLElement>("[data-vdf-chart]"));
  if (!containers.length) return;

  const { default: Chart } = await import("chart.js/auto");

  for (const container of containers) {
    const payload = readPayload(container);
    if (!payload) continue;

    const canvas = ensureCanvas(container);
    chartInstances.get(canvas)?.destroy();

    const unit = payload.unit || "number";
    const type = payload.type || "bar";
    const colors = palette(payload.color);
    const segmentColors = type === "doughnut" ? doughnutPalette(payload.color) : colors;

    chartInstances.set(
      canvas,
      new Chart(canvas, {
        type,
        data: {
          labels: payload.labels,
          datasets: [
            {
              label: payload.label || payload.title || "Donnée VDF",
              data: payload.values,
              borderColor: type === "line" ? colors[0] : colorsForValues(payload.values, segmentColors),
              backgroundColor: type === "line" ? `${colors[1]}33` : colorsForValues(payload.values, segmentColors),
              hoverBackgroundColor: colorsForValues(payload.values, segmentColors).map((color) => `${color}e6`),
              hoverBorderColor: type === "doughnut" ? "#ffffff" : "#0f172a",
              borderWidth: type === "doughnut" ? 3 : 1,
              borderRadius: type === "bar" ? 10 : undefined,
              tension: 0.35,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: type === "doughnut",
              position: "bottom",
            },
            title: {
              display: Boolean(payload.title),
              text: payload.title,
              color: "#0f172a",
              font: {
                size: 16,
                weight: "bold",
              },
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const label = context.dataset.label ? `${context.dataset.label}: ` : "";
                  const value = Number(context.raw || 0);
                  return `${label}${formatValue(value, unit)}`;
                },
              },
            },
          },
          scales:
            type === "doughnut"
              ? {}
              : {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      callback(value) {
                        return formatValue(Number(value), unit);
                      },
                    },
                  },
                },
        },
      }),
    );
  }
}
