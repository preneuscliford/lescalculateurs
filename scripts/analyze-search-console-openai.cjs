#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { loadEnvFile } = require("./lib/load-env.cjs");

loadEnvFile();

const OPENAI_API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

function parseArgs(argv) {
  const args = new Map();
  for (const raw of argv.slice(2)) {
    if (!raw.startsWith("--")) continue;
    const [k, ...rest] = raw.slice(2).split("=");
    args.set(k, rest.length ? rest.join("=") : "true");
  }

  return {
    inputDir: args.get("input-dir") || "seach-console-perf",
    minImpressions: Number.parseInt(args.get("min-impressions") || "200", 10),
    maxCtr: Number.parseFloat(args.get("max-ctr") || "0.012"),
    maxPages: Number.parseInt(args.get("max-pages") || "20", 10),
    pseoOnly: args.get("pseo-only") !== "false",
    strategy: args.get("strategy") || "hub-first",
    maxAssociatedPages: Number.parseInt(args.get("max-associated-pages") || "6", 10),
    reportPrefix: args.get("output") || "",
    dryRun: args.get("dry-run") === "true",
  };
}

function ensureApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant. Ajoute la cle API dans .env.");
  }
  return apiKey;
}

function normalizeDateLabel(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectWindowDays(workbook) {
  const ws = workbook.Sheets.Filtres;
  if (!ws) return null;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  for (const row of rows) {
    const key = normalizeDateLabel(row[0]);
    const value = normalizeDateLabel(row[1]);
    if (key === "date") {
      const match = value.match(/(\d+)\s*derniers\s*jours/);
      if (match) return Number.parseInt(match[1], 10);
    }
  }
  return null;
}

function parsePagesSheet(workbookPath) {
  const wb = XLSX.readFile(workbookPath);
  const days = detectWindowDays(wb);
  const sheet = wb.Sheets.Pages;
  if (!sheet) {
    throw new Error(`Onglet 'Pages' introuvable dans ${path.basename(workbookPath)}.`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  const entries = [];

  for (const row of rows) {
    const rawUrl = row["Pages les plus populaires"] || row["Page"] || row["URL"] || row["Pages"];
    if (!rawUrl || typeof rawUrl !== "string") continue;

    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      continue;
    }

    const pathname = url.pathname.endsWith("/") && url.pathname !== "/" ? url.pathname.slice(0, -1) : url.pathname;
    entries.push({
      pathname,
      url: `${url.origin}${pathname}`,
      clicks: Number(row.Clics || 0),
      impressions: Number(row.Impressions || 0),
      ctr: Number(row.CTR || 0),
      position: Number(row.Position || 0),
    });
  }

  return { days, entries, workbookPath };
}

function loadSearchConsolePerf(inputDir) {
  const absolute = path.resolve(process.cwd(), inputDir);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Dossier introuvable: ${absolute}`);
  }

  const files = fs
    .readdirSync(absolute)
    .filter((name) => name.toLowerCase().endsWith(".xlsx"))
    .map((name) => path.join(absolute, name));

  if (!files.length) {
    throw new Error(`Aucun fichier .xlsx dans ${absolute}`);
  }

  const parsed = files.map(parsePagesSheet);
  const byDays = new Map(parsed.filter((item) => item.days).map((item) => [item.days, item]));

  const d7 = byDays.get(7) || parsed[0];
  const d28 = byDays.get(28) || parsed.find((item) => item !== d7) || parsed[0];

  return { d7, d28 };
}

function mapByPath(entries) {
  const map = new Map();
  for (const row of entries) {
    map.set(row.pathname, row);
  }
  return map;
}

function getSegments(pathname) {
  return pathname.split("/").filter(Boolean);
}

function isHubPath(pathname) {
  const segments = getSegments(pathname);
  return segments.length === 2 && segments[0] === "pages";
}

function getHubCluster(pathname) {
  const segments = getSegments(pathname);
  if (segments[0] !== "pages" || segments.length < 2) return "";
  return segments[1];
}

function isSatelliteForHub(pathname, hubPath) {
  return pathname.startsWith(`${hubPath}/`);
}

function buildPageMetrics(pathname, m7, m28) {
  const v7 = m7.get(pathname) || { clicks: 0, impressions: 0, ctr: 0, position: 0, url: `https://www.lescalculateurs.fr${pathname}` };
  const v28 = m28.get(pathname) || { clicks: 0, impressions: 0, ctr: 0, position: 0, url: `https://www.lescalculateurs.fr${pathname}` };
  const opportunityScore = v28.impressions * (1 - v28.ctr) * (1 / Math.max(v28.position || 0, 1));

  return {
    pathname,
    url: v28.url || v7.url || `https://www.lescalculateurs.fr${pathname}`,
    impressions7: v7.impressions,
    clicks7: v7.clicks,
    ctr7: v7.ctr,
    pos7: v7.position,
    impressions28: v28.impressions,
    clicks28: v28.clicks,
    ctr28: v28.ctr,
    pos28: v28.position,
    deltaCtr: v7.ctr - v28.ctr,
    deltaPos: v7.position && v28.position ? v7.position - v28.position : 0,
    opportunityScore,
  };
}

function detectCandidates(d7Data, d28Data, options) {
  const m7 = mapByPath(d7Data.entries);
  const m28 = mapByPath(d28Data.entries);
  const allPaths = new Set([...m7.keys(), ...m28.keys()]);
  const scored = [];

  for (const pathname of allPaths) {
    if (!pathname.startsWith("/pages/")) continue;
    if (options.pseoOnly) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length < 3) continue;
    }

    const v7 = m7.get(pathname) || { clicks: 0, impressions: 0, ctr: 0, position: 0, url: `https://www.lescalculateurs.fr${pathname}` };
    const v28 = m28.get(pathname) || { clicks: 0, impressions: 0, ctr: 0, position: 0, url: `https://www.lescalculateurs.fr${pathname}` };

    if (v28.impressions < options.minImpressions) continue;
    if (v28.ctr > options.maxCtr) continue;

    const opportunityScore = v28.impressions * (1 - v28.ctr) * (1 / Math.max(v28.position, 1));
    scored.push({
      pathname,
      url: v28.url || v7.url || `https://www.lescalculateurs.fr${pathname}`,
      impressions7: v7.impressions,
      clicks7: v7.clicks,
      ctr7: v7.ctr,
      pos7: v7.position,
      impressions28: v28.impressions,
      clicks28: v28.clicks,
      ctr28: v28.ctr,
      pos28: v28.position,
      deltaCtr: v7.ctr - v28.ctr,
      deltaPos: v7.position && v28.position ? v7.position - v28.position : 0,
      opportunityScore,
    });
  }

  scored.sort((a, b) => b.opportunityScore - a.opportunityScore);
  return scored.slice(0, Math.max(1, options.maxPages));
}

