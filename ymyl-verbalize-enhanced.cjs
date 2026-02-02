/**
 * YMYL Enhanced Verbalization - Ajoute script global pour verbaliser les montants dynamiques
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'pages_YMYL_FINAL'; // Reprendre depuis l'etape precedente
const TARGET_DIR = 'pages_YMYL_FINAL_V2';

// Creer dossiers
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const verbalizeScript = `
<!-- YMYL Verbalization Script -->
<script>
(function() {
  'use strict';
  
  // Configuration par type
  const CONFIG = {
    APL: { source: 'CAF', url: 'https://www.caf.fr' },
    IMPOT: { source: 'impots.gouv.fr', url: 'https://www.impots.gouv.fr' },
    NOTAIRE: { source: 'notaires.fr', url: 'https://www.notaires.fr' },
    RSA: { source: 'CAF', url: 'https://www.caf.fr' },
    PRIME: { source: 'CAF', url: 'https://www.caf.fr' },
    IK: { source: 'impots.gouv.fr', url: 'https://www.impots.gouv.fr' },
    SALAIRE: { source: 'officiel', url: 'https://www.impots.gouv.fr' },
    PRET: { source: 'banque', url: '#' },
    TAXE: { source: 'impots.gouv.fr', url: 'https://www.impots.gouv.fr' },
    PLUSVALUE: { source: 'notaire', url: 'https://www.notaires.fr' }
  };
  
  // Detecter le type de simulateur
  function detectType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('apl')) return 'APL';
    if (path.includes('impot')) return 'IMPOT';
    if (path.includes('notaire')) return 'NOTAIRE';
    if (path.includes('rsa')) return 'RSA';
    if (path.includes('prime')) return 'PRIME';
    if (path.includes('ik') || path.includes('kilometrique')) return 'IK';
    if (path.includes('salaire')) return 'SALAIRE';
    if (path.includes('pret')) return 'PRET';
    if (path.includes('taxe')) return 'TAXE';
    if (path.includes('plus-value')) return 'PLUSVALUE';
    return 'GENERIC';
  }
  
  // Verbaliser un montant
  function verbalize(value) {
    const num = parseInt(value);
    if (isNaN(num) || num < 10) return value;
    const rounded = Math.round(num / 10) * 10;
    return 'environ ' + rounded + ' €';
  }
  
  // Traiter un element
  function processElement(el, type) {
    const text = el.textContent || el.innerText || '';
    const match = text.match(/(\d[\d\s]{2,5})\s*€/);
    if (!match) return;
    
    const exactVal = match[1].replace(/\s/g, '');
    const verbalVal = verbalize(exactVal);
    const config = CONFIG[type] || CONFIG.GENERIC;
    
    // Remplacer contenu
    el.innerHTML = '<span class="ymyl-verbal" style="color:inherit;">' + verbalVal + '</span>' +
                   '<span class="ymyl-exact" style="display:none;">' + exactVal + ' €</span>' +
                   '<small style="display:block;color:#666;font-size:0.8em;margin-top:2px;">valeur indicative – voir ' + config.source + ' pour montant exact</small>';
  }
  
  // Observer les changements DOM
  const observer = new MutationObserver(function(mutations) {
    const type = detectType();
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element
          // Chercher dans les resultats
          const results = node.querySelectorAll ? 
            node.querySelectorAll('.result, .montant, [class*="result"], [class*="montant"], output, .calculator-result, #calculator-result') : [];
          results.forEach(function(el) {
            if (el.textContent.includes('€')) {
              processElement(el, type);
            }
          });
        }
      });
    });
  });
  
  // Demarrer observation
  document.addEventListener('DOMContentLoaded', function() {
    const type = detectType();
    
    // Traiter elements existants
    document.querySelectorAll('.result, .montant, [class*="result"], [class*="montant"], output, .calculator-result, #calculator-result, strong, span').forEach(function(el) {
      if (el.textContent.match(/\d{3,6}\s*€/)) {
        processElement(el, type);
      }
    });
    
    // Observer nouveaux elements
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
</script>
`;

// Copier et ajouter script
const walkDir = (dir, relativeDir = '') => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(relativeDir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const targetDir = path.join(TARGET_DIR, relativePath);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      walkDir(fullPath, relativePath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Ajouter script avant </body> si pas deja present
      if (!content.includes('YMYL Verbalization Script') && content.includes('</body>')) {
        content = content.replace('</body>', verbalizeScript + '\n</body>');
      }
      
      const targetPath = path.join(TARGET_DIR, relativePath);
      fs.writeFileSync(targetPath, content, 'utf-8');
    }
  }
};

console.log('🚀 Ajout du script de verbalisation dynamique...\n');
walkDir(SOURCE_DIR);
console.log('✅ Termine ! Fichiers dans pages_YMYL_FINAL_V2/');
