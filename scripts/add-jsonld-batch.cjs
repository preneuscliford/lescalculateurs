#!/usr/bin/env node
/**
 * Ajoute un bloc JSON-LD FAQPage minimal aux pages satellites sans données structurées.
 * Vérifie d'abord si la page contient déjà du JSON-LD.
 */
const fs = require("fs");
const path = require("path");

// Pages satellites à fort trafic (top 30 hors hubs, juin-juillet 2026) sans JSON-LD
const PAGES = [
  "src/pages/apl/apl-smic-seul.html",
  "src/pages/apl/apl-chomage-loyer-moyen.html",
  "src/pages/apl/apl-loyer-700-personne-seule.html",
  "src/pages/apl/apl-parent-isole-trois-enfants.html",
  "src/pages/apl/apl-famille-trois-enfants.html",
  "src/pages/apl/apl-celibataire-smic.html",
  "src/pages/apl/apl-parent-isole-deux-enfants.html",
  "src/pages/apl/apl-alternant.html",
  "src/pages/apl/apl-chomage-personne-seule.html",
  "src/pages/apl/apl-chomage-avec-enfant.html",
  "src/pages/apl/apl-apprenti.html",
  "src/pages/rsa/rsa-hebergement-gratuit.html",
  "src/pages/blog/departements/frais-notaire-06.html",
  "src/pages/blog/departements/frais-notaire-34.html",
  "src/pages/blog/departements/frais-notaire-13.html",
  "src/pages/blog/departements/frais-notaire-11.html",
  "src/pages/blog/departements/frais-notaire-26.html",
];

const BASE = path.resolve(__dirname, "..");
let added = 0;
let skipped = 0;

for (const relPath of PAGES) {
  const fp = path.join(BASE, relPath);
  if (!fs.existsSync(fp)) {
    console.log(`  ⚠ Introuvable: ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(fp, "utf-8");

  // Déjà un JSON-LD ?
  if (content.includes("application/ld+json")) {
    console.log(`  ⊘ Déjà JSON-LD: ${relPath}`);
    skipped++;
    continue;
  }

  // Extraire title et description pour le FAQ
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = content.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
  );
  const title = titleMatch ? titleMatch[1].trim() : "Simulateur 2026";
  const desc = descMatch ? descMatch[1].trim() : "Estimation gratuite en ligne.";

  const jsonld = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "${title}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${desc}"
      }
    }]
  }
  </script>`;

  // Insérer avant </head>
  content = content.replace("</head>", `${jsonld}\n</head>`);
  fs.writeFileSync(fp, content, "utf-8");
  console.log(`  ✓ JSON-LD ajouté: ${relPath}`);
  added++;
}

console.log(`\nAjoutés: ${added} | Déjà OK: ${skipped} | Total: ${PAGES.length}`);
