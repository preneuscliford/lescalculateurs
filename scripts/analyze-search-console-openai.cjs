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
    minPosition: Number.parseFloat(args.get("min-position") || "4"),
    maxPosition: Number.parseFloat(args.get("max-position") || "12"),
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

function isPseoPath(pathname) {
  const segments = getSegments(pathname);
  return segments.length >= 3 && segments[0] === "pages";
}

function inferPageType(page) {
  if (page.associatedPages?.length && isHubPath(page.pathname)) {
    return "hub";
  }

  if (isPseoPath(page.pathname)) {
    return "pseo";
  }

  return "ymyl_pillar";
}

function isWithinPositionWindow(position, options) {
  if (!Number.isFinite(position) || position <= 0) return false;
  return position >= options.minPosition && position <= options.maxPosition;
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

function buildPriorityScore(page, options) {
  const position = Math.max(page.pos28 || 0, 1);
  const ctrPenalty = 1 - Math.min(Math.max(page.ctr28 || 0, 0), 1);
  const positionBoost = isWithinPositionWindow(position, options) ? 1.25 : 0.35;
  return page.impressions28 * ctrPenalty * (1 / position) * positionBoost;
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
    if (!isWithinPositionWindow(v28.position, options)) continue;

    const opportunityScore = v28.impressions * (1 - v28.ctr) * (1 / Math.max(v28.position, 1));
    const page = {
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

    scored.push({
      ...page,
      priorityScore: buildPriorityScore(page, options),
    });
  }

  scored.sort((a, b) => b.priorityScore - a.priorityScore);
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
    .filter((page) => isWithinPositionWindow(page.pos28, options))
    .map((page) => ({ ...page, priorityScore: buildPriorityScore(page, options) }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
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
      pageType: "hub",
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
        pageType: item.pageType || inferPageType(item),
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
      pageType: item.pageType || inferPageType(item),
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

function buildAssociatedSummary(page) {
  return (page.associatedPages || [])
    .map(
      (child, index) =>
        `${index + 1}. ${child.pathname} | impr28=${child.impressions28} | clics28=${child.clicks28} | ctr28=${(child.ctr28 * 100).toFixed(2)}% | pos28=${child.pos28.toFixed(2)}`,
    )
    .join("\n");
}

function buildTypeSpecificInstructions(page) {
  if (page.pageType === "hub") {
    return [
      "Type de page: hub.",
      "Le hub doit optimiser: title/meta, reponse directe, bloc situations, navigation vers satellites et CTA principal.",
      "Les recommandations doivent favoriser le hub sans cannibaliser les pages pSEO associees.",
      "Associer chaque suggestion de maillage a des satellites reellement utiles.",
    ].join("\n");
  }

  if (page.pageType === "pseo") {
    return [
      "Type de page: pSEO.",
      "La page doit optimiser: promesse de recherche, cas concret, snippet reponse directe, featured snippet potential, et lien de retour vers le hub parent.",
      "Ne propose pas de gros blocs generiques: reste specifique au scenario.",
    ].join("\n");
  }

  return [
    "Type de page: YMYL/pilier.",
    "Les recommandations doivent rester prudentes et ne pas encourager de reecriture agressive.",
    "Prioriser titre, meta, reponse directe, clarté above-the-fold, structure FAQ et CTA sobres.",
  ].join("\n");
}

function buildPrompt(page) {
  const associatedSummary = buildAssociatedSummary(page);

  return [
    {
      role: "system",
      content:
        "Tu es un expert SEO CTR Google pour un site francais de simulateurs et contenus YMYL. Tu rends une analyse strictement exploitable, concrete, prudente et sans jargon interne.",
    },
    {
      role: "user",
      content: [
        "Analyse cette page et renvoie uniquement des recommandations de faible ou moyen risque editorial.",
        `Type de page detecte: ${page.pageType}`,
        `URL: ${page.url}`,
        `Path: ${page.pathname}`,
        `Fichier local: ${page.filePath || "(introuvable)"}`,
        `Title actuel: ${page.title || "(inconnu)"}`,
        `H1 actuel: ${page.h1 || "(inconnu)"}`,
        `Meta description actuelle: ${page.metaDescription || "(inconnue)"}`,
        `Donnees 28 jours: impressions=${page.impressions28}, clics=${page.clicks28}, ctr=${(page.ctr28 * 100).toFixed(2)}%, position=${page.pos28.toFixed(2)}`,
        `Donnees 7 jours: impressions=${page.impressions7}, clics=${page.clicks7}, ctr=${(page.ctr7 * 100).toFixed(2)}%, position=${page.pos7 ? page.pos7.toFixed(2) : "0.00"}`,
        `Priority score: ${(page.priorityScore || 0).toFixed(2)}`,
        `Extrait de page: ${page.excerpt || "(non disponible)"}`,
        associatedSummary ? `Pages associees:\n${associatedSummary}` : "Pages associees: (aucune)",
        "",
        "Objectif de sortie:",
        "1) diagnostic du probleme de CTR / positionnement",
        "2) 3 titles optimises",
        "3) 2 meta descriptions optimisees",
        "4) 1 reponse directe type snippet",
        "5) 1 proposition above-the-fold",
        "6) recommandations de liens internes",
        "7) 3 actions prioritaires classees",
        "8) un bloc safe_apply_candidates reserve aux changements faibles risques",
        "",
        "Contraintes:",
        "- Francais naturel et humain.",
        "- Pas de jargon interne ni de formulation robotique.",
        "- Ne pas inventer de chiffres non justifies.",
        "- Rester prudent sur les pages YMYL/pilier.",
        "- Les suggestions doivent etre directement utilisables par un autre agent pour implementation manuelle.",
        "",
        buildTypeSpecificInstructions(page),
      ].join("\n"),
    },
  ];
}

function buildRecommendationSchema() {
  const stringArray3 = {
    type: "array",
    minItems: 3,
    maxItems: 3,
    items: { type: "string" },
  };

  return {
    type: "object",
    additionalProperties: false,
    properties: {
      pageType: {
        type: "string",
        enum: ["hub", "pseo", "ymyl_pillar"],
      },
      diagnostic: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: { type: "string" },
          primaryIssue: { type: "string" },
          whyNow: { type: "string" },
        },
        required: ["summary", "primaryIssue", "whyNow"],
      },
      titles: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            value: { type: "string" },
            reason: { type: "string" },
          },
          required: ["value", "reason"],
        },
      },
      metas: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            value: { type: "string" },
            reason: { type: "string" },
          },
          required: ["value", "reason"],
        },
      },
      snippet_answer: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
      above_the_fold: {
        type: "object",
        additionalProperties: false,
        properties: {
          intro: { type: "string" },
          cta: { type: "string" },
          trust_signal: { type: "string" },
        },
        required: ["intro", "cta", "trust_signal"],
      },
      internal_links: {
        type: "object",
        additionalProperties: false,
        properties: {
          strategy: { type: "string" },
          suggestions: stringArray3,
        },
        required: ["strategy", "suggestions"],
      },
      priority_actions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            action: { type: "string" },
            impact: { type: "string", enum: ["high", "medium", "low"] },
            risk: { type: "string", enum: ["low", "medium"] },
          },
          required: ["action", "impact", "risk"],
        },
      },
      safe_apply_candidates: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          meta: { type: "string" },
          snippet_answer: { type: "string" },
          above_the_fold_intro: { type: "string" },
          cta: { type: "string" },
          notes: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string" },
          },
        },
        required: ["title", "meta", "snippet_answer", "above_the_fold_intro", "cta", "notes"],
      },
    },
    required: [
      "pageType",
      "diagnostic",
      "titles",
      "metas",
      "snippet_answer",
      "above_the_fold",
      "internal_links",
      "priority_actions",
      "safe_apply_candidates",
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
          name: "seo_ctr_reco_v2",
          schema: buildRecommendationSchema(),
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
  lines.push(`- Fenetre position cible: \`${result.thresholds.minPosition}\` a \`${result.thresholds.maxPosition}\``);
  lines.push(`- Pages analysees: \`${result.summary.analyzedPages}\``);
  lines.push(`- Modele OpenAI: \`${result.model}\``);
  lines.push(`- Strategie: \`${result.strategy}\``);
  lines.push("");
  lines.push("## Pages prioritaires");
  lines.push("| Page | Type | Impr 28j | Clics 28j | CTR 28j | Pos 28j | Priority Score |");
  lines.push("|---|---|---:|---:|---:|---:|---:|");
  for (const p of result.pages) {
    lines.push(
      `| ${p.pathname} | ${p.pageType} | ${p.impressions28} | ${p.clicks28} | ${formatPct(p.ctr28)} | ${p.pos28.toFixed(2)} | ${(p.priorityScore || 0).toFixed(2)} |`,
    );
  }

  for (const p of result.pages) {
    lines.push("");
    lines.push(`## ${p.pathname}`);
    lines.push(`- Type detecte: ${p.pageType}`);
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
    lines.push(`- Resume: ${p.recommendations.diagnostic.summary}`);
    lines.push(`- Probleme principal: ${p.recommendations.diagnostic.primaryIssue}`);
    lines.push(`- Pourquoi maintenant: ${p.recommendations.diagnostic.whyNow}`);
    lines.push("");
    lines.push("Titles proposes:");
    for (const title of p.recommendations.titles) lines.push(`- ${title.value} — ${title.reason}`);
    lines.push("");
    lines.push("Metas proposees:");
    for (const meta of p.recommendations.metas) lines.push(`- ${meta.value} — ${meta.reason}`);
    lines.push("");
    lines.push("Snippet answer:");
    lines.push(`- ${p.recommendations.snippet_answer.question}`);
    lines.push(`- ${p.recommendations.snippet_answer.answer}`);
    lines.push("");
    lines.push("Above the fold:");
    lines.push(`- Intro: ${p.recommendations.above_the_fold.intro}`);
    lines.push(`- CTA: ${p.recommendations.above_the_fold.cta}`);
    lines.push(`- Signal de confiance: ${p.recommendations.above_the_fold.trust_signal}`);
    lines.push("");
    lines.push("Recommandations de maillage:");
    lines.push(`- Strategie: ${p.recommendations.internal_links.strategy}`);
    for (const item of p.recommendations.internal_links.suggestions) lines.push(`- ${item}`);
    lines.push("");
    lines.push("Actions prioritaires:");
    for (const action of p.recommendations.priority_actions) {
      lines.push(`- [impact=${action.impact}][risk=${action.risk}] ${action.action}`);
    }
    lines.push("");
    lines.push("Safe apply candidates:");
    lines.push(`- Title: ${p.recommendations.safe_apply_candidates.title}`);
    lines.push(`- Meta: ${p.recommendations.safe_apply_candidates.meta}`);
    lines.push(`- Snippet: ${p.recommendations.safe_apply_candidates.snippet_answer}`);
    lines.push(`- Intro: ${p.recommendations.safe_apply_candidates.above_the_fold_intro}`);
    lines.push(`- CTA: ${p.recommendations.safe_apply_candidates.cta}`);
    for (const note of p.recommendations.safe_apply_candidates.notes) lines.push(`- Note: ${note}`);
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
          pageType: page.pageType,
          diagnostic: {
            summary: "dry-run actif: appel OpenAI saute.",
            primaryIssue: "analyse non executee",
            whyNow: "aucune reponse modele en dry-run",
          },
          titles: [
            { value: "", reason: "" },
            { value: "", reason: "" },
            { value: "", reason: "" },
          ],
          metas: [
            { value: "", reason: "" },
            { value: "", reason: "" },
          ],
          snippet_answer: {
            question: "",
            answer: "",
          },
          above_the_fold: {
            intro: "",
            cta: "",
            trust_signal: "",
          },
          internal_links: {
            strategy: "",
            suggestions: ["", "", ""],
          },
          priority_actions: [
            { action: "", impact: "medium", risk: "low" },
            { action: "", impact: "medium", risk: "low" },
            { action: "", impact: "medium", risk: "low" },
          ],
          safe_apply_candidates: {
            title: "",
            meta: "",
            snippet_answer: "",
            above_the_fold_intro: "",
            cta: "",
            notes: ["", ""],
          },
        },
      });
      continue;
    }

    try {
      const recommendations = await requestOpenAi(apiKey, page);
      analyzed.push({ ...page, recommendations });
    } catch (error) {
      analyzed.push({
        ...page,
        recommendations: {
          error: error.message,
          pageType: page.pageType,
          diagnostic: {
            summary: "",
            primaryIssue: "",
            whyNow: "",
          },
          titles: [],
          metas: [],
          snippet_answer: {
            question: "",
            answer: "",
          },
          above_the_fold: {
            intro: "",
            cta: "",
            trust_signal: "",
          },
          internal_links: {
            strategy: "",
            suggestions: [],
          },
          priority_actions: [],
          safe_apply_candidates: {
            title: "",
            meta: "",
            snippet_answer: "",
            above_the_fold_intro: "",
            cta: "",
            notes: [],
          },
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
      minPosition: options.minPosition,
      maxPosition: options.maxPosition,
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
    `search-console-openai-reco-v2-${dateStamp}`;
  const reportsDir = path.resolve(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const jsonPath = path.join(reportsDir, `${outputBase}.json`);
  const mdPath = path.join(reportsDir, `${outputBase}.md`);
  const latestJsonPath = path.join(reportsDir, "search-console-openai-reco-v2-latest.json");
  const latestMdPath = path.join(reportsDir, "search-console-openai-reco-v2-latest.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, `${buildMarkdownReport(report)}\n`, "utf8");
  fs.writeFileSync(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(latestMdPath, `${buildMarkdownReport(report)}\n`, "utf8");

  console.log(`Rapport JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Rapport Markdown: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`Rapport JSON latest: ${path.relative(process.cwd(), latestJsonPath)}`);
  console.log(`Rapport Markdown latest: ${path.relative(process.cwd(), latestMdPath)}`);
}

main().catch((error) => {
  console.error(`Echec analyse Search Console + OpenAI: ${error.message}`);
  process.exit(1);
});
