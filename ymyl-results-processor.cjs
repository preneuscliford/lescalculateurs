/**
 * YMYL Results Processor - Traite les pages de resultat des simulateurs
 * Ajoute bandeaux, FAQ schema, verbalisation sans toucher au backend
 */

const fs = require("fs");
const path = require("path");

// Configuration
const SOURCE_DIR = "src/pages";
const TARGET_DIR = "pages_YMYL_SAFE";
const REPORT_FILE = "YMYL_RESULT_REPORT.csv";

// Compteurs
const stats = {
  filesProcessed: 0,
  stickyBanners: 0,
  faqSchemas: 0,
  verbalizedLegends: 0,
  officielButtons: 0,
};

// Rapport CSV
const reportLines = [
  "fichier,simulateur_type,has_sticky_banner,has_faq_schema,has_verbalized_legend,has_officiel_link,backend_chiffre_kept,h1_unchanged,action_done",
];

// Detection des types de simulateurs par patterns
const SIMULATOR_PATTERNS = {
  APL: {
    patterns: [
      "APL estimee",
      "aide au logement",
      "montant APL",
      "apl_estimee",
      "apl-brute",
      "loyer plafond",
    ],
    officielUrl: "https://www.caf.fr",
    officielText: "CAF",
    faqQuestion: "Comment obtenir le montant exact de mon APL ?",
    faqAnswer:
      "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif d aide au logement.",
  },
  IMPOT: {
    patterns: [
      "Impot a payer",
      "reduction d impot",
      "montant IR",
      "irBrut",
      "impot-revenu",
      "tranche imposition",
    ],
    officielUrl: "https://www.impots.gouv.fr",
    officielText: "impots.gouv.fr",
    faqQuestion: "Comment calculer mon impot sur le revenu exact ?",
    faqAnswer:
      "Utilisez le simulateur officiel des impots pour connaitre votre montant d impot definitif.",
  },
  NOTAIRE: {
    patterns: [
      "Total frais de notaire",
      "% du prix",
      "emoluments",
      "droits mutation",
      "frais-notaire",
      "total-notaire",
    ],
    officielUrl: "https://www.notaires.fr",
    officielText: "notaires.fr",
    faqQuestion: "Comment connaitre le montant exact des frais de notaire ?",
    faqAnswer:
      "Consultez un notaire ou utilisez les outils officiels des Notaires de France pour une estimation precise.",
  },
  IK: {
    patterns: [
      "Indemnites kilometriques",
      "bareme IK",
      "0,502",
      "ik-calculator",
      "frais kilometriques",
    ],
    officielUrl: "https://www.impots.gouv.fr",
    officielText: "impots.gouv.fr",
    faqQuestion: "Quel est le bareme officiel des indemnites kilometriques ?",
    faqAnswer:
      "Consultez le bareme fiscal officiel sur impots.gouv.fr pour connaitre les taux applicables a votre situation.",
  },
  RSA: {
    patterns: [
      "montant RSA",
      "RSA estime",
      "revenu solidarite",
      "rsa-montant",
      "montantEstime",
    ],
    officielUrl: "https://www.caf.fr",
    officielText: "CAF",
    faqQuestion: "Comment connaitre le montant exact de mon RSA ?",
    faqAnswer:
      "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif de RSA.",
  },
  PRIME: {
    patterns: [
      "Prime estimee",
      "Prime d activite",
      "prime-activite",
      "montant prime",
    ],
    officielUrl: "https://www.caf.fr",
    officielText: "CAF",
    faqQuestion: "Comment connaitre le montant exact de ma Prime d activite ?",
    faqAnswer:
      "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif de Prime d activite.",
  },
  SALAIRE: {
    patterns: [
      "Salaire net",
      "brut net",
      "salaire-calculator",
      "net-apres-impot",
    ],
    officielUrl: "https://www.impots.gouv.fr",
    officielText: "impots.gouv.fr",
    faqQuestion: "Comment calculer mon salaire net exact ?",
    faqAnswer:
      "Utilisez les simulateurs officiels pour connaitre votre salaire net apres deduction des cotisations et impots.",
  },
  PRET: {
    patterns: [
      "Mensualite",
      "capacite emprunt",
      "taux endettement",
      "pret-calculator",
      "mensualite-pret",
    ],
    officielUrl: "https://www.economie.gouv.fr",
    officielText: "economie.gouv.fr",
    faqQuestion: "Comment connaitre ma capacite d emprunt exacte ?",
    faqAnswer:
      "Consultez un etablissement bancaire ou un courtier pour une simulation de pret precise.",
  },
  TAXE: {
    patterns: [
      "Taxe fonciere",
      "montant taxe",
      "taxe-calculator",
      "valeur locative",
    ],
    officielUrl: "https://www.impots.gouv.fr",
    officielText: "impots.gouv.fr",
    faqQuestion: "Comment connaitre le montant exact de ma taxe fonciere ?",
    faqAnswer:
      "Consultez votre avis d imposition ou contactez le centre des impots fonciers de votre commune.",
  },
  PLUSVALUE: {
    patterns: [
      "Plus-value",
      "abattement",
      "calcul plus-value",
      "plusvalue-calculator",
    ],
    officielUrl: "https://www.impots.gouv.fr",
    officielText: "impots.gouv.fr",
    faqQuestion: "Comment calculer ma plus-value immobiliere exacte ?",
    faqAnswer:
      "Consultez un notaire ou le site des impots pour un calcul precis de votre plus-value immobiliere.",
  },
};

