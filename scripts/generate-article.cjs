"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const CONTENT_DIR = path.join(repoRoot, "content");
const DATA_DIR = path.join(repoRoot, "data");

// ─── Load real barèmes data ────────────────────────────────────
function loadBaremes() {
  // Try multiple sources
  const sources = [
    path.join(repoRoot, "src", "data", "baremes.json"),
    path.join(DATA_DIR, "baremes.json"),
    path.join(repoRoot, "src", "data", "baremes.generated.json"),
  ];
  for (const src of sources) {
    if (fs.existsSync(src)) {
      return JSON.parse(fs.readFileSync(src, "utf8"));
    }
  }
  return null;
}

function loadSocialBaremes() {
  // social-baremes.ts imports from baremes.json + hardcoded values
  // We parse the .ts file directly to extract the constants
  const tsPath = path.join(repoRoot, "src", "data", "social-baremes.ts");
  if (!fs.existsSync(tsPath)) return null;

  const raw = fs.readFileSync(tsPath, "utf8");
  const data = {};

  // Extract the socialBaremes object using regex
  // RSA
  const rsaMatch = raw.match(/rsa:\s*\{([\s\S]*?)\n\s*\},\s*primeActivite:/);
  if (rsaMatch) {
    const block = rsaMatch[1];
    const baseMatch = block.match(/montantForfaitaireBase:\s*([\d.]+)/);
    const versionMatch = block.match(/version:\s*"([^"]+)"/);
    const dateMatch = block.match(/dateEffet:\s*"([^"]+)"/);
    data.rsa = {
      version: versionMatch?.[1] || "",
      dateEffet: dateMatch?.[1] || "",
      montantForfaitaireBase: baseMatch ? parseFloat(baseMatch[1]) : 0,
    };
    // Coefficients
    const coeffs = {};
    for (const key of [
      "seulSansEnfant",
      "coupleOuSeulAvec1Enfant",
      "coupleAvec1OuSeulAvec2Enfants",
      "coupleAvec2Enfants",
      "personneSupplementaire",
    ]) {
      const m = block.match(new RegExp(key + ":\\s*([\\d.]+)"));
      if (m) coeffs[key] = parseFloat(m[1]);
    }
    data.rsa.coefficientsFoyer = coeffs;
  }

  // Prime Activite
  const paMatch = raw.match(/primeActivite:\s*\{([\s\S]*?)\n\s*\},\s*asf:/);
  if (paMatch) {
    const block = paMatch[1];
    const versionMatch = block.match(/version:\s*"([^"]+)"/);
    const dateMatch = block.match(/dateEffet:\s*"([^"]+)"/);
    data.primeActivite = { version: versionMatch?.[1] || "", dateEffet: dateMatch?.[1] || "" };

    // Non majoree
    const nmMatch = block.match(/nonMajoree:\s*\{([^}]+)\}/);
    if (nmMatch) {
      const vals = {};
      for (const key of [
        "unePersonne",
        "coupleOuIsole1Enfant",
        "couple1EnfantOuIsole2Enfants",
        "couple2Enfants",
      ]) {
        const m = nmMatch[1].match(new RegExp(key + ":\\s*([\\d.]+)"));
        if (m) vals[key] = parseFloat(m[1]);
      }
      data.primeActivite.montantForfaitaire = vals;
    }

    // Bonification
    const bonifMatch = block.match(/bonification:\s*\{([^}]+)\}/);
    if (bonifMatch) {
      const vals = {};
      for (const key of ["montantMaximum", "seuilDebut", "seuilMaximum"]) {
        const m = bonifMatch[1].match(new RegExp(key + ":\\s*([\\d.]+)"));
        if (m) vals[key] = parseFloat(m[1]);
      }
      data.primeActivite.bonification = vals;
    }

    const minMatch = block.match(/montantMinimumVerse:\s*([\d.]+)/);
    if (minMatch) data.primeActivite.montantMinimum = parseFloat(minMatch[1]);
  }

  // SMIC (from baremes.ts / baremes.json)
  const baremes = loadBaremes();
  if (baremes) {
    data.baremes = baremes;
  }

  return data;
}

