#!/usr/bin/env node
/**
 * Script pour identifier les modifications SEO a faire en 2026
 * Cherche les "2025" dans les blocs SEO uniquement
 */

const fs = require("fs");
const path = require("path");

const files = [
  "src/pages/notaire.html",
  "src/pages/blog/frais-notaire-departements.html",
  "src/pages/sources.html",
];

const seoPatterns = [
  "<title>",
  'name="description"',
  'name="keywords"',
  'property="og:title"',
  'property="og:description"',
  'name="twitter:title"',
  'name="twitter:description"',
  '"headline":',
  '"description":',
];

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔍 SCAN SEO - Occurrences "2025" a Remplacer en 2026          ║
╚════════════════════════════════════════════════════════════════╝
`);

let totalMatches = 0;

files.forEach((filePath) => {
  const fullPath = path.resolve(path.join(process.cwd(), filePath));
  if (!fs.existsSync(fullPath)) {
    console.log(`\n⚠️  Fichier non trouve: ${filePath}\n`);
    return;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");
  const matches = [];

  lines.forEach((line, idx) => {
    // Verifier si la ligne contient un pattern SEO ET "2025"
    const hasSEOPattern = seoPatterns.some((pattern) =>
      line.includes(pattern)
    );
    const has2025 = line.includes("2025");

    if (hasSEOPattern && has2025) {
      matches.push({
        lineNum: idx + 1,
        line: line.trim().substring(0, 100),
      });
    }
  });

  if (matches.length === 0) {
    console.log(`\n✅ ${path.basename(filePath)}`);
    console.log(`   Aucune occurrence "2025" dans les blocs SEO\n`);
    return;
  }

  console.log(`\n📄 ${path.basename(filePath)}`);
  console.log(`   ${matches.length} occurrence(s) a modifier\n`);
  console.log(`   ${"─".repeat(66)}`);

  matches.forEach((match, idx) => {
    console.log(`\n   ${idx + 1}. Ligne ${match.lineNum}`);
    console.log(`      ${match.line}...`);
    console.log(`      Action: 2025 → 2026`);
  });

  console.log(`\n   ${"─".repeat(66)}\n`);

  totalMatches += matches.length;
});

console.log(`
${"═".repeat(70)}

📊 RESUME:
   Total modifications SEO necessaires: ${totalMatches}
   
   A faire en janvier 2026 :
   ✓ Verifier les sources officielles
   ✓ Remplacer "2025" par "2026" dans les blocs SEO
   ✓ Tester les calculateurs
   ✓ Verifier les rankings SEO

📝 COMMANDE POUR MODIFIER:
   Utiliser find-and-replace avec ces patterns:
   • "2025" → "2026" (dans titles, descriptions, keywords, schema)
   • "bareme officiel 2025" → "bareme officiel 2026"
   • "frais notaire 2025" → "frais notaire 2026"

${"═".repeat(70)}
`);
