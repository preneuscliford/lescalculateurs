#!/usr/bin/env node
/**
 * Script pour restaurer les emojis et caracteres speciaux dans les pages specifiques
 * Traite les fichiers 75, 93, 01 qui ont des problemes d'encodage
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Mapping complet des emojis et caracteres speciaux
 */
const EMOJI_REPLACEMENTS = {
  // Emojis dans les titres et sections
  '??': '💰',  // Frais de notaire
  '??': '⚠️',  // Avertissement
  '??': '📊',  // Estimation
  '??': '❓',  // Questions frequentes
  '??': '📌',  // Rappel reglementaire
  '??': '🔗',  // Voir aussi
  '??': '🏘️',  // Specificite locale
  '??': '🏡',  // Ancien
  '??': '🏢',  // Neuf
  '??': '💡',  // Bon a savoir
  '??': '📈',  // Evolution des prix
  '??': '📊',  // Volume de transactions
  '??': '⭐',  // Attractivite
  '??': '🎯',  // Tension du marche
  '??': '🏛️',  // Ou trouver un notaire
  '??': '🧮',  // Acceder au simulateur
  '??': '✓',   // Checkmark
  '??': '👉',  // Fleche
  '??': '📚',  // Sources et references
  '??': '📋',  // Methodologie
  '??': '💼',  // Tarifs officiels
  '??': '📄',  // Export PDF
  
  // Caracteres francais corrompus
  'fran?aise': 'francaise',
  'd?mographique': 'demographique',
  'r?sidentielle': 'residentielle',
  'mahoraise': 'mahoraise',
  '?conomique': 'economique',
  '?mergent': 'emergent',
  '?co-tourisme': 'eco-tourisme',
  'd?partemental': 'departemental',
  'd?partementalisation': 'departementalisation',
  'p?le principal': 'pole principal',
  'conna?t': 'connaît',
  'pr?sente': 'presente',
  'march?': 'marche',
  'attire l\'?co': 'attire l\'eco',
  'attractivit?': 'attractivite',
  'indiqus': 'indiques',
  'bar?mes': 'baremes',
  'habilit?': 'habilite',
  'tablir': 'etablir',
  'dfinitif': 'definitif',
  'lacte': 'l\'acte',
  'diffrentiel': 'differentiel',
  'rglementation': 'reglementation',
  'changents': 'changent',
  'n?cessaires': 'necessaires',
  'disponibilit?': 'disponibilite',
  'immobili?re': 'immobiliere',
  'achetez dans l\'': 'achetez dans l\'',
  'le diffrentiel': 'le differentiel',
  'neuf/ancien': 'neuf/ancien',
  'rglementation nationale': 'reglementation nationale',
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
  'exact et jour': 'exact et a jour',
  'utilisez le': 'utilisez le',
  'Seine-Saint-Denis': 'Seine-Saint-Denis',
  'estimation purement': 'estimation purement',
  'indicative': 'indicative',
  'constitue pas': 'constitue pas',
  'conseil juridique': 'conseil juridique',
  'Seul un notaire': 'Seul un notaire',
  'habilit ? tablir': 'habilite a etablir',
  'montant dfinitif': 'montant definitif',
  'lors de la signature': 'lors de la signature',
  'lacte authentique': 'l\'acte authentique',
  'diffrentiel neuf/ancien': 'differentiel neuf/ancien',
  'respecte la rglementation': 'respecte la reglementation',
  'nationale. En': 'nationale. En',
  'selon que vous': 'selon que vous',
  'ou le neuf': 'ou le neuf',
  'changent selon': 'changent selon'
}

/**
 * Corrige les caracteres problematiques dans le contenu
 */
function fixProblematicChars(content) {
  let fixed = content
  
  // Appliquer tous les remplacements
  for (const [wrong, correct] of Object.entries(EMOJI_REPLACEMENTS)) {
    const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    fixed = fixed.replace(regex, correct)
  }
  
  // Fixer les "environ X ? Y %" patterns
  fixed = fixed.replace(/environ (\d+)\s*\?\s*(\d*)\s*%/g, 'environ $1 a $2 %')
  fixed = fixed.replace(/environ (\d+)\s*\?/g, 'environ $1 a')
  
  return fixed
}

/**
 * Traite un fichier specifique
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    const fixedContent = fixProblematicChars(content)
    
    // Sauvegarder l'original
    const backupPath = filePath + '.backup-' + Date.now()
    fs.writeFileSync(backupPath, content, 'utf8')
    
    // Ecrire le contenu corrige
    fs.writeFileSync(filePath, fixedContent, 'utf8')
    
    return { fixed: true, backup: backupPath }
  } catch (error) {
    return { fixed: false, error: error.message }
  }
}

/**
 * Point d'entree principal
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
  
  // Traiter specifiquement les fichiers problematiques mentionnes
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
