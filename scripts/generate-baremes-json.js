import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

function transformTsToJs(code) {
  let js = code
  js = js.replace(/export\s+const\s+baremes\s*=\s*/m, 'baremes = ')
  js = js.replace(/as\s+Record<[^>]+>\s*/g, '')
  js = js.replace(/:\s*number/g, '') // rudimentary cleanup if present
  return 'let baremes = {};\n' + js + '\nmodule.exports = baremes;'
}

function main() {
  const tsPath = path.resolve(process.cwd(), 'src', 'data', 'baremes.ts')
  if (!fs.existsSync(tsPath)) {
    console.error('baremes.ts introuvable')
    process.exit(1)
  }
  const tsCode = fs.readFileSync(tsPath, 'utf8')
  const jsCode = transformTsToJs(tsCode)
  const script = new vm.Script(jsCode, { filename: 'baremes.transformed.js' })
  const sandbox = { module: { exports: {} }, exports: {}, console }
  vm.createContext(sandbox)
  try {
    script.runInContext(sandbox)
  } catch (e) {
    console.error('Erreur de transformation baremes.ts:', e.message)
    process.exit(1)
  }
  const data = sandbox.module.exports
  const outPath = path.resolve(process.cwd(), 'src', 'data', 'baremes.generated.json')
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
  console.log('Generated', outPath)
}

main()