// Detecter le type de simulateur
function detectSimulatorType(content) {
  const lowerContent = content.toLowerCase();

  for (const [type, config] of Object.entries(SIMULATOR_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (lowerContent.includes(pattern.toLowerCase())) {
        return { type, config };
      }
    }
  }

  return { type: "AUTRE", config: null };
}

// Ajouter bandeau sticky YMYL
function addStickyBanner(content, config) {
  if (!config) return { content, added: false };

  const banner =
    '<div class="sticky-ymyl" role="alert" style="position:sticky;top:0;z-index:9999;background:#fff3cd;border:1px solid #ffc107;padding:12px 16px;text-align:center;font-size:14px;"><strong>⚠️ Estimation indicative.</strong> Montant definitif sur <a href="' +
    config.officielUrl +
    '" target="_blank" rel="noopener" style="color:#856404;text-decoration:underline;font-weight:bold;">' +
    config.officielText +
    '</a> ou <a href="/simulateur" style="color:#856404;text-decoration:underline;">simulateur officiel</a>.</div>';

  let modified = content;

  if (content.includes("<body")) {
    modified = content.replace(/(<body[^>]*>)/i, "$1\n" + banner + "\n");
    return { content: modified, added: true };
  }

  return { content, added: false };
}

// Ajouter schema FAQPage JSON-LD
function addFAQSchema(content, config) {
  if (!config) return { content, added: false };

  const jsonldRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>/i;
  const microdataRegex =
    /itemscope[^>]*itemtype=["']https?:\/\/schema\.org\/FAQPage["']|itemtype=["']https?:\/\/schema\.org\/FAQPage["']/i;

  // Si un schema FAQ existe déjà (JSON-LD ou microdata), ne rien faire
  if (jsonldRegex.test(content) || microdataRegex.test(content)) {
    return { content, added: false };
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: config.faqQuestion,
        acceptedAnswer: {
          "@type": "Answer",
          text: config.faqAnswer,
        },
      },
    ],
  };

  const schemaScript =
    '<script type="application/ld+json">\n' +
    JSON.stringify(schema, null, 2) +
    "\n</script>";

  if (content.includes("</head>")) {
    const modified = content.replace("</head>", schemaScript + "\n</head>");
    return { content: modified, added: true };
  }

  return { content, added: false };
}

// Verbaliser les legendes d affichage
function verbalizeLegend(content, type) {
  let modified = content;
  let count = 0;

  // Ajouter "environ" avant les montants affiches dans les spans/strong de resultat
  const resultPatterns = [
    /(<span[^>]*class="[^"]*result[^"]*"[^>]*>)([\d\s]+)(\s*€)/gi,
    /(<strong[^>]*>)([\d\s]+)(\s*€\s*\/\s*mois)(<\/strong>)/gi,
    /(<div[^>]*class="[^"]*montant[^"]*"[^>]*>.*?)([\d\s]+)(\s*€)/gi,
  ];

  for (const pattern of resultPatterns) {
    const before = modified;
    modified = modified.replace(pattern, "$1environ $2$3");
    if (modified !== before) count++;
  }

  return { content: modified, count };
}

