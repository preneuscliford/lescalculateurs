/**
 * Script de correction des bandeaux YMYL
 * - Supprime le bandeau des pages hub (simulateurs, aide, blog)
 * - Corrige les liens vers les services appropriés selon le type de calculateur
 *
 * Usage: node scripts/fix-ymyl-banners.cjs [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");

// Configuration des pages hub (sans bandeau)
const HUB_PAGES = [
  "simulateurs.html",
  "simulateurs/index.html",
  "aide/index.html",
  "blog.html",
];

// Configuration des services par type de calculateur
// URLs extraites de pages/sources.html
const SERVICE_CONFIG = {
  // Aides sociales CAF
  apl: {
    url: "https://www.caf.fr/allocataires/aides-et-demarches/mes-demarches",
    label: "CAF",
    linkText: "simulateur officiel",
  },
  rsa: {
    url: "https://www.service-public.fr/particuliers/vosdroits/R558",
    label: "CAF",
    linkText: "simulateur officiel",
  },
  "prime-activite": {
    url: "https://www.service-public.fr/particuliers/vosdroits/R54933",
    label: "CAF",
    linkText: "simulateur officiel",
  },
  aah: {
    url: "https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/handicap/l-allocation-aux-adultes-handicapes-aah",
    label: "CAF",
    linkText: "infos officielles",
  },
  asf: {
    url: "https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/famille/l-allocation-de-soutien-familial-asf",
    label: "CAF",
    linkText: "infos officielles",
  },

  // France Travail (chômage)
  are: {
    url: "https://www.service-public.fr/particuliers/vosdroits/R17654",
    label: "France Travail",
    linkText: "simulateur officiel",
  },

  // Impôts
  impot: {
    url: "https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm",
    label: "impots.gouv.fr",
    linkText: "simulateur officiel",
  },
  salaire: {
    url: "https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-particuliers.html",
    label: "URSSAF",
    linkText: "barèmes officiels",
  },
  taxe: {
    url: "https://www.impots.gouv.fr/particulier/taxe-fonciere",
    label: "impots.gouv.fr",
    linkText: "infos officielles",
  },
  "taxe-fonciere": {
    url: "https://www.impots.gouv.fr/particulier/taxe-fonciere",
    label: "impots.gouv.fr",
    linkText: "infos officielles",
  },

  // Indemnités kilométriques (fiscal)
  ik: {
    url: "https://www.service-public.fr/particuliers/vosdroits/F1989",
    label: "service-public.fr",
    linkText: "barème officiel",
  },

  // Travail / heures supplémentaires
  travail: {
    url: "https://www.service-public.fr/particuliers/vosdroits/F489",
    label: "service-public.fr",
    linkText: "infos officielles",
  },

  // Crypto / Bourse (fiscalité)
  crypto: {
    url: "https://www.impots.gouv.fr/particulier/je-calcule-mes-impots",
    label: "impots.gouv.fr",
    linkText: "infos fiscales",
  },
  "crypto-bourse": {
    url: "https://www.impots.gouv.fr/particulier/je-calcule-mes-impots",
    label: "impots.gouv.fr",
    linkText: "infos fiscales",
  },

  // Prêt immobilier
  pret: {
    url: "https://www.banque-france.fr/fr/les-taux-monetaires-directeurs",
    label: "Banque de France",
    linkText: "taux en vigueur",
  },

  // Financement personnel / crédit conso
  financement: {
    url: "https://www.banque-france.fr/fr/les-taux-monetaires-directeurs",
    label: "Banque de France",
    linkText: "taux en vigueur",
  },

  // Charges copropriété
  charges: {
    url: "https://www.service-public.fr/particuliers/vosdroits/F2613",
    label: "service-public.fr",
    linkText: "infos officielles",
  },

  // Notaire / Immobilier
  notaire: {
    url: "https://www.immobilier.notaires.fr/fr/frais-de-notaire",
    label: "notaires.fr",
    linkText: "simulateur officiel",
  },
  "frais-notaire": {
    url: "https://www.immobilier.notaires.fr/fr/frais-de-notaire",
    label: "notaires.fr",
    linkText: "simulateur officiel",
  },
  plusvalue: {
    url: "https://www.service-public.fr/particuliers/vosdroits/F10864",
    label: "service-public.fr",
    linkText: "infos officielles",
  },
};

// Regex pour détecter le bandeau sticky-ymyl
const YMYL_BANNER_REGEX = /<div class="sticky-ymyl"[^>]*>[\s\S]*?<\/div>\n?/g;

/**
 * Génère le HTML du bandeau YMYL approprié
 * Note: Pas de mention "simulateur officiel" car nous ne sommes pas un organisme officiel
 */
function generateBanner(config) {
  return `<div class="sticky-ymyl" role="alert" style="position:sticky;top:0;z-index:9999;background:#fff3cd;border:1px solid #ffc107;padding:12px 16px;text-align:center;font-size:14px;"><strong>⚠️ Estimation indicative.</strong> Montant définitif sur <a href="${config.url}" target="_blank" rel="noopener" style="color:#856404;text-decoration:underline;font-weight:bold;">${config.label}</a>.</div>`;
}

/**
 * Détermine le service approprié basé sur le chemin du fichier
 */
