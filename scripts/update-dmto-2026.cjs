/**
 * Script de mise à jour des taux DMTO 2026
 * Source: https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/nid_11316_dmto_2026-01-01.pdf
 * Date: 1er janvier 2026
 */

const fs = require("fs");
const path = require("path");

// Nouveaux taux DMTO 2026 (en pourcentage)
// Basés sur l'article 116 de la loi n° 2025-127 de finances pour 2025
const DMTO_2026 = {
  // Départements avec taux majoré (5% voté = 6.32% total)
  "01": 6.32,
  "02": 6.32,
  "03": 6.32,
  "04": 6.32,
  "08": 6.32,
  "09": 6.32,
  10: 6.32,
  11: 6.32,
  12: 6.32,
  13: 6.32,
  14: 6.32,
  15: 6.32,
  17: 6.32,
  18: 6.32,
  19: 6.32,
  21: 6.32,
  22: 6.32,
  23: 6.32,
  24: 6.32,
  25: 6.32,
  28: 6.32,
  29: 6.32,
  30: 6.32,
  31: 6.32,
  32: 6.32,
  33: 6.32,
  34: 6.32,
  35: 6.32,
  37: 6.32,
  38: 6.32,
  39: 6.32,
  40: 6.32,
  41: 6.32,
  42: 6.32,
  43: 6.32,
  44: 6.32,
  45: 6.32,
  46: 6.32,
  47: 6.32,
  49: 6.32,
  50: 6.32,
  51: 6.32,
  52: 6.32,
  53: 6.32,
  54: 6.32,
  55: 6.32,
  56: 6.32,
  57: 6.32,
  58: 6.32,
  59: 6.32,
  61: 6.32,
  62: 6.32,
  63: 6.32,
  64: 6.32,
  66: 6.32,
  67: 6.32,
  68: 6.32,
  69: 6.32,
  70: 6.32,
  72: 6.32,
  73: 6.32,
  74: 6.32,
  75: 6.32,
  76: 6.32,
  77: 6.32,
  78: 6.32,
  79: 6.32,
  80: 6.32,
  81: 6.32,
  82: 6.32,
  83: 6.32,
  84: 6.32,
  85: 6.32,
  86: 6.32,
  87: 6.32,
  88: 6.32,
  89: 6.32,
  90: 6.32,
  91: 6.32,
  92: 6.32,
  93: 6.32,
  94: 6.32,
  95: 6.32,
  "2A": 6.32,
  "2B": 6.32, // Corse - ont voté 5% en 2025
  973: 6.32,
  974: 6.32, // Guyane et Réunion ont voté 5%

  // Départements avec taux standard (4.50% = 5.80% total)
  "05": 5.8,
  "06": 5.8,
  "07": 5.8,
  16: 5.8,
  26: 5.8,
  27: 5.8,
  48: 5.8,
  60: 5.8,
  65: 5.8,
  71: 5.8,
  971: 5.8,
  972: 5.8, // Guadeloupe et Martinique

  // Départements avec taux réduit (3.80%)
  36: 5.09, // Indre
  976: 5.09, // Mayotte
};

// Anciens taux pour référence
const ANCIENS_TAUX = {
  56: 3.8,
  57: 3.8,
  67: 3.8,
  68: 3.8, // Plus à taux réduit depuis 2026
  "2A": 4.5,
  "2B": 4.5, // Corse était à 4.50%
  92: 6.45,
  93: 6.45,
  94: 6.45, // IDF haute était plus élevée
  75: 5.81, // Paris était légèrement différent
};

const rootDir = path.join(__dirname, "..");

// 1. Mettre à jour baremes.ts
function updateBaremesTs() {
  const filepath = path.join(rootDir, "src/data/baremes.ts");
  let content = fs.readFileSync(filepath, "utf8");

  // Mettre à jour le taux standard
  content = content.replace(
    /standard: 0\.0581,.*$/m,
    "standard: 0.0632, // taux majoré 2026 (5% voté = 6.32% total)",
  );

  // Mettre à jour le taux réduit
  content = content.replace(
    /reduit: 0\.0509006,.*$/m,
    "reduit: 0.0509, // taux réduit 2026 (3.80% = 5.09% total)",
  );

  // Mettre à jour les départements à taux réduit
  content = content.replace(
    /departementsReduits: \[.*\]/,
    'departementsReduits: ["36", "976"] // Indre et Mayotte uniquement en 2026',
  );

  fs.writeFileSync(filepath, content);
  console.log("✅ baremes.ts mis à jour");
}

