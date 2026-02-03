/**
 * YMYL/SEO Processor - Traite tous les simulateurs pour conformité YMYL et optimisation SEO
 * Usage: node ymyl-seo-processor.cjs
 */

const fs = require("fs");
const path = require("path");

// Configuration
const SOURCE_DIR = "src/pages";
const TARGET_DIR = "content_SAFE";
const REPORT_FILE = "report_YMYL_SEO.csv";

// Compteurs globaux
const stats = {
  filesProcessed: 0,
  numbersVerbalized: 0,
  schemasAdded: 0,
  internalLinksAdded: 0,
  h1Optimized: 0,
  tablesAlerted: 0,
};

// Rapport CSV
const reportLines = [
  "fichier,ancien_title,nouveau_title,YMYL_risk_level,nb_chiffres_removés,nb_chiffres_verbalisés,schema_added,internal_links_added,meta_length,h1_optimise,action_principale",
];

// Dictionnaire de verbalisation des chiffres
const verbalizeNumber = (match, context = "") => {
  stats.numbersVerbalized++;

  // Détecter le type de montant
  const isPercentage = match.includes("%");
  const isEuro = match.includes("€");
  const cleanNum = parseFloat(match.replace(/[\s€%]/g, "").replace(",", "."));

  if (isPercentage) {
    const rounded = Math.round(cleanNum);
    const lower = Math.max(0, rounded - 1);
    const upper = rounded + 1;
    return `environ ${lower} à ${upper} %`;
  }

  if (isEuro) {
    if (cleanNum < 100) {
      return "un montant modeste";
    } else if (cleanNum < 500) {
      return "quelques centaines d'euros";
    } else if (cleanNum < 2000) {
      return "un montant de l'ordre de quelques centaines à quelques milliers d'euros";
    } else if (cleanNum < 10000) {
      const rounded = Math.round(cleanNum / 1000);
      return `environ ${rounded - 1} à ${rounded + 1} milliers d'euros`;
    } else {
      const rounded = Math.round(cleanNum / 1000);
      return `environ ${rounded - 5} à ${rounded + 5} milliers d'euros`;
    }
  }

  return "une valeur indicative";
};

// Déterminer le niveau de risque YMYL
const getYMYLRiskLevel = (content, filename) => {
  const highRiskKeywords = [
    "apl",
    "rsa",
    "impot",
    "aah",
    "are",
    "asf",
    "prime-activite",
    "alloc",
    "caf",
    "aide",
  ];
  const medRiskKeywords = ["pret", "notaire", "plus-value", "taxe", "salaire"];

  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();

  if (
    highRiskKeywords.some(
      (k) => lowerFilename.includes(k) || lowerContent.includes(k),
    )
  ) {
    return "HIGH";
  }
  if (
    medRiskKeywords.some(
      (k) => lowerFilename.includes(k) || lowerContent.includes(k),
    )
  ) {
    return "MED";
  }
  return "LOW";
};

// Générer un title SEO optimisé
const generateTitle = (oldTitle, filename, h1Text) => {
  const year = "2026";
  const brand = "| LesCalculateurs";

  // Extraire le mot-clé principal
  let keyword = h1Text || filename.replace(/-/g, " ").replace(".html", "");
  keyword =
    keyword.charAt(0).toUpperCase() + keyword.slice(0, 40).toLowerCase();

  // Templates par type
  if (filename.includes("apl")) {
    return `Simulateur APL ${year} – Estimez votre aide au logement ${brand}`;
  }
  if (filename.includes("rsa")) {
    return `Calculateur RSA ${year} – Montant et éligibilité ${brand}`;
  }
  if (filename.includes("impot")) {
    return `Simulateur Impôt ${year} – Calculez votre revenu ${brand}`;
  }
  if (filename.includes("notaire") || filename.includes("frais-notaire")) {
    return `Frais de Notaire ${year} – Estimation gratuite ${brand}`;
  }
  if (filename.includes("pret")) {
    return `Simulateur Prêt Immo ${year} – Mensualités ${brand}`;
  }
  if (filename.includes("taxe")) {
    return `Taxe Foncière ${year} – Calculateur officiel ${brand}`;
  }
  if (filename.includes("salaire")) {
    return `Convertisseur Brut Net ${year} – Gratuit ${brand}`;
  }
  if (filename.includes("plus-value")) {
    return `Plus-Value Immo ${year} – Calculez votre gain ${brand}`;
  }

  return `${keyword.substring(0, 45)} ${year} – Simulateur ${brand}`;
};

