import fs from 'node:fs'
import path from 'node:path'

const targets = [
  path.resolve(process.cwd(), 'src', 'pages', 'blog'),
  path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements'),
  path.resolve(process.cwd(), 'src', 'pages'),
]

function replaceMentions(html) {
  let out = html
  out = out.replace(/≈?\s*5,81\s*%/gi, '≈ 6,32 %')
  out = out.replace(/≈?\s*5,80\s*%/gi, '≈ 6,32 %')
  // Standard phrases
  out = out.replace(/taux\s+standard\s+autour\s+de\s+≈?\s*5,8[01]\s*%/gi, 'taux usuel constaté autour de ≈ 6,32 %')
  out = out.replace(/droits d'enregistrement\s*\(5,8%\)/gi, `droits d'enregistrement (≈ 6,32%)`)
  return out
}

function processDir(dir) {
  const files = fs.readdirSync(dir)
  let changed = 0
  for (const f of files) {
    const p = path.join(dir, f)
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      changed += processDir(p)
    } else if (f.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8')
      const updated = replaceMentions(html)
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
  for (const t of targets) {
    if (fs.existsSync(t)) {
      total += processDir(t)
    }
  }
  console.log(`DMTO standard mentions swept: ${total} files`)
}

main()
