#!/usr/bin/env node
/**
 * Parcourt toutes les pages HTML sous src/pages et force une balise
 * <link rel="canonical"> vers l'URL propre SANS extension .html
 * en domaine https://www.lescalculateurs.fr.
 */
const fs = require('fs');
const path = require('path');

/**
 * Liste récursive des fichiers .html
 */
function listHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...listHtmlFiles(p));
    else if (e.isFile() && p.endsWith('.html')) files.push(p);
  }
  return files;
}

/**
 * Calcule l'URL canonique propre (sans .html) à partir du chemin fichier
 */
function computeCanonical(filePath) {
  const rel = path.relative(path.resolve(__dirname, '..', 'src', 'pages'), filePath).replace(/\\/g, '/');
  let url = 'https://www.lescalculateurs.fr/' + rel;
  // Supprimer extension .html
  url = url.replace(/\.html$/i, '');
  return url;
}

/**
 * Injecte/remplace la balise canonical
 */
function setCanonical(html, canonicalUrl) {
  const linkTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  if (/<link\s+rel=["']canonical["']/i.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, linkTag);
  }
  // Insérer avant fermeture </head>
  if (/<head[^>]*>/i.test(html) && /<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `  ${linkTag}\n</head>`);
  }
  return html;
}

/**
 * Traitement principal
 */
function main() {
  const root = path.resolve(__dirname, '..', 'src', 'pages');
  const files = listHtmlFiles(root);
  let updated = 0;
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const canonical = computeCanonical(f);
    const out = setCanonical(html, canonical);
    if (out !== html) {
      fs.writeFileSync(f, out, 'utf8');
      updated++;
      console.log(`✔ canonical: ${path.relative(process.cwd(), f)} -> ${canonical}`);
    }
  }
  console.log(`Done. Canonicals mis à jour: ${updated}`);
}

main();
