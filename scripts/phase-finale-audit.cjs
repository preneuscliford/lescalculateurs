/**
 * PHASE FINALE - Corrections Juridiques Completes
 * Audit utilisateur: 5 points bloquants a corriger
 *
 * ❌ 1. Chiffres deguises (≈ 7,87) → fourchettes
 * ❌ 2. "Exemple chiffre" → "Exemple pedagogique"
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
    // ❌ 1. CHIFFRES DEGUISES → FOURCHETTES
    // ============================================

    // Remplacer les taux precis dans les tableaux (≈ 7,87 → 7 % a 9 %)
    content = content.replace(
      /<td class="px-6 py-4 text-gray-700">≈\s*\d+[,.]\d+<\/td>/g,
      '<td class="px-6 py-4 text-gray-700">7 % a 9 %</td>',
    );

    // Taux neuf (≈ 2,28 → 2 % a 3 %)
    content = content.replace(
      /<td class="px-6 py-4 text-gray-700">≈\s*2[,.]\d+<\/td>/g,
      '<td class="px-6 py-4 text-gray-700">2 % a 3 %</td>',
    );

    // Taux ancien dans tableaux (≈ 6,66 a ≈ 8,xx → 7 % a 9 %)
    content = content.replace(
      /<td class="px-6 py-4 text-gray-700">≈\s*[678][,.]\d+<\/td>/g,
      '<td class="px-6 py-4 text-gray-700">7 % a 9 %</td>',
    );

    // Patterns textuels: "≈ 2,28% et l'ancien ≈ 8.0%"
    content = content.replace(
      /Le\s*<strong>neuf<\/strong>\s*≈\s*\d+[,.]\d+%\s*et\s*l['']<strong>ancien<\/strong>\s*≈\s*\d+[,.]?\d*%/g,
      "Le <strong>neuf</strong> (2 % a 3 %) et l'<strong>ancien</strong> (7 % a 9 %)",
    );

    // Droits d'enregistrement precis (≈ 6,32% → environ 5 % a 6 %)
    content = content.replace(
      /<span class="font-mono bg-green-100 px-3 py-1 rounded">≈\s*[56][,.]\d+%<\/span>/g,
      '<span class="font-mono bg-green-100 px-3 py-1 rounded">environ 5 % a 6 %</span>',
    );

    // VEFA droits (≈ 0,71% → environ 0,7 %)
    content = content.replace(
      /<span class="font-mono bg-green-100 px-3 py-1 rounded">≈\s*0[,.]\d+%<\/span>/g,
      '<span class="font-mono bg-green-100 px-3 py-1 rounded">environ 0,7 %</span>',
    );

    // ============================================
    // ❌ 2. "EXEMPLE CHIFFRE" → "EXEMPLE PEDAGOGIQUE"
    // ============================================

    content = content.replace(/📝 Exemple chiffre/g, "📝 Exemple pedagogique");
    content = content.replace(/Exemple chiffre/g, "Exemple pedagogique");

    // Supprimer les parametres precis (taux, duree) dans les exemples
    content = content.replace(
      /<span class="text-gray-700">Taux d'interet<\/span>\s*<span class="font-bold">\d+[,.]\d+%<\/span>/g,
      '<span class="text-gray-700">Taux d\'interet</span>\n                <span class="font-bold">Variable selon profil</span>',
    );

    content = content.replace(
      /<span class="text-gray-700">Duree<\/span>\s*<span class="font-bold">\d+\s*ans<\/span>/g,
      '<span class="text-gray-700">Duree</span>\n                <span class="font-bold">Selon capacite d\'emprunt</span>',
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
      /representent\s*entre\s*\d+\s*%?\s*et\s*\d+[,.]\d*\s*%\s*du prix/gi,
      "varient selon la nature du bien (ancien ou neuf) et le prix",
    );

    // Nettoyer les autres fourchettes numeriques precises dans le texte
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
      "Prix dependant de la commune",
    );
    content = content.replace(
      /<strong>variable<\/strong>/g,
      "<strong>selon votre projet</strong>",
    );
    content = content.replace(/>variable</g, ">selon la commune<");

    // "Variable selon profil" est OK, ne pas toucher

    // Economie : variable → formulation plus riche
    content = content.replace(
      /Economie potentielle\s*:\s*<strong>variable<\/strong>/g,
      "Economie potentielle : <strong>selon les biens compares</strong>",
    );

    // ============================================
    // ❌ 5. ORTHOGRAPHE / ACCENTS
    // ============================================

    // Corrections dans l'avertissement legal
    content = content.replace(/Avertissement legal/g, "Avertissement legal");
    content = content.replace(
      /informations presentees/g,
      "informations presentees",
    );
    content = content.replace(/fournies a titre/g, "fournies a titre");
    content = content.replace(/baremes reglementes/g, "baremes reglementes");
    content = content.replace(/premiere estimation/g, "premiere estimation");
    content = content.replace(/personnalisee/g, "personnalisee");
    content = content.replace(/economie(?!s)/g, "economie");
    content = content.replace(/Economie/g, "Economie");
    content = content.replace(/reduits/g, "reduits");
    content = content.replace(/depend(?!ant)/g, "depend");
    content = content.replace(/specifiques/g, "specifiques");
    content = content.replace(/habilite/g, "habilite");
    content = content.replace(/determiner/g, "determiner");

    // Autres corrections courantes
    content = content.replace(/representent/g, "representent");
    content = content.replace(/refletent/g, "refletent");
    content = content.replace(/necessaire/g, "necessaire");
    content = content.replace(/generalement/g, "generalement");
    content = content.replace(/particulierement/g, "particulierement");
    content = content.replace(/supplementaires/g, "supplementaires");
    content = content.replace(/differentiel/g, "differentiel");
    content = content.replace(/preferez/g, "preferez");
    content = content.replace(/negocier/g, "negocier");

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed: ${file}`);
      totalFixed++;
    }
  });

console.log(`\n========================================`);
console.log(`✅ TOTAL: ${totalFixed} fichiers corriges`);
console.log(`========================================`);
