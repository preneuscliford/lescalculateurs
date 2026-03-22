#!/usr/bin/env node

/**
 * Analyse DETAILLEE des balises canonical
 * Identifier tous les problemes d'inconsistance
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 ANALYSE DETAILLEE - BALISES CANONICAL\n");
console.log("=".repeat(80));

// Scanner les fichiers HTML
const srcDir = path.resolve("src");
const canonicalMap = new Map();
const issues = [];

function scanHtmlFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanHtmlFiles(filePath);
    } else if (file.endsWith(".html")) {
      const content = fs.readFileSync(filePath, "utf8");

      // Trouver canonical
      const canonicalMatch = content.match(
        /<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/
      );
      const partialMatch = content.match(/<link[^>]*rel="canonical"[^>]*/);

      // Relative path for display
      const relPath = filePath
        .replace(path.resolve("src"), "")
        .replace(/\\/g, "/");

      if (canonicalMatch) {
        const href = canonicalMatch[1];
        canonicalMap.set(relPath, {
          href: href,
          status: "OK",
          incomplete: false,
        });
      } else if (partialMatch) {
        // Canonical tag trouve mais href manquant
        canonicalMap.set(relPath, {
          href: null,
          status: "INCOMPLETE",
          incomplete: true,
        });
        issues.push({
          file: relPath,
          type: "INCOMPLETE_CANONICAL",
          message: "Balise canonical trouvee mais href manquant",
        });
      } else {
        canonicalMap.set(relPath, {
          href: null,
          status: "MISSING",
          incomplete: false,
        });
      }
    }
  });
}

scanHtmlFiles(srcDir);

console.log("\n📊 RESUME:\n");
console.log(`Total fichiers HTML: ${canonicalMap.size}`);
console.log(
  `Avec canonical: ${[...canonicalMap.values()].filter((c) => c.href).length}`
);
console.log(
  `Sans canonical: ${
    [...canonicalMap.values()].filter((c) => !c.href && !c.incomplete).length
  }`
);
console.log(
  `Incomplets: ${[...canonicalMap.values()].filter((c) => c.incomplete).length}`
);

console.log("\n⚠️ PROBLÈMES DETECTES:\n");

// Analyser les inconsistences
const patterns = {
  apex_with_html: [], // lescalculateurs.fr/...html
  apex_without_html: [], // lescalculateurs.fr/...
  www_with_html: [], // www.lescalculateurs.fr/...html
  www_without_html: [], // www.lescalculateurs.fr/...
  pages_path: [], // /pages/ vs /blog/
  missing: [], // Pas de canonical
};

canonicalMap.forEach((value, file) => {
  if (!value.href) {
    patterns.missing.push(file);
    return;
  }

  const href = value.href;

  if (href.includes("www.")) {
    if (href.endsWith(".html")) {
      patterns.www_with_html.push({ file, href });
    } else {
      patterns.www_without_html.push({ file, href });
    }
  } else if (href.includes("lescalculateurs.fr")) {
    if (href.endsWith(".html")) {
      patterns.apex_with_html.push({ file, href });
    } else {
      patterns.apex_without_html.push({ file, href });
    }
  }

  // Check /pages/ vs /blog/
  if (file.includes("/pages/") && href.includes("/blog/")) {
    patterns.pages_path.push({ file, href, issue: "/pages/ → /blog/" });
  } else if (file.includes("/blog/") && href.includes("/pages/")) {
    patterns.pages_path.push({ file, href, issue: "/blog/ → /pages/" });
  }
});

let problemCount = 0;

if (patterns.apex_with_html.length > 0) {
  console.log(`1. ❌ Apex domain + .html (${patterns.apex_with_html.length}):`);
  patterns.apex_with_html.slice(0, 3).forEach((p) => {
    console.log(`   File: ${p.file}`);
    console.log(`   Canonical: ${p.href}`);
  });
  if (patterns.apex_with_html.length > 3) {
    console.log(`   ... et ${patterns.apex_with_html.length - 3} autres`);
  }
  console.log("");
  problemCount += patterns.apex_with_html.length;
}

if (patterns.apex_without_html.length > 0) {
  console.log(
    `2. ⚠️ Apex domain sans www (${patterns.apex_without_html.length}):`
  );
  patterns.apex_without_html.slice(0, 3).forEach((p) => {
    console.log(`   File: ${p.file}`);
    console.log(`   Canonical: ${p.href}`);
  });
  if (patterns.apex_without_html.length > 3) {
    console.log(`   ... et ${patterns.apex_without_html.length - 3} autres`);
  }
  console.log("");
  problemCount += patterns.apex_without_html.length;
}

