/**
 * YMYL Two Changes - Application ciblee des 2 corrections manquantes
 * 1. FAQ Schema JSON-LD (si non present)
 * 2. Verbalisation des montants affiches (wrapping HTML)
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "src/pages";
const TARGET_DIR = "pages_YMYL_FINAL";
const REPORT_FILE = "TWO_CHANGES_REPORT.csv";

const stats = {
  filesProcessed: 0,
  faqAdded: 0,
  verbalAdded: 0,
};

const reportLines = [
  "fichier,simulateur_type,faq_schema_added,verbal_legend_added,backend_kept,h1_unchanged",
];

// FAQ par type
const FAQS = {
  APL: {
    q: "Comment obtenir le montant exact de mon APL ?",
    a: "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif d aide au logement.",
  },
  IMPOT: {
    q: "Comment obtenir le montant exact de mon impot ?",
    a: "Utilisez le simulateur officiel de impots.gouv.fr pour connaitre votre montant definitif.",
  },
  NOTAIRE: {
    q: "Comment obtenir le montant exact de mes frais de notaire ?",
    a: "Utilisez le simulateur officiel des notaires ou consultez un notaire pour une estimation precise.",
  },
  IK: {
    q: "Comment obtenir le montant exact de mes indemnites kilometriques ?",
    a: "Utilisez le bareme officiel de impots.gouv.fr pour connaitre votre montant definitif.",
  },
  RSA: {
    q: "Comment obtenir le montant exact de mon RSA ?",
    a: "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif de RSA.",
  },
  PRIME: {
    q: "Comment obtenir le montant exact de ma Prime d activite ?",
    a: "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif.",
  },
  SALAIRE: {
    q: "Comment obtenir le montant exact de mon salaire net ?",
    a: "Utilisez les simulateurs officiels des impots et de la securite sociale pour un calcul precis.",
  },
  PRET: {
    q: "Comment obtenir le montant exact de ma mensualite ?",
    a: "Consultez votre banque ou un courtier pour une simulation de pret precise.",
  },
  TAXE: {
    q: "Comment obtenir le montant exact de ma taxe fonciere ?",
    a: "Consultez votre avis d imposition ou contactez le centre des impots fonciers de votre commune.",
  },
  PLUSVALUE: {
    q: "Comment obtenir le montant exact de ma plus-value ?",
    a: "Consultez un notaire ou le site des impots pour un calcul precis de votre plus-value immobiliere.",
  },
};

// Detection type
function detectType(content) {
  const lower = content.toLowerCase();
  if (lower.includes("apl") || lower.includes("aide-logement")) return "APL";
  if (lower.includes("impot") || lower.includes("ir-calculator"))
    return "IMPOT";
  if (lower.includes("notaire") || lower.includes("frais-notaire"))
    return "NOTAIRE";
  if (lower.includes("rsa")) return "RSA";
  if (lower.includes("prime-activite")) return "PRIME";
  if (lower.includes("salaire")) return "SALAIRE";
  if (lower.includes("pret") || lower.includes("credit-immobilier"))
    return "PRET";
  if (lower.includes("taxe-fonciere")) return "TAXE";
  if (lower.includes("plus-value")) return "PLUSVALUE";
  if (lower.includes("ik") || lower.includes("kilometrique")) return "IK";
  return "AUTRE";
}

// Verifier si FAQ existe deja (JSON-LD ou microdata)
function hasFAQSchema(content) {
  const jsonldRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>/i;
  const microdataRegex =
    /itemscope[^>]*itemtype=["']https?:\/\/schema\.org\/FAQPage["']|itemtype=["']https?:\/\/schema\.org\/FAQPage["']/i;
  return jsonldRegex.test(content) || microdataRegex.test(content);
}

// Ajouter FAQ si absent
function addFAQSchema(content, type) {
  if (hasFAQSchema(content)) return { content, added: false };
  if (!FAQS[type]) return { content, added: false };

  const faq = FAQS[type];
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      },
    ],
  };

  const scriptTag =
    '<script type="application/ld+json">\n' +
    JSON.stringify(schema, null, 2) +
    "\n</script>";

  if (content.includes("</head>")) {
    return {
      content: content.replace("</head>", scriptTag + "\n</head>"),
      added: true,
    };
  }
  return { content, added: false };
}

// Verbaliser les montants avec wrapping HTML
function verbalizeMontants(content) {
  let modified = content;
  let changes = 0;

  // Pattern 1: "APL estimee : 297 €" ou similaire
  // Remplacer par wrapping avec span
  const patterns = [
    // Pattern: <strong>297 €</strong> ou <span>297 €</span> dans bloc resultat
    {
      regex:
        /(<(strong|span|div)[^>]*class="[^"]*result[^"]*"[^>]*>[^<]*)(\d{2,4})\s*€/gi,
      replace:
        '$1<span class="result-verbal">environ $3 €</span><span class="result-exact" style="display:none;">$3 €</span>',
    },
    // Pattern: Montant affiche dans texte "297 €"
    {
      regex: /(>)(\d{2,4})(\s*€\s*<)/gi,
      replace:
        '$1<span class="result-verbal">environ $2 €</span><span class="result-exact" style="display:none;">$2 €</span>$3',
    },
  ];

  for (const p of patterns) {
    const before = modified;
    modified = modified.replace(p.regex, p.replace);
    if (modified !== before) changes++;
  }

  // Ajouter script JS pour verbaliser dynamiquement si besoin
  if (changes > 0) {
    const verbalScript = `
<script>
// Verbalisation YMYL - masquer montant exact, afficher fourchette
document.addEventListener('DOMContentLoaded', function() {
  const exactSpans = document.querySelectorAll('.result-exact');
  exactSpans.forEach(function(span) {
    const exactVal = parseInt(span.textContent);
    const verbalSpan = span.previousElementSibling;
    if (verbalSpan && verbalSpan.classList.contains('result-verbal')) {
      const rounded = Math.round(exactVal / 10) * 10;
      verbalSpan.textContent = 'environ ' + rounded + ' € – simulateur officiel pour valeur exacte';
    }
  });
});
</script>`;

    if (modified.includes("</body>")) {
      modified = modified.replace("</body>", verbalScript + "\n</body>");
    }
  }

  return { content: modified, count: changes };
}

// Process fichier
function processFile(filePath, relativePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const type = detectType(content);

    if (type === "AUTRE") {
      // Copier tel quel
      const targetPath = path.join(TARGET_DIR, relativePath);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir))
        fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, content, "utf-8");
      return null;
    }

    let faqAdded = false;
    let verbalAdded = false;

    // 1. Ajouter FAQ si absent
    const faqResult = addFAQSchema(content, type);
    content = faqResult.content;
    faqAdded = faqResult.added;
    if (faqAdded) stats.faqAdded++;

    // 2. Verbaliser montants
    const verbalResult = verbalizeMontants(content);
    content = verbalResult.content;
    verbalAdded = verbalResult.count > 0;
    if (verbalAdded) stats.verbalAdded++;

    // Ecrire fichier
    const targetPath = path.join(TARGET_DIR, relativePath);
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, content, "utf-8");

    stats.filesProcessed++;

    return [
      relativePath,
      type,
      faqAdded ? "OUI" : "NON",
      verbalAdded ? "OUI" : "NON",
      "OUI",
      "OUI",
    ].join(",");
  } catch (e) {
    console.error("Erreur:", filePath, e.message);
    return null;
  }
}

// Parcours recursif
const walkDir = (dir, relativeDir = "") => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(relativeDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, relativePath);
    } else if (file.endsWith(".html")) {
      const line = processFile(fullPath, relativePath);
      if (line) reportLines.push(line);
    }
  }
};

console.log("🚀 Traitement YMYL - 2 changements...\n");
walkDir(SOURCE_DIR);
fs.writeFileSync(REPORT_FILE, reportLines.join("\n"), "utf-8");

console.log("\n" + "=".repeat(60));
console.log("📊 RECAPITULATIF");
console.log("=".repeat(60));
console.log("Pages traitees:", stats.filesProcessed);
console.log("FAQ schemas ajoutes:", stats.faqAdded);
console.log("Legendes verbalisees:", stats.verbalAdded);
console.log("\n3 lignes du CSV:");
console.log(reportLines.slice(0, Math.min(4, reportLines.length)).join("\n"));
console.log("\n✅ Termine !");
