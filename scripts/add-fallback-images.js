import fs from 'node:fs'
import path from 'node:path'

function addFallbackOnError(html, relPath) {
  const pattern = /<img([^>]*?)\s+src="https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/[^"]+"([^>]*)>/gi
  return html.replace(pattern, (m, pre, post) => {
    if (/onerror=/.test(m)) return m
    const onerr = ` onerror="this.src='${relPath}'; this.srcset='';"`
    return `<img${pre} src="${m.match(/src="([^"]+)"/)[1]}"${post.replace(/>$/, '')}${onerr}>`
  })
}

function processDir(dir, relFallback) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'))
  let changed = 0
  for (const f of files) {
    const file = path.join(dir, f)
    const html = fs.readFileSync(file, 'utf8')
    if (!/commons\.wikimedia\.org/.test(html)) continue
    const updated = addFallbackOnError(html, relFallback)
    if (updated !== html) {
      fs.writeFileSync(file, updated, 'utf8')
      changed++
    }
  }
  return changed
}

function main() {
  const deptDir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements')
  const rel = '../../assets/android-chrome-512x512.png'
  const changed = processDir(deptDir, rel)
  console.log(`Fallback images updated: ${changed} files`)
}

main()