function getServiceConfig(filePath) {
  const relativePath = path.relative(
    path.join(__dirname, "..", "src", "pages"),
    filePath,
  );
  const fileName = path.basename(filePath, ".html");
  const dirName = path.dirname(relativePath).split(path.sep)[0];

  // Priorité : nom du répertoire parent, puis nom du fichier
  const key = dirName !== "." ? dirName : fileName;

  // Correspondances spéciales
  if (fileName.includes("crypto") || dirName === "crypto-bourse") {
    return SERVICE_CONFIG["crypto-bourse"];
  }
  if (fileName.includes("apl") || dirName === "apl") {
    return SERVICE_CONFIG["apl"];
  }
  if (
    fileName.includes("notaire") ||
    fileName.includes("frais-notaire") ||
    dirName === "notaire"
  ) {
    return SERVICE_CONFIG["notaire"];
  }

  // Correspondance directe
  return SERVICE_CONFIG[key] || SERVICE_CONFIG[fileName];
}

/**
 * Vérifie si c'est une page hub
 */
function isHubPage(filePath) {
  const relativePath = path.relative(
    path.join(__dirname, "..", "src", "pages"),
    filePath,
  );
  return HUB_PAGES.some((hub) => relativePath.replace(/\\/g, "/") === hub);
}

/**
 * Traite un fichier HTML
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  const relativePath = path.relative(
    path.join(__dirname, "..", "src", "pages"),
    filePath,
  );

  // Vérifie si le fichier contient un bandeau
  const hasBanner = YMYL_BANNER_REGEX.test(content);
  YMYL_BANNER_REGEX.lastIndex = 0; // Reset regex

  if (!hasBanner) {
    return { file: relativePath, action: "skip", reason: "no-banner" };
  }

  // Page hub : supprimer le bandeau
  if (isHubPage(filePath)) {
    content = content.replace(YMYL_BANNER_REGEX, "");

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, "utf8");
    }

    return {
      file: relativePath,
      action: "removed",
      reason: "hub-page",
    };
  }

  // Page calculateur : vérifier/corriger le service
  const config = getServiceConfig(filePath);

  if (!config) {
    return {
      file: relativePath,
      action: "skip",
      reason: "no-config",
    };
  }

  // Extraire le bandeau actuel
  const currentBannerMatch = content.match(YMYL_BANNER_REGEX);
  if (!currentBannerMatch) {
    return { file: relativePath, action: "skip", reason: "no-banner" };
  }

  const currentBanner = currentBannerMatch[0];
  const newBanner = generateBanner(config);

  // Vérifier si le bandeau est déjà correct
  if (
    currentBanner.includes(config.url) &&
    currentBanner.includes(config.label)
  ) {
    return {
      file: relativePath,
      action: "skip",
      reason: "already-correct",
      service: config.label,
    };
  }

  // Remplacer le bandeau
  content = content.replace(YMYL_BANNER_REGEX, newBanner + "\n");

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, "utf8");
  }

  return {
    file: relativePath,
    action: "updated",
    oldService: extractServiceFromBanner(currentBanner),
    newService: config.label,
    newUrl: config.url,
  };
}

/**
 * Extrait le service du bandeau actuel
 */
function extractServiceFromBanner(banner) {
  const match = banner.match(/font-weight:bold;">([^<]+)<\/a>/);
  return match ? match[1] : "unknown";
}

/**
 * Parcourt récursivement les fichiers HTML
 */
function walkDir(dir, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, results);
    } else if (file.endsWith(".html")) {
      results.push(filePath);
    }
  }

  return results;
}

// Main
console.log("🔧 Correction des bandeaux YMYL");
console.log(
  DRY_RUN ? "   Mode: DRY RUN (aucune modification)\n" : "   Mode: WRITE\n",
);

const pagesDir = path.join(__dirname, "..", "src", "pages");
const htmlFiles = walkDir(pagesDir);

const results = {
  removed: [],
  updated: [],
  skipped: [],
  errors: [],
};

for (const file of htmlFiles) {
  try {
    const result = processFile(file);

    switch (result.action) {
      case "removed":
        results.removed.push(result);
        break;
      case "updated":
        results.updated.push(result);
        break;
      case "skip":
        results.skipped.push(result);
        break;
    }
  } catch (error) {
    results.errors.push({ file, error: error.message });
  }
}

// Affichage des résultats
console.log("📋 RÉSULTATS\n");

if (results.removed.length > 0) {
  console.log(`🗑️  Bandeaux SUPPRIMÉS (pages hub): ${results.removed.length}`);
  results.removed.forEach((r) => console.log(`   - ${r.file}`));
  console.log();
}

if (results.updated.length > 0) {
  console.log(`✏️  Bandeaux CORRIGÉS: ${results.updated.length}`);
  results.updated.forEach((r) => {
    console.log(`   - ${r.file}`);
    console.log(`     ${r.oldService} → ${r.newService}`);
  });
  console.log();
}

if (results.errors.length > 0) {
  console.log(`❌ ERREURS: ${results.errors.length}`);
  results.errors.forEach((r) => console.log(`   - ${r.file}: ${r.error}`));
  console.log();
}

// Résumé
console.log("📊 RÉSUMÉ");
console.log(`   Total fichiers analysés: ${htmlFiles.length}`);
console.log(`   Bandeaux supprimés: ${results.removed.length}`);
console.log(`   Bandeaux corrigés: ${results.updated.length}`);
console.log(`   Fichiers ignorés: ${results.skipped.length}`);
console.log(`   Erreurs: ${results.errors.length}`);

if (DRY_RUN) {
  console.log(
    "\n⚠️  Mode DRY RUN - Relancez sans --dry-run pour appliquer les modifications",
  );
}
