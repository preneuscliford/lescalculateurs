import fs from 'node:fs';
import path from 'node:path';

/**
 * Charge les locales existantes et retourne un objet (code -> data).
 */
function loadExistingLocales() {
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
 * Liste les fichiers HTML des départements.
 */
function listDepartmentFiles() {
  const baseDir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements');
  const files = fs.readdirSync(baseDir).filter((f) => /^frais-notaire-\d{2}\.html$/.test(f));
  return files.map((f) => path.join(baseDir, f));
}

/**
 * Extrait le code et le nom du département depuis le contenu (H1/title)
 * et/ou depuis le nom de fichier.
 */
function extractDeptInfo(html, filePath) {
  let code = null;
  let name = null;

  const h1Code = html.match(/<h1[^>]*>[\s\S]*?\((\d{2})\)/);
  if (h1Code) code = h1Code[1];

  const titleCode = !code && html.match(/<title>[\s\S]*?\((\d{2})\)/);
  if (titleCode) code = titleCode[1];

  const h1Name = html.match(/<h1[^>]*>[\s\S]*?en\s+([^<(]+)\s*\(\d{2}\)/i);
  if (h1Name) name = h1Name[1].trim();

  const titleName = !name && html.match(/<title>[\s\S]*?\s([A-Za-zÀ-ÿ'\-\s]+)\s*\(\d{2}\)/);
  if (titleName) name = titleName[1].trim();

  if (!code) {
    const fileCode = path.basename(filePath).match(/(\d{2})/);
    code = fileCode ? fileCode[1] : null;
  }

  if (!name) name = 'Département';

  return { code, name };
}

/**
 * Construit une entrée locale par défaut pour un département.
 */
function makeDefaultLocale(name) {
  return {
    city: name,
    ancienRate: '≈ 7–8%',
    neufRate: '≈ 2–3%',
    ancienAmount: '≈ 14 000–15 000 €',
    neufAmount: '≈ 4 000–5 000 €',
    note: 'Montants indicatifs, précisez avec le simulateur (barème 2025).',
    faq: [
      {
        q: `Quel est le montant des frais de notaire pour une maison à ${name} ?`,
        a: `Ancien: ${'≈ 7–8%'}, Neuf: ${'≈ 2–3%'}. Pour 200 000 €: ancien ${'≈ 14 000–15 000 €'}, neuf ${'≈ 4 000–5 000 €'}.`
      },
      {
        q: `Frais de notaire en ${name} : pourquoi varient‑ils ?`,
        a: `Ils dépendent des droits d'enregistrement, des formalités et des débours locaux. Utilisez le simulateur pour un chiffrage précis.`
      },
      {
        q: `Comment réduire mes frais de notaire en ${name} ?`,
        a: `Acheter en neuf (VEFA) réduit les droits. Déduire le mobilier du prix et comparer les scénarios dans le simulateur.`
      }
    ]
  };
}

/**
 * Écrit le JSON fusionné sur disque.
 */
function writeLocales(locales) {
  const p = path.resolve(process.cwd(), 'scripts', 'locales.json');
  fs.writeFileSync(p, JSON.stringify(locales, null, 2), 'utf8');
}

/**
 * Point d’entrée: génère des locales pour tous les départements présents.
 */
function main() {
  const existing = loadExistingLocales();
  const files = listDepartmentFiles();
  const locales = { ...existing };

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const { code, name } = extractDeptInfo(html, file);
    if (!code) continue;
    if (!locales[code]) {
      locales[code] = makeDefaultLocale(name);
    } else {
      // Compléter les champs manquants pour les entrées existantes
      const def = makeDefaultLocale(name);
      locales[code] = { ...def, ...locales[code] };
    }
  }

  writeLocales(locales);
  console.log(`Locales générées: ${Object.keys(locales).length} codes couverts.`);
}

main();