function detectHubCandidates(d7Data, d28Data, options) {
  const m7 = mapByPath(d7Data.entries);
  const m28 = mapByPath(d28Data.entries);
  const allPaths = [...new Set([...m7.keys(), ...m28.keys()])];

  const hubs = allPaths
    .filter((pathname) => pathname.startsWith("/pages/"))
    .filter((pathname) => isHubPath(pathname))
    .map((pathname) => buildPageMetrics(pathname, m7, m28))
    .filter((page) => page.impressions28 >= options.minImpressions)
    .filter((page) => page.ctr28 <= options.maxCtr)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, Math.max(1, options.maxPages));

  return hubs.map((hub) => {
    const satellites = allPaths
      .filter((pathname) => isSatelliteForHub(pathname, hub.pathname))
      .map((pathname) => buildPageMetrics(pathname, m7, m28))
      .sort((a, b) => {
        if (b.impressions28 !== a.impressions28) return b.impressions28 - a.impressions28;
        return b.opportunityScore - a.opportunityScore;
      })
      .slice(0, Math.max(1, options.maxAssociatedPages));

    return {
      ...hub,
      cluster: getHubCluster(hub.pathname),
      associatedPages: satellites,
    };
  });
}

function extractTag(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  return match ? match[1].trim() : "";
}

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractPlainText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function resolveLocalFile(pathname) {
  const srcRoot = path.resolve(process.cwd(), "src");
  const direct = path.join(srcRoot, `${pathname}.html`);
  if (fs.existsSync(direct)) return direct;

  const index = path.join(srcRoot, pathname, "index.html");
  if (fs.existsSync(index)) return index;
  return null;
}

