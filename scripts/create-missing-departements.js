import fs from 'node:fs';
import path from 'node:path';

/**
 * Retourne la liste des departements manquants a creer
 */
function getMissingDepartments() {
  const targetDir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements');
  const existing = fs.readdirSync(targetDir).filter((f) => /^frais-notaire-.*\.html$/.test(f));
  const needs = [
    { code: '2A', name: 'Corse-du-Sud' },
    { code: '2B', name: 'Haute-Corse' },
    { code: '971', name: 'Guadeloupe' },
    { code: '972', name: 'Martinique' },
    { code: '973', name: 'Guyane' },
    { code: '974', name: 'La Reunion' },
    { code: '976', name: 'Mayotte' },
  ];
  return needs.filter(({ code }) => !existing.includes(`frais-notaire-${code}.html`));
}

/**
 * Cree une page departement minimale avec structure HTML et <article>
 */
function createDepartmentPage({ code, name }) {
  const targetDir = path.resolve(process.cwd(), 'src', 'pages', 'blog', 'departements');
  const filePath = path.join(targetDir, `frais-notaire-${code}.html`);
  const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🧾 Frais de notaire 2025 ${name} (${code}) - Simulateur</title>
    <meta name="description" content="Calculez vos frais de notaire 2025 en ${name} (${code}). Simulation rapide et gratuite : ancien vs neuf, droits, emoluments, formalites, CSI et TVA." />
  </head>
  <body class="bg-gray-50">
    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Frais de notaire 2025 en ${name} (${code})</h1>
      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">Calcul frais de notaire ${name} (${code})</h2>
      <p class="text-gray-700 mb-4">Donnees indicatives basees sur le bareme officiel 2025.</p>
      <div class="flex gap-3 mb-8">
        <a href="/pages/notaire.html" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">Calculer maintenant</a>
        <a href="/pages/pret.html" class="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold shadow-sm">Voir mensualites de pret</a>
      </div>
    </article>
  </body>
</html>`;
  fs.writeFileSync(filePath, html, 'utf8');
  return filePath;
}

/**
 * Point d'entree: cree les pages manquantes et affiche un resume
 */
function main() {
  const missing = getMissingDepartments();
  if (missing.length === 0) {
    console.log('Aucune page manquante a creer.');
    return;
  }
  const created = missing.map(createDepartmentPage);
  console.log(`Pages creees: ${created.length}`);
  created.forEach((p) => console.log(`- ${p}`));
}

main();

