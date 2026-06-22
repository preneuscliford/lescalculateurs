"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const DATA_DIR = path.join(repoRoot, "data");
const CONTENT_DIR = path.join(repoRoot, "content");

// ─── Load project data ─────────────────────────────────────────
function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadExistingContent() {
  const existing = {};
  const dirs = ["actualites", "guides"];
  for (const dir of dirs) {
    const dirPath = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(dirPath, file), "utf8").replace(/\r\n/g, "\n");
      const match = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!match) continue;
      const fm = {};
      for (const line of match[1].split("\n")) {
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        const val = line
          .slice(idx + 1)
          .trim()
          .replace(/^"(.*)"$/, "$1");
        fm[key] = val;
      }
      existing[fm.slug || file.replace(".md", "")] = fm;
    }
  }
  return existing;
}

// ─── Core themes and their research angles ─────────────────────
const THEMES = {
  rsa: {
    name: "RSA",
    keywords: ["RSA", "Revenu de Solidarité Active", "CAF", "minima sociaux", "allocations"],
    angles: [
      "Nouveaux montants RSA {year}",
      "RSA et reprise d'emploi : cumul salaire",
      "RSA pour les 18-25 ans : conditions 2026",
      "RSA et APL : calcul cumul",
      "Fin de droits chômage et bascule RSA",
      "RSA majoré : conditions et montants",
      "RSA et pension alimentaire : déclaration",
      "RSA et hébergement à titre gratuit",
    ],
    searchQueries: [
      "RSA 2026 2027 montants site:service-public.fr",
      "RSA revalorisation site:caf.fr",
      "RSA nouveaux montants after:2026-01-01",
      "réforme RSA 2026 2027",
      "RSA conditions 2026",
    ],
    barometres: ["montantForfaitaireBase", "coefficientsFoyer", "forfaitLogement"],
  },
  "prime-activite": {
    name: "Prime d'activité",
    keywords: ["Prime d'activité", "complément de revenus", "CAF", "travailleurs modestes"],
    angles: [
      "Prime d'activité {year} : nouveaux montants",
      "Comment calculer sa prime d'activité",
      "Prime d'activité et temps partiel",
      "Prime d'activité et auto-entrepreneur",
      "Différence RSA et Prime d'activité",
      "Prime d'activité majorée : qui y a droit ?",
      "Prime d'activité et alternance",
      "Simulation prime d'activité pour un couple",
    ],
    searchQueries: [
      "Prime d'activité 2026 2027 montants site:caf.fr",
      "prime activité revalorisation after:2026-01-01",
      "prime activité calcul site:service-public.fr",
      "bonification prime activité 2026",
    ],
    barometres: ["montantForfaitaire", "bonification", "forfaitLogement"],
  },
  apl: {
    name: "APL / Aides au logement",
    keywords: ["APL", "aide personnalisée au logement", "CAF", "loyer", "zone"],
    angles: [
      "APL {year} : nouveaux plafonds de loyer",
      "APL étudiant : conditions et montants",
      "APL et colocation : calcul",
      "APL accession : aide à l'achat",
      "APL et résidence principale : conditions",
      "Réforme APL contemporanéisation",
      "APL DOM-TOM : montants spécifiques",
      "Cumul APL et RSA : calcul complet",
    ],
    searchQueries: [
      "APL 2026 2027 plafonds site:caf.fr",
      "aide au logement réforme after:2026-01-01",
      "APL zones 1 2 3 2026",
      "plafond loyer APL 2026",
    ],
    barometres: ["plafondsLoyer", "multiplicateursRegion", "moteur"],
  },
  salaires: {
    name: "Salaires",
    keywords: ["SMIC", "salaire brut net", "cotisations", "URSSAF", "pouvoir d'achat"],
    angles: [
      "SMIC {year} : nouveau montant brut et net",
      "Salaire brut en net : le calcul complet",
      "Salaire net après impôt à la source",
      "Cotisations salariales {year} : ce qui change",
      "Augmentation de salaire : négocier en {year}",
      "Salaire minimum conventionnel vs SMIC",
      "Heures supplémentaires : majorations et défiscalisation",
      "Salaire apprenti et alternant {year}",
    ],
    searchQueries: [
      "SMIC 2026 2027 montant site:service-public.fr",
      "revalorisation SMIC after:2026-01-01",
      "cotisations salariales 2026 URSSAF",
      "salaire brut net calcul 2026",
    ],
    barometres: [],
  },
  impots: {
    name: "Impôts",
    keywords: ["impôt sur le revenu", "barème", "déclaration", "prélèvement à la source", "taxe"],
    angles: [
      "Barème impôt {year} : nouvelles tranches",
      "Déclaration impôts {year} : dates et nouveautés",
      "Crédits d'impôt {year} : ce qui change",
      "Prélèvement à la source : comprendre son taux",
      "Impôt et plus-value immobilière",
      "IFI {year} : barème et déclaration",
      "Taxe foncière {year} : ce qui augmente",
      "Défiscalisation immobilière : dispositifs {year}",
    ],
    searchQueries: [
      "barème impôt 2026 2027 site:impots.gouv.fr",
      "impôt sur le revenu nouveau barème after:2026-01-01",
      "taxe foncière 2026 augmentation",
      "crédit impôt 2026 site:service-public.fr",
    ],
    barometres: [],
  },
  logement: {
    name: "Logement",
    keywords: ["prêt immobilier", "taux", "crédit", "accession", "logement social"],
    angles: [
      "Taux immobilier {year} : où en est-on ?",
      "Prêt à taux zéro {year} : conditions",
      "Capacité d'emprunt : comment la calculer",
      "Taux d'endettement 35% : explication",
      "Aides à l'achat immobilier {year}",
      "Garantie Visale : conditions et plafonds",
      "Location : droits et aides en {year}",
      "Investissement locatif : dispositifs fiscaux",
    ],
    searchQueries: [
      "taux crédit immobilier 2026 2027",
      "prêt taux zéro 2026 conditions",
      "PTZ 2026 site:service-public.fr",
      "aide accession logement 2026",
    ],
    barometres: [],
  },
  alternance: {
    name: "Alternance",
    keywords: ["alternance", "apprentissage", "contrat pro", "rémunération", "formation"],
    angles: [
      "Salaire apprenti {year} : grille complète",
      "Aides à l'embauche d'un alternant {year}",
      "Contrat de professionnalisation vs apprentissage",
      "Alternance après 30 ans : est-ce possible ?",
      "Aides aux employeurs d'alternants {year}",
      "Rupture de contrat d'alternance : droits",
      "Alternance et CAF : cumul aides",
    ],
    searchQueries: [
      "salaire apprenti 2026 2027 grille",
      "aide embauche alternant 2026",
      "rémunération alternance site:service-public.fr",
      "contrat apprentissage salaire 2026",
    ],
    barometres: [],
  },
};

