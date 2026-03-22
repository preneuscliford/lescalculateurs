import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { readTextFile } = require("./encoding.cjs");
const { normalizeFrenchText } = require("./lib/french-normalization.cjs");

const satellitesTxtDir = path.resolve(__dirname, "../pages_satellite_txt");
const srcPagesDir = path.resolve(__dirname, "../src/pages");
const satelliteKeepMap = loadSatelliteKeepMap();

const pillarConfigs = {
  apl: {
    pillarUrl: "/pages/apl",
    pillarLabel: "Simulateur APL 2026",
  },
  rsa: {
    pillarUrl: "/pages/rsa",
    pillarLabel: "Simulateur RSA 2026",
  },
  pret: {
    pillarUrl: "/pages/pret",
    pillarLabel: "Simulateur de prêt immobilier",
  },
  "taxe-fonciere": {
    pillarUrl: "/pages/taxe-fonciere",
    pillarLabel: "Simulateur taxe foncière 2026",
  },
  plusvalue: {
    pillarUrl: "/pages/plusvalue",
    pillarLabel: "Simulateur plus-value immobilière",
  },
  simulateurs: {
    pillarUrl: "/pages/simulateurs",
    pillarLabel: "Nos simulateurs",
  },
  aide: {
    pillarUrl: "/pages/aide",
    pillarLabel: "Simulations aides sociales",
  },
  impot: {
    pillarUrl: "/pages/impot",
    pillarLabel: "Simulateur impôts 2026",
  },
  salaire: {
    pillarUrl: "/pages/salaire",
    pillarLabel: "Calculateur Salaire 2026",
  },
};

function loadSatelliteKeepMap() {
  const filePath = path.resolve(__dirname, "../data/pseo/satellite-keep-slugs.json");
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getAllowedSatelliteSlugs(pillarKey) {
  return new Set((satelliteKeepMap[pillarKey] || []).map((slug) => String(slug || "").trim()).filter(Boolean));
}

function main() {
  if (!fs.existsSync(satellitesTxtDir)) {
    console.warn("Dossier satellites introuvable:", satellitesTxtDir);
    process.exit(0);
  }

  if (!fs.existsSync(srcPagesDir)) {
    console.warn("Dossier src/pages introuvable:", srcPagesDir);
    process.exit(1);
  }

  fs.rmSync(path.join(srcPagesDir, "bonus"), { recursive: true, force: true });

  const txtFiles = fs
    .readdirSync(satellitesTxtDir)
    .filter((f) => f.toLowerCase().endsWith(".txt"));

  let generatedCount = 0;
  const cleanedPillars = new Set();

  txtFiles.forEach((fileName) => {
    const txtPath = path.join(satellitesTxtDir, fileName);
    const raw = normalizeFrenchText(readTextFile(txtPath));
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "(placeholder content)") {
      return;
    }

    const pages = parseSatelliteTxtToPages(trimmed);
    if (pages.length === 0) return;

    const defaultPillarKey = detectPillarKeyFromFileName(fileName);
    const plannedPillarKeys = new Set([defaultPillarKey]);
    const renderedPages = pages.map((p, idx) => {
      const slug = slugify(p.title || `page-${p.number || idx + 1}`);
      const pillarKey = defaultPillarKey === "aide" ? "aide" : p.pillarKeyOverride || defaultPillarKey;
      plannedPillarKeys.add(pillarKey);
      const pillar = pillarConfigs[pillarKey] || pillarConfigs.simulateurs;
      return { ...p, slug, pillarKey, pillar, idx };
    }).filter((p) => getAllowedSatelliteSlugs(p.pillarKey).has(p.slug));

    plannedPillarKeys.forEach((pillarKey) => {
      const outDir = path.join(srcPagesDir, pillarKey);
      if (!cleanedPillars.has(outDir)) {
        cleanupGeneratedPagesInDir(outDir, pillarKey);
        cleanedPillars.add(outDir);
      }
    });

    if (renderedPages.length === 0) {
      return;
    }

    const titleIndex = new Map(
      renderedPages
        .filter((p) => p.title)
        .map((p) => [String(p.title).toLowerCase(), p]),
    );

    renderedPages.forEach((p, idx) => {
      const related =
        p.relatedTitle && titleIndex.has(String(p.relatedTitle).toLowerCase())
          ? titleIndex.get(String(p.relatedTitle).toLowerCase())
          : renderedPages.length > 1
            ? renderedPages[(idx + 1) % renderedPages.length]
            : null;

      const html = renderSatelliteHtmlDev({ page: p, relatedPage: related });

      const outDir = path.join(srcPagesDir, p.pillarKey);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const outPathFlat = path.join(outDir, `${p.slug}.html`);
      fs.writeFileSync(outPathFlat, html, "utf-8");

      const outDirClean = path.join(outDir, p.slug);
      if (!fs.existsSync(outDirClean)) fs.mkdirSync(outDirClean, { recursive: true });
      fs.writeFileSync(path.join(outDirClean, "index.html"), html, "utf-8");

      generatedCount++;
    });
  });

  ensurePillarCleanUrlsDev();
  console.log(`Satellites (dev): ${generatedCount} pages générées dans src/pages/`);
}

