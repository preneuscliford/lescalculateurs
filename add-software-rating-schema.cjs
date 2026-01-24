const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';

// Mapping des fichiers avec leurs noms
const fileNames = {
  'apl': 'Simulateur APL CAF 2026',
  'pret': 'Calculateur Prêt Immobilier',
  'salaire': 'Calculateur Salaire Net',
  'taxe': 'Calculateur Impôt sur le Revenu',
  'ik': 'Simulateur Impôt sur la Fortune',
  'rsa': 'Calculateur RSA 2026',
  'plusvalue': 'Calculateur Plus-value Immobilière',
  'are': 'Calculateur ARE Allocation Chômage',
  'asf': 'Simulateur Allocation Spéciale Fonds',
  'prime-activite': 'Calculateur Prime d\'Activité',
  'charges': 'Calculateur Charges Locatives',
  'impot': 'Calculateur Impôt sur le Revenu'
};

function getAppName(fileName) {
  for (const [key, value] of Object.entries(fileNames)) {
    if (fileName.includes(key)) return value;
  }
  return 'Calculateur LesCalculateurs.fr';
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.html') && !['simulateurs.html', 'blog.html', 'sources.html', 'methodologie.html'].includes(file)) {
      callback(filePath);
    }
  });
}

let count = 0;

walkDir(pagesDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has SoftwareApplication
  if (content.includes('"@type": "SoftwareApplication"')) {
    console.log('⊘ Déjà présent:', path.basename(filePath));
    return;
  }
  
  const fileName = path.basename(filePath, '.html');
  const appName = getAppName(fileName);
  const url = `https://www.lescalculateurs.fr/pages/${fileName}`;
  
  const schema = `    <!-- Schema.org SoftwareApplication -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "${appName}",
        "operatingSystem": "Web",
        "applicationCategory": "FinanceApplication",
        "description": "Outil de calcul gratuit et fiable pour estimer vos droits et obligations financières. Simulation rapide et indicative.",
        "url": "${url}",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        }
      }
    </script>`;
  
  // Insert before </head>
  const newContent = content.replace('  </head>', schema + '\n  </head>');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('✓', path.basename(filePath));
    count++;
  }
});

console.log(`\n${count} fichier(s) mis à jour`);
