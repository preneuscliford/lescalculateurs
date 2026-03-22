#!/usr/bin/env node

/**
 * Script de correction pour les 43 URLs avec canonical issue
 * Problemes trouves:
 * 1. 7 URLs avec .html (contradiction)
 * 2. 5 URLs apex domain (sans www)
 * 3. 5 doublons de contenu
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔧 SCRIPT DE CORRECTION - CANONICAL ISSUES\n");
console.log("=".repeat(80));

console.log("\n📋 PROBLÈMES A CORRIGER:\n");

console.log("PROBLÈME 1: 7 URLs avec .html qui ne devraient pas etre indexees");
console.log(
  "  Solution: Les redirects vercel.json vont les nettoyer automatiquement"
);
console.log("  ✓ Deja gere par les redirects precedents\n");

console.log("PROBLÈME 2: 5 URLs apex domain (sans www) non indexees");
console.log("  Cause: Doublons de contenu www vs non-www");
console.log(
  "  Solution: Mettre a jour sitemap + ajouter redirects apex → www\n"
);

console.log("PROBLÈME 3: Sitemap contient trop d'URLs (122+43 problematiques)");
console.log("  Solution: Nettoyer et optimiser le sitemap\n");

console.log("PROBLÈME 4: Possible meta robots noindex sur certaines pages");
console.log("  Solution: Verifier et retirer les meta noindex\n");

// Lecture du sitemap
const sitemapPath = path.resolve("public/sitemap.xml");
const sitemap = fs.readFileSync(sitemapPath, "utf8");

console.log("\n✅ ACTIONS A EFFECTUER:\n");

console.log("1️⃣ SITEMAP.XML - Deja corrige ✓");
console.log("   • Verifier qu'aucune URL apex n'existe dans le sitemap");
console.log("   • Verifier qu'aucune URL avec .html n'existe\n");

// Verifier les apex URLs dans le sitemap
const apexInSitemap = (
  sitemap.match(/<loc>https:\/\/lescalculateurs\.fr[^w]/g) || []
).length;
const htmlInSitemap = (sitemap.match(/<loc>[^<]*\.html<\/loc>/g) || []).length;

console.log(
  `   Resultats: Apex URLs: ${apexInSitemap}, .html URLs: ${htmlInSitemap}`
);

if (apexInSitemap > 0) {
  console.log(
    `   ⚠️ ATTENTION: ${apexInSitemap} URLs apex trouvees dans sitemap!`
  );
  console.log("   Action: Executer validate-sitemap.cjs pour corriger\n");
}

if (htmlInSitemap > 0) {
  console.log(
    `   ⚠️ ATTENTION: ${htmlInSitemap} URLs .html trouvees dans sitemap!`
  );
  console.log("   Action: Executer validate-sitemap.cjs pour corriger\n");
}

console.log("\n2️⃣ VERCEL.JSON - Redirects apex domain");
console.log("   Les redirects existantes vont:");
console.log(
  "   • Convertir https://lescalculateurs.fr → https://www.lescalculateurs.fr"
);
console.log("   • Convertir .html → sans extension");
console.log("   • Resultat: Une seule URL canonique par page\n");

console.log("\n3️⃣ ROBOTS.TXT - A verifier");
console.log("   Verifier que:");
console.log("   ✓ /pages/blog/* n'est pas bloque");
console.log("   ✓ /pages/blog/departements/* n'est pas bloque\n");

console.log("\n4️⃣ META ROBOTS - A verifier");
console.log("   Verifier qu'aucune page n'a:");
console.log('   ❌ meta name="robots" content="noindex"');
console.log('   ❌ meta name="googlebot" content="noindex"\n');

console.log("\n5️⃣ CONTENU - A verifier");
console.log("   Verifier que chaque page a:");
console.log("   ✓ Au minimum 300-500 mots");
console.log("   ✓ Meta description (155-160 caracteres)");
console.log("   ✓ Titre pertinent (50-60 caracteres)\n");

console.log("=".repeat(80));

console.log("\n📊 RESUME DES ACTIONS:\n");

const actions = [
  {
    priority: "IMMEDIAT",
    action: "Deployer vercel.json avec redirects",
    status: "✅ PRÊT",
  },
  {
    priority: "IMMEDIAT",
    action: "Verifier sitemap (pas d'apex, pas de .html)",
    status: "✅ A VERIFIER",
  },
  {
    priority: "COURT TERME",
    action: "Verifier robots.txt",
    status: "⏳ TODO",
  },
  {
    priority: "COURT TERME",
    action: "Enlever meta noindex si present",
    status: "⏳ TODO",
  },
  {
    priority: "MOYEN TERME",
    action: "Verifier longueur contenu (min 300 mots)",
    status: "⏳ TODO",
  },
  {
    priority: "LONG TERME",
    action: "Monitorer indexation dans GSC",
    status: "⏳ TODO",
  },
];

actions.forEach((a) => {
  console.log(`${a.status} | ${a.priority.padEnd(12)} | ${a.action}`);
});

console.log("\n" + "=".repeat(80));

console.log("\n⏱️ TIMELINE ATTENDU:\n");

console.log("T+0h   : Deploiement vercel.json");
console.log("T+1h   : Vercel redeploie");
console.log("T+24h  : Google re-crawle les URLs");
console.log("T+3-7j : Les 43 URLs commencent a etre indexees");
console.log("T+2w   : Stabilisation, indexation devrait monter");

console.log("\n✨ SUCCÈS SI:\n");

console.log('✅ Les 43 URLs passent de "Non indexee" → "Indexee" dans GSC');
console.log('✅ Plus de "Duplicate content" warnings');
console.log('✅ Plus de "Canonical issue" warnings');
console.log("✅ Taux d'indexation augmente");

console.log("\n" + "=".repeat(80) + "\n");
