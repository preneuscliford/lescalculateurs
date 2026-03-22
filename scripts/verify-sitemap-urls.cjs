#!/usr/bin/env node

/**
 * Verifier que tous les URLs du sitemap repondent avec HTTP 200
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const sitemapPath = path.join(__dirname, "..", "public", "sitemap.xml");

console.log("\n🔍 VERIFICATION DES URLS DU SITEMAP\n");
console.log("=".repeat(80));

// Lire et parser le sitemap
const sitemapContent = fs.readFileSync(sitemapPath, "utf8");

// Extraire les URLs
const urlRegex = /<loc>(.*?)<\/loc>/g;
const urls = [];
let match;

while ((match = urlRegex.exec(sitemapContent)) !== null) {
  urls.push(match[1]);
}

console.log(`\n📋 Total URLs dans sitemap: ${urls.length}\n`);

// Fonction pour tester une URL
function testUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "HEAD",
      timeout: 5000,
    };

    const req = https
      .request(options, (res) => {
        resolve({
          url: url,
          status: res.statusCode,
          success: res.statusCode === 200,
        });
      })
      .on("error", (err) => {
        resolve({
          url: url,
          status: "ERROR",
          error: err.message,
          success: false,
        });
      })
      .on("timeout", () => {
        req.destroy();
        resolve({
          url: url,
          status: "TIMEOUT",
          success: false,
        });
      });

    req.end();
  });
}

// Tester les URLs (avec limit concurrentielle)
async function testAllUrls() {
  const batchSize = 5; // 5 URLs en parallele
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(
      `\nTesting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        urls.length / batchSize
      )} (URLs ${i + 1}-${Math.min(i + batchSize, urls.length)})...`
    );

    const batchResults = await Promise.all(batch.map(testUrl));

    for (const result of batchResults) {
      results.push(result);

      const statusStr =
        result.status === 200
          ? "✅ 200"
          : result.status === "ERROR"
          ? `❌ ${result.error}`
          : `⚠️  ${result.status}`;

      console.log(
        `  ${statusStr} - ${result.url.substring(0, 70)}${
          result.url.length > 70 ? "..." : ""
        }`
      );

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
  }

  return { results, successCount, errorCount };
}

// Executer les tests
testAllUrls().then(({ results, successCount, errorCount }) => {
  console.log("\n" + "=".repeat(80));
  console.log("\n📊 RESUME:\n");
  console.log(`  ✅ URLs OK (200): ${successCount}`);
  console.log(`  ❌ URLs ERREUR: ${errorCount}`);

  if (errorCount > 0) {
    console.log("\n⚠️  URLS AVEC PROBLÈMES:\n");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  ${r.url}`);
        console.log(`    Status: ${r.status} ${r.error ? `(${r.error})` : ""}`);
      });
  }

  console.log("\n" + "=".repeat(80));

  if (errorCount === 0) {
    console.log(
      `\n✅ VERIFICATION REUSSIE! Tous les ${successCount} URLs repondent avec 200\n`
    );
    process.exit(0);
  } else {
    console.log(
      `\n❌ ${errorCount} URLs ont des problemes. A corriger avant le push.\n`
    );
    process.exit(1);
  }
});
