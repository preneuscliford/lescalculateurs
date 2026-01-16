#!/usr/bin/env node
/*
  Génération des 101 pages Taxe Foncière par département
  
  Usage:
    node scripts/generate-taxe-fonciere-pages-deepseek.cjs       # dry-run
    node scripts/generate-taxe-fonciere-pages-deepseek.cjs --run # appel API DeepSeek réel
    node scripts/generate-taxe-fonciere-pages-deepseek.cjs --run --only=75  # test sur dept 75

  Notes:
  - Lit src/data/taxe-fonciere-departements.json (101 depts)
  - Charge prompt depuis scripts/deepseek-master-prompt-taxe-fonciere.txt
  - Mode dry-run: écrit payloads dans reports/deepseek-requests-taxe/
  - Mode --run: appelle API DeepSeek + génère HTML
*/

const fs = require("fs");
const path = require("path");
const { setTimeout: wait } = require("timers/promises");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapInTemplate(content, depName, code) {
  // Full page structure pour pages taxe-fonciere
  const assets = `<script type="module" src="../../../main.ts"></script>`;

  const title = `Taxe Foncière en ${depName} (${code}) 2025 - Calcul et Simulation Gratuit`;
  const description = `Calculez votre taxe foncière en ${depName} avec notre simulateur gratuit. Montants moyens, taux, exemples concrets et explications complètes pour le département ${code}.`;
  const keywords = `taxe foncière ${depName.toLowerCase()}, simulation taxe ${code}, montant moyen ${depName}, calcul taxe foncière 2025, taux ${depName}`;
  const canonical = `https://lescalculateurs.fr/pages/taxe-fonciere/${depName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}-${code}`;

  // Hero image
  const localHero = `/assets/hero-taxe-${code}.jpg`;
  const unsplash = `https://source.unsplash.com/1200x675/?${encodeURIComponent(
    depName + " france"
  )}`;
  const heroHtml = `
    <figure class="rounded-lg overflow-hidden border border-gray-200 mb-8">
      <img src="${localHero}"
        onerror="this.onerror=null;this.src='${unsplash}'"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 960px, 1200px"
        alt="Taxe Foncière — ${escapeHtml(depName)} (${code})"
        width="1200" height="675"
        loading="eager" fetchpriority="high" decoding="async"
        class="w-full h-auto object-cover" />
      <figcaption class="text-sm text-gray-500 px-4 py-2">Guide complet taxe foncière ${escapeHtml(
        depName
      )}. Source : LesCalculateurs.fr</figcaption>
    </figure>`;

  const contentWithHero = content.includes("<figure")
    ? content
    : heroHtml + content;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="author" content="LesCalculateurs.fr" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />

    <!-- SEO & Social -->
    <link rel="canonical" href="${canonical}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="https://lescalculateurs.fr/assets/favicon-32x32.png" />

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${escapeHtml(title)}",
      "description": "${escapeHtml(description)}",
      "author": {"@type": "Organization", "name": "LesCalculateurs.fr"},
      "datePublished": "${new Date().toISOString().split("T")[0]}",
      "inLanguage": "fr"
    }
    </script>

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399" crossorigin="anonymous"></script>

    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TPFZCGX5');</script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2HNTGCYQ1X"></script>
    <script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-2HNTGCYQ1X');</script>

    <!-- Assets -->
    ${assets}
  </head>
  <body class="bg-gray-50">
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPFZCGX5" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <img src="/logo.svg" alt="LesCalculateurs.fr" class="w-8 h-8" />
            <a href="/pages/taxe-fonciere" class="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>← Taxe Foncière</span>
            </a>
          </div>
          <a href="/index.html" class="text-sm text-gray-600 hover:text-gray-900">Accueil</a>
        </div>
      </div>
    </header>

    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      ${contentWithHero}
    </article>

    <footer class="bg-gray-900 text-gray-300 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p>&copy; ${new Date().getFullYear()} LesCalculateurs.fr - Tous droits réservés</p>
      </div>
    </footer>
  </body>
