#!/usr/bin/env node
/**
 * Script pour restaurer les 8 pages specifiques depuis le commit ef9bb11
 * Restaure uniquement les pages mentionnees par l'utilisateur
 */

import { execSync } from 'child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Liste des 8 pages a restaurer depuis le commit ef9bb11
 */
const PAGES_TO_RESTORE = [
  'src/pages/blog/departements/frais-notaire-75.html',
  'src/pages/blog/departements/frais-notaire-93.html',
  'src/pages/blog/departements/frais-notaire-01.html',
  'src/pages/blog/departements/frais-notaire-91.html',
  'src/pages/blog/departements/frais-notaire-88.html',
  'src/pages/blog/departements/frais-notaire-976.html',
  'src/pages/blog/departements/frais-notaire-973.html'
]

/**
 * Restaure une page specifique depuis un commit git
 */
function restorePageFromCommit(filePath, commitHash) {
  try {
    // Verifier si le fichier existe actuellement
    const fullPath = path.resolve(process.cwd(), filePath)
    
    // Sauvegarder la version actuelle si elle existe
    if (fs.existsSync(fullPath)) {
      const backupPath = fullPath + '.backup-before-restore-' + Date.now()
      fs.copyFileSync(fullPath, backupPath)
      console.log(`📋 Sauvegarde: ${filePath} -> ${path.basename(backupPath)}`)
    }
    
    // Restaurer depuis le commit
    const command = `git checkout ${commitHash} -- "${filePath}"`
    execSync(command, { cwd: process.cwd(), encoding: 'utf8' })
    
    console.log(`✅ Restaure: ${filePath} depuis le commit ${commitHash}`)
    return { success: true, filePath }
  } catch (error) {
    console.error(`❌ Erreur lors de la restauration de ${filePath}:`, error.message)
    return { success: false, filePath, error: error.message }
  }
}

/**
 * Point d'entree principal
 */
function main() {
  const commitHash = 'ef9bb1115b6205a78ea58668861f79504096f431'
  
  console.log('🔄 Restauration des pages depuis le commit', commitHash)
  console.log('=' .repeat(60))
  
  const results = {
    total: PAGES_TO_RESTORE.length,
    success: 0,
    failed: 0,
    details: []
  }
  
  for (const filePath of PAGES_TO_RESTORE) {
    const result = restorePageFromCommit(filePath, commitHash)
    results.details.push(result)
    
    if (result.success) {
      results.success++
    } else {
      results.failed++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`📊 Resume de la restauration:`)
  console.log(`Total: ${results.total}`)
  console.log(`✅ Succes: ${results.success}`)
  console.log(`❌ Echecs: ${results.failed}`)
  
  if (results.success > 0) {
    console.log('\n💡 Les fichiers ont ete restaures avec succes!')
    console.log('📁 Les sauvegardes ont ete creees avec le suffixe .backup-before-restore-<timestamp>')
  }
  
  if (results.failed > 0) {
    console.log('\n⚠️  Certains fichiers n\'ont pas pu etre restaures.')
    console.log('Verifiez que le commit et les chemins sont corrects.')
  }
}

main()
