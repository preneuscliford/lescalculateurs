const fs = require('fs');
const path = require('path');

const pages = [
  'salaire.html', 'impot.html', 'notaire.html', 'pret.html', 'plusvalue.html',
  'apl.html', 'rsa.html', 'prime-activite.html', 'are.html', 'asf.html'
];

const pagesDir = 'src/pages';
let modifiedCount = 0;

for (const page of pages) {
  const filePath = path.join(pagesDir, page);
  
  try {
    if (!fs.existsSync(filePath)) {
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Compter combien de sticky-ymyl existent
    const matches = content.match(/sticky-ymyl/g);
    if (matches && matches.length > 2) { // 2 = 1 div + 1 dans le nom de classe
      console.log('⚠ Double YMYL trouvé dans: ' + page);
      
      // Pattern pour trouver et supprimer l'ancien sticky-ymyl multiligne
      const oldYmylPattern = /<div\s+class="sticky-ymyl"\s+role="alert"\s+style="\s*position:\s*sticky;\s*top:\s*0;\s*z-index:\s*9999;\s*background:\s*#fff3cd;\s*border:\s*1px\s+solid\s+#ffc107;\s*padding:\s*12px\s+16px;\s*text-align:\s*center;\s*font-size:\s*14px;\s*"\s*>[\s\S]*?<\/div>/i;
      
      // Supprimer l'ancien format (multiligne avec des espaces/extras)
      let newContent = content.replace(oldYmylPattern, '');
      
      // Pattern plus simple pour l'ancien sticky-ymyl
      const simpleOldPattern = /<div\s+class="sticky-ymyl"[\s\S]*?>[\s\S]*?<strong>⚠️ Estimation indicative\.?<\/strong>[\s\S]*?Montant définitif sur[\s\S]*?<\/div>/i;
      
      // Vérifier s'il reste encore des doubles
      const afterFirstReplace = newContent.match(/sticky-ymyl/g);
      if (afterFirstReplace && afterFirstReplace.length > 2) {
        // Chercher le premier sticky-ymyl (l'ancien format sur plusieurs lignes)
        const lines = newContent.split('\n');
        let startIdx = -1;
        let endIdx = -1;
        let inYmyl = false;
        
        for (let i = 0; i < lines.length; i++) {
          if (!inYmyl && lines[i].includes('sticky-ymyl') && lines[i].includes('role="alert"') && lines[i].includes('z-index: 9999')) {
            // Vérifier si ce n'est pas le nouveau format compact (padding:8px)
            if (!lines[i].includes('padding:8px') && !lines[i+1]?.includes('padding:8px')) {
              startIdx = i;
              inYmyl = true;
            }
          }
          if (inYmyl && lines[i].includes('</div>')) {
            endIdx = i;
            break;
          }
        }
        
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          lines.splice(startIdx, endIdx - startIdx + 1);
          newContent = lines.join('\n');
        }
      }
      
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log('✓ Corrigé: ' + page);
        modifiedCount++;
      }
    } else {
      console.log('✓ OK: ' + page);
    }
  } catch (err) {
    console.log('✗ Erreur ' + page + ': ' + err.message);
  }
}

console.log('\n=== RÉSULTAT ===');
console.log('Pages corrigées: ' + modifiedCount);
process.exit(0);
