/**
 * Utilitaires pour l'export CSV
 */

export interface CSVData {
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Convertit des données en format CSV et déclenche le téléchargement
 */
export function exportToCSV(
  data: CSVData,
  filename: string = "export.csv"
): void {
  if (!data.headers || !data.rows) {
    console.error("Données CSV invalides");
    return;
  }

  // Créer le contenu CSV
  const csvContent = [
    // En-têtes
    data.headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
    // Lignes de données - tout entre guillemets pour uniformiser
    ...data.rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          return `"${cellStr.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  // Créer le blob et déclencher le téléchargement
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Exporte des données tabulaires au format XLSX (Excel)
 */
export async function exportToXLSX(
  data: CSVData,
  filename: string = "export.xlsx"
): Promise<void> {
  if (!data.headers || !data.rows) {
    console.error("Données XLSX invalides");
    return;
  }

  const rows = [data.headers, ...data.rows];

  // Charger SheetJS côté navigateur via balise script si nécessaire
  const ensureSheetJS = () =>
    new Promise<void>((resolve, reject) => {
      const w = window as any;
      if (w.XLSX) return resolve();
      const tryLoad = (srcs: string[], idx: number) => {
        if (idx >= srcs.length) return reject(new Error("XLSX CDN indisponible"));
        const script = document.createElement("script");
        script.src = srcs[idx];
        script.async = true;
        script.crossOrigin = "anonymous";
        script.referrerPolicy = "no-referrer";
        script.onload = () => {
          if ((window as any).XLSX) resolve();
          else tryLoad(srcs, idx + 1);
        };
        script.onerror = () => tryLoad(srcs, idx + 1);
        document.head.appendChild(script);
      };
      tryLoad(
        [
          "https://cdn.sheetjs.com/xlsx-latest/xlsx.full.min.js",
          "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
        ],
        0
      );
    });

  await ensureSheetJS();
  const XLSX = (window as any).XLSX;
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FraisNotaire");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convertit un objet en données CSV
 */
export function objectToCSV<T extends Record<string, any>>(
  objects: T[],
  headers?: string[]
): CSVData {
  if (!objects || objects.length === 0) {
    return { headers: [], rows: [] };
  }

  // Déterminer les en-têtes automatiquement si non fournis
  const csvHeaders = headers || Object.keys(objects[0]);

  // Convertir les objets en lignes
  const rows = objects.map((obj) =>
    csvHeaders.map((header) => obj[header] ?? "")
  );

  return {
    headers: csvHeaders,
    rows,
  };
}

/**
 * Convertit une structure de données simple (clé-valeur) en CSV
 */
export function keyValueToCSV(
  data: Record<string, any>,
  filename: string = "export.csv"
): void {
  const headers = ["Propriété", "Valeur"];
  const rows = Object.entries(data).map(([key, value]) => [key, value]);

  exportToCSV({ headers, rows }, filename);
}