// ─── Format currency ───────────────────────────────────────────
function euros(val) {
  if (typeof val !== "number") return "N/A";
  return val.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function approxEuros(val) {
  if (typeof val !== "number") return "N/A";
  const approx = Math.round(val);
  return "~" + approx.toLocaleString("fr-FR") + " €";
}

// ─── Article generators by theme ───────────────────────────────
function generateRsaArticle(data, year) {
  const rsa = data.rsa;
  if (!rsa) return null;

  const base = rsa.montantForfaitaireBase;
  const coeffs = rsa.coefficientsFoyer || {};

  let content = "---\n";
  content += 'title: "RSA ' + year + ' : nouveaux montants et plafonds"\n';
  content += 'slug: "rsa-' + year + '-nouveaux-montants"\n';
  content += 'category: "RSA"\n';
  content += 'type: "actualite"\n';
  content += 'publishedAt: "' + new Date().toISOString().split("T")[0] + '"\n';
  content += 'updatedAt: "' + new Date().toISOString().split("T")[0] + '"\n';
  content +=
    'description: "Découvrez les montants officiels du RSA en ' +
    year +
    ' mis à jour. Forfait de base, coefficients familiaux, plafonds de ressources."\n';
  content += "tags:\n";
  content += "  - rsa\n";
  content += "  - aides-sociales\n";
  content += "  - caf\n";
  content += "  - revenu-solidarite-active\n";
  content += "calculateurs:\n";
  content += "  - rsa\n";
  content += "  - prime-activite\n";
  content += "  - apl\n";
  content += "guides:\n";
  content += "  - comment-calculer-son-rsa\n";
  content += "  - prime-activite-guide-complet\n";
  content += "actualites:\n";
  content += "  - salaire-brut-net-juin-2026\n";
  content += "---\n\n";

  content += "# RSA " + year + " : montants officiels et plafonds\n\n";
  content +=
    "Données issues de la revalorisation officielle des prestations sociales (version " +
    (rsa.version || year) +
    ").\n\n";
  content += "## Montant forfaitaire de base\n\n";
  content +=
    "Le montant forfaitaire du RSA pour une personne seule est de **" +
    euros(base) +
    "** par mois.\n\n";
  content += "| Situation familiale | Coefficient | Montant mensuel |\n";
  content += "| ------------------- | ----------- | --------------- |\n";

  const situations = [
    { label: "Personne seule", key: "seulSansEnfant" },
    { label: "Couple ou parent isolé avec 1 enfant", key: "coupleOuSeulAvec1Enfant" },
    {
      label: "Couple avec 1 enfant ou parent isolé avec 2 enfants",
      key: "coupleAvec1OuSeulAvec2Enfants",
    },
    { label: "Couple avec 2 enfants", key: "coupleAvec2Enfants" },
    { label: "Par personne supplémentaire", key: "personneSupplementaire", isAddon: true },
  ];

  for (const s of situations) {
    const coeff = coeffs[s.key] || 0;
    const montant = Math.round(base * coeff * 100) / 100;
    const coeffStr = s.isAddon ? "+" + coeff : String(coeff);
    content += "| " + s.label + " | " + coeffStr + " | " + euros(montant) + " |\n";
  }

  content +=
    "\n> Ces montants sont calculés automatiquement depuis les barèmes officiels (" +
    rsa.version +
    ").\n\n";
  content += "## Source des données\n\n";
  content += "Ces montants proviennent de la revalorisation annuelle des prestations sociales.\n";
  content += "Le montant définitif est calculé par la CAF ou la MSA selon votre situation.\n\n";
  content += "Utilisez notre simulateur RSA gratuit pour estimer vos droits.\n";

  return content;
}

function generatePrimeActiviteArticle(data, year) {
  const pa = data.primeActivite;
  if (!pa || !pa.montantForfaitaire) return null;

  const mf = pa.montantForfaitaire;
  const bonif = pa.bonification || {};
  const min = pa.montantMinimum || 15;

  let content = "---\n";
  content += "title: \"Prime d'activité " + year + ' : montants, calcul et conditions"\n';
  content += 'slug: "prime-activite-' + year + '-montants"\n';
  content += 'category: "Prime d\'activité"\n';
  content += 'type: "actualite"\n';
  content += 'publishedAt: "' + new Date().toISOString().split("T")[0] + '"\n';
  content += 'updatedAt: "' + new Date().toISOString().split("T")[0] + '"\n';
  content +=
    "description: \"Prime d'activité " +
    year +
    " : montants actualisés, bonification individuelle, conditions d'éligibilité. Données issues des barèmes officiels.\"\n";
  content += "tags:\n";
  content += "  - prime-activite\n";
  content += "  - caf\n";
  content += "  - aides-sociales\n";
  content += "calculateurs:\n";
  content += "  - prime-activite\n";
  content += "  - rsa\n";
  content += "  - salaire\n";
  content += "guides:\n";
  content += "  - prime-activite-guide-complet\n";
  content += "actualites:\n";
  content += "  - rsa-2027-nouveaux-montants\n";
  content += "---\n\n";

  content += "# Prime d'activité " + year + " : montants et conditions\n\n";
  content += "Données actualisées — version " + (pa.version || year) + ".\n\n";
  content += "## Montants forfaitaires (non majorés)\n\n";
  content += "| Situation | Montant mensuel |\n";
  content += "| --------- | --------------- |\n";

  const labels = {
    unePersonne: "Personne seule",
    coupleOuIsole1Enfant: "Couple ou isolé avec 1 enfant",
    couple1EnfantOuIsole2Enfants: "Couple 1 enfant ou isolé 2 enfants",
    couple2Enfants: "Couple avec 2 enfants",
  };

  for (const [key, label] of Object.entries(labels)) {
    const val = mf[key];
    if (val) content += "| " + label + " | " + euros(val) + " |\n";
  }

  content += "\n## Bonification individuelle\n\n";
  if (bonif.seuilDebut) content += "- Seuil de déclenchement : " + euros(bonif.seuilDebut) + "\n";
  if (bonif.seuilMaximum) content += "- Seuil maximum : " + euros(bonif.seuilMaximum) + "\n";
  if (bonif.montantMaximum) content += "- Montant maximum : " + euros(bonif.montantMaximum) + "\n";

  content += "\n- Montant minimum versé : " + euros(min) + "\n\n";
  content += "Utilisez notre simulateur Prime d'activité pour une estimation personnalisée.\n";

  return content;
}

function generateSalaireArticle(data, year) {
  const baremes = data.baremes;
  const smicBrutMensuel = 1801.8;
  const smicHoraire = 11.88;
  const tauxCotisations = 0.22;
  const netEstime = Math.round(smicBrutMensuel * (1 - tauxCotisations));

  let content = "---\n";
  content += 'title: "Salaire brut en net ' + year + ' : le calcul complet avec le SMIC"\n';
  content += 'slug: "salaire-brut-net-' + year + '"\n';
  content += 'category: "Salaires"\n';
  content += 'type: "actualite"\n';
  content += 'publishedAt: "' + new Date().toISOString().split("T")[0] + '"\n';
  content += 'updatedAt: "' + new Date().toISOString().split("T")[0] + '"\n';
  content +=
    'description: "Combien gagne-t-on en net avec le SMIC ' +
    year +
    ' ? Calcul brut → net, charges salariales, prélèvement à la source. Tableau complet et simulateur."\n';
  content += "tags:\n";
  content += "  - salaire\n";
  content += "  - brut-net\n";
  content += "  - smic\n";
  content += "  - cotisations\n";
  content += "  - prelevement-source\n";
  content += "calculateurs:\n";
  content += "  - salaire\n";
  content += "  - impot\n";
  content += "  - prime-activite\n";
  content += "guides:\n";
  content += "  - comment-calculer-son-rsa\n";
  content += "actualites:\n";
  content += "  - rsa-2027-nouveaux-montants\n";
  content += "---\n\n";

  content += "# Salaire brut en net " + year + " : calcul SMIC et charges\n\n";
  content += "## Le SMIC en " + year + "\n\n";
  content += "Le SMIC mensuel brut est de **" + euros(smicBrutMensuel) + "** pour 35h/semaine.\n\n";
  content += "| Type | Brut | Net estimé |\n";
  content += "| ---- | ---- | ---------- |\n";
  content += "| Mensuel 35h | " + euros(smicBrutMensuel) + " | " + approxEuros(netEstime) + " |\n";
  content +=
    "| Horaire | " + euros(smicHoraire) + " | " + approxEuros(smicHoraire * 0.78) + " |\n\n";

  content += "## Décomposition des cotisations (" + Math.round(tauxCotisations * 100) + "%)\n\n";
  content += "| Cotisation | Part salariale |\n";
  content += "| ---------- | -------------- |\n";
  content += "| CSG non déductible | 2,40 % |\n";
  content += "| CSG déductible | 6,80 % |\n";
  content += "| CRDS | 0,50 % |\n";
  content += "| Assurance vieillesse | 6,90 % |\n";
  content += "| Maladie | 0,75 % |\n";
  content += "| Chômage | 3,20 % |\n";
  content += "| Retraite complémentaire | 4,01 % |\n";
  content += "| **Total** | **~" + Math.round(tauxCotisations * 100) + "%** |\n\n";

  content += "## Formule simplifiée\n\n";
  content += "```\nSalaire net ≈ Salaire brut × " + (1 - tauxCotisations).toFixed(2) + "\n```\n\n";
  content += "Utilisez notre simulateur salaire brut/net pour un calcul précis.\n";

  return content;
}

// ─── Main ──────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const themeArg = args[0] || "";
  const typeArg = args[1] || "actualite";
  const year = args[2] || String(new Date().getFullYear());

  if (!themeArg) {
    console.log("Usage: node scripts/generate-article.cjs <theme> [actualite|guide] [year]");
    console.log("Themes: rsa, prime-activite, salaire, impots, logement, alternance, apl");
    console.log("");
    console.log("Lit les donnees reelles de src/data/social-baremes.ts et baremes.json");
    console.log("pour generer un article avec les vrais montants.");
    return;
  }

  const data = loadSocialBaremes();
  if (!data) {
    console.log("Impossible de charger les barèmes.");
    return;
  }

  console.log("Barèmes chargés :");
  if (data.rsa)
    console.log(
      "  RSA v" + data.rsa.version + " - base: " + euros(data.rsa.montantForfaitaireBase),
    );
  if (data.primeActivite) console.log("  Prime Activité v" + data.primeActivite.version);
  console.log("");

  let article = null;
  switch (themeArg) {
    case "rsa":
      article = generateRsaArticle(data, year);
      break;
    case "prime-activite":
      article = generatePrimeActiviteArticle(data, year);
      break;
    case "salaire":
      article = generateSalaireArticle(data, year);
      break;
    default:
      console.log(
        "Theme '" + themeArg + "' pas encore supporte. Themes dispo: rsa, prime-activite, salaire",
      );
      return;
  }

  if (!article) {
    console.log("Donnees insuffisantes pour generer un article sur ce theme.");
    return;
  }

  const outputDir = typeArg === "guide" ? "guides" : "actualites";
  const slug = themeArg + "-" + year + "-genere";
  const outPath = path.join(CONTENT_DIR, outputDir, slug + ".md");

  const outDir = path.join(CONTENT_DIR, outputDir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, article, "utf8");

  console.log("Article genere : " + outPath);
  console.log("Lancer 'npm run build:content' pour le convertir en HTML.");
}

main();
