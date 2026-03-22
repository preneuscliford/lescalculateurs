import fs from 'node:fs';
import path from 'node:path';

/**
 * Liste les fichiers HTML de departements a enrichir.
 * Retourne les chemins absolus des fichiers correspondants.
 */
function listDepartmentFiles() {
  const baseDir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements');
  const files = fs
    .readdirSync(baseDir)
    .filter((f) => /^frais-notaire-(\d{2}|\d{3}|2A|2B)\.html$/.test(f));
  return files.map((f) => path.join(baseDir, f));
}

/**
 * Extrait le nom du departement et le code depuis le contenu ou le nom de fichier.
 * Essaye d'abord le H1, puis le title, et enfin le code a partir du nom de fichier.
 */
function extractDeptInfo(html, filePath) {
  let name = null;
  let code = null;

  const h1Match = html.match(/<h1[^>]*>[\s\S]*?\((\d{2})\)[\s\S]*?<\/h1>/);
  if (h1Match) {
    code = h1Match[1];
  }

  const titleMatch = html.match(/<title>[\s\S]*?\((\d{2})\)[\s\S]*?<\/title>/);
  if (!code && titleMatch) {
    code = titleMatch[1];
  }

  // Essayer d'extraire le nom du departement depuis le H1 (apres une preposition)
  const h1NameMatch = html.match(/<h1[^>]*>[\s\S]*?(?:en|dans|au|aux|a)\s+([^<(]+)\s*\((\d{2})\)/i);
  if (h1NameMatch) {
    name = h1NameMatch[1].trim();
    code = code || h1NameMatch[2];
  }

  // Sinon tenter via le title (apres une preposition)
  const titleNameMatch = html.match(/<title>[\s\S]*?(?:en|dans|au|aux|a)\s+([A-Za-zA-ÿ'\-\s]+)\s*\((\d{2})\)/i);
  if (!name && titleNameMatch) {
    name = titleNameMatch[1].trim();
    code = code || titleNameMatch[2];
  }

  // A defaut, utiliser le code du nom de fichier
  if (!code) {
    const fileCode = path.basename(filePath).match(/(\d{2})/);
    code = fileCode ? fileCode[1] : null;
  }

  // Sanitize du nom (retirer "Frais de notaire" eventuel)
  if (name) {
    name = name
      .replace(/\bFrais\s+de\s+notaire\b/gi, '')
      .replace(/\bde\s+notaire\b/gi, '')
      .replace(/\bnotaire\b/gi, '')
      .replace(/^(?:dans\s+le|dans\s+la|dans\s+les|en|au|aux|a)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Nom fallback generique
  if (!name) {
    name = 'Departement';
  }
  
  // Surcouche: si locales.json fournit une ville propre, l'utiliser
  try {
    const localesPath = path.resolve(process.cwd(), 'scripts', 'locales.json');
    if (fs.existsSync(localesPath)) {
      const raw = fs.readFileSync(localesPath, 'utf8');
      const locales = JSON.parse(raw);
      if (code && locales[code] && locales[code].city) {
        const city = String(locales[code].city)
          .replace(/\bde\s+notaire\b/gi, '')
          .replace(/\bnotaire\b/gi, '')
          .trim();
        if (city && city.length >= 2) name = city;
      }
    }
  } catch (_) {}

  return { name, code };
}

/**
 * Verifie si un CTA "Calcul immediat" est deja present pour eviter les duplications.
 */
function hasCta(html) {
  return /Calcul\s+immediat\s*\(10\s*s\)\s*-\s*Gratuit/i.test(html);
}

/**
 * Construit le bloc CTA personnalise pour un departement donne.
 */
function buildCtaBlock(name, code) {
  const official = getDepartmentName(code);
  const cleanName = String(official || name || '')
    .replace(/\bfrais\s+de\s+notaire\b/gi, '')
    .replace(/\bde\s+notaire\b/gi, '')
    .replace(/\bnotaire\b/gi, '')
    .trim();
  const label = `Calcul immediat (10 s) - Gratuit`;
  const desc = `Bareme officiel 2024-2025, estimation precise pour ${cleanName} (${code}).`;
  return (
      `      <!-- CTA BLOCK START -->\n` +
      `      <div class="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 sm:p-5">\n` +
      `        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">\n` +
      `          <div class="text-sm sm:text-base text-gray-800 leading-relaxed">\n` +
      `          <strong>${label}</strong><br/>\n` +
      `          ${desc}\n` +
      `          </div>\n` +
      `          <a href="/pages/notaire.html" class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm sm:mt-0">Lancer le calcul</a>\n` +
      `        </div>\n` +
      `      </div>\n` +
      `      <!-- CTA BLOCK END -->\n`
  );
}

/**
 * Insere le CTA apres l'ouverture de l'element <article>, sinon avant </body>.
 */
function insertCta(html, ctaBlock) {
  const articleOpenMatch = html.match(/<article[^>]*>/);
  if (articleOpenMatch) {
    const idx = html.indexOf(articleOpenMatch[0]) + articleOpenMatch[0].length;
    return html.slice(0, idx) + '\n' + ctaBlock + html.slice(idx);
  }
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx !== -1) {
    return html.slice(0, bodyCloseIdx) + '\n' + ctaBlock + html.slice(bodyCloseIdx);
  }
  return html + '\n' + ctaBlock;
}

/**
 * Verifie si une section locale ciblee existe deja (H2 "Calcul frais de notaire ...").
 */
function hasLocalSection(html) {
  return /<h2[^>]*>\s*Calcul\s+frais\s+de\s+notaire\s+/i.test(html);
}

/**
 * Construit une section locale generique (evite duplication en inserant nom/code).
 */
function buildLocalSection(name, code) {
  const official = getDepartmentName(code);
  if (official) name = official;
  const old = computeTotal(code, 200000, 'ancien');
  const neu = computeTotal(code, 200000, 'neuf');
  const oldRate = getDroitsRate(code, 'ancien');
  const neuRate = getDroitsRate(code, 'neuf');
  const oldRatePct = oldRate != null ? `≈ ${formatPercent(oldRate)}` : 'N/A';
  const neuRatePct = neuRate != null ? `≈ ${formatPercent(neuRate)}` : 'N/A';
  return (
    `        <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">Calcul frais de notaire ${name} (${code})</h2>\n` +
    `        <p class="text-gray-700 mb-4">\n` +
    `          Ancien : ≈ ${formatEuroAmount(old.total)} pour 200 000 € (droits ${oldRatePct}) • Neuf : ≈ ${formatEuroAmount(neu.total)} pour 200 000 € (droits ${neuRatePct}).\n` +
    `        </p>\n` +
    `        <div class="flex gap-3 mb-8">\n` +
    `          <a href="/pages/notaire.html" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">Calculer maintenant</a>\n` +
    `          <a href="/pages/pret.html" class="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold shadow-sm">Voir mensualites de pret</a>\n` +
    `        </div>\n`
  );
}

/**
 * Insere la section locale avant la fin de l'<article> si present, sinon en fin de contenu.
 */
function insertLocalSection(html, localBlock) {
  const articleCloseIdx = html.lastIndexOf('</article>');
  if (articleCloseIdx !== -1) {
    return html.slice(0, articleCloseIdx) + '\n' + localBlock + html.slice(articleCloseIdx);
  }
  return html + '\n' + localBlock;
}

/**
 * Charge les donnees locales (mapping) depuis scripts/locales.json.
 */
function loadLocales() {
  const p = path.resolve(process.cwd(), 'scripts', 'locales.json');
  if (!fs.existsSync(p)) return {};
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

/**
 * Construit une section locale specifique si des donnees existent.
 */
function buildSpecificLocalSection(data, code, deptName) {
  const official = getDepartmentName(code);
  const city = (official || deptName || '').toString().trim();
  const old = computeTotal(code, 200000, 'ancien');
  const neu = computeTotal(code, 200000, 'neuf');
  const oldRate = getDroitsRate(code, 'ancien');
  const neuRate = getDroitsRate(code, 'neuf');
  const oldRatePct = oldRate != null ? `≈ ${formatPercent(oldRate)}` : 'N/A';
  const neuRatePct = neuRate != null ? `≈ ${formatPercent(neuRate)}` : 'N/A';
  return (
    `        <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">Calcul frais de notaire ${city} (${code})</h2>\n` +
    `        <p class="text-gray-700 mb-4">\n` +
    `          Ancien : ≈ ${formatEuroAmount(old.total)} pour 200 000 € (droits ${oldRatePct}) • Neuf : ≈ ${formatEuroAmount(neu.total)} pour 200 000 € (droits ${neuRatePct}).\n` +
    `        </p>\n` +
    `        <div class="flex gap-3 mb-8">\n` +
    `          <a href="/pages/notaire.html" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">Calculer maintenant</a>\n` +
    `          <a href="/pages/pret.html" class="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold shadow-sm">Voir mensualites de pret</a>\n` +
    `        </div>\n`
  );
}

/**
 * Met a jour une section locale generique existante vers une version specifique.
 */
function upgradeLocalSection(html, data, code, deptName) {
  const official = getDepartmentName(code);
  const displayName = official || deptName || data.city;
  // Remplacer le H2 s'il est generique
  html = html.replace(
    /<h2[^>]*>\s*Calcul\s+frais\s+de\s+notaire\s+[^<]*\(\d{2}\)\s*<\/h2>/i,
    `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">Calcul frais de notaire ${displayName} (${code})</h2>`
  );
  // Remplacer le paragraphe indicatif par des donnees specifiques
  const old = computeTotal(code, 200000, 'ancien');
  const neu = computeTotal(code, 200000, 'neuf');
  const oldRate = getDroitsRate(code, 'ancien');
  const neuRate = getDroitsRate(code, 'neuf');
  const oldRatePct = oldRate != null ? `${(oldRate * 100).toFixed(2).replace('.', ',')}%` : 'N/A';
  const neuRatePct = neuRate != null ? `${(neuRate * 100).toFixed(3).replace('.', ',')}%` : 'N/A';
  const newP = (
    `        <p class="text-gray-700 mb-4">\n` +
    `          Ancien : ≈ ${formatEuroAmount(old.total)} pour 200 000 € (droits ${oldRatePct}) • Neuf : ≈ ${formatEuroAmount(neu.total)} pour 200 000 € (droits ${neuRatePct}).\n` +
    `        </p>`
  );
  // Cibler le <p> immediatement apres le H2
  const h2Str = `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">Calcul frais de notaire ${displayName} (${code})</h2>`;
  const h2Pos = html.indexOf(h2Str);
  if (h2Pos !== -1) {
    const pStart = html.indexOf('<p class="text-gray-700 mb-4">', h2Pos);
    const pEnd = pStart !== -1 ? html.indexOf('</p>', pStart) : -1;
    if (pStart !== -1 && pEnd !== -1) {
      const afterPEnd = pEnd + 4;
      html = html.slice(0, pStart) + newP + html.slice(afterPEnd);
    }
  } else {
    // Fallback global
    html = html.replace(/<p class="text-gray-700 mb-4">[\s\S]*?<\/p>/i, newP);
  }
  // Remplacer le contenu de la FAQ
  html = html.replace(
    /<h3 class="font-semibold text-gray-900 mb-2">FAQ\s+-\s+[^<]+<\/h3>[\s\S]*?<ul[^>]*>[\s\S]*?<\/ul>/i,
    (
      `          <h3 class="font-semibold text-gray-900 mb-2">FAQ - ${deptName || data.city}</h3>\n` +
      `          <ul class="text-sm text-gray-700 space-y-2">\n` +
      `            <li><strong>Combien pour 200 000 € (ancien) ?</strong> ${data.ancienAmount}.</li>\n` +
      `            <li><strong>Et pour le neuf (VEFA) ?</strong> ${data.neufAmount} grace aux droits reduits.</li>\n` +
      `            <li><strong>A savoir :</strong> ${data.note}</li>\n` +
      `          </ul>`
    )
  );
  return html;
}

/**
 * Traite un fichier: ajoute CTA si absent, et section locale si absente.
 */
function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { name, code } = extractDeptInfo(original, filePath);
  let updated = original;
  const locales = loadLocales();
  const localData = code && locales[code] ? locales[code] : null;
  const deptName = name;

  // Remplacer/inserer CTA systematiquement pour uniformiser et rendre responsive
  updated = replaceExistingCta(updated, deptName, code || '');
  // Inserer un snippet summary (meme si CTA deja present)
  const summary = buildSummaryBlock(name, code || '', localData);
  updated = insertSummaryAfterCta(updated, summary);
  // Assurer la presence de la note d'explication globale
  updated = ensureInfoNote(updated);
  // Dedupliquer la note si plusieurs occurrences
  updated = dedupeInfoNotes(updated);

  if (!hasLocalSection(updated)) {
    const local = localData
      ? buildSpecificLocalSection(localData, code || '', deptName)
      : buildLocalSection(name, code || '');
    updated = insertLocalSection(updated, local);
  } else if (localData) {
    // Mettre a niveau la section existante vers une version specifique si possible
    updated = upgradeLocalSection(updated, localData, code || '', deptName);
  }

  // Suppression de toute FAQ existante (on externalisera les FAQ autrement)
  updated = removeAllFaq(updated);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return { filePath, changed: true };
  }
  return { filePath, changed: false };
}

/**
 * Verifie la presence d'un resume snippet au‑dessus du pli.
 */
function hasSummary(html) {
  return /border-yellow-400/i.test(html);
}

function removeSummary(html) {
  return html.replace(/<div[^>]*border-yellow-400[\s\S]*?<\/div>/i, '');
}

/**
 * Construit le bloc resume (2 lignes) base sur les donnees locales.
 */
function buildSummaryBlock(name, code, data) {
  const ancien = computeTotal(code, 200000, 'ancien');
  const neuf = computeTotal(code, 200000, 'neuf');
  const ancienRateNum = getDroitsRate(code, 'ancien');
  const neufRateNum = getDroitsRate(code, 'neuf');
  const official = getDepartmentName(code);
  const cleanName = String(official || name || '')
    .replace(/\bfrais\s+de\s+notaire\b/gi, '')
    .replace(/\bde\s+notaire\b/gi, '')
    .replace(/\bnotaire\b/gi, '')
    .trim();
  const problematic = false;
  const displayCityRaw = cleanName;
  const displayCity = displayCityRaw
    .replace(/\bfrais\s+de\s+notaire\b/gi, '')
    .replace(/\bde\s+notaire\b/gi, '')
    .replace(/\bnotaire\b/gi, '')
    .trim();
  const displayParen = `(${code})`;
  const label = `💰 Frais de notaire 2025 a ${displayCity} ${displayParen}`;
  const oldRatePct = ancienRateNum != null ? `≈ ${formatPercent(ancienRateNum)}` : 'N/A';
  const newRatePct = neufRateNum != null ? `≈ ${formatPercent(neufRateNum)}` : 'N/A';
  const partOld = `≈ ${formatEuroAmount(ancien.total)} pour 200 000 € (ancien, droits ${oldRatePct})`;
  const partNew = `≈ ${formatEuroAmount(neuf.total)} pour 200 000 € (neuf, droits ${newRatePct})`;
  const line1 = `${label} : ${partOld} • ${partNew}`;
  const line2 = `Inclut droits, emoluments, formalites, CSI et TVA`;
  return (
    `      <div class="mt-6 mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-5 rounded-r">\n` +
    `        <p class="text-sm sm:text-base text-gray-800 leading-relaxed"><strong>${line1}</strong><br/><span class="text-xs sm:text-sm text-gray-600">${line2}</span></p>\n` +
    `      </div>\n`
  );
}

/**
 * Insere le resume juste apres le CTA si present, sinon en haut de l'article.
 */
function insertSummaryAfterCta(html, summaryBlock) {
  if (hasSummary(html)) {
    html = removeSummary(html);
  }
  const marker = '<!-- CTA BLOCK END -->';
  const markerPos = html.indexOf(marker);
  if (markerPos !== -1) {
    const insertPos = markerPos + marker.length;
    return html.slice(0, insertPos) + '\n' + summaryBlock + html.slice(insertPos);
  }
  const articleOpenMatch = html.match(/<article[^>]*>/);
  if (articleOpenMatch) {
    const idx = html.indexOf(articleOpenMatch[0]) + articleOpenMatch[0].length;
    return html.slice(0, idx) + '\n' + summaryBlock + html.slice(idx);
  }
  return html + '\n' + summaryBlock;
}

/**
 * Assure la presence de la note d'explication globale sur chaque page
 */
function ensureInfoNote(html) {
  const noteRegex = /Droits\s+reduits\s+uniformises\s*\(0,715\s*%\)\./i;
  if (noteRegex.test(html)) return html;
  const note = `        <p class="text-xs sm:text-sm text-gray-600 mb-4">Droits reduits uniformises (0,715 %).</p>\n`;
  // Inserer apres le resume si present
  const summaryMarker = 'border-yellow-400';
  const pos = html.indexOf(summaryMarker);
  if (pos !== -1) {
    const endDiv = html.indexOf('</div>', pos);
    if (endDiv !== -1) {
      const insertPos = endDiv + 6;
      return html.slice(0, insertPos) + '\n' + note + html.slice(insertPos);
    }
  }
  // Sinon, inserer apres le H2 local si present
  const h2Match = html.match(/<h2[^>]*>\s*Calcul\s+frais\s+de\s+notaire[\s\S]*?<\/h2>/i);
  if (h2Match) {
    const idx = html.indexOf(h2Match[0]) + h2Match[0].length;
    return html.slice(0, idx) + '\n' + note + html.slice(idx);
  }
  // Fallback: en haut de l'article
  const articleOpen = html.match(/<article[^>]*>/);
  if (articleOpen) {
    const idx = html.indexOf(articleOpen[0]) + articleOpen[0].length;
    return html.slice(0, idx) + '\n' + note + html.slice(idx);
  }
  return html + '\n' + note;
}

/**
 * Supprime les doublons de la note "Neuf : droits reduits uniformes...".
 */
function dedupeInfoNotes(html) {
  const re = /<p class="text-xs sm:text-sm text-gray-600 mb-4">Droits reduits uniformises \(0,715\s*%\)\.<\/p>/gi;
  let seen = false;
  return html.replace(re, (m) => {
    if (seen) return '';
    seen = true;
    return m;
  });
}

/**
 * Remplace un CTA existant par le nouveau CTA responsive avec nettoyage du libelle
 */
function replaceExistingCta(html, name, code) {
  const newCta = buildCtaBlock(name, code);
  // Cas avec anciens CTA (bg-blue-50 et bouton "Lancer le calcul")
  const oldCtaRegex = /<div[^>]*bg-blue-50[\s\S]*?Lancer le calcul[\s\S]*?<\/div>/i;
  if (oldCtaRegex.test(html)) {
    return html.replace(oldCtaRegex, newCta);
  }
  // Cas avec notre CTA marque
  const markedRegex = /<!-- CTA BLOCK START -->[\s\S]*?<!-- CTA BLOCK END -->/i;
  if (markedRegex.test(html)) {
    return html.replace(markedRegex, newCta);
  }
  // Sinon, inserer en haut de l'article
  const articleOpenMatch = html.match(/<article[^>]*>/);
  if (articleOpenMatch) {
    const idx = html.indexOf(articleOpenMatch[0]) + articleOpenMatch[0].length;
    return html.slice(0, idx) + '\n' + newCta + html.slice(idx);
  }
  return newCta + '\n' + html;
}

/**
 * Met a jour ou insere une FAQ locale longue traîne.
 */
/**
 * Supprime toutes les FAQs visibles (H3 "FAQ - ..." et la liste <ul>)
 */
function removeAllFaq(html) {
  return html.replace(/<h3 class="font-semibold text-gray-900 mb-2">FAQ\s+-[\s\S]*?<ul[^>]*>[\s\S]*?<\/ul>/gi, '');
}

/**
 * Point d'entree: traite tous les fichiers departements.
 */
function main() {
  const files = listDepartmentFiles();
  const results = files.map(processFile);
  const changed = results.filter((r) => r.changed).length;
  console.log(`Enrichissement termine: ${changed} fichier(s) modifie(s) sur ${files.length}.`);
}

main();
/**
 * Charge les taux depuis src/data/baremes.ts
 */
function loadBaremes() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'baremes.ts');
  if (!fs.existsSync(p)) return null;
  const src = fs.readFileSync(p, 'utf8');
  const bloc = src.match(/droitsMutation\s*:\s*\{[\s\S]*?\}/i);
  if (!bloc) return null;
  const text = bloc[0];
  const num = (key) => {
    const m = text.match(new RegExp(`${key}\s*:\s*([0-9\.]+)`, 'i'));
    return m ? parseFloat(m[1]) : null;
  };
  const standard = num('standard');
  const neuf = num('neuf');
  const reduit = num('reduit');
  const depMatch = text.match(/departementsReduits\s*:\s*\[([^\]]+)\]/i);
  const depReduits = depMatch
    ? depMatch[1]
        .split(',')
        .map((s) => s.replace(/['"\s]/g, ''))
        .filter(Boolean)
    : [];
  // Fallback si parsing echoue
  const std = typeof standard === 'number' ? standard : 0.0581;
  const nf = typeof neuf === 'number' ? neuf : 0.00715;
  const red = typeof reduit === 'number' ? reduit : 0.0509006;
  const deps = depReduits.length ? depReduits : ["36","976"];
  return { standard: std, neuf: nf, reduit: red, depReduits: deps };
}

/**
 * Charge la configuration JSON fournie (DMTO, bareme emoluments, CSI, debours).
 */
function loadFraisConfig() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'frais2026.json');
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch (_) {
    return null;
  }
}

/**
 * Formate un pourcentage avec troncature (pas d'arrondi),
 * pour coller aux libelles attendus (ex: 5,80% et 0,71%).
 */
function formatPercent(num) {
  if (typeof num !== 'number' || isNaN(num)) return 'N/A';
  const pct = num * 100;
  const decimals = pct < 1 ? 2 : 2;
  const factor = Math.pow(10, decimals);
  const truncated = Math.floor(pct * factor) / factor;
  return `${truncated.toFixed(decimals).replace('.', ',')}%`;
}

function getDeptRates(code) {
  const b = loadBaremes();
  if (!b) return { ancien: 'N/A', neuf: 'N/A' };
  const ancienTaux = b.depReduits.includes(String(code)) ? b.reduit : b.standard;
  const neufTaux = b.neuf;
  return { ancien: formatPercent(ancienTaux), neuf: formatPercent(neufTaux) };
}

function formatEuroAmount(amount) {
  try {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(amount)) + ' €';
  } catch (_) {
    const s = String(Math.round(amount));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ' ) + ' €';
  }
}
/**
 * Charge les donnees departementales (taux droits, debours, formalites)
 */
function loadDepartements() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'departements.json');
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Normalise le code departement en chaîne
 */
