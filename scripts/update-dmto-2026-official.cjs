/**
 * Mise à jour des taux DMTO 2026 - Données officielles du PDF impots.gouv.fr
 * Source: nid_11316_dmto_2026-01-01.pdf
 *
 * Calcul du taux total DMTO:
 * - Taux départemental voté + Taxe communale (1,20%) + Frais d'assiette (0,12%)
 * - 5,00% voté = 5,00 + 1,20 + 0,12 = 6,32%
 * - 4,50% voté = 4,50 + 1,20 + 0,12 = 5,82% (arrondi 5,80%)
 * - 3,80% voté = 3,80 + 1,20 + 0,12 = 5,12% (arrondi 5,09%)
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");

// Taux totaux DMTO par département basés sur le PDF officiel
// 5,00% voté → 6,32% total | 4,50% voté → 5,80% total | 3,80% voté → 5,09% total
const DMTO_2026 = {
  // Départements ayant voté 5,00% (taux majoré article 116 LF 2025)
  "01": 6.32, // Ain - 5,00% depuis 01/01/2026
  "02": 6.32, // Aisne - 5,00% depuis 01/05/2025
  "03": 6.32, // Allier - 5,00% depuis 01/06/2025
  "04": 6.32, // Alpes-de-Haute-Provence - 5,00% depuis 01/06/2025
  "05": 5.8, // Hautes-Alpes - 4,50% seulement
  "06": 5.8, // Alpes-Maritimes - 4,50% seulement
  "07": 5.8, // Ardèche - 4,50% seulement
  "08": 6.32, // Ardennes - 5,00% depuis 01/05/2025
  "09": 6.32, // Ariège - 5,00% depuis 01/04/2025
  10: 6.32, // Aube - 5,00% depuis 01/06/2025
  11: 6.32, // Aude - 5,00% depuis 01/05/2025
  12: 6.32, // Aveyron - 5,00% depuis 01/05/2025
  13: 6.32, // Bouches-du-Rhône - 5,00% depuis 01/05/2025
  14: 6.32, // Calvados - 5,00% depuis 01/05/2025
  15: 6.32, // Cantal - 5,00% depuis 01/05/2025
  16: 5.8, // Charente - 4,50% seulement
  17: 6.32, // Charente-Maritime - 5,00% depuis 01/04/2025
  18: 6.32, // Cher - 5,00% depuis 01/05/2025
  19: 6.32, // Corrèze - 5,00% depuis 01/04/2025
  "2A": 6.32, // Corse-du-Sud - 5,00% depuis 01/06/2025
  "2B": 6.32, // Haute-Corse - 5,00% depuis 01/06/2025
  21: 6.32, // Côte-d'Or - 5,00% depuis 01/04/2025
  22: 6.32, // Côtes-d'Armor - 5,00% depuis 01/05/2025
  23: 6.32, // Creuse - 5,00% depuis 01/05/2025
  24: 6.32, // Dordogne - 5,00% depuis 01/04/2025
  25: 6.32, // Doubs - 5,00% depuis 01/05/2025
  26: 5.8, // Drôme - 4,50% seulement
  27: 5.8, // Eure - 4,50% seulement
  28: 6.32, // Eure-et-Loir - 5,00% depuis 01/04/2025
  29: 6.32, // Finistère - 5,00% depuis 01/05/2025
  30: 6.32, // Gard - 5,00% depuis 01/05/2025
  31: 6.32, // Haute-Garonne - 5,00% depuis 01/04/2025
  32: 6.32, // Gers - 5,00% depuis 01/05/2025
  33: 6.32, // Gironde - 5,00% depuis 01/05/2025
  34: 6.32, // Hérault - 5,00% depuis 01/04/2025
  35: 6.32, // Ille-et-Vilaine - 5,00% depuis 01/04/2025
  36: 5.09, // Indre - 3,80% (taux réduit)
  37: 6.32, // Indre-et-Loire - 5,00% depuis 01/05/2025
  38: 6.32, // Isère - 5,00% depuis 01/06/2025
  39: 6.32, // Jura - 5,00% depuis 01/05/2025
  40: 6.32, // Landes - 5,00% depuis 01/06/2025
  41: 6.32, // Loir-et-Cher - 5,00% depuis 01/04/2025
  42: 6.32, // Loire - 5,00% depuis 01/04/2025
  43: 6.32, // Haute-Loire - 5,00% depuis 01/05/2025
  44: 6.32, // Loire-Atlantique - 5,00% depuis 01/04/2025
  45: 6.32, // Loiret - 5,00% depuis 01/04/2025
  46: 6.32, // Lot - 5,00% depuis 01/06/2025
  47: 6.32, // Lot-et-Garonne - 5,00% depuis 01/05/2025
  48: 5.8, // Lozère - 4,50% seulement
  49: 6.32, // Maine-et-Loire - 5,00% depuis 01/04/2025
  50: 6.32, // Manche - 5,00% depuis 01/05/2025
  51: 6.32, // Marne - 5,00% depuis 01/05/2025
  52: 6.32, // Haute-Marne - 5,00% depuis 01/05/2025
  53: 6.32, // Mayenne - 5,00% depuis 01/04/2025
  54: 6.32, // Meurthe-et-Moselle - 5,00% depuis 01/04/2025
  55: 6.32, // Meuse - 5,00% depuis 01/05/2025
  56: 6.32, // Morbihan - 5,00% depuis 01/05/2025
  57: 6.32, // Moselle - 5,00% depuis 01/05/2025
  58: 6.32, // Nièvre - 5,00% depuis 01/05/2025
  59: 6.32, // Nord - 5,00% depuis 01/05/2025
  60: 5.8, // Oise - 4,50% seulement
  61: 6.32, // Orne - 5,00% depuis 01/05/2025
  62: 6.32, // Pas-de-Calais - 5,00% depuis 01/05/2025
  63: 6.32, // Puy-de-Dôme - 5,00% depuis 01/04/2025
  64: 6.32, // Pyrénées-Atlantiques - 5,00% depuis 01/05/2025
  65: 5.8, // Hautes-Pyrénées - 4,50% seulement
  66: 6.32, // Pyrénées-Orientales - 5,00% depuis 01/05/2025
  67: 6.32, // Bas-Rhin (Alsace) - 5,00% depuis 01/05/2025
  68: 6.32, // Haut-Rhin (Alsace) - 5,00% depuis 01/05/2025
  69: 6.32, // Rhône/Lyon - 5,00% depuis 01/04-05/2025
  70: 6.32, // Haute-Saône - 5,00% depuis 01/05/2025
  71: 5.8, // Saône-et-Loire - 4,50% seulement
  72: 6.32, // Sarthe - 5,00% depuis 01/05/2025
  73: 6.32, // Savoie - 5,00% depuis 01/05/2025
  74: 6.32, // Haute-Savoie - 5,00% depuis 01/04/2025
  75: 6.32, // Paris - 5,00% depuis 01/04/2025
  76: 6.32, // Seine-Maritime - 5,00% depuis 01/05/2025
  77: 6.32, // Seine-et-Marne - 5,00% depuis 01/04/2025
  78: 6.32, // Yvelines - 5,00% depuis 01/05/2025
  79: 6.32, // Deux-Sèvres - 5,00% depuis 01/06/2025
  80: 6.32, // Somme - 5,00% depuis 01/05/2025
  81: 6.32, // Tarn - 5,00% depuis 01/04/2025
  82: 6.32, // Tarn-et-Garonne - 5,00% depuis 01/01/2026
  83: 6.32, // Var - 5,00% depuis 01/05/2025
  84: 6.32, // Vaucluse - 5,00% depuis 01/05/2025
  85: 6.32, // Vendée - 5,00% depuis 01/05/2025
  86: 6.32, // Vienne - 5,00% depuis 01/05/2025
  87: 6.32, // Haute-Vienne - 5,00% depuis 01/05/2025
  88: 6.32, // Vosges - 5,00% depuis 01/04/2025
  89: 6.32, // Yonne - 5,00% depuis 01/04/2025
  90: 6.32, // Territoire-de-Belfort - 5,00% depuis 01/06/2025
  91: 6.32, // Essonne - 5,00% depuis 01/04/2025
  92: 6.32, // Hauts-de-Seine - 5,00% depuis 01/04/2025
  93: 6.32, // Seine-Saint-Denis - 5,00% depuis 01/04/2025
  94: 6.32, // Val-de-Marne - 5,00% depuis 01/05/2025
  95: 6.32, // Val-d'Oise - 5,00% depuis 01/05/2025
  // DOM-TOM
  971: 5.8, // Guadeloupe - 4,50% seulement
  972: 5.8, // Martinique - 4,50% seulement
  973: 6.32, // Guyane - 5,00% depuis 01/06/2025
  974: 6.32, // La Réunion - 5,00% depuis 01/01/2026
  976: 5.09, // Mayotte - 3,80% (taux réduit)
};

// Départements à taux réduit (3,80% voté)
const DEPARTEMENTS_REDUITS = ["36", "976"];

// Départements à taux standard (4,50% voté, pas de majoration)
const DEPARTEMENTS_STANDARD = [
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

// ===== 1. Mettre à jour frais2026.json =====
function updatefrais2026Json() {
  const filepath = path.join(rootDir, "src/data/frais2026.json");
  const data = JSON.parse(fs.readFileSync(filepath, "utf8"));

  data.sources = [
    "https://www.service-public.fr/particuliers/vosdroits/F2167",
    "https://www.notariat.fr/frais-de-notaire",
    "https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/nid_11316_dmto_2026-01-01.pdf",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044989433",
  ];

  data.dmto = DMTO_2026;

  // Structure par type de bien
  const parDepartement = {};
  for (const [dept, taux] of Object.entries(DMTO_2026)) {
    parDepartement[dept] = taux / 100;
  }

  data.dmto_struct = {
    ancien: {
      default: 0.0632,
      par_departement: parDepartement,
    },
    neuf: { default: 0.00715 },
  };

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ frais2026.json mis à jour");
}

// ===== 2. Mettre à jour baremes.ts =====
function updateBaremesTs() {
  const filepath = path.join(rootDir, "src/data/baremes.ts");
  let content = fs.readFileSync(filepath, "utf8");

  // Remplacer le taux standard
  content = content.replace(
    /standard: 0\.\d+,\s*\/\/.*$/m,
    "standard: 0.0632, // taux majoré 2026 (5% voté = 6.32% total)",
  );

  // Remplacer le taux réduit
  content = content.replace(
    /reduit: 0\.\d+,\s*\/\/.*$/m,
    "reduit: 0.0509, // taux réduit 2026 (3.80% voté = 5.09% total)",
  );

  // Remplacer les départements réduits
  content = content.replace(
    /departementsReduits: \[.*?\],?\s*\/\/.*$/m,
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

  // Mettre à jour droitsMutation dans notaire
  if (data.notaire && data.notaire.droitsMutation) {
    data.notaire.droitsMutation = {
      standard: 0.0632,
      neuf: 0.00715,
      reduit: 0.0509,
      departementsReduits: ["36", "976"],
    };
  }

  // Mettre à jour la section dmto
  if (data.dmto) {
    for (const [dept, taux] of Object.entries(DMTO_2026)) {
      data.dmto[dept] = taux;
    }
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ baremes.json mis à jour");
}

// ===== 4. Mettre à jour notaire.html =====
function updateNotaireHtml() {
  const filepath = path.join(rootDir, "src/pages/notaire.html");
  let content = fs.readFileSync(filepath, "utf8");

  // Mise à jour des taux dans les textes
  content = content.replace(/≈ 3,80%/g, "≈ 5,09%");
  content = content.replace(/≈ 6,45%/g, "≈ 6,32%");
  content = content.replace(/≈ 5,80%/g, "≈ 6,32%");
  content = content.replace(/≈ 5,81%/g, "≈ 6,32%");
  content = content.replace(/3,80% à 6,45%/g, "5,09% à 6,32%");

  fs.writeFileSync(filepath, content, "utf8");
  console.log("✅ notaire.html mis à jour");
}

// ===== Exécution =====
console.log("🔄 Mise à jour des taux DMTO 2026 (données officielles PDF)...\n");
console.log("Source: impots.gouv.fr - nid_11316_dmto_2026-01-01.pdf\n");

updatefrais2026Json();
updateBaremesTs();
updateBaremesJson();
updateNotaireHtml();

console.log("\n✅ Mise à jour terminée!");
console.log("\n📊 Résumé des taux DMTO 2026:");
console.log(
  "   - Taux majoré (5% voté): 6,32% - " +
    Object.keys(DMTO_2026).filter((d) => DMTO_2026[d] === 6.32).length +
    " départements",
);
console.log(
  "   - Taux standard (4,50% voté): 5,80% - " +
    DEPARTEMENTS_STANDARD.length +
    " départements",
);
console.log(
  "   - Taux réduit (3,80% voté): 5,09% - " +
    DEPARTEMENTS_REDUITS.length +
    " départements (36 Indre, 976 Mayotte)",
);
