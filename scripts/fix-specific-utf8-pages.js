#!/usr/bin/env node
/**
 * Script intelligent pour corriger les pages avec des caractères "?" mal encodés
 * Utilise les pages correctes comme référence pour les corrections
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Départements avec pages correctes (sans problèmes d'encodage)
 */
const CORRECT_DEPTS = ['06', '83', '34', '56', '84']

/**
 * Départements avec pages problématiques (avec des "?")
 */
const PROBLEMATIC_DEPTS = ['75', '93', '01', '91', '88', '976', '973']

/**
 * Patterns de remplacement basés sur les pages correctes
 */
const REPLACEMENTS = {
  '?? Spécificité locale': '🏘️ Spécificité locale',
  '?? Avertissement': '⚠️ Avertissement',
  '?? Estimation des frais': '📊 Estimation des frais',
  '?? Questions fréquentes': '❓ Questions fréquentes',
  '?? Rappel réglementaire': '📌 Rappel réglementaire',
  '?? Voir aussi': '🔗 Voir aussi',
  'fran?aise': 'française',
  'd?mographique': 'démographique',
  'r?sidentielle': 'résidentielle',
  'mahoraise': 'mahoraise',
  '?conomique': 'économique',
  '?mergent': 'émergent',
  '?co-tourisme': 'éco-tourisme',
  'd?partemental': 'départemental',
  'd?partementalisation': 'départementalisation',
  'besoins d\'?quipement': 'besoins d\'équipement',
  'lagon exceptionnel': 'lagon exceptionnel',
  'croissance d?mographique': 'croissance démographique',
  'attractivit?': 'attractivité',
  'immobilier ?': 'immobilier à',
  'p?le principal': 'pôle principal',
  'statut d?partemental': 'statut départemental',
  'investissement immobilier': 'investissement immobilier',
  'plus forte croissance': 'plus forte croissance',
  'forte croissance d?mographique': 'forte croissance démographique',
  'conna?t la plus forte': 'connaît la plus forte',
  'pr?sente un march?': 'présente un marché',
  'march? ?mergent': 'marché émergent',
  'attire l\'?co-tourisme': 'attire l\'éco-tourisme',
  'naissant. Le statut': 'naissant. Le statut',
  'renforce l\'attractivit?': 'renforce l\'attractivité',
  '?conomique et r?sidentielle': 'économique et résidentielle',
  'indiqus': 'indiqués',
  'purement informatif': 'purement informatif',
  'base des barmes': 'base des barèmes',
  'bar?mes notariaux': 'barèmes notariaux',
  'ne constituent': 'ne constituent',
  'conseil juridique': 'conseil juridique',
  'Seul un notaire': 'Seul un notaire',
  'habilit? ?': 'habilité à',
  'tablir le montant': 'établir le montant',
  'montant dfinitif': 'montant définitif',
  'lors de la signature': 'lors de la signature',
  'lacte authentique': 'l\'acte authentique',
  'diffrentiel': 'différentiel',
  'respecte la rglementation': 'respecte la réglementation',
  'nationale. En': 'nationale. En',
  'selon que vous': 'selon que vous',
  'achetez dans l\'': 'achetez dans l\'',
  'ou le neuf': 'ou le neuf',
  'changent selon': 'changent selon',
  'Seine-Saint-Denis': 'Seine-Saint-Denis',
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
  'utilisez le': 'utilisez le'
}

/**
 * Vérifie si un fichier contient des caractères "?" problématiques
 */
function hasProblematicChars(content) {
  // Cherche des "?" dans des contextes qui devraient avoir des accents
  const problematicPatterns = [
    /\?\?/,  // Double ??
    /fran\?aise/,
    /d\?mographique/,
    /r\?sidentielle/,
    /\?conomique/,
    /\?mergent/,
    /\?co-tourisme/,
    /d\?partemental/,
    /immobilier \?/,
    /p\?le principal/,
    /conna\?t/,
    /pr\?sente/,
    /march\?/,
    /attire l\'?\?co/,
    /attractivit\?/,
    /indiqus/,
    /bar\?mes/,
    /habilit\?/,
    /tablir/,
    /dfinitif/,
    /lacte/,
    /diffrentiel/,
    /rglementation/,
    /changents/,
    /environ \d+\s*\?/  // "environ 7 ?" ou "environ 2 ?"
  ]
  
  return problematicPatterns.some(pattern => pattern.test(content))
}

/**
 * Corrige les caractères problématiques dans le contenu
 */
function fixProblematicChars(content) {
  let fixed = content
  
  // Appliquer tous les remplacements
  for (const [wrong, correct] of Object.entries(REPLACEMENTS)) {
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
    
    if (!hasProblematicChars(content)) {
      return { fixed: false, reason: 'No problematic characters found' }
    }
    
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
  
  // Traiter uniquement les départements problématiques
  for (const dept of PROBLEMATIC_DEPTS) {
    const fileName = `frais-notaire-${dept}.html`
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
      } else {
        results.details.push({
          file: relativePath,
          status: 'skipped',
          reason: result.reason
        })
        console.log(`⏭️  Skipped: ${relativePath} - ${result.reason}`)
      }
    }
  }
  
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