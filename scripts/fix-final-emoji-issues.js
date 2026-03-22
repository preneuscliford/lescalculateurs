#!/usr/bin/env node
/**
 * Nettoie un lot de pages departementales (erreurs UTF-8 visibles + placeholders).
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Retourne le nom de fichier HTML d'une page "frais-notaire-XX.html" a partir d'un code departement.
 */
function toDepartementFileName(code) {
  const normalized = String(code).trim()
  if (!normalized) return null

  const needsLeadingZero = normalized.length === 1
  const finalCode = needsLeadingZero ? `0${normalized}` : normalized
  return `frais-notaire-${finalCode}.html`
}

/**
 * Applique des corrections d'encodage visibles (emojis remplaces par ??/?, fleches, separateurs €).
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

  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Marche immobilier/gi, '<h2$1>📈 Marche immobilier')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Simulation/gi, '<h2$1>📊 Simulation')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Exemple/gi, '<h2$1>📊 Exemple')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Conseils/gi, '<h2$1>💡 Conseils')
  fixed = fixed.replace(/<h2([^>]*)>\s*\?\?\s*Astuces/gi, '<h2$1>💡 Astuces')

  fixed = fixed.replace(/<strong>\?\?\?\s*(Sp|Fo)/g, '<strong>🏘️ $1')
  fixed = fixed.replace(/<strong>\?\?\?\s*(Specificite|Focus)\b/gi, '<strong>🏘️ $1')
  fixed = fixed.replace(/<strong>\?\?\s*Bon a savoir\b/gi, '<strong>💡 Bon a savoir')
  fixed = fixed.replace(/<strong>\?\?\s*Bon\s+a\s+savoir\b/gi, '<strong>💡 Bon a savoir')
  fixed = fixed.replace(/<strong>\?\?\s*Bon\s+savoir\b/gi, '<strong>💡 Bon a savoir')
  fixed = fixed.replace(/<strong>\?\?\s*A noter\b/gi, '<strong>💡 A noter')
  fixed = fixed.replace(/<strong>\?\?\s*Conseil\b/gi, '<strong>💡 Conseil')
  fixed = fixed.replace(/<strong>\?\?\s*Sources\b/gi, '<strong>📊 Sources')
  fixed = fixed.replace(/<strong>\?\?\s*Methodologie\b/gi, '<strong>📊 Methodologie')
  fixed = fixed.replace(/<strong>\?\?\s*Astuce\b/gi, '<strong>💡 Astuce')

  fixed = fixed.replace(/>\?\?\s*Ancien\b/g, '>🏡 Ancien')
  fixed = fixed.replace(/>\?\?\s*Neuf\s*\(VEFA\)\b/g, '>🏢 Neuf (VEFA)')

  fixed = fixed.replace(/<p class="text-gray-700">\?\?\s*<strong>Prix/gi, '<p class="text-gray-700">📈 <strong>Prix')
  fixed = fixed.replace(/<p class="text-gray-700">\?\?\s*Volume/gi, '<p class="text-gray-700">📊 Volume')
  fixed = fixed.replace(/<p class="text-gray-700">\?\?\s*Marche/gi, '<p class="text-gray-700">🎯 Marche')

  fixed = fixed.replace(/>\\?\?\s*Voir aussi</g, '>🔎 Voir aussi</')
  fixed = fixed.replace(/>\?\?\s*Voir aussi</g, '>🔎 Voir aussi</')
  fixed = fixed.replace(/>\?\?\s*Tarifs Officiels/gi, '>💼 Tarifs Officiels')
  fixed = fixed.replace(/>\?\?\s*Hypotheses/gi, '>⚠️ Hypotheses')
  fixed = fixed.replace(/>\?\?\s*Ecarts possibles/gi, '>⚠️ Ecarts possibles')
  fixed = fixed.replace(/>\?\?\s*Pour un devis exact/gi, '>👉 Pour un devis exact')
  fixed = fixed.replace(/>\?\?\s*Sources et references/gi, '>📚 Sources et references')

  fixed = fixed.replace(/>\?\s*Questions frequentes</g, '>❓ Questions frequentes</')
  fixed = fixed.replace(/\?\s*Calcul instantane\s*\?\s*100% gratuit\s*\?\s*Export PDF disponible/g, '✓ Calcul instantane  ✓ 100% gratuit  ✓ Export PDF disponible')

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

  fixed = fixed.replace(/montant calcul[ee]?\s+selon\s+votre\s+situation/gi, 'a estimer via le calculateur')
  fixed = fixed.replace(/montant calcul\s+selon\s+votre\s+situation/gi, 'a estimer via le calculateur')
  fixed = fixed.replace(/montant calcul\s+selon votre situation/gi, 'a estimer via le calculateur')
  fixed = fixed.replace(/montant calcule selon votre situation/gi, 'a estimer via le calculateur')
  fixed = fixed.replace(/montant calcul\s+selon[^<]*/gi, 'a estimer via le calculateur')
  fixed = fixed.replace(/<strong>\s*montant calcul[^<]*<\/strong>/gi, '<strong>a estimer via le calculateur</strong>')

  fixed = fixed.replace(/montant calcule selon votre situation/g, 'a estimer via le calculateur')
  fixed = fixed.replace(/montant calcul selon votre situation/g, 'a estimer via le calculateur')
  fixed = fixed.replace(/montant calcul selon votre situation/g, 'a estimer via le calculateur')

  fixed = fixed.replace(
    /s['']etablit a environ\s*<strong>des prix variables selon la commune, le quartier et le type de bien<\/strong>/g,
    'varient selon la commune, le quartier et le type de bien'
  )

  fixed = fixed.replace(/rendements\s+de\s+4-5%[^.]*\./gi, 'cela depend du loyer, du prix, des charges, de la vacance et de la fiscalite.\n')
  fixed = fixed.replace(/rendements\s+attractifs\s*\(4-5\?% net\)/gi, 'une rentabilite a evaluer au cas par cas')
  fixed = fixed.replace(/tr[ee]s rentable[^.]*\./gi, 'cela depend notamment du loyer, du prix d'acquisition, des charges et de la demande locale.\n')

  fixed = fixed.replace(
    /Pour un bien de\s+200\s*000\s*,\s*l['']economie peut atteindre[^.]*\./gi,
    "Selon le type de bien, l'ecart de frais entre l'ancien et le neuf (VEFA) peut etre significatif ; utilisez le simulateur pour une estimation.\n"
  )

  fixed = fixed.replace(/Entre\s*4%\s*\(neuf\)\s*et\s*7,?\d+%\s*\(ancien\)[^.]*/gi, 'Ancien : environ 7 a 8 % • Neuf (VEFA) : environ 2 a 3 %')
  fixed = fixed.replace(/environ\s*7,?\d+%\s*du prix d'achat[^.]*ancien[^.]*\./gi, 'Ancien : environ 7 a 8 % du prix d'achat ; Neuf (VEFA) : environ 2 a 3 %.\n')

  fixed = fixed.replace(/exon[ee]rations fiscales partielles/gi, 'dispositifs pouvant varier selon les situations et les communes')
  fixed = fixed.replace(/conventions fiscales franco-suisses[^.]*\./gi, 'Certaines situations peuvent modifier la fiscalite applicable ; verifiez avec un notaire ou l'administration competente.\n')

  return fixed
}

/**
 * Corrige quelques fautes d'encodage frequentes (accents/ligatures) sans modifier la structure.
 */
function fixCommonFrenchTypos(content) {
  const replacements = [
    ['instantanment', 'instantanement'],
    ['instantanment', 'instantanement'],
    ['barme', 'bareme'],
    ['barmes', 'baremes'],
    ['Barme', 'Bareme'],
    ['intgr', 'integre'],
    ['reprsentent', 'representent'],
    ['tudes', 'etudes'],
    ['O trouver', 'Ou trouver'],
    ['Chteauroux', 'Chateauroux'],
    ['Besanon', 'Besancon'],
    ['Montbliard', 'Montbeliard'],
    ["Ardche", 'Ardeche'],
    ["Gorges de l'Ardche", "Gorges de l'Ardeche"],
    ['Dcouvrez', 'Decouvrez'],
    ['rgionales', 'regionales'],
    ['Rhne', 'Rhone'],
    ['indiqus', 'indiques'],
    ['indiqus', 'indiques'],
    ['titre', 'titre'],
    ['barmes', 'baremes'],
    ['habilit', 'habilite'],
    ['tablir', 'etablir'],
    ['dfinitif', 'definitif'],
    ['lacte', "l'acte"],
    ['carts', 'ecarts'],
    ['Hypothses', 'Hypotheses'],
    ['rfrences', 'references'],
    ['rdig', 'redige'],
    ['indpendant', 'independant'],
    ['immobilire', 'immobiliere'],
    ['Suprieur', 'Superieur'],
    ['amnagement', 'amenagement'],
    ['rnnovation', 'renovation'],
    ['coles', 'ecoles'],
    ['Idale', 'Ideal'],
    ['Trs', 'Tres'],
    ['grce', 'grace'],
    ['tudiant', 'etudiant'],
    ['prvoir', 'prevoir']
  ]

  let fixed = content
  for (const [from, to] of replacements) {
    fixed = fixed.split(from).join(to)
  }
  return fixed
}

/**
 * Remplace les identifiants AdSense corrompus par la valeur utilisee partout dans le repo.
 */
function fixAdsenseAccount(content) {
  return content.replace(
    /<meta name="google-adsense-account" content="ca-pub-[^"]*\?[^"]*" \/>/g,
    '<meta name="google-adsense-account" content="ca-pub-2209781252231399" />'
  )
}

/**
 * Traite un fichier specifique (ecrit un backup uniquement si le fichier change).
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
 * Resout la liste de fichiers a traiter.
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
 * Point d'entree principal.
 */
function main() {
  const targetDir = path.resolve(process.cwd(), 'src/pages/blog/departements')
  
  if (!fs.existsSync(targetDir)) {
    console.error('Directory not found:', targetDir)
    process.exit(1)
  }

  const targets = resolveTargetsFromArgs(process.argv.slice(2))
  if (targets.length === 0) {
    console.error('Usage: node scripts/fix-final-emoji-issues.js <liste de departements ou fichiers>')
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
