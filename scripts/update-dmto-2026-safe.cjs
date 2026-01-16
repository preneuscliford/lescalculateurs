/**
 * Script de mise à jour des taux DMTO 2026 - Version UTF-8 safe
 * Source: https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/nid_11316_dmto_2026-01-01.pdf
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");

// ===== 1. Mettre à jour frais2025.json =====
function updateFrais2025Json() {
  const filepath = path.join(rootDir, "src/data/frais2025.json");
  const data = JSON.parse(fs.readFileSync(filepath, "utf8"));

  // Nouveaux taux DMTO 2026
  data.sources = [
    "https://www.service-public.fr/particuliers/vosdroits/F2167",
    "https://www.notariat.fr/frais-de-notaire",
    "https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/nid_11316_dmto_2026-01-01.pdf",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044989433",
  ];

  // Taux majoré 6.32% pour la majorité, standard 5.80% pour quelques-uns, réduit 5.09% pour 36 et 976
  const tauxMajore = 6.32;
  const tauxStandard = 5.8;
  const tauxReduit = 5.09;

  const departementsStandard = [
    "05",
    "06",
    "07",
    "16",
    "26",
    "27",
    "48",
    "60",
    "65",
    "71",
    "971",
    "972",
  ];
  const departementsReduits = ["36", "976"];

  data.dmto = {
    "01": tauxMajore,
    "02": tauxMajore,
    "03": tauxMajore,
    "04": tauxMajore,
    "05": tauxStandard,
    "06": tauxStandard,
    "07": tauxStandard,
    "08": tauxMajore,
    "09": tauxMajore,
    10: tauxMajore,
    11: tauxMajore,
    12: tauxMajore,
    13: tauxMajore,
    14: tauxMajore,
    15: tauxMajore,
    16: tauxStandard,
    17: tauxMajore,
    18: tauxMajore,
    19: tauxMajore,
    21: tauxMajore,
    22: tauxMajore,
    23: tauxMajore,
    24: tauxMajore,
    25: tauxMajore,
    26: tauxStandard,
    27: tauxStandard,
    28: tauxMajore,
    29: tauxMajore,
    "2A": tauxMajore,
    "2B": tauxMajore,
    30: tauxMajore,
    31: tauxMajore,
    32: tauxMajore,
    33: tauxMajore,
    34: tauxMajore,
    35: tauxMajore,
    36: tauxReduit,
    37: tauxMajore,
    38: tauxMajore,
    39: tauxMajore,
    40: tauxMajore,
    41: tauxMajore,
    42: tauxMajore,
    43: tauxMajore,
    44: tauxMajore,
    45: tauxMajore,
    46: tauxMajore,
    47: tauxMajore,
    48: tauxStandard,
    49: tauxMajore,
    50: tauxMajore,
    51: tauxMajore,
    52: tauxMajore,
    53: tauxMajore,
    54: tauxMajore,
    55: tauxMajore,
    56: tauxMajore,
    57: tauxMajore,
    58: tauxMajore,
    59: tauxMajore,
    60: tauxStandard,
    61: tauxMajore,
    62: tauxMajore,
    63: tauxMajore,
    64: tauxMajore,
    65: tauxStandard,
    66: tauxMajore,
    67: tauxMajore,
    68: tauxMajore,
    69: tauxMajore,
    70: tauxMajore,
    71: tauxStandard,
    72: tauxMajore,
    73: tauxMajore,
    74: tauxMajore,
    75: tauxMajore,
    76: tauxMajore,
    77: tauxMajore,
    78: tauxMajore,
    79: tauxMajore,
    80: tauxMajore,
    81: tauxMajore,
    82: tauxMajore,
    83: tauxMajore,
    84: tauxMajore,
    85: tauxMajore,
    86: tauxMajore,
    87: tauxMajore,
    88: tauxMajore,
    89: tauxMajore,
    90: tauxMajore,
    91: tauxMajore,
    92: tauxMajore,
    93: tauxMajore,
    94: tauxMajore,
    95: tauxMajore,
    971: tauxStandard,
    972: tauxStandard,
    973: tauxMajore,
    974: tauxMajore,
    976: tauxReduit,
  };

  // Mettre à jour dmto_struct
  data.dmto_struct = {
    ancien: {
      default: 0.0632,
      par_departement: {
        "05": 0.058,
        "06": 0.058,
        "07": 0.058,
        16: 0.058,
        26: 0.058,
        27: 0.058,
        36: 0.0509,
        48: 0.058,
        60: 0.058,
        65: 0.058,
        71: 0.058,
        971: 0.058,
        972: 0.058,
        973: 0.0632,
        974: 0.0632,
        976: 0.0509,
      },
    },
    neuf: { default: 0.00715 },
  };

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ frais2025.json mis à jour");
}

// ===== 2. Mettre à jour baremes.ts =====
function updateBaremesTs() {
  const filepath = path.join(rootDir, "src/data/baremes.ts");
  let content = fs.readFileSync(filepath, "utf8");

  // Remplacer le taux standard
  content = content.replace(
    /standard: 0\.0581,\s*\/\/.*$/m,
    "standard: 0.0632, // taux majoré 2026 (5% voté = 6.32% total)",
  );

  // Remplacer le taux réduit
  content = content.replace(
    /reduit: 0\.0509006,\s*\/\/.*$/m,
    "reduit: 0.0509, // taux réduit 2026 (Indre, Mayotte)",
  );

  // Remplacer les départements réduits
  content = content.replace(
    /departementsReduits: \["36", "976"\],?/,
    'departementsReduits: ["36", "976"], // Indre et Mayotte uniquement en 2026',
  );

  fs.writeFileSync(filepath, content, "utf8");
  console.log("✅ baremes.ts mis à jour");
}

// ===== 3. Mettre à jour baremes.json =====
function updateBaremesJson() {
  const filepath = path.join(rootDir, "src/data/baremes.json");
  if (!fs.existsSync(filepath)) {
    console.log("⚠️ baremes.json non trouvé");
    return;
  }

  const data = JSON.parse(fs.readFileSync(filepath, "utf8"));

  // Mettre à jour droitsMutation
  if (data.notaire && data.notaire.droitsMutation) {
    data.notaire.droitsMutation = {
      standard: 0.0632,
      neuf: 0.00715,
      reduit: 0.0509,
      departementsReduits: ["36", "976"],
    };
  }

  // Mettre à jour dmto
  if (data.dmto) {
    const tauxMajore = 6.32;
    const tauxStandard = 5.8;
    const tauxReduit = 5.09;
    const departementsStandard = [
      "05",
      "06",
      "07",
      "16",
      "26",
      "27",
      "48",
      "60",
      "65",
      "71",
      "971",
      "972",
    ];
    const departementsReduits = ["36", "976"];

    for (const dept of Object.keys(data.dmto)) {
      if (departementsReduits.includes(dept)) {
        data.dmto[dept] = tauxReduit;
      } else if (departementsStandard.includes(dept)) {
        data.dmto[dept] = tauxStandard;
      } else {
        data.dmto[dept] = tauxMajore;
      }
    }
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ baremes.json mis à jour");
}

// ===== 4. Mettre à jour notaire.html =====
function updateNotaireHtml() {
  const filepath = path.join(rootDir, "src/pages/notaire.html");
  let content = fs.readFileSync(filepath, "utf8");

  // Texte original de la section DMTO
  const oldBlock = `Les droits d'enregistrement (DMTO) varient de
                <strong>3,80&nbsp;% (56, 57, 67, 68)</strong> à
                <strong>6,45&nbsp;% (92, 93, 94)</strong>. Paris (75) applique
                un taux de <strong>5,81&nbsp;%</strong>.`;

  const newBlock = `Les droits d'enregistrement (DMTO) varient de
                <strong>5,09&nbsp;% (36 Indre, 976 Mayotte)</strong> à
                <strong>6,32&nbsp;% (majorité des départements)</strong>. Paris (75) applique
                un taux de <strong>6,32&nbsp;%</strong> depuis janvier 2026.`;

  content = content.replace(oldBlock, newBlock);

  // Mayotte section
  content = content.replace(
    /Mayotte \(976\) est à <strong>4,00&nbsp;%<\/strong>\. Sur un achat/,
    "La plupart des départements ont voté le taux majoré en 2026. Sur un achat",
  );

  // Exemples de calcul
  content = content.replace(
    /3,80&nbsp;%&nbsp;→&nbsp;<strong>9&nbsp;500&nbsp;€<\/strong>/g,
    "5,09&nbsp;% (réduit)&nbsp;→&nbsp;<strong>12&nbsp;725&nbsp;€</strong>",
  );

  content = content.replace(
    /5,81&nbsp;% \(Paris\)&nbsp;→&nbsp;<strong\s*>14&nbsp;525&nbsp;€<\/strong\s*>/g,
    "6,32&nbsp;% (standard)&nbsp;→&nbsp;<strong>15&nbsp;800&nbsp;€</strong>",
  );

  // Supprimer la ligne 6,45%
  content = content.replace(
    /<li>\s*6,45&nbsp;% \(92, 93, 94\)&nbsp;→&nbsp;<strong\s*>16&nbsp;125&nbsp;€<\/strong\s*>\s*<\/li>/g,
    "",
  );

  // Écart
  content = content.replace(
    /Écart maximal&nbsp;:&nbsp;<strong>6&nbsp;625&nbsp;€<\/strong>/g,
    "Écart entre taux réduit et standard&nbsp;:&nbsp;<strong>3&nbsp;075&nbsp;€</strong>",
  );

  // FAQ sections
  content = content.replace(/≈ 3,80%/g, "≈ 5,09%");
  content = content.replace(/≈ 6,45%/g, "≈ 6,32%");
  content = content.replace(/≈ 5,80%/g, "≈ 6,32%");
  content = content.replace(/≈ 5,81%/g, "≈ 6,32%");
  content = content.replace(/3,80% à 6,45%/g, "5,09% à 6,32%");

  // Mise à jour section FAQ différences
  content = content.replace(
    /≈ 3,80% \(Bas‑Rhin\/Haut‑Rhin, Morbihan\), ≈ 4,50% \(Corse\s*2A\/2B\), ≈ 5,81% \(Paris\) et ≈ 6,45% \(92\/93\/94\)\. La majorité des\s*départements se situent autour de ≈ 5,80%/g,
    "≈ 6,32% (majorité des départements). Seuls l'Indre (36) et Mayotte (976) conservent un taux réduit de ≈ 5,09%",
  );

  fs.writeFileSync(filepath, content, "utf8");
  console.log("✅ notaire.html mis à jour");
}

// ===== 5. Mettre à jour comment-calculer-frais-notaire.html =====
function updateCommentCalculer() {
  const filepath = path.join(
    rootDir,
    "src/pages/comment-calculer-frais-notaire.html",
  );
  if (!fs.existsSync(filepath)) return;

  let content = fs.readFileSync(filepath, "utf8");

  // Mise à jour de la liste des taux
  content = content.replace(
    /<li>Taux standard hors Île-de-France : 3,80%<\/li>/,
    "<li>Taux majoré 2026 (majorité des départements) : 6,32%</li>",
  );

  content = content.replace(
    /<li>Taux réduit \(primo-accédants résidence principale\) : 3,80%<\/li>/,
    "<li>Taux réduit (Indre 36, Mayotte 976) : 5,09%</li>",
  );

  // Exemple de calcul
  content = content.replace(
    /Achat 300 000 € en Île-de-France = 300 000\s*× 4,50% = 13 500 €/,
    "Achat 300 000 € avec taux majoré = 300 000 × 6,32% = 18 960 €",
  );

  // Primo-accédants section
  content = content.replace(
    /<strong>Primo-accédants :<\/strong> DMTO réduit de 3,80% en zone\s*réglementée/,
    "<strong>Primo-accédants :</strong> Possibilité de taux réduit dans certains départements",
  );

  fs.writeFileSync(filepath, content, "utf8");
  console.log("✅ comment-calculer-frais-notaire.html mis à jour");
}

// ===== 6. Mettre à jour sources.html =====
function updateSourcesHtml() {
  const filepath = path.join(rootDir, "src/pages/sources.html");
  if (!fs.existsSync(filepath)) return;

  let content = fs.readFileSync(filepath, "utf8");

  content = content.replace(
    /<strong>Droits de mutation \(DMTO\) :<\/strong> 3,80% \(hors IDF\)\s*à 4,50% \(Île-de-France\) en 2025/,
    "<strong>Droits de mutation (DMTO) :</strong> 6,32% (taux majoré 2026) ou 5,80% (standard) ou 5,09% (réduit: Indre, Mayotte)",
  );

  fs.writeFileSync(filepath, content, "utf8");
  console.log("✅ sources.html mis à jour");
}

// ===== 7. Mettre à jour methodologie.html =====
function updateMethodologie() {
  const filepath = path.join(rootDir, "src/pages/methodologie.html");
  if (!fs.existsSync(filepath)) return;

  let content = fs.readFileSync(filepath, "utf8");

  content = content.replace(
    /Tarif des notaires 2025/g,
    "Tarif des notaires 2026",
  );
  content = content.replace(/Barèmes DMTO 2025/g, "Barèmes DMTO 2026");
  content = content.replace(
    /Données conformes CGI 2025/g,
    "Données conformes CGI 2026",
  );

  fs.writeFileSync(filepath, content, "utf8");
  console.log("✅ methodologie.html mis à jour");
}

// ===== Exécution =====
console.log("🔄 Mise à jour des taux DMTO 2026 (UTF-8 safe)...\n");

updateFrais2025Json();
updateBaremesTs();
updateBaremesJson();
updateNotaireHtml();
updateCommentCalculer();
updateSourcesHtml();
updateMethodologie();

console.log("\n✅ Mise à jour terminée!");
console.log("\n📊 Nouveaux taux DMTO 2026:");
console.log("   - Taux majoré: 6,32% (majorité des départements)");
console.log(
  "   - Taux standard: 5,80% (05, 06, 07, 16, 26, 27, 48, 60, 65, 71, 971, 972)",
);
console.log("   - Taux réduit: 5,09% (36 Indre, 976 Mayotte)");
