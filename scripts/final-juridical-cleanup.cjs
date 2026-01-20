/**
 * Final Juridical Cleanup Script - Phase 2
 * Removes ALL fixed euro amounts from editorial content
 * Rule: "La page explique. Le calculateur chiffre. Jamais l'inverse."
 */

const fs = require("fs");
const path = require("path");

const folder = path.join(
  __dirname,
  "..",
  "src",
  "pages",
  "blog",
  "departements",
);

// CTA replacement block for simulation sections
const ctaBlock = `<!-- CTA Section - Simulation -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 mb-12 text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📊 Calculez vos frais de notaire</h2>
          <p class="text-gray-700 mb-6">Chaque projet est unique : prix, type de bien, commune... Pour obtenir une estimation adaptée à votre situation, utilisez notre simulateur.</p>
          <a href="/pages/notaire.html" class="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            Accéder au simulateur de frais →
          </a>
        </div>`;

// Tip block for economy mentions
const tipBlock = `<strong>💡 Bon à savoir :</strong> Acheter dans le neuf (VEFA) permet généralement de réduire significativement les frais de notaire par rapport à l'ancien. <a href="/pages/notaire.html" class="text-blue-600 hover:underline">Comparez avec notre simulateur</a>.`;

let totalFixed = 0;

fs.readdirSync(folder)
  .filter((f) => f.endsWith(".html"))
  .forEach((file) => {
    const filePath = path.join(folder, file);
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;
    let fixes = 0;

    // 1. Replace "📊 Exemple de calcul concret" section entirely
    const examplePattern =
      /<h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">\s*📊 Exemple de calcul concret[\s\S]*?<!-- Section 3 -->/g;
    content = content.replace(
      examplePattern,
      ctaBlock + "\n\n        <!-- Section 3 -->",
    );

    // 1b. Replace "🏠 Simulation d'achat immobilier" sections
    const simPattern =
      /<h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">\s*🏠 Simulation d'achat immobilier[\s\S]*?<!-- Section 3 -->/g;
    content = content.replace(
      simPattern,
      ctaBlock + "\n\n        <!-- Section 3 -->",
    );

    // 2. Remove Débours indicatifs block
    const deboursPattern =
      /<div class="bg-white border border-gray-200 rounded-lg p-4 mb-8">\s*<p class="text-sm text-gray-700">\s*<strong>Débours indicatifs[^<]*<\/strong>[^<]*<strong>\d+[\s\d]*€<\/strong>[^<]*<strong>\d+[\s\d]*€<\/strong>[^<]*<\/p>\s*<\/div>/g;
    content = content.replace(deboursPattern, "");

    // 3. Replace "X € d'économie pour un bien à Y €" patterns
    content = content.replace(
      /<strong>[\d\s]+€ d'économie<\/strong> pour un bien à [\d\s]+€/g,
      "<strong>une économie significative</strong> sur votre achat",
    );

    // 4. Replace "vous ne paieriez que X €, soit une économie de Y €"
    content = content.replace(
      /vous ne\s*paieriez que <strong>[\d\s]+€<\/strong>, soit une économie de\s*<strong>[\d\s]+€<\/strong>/g,
      'vous réaliseriez une <strong>économie significative</strong>. <a href="/pages/notaire.html" class="text-blue-600">Simulez votre projet</a>',
    );

    // 5. Replace "économiser 200-500 €" type patterns
    content = content.replace(
      /économiser [\d]+-[\d]+ €/g,
      "réaliser des économies",
    );

    // 6. Replace any standalone amounts like "100 000 €" or "198 000 €" in strong tags (not in barème)
    content = content.replace(
      /<strong>[\d\s]+€<\/strong>\.\s*(?!De |à )/g,
      (match) => {
        // Check if this is in a barème context
        if (
          match.includes("6 500") ||
          match.includes("17 000") ||
          match.includes("60 000") ||
          match.includes("min 15")
        ) {
          return match;
        }
        return "<strong>variable selon le secteur</strong>. ";
      },
    );

    // 7. Replace Prix médians DVF patterns
    content = content.replace(
      /<strong>[\d\s]+€<\/strong>\. Pour contacter un professionnel/g,
      "<strong>variable selon le secteur</strong>. Pour contacter un professionnel",
    );

    // 8. Clean up cadastre/conservation amounts
    content = content.replace(
      /cadastre\s*≈\s*<strong>[\d\s]+€<\/strong>/g,
      "cadastre : <strong>variable</strong>",
    );
    content = content.replace(
      /conservation\s*≈\s*<strong>[\d\s]+€<\/strong>/g,
      "conservation : <strong>variable</strong>",
    );

    // 9. Replace any remaining "jusqu'à X €" patterns
    content = content.replace(
      /jusqu'à\s*<strong>[\d\s]+€<\/strong>/g,
      "<strong>une réduction significative</strong>",
    );
    content = content.replace(
      /jusqu'à\s*[\d\s]+€/g,
      "une réduction significative",
    );

    // 10. Replace "l'écart ... peut représenter" economy mentions with generic text
    content = content.replace(
      /l'écart entre ancien et\s*neuf peut représenter jusqu'à\s*<strong>[\d\s]+€ d'économie<\/strong> pour un bien à [\d\s]+€/g,
      'l\'écart entre ancien et neuf peut représenter <strong>une économie significative</strong>. <a href="/pages/notaire.html" class="text-blue-600 hover:underline">Comparez avec notre simulateur</a>',
    );

    // 11. General pattern for "X € d'économie"
    content = content.replace(/[\d\s]+€ d'économie/g, "une économie notable");

    // 12. Pattern for "pour un bien à X €"
    content = content.replace(
      /pour un bien à [\d\s]+€/g,
      "selon le prix du bien",
    );

    // 13. Prix au m² patterns
    content = content.replace(
      /<strong>[\d\s]+€ par mètre carré<\/strong>/g,
      "<strong>un prix variable selon les communes</strong>",
    );
    content = content.replace(
      /[\d\s]+€ par mètre carré/g,
      "un prix variable selon les communes",
    );
    content = content.replace(/≈\s*[\d\s]+€\/m²/g, "variable");
    content = content.replace(
      /<strong>[\d\s]+€\/mois<\/strong>/g,
      '<a href="/pages/pret.html" class="text-blue-600 hover:underline font-bold">Calculer</a>',
    );
    content = content.replace(
      /≈\s*[\d\s]+€\/mois/g,
      '<a href="/pages/pret.html" class="text-blue-600 hover:underline">Calculer</a>',
    );

    // 14. Economy patterns with "soit une économie de"
    content = content.replace(
      /soit une économie de\s*<strong>[\d\s]+€<\/strong>/g,
      "soit une économie significative",
    );
    content = content.replace(
      /soit une économie de\s*<strong>variable/g,
      'soit une économie significative. <a href="/pages/notaire.html" class="text-blue-600 hover:underline">Simulez</a',
    );

    // 15. "les frais tomberaient à seulement X €"
    content = content.replace(
      /les frais tomberaient\s*à seulement <strong>[\d\s]+€<\/strong>/g,
      "les frais seraient <strong>nettement réduits</strong>",
    );

    // 16. "💡 Cas pratique" sections with amounts - replace whole section
    const casPratiquePattern =
      /<h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">\s*💡 Cas pratique[\s\S]*?<!-- Section 3 -->/g;
    content = content.replace(
      casPratiquePattern,
      ctaBlock + "\n\n        <!-- Section 3 -->",
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed: ${file}`);
      totalFixed++;
    }
  });

console.log(`\n✅ Total files fixed: ${totalFixed}`);
