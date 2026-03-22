import fs from 'node:fs'
import path from 'node:path'

/**
 * Liste tous les fichiers HTML des departements.
 */
function listDeptFiles() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir)
    .filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f))
    .map((f) => path.join(dir, f))
}

/**
 * Remplace le fetch de baremes.json par frais2026.json, en conservant le nom de variable.
 */
function replaceBaremesJson(html) {
  return html.replace(
    /fetch\("\.\.\/\.\.\/\.\/data\/baremes\.json"\)/g,
    'fetch("../../../data/frais2026.json")'
  )
}

/**
 * Deduplique les marqueurs CTA consecutifs.
 */
function dedupeCtaMarkers(html) {
  // Compresser multiples START consecutifs en un seul
  html = html.replace(/(<!-- CTA BLOCK START -->\s*){2,}/g, '<!-- CTA BLOCK START -->\n')
  // Compresser multiples END consecutifs en un seul
  html = html.replace(/(<!-- CTA BLOCK END -->\s*){2,}/g, '<!-- CTA BLOCK END -->\n')
  return html
}

/**
 * Traite un fichier departement.
 */
function processFile(file) {
  const before = fs.readFileSync(file, 'utf8')
  let after = before
  after = replaceBaremesJson(after)
  after = dedupeCtaMarkers(after)
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8')
    return true
  }
  return false
}

/**
 * Entree principale.
 */
function main() {
  const files = listDeptFiles()
  const changed = files.map(processFile).filter(Boolean).length
  console.log(`Cleanup departements: ${changed} fichier(s) modifie(s) sur ${files.length}.`)
}

main()
