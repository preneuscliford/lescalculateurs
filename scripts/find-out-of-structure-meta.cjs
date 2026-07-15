#!/usr/bin/env node
/**
 * Trouve les balises <meta> ou <link> placées en dehors de <head>
 * et le contenu situé avant <!doctype>/<html> ou après </html>
 */
const fs = require("fs");
const path = require("path");

const pages = [
  "src/pages/notaire.html",
  "src/pages/plusvalue.html",
  "src/pages/impot.html",
  "src/pages/pret.html",
  "src/pages/taxe.html",
  "src/pages/travail.html",
  "src/pages/charges.html",
  "src/pages/ik.html",
  "src/pages/ponts.html",
  "src/pages/financement.html",
  "src/pages/crypto-bourse.html",
  "src/pages/salaire.html",
  "src/pages/rsa.html",
  "src/pages/apl.html",
  "src/pages/are.html",
  "src/pages/asf.html",
  "src/pages/aah.html",
  "src/pages/prime-activite.html",
];

for (const p of pages) {
  if (!fs.existsSync(p)) continue;
  const c = fs.readFileSync(p, "utf-8");
  const headStart = c.indexOf("<head>");
  const headEnd = c.indexOf("</head>");
  const htmlEnd = c.lastIndexOf("</html>");
  const bodyStart = c.indexOf("<body");

  const issues = [];

  // Meta/Link tags between </head> and <body
  if (headEnd > 0 && bodyStart > headEnd) {
    const between = c.slice(headEnd + 7, bodyStart);
    const metas = between.match(/<(meta|link)[^>]*>/gi);
    if (metas) issues.push(`${metas.length} meta/link entre </head> et <body>`);
  }

  // Meta/Link tags after <body> (in body)
  if (bodyStart > 0) {
    const bodyContent = c.slice(bodyStart);
    const metasInBody = [];
    const re = /<(meta|link)[^>]*>/gi;
    let m;
    while ((m = re.exec(bodyContent)) !== null) {
      metasInBody.push(m[0]);
    }
    if (metasInBody.length > 0) {
      issues.push(`${metasInBody.length} meta/link dans <body>`);
    }
  }

  if (issues.length > 0) {
    console.log(`\n📄 ${path.relative("src/pages", p)}`);
    issues.forEach((i) => console.log(`   ❌ ${i}`));
  }
}

console.log("\n✅ Scan terminé");
