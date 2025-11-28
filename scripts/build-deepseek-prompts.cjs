const fs = require("fs");
const path = require("path");

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (e) {
    return null;
  }
}

// Load helper files
const repoRoot = path.resolve(__dirname, "..");
const dupSolutionPath = path.resolve(repoRoot, "dupSolution.md");
const noDupPath = path.resolve(repoRoot, "noDupplication.md");
const dupSolution = readFileSafe(dupSolutionPath) || "";
const noDup = readFileSafe(noDupPath) || "";

// Extract departements array from the generator source
const genPath = path.resolve(__dirname, "generate-departement-articles.js");
console.log("🔎 Reading generator file:", genPath);
const genSrc = readFileSafe(genPath);
if (!genSrc) {
  console.error("generate-departement-articles.js not found");
  process.exit(1);
}

const startToken = "const departements = [";
const startIdx = genSrc.indexOf(startToken);
if (startIdx === -1) {
  console.error("Could not find departements array in generator");
  process.exit(1);
}
console.log("✔ departements array start index:", startIdx);
const sliceFrom = startIdx + "const ".length; // keep start at "departements = [ ..."
// find the closing '];' after startIdx
let bracketCount = 0;
let endIdx = -1;
for (let i = startIdx; i < genSrc.length; i++) {
  const ch = genSrc[i];
  if (ch === "[") bracketCount++;
  else if (ch === "]") {
    bracketCount--;
    if (bracketCount === 0) {
      endIdx = i;
      break;
    }
  }
}
if (endIdx === -1) {
  console.error("Could not locate end of departements array");
  process.exit(1);
}
const departementsText = genSrc.slice(
  startIdx + "const departements = ".length,
  endIdx + 1
);

// Evaluate the array safely by wrapping in parentheses
let departements = null;
try {
  console.log(
    "🧪 Evaluating departementsText length:",
    departementsText.length
  );
  departements = eval(departementsText);
  console.log(
    "✅ departements evaluated, count =",
    Array.isArray(departements) ? departements.length : "N/A"
  );
} catch (e) {
  // As fallback try to replace trailing commas
  console.warn("⚠ eval failed, trying cleaned variant:", e && e.message);
  const cleaned = departementsText.replace(/,\s*\]/g, "]");
  try {
    departements = eval(cleaned);
    console.log(
      "✅ departements evaluated after cleaning, count =",
      departements.length
    );
  } catch (e2) {
    console.error("Failed to eval departements array", e2);
    process.exit(1);
  }
}

if (!Array.isArray(departements)) {
  console.error("departements parsed is not an array");
  process.exit(1);
}

const SAMPLE_COUNT = process.env.SAMPLE_COUNT
  ? Number(process.env.SAMPLE_COUNT)
  : null;
const max =
  SAMPLE_COUNT && Number.isFinite(SAMPLE_COUNT)
    ? SAMPLE_COUNT
    : departements.length;

const blocks = [
  "intro",
  "bon-a-savoir",
  "astuces-grid",
  "annuaire-sentence",
  "example-sentence",
  "faq",
];

for (let idx = 0; idx < Math.min(max, departements.length); idx++) {
  const dep = departements[idx];
  const depDir = path.resolve(
    repoRoot,
    "reports",
    "deepseek-requests",
    String(dep.code)
  );
  fs.mkdirSync(depDir, { recursive: true });
  for (const block of blocks) {
    const promptParts = [];
    promptParts.push(`Génère uniquement le bloc "${block}" pour la page "Frais de notaire 2025 – ${
      dep.nom
    } (${dep.code})".

⚠ Contraintes obligatoires (à respecter STRICTEMENT) :

❌ Interdictions absolues

Tu n'utilises AUCUNE de ces expressions :
"Au cœur de"
"Les frais de notaire varient selon…"
"L'écart entre neuf et ancien…"
"Profitez des dispositifs…"
"Optimisez…"
"Négociez…"
"Anticipez…"
"Astuces pour réduire…"
"Questions fréquentes – {département}"
"Dans ce département aux multiples visages"
"Oui, on observe des variations…"
" Certaines intercommunalités proposent…"
"Les transactions influencent les émoluments"

Tu ne réutilises AUCUNE phrase des pages Ain (01) et Aisne (02).

🧱 Style et structure

- Pour "${block}", produis un contenu unique, localisé, sans répétition.
- Style : très local, contextualisé, phrases courtes, ton neutre, vocabulaire varié.
- Pas de remplissage AI, pas de patterns répétitifs.

📏 Contraintes de longueur

- Intro : 4 à 6 lignes
- Contenu total par bloc : maximum 150 mots
- Évite les répétitions internes

🏙️ Villes à mentionner

Utilise ces 3 villes dans le contenu :
- ${dep.ville1 || "Ville principale non spécifiée"}
- ${dep.ville2 || "Ville secondaire non spécifiée"}
- Une troisième ville de ton choix dans le département

Données :
Département: ${dep.nom} (${dep.code})
Région: ${dep.region}
Prix moyen m²: ${dep.prixM2} €

Rends la sortie en HTML fragment sans balises <html> ni <script>.`);

    const out = promptParts.join("\n");
    const outPath = path.join(depDir, `${block}.txt`);
    fs.writeFileSync(outPath, out, "utf8");
  }
}

console.log(
  "✅ DeepSeek prompts written for",
  Math.min(max, departements.length),
  "departments into reports/deepseek-requests/"
);
