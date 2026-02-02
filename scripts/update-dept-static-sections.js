import fs from 'node:fs'
import path from 'node:path'

/**
 * Charge la configuration frais2026.json (DMTO, émoluments, CSI, débours).
 */
function loadFraisCfg() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'frais2026.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

/**
 * Formate un pourcentage en troncature à 2 décimales avec séparateur français.
 */
function approxPct(n) {
  const p = n * 100
  const t = Math.floor(p * 100) / 100
  return `≈ ${t.toFixed(2).replace('.', ',')}%`
}

/**
 * Calcule un total frais complet pour un prix et un code département.
 */
function computeTotal(code, price, type, cfg) {
  const tr = cfg.emoluments || []
  const toDec = (x) => Number(x) / 100
  let remaining = price
  let emoluments = 0
  for (let i = 0; i < tr.length; i++) {
    const t = tr[i]
    const taux = toDec(t.taux)
    const max = t.tranche_max == null ? Infinity : Number(t.tranche_max)
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
  return { total, emoluments, droits, debours, formalites, csi, tva }
}

/**
 * Liste les pages départements.
 */
function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f)).map((f) => path.join(dir, f))
}

/**
 * Met à jour la section statique "Tarifs officiels" dans une page département.
 */
function updateStaticTarifs(html, code, cfg) {
  // Émoluments (tranches) — barème légal CSN 2025 (remplacements globaux)
  html = html.replace(/>3\.87%<\/span>/g, '>3,870%<\/span>')
  html = html.replace(/>1\.60%<\/span>/g, '>1,596%<\/span>')
  html = html.replace(/>1\.06%<\/span>/g, '>1,064%<\/span>')
  html = html.replace(/>0\.80%<\/span>/g, '>0,799%<\/span>')

  // Droits d'enregistrement — ancien (remplace la valeur affichée)
  const ancienPct = approxPct(((cfg.dmto && cfg.dmto[code] != null) ? Number(cfg.dmto[code]) / 100 : 0.058))
  html = html.replace(/(Immobilier ancien<\/span>\s*<span[^>]*>)[^<]*(<\/span>)/, `$1${ancienPct}$2`)

  // Droits neuf (TFPB) reste 0,71%
  html = html.replace(/Immobilier neuf \(TFPB\)<\/span>\s*<span[^>]*>[^<]*<\/span>/, `Immobilier neuf (TFPB)<\/span><span class="font-mono bg-green-100 px-3 py-1 rounded">0,71%<\/span>`)

  // Débours / Formalités / CSI
  html = html.replace(/<span class="text-gray-700">Cadastre \(ancien\)<\/span>[\s\S]*?<span class="text-gray-700"><strong>CSI \(forfaitaire\)<\/strong><\/span>[\s\S]*?<strong>50€<\/strong><\/span>/, (
    `<span class="text-gray-700">Débours (moyenne)<\/span>\n                <span class="font-mono bg-purple-100 px-3 py-1 rounded">500–600€<\/span>\n              </div>\n              <div class="flex justify-between items-center">\n                <span class="text-gray-700">Formalités<\/span>\n                <span class="font-mono bg-purple-100 px-3 py-1 rounded">0€<\/span>\n              </div>\n              <div class="flex justify-between items-center border-t pt-2 mt-2">\n                <span class="text-gray-700"><strong>CSI<\/strong><\/span>\n                <span class="font-mono bg-indigo-100 px-3 py-1 rounded"><strong>min 15€ ou 0,10%<\/strong><\/span>`
  ))
  return html
}

/**
 * Met à jour la table "Type de bien" si présente (Paris et autres), pour 200k€.
 */
function updateTypeDeBien(html, code, cfg) {
  const price = 200000
  const A = computeTotal(code, price, 'ancien', cfg)
  const N = computeTotal(code, price, 'neuf', cfg)
  const ancienRate = approxPct(A.total / price)
  const neufRate = approxPct(N.total / price)
  const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €'
  // Ancien — remplace la 2e et 3e colonne du tableau Type d’achat
  html = html.replace(/(<td[^>]*>\s*🏡\s*Ancien\s*\([^<]*\)<\/td>\s*<td[^>]*>)[^<]+(<\/td>\s*<td[^>]*>)[^<]+(<\/td>)/i,
    (m, p1, p2, p3) => `${p1}${ancienRate}${p2}${fmt(A.total)}${p3}`)
  // Neuf — remplace la 2e et 3e colonne
  html = html.replace(/(<td[^>]*>\s*🏢\s*Neuf\s*\(VEFA\)<\/td>\s*<td[^>]*>)[^<]+(<\/td>\s*<td[^>]*>)[^<]+(<\/td>)/i,
    (m, p1, p2, p3) => `${p1}${neufRate}${p2}${fmt(N.total)}${p3}`)
  return html
}

/**
 * Traite un fichier département: met à jour les sections statiques.
 */
function processFile(filePath, cfg) {
  const original = fs.readFileSync(filePath, 'utf8')
  const codeMatch = path.basename(filePath).match(/frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/)
  const code = codeMatch ? codeMatch[1] : null
  let html = original
  if (code) {
    html = updateStaticTarifs(html, code, cfg)
    html = updateTypeDeBien(html, code, cfg)
  }
  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8')
    return { filePath, changed: true }
  }
  return { filePath, changed: false }
}

/**
 * Point d'entrée principal.
 */
function main() {
  const cfg = loadFraisCfg()
  if (!cfg) {
    console.error('frais2026.json introuvable')
    process.exit(1)
  }
  const files = listDeptPages()
  const results = files.map((f) => processFile(f, cfg))
  const changed = results.filter((r) => r.changed).length
  console.log(`Sections statiques mises à jour: ${changed} fichier(s) sur ${files.length}.`)
}

main()
