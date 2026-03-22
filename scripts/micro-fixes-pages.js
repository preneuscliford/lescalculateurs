import fs from 'node:fs'
import path from 'node:path'

function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f)).map((f) => path.join(dir, f))
}

function fixContent(html) {
  let out = html
  // 1) Bareme officiel 2025 -> 2024-2025
  out = out.replace(/Bareme\s+officiel\s+2025/gi, 'Bareme officiel 2024-2025')
  // 2) Remplacer "Neuf : droits reduits uniformes (0,715%)" -> "Droits reduits uniformises (0,715 %)"
  out = out.replace(/Neuf\s*:\s*droits\s+rEduits\s+uniformes\s*\(0,715%\)/gi, 'Droits reduits uniformises (0,715 %)')
  out = out.replace(/Neuf\s*:\s*droits\s+reduits\s+uniformes\s*\(0,715%\)/gi, 'Droits reduits uniformises (0,715 %)')
  // 3) Dedupliquer la phrase "Inclut droits, emoluments, formalites, CSI et TVA"
  const reInclut = /(Inclut\s+droits,\s+emoluments,\s+formalites,\s+CSI\s+et\s+TVA)/gi
  let first = true
  out = out.replace(reInclut, (m) => {
    if (first) { first = false; return m }
    return ''
  })
  return out
}

function main() {
  const files = listDeptPages()
  let changed = 0
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8')
    const fixed = fixContent(html)
    if (fixed !== html) {
      fs.writeFileSync(f, fixed, 'utf8')
      changed++
    }
  }
  console.log(`Micro-fixes: ${changed} fichier(s) corrige(s) sur ${files.length}.`)
}

main()
