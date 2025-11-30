#!/usr/bin/env node
/**
 * Ajoute une section "Tarifs Officiels 2024-2025" à chaque page blog
 * Affiche les données du barème officiel pour chaque département
 */

const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Charger les données des départements
const departementsObj = JSON.parse(fs.readFileSync('src/data/departements.json', 'utf-8'));

// Données des barèmes officiels 2024-2025
const tranches = [
  { min: 0, max: 6500, taux: 0.0387, label: 'De 0€ à 6 500€' },
  { min: 6500, max: 17000, taux: 0.01596, label: 'De 6 500€ à 17 000€' },
  { min: 17000, max: 60000, taux: 0.01064, label: 'De 17 000€ à 60 000€' },
  { min: 60000, max: 999999999, taux: 0.00799, label: 'Au-delà de 60 000€' }
];

const blogFiles = glob.sync('src/pages/blog/departements/frais-notaire-*.html').sort();

console.log(`\n📋 Ajout des tarifs officiels 2024-2025 pour ${blogFiles.length} départements\n`);

let updated = 0;
let errors = [];

blogFiles.forEach(file => {
  const filename = path.basename(file);
  const match = filename.match(/frais-notaire-(.+)\.html/);
  if (!match) return;

  const deptCode = match[1];
  const dept = departementsObj[deptCode];
  if (!dept) {
    errors.push(`${filename}: Département non trouvé`);
    return;
  }

  let content = fs.readFileSync(file, 'utf-8');

  // Générer la section tarifs officiels
  const tarifSection = `
        <!-- Tarifs Officiels 2024-2025 -->
        <div class="mt-12 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <h3 class="font-bold text-blue-900 mb-4">💼 Tarifs Officiels 2024-2025 (${dept.nom})</h3>
          
          <!-- Tranches d'émoluments -->
          <div class="mb-6">
            <h4 class="font-semibold text-blue-800 mb-3">Émoluments notariaux (tranches)</h4>
            <div class="space-y-2 bg-white rounded p-4">
              ${tranches.map(t => `
              <div class="flex justify-between items-center py-2 border-b last:border-b-0">
                <span class="text-gray-700">${t.label}</span>
                <span class="font-mono bg-blue-100 px-3 py-1 rounded">${(t.taux * 100).toFixed(2)}%</span>
              </div>
              `).join('')}
            </div>
            <p class="text-xs text-gray-600 mt-2">Source: <a href="https://www.notaires.fr" target="_blank" class="text-blue-600 hover:underline">Conseil Supérieur du Notariat</a></p>
          </div>

          <!-- Tarif droits d'enregistrement -->
          <div class="mb-6">
            <h4 class="font-semibold text-blue-800 mb-3">Droits d'enregistrement (${dept.nom})</h4>
            <div class="bg-white rounded p-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-700">Immobilier ancien</span>
                <span class="font-mono bg-green-100 px-3 py-1 rounded">${(dept.tauxDroits * 100).toFixed(2)}%</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="text-gray-700">Immobilier neuf (TFPB)</span>
                <span class="font-mono bg-green-100 px-3 py-1 rounded">0,71%</span>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-2">Taux applicable au département: <strong>${dept.nom}</strong></p>
          </div>

          <!-- Débours et formalités -->
          <div>
            <h4 class="font-semibold text-blue-800 mb-3">Débours et formalités (${dept.nom})</h4>
            <div class="space-y-2 bg-white rounded p-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-700">Cadastre (ancien)</span>
                <span class="font-mono bg-purple-100 px-3 py-1 rounded">${dept.fraisDivers.cadastre}€</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700">Conservation (ancien)</span>
                <span class="font-mono bg-purple-100 px-3 py-1 rounded">${dept.fraisDivers.conservation}€</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700">Formalités</span>
                <span class="font-mono bg-purple-100 px-3 py-1 rounded">${dept.fraisDivers.formalites}€</span>
              </div>
              <div class="flex justify-between items-center border-t pt-2 mt-2">
                <span class="text-gray-700"><strong>CSI (forfaitaire)</strong></span>
                <span class="font-mono bg-indigo-100 px-3 py-1 rounded"><strong>50€</strong></span>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-600 mt-4">
            ✓ Données officielles mises à jour novembre 2024 |
            <a href="https://www.notaires.fr/fr/les-baremes-notariaux" target="_blank" class="text-blue-600 hover:underline">Consulter les barèmes complets</a>
          </p>
        </div>
`;

  // Chercher l'endroit pour insérer (avant "Sources et références")
  const insertMarker = '<!-- Références -->';
  const insertIndex = content.indexOf(insertMarker);

  if (insertIndex === -1) {
    errors.push(`${filename}: Marker "<!-- Références -->" non trouvé`);
    return;
  }

  // Insérer la section
  content = content.substring(0, insertIndex) + tarifSection + '\n        ' + content.substring(insertIndex);

  // Écrire le fichier
  fs.writeFileSync(file, content);
  updated++;
  console.log(`✅ ${filename} (${dept.nom})`);
});

console.log(`\n${'─'.repeat(70)}`);
console.log(`✅ ${updated}/${blogFiles.length} fichiers mis à jour`);

if (errors.length > 0) {
  console.log(`\n⚠️  Erreurs:`);
  errors.forEach(e => console.log(`   - ${e}`));
}
