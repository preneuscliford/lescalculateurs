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

function deferAutoExport(html) {
  let out = html;

  out = out.replace(
    /<script\b[^>]*\bsrc=["'][^"']*\/utils\/pdfExport\.js["'][^>]*>\s*<\/script>\s*/gi,
    "",
  );

  out = out.replace(
    /<script\b[^>]*type=["']module["'][^>]*\bsrc=["']([^"']*\/utils\/autoExportInit\.js)["'][^>]*>\s*<\/script>/gi,
    (_m, src) => {
      const safeSrc = String(src).replace(/"/g, '\\"');
      return `<script type="module">
  const __lcLoadAutoExport = () => import("${safeSrc}");
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(__lcLoadAutoExport, { timeout: 4000 });
  } else {
    window.setTimeout(__lcLoadAutoExport, 2000);
  }
</script>`;
    },
  );

  return out;
}

function main() {
  const srcRoot = path.resolve(__dirname, "../src");
  const htmlFiles = walkHtmlFiles(srcRoot);

  let changedFiles = 0;
  for (const filePath of htmlFiles) {
    const before = readTextFile(filePath);
    const after = deferAutoExport(before);
    if (after === before) continue;
    fs.writeFileSync(filePath, after, "utf8");
    changedFiles++;
  }

  process.stdout.write(
    `✅ autoExportInit décalé (idle) dans ${changedFiles} fichier(s) HTML\n`,
  );
}

main();

