import fs from 'node:fs'
import path from 'node:path'

function main() {
  const file = path.resolve(process.cwd(), 'src', 'pages', 'notaire.html')
  if (!fs.existsSync(file)) {
    console.error('notaire.html introuvable')
    process.exit(1)
  }
  let html = fs.readFileSync(file, 'utf8')
  html = html.replace(/Frais de Notaire 2025/g, 'Frais de Notaire 2026')
  html = html.replace(/barèmes officiels 2025/g, 'barèmes officiels 2026')
  html = html.replace(/Barèmes 2025/g, 'Barèmes 2026')
  html = html.replace(/Calculateur Frais de Notaire 2025/g, 'Calculateur Frais de Notaire 2026')
  html = html.replace(/en 2025/g, 'en 2026')
  html = html.replace(/2025/g, '2026')
  // Restore specific strings not to be 2026 blindly
  html = html.replace(/barèmes officiels 2026/g, 'barèmes réglementés en vigueur')
  html = html.replace(/CSN 2026/g, 'CSN')
  html = html.replace(/barèmes officiels 2024-2026/g, 'barèmes réglementés en vigueur')
  fs.writeFileSync(file, html, 'utf8')
  console.log('notaire.html year updated to 2026')
}

main()
