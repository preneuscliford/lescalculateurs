#!/usr/bin/env node
/*
  Usage:
    node scripts/generate-department-pages-deepseek.cjs       # dry-run, writes request payloads to reports/deepseek-requests/
    node scripts/generate-department-pages-deepseek.cjs --run # actually call DeepSeek API (requires DEEPSEEK_API_KEY in .env)

  Notes:
  - Script reads `reports/duplication-fuzzy-clean.json` for department list.
  - It loads the master prompt from `scripts/deepseek-master-prompt.txt` and injects the input JSON per department.
  - Dry-run mode writes per-department payloads to `reports/deepseek-requests/` instead of sending them.
  - When using `--run`, the script expects `DEEPSEEK_API_KEY` set in the environment or in `.env` in project root.
*/

const fs = require("fs");
const path = require("path");
const { setTimeout: wait } = require("timers/promises");
const {
  generateFinalArticle,
  addTailwindClasses,
} = require("./cleanAndGenerate.cjs");
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapInTemplate(content, depName, code) {
  // Full page structure matching the project's page pattern
  const assets = `<script type="module" src="../../../main.ts"></script>`;
  const styledContent =
    typeof addTailwindClasses === "function"
      ? addTailwindClasses(content)
      : content;

  const title = `🧾 Frais de notaire 2025 ${depName} (${code}) - Simulateur gratuit`;
  const description = `Calculez vos frais de notaire 2025 en ${depName} (${code}). Tableau comparatif ancien/neuf, exemples concrets et simulateur officiel gratuit.`;
  const keywords = `frais notaire ${depName}, simulateur frais notaire ${code}, calcul frais notaire 2025, achat immobilier ${depName}, notaire ${depName}`;
  const canonical = `https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${code}.html`;

  // Hero image: prefer a local asset (if provided in /assets), otherwise fallback to Unsplash via onerror
  const localHero = `/assets/hero-${code}.jpg`;
  const unsplash = `https://source.unsplash.com/1200x675/?${encodeURIComponent(
    depName
  )}`;
  const heroHtml = `
    <figure class="rounded-lg overflow-hidden border border-gray-200 mb-8">
      <img src="${localHero}"
        onerror="this.onerror=null;this.src='${unsplash}'"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 960px, 1200px"
        alt="Guide frais de notaire — ${escapeHtml(depName)} (${code})"
        width="1200" height="675"
        loading="eager" fetchpriority="high" decoding="async"
        class="w-full h-auto object-cover" />
      <figcaption class="text-sm text-gray-500 px-4 py-2">Image illustrative du département ${escapeHtml(
        depName
      )}. Source : Unsplash / Commons.</figcaption>
    </figure>`;

  const contentWithHero = styledContent.includes("<figure")
    ? styledContent
    : heroHtml + styledContent;

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

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399" crossorigin="anonymous"></script>

    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-TPFZCGX5');</script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2HNTGCYQ1X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} 
      gtag('js', new Date());
      gtag('config', 'G-2HNTGCYQ1X');
    </script>

    <!-- Assets (dev/prod) -->
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
            <a href="/pages/blog.html" class="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>← Blog</span>
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
const CLEAN = path.join(root, "reports", "duplication-fuzzy-clean.json");
const PROMPT_FILE = path.join(__dirname, "deepseek-master-prompt.txt");
const OUT_DIR = path.join(root, "reports", "deepseek-requests");
const PAGES_DIR = path.join(root, "src", "pages", "blog", "departements");

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

if (!fs.existsSync(CLEAN)) {
  console.error("Missing", CLEAN);
  process.exit(2);
}

const masterPromptTemplate = fs.readFileSync(PROMPT_FILE, "utf8");
let clean = JSON.parse(fs.readFileSync(CLEAN, "utf8"));

// Optional: allow running only for a specific department code with --only=01
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
if (onlyArg) {
  const onlyCode = onlyArg.split("=")[1];
  if (onlyCode) {
    clean = clean.filter((item) => {
      const code = String(item.code || "").toUpperCase();
      return code === String(onlyCode).toUpperCase();
    });
    console.log("Filtered to only department:", onlyCode);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(PAGES_DIR, { recursive: true });

async function callDeepSeek(payload) {
  if (DRY) return { dry: true, payload };
  if (!API_KEY)
    throw new Error("DEEPSEEK_API_KEY not set in environment (.env)");

  // Use global fetch (Node 18+ / Node 24+)
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
    // 2 minutes timeout handled by consumer if needed
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return { dry: false, data };
}

(async function main() {
  console.log(
    DRY
      ? "Running in dry-run mode (no API calls)."
      : "Running with API calls to " + API_URL
  );

  for (const item of clean) {
    try {
      const codeRaw = String(item.code || "").toUpperCase();
      const codeSafe = codeRaw.replace("\\s", "").replace(/\W+/g, "");
      const deptName = item.nom || item.departement_nom || "";
      const region = item.region || "";
      const prix_m2 = item.prix_m2_median || item.prix_m2 || null;

      // Build input JSON according to the master prompt expectations.
      const input = {
        departement_nom: deptName,
        departement_numero: codeSafe,
        prix_m2: prix_m2,
        mutations: item.mutations || 0,
        ventes: item.ventes || 0,
        maisons: item.maisons || 0,
        appartements: item.appartements || 0,
        villes: item.villes || [],
        region: region,
        template: ["A", "B", "C"][Math.floor(Math.random() * 3)],
      };

      const prompt = masterPromptTemplate.replace(
        "{{input}}",
        JSON.stringify(input, null, 2)
      );

      const payload = {
        model: "deepseek-chat",
        // Many APIs accept a `messages` array; adjust if your DeepSeek expects another shape.
        messages: [
          { role: "system", content: "You are DeepSeek." },
          { role: "user", content: prompt },
        ],
        // instruct to return a large HTML
        max_tokens: 8000,
      };

      const outPath = path.join(OUT_DIR, `request-${codeSafe}.json`);
      fs.writeFileSync(
        outPath,
        JSON.stringify({ payload, input, apiUrl: API_URL }, null, 2),
        "utf8"
      );
      console.log("Wrote request payload to", outPath);

      if (!DRY) {
        const res = await callDeepSeek(payload);
        // Expecting res.data. Adjust according to actual API shape.
        let html = null;
        if (
          res.data &&
          res.data.choices &&
          res.data.choices[0] &&
          res.data.choices[0].message &&
          res.data.choices[0].message.content
        ) {
          html = res.data.choices[0].message.content;
          // Remove markdown code blocks if present
          html = html.replace(/^```html\s*/, "").replace(/\s*```$/, "");
        } else if (res.data && res.data.output_html) {
          html = res.data.output_html;
        } else if (res.data && res.data.content) {
          html = res.data.content;
        } else {
          html = JSON.stringify(res.data);
        }
        const fileName = `frais-notaire-${codeSafe}.html`;
        const pagePath = path.join(PAGES_DIR, fileName);
        // backup if exists
        if (fs.existsSync(pagePath)) {
          const bak =
            pagePath + ".bak." + new Date().toISOString().replace(/[:.]/g, "-");
          fs.copyFileSync(pagePath, bak);
          console.log("Backed up", pagePath, "->", bak);
        }
        // Wrap in full HTML template (pass department name for meta and OG)
        const fullHtml = wrapInTemplate(html, deptName || codeSafe, codeSafe);
        // backup if exists (kept as before)
        // Use generateFinalArticle to apply cleaning/deduplication logic before saving
        try {
          generateFinalArticle(fullHtml, fileName);
        } catch (e) {
          // fallback to direct write if cleaning fails for any reason
          fs.writeFileSync(pagePath, fullHtml, "utf8");
          console.warn(
            "generateFinalArticle failed, wrote raw page:",
            e && e.message
          );
        }
        console.log("Wrote page", pagePath);
        // be nice to the API
        await wait(1200);
      }
    } catch (err) {
      console.error(
        "Error processing item",
        item && item.code,
        err && err.message
      );
    }
  }

  console.log(
    "Done. Requests are in",
    OUT_DIR,
    DRY ? "(dry-run)" : "(completed)"
  );
})();
