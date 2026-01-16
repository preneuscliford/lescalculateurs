import fs from 'node:fs'
import path from 'node:path'

function loadCfg() {
  const genP = path.resolve(process.cwd(), 'src', 'data', 'baremes.generated.json')
  const jsonP = path.resolve(process.cwd(), 'src', 'data', 'frais2025.json')
  let cfg = null
  if (fs.existsSync(jsonP)) {
    try {
      const raw = fs.readFileSync(jsonP, 'utf8')
      cfg = JSON.parse(raw)
    } catch {}
  }
  // Optionnel: fusion partielle avec baremes.generated.json (priorité overrides)
  if (fs.existsSync(genP)) {
    try {
      const raw2 = fs.readFileSync(genP, 'utf8')
      const b = JSON.parse(raw2)
      const dmOverrides = b?.notaire?.droitsMutation?.overrides || b?.notaire?.droits_mutation?.ancien?.overrides || {}
      const dmDept = b?.notaire?.droits_mutation?.ancien?.par_departement || {}
      if (!cfg) cfg = {}
      cfg.dmto_overrides = dmOverrides
      cfg.dmto_default = 0.0632  // Taux DMTO majoré 2026 (87 départements)
      cfg.dmto_neuf_default = 0.00715
      cfg.dmto_departmental = dmDept
    } catch {}
  }
  return cfg
}

function euro(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €'
}

function approxPctFromRatio(ratio) {
  const pct = ratio * 100
  const truncated = Math.floor(pct * 100) / 100
  return `≈ ${truncated.toFixed(2).replace('.', ',')}%`
}

function parseEuro(str) {
  const clean = str.replace(/\s| |&nbsp;/g, '').replace('€', '').replace(',', '.')
  const n = Number(clean)
  return Number.isFinite(n) ? n : null
}

function computeEmoluments(price, cfg) {
  let remaining = price
  let total = 0
  for (let i = 0; i < cfg.emoluments.length; i++) {
    const tr = cfg.emoluments[i]
    const taux = Number(tr.taux) / 100
    if (tr.tranche_max == null) {
      total += remaining * taux
      remaining = 0
      break
    }
    const prevMax = i === 0 ? 0 : (cfg.emoluments[i - 1].tranche_max || 0)
    const cap = Math.max(0, Math.min(price, tr.tranche_max) - prevMax)
    total += cap * taux
    remaining -= cap
  }
  return total
}

function computeDroits(code, price, cfg, type) {
  if (type === 'neuf') return price * (cfg.dmto_neuf_default || 0.00715)
  const override = cfg.dmto_overrides && cfg.dmto_overrides[code]
  if (override != null) return price * Number(override)
  const dmtoPct = cfg.dmto && cfg.dmto[code] != null ? Number(cfg.dmto[code]) / 100 : (cfg.dmto_default || 0.0632)
  return price * dmtoPct
}

function computeDebours(code, cfg) {
  const pd = cfg.debours?.par_departement?.[code]
  if (pd) {
    const { cadastre = 0, conservation = 0, formalites = 0 } = pd
    return { debours: (cadastre + conservation), formalites }
  }
  const m = Number(cfg.debours?.moyenne || 800)
  return { debours: m, formalites: 0 }
}

function computeCsi(price, cfg) {
  const taux = cfg && cfg.csi ? Number(cfg.csi.taux || cfg.csi) : 0.001
  const min = cfg && cfg.csi && cfg.csi.minimum != null ? Number(cfg.csi.minimum) : 15
  return Math.max(price * taux, min)
}

function computeTva(emoluments, formalites) {
  return 0.2 * (emoluments + formalites)
}

function computeAll(code, price, type, cfg) {
  const emoluments = computeEmoluments(price, cfg)
  const droits = computeDroits(code, price, cfg, type)
  const { debours, formalites } = computeDebours(code, cfg)
  const csi = computeCsi(price, cfg)
  const tva = computeTva(emoluments, formalites)
  const total = emoluments + droits + debours + formalites + csi + tva
  return { emoluments, droits, debours, formalites, csi, tva, total }
}

