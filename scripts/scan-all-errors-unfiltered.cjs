#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'content_SAFE');
const OUTPUT_FILE = path.join(__dirname, '..', 'french-errors-unfiltered.json');
const MAX_PARALLEL = 5;
const DELAY_MS = 100;

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
 * Appelle LanguageTool API
 */
function languageToolCheck(text) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const postData = JSON.stringify({
        text: text,
        language: 'fr',
        enabledOnly: false  // Considérer TOUTES les règles
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
 * Extrait les nœuds de texte visibles
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
      // Ignorer script, style, meta, etc.
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
 * Récupère tous les fichiers récursivement
 */
function getFilesRecursive(dir) {
  let files = [];
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
          message: match.message,
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
    log.error(`Erreur: ${path.basename(filePath)}`);
    return [];
  }
}

/**
 * Traite les fichiers en parallèle
 */
async function runParallel(files) {
  let allErrors = [];
  
  for (let i = 0; i < files.length; i += MAX_PARALLEL) {
    const batch = files.slice(i, i + MAX_PARALLEL);
    const batchNumber = Math.floor(i / MAX_PARALLEL) + 1;
    const totalBatches = Math.ceil(files.length / MAX_PARALLEL);

    log.info(`Batch ${batchNumber}/${totalBatches} (${batch.length} fichiers)`);

    const results = await Promise.all(batch.map(processFile));
    allErrors = allErrors.concat(results.flat());
  }

  return allErrors;
}

/**
 * Point d'entrée
 */
async function main() {
  log.info('\n━━ SCAN COMPLET SANS FILTRAGE ━━\n');

  if (!fs.existsSync(SRC_DIR)) {
    log.error(`Répertoire non trouvé: ${SRC_DIR}`);
    process.exit(1);
  }

  const files = getFilesRecursive(SRC_DIR);
  log.info(`${files.length} fichiers HTML détectés\n`);

  const errors = await runParallel(files);

  // Sauvegarder tous les erreurs
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(errors, null, 2), 'utf-8');

  // Statistiques par règle
  const ruleStats = {};
  errors.forEach(e => {
    ruleStats[e.rule] = (ruleStats[e.rule] || 0) + 1;
  });

  const sortedRules = Object.entries(ruleStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  log.success(`\n✅ Scan terminé`);
  console.log(`
  📊 Statistiques:
    • Fichiers scannés: ${stats.filesScanned}
    • Erreurs trouvées: ${stats.errorsFound}
    • Fichiers échoués: ${stats.filesFailed}

  🔝 Top 20 règles:
${sortedRules.map(([rule, count]) => `    • ${rule}: ${count}`).join('\n')}

  📁 Résultat sauvegardé: ${OUTPUT_FILE}
  `);
}

main().catch(err => {
  log.error(`Erreur fatale: ${err.message}`);
  process.exit(1);
});
