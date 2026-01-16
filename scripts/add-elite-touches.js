/**
 * Script d'ajout des micro-ajustements "niveau élite"
 * 1. Note explicative sur le % global
 * 2. Ligne EEAT (Expertise/Autorité/Trust)
 */

import fs from "node:fs";
import path from "node:path";

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  // 1. Ajouter note explicative après le tableau des taux
  // Chercher la fin du tableau et ajouter une note
  if (!html.includes("Taux global indicatif")) {
    html = html.replace(
      /(<\/table>\s*<\/div>\s*<p class="text-xs[^"]*text-gray-500[^"]*mt-2[^"]*">)/gi,
      `</table>
          <p class="text-xs text-gray-400 mt-2 italic">* Taux global indicatif incluant droits, émoluments, débours, CSI et TVA.</p>
        </div>
        <p class="text-xs text-gray-500 mt-2">`,
    );
  }

  // 2. Ajouter ligne EEAT avant le footer/fin d'article si pas déjà présente
  if (!html.includes("LesCalculateurs.fr — outil indépendant")) {
    html = html.replace(
      /(<!-- Références -->[\s\S]*?<\/ul>\s*<\/div>)/i,
      `$1
        
        <!-- EEAT Trust Signal -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            Contenu rédigé et maintenu par <strong>LesCalculateurs.fr</strong> — outil indépendant d'estimation immobilière basé sur les barèmes notariaux officiels (Conseil Supérieur du Notariat, impots.gouv.fr, Legifrance).
          </p>
        </div>`,
    );
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }
  return false;
}

function main() {
  console.log("=== AJOUT MICRO-AJUSTEMENTS ÉLITE ===\n");

  const dir = path.resolve(
    process.cwd(),
    "src",
    "pages",
    "blog",
    "departements",
  );
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

  let updated = 0;
  for (const f of files) {
    if (processFile(path.join(dir, f))) {
      updated++;
    }
  }

  console.log(`✓ ${updated} fichiers mis à jour avec:`);
  console.log('  • Note explicative "Taux global indicatif..."');
  console.log("  • Signal EEAT (Expertise/Autorité/Trust)");
}

main();