function normalizeCode(code) {
  return String(code || '').toUpperCase();
}

/**
 * Retourne le nom officiel du departement depuis departements.json
 */
/**
 * Retourne le nom officiel du departement (compat objet ou tableau).
 */
function getDepartmentName(code) {
  const entry = getDeptEntry(code);
  return entry && entry.nom ? String(entry.nom) : null;
}

/**
 * Recupere l'entree departement depuis departements.json (objet ou tableau).
 */
function getDeptEntry(code) {
  const deps = loadDepartements();
  const c = normalizeCode(code);
  if (!deps) return null;
  if (Array.isArray(deps)) {
    return deps.find((d) => normalizeCode(d.code) === c) || null;
  }
  if (typeof deps === 'object') {
    return deps[c] || null;
  }
  return null;
}

/**
 * Calcule les emoluments proportionnels du notaire selon bareme officiel
 */
function computeEmoluments(price) {
  const cfg = loadFraisConfig();
  const p = price || 0;
  if (cfg && Array.isArray(cfg.emoluments)) {
    let remaining = p;
    let total = 0;
    const toDec = (t) => Number(t) / 100;
    for (let i = 0; i < cfg.emoluments.length; i++) {
      const tr = cfg.emoluments[i];
      const taux = toDec(tr.taux);
      if (tr.tranche_max == null) {
        total += remaining * taux;
        remaining = 0;
        break;
      }
      const prevMax = i === 0 ? 0 : (cfg.emoluments[i - 1].tranche_max || 0);
      const cap = Math.max(0, Math.min(p, tr.tranche_max) - prevMax);
      total += cap * taux;
      remaining -= cap;
    }
    return total;
  }
  let total = 0;
  const tranche1 = Math.min(p, 6500);
  total += tranche1 * 0.0387;
  if (p > 6500) {
    const tranche2 = Math.min(p - 6500, 17000 - 6500);
    total += tranche2 * 0.01596;
  }
  if (p > 17000) {
    const tranche3 = Math.min(p - 17000, 60000 - 17000);
    total += tranche3 * 0.01064;
  }
  if (p > 60000) {
    const tranche4 = p - 60000;
    total += tranche4 * 0.00799;
  }
  return total;
}

