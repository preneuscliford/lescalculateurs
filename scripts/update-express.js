const fs = require("fs");

const path = "scripts/generate-departement-articles.js";
let content = fs.readFileSync(path, "utf8");

// Find and replace the old blocks section with new enriched version
const oldPattern =
  /\/\/ Assemble blocks[\s\S]*?const bodyHtml = bodyBlocks\.map\(\(b\) => blockMap\[b\]\)\.join\("\\n\\n"\);/;

const newCode = `  // Build 6 enriched content blocks with H2 headers + emoji + bold data
  const briefHtml = \`
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-gray-900">💳 Frais notaire en \${dep.nom}</h2>
      <p class="text-gray-700"><strong>Ancien :</strong> \${ancienRate} | <strong>Neuf :</strong> \${neufRate} | <strong>Prix m² moyen :</strong> \${dep.prixM2} €</p>
    </div>
  \`;

  const tableHtml = \`
    <div class="space-y-3">
      <h2 class="text-2xl font-bold text-gray-900">📊 Tarifs officiels 2025</h2>
      <table class="w-full border rounded text-sm">
        <thead class="bg-blue-600 text-white">
          <tr><th class="px-3 py-2 text-left">Type</th><th class="px-3 py-2 text-left">Pour 200 000 €</th></tr>
        </thead>
        <tbody>
          <tr class="border-t"><td class="px-3 py-2">Ancien</td><td class="px-3 py-2"><strong>11 754 €</strong> (≈ \${ancienRate})</td></tr>
          <tr class="border-t"><td class="px-3 py-2">Neuf (VEFA)</td><td class="px-3 py-2"><strong>4 154 €</strong> (≈ \${neufRate})</td></tr>
        </tbody>
      </table>
    </div>
  \`;

  const exampleHtml = \`
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-gray-900">🔢 Exemple local : \${dep.ville1}</h2>
      <p class="text-gray-700">Achat à <strong>96 000 €</strong> → Frais : <strong>≈ 6 077 €</strong> (barème officiel). Prix m² : <strong>\${dep.prixM2} €</strong>.</p>
    </div>
  \`;

  const astuceHtml = \`
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-gray-900">💡 Astuce pratique</h2>
      <p class="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm">\${astuce}</p>
    </div>
  \`;

  const faqHtml = \`
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-gray-900">❓ Question fréquente</h2>
      <p class="text-gray-700"><strong>Q :</strong> \${faq.q}</p>
      <p class="text-gray-700 ml-4"><strong>A :</strong> \${faq.a}</p>
    </div>
  \`;

  const infoLocaleHtml = \`
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-gray-900">📍 Info \${dep.region}</h2>
      <p class="text-gray-700"><strong>Département :</strong> \${dep.nom} (\${dep.code}) | <strong>Grandes villes :</strong> \${dep.ville1}, \${dep.ville2} | <strong>Tarif local :</strong> régularisé annuellement.</p>
    </div>
  \`;

  const sourcesHtml = \`<footer class="text-xs text-gray-500 mt-8">Mis à jour le \${dateModifiedFR} · Sources: DVF, Notaires</footer>\`;

  // Block map with 6 enriched blocks
  const blockMap = {
    brief: briefHtml,
    table: tableHtml,
    example: exampleHtml,
    astuce: astuceHtml,
    faq: faqHtml,
    info: infoLocaleHtml,
  };

  // Deterministically select 5-6 blocks per department
  const numBlocks = pick([5, 6], seed, 0);
  const allBlockKeys = Object.keys(blockMap);
  const selectedBlockKeys = allBlockKeys.slice(0, numBlocks);
  const bodyHtml = selectedBlockKeys.map((key) => blockMap[key]).join("\\n");`;

if (oldPattern.test(content)) {
  content = content.replace(oldPattern, newCode);

  // Also update the return statement to add space-y-8
  content = content.replace(
    '<section class="mb-6">${bodyHtml}</section>',
    '<section class="mb-8 space-y-8">${bodyHtml}</section>'
  );

  fs.writeFileSync(path, content, "utf8");
  console.log("✅ Update successful!");
  process.exit(0);
} else {
  console.log("❌ Pattern not found in file");
  process.exit(1);
}
