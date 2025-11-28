const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");

// MAP des départements (complet)
const DEPT_MAP = {
  Ain: { name: "Ain", article: "l'", code: "01" },
  Aisne: { name: "Aisne", article: "l'", code: "02" },
  Allier: { name: "Allier", article: "l'", code: "03" },
  "Alpes-de-Haute-Provence": {
    name: "Alpes-de-Haute-Provence",
    article: "les",
    code: "04",
  },
  "Hautes-Alpes": { name: "Hautes-Alpes", article: "les", code: "05" },
  "Alpes-Maritimes": { name: "Alpes-Maritimes", article: "les", code: "06" },
  Ardèche: { name: "Ardèche", article: "l'", code: "07" },
  Ardennes: { name: "Ardennes", article: "les", code: "08" },
  Ariège: { name: "Ariège", article: "l'", code: "09" },
  Aube: { name: "Aube", article: "l'", code: "10" },
  Aude: { name: "Aude", article: "l'", code: "11" },
  Aveyron: { name: "Aveyron", article: "l'", code: "12" },
  "Bouches-du-Rhône": { name: "Bouches-du-Rhône", article: "les", code: "13" },
  Calvados: { name: "Calvados", article: "le", code: "14" },
  Cantal: { name: "Cantal", article: "le", code: "15" },
  Charente: { name: "Charente", article: "la", code: "16" },
  "Charente-Maritime": { name: "Charente-Maritime", article: "la", code: "17" },
  Cher: { name: "Cher", article: "le", code: "18" },
  Corrèze: { name: "Corrèze", article: "la", code: "19" },
  "Côte-d'Or": { name: "Côte-d'Or", article: "la", code: "21" },
  "Côtes-d'Armor": { name: "Côtes-d'Armor", article: "les", code: "22" },
  Creuse: { name: "Creuse", article: "la", code: "23" },
  Dordogne: { name: "Dordogne", article: "la", code: "24" },
  Doubs: { name: "Doubs", article: "le", code: "25" },
  Drôme: { name: "Drôme", article: "la", code: "26" },
  Eure: { name: "Eure", article: "l'", code: "27" },
  "Eure-et-Loir": { name: "Eure-et-Loir", article: "l'", code: "28" },
  Finistère: { name: "Finistère", article: "le", code: "29" },
  "Corse-du-Sud": { name: "Corse-du-Sud", article: "la", code: "2A" },
  "Haute-Corse": { name: "Haute-Corse", article: "la", code: "2B" },
  Gard: { name: "Gard", article: "le", code: "30" },
  "Haute-Garonne": { name: "Haute-Garonne", article: "la", code: "31" },
  Gers: { name: "Gers", article: "le", code: "32" },
  Gironde: { name: "Gironde", article: "la", code: "33" },
  Hérault: { name: "Hérault", article: "l'", code: "34" },
  "Ille-et-Vilaine": { name: "Ille-et-Vilaine", article: "l'", code: "35" },
  Indre: { name: "Indre", article: "l'", code: "36" },
  "Indre-et-Loire": { name: "Indre-et-Loire", article: "l'", code: "37" },
  Isère: { name: "Isère", article: "l'", code: "38" },
  Jura: { name: "Jura", article: "le", code: "39" },
  Landes: { name: "Landes", article: "les", code: "40" },
  "Loir-et-Cher": { name: "Loir-et-Cher", article: "le", code: "41" },
  Loire: { name: "Loire", article: "la", code: "42" },
  "Haute-Loire": { name: "Haute-Loire", article: "la", code: "43" },
  "Loire-Atlantique": { name: "Loire-Atlantique", article: "la", code: "44" },
  Loiret: { name: "Loiret", article: "le", code: "45" },
  Lot: { name: "Lot", article: "le", code: "46" },
  "Lot-et-Garonne": { name: "Lot-et-Garonne", article: "le", code: "47" },
  Lozère: { name: "Lozère", article: "la", code: "48" },
  "Maine-et-Loire": { name: "Maine-et-Loire", article: "le", code: "49" },
  Manche: { name: "Manche", article: "la", code: "50" },
  Marne: { name: "Marne", article: "la", code: "51" },
  "Haute-Marne": { name: "Haute-Marne", article: "la", code: "52" },
  Mayenne: { name: "Mayenne", article: "la", code: "53" },
  "Meurthe-et-Moselle": {
    name: "Meurthe-et-Moselle",
    article: "la",
    code: "54",
  },
  Meuse: { name: "Meuse", article: "la", code: "55" },
  Morbihan: { name: "Morbihan", article: "le", code: "56" },
  Moselle: { name: "Moselle", article: "la", code: "57" },
  Nièvre: { name: "Nièvre", article: "la", code: "58" },
  Nord: { name: "Nord", article: "le", code: "59" },
  Oise: { name: "Oise", article: "l'", code: "60" },
  Orne: { name: "Orne", article: "l'", code: "61" },
  "Pas-de-Calais": { name: "Pas-de-Calais", article: "le", code: "62" },
  "Puy-de-Dôme": { name: "Puy-de-Dôme", article: "le", code: "63" },
  "Pyrénées-Atlantiques": {
    name: "Pyrénées-Atlantiques",
    article: "les",
    code: "64",
  },
  "Hautes-Pyrénées": { name: "Hautes-Pyrénées", article: "les", code: "65" },
  "Pyrénées-Orientales": {
    name: "Pyrénées-Orientales",
    article: "les",
    code: "66",
  },
  "Bas-Rhin": { name: "Bas-Rhin", article: "le", code: "67" },
  "Haut-Rhin": { name: "Haut-Rhin", article: "le", code: "68" },
  Rhône: { name: "Rhône", article: "le", code: "69" },
  "Haute-Saône": { name: "Haute-Saône", article: "la", code: "70" },
  "Saône-et-Loire": { name: "Saône-et-Loire", article: "la", code: "71" },
  Sarthe: { name: "Sarthe", article: "la", code: "72" },
  Savoie: { name: "Savoie", article: "la", code: "73" },
  "Haute-Savoie": { name: "Haute-Savoie", article: "la", code: "74" },
  Paris: { name: "Paris", article: "le", code: "75" },
  "Seine-Maritime": { name: "Seine-Maritime", article: "la", code: "76" },
  "Seine-et-Marne": { name: "Seine-et-Marne", article: "la", code: "77" },
  Yvelines: { name: "Yvelines", article: "les", code: "78" },
  "Deux-Sèvres": { name: "Deux-Sèvres", article: "les", code: "79" },
  Somme: { name: "Somme", article: "la", code: "80" },
  Tarn: { name: "Tarn", article: "le", code: "81" },
  "Tarn-et-Garonne": { name: "Tarn-et-Garonne", article: "le", code: "82" },
  Var: { name: "Var", article: "le", code: "83" },
  Vaucluse: { name: "Vaucluse", article: "le", code: "84" },
  Vendée: { name: "Vendée", article: "la", code: "85" },
  Vienne: { name: "Vienne", article: "la", code: "86" },
  "Haute-Vienne": { name: "Haute-Vienne", article: "la", code: "87" },
  Vosges: { name: "Vosges", article: "les", code: "88" },
  Yonne: { name: "Yonne", article: "l'", code: "89" },
  "Territoire de Belfort": {
    name: "Territoire de Belfort",
    article: "le",
    code: "90",
  },
  Essonne: { name: "Essonne", article: "l'", code: "91" },
  "Hauts-de-Seine": { name: "Hauts-de-Seine", article: "les", code: "92" },
  "Seine-Saint-Denis": { name: "Seine-Saint-Denis", article: "la", code: "93" },
  "Val-de-Marne": { name: "Val-de-Marne", article: "le", code: "94" },
  "Val-d'Oise": { name: "Val-d'Oise", article: "le", code: "95" },
  Guadeloupe: { name: "Guadeloupe", article: "la", code: "971" },
  Martinique: { name: "Martinique", article: "la", code: "972" },
  Guyane: { name: "Guyane", article: "la", code: "973" },
  "La Réunion": { name: "La Réunion", article: "la", code: "974" },
  "Saint-Pierre-et-Miquelon": {
    name: "Saint-Pierre-et-Miquelon",
    article: "le",
    code: "975",
  },
  Mayotte: { name: "Mayotte", article: "le", code: "976" },
};