// ─── Research brief generator ──────────────────────────────────
function generateResearchBrief(themeKey, theme, existing) {
  const year = new Date().getFullYear();
  const lines = [];

  lines.push("=".repeat(70));
  lines.push("  RECHERCHE : " + theme.name.toUpperCase());
  lines.push("=".repeat(70));
  lines.push("");
  lines.push("Thème : " + theme.name);
  lines.push("Mots-clés : " + theme.keywords.join(", "));
  lines.push("");

  // Existing content
  const existingForTheme = Object.values(existing).filter(
    (fm) => (fm.category || "").toLowerCase() === themeKey,
  );
  if (existingForTheme.length > 0) {
    lines.push("📄 Contenus existants :");
    for (const fm of existingForTheme) {
      lines.push("  - " + fm.title + " (" + fm.type + ")");
    }
    lines.push("");
  } else {
    lines.push("📄 Aucun contenu existant pour ce thème.");
    lines.push("");
  }

  // Content angles
  lines.push("💡 Angles de contenu possibles :");
  let i = 1;
  for (const angle of theme.angles) {
    const filled = angle.replace(/\{year\}/g, String(year));
    lines.push("  " + i + ". " + filled);
    i++;
  }
  lines.push("");

  // Search queries
  lines.push("🔍 Requêtes Google / Actualités suggérées :");
  for (const q of theme.searchQueries) {
    lines.push('  → "' + q + '"');
  }
  lines.push("");

  // Data available
  if (theme.barometres && theme.barometres.length > 0) {
    lines.push("📊 Barèmes disponibles dans le projet :");
    for (const b of theme.barometres) {
      lines.push("  - src/data/social-baremes.ts → " + themeKey + "." + b);
    }
    lines.push(
      "  → Ces données peuvent être utilisées pour générer des valeurs chiffrées dans les articles.",
    );
    lines.push("");
  }

  // Sources officielles à consulter
  lines.push("🏛️ Sources officielles à vérifier :");
  const sources = loadJSON(path.join(DATA_DIR, "monitoring-calendar.json"));
  const relevantSources = (sources.sources_officielles || []).filter((s) => {
    const calc = s.calculator || "";
    return calc.includes(themeKey) || calc === themeKey;
  });
  if (relevantSources.length > 0) {
    for (const src of relevantSources) {
      lines.push("  - " + src.name + " : " + src.url);
    }
  } else {
    lines.push("  - service-public.fr");
    lines.push("  - caf.fr");
    lines.push("  - legifrance.gouv.fr");
  }
  lines.push("");

  // Quick article template
  lines.push("-".repeat(70));
  lines.push("  TEMPLATE FRONTMATTER (à copier dans content/)");
  lines.push("-".repeat(70));
  const slug = themeKey + "-" + year + "-actualite";
  const template = [
    "---",
    'title: "' + theme.name + " " + year + ' : à compléter"',
    'slug: "' + slug + '"',
    'category: "' + theme.name + '"',
    'type: "actualite"',
    'publishedAt: "' + new Date().toISOString().split("T")[0] + '"',
    'updatedAt: "' + new Date().toISOString().split("T")[0] + '"',
    'description: "Découvrez les dernières actualités sur ' +
      theme.name.toLowerCase() +
      " en " +
      year +
      '. Montants, conditions et changements."',
    "tags:",
  ];
  for (const kw of theme.keywords.slice(0, 6)) {
    template.push("  - " + kw.toLowerCase().replace(/\s+/g, "-"));
  }
  template.push("calculateurs:");
  template.push("  - " + themeKey);
  template.push("guides:");
  template.push("  - guide-" + themeKey + "-complet");
  template.push("actualites:");
  template.push("  - ");
  template.push("---");
  template.push("");
  template.push("# " + theme.name + " " + year + " : [Titre à compléter]");
  template.push("");
  template.push("Contenu de l'article à rédiger...");
  template.push("");
  template.push("## Sources");
  template.push("");
  template.push("- [Service Public](" + "https://www.service-public.fr" + ")");
  template.push("- [CAF](" + "https://www.caf.fr" + ")");

  return lines.join("\n") + "\n" + template.join("\n");
}