function cleanupGeneratedPagesInDir(dirPath, pillarKey) {
  if (!fs.existsSync(dirPath)) return;
  const allowedSlugs = getAllowedSatelliteSlugs(pillarKey);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach((e) => {
    const stem = e.isDirectory() ? e.name : path.parse(e.name).name;
    if (allowedSlugs.has(stem)) return;
    if (e.isDirectory()) {
      fs.rmSync(path.join(dirPath, e.name), { recursive: true, force: true });
      return;
    }
    if (!e.isFile()) return;
    if (e.name === "index.html") return;
    if (e.name.toLowerCase().endsWith(".html")) {
      fs.rmSync(path.join(dirPath, e.name), { force: true });
    }
  });
}

function ensurePillarCleanUrlsDev() {
  const htmlPillars = [
    "apl",
    "rsa",
    "pret",
    "plusvalue",
    "impot",
    "simulateurs",
    "aide",
    "aah",
    "are",
    "asf",
    "charges",
    "ik",
    "salaire",
    "taxe",
    "travail",
    "financement",
  ];
  htmlPillars.forEach((name) => {
    const htmlPath = path.join(srcPagesDir, `${name}.html`);
    if (!fs.existsSync(htmlPath)) return;
    const dirPath = path.join(srcPagesDir, name);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.copyFileSync(htmlPath, path.join(dirPath, "index.html"));
  });

  const simulateursHtmlPath = path.join(srcPagesDir, "simulateurs.html");
  if (fs.existsSync(simulateursHtmlPath)) {
    const aideDir = path.join(srcPagesDir, "aide");
    if (!fs.existsSync(aideDir)) fs.mkdirSync(aideDir, { recursive: true });
    fs.copyFileSync(simulateursHtmlPath, path.join(aideDir, "index.html"));
  }
}

function detectPillarKeyFromFileName(fileName) {
  const upper = String(fileName).toUpperCase();
  if (upper.includes("APL")) return "apl";
  if (upper.includes("RSA")) return "rsa";
  if (upper.includes("TAXE_FONCIERE") || upper.includes("TAXE-FONCIERE"))
    return "taxe-fonciere";
  if (upper.includes("PLUS_VALUE") || upper.includes("PLUS-VALUE"))
    return "plusvalue";
  if (upper.includes("PRET")) return "pret";
  if (upper.includes("IMPOTS")) return "impot";
  if (upper.includes("BONUS")) return "aide";
  return "simulateurs";
}