// Générer meta description
const generateMetaDesc = (title, filename) => {
  const cta =
    "Calculez gratuitement votre estimation. Outil officiel et gratuit.";

  if (filename.includes("apl")) {
    return `Estimez votre APL 2026 avec notre simulateur officiel. ${cta} Résultat immédiat.`;
  }
  if (filename.includes("rsa")) {
    return `Calculez votre RSA 2026. Montant mensuel selon votre situation. ${cta}`;
  }
  if (filename.includes("impot")) {
    return `Simulateur impôt sur le revenu 2026. Estimez votre impôt. ${cta}`;
  }
  if (filename.includes("notaire")) {
    return `Estimez vos frais de notaire 2026 en ligne. ${cta}`;
  }
  if (filename.includes("pret")) {
    return `Calculez vos mensualités de prêt immobilier 2026. ${cta}`;
  }

  return `${title}. Outil gratuit pour estimer votre situation. Résultat immédiat.`;
};

// Générer FAQPage Schema
const generateFAQSchema = (filename, h1Text) => {
  stats.schemasAdded++;

  const faqs = [];

  // FAQ 1 - Redirection vers simulateur officiel
  faqs.push({
    q: "Où trouver le simulateur officiel pour un calcul précis ?",
    a: "Pour un calcul précis et personnalisé, utilisez le simulateur officiel sur le site de la CAF (caf.fr) ou notre outil de simulation intégré. Ces simulateurs prennent en compte votre situation exacte.",
  });

  // FAQ 2 - Estimation vs calcul exact
  faqs.push({
    q: "Quelle différence entre une estimation et un calcul officiel ?",
    a: "Une estimation vous donne un ordre de grandeur basé sur des situations types. Le calcul officiel utilise vos données personnelles exactes (revenus, composition familiale, localisation) pour un résultat précis.",
  });

  // FAQ 3 - Mise à jour des montants
  faqs.push({
    q: "Les montants présentés sont-ils à jour pour 2026 ?",
    a: "Les montants sont régulièrement mis à jour selon les barèmes officiels 2026. Cependant, seul le simulateur officiel garantit le montant exact de votre droit.",
  });

  // FAQ 4 - Éligibilité
  if (filename.includes("apl")) {
    faqs.push({
      q: "Qui est éligible à l'APL en 2026 ?",
      a: "L'APL est destinée aux locataires modestes dans le parc privé ou conventionné. L'éligibilité dépend de vos ressources, du loyer et de la zone géographique.",
    });
  } else if (filename.includes("rsa")) {
    faqs.push({
      q: "Qui peut toucher le RSA en 2026 ?",
      a: "Le RSA s'adresse aux personnes sans ressources ou aux ressources insuffisantes, âgées d'au moins 25 ans (sous conditions pour les 18-25 ans).",
    });
  } else if (filename.includes("impot")) {
    faqs.push({
      q: "Comment calculer son impôt sur le revenu 2026 ?",
      a: "L'impôt se calcule par tranches progressives. Notre simulateur vous donne une estimation, mais la déclaration officielle détermine le montant final.",
    });
  } else {
    faqs.push({
      q: "Comment interpréter les résultats de simulation ?",
      a: "Les résultats sont indicatifs et basés sur les barèmes en vigueur. Pour une décision administrative, consultez les services compétents ou utilisez le simulateur officiel.",
    });
  }

  const faqItems = faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  };

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
};