// patterns cassés fréquents
const FIXES = [
  { regex: /laSavoie/g, repl: "la Savoie" },
  { regex: /laVal-d'Oise/g, repl: "le Val-d'Oise" },
  { regex: /Val-dâ€™Oise/g, repl: "Val-d'Oise" },
  { regex: /d'Oise'Oise/g, repl: "d'Oise" },
  { regex: /’/g, repl: "'" },
];

function normalizeText(text) {
  FIXES.forEach((f) => (text = text.replace(f.regex, f.repl)));

  // normalise tous les départements connus
  for (const key of Object.keys(DEPT_MAP)) {
    const { name } = DEPT_MAP[key];
    const variants = [
      key,
      key.replace("-", " "),
      key.replace("'", "’"),
      key.toLowerCase(),
      key.toUpperCase(),
    ];

    variants.forEach((v) => {
      const reg = new RegExp(`\\b${v}\\b`, "gi");
      text = text.replace(reg, name);
    });
  }

  return text;
}

function processAll(inputDir, outputDir) {
  fs.ensureDirSync(outputDir);
  const files = glob.sync(`${inputDir}/**/*.{html,htm,md}`);

  files.forEach((file) => {
    const txt = fs.readFileSync(file, "utf-8");
    const cleaned = normalizeText(txt);
    const out = file.replace(inputDir, outputDir);
    fs.ensureDirSync(path.dirname(out));
    fs.writeFileSync(out, cleaned);
    console.log("✓ normalized:", path.basename(file));
  });
}

if (require.main === module) {
  const inputDir = process.argv[2];
  const outputDir = process.argv[3];
  if (!inputDir || !outputDir) {
    console.error("Usage: node normalizeAndFixNames.js <inputDir> <outputDir>");
    process.exit(1);
  }
  processAll(inputDir, outputDir);
}
