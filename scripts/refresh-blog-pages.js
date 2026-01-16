import fs from 'node:fs'
import path from 'node:path'

/**
 * Charge le JSON frais2025 (DMTO, émoluments, CSI, débours)
 */
function loadFraisConfig() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'frais2025.json')
  if (!fs.existsSync(p)) return null
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : null
  } catch (_) {
    return null
  }
}

function loadBaremesGen() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'baremes.generated.json')
  if (!fs.existsSync(p)) return null
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : null
  } catch (_) {
    return null
  }
}

/**
 * Calcule les émoluments proportionnels selon le barème du JSON.
 */
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

/**
 * Calcule les droits d'enregistrement (ancien/neuf) pour un code département.
 */
function computeDroits(code, price, cfg, type, baremesGen) {
  if (type === 'neuf') return price * 0.007
  // Priorité aux taux votés 2026 (base départementale) convertis en taux total
  const depBase = baremesGen?.notaire?.droits_mutation?.ancien?.par_departement?.[code]?.taux
  const toTotal = (t) => t + 0.012 + 0.0237 * t
  if (typeof depBase === 'number') return price * toTotal(depBase)
  // Fallback: ancienne carte dmto en %
  const tauxPct = cfg.dmto && cfg.dmto[code] != null ? Number(cfg.dmto[code]) / 100 : toTotal(0.05)
  return price * tauxPct
}

/**
 * Calcule la CSI (min 15€) selon le JSON.
 */
function computeCsi(price, cfg) {
  const taux = cfg && cfg.csi ? Number(cfg.csi) / 100 : 0.001
  return Math.max(price * taux, 15)
}

/**
 * Calcule TVA (20% sur émoluments + formalités)
 */
function computeTva(emoluments, formalites) {
  return 0.2 * (emoluments + formalites)
}

/**
 * Calcule détail et total des frais pour un exemple générique.
 */
function computeAll(code, price, type, cfg, baremesGen) {
  const emoluments = computeEmoluments(price, cfg)
  const droits = computeDroits(code, price, cfg, type, baremesGen)
  const debours = Number(cfg.debours?.moyenne || 800)
  const formalites = 0
  const csi = computeCsi(price, cfg)
  const tva = computeTva(emoluments, formalites)
  const total = emoluments + droits + debours + formalites + csi + tva
  return { emoluments, droits, debours, formalites, csi, tva, total }
}

/**
 * Formate un montant en euros (sans décimales).
 */
function euro(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €'
}

/**
 * Formate un pourcentage en troncature à 2 décimales avec ≈.
 */
function approxPct(x) {
  const pct = x * 100
  const truncated = Math.floor(pct * 100) / 100
  return `≈ ${truncated.toFixed(2).replace('.', ',')}%`
}

/**
 * Met à jour la page comparatif ancien/neuf avec les données calculées.
 */
