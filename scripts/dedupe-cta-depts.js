import fs from 'node:fs'
import path from 'node:path'

/**
 * Liste les pages départements.
 */
function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-.*\.html$/.test(f)).map((f) => path.join(dir, f))
}

/**
 * Déduplique les marqueurs "<!-- CTA BLOCK START -->" pour éviter l'empilement.
 */
function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8')
  let html = original
  // Supprimer répétitions successives du marqueur
  html = html.replace(/(<!-- CTA BLOCK START -->\s*){2,}/g, '<!-- CTA BLOCK START -->\n')
  // Supprimer répétitions du bloc complet si collés
  html = html.replace(/(<!-- CTA BLOCK START -->[\s\S]*?<!-- CTA BLOCK END -->\s*){2,}/g, (m) => m.replace(/(<!-- CTA BLOCK START -->[\s\S]*?<!-- CTA BLOCK END -->)\s*\1/g, '$1\n'))

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8')
    return { filePath, changed: true }
  }
  return { filePath, changed: false }
}

/**
 * Point d'entrée.
 */
function main() {
  const files = listDeptPages()
  const results = files.map(fixFile)
  const changed = results.filter((r) => r.changed).length
  console.log(`CTA dedupe: ${changed} fichier(s) corrigé(s) sur ${files.length}.`)
}

main()
