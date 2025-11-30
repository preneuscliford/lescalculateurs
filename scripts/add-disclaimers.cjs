#!/usr/bin/env node
/**
 * Ajoute une section "Hypothèses et Avertissements" pour plus de transparence
 */

const fs = require("fs");
const glob = require("glob");
const path = require("path");

const blogFiles = glob
  .sync("src/pages/blog/departements/frais-notaire-*.html")
  .sort();

console.log(
  `\n⚠️  Ajout de la section "Hypothèses et Avertissements" pour ${blogFiles.length} pages\n`
);

const disclaimerSection = `
        <!-- Hypothèses et Avertissements -->
        <div class="mt-12 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <h3 class="font-bold text-yellow-900 mb-4">⚠️ Hypothèses et Limitations</h3>
          
          <div class="text-sm text-yellow-800 space-y-3">
            <p><strong>Ce simulateur est une estimation basée sur:</strong></p>
            <ul class="list-disc list-inside space-y-2 ml-2">
              <li><strong>Barèmes officiels 2024-2025</strong> du Conseil Supérieur du Notariat</li>
              <li><strong>Débours moyens</strong> (cadastre, conservation, formalités) pour le département</li>
              <li><strong>Taux standard</strong> sans abattements ou particularités locales</li>
              <li><strong>Immobilier à titre onéreux</strong> (achat classique)</li>
            </ul>

            <p className="mt-4"><strong>⚠️ Écarts possibles:</strong></p>
            <ul class="list-disc list-inside space-y-2 ml-2">
              <li>Les débours réels varient selon le dossier (géomètre, copies supplémentaires, etc.)</li>
              <li>Certains départements appliquent des taux ou abattements particuliers</li>
              <li>Les droits de mutation peuvent différer (ex: zones d'aménagement du territoire)</li>
              <li>Cas spéciaux non couverts (VEFA, SCI, démembrement, etc.)</li>
            </ul>

            <p class="mt-4 text-yellow-900"><strong>👉 Pour un devis exact:</strong> Contactez directement le notaire de votre région — c'est gratuit et sans engagement.</p>
          </div>
        </div>
`;

let updated = 0;
let errors = [];

blogFiles.forEach((file) => {
  const filename = path.basename(file);
  let content = fs.readFileSync(file, "utf-8");

  // Vérifier si la section existe déjà
  if (content.includes("Hypothèses et Avertissements")) {
    console.log(`⏭️  ${filename} (déjà présent)`);
    return;
  }

  // Chercher l'endroit pour insérer (avant "Sources et références")
  const insertMarker = "<!-- Références -->";
  const insertIndex = content.indexOf(insertMarker);

  if (insertIndex === -1) {
    errors.push(`${filename}: Marker "<!-- Références -->" non trouvé`);
    return;
  }

  // Insérer la section
  content =
    content.substring(0, insertIndex) +
    disclaimerSection +
    "\n        " +
    content.substring(insertIndex);

  // Écrire le fichier
  fs.writeFileSync(file, content);
  updated++;
  console.log(`✅ ${filename}`);
});

console.log(`\n${"─".repeat(70)}`);
console.log(`✅ ${updated}/${blogFiles.length} fichiers mis à jour`);

if (errors.length > 0) {
  console.log(`\n⚠️  Erreurs:`);
  errors.forEach((e) => console.log(`   - ${e}`));
}
