#!/usr/bin/env node
/**
 * Nettoie un lot de pages départementales (erreurs UTF-8 visibles + placeholders).
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Retourne le nom de fichier HTML d'une page "frais-notaire-XX.html" à partir d'un code département.
 */
function toDepartementFileName(code) {
  const normalized = String(code).trim()
  if (!normalized) return null

  const needsLeadingZero = normalized.length === 1
  const finalCode = needsLeadingZero ? `0${normalized}` : normalized
  return `frais-notaire-${finalCode}.html`
}

/**
 * Applique des corrections d'encodage visibles (emojis remplacés par ??/?, flèches, séparateurs €).
 */
function fixVisibleUtf8Artifacts(content) {
  let fixed = content

  fixed = fixed.replace(/\?:/g, ':')
  fixed = fixed.replace(/\?\?/g, '??')

  fixed = fixed.replace(/<span>\?\s*Blog<\/span>/g, '<span>← Blog</span>')
  fixed = fixed.replace(/>\?\s*Blog<\/span>/g, '>← Blog</span>')

  fixed = fixed.replace(/\?€/g, ' €')
  fixed = fixed.replace(/\?€\/m²/g, ' €/m²')

  fixed = fixed.replace(/<strong>\?\?\s*Avertissement\s*:/g, '<strong>⚠️ Avertissement :')
  fixed = fixed.replace(/<strong>\?\?\s*Frais de notaire/g, '<strong>💰 Frais de notaire')
  fixed = fixed.replace(/<title>\?\?\s*Frais de notaire/g, '<title>💰 Frais de notaire')
  fixed = fixed.replace(/content="\?\?\s*Frais de notaire/g, 'content="💰 Frais de notaire')

  fixed = fixed.replace(/^\s*\?\?\s+/gm, (m) => m.replace('??', '💰').replace('💰 ', '💰 '))
  fixed = fixed.replace(/^\s*\?\?\?\s+/gm, (m) => m.replace('???', '🏘️').replace('🏘️ ', '🏘️ '))

  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Marché immobilier/gi, '<h2$1>📈 Marché immobilier')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Simulation/gi, '<h2$1>📊 Simulation')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Exemple/gi, '<h2$1>📊 Exemple')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Conseils/gi, '<h2$1>💡 Conseils')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Astuces/gi, '<h2$1>💡 Astuces')

  fixed = fixed.replace(/<strong>\?\?\?\s*(Sp|Fo)/g, '<strong>🏘️ $1')
  fixed = fixed.replace(/<strong>\?\?\?\s*(Spécificité|Focus)\b/gi, '<strong>🏘️ $1')
  fixed = fixed.replace(/<strong>\?\?\s*Bon à savoir\b/gi, '<strong>💡 Bon à savoir')
  fixed = fixed.replace(/<strong>\?\?\s*Bon\s+à\s+savoir\b/gi, '<strong>💡 Bon à savoir')
  fixed = fixed.replace(/<strong>\?\?\s*Bon\s+savoir\b/gi, '<strong>💡 Bon à savoir')
  fixed = fixed.replace(/<strong>\?\?\s*À noter\b/gi, '<strong>💡 À noter')
  fixed = fixed.replace(/<strong>\?\?\s*Conseil\b/gi, '<strong>💡 Conseil')
  fixed = fixed.replace(/<strong>\?\?\s*Sources\b/gi, '<strong>📊 Sources')
  fixed = fixed.replace(/<strong>\?\?\s*Méthodologie\b/gi, '<strong>📊 Méthodologie')
  fixed = fixed.replace(/<strong>\?\?\s*Astuce\b/gi, '<strong>💡 Astuce')

  fixed = fixed.replace(/>\?\?\s*Ancien\b/g, '>🏡 Ancien')
  fixed = fixed.replace(/>\?\?\s*Neuf\s*\(VEFA\)\b/g, '>🏢 Neuf (VEFA)')

  fixed = fixed.replace(/<p class="text-gray-700">\?\?\s*<strong>Prix/gi, '<p class="text-gray-700">📈 <strong>Prix')
  fixed = fixed.replace(/<p class="text-gray-700">\?\?\s*Volume/gi, '<p class="text-gray-700">📊 Volume')
  fixed = fixed.replace(/<p class="text-gray-700">\?\?\s*Marché/gi, '<p class="text-gray-700">🎯 Marché')

  fixed = fixed.replace(/>\\?\?\s*Voir aussi</g, '>🔎 Voir aussi</')
  fixed = fixed.replace(/>\?\?\s*Voir aussi</g, '>🔎 Voir aussi</')
  fixed = fixed.replace(/>\?\?\s*Tarifs Officiels/gi, '>💼 Tarifs Officiels')
  fixed = fixed.replace(/>\?\?\s*Hypothèses/gi, '>⚠️ Hypothèses')
  fixed = fixed.replace(/>\?\?\s*Écarts possibles/gi, '>⚠️ Écarts possibles')
  fixed = fixed.replace(/>\?\?\s*Pour un devis exact/gi, '>👉 Pour un devis exact')
  fixed = fixed.replace(/>\?\?\s*Sources et références/gi, '>📚 Sources et références')

  fixed = fixed.replace(/>\?\s*Questions fréquentes</g, '>❓ Questions fréquentes</')
  fixed = fixed.replace(/\?\s*Calcul instantané\s*\?\s*100% gratuit\s*\?\s*Export PDF disponible/g, '✓ Calcul instantané  ✓ 100% gratuit  ✓ Export PDF disponible')

  fixed = fixed.replace(/>\\?\s*Haute-Savoie\s*\(/g, '>← Haute-Savoie (')
  fixed = fixed.replace(/\)\s*\\?\s*<\/a/g, ') →</a')

  fixed = fixed.replace(/<div class="text-2xl">\?\?<\/div>/g, '<div class="text-2xl">📈</div>')
  fixed = fixed.replace(/<div class="text-2xl">\?<\/div>/g, '<div class="text-2xl">⭐</div>')

  return fixed
}

