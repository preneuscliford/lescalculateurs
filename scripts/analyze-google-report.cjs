#!/usr/bin/env node

/**
 * Script pour analyser les URLs non indexées de Google Search Console
 * et créer un rapport d'action
 */

// URLs de la console Google Search Console (avec redirections)
const problematicUrls = [
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-63.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-43.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-13.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-49.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-82.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-60.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-07.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-65.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-73.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-972.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-19.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-971.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-92.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-48.html",
  "https://www.lescalculateurs.fr/index.html",
  "https://lescalculateurs.fr/pages/blog/departements/frais-notaire-95.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-95.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-68.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-84.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-44.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-55.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-10.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-71.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-45.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-44.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-73.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-72.html",
  "https://lescalculateurs.fr/pages/blog.html",
  "https://lescalculateurs.fr/pages/blog/departements/frais-notaire-83.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-62.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-83.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-28.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-29.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-40.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-21.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-72.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-56.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-40.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-56.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-43.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-79.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-49.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-14.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-07.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-53.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-84.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-10.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-13.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-48.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-27.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-38.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-04.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-65.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-35.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-79.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-85.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-72.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-60.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-57.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-34.html",
  "https://www.lescalculateurs.fr/pages/notaire.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-64.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-64.html",
  "http://lescalculateurs.fr/",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-07.html",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-21.html",
  "https://lescalculateurs.fr/pages/blog/frais-notaire-90.html",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-90.html",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-69.html",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-14.html",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-43.html",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-56.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-06.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-971.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-28.html",
  "https://www.lescalculateurs.fr/pages/financement.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-08.html",
  "https://www.lescalculateurs.fr/pages/charges.html",
  "https://www.lescalculateurs.fr/pages/crypto-bourse.html",
  "https://www.lescalculateurs.fr/pages/blog.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-12.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-78.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-70.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-91.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-39.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-58.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-32.html",
  "https://www.lescalculateurs.fr/pages/blog/frais-notaire-departements.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-18.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-33.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-09.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-77.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-11.html",
  "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-16.html",
];

function analyzeUrls(urls) {
  const analysis = {
    byDomain: { www: 0, apex: 0, http: 0 },
    byPath: { departements: 0, simple: 0, root: 0 },
    urlsNeedingRedirects: [],
    duplicates: new Map(),
    issues: [],
  };

  urls.forEach((url) => {
    // Count by domain prefix
    if (url.startsWith("https://www.")) {
      analysis.byDomain["www"]++;
    } else if (url.startsWith("https://")) {
      analysis.byDomain["apex"]++;
    } else if (url.startsWith("http://")) {
      analysis.byDomain["http"]++;
    }

    // Count by path
    if (url.includes("/departements/")) {
      analysis.byPath["departements"]++;
    } else if (url.includes("/pages/blog/")) {
      analysis.byPath["simple"]++;
    } else if (
      url === "https://www.lescalculateurs.fr/index.html" ||
      url === "http://lescalculateurs.fr/"
    ) {
      analysis.byPath["root"]++;
    }

    // Identify what the redirect target should be
    const cleanUrl = url
      .replace(/^http:\/\//, "https://")
      .replace(/\.html$/, "");

    // Normalize to www (but don't double-add www)
    let targetUrl = cleanUrl;
    if (!cleanUrl.includes("www.")) {
      targetUrl = cleanUrl.replace(
        "lescalculateurs.fr",
        "www.lescalculateurs.fr"
      );
    }

    analysis.urlsNeedingRedirects.push({
      from: url,
      to:
        targetUrl === "https://www.lescalculateurs.fr/"
          ? "https://www.lescalculateurs.fr"
          : targetUrl,
    });

    // Track duplicates (same content, different URLs)
    const pathBase = url
      .replace(/https?:\/\/(www\.)?lescalculateurs\.fr/, "")
      .replace(/\.html$/, "");

    if (!analysis.duplicates.has(pathBase)) {
      analysis.duplicates.set(pathBase, []);
    }
    analysis.duplicates.get(pathBase).push(url);
  });

  // Find duplicates
  analysis.duplicates.forEach((urls, path) => {
    if (urls.length > 1) {
      analysis.issues.push({
        type: "DUPLICATE_CONTENT",
        path: path,
        urls: urls,
      });
    }
  });

  return analysis;
}

const analysis = analyzeUrls(problematicUrls);

console.log("\n📊 ANALYSE DES URLS NON INDEXEES\n");
console.log("=".repeat(60));

console.log("\n📍 Distribution par domaine:");
console.log(`  • www.lescalculateurs.fr: ${analysis.byDomain["www"]}`);
console.log(`  • lescalculateurs.fr:     ${analysis.byDomain["apex"]}`);
console.log(`  • http:// (insecure):     ${analysis.byDomain["http"]}`);

console.log("\n📁 Distribution par type de chemin:");
console.log(`  • /departements/:        ${analysis.byPath["departements"]}`);
console.log(`  • /pages/blog/(simple):  ${analysis.byPath["simple"]}`);
console.log(`  • root:                  ${analysis.byPath["root"]}`);

console.log("\n⚠️ PROBLÈMES DETÉCTÉS:");
if (analysis.issues.length === 0) {
  console.log("  ✅ Aucun problème d'indexation en double");
} else {
  analysis.issues.forEach((issue) => {
    console.log(`\n  ${issue.type}:`);
    console.log(`  Path: ${issue.path}`);
    console.log(`  URLs en doublon:`);
    issue.urls.forEach((url) => console.log(`    - ${url}`));
  });
}

console.log("\n🔀 REDIRECTS REQUIS:\n");
console.log(
  `Les ${analysis.urlsNeedingRedirects.length} URLs suivantes doivent rediriger vers la version sans .html avec www:\n`
);

// Group by domain issues
const domainIssues = {
  http_to_https: analysis.urlsNeedingRedirects.filter((r) =>
    r.from.startsWith("http://")
  ),
  apex_to_www: analysis.urlsNeedingRedirects.filter(
    (r) =>
      r.from.includes("https://lescalculateurs.fr") && !r.from.includes("www")
  ),
  clean_html: analysis.urlsNeedingRedirects.filter((r) =>
    r.from.endsWith(".html")
  ),
};

console.log(`1. HTTP to HTTPS: ${domainIssues["http_to_https"].length} URLs`);
console.log(
  `2. Apex domain to www: ${domainIssues["apex_to_www"].length} URLs`
);
console.log(
  `3. Remove .html extension: ${domainIssues["clean_html"].length} URLs`
);

console.log("\n" + "=".repeat(60));
console.log(
  `✅ Total URLs à corriger: ${analysis.urlsNeedingRedirects.length}`
);

// Export redirects
const fs = require("fs");
const redirectsJson = {
  generated: new Date().toISOString(),
  description: "Redirects pour corriger les problèmes d'indexation Google",
  redirects: analysis.urlsNeedingRedirects,
};

fs.writeFileSync(
  "./scripts/google-indexing-redirects.json",
  JSON.stringify(redirectsJson, null, 2)
);

console.log(
  "\n📝 Redirects exportés vers: scripts/google-indexing-redirects.json"
);
