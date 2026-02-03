/**
 * Injection Schema FAQPage JSON-LD
 * Injecte uniquement le schema FAQPage sur toutes les pages de simulateurs
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "src/pages";
const TARGET_DIR = "pages_SCHEMA_FINAL";
const REPORT_FILE = "SCHEMA_INJECTION_REPORT.csv";

const stats = {
  processed: 0,
  added: 0,
  alreadyPresent: 0,
  noHead: 0,
};

const reportLines = [
  "fichier,simulateur_type,schema_added,already_present,head_tag_found",
];

// FAQ par type
const FAQS = {
  APL: {
    q: "Comment obtenir le montant exact de mon APL ?",
    a: "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif.",
  },
  IMPOT: {
    q: "Comment obtenir le montant exact de mon impot ?",
    a: "Utilisez le simulateur officiel de impots.gouv.fr pour connaitre votre montant definitif.",
  },
  NOTAIRE: {
    q: "Comment obtenir le montant exact de mes frais de notaire ?",
    a: "Utilisez le simulateur officiel des notaires pour connaitre votre montant definitif.",
  },
  IK: {
    q: "Comment obtenir le montant exact de mes indemnites kilometriques ?",
    a: "Utilisez le bareme officiel de impots.gouv.fr pour connaitre votre montant definitif.",
  },
  RSA: {
    q: "Comment obtenir le montant exact de mon RSA ?",
    a: "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif.",
  },
  PRIME: {
    q: "Comment obtenir le montant exact de ma prime d activite ?",
    a: "Utilisez le simulateur officiel de la CAF pour connaitre votre montant definitif.",
  },
  SALAIRE: {
    q: "Comment obtenir le montant exact de mon salaire net ?",
    a: "Utilisez les simulateurs officiels pour connaitre votre montant definitif.",
  },
  PRET: {
    q: "Comment obtenir le montant exact de ma mensualite ?",
    a: "Consultez votre banque ou un courtier pour une simulation precise.",
  },
  TAXE: {
    q: "Comment obtenir le montant exact de ma taxe ?",
    a: "Utilisez le simulateur officiel des impots pour connaitre votre montant definitif.",
  },
  PLUSVALUE: {
    q: "Comment obtenir le montant exact de ma plus-value ?",
    a: "Utilisez le simulateur officiel de impots.gouv.fr pour connaitre votre montant definitif.",
  },
};

// Detection type
function detectType(content) {
  const lower = content.toLowerCase();
  if (
    lower.includes("apl") ||
    lower.includes("aide-logement") ||
    lower.includes("caf.fr")
  )
    return "APL";
  if (
    lower.includes("impot") ||
    lower.includes("ir-") ||
    lower.includes("impots.gouv")
  )
    return "IMPOT";
  if (
    lower.includes("notaire") ||
    lower.includes("frais-notaire") ||
    lower.includes("notaires.fr")
  )
    return "NOTAIRE";
  if (lower.includes("rsa")) return "RSA";
  if (lower.includes("prime") && lower.includes("activite")) return "PRIME";
  if (lower.includes("salaire")) return "SALAIRE";
  if (
    lower.includes("pret") ||
    lower.includes("credit-immobilier") ||
    lower.includes("mensualite")
  )
    return "PRET";
  if (lower.includes("taxe-fonciere") || lower.includes("taxe habitation"))
    return "TAXE";
  if (lower.includes("plus-value") || lower.includes("plusvalue"))
    return "PLUSVALUE";
  if (
    lower.includes("ik") ||
    lower.includes("kilometrique") ||
    lower.includes("0,502")
  )
    return "IK";
  return "AUTRE";
}

// Verifier si schema FAQPage existe (JSON-LD ou microdata)
function hasFAQSchema(content) {
  const jsonldRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>/i;
  const microdataRegex =
    /itemscope[^>]*itemtype=["']https?:\/\/schema\.org\/FAQPage["']|itemtype=["']https?:\/\/schema\.org\/FAQPage["']/i;
  return jsonldRegex.test(content) || microdataRegex.test(content);
}

// Generer schema JSON
function generateSchema(type) {
  if (!FAQS[type]) return null;
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
  return (
    '<script type="application/ld+json">\n' +
    JSON.stringify(schema, null, 2) +
    "\n</script>"
  );
}

// Traiter fichier
function processFile(filePath, relativePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const type = detectType(content);

    let schemaAdded = "NON";
    let alreadyPresent = "NON";
    let headFound = "NON";

    // Verifier si head existe
    if (content.includes("<head>") || content.includes("<head ")) {
      headFound = "OUI";
    }

    // Verifier si schema deja present
    if (hasFAQSchema(content)) {
      alreadyPresent = "OUI";
      stats.alreadyPresent++;
    } else if (type !== "AUTRE" && FAQS[type]) {
      // Ajouter schema
      const schema = generateSchema(type);
      if (schema) {
        if (content.includes("</head>")) {
          content = content.replace("</head>", schema + "\n</head>");
          schemaAdded = "OUI";
          stats.added++;
        } else if (content.includes("<body>")) {
          // Creer head si absent
          content = content.replace(
            "<body>",
            "<head>\n" + schema + "\n</head>\n<body>",
          );
          schemaAdded = "OUI";
          headFound = "OUI (ajoute)";
          stats.added++;
        }
      }
    }

    // Ecrire fichier
    const targetPath = path.join(TARGET_DIR, relativePath);
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, content, "utf-8");

    stats.processed++;

    return [relativePath, type, schemaAdded, alreadyPresent, headFound].join(
      ",",
    );
  } catch (e) {
    console.error("Erreur:", filePath, e.message);
    return null;
  }
}

// Parcours
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

console.log("🚀 Injection Schema FAQPage...\n");
walkDir(SOURCE_DIR);
fs.writeFileSync(REPORT_FILE, reportLines.join("\n"), "utf-8");

console.log("\n" + "=".repeat(60));
console.log("📊 RECAPITULATIF SCHEMA INJECTION");
console.log("=".repeat(60));
console.log("Pages traitees:", stats.processed);
console.log("Schemas ajoutes:", stats.added);
console.log("Schemas deja presents:", stats.alreadyPresent);
console.log("\n3 lignes du CSV:");
console.log(reportLines.slice(0, Math.min(4, reportLines.length)).join("\n"));
console.log("\n✅ Termine !");
