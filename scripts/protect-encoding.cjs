#!/usr/bin/env node
/**
 * Script de protection de l'encodage UTF-8
 * - Verifie et corrige automatiquement les caracteres de remplacement (?)
 * - Doit etre execute apres tout script qui modifie des fichiers HTML
 */

const fs = require("fs");
const path = require("path");

const REPLACEMENT_CHAR = "\xEF\xBF\xBD"; // U+FFFD en UTF-8

const REPLACEMENTS = [
  // Francais
  { pattern: /r?gles/g, replacement: "regles" },
  { pattern: /d?finitif/g, replacement: "definitif" },
  { pattern: /personnalis?e/g, replacement: "personnalisee" },
  { pattern: /?ligible/g, replacement: "eligible" },
  { pattern: /calcul?e/g, replacement: "calculee" },
  { pattern: /propri?taire/g, replacement: "proprietaire" },
  { pattern: /bar?me/g, replacement: "bareme" },
  { pattern: /n?cessite/g, replacement: "necessite" },
  { pattern: /bas?es/g, replacement: "basees" },
  { pattern: /publi?s/g, replacement: "publies" },
  { pattern: /utilis?/g, replacement: "utilise" },
  { pattern: /sc?nario/g, replacement: "scenario" },
  { pattern: /Jusqu??/g, replacement: "Jusqu'a" },
  { pattern: /c?te/g, replacement: "cote" },
  { pattern: /?carts/g, replacement: "ecarts" },
  { pattern: /d?tail/g, replacement: "detail" },
  { pattern: /chiffr?/g, replacement: "chiffre" },
  { pattern: /g?n?ralement/g, replacement: "generalement" },
  { pattern: /fran?ais/g, replacement: "francais" },
  { pattern: /d?clar?/g, replacement: "declare" },
  { pattern: /d?cent/g, replacement: "decent" },
  { pattern: /m?tropolitaine/g, replacement: "metropolitaine" },
  { pattern: /v?rifier/g, replacement: "verifier" },
  { pattern: /r?sidence/g, replacement: "residence" },
  { pattern: /ch?mage/g, replacement: "chomage" },
  { pattern: /imp?ts/g, replacement: "impots" },
  { pattern: /gr?ce/g, replacement: "grace" },
  { pattern: /syst?me/g, replacement: "systeme" },
  { pattern: /v?rifi?es/g, replacement: "verifiees" },
  { pattern: /consid?r?s/g, replacement: "consideres" },
  { pattern: /d?pass/g, replacement: "depass" },
  { pattern: /exc?dentaire/g, replacement: "excedentaire" },
  { pattern: /vers?es/g, replacement: "versees" },
  { pattern: /recalcul?e/g, replacement: "recalculee" },
  { pattern: /ann?e/g, replacement: "annee" },
  { pattern: /r?duire/g, replacement: "reduire" },
  { pattern: /calcul?e/g, replacement: "calculee" },
  { pattern: /estim?s/g, replacement: "estimes" },
  { pattern: /r?gion/g, replacement: "region" },
  { pattern: /C?libataire/g, replacement: "Celibataire" },
  { pattern: /?tudiant/g, replacement: "Etudiant" },
  { pattern: /ind?pendant/g, replacement: "independant" },
  { pattern: /primo-acc?dant/g, replacement: "primo-accedant" },
  { pattern: /d?pendent/g, replacement: "dependent" },
  { pattern: /plafonn?/g, replacement: "plafonne" },
  { pattern: /actualis?s/g, replacement: "actualises" },
  { pattern: /affich?s/g, replacement: "affiches" },
  { pattern: /r?elle/g, replacement: "reelle" },
  { pattern: /elle-m?me/g, replacement: "elle-meme" },
  { pattern: /copropri?t?/g, replacement: "copropriete" },
  { pattern: /fonci?re/g, replacement: "fonciere" },
  { pattern: /immobili?re/g, replacement: "immobiliere" },
  { pattern: /Imp?t/g, replacement: "Impot" },
  { pattern: /g?n?ral/g, replacement: "general" },
  { pattern: /informations/g, replacement: "informations" },
  { pattern: /publi?es/g, replacement: "publiees" },
  { pattern: /m?thodologie/g, replacement: "methodologie" },
  { pattern: /simpli?e/g, replacement: "simplifiee" },
  { pattern: /aider ?/g, replacement: "aider a" },
  { pattern: /confirm?s/g, replacement: "confirmes" },
  { pattern: /apr?s/g, replacement: "apres" },
  { pattern: /estim?e/g, replacement: "estimee" },
  { pattern: /p?dagogique/g, replacement: "pedagogique" },
  { pattern: /caract?ristiques/g, replacement: "caracteristiques" },
  { pattern: /d?pend/g, replacement: "depend" },
  { pattern: /r?el/g, replacement: "reel" },
  { pattern: /donn?es/g, replacement: "donnees" },
  { pattern: /d?clarations/g, replacement: "declarations" },
  { pattern: /d?marches/g, replacement: "demarches" },
  { pattern: /vers?e/g, replacement: "versee" },
  { pattern: /aider ?/g, replacement: "aider a" },
  { pattern: /r?sider/g, replacement: "resider" },
  { pattern: /?tre/g, replacement: "etre" },
  { pattern: /v?rifi?/g, replacement: "verifie" },
  { pattern: /d?clar?e/g, replacement: "declaree" },
  { pattern: /pi?ces/g, replacement: "pieces" },
  { pattern: /demand?es/g, replacement: "demandees" },
  { pattern: /estim?/g, replacement: "estime" },
  { pattern: /confirm?s/g, replacement: "confirmes" },
  { pattern: /apr?s/g, replacement: "apres" },
  { pattern: /r?f?rence/g, replacement: "reference" },
  { pattern: /transmis/g, replacement: "transmis" },
  { pattern: /recalcul?es/g, replacement: "recalculees" },
  { pattern: /?lev?es/g, replacement: "elevees" },
  { pattern: /augmente/g, replacement: "augmente" },
  { pattern: /d?clarer/g, replacement: "declarer" },
  { pattern: /adapt?/g, replacement: "adapte" },
  { pattern: /occupants/g, replacement: "occupants" },
  { pattern: /exceptions/g, replacement: "exceptions" },
  { pattern: /autres/g, replacement: "autres" },
  { pattern: /r?f?rence/g, replacement: "reference" },
  { pattern: /textes/g, replacement: "textes" },
  { pattern: /?voluent/g, replacement: "evoluent" },
  { pattern: /d?clar?e/g, replacement: "declaree" },
  { pattern: /d?partement/g, replacement: "departement" },
  { pattern: /?conomies/g, replacement: "Economies" },
  { pattern: /?pargne/g, replacement: "Epargne" },
  { pattern: /R?gion/g, replacement: "Region" },
  
  // Symboles
  { pattern: /? /g, replacement: "€ " },
  { pattern: /?</g, replacement: "€<" },
  { pattern: /?\//g, replacement: "€/" },
  { pattern: /\(30% ?/g, replacement: "(30% ×" },
  { pattern: /APL ? Loyer/g, replacement: "APL = Loyer" },
  { pattern: /? Votre/g, replacement: "• Votre" },
  { pattern: /? Aide/g, replacement: "• Aide" },
  { pattern: /? CAF/g, replacement: "• CAF" },
  { pattern: /suffix: "?"/g, replacement: 'suffix: "€"' },
  { pattern: /exactVal \+ ' ?'/g, replacement: "exactVal + ' €'" },
  { pattern: /rounded \+ ' ?'/g, replacement: "rounded + ' €'" },
  
  // Emojis communs
  { pattern: /??/g, replacement: "⚠️" },
  { pattern: /??/g, replacement: "📊" },
  { pattern: /??/g, replacement: "📋" },
  { pattern: /??/g, replacement: "💡" },
  { pattern: /??/g, replacement: "🔍" },
  { pattern: /??/g, replacement: "🏠" },
  { pattern: /??/g, replacement: "📌" },
  { pattern: /??/g, replacement: "➕" },
  { pattern: /??/g, replacement: "🔄" },
  { pattern: /??/g, replacement: "🎓" },
  { pattern: /??/g, replacement: "📍" },
  { pattern: /??/g, replacement: "👁️" },
  { pattern: /??/g, replacement: "📝" },
  { pattern: /?/g, replacement: "a" }, // dernier recours
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let original = content;
  let fixCount = 0;

  for (const { pattern, replacement } of REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      fixCount += matches.length;
      content = content.replace(pattern, replacement);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ ${filePath}: ${fixCount} corrections appliquees`);
    return true;
  }
  return false;
}

function main() {
  const pagesDir = path.resolve(process.cwd(), "src", "pages");
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".html"));
  
  let fixedCount = 0;
  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    if (fixFile(filePath)) {
      fixedCount++;
    }
  }

  if (fixedCount === 0) {
    console.log("✅ Tous les fichiers sont propres");
  } else {
    console.log(`\n✅ ${fixedCount} fichier(s) corrige(s)`);
  }
}

main();