/**
 * Remplace des placeholders et formulations YMYL non sûres, sans inventer de chiffres.
 */
function applyYmyLSafeEdits(content) {
  let fixed = content

  fixed = fixed.replace(/montant calcul[ée]?\s+selon\s+votre\s+situation/gi, 'à estimer via le calculateur')
  fixed = fixed.replace(/montant calcul\s+selon\s+votre\s+situation/gi, 'à estimer via le calculateur')
  fixed = fixed.replace(/montant calcul\s+selon votre situation/gi, 'à estimer via le calculateur')
  fixed = fixed.replace(/montant calculé selon votre situation/gi, 'à estimer via le calculateur')
  fixed = fixed.replace(/montant calcul\s+selon[^<]*/gi, 'à estimer via le calculateur')
  fixed = fixed.replace(/<strong>\s*montant calcul[^<]*<\/strong>/gi, '<strong>à estimer via le calculateur</strong>')

  fixed = fixed.replace(/montant calculé selon votre situation/g, 'à estimer via le calculateur')
  fixed = fixed.replace(/montant calcul selon votre situation/g, 'à estimer via le calculateur')
  fixed = fixed.replace(/montant calcul selon votre situation/g, 'à estimer via le calculateur')

  fixed = fixed.replace(
    /s[’']établit à environ\s*<strong>des prix variables selon la commune, le quartier et le type de bien<\/strong>/g,
    'varient selon la commune, le quartier et le type de bien'
  )

  fixed = fixed.replace(/rendements\s+de\s+4-5%[^.]*\./gi, 'cela dépend du loyer, du prix, des charges, de la vacance et de la fiscalité.\n')
  fixed = fixed.replace(/rendements\s+attractifs\s*\(4-5\?% net\)/gi, 'une rentabilité à évaluer au cas par cas')
  fixed = fixed.replace(/tr[eè]s rentable[^.]*\./gi, 'cela dépend notamment du loyer, du prix d’acquisition, des charges et de la demande locale.\n')

  fixed = fixed.replace(
    /Pour un bien de\s+200\s*000\s*,\s*l[’']économie peut atteindre[^.]*\./gi,
    "Selon le type de bien, l’écart de frais entre l’ancien et le neuf (VEFA) peut être significatif ; utilisez le simulateur pour une estimation.\n"
  )

  fixed = fixed.replace(/Entre\s*4%\s*\(neuf\)\s*et\s*7,?\d+%\s*\(ancien\)[^.]*/gi, 'Ancien : environ 7 à 8 % • Neuf (VEFA) : environ 2 à 3 %')
  fixed = fixed.replace(/environ\s*7,?\d+%\s*du prix d'achat[^.]*ancien[^.]*\./gi, 'Ancien : environ 7 à 8 % du prix d’achat ; Neuf (VEFA) : environ 2 à 3 %.\n')

  fixed = fixed.replace(/exon[ée]rations fiscales partielles/gi, 'dispositifs pouvant varier selon les situations et les communes')
  fixed = fixed.replace(/conventions fiscales franco-suisses[^.]*\./gi, 'Certaines situations peuvent modifier la fiscalité applicable ; vérifiez avec un notaire ou l’administration compétente.\n')

  return fixed
}

/**
 * Corrige quelques fautes d'encodage fréquentes (accents/ligatures) sans modifier la structure.
 */
function fixCommonFrenchTypos(content) {
  const replacements = [
    ['instantanment', 'instantanément'],
    ['instantanment', 'instantanément'],
    ['barme', 'barème'],
    ['barmes', 'barèmes'],
    ['Barme', 'Barème'],
    ['intgr', 'intégré'],
    ['reprsentent', 'représentent'],
    ['tudes', 'études'],
    ['O trouver', 'Où trouver'],
    ['Chteauroux', 'Châteauroux'],
    ['Besanon', 'Besançon'],
    ['Montbliard', 'Montbéliard'],
    ["Ardche", 'Ardèche'],
    ["Gorges de l'Ardche", "Gorges de l'Ardèche"],
    ['Dcouvrez', 'Découvrez'],
    ['rgionales', 'régionales'],
    ['Rhne', 'Rhône'],
    ['indiqus', 'indiqués'],
    ['indiqus', 'indiqués'],
    ['titre', 'titre'],
    ['barmes', 'barèmes'],
    ['habilit', 'habilité'],
    ['tablir', 'établir'],
    ['dfinitif', 'définitif'],
    ['lacte', "l’acte"],
    ['carts', 'écarts'],
    ['Hypothses', 'Hypothèses'],
    ['rfrences', 'références'],
    ['rdig', 'rédigé'],
    ['indpendant', 'indépendant'],
    ['immobilire', 'immobilière'],
    ['Suprieur', 'Supérieur'],
    ['amnagement', 'aménagement'],
    ['rnnovation', 'rénovation'],
    ['coles', 'écoles'],
    ['Idale', 'Idéal'],
    ['Trs', 'Très'],
    ['grce', 'grâce'],
    ['tudiant', 'étudiant'],
    ['prvoir', 'prévoir']
  ]

  let fixed = content
  for (const [from, to] of replacements) {
    fixed = fixed.split(from).join(to)
  }
  return fixed
}

/**
 * Remplace les identifiants AdSense corrompus par la valeur utilisée partout dans le repo.
 */
function fixAdsenseAccount(content) {
  return content.replace(
    /<meta name="google-adsense-account" content="ca-pub-[^"]*\?[^"]*" \/>/g,
    '<meta name="google-adsense-account" content="ca-pub-2209781252231399" />'
  )
}

/**
 * Traite un fichier spécifique (écrit un backup uniquement si le fichier change).
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    let fixedContent = content
    fixedContent = fixAdsenseAccount(fixedContent)
    fixedContent = fixCommonFrenchTypos(fixedContent)
    fixedContent = fixVisibleUtf8Artifacts(fixedContent)
    fixedContent = applyYmyLSafeEdits(fixedContent)
    fixedContent = fixVisibleUtf8Artifacts(fixedContent)

    if (fixedContent === content) {
      return { fixed: false, reason: 'No changes needed' }
    }

    const backupPath = filePath + '.backup-clean-' + Date.now()
    fs.writeFileSync(backupPath, content, 'utf8')
    fs.writeFileSync(filePath, fixedContent, 'utf8')

    return { fixed: true, backup: backupPath }
  } catch (error) {
    return { fixed: false, error: error.message }
  }
}

/**
 * Résout la liste de fichiers à traiter.
 */
function resolveTargetsFromArgs(args) {
  const raw = args.map((a) => String(a).trim()).filter(Boolean)
  if (raw.length === 0) return []

  const names = []
  for (const item of raw) {
    if (item.endsWith('.html')) {
      names.push(item)
      continue
    }

    const fileName = toDepartementFileName(item)
    if (fileName) names.push(fileName)
  }

  return Array.from(new Set(names))
}

/**
 * Point d'entrée principal.
 */
function main() {
  const targetDir = path.resolve(process.cwd(), 'src/pages/blog/departements')
  
  if (!fs.existsSync(targetDir)) {
    console.error('Directory not found:', targetDir)
    process.exit(1)
  }

  const targets = resolveTargetsFromArgs(process.argv.slice(2))
  if (targets.length === 0) {
    console.error('Usage: node scripts/fix-final-emoji-issues.js <liste de départements ou fichiers>')
    console.error('Exemple: node scripts/fix-final-emoji-issues.js 44 36 25 07 52')
    process.exit(1)
  }

  const results = {
    total: targets.length,
    fixed: 0,
    errors: 0,
    details: []
  }
  
  for (const fileName of targets) {
    const filePath = path.join(targetDir, fileName)
    
    if (fs.existsSync(filePath)) {
      const relativePath = path.relative(process.cwd(), filePath)
      const result = processFile(filePath)
      
      if (result.fixed) {
        results.fixed++
        results.details.push({
          file: relativePath,
          status: 'fixed',
          backup: result.backup
        })
        console.log(`✅ Fixed final emoji issues: ${relativePath}`)
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
    console.log('\nBackup files created with .backup-clean-<timestamp> extension')
  }
}

main()
