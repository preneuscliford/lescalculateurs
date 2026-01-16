import fs from 'node:fs'
import path from 'node:path'

const DISCLAIMER = 'Les calculs reposent sur les barèmes réglementés en vigueur et les taux départementaux connus à date. Ils constituent une estimation indicative et non contractuelle.'

function replaceYearBarreme(html) {
  html = html.replace(/barème\s*20(2[45]|26)/gi, 'barème réglementé en vigueur')
  html = html.replace(/Barème\s*officiel\s*20(2[45]|26)/gi, 'barème réglementé en vigueur')
  return html
}

function softenStandardWord(html) {
  html = html.replace(/taux\s+standard\s+autour\s+de/gi, 'taux usuel constaté autour de')
  html = html.replace(/taux\s+standard\s+national/gi, 'taux usuel constaté')
  return html
}

function injectDisclaimer(html) {
  if (html.includes(DISCLAIMER)) return html
  // Inject after first prose container or near main content
  const note = `\n<div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><p class="text-sm text-gray-800 m-0">${DISCLAIMER}</p></div>\n`
  if (/<div class="prose[^"]*">/.test(html)) {
    return html.replace(/(<div class="prose[^"]*">)/, `$1${note}`)
  }
  if (/<div class="prose[^"]*max-w-none">/.test(html)) {
    return html.replace(/(<div class="prose[^"]*max-w-none">)/, `$1${note}`)
  }
  // Fallback: inject after header
  return html.replace(/(<header[^>]*>[\s\S]*?<\/header>)/, `$1${note}`)
}

function processFile(f) {
  const html = fs.readFileSync(f, 'utf8')
  let updated = replaceYearBarreme(html)
  updated = softenStandardWord(updated)
  updated = injectDisclaimer(updated)
  if (updated !== html) {
    fs.writeFileSync(f, updated, 'utf8')
    return true
  }
  return false
}

function processDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'))
  let changed = 0
  for (const f of files) {
    const p = path.join(dir, f)
    const ok = processFile(p)
    if (ok) changed++
  }
  return changed
}

function main() {
  const root = path.resolve(process.cwd(), 'src', 'pages')
  const subdirs = ['blog', 'blog/departements']
  let total = 0
  for (const sd of subdirs) {
    const dir = path.join(root, sd)
    if (fs.existsSync(dir)) {
      total += processDir(dir)
    }
  }
  // Also process top-level pages like ik.html
  const topFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'))
  for (const tf of topFiles) {
    const ok = processFile(path.join(root, tf))
    if (ok) total++
  }
  console.log(`Legal wording applied to ${total} files`)
}

main()
