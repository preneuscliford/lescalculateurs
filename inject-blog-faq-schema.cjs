/**
 * Injection Schema FAQPage - Pages Blog & Satellites
 * Ajoute FAQPage aux pages blog/articles qui n'en ont pas
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "src/pages";

// FAQ générique pour pages blog
const BLOG_FAQ = {
  q: "Comment obtenir une estimation exacte ?",
  a: "Utilisez notre simulateur en ligne ou consultez directement le service officiel (CAF, impots.gouv.fr, notaires.fr) pour une valeur definitive.",
};

// FAQ spécifiques par thème
const SPECIFIC_FAQS = {
  "frais-notaire": {
    q: "Comment obtenir le montant exact des frais de notaire ?",
    a: "Consultez un notaire ou utilisez le simulateur officiel des Notaires de France pour une estimation precise.",
  },
  smic: {
    q: "Quel est le montant exact du SMIC ?",
    a: "Consultez le site officiel du service-public.fr pour le montant actuel du SMIC.",
  },
  inflation: {
    q: "Quel est le taux d'inflation officiel ?",
    a: "Consultez le site de l'INSEE pour les donnees officielles sur l'inflation.",
  },
};

function detectBlogType(filename, content) {
  const lowerFile = filename.toLowerCase();
  const lowerContent = content.toLowerCase();

  for (const [key, faq] of Object.entries(SPECIFIC_FAQS)) {
    if (lowerFile.includes(key) || lowerContent.includes(key)) {
      return faq;
    }
  }

  return BLOG_FAQ;
}

function hasFAQSchema(content) {
  const jsonldRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>/i;
  const microdataRegex =
    /itemscope[^>]*itemtype=["']https?:\/\/schema\.org\/FAQPage["']|itemtype=["']https?:\/\/schema\.org\/FAQPage["']/i;
  return jsonldRegex.test(content) || microdataRegex.test(content);
}

function generateSchema(faq) {
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

let added = 0;
let already = 0;

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const filename = path.basename(filePath);

    if (hasFAQSchema(content)) {
      already++;
      return;
    }

    const faq = detectBlogType(filename, content);
    const schema = generateSchema(faq);

    if (content.includes("</head>")) {
      content = content.replace("</head>", schema + "\n</head>");
    } else if (content.includes("<body>")) {
      content = content.replace(
        "<body>",
        "<head>\n" + schema + "\n</head>\n<body>",
      );
    } else {
      return;
    }

    fs.writeFileSync(filePath, content, "utf-8");
    added++;
    console.log("✅", filename);
  } catch (e) {
    console.error("❌", filePath, e.message);
  }
}

// Traiter uniquement le dossier blog
const blogDir = path.join(SOURCE_DIR, "blog");
if (fs.existsSync(blogDir)) {
  const files = fs.readdirSync(blogDir, { recursive: true });

  for (const file of files) {
    const fullPath = path.join(blogDir, file);
    if (fs.statSync(fullPath).isFile() && file.endsWith(".html")) {
      processFile(fullPath);
    }
  }
}

console.log("\n" + "=".repeat(50));
console.log("📊 RESULTAT BLOG/SATELLITES");
console.log("=".repeat(50));
console.log("Schemas ajoutes:", added);
console.log("Schemas deja presents:", already);
console.log("✅ Termine !");