function parseSatelliteTxtToPages(txt) {
  const lines = txt
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const hasPilierBlocks = lines.some(
    (l, i) =>
      l.toLowerCase() === "pilier" && isPilierBulletLine(lines[i + 1]),
  );
  if (hasPilierBlocks) {
    return parsePilierBlocksToPages(lines);
  }

  const pageHeaderMatchers = [
    (line) => {
      const m = line.match(/^PAGE\s*(\d+)\s*[---]\s*(.+)$/i);
      if (!m) return null;
      return { number: Number(m[1]), title: m[2].trim() };
    },
    (line) => {
      const m = line.match(/^(\d+)\.\s*(.+)$/);
      if (!m) return null;
      return { number: Number(m[1]), title: m[2].trim() };
    },
  ];

  const pages = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    pages.push(current);
    current = null;
  };

  for (const line of lines) {
    const isSeparator = /^[-=_]{3,}$/.test(line);
    if (isSeparator) continue;

    let header = null;
    for (const matcher of pageHeaderMatchers) {
      header = matcher(line);
      if (header) break;
    }
    if (header) {
      flush();
      current = {
        number: header.number,
        title: header.title,
        objective: "",
        question: "",
        cta: "",
        contentHints: "",
        bodyLines: [],
      };
      continue;
    }

    if (!current) continue;

    const normalized = line.replace(/\s+/g, " ");
    const marker = normalizeMarker(normalized);
    if (/^Objectif\s*:/i.test(normalized)) {
      current.objective = normalized.replace(/^Objectif\s*:\s*/i, "").trim();
      continue;
    }
    if (/^question\s*(ciblee|traitee)\s*:/.test(marker)) {
      current.question = normalized
        .replace(/^Question\s*(ciblée|ciblee|traitée|traitee)\s*:\s*/iu, "")
        .trim();
      continue;
    }
    if (/^Contenu\s*:/i.test(normalized)) {
      current.contentHints = normalized
        .replace(/^Contenu\s*:\s*/i, "")
        .trim();
      continue;
    }
    if (/^CTA\s*:/i.test(normalized)) {
      current.cta = normalized.replace(/^CTA\s*:\s*/i, "").trim();
      continue;
    }
    if (startsWithLeadEmoji(normalized) && !current.cta) {
      current.cta = stripLeadEmoji(normalized);
      continue;
    }

    current.bodyLines.push(normalized);
  }

  flush();
  return pages;
}

function parsePilierBlocksToPages(lines) {
  const pages = [];

  for (let i = 0; i < lines.length; i++) {
    if (!(lines[i].toLowerCase() === "pilier" && isPilierBulletLine(lines[i + 1]))) {
      continue;
    }

    const start = i;
    let end = i + 2;
    while (
      end < lines.length &&
      !(lines[end].toLowerCase() === "pilier" && isPilierBulletLine(lines[end + 1]))
    ) {
      end++;
    }

    const block = lines.slice(start, end);
    const pillarLabelHeader = block[2] || "";
    const title = block[3] || "";
    const content = block.slice(4).map((l) => l.replace(/\s+/g, " ").trim());

    const questionLine =
      content.find((l) => normalizeMarker(l).startsWith("reponse a la question :")) || "";
    const ctaLine = content.find((l) => startsWithLeadEmoji(l)) || "";
    const relatedLine =
      content.find((l) => normalizeMarker(stripLeadEmoji(l)).startsWith("lire aussi :")) || "";
    const footerLine =
      content.find((l) => /^(retour au pilier|retour aux simulateurs)\s*:/.test(normalizeMarker(l))) || "";

    const bodyLines = [];
    const practiceItems = [];
    const verifyItems = [];

    let mode = null;
    for (const raw of content) {
      const line = raw;
      const marker = normalizeMarker(line);
      if (/^[=_-]{3,}$/.test(line)) continue;
      if (marker === "reponse rapide") {
        mode = "quick";
        continue;
      }
      if (marker === "en pratique, on regarde surtout") {
        mode = "practice";
        continue;
      }
      if (marker === "ce qu'il faut verifier") {
        mode = "verify";
        continue;
      }
      if (marker === "aller plus loin") {
        mode = null;
        continue;
      }

      if (
        startsWithLeadEmoji(line) ||
        normalizeMarker(stripLeadEmoji(line)).startsWith("lire aussi :") ||
        normalizeMarker(stripLeadEmoji(line)) === "acceder au pilier" ||
        /^(retour au pilier|retour aux simulateurs)\s*:/.test(marker) ||
        /^©\s*\d{4}/.test(line)
      ) {
        mode = null;
      }

      if (
        marker.startsWith("les informations") ||
        marker.startsWith("contenu pedagogique") ||
        marker.startsWith("reponse a la question :")
      ) {
        continue;
      }

      if (mode === "quick") {
        if (line) bodyLines.push(line);
      } else if (mode === "practice") {
        if (line) practiceItems.push(stripListPrefix(line));
      } else if (mode === "verify") {
        if (line) verifyItems.push(stripListPrefix(line));
      }
    }

    const pillarLabelFooter = footerLine
      ? footerLine.replace(/^Retour\s+(au pilier|aux simulateurs)\s*:\s*/iu, "").trim()
      : "";
    const pillarKeyOverride =
      detectPillarKeyFromLabel(pillarLabelHeader) ||
      detectPillarKeyFromLabel(pillarLabelFooter) ||
      null;

    const relatedTitle = relatedLine
      ? stripLeadEmoji(relatedLine).replace(/^Lire aussi\s*:\s*/iu, "").trim()
      : "";

    const contentHints = [...practiceItems, ...verifyItems]
      .filter(Boolean)
      .join(", ");

    pages.push({
      number: pages.length + 1,
      title,
      objective: "",
      question: questionLine,
      cta: ctaLine ? stripLeadEmoji(ctaLine) : "",
      contentHints,
      bodyLines,
      relatedTitle,
      pillarKeyOverride: pillarKeyOverride || undefined,
    });

    i = end - 1;
  }

  return pages;
}