// Détecter présence de FAQPage (JSON-LD ou microdata)
const hasFAQSchema = (content) => {
  const jsonldRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>/i;
  const microdataRegex =
    /itemscope[^>]*itemtype=["']https?:\/\/schema\.org\/FAQPage["']|itemtype=["']https?:\/\/schema\.org\/FAQPage["']/i;
  return jsonldRegex.test(content) || microdataRegex.test(content);
};

// Déterminer les liens internes
const getInternalLinks = (filename) => {
  const links = [];

  if (filename.includes("apl")) {
    links.push('<a href="/simulateurs">Tous nos simulateurs</a>');
    links.push('<a href="/aide">Aides au logement</a>');
  } else if (filename.includes("rsa")) {
    links.push('<a href="/simulateurs">Tous nos simulateurs</a>');
    links.push('<a href="/aide">Aides sociales</a>');
  } else if (filename.includes("impot")) {
    links.push('<a href="/simulateurs">Simulateurs fiscaux</a>');
    links.push('<a href="/salaire">Salaire et fiscalité</a>');
  } else if (
    filename.includes("notaire") ||
    filename.includes("frais-notaire")
  ) {
    links.push('<a href="/pret">Prêt immobilier</a>');
    links.push('<a href="/plusvalue">Plus-value immobilière</a>');
  } else if (filename.includes("pret")) {
    links.push('<a href="/notaire">Frais de notaire</a>');
    links.push('<a href="/plusvalue">Plus-value</a>');
  } else if (filename.includes("taxe")) {
    links.push('<a href="/notaire">Frais de notaire</a>');
    links.push('<a href="/pret">Prêt immobilier</a>');
  } else if (filename.includes("plus-value")) {
    links.push('<a href="/notaire">Frais de notaire</a>');
    links.push('<a href="/pret">Prêt immobilier</a>');
  } else if (filename.includes("salaire")) {
    links.push('<a href="/impot">Impôt sur le revenu</a>');
    links.push('<a href="/simulateurs">Simulateurs</a>');
  } else {
    links.push('<a href="/simulateurs">Tous nos simulateurs</a>');
    links.push('<a href="/">Accueil</a>');
  }

  stats.internalLinksAdded += links.length;
  return `<nav class="internal-links" aria-label="Navigation interne"><ul>${links.map((l) => `<li>${l}</li>`).join("")}</ul></nav>`;
};

// Process un fichier HTML
const processFile = (filePath, relativePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const filename = path.basename(filePath);
    const oldTitleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
    const oldTitle = oldTitleMatch ? oldTitleMatch[1] : "";
    const h1Match = content.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    const h1Text = h1Match ? h1Match[1] : "";

    // Déterminer niveau YMYL
    const ymyLevel = getYMYLRiskLevel(content, filename);

    // Compteurs
    let numbersBefore = 0;
    let numbersAfter = 0;

    // 1. YMYL: Verbaliser les chiffres précis
    let processedContent = content;

    // Regex pour détecter les montants
    const moneyRegex = /\d{1,3}(?:\s?\d{3})*(?:,\d{2})?\s?€/g;
    const percentRegex = /\d{1,2}(?:[,.]\d{1,2})?\s?%/g;
    const simpleNumberRegex = /\b\d{3,6}(?:\s\d{3})*\b/g;

    // Compter avant
    numbersBefore =
      (content.match(moneyRegex) || []).length +
      (content.match(percentRegex) || []).length +
      (content.match(simpleNumberRegex) || []).length;

    // Remplacer les montants en euros (mais pas dans les inputs ou scripts)
    processedContent = processedContent.replace(
      /(<(?!script|style|input|textarea)[^>]*>[^<]*)(\d{1,3}(?:\s?\d{3})*(?:,\d{2})?\s?€)([^<]*<\/[^>]+>)/gi,
      (match, before, num, after) => {
        return before + verbalizeNumber(num) + after;
      },
    );

    // Remplacer les pourcentages
    processedContent = processedContent.replace(
      /(<(?!script|style|input|textarea)[^>]*>[^<]*)(\d{1,2}(?:[,.]\d{1,2})?\s?%)([^<]*<\/[^>]+>)/gi,
      (match, before, num, after) => {
        return before + verbalizeNumber(num) + after;
      },
    );

    // 2. YMYL: Ajouter alerte après les tableaux
    const tableRegex = /<\/table>/gi;
    let tableCount = 0;
    processedContent = processedContent.replace(tableRegex, (match) => {
      tableCount++;
      stats.tablesAlerted++;
      const alertBox = `\n<div class="ymyl-alert" role="alert">\n  <strong>Estimation indicative.</strong> Montant réel uniquement via simulateur officiel <a href="https://www.caf.fr" target="_blank" rel="noopener">CAF</a> ou <a href="/simulateur">notre outil officiel</a>.\n</div>`;
      return match + alertBox;
    });

    // 3. YMYL: Ajouter bandeau sticky après le premier <p>
    const stickyBanner = `<div class="sticky-ymyl">Cette page donne des ordres de grandeur. Pour un résultat fiable, utilisez le simulateur officiel.</div>`;
    const firstPRegex = /(<p[^>]*>.*?<\/p>)/i;
    processedContent = processedContent.replace(firstPRegex, (match) => {
      return match + "\n" + stickyBanner;
    });

    // 4. SEO: Mettre à jour le title
    const newTitle = generateTitle(oldTitle, filename, h1Text);
    processedContent = processedContent.replace(
      /<title[^>]*>[^<]*<\/title>/i,
      `<title>${newTitle}</title>`,
    );

    // 5. SEO: Mettre à jour la meta description
    const newMetaDesc = generateMetaDesc(newTitle, filename);
    const metaDescRegex = /<meta[^>]*name=["']description["'][^>]*>/i;
    const newMetaTag = `<meta name="description" content="${newMetaDesc}">`;

    if (metaDescRegex.test(processedContent)) {
      processedContent = processedContent.replace(metaDescRegex, newMetaTag);
    } else {
      // Ajouter dans le head
      processedContent = processedContent.replace(
        /<head>/i,
        `<head>\n  ${newMetaTag}`,
      );
    }

    // 6. SEO: Optimiser le H1 avec 2026
    const newH1 = h1Text
      ? `${h1Text} 2026`
      : path.basename(filename, ".html").replace(/-/g, " ");
    processedContent = processedContent.replace(
      /<h1[^>]*>[^<]*<\/h1>/i,
      `<h1>${newH1}</h1>`,
    );
    stats.h1Optimized++;

    // 7. SEO: Ajouter FAQPage Schema uniquement si absent
    const faqSchema = generateFAQSchema(filename, h1Text);
    let schemaAddedFlag = false;
    if (!hasFAQSchema(processedContent)) {
      processedContent = processedContent.replace(
        /<\/head>/i,
        `${faqSchema}\n</head>`,
      );
      schemaAddedFlag = true;
    }

    // 8. Ajouter liens internes
    const internalLinks = getInternalLinks(filename);
    processedContent = processedContent.replace(
      /<\/body>/i,
      `${internalLinks}\n</body>`,
    );

    // 9. Accessibilité: Ajouter loading="lazy" aux images
    processedContent = processedContent.replace(
      /<img(?![^>]*loading=)[^>]*>/gi,
      (match) => {
        return match.replace(/>$/, ' loading="lazy">');
      },
    );

    // Calculer nombre après
    numbersAfter =
      (processedContent.match(moneyRegex) || []).length +
      (processedContent.match(percentRegex) || []).length +
      (processedContent.match(simpleNumberRegex) || []).length;

    const numbersRemoved = numbersBefore - numbersAfter;
    const metaLength = newMetaDesc.length;
    const h1Opt = "O";
    const schemaAdded = schemaAddedFlag ? "OUI" : "NON";
    const actionMain =
      ymyLevel === "HIGH"
        ? "Verbalisation forte + Alertes multiples"
        : ymyLevel === "MED"
          ? "Verbalisation modérée + Alerte tableau"
          : "SEO optimisation + Liens internes";

    // Écrire le fichier traité
    const targetPath = path.join(TARGET_DIR, relativePath);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, processedContent, "utf-8");

    // Ajouter au rapport
    reportLines.push(
      [
        relativePath,
        `"${oldTitle.replace(/"/g, '""')}"`,
        `"${newTitle.replace(/"/g, '""')}"`,
        ymyLevel,
        numbersRemoved,
        stats.numbersVerbalized,
        schemaAdded,
        2, // liens internes ajoutés
        metaLength,
        h1Opt,
        `"${actionMain}"`,
      ].join(","),
    );

    stats.filesProcessed++;
    console.log(`✓ Traité: ${relativePath} (YMYL: ${ymyLevel})`);

    return true;
  } catch (error) {
    console.error(`✗ Erreur sur ${filePath}:`, error.message);
    return false;
  }
};

