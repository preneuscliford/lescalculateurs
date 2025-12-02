#!/usr/bin/env node
/**
 * Validation basique du sitemap:
 * - Domaine: https://www.lescalculateurs.fr obligatoire dans <loc>
 * - Pas d'extension .html dans <loc>
 * - Échappement XML correct dans <image:loc> (aucun & non échappé)
 * - Présence de xmlns:image sur <urlset>
 */
const fs = require('fs');
const path = require('path');

function main() {
  const p = path.resolve(__dirname, '../public/sitemap.xml');
  const xml = fs.readFileSync(p, 'utf8');
  let ok = true;
  const issues = [];

  // 1) urlset doit contenir xmlns:image
  if (!/\bxmlns:image=/.test(xml)) {
    ok = false;
    issues.push('Manque xmlns:image sur <urlset>');
  }

  // 2) Domaine www obligatoire
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const badDomain = locs.filter(u => !u.startsWith('https://www.lescalculateurs.fr/'));
  if (badDomain.length) {
    ok = false;
    issues.push(`Domaine incorrect sur ${badDomain.length} <loc> (attendu https://www.lescalculateurs.fr/)`);
  }

  // 3) Pas d'extension .html dans loc
  const hasHtml = locs.filter(u => /\.html\b/i.test(u));
  if (hasHtml.length) {
    ok = false;
    issues.push(`Extensions .html trouvées dans ${hasHtml.length} <loc>`);
  }

  // 4) Échappement des & dans les image:loc
  const imgLocs = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m => m[1]);
  const badAmp = imgLocs.filter(u => /&(?!amp;|lt;|gt;|quot;|apos;)/.test(u));
  if (badAmp.length) {
    ok = false;
    issues.push(`Caractères & non échappés dans ${badAmp.length} <image:loc>`);
  }

  // Résultat
  if (ok) {
    console.log('✅ Sitemap valide (domaine www, sans .html, xmlns:image présent, images échappées)');
  } else {
    console.log('❌ Problèmes détectés:');
    for (const i of issues) console.log(' - ' + i);
    process.exitCode = 1;
  }
}

main();