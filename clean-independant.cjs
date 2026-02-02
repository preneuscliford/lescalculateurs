/**
 * Clean Independant - Retire "officiel" et corrige les formulations
 * Site independant, non administratif
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'src/pages';
const TARGET_DIR = 'src/pages_INDEPENDANT';
const REPORT_FILE = 'INDEPENDANT_CLEAN_REPORT.csv';

const stats = {
  processed: 0,
  officielRemoved: 0,
  exactInternalRemoved: 0,
  cafLinkAdded: 0
};

const reportLines = [
  'fichier,nb_officiel_removed,nb_exact_internal_removed,nb_caf_link_added,status'
];

// Liens officiels par type
const OFFICIEL_LINKS = {
  APL: { url: 'https://www.caf.fr', name: 'CAF' },
  RSA: { url: 'https://www.caf.fr', name: 'CAF' },
  PRIME: { url: 'https://www.caf.fr', name: 'CAF' },
  IMPOT: { url: 'https://www.impots.gouv.fr', name: 'impots.gouv.fr' },
  NOTAIRE: { url: 'https://www.notaires.fr', name: 'notaires.fr' },
  IK: { url: 'https://www.impots.gouv.fr', name: 'impots.gouv.fr' },
  SALAIRE: { url: 'https://www.impots.gouv.fr', name: 'impots.gouv.fr' },
  PRET: { url: 'https://www.economie.gouv.fr', name: 'economie.gouv.fr' },
  TAXE: { url: 'https://www.impots.gouv.fr', name: 'impots.gouv.fr' },
  PLUSVALUE: { url: 'https://www.impots.gouv.fr', name: 'impots.gouv.fr' }
};

function detectType(content) {
  const lower = content.toLowerCase();
  if (lower.includes('apl')) return 'APL';
  if (lower.includes('rsa')) return 'RSA';
  if (lower.includes('prime')) return 'PRIME';
  if (lower.includes('impot')) return 'IMPOT';
  if (lower.includes('notaire')) return 'NOTAIRE';
  if (lower.includes('ik') || lower.includes('kilometrique')) return 'IK';
  if (lower.includes('salaire')) return 'SALAIRE';
  if (lower.includes('pret')) return 'PRET';
  if (lower.includes('taxe')) return 'TAXE';
  if (lower.includes('plus-value') || lower.includes('plusvalue')) return 'PLUSVALUE';
  return 'APL'; // Default
}

function cleanContent(content, type) {
  let modified = content;
  let officielCount = 0;
  let exactCount = 0;
  let cafCount = 0;
  
  const link = OFFICIEL_LINKS[type] || OFFICIEL_LINKS.APL;
  
  // 1. "simulateur officiel" -> "estimateur gratuit"
  modified = modified.replace(/simulateur officiel/gi, (match) => {
    officielCount++;
    return 'estimateur gratuit';
  });
  
  // 2. "outil officiel" -> "outil gratuit"
  modified = modified.replace(/outil officiel/gi, (match) => {
    officielCount++;
    return 'outil gratuit';
  });
  
  // 3. "calculateur officiel" -> "calculateur gratuit"
  modified = modified.replace(/calculateur officiel/gi, (match) => {
    officielCount++;
    return 'calculateur gratuit';
  });
  
  // 4. "montant exact" + lien interne /simulateur -> "montant definitif aupres de l'administration" + lien externe
  // Pattern: href="/simulateur" ... >montant exact</a>
  modified = modified.replace(
    /href="\/simulateur"([^>]*)>([^<]*montant exact[^<]*)<\/a>/gi,
    (match, attrs, text) => {
      exactCount++;
      cafCount++;
      return `href="${link.url}" target="_blank" rel="noopener"${attrs}>montant definitif aupres de ${link.name}</a>`;
    }
  );
  
  // 5. "montant exact" tout court (sans lien) -> "montant estime"
  modified = modified.replace(/montant exact/gi, (match) => {
    exactCount++;
    return 'montant estime';
  });
  
  // 6. "valeur exacte" -> "valeur estimee"
  modified = modified.replace(/valeur exacte/gi, (match) => {
    exactCount++;
    return 'valeur estimee';
  });
  
  // 7. Lien /simulateur tout court -> remplacer par lien externe
  modified = modified.replace(
    /href="\/simulateur"/gi,
    (match) => {
      cafCount++;
      return `href="${link.url}" target="_blank" rel="noopener"`;
    }
  );
  
  // 8. "officiel" isole (mais pas dans les URLs ni attributs techniques)
  // On evite de toucher aux schemas JSON-LD et aux liens deja corrects
  modified = modified.replace(
    />([^<]*)\bofficiel\b([^<]*)</gi,
    (match, before, after) => {
      // Ne pas modifier si c'est dans un attribut ou schema
      if (match.includes('"@type"') || match.includes('schema.org')) return match;
      officielCount++;
      return `>${before.trim()}${after.trim()}<`;
    }
  );
  
  return { 
    content: modified, 
    officielCount, 
    exactCount, 
    cafCount,
    changed: officielCount > 0 || exactCount > 0 || cafCount > 0
  };
}

function processFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const type = detectType(content);
    
    const result = cleanContent(content, type);
    
    // Ecrire fichier
    const targetPath = path.join(TARGET_DIR, relativePath);
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, result.content, 'utf-8');
    
    stats.processed++;
    stats.officielRemoved += result.officielCount;
    stats.exactInternalRemoved += result.exactCount;
    stats.cafLinkAdded += result.cafCount;
    
    return [
      relativePath,
      result.officielCount,
      result.exactCount,
      result.cafCount,
      result.changed ? 'CLEAN' : 'ALREADY_CLEAN'
    ].join(',');
    
  } catch (e) {
    console.error('❌', filePath, e.message);
    return null;
  }
}

const walkDir = (dir, relativeDir = '') => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(relativeDir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath, relativePath);
    } else if (file.endsWith('.html')) {
      const line = processFile(fullPath, relativePath);
      if (line) reportLines.push(line);
    }
  }
};

console.log('🚀 Nettoyage formulations "officiel"...\n');
walkDir(SOURCE_DIR);
fs.writeFileSync(REPORT_FILE, reportLines.join('\n'), 'utf-8');

console.log('\n' + '='.repeat(60));
console.log('📊 RECAPITULATIF NETTOYAGE');
console.log('='.repeat(60));
console.log('Pages traitees:', stats.processed);
console.log('"Officiel" supprimes:', stats.officielRemoved);
console.log('"Exact" internes retires:', stats.exactInternalRemoved);
console.log('Liens CAF/externes ajoutes:', stats.cafLinkAdded);
console.log('\n3 lignes du CSV:');
console.log(reportLines.slice(0, Math.min(4, reportLines.length)).join('\n'));
console.log('\n✅ Termine !');