// ─── Generate all-categories summary ───────────────────────────
function generateTopicSummary(existing) {
  const year = new Date().getFullYear();
  const lines = [];

  lines.push("");
  lines.push("█".repeat(70));
  lines.push("  RECHERCHE DE SUJETS — LesCalculateurs.fr");
  lines.push(
    "  " +
      new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  );
  lines.push("█".repeat(70));
  lines.push("");

  lines.push("THÈMES PRIORITAIRES (saisonnalité & actualité) :");
  lines.push("");

  // Current month hot topics
  const month = new Date().getMonth() + 1;
  const seasonalTopics = {
    1: ["impots", "salaires"], // janvier : nouveaux barèmes
    2: ["impots", "salaires"],
    3: ["impots", "logement"], // mars : période déclaration
    4: ["impots", "logement"],
    5: ["impots", "rsa", "prime-activite"], // mai : revalorisation
    6: ["salaires", "alternance", "logement"],
    7: ["salaires", "alternance"], // juillet : SMIC
    8: ["logement", "alternance"],
    9: ["impots", "logement", "rsa"], // rentrée
    10: ["prime-activite", "apl", "logement"], // octobre : revalorisation APL
    11: ["impots", "apl", "rsa"],
    12: ["salaires", "impots", "logement"], // fin d'année
  };

  const priority = seasonalTopics[month] || Object.keys(THEMES);

  for (const key of priority) {
    const theme = THEMES[key];
    const hasContent = Object.values(existing).some(
      (fm) => (fm.category || "").toLowerCase() === key,
    );
    const status = hasContent ? "✅ Contenu existant" : "⚠️ Aucun contenu";
    lines.push("  📌 " + theme.name + " — " + status);
    lines.push("     Recherches : " + theme.searchQueries[0]);
  }

  lines.push("");
  lines.push("─────────────────────────────────────────────────────────");
  lines.push("");

  // Count existing content
  const totalExisting = Object.keys(existing).length;
  const byCategory = {};
  for (const [, fm] of Object.entries(existing)) {
    const cat = fm.category || "non-classé";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }
  lines.push("📊 DISTRIBUTION DES CONTENUS EXISTANTS :");
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    lines.push("  " + cat + " : " + count + " article(s)");
  }
  lines.push("  Total : " + totalExisting + " articles");

  lines.push("");
  lines.push("─────────────────────────────────────────────────────────");
  lines.push("");
  lines.push("📋 PROCHAINES ÉTAPES :");
  lines.push("  1. Choisir un thème ci-dessus");
  lines.push("  2. Lancer une recherche web avec les requêtes suggérées");
  lines.push("  3. Consulter les sources officielles listées");
  lines.push("  4. Utiliser le template frontmatter pour créer le fichier .md");
  lines.push("  5. Exécuter : npm run build:content");
  lines.push("");

  return lines.join("\n");
}

