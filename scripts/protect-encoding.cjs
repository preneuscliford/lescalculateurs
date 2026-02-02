#!/usr/bin/env node
/**
 * Script de protection de l'encodage UTF-8
 * - Vérifie et corrige automatiquement les caractères de remplacement (�)
 * - Doit être exécuté après tout script qui modifie des fichiers HTML
 */

const fs = require("fs");
const path = require("path");

const REPLACEMENT_CHAR = "\xEF\xBF\xBD"; // U+FFFD en UTF-8

const REPLACEMENTS = [
  // Français
  { pattern: /r�gles/g, replacement: "règles" },
  { pattern: /d�finitif/g, replacement: "définitif" },
  { pattern: /personnalis�e/g, replacement: "personnalisée" },
  { pattern: /�ligible/g, replacement: "éligible" },
  { pattern: /calcul�e/g, replacement: "calculée" },
  { pattern: /propri�taire/g, replacement: "propriétaire" },
  { pattern: /bar�me/g, replacement: "barème" },
  { pattern: /n�cessite/g, replacement: "nécessite" },
  { pattern: /bas�es/g, replacement: "basées" },
  { pattern: /publi�s/g, replacement: "publiés" },
  { pattern: /utilis�/g, replacement: "utilisé" },
  { pattern: /sc�nario/g, replacement: "scénario" },
  { pattern: /Jusqu��/g, replacement: "Jusqu'à" },
  { pattern: /c�te/g, replacement: "côte" },
  { pattern: /�carts/g, replacement: "écarts" },
  { pattern: /d�tail/g, replacement: "détail" },
  { pattern: /chiffr�/g, replacement: "chiffré" },
  { pattern: /g�n�ralement/g, replacement: "généralement" },
  { pattern: /fran�ais/g, replacement: "français" },
  { pattern: /d�clar�/g, replacement: "déclaré" },
  { pattern: /d�cent/g, replacement: "décent" },
  { pattern: /m�tropolitaine/g, replacement: "métropolitaine" },
  { pattern: /v�rifier/g, replacement: "vérifier" },
  { pattern: /r�sidence/g, replacement: "résidence" },
  { pattern: /ch�mage/g, replacement: "chômage" },
  { pattern: /imp�ts/g, replacement: "impôts" },
  { pattern: /gr�ce/g, replacement: "grâce" },
  { pattern: /syst�me/g, replacement: "système" },
  { pattern: /v�rifi�es/g, replacement: "vérifiées" },
  { pattern: /consid�r�s/g, replacement: "considérés" },
  { pattern: /d�pass/g, replacement: "dépass" },
  { pattern: /exc�dentaire/g, replacement: "excédentaire" },
  { pattern: /vers�es/g, replacement: "versées" },
  { pattern: /recalcul�e/g, replacement: "recalculée" },
  { pattern: /ann�e/g, replacement: "année" },
  { pattern: /r�duire/g, replacement: "réduire" },
  { pattern: /calcul�e/g, replacement: "calculée" },
  { pattern: /estim�s/g, replacement: "estimés" },
  { pattern: /r�gion/g, replacement: "région" },
  { pattern: /C�libataire/g, replacement: "Célibataire" },
  { pattern: /�tudiant/g, replacement: "Étudiant" },
  { pattern: /ind�pendant/g, replacement: "indépendant" },
  { pattern: /primo-acc�dant/g, replacement: "primo-accédant" },
  { pattern: /d�pendent/g, replacement: "dépendent" },
  { pattern: /plafonn�/g, replacement: "plafonné" },
  { pattern: /actualis�s/g, replacement: "actualisés" },
  { pattern: /affich�s/g, replacement: "affichés" },
  { pattern: /r�elle/g, replacement: "réelle" },
  { pattern: /elle-m�me/g, replacement: "elle-même" },
  { pattern: /copropri�t�/g, replacement: "copropriété" },
  { pattern: /fonci�re/g, replacement: "foncière" },
  { pattern: /immobili�re/g, replacement: "immobilière" },
  { pattern: /Imp�t/g, replacement: "Impôt" },
  { pattern: /g�n�ral/g, replacement: "général" },
  { pattern: /informations/g, replacement: "informations" },
  { pattern: /publi�es/g, replacement: "publiées" },
  { pattern: /m�thodologie/g, replacement: "méthodologie" },
  { pattern: /simpli�e/g, replacement: "simplifiée" },
  { pattern: /aider �/g, replacement: "aider à" },
  { pattern: /confirm�s/g, replacement: "confirmés" },
  { pattern: /apr�s/g, replacement: "après" },
  { pattern: /estim�e/g, replacement: "estimée" },
  { pattern: /p�dagogique/g, replacement: "pédagogique" },
  { pattern: /caract�ristiques/g, replacement: "caractéristiques" },
  { pattern: /d�pend/g, replacement: "dépend" },
  { pattern: /r�el/g, replacement: "réel" },
  { pattern: /donn�es/g, replacement: "données" },
  { pattern: /d�clarations/g, replacement: "déclarations" },
  { pattern: /d�marches/g, replacement: "démarches" },
  { pattern: /vers�e/g, replacement: "versée" },
  { pattern: /aider �/g, replacement: "aider à" },
  { pattern: /r�sider/g, replacement: "résider" },
  { pattern: /�tre/g, replacement: "être" },
  { pattern: /v�rifi�/g, replacement: "vérifié" },
  { pattern: /d�clar�e/g, replacement: "déclarée" },
  { pattern: /pi�ces/g, replacement: "pièces" },
  { pattern: /demand�es/g, replacement: "demandées" },
  { pattern: /estim�/g, replacement: "estimé" },
  { pattern: /confirm�s/g, replacement: "confirmés" },
  { pattern: /apr�s/g, replacement: "après" },
  { pattern: /r�f�rence/g, replacement: "référence" },
  { pattern: /transmis/g, replacement: "transmis" },
  { pattern: /recalcul�es/g, replacement: "recalculées" },
  { pattern: /�lev�es/g, replacement: "élevées" },
  { pattern: /augmente/g, replacement: "augmente" },
  { pattern: /d�clarer/g, replacement: "déclarer" },
  { pattern: /adapt�/g, replacement: "adapté" },
  { pattern: /occupants/g, replacement: "occupants" },
  { pattern: /exceptions/g, replacement: "exceptions" },
  { pattern: /autres/g, replacement: "autres" },
  { pattern: /r�f�rence/g, replacement: "référence" },
  { pattern: /textes/g, replacement: "textes" },
  { pattern: /�voluent/g, replacement: "évoluent" },
  { pattern: /d�clar�e/g, replacement: "déclarée" },
  { pattern: /d�partement/g, replacement: "département" },
  { pattern: /�conomies/g, replacement: "Économies" },
  { pattern: /�pargne/g, replacement: "Épargne" },
  { pattern: /R�gion/g, replacement: "Région" },
  
  // Symboles
  { pattern: /� /g, replacement: "€ " },
  { pattern: /�</g, replacement: "€<" },
  { pattern: /�\//g, replacement: "€/" },
  { pattern: /\(30% �/g, replacement: "(30% ×" },
  { pattern: /APL � Loyer/g, replacement: "APL = Loyer" },
  { pattern: /� Votre/g, replacement: "• Votre" },
  { pattern: /� Aide/g, replacement: "• Aide" },
  { pattern: /� CAF/g, replacement: "• CAF" },
  { pattern: /suffix: "�"/g, replacement: 'suffix: "€"' },
  { pattern: /exactVal \+ ' �'/g, replacement: "exactVal + ' €'" },
  { pattern: /rounded \+ ' �'/g, replacement: "rounded + ' €'" },
  
  // Emojis communs
  { pattern: /��/g, replacement: "⚠️" },
  { pattern: /��/g, replacement: "📊" },
  { pattern: /��/g, replacement: "📋" },
  { pattern: /��/g, replacement: "💡" },
  { pattern: /��/g, replacement: "🔍" },
  { pattern: /��/g, replacement: "🏠" },
  { pattern: /��/g, replacement: "📌" },
  { pattern: /��/g, replacement: "➕" },
  { pattern: /��/g, replacement: "🔄" },
  { pattern: /��/g, replacement: "🎓" },
  { pattern: /��/g, replacement: "📍" },
  { pattern: /��/g, replacement: "👁️" },
  { pattern: /��/g, replacement: "📝" },
  { pattern: /�/g, replacement: "à" }, // dernier recours
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
    console.log(`✅ ${filePath}: ${fixCount} corrections appliquées`);
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
    console.log(`\n✅ ${fixedCount} fichier(s) corrigé(s)`);
  }
}

main();