/**
 * Retourne droits d'enregistrement en fonction du departement et du type
 */
/**
 * Calcule les droits d'enregistrement en fonction du departement et du type.
 */
function computeDroits(code, price, type) {
  const cfg = loadFraisConfig();
  const b = loadBaremes();
  const c = normalizeCode(code);
  if (!b) return 0;
  if (type === 'neuf') return price * b.neuf;
  if (cfg && cfg.dmto_struct && cfg.dmto_struct.ancien) {
    const map = cfg.dmto_struct.ancien.par_departement || {};
    const def = Number(cfg.dmto_struct.ancien.default || 0.058);
    const taux = map[c] != null ? Number(map[c]) : def;
    return price * taux;
  }
  if (b.depReduits.includes(c)) return price * b.reduit;
  const entry = getDeptEntry(code);
  if (entry && typeof entry.tauxDroits === 'number') {
    return price * entry.tauxDroits;
  }
  return price * b.standard;
}

/**
 * Retourne le taux des droits (% en decimal) utilise
 */
/**
 * Retourne le taux des droits (% en decimal) utilise pour affichage/calcul.
 */
function getDroitsRate(code, type) {
  const cfg = loadFraisConfig();
  const b = loadBaremes();
  const c = normalizeCode(code);
  if (!b) return null;
  if (type === 'neuf') return b.neuf;
  if (cfg && cfg.dmto_struct && cfg.dmto_struct.ancien) {
    const map = cfg.dmto_struct.ancien.par_departement || {};
    const def = Number(cfg.dmto_struct.ancien.default || 0.058);
    return map[c] != null ? Number(map[c]) : def;
  }
  if (b.depReduits.includes(c)) return b.reduit;
  const entry = getDeptEntry(code);
  if (entry && typeof entry.tauxDroits === 'number') return entry.tauxDroits;
  return b.standard;
}

