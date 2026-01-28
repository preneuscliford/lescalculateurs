#!/usr/bin/env node
/**
 * Script pour corriger les fichiers HTML corrompus par des erreurs d'encodage UTF-8
 * Remplace les caractères mal encodés par leurs équivalents corrects
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Map des caractères mal encodés vers leurs corrections UTF-8
 */
const CORRECTIONS = {
  'Ã©': 'é',
  'Ã¨': 'è',
  'Ã ': 'à',
  'Ã¢': 'â',
  'Ãª': 'ê',
  'Ã®': 'î',
  'Ã´': 'ô',
  'Ã»': 'û',
  'Ã§': 'ç',
  'Ã‰': 'É',
  'Ãˆ': 'È',
  'Ã ': 'À',
  'Ã‚': 'Â',
  'ÃŠ': 'Ê',
  'ÃŽ': 'Î',
  'Ã”': 'Ô',
  'Ã›': 'Û',
  'Ã‡': 'Ç',
  'Ã«': 'ë',
  'Ã¯': 'ï',
  'Ã¼': 'ü',
  'Ã¶': 'ö',
  'Ã¤': 'ä',
  'Ã‹': 'Ë',
  'Ã�': 'Ï',
  'Ãœ': 'Ü',
  'Ã–': 'Ö',
  'Ã„': 'Ä',
  'Â«': '«',
  'Â»': '»',
  'Â°': '°',
  'Â²': '²',
  'Â³': '³',
  'Â½': '½',
  'Â¼': '¼',
  'Â¾': '¾',
  'â‚¬': '€',
  'â€œ': '"',
  'â€': '"',
  'â€™': '\'',
  'â€¦': '…',
  'â€”': '—',
  'â€“': '–',
  'â€¢': '•',
  'â€¡': '‡',
  'â€ ': '†',
  'â€°': '‰',
  'â€¹': '‹',
  'â€º': '›',
  'Å“': 'œ',
  'Å’': 'Œ',
  'Å¡': 'š',
  'Å ': 'Š',
  'Å¸': 'Ÿ',
  'Å¾': 'ž',
  'Å½': 'Ž',
  'Â©': '©',
  'Â®': '®',
  'Â™': '™',
  'Â§': '§',
  'Â¶': '¶',
  'Â±': '±',
  'Âµ': 'µ',
  'ÃŸ': 'ß',
  'âˆž': '∞',
  'â‰ ': '≠',
  'â‰¤': '≤',
  'â‰¥': '≥',
  'âˆ‚': '∂',
  'âˆ‘': '∑',
  'âˆŸ': '∏',
  'âˆ«': '∫',
  'âˆš': '√',
  'âˆ¼': '≈',
  'â‰ˆ': '≈',
  'â‰¡': '≡',
  'â‰ ': '≠',
  'â€�': '', // Caractère de contrôle
  '�': '', // Caractère de remplacement
}

/**
 * Corrige le contenu d'un texte en remplaçant les caractères mal encodés
 */
function fixCorruptedText(content) {
  let fixed = content
  
  // Remplacer chaque caractère mal encodé
  for (const [corrupted, correct] of Object.entries(CORRECTIONS)) {
    const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    fixed = fixed.replace(regex, correct)
  }
  
  return fixed
}

/**
 * Vérifie si un fichier contient des caractères mal encodés
 */
function hasCorruptedChars(content) {
  for (const corrupted of Object.keys(CORRECTIONS)) {
    if (content.includes(corrupted)) {
      return true
    }
  }
  return false
}

/**
 * Traite un fichier HTML
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    if (!hasCorruptedChars(content)) {
      return { fixed: false, reason: 'No corrupted characters found' }
    }
    
    const fixedContent = fixCorruptedText(content)
    
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
 * Parcourt récursivement un répertoire
 */
function walk(dir, onFile) {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      walk(fullPath, onFile)
    } else if (item.isFile() && item.name.endsWith('.html')) {
      onFile(fullPath)
    }
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
  
  walk(targetDir, (filePath) => {
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
    } else {
      results.details.push({
        file: relativePath,
        status: 'skipped',
        reason: result.reason
      })
      console.log(`⏭️  Skipped: ${relativePath} - ${result.reason}`)
    }
  })
  
  console.log('\n' + '='.repeat(60))
  console.log(`Total files processed: ${results.total}`)
  console.log(`Files fixed: ${results.fixed}`)
  console.log(`Errors: ${results.errors}`)
  console.log(`Skipped: ${results.total - results.fixed - results.errors}`)
  
  if (results.fixed > 0) {
    console.log('\nBackup files created with .backup-<timestamp> extension')
    console.log('To restore a file:')
    console.log('  git checkout HEAD -- <filename>')
  }
}

main()