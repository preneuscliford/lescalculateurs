import fs from 'node:fs'
import path from 'node:path'

/**
 * Charge src/data/baremes.json (barème CSN, DMTO, CSI, TVA, frais divers)
 */
function loadBaremes() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'baremes.json')
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

/**
 * Liste toutes les pages départements à mettre à jour
 */
function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f)).map((f) => path.join(dir, f))
}

/**
 * Calcule les émoluments proportionnels selon bareme.notaire.tranches
 */
function computeEmoluments(price, baremes) {
  const tr = baremes.notaire?.tranches || []
  let remaining = price
  let total = 0
  for (let i = 0; i < tr.length; i++) {
    const taux = Number(tr[i].taux)
    const max = Number(tr[i].max)
    const prevMax = i === 0 ? 0 : Number(tr[i - 1].max || 0)
    const cap = Math.max(0, Math.min(price, max) - prevMax)
    total += cap * taux
    remaining -= cap
  }
  return total
}

/**
 * Retourne le taux DMTO (décimal) pour un code et un type (ancien/neuf)
 */
function getDmtoRate(code, type, baremes) {
  if (type === 'neuf') return Number(baremes.notaire?.droitsMutation?.neuf || 0.00715)
  const pct = baremes.dmto?.[String(code)]
  return pct != null ? Number(pct) / 100 : Number(baremes.notaire?.droitsMutation?.standard || 0.0581)
}

/**
 * Calcule débours et formalités d'après baremes.notaire.fraisDivers
 */
function computeDeboursFormalites(baremes) {
  const fd = baremes.notaire?.fraisDivers || {}
  const debours = Number(fd.cadastre || 0) + Number(fd.conservation || 0)
  const formalites = Number(fd.formalites || 0)
  return { debours, formalites }
}

/**
 * Calcule CSI (min 15€ ou taux 0,1%) et TVA (20%)
 */
function computeCsiTva(price, emoluments, formalites, baremes) {
  const csiTaux = Number(baremes.notaire?.csi?.taux || 0.001)
  const csiMin = Number(baremes.notaire?.csi?.minimum || 15)
  const csi = Math.max(price * csiTaux, csiMin)
  const tvaTaux = Number(baremes.notaire?.tva || 0.2)
  const tva = tvaTaux * (emoluments + formalites)
  return { csi, tva }
}

/**
 * Calcule le total complet des frais
 */
function computeAll(code, price, type, baremes) {
  const emoluments = computeEmoluments(price, baremes)
  const { debours, formalites } = computeDeboursFormalites(baremes)
  const droits = price * getDmtoRate(code, type, baremes)
  const { csi, tva } = computeCsiTva(price, emoluments, formalites, baremes)
  const total = emoluments + droits + debours + formalites + csi + tva
  return { total, emoluments, droits, debours, formalites, csi, tva }
}

/**
 * Formate pourcentage approximatif (troncature)
 */
function approxPct(x) {
  const pct = x * 100
  const t = Math.floor(pct * 100) / 100
  return `≈ ${t.toFixed(2).replace('.', ',')}%`
}

/**
 * Formate montant euro (sans décimales)
 */
function euro(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €'
}

/**
 * Met à jour la table "Type d’achat" pour le code département
 */
function updateTypeTable(html, code, baremes) {
  const price = 200000
  const A = computeAll(code, price, 'ancien', baremes)
  const N = computeAll(code, price, 'neuf', baremes)
  const aPct = approxPct(A.total / price)
  const nPct = approxPct(N.total / price)
  const aEur = euro(A.total)
  const nEur = euro(N.total)
  let updated = html
  // Ancien
  updated = updated.replace(/(<tr[\s\S]*?>[\s\S]*?<td[\s\S]*?>[\s\S]*?Ancien[\s\S]*?<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>)/i, (m, p1, _v1, p2, _v2, p3) => `${p1}${aPct}${p2}${aEur}${p3}`)
  // Neuf
  updated = updated.replace(/(<tr[\s\S]*?>[\s\S]*?<td[\s\S]*?>[\s\S]*?Neuf[\s\S]*?<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>[\s\S]*?<td[\s\S]*?>)([\s\S]*?)(<\/td>)/i, (m, p1, _v1, p2, _v2, p3) => `${p1}${nPct}${p2}${nEur}${p3}`)
  return updated
}

/**
 * Met à jour le bloc "Tarifs Officiels" (émoluments, droits, débours, formalités, CSI)
 */
function updateTarifsBlock(html, code, baremes) {
  const dmtoPct = approxPct(getDmtoRate(code, 'ancien', baremes))
  const fd = baremes.notaire?.fraisDivers || {}
  let updated = html
  // Émoluments tranches (valeurs légales)
  updated = updated.replace(/>3\.945%<\/span>/g, '>3,870%<\/span>')
  updated = updated.replace(/>1\.627%<\/span>/g, '>1,596%<\/span>')
  updated = updated.replace(/>1\.085%<\/span>/g, '>1,064%<\/span>')
  updated = updated.replace(/>0\.814%<\/span>/g, '>0,799%<\/span>')
  // Droits ancien/Neuf
  updated = updated.replace(/(Immobilier ancien<\/span>\s*<span[^>]*>)[^<]*(<\/span>)/, `$1${dmtoPct}$2`)
  updated = updated.replace(/(Immobilier neuf \(TFPB\)<\/span>\s*<span[^>]*>)[^<]*(<\/span>)/, `$10,71%$2`)
  // Débours/Formalités/CSI
  updated = updated.replace(/(Débours \(moyenne\)<\/span>\s*<span[^>]*>)[^<]*(<\/span>)/, `$1${euro((Number(fd.cadastre||0)+Number(fd.conservation||0)))}$2`)
  updated = updated.replace(/(Formalités<\/span>\s*<span[^>]*>)[^<]*(<\/span>)/, `$1${euro(Number(fd.formalites||0))}$2`)
  updated = updated.replace(/(CSI<\/span>\s*<span[^>]*><strong>)[^<]*(<\/strong><\/span>)/, `$1min 15€ ou 0,10%$2`)
  return updated
}

/**
 * Met à jour le résumé jaune "Frais de notaire 2025 à …" avec les montants calculés
 */
function updateSummary(html, code, name, baremes) {
  const price = 200000
  const A = computeAll(code, price, 'ancien', baremes)
  const N = computeAll(code, price, 'neuf', baremes)
  const droitAncien = approxPct(getDmtoRate(code, 'ancien', baremes))
  const droitNeuf = approxPct(getDmtoRate(code, 'neuf', baremes))
  const line = `💰 Frais de notaire 2025 à ${name} (${code}) : ≈ ${euro(A.total)} pour 200 000 € (ancien, droits ${droitAncien}) • ≈ ${euro(N.total)} pour 200 000 € (neuf, droits ${droitNeuf})`
  // Remplacer la ligne du résumé si présente
  let updated = html.replace(/💰\s*Frais\s*de\s*notaire[\s\S]*?\(neuf,[\s\S]*?\)\s*/i, line)
  return updated
}

/**
 * Met à jour le bloc local "Calcul frais de notaire …" sous le H2
 */
function updateLocalBlock(html, code, baremes) {
  const price = 200000
  const A = computeAll(code, price, 'ancien', baremes)
  const N = computeAll(code, price, 'neuf', baremes)
  const droitAncien = approxPct(getDmtoRate(code, 'ancien', baremes))
  const droitNeuf = approxPct(getDmtoRate(code, 'neuf', baremes))
  const paragraph = `          Ancien : ≈ ${euro(A.total)} pour 200 000 € (droits ${droitAncien}) • Neuf : ≈ ${euro(N.total)} pour 200 000 € (droits ${droitNeuf}).`
  return html.replace(/Ancien\s*:\s*≈[\s\S]*?\(droits[\s\S]*?\)\.[\s\S]*?/i, paragraph)
}

/**
 * Récupère le nom du département depuis departements.json
 */
function getDeptName(code) {
  try {
    const depPath = path.resolve(process.cwd(), 'src', 'data', 'departements.json')
    const raw = fs.readFileSync(depPath, 'utf8')
    const data = JSON.parse(raw)
    if (Array.isArray(data)) {
      const found = data.find((d) => String(d.code).toUpperCase() === String(code).toUpperCase())
      return found?.nom || String(code)
    } else {
      return data[String(code)]?.nom || String(code)
    }
  } catch (_) {
    return String(code)
  }
}

/**
 * Traite un fichier département: met à jour les trois blocs
 */
function processFile(file, baremes) {
  const html = fs.readFileSync(file, 'utf8')
  const m = file.match(/frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/)
  const code = m ? m[1] : null
  if (!code) return false
  const name = getDeptName(code)
  let updated = html
  updated = updateTypeTable(updated, code, baremes)
  updated = updateTarifsBlock(updated, code, baremes)
  updated = updateSummary(updated, code, name, baremes)
  updated = updateLocalBlock(updated, code, baremes)
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
  const baremes = loadBaremes()
  const files = listDeptPages()
  let changed = 0
  for (const f of files) {
    if (processFile(f, baremes)) changed++
  }
  console.log(`Synchronisation blog avec baremes.json: ${changed} fichier(s) mis à jour sur ${files.length}.`)
}

main()
