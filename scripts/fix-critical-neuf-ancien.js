/**
 * CORRECTION CRITIQUE - Bug neuf affiché avec taux ancien
 * Utilise la SOURCE UNIQUE DE VÉRITÉ
 */

import fs from "node:fs";
import path from "node:path";
import { NOTAIRE_2026, getDmtoTaux } from "../src/data/notaire.baremes.2026.js";
import { calculFraisNotaire } from "../src/utils/notaire.calc.js";
import { formatEuro } from "../src/utils/format.js";

const PRIX_EXEMPLE = 200000;

function formatPctHtml(taux) {
  return (taux * 100).toFixed(2).replace(".", ",") + "%";
}

function processFile(filePath) {
  const base = path.basename(filePath);
  const match = base.match(/frais-notaire-(\d+|2A|2B)\.html$/i);
  if (!match) return false;

  const code =
    match[1].toUpperCase() === "2A"
      ? "2A"
      : match[1].toUpperCase() === "2B"
        ? "2B"
        : match[1];

  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  // Calculer avec les modules centralisés
  const ancien = calculFraisNotaire(PRIX_EXEMPLE, "ancien", code);
  const neuf = calculFraisNotaire(PRIX_EXEMPLE, "neuf");

  const dmtoTaux = getDmtoTaux(code);
  const ancienTotal = formatEuro(ancien.total).replace("€", "").trim();
  const neufTotal = formatEuro(neuf.total).replace("€", "").trim();
  const ancienPct = formatPctHtml(dmtoTaux);
  const neufPct = formatPctHtml(NOTAIRE_2026.neuf.droits);

  // ========== CORRECTIONS CRITIQUES ==========

  // FIX 1: "Immobilier neuf (TFPB)" doit avoir 0,71% pas le taux ancien
  html = html.replace(
    /(<span[^>]*>Immobilier neuf[^<]*<\/span><span[^>]*>)≈?\s*[\d,\.]+\s*%/gi,
    `$1≈ ${neufPct}`,
  );

  // FIX 2: Schema.org description - "Neuf : ≈ X € pour 200 000 € (droits ≈ Y%)"
  html = html.replace(
    /(Neuf\s*:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    `$1${neufTotal} €$2${neufPct}`,
  );

  // FIX 3: Bloc encadré principal - format complet
  html = html.replace(
    /(Frais de notaire 202\d [^:]+:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(ancien,?\s*droits?\s*≈?\s*)[\d,\.]+\s*%(\)\s*•\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(neuf,?\s*droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    `$1${ancienTotal} €$2${ancienPct}$3${neufTotal} €$4${neufPct}`,
  );

  // FIX 4: Immobilier ancien doit avoir le bon taux
  html = html.replace(
    /(<span[^>]*>Immobilier ancien<\/span><span[^>]*>)≈?\s*[\d,\.]+\s*%/gi,
    `$1≈ ${ancienPct}`,
  );

  // FIX 5: Tout bg-green-100 suivi de "Immobilier neuf" = neufPct
  html = html.replace(
    /(<span class="font-mono bg-green-100[^"]*">)≈?\s*[\d,\.]+\s*%(<\/span>\s*<\/div>\s*<div[^>]*>\s*<span[^>]*>Immobilier neuf)/gi,
    `$1≈ ${ancienPct}$2`,
  );

  // FIX 6: Pattern générique pour les 2 lignes "Immobilier ancien" et "Immobilier neuf"
  // dans les blocs tarifs
  html = html.replace(
    /(<div[^>]*>\s*<span[^>]*>Immobilier ancien<\/span><span[^>]*font-mono[^>]*>)[^<]+(<\/span>\s*<\/div>\s*<div[^>]*>\s*<span[^>]*>Immobilier neuf[^<]*<\/span><span[^>]*font-mono[^>]*>)[^<]+(<\/span>)/gi,
    `$1≈ ${ancienPct}$2≈ ${neufPct}$3`,
  );

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return {
      file: base,
      ancien: ancienPct,
      neuf: neufPct,
      ancienTotal,
      neufTotal,
      changed: true,
    };
  }
  return { file: base, changed: false };
}

function main() {
  console.log("=== CORRECTION CRITIQUE: Bug neuf/ancien ===");
  console.log("Source unique: src/data/notaire.baremes.2026.js");
  console.log("");
  console.log("Taux corrects:");
  console.log(
    `  • Ancien majoré: ${(NOTAIRE_2026.dmto.majore * 100).toFixed(2)}%`,
  );
  console.log(
    `  • Ancien standard: ${(NOTAIRE_2026.dmto.standard * 100).toFixed(2)}%`,
  );
  console.log(
    `  • Ancien réduit: ${(NOTAIRE_2026.dmto.reduit * 100).toFixed(2)}%`,
  );
  console.log(
    `  • NEUF: ${(NOTAIRE_2026.neuf.droits * 100).toFixed(2)}% ← CRITIQUE`,
  );
  console.log("");

  const dir = path.resolve(
    process.cwd(),
    "src",
    "pages",
    "blog",
    "departements",
  );
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

  let updated = 0;
  let errors = [];

  for (const f of files) {
    const result = processFile(path.join(dir, f));
    if (result.changed) {
      console.log(
        `✓ ${result.file}: ancien=${result.ancienTotal}€ (${result.ancien}) | neuf=${result.neufTotal}€ (${result.neuf})`,
      );
      updated++;
    }
  }

  console.log("");
  console.log(`✓ ${updated} fichiers corrigés`);
}

main();
