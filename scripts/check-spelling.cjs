const fs = require("fs");
const path = require("path");

// Dictionnaire des VRAIES fautes d'orthographe -> correction
// Ne PAS inclure de mots corrects (faux positifs)
const FAUTES = {
  // Fautes de frappe courantes
  parmis: "parmi",
  nottament: "notamment",
  notament: "notamment",
  apartement: "appartement",
  appartment: "appartement",
  calucl: "calcul",
  calcuateur: "calculateur",
  calcualteur: "calculateur",
  simualteur: "simulateur",
  simulatuer: "simulateur",
  exoneration: "exoneration",
  exonere: "exonere",
  superiure: "superieure",
  inferiure: "inferieure",
  declaratoin: "declaration",
  proprietare: "proprietaire",
  imobillier: "immobilier",
  immobillier: "immobilier",
  immobilie: "immobilier",
  fiscall: "fiscal",
  fiscallement: "fiscalement",
  revenus: "revenus",
  revnus: "revenus",
  salrial: "salarial",
  menstuel: "mensuel",
  menusuel: "mensuel",
  annulle: "annuel",
  annuele: "annuel",
  calculle: "calcule",
  estimatoin: "estimation",
  remuneraion: "remuneration",
  rmuneration: "remuneration",
  dedutcible: "deductible",
  beneficiares: "beneficiaires",
  beneficiaire: "beneficiaire",
  prelevement: "prelevement",
  prelevements: "prelevements",
  prelevement: "prelevement",
  qulques: "quelques",
  retraîte: "retraite",
  retraîte: "retraite",
  montnat: "montant",
  montantt: "montant",
  hebergment: "hebergement",
  gratuitemnt: "gratuitement",
  apres: "apres",
  tres: "tres",
  interets: "interets",
  interets: "interets",
  interets: "interets",
  "en dessous": "en dessous",
  plsu: "plus",
  danc: "donc",
  tros: "trop",
  parceque: "parce que",
  suplementaire: "supplementaire",
  suplementaire: "supplementaire",
  emprunteu: "emprunteur",
  amortissemnt: "amortissement",
  amortisement: "amortissement",
  proprietair: "proprietaire",
  locatare: "locataire",
  "tout les": "tous les",
  "Tout les": "Tous les",
  biensur: "bien sûr",
  biensûr: "bien sûr",
  certe: "certes",
  ormis: "hormis",
  neanmoins: "neanmoins",
  neamoins: "neanmoins",
  malgres: "malgre",
  malgres: "malgre",
  election: "election",
  eventuellement: "eventuellement",
  "depend de": "depend de",
  "votre impots": "votre impot",
  "2 026": "2026",
  "2 025": "2025",
  "l ors": "lors",
  "quelque soit": "quel que soit",
  "Quelque soit": "Quel que soit",
  "quelques soit": "quel que soit",
  "moin de": "moins de",
  "impots sur le revenu": "impot sur le revenu",
  "Impots sur le revenu": "Impot sur le revenu",
  "frais de notaires": "frais de notaire",
  "Frais de notaires": "Frais de notaire",
  "au dela": "au-dela",
  "Au dela": "Au-dela",

  // Erreurs grammaticales courantes
  "Frais de notaires": "Frais de notaire",
  "frais de notaires": "frais de notaire",
  "quelque soit": "quel que soit",
  "Quelque soit": "Quel que soit",
  "taux margianl": "taux marginal",
  "taux marginale": "taux marginal",
  "impots sur le revenu": "impot sur le revenu",
  "impots sur les revenus": "impot sur le revenu",
  "Impots sur le revenu": "Impot sur le revenu",
  "taxe foncieres": "taxe fonciere",
  "taxes foncieres": "taxes foncieres",
  "taxe foncieres": "taxe fonciere",
  "taxe fonciere": "taxe fonciere",
  "au dela": "au-dela",
  "Au dela": "Au-dela",
  "moin de": "moins de",
  "moin d": "moins d",
  "moins de 25ans": "moins de 25 ans",

  // Apostrophes manquantes (attention aux faux positifs)
  "d apres": "d'apres",
  "l allocation": "l'allocation",
  "d allocation": "d'allocation",
  "s applique": "s'applique",
  "l impot": "l'impot",
  "l impot": "l'impot",
  "n est": "n'est",
  "c est": "c'est",
  "qu il": "qu'il",
  "qu elle": "qu'elle",
  "d un": "d'un",
  "d une": "d'une",
  "l un": "l'un",
  "l une": "l'une",
  "j ai": "j'ai",
  "n a": "n'a",
  "s il": "s'il",
};

// Patterns a exclure (code, URLs, etc.)
const EXCLUDE_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /<style[^>]*>[\s\S]*?<\/style>/gi,
  /href="[^"]*"/gi,
  /src="[^"]*"/gi,
  /class="[^"]*"/gi,
  /id="[^"]*"/gi,
  /data-[^=]*="[^"]*"/gi,
];

function getHtmlFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith(".html")) {
      results.push(filePath);
    }
  }
  return results;
}

function extractTextContent(html) {
  // Retirer les scripts, styles, attributs
  let text = html;
  for (const pattern of EXCLUDE_PATTERNS) {
    text = text.replace(pattern, " ");
  }
  // Retirer les balises HTML
  text = text.replace(/<[^>]+>/g, " ");
  // Decoder les entites HTML courantes
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text;
}

function findSpellingErrors(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const textContent = extractTextContent(content);
  const errors = [];

  for (const [faute, correction] of Object.entries(FAUTES)) {
    // Recherche insensible a la casse mais preserve la casse originale
    const regex = new RegExp(
      `\\b${faute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi",
    );
    let match;
    while ((match = regex.exec(textContent)) !== null) {
      errors.push({
        faute: match[0],
        correction,
        context: textContent
          .substring(
            Math.max(0, match.index - 30),
            match.index + faute.length + 30,
          )
          .trim(),
      });
    }
  }

  return errors;
}

function main() {
  const srcDir = path.resolve(__dirname, "../src/pages");
  const files = getHtmlFiles(srcDir);

  console.log(
    `🔍 Analyse orthographique de ${files.length} fichiers HTML...\n`,
  );

  const allErrors = [];

  for (const file of files) {
    const errors = findSpellingErrors(file);
    if (errors.length > 0) {
      const relativePath = path.relative(path.resolve(__dirname, ".."), file);
      allErrors.push({ file: relativePath, errors });
    }
  }

  if (allErrors.length === 0) {
    console.log("✅ Aucune erreur d'orthographe detectee !");
    return;
  }

  console.log(`⚠️ Erreurs trouvees dans ${allErrors.length} fichiers:\n`);

  for (const { file, errors } of allErrors) {
    console.log(`📄 ${file}`);
    for (const err of errors) {
      console.log(`   ❌ "${err.faute}" → "${err.correction}"`);
      console.log(`      Contexte: ...${err.context}...`);
    }
    console.log();
  }

  // Resume
  const totalErrors = allErrors.reduce(
    (sum, item) => sum + item.errors.length,
    0,
  );
  console.log(
    `\n📊 Resume: ${totalErrors} erreurs dans ${allErrors.length} fichiers`,
  );

  // Regrouper par type d'erreur
  const errorCounts = {};
  for (const { errors } of allErrors) {
    for (const err of errors) {
      const key = `${err.faute.toLowerCase()} → ${err.correction}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    }
  }

  console.log("\n📈 Erreurs les plus frequentes:");
  const sorted = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]);
  for (const [error, count] of sorted.slice(0, 10)) {
    console.log(`   ${count}x : ${error}`);
  }
}

main();
