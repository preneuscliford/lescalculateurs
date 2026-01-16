import fs from 'node:fs'
import path from 'node:path'

const roots = [
  path.resolve(process.cwd(), 'src'),
  path.resolve(process.cwd(), 'src', 'pages'),
  path.resolve(process.cwd(), 'src', 'pages', 'blog'),
  path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements'),
]

function replaceSEO(text) {
  let t = text
  // Titles
  t = t.replace(/<title>\s*Frais de Notaire 2025([\s\S]*?)<\/title>/gi, '<title>Frais de notaire 2026 — Données officielles (CGI, Loi de finances 2025)</title>')
  // OG/Twitter
  t = t.replace(/content="Frais de Notaire 2025([\s\S]*?)"/gi, 'content="Frais de notaire 2026 — Données officielles (CGI, Loi de finances 2025)"')
  t = t.replace(/content="🏠\s*Frais de Notaire 2025([\s\S]*?)"/gi, 'content="🏠 Frais de notaire 2026 — Données officielles (CGI)"')
  t = t.replace(/content="Économisez des milliers d'euros sur vos frais de notaire 2025"/gi, 'content="Économisez des milliers d\'euros sur vos frais de notaire 2026"')
  // Meta keywords/descriptions year bump
  t = t.replace(/frais notaire 2025/gi, 'frais notaire 2026')
  t = t.replace(/barèmes?\s+2025/gi, 'barèmes réglementés en vigueur')
  // JSON-LD name fields
  t = t.replace(/"name":\s*"Calculateur Frais de Notaire 2025"/gi, '"name": "Calculateur Frais de notaire 2026"')
  t = t.replace(/"name":\s*"Calculateur Frais de Notaire 2026"/gi, '"name": "Calculateur Frais de notaire 2026"')
  // Inline headings
  t = t.replace(/Frais de Notaire 2025/gi, 'Frais de notaire 2026')
  t = t.replace(/Barèmes\s*2025/gi, 'Barèmes 2026')
  // Footer years
  t = t.replace(/©\s*2025\s*Les Calculateurs/gi, '© 2026 Les Calculateurs')
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
      const updated = replaceSEO(html)
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
  console.log(`SEO 2026 sweep updated: ${total} files`)
}

main()
