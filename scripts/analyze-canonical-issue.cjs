#!/usr/bin/env node

/**
 * Script d'analyse des 43 URLs avec balise canonique correcte non indexees
 */

const canonicalIssueUrls = [
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-43",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-40",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-62",
  "https://lescalculateurs.fr/pages/blog/departements/frais-notaire-73",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-19",
  "https://www.lescalculateurs.fr/",
  "https://lescalculateurs.fr/pages/blog/departements/frais-notaire-95",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-44",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-28",
  "https://lescalculateurs.fr/pages/blog/departements/frais-notaire-83",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-14",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-16",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-72",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-56",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-79",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-49",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-07",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-84",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-971",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-32",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-55",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-10",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-13",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-27",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-65",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-72",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-68",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-60",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-90",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-64",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-54.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-21.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-90.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-69.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-03.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-68.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-2B.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-06",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-73",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-83",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-95",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-26",
  "https://www.lescalculateurs.fr/pages/blog",
];

console.log("\n📊 ANALYSE - 43 URLs AVEC CANONICAL NON INDEXEES\n");
console.log("=".repeat(80));

const analysis = {
  totalUrls: canonicalIssueUrls.length,
  byDomain: { www: 0, apex: 0 },
  byFormat: { withHtml: 0, withoutHtml: 0 },
  mixedCases: [],
  duplicates: new Map(),
  issues: [],
};

canonicalIssueUrls.forEach((url) => {
  // Count by domain
  if (url.includes("www.")) {
    analysis.byDomain["www"]++;
  } else if (url.includes("lescalculateurs.fr")) {
    analysis.byDomain["apex"]++;
  }

  // Count by .html presence
  if (url.endsWith(".html")) {
    analysis.byFormat["withHtml"]++;
  } else {
    analysis.byFormat["withoutHtml"]++;
  }

  // Track duplicates (clean version)
  const clean = url.replace(/https?:\/\/(www\.)?/, "").replace(/\.html$/, "");

  if (!analysis.duplicates.has(clean)) {
    analysis.duplicates.set(clean, []);
  }
  analysis.duplicates.get(clean).push(url);
});

console.log("\n📍 Distribution par domaine:");
console.log(`  • www.lescalculateurs.fr: ${analysis.byDomain["www"]}`);
console.log(`  • lescalculateurs.fr:     ${analysis.byDomain["apex"]}`);

console.log("\n📄 Distribution par format:");
console.log(`  • Avec .html extension:   ${analysis.byFormat["withHtml"]}`);
console.log(`  • Sans .html extension:   ${analysis.byFormat["withoutHtml"]}`);

console.log("\n⚠️ PROBLÈMES DETECTES:\n");

// Find duplicates (same path, different domain or format)
let duplicateCount = 0;
analysis.duplicates.forEach((urls, path) => {
  if (urls.length > 1) {
    duplicateCount++;
    analysis.issues.push({
      type: "DUPLICATE_CONTENT",
      path: path,
      urls: urls,
    });
  }
});

// Find URLs with .html that shouldn't be here
const withHtmlInCanonical = canonicalIssueUrls.filter((u) =>
  u.endsWith(".html")
);
if (withHtmlInCanonical.length > 0) {
  console.log(
    `1. URLs avec .html dans canonical (contradiction): ${withHtmlInCanonical.length}`
  );
  withHtmlInCanonical.forEach((url) => {
    console.log(`   ❌ ${url}`);
  });
  console.log("");
}

// Find apex domain URLs
const apexDomainUrls = canonicalIssueUrls.filter(
  (u) => u.includes("lescalculateurs.fr") && !u.includes("www.")
);
if (apexDomainUrls.length > 0) {
  console.log(`2. URLs sans www (apex domain): ${apexDomainUrls.length}`);
  apexDomainUrls.forEach((url) => {
    console.log(`   ⚠️ ${url}`);
  });
  console.log("");
}

if (duplicateCount > 0) {
  console.log(`3. Doublons de contenu: ${duplicateCount}`);
  analysis.issues.forEach((issue) => {
    if (issue.type === "DUPLICATE_CONTENT") {
      console.log(`   Path: ${issue.path}`);
      issue.urls.forEach((url) => console.log(`     • ${url}`));
    }
  });
  console.log("");
}

console.log("=".repeat(80));

console.log("\n🔍 ANALYSE DU PROBLÈME:\n");

console.log("Raisons possibles pourquoi Google ne les indexe pas:");
console.log("");
console.log("1. ⛓️ CHAÎNE DE REDIRECTIONS");
console.log("   Exemple: /frais-notaire-43.html → /frais-notaire-43");
console.log("           mais /frais-notaire-43 pourrait rediriger ailleurs");
console.log("   Solution: Verifier qu'il n'y a pas de redirection en chaîne");
console.log("");

console.log("2. 🔗 CONTENU DUPLIQUE");
console.log("   Exemple: www.lescalculateurs.fr/pages/blog ET");
console.log(
  "            lescalculateurs.fr/pages/blog pointent au meme contenu"
);
console.log(`   Trouve: ${apexDomainUrls.length} URLs apex domain`);
console.log("   Solution: Forcer www ou choisir un domaine canonique");
console.log("");

console.log("3. 🚫 META ROBOTS NOINDEX");
console.log('   Les pages pourraient avoir meta robots="noindex"');
console.log("   Solution: Verifier et retirer les meta noindex");
console.log("");

console.log("4. 🔐 ROBOTS.TXT");
console.log("   Certains chemins pourraient etre bloques dans robots.txt");
console.log("   Solution: Verifier que /pages/blog/* est autorise");
console.log("");

console.log("5. 💾 CONTENU FAIBLE/COURT");
console.log("   Google pourrait considerer le contenu comme trop court");
console.log("   Solution: Verifier la longueur du contenu (min 300-500 mots)");
console.log("");

console.log("6. ⏱️ CRAWL BUDGET");
console.log("   Google aura epuise son budget de crawl");
console.log("   Solution: Reduire les URL a indexer, nettoyer le sitemap");
console.log("");

console.log("=".repeat(80));

console.log("\n✅ RECOMMANDATIONS:\n");

console.log("1. COURT TERME (immediat):");
console.log("   ✓ Supprimer les URLs avec .html du report");
console.log("   ✓ Standardiser le domaine (www uniquement dans sitemap)");
console.log("   ✓ Verifier meta robots noindex");
console.log("   ✓ Soumettre le sitemap actualise a Google Search Console");
console.log("");

console.log("2. MOYEN TERME (1-2 semaines):");
console.log("   ✓ Monitorer si les URLs commencent a etre indexees");
console.log("   ✓ Verifier que le contenu est assez long (300+ mots)");
console.log("   ✓ Verifier que robots.txt n'est pas restrictif");
console.log("");

console.log("3. LONG TERME (monitoring):");
console.log("   ✓ Verifier la qualite du contenu");
console.log("   ✓ Verifier la structure des liens internes");
console.log("   ✓ Monitorer le crawl budget");
console.log("");

const fs = require("fs");
fs.writeFileSync(
  "./scripts/canonical-issue-urls.json",
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      totalCount: analysis.totalUrls,
      analysis: analysis,
    },
    null,
    2
  )
);

console.log("📝 Donnees exportees: scripts/canonical-issue-urls.json\n");