// Ajouter bouton simulateur officiel
function addOfficielButton(content, config) {
  if (!config) return { content, added: false };

  const button =
    '<div class="ymyl-officiel-btn" style="text-align:center;margin:20px 0;"><a class="btn-officiel" href="' +
    config.officielUrl +
    '" target="_blank" rel="noopener" style="display:inline-block;background:#007bff;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;">👉 Simulateur officiel ' +
    config.officielText +
    '</a><p style="font-size:12px;color:#666;margin-top:8px;">Pour un calcul definitif conforme aux baremes officiels</p></div>';

  if (content.includes("</body>")) {
    const modified = content.replace("</body>", button + "\n</body>");
    return { content: modified, added: true };
  }

  return { content, added: false };
}

// Process un fichier
function processFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { type, config } = detectSimulatorType(content);

    if (type === "AUTRE") {
      const targetPath = path.join(TARGET_DIR, relativePath);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir))
        fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, content, "utf-8");
      return null;
    }

    let modified = content;
    let hasSticky = false;
    let hasFAQ = false;
    let hasVerbalized = false;
    let hasButton = false;

    const bannerResult = addStickyBanner(modified, config);
    modified = bannerResult.content;
    hasSticky = bannerResult.added;
    if (hasSticky) stats.stickyBanners++;

    const faqResult = addFAQSchema(modified, config);
    modified = faqResult.content;
    hasFAQ = faqResult.added;
    if (hasFAQ) stats.faqSchemas++;

    const verbalResult = verbalizeLegend(modified, type);
    modified = verbalResult.content;
    hasVerbalized = verbalResult.count > 0;
    if (hasVerbalized) stats.verbalizedLegends += verbalResult.count;

    const buttonResult = addOfficielButton(modified, config);
    modified = buttonResult.content;
    hasButton = buttonResult.added;
    if (hasButton) stats.officielButtons++;

    const targetPath = path.join(TARGET_DIR, relativePath);
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, modified, "utf-8");

    stats.filesProcessed++;

    return [
      relativePath,
      type,
      hasSticky ? "OUI" : "NON",
      hasFAQ ? "OUI" : "NON",
      hasVerbalized ? "OUI" : "NON",
      hasButton ? "OUI" : "NON",
      "OUI",
      "OUI",
      "Bandeau YMYL + FAQ schema + verbalisation " + type,
    ].join(",");
  } catch (error) {
    console.error("✗ Erreur sur " + filePath + ":", error.message);
    return null;
  }
}

// Parcourir recursivement
const walkDir = (dir, relativeDir = "") => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(relativeDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, relativePath);
    } else if (file.endsWith(".html")) {
      const reportLine = processFile(fullPath, relativePath);
      if (reportLine) reportLines.push(reportLine);
    }
  }
};

// Main
console.log("🚀 Demarrage du traitement YMYL des pages de resultat...\n");

walkDir(SOURCE_DIR);

fs.writeFileSync(REPORT_FILE, reportLines.join("\n"), "utf-8");

console.log("\n" + "=".repeat(70));
console.log("📊 RECAPITULATIF YMYL RESULTS PROCESSOR");
console.log("=".repeat(70));
console.log("Pages de simulateurs traitees: " + stats.filesProcessed);
console.log("Bandeaux sticky ajoutes: " + stats.stickyBanners);
console.log("FAQ schemas ajoutes: " + stats.faqSchemas);
console.log("Legendes verbalisees: " + stats.verbalizedLegends);
console.log("Boutons officiels ajoutes: " + stats.officielButtons);
console.log("\n📁 Fichiers generes:");
console.log("  - Dossier: " + TARGET_DIR + "/");
console.log("  - Rapport: " + REPORT_FILE);
console.log("\n3 lignes-cles du CSV:");
console.log(reportLines.slice(0, Math.min(4, reportLines.length)).join("\n"));
console.log("\n✅ Traitement termine !");
