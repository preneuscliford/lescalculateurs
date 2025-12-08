import fs from 'node:fs'
import path from 'node:path'

function loadCfg() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'frais2025.json')
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function listPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f)).map((f) => path.join(dir, f))
}

function computeTotal(code, price, type, cfg) {
  const tr = cfg.emoluments
  let remaining = price
  let emoluments = 0
  for (let i = 0; i < tr.length; i++) {
    const taux = Number(tr[i].taux) / 100
    const max = tr[i].tranche_max == null ? Infinity : Number(tr[i].tranche_max)
    const prevMax = i === 0 ? 0 : Number(tr[i - 1].tranche_max || 0)
    const cap = Math.max(0, Math.min(price, max) - prevMax)
    emoluments += cap * taux
    remaining -= cap
  }
  const dmto = type === 'neuf' ? 0.00715 : ((cfg.dmto && cfg.dmto[code] != null) ? Number(cfg.dmto[code]) / 100 : 0.058)
  const droits = price * dmto
  const debours = Number(cfg.debours?.moyenne || 800)
  const formalites = 0
  const csi = Math.max(price * ((cfg.csi || 0.10) / 100), 15)
  const tva = 0.2 * (emoluments + formalites)
  const total = emoluments + droits + debours + formalites + csi + tva
  return { total }
}

function approxPct(x) {
  const pct = x * 100
  const t = Math.floor(pct * 100) / 100
  return `≈ ${t.toFixed(2).replace('.', ',')}%`
}

function euro(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €'
}

function fixFile(f, cfg) {
  const html = fs.readFileSync(f, 'utf8')
  const m = f.match(/frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/)
  const code = m ? m[1] : null
  if (!code) return false
  const price = 200000
  const A = computeTotal(code, price, 'ancien', cfg)
  const N = computeTotal(code, price, 'neuf', cfg)
  const aPct = approxPct(A.total / price)
  const nPct = approxPct(N.total / price)
  const aEur = euro(A.total)
  const nEur = euro(N.total)

  let updated = html
  // Ancien row fallback
  updated = updated.replace(/(<tr[\s\S]*?>[\s\S]*?<td[\s\S]*?>[\s\S]*?Ancien[\s\S]*?<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>[\s\S]*?<\/tr>)/i,
    (m, p1, v1, p2, v2, p3) => `${p1}${aPct}${p2}${aEur}${p3}`)
  // Neuf row fallback
  updated = updated.replace(/(<tr[\s\S]*?>[\s\S]*?<td[\s\S]*?>[\s\S]*?Neuf[\s\S]*?<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>[\s\S]*?<\/tr>)/i,
    (m, p1, v1, p2, v2, p3) => `${p1}${nPct}${p2}${nEur}${p3}`)

  if (updated !== html) {
    fs.writeFileSync(f, updated, 'utf8')
    return true
  }
  return false
}

function main() {
  const cfg = loadCfg()
  const files = listPages()
  let changed = 0
  for (const f of files) {
    if (fixFile(f, cfg)) changed++
  }
  console.log(`Type d’achat fix: ${changed} fichier(s) mis à jour sur ${files.length}.`)
}

main()
