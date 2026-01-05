#!/usr/bin/env node
/**
 * Analyse complète du problème d'indexation
 * Identifie exactement pourquoi Google ne peut pas indexer
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('🔍 DIAGNOSTIC COMPLET - PROBLÈMES D\'INDEXATION');
console.log('='.repeat(80) + '\n');

// 1. Vérifier le vercel.json
console.log('1️⃣ ANALYSE DE vercel.json');
console.log('-'.repeat(80));

const vercelPath = path.resolve(__dirname, '..', 'vercel.json');
const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

console.log(`✓ cleanUrls: ${vercelConfig.cleanUrls}`);
console.log(`✓ Redirects: ${vercelConfig.redirects.length}`);

vercelConfig.redirects.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.source} → ${r.destination} (${r.permanent ? '301' : '302'})`);
});

// 2. Vérifier le sitemap
console.log('\n2️⃣ ANALYSE DU SITEMAP');
console.log('-'.repeat(80));

const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Compter les URLs
const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, ''));

console.log(`✓ Total d'URLs: ${urls.length}`);

// Vérifier les .html
const withHtml = urls.filter(u => u.endsWith('.html'));
const withoutWww = urls.filter(u => !u.includes('www.'));
const withApex = urls.filter(u => u.startsWith('https://lescalculateurs.fr'));

console.log(`✓ URLs avec .html: ${withHtml.length}`);
if (withHtml.length > 0) {
  console.log(`  ❌ PROBLÈME: ${withHtml.length} URLs .html à supprimer du sitemap!`);
  withHtml.slice(0, 3).forEach(u => console.log(`    - ${u}`));
}

console.log(`✓ URLs apex (sans www): ${withApex.length}`);
if (withApex.length > 0) {
  console.log(`  ❌ PROBLÈME: ${withApex.length} URLs sans www à supprimer!`);
  withApex.slice(0, 3).forEach(u => console.log(`    - ${u}`));
}

// 3. Vérifier robots.txt
console.log('\n3️⃣ ANALYSE DU ROBOTS.TXT');
console.log('-'.repeat(80));

const robotsPath = path.resolve(__dirname, '..', 'public', 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');

if (robots.includes('Disallow: /pages')) {
  console.log('  ❌ PROBLÈME: /pages/ est bloqué dans robots.txt');
} else if (robots.includes('Disallow: /pages/blog')) {
  console.log('  ❌ PROBLÈME: /pages/blog/ est bloqué dans robots.txt');
} else if (robots.includes('Disallow: *')) {
  console.log('  ⚠️ WARNING: robots.txt bloque tout');
} else {
  console.log('✓ robots.txt permet l\'accès à /pages/');
}

console.log('\nContenu robots.txt:');
console.log(robots);

// 4. Vérifier canonicals dans les fichiers
console.log('\n4️⃣ ANALYSE DES CANONICALS');
console.log('-'.repeat(80));

const srcDir = path.join(__dirname, '..', 'src', 'pages');

function scanCanonicals(dir, prefix = '') {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let canonicalIssues = [];
  let totalFiles = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      canonicalIssues = [...canonicalIssues, ...scanCanonicals(fullPath, prefix + file.name + '/')];
    } else if (file.isFile() && file.name.endsWith('.html')) {
      totalFiles++;
      const content = fs.readFileSync(fullPath, 'utf8');
      const canonicalMatch = content.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
      
      if (canonicalMatch) {
        const href = canonicalMatch[1];
        const expectedUrl = `https://www.lescalculateurs.fr/pages/${prefix}${file.name.replace(/\.html$/, '')}`;
        
        if (href !== expectedUrl) {
          canonicalIssues.push({
            file: prefix + file.name,
            current: href,
            expected: expectedUrl,
            hasHtml: href.includes('.html'),
            hasApex: href.includes('lescalculateurs.fr') && !href.includes('www.'),
          });
        }
      }
    }
  }
  
  return canonicalIssues;
}

const canonicalIssues = scanCanonicals(srcDir);
console.log(`✓ Canonicals analysés: ${canonicalIssues.length} problèmes trouvés`);

if (canonicalIssues.length > 0) {
  console.log('  ❌ PROBLÈMES DE CANONICALS:');
  canonicalIssues.slice(0, 5).forEach(issue => {
    console.log(`\n  Fichier: ${issue.file}`);
    console.log(`    Actuel:   ${issue.current}`);
    console.log(`    Attendu:  ${issue.expected}`);
    if (issue.hasHtml) console.log(`    ❌ Contient .html (doit être supprimé)`);
    if (issue.hasApex) console.log(`    ❌ Apex domain (doit être www)`);
  });
}

// 5. Résumé
console.log('\n' + '='.repeat(80));
console.log('📊 RÉSUMÉ');
console.log('='.repeat(80));

const problems = [];
if (withHtml.length > 0) problems.push(`${withHtml.length} URLs .html dans sitemap`);
if (withApex.length > 0) problems.push(`${withApex.length} URLs apex dans sitemap`);
if (canonicalIssues.length > 0) problems.push(`${canonicalIssues.length} canonicals incorrects`);

if (problems.length === 0) {
  console.log('✅ AUCUN PROBLÈME DÉTECTÉ - Configuration OK!');
} else {
  console.log('❌ PROBLÈMES DÉTECTÉS:');
  problems.forEach(p => console.log(`  - ${p}`));
  console.log('\n🔧 ACTIONS À PRENDRE:');
  console.log('  1. Exécuter: npm run build');
  console.log('  2. Exécuter: git add . && git commit -m "fix: indexation issues"');
  console.log('  3. Exécuter: git push');
  console.log('  4. Attendre 24-48h pour Google de re-crawler');
  console.log('  5. Aller dans Search Console et valider la correction');
}

console.log('\n');
