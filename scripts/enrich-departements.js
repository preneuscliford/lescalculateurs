import fs from 'node:fs';
import path from 'node:path';

/**
 * Liste les fichiers HTML de départements à enrichir.
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
 * Extrait le nom du département et le code depuis le contenu ou le nom de fichier.
 * Essaye d'abord le H1, puis le title, et enfin le code à partir du nom de fichier.
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

  // Essayer d'extraire le nom du département depuis le H1 (après une préposition)
  const h1NameMatch = html.match(/<h1[^>]*>[\s\S]*?(?:en|dans|au|aux|à)\s+([^<(]+)\s*\((\d{2})\)/i);
  if (h1NameMatch) {
    name = h1NameMatch[1].trim();
    code = code || h1NameMatch[2];
  }

  // Sinon tenter via le title (après une préposition)
  const titleNameMatch = html.match(/<title>[\s\S]*?(?:en|dans|au|aux|à)\s+([A-Za-zÀ-ÿ'\-\s]+)\s*\((\d{2})\)/i);
  if (!name && titleNameMatch) {
    name = titleNameMatch[1].trim();
    code = code || titleNameMatch[2];
  }

  // À défaut, utiliser le code du nom de fichier
  if (!code) {
    const fileCode = path.basename(filePath).match(/(\d{2})/);
    code = fileCode ? fileCode[1] : null;
  }

  // Sanitize du nom (retirer "Frais de notaire" éventuel)
  if (name) {
    name = name
      .replace(/\bFrais\s+de\s+notaire\b/gi, '')
      .replace(/\bde\s+notaire\b/gi, '')
      .replace(/\bnotaire\b/gi, '')
      .replace(/^(?:dans\s+le|dans\s+la|dans\s+les|en|au|aux|à)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Nom fallback générique
  if (!name) {
    name = 'Département';
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
 * Vérifie si un CTA "Calcul immédiat" est déjà présent pour éviter les duplications.
 */
function hasCta(html) {
  return /Calcul\s+immédiat\s*\(10\s*s\)\s*—\s*Gratuit/i.test(html);
}

/**
 * Construit le bloc CTA personnalisé pour un département donné.
 */
