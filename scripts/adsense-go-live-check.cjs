#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'src');
const PAGES_ROOT = path.join(SRC_ROOT, 'pages');
const SIMULATEURS_ROOT = path.join(SRC_ROOT, 'simulateurs');

const DIRECT_PATTERNS = [
  /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i,
  /googletagmanager\.com\/gtm\.js/i,
  /googletagmanager\.com\/gtag\/js/i,
  /googletagmanager\.com\/ns\.html\?id=GTM-/i,
];

function walkHtmlFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, acc);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    if (entry.name.includes('.backup-')) continue;
    acc.push(fullPath);
  }
  return acc;
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, '/');
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const adsPath = path.join(ROOT, 'public', 'ads.txt');
if (!fs.existsSync(adsPath)) {
  fail('public/ads.txt manquant');
} else {
  const ads = fs.readFileSync(adsPath, 'utf8');
  if (!/google\.com,\s*pub-/i.test(ads)) {
    fail('public/ads.txt ne contient pas de publisher Google valide (google.com, pub-...)');
  } else {
    pass('public/ads.txt présent avec publisher Google');
  }
}

const loaderPath = path.join(ROOT, 'public', 'third-party-loader.js');
if (!fs.existsSync(loaderPath)) {
  fail('public/third-party-loader.js manquant');
} else {
  const loader = fs.readFileSync(loaderPath, 'utf8');
  const requiredSnippets = [
    'CONSENT_STORAGE_KEY',
    'updateConsentMode(',
    'ad_storage: "denied"',
    'analytics_storage: "denied"',
    'showFallbackConsentBanner',
  ];
  const missing = requiredSnippets.filter((s) => !loader.includes(s));
  if (missing.length) {
    fail(`third-party-loader incomplet, éléments manquants: ${missing.join(', ')}`);
  } else {
    pass('third-party-loader contient les garde-fous consentement (denied par défaut + banner fallback)');
  }
}

const homePath = path.join(SRC_ROOT, 'index.html');
if (fs.existsSync(homePath)) {
  const home = fs.readFileSync(homePath, 'utf8');
  if (!home.includes('/third-party-loader.js')) {
    fail('src/index.html ne charge pas /third-party-loader.js');
  } else {
    pass('src/index.html charge /third-party-loader.js');
  }
}

const pageFiles = [
  ...walkHtmlFiles(PAGES_ROOT),
  ...(fs.existsSync(SIMULATEURS_ROOT) ? walkHtmlFiles(SIMULATEURS_ROOT) : []),
];
const missingLoader = [];
const directIncludes = [];

for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf8');

  const isFragment = !/<html[\s>]/i.test(content);
  if (!isFragment && !content.includes('/third-party-loader.js')) {
    missingLoader.push(rel(file));
  }

  for (const p of DIRECT_PATTERNS) {
    if (p.test(content)) {
      directIncludes.push(rel(file));
      break;
    }
  }
}

if (missingLoader.length) {
  fail(`Pages sans /third-party-loader.js (${missingLoader.length}):\n- ${missingLoader.slice(0, 20).join('\n- ')}${missingLoader.length > 20 ? '\n- ...' : ''}`);
} else {
  pass(`Toutes les pages HTML complètes ciblées (${pageFiles.length}) passent par /third-party-loader.js`);
}

if (directIncludes.length) {
  fail(`Pages avec script tiers direct détecté (${directIncludes.length}):\n- ${directIncludes.slice(0, 20).join('\n- ')}${directIncludes.length > 20 ? '\n- ...' : ''}`);
} else {
  pass('Aucun chargement direct GTM/GA/AdSense trouvé dans src/pages (hors backups)');
}

if (process.exitCode && process.exitCode !== 0) {
  console.error('\n➡️  Go-live AdSense: bloqué, corriger les erreurs ci-dessus.');
} else {
  console.log('\n🚀 Go-live AdSense: checks techniques OK.');
}
