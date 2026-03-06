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
  if (!fs.existsSync(dir)) return acc;
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
  console.error(`ERROR: ${msg}`);
  process.exitCode = 1;
}

function pass(msg) {
  console.log(`OK: ${msg}`);
}

const adsPath = path.join(ROOT, 'public', 'ads.txt');
if (!fs.existsSync(adsPath)) {
  fail('public/ads.txt missing');
} else {
  const ads = fs.readFileSync(adsPath, 'utf8');
  if (!/google\.com,\s*pub-/i.test(ads)) {
    fail('public/ads.txt has no valid Google publisher line (google.com, pub-...)');
  } else {
    pass('public/ads.txt present with Google publisher');
  }
}

const loaderPath = path.join(ROOT, 'public', 'third-party-loader.js');
if (!fs.existsSync(loaderPath)) {
  fail('public/third-party-loader.js missing');
} else {
  const loader = fs.readFileSync(loaderPath, 'utf8');
  const requiredSnippets = [
    'CONSENT_STORAGE_KEY',
    'applyConsentModeDefaults',
    'analytics_storage: "denied"',
    'ad_storage: "denied"',
    'showConsentBanner'
  ];
  const missing = requiredSnippets.filter((s) => !loader.includes(s));
  if (missing.length) {
    fail(`third-party-loader incomplete, missing: ${missing.join(', ')}`);
  } else {
    pass('third-party-loader has consent safeguards (default denied + fallback banner)');
  }
}

const homePath = path.join(SRC_ROOT, 'index.html');
if (fs.existsSync(homePath)) {
  const home = fs.readFileSync(homePath, 'utf8');
  if (!home.includes('/third-party-loader.js')) {
    fail('src/index.html does not load /third-party-loader.js');
  } else {
    pass('src/index.html loads /third-party-loader.js');
  }
}

const pageFiles = [
  ...walkHtmlFiles(PAGES_ROOT),
  ...walkHtmlFiles(SIMULATEURS_ROOT),
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
  fail(
    `pages without /third-party-loader.js (${missingLoader.length}):\n- ${missingLoader
      .slice(0, 20)
      .join('\n- ')}${missingLoader.length > 20 ? '\n- ...' : ''}`
  );
} else {
  pass(`all full HTML pages checked (${pageFiles.length}) load /third-party-loader.js`);
}

if (directIncludes.length) {
  fail(
    `pages with direct GTM/GA/AdSense include (${directIncludes.length}):\n- ${directIncludes
      .slice(0, 20)
      .join('\n- ')}${directIncludes.length > 20 ? '\n- ...' : ''}`
  );
} else {
  pass('no direct GTM/GA/AdSense includes found in src/pages and src/simulateurs');
}

if (process.exitCode && process.exitCode !== 0) {
  console.error('\nGo-live AdSense checks failed.');
} else {
  console.log('\nGo-live AdSense checks passed.');
}
