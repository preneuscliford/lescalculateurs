#!/usr/bin/env node
/**
 * Checklist complète pour la validation de l'indexation
 * À exécuter après chaque déploiement
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

console.log("\n" + "=".repeat(80));
console.log("✅ CHECKLIST COMPLÈTE - VALIDATION D'INDEXATION");
console.log("=".repeat(80) + "\n");

const checks = [];

// 1. Vérifier les fichiers de configuration
console.log("1️⃣ VÉRIFICATION DES FICHIERS DE CONFIGURATION");
console.log("-".repeat(80));

const filesToCheck = [
  { path: "vercel.json", name: "vercel.json" },
  { path: "public/sitemap.xml", name: "sitemap.xml" },
  { path: "public/robots.txt", name: "robots.txt" },
];

filesToCheck.forEach(({ path: filePath, name }) => {
  const fullPath = path.resolve(__dirname, "..", filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${name}: Existe`);
    checks.push({ check: name, status: "PASS" });
  } else {
    console.log(`❌ ${name}: MANQUANT`);
    checks.push({ check: name, status: "FAIL" });
  }
});

// 2. Vérifier le contenu des fichiers
console.log("\n2️⃣ VÉRIFICATION DU CONTENU");
console.log("-".repeat(80));

// vercel.json
const vercelPath = path.resolve(__dirname, "..", "vercel.json");
const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, "utf8"));

console.log(`✅ vercel.json:`);
console.log(`   - cleanUrls: ${vercelConfig.cleanUrls ? "✅" : "❌"}`);
console.log(`   - Redirects: ${vercelConfig.redirects.length}`);
vercelConfig.redirects.forEach((r) => {
  console.log(
    `     • ${r.source} → ${r.destination} (${r.permanent ? "301" : "302"})`
  );
});
checks.push({
  check: "vercel.json config",
  status: vercelConfig.cleanUrls ? "PASS" : "FAIL",
});

// sitemap.xml
const sitemapPath = path.resolve(__dirname, "..", "public", "sitemap.xml");
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const urlCount = (sitemap.match(/<url>/g) || []).length;
const hasHtmlUrls = sitemap.includes(".html</loc>");
const hasApexUrls = sitemap.match(/https:\/\/lescalculateurs\.fr\//g) || [];

console.log(`\n✅ sitemap.xml:`);
console.log(`   - URLs: ${urlCount}`);
console.log(`   - Avec .html: ${hasHtmlUrls ? "❌ PROBLÈME" : "✅ OK"}`);
console.log(
  `   - Apex domain: ${
    hasApexUrls.length > 0 ? "❌ " + hasApexUrls.length + " trouvées" : "✅ OK"
  }`
);
checks.push({
  check: "sitemap.xml URLs",
  status: !hasHtmlUrls && hasApexUrls.length === 0 ? "PASS" : "FAIL",
});

// robots.txt
const robotsPath = path.resolve(__dirname, "..", "public", "robots.txt");
const robots = fs.readFileSync(robotsPath, "utf8");
const allowsPages = !robots.includes("Disallow: /pages");
const hasSitemap = robots.includes("Sitemap:");

console.log(`\n✅ robots.txt:`);
console.log(`   - Permet /pages: ${allowsPages ? "✅" : "❌"}`);
console.log(`   - Inclut Sitemap: ${hasSitemap ? "✅" : "❌"}`);
checks.push({
  check: "robots.txt",
  status: allowsPages && hasSitemap ? "PASS" : "FAIL",
});

// 3. Vérifier les canonicals
console.log("\n3️⃣ VÉRIFICATION DES CANONICALS");
console.log("-".repeat(80));

const srcDir = path.join(__dirname, "..", "src", "pages");

function checkCanonicals(dir) {
  let totalFiles = 0;
  let withCanonical = 0;
  let issues = [];

  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        totalFiles++;
        const content = fs.readFileSync(fullPath, "utf8");
        const match = content.match(
          /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i
        );

        if (match) {
          withCanonical++;
          const href = match[1];

          // Check for issues
          if (href.includes(".html")) {
            issues.push({ file: entry.name, issue: "Contains .html" });
          }
          if (href.includes("lescalculateurs.fr") && !href.includes("www.")) {
            issues.push({ file: entry.name, issue: "Apex domain (no www)" });
          }
        }
      }
    }
  }

  scan(dir);
  return { totalFiles, withCanonical, issues };
}

const { totalFiles, withCanonical, issues } = checkCanonicals(srcDir);

console.log(`✅ Canonicals:`);
console.log(`   - Total fichiers: ${totalFiles}`);
console.log(`   - Avec canonical: ${withCanonical}/${totalFiles}`);
console.log(`   - Problèmes trouvés: ${issues.length}`);

if (issues.length > 0) {
  console.log(`   ❌ Problèmes:`);
  issues.slice(0, 5).forEach(({ file, issue }) => {
    console.log(`      • ${file}: ${issue}`);
  });
}

checks.push({
  check: "canonicals",
  status: issues.length === 0 ? "PASS" : "FAIL",
});

// 4. Résumé
console.log("\n" + "=".repeat(80));
console.log("📊 RÉSUMÉ");
console.log("=".repeat(80) + "\n");

const passed = checks.filter((c) => c.status === "PASS").length;
const total = checks.length;

console.log(`✅ Vérifications réussies: ${passed}/${total}`);

if (passed === total) {
  console.log("\n🎉 TOUT EST CORRECT!");
  console.log("\n📋 PROCHAINES ÉTAPES:");
  console.log("  1. Exécuter: npm run build");
  console.log('  2. Exécuter: git add . && git commit -m "fix: indexation"');
  console.log("  3. Exécuter: git push");
  console.log("  4. Attendre 5min pour Vercel");
  console.log("  5. Aller dans Search Console");
  console.log('  6. Cliquer "Valider la correction"');
  console.log("  7. Attendre 3-7 jours pour le recrawl");
} else {
  console.log("\n❌ DES PROBLÈMES ONT ÉTÉ TROUVÉS!");
  checks
    .filter((c) => c.status === "FAIL")
    .forEach((c) => {
      console.log(`  - ${c.check}`);
    });
}

console.log("\n");
