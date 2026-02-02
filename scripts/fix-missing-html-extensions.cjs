#!/usr/bin/env node
/**
 * Scan HTML files and normalize internal links to use .html and canonical paths.
 * - Fix href/src pointing to département pages without .html by appending .html
 * - Fix legacy blog paths `/pages/blog/frais-notaire-XX(.html)?` to `/pages/blog/departements/frais-notaire-XX.html`
 * - Leave external links untouched
 */
const fs = require('fs');
const path = require('path');

/**
 * Return all files ending with .html under a directory
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
 * Normalize href values in content
 */
function normalizeLinks(content) {
  let changed = false;
  let out = content;

  // 1) Département pages without .html → append .html
  out = out.replace(/href=("|')\/pages\/blog\/departements\/frais-notaire-([0-9A-Za-z]+)(?!\.html)(\1)/g, (m, q, code, q2) => {
    changed = true;
    return `href=${q}/pages/blog/departements/frais-notaire-${code}.html${q2}`;
  });

  // 2) Legacy blog paths to departements
  out = out.replace(/href=("|')\/pages\/blog\/frais-notaire-([0-9A-Za-z]+)(\.html)?(\1)/g, (m, q, code, htmlOpt, q2) => {
    changed = true;
    return `href=${q}/pages/blog/departements/frais-notaire-${code}.html${q2}`;
  });

  // 3) Absolute domain variants (non-www canonical)
  out = out.replace(/href=("|')https?:\/\/www\.lescalculateurs\.fr\/pages\/blog\/frais-notaire-([0-9A-Za-z]+)(\.html)?(\1)/g, (m, q, code, htmlOpt, q2) => {
    changed = true;
    return `href=${q}https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${code}.html${q2}`;
  });

  return { changed, out };
}

/**
 * Process all HTML files under src/pages
 */
function main() {
  const root = path.resolve(__dirname, '..', 'src', 'pages');
  if (!fs.existsSync(root)) {
    console.error('src/pages not found');
    process.exit(1);
  }
  const files = listHtmlFiles(root);
  let fixedCount = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { changed, out } = normalizeLinks(content);
    if (changed) {
      fs.writeFileSync(file, out, 'utf8');
      fixedCount++;
      console.log(`✔ Fixed links in: ${path.relative(process.cwd(), file)}`);
    }
  }
  console.log(`Done. Files updated: ${fixedCount}`);
}

main();
