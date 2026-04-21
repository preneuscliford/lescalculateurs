#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const DEFAULT_INPUT = path.join(
  ROOT,
  "vdf",
  "revenu-des-francais-a-la-commune-1765372688826.csv",
);
const DEFAULT_DATE = "2026-04-21";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=") || "true"];
  }),
);

const input = path.resolve(args.get("input") || DEFAULT_INPUT);
const outputBase =
  args.get("output") || `vdf-income-opportunities-${DEFAULT_DATE}`;
const top = Number(args.get("top") || 20);

function toNumber(value) {
  if (value == null) return null;
  const normalized = String(value)
    .trim()
    .replace(/\u202f/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function average(values) {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (!filtered.length) return null;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function formatEuro(value) {
  if (!Number.isFinite(value)) return "n.d.";
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "n.d.";
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

function parseCsv(file) {
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(";");
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(";");
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

function getDept(code) {
  if (!code) return "";
  const value = String(code);
  if (value.startsWith("97") || value.startsWith("98")) return value.slice(0, 3);
  return value.slice(0, 2);
}

const { rows } = parseCsv(input);

// Column positions are more robust here because the export headers contain
// encoding artefacts in some environments.
const enriched = rows
  .map((row) => {
    const values = Object.values(row);
    const name = values[2] || values[0] || "";
    const code = values[1] || "";
    return {
      name,
      code,
      dept: getDept(code),
      fiscalHouseholds: toNumber(values[3]),
      people: toNumber(values[4]),
      uc: toNumber(values[5]),
      disposableQ1: toNumber(values[6]),
      disposableMedian: toNumber(values[7]),
      disposableQ3: toNumber(values[8]),
      disposableD1: toNumber(values[10]),
      disposableD9: toNumber(values[17]),
      disposableD9D1: toNumber(values[18]),
      disposableGini: toNumber(values[20]),
      activityShare: toNumber(values[21]),
      salaryShare: toNumber(values[22]),
      unemploymentShare: toNumber(values[23]),
      pensionShare: toNumber(values[25]),
      propertyShare: toNumber(values[26]),
      socialBenefitsShare: toNumber(values[27]),
      familyBenefitsShare: toNumber(values[28]),
      minimaShare: toNumber(values[29]),
      housingBenefitsShare: toNumber(values[30]),
      taxShare: toNumber(values[31]),
      taxedHouseholdShare: toNumber(values[35]),
      declaredMedian: toNumber(values[37]),
    };
  })
  .filter((row) => row.code && row.name);

const withMedian = enriched.filter((row) => Number.isFinite(row.disposableMedian));
const withD1D9 = enriched.filter(
  (row) => Number.isFinite(row.disposableD1) && Number.isFinite(row.disposableD9),
);
const significant = withMedian.filter((row) => (row.fiscalHouseholds || 0) >= 500);

const byDept = new Map();
for (const row of withMedian) {
  if (!byDept.has(row.dept)) byDept.set(row.dept, []);
  byDept.get(row.dept).push(row);
}

const deptSummaries = Array.from(byDept.entries())
  .map(([dept, deptRows]) => ({
    dept,
    communes: deptRows.length,
    medianDisposableMedian: median(deptRows.map((row) => row.disposableMedian)),
    averageDisposableMedian: average(deptRows.map((row) => row.disposableMedian)),
    averageTaxedShare: average(deptRows.map((row) => row.taxedHouseholdShare)),
    averageGini: average(deptRows.map((row) => row.disposableGini)),
  }))
  .sort((a, b) => b.medianDisposableMedian - a.medianDisposableMedian);

function topRows(rowsToSort, field, direction = "desc", limit = top) {
  return [...rowsToSort]
    .filter((row) => Number.isFinite(row[field]))
    .sort((a, b) =>
      direction === "asc" ? a[field] - b[field] : b[field] - a[field],
    )
    .slice(0, limit);
}

const report = {
  source: path.relative(ROOT, input),
  generatedAt: new Date().toISOString(),
  rowCount: enriched.length,
  rowsWithDisposableMedian: withMedian.length,
  rowsWithD1D9: withD1D9.length,
  significantCommuneThreshold: ">= 500 ménages fiscaux",
  national: {
    medianOfCommuneMedians: median(withMedian.map((row) => row.disposableMedian)),
    averageOfCommuneMedians: average(withMedian.map((row) => row.disposableMedian)),
    medianDeclaredIncome: median(
      enriched
        .map((row) => row.declaredMedian)
        .filter((value) => Number.isFinite(value)),
    ),
  },
  topDisposableMedian: topRows(significant, "disposableMedian"),
  lowDisposableMedian: topRows(significant, "disposableMedian", "asc"),
  highInequality: topRows(significant, "disposableD9D1"),
  highGini: topRows(significant, "disposableGini"),
  highSocialBenefitsShare: topRows(significant, "socialBenefitsShare"),
  highHousingBenefitsShare: topRows(significant, "housingBenefitsShare"),
  highPensionShare: topRows(significant, "pensionShare"),
  highActivityShare: topRows(significant, "activityShare"),
  departmentsTopMedian: deptSummaries.slice(0, top),
  departmentsLowMedian: [...deptSummaries]
    .sort((a, b) => a.medianDisposableMedian - b.medianDisposableMedian)
    .slice(0, top),
};

const visualization = {
  generatedAt: report.generatedAt,
  source: report.source,
  national: report.national,
  charts: {
    topDisposableMedian: {
      type: "bar",
      title: "Communes significatives avec revenu disponible médian élevé",
      label: "Revenu disponible médian",
      unit: "euro",
      color: "emerald",
      labels: report.topDisposableMedian.slice(0, 10).map((row) => row.name),
      values: report.topDisposableMedian
        .slice(0, 10)
        .map((row) => row.disposableMedian),
    },
    lowDisposableMedian: {
      type: "bar",
      title: "Communes significatives avec revenu disponible médian faible",
      label: "Revenu disponible médian",
      unit: "euro",
      color: "amber",
      labels: report.lowDisposableMedian.slice(0, 10).map((row) => row.name),
      values: report.lowDisposableMedian
        .slice(0, 10)
        .map((row) => row.disposableMedian),
    },
    highInequality: {
      type: "bar",
      title: "Communes avec forte dispersion des revenus",
      label: "Rapport D9/D1",
      unit: "number",
      color: "rose",
      labels: report.highInequality.slice(0, 10).map((row) => row.name),
      values: report.highInequality
        .slice(0, 10)
        .map((row) => row.disposableD9D1),
    },
    socialBenefitsShare: {
      type: "bar",
      title: "Communes où les prestations sociales pèsent le plus",
      label: "Part des prestations sociales",
      unit: "percent",
      color: "blue",
      labels: report.highSocialBenefitsShare.slice(0, 10).map((row) => row.name),
      values: report.highSocialBenefitsShare
        .slice(0, 10)
        .map((row) => row.socialBenefitsShare),
    },
  },
};

function table(rowsToRender, columns) {
  const header = `| ${columns.map((column) => column.label).join(" |")} |`;
  const sep = `| ${columns.map(() => "---").join(" |")} |`;
  const body = rowsToRender
    .map(
      (row) =>
        `| ${columns
          .map((column) => {
            const value = row[column.key];
            if (column.type === "euro") return formatEuro(value);
            if (column.type === "percent") return formatPercent(value);
            if (column.type === "number") {
              return Number.isFinite(value)
                ? value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
                : "n.d.";
            }
            return value ?? "";
          })
          .join(" | ")} |`,
    )
    .join("\n");
  return [header, sep, body].join("\n");
}

const communeColumns = [
  { label: "Commune", key: "name" },
  { label: "Code", key: "code" },
  { label: "Dépt.", key: "dept" },
  { label: "Ménages", key: "fiscalHouseholds", type: "number" },
  { label: "Médiane disponible", key: "disposableMedian", type: "euro" },
  { label: "D9/D1", key: "disposableD9D1", type: "number" },
  { label: "Gini", key: "disposableGini", type: "number" },
];

const socialColumns = [
  { label: "Commune", key: "name" },
  { label: "Code", key: "code" },
  { label: "Ménages", key: "fiscalHouseholds", type: "number" },
  { label: "Médiane disponible", key: "disposableMedian", type: "euro" },
  { label: "Prestations sociales", key: "socialBenefitsShare", type: "percent" },
  { label: "Prestations logement", key: "housingBenefitsShare", type: "percent" },
];

const deptColumns = [
  { label: "Dépt.", key: "dept" },
  { label: "Communes", key: "communes", type: "number" },
  { label: "Médiane des médianes", key: "medianDisposableMedian", type: "euro" },
  { label: "Part imposés moy.", key: "averageTaxedShare", type: "percent" },
];

const md = `# Opportunités VDF - Revenus des Français par commune

## Source
- Fichier : \`${report.source}\`
- Lignes communes : ${report.rowCount.toLocaleString("fr-FR")}
- Communes avec médiane disponible : ${report.rowsWithDisposableMedian.toLocaleString("fr-FR")}
- Seuil d'analyse prioritaire : ${report.significantCommuneThreshold}

## Lecture rapide
- Médiane des médianes communales : ${formatEuro(report.national.medianOfCommuneMedians)}
- Le fichier permet des pages et outils locaux autour du revenu disponible, revenu déclaré, déciles, inégalités, prestations sociales, pensions et part de ménages imposés.
- Les pages les plus défendables sont des pages utiles, factuelles et localisées : revenu médian à [commune], comparaison commune/département, classement départemental, simulateur de positionnement personnel.

## Angles SEO prioritaires
1. Pages commune : \`revenu médian [commune]\`, \`salaire moyen [commune]\`, \`niveau de vie [commune]\`.
2. Pages comparaison : \`[commune] vs [commune]\`, \`revenu [commune] comparé au département\`.
3. Pages département : \`revenu médian par commune dans le [département]\`, tableaux triables.
4. Pages pouvoir d'achat : connecter revenu local avec loyer, APL, impôt et salaire net.
5. Fonctionnalité interactive : entrer son revenu et voir son positionnement approximatif dans sa commune à partir des déciles.

## Fonctionnalités produit possibles
- Fiche commune : revenu disponible médian, D1/D9, Gini, part de ménages imposés, part prestations sociales.
- Comparateur de communes : différence de revenu médian, écart D9/D1, part des prestations logement.
- Calculateur “où se situe mon revenu ?” : estimation par déciles communaux.
- Carte France : niveau de vie médian et inégalités par commune.
- Module de contexte sur les simulateurs APL/impôt : “dans votre commune, le revenu disponible médian est de X €”.

## Top communes significatives par revenu disponible médian
${table(report.topDisposableMedian, communeColumns)}

## Communes significatives avec revenu disponible médian faible
${table(report.lowDisposableMedian, communeColumns)}

## Communes significatives avec forte dispersion D9/D1
${table(report.highInequality, communeColumns)}

## Communes où les prestations sociales pèsent le plus
${table(report.highSocialBenefitsShare, socialColumns)}

## Départements avec médiane communale élevée
${table(report.departmentsTopMedian, deptColumns)}

## Départements avec médiane communale faible
${table(report.departmentsLowMedian, deptColumns)}

## Recommandation d'exécution
1. Créer d'abord une page pilier “Revenu médian par commune”.
2. Ajouter un moteur de recherche commune + fiche dynamique.
3. Générer un premier lot de pages pour les grandes villes et communes déjà recherchées.
4. Relier les pages aux simulateurs salaire net, impôt, APL, prêt immobilier et frais de notaire.
5. Garder un wording prudent : données statistiques, pas de jugement social ou financier sur les habitants.
`;

const reportsDir = path.join(ROOT, "reports");
fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(
  path.join(reportsDir, `${outputBase}.json`),
  JSON.stringify(report, null, 2),
  "utf8",
);
fs.writeFileSync(path.join(reportsDir, `${outputBase}.md`), md, "utf8");
fs.writeFileSync(
  path.join(reportsDir, `${outputBase}-charts.json`),
  JSON.stringify(visualization, null, 2),
  "utf8",
);
console.log(
  `Reports written: reports/${outputBase}.json, reports/${outputBase}.md and reports/${outputBase}-charts.json`,
);
