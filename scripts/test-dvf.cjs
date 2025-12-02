#!/usr/bin/env node
/**
 * Test DVF (Demande de valeurs foncières) via fichiers officiels data.gouv.fr
 * - Télécharge le CSV départemental 2024
 * - Parse un échantillon et calcule des métriques simples
 * - Valide la présence des colonnes clés
 */
const fs = require("fs");
const path = require("path");

/**
 * Télécharge le CSV DVF d'un département donné (année 2024)
 * @param {string} deptCode Code du département (ex: "73")
 * @returns {Promise<string>} Contenu CSV brut
 */
async function fetchDeptCsv(deptCode) {
  const bases = [
    `https://files.data.gouv.fr/dvf/latest/csv/2024/departements/${deptCode}.csv`,
    `https://files.data.gouv.fr/dvf/latest/csv/departements/${deptCode}.csv`,
    `https://files.data.gouv.fr/dvf/latest/csv/2023/departements/${deptCode}.csv`,
    `https://files.data.gouv.fr/dvf/latest/csv/2024/departements/${deptCode.padStart(3, '0')}.csv`,
    `https://files.data.gouv.fr/dvf/latest/csv/departements/${deptCode.padStart(3, '0')}.csv`,
    `https://files.data.gouv.fr/dvf/latest/csv/valeursfoncieres-2024-departement-${deptCode}.csv`,
    `https://files.data.gouv.fr/dvf/latest/csv/valeursfoncieres-2023-departement-${deptCode}.csv`,
  ];
  let lastStatus = 0;
  for (const url of bases) {
    const res = await fetch(url);
    lastStatus = res.status;
    if (res.ok) return await res.text();
  }
  throw new Error(`HTTP ${lastStatus} sur ${bases[bases.length - 1]}`);
}

/**
 * Détecte le séparateur CSV ("," vs ";") en fonction de l'en‑tête
 * @param {string} headerLine Première ligne du CSV
 * @returns {string} séparateur
 */
function detectSep(headerLine) {
  const semi = (headerLine.match(/;/g) || []).length;
  const comma = (headerLine.match(/,/g) || []).length;
  return semi >= comma ? ";" : ",";
}

/**
 * Parse un CSV en tableau d'objets limité à N lignes
 * @param {string} csv Contenu CSV
 * @param {number} limit Nombre max de lignes à parser
 * @returns {{rows:object[], headers:string[], sep:string}}
 */
function parseCsv(csv, limit = 2000) {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { rows: [], headers: [], sep: ";" };
  const header = lines[0];
  const sep = detectSep(header);
  const headers = header.split(sep).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length && rows.length < limit; i++) {
    const cols = lines[i].split(sep);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] || "").trim();
    });
    rows.push(obj);
  }
  return { rows, headers, sep };
}

/**
 * Calcule métriques simples (compte, communes, prix/m² moyen) sur un échantillon
 * @param {object[]} rows Lignes DVF parsées
 * @returns {{count:number, communes:Set<string>, pm2:number|null}}
 */
function computeMetrics(rows) {
  const communes = new Set();
  let sumPm2 = 0;
  let nPm2 = 0;
  for (const r of rows) {
    const commune = r["Commune"] || r["nom_commune"] || r["Commune"] || "";
    if (commune) communes.add(commune);
    const val = parseFloat((r["Valeur fonciere"] || r["valeur_fonciere"] || "").replace(/\s/g, ""));
    const surf = parseFloat((r["Surface reelle bati"] || r["surface_reelle_bati"] || "").replace(/\s/g, ""));
    if (isFinite(val) && isFinite(surf) && surf > 0) {
      sumPm2 += val / surf;
      nPm2++;
    }
  }
  const pm2 = nPm2 > 0 ? Math.round((sumPm2 / nPm2) * 100) / 100 : null;
  return { count: rows.length, communes, pm2 };
}

/**
 * Valide la présence des colonnes clés DVF
 * @param {string[]} headers En‑têtes CSV
 * @returns {string[]} Manquants
 */
function missingColumns(headers) {
  const req = ["Valeur fonciere", "Surface reelle bati", "Commune"]; // variantes gérées à l'usage
  return req.filter((h) => !headers.some((x) => x.toLowerCase() === h.toLowerCase()));
}

/**
 * Point d'entrée: teste une liste de départements et affiche un rapport
 */
async function main() {
  const args = process.argv.slice(2);
  const fromArg = args.find((a) => a.startsWith("--dept="));
  const one = fromArg ? fromArg.split("=")[1] : null;
  const depts = one ? [one] : ["75", "95", "01", "73", "56"];
  for (const d of depts) {
    try {
      console.log(`\n=== DVF ${d} (2024) ===`);
      const csv = await fetchDeptCsv(d);
      const { rows, headers } = parseCsv(csv, 3000);
      const miss = missingColumns(headers);
      const { count, communes, pm2 } = computeMetrics(rows);
      console.log(`Lignes échantillon: ${count}`);
      console.log(`Communes (échantillon): ${Array.from(communes).slice(0, 8).join(", ")}…`);
      console.log(`Prix/m² moyen (approx échantillon): ${pm2 ?? "n/a"}`);
      if (miss.length > 0) {
        console.log(`Colonnes manquantes: ${miss.join(", ")}`);
      } else {
        console.log(`Colonnes clés présentes.`);
      }
      // Écrit un rapport texte pour consultation
      const outDir = path.join(process.cwd(), "reports");
      try { fs.mkdirSync(outDir, { recursive: true }); } catch (_) {}
      const outPath = path.join(outDir, `dvf-test-${d}.txt`);
      const txt = [
        `DVF ${d} (2024)`,
        `Lignes: ${count}`,
        `Communes: ${Array.from(communes).slice(0, 20).join(", ")}`,
        `Prix/m² moyen (approx): ${pm2 ?? "n/a"}`,
        `Colonnes manquantes: ${miss.join(",") || "aucune"}`,
      ].join("\n");
      fs.writeFileSync(outPath, txt, "utf8");
    } catch (e) {
      console.error(`Erreur DVF ${d}:`, e.message);
    }
  }
}

main();
