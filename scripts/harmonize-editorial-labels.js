import fs from 'node:fs'
import path from 'node:path'

/**
 * Charge la configuration frais2025.json (barème CSN, DMTO, débours, CSI, TVA)
 */
function loadCfg() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'frais2025.json')
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

/**
 * Calcule total frais pour un prix et un code département (ancien/neuf)
 */
function computeTotal(code, price, type, cfg) {
  const tr = cfg.bareme_emoluments_2025?.tranches || []
  let remaining = price
  let emoluments = 0
  for (let i = 0; i < tr.length; i++) {
    const taux = Number(tr[i].taux)
    const max = tr[i].max === 999999999 ? Infinity : Number(tr[i].max)
    const prevMax = i === 0 ? 0 : Number(tr[i - 1].max || 0)
    const cap = Math.max(0, Math.min(price, max) - prevMax)
    emoluments += cap * taux
    remaining -= cap
  }
  const dmto = type === 'neuf' ? 0.00715 : ((cfg.dmto_struct?.ancien?.par_departement?.[code] != null) ? Number(cfg.dmto_struct.ancien.par_departement[code]) : Number(cfg.dmto_struct?.ancien?.default || 0.058))
  const droits = price * dmto
  const dep = cfg.debours?.par_departement?.[code]
  const debours = dep ? Number(dep.cadastre || 0) + Number(dep.conservation || 0) : Number(cfg.debours?.moyenne || 550)
  const formalites = dep ? Number(dep.formalites || 0) : 0
  const csi = Math.max(price * Number(cfg.csi?.taux || 0.001), Number(cfg.csi?.minimum || 15))
  const tva = Number(cfg.tva || 0.2) * (emoluments + formalites)
  const total = emoluments + droits + debours + formalites + csi + tva
  return { total }
}

/**
 * Formate un pourcentage approximatif (troncature 2 décimales)
 */
function approxPct(x) {
  const pct = x * 100
  const t = Math.floor(pct * 100) / 100
  return `≈ ${t.toFixed(2).replace('.', ',')}%`
}

/**
 * Liste les pages départements
 */
function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f)).map((f) => path.join(dir, f))
}

/**
 * Harmonise les libellés éditoriaux génériques (7–8%, 2–3%, 5.9%)
 */
function harmonizeFile(file, cfg) {
  const html = fs.readFileSync(file, 'utf8')
  const m = file.match(/frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/)
  const code = m ? m[1] : null
  if (!code) return false
  const price = 200000
  const A = computeTotal(code, price, 'ancien', cfg)
  const N = computeTotal(code, price, 'neuf', cfg)
  const aPct = approxPct(A.total / price)
  const nPct = approxPct(N.total / price)
  let updated = html
  // Remplacer fourchettes génériques par valeurs calculées
  updated = updated.replace(/≈\s*7[\s–-]8\s*%/g, aPct)
  updated = updated.replace(/≈\s*2\s*[,\.]?\s*3\s*%|≈\s*2[\s–-]3\s*%/g, nPct)
  // Corriger 5.9% -> 5,81% uniquement si mention de Paris dans la ligne
  updated = updated.replace(/(Paris[^\n]*?)5\.9\s*%/gi, (m, p1) => `${p1}5,81%`)
  if (updated !== html) {
    fs.writeFileSync(file, updated, 'utf8')
    return true
  }
  return false
}

/**
 * Point d'entrée principal
 */
function main() {
  const cfg = loadCfg()
  const files = listDeptPages()
  let changed = 0
  for (const f of files) {
    if (harmonizeFile(f, cfg)) changed++
  }
  console.log(`Harmonisation éditoriale: ${changed} fichier(s) mis à jour sur ${files.length}.`)
}

main()
