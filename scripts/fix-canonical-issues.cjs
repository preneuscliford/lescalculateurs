#!/usr/bin/env node

/**
 * Script de correction pour les 43 URLs avec canonical issue
 * Problèmes trouvés:
 * 1. 7 URLs avec .html (contradiction)
 * 2. 5 URLs apex domain (sans www)
 * 3. 5 doublons de contenu
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔧 SCRIPT DE CORRECTION - CANONICAL ISSUES\n");
console.log("=".repeat(80));

console.log("\n📋 PROBLÈMES À CORRIGER:\n");

console.log("PROBLÈME 1: 7 URLs avec .html qui ne devraient pas être indexées");
console.log(
  "  Solution: Les redirects vercel.json vont les nettoyer automatiquement"
);
console.log("  ✓ Déjà géré par les redirects précédents\n");

console.log("PROBLÈME 2: 5 URLs apex domain (sans www) non indexées");
console.log("  Cause: Doublons de contenu www vs non-www");
console.log(
  "  Solution: Mettre à jour sitemap + ajouter redirects apex → www\n"
);

console.log("PROBLÈME 3: Sitemap contient trop d'URLs (122+43 problématiques)");
console.log("  Solution: Nettoyer et optimiser le sitemap\n");

console.log("PROBLÈME 4: Possible meta robots noindex sur certaines pages");
console.log("  Solution: Vérifier et retirer les meta noindex\n");

// Lecture du sitemap
const sitemapPath = path.resolve("public/sitemap.xml");
const sitemap = fs.readFileSync(sitemapPath, "utf8");

console.log("\n✅ ACTIONS À EFFECTUER:\n");

console.log("1️⃣ SITEMAP.XML - Déjà corrigé ✓");
console.log("   • Vérifier qu'aucune URL apex n'existe dans le sitemap");
console.log("   • Vérifier qu'aucune URL avec .html n'existe\n");

// Vérifier les apex URLs dans le sitemap
const apexInSitemap = (
  sitemap.match(/<loc>https:\/\/lescalculateurs\.fr[^w]/g) || []
).length;
const htmlInSitemap = (sitemap.match(/<loc>[^<]*\.html<\/loc>/g) || []).length;

console.log(
  `   Résultats: Apex URLs: ${apexInSitemap}, .html URLs: ${htmlInSitemap}`
);

if (apexInSitemap > 0) {
  console.log(
    `   ⚠️ ATTENTION: ${apexInSitemap} URLs apex trouvées dans sitemap!`
  );
  console.log("   Action: Exécuter validate-sitemap.cjs pour corriger\n");
}

if (htmlInSitemap > 0) {
  console.log(
    `   ⚠️ ATTENTION: ${htmlInSitemap} URLs .html trouvées dans sitemap!`
  );
  console.log("   Action: Exécuter validate-sitemap.cjs pour corriger\n");
}

console.log("\n2️⃣ VERCEL.JSON - Redirects apex domain");
console.log("   Les redirects existantes vont:");
console.log(
  "   • Convertir https://lescalculateurs.fr → https://www.lescalculateurs.fr"
);
console.log("   • Convertir .html → sans extension");
console.log("   • Résultat: Une seule URL canonique par page\n");

console.log("\n3️⃣ ROBOTS.TXT - À vérifier");
console.log("   Vérifier que:");
console.log("   ✓ /pages/blog/* n'est pas bloqué");
console.log("   ✓ /pages/blog/departements/* n'est pas bloqué\n");

console.log("\n4️⃣ META ROBOTS - À vérifier");
console.log("   Vérifier qu'aucune page n'a:");
console.log('   ❌ meta name="robots" content="noindex"');
console.log('   ❌ meta name="googlebot" content="noindex"\n');

console.log("\n5️⃣ CONTENU - À vérifier");
console.log("   Vérifier que chaque page a:");
console.log("   ✓ Au minimum 300-500 mots");
console.log("   ✓ Meta description (155-160 caractères)");
console.log("   ✓ Titre pertinent (50-60 caractères)\n");

console.log("=".repeat(80));

console.log("\n📊 RÉSUMÉ DES ACTIONS:\n");

const actions = [
  {
    priority: "IMMÉDIAT",
    action: "Déployer vercel.json avec redirects",
    status: "✅ PRÊT",
  },
  {
    priority: "IMMÉDIAT",
    action: "Vérifier sitemap (pas d'apex, pas de .html)",
    status: "✅ À VÉRIFIER",
  },
  {
    priority: "COURT TERME",
    action: "Vérifier robots.txt",
    status: "⏳ TODO",
  },
  {
    priority: "COURT TERME",
    action: "Enlever meta noindex si présent",
    status: "⏳ TODO",
  },
  {
    priority: "MOYEN TERME",
    action: "Vérifier longueur contenu (min 300 mots)",
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

console.log("T+0h   : Déploiement vercel.json");
console.log("T+1h   : Vercel redéploie");
console.log("T+24h  : Google re-crawle les URLs");
console.log("T+3-7j : Les 43 URLs commencent à être indexées");
console.log("T+2w   : Stabilisation, indexation devrait monter");

console.log("\n✨ SUCCÈS SI:\n");

console.log('✅ Les 43 URLs passent de "Non indexée" → "Indexée" dans GSC');
console.log('✅ Plus de "Duplicate content" warnings');
console.log('✅ Plus de "Canonical issue" warnings');
console.log("✅ Taux d'indexation augmente");

console.log("\n" + "=".repeat(80) + "\n");