// 2. Mettre à jour notaire.html - textes descriptifs
function updateNotaireHtml() {
  const filepath = path.join(rootDir, "src/pages/notaire.html");
  let content = fs.readFileSync(filepath, "utf8");

  // Remplacer les anciennes fourchettes
  content = content.replace(
    /3,80&nbsp;% \(56, 57, 67, 68\)/g,
    "5,09&nbsp;% (36, 976)",
  );
  content = content.replace(
    /6,45&nbsp;% \(92, 93, 94\)/g,
    "6,32&nbsp;% (majorité des départements)",
  );
  content = content.replace(/5,81&nbsp;%/g, "6,32&nbsp;%");
  content = content.replace(/≈ 3,80%/g, "≈ 5,09%");
  content = content.replace(/≈ 6,45%/g, "≈ 6,32%");
  content = content.replace(/≈ 5,81%/g, "≈ 6,32%");
  content = content.replace(/≈ 5,80%/g, "≈ 6,32%");
  content = content.replace(/3,80% à 6,45%/g, "5,09% à 6,32%");

  // Mettre à jour les exemples de calcul
  content = content.replace(/9&nbsp;500&nbsp;€/g, "12&nbsp;725&nbsp;€"); // 250000 * 5.09%
  content = content.replace(/14&nbsp;525&nbsp;€/g, "15&nbsp;800&nbsp;€"); // 250000 * 6.32%
  content = content.replace(/16&nbsp;125&nbsp;€/g, "15&nbsp;800&nbsp;€"); // 250000 * 6.32%
  content = content.replace(/6&nbsp;625&nbsp;€/g, "3&nbsp;075&nbsp;€"); // Écart 15800 - 12725

  // Corriger les références aux départements
  content = content.replace(/Bas‑Rhin\/Haut‑Rhin, Morbihan/g, "Indre, Mayotte");
  content = content.replace(/\(56, 57, 67, 68\)/g, "(36, 976)");
  content = content.replace(/≈ 4,50% \(Corse[^)]*\)/g, "≈ 6,32% (Corse 2A/2B)");

  fs.writeFileSync(filepath, content);
  console.log("✅ notaire.html mis à jour");
}

// 3. Mettre à jour comment-calculer-frais-notaire.html
function updateCommentCalculer() {
  const filepath = path.join(
    rootDir,
    "src/pages/comment-calculer-frais-notaire.html",
  );
  if (!fs.existsSync(filepath)) {
    console.log("⚠️ comment-calculer-frais-notaire.html non trouvé");
    return;
  }

  let content = fs.readFileSync(filepath, "utf8");

  content = content.replace(/3,80%/g, "5,09%");
  content = content.replace(/5,80%/g, "6,32%");
  content = content.replace(/6,45%/g, "6,32%");

  fs.writeFileSync(filepath, content);
  console.log("✅ comment-calculer-frais-notaire.html mis à jour");
}

// 4. Mettre à jour sources.html
function updateSourcesHtml() {
  const filepath = path.join(rootDir, "src/pages/sources.html");
  if (!fs.existsSync(filepath)) {
    console.log("⚠️ sources.html non trouvé");
    return;
  }

  let content = fs.readFileSync(filepath, "utf8");

  content = content.replace(
    /3,80% \(hors IDF\)/g,
    "5,09% (taux réduit: Indre, Mayotte)",
  );

  fs.writeFileSync(filepath, content);
  console.log("✅ sources.html mis à jour");
}

// 5. Mettre à jour methodologie.html
function updateMethodologie() {
  const filepath = path.join(rootDir, "src/pages/methodologie.html");
  if (!fs.existsSync(filepath)) {
    console.log("⚠️ methodologie.html non trouvé");
    return;
  }

  let content = fs.readFileSync(filepath, "utf8");

  content = content.replace(/Barèmes DMTO 2025/g, "Barèmes DMTO 2026");
  content = content.replace(
    /barèmes officiels 2025/g,
    "barèmes officiels 2026",
  );
  content = content.replace(/barèmes 2025/g, "barèmes 2026");

  fs.writeFileSync(filepath, content);
  console.log("✅ methodologie.html mis à jour");
}