// Parcourir récursivement
const walkDir = (dir, relativeDir = "") => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(relativeDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, relativePath);
    } else if (file.endsWith(".html")) {
      processFile(fullPath, relativePath);
    }
  }
};

// Main
console.log("🚀 Démarrage du traitement YMYL/SEO...\n");

walkDir(SOURCE_DIR);

// Écrire le rapport
fs.writeFileSync(REPORT_FILE, reportLines.join("\n"), "utf-8");

// Récapitulatif
console.log("\n" + "=".repeat(60));
console.log("📊 RÉCAPITULATIF YMYL/SEO");
console.log("=".repeat(60));
console.log(`Fichiers traités: ${stats.filesProcessed}`);
console.log(`Chiffres verbalisés: ${stats.numbersVerbalized}`);
console.log(`Schémas FAQ ajoutés: ${stats.schemasAdded}`);
console.log(`Liens internes ajoutés: ${stats.internalLinksAdded}`);
console.log(`H1 optimisés: ${stats.h1Optimized}`);
console.log(`Alertes tableau ajoutées: ${stats.tablesAlerted}`);
console.log(`\n📁 Fichiers générés:`);
console.log(`  - Dossier: ${TARGET_DIR}/`);
console.log(`  - Rapport: ${REPORT_FILE}`);
console.log("\n3 lignes-clés du CSV:");
console.log(reportLines.slice(0, 4).join("\n"));
console.log("\n✅ Traitement terminé !");