// ─── Main ──────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const themeArg = args[0] || "";

  const existing = loadExistingContent();

  if (themeArg && THEMES[themeArg]) {
    // Generate detailed brief for one theme
    const brief = generateResearchBrief(themeArg, THEMES[themeArg], existing);
    console.log(brief);

    // Also save to file
    const outputDir = path.join(repoRoot, "reports");
    fs.mkdirSync(outputDir, { recursive: true });
    const outPath = path.join(outputDir, "research-brief-" + themeArg + ".txt");
    fs.writeFileSync(outPath, brief, "utf8");
    console.log("\n💾 Brief sauvegardé : " + outPath);
  } else if (themeArg === "--all") {
    // Generate all briefs
    const outputDir = path.join(repoRoot, "reports");
    fs.mkdirSync(outputDir, { recursive: true });

    for (const [key, theme] of Object.entries(THEMES)) {
      const brief = generateResearchBrief(key, theme, existing);
      const outPath = path.join(outputDir, "research-brief-" + key + ".txt");
      fs.writeFileSync(outPath, brief, "utf8");
      console.log("✅ " + outPath);
    }

    // Summary
    const summary = generateTopicSummary(existing);
    const summaryPath = path.join(outputDir, "research-summary.txt");
    fs.writeFileSync(summaryPath, summary, "utf8");
    console.log("✅ " + summaryPath);
    console.log("\n" + summary);
  } else {
    // Show summary + usage
    const summary = generateTopicSummary(existing);
    console.log(summary);
    console.log("USAGE :");
    console.log(
      "  node scripts/research-topics.cjs rsa            → Brief détaillé pour le thème RSA",
    );
    console.log(
      "  node scripts/research-topics.cjs prime-activite → Brief pour la Prime d'activité",
    );
    console.log("  node scripts/research-topics.cjs --all          → Tous les briefs + résumé");
    console.log("");
    console.log("Thèmes disponibles : " + Object.keys(THEMES).join(", "));
  }
}

main();
