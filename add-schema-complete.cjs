const fs = require('fs');
const path = require('path');

const simulators = [
  {
    name: 'Simulateur de frais de notaire 2026',
    description: 'Simulateur gratuit permettant de calculer les frais de notaire dans l\'ancien ou le neuf selon les barèmes officiels 2026.',
    url: '/pages/frais-notaire',
    files: ['src/pages/notaire.html', 'src/pages/blog/frais-notaire-ancien-neuf-2026.html', 'src/pages/blog/frais-notaire-departements.html']
  },
  {
    name: 'Simulateur de prêt immobilier',
    description: 'Simulateur de crédit immobilier pour estimer mensualités, capacité d\'emprunt et coût total du financement.',
    url: '/pages/pret-immobilier',
    files: ['src/pages/pret.html']
  },
  {
    name: 'Simulateur de plus-value immobilière',
    description: 'Calculateur permettant d\'estimer l\'imposition sur la plus-value immobilière avec abattements légaux.',
    url: '/pages/plus-value-immobiliere',
    files: ['src/pages/plusvalue.html']
  },
  {
    name: 'Simulateur de charges de copropriété',
    description: 'Simulateur estimatif des charges annuelles de copropriété selon la surface et le nombre de lots.',
    url: '/pages/charges-copropriete',
    files: ['src/pages/charges.html']
  },
  {
    name: 'Simulateur APL CAF 2026',
    description: 'Simulateur APL gratuit permettant d\'estimer le montant de l\'aide au logement selon les règles CAF en vigueur.',
    url: '/pages/apl',
    files: ['src/pages/apl.html', 'src/pages/apl-dom-tom.html', 'src/pages/apl-etudiant.html']
  },
  {
    name: 'Simulateur RSA 2026',
    description: 'Simulateur du Revenu de Solidarité Active permettant d\'estimer vos droits selon votre situation.',
    url: '/pages/rsa',
    files: ['src/pages/rsa.html']
  },
  {
    name: 'Simulateur Prime d\'activité 2026',
    description: 'Calculateur de la prime d\'activité pour estimer le complément de revenu selon les règles en vigueur.',
    url: '/pages/prime-activite',
    files: ['src/pages/prime-activite.html']
  },
  {
    name: 'Simulateur AAH 2026',
    description: 'Simulateur de l\'Allocation aux Adultes Handicapés selon le taux d\'incapacité et les ressources.',
    url: '/pages/aah',
    files: ['src/pages/aah.html']
  },
  {
    name: 'Simulateur ASF 2026',
    description: 'Simulateur de l\'Allocation de Soutien Familial pour parents isolés ou orphelins.',
    url: '/pages/asf',
    files: ['src/pages/asf.html']
  },
  {
    name: 'Simulateur ARE France Travail 2026',
    description: 'Simulateur de l\'Allocation de Retour à l\'Emploi permettant d\'estimer vos indemnités chômage.',
    url: '/pages/are',
    files: ['src/pages/are.html']
  },
  {
    name: 'Simulateur de financement personnel',
    description: 'Calculateur de capacité de financement et de mensualités pour crédit à la consommation.',
    url: '/pages/financement-personnel',
    files: ['src/pages/financement.html']
  },
  {
    name: 'Simulateur d\'impôt sur le revenu 2026',
    description: 'Simulateur permettant d\'estimer l\'impôt sur le revenu selon votre situation fiscale.',
    url: '/pages/impot-revenu',
    files: ['src/pages/impot.html', 'src/pages/taxe.html']
  },
  {
    name: 'Calculateur salaire brut net 2026',
    description: 'Convertisseur de salaire brut en net avec estimation des cotisations.',
    url: '/pages/salaire-brut-net',
    files: ['src/pages/salaire.html', 'src/pages/salaire-seo.html']
  },
  {
    name: 'Simulateur de plus-value crypto',
    description: 'Calculateur de plus-value crypto avec imposition forfaitaire selon la réglementation française.',
    url: '/pages/crypto-plus-value',
    files: ['src/pages/crypto-bourse.html']
  },
  {
    name: 'Calculateur travail et rémunération',
    description: 'Simulateur de rémunération incluant heures supplémentaires et avantages professionnels.',
    url: '/pages/calculateur-travail',
    files: ['src/pages/travail.html']
  },
  {
    name: 'Simulateur IFI 2026',
    description: 'Simulateur de l\'impôt sur la fortune immobilière selon le patrimoine.',
    url: '/pages/isf-ifi',
    files: ['src/pages/ik.html']
  },
  {
    name: 'Simulateur taxe foncière',
    description: 'Simulateur de la taxe foncière selon la valeur locative cadastrale et la commune.',
    url: '/pages/taxe-fonciere',
    files: ['src/pages/taxe-fonciere.html']
  },
  {
    name: 'Simulateur taxe d\'habitation',
    description: 'Calculateur de la taxe d\'habitation selon la situation familiale et la localisation.',
    url: '/pages/taxe-habitation',
    files: ['src/pages/taxe.html']
  }
];

