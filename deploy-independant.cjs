/**
 * Deploy Independant - Copie les fichiers nettoyes vers src/pages
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'src/pages_INDEPENDANT';
const DEST_DIR = 'src/pages';

let copied = 0;
let errors = 0;

function copyRecursive(src, dest) {
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyRecursive(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      } catch (e) {
        console.error('❌', item, e.message);
        errors++;
      }
    }
  }
}

console.log('🚀 Déploiement fichiers nettoyés...\n');
copyRecursive(SOURCE_DIR, DEST_DIR);

console.log('\n' + '='.repeat(50));
console.log('📊 DÉPLOIEMENT TERMINÉ');
console.log('='.repeat(50));
console.log('Fichiers copiés:', copied);
console.log('Erreurs:', errors);
console.log('✅ Terminé !');
