/**
 * Script pour corriger la section DMTO avec les taux officiels 2026
 */

const fs = require("fs");
const path = require("path");

const notaireFile = path.join(__dirname, "../src/pages/notaire.html");

let content = fs.readFileSync(notaireFile, "utf8");

// Correction 1: "3,80 % (56, 57, 67, 68)" -> "5,09 % (36 Indre, 976 Mayotte)"
content = content.replace(
  /3,80&nbsp;% \(56, 57, 67, 68\)/g,
  "5,09&nbsp;% (36 Indre, 976 Mayotte)",
);

// Correction 2: "6,45 % (92, 93, 94)" -> "6,32 % (87 departements au taux majore)"
content = content.replace(
  /6,45&nbsp;% \(92, 93, 94\)/g,
  "6,32&nbsp;% (87 departements au taux majore)",
);

// Correction 3: "Paris (75) applique un taux de 5,81 %" -> "Paris (75) applique le taux majore de 6,32 %"
content = content.replace(
  /Paris \(75\) applique\s+un taux de <strong>5,81&nbsp;%<\/strong>/g,
  "Paris (75) applique le taux majore de <strong>6,32&nbsp;%</strong>",
);

// Correction 4: "6,32 % (standard)" -> "5,80 % (standard : 12 departements)"
content = content.replace(
  /6,32&nbsp;% \(standard\)/g,
  "5,80&nbsp;% (standard : 12 departements)",
);

// Correction 5: "5,09 % (reduit)" -> "5,09 % (reduit : 36, 976)"
content = content.replace(
  /5,09&nbsp;% \(reduit\)&nbsp;/g,
  "5,09&nbsp;% (reduit : 36, 976)&nbsp;",
);

// Correction 6: Ajouter ligne majore et corriger le calcul
// "6,45 % (92, 93, 94) -> 16 125 €" devient "6,32 % (majore : 87 departements) -> 15 800 €"
content = content.replace(
  /6,45&nbsp;% \(92, 93, 94\)&nbsp;→&nbsp;<strong\s*>16&nbsp;125&nbsp;€<\/strong/g,
  "6,32&nbsp;% (majore : 87 departements)&nbsp;→&nbsp;<strong>15&nbsp;800&nbsp;€</strong",
);

// Correction 7: "Ecart maximal : 6 625 €" -> "Ecart maximal : 3 075 €" (15800 - 12725 = 3075)
content = content.replace(
  /6&nbsp;625&nbsp;€<\/strong>\s+sur les seuls droits/g,
  "3&nbsp;075&nbsp;€</strong> sur les seuls droits",
);

// Correction 8: La ligne standard 15 800 € doit devenir 14 500 € (5,80% de 250000)
content = content.replace(
  /5,80&nbsp;% \(standard : 12 departements\)&nbsp;→&nbsp;<strong\s*>15&nbsp;800&nbsp;€<\/strong/g,
  "5,80&nbsp;% (standard : 12 departements)&nbsp;→&nbsp;<strong>14&nbsp;500&nbsp;€</strong",
);

fs.writeFileSync(notaireFile, content, "utf8");

console.log("✅ Section DMTO corrigee avec les taux officiels 2026");
console.log("   - 5,09% (reduit) : 36 Indre, 976 Mayotte");
console.log("   - 5,80% (standard) : 12 departements");
console.log("   - 6,32% (majore) : 87 departements");
console.log("   - Paris : 6,32% (majore)");