function enrichWithPageContent(candidates) {
  return candidates.map((item) => {
    const filePath = resolveLocalFile(item.pathname);
    if (!filePath) {
      return {
        ...item,
        filePath: null,
        title: "",
        metaDescription: "",
        h1: "",
        excerpt: "",
      };
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const title = decodeEntities(extractTag(raw, "title"));
    const h1 = decodeEntities(extractTag(raw, "h1"));
    const metaDescription = decodeEntities(extractMetaDescription(raw));
    const excerpt = extractPlainText(raw).slice(0, 900);

    return {
      ...item,
      filePath: path.relative(process.cwd(), filePath),
      title,
      h1,
      metaDescription,
      excerpt,
    };
  });
}

function enrichHubsWithPageContent(hubs) {
  return hubs.map((hub) => ({
    ...enrichWithPageContent([hub])[0],
    associatedPages: enrichWithPageContent(hub.associatedPages || []),
  }));
}

function buildPrompt(page) {
  return [
    {
      role: "system",
      content:
        "Tu es un expert SEO CTR Google pour un site de simulateurs francais. Tu dois produire des recommandations concretes, actionnables, en francais naturel, sans blabla.",
    },
    {
      role: "user",
      content: [
        "Analyse cette page et propose des optimisations CTR.",
        `URL: ${page.url}`,
        `Path: ${page.pathname}`,
        `Title actuel: ${page.title || "(inconnu)"}`,
        `H1 actuel: ${page.h1 || "(inconnu)"}`,
        `Meta description actuelle: ${page.metaDescription || "(inconnue)"}`,
        `Donnees 28 jours: impressions=${page.impressions28}, clics=${page.clicks28}, ctr=${(page.ctr28 * 100).toFixed(2)}%, position=${page.pos28.toFixed(2)}`,
        `Donnees 7 jours: impressions=${page.impressions7}, clics=${page.clicks7}, ctr=${(page.ctr7 * 100).toFixed(2)}%, position=${page.pos7 ? page.pos7.toFixed(2) : "0.00"}`,
        `Extrait de la page: ${page.excerpt || "(non disponible)"}`,
        "",
        "Objectif:",
        "1) Diagnostic clair des causes possibles du CTR faible.",
        "2) Proposer 3 titles optimises.",
        "3) Proposer 2 meta descriptions optimisees.",
        "4) Donner 3 quick wins UX actionnables (hero, CTA, first-screen value).",
        "5) Donner 3 actions prioritaires classees par impact.",
        "",
        "Contraintes:",
        "- Francais naturel, style humain.",
        "- Promesse concrete, orientee utilisateur.",
        "- Pas de jargon interne.",
        "- Pas de contenu trompeur.",
      ].join("\n"),
    },
  ];
}

function buildHubPrompt(page) {
  const associatedSummary = (page.associatedPages || [])
    .map(
      (child, index) =>
        `${index + 1}. ${child.pathname} | impr28=${child.impressions28} | clics28=${child.clicks28} | ctr28=${(child.ctr28 * 100).toFixed(2)}% | pos28=${child.pos28.toFixed(2)}`,
    )
    .join("\n");

  return [
    {
      role: "system",
      content:
        "Tu es un expert SEO CTR Google pour un site de simulateurs francais. Tu travailles en mode hub-first: la page hub est prioritaire et doit etre optimisee avec son maillage vers les pages satellites pSEO associees.",
    },
    {
      role: "user",
      content: [
        "Analyse cette page hub et ses pages pSEO associees.",
        `URL hub: ${page.url}`,
        `Path hub: ${page.pathname}`,
        `Title actuel hub: ${page.title || "(inconnu)"}`,
        `H1 actuel hub: ${page.h1 || "(inconnu)"}`,
        `Meta actuelle hub: ${page.metaDescription || "(inconnue)"}`,
        `Donnees hub 28 jours: impressions=${page.impressions28}, clics=${page.clicks28}, ctr=${(page.ctr28 * 100).toFixed(2)}%, position=${page.pos28.toFixed(2)}`,
        `Donnees hub 7 jours: impressions=${page.impressions7}, clics=${page.clicks7}, ctr=${(page.ctr7 * 100).toFixed(2)}%, position=${page.pos7.toFixed(2)}`,
        "",
        "Pages satellites associees:",
        associatedSummary || "(aucune)",
        "",
        `Extrait hub: ${page.excerpt || "(non disponible)"}`,
        "",
        "Objectif:",
        "1) Diagnostiquer pourquoi le hub capte beaucoup d'impressions mais sous-performe au clic.",
        "2) Proposer 3 titles optimises pour la page hub.",
        "3) Proposer 2 meta descriptions optimisees pour la page hub.",
        "4) Donner 3 quick wins UX pour la page hub.",
        "5) Donner 3 recommandations de maillage interne entre le hub et ses pages satellites.",
        "6) Donner 3 actions prioritaires classees par impact.",
        "",
        "Contraintes:",
        "- Francais naturel, style humain.",
        "- Promesse concrete, orientee utilisateur.",
        "- Pas de jargon interne.",
        "- Le hub reste la priorite, les satellites servent a renforcer l'intention et la navigation.",
      ].join("\n"),
    },
  ];
}

function buildSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      diagnostic: { type: "string" },
      titleSuggestions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      metaSuggestions: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: { type: "string" },
      },
      uxQuickWins: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      priorityActions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
    },
    required: ["diagnostic", "titleSuggestions", "metaSuggestions", "uxQuickWins", "priorityActions"],
  };
}

function buildHubSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      diagnostic: { type: "string" },
      titleSuggestions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      metaSuggestions: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: { type: "string" },
      },
      uxQuickWins: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      internalLinkingRecommendations: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      priorityActions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
    },
    required: [
      "diagnostic",
      "titleSuggestions",
      "metaSuggestions",
      "uxQuickWins",
      "internalLinkingRecommendations",
      "priorityActions",
    ],
  };
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text;
  const chunks = [];
  for (const item of payload?.output || []) {
    if (item?.type !== "message" || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (part?.type === "output_text" && typeof part.text === "string") chunks.push(part.text);
    }
  }
  return chunks.join("").trim();
}

async function requestOpenAi(apiKey, page) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      store: false,
      reasoning: { effort: "low" },
      input: buildPrompt(page),
      text: {
        format: {
          type: "json_schema",
          name: "seo_ctr_reco",
          schema: buildSchema(),
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  const payload = await response.json();
  const content = extractOutputText(payload);
  if (!content) {
    throw new Error("Reponse OpenAI vide.");
  }
  return JSON.parse(content);
}

async function requestOpenAiHub(apiKey, page) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      store: false,
      reasoning: { effort: "low" },
      input: buildHubPrompt(page),
      text: {
        format: {
          type: "json_schema",
          name: "seo_hub_ctr_reco",
          schema: buildHubSchema(),
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  const payload = await response.json();
  const content = extractOutputText(payload);
  if (!content) {
    throw new Error("Reponse OpenAI vide.");
  }
  return JSON.parse(content);
}

function formatPct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatDateStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildMarkdownReport(result) {
  const lines = [];
  lines.push(`# Recommandations SEO IA - Search Console (${result.generatedAt})`);
  lines.push("");
  lines.push("## Parametres");
  lines.push(`- Dossier source: \`${result.inputDir}\``);
  lines.push(`- Fichier 7 jours: \`${path.basename(result.sources.days7)}\``);
  lines.push(`- Fichier 28 jours: \`${path.basename(result.sources.days28)}\``);
  lines.push(`- Seuil impressions 28j: \`${result.thresholds.minImpressions}\``);
  lines.push(`- Seuil CTR max 28j: \`${formatPct(result.thresholds.maxCtr)}\``);
  lines.push(`- Pages analysees: \`${result.summary.analyzedPages}\``);
  lines.push(`- Modele OpenAI: \`${result.model}\``);
  lines.push(`- Strategie: \`${result.strategy}\``);
  lines.push("");
  lines.push("## Pages prioritaires");
  lines.push("| Page | Impr 28j | Clics 28j | CTR 28j | Pos 28j | Score |");
  lines.push("|---|---:|---:|---:|---:|---:|");
  for (const p of result.pages) {
    lines.push(
      `| ${p.pathname} | ${p.impressions28} | ${p.clicks28} | ${formatPct(p.ctr28)} | ${p.pos28.toFixed(2)} | ${p.opportunityScore.toFixed(2)} |`,
    );
  }

  for (const p of result.pages) {
    lines.push("");
    lines.push(`## ${p.pathname}`);
    lines.push(`- URL: ${p.url}`);
    lines.push(`- Fichier local: \`${p.filePath || "introuvable"}\``);
    lines.push(`- Title actuel: ${p.title || "(inconnu)"}`);
    lines.push(`- Meta actuelle: ${p.metaDescription || "(inconnue)"}`);
    lines.push(`- CTR 28j: ${formatPct(p.ctr28)} (${p.clicks28}/${p.impressions28})`);
    lines.push(`- CTR 7j: ${formatPct(p.ctr7)} (${p.clicks7}/${p.impressions7})`);
    if (p.associatedPages?.length) {
      lines.push("- Pages satellites associees:");
      for (const child of p.associatedPages) {
        lines.push(
          `- ${child.pathname} | impr28=${child.impressions28} | clics28=${child.clicks28} | ctr28=${formatPct(child.ctr28)} | pos28=${child.pos28.toFixed(2)}`,
        );
      }
    }
    if (p.recommendations?.error) {
      lines.push(`- Erreur IA: ${p.recommendations.error}`);
      continue;
    }

    lines.push("");
    lines.push("Diagnostic:");
    lines.push(p.recommendations.diagnostic);
    lines.push("");
    lines.push("Titles proposes:");
    for (const title of p.recommendations.titleSuggestions) lines.push(`- ${title}`);
    lines.push("");
    lines.push("Metas proposees:");
    for (const meta of p.recommendations.metaSuggestions) lines.push(`- ${meta}`);
    lines.push("");
    lines.push("Quick wins UX:");
    for (const ux of p.recommendations.uxQuickWins) lines.push(`- ${ux}`);
    lines.push("");
    if (p.recommendations.internalLinkingRecommendations?.length) {
      lines.push("Recommandations de maillage:");
      for (const item of p.recommendations.internalLinkingRecommendations) lines.push(`- ${item}`);
      lines.push("");
    }
    lines.push("Actions prioritaires:");
    for (const action of p.recommendations.priorityActions) lines.push(`- ${action}`);
  }

  lines.push("");
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv);
  const dateStamp = formatDateStamp();

  const { d7, d28 } = loadSearchConsolePerf(options.inputDir);
  const baseCandidates =
    options.strategy === "hub-first" ? detectHubCandidates(d7, d28, options) : detectCandidates(d7, d28, options);
  const enriched =
    options.strategy === "hub-first" ? enrichHubsWithPageContent(baseCandidates) : enrichWithPageContent(baseCandidates);

  if (!enriched.length) {
    console.log("Aucune page ne correspond aux seuils. Ajuste --min-impressions ou --max-ctr.");
    return;
  }

  const apiKey = options.dryRun ? null : ensureApiKey();

  console.log(`Pages candidates: ${enriched.length}`);
  const analyzed = [];
  for (let i = 0; i < enriched.length; i += 1) {
    const page = enriched[i];
    console.log(`[${i + 1}/${enriched.length}] Analyse IA: ${page.pathname}`);

    if (options.dryRun) {
      analyzed.push({
        ...page,
        recommendations: {
          diagnostic: "dry-run actif: appel OpenAI saute.",
          titleSuggestions: [],
          metaSuggestions: [],
          uxQuickWins: [],
          priorityActions: [],
        },
      });
      continue;
    }

    try {
      const recommendations =
        options.strategy === "hub-first" ? await requestOpenAiHub(apiKey, page) : await requestOpenAi(apiKey, page);
      analyzed.push({ ...page, recommendations });
    } catch (error) {
      analyzed.push({
        ...page,
        recommendations: {
          error: error.message,
          diagnostic: "",
          titleSuggestions: [],
          metaSuggestions: [],
          uxQuickWins: [],
          priorityActions: [],
        },
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    inputDir: path.resolve(process.cwd(), options.inputDir),
    model: OPENAI_MODEL,
    strategy: options.strategy,
    thresholds: {
      minImpressions: options.minImpressions,
      maxCtr: options.maxCtr,
      maxPages: options.maxPages,
      pseoOnly: options.pseoOnly,
    },
    sources: {
      days7: d7.workbookPath,
      days28: d28.workbookPath,
    },
    summary: {
      analyzedPages: analyzed.length,
    },
    pages: analyzed,
  };

  const outputBase =
    options.reportPrefix ||
    `search-console-openai-reco-${dateStamp}`;
  const reportsDir = path.resolve(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const jsonPath = path.join(reportsDir, `${outputBase}.json`);
  const mdPath = path.join(reportsDir, `${outputBase}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, `${buildMarkdownReport(report)}\n`, "utf8");

  console.log(`Rapport JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Rapport Markdown: ${path.relative(process.cwd(), mdPath)}`);
}

main().catch((error) => {
  console.error(`Echec analyse Search Console + OpenAI: ${error.message}`);
  process.exit(1);
});
