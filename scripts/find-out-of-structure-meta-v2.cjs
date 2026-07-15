#!/usr/bin/env node
/**
 * Scan complet: trouve tout contenu entre </head> et <body>
 * et tout contenu après </html> dans TOUTES les pages HTML
 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "src", "pages");

function collectAll(dir) {
  const r = [];
  const e = fs.readdirSync(dir, { withFileTypes: true });
  for (const d of e) {
    const fp = path.join(dir, d.name);
    if (d.isDirectory() && d.name !== "scripts" && !d.name.startsWith("."))
      r.push(...collectAll(fp));
    else if (d.isFile() && d.name.endsWith(".html")) r.push(fp);
  }
  return r;
}

const files = collectAll(SRC);
let totalIssues = 0;

for (const fp of files) {
  const c = fs.readFileSync(fp, "utf-8");
  const headEnd = c.indexOf("</head>");
  const bodyStart = c.indexOf("<body");
  const htmlEnd = c.lastIndexOf("</html>");

  if (headEnd > 0 && bodyStart > headEnd) {
    const between = c.slice(headEnd + 7, bodyStart);
    const trimmed = between.trim();
    if (trimmed && trimmed !== " ") {
      totalIssues++;
      console.log(`\n📄 ${path.relative(SRC, fp)} : CONTENU ENTRE </head> ET <body>`);
      console.log(`   ${trimmed.slice(0, 200)}`);
    }
  }

  if (htmlEnd > 0) {
    const after = c.slice(htmlEnd + 7);
    const trimmed = after.trim();
    if (trimmed) {
      totalIssues++;
      console.log(`\n📄 ${path.relative(SRC, fp)} : CONTENU APRES </html>`);
      console.log(`   ${trimmed.slice(0, 200)}`);
    }
  }
}

console.log(`\n✅ Total: ${totalIssues} fichiers avec contenu hors structure`);
