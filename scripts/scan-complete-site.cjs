#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

// Scanner tout le site
const DIRS = [
  path.join(__dirname, '..', 'content_SAFE'),
  path.join(__dirname, '..', 'src', 'pages')
];
const OUTPUT_FILE = path.join(__dirname, '..', 'french-errors-site-complete.json');
const MAX_PARALLEL = 3;
const DELAY_MS = 150;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
  detail: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`)
};

const stats = {
  filesScanned: 0,
  errorsFound: 0,
  filesFailed: 0
};

/**
 * Appelle LanguageTool
 */
function languageToolCheck(text) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const postData = JSON.stringify({
        text: text,
        language: 'fr',
        enabledOnly: false
      });

      const options = {
        hostname: 'api.languagetool.org',
        port: 443,
        path: '/v2/check',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.matches || []);
          } catch {
            resolve([]);
          }
        });
      });

      req.on('error', () => resolve([]));
      req.on('timeout', () => {
        req.destroy();
        resolve([]);
      });
      req.write(postData);
      req.end();
    }, DELAY_MS);
  });
}

/**
 * Extrait texte visible
 */
function getTextNodesInfo($) {
  const nodes = [];
  const visited = new Set();

  function traverse(elem) {
    if (!elem) return;
    if (elem.type === 'text') {
      const text = elem.data.trim();
      if (text.length > 0 && !visited.has(text)) {
        visited.add(text);
        nodes.push(text);
      }
    } else if (elem.children) {
      if (['script', 'style', 'meta', 'noscript'].includes(elem.name)) {
        return;
      }
      elem.children.forEach(traverse);
    }
  }

  traverse($.root());
  return nodes;
}

/**
 * Récupère tous les fichiers
 */
function getFilesRecursive(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFilesRecursive(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Traite un fichier
 */
async function processFile(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    const textNodes = getTextNodesInfo($);

    const errors = [];

    for (const text of textNodes) {
      const matches = await languageToolCheck(text);
      for (const match of matches) {
        errors.push({
          file: filePath,
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          error: match.word || match.sentence?.substring(0, 50),
          suggestions: match.replacements?.slice(0, 3).map(r => r.value) || [],
          rule: match.rule?.id || 'UNKNOWN',
          position: match.offset,
          context: match.context?.text || text.substring(0, 100)
        });
      }
    }

    stats.filesScanned++;
    stats.errorsFound += errors.length;
    return errors;
  } catch (err) {
    stats.filesFailed++;
    return [];
  }
}

/**
 * Traitement parallèle
 */
async function runParallel(files) {
  let allErrors = [];
  for (let i = 0; i < files.length; i += MAX_PARALLEL) {
    const batch = files.slice(i, i + MAX_PARALLEL);
    const batchNum = Math.floor(i / MAX_PARALLEL) + 1;
    const totalBatches = Math.ceil(files.length / MAX_PARALLEL);

    log.info(`Batch ${batchNum}/${totalBatches}`);

    const results = await Promise.all(batch.map(processFile));
    allErrors = allErrors.concat(results.flat());
  }
  return allErrors;
}

/**
 * Main
 */
async function main() {
  log.info('\n━━ SCAN COMPLET DU SITE ━━\n');

  // Collecter tous les fichiers
  let allFiles = [];
  for (const dir of DIRS) {
    const files = getFilesRecursive(dir);
    allFiles = allFiles.concat(files);
  }

  log.success(`${allFiles.length} fichiers HTML trouvés`);
  log.info('Scanning...\n');

  // Scanner
  const errors = await runParallel(allFiles);

  log.success(`\n${errors.length} erreurs trouvées`);

  // Sauvegarder
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(errors, null, 2), 'utf-8');
    log.success(`Rapport: ${path.basename(OUTPUT_FILE)}`);
  } catch (err) {
    log.error(`Erreur: ${err.message}`);
  }

  log.info(`\n📊 Stats:
  ✓ Fichiers scannés: ${stats.filesScanned}
  ✓ Erreurs trouvées: ${stats.errorsFound}
  ✓ Fichiers échoués: ${stats.filesFailed}
  `);
}

main().catch(err => {
  log.error(`Erreur: ${err.message}`);
  process.exit(1);
});
