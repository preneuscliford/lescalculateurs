const fs = require('fs');
const path = require('path');

// Configuration des URLs officielles par page
const pageConfig = {
  'salaire.html': { url: 'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-particuliers.html', organisme: 'URSSAF' },
  'impot.html': { url: 'https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm', organisme: 'impots.gouv.fr' },
  'notaire.html': { url: 'https://www.immobilier.notaires.fr/fr/frais-de-notaire', organisme: 'notaires.fr' },
  'pret.html': { url: 'https://www.banque-france.fr/fr/les-taux-monetaires-directeurs', organisme: 'Banque de France' },
  'plusvalue.html': { url: 'https://www.service-public.fr/particuliers/vosdroits/F10864', organisme: 'service-public.fr' },
  'apl.html': { url: 'https://www.caf.fr', organisme: 'CAF' },
  'rsa.html': { url: 'https://www.caf.fr', organisme: 'CAF' },
  'prime-activite.html': { url: 'https://www.caf.fr', organisme: 'CAF' },
  'are.html': { url: 'https://www.caf.fr', organisme: 'CAF' },
  'asf.html': { url: 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/famille/l-allocation-de-soutien-familial-asf', organisme: 'CAF' }
};

// Template de la nouvelle navigation
function createNewNav(config) {
  return `    <div class="sticky-ymyl" role="alert" style="position:sticky;top:0;z-index:9999;background:#fff3cd;border:1px solid #ffc107;padding:8px 12px;text-align:center;font-size:13px;">
      <strong>⚠️ Estimation indicative.</strong> 
      <span class="hidden sm:inline">Montant définitif sur </span>
      <a href="${config.url}" target="_blank" rel="noopener" style="color:#856404;text-decoration:underline;font-weight:bold;">${config.organisme}</a>
      <span class="hidden md:inline"> | <a href="/pages/historique-mises-a-jour" style="color:#856404;text-decoration:underline;">🔄 Historique</a></span>
    </div>

    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <!-- Logo -->
          <a href="/" class="flex items-center space-x-2">
            <img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs" class="h-8 w-auto">
            <span class="font-bold text-gray-900 hidden sm:block">Les Calculateurs</span>
          </a>
          
          <!-- Nav Desktop -->
          <nav class="hidden md:flex items-center space-x-4 text-sm">
            <a href="/" class="text-gray-600 hover:text-blue-600">🏠 Accueil</a>
            <a href="/pages/simulateurs.html" class="text-gray-600 hover:text-blue-600">🎯 Outils</a>
            <a href="/pages/methodologie.html" class="hidden lg:block text-gray-600 hover:text-blue-600">📚 Méthodo</a>
            <a href="/pages/historique-mises-a-jour" class="hidden xl:block text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded">🔄 Màj 12/02</a>
          </nav>

          <!-- Mobile menu button -->
          <button id="mobile-menu-btn" class="md:hidden text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden py-2 border-t">
          <nav class="flex flex-col space-y-2 text-sm">
            <a href="/" class="text-gray-600 hover:text-blue-600 py-1">🏠 Accueil</a>
            <a href="/pages/simulateurs.html" class="text-gray-600 hover:text-blue-600 py-1">🎯 Simulateurs</a>
            <a href="/pages/methodologie.html" class="text-gray-600 hover:text-blue-600 py-1">📚 Méthodologie</a>
            <a href="/pages/historique-mises-a-jour" class="text-blue-600 hover:text-blue-800 font-medium py-1 bg-blue-50 rounded px-2">🔄 Mises à jour</a>
          </nav>
        </div>
      </div>
    </header>`;
}

// Script pour le toggle du menu mobile
const mobileMenuScript = `
    <!-- Mobile Menu Toggle Script -->
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

// Fonction pour trouver et remplacer la section header/nav
function replaceNavigation(content, pageName, config) {
  const newNav = createNewNav(config);
  
  let newContent = content;
  let replaced = false;
  
  // Pattern pour trouver sticky-ymyl suivi d'un header
  const ymylHeaderPattern = /<div class="sticky-ymyl"[^>]*>[\s\S]*?<\/div>\s*<header[^>]*>[\s\S]*?<\/header>/i;
  
  // Pattern pour trouver un nav avec bg-white sticky
  const navPattern = /<nav class="bg-white[^"]*sticky[^"]*"[^>]*>[\s\S]*?<\/nav>/i;
  
  // Pattern pour sticky-ymyl suivi de nav
  const ymylNavPattern = /<div class="sticky-ymyl"[^>]*>[\s\S]*?<\/div>\s*<nav[^>]*>[\s\S]*?<\/nav>/i;
  
  // Pattern header simple
  const headerPattern = /<header class="bg-white[^"]*"[^>]*>[\s\S]*?<\/header>/i;
  
  if (ymylHeaderPattern.test(content)) {
    newContent = content.replace(ymylHeaderPattern, newNav);
    replaced = true;
  } else if (ymylNavPattern.test(content)) {
    newContent = content.replace(ymylNavPattern, newNav);
    replaced = true;
  } else if (navPattern.test(content)) {
    newContent = content.replace(navPattern, newNav);
    replaced = true;
  } else if (headerPattern.test(content)) {
    newContent = content.replace(headerPattern, newNav);
    replaced = true;
  }
  
  // Ajouter le script du menu mobile avant </body> si pas déjà présent et si on a remplacé
  if (replaced && !newContent.includes('mobile-menu-btn') && newContent.includes('</body>')) {
    // Le script sera injecté via le HTML, pas besoin de l'ajouter séparément
    // car il est inline dans le bouton avec onclick
  }
  
  return { content: newContent, replaced };
}

// Traiter chaque page
for (const [page, config] of Object.entries(pageConfig)) {
  const filePath = path.join(pagesDir, page);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log('✗ Fichier non trouvé: ' + page);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    const result = replaceNavigation(content, page, config);
    
    if (result.replaced) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
      console.log('✓ Modifié: ' + page);
      modifiedCount++;
    } else {
      console.log('⚠ Pattern non trouvé: ' + page);
    }
  } catch (err) {
    console.log('✗ Erreur ' + page + ': ' + err.message);
  }
}

console.log('\n=== RÉSULTAT ===');
console.log('Pages modifiées: ' + modifiedCount + '/' + Object.keys(pageConfig).length);
process.exit(0);