function updateDmtoText(html, code, cfg) {
  const departmental = cfg.dmto_departmental && cfg.dmto_departmental[code] && Number(cfg.dmto_departmental[code].taux)
  const toTotal = (t) => (t + 0.012 + 0.0237 * t) * 100
  const val =
    departmental != null
      ? toTotal(departmental)
      : (cfg.dmto && cfg.dmto[code]) ||
        (cfg.dmto_overrides && Number(cfg.dmto_overrides[code]) * 100)
  if (val == null) return html
  // Remplace la mention des droits d'enregistrement dans un encadré repères
  html = html.replace(
    /(droits d'enregistrement[^<]*?)<strong>[^<%]+%<\/strong>/i,
    `$1<strong>≈ ${String(val).replace('.', ',')}&nbsp;%</strong>`
  )
  return html
}

function updateExampleTable(html, code, cfg) {
  // Si la table mentionne 200 000€, on recalcule les deux lignes
  if (!/200[\s ]?000/.test(html)) return html
  const price = 200000
  const A = computeAll(code, price, 'ancien', cfg)
  const N = computeAll(code, price, 'neuf', cfg)
  // Remplace le premier pourcentage et montant (ancien)
  html = html.replace(
    /(Ancien[^\n]*?\s*<\/td>\s*<td[^>]*>)[^<%]+%/,
    `$1${approxPctFromRatio(A.total / price).replace('%', '')}`
  )
  html = html.replace(
    /(Ancien[^\n]*?\s*<\/td>\s*<td[^>]*>[^<]+<\/td>\s*<td[^>]*>)[^<€]+€/,
    `$1${euro(A.total)}`
  )
  // Remplace le pourcentage et montant (neuf)
  html = html.replace(
    /(Neuf[^\n]*?\s*<\/td>\s*<td[^>]*>)[^<%]+%/,
    `$1${approxPctFromRatio(N.total / price).replace('%', '')}`
  )
  html = html.replace(
    /(Neuf[^\n]*?\s*<\/td>\s*<td[^>]*>[^<]+<\/td>\s*<td[^>]*>)[^<€]+€/,
    `$1${euro(N.total)}`
  )
  // Éventuelle ligne d'économie
  html = html.replace(
    /(Économie[^<]+:\s*<span[^>]*>)[^<€]+€(<\/span>)/,
    `$1${euro(A.total - N.total)}$2`
  )
  return html
}

function updateSimulationBlock(html, code, cfg) {
  // Cherche "Prix du bien (ancien)" puis met à jour "Frais de notaire (barème officiel)"
  const m = html.match(/Prix du bien\s*\(ancien\)[\s\S]*?<span class="font-bold">([^<]+)€<\/span>/i)
  if (!m) return html
  const price = parseEuro(m[1])
  if (!price) return html
  const A = computeAll(code, price, 'ancien', cfg)
  html = html.replace(
    /(Frais de notaire\s*\(barème officiel\)[\s\S]*?<span class="font-bold [^"]*">)[^<€]+€(<\/span>)/i,
    `$1${euro(A.total)}$2`
  )
  return html
}

function processFile(file, cfg) {
  const base = path.basename(file)
  const code = base.replace(/^\D+|-.*$/g, '').replace('.html', '')
  let html = fs.readFileSync(file, 'utf8')
  const before = html
  html = updateDmtoText(html, code, cfg)
  html = updateExampleTable(html, code, cfg)
  html = updateSimulationBlock(html, code, cfg)
  // Ajout d'une note source si le DMTO du département est spécifique (≠ 5,80 %)
  const dmto = (cfg.dmto && cfg.dmto[code]) || (cfg.dmto_overrides && Number(cfg.dmto_overrides[code]) * 100)
  if (dmto != null && Number(dmto) !== 5.80) {
    let sourceLinks = ''
    const perDept = (cfg.dmto_sources_par_departement || {})[code]
    if (perDept && perDept.url) {
      const dateTxt = perDept.date ? ` (date d'effet ${perDept.date})` : ''
      sourceLinks = `<a href="${perDept.url}" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">Source départementale${dateTxt}</a>`
    } else {
      sourceLinks = Array.isArray(cfg.sources)
        ? cfg.sources.map(u => `<a href="${u}" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">${u}</a>`).join(' • ')
        : 'Service-public, impots.gouv.fr, Legifrance'
    }
    const note = `
    <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <p class="text-sm text-gray-700 m-0">
        Source officielle des taux DMTO :
        ${sourceLinks}
      </p>
    </div>`
    html = html.replace(/(<div class="prose prose-lg max-w-none">)/, `$1\n${note}`)
  }
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8')
    return true
  }
  return false
}

function main() {
  const cfg = loadCfg()
  if (!cfg) {
    console.error('Configuration frais2025.json introuvable')
    process.exit(1)
  }
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'))
  let changed = 0
  for (const f of files) {
    const ok = processFile(path.join(dir, f), cfg)
    if (ok) changed++
  }
  console.log(`Department pages updated: ${changed} files`)
}

main()
