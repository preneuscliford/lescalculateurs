import fs from 'node:fs'
import path from 'node:path'

const roots = [path.resolve(process.cwd(), 'src', 'pages')]
const patterns = [
  { re: /Indemnites kilometriques\s*2024/gi, rep: 'Indemnites kilometriques 2026' },
  { re: /baremes?\s+officiels\s+2025/gi, rep: 'baremes reglementes en vigueur' },
  { re: /Conformes aux baremes officiels\s*2025/gi, rep: 'Conformes aux baremes reglementes en vigueur' },
  { re: /Le calculateur N°1 !\s*Simulez[\s\S]*?baremes officiels\s*2025\./gi, rep: (m) => m.replace(/baremes officiels\s*2025/gi, 'baremes officiels') },
  { re: /Calculs precis en temps reel, conformes aux baremes officiels\s*2025, sans inscription/gi, rep: 'Calculs precis en temps reel, conformes aux baremes officiels, sans inscription' },
]

function replaceMany(text) {
  let t = text
  for (const p of patterns) {
    t = t.replace(p.re, typeof p.rep === 'function' ? p.rep : p.rep)
  }
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
      const updated = replaceMany(html)
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
  console.log(`Non-immobilier sweep updated: ${total} files`)
}

main()
