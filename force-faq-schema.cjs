/**
 * Force FAQ Schema - Injecte le schema sur tous les fichiers
 * Verifie et corrige les schemas existants
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "src/pages";

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

function detectType(content) {
  const lower = content.toLowerCase();
  if (lower.includes("apl") || lower.includes("aide-logement")) return "APL";
  if (lower.includes("impot") || lower.includes("ir-")) return "IMPOT";
  if (lower.includes("notaire") || lower.includes("frais-notaire"))
    return "NOTAIRE";
  if (lower.includes("rsa")) return "RSA";
  if (lower.includes("prime") && lower.includes("activite")) return "PRIME";
  if (lower.includes("salaire")) return "SALAIRE";
  if (lower.includes("pret") || lower.includes("mensualite")) return "PRET";
  if (lower.includes("taxe-fonciere")) return "TAXE";
  if (lower.includes("plus-value")) return "PLUSVALUE";
  if (lower.includes("ik") || lower.includes("kilometrique")) return "IK";
  return "AUTRE";
}

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

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const type = detectType(content);

    if (type === "AUTRE") return { processed: false };

    // Si la page contient un markup microdata FAQPage, ne pas injecter de JSON-LD (éviter doublons)
    const microdataRegex =
      /itemscope[^>]*itemtype=["']https?:\/\/schema\.org\/FAQPage["']|itemtype=["']https?:\/\/schema\.org\/FAQPage["']/i;
    if (microdataRegex.test(content)) {
      return { processed: false };
    }

    // Supprimer les anciens schemas FAQPage JSON-LD s'ils existent
    content = content.replace(
      /<script type="application\/ld\+json">[\s\S]*?"@type":\s*"FAQPage"[\s\S]*?<\/script>/gi,
      "",
    );

    // Generer nouveau schema
    const schema = generateSchema(type);
    if (!schema) return { processed: false };

    // Inserer avant </head>
    if (content.includes("</head>")) {
      content = content.replace("</head>", schema + "\n</head>");
    } else if (content.includes("<body>")) {
      content = content.replace(
        "<body>",
        "<head>\n" + schema + "\n</head>\n<body>",
      );
    } else {
      return { processed: false, error: "No head or body tag" };
    }

    fs.writeFileSync(filePath, content, "utf-8");
    return { processed: true, type };
  } catch (e) {
    return { processed: false, error: e.message };
  }
}

// Traitement
console.log("🚀 Forçage FAQ Schema sur tous les simulateurs...\n");

let processed = 0;
let errors = 0;

const walkDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith(".html")) {
      const result = processFile(fullPath);
      if (result.processed) {
        processed++;
        console.log("✅", file, "-", result.type);
      } else if (result.error) {
        errors++;
        console.log("❌", file, "-", result.error);
      }
    }
  }
};

walkDir(SOURCE_DIR);

console.log("\n" + "=".repeat(50));
console.log("📊 RESULTAT");
console.log("=".repeat(50));
console.log("Schemas injectes:", processed);
console.log("Erreurs:", errors);
console.log("\n✅ Termine !");
