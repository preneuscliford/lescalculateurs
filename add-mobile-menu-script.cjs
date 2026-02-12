const fs = require('fs');
const path = require('path');

const pages = [
  'salaire.html', 'impot.html', 'notaire.html', 'pret.html', 'plusvalue.html',
  'apl.html', 'rsa.html', 'prime-activite.html', 'are.html', 'asf.html'
];

const mobileMenuScript = `<!-- Mobile Menu Toggle Script -->
<script>
  (function() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', function() {
        menu.classList.toggle('hidden');
      });
    }
  })();
</script>`;

const pagesDir = 'src/pages';
let modifiedCount = 0;

for (const page of pages) {
  const filePath = path.join(pagesDir, page);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log('✗ Fichier non trouvé: ' + page);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Vérifier si le script est déjà présent
    if (content.includes('mobile-menu-btn') && content.includes('addEventListener')) {
      console.log('ℹ Script déjà présent: ' + page);
      continue;
    }
    
    // Ajouter le script avant </body>
    if (content.includes('</body>')) {
      content = content.replace('</body>', mobileMenuScript + '\n</body>');
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('✓ Script ajouté: ' + page);
      modifiedCount++;
    } else {
      console.log('⚠ Tag </body> non trouvé: ' + page);
    }
  } catch (err) {
    console.log('✗ Erreur ' + page + ': ' + err.message);
  }
}

console.log('\n=== RÉSULTAT ===');
console.log('Scripts ajoutés: ' + modifiedCount + '/' + pages.length);
process.exit(0);
