import fs from 'node:fs'
import path from 'node:path'

function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f)).map((f) => path.join(dir, f))
}

function fixFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8')
  let out = html
  // 1) Remplacer fetch frais2026.json par import baremes.json
  out = out.replace(
    /const\s+fraisCfg\s*=\s*await\s*\(\s*await\s*fetch\(["']\.\.\/\.\.\/data\/frais2026\.json["']\)\)\.json\(\);/,
    'import bjson from "../../../data/baremes.json" assert { type: "json" };\n          const fraisCfg = bjson;'
  )
  // 2) Tranches: utiliser notaire.tranches (CSN 2024-2025)
  out = out.replace(
    /const\s+tranches\s*=\s*\[[\s\S]*?\];/,
    'const tranches = (fraisCfg.notaire?.tranches || []).map(t => ({ min: t.min, max: (t.max === 999999999 ? Infinity : t.max), taux: Number(t.taux) }));'
  )
  // 3) Débours/formalités: utiliser fraisDiversParDepartement pour l\'ancien
  out = out.replace(
    /let\s+debours\s*=\s*330;[\s\S]*?if\s*\(typeBien\s*!==\s*"neuf"\)[\s\S]*?\{[\s\S]*?debours\s*=\s*[0-9\s\+]+;[\s\S]*?formalites\s*=\s*[0-9\s]+;[\s\S]*?\}/,
    'let debours = 330;\n                    let formalites = 120;\n                    if (typeBien !== "neuf") {\n                      const depMap = fraisCfg.notaire?.fraisDiversParDepartement || {};\n                      const fd = depMap[values.departement] || fraisCfg.notaire?.fraisDivers || {};\n                      debours = Number(fd.cadastre || 0) + Number(fd.conservation || 0);\n                      formalites = Number(fd.formalites || 0);\n                    }'
  )
  // 4) CSI: utiliser csi.taux et minimum depuis baremes.json
  out = out.replace(
    /const\s+csi\s*=\s*Math\.max\(Math\.round\(prixNetImmobilier\s*\*\s*\(\(fraisCfg\.csi\s*\|\|\s*0\.10\)\s*\/\s*100\)\)\s*,\s*15\);/,
    'const csi = Math.max(Math.round(prixNetImmobilier * Number(fraisCfg.notaire?.csi?.taux || 0.001)), Number(fraisCfg.notaire?.csi?.minimum || 15));'
  )
  // 5) Droits: basé sur dmto par département (ancien) et notaire.droitsMutation.neuf (neuf). Suppression doublons.
  out = out.replace(
    /let\s+tauxDroits[\s\S]*?droitsEnregistrement[\s\S]*?;[\s\S]*?if\s*\(typeBien\s*===\s*"neuf"\)[\s\S]*?droitsEnregistrement[\s\S]*?;/,
    'let tauxDroits = (fraisCfg.dmto && fraisCfg.dmto[values.departement] != null ? Number(fraisCfg.dmto[values.departement]) / 100 : Number(fraisCfg.notaire?.droitsMutation?.standard || 0.0581));\n                    if (typeBien === "neuf") { tauxDroits = Number(fraisCfg.notaire?.droitsMutation?.neuf || 0.00715); }\n                    let droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;'
  )
  // 6) Afficher le taux DMTO utilisé sous le pourcentage
  out = out.replace(
    /\+\s*'<div class="text-xs text-gray-600 mt-1">'\s*\+\s*d\.pourcentage\.toFixed\(2\)\s*\+\s*'% du prix<\/div>'/,
    (m) => {
      const insert = " + '<div class=\"text-xs text-gray-600 mt-1\">' + d.pourcentage.toFixed(2) + '% du prix</div>' + '<div class=\"text-xs text-gray-600\">Taux DMTO utilisé: ' + (Math.floor((d.tauxDroits * 100) * 100)/100).toFixed(2).replace('.', ',') + '%</div>'";
      return insert
    }
  )
  if (out !== html) {
    fs.writeFileSync(filePath, out, 'utf8')
    return true
  }
  return false
}

function main() {
  const files = listDeptPages()
  let changed = 0
  for (const f of files) {
    if (fixFile(f)) changed++
  }
  console.log(`Mini-calculateur: ${changed} fichier(s) mis à jour sur ${files.length}.`)
}

main()
