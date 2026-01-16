import fs from 'node:fs'
import path from 'node:path'

const roots = [
  path.resolve(process.cwd(), 'src', 'pages'),
  path.resolve(process.cwd(), 'src', 'pages', 'blog'),
  path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements'),
]

function replaceSources(text) {
  let t = text
  t = t.replace(/Chambre des Notaires France\s*2026/gi, 'Droits d\'enregistrement — impots.gouv.fr')
  t = t.replace(/Chambre des Notaires France\s*2025/gi, 'Droits d\'enregistrement — impots.gouv.fr')
  t = t.replace(/(Source:\s*).*?Chambre des Notaires.*?(<\/li>|<\/p>)/gi, `$1 <a href="https://www.impots.gouv.fr/droits-denregistrement" target="_blank" rel="nofollow noopener" class="text-blue-700 underline">Droits d'enregistrement — impots.gouv.fr</a>$2`)
  return t
}

function processDir(dir) {
  const entries = fs.readdirSync(dir)
  let changed = 0
  for (const e of entries) {
    const p = path.join(dir, e)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      changed += processDir(p)
    } else if (e.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8')
      const updated = replaceSources(html)
      if (updated !== html) {
        fs.writeFileSync(p, updated, 'utf8')
        changed++
      }
    }
  }
  return changed
}

function main() {
  let total = 0
  for (const r of roots) {
    if (fs.existsSync(r)) {
      total += processDir(r)
    }
  }
  console.log(`Sources sweep updated: ${total} files`)
}

main()
