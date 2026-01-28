#!/usr/bin/env node
/**
 * Script pour restaurer les emojis et caractères spéciaux dans les pages spécifiques
 * Traite les fichiers 75, 93, 01 qui ont des problèmes d'encodage
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Mapping complet des emojis et caractères spéciaux
 */
const EMOJI_REPLACEMENTS = {
  // Emojis dans les titres et sections
  '??': '💰',  // Frais de notaire
  '??': '⚠️',  // Avertissement
  '??': '📊',  // Estimation
  '??': '❓',  // Questions fréquentes
  '??': '📌',  // Rappel réglementaire
  '??': '🔗',  // Voir aussi
  '??': '🏘️',  // Spécificité locale
  '??': '🏡',  // Ancien
  '??': '🏢',  // Neuf
  '??': '💡',  // Bon à savoir
  '??': '📈',  // Évolution des prix
  '??': '📊',  // Volume de transactions
  '??': '⭐',  // Attractivité
  '??': '🎯',  // Tension du marché
  '??': '🏛️',  // Où trouver un notaire
  '??': '🧮',  // Accéder au simulateur
  '??': '✓',   // Checkmark
  '??': '👉',  // Flèche
  '??': '📚',  // Sources et références
  '??': '📋',  // Méthodologie
  '??': '💼',  // Tarifs officiels
  '??': '📄',  // Export PDF
  
  // Caractères français corrompus
  'fran?aise': 'française',
  'd?mographique': 'démographique',
  'r?sidentielle': 'résidentielle',
  'mahoraise': 'mahoraise',
  '?conomique': 'économique',
  '?mergent': 'émergent',
  '?co-tourisme': 'éco-tourisme',
  'd?partemental': 'départemental',
  'd?partementalisation': 'départementalisation',
  'p?le principal': 'pôle principal',
  'conna?t': 'connaît',
  'pr?sente': 'présente',
  'march?': 'marché',
  'attire l\'?co': 'attire l\'éco',
  'attractivit?': 'attractivité',
  'indiqus': 'indiqués',
  'bar?mes': 'barèmes',
  'habilit?': 'habilité',
  'tablir': 'établir',
  'dfinitif': 'définitif',
  'lacte': 'l\'acte',
  'diffrentiel': 'différentiel',
  'rglementation': 'réglementation',
  'changents': 'changent',
  'n?cessaires': 'nécessaires',
  'disponibilit?': 'disponibilité',
  'immobili?re': 'immobilière',
  'achetez dans l\'': 'achetez dans l\'',
  'le diffrentiel': 'le différentiel',
  'neuf/ancien': 'neuf/ancien',
  'rglementation nationale': 'réglementation nationale',
  'Pour un achat': 'Pour un achat',
  'immobilier en': 'immobilier en',
  'environ 7': 'environ 7',
  '8 % du': '8 % du',
  'prix d\'acquisition': 'prix d\'acquisition',
  'environ 2': 'environ 2',
  '3 %': '3 %',
  'montant exact': 'montant exact',
  'jour, utilisez': 'jour, utilisez',
  'le calculateur': 'le calculateur',
  'Pour un montant': 'Pour un montant',
  'exact et jour': 'exact et à jour',
  'utilisez le': 'utilisez le',
  'Seine-Saint-Denis': 'Seine-Saint-Denis',
  'estimation purement': 'estimation purement',
  'indicative': 'indicative',
  'constitue pas': 'constitue pas',
  'conseil juridique': 'conseil juridique',
  'Seul un notaire': 'Seul un notaire',
  'habilit ? tablir': 'habilité à établir',
  'montant dfinitif': 'montant définitif',
  'lors de la signature': 'lors de la signature',
  'lacte authentique': 'l\'acte authentique',
  'diffrentiel neuf/ancien': 'différentiel neuf/ancien',
  'respecte la rglementation': 'respecte la réglementation',
  'nationale. En': 'nationale. En',
  'selon que vous': 'selon que vous',
  'ou le neuf': 'ou le neuf',
  'changent selon': 'changent selon'
}

/**
 * Corrige les caractères problématiques dans le contenu
 */
function fixProblematicChars(content) {
  let fixed = content
  
  // Appliquer tous les remplacements
  for (const [wrong, correct] of Object.entries(EMOJI_REPLACEMENTS)) {
    const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    fixed = fixed.replace(regex, correct)
  }
  
  // Fixer les "environ X ? Y %" patterns
  fixed = fixed.replace(/environ (\d+)\s*\?\s*(\d*)\s*%/g, 'environ $1 à $2 %')
  fixed = fixed.replace(/environ (\d+)\s*\?/g, 'environ $1 à')
  
  return fixed
}

/**
 * Traite un fichier spécifique
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    const fixedContent = fixProblematicChars(content)
    
    // Sauvegarder l'original
    const backupPath = filePath + '.backup-' + Date.now()
    fs.writeFileSync(backupPath, content, 'utf8')
    
    // Écrire le contenu corrigé
    fs.writeFileSync(filePath, fixedContent, 'utf8')
    
    return { fixed: true, backup: backupPath }
  } catch (error) {
    return { fixed: false, error: error.message }
  }
}

/**
 * Point d'entrée principal
 */
function main() {
  const targetDir = path.resolve(process.cwd(), 'src/pages/blog/departements')
  
  if (!fs.existsSync(targetDir)) {
    console.error('Directory not found:', targetDir)
    process.exit(1)
  }
  
  const results = {
    total: 0,
    fixed: 0,
    errors: 0,
    details: []
  }
  
  // Traiter spécifiquement les fichiers problématiques mentionnés
  const problematicFiles = [
    'frais-notaire-75.html',
    'frais-notaire-93.html', 
    'frais-notaire-01.html',
    'frais-notaire-91.html',
    'frais-notaire-88.html',
    'frais-notaire-976.html',
    'frais-notaire-973.html'
  ]
  
  for (const fileName of problematicFiles) {
    const filePath = path.join(targetDir, fileName)
    
    if (fs.existsSync(filePath)) {
      results.total++
      const relativePath = path.relative(process.cwd(), filePath)
      const result = processFile(filePath)
      
      if (result.fixed) {
        results.fixed++
        results.details.push({
          file: relativePath,
          status: 'fixed',
          backup: result.backup
        })
        console.log(`✅ Fixed: ${relativePath}`)
      } else if (result.error) {
        results.errors++
        results.details.push({
          file: relativePath,
          status: 'error',
          error: result.error
        })
        console.error(`❌ Error: ${relativePath} - ${result.error}`)
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`Total files processed: ${results.total}`)
  console.log(`Files fixed: ${results.fixed}`)
  console.log(`Errors: ${results.errors}`)
  
  if (results.fixed > 0) {
    console.log('\nBackup files created with .backup-<timestamp> extension')
    console.log('To restore a file:')
    console.log('  git checkout HEAD -- <filename>')
  }
}

main()