</html>`;
}

const root = path.resolve(__dirname, "..");
const DATA_FILE = path.join(
  root,
  "src",
  "data",
  "taxe-fonciere-departements.json"
);
const PROMPT_FILE = path.join(
  __dirname,
  "deepseek-master-prompt-taxe-fonciere.txt"
);
const REQUESTS_DIR = path.join(root, "reports", "deepseek-requests-taxe");
const PAGES_DIR = path.join(
  root,
  "src",
  "pages",
  "taxe-fonciere",
  "departements"
);

function readEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return process.env;
  const txt = fs.readFileSync(envPath, "utf8");
  txt.split(/\r?\n/).forEach((line) => {
    const m = /^([^=]+)=(.*)$/.exec(line);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
  return process.env;
}

readEnv();

const DRY = !process.argv.includes("--run");
const API_URL =
  process.env.DEEPSEEK_API_URL ||
  "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || null;

if (!fs.existsSync(DATA_FILE)) {
  console.error("❌ Manquant:", DATA_FILE);
  process.exit(1);
}

if (!fs.existsSync(PROMPT_FILE)) {
  console.error("❌ Manquant:", PROMPT_FILE);
  process.exit(1);
}

const masterPromptTemplate = fs.readFileSync(PROMPT_FILE, "utf8");
const deptData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

// Filter si --only=CODE
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
let depts = Object.values(deptData.departements);
if (onlyArg) {
  const code = onlyArg.split("=")[1];
  depts = depts.filter((d) => d.code === code);
  console.log(`🎯 Filtré sur département: ${code}`);
}

fs.mkdirSync(REQUESTS_DIR, { recursive: true });
fs.mkdirSync(PAGES_DIR, { recursive: true });

async function callDeepSeek(payload) {
  if (DRY) return { dry: true };
  if (!API_KEY) throw new Error("❌ DEEPSEEK_API_KEY not set in .env");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HTTP ${response.status}: ${err}`);
    }

    return await response.json();
  } catch (e) {
    console.error(`❌ API Error:`, e.message);
    throw e;
  }
}

async function generateArticles() {
  console.log(`\n📄 Génération ${depts.length} articles taxe foncière...\n`);

  for (let i = 0; i < depts.length; i++) {
    const dept = depts[i];
    const slug = dept.nom.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `${slug}-${dept.code}.html`;

    // Remplacer le JSON input dans le prompt
    const deptJSON = JSON.stringify(dept, null, 2);
    const userPrompt = masterPromptTemplate.replace("{JSON_INPUT}", deptJSON);

    // Construire payload DeepSeek
    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert fiscal français générant des articles SEO uniques sur la taxe foncière par département. Chaque article doit être unique et spécifique au département. Pas de template générique.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    // Mode dry-run: sauver payload
    if (DRY) {
      const payloadPath = path.join(REQUESTS_DIR, `${slug}-${dept.code}.json`);
      fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));
      console.log(`  ✅ Payload généré: ${filename}`);
    } else {
      // Mode réel: appeler API
      try {
        console.log(
          `  🔄 [${i + 1}/${depts.length}] Génération ${dept.nom} (${
            dept.code
          })...`
        );

        const response = await callDeepSeek(payload);

        if (!response.choices || !response.choices[0]) {
          console.error(`    ❌ Réponse vide`);
          continue;
        }

        const content = response.choices[0].message.content;

        // Wrapper en template HTML complet
        const fullHtml = wrapInTemplate(content, dept.nom, dept.code);

        // Sauver la page HTML
        const outputPath = path.join(PAGES_DIR, filename);
        fs.writeFileSync(outputPath, fullHtml);

        console.log(`    ✅ ${filename} généré`);

        // Délai entre appels (respecter rate limits)
        if (i < depts.length - 1) {
          await wait(1500);
        }
      } catch (e) {
        console.error(`    ❌ Erreur: ${e.message}`);
        continue;
      }
    }
  }

  console.log(`\n${DRY ? "✅ Payloads générés" : "✅ Articles générés"}!`);
  console.log(`📍 Sortie: ${DRY ? REQUESTS_DIR : PAGES_DIR}`);
}

generateArticles().catch((e) => {
  console.error("💥 Erreur:", e);
  process.exit(1);
});
