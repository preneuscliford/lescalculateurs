const fs = require("fs");
const path = require("path");
const { readTextFile } = require("./encoding.cjs");

function walkHtmlFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
        out.push(fullPath);
      }
    }
  }
  return out;
}

function stripAdsenseScript(html) {
  const before = html;
  const pattern =
    /<script\b[^>]*\bsrc=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"']+["'][^>]*>\s*<\/script>\s*/gi;
  const after = before.replace(pattern, "");
  return { after, changed: after !== before };
}

function main() {
  const srcRoot = path.resolve(__dirname, "../src");
  const htmlFiles = walkHtmlFiles(srcRoot);

  let changedFiles = 0;
  for (const filePath of htmlFiles) {
    const content = readTextFile(filePath);
    const { after, changed } = stripAdsenseScript(content);
    if (!changed) continue;
    fs.writeFileSync(filePath, after, "utf8");
    changedFiles++;
  }

  process.stdout.write(
    `✅ AdSense supprimé de ${changedFiles} fichier(s) HTML dans src/\n`,
  );
}

main();