function stripListPrefix(line) {
  return String(line).replace(/^[\-–•·●]+\s*/u, "").trim();
}

function isPilierBulletLine(line) {
  return /^[•·●]/u.test(String(line || "").trim());
}

function detectPillarKeyFromLabel(label) {
  const s = normalizeMarker(label);
  if (!s) return null;
  if (s.includes("apl")) return "apl";
  if (s.includes("rsa")) return "rsa";
  if (s.includes("pret")) return "pret";
  if (s.includes("taxe fonci")) return "taxe-fonciere";
  if (s.includes("plus-value") || s.includes("plus value")) return "plusvalue";
  if (s.includes("impot")) return "impot";
  if (s.includes("salaire")) return "salaire";
  if (s.includes("simulateur")) return "simulateurs";
  return null;
}

function normalizeMarker(input) {
  return normalizeFrenchText(String(input || ""))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function startsWithLeadEmoji(input) {
  return /^[👉💡🧮📄]/u.test(String(input || "").trim());
}

function stripLeadEmoji(input) {
  return String(input || "")
    .trim()
    .replace(/^[👉💡🧮📄]\s*/u, "")
    .trim();
}

function slugify(input) {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-{2,}/g, "-");
}

function renderSatelliteHtmlDev({ page, relatedPage }) {
  const domain = "https://www.lescalculateurs.fr";
  const canonical = `${domain}/pages/${page.pillarKey}/${page.slug}`;
  const safeTitle = cleanSatelliteText(page.title || page.question || "Page satellite");
  const metaTitle = `${safeTitle} (2026)`;
  const metaDescription = cleanSatelliteText(buildMetaDescription(page));

  const bullets = buildBullets(page).map(cleanSatelliteText);
  const paragraphs = buildParagraphs(page).map(cleanSatelliteText);
  const pretEndettementTip = shouldShowPretEndettementTip(page)
    ? "💡 À titre indicatif, les banques appliquent généralement un taux d'endettement maximal autour de 35 % assurance incluse."
    : "";
  const ctaText = page.cta
    ? stripLeadEmoji(page.cta)
    : "Estimez votre situation avec notre simulateur officiel";

  const relatedHref = relatedPage
    ? `/pages/${relatedPage.pillarKey}/${relatedPage.slug}`
    : null;
  const cleanedPretEndettementTip = cleanSatelliteText(pretEndettementTip);
  const cleanedCtaText = cleanSatelliteText(ctaText);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: safeTitle,
    url: canonical,
    description: metaDescription,
    publisher: { "@type": "Organization", name: "LesCalculateurs.fr" },
  };

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: page.pillar.pillarUrl, label: page.pillar.pillarLabel },
  ];

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(metaTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />

    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(metaTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metaTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

    <link rel="stylesheet" href="/tailwind.css" />
    <script type="module" src="/main.ts"></script>
  </head>
  <body class="bg-gray-50">
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" class="font-bold text-lg text-blue-600">Les Calculateurs</a>
        <div class="space-x-4">
          ${navLinks
            .map(
              (l) =>
                `<a href="${escapeHtml(l.href)}" class="text-gray-600 hover:text-blue-600">${escapeHtml(l.label)}</a>`,
            )
            .join("")}
        </div>
      </div>
    </nav>

    <header class="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 sm:py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-sm text-slate-100 mb-4">
          <span class="text-slate-200">Pilier</span>
          <span class="text-slate-400">&middot;</span>
          <a class="font-semibold text-emerald-300 hover:text-emerald-200 underline decoration-emerald-300/60" href="${escapeHtml(
            page.pillar.pillarUrl,
          )}">${escapeHtml(cleanSatelliteText(page.pillar.pillarLabel))}</a>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold leading-tight">${escapeHtml(
          safeTitle,
        )}</h1>
        <p class="mt-4 text-slate-200 leading-relaxed max-w-3xl">${escapeHtml(metaDescription)}</p>
        <div class="mt-8">
          <a href="${escapeHtml(
            page.pillar.pillarUrl,
          )}" class="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-colors shadow-lg shadow-green-500/20">
            ${escapeHtml(cleanedCtaText)}
          </a>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-12">
      <div class="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-sm text-gray-800 m-0">
          Les informations ci-dessous sont pédagogiques et indicatives. Pour un calcul fiable, utilisez le simulateur et référez-vous aux organismes compétents.
        </p>
      </div>

      <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Réponse rapide</h2>
        ${paragraphs
          .map(
            (p) =>
              `<p class="text-gray-700 leading-relaxed mb-4">${escapeHtml(p)}</p>`,
          )
          .join("")}
        ${
          pretEndettementTip
            ? `<p class="text-sm text-gray-600 leading-relaxed mt-2 mb-0">${escapeHtml(
                cleanedPretEndettementTip,
              )}</p>`
            : ""
        }
      </section>

      <section class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Ce qu'il faut vérifier</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          ${bullets
            .map((b) => `<li>${escapeHtml(b)}</li>`)
            .join("")}
        </ul>
      </section>

      <section class="mt-8 bg-slate-50 rounded-lg border border-slate-200 p-6">
        <h2 class="text-xl font-bold text-slate-900 mb-3">Aller plus loin</h2>
        <p class="text-slate-700 mb-4">
          Pour une estimation chiffrée adaptée à votre situation, passez par le pilier.
        </p>
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="${escapeHtml(
            page.pillar.pillarUrl,
          )}" class="inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-lg transition-colors">
            Accéder au pilier
          </a>
          ${
            relatedHref
              ? `<a href="${escapeHtml(
                  relatedHref,
                )}" class="inline-flex justify-center bg-white hover:bg-slate-100 text-slate-900 font-semibold py-4 px-10 rounded-lg border border-slate-300 transition-colors">
            Lire aussi : ${escapeHtml(cleanSatelliteText(relatedPage.title))}
          </a>`
              : ""
          }
        </div>
      </section>
    </main>

    <footer class="border-t border-gray-200 bg-white">
      <div class="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-600">
        <p class="mb-2">
          <a class="text-blue-600 hover:underline" href="${escapeHtml(
            page.pillar.pillarUrl,
          )}">Retour au pilier : ${escapeHtml(cleanSatelliteText(page.pillar.pillarLabel))}</a>
        </p>
        <p>&copy; ${new Date().getFullYear()} LesCalculateurs.fr</p>
      </div>
    </footer>
  </body>
