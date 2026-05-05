import fs from "node:fs";
import path from "node:path";

const roots = [
  path.resolve(process.cwd(), "src"),
  path.resolve(process.cwd(), "src", "pages"),
  path.resolve(process.cwd(), "src", "pages", "blog"),
  path.resolve(process.cwd(), "src", "pages", "blog", "departements"),
];

function replaceSEO(text) {
  let t = text;

  // Corrections mai 2026

  // 1. ISF → IFI (erreur critique de terminologie)
  t = t.replace(/ISF\/IK/gi, "IFI - Impôt Fortune");
  t = t.replace(/Impôt de Solidarité sur la Fortune/gi, "Impôt sur la Fortune Immobilière");
  t = t.replace(/impôt de solidarité sur la fortune/gi, "impôt sur la fortune immobilière");

  // 2. Mise à jour des dates d'audit du 5 avril au 5 mai 2026
  t = t.replace(/datetime="2026-04-05">5 avril 2026/g, 'datetime="2026-05-05">5 mai 2026');
  t = t.replace(/datetime="2026-04-05">5 avril/g, 'datetime="2026-05-05">5 mai');
  t = t.replace(
    /<time datetime="2026-04-05">5 avril 2026<\/time>/g,
    '<time datetime="2026-05-05">5 mai 2026</time>',
  );

  // 3. Mise à jour des textes audit (patterns génériques UTF-8 et HTML entities)
  t = t.replace(/Vérifié le 5 avril 2026/g, "Vérifié le 5 mai 2026");
  t = t.replace(/V&eacute;rifi&eacute; le 5 avril 2026/g, "Vérifié le 5 mai 2026");
  t = t.replace(/Données vérifiées au 5 avril 2026/g, "Données vérifiées au 5 mai 2026");
  t = t.replace(/avril 2026 - Bar&egrave;mes CAF officiels/g, "mai 2026 - Barèmes CAF officiels");
  t = t.replace(/avril 2026 - Barèmes CAF officiels/g, "mai 2026 - Barèmes CAF officiels");

  // 4. Mise à jour de la description article
  t = t.replace(/Audit social du 5 avril 2026/g, "Audit social du 5 mai 2026");
  t = t.replace(
    /Suivi des mises à jour des simulateurs financiers et des barèmes officiels\. Audit social du 5 mai 2026/g,
    "Suivi des mises à jour des simulateurs financiers et des barèmes officiels. Audit social du 5 mai 2026 - Corrections aides sociales et terminologie IFI",
  );

  // 5. Pattern générique "5 avril" → "5 mai" pour les variantes
  t = t.replace(/5 avril 2026/g, "5 mai 2026");
  t = t.replace(/1er avril 2026/g, "1er mai 2026");
  t = t.replace(/avril 2026/g, "mai 2026");

  // 6. Meta keywords - mai 2026
  t = t.replace(/barèmes 2026/gi, "barèmes mai 2026");

  return t;
}

function processDir(dir) {
  const entries = fs.readdirSync(dir);
  let changed = 0;
  for (const e of entries) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      changed += processDir(p);
    } else if (e.endsWith(".html")) {
      const html = fs.readFileSync(p, "utf8");
      const updated = replaceSEO(html);
      if (updated !== html) {
        fs.writeFileSync(p, updated, "utf8");
        changed++;
        console.log(`✓ Updated: ${p}`);
      }
    }
  }
  return changed;
}

let total = 0;
for (const root of roots) {
  total += processDir(root);
}

console.log(`\n✅ Mai 2026 SEO sweep complete: ${total} files updated`);
