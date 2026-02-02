#!/usr/bin/env node
/**
 * Script final pour restaurer tous les emojis correctement
 * Basé sur l'exemple complet fourni par l'utilisateur
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Mapping complet des emojis à restaurer
 */
const EMOJI_REPLACEMENTS = {
  // Sections principales
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
  
  // Autres emojis qui pourraient être manquants
  '💰?': '💰',  // Cas spéciaux avec des caractères supplémentaires
  '💰 ': '💰 ', // Espaces autour
}

/**
 * Pages à corriger spécifiquement
 */
const PAGES_TO_FIX = [
  'frais-notaire-75.html',
  'frais-notaire-93.html',
  'frais-notaire-01.html',
  'frais-notaire-91.html',
  'frais-notaire-88.html',
  'frais-notaire-976.html',
  'frais-notaire-973.html'
]

/**
 * Corrige les emojis dans le contenu
 */
function fixEmojis(content) {
  let fixed = content
  
  // Appliquer tous les remplacements d'emojis
  for (const [wrong, correct] of Object.entries(EMOJI_REPLACEMENTS)) {
    const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    fixed = fixed.replace(regex, correct)
  }
  
  return fixed
}

/**
 * Traite un fichier spécifique
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Compter les emojis manquants avant correction
    const missingEmojis = (content.match(/\?\?/g) || []).length
    
    if (missingEmojis === 0) {
      return { fixed: false, reason: 'No missing emojis found' }
    }
    
    const fixedContent = fixEmojis(content)
    
    // Sauvegarder l'original
    const backupPath = filePath + '.backup-final-emojis-' + Date.now()
    fs.writeFileSync(backupPath, content, 'utf8')
    
    // Écrire le contenu corrigé
    fs.writeFileSync(filePath, fixedContent, 'utf8')
    
    return { fixed: true, backup: backupPath, missingCount: missingEmojis }
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
    total: PAGES_TO_FIX.length,
    fixed: 0,
    errors: 0,
    details: []
  }
  
  for (const fileName of PAGES_TO_FIX) {
    const filePath = path.join(targetDir, fileName)
    
    if (fs.existsSync(filePath)) {
      const relativePath = path.relative(process.cwd(), filePath)
      const result = processFile(filePath)
      
      if (result.fixed) {
        results.fixed++
        results.details.push({
          file: relativePath,
          status: 'fixed',
          backup: result.backup,
          missingCount: result.missingCount
        })
        console.log(`✅ Fixed ${result.missingCount} emojis: ${relativePath}`)
      } else if (result.error) {
        results.errors++
        results.details.push({
          file: relativePath,
          status: 'error',
          error: result.error
        })
        console.error(`❌ Error: ${relativePath} - ${result.error}`)
      } else {
        results.details.push({
          file: relativePath,
          status: 'skipped',
          reason: result.reason
        })
        console.log(`⏭️  Skipped: ${relativePath} - ${result.reason}`)
      }
    } else {
      console.log(`⚠️  File not found: ${fileName}`)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`Total files processed: ${results.total}`)
  console.log(`Files fixed: ${results.fixed}`)
  console.log(`Errors: ${results.errors}`)
  console.log(`Skipped: ${results.total - results.fixed - results.errors}`)
  
  if (results.fixed > 0) {
    console.log('\nBackup files created with .backup-final-emojis-<timestamp> extension')
    console.log('To restore a file:')
    console.log('  git checkout HEAD -- <filename>')
  }
}

main()
