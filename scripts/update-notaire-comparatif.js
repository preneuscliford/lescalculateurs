import fs from 'node:fs'
import path from 'node:path'

function loadBaremes() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'baremes.generated.json')
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

function toTotalRate(depRate) {
  // total = t_dep + 1,20% communal + 2,37% de t_dep (frais d'assiette)
  return depRate + 0.012 + 0.0237 * depRate
}

function euro(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €'
}

function approxPctFromRate(rate) {
  const pct = rate * 100
  const truncated = Math.floor(pct * 100) / 100
  return `≈ ${truncated.toFixed(2).replace('.', ',')}%`
}

function main() {
  const baremes = loadBaremes()
  const file = path.resolve(process.cwd(), 'src', 'pages', 'notaire.html')
  if (!baremes || !fs.existsSync(file)) {
    console.error('Baremes ou page notaire introuvable')
    process.exit(1)
  }
  const dep = baremes.notaire?.droits_mutation?.ancien?.par_departement || {}
  const rMin = toTotalRate(0.038) // Indre (36) et Mayotte (976)
  const rMax = toTotalRate(0.05) // base votée majoritaire (Paris/IDF inclus)
  const price = 250000
  const minAmt = price * rMin
  const maxAmt = price * rMax

  let html = fs.readFileSync(file, 'utf8')
  // Replace the range sentence
  html = html.replace(
    /Les droits d’enregistrement \(DMTO\) varient de[\s\S]*?<\/p>/,
    `<p class="mb-2">
                Les droits d’enregistrement (DMTO) varient de
                <strong>${approxPctFromRate(rMin)}</strong> (36, 976)
                à <strong>${approxPctFromRate(rMax)}</strong> (majorité des départements, dont Paris/92/93/94).
              </p>`
  )
  // Replace bullet list with two items (min/max)
  html = html.replace(
    /<ul class="list-disc pl-6">[\s\S]*?<\/ul>/,
    `<ul class="list-disc pl-6">
                <li>${approxPctFromRate(rMin)} → <strong>${euro(minAmt)}</strong></li>
                <li>${approxPctFromRate(rMax)} → <strong>${euro(maxAmt)}</strong></li>
              </ul>`
  )
  // Replace the max difference line
  const diff = maxAmt - minAmt
  html = html.replace(
    /→ Écart maximal[^<]*<\/p>/,
    `→ Écart maximal&nbsp;:&nbsp;<strong>${euro(diff)}</strong> sur les seuls droits d’enregistrement.</p>`
  )

  fs.writeFileSync(file, html, 'utf8')
  console.log('Notaire comparatif updated:', {
    rMin: approxPctFromRate(rMin),
    rMax: approxPctFromRate(rMax),
    minAmt: euro(minAmt),
    maxAmt: euro(maxAmt),
    diff: euro(diff),
  })
}

main()