function buildCtaBlock(name, code) {
  const official = getDepartmentName(code);
  const cleanName = String(official || name || '')
    .replace(/\bfrais\s+de\s+notaire\b/gi, '')
    .replace(/\bde\s+notaire\b/gi, '')
    .replace(/\bnotaire\b/gi, '')
    .trim();
  const label = `Calcul immédiat (10 s) — Gratuit`;
  const desc = `Barème officiel 2025, estimation précise pour ${cleanName} (${code}).`;
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
 * Insère le CTA après l'ouverture de l'élément <article>, sinon avant </body>.
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
 * Vérifie si une section locale ciblée existe déjà (H2 "Calcul frais de notaire ...").
 */
function hasLocalSection(html) {
  return /<h2[^>]*>\s*Calcul\s+frais\s+de\s+notaire\s+/i.test(html);
}

/**
 * Construit une section locale générique (évite duplication en insérant nom/code).
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
    `          <a href="/pages/pret.html" class="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold shadow-sm">Voir mensualités de prêt</a>\n` +
    `        </div>\n`
  );
}

/**
 * Insère la section locale avant la fin de l'<article> si présent, sinon en fin de contenu.
 */
function insertLocalSection(html, localBlock) {
  const articleCloseIdx = html.lastIndexOf('</article>');
  if (articleCloseIdx !== -1) {
    return html.slice(0, articleCloseIdx) + '\n' + localBlock + html.slice(articleCloseIdx);
  }
  return html + '\n' + localBlock;
}

/**
 * Charge les données locales (mapping) depuis scripts/locales.json.
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
 * Construit une section locale spécifique si des données existent.
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
    `          <a href="/pages/pret.html" class="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold shadow-sm">Voir mensualités de prêt</a>\n` +
    `        </div>\n`
  );
}

/**
 * Met à jour une section locale générique existante vers une version spécifique.
 */
function upgradeLocalSection(html, data, code, deptName) {
  const official = getDepartmentName(code);
  const displayName = official || deptName || data.city;
  // Remplacer le H2 s'il est générique
  html = html.replace(
    /<h2[^>]*>\s*Calcul\s+frais\s+de\s+notaire\s+[^<]*\(\d{2}\)\s*<\/h2>/i,
    `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">Calcul frais de notaire ${displayName} (${code})</h2>`
  );
  // Remplacer le paragraphe indicatif par des données spécifiques
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
  // Cibler le <p> immédiatement après le H2
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
    /<h3 class="font-semibold text-gray-900 mb-2">FAQ\s+—\s+[^<]+<\/h3>[\s\S]*?<ul[^>]*>[\s\S]*?<\/ul>/i,
    (
      `          <h3 class="font-semibold text-gray-900 mb-2">FAQ — ${deptName || data.city}</h3>\n` +
      `          <ul class="text-sm text-gray-700 space-y-2">\n` +
      `            <li><strong>Combien pour 200 000 € (ancien) ?</strong> ${data.ancienAmount}.</li>\n` +
      `            <li><strong>Et pour le neuf (VEFA) ?</strong> ${data.neufAmount} grâce aux droits réduits.</li>\n` +
      `            <li><strong>À savoir :</strong> ${data.note}</li>\n` +
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

  // Remplacer/insérer CTA systématiquement pour uniformiser et rendre responsive
  updated = replaceExistingCta(updated, deptName, code || '');
  // Insérer un snippet summary (même si CTA déjà présent)
  const summary = buildSummaryBlock(name, code || '', localData);
  updated = insertSummaryAfterCta(updated, summary);
  // Assurer la présence de la note d’explication globale
  updated = ensureInfoNote(updated);
  // Dédupliquer la note si plusieurs occurrences
  updated = dedupeInfoNotes(updated);

  if (!hasLocalSection(updated)) {
    const local = localData
      ? buildSpecificLocalSection(localData, code || '', deptName)
      : buildLocalSection(name, code || '');
    updated = insertLocalSection(updated, local);
  } else if (localData) {
    // Mettre à niveau la section existante vers une version spécifique si possible
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
 * Vérifie la présence d’un résumé snippet au‑dessus du pli.
 */
function hasSummary(html) {
  return /border-yellow-400/i.test(html);
}

function removeSummary(html) {
  return html.replace(/<div[^>]*border-yellow-400[\s\S]*?<\/div>/i, '');
}

/**
 * Construit le bloc résumé (2 lignes) basé sur les données locales.
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
  const label = `💰 Frais de notaire 2025 à ${displayCity} ${displayParen}`;
  const oldRatePct = ancienRateNum != null ? `≈ ${formatPercent(ancienRateNum)}` : 'N/A';
  const newRatePct = neufRateNum != null ? `≈ ${formatPercent(neufRateNum)}` : 'N/A';
  const partOld = `≈ ${formatEuroAmount(ancien.total)} pour 200 000 € (ancien, droits ${oldRatePct})`;
  const partNew = `≈ ${formatEuroAmount(neuf.total)} pour 200 000 € (neuf, droits ${newRatePct})`;
  const line1 = `${label} : ${partOld} • ${partNew}`;
  const line2 = `Inclut droits, émoluments, formalités, CSI et TVA`;
  return (
    `      <div class="mt-6 mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-5 rounded-r">\n` +
    `        <p class="text-sm sm:text-base text-gray-800 leading-relaxed"><strong>${line1}</strong><br/><span class="text-xs sm:text-sm text-gray-600">${line2}</span></p>\n` +
    `      </div>\n`
  );
}

/**
 * Insère le résumé juste après le CTA si présent, sinon en haut de l’article.
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
 * Assure la présence de la note d’explication globale sur chaque page
 */
function ensureInfoNote(html) {
  const noteRegex = /Neuf\s*:\s*droits\s+réduits\s+uniformes\s*\(0,715%\)\.[\s\S]*?Inclut\s+droits,\s+émoluments,\s+formalités,\s+CSI\s+et\s+TVA\./i;
  if (noteRegex.test(html)) return html;
  const note = `        <p class="text-xs sm:text-sm text-gray-600 mb-4">Neuf : droits réduits uniformes (0,715%). Totaux incluent droits, émoluments, formalités, CSI et TVA.</p>\n`;
  // Insérer après le résumé si présent
  const summaryMarker = 'border-yellow-400';
  const pos = html.indexOf(summaryMarker);
  if (pos !== -1) {
    const endDiv = html.indexOf('</div>', pos);
    if (endDiv !== -1) {
      const insertPos = endDiv + 6;
      return html.slice(0, insertPos) + '\n' + note + html.slice(insertPos);
    }
  }
  // Sinon, insérer après le H2 local si présent
  const h2Match = html.match(/<h2[^>]*>\s*Calcul\s+frais\s+de\s+notaire[\s\S]*?<\/h2>/i);
  if (h2Match) {
    const idx = html.indexOf(h2Match[0]) + h2Match[0].length;
    return html.slice(0, idx) + '\n' + note + html.slice(idx);
  }
  // Fallback: en haut de l’article
  const articleOpen = html.match(/<article[^>]*>/);
  if (articleOpen) {
    const idx = html.indexOf(articleOpen[0]) + articleOpen[0].length;
    return html.slice(0, idx) + '\n' + note + html.slice(idx);
  }
  return html + '\n' + note;
}

/**
 * Supprime les doublons de la note "Neuf : droits réduits uniformes...".
 */
function dedupeInfoNotes(html) {
  const re = /<p class="text-xs sm:text-sm text-gray-600 mb-4">Neuf : droits réduits uniformes \(0,715%\)\. Totaux incluent droits, émoluments, formalités, CSI et TVA\.<\/p>/gi;
  let seen = false;
  return html.replace(re, (m) => {
    if (seen) return '';
    seen = true;
    return m;
  });
}

/**
 * Remplace un CTA existant par le nouveau CTA responsive avec nettoyage du libellé
 */
function replaceExistingCta(html, name, code) {
  const newCta = buildCtaBlock(name, code);
  // Cas avec anciens CTA (bg-blue-50 et bouton "Lancer le calcul")
  const oldCtaRegex = /<div[^>]*bg-blue-50[\s\S]*?Lancer le calcul[\s\S]*?<\/div>/i;
  if (oldCtaRegex.test(html)) {
    return html.replace(oldCtaRegex, newCta);
  }
  // Cas avec notre CTA marqué
  const markedRegex = /<!-- CTA BLOCK START -->[\s\S]*?<!-- CTA BLOCK END -->/i;
  if (markedRegex.test(html)) {
    return html.replace(markedRegex, newCta);
  }
  // Sinon, insérer en haut de l'article
  const articleOpenMatch = html.match(/<article[^>]*>/);
  if (articleOpenMatch) {
    const idx = html.indexOf(articleOpenMatch[0]) + articleOpenMatch[0].length;
    return html.slice(0, idx) + '\n' + newCta + html.slice(idx);
  }
  return newCta + '\n' + html;
}

/**
 * Met à jour ou insère une FAQ locale longue traîne.
 */
/**
 * Supprime toutes les FAQs visibles (H3 "FAQ — ..." et la liste <ul>)
 */
function removeAllFaq(html) {
  return html.replace(/<h3 class="font-semibold text-gray-900 mb-2">FAQ\s+—[\s\S]*?<ul[^>]*>[\s\S]*?<\/ul>/gi, '');
}

/**
 * Point d'entrée: traite tous les fichiers départements.
 */
function main() {
  const files = listDepartmentFiles();
  const results = files.map(processFile);
  const changed = results.filter((r) => r.changed).length;
  console.log(`Enrichissement terminé: ${changed} fichier(s) modifié(s) sur ${files.length}.`);
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
  // Fallback si parsing échoue
  const std = typeof standard === 'number' ? standard : 0.0581;
  const nf = typeof neuf === 'number' ? neuf : 0.00715;
  const red = typeof reduit === 'number' ? reduit : 0.0509006;
  const deps = depReduits.length ? depReduits : ["36","976"];
  return { standard: std, neuf: nf, reduit: red, depReduits: deps };
}

/**
 * Charge la configuration JSON fournie (DMTO, barème émoluments, CSI, débours).
 */
function loadFraisConfig() {
  const p = path.resolve(process.cwd(), 'src', 'data', 'frais2025.json');
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
 * pour coller aux libellés attendus (ex: 5,80% et 0,71%).
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
 * Charge les données départementales (taux droits, débours, formalités)
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
 * Normalise le code département en chaîne
 */
function normalizeCode(code) {
  return String(code || '').toUpperCase();
}

/**
 * Retourne le nom officiel du département depuis departements.json
 */
/**
 * Retourne le nom officiel du département (compat objet ou tableau).
 */
function getDepartmentName(code) {
  const entry = getDeptEntry(code);
  return entry && entry.nom ? String(entry.nom) : null;
}

/**
 * Récupère l'entrée département depuis departements.json (objet ou tableau).
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
 * Calcule les émoluments proportionnels du notaire selon barème officiel
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
 * Retourne droits d’enregistrement en fonction du département et du type
 */
/**
 * Calcule les droits d'enregistrement en fonction du département et du type.
 */
function computeDroits(code, price, type) {
  const cfg = loadFraisConfig();
  const b = loadBaremes();
  const c = normalizeCode(code);
  if (!b) return 0;
  if (type === 'neuf') return price * b.neuf;
  if (cfg && cfg.dmto && cfg.dmto[c]) {
    return price * (Number(cfg.dmto[c]) / 100);
  }
  if (b.depReduits.includes(c)) return price * b.reduit;
  const entry = getDeptEntry(code);
  if (entry && typeof entry.tauxDroits === 'number') {
    return price * entry.tauxDroits;
  }
  return price * b.standard;
}

/**
 * Retourne le taux des droits (% en décimal) utilisé
 */
/**
 * Retourne le taux des droits (% en décimal) utilisé pour affichage/calcul.
 */
function getDroitsRate(code, type) {
  const cfg = loadFraisConfig();
  const b = loadBaremes();
  const c = normalizeCode(code);
  if (!b) return null;
  if (type === 'neuf') return b.neuf;
  if (cfg && cfg.dmto && cfg.dmto[c]) return Number(cfg.dmto[c]) / 100;
  if (b.depReduits.includes(c)) return b.reduit;
  const entry = getDeptEntry(code);
  if (entry && typeof entry.tauxDroits === 'number') return entry.tauxDroits;
  return b.standard;
}

/**
 * Calcule formalités et débours selon type et département
 */
/**
 * Calcule formalités et débours selon type et département (compat data).
 */
function computeDeboursFormalites(code, type) {
  const cfg = loadFraisConfig();
  if (cfg && cfg.debours && typeof cfg.debours.moyenne === 'number') {
    return { debours: Number(cfg.debours.moyenne), formalites: 0 };
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
  const taux = cfg && cfg.csi ? Number(cfg.csi) / 100 : 0.001;
  const csi = Math.max(price * taux, 15);
  return csi;
}

/**
 * Calcule TVA (20% sur émoluments + formalités)
 */
function computeTva(emoluments, formalites) {
  return 0.2 * (emoluments + formalites);
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
