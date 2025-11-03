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
