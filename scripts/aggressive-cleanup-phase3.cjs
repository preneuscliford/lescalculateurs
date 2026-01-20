/**
 * AGGRESSIVE Final Cleanup - Phase 3
 * Rule: "La page explique. Le calculateur chiffre. Jamais l'inverse."
 *
 * ONLY KEEP: Barème tranches (0€ à 6 500€, 6 500€ à 17 000€, 17 000€ à 60 000€, 60 000€, min 15€)
 * REMOVE ALL OTHER € AMOUNTS
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

// Define patterns that are ACCEPTABLE (barème officiel)
const acceptablePatterns = [
  /De 0€ à 6\s*500€/,
  /De 6\s*500€ à 17\s*000€/,
  /De 17\s*000€ à 60\s*000€/,
  /Au-delà de 60\s*000€/,
  /min 15€/,
];

function isAcceptable(context) {
  return acceptablePatterns.some((p) => p.test(context));
}

let totalFixed = 0;

fs.readdirSync(folder)
  .filter((f) => f.endsWith(".html"))
  .forEach((file) => {
    const filePath = path.join(folder, file);
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    // 1. Clean FAQ Schema.org amounts in text fields
    content = content.replace(/"text":\s*"[^"]*\d[\d\s]*€[^"]*"/g, (match) => {
      if (isAcceptable(match)) return match;
      // Replace amounts with generic text
      return match.replace(/\d[\d\s]*€/g, "selon votre projet");
    });

    // 2. Remove "exemple 200 000 €" patterns
    content = content.replace(/\(exemple\s*[\d\s]+€\)/gi, "");
    content = content.replace(/exemple\s*[\d\s]+€/gi, "par exemple");

    // 3. Replace "atteint environ X €" patterns (prix au m²)
    content = content.replace(
      /atteint environ\s*<strong>[\d\s]+€<\/strong>/g,
      "varie <strong>selon les communes</strong>",
    );

    // 4. Replace "permettrait de réduire ces frais à environ X €"
    content = content.replace(
      /permettrait de réduire ces frais à environ\s*<strong>[\d\s]+€<\/strong>/g,
      "permettrait de <strong>réduire significativement ces frais</strong>",
    );

    // 5. Replace "générant une économie substantielle de X €"
    content = content.replace(
      /générant une économie substantielle de\s*<strong>[\d\s]+€<\/strong>/g,
      "générant une <strong>économie substantielle</strong>",
    );

    // 6. Replace "frais descendent à X €"
    content = content.replace(
      /frais descendent à\s*<strong>[\d\s]+€<\/strong>/g,
      "frais sont <strong>nettement réduits</strong>",
    );

    // 7. Replace "X € d'économie" or "X € d'écart"
    content = content.replace(
      /<strong>[\d\s]+€<\/strong>\s*d'économie/g,
      "<strong>une économie significative</strong>",
    );
    content = content.replace(
      /<strong>[\d\s]+€<\/strong>\s*d'écart/g,
      "<strong>un écart significatif</strong>",
    );

    // 8. Replace "médiane de prix à X €"
    content = content.replace(
      /médiane de prix à\s*[\d\s]+€/g,
      "prix variable selon les communes",
    );

    // 9. Replace "Sur un achat à X €"
    content = content.replace(/Sur un achat à\s*[\d\s]+€/g, "Sur votre achat");

    // 10. Replace "peut atteindre X € en faveur du neuf"
    content = content.replace(
      /peut atteindre\s*[\d\s]+€\s*en faveur du neuf/g,
      "peut être significatif en faveur du neuf",
    );

    // 11. Replace standalone "X €" in strong tags (not in barème context)
    content = content.replace(
      /<strong>[\d\s]+€<\/strong>(?![\s\S]{0,30}(?:à\s*\d|De\s*\d))/g,
      (match, offset) => {
        // Get surrounding context
        const context = content.substring(
          Math.max(0, offset - 100),
          offset + match.length + 100,
        );
        if (isAcceptable(context)) return match;
        return "<strong>variable</strong>";
      },
    );

    // 12. Clean remaining patterns like "seraient réduits à X €"
    content = content.replace(
      /seraient réduits à\s*<strong>[\d\s]+€<\/strong>/g,
      "seraient <strong>nettement réduits</strong>",
    );

    // 13. Replace "plus de X €" patterns
    content = content.replace(
      /plus de\s*<strong>[\d\s]+€<\/strong>/g,
      "<strong>significativement</strong>",
    );

    // 14. Replace intro patterns with prices "environ X €"
    content = content.replace(
      /environ\s*<strong>[\d\s]+€<\/strong>/g,
      "<strong>un prix variable</strong>",
    );

    // 15. Generic € cleanup in paragraphs (outside barème)
    // Match patterns like "2 700 €" or "200 000 €" in text
    content = content.replace(
      /(\s)(\d{1,3}(?:\s?\d{3})*)\s*€(\s|,|\.|<)/g,
      (match, pre, num, post) => {
        // Skip if in barème context (check nearby text)
        if (/De\s*\d|à\s*\d{1,3}\s*\d{3}|min\s*15/.test(num)) return match;
        return `${pre}un montant variable${post}`;
      },
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed: ${file}`);
      totalFixed++;
    }
  });

console.log(`\n✅ Total files fixed: ${totalFixed}`);
