## Approche
- Ajouter un export XLSX côté client, sans alourdir le bundle: import dynamique de SheetJS via CDN uniquement au clic.
- Réutiliser le builder de données CSV existant (headers, rows) pour construire la feuille Excel.

## Modifications précises
- `src/utils/csvExport.ts` (ajout utilitaire XLSX)
  - `export async function exportToXLSX(data: CSVData, filename = "export.xlsx")`:
    - Valide `headers` et `rows`.
    - `const XLSX = await import("https://cdn.sheetjs.com/xlsx-latest/xlsx.mjs")`.
    - Crée `ws` depuis `[[...headers], ...rows]` → `XLSX.utils.aoa_to_sheet`.
    - Crée `wb` → `XLSX.utils.book_new()` et `XLSX.utils.book_append_sheet(wb, ws, "FraisNotaire")`.
    - Écrit en binaire (`XLSX.write(wb, { bookType: "xlsx", type: "array" })`), crée un `Blob` et déclenche le téléchargement.

- `src/components/CalculatorFrame.ts` (support bouton XLSX)
  - Ajouter option `exportXLSX` dans `config` (même structure que `exportCSV`).
  - Rendre un bouton “📊 Exporter en XLSX” quand `exportXLSX.enabled === true`.
  - Au clic:
    - Construit les données via `config.exportXLSX.getXLSXData(result, values)` (sinon fallback sur `config.exportCSV.getCSVData`).
    - Import dynamique `../utils/csvExport` et appelle `exportToXLSX(data, filename)`.

- `src/pages/notaire.html`
  - Activer `exportXLSX: { enabled: true, filename: "frais_notaire_2025.xlsx", getXLSXData: (result, values) => ({ headers, rows }) }`.
  - Réutiliser le même mapping que `exportCSV` (libellés FR, montants formatés, pourcentages).

## Vérifications
- Tester la page notaire: calculer puis exporter → fichier `.xlsx` ouvert dans Excel avec entêtes et lignes.
- Aucun impact sur les autres calculateurs (limité à la page notaire).

## Notes
- Pas de dépendance installée localement: import CDN au clic pour limiter le poids initial.
- Commentaires de niveau fonction ajoutés dans les nouvelles fonctions et handlers.

J’implémente ces changements maintenant (sans commit) et je vérifie localement l’export XLSX sur la page notaire.