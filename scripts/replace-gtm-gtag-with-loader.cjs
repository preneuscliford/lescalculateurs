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

function ensureLoaderInHead(html) {
  if (html.includes('src="/third-party-loader.js"')) return html;
  return html.replace(
    /<\/head>/i,
    `  <script defer src="/third-party-loader.js"></script>\n  </head>`,
  );
}

function stripThirdPartySnippets(html) {
  let out = html;

  out = out.replace(
    /<!--\s*Google\s*Tag\s*Manager\s*-->[\s\S]*?<!--\s*End\s*Google\s*Tag\s*Manager\s*-->\s*/gi,
    "",
  );
  out = out.replace(
    /<!--\s*Google\s*Tag\s*Manager\s*\(noscript\)\s*-->[\s\S]*?<!--\s*End\s*Google\s*Tag\s*Manager\s*\(noscript\)\s*-->\s*/gi,
    "",
  );
  out = out.replace(
    /<noscript>\s*<iframe\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com\/ns\.html\?id=[^"']+["'][^>]*>[\s\S]*?<\/iframe>\s*<\/noscript>\s*/gi,
    "",
  );
  out = out.replace(
    /<noscript[\s\S]*?https:\/\/www\.googletagmanager\.com\/ns\.html\?id=[\s\S]*?<\/noscript>\s*/gi,
    "",
  );
  out = out.replace(
    /<script\b[^>]*>\s*\(function\s*\(w,\s*d,\s*s,\s*l,\s*i\)\s*\{[\s\S]*?googletagmanager\.com\/gtm\.js\?id=[\s\S]*?\}\)\s*;?\s*<\/script>\s*/gi,
    "",
  );
  out = out.replace(
    /<script\b[^>]*>[\s\S]*?googletagmanager\.com\/gtm\.js\?id=[\s\S]*?<\/script>\s*/gi,
    "",
  );

  out = out.replace(
    /<!--\s*Google\s*tag\s*\(gtag\.js\)\s*-->[\s\S]*?<script[\s\S]*?<\/script>\s*/gi,
    "",
  );
  out = out.replace(
    /<script\b[^>]*>[\s\S]*?\bfunction\s+gtag\s*\([\s\S]*?<\/script>\s*/gi,
    "",
  );
  out = out.replace(
    /<script\b[^>]*>[\s\S]*?\bgtag\(\s*["']config["'][\s\S]*?<\/script>\s*/gi,
    "",
  );

  out = out.replace(
    /<script\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"']+["'][^>]*>\s*<\/script>\s*/gi,
    "",
  );

  out = out.replace(/<!--\s*Google\s*AdSense\s*-->\s*/gi, "");

  return out;
}

function main() {
  const srcRoot = path.resolve(__dirname, "../src");
  const htmlFiles = walkHtmlFiles(srcRoot);

  let changedFiles = 0;
  for (const filePath of htmlFiles) {
    const before = readTextFile(filePath);
    let after = before;
    after = stripThirdPartySnippets(after);
    after = ensureLoaderInHead(after);

    if (after === before) continue;
    fs.writeFileSync(filePath, after, "utf8");
    changedFiles++;
  }

  process.stdout.write(
    `✅ GTM/gtag remplacés par third-party-loader.js dans ${changedFiles} fichier(s) HTML\n`,
  );
}

main();