// 6. Mettre à jour les pages blog départements
function updateBlogDepartements() {
  const blogDir = path.join(rootDir, "src/pages/blog/departements");
  if (!fs.existsSync(blogDir)) {
    console.log("⚠️ Dossier blog/departements non trouvé");
    return;
  }

  const files = fs
    .readdirSync(blogDir)
    .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

  files.forEach((file) => {
    const filepath = path.join(blogDir, file);
    let content = fs.readFileSync(filepath, "utf8");

    // Extraire le code département
    const match = file.match(/frais-notaire-(\d+|2[AB])\.html/);
    if (!match) return;

    const deptCode = match[1];
    const nouveauTaux = DMTO_2026[deptCode] || 6.32;

    // Remplacer les anciens taux par les nouveaux
    // Pattern: droits ≈ X.XX%
    content = content.replace(
      /droits ≈ \d+,\d+%/g,
      `droits ≈ ${nouveauTaux.toFixed(2).replace(".", ",")}%`,
    );
    content = content.replace(
      /droits ≈ \d+\.\d+%/g,
      `droits ≈ ${nouveauTaux.toFixed(2)}%`,
    );

    // Mettre à jour les montants exemple pour 200000€
    const ancienMontant = 200000 * 0.058 + 4500; // ancien total approximatif
    const nouveauMontant = Math.round(200000 * (nouveauTaux / 100) + 4500); // émoluments + débours

    // Pattern générique pour les montants
    content = content.replace(
      /≈ 3,80%/g,
      `≈ ${nouveauTaux.toFixed(2).replace(".", ",")}%`,
    );

    fs.writeFileSync(filepath, content);
  });

  console.log(`✅ ${files.length} pages blog départements mises à jour`);
}

// 7. Mettre à jour frais-notaire-departements.html
function updateFraisNotaireDepartements() {
  const filepath = path.join(
    rootDir,
    "src/pages/blog/frais-notaire-departements.html",
  );
  if (!fs.existsSync(filepath)) {
    console.log("⚠️ frais-notaire-departements.html non trouvé");
    return;
  }

  let content = fs.readFileSync(filepath, "utf8");

  content = content.replace(/≈ 6,60 %/g, "≈ 7,50 %");
  content = content.replace(/≈ 5,80%/g, "≈ 6,32%");

  fs.writeFileSync(filepath, content);
  console.log("✅ frais-notaire-departements.html mis à jour");
}

// 8. Mettre à jour baremes.json si existe
function updateBaremesJson() {
  const filepath = path.join(rootDir, "src/data/baremes.json");
  if (!fs.existsSync(filepath)) {
    console.log("⚠️ baremes.json non trouvé");
    return;
  }

  let data = JSON.parse(fs.readFileSync(filepath, "utf8"));

  // Mettre à jour les taux DMTO
  if (data.dmto) {
    Object.keys(DMTO_2026).forEach((dept) => {
      if (data.dmto[dept] !== undefined) {
        data.dmto[dept] = DMTO_2026[dept];
      }
    });
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log("✅ baremes.json mis à jour");
}

// Exécution
console.log("🔄 Mise à jour des taux DMTO 2026...\n");
console.log("Source: PDF impots.gouv.fr du 1er janvier 2026\n");

updateBaremesTs();
updateNotaireHtml();
updateCommentCalculer();
updateSourcesHtml();
updateMethodologie();
updateBlogDepartements();
updateFraisNotaireDepartements();
updateBaremesJson();

console.log("\n✅ Mise à jour terminée!");
console.log("\n📊 Résumé des changements:");
console.log("   - Taux standard: 5,80% → 6,32% (majorité des départements)");
console.log("   - Taux réduit: 3,80% → 5,09% (Indre 36, Mayotte 976)");
console.log(
  "   - Corse, Morbihan, Moselle, Alsace: passage au taux majoré 6,32%",
);
console.log("   - DOM: Guyane et Réunion passent à 6,32%");