</html>`;
}

function buildMetaDescription(page) {
  const parts = [];

  if (page.question) parts.push(page.question);
  else if (page.title) parts.push(`Réponse à la question : ${page.title}`);

  const fromBody =
    page.bodyLines && page.bodyLines.length ? page.bodyLines[0] : "";
  if (fromBody) parts.push(fromBody);

  if (page.objective) {
    const cleanedObjective = toSentence(page.objective);
    if (cleanedObjective) parts.push(cleanedObjective);
  }

  if (!fromBody && page.contentHints) {
    parts.push(
      `Points clés : ${page.contentHints.replace(/\s*[,;]\s*/g, ", ")}.`,
    );
  }

  parts.push("Estimation via le simulateur du pilier.");

  const base = parts.join(" ").trim();
  return trimToLength(cleanSatelliteText(base), 160);
}

function buildParagraphs(page) {
  const paragraphs = [];

  const first = page.bodyLines && page.bodyLines.length ? page.bodyLines[0] : "";
  if (first) paragraphs.push(first);

  if (page.objective) {
    const cleanedObjective = toSentence(page.objective);
    if (cleanedObjective && !first.includes(cleanedObjective)) {
      paragraphs.push(cleanedObjective);
    }
  }

  if (page.contentHints) {
    const hints = page.contentHints
      .replace(/\s*[,;]\s*/g, ", ")
      .replace(/\.+$/g, "");
    paragraphs.push(`En pratique, on regarde surtout : ${hints}.`);
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      "Cette page répond à une question précise et vous donne un ordre de grandeur des critères à considérer.",
    );
  }

  return paragraphs.map((p) => trimToLength(cleanSatelliteText(p), 280)).slice(0, 3);
}

function buildBullets(page) {
  const bullets = [];

  const fromHints = page.contentHints
    ? page.contentHints
        .split(/[,;]+/g)
        .map((s) => s.trim().replace(/[.。…]+$/g, ""))
        .filter(Boolean)
    : [];

  fromHints.forEach((h) => {
    if (bullets.length < 8 && !isStructuralHint(h)) bullets.push(h);
  });

  page.bodyLines.forEach((l) => {
    if (bullets.length >= 10) return;
    if (l.length < 20) return;
    if (startsWithLeadEmoji(l)) return;
    const cleanedLine = l.replace(/\.$/, "");
    if (isStructuralHint(cleanedLine)) return;
    bullets.push(cleanedLine);
  });

  if (bullets.length === 0) {
    bullets.push("Votre situation personnelle (revenus, foyer, logement, durée)");
    bullets.push("Les règles en vigueur à la date de votre demande");
    bullets.push("Les justificatifs demandés par l'organisme");
  }

  return bullets.map(cleanSatelliteText).slice(0, 8);
}

function trimToLength(s, maxLen) {
  const str = String(s).trim().replace(/\s+/g, " ");
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1).replace(/\s+\S*$/, "") + "…";
}

function cleanSatelliteText(value) {
  return normalizeFrenchText(String(value || ""))
    .replace(/^ðŸ‘‰\s*/u, "")
    .replace(/^ðŸ’¡\s*/u, "")
    .replace(/^ðŸ§®\s*/u, "")
    .replace(/^ðŸ“„\s*/u, "")
    .replace(/^[👉💡🧮📄]\s*/u, "")
    .replace(/(?<!À\s)\bQuelles aides ai-je droit\b/giu, "À quelles aides ai-je droit")
    .replace(/\bÀ À quelles aides ai-je droit\b/gu, "À quelles aides ai-je droit")
    .replace(/\be qu['’]il faut vérifier\b/giu, "ce qu'il faut vérifier")
    .replace(/\?\./g, "?")
    .replace(/[ \t]+\./g, ".")
    .trim();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSentence(input) {
  const s = String(input).trim().replace(/\s+/g, " ");
  if (!s) return "";
  const withoutTrailingDot = s.replace(/[.。…]+$/g, "");
  const lowered = withoutTrailingDot.toLowerCase();
  if (lowered.startsWith("expliquer ")) {
    return `Cette page explique ${withoutTrailingDot
      .slice("expliquer ".length)
      .trim()}.`;
  }
  if (lowered.startsWith("focus ")) {
    return `Cette page fait le point sur ${withoutTrailingDot
      .slice("focus ".length)
      .trim()}.`;
  }
  if (lowered.startsWith("clarifier ")) {
    return `Cette page clarifie ${withoutTrailingDot
      .slice("clarifier ".length)
      .trim()}.`;
  }
  if (lowered.startsWith("comprendre ")) {
    return `${withoutTrailingDot}.`;
  }
  return `${withoutTrailingDot}.`;
}

function isStructuralHint(input) {
  const marker = normalizeMarker(input);
  return (
    !marker ||
    marker === "ce qu'il faut verifier" ||
    marker === "en pratique, on regarde surtout" ||
    marker === "reponse rapide" ||
    marker === "aller plus loin"
  );
}

main();

function shouldShowPretEndettementTip(page) {
  if (!page || page.pillarKey !== "pret") return false;
  const haystack = [
    page.title,
    page.question,
    page.objective,
    page.contentHints,
    ...(page.bodyLines || []),
  ]
    .filter(Boolean)
    .join(" ");
  return /\d/.test(haystack);
}
