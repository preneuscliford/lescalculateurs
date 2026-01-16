/**
 * Script pour corriger toutes les références 2025 -> 2026 et les taux DMTO incorrects
 */

const fs = require('fs');
const path = require('path');

const notaireFile = path.join(__dirname, '../src/pages/notaire.html');

let content = fs.readFileSync(notaireFile, 'utf8');
let changes = 0;

// ========================================
// 1. Remplacer 2025 par 2026 partout
// ========================================

// Titre et meta tags
content = content.replace(/Frais de Notaire 2025/g, 'Frais de Notaire 2026');
content = content.replace(/frais de notaire 2025/g, 'frais de notaire 2026');
content = content.replace(/frais notaire 2025/g, 'frais notaire 2026');
content = content.replace(/Barème officiel 2025/g, 'Barème officiel 2026');
content = content.replace(/Barèmes 2025/g, 'Barèmes 2026');
content = content.replace(/barèmes officiels 2025/g, 'barèmes officiels 2026');
content = content.replace(/en 2025/g, 'en 2026');
changes++;

// ========================================
// 2. Corriger la source BOFiP -> impots.gouv.fr
// ========================================

content = content.replace(
  /<a\s+href="https:\/\/bofip\.impots\.gouv\.fr\/bofip\/4739-PGP\.html"\s+target="_blank"\s+rel="nofollow noopener"\s+class="text-blue-700 underline"\s*>BOFiP — Taux DMTO départementaux<\/a/g,
  `<a href="https://www.impots.gouv.fr/droits-denregistrement" target="_blank" rel="nofollow noopener" class="text-blue-600 underline">impots.gouv.fr</a> &amp; <a href="https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/nid_11316_dmto_2026-01-01.pdf" target="_blank" rel="nofollow noopener" class="text-blue-600 underline">PDF DMTO 2026</a`
);
changes++;

// ========================================
// 3. Corriger les taux erronés dans les FAQ
// ========================================

// FAQ 1: "3,80% à 6,45%" -> "5,09% à 6,32%"
content = content.replace(/≈ 3,80% à ≈ 6,45%/g, '5,09% à 6,32%');
content = content.replace(/3,80% à 6,45%/g, '5,09% à 6,32%');

// FAQ comparaison: "3,80% à 6,45%" 
content = content.replace(/≈ 3,80% à ≈ 6,45%/g, '5,09% à 6,32%');

// FAQ différences départements - correction complète
content = content.replace(
  /≈ 3,80% \(Bas‑Rhin\/Haut‑Rhin, Morbihan\), ≈ 4,50% \(Corse\s+2A\/2B\), ≈ 5,81% \(Paris\) et ≈ 6,45% \(92\/93\/94\)/g,
  '5,09% (36 Indre, 976 Mayotte), 5,80% (12 départements dont 05, 06, 971, 972) et 6,32% (87 départements dont Paris, IDF)'
);

// Corriger "≈ 5,80%" -> "5,80% à 6,32%"
content = content.replace(/≈ 5,80%\./g, '5,80% à 6,32%.');

changes++;

// ========================================
// 4. Vérification finale
// ========================================

fs.writeFileSync(notaireFile, content, 'utf8');

console.log('✅ Corrections effectuées sur notaire.html:');
console.log('   - Toutes les références 2025 → 2026');
console.log('   - Source BOFiP → impots.gouv.fr & PDF DMTO 2026');
console.log('   - FAQ: taux corrigés (5,09% à 6,32%)');
console.log('   - FAQ: départements corrigés');

// Compter les occurrences restantes de 2025
const remaining2025 = (content.match(/2025/g) || []).length;
console.log(`\n📊 Occurrences "2025" restantes: ${remaining2025}`);
if (remaining2025 > 0) {
  console.log('   (Note: certaines peuvent être légitimes comme "art. 116 LF 2025")');
}
