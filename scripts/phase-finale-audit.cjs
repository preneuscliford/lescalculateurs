/**
 * PHASE FINALE - Corrections Juridiques Complètes
 * Audit utilisateur: 5 points bloquants à corriger
 *
 * ❌ 1. Chiffres déguisés (≈ 7,87) → fourchettes
 * ❌ 2. "Exemple chiffré" → "Exemple pédagogique"
 * ❌ 3. Fourchettes contradictoires → supprimer
 * ❌ 4. Trop de "variable" → texte explicatif
 * ❌ 5. Fautes d'orthographe → corriger accents
 */

const fs = require("fs");
const path = require("path");

const folder = path.join(
  __dirname,
  "..",
  "src",
  "pages",
  "blog",
  "departements",
);

let totalFixed = 0;
let changes = {
  chiffresDeGuises: 0,
  exempleChiffre: 0,
  fourchettesContradictoires: 0,
  variableTexte: 0,
  orthographe: 0,
};

fs.readdirSync(folder)
  .filter((f) => f.endsWith(".html"))
  .forEach((file) => {
    const filePath = path.join(folder, file);
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    // ============================================
    // ❌ 1. CHIFFRES DÉGUISÉS → FOURCHETTES
    // ============================================

    // Remplacer les taux précis dans les tableaux (≈ 7,87 → 7 % à 9 %)
    content = content.replace(
      /<td class="px-6 py-4 text-gray-700">≈\s*\d+[,.]\d+<\/td>/g,
      '<td class="px-6 py-4 text-gray-700">7 % à 9 %</td>',
    );

    // Taux neuf (≈ 2,28 → 2 % à 3 %)
    content = content.replace(
      /<td class="px-6 py-4 text-gray-700">≈\s*2[,.]\d+<\/td>/g,
      '<td class="px-6 py-4 text-gray-700">2 % à 3 %</td>',
    );

    // Taux ancien dans tableaux (≈ 6,66 à ≈ 8,xx → 7 % à 9 %)
    content = content.replace(
      /<td class="px-6 py-4 text-gray-700">≈\s*[678][,.]\d+<\/td>/g,
      '<td class="px-6 py-4 text-gray-700">7 % à 9 %</td>',
    );

    // Patterns textuels: "≈ 2,28% et l'ancien ≈ 8.0%"
    content = content.replace(
      /Le\s*<strong>neuf<\/strong>\s*≈\s*\d+[,.]\d+%\s*et\s*l['']<strong>ancien<\/strong>\s*≈\s*\d+[,.]?\d*%/g,
      "Le <strong>neuf</strong> (2 % à 3 %) et l'<strong>ancien</strong> (7 % à 9 %)",
    );

    // Droits d'enregistrement précis (≈ 6,32% → environ 5 % à 6 %)
    content = content.replace(
      /<span class="font-mono bg-green-100 px-3 py-1 rounded">≈\s*[56][,.]\d+%<\/span>/g,
      '<span class="font-mono bg-green-100 px-3 py-1 rounded">environ 5 % à 6 %</span>',
    );

    // VEFA droits (≈ 0,71% → environ 0,7 %)
    content = content.replace(
      /<span class="font-mono bg-green-100 px-3 py-1 rounded">≈\s*0[,.]\d+%<\/span>/g,
      '<span class="font-mono bg-green-100 px-3 py-1 rounded">environ 0,7 %</span>',
    );

    // ============================================
    // ❌ 2. "EXEMPLE CHIFFRÉ" → "EXEMPLE PÉDAGOGIQUE"
    // ============================================

    content = content.replace(/📝 Exemple chiffré/g, "📝 Exemple pédagogique");
    content = content.replace(/Exemple chiffré/g, "Exemple pédagogique");

    // Supprimer les paramètres précis (taux, durée) dans les exemples
    content = content.replace(
      /<span class="text-gray-700">Taux d'intérêt<\/span>\s*<span class="font-bold">\d+[,.]\d+%<\/span>/g,
      '<span class="text-gray-700">Taux d\'intérêt</span>\n                <span class="font-bold">Variable selon profil</span>',
    );

    content = content.replace(
      /<span class="text-gray-700">Durée<\/span>\s*<span class="font-bold">\d+\s*ans<\/span>/g,
      '<span class="text-gray-700">Durée</span>\n                <span class="font-bold">Selon capacité d\'emprunt</span>',
    );

    // ============================================
    // ❌ 3. FOURCHETTES CONTRADICTOIRES
    // ============================================

    // Supprimer "entre 4 % et 7,4 %" et variantes contradictoires
    content = content.replace(
      /entre\s*4\s*%?\s*et\s*7[,.]\d*\s*%\s*du prix d'achat/gi,
      "selon la nature du bien et le prix d'achat",
    );

    content = content.replace(
      /représentent\s*entre\s*\d+\s*%?\s*et\s*\d+[,.]\d*\s*%\s*du prix/gi,
      "varient selon la nature du bien (ancien ou neuf) et le prix",
    );

    // Nettoyer les autres fourchettes numériques précises dans le texte
    content = content.replace(
      /entre\s*\d+[,.]\d+\s*%\s*et\s*\d+[,.]\d+\s*%/gi,
      (match) => {
        // Garder seulement si c'est 7-9% ou 2-3%
        if (match.includes("7") && match.includes("9")) return match;
        if (match.includes("2") && match.includes("3")) return match;
        return "selon votre situation";
      },
    );

    // ============================================
    // ❌ 4. "VARIABLE" → TEXTE EXPLICATIF
    // ============================================

    // Prix variable/m² → phrase explicative
    content = content.replace(
      /Prix variable\/m²/g,
      "Prix dépendant de la commune",
    );
    content = content.replace(
      /<strong>variable<\/strong>/g,
      "<strong>selon votre projet</strong>",
    );
    content = content.replace(/>variable</g, ">selon la commune<");

    // "Variable selon profil" est OK, ne pas toucher

    // Économie : variable → formulation plus riche
    content = content.replace(
      /Economie potentielle\s*:\s*<strong>variable<\/strong>/g,
      "Économie potentielle : <strong>selon les biens comparés</strong>",
    );

    // ============================================
    // ❌ 5. ORTHOGRAPHE / ACCENTS
    // ============================================

    // Corrections dans l'avertissement légal
    content = content.replace(/Avertissement legal/g, "Avertissement légal");
    content = content.replace(
      /informations presentees/g,
      "informations présentées",
    );
    content = content.replace(/fournies a titre/g, "fournies à titre");
    content = content.replace(/baremes reglementes/g, "barèmes réglementés");
    content = content.replace(/premiere estimation/g, "première estimation");
    content = content.replace(/personnalisee/g, "personnalisée");
    content = content.replace(/economie(?!s)/g, "économie");
    content = content.replace(/Economie/g, "Économie");
    content = content.replace(/reduits/g, "réduits");
    content = content.replace(/depend(?!ant)/g, "dépend");
    content = content.replace(/specifiques/g, "spécifiques");
    content = content.replace(/habilite/g, "habilité");
    content = content.replace(/determiner/g, "déterminer");

    // Autres corrections courantes
    content = content.replace(/representent/g, "représentent");
    content = content.replace(/refletent/g, "reflètent");
    content = content.replace(/necessaire/g, "nécessaire");
    content = content.replace(/generalement/g, "généralement");
    content = content.replace(/particulierement/g, "particulièrement");
    content = content.replace(/supplementaires/g, "supplémentaires");
    content = content.replace(/differentiel/g, "différentiel");
    content = content.replace(/preferez/g, "préférez");
    content = content.replace(/negocier/g, "négocier");

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed: ${file}`);
      totalFixed++;
    }
  });

console.log(`\n========================================`);
console.log(`✅ TOTAL: ${totalFixed} fichiers corrigés`);
console.log(`========================================`);