if (patterns.www_with_html.length > 0) {
  console.log(`3. ❌ www + .html encore (${patterns.www_with_html.length}):`);
  patterns.www_with_html.slice(0, 3).forEach((p) => {
    console.log(`   File: ${p.file}`);
    console.log(`   Canonical: ${p.href}`);
  });
  if (patterns.www_with_html.length > 3) {
    console.log(`   ... et ${patterns.www_with_html.length - 3} autres`);
  }
  console.log("");
  problemCount += patterns.www_with_html.length;
}

if (patterns.pages_path.length > 0) {
  console.log(
    `4. ⚠️ Mismatch /pages/ vs /blog/ (${patterns.pages_path.length}):`
  );
  patterns.pages_path.slice(0, 5).forEach((p) => {
    console.log(`   File: ${p.file}`);
    console.log(`   Canonical: ${p.href}`);
    console.log(`   Issue: ${p.issue}`);
  });
  if (patterns.pages_path.length > 5) {
    console.log(`   ... et ${patterns.pages_path.length - 5} autres`);
  }
  console.log("");
  problemCount += patterns.pages_path.length;
}

if (patterns.missing.length > 0) {
  console.log(`5. ❌ Pas de canonical (${patterns.missing.length}):`);
  patterns.missing.slice(0, 3).forEach((file) => {
    console.log(`   File: ${file}`);
  });
  if (patterns.missing.length > 3) {
    console.log(`   ... et ${patterns.missing.length - 3} autres`);
  }
  console.log("");
  problemCount += patterns.missing.length;
}

console.log("=".repeat(80));

console.log("\n🎯 IMPACT SUR GOOGLE SEARCH CONSOLE:\n");

console.log("Pourquoi les 43 URLs ne sont pas indexees:");
console.log("");
console.log("1. 🔄 CHAÎNE DE REDIRECTS:");
console.log("   • Si canonical pointe vers /pages/blog.html");
console.log("   • Et qu'on redirige .html → sans .html");
console.log("   • Et qu'on redirige apex → www");
console.log("   • Cela cree: /pages/blog.html → /pages/blog → /blog");
console.log("   • 3 redirects = Google abandonne l'indexation");
console.log("");

console.log("2. 📍 CANONICAL CONFLICTUEL:");
console.log("   • Si canonical dans le HTML pointe vers lescalculateurs.fr");
console.log("   • Mais URL servie est www.lescalculateurs.fr");
console.log("   • Google voit contradiction = pas d'indexation");
console.log("");

console.log("3. 🔀 /pages/ vs /blog/:");
console.log(`   ${patterns.pages_path.length} fichiers avec mismatch`);
console.log("   • Fichier: /src/pages/blog/... HTML");
console.log("   • Canonical: /blog/departements/...");
console.log("   • Mismatch = Google confus");
console.log("");

console.log("4. ⛓️ .HTML TOUJOURS PRESENT:");
console.log(
  `   ${
    patterns.www_with_html.length + patterns.apex_with_html.length
  } canonicals avec .html`
);
console.log("   • Canonical devrait etre SANS .html");
console.log("   • Cela contredit les redirects vercel.json");
console.log("");

console.log("=".repeat(80));

console.log("\n✅ SOLUTION REQUISE:\n");

console.log("Standardiser TOUS les canonicals a:");
console.log("  Format: https://www.lescalculateurs.fr/pages/...");
console.log("  ├─ TOUJOURS www (jamais apex)");
console.log("  ├─ TOUJOURS https");
console.log("  └─ JAMAIS .html");
console.log("");

console.log("Fichiers a corriger:");
console.log(`  • ${patterns.apex_with_html.length} avec apex + .html`);
console.log(`  • ${patterns.apex_without_html.length} avec apex seul`);
console.log(`  • ${patterns.www_with_html.length} avec www + .html`);
console.log(
  `  • ${patterns.pages_path.length} avec /pages/ vs /blog/ mismatch`
);
console.log(`  • ${patterns.missing.length} sans canonical`);
console.log(`  • ${issues.length} incomplets`);
console.log("");
console.log(
  `TOTAL A CORRIGER: ${problemCount + patterns.missing.length + issues.length}`
);

// Export data
const dataToExport = {
  generated: new Date().toISOString(),
  summary: {
    totalFiles: canonicalMap.size,
    withCanonical: [...canonicalMap.values()].filter((c) => c.href).length,
    missingCanonical: patterns.missing.length,
    incompleteCanonical: issues.length,
    problemsFound: problemCount + patterns.missing.length + issues.length,
  },
  patterns: patterns,
  issues: issues,
};

fs.writeFileSync(
  "./scripts/canonical-analysis-detailed.json",
  JSON.stringify(dataToExport, null, 2)
);

console.log(
  "\n📊 Donnees exportees: scripts/canonical-analysis-detailed.json\n"
);
