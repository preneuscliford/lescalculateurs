#!/usr/bin/env node
/**
 * Ajoute une section "Hypotheses et Avertissements" pour plus de transparence
 */

const fs = require("fs");
const glob = require("glob");
const path = require("path");

const blogFiles = glob
  .sync("src/pages/blog/departements/frais-notaire-*.html")
  .sort();

console.log(
  `\n⚠️  Ajout de la section "Hypotheses et Avertissements" pour ${blogFiles.length} pages\n`
);

const disclaimerSection = `
        <!-- Hypotheses et Avertissements -->
        <div class="mt-12 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <h3 class="font-bold text-yellow-900 mb-4">⚠️ Hypotheses et Limitations</h3>
          
          <div class="text-sm text-yellow-800 space-y-3">
            <p><strong>Ce simulateur est une estimation basee sur:</strong></p>
            <ul class="list-disc list-inside space-y-2 ml-2">
              <li><strong>Baremes officiels 2024-2025</strong> du Conseil Superieur du Notariat</li>
              <li><strong>Debours moyens</strong> (cadastre, conservation, formalites) pour le departement</li>
              <li><strong>Taux standard</strong> sans abattements ou particularites locales</li>
              <li><strong>Immobilier a titre onereux</strong> (achat classique)</li>
            </ul>

            <p className="mt-4"><strong>⚠️ Ecarts possibles:</strong></p>
            <ul class="list-disc list-inside space-y-2 ml-2">
              <li>Les debours reels varient selon le dossier (geometre, copies supplementaires, etc.)</li>
              <li>Certains departements appliquent des taux ou abattements particuliers</li>
              <li>Les droits de mutation peuvent differer (ex: zones d'amenagement du territoire)</li>
              <li>Cas speciaux non couverts (VEFA, SCI, demembrement, etc.)</li>
            </ul>

            <p class="mt-4 text-yellow-900"><strong>👉 Pour un devis exact:</strong> Contactez directement le notaire de votre region - c'est gratuit et sans engagement.</p>
          </div>
        </div>
`;

let updated = 0;
let errors = [];

blogFiles.forEach((file) => {
  const filename = path.basename(file);
  let content = fs.readFileSync(file, "utf-8");

  // Verifier si la section existe deja
  if (content.includes("Hypotheses et Avertissements")) {
    console.log(`⏭️  ${filename} (deja present)`);
    return;
  }

  // Chercher l'endroit pour inserer (avant "Sources et references")
  const insertMarker = "<!-- References -->";
  const insertIndex = content.indexOf(insertMarker);

  if (insertIndex === -1) {
    errors.push(`${filename}: Marker "<!-- References -->" non trouve`);
    return;
  }

  // Inserer la section
  content =
    content.substring(0, insertIndex) +
    disclaimerSection +
    "\n        " +
    content.substring(insertIndex);

  // Ecrire le fichier
  fs.writeFileSync(file, content);
  updated++;
  console.log(`✅ ${filename}`);
});

console.log(`\n${"─".repeat(70)}`);
console.log(`✅ ${updated}/${blogFiles.length} fichiers mis a jour`);

if (errors.length > 0) {
  console.log(`\n⚠️  Erreurs:`);
  errors.forEach((e) => console.log(`   - ${e}`));
}
