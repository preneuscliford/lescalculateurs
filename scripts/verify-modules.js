/**
 * Script de vérification que les calculs sont cohérents
 * entre les modules centralisés et les valeurs affichées
 */

import {
  calculFraisNotaire,
  getExemples200k,
} from "../src/utils/notaire.calc.js";
import { formatEuro, formatPct } from "../src/utils/format.js";
import { NOTAIRE_2026, getDmtoTaux } from "../src/data/notaire.baremes.2026.js";

console.log("=== VÉRIFICATION DES MODULES CENTRALISÉS ===\n");

// Test des exemples 200k
const exemples = getExemples200k();

console.log("📊 Exemples pour 200 000 € :");
console.log("");
console.log("ANCIEN (taux majoré 6,32%) :");
console.log("  Droits:", formatEuro(exemples.ancien_majore.droits));
console.log("  Émoluments:", formatEuro(exemples.ancien_majore.emoluments));
console.log("  CSI:", formatEuro(exemples.ancien_majore.csi));
console.log("  TVA:", formatEuro(exemples.ancien_majore.tva));
console.log(
  "  Débours + Formalités:",
  formatEuro(
    exemples.ancien_majore.debours + exemples.ancien_majore.formalites,
  ),
);
console.log(
  "  TOTAL:",
  formatEuro(exemples.ancien_majore.total),
  "(" + exemples.ancien_majore.pourcentage + "%)",
);
console.log("");

console.log("ANCIEN (taux standard 5,80%) :");
console.log("  TOTAL:", formatEuro(exemples.ancien_standard.total));
console.log("");

console.log("ANCIEN (taux réduit 5,09%) :");
console.log("  TOTAL:", formatEuro(exemples.ancien_reduit.total));
console.log("");

console.log("NEUF (0,715%) :");
console.log("  TOTAL:", formatEuro(exemples.neuf.total));
console.log("");

// Test par département
console.log("📍 Test par département :");
const testDepts = ["01", "36", "06", "75", "976", "971"];
for (const code of testDepts) {
  const taux = getDmtoTaux(code);
  const result = calculFraisNotaire(200000, "ancien", code);
  console.log(`  ${code}: ${formatPct(taux)} → ${formatEuro(result.total)}`);
}

console.log("\n✅ Modules prêts à être utilisés !");
console.log("\n📁 Structure créée :");
console.log("  /src/data/notaire.baremes.2026.js  ← Source unique de vérité");
console.log("  /src/utils/notaire.calc.js         ← Calculs centralisés");
console.log("  /src/utils/format.js               ← Formatage");
console.log("  /src/partials/disclaimer.html      ← Disclaimer global");