/**
 * Calcule formalites et debours selon type et departement
 */
/**
 * Calcule formalites et debours selon type et departement (compat data).
 */
function computeDeboursFormalites(code, type) {
  const cfg = loadFraisConfig();
  if (cfg && cfg.debours) {
    const map = cfg.debours.par_departement || {};
    const c = normalizeCode(code);
    const dep = map[c];
    if (dep && (dep.cadastre || dep.conservation)) {
      const cad = Number(dep.cadastre || 0);
      const cons = Number(dep.conservation || 0);
      const form = Number(dep.formalites || 0);
      return { debours: cad + cons, formalites: form };
    }
    if (typeof cfg.debours.moyenne === 'number') {
      return { debours: Number(cfg.debours.moyenne), formalites: 0 };
    }
  }
  if (type === 'neuf') {
    return { debours: 330, formalites: 120 };
  }
  const entry = getDeptEntry(code);
  if (entry && entry.fraisDivers) {
    const cadastre = Number(entry.fraisDivers.cadastre || 0);
    const conservation = Number(entry.fraisDivers.conservation || 0);
    const formalites = Number(entry.fraisDivers.formalites || 0);
    return { debours: cadastre + conservation, formalites };
  }
  return { debours: 300, formalites: 180 };
}

/**
 * Calcule CSI (min 15€ ou 0,1% du prix)
 */
function computeCsi(price) {
  const cfg = loadFraisConfig();
  const taux = cfg && cfg.csi && cfg.csi.taux != null ? Number(cfg.csi.taux) : 0.001;
  const min = cfg && cfg.csi && cfg.csi.minimum != null ? Number(cfg.csi.minimum) : 15;
  const csi = Math.max(price * taux, min);
  return csi;
}

/**
 * Calcule TVA (20% sur emoluments + formalites)
 */
function computeTva(emoluments, formalites) {
  const cfg = loadFraisConfig();
  const tva = cfg && cfg.tva != null ? Number(cfg.tva) : 0.2;
  return tva * (emoluments + formalites);
}

/**
 * Calcule le total complet officiel pour un prix et un type
 */
function computeTotal(code, price, type) {
  const emoluments = computeEmoluments(price);
  const { debours, formalites } = computeDeboursFormalites(code, type);
  const droits = computeDroits(code, price, type);
  const csi = computeCsi(price);
  const tva = computeTva(emoluments, formalites);
  const total = emoluments + droits + debours + formalites + csi + tva;
  return { total, emoluments, droits, debours, formalites, csi, tva };
}
