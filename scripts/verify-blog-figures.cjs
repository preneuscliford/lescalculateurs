#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

/**
 * Charge les barèmes officiels (2024 en vigueur 2025) depuis baremes.json
 */
function loadBaremes(root) {
  const p = path.join(root, "src", "data", "baremes.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

/**
 * Liste les fichiers HTML des pages départements
 */
function listDepartementPages(root) {
  const dir = path.join(root, "src", "pages", "blog", "departements");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(dir, f));
}

/**
 * Extrait le code départemental du nom de fichier
 */
function getDeptCode(filePath) {
  const base = path.basename(filePath, ".html");
  const m = base.match(/frais-notaire-(.+)$/);
  return m ? m[1] : "";
}

/**
 * Vérifie le contenu d'une page département et retourne les anomalies
 */
function verifyPageContent(content, deptCode, baremes) {
  const issues = [];

  // Vérifier priceRange JSON-LD
  const priceRangeRe = /"priceRange"\s*:\s*"([^"]+)"/;
  const pr = content.match(priceRangeRe);
  const expectedPR = "2–3% (neuf) / 7–8% (ancien)";
  if (pr) {
    const val = pr[1];
    if (val !== expectedPR) {
      issues.push({ type: "priceRange", message: `priceRange différent: "${val}"` });
    }
  } else {
    issues.push({ type: "priceRange_absent", message: "priceRange JSON-LD absent" });
  }

  // Pourcentages suspects (anciennes valeurs)
  // Détection contextuelle des pourcentages obsolètes (évite faux positifs: "4 min de lecture")
  const ctxPatterns = [
    /(?:\bneuf\b|\bancien\b|frais|prix)[^%]{0,60}≈\s*4%/i,
    /(?:\bneuf\b|\bancien\b|frais|prix)[^%]{0,60}≈\s*7[\.,]3%/i,
    /(?:\bneuf\b|\bancien\b|frais|prix)[^%]{0,60}\b4%\b/i,
    /(?:\bneuf\b|\bancien\b|frais|prix)[^%]{0,60}\b7[\.,]3%\b/i,
    /Entre\s*4%[^%]{0,40}neuf[^%]{0,40}7[\.,]3%[^%]{0,40}ancien/i,
  ];
  for (const re of ctxPatterns) {
    if (re.test(content)) {
      issues.push({ type: "pourcentage_obsolete", message: `Pourcentage obsolète détecté (contexte): ${re}` });
    }
  }

  // Départements à droits réduits: alerte si mention explicite 5.8%/5.9%
  const reduced = (baremes.notaire?.droitsMutation?.departementsReduits) || [];
  if (reduced.includes(deptCode)) {
    const badRateRe = /(5[\.,]8%|5[\.,]9%)/;
    if (badRateRe.test(content)) {
      issues.push({ type: "taux_droits_incorrect", message: "Mention 5,8%/5,9% trouvée alors que département réduit (3,8%)" });
    }
  }

  // Vérifier la présence de baremes.json (mini‑calculateur synchronisé)
  const hasBaremesJson = content.includes("baremes.json");
  if (!hasBaremesJson) {
    issues.push({ type: "integration_baremes", message: "Pas de chargement baremes.json détecté dans les scripts" });
  }

  return issues;
}

/**
 * Exécute la vérification sur toutes les pages départements et produit un rapport lisible
 */
function main() {
  const root = process.cwd();
  const baremes = loadBaremes(root);
  const files = listDepartementPages(root);
  const report = [];

  for (const fp of files) {
    const content = fs.readFileSync(fp, "utf8");
    const deptCode = getDeptCode(fp);
    const issues = verifyPageContent(content, deptCode, baremes);
    report.push({ file: fp, dept: deptCode, issues });
  }

  // Affichage du rapport
  let ok = 0;
  let warn = 0;
  for (const r of report) {
    if (r.issues.length === 0) {
      ok++;
    } else {
      warn++;
      console.log(`\n[WARN] ${r.file} (dept=${r.dept})`);
      for (const i of r.issues) {
        console.log(`  - ${i.type}: ${i.message}`);
      }
    }
  }

  console.log(`\nRésumé: OK=${ok} / WARN=${warn} / total=${report.length}`);
  if (warn > 0) {
    console.log("\nConseils:");
    console.log("- Harmoniser priceRange en \"2–3% (neuf) / 7–8% (ancien)\"");
    console.log("- Remplacer les mentions 4% / 7.3% tout au long des pages");
    console.log("- Pour 36/38/56/976, éviter 5,8%/5,9% et rappeler 3,8% si nécessaire");
    console.log("- S'assurer que le mini‑calculateur charge bien baremes.json");
  }
}

main();
