/**
 * Script de mise a jour des pages departements
 * Utilise la SOURCE UNIQUE DE VERITE : notaire.baremes.2026.js
 */

import fs from "node:fs";
import path from "node:path";
import { NOTAIRE_2026, getDmtoTaux } from "../src/data/notaire.baremes.2026.js";
import { calculFraisNotaire } from "../src/utils/notaire.calc.js";
import { formatEuro } from "../src/utils/format.js";

const PRIX_EXEMPLE = 200000;

/**
 * Formater un pourcentage pour affichage HTML
 */
function formatPctHtml(taux) {
  return (taux * 100).toFixed(2).replace(".", ",") + "%";
}

/**
 * Traiter un fichier departement
 */
function processFile(filePath) {
  const base = path.basename(filePath);
  // Extraire le code departement (01, 02, ..., 971, 972, 973, 974, 976, 2A, 2B)
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

  // Calculer avec les modules centralises
  const ancien = calculFraisNotaire(PRIX_EXEMPLE, "ancien", code);
  const neuf = calculFraisNotaire(PRIX_EXEMPLE, "neuf");

  const dmtoTaux = getDmtoTaux(code);
  const ancienTotal = formatEuro(ancien.total).replace("€", "").trim();
  const neufTotal = formatEuro(neuf.total).replace("€", "").trim();
  const ancienPct = formatPctHtml(dmtoTaux);
  const neufPct = formatPctHtml(NOTAIRE_2026.neuf.droits);

  // Pattern 1: Ligne complete "Frais de notaire 2026 en X : ≈ Y € pour 200 000 €..."
  html = html.replace(
    /(Frais de notaire 202\d en [^:]+:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(ancien,?\s*droits?\s*≈?\s*)[\d,\.]+\s*%(\)\s*•\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(neuf,?\s*droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    `$1${ancienTotal} €$2${ancienPct}$3${neufTotal} €$4${neufPct}`,
  );

  // Pattern 2: Format alternatif "≈ X € pour 200 000 € (ancien, droits ≈ Y%)"
  html = html.replace(
    /(≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\((?:ancien,?\s*)?droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    (match, p1, p2) => {
      if (/neuf/i.test(match)) {
        return `${p1}${neufTotal} €${p2}${neufPct}`;
      }
      return `${p1}${ancienTotal} €${p2}${ancienPct}`;
    },
  );

  // Pattern 3: Bloc "Immobilier ancien" → ≈ X,XX%
  html = html.replace(
    /(<span[^>]*>Immobilier ancien<\/span><span[^>]*>)≈?\s*[\d,\.]+\s*%/gi,
    `$1≈ ${ancienPct}`,
  );

  // Pattern 4: bg-green-100 avec le taux
  html = html.replace(
    /(<span class="font-mono bg-green-100[^"]*">)≈?\s*[\d,\.]+\s*%(<\/span>)/gi,
    (match, p1, p2) => {
      // Verifier le contexte pour ancien vs neuf
      return `${p1}≈ ${ancienPct}${p2}`;
    },
  );

  // Pattern 5: Schema.org / JSON-LD updates
  html = html.replace(
    /("description"\s*:\s*"[^"]*Ancien\s*:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(droits?\s*≈?\s*)[\d,\.]+\s*%(\)[^"]*Neuf\s*:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    `$1${ancienTotal} €$2${ancienPct}$3${neufTotal} €$4${neufPct}`,
  );

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(
      `✓ ${base}: DMTO ${ancienPct} → ${ancienTotal} € (ancien) / ${neufTotal} € (neuf)`,
    );
    return true;
  }
  return false;
}

function main() {
  console.log("=== MISE A JOUR PAGES DEPARTEMENTS ===");
  console.log("Source: src/data/notaire.baremes.2026.js");
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
  for (const f of files) {
    if (processFile(path.join(dir, f))) updated++;
  }

  console.log("");
  console.log(`✓ ${updated} fichiers mis a jour`);
  console.log("");
  console.log("Taux utilises (source unique):");
  console.log(
    `  • Majore: ${(NOTAIRE_2026.dmto.majore * 100).toFixed(2)}% (87 depts)`,
  );
  console.log(
    `  • Standard: ${(NOTAIRE_2026.dmto.standard * 100).toFixed(2)}% (12 depts)`,
  );
  console.log(
    `  • Reduit: ${(NOTAIRE_2026.dmto.reduit * 100).toFixed(2)}% (2 depts)`,
  );
}

main();
