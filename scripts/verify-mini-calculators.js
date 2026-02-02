import fs from 'node:fs'
import path from 'node:path'

function listDeptPages() {
  const dir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  return fs.readdirSync(dir).filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f)).map((f) => path.join(dir, f))
}

function checkFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8')
  const usesfrais2026 = /fetch\(\s*["']\.\.\/\.\.\/\.\.\/data\/frais2026\.json["']\s*\)/.test(html)
  const usesBaremesJson = /import\s+bjson\s+from\s+"\.\.\/\.\.\/data\/baremes\.json"\s+assert\s+\{\s+type:\s+"json"\s+\}/.test(html)
  const tranchesCSN = /notaire\?\.tranches|taux\:\s*0\.0387/.test(html)
  const deboursPerDept = /fraisDiversParDepartement/.test(html)
  const csiFromJson = /notaire\?\.csi|csi\?\.taux/.test(html)
  const dmtoFromJson = /fraisCfg\.dmto\s*\[/.test(html)
  return { usesfrais2026, usesBaremesJson, tranchesCSN, deboursPerDept, csiFromJson, dmtoFromJson }
}

function main() {
  const files = listDeptPages()
  const report = []
  for (const f of files) {
    const res = checkFile(f)
    if (res.usesfrais2026 || !res.usesBaremesJson || !res.tranchesCSN || !res.deboursPerDept || !res.csiFromJson || !res.dmtoFromJson) {
      report.push({ file: f, ...res })
    }
  }
  console.log(JSON.stringify(report, null, 2))
}

main()
