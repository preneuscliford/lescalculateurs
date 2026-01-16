/**
 * Script de correction des incohérences restantes
 * Utilise la SOURCE UNIQUE DE VÉRITÉ
 */

import fs from "node:fs";
import path from "node:path";
import { NOTAIRE_2026, getDmtoTaux } from "../src/data/notaire.baremes.2026.js";
import { calculFraisNotaire } from "../src/utils/notaire.calc.js";

const PRIX_EXEMPLE = 200000;

function formatPct(taux) {
  return (taux * 100).toFixed(2).replace(".", ",");
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

  // Calculer les vraies valeurs
  const ancien = calculFraisNotaire(PRIX_EXEMPLE, "ancien", code);
  const neuf = calculFraisNotaire(PRIX_EXEMPLE, "neuf");

  // 1. Corriger "Droits réduits uniformisés" → formulation juridique correcte
  html = html.replace(
    /Droits réduits uniformisés \(0,715\s*%\)/gi,
    "Droits réduits VEFA (0,715 % pour acquisitions de biens neufs)",
  );

  // 2. Corriger "Immobilier neuf (TFPB)" → "Immobilier neuf (VEFA)"
  html = html.replace(/Immobilier neuf \(TFPB\)/gi, "Immobilier neuf (VEFA)");

  // 3. Corriger typo "2026–2026" → "2025–2026"
  html = html.replace(/2026[–-]2026/g, "2025–2026");

  // 4. Corriger les pourcentages incohérents dans les tableaux
  // Ancien: ≈ 7,91 → doit être ≈ 8,22 (ou le vrai pourcentage)
  // Neuf: ≈ 2,30 → doit être ≈ 2,61
  const ancienPct = ancien.pourcentage.replace(".", ",");
  const neufPct = neuf.pourcentage.replace(".", ",");

  html = html.replace(/>≈\s*7,91</g, `>≈ ${ancienPct}<`);

  html = html.replace(/>≈\s*2,30</g, `>≈ ${neufPct}<`);

  // 5. Corriger les montants incohérents (15 828 € → 16 434 €, 4 618 € → 5 224 €)
  html = html.replace(
    /15\s*828\s*€/g,
    `${ancien.total.toLocaleString("fr-FR")} €`,
  );

  html = html.replace(
    /4\s*618\s*€/g,
    `${neuf.total.toLocaleString("fr-FR")} €`,
  );

  // 6. Améliorer le disclaimer si présent
  html = html.replace(
    /Estimation non contractuelle basée sur les barèmes officiels en vigueur\./g,
    "Estimation indicative basée sur les barèmes officiels en vigueur au 1er janvier 2026 (Conseil Supérieur du Notariat). Les frais réels peuvent varier selon la nature du bien, le montage juridique et les pratiques de l'étude notariale. Ce simulateur ne constitue pas un devis notarial.",
  );

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }
  return false;
}

function main() {
  console.log("=== CORRECTION INCOHÉRENCES RESTANTES ===\n");

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

  let fixes = {
    uniformises: 0,
    tfpb: 0,
    typo2026: 0,
    pct: 0,
    montants: 0,
  };

  let updated = 0;
  for (const f of files) {
    const fp = path.join(dir, f);
    let html = fs.readFileSync(fp, "utf8");

    // Compter les corrections
    if (html.includes("uniformisés")) fixes.uniformises++;
    if (html.includes("TFPB")) fixes.tfpb++;
    if (/2026[–-]2026/.test(html)) fixes.typo2026++;
    if (html.includes("7,91")) fixes.pct++;
    if (html.includes("15 828")) fixes.montants++;

    if (processFile(fp)) updated++;
  }

  console.log("Corrections appliquées:");
  console.log(
    `  • "Droits réduits uniformisés" → formulation VEFA: ${fixes.uniformises} pages`,
  );
  console.log(`  • "TFPB" → "VEFA": ${fixes.tfpb} pages`);
  console.log(`  • Typo "2026–2026": ${fixes.typo2026} pages`);
  console.log(`  • Pourcentages incohérents (7,91/2,30): ${fixes.pct} pages`);
  console.log(
    `  • Montants incohérents (15 828/4 618): ${fixes.montants} pages`,
  );
  console.log(`\n✓ ${updated} fichiers mis à jour`);
}

main();
