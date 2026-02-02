import fs from 'node:fs'
import path from 'node:path'

function loadCfg() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'frais2026.json')
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

function parseDisplayed(html) {
  const tbMatch = html.match(/<thead[\s\S]*?>[\s\S]*?Type d’achat[\s\S]*?<\/thead>[\s\S]*?<tbody[\s\S]*?>([\s\S]*?)<\/tbody>/i)
  if (!tbMatch) return null
  const tbody = tbMatch[1]
  const rows = [...tbody.matchAll(/<tr[\s\S]*?>[\s\S]*?<td[\s\S]*?>[\s\S]*?<\/td>\s*<td[\s\S]*?>([^<]+)<\/td>\s*<td[\s\S]*?>([^<]+)<\/td>[\s\S]*?<\/tr>/gi)]
  if (rows.length < 2) return null
  const clean = (s) => s.replace(/[^0-9,\.]/g, '').replace(',', '.').trim()
  const pct = (s) => parseFloat(clean(s))
  const eur = (s) => parseFloat(clean(s))
  return {
    ancien: { pct: pct(rows[0][1]), eur: eur(rows[0][2]) },
    neuf: { pct: pct(rows[1][1]), eur: eur(rows[1][2]) },
  }
}

function main() {
  const cfg = loadCfg()
  const files = listPages()
  const price = 200000
  let mismatches = 0
  const out = []
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8')
    const m = f.match(/frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/)
    const code = m ? m[1] : null
    const disp = parseDisplayed(html)
    if (!code || !disp) continue
    const A = computeTotal(code, price, 'ancien', cfg)
    const N = computeTotal(code, price, 'neuf', cfg)
    const aPct = Math.floor((A.total / price) * 10000) / 100
    const nPct = Math.floor((N.total / price) * 10000) / 100
    const aEur = Math.round(A.total)
    const nEur = Math.round(N.total)
    const isMismatch = Math.abs(disp.ancien.pct - aPct) > 0.2 || Math.abs(disp.neuf.pct - nPct) > 0.2 || Math.abs(disp.ancien.eur - aEur) > 300 || Math.abs(disp.neuf.eur - nEur) > 300
    if (isMismatch) {
      mismatches++
      out.push({ file: f, shown: disp, expected: { ancien: { pct: aPct, eur: aEur }, neuf: { pct: nPct, eur: nEur } } })
    }
  }
  console.log(`Type d’achat audit: ${mismatches} page(s) incohérentes sur ${files.length}.`)
  if (out.length) {
    console.log(JSON.stringify(out.slice(0, 10), null, 2))
  }
}

main()