function updateComparatifPage(cfg, baremesGen) {
  const file = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'frais-notaire-ancien-neuf-2025.html')
  if (!fs.existsSync(file)) return false
  let html = fs.readFileSync(file, 'utf8')

  // Exemple générique sur 300 000 € – utiliser un département à 5,00% base (code 01)
  const code = '01'
  const priceAncien = 300000
  const priceNeuf = 300000
  const A = computeAll(code, priceAncien, 'ancien', cfg, baremesGen)
  const N = computeAll(code, priceNeuf, 'neuf', cfg, baremesGen)

  // Encadré « En bref »
  html = html.replace(/<strong>6,6% dans l'ancien<\/strong>/, `<strong>${approxPct(A.total / priceAncien)} dans l'ancien</strong>`)
  html = html.replace(/<strong>4% dans le neuf<\/strong>/, `<strong>${approxPct(N.total / priceNeuf)} dans le neuf</strong>`)
  const eco = Math.round((A.total - N.total))
  html = html.replace(/<strong>7 800€ sur un bien à 300 000€<\/strong>/, `<strong>${euro(eco)} sur un bien à 300 000€</strong>`)

  // Tableau – Droits d'enregistrement ancien et neuf
  html = html.replace(/>5,80 %<\/td>/, `>${approxPct(A.droits / priceAncien)}<\/td>`)
  html = html.replace(/>0,70 % \+ TVA 20%<\/td>/, `>0,715 % (sur prix HT)<\/td>`)

  // Détail ancien
  html = html.replace(/Émoluments du notaire<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Émoluments du notaire</span><span class="font-bold">${euro(A.emoluments)}</span>`)
  html = html.replace(/Droits d'enregistrement \(5,8%\)<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Droits d'enregistrement (${approxPct(A.droits / priceAncien)})</span><span class="font-bold">${euro(A.droits)}</span>`)
  html = html.replace(/Débours \(cadastre, conservation\)<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Débours (cadastre, conservation)</span><span class="font-bold">${euro(A.debours)}</span>`)
  html = html.replace(/Formalités diverses<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Formalités diverses</span><span class="font-bold">${euro(A.formalites)}</span>`)
  html = html.replace(/Contribution Sécurité Immobilière<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Contribution Sécurité Immobilière</span><span class="font-bold">${euro(A.csi)}</span>`)
  html = html.replace(/TVA \(20% sur émoluments \+ formalités\)<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `TVA (20% sur émoluments + formalités)</span><span class="font-bold">${euro(A.tva)}</span>`)
  html = html.replace(/Total frais de notaire<\/span>\s*<span class="text-orange-600">[0-9\s]+\s€<\/span>/, `Total frais de notaire</span><span class="text-orange-600">${euro(A.total)}</span>`)
  html = html.replace(/Coût total à payer<\/span>\s*<span class="font-bold text-2xl text-orange-700">[0-9\s]+\s€<\/span>/, `Coût total à payer</span><span class="font-bold text-2xl text-orange-700">${euro(priceAncien + A.total)}</span>`)
  html = html.replace(/<strong>% des frais :<\/strong>\s*[0-9.,]+%/, `<strong>% des frais :</strong> ${(Math.floor((A.total / priceAncien) * 10000) / 100).toFixed(2).replace('.', ',')}%`)

  // Détail neuf
  html = html.replace(/Émoluments du notaire<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, (m) => m.replace(/>[^<]+</, `>${euro(N.emoluments)}<`))
  html = html.replace(/Droits d'enregistrement réduits \(0,715%\)<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Droits d'enregistrement réduits (0,715%)</span><span class="font-bold">${euro(N.droits)}</span>`)
  html = html.replace(/Débours \(VEFA\)<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Débours (VEFA)</span><span class="font-bold">${euro(N.debours)}</span>`)
  html = html.replace(/Formalités diverses<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Formalités diverses</span><span class="font-bold">${euro(N.formalites)}</span>`)
  html = html.replace(/Contribution Sécurité Immobilière<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `Contribution Sécurité Immobilière</span><span class="font-bold">${euro(N.csi)}</span>`)
  html = html.replace(/TVA \(20% sur émoluments \+ formalités\)<\/span>\s*<span class="font-bold">[0-9\s]+\s€<\/span>/, `TVA (20% sur émoluments + formalités)</span><span class="font-bold">${euro(N.tva)}</span>`)
  html = html.replace(/Total frais notaire<\/span>\s*<span class="text-blue-600">[0-9\s]+\s€<\/span>/, `Total frais notaire</span><span class="text-blue-600">${euro(N.total)}</span>`)
  html = html.replace(/Coût total à payer<\/span>\s*<span class="font-bold text-2xl text-blue-700">[0-9\s]+\s€<\/span>/, `Coût total à payer</span><span class="font-bold text-2xl text-blue-700">${euro(priceNeuf + N.total)}</span>`)
  html = html.replace(/<strong>% des frais :<\/strong>\s*[0-9.,]+%/, `<strong>% des frais :</strong> ${(Math.floor((N.total / priceNeuf) * 10000) / 100).toFixed(2).replace('.', ',')}%`)

  // Économie
  html = html.replace(/✅ Économie vs ancien : <span class="text-2xl">[0-9\s]+\s€<\/span>/, `✅ Économie vs ancien : <span class="text-2xl">${euro(A.total - N.total)}</span>`)

  fs.writeFileSync(file, html, 'utf8')
  return true
}

/**
 * Met à jour les textes génériques de la page « frais-notaire-departements ».
 */
function updateDepartementsTexts(cfg, baremesGen) {
  const file = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'frais-notaire-departements.html')
  if (!fs.existsSync(file)) return false
  let html = fs.readFileSync(file, 'utf8')

  // Taux standard autour de 5,81% -> ≈ 6,32%
  html = html.replace(/taux standard autour de 5,81 %/i, 'taux usuel constaté autour de ≈ 6,32 %')
  html = html.replace(/≈ 5,80 %/g, '≈ 6,32 %')

  // Liste des départements à taux réduits et spéciaux selon le JSON
  const txt = `taux réduits à 3,8 % dans quelques départements (ex. Indre, Mayotte), quelques départements à 4,50 % (ex. Hautes‑Alpes), et base votée à 5,00 % donnant ≈ 6,32 % en taux total (Paris et 92/93/94 inclus)`
  html = html.replace(/taux réduits à 3,8 % dans quelques départements \(ex\. Indre, Isère, Morbihan, Mayotte\)/i, txt)

  // Fourchettes génériques : ancien 7–8% / neuf 2–3% – remplacer par libellés ≈ si besoin
  html = html.replace(/7 \%/g, '≈ 6,60 %')
  html = html.replace(/8 \%/g, '≈ 7,00 %')
  html = html.replace(/2 à 3 \%/g, '≈ 1,90 % à ≈ 2,00 %')

  fs.writeFileSync(file, html, 'utf8')
  return true
}

/**
 * Point d'entrée principal.
 */
function main() {
  const cfg = loadFraisConfig()
  const baremesGen = loadBaremesGen()
  if (!cfg) {
    console.error('Configuration frais2025.json introuvable')
    process.exit(1)
  }
  const r1 = updateComparatifPage(cfg, baremesGen)
  const r2 = updateDepartementsTexts(cfg, baremesGen)
  console.log(`Blog refresh: comparatif=${r1 ? 'ok' : 'skip'}, departements=${r2 ? 'ok' : 'skip'}`)
}

main()
