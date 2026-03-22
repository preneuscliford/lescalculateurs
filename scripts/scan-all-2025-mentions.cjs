#!/usr/bin/env node
/**
 * Script pour identifier TOUTES les mentions "2025" sur les pages notaire
 * Inclut SEO ET contenu visible
 */

const fs = require("fs");
const path = require("path");

const files = [
  { path: "src/pages/notaire.html", name: "Calculateur Notaire" },
  {
    path: "src/pages/blog/frais-notaire-departements.html",
    name: "Blog Frais Notaire Departements",
  },
  { path: "src/pages/sources.html", name: "Sources Officielles" },
];

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔍 SCAN COMPLET - Toutes les Mentions "2025"                  ║
╚════════════════════════════════════════════════════════════════╝
`);

const categoryMap = {
  seo: "🔍 SEO (Meta/Schema)",
  visible: "👁️ Contenu Visible",
  data: "📊 Donnees Officielles",
};

let totalByCategory = {
  seo: 0,
  visible: 0,
  data: 0,
};

files.forEach((file) => {
  const fullPath = path.resolve(path.join(process.cwd(), file.path));

  if (!fs.existsSync(fullPath)) {
    console.log(`\n⚠️  ${file.name}: Fichier non trouve\n`);
    return;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");
  const matches = {
    seo: [],
    visible: [],
    data: [],
  };

  lines.forEach((line, idx) => {
    if (!line.includes("2025")) return;

    const lineNum = idx + 1;
    const trimmed = line.trim().substring(0, 120);

    // Categoriser
    if (
      line.includes("<meta") ||
      line.includes('"headline"') ||
      line.includes('"description"') ||
      line.includes("<title>") ||
      line.includes('property="og:')
    ) {
      matches.seo.push({ lineNum, line: trimmed });
      totalByCategory.seo++;
    } else if (
      line.includes("bareme") ||
      line.includes("emolument") ||
      line.includes("tranches") ||
      line.includes("taux") ||
      line.includes("0.0387") ||
      line.includes("0.01596") ||
      line.includes("effective_date")
    ) {
      matches.data.push({ lineNum, line: trimmed });
      totalByCategory.data++;
    } else if (line.includes("<h") || line.includes("<p") || line.includes(">")) {
      matches.visible.push({ lineNum, line: trimmed });
      totalByCategory.visible++;
    }
  });

  if (
    matches.seo.length === 0 &&
    matches.visible.length === 0 &&
    matches.data.length === 0
  ) {
    console.log(`\n✅ ${file.name}`);
    console.log(`   Aucune mention "2025" trouvee\n`);
    return;
  }

  console.log(`\n📄 ${file.name}`);
  const total =
    matches.seo.length + matches.visible.length + matches.data.length;
  console.log(`   Total: ${total} occurrence(s)\n`);

  // SEO
  if (matches.seo.length > 0) {
    console.log(`   ${categoryMap.seo} (${matches.seo.length}):`);
    matches.seo.slice(0, 3).forEach((m) => {
      console.log(`      L${m.lineNum}: ${m.line}...`);
    });
    if (matches.seo.length > 3) {
      console.log(`      ... et ${matches.seo.length - 3} autres`);
    }
    console.log();
  }

  // Contenu visible
  if (matches.visible.length > 0) {
    console.log(`   ${categoryMap.visible} (${matches.visible.length}):`);
    matches.visible.slice(0, 3).forEach((m) => {
      console.log(`      L${m.lineNum}: ${m.line}...`);
    });
    if (matches.visible.length > 3) {
      console.log(`      ... et ${matches.visible.length - 3} autres`);
    }
    console.log();
  }

  // Donnees officielles
  if (matches.data.length > 0) {
    console.log(
      `   ${categoryMap.data} - A NE PAS MODIFIER (${matches.data.length}):`
    );
    matches.data.slice(0, 2).forEach((m) => {
      console.log(`      L${m.lineNum}: ${m.line}...`);
    });
    if (matches.data.length > 2) {
      console.log(`      ... et ${matches.data.length - 2} autres`);
    }
    console.log();
  }

  console.log(`   ${"─".repeat(66)}\n`);
});

console.log(`
${"═".repeat(70)}

📊 SYNTHÈSE COMPLÈTE:

   ${categoryMap.seo}
   → ${totalByCategory.seo} modifications (2025 → 2026)

   ${categoryMap.visible}
   → ${totalByCategory.visible} modifications (2025 → 2026)

   ${categoryMap.data}
   → ${totalByCategory.data} occurrences (A LAISSER INTACTES)

${"═".repeat(70)}

✅ A FAIRE EN JANVIER 2026:

   1️⃣  Verifier les sources officielles
   2️⃣  Remplacer ${totalByCategory.seo + totalByCategory.visible} occurrences "2025" → "2026"
   3️⃣  Laisser les ${totalByCategory.data} donnees officielles inchangees
   4️⃣  Tester les calculateurs
   5️⃣  Verifier SEO rankings

${"═".repeat(70)}
`);