function getSoftwareSchema(name, description, url) {
  return `    <!-- Schema.org SoftwareApplication -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "${name}",
        "operatingSystem": "Web",
        "applicationCategory": "FinanceApplication",
        "description": "${description}",
        "url": "https://www.lescalculateurs.fr${url}",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        }
      }
    </script>`;
}

function getItemListSchema() {
  const items = simulators.map((sim, idx) => ({
    "@type": "ListItem",
    "position": idx + 1,
    "name": sim.name,
    "url": `https://www.lescalculateurs.fr${sim.url}`
  })).slice(0, 20);

  return `    <!-- Schema.org ItemList -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Simulateurs officiels 2026 - LesCalculateurs.fr",
        "description": "Collection de simulateurs gratuits et conformes aux barèmes officiels 2026 : immobilier, aides sociales, finances personnelles et impôts.",
        "itemListElement": ${JSON.stringify(items, null, 10).replace(/\n/g, '\n        ')}
      }
    </script>`;
}

function addSchemaToFile(filePath, schema, simulatorName) {
  if (!fs.existsSync(filePath)) {
    console.log('⊘ Fichier introuvable:', filePath);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has SoftwareApplication
  if (content.includes('"@type": "SoftwareApplication"')) {
    console.log('⊘ Déjà présent:', path.basename(filePath));
    return false;
  }

  // Insert before </head>
  if (content.includes('</head>')) {
    const newContent = content.replace('  </head>', schema + '\n  </head>');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('✓', path.basename(filePath), `-`, simulatorName);
    return true;
  }

  return false;
}

let count = 0;

// 1. Ajouter SoftwareApplication à tous les simulateurs
console.log('\n📱 AJOUT DES SCHEMAS SOFTWAREAPPLICATION\n');
simulators.forEach(sim => {
  const schema = getSoftwareSchema(sim.name, sim.description, sim.url);
  sim.files.forEach(file => {
    if (addSchemaToFile(file, schema, sim.name)) {
      count++;
    }
  });
});

// 2. Ajouter ItemList au hub
console.log('\n📋 AJOUT DU SCHEMA ITEMLIST AU HUB\n');
const hubFile = 'src/pages/simulateurs.html';
if (fs.existsSync(hubFile)) {
  const hubContent = fs.readFileSync(hubFile, 'utf-8');

  if (!hubContent.includes('"@type": "ItemList"')) {
    const itemListSchema = getItemListSchema();
    const newHubContent = hubContent.replace('  </head>', itemListSchema + '\n  </head>');
    fs.writeFileSync(hubFile, newHubContent, 'utf-8');
    console.log('✓ simulateurs.html - ItemList hub');
    count++;
  } else {
    console.log('⊘ ItemList déjà présent dans simulateurs.html');
  }
} else {
  console.log('⊘ Fichier introuvable: simulateurs.html');
}

console.log(`\n✅ ${count} modification(s) effectuée(s)`);
