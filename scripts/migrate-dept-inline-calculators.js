import fs from 'node:fs'
import path from 'node:path'

/**
 * Liste les pages départements à migrer (HTML).
 */
function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-.*\.html$/.test(f)).map((f) => path.join(dir, f))
}

/**
 * Migre un fichier: remplace l'utilisation de baremes.json par frais2025.json
 * et adapte les lignes clés du calcul inline (tranches, CSI, DMTO).
 */
function migrateFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8')
  let html = original

  // Remplacer le fetch de baremes.json
  html = html.replace(
    /const\s+baremes\s*=\s*await\s*\(\s*await\s*fetch\(["']\.\.\/\.\.\/\.\.\/data\/baremes\.json["']\)\)\.json\(\);/,
    'const fraisCfg = await (await fetch("../../../data/frais2025.json")).json();'
  )

  // Adapter les tranches émoluments
  html = html.replace(
    /const\s+tranches\s*=\s*baremes\.notaire\.tranches;/,
    'const tranches = [\n' +
      '  { min: 0, max: 6500, taux: (fraisCfg.emoluments?.[0]?.taux || 3.945) / 100 },\n' +
      '  { min: 6500, max: 17000, taux: (fraisCfg.emoluments?.[1]?.taux || 1.627) / 100 },\n' +
      '  { min: 17000, max: 60000, taux: (fraisCfg.emoluments?.[2]?.taux || 1.085) / 100 },\n' +
      '  { min: 60000, max: Infinity, taux: (fraisCfg.emoluments?.[3]?.taux || 0.814) / 100 },\n' +
      '];'
  )

  // Adapter CSI
  html = html.replace(
    /const\s+csi\s*=\s*Math\.max\(Math\.round\(prixNetImmobilier\s*\*\s*baremes\.notaire\.csi\.taux\)\s*,\s*baremes\.notaire\.csi\.minimum\);/,
    'const csi = Math.max(Math.round(prixNetImmobilier * ((fraisCfg.csi || 0.10) / 100)), 15);'
  )

  // Adapter Droits d'enregistrement (remplace le bloc entier)
  html = html.replace(
    /\/\/\s*Droits d'enregistrement[\s\S]*?let\s+droitsEnregistrement[\s\S]*?;/,
    [
      '// Droits d\'enregistrement',
      'let tauxDroits = (fraisCfg.dmto && fraisCfg.dmto[values.departement] != null ? Number(fraisCfg.dmto[values.departement]) / 100 : 0.058);',
      'if (typeBien === "neuf") { tauxDroits = 0.00715; }',
      'let droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;'
    ].join('\n')
  )

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8')
    return { filePath, changed: true }
  }
  return { filePath, changed: false }
}

/**
 * Point d'entrée principal: migre toutes les pages départements.
 */
function main() {
  const files = listDeptPages()
  const results = files.map(migrateFile)
  const changed = results.filter((r) => r.changed).length
  console.log(`Migration inline calculators: ${changed} fichier(s) mis à jour sur ${files.length}.`)
}

main()
