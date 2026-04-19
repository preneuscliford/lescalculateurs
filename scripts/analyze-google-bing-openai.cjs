#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadEnvFile } = require("./lib/load-env.cjs");

loadEnvFile();

const OPENAI_API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

function parseArgs(argv) {
  const args = new Map();
  for (const raw of argv.slice(2)) {
    if (!raw.startsWith("--")) continue;
    const [key, ...rest] = raw.slice(2).split("=");
    args.set(key, rest.length ? rest.join("=") : "true");
  }

  return {
    input: args.get("input") || "reports/google-bing-merged-priority-latest.json",
    top: Number.parseInt(args.get("top") || "12", 10),
    output: args.get("output") || "",
    dryRun: args.get("dry-run") === "true",
  };
}

function ensureApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant dans .env");
  }
  return apiKey;
}

function decodeEntities(text) {
  return String(text || "")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&ocirc;/g, "ô")
    .replace(/&ucirc;/g, "û")
    .replace(/&rsquo;/g, "’")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

function extractTag(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeEntities(match[1].replace(/\s+/g, " ").trim()) : "";
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  return match ? decodeEntities(match[1].trim()) : "";
}

function extractH2s(html, limit = 8) {
  const matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  return matches
    .slice(0, limit)
    .map((match) => decodeEntities(match[1].replace(/\s+/g, " ").trim()))
    .filter(Boolean);
}

function extractPlainText(html, limit = 1200) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  ).slice(0, limit);
}

function readPageContext(item) {
  if (!item.filePath) {
    return {
      title: "",
      metaDescription: "",
      h1: "",
      h2s: [],
      excerpt: "",
    };
  }

  const absolute = path.resolve(process.cwd(), item.filePath);
  if (!fs.existsSync(absolute)) {
    return {
      title: "",
      metaDescription: "",
      h1: "",
      h2s: [],
      excerpt: "",
    };
  }

  const raw = fs.readFileSync(absolute, "utf8");
  return {
    title: extractTag(raw, "title"),
    metaDescription: extractMetaDescription(raw),
    h1: extractTag(raw, "h1"),
    h2s: extractH2s(raw),
    excerpt: extractPlainText(raw),
  };
}

function buildPrompt(item, context) {
  const bingKeywords = (item.bing?.keywords || [])
    .slice(0, 8)
    .map(
      (keyword, index) =>
        `${index + 1}. ${keyword.keyword} | impr=${keyword.impressions} | clics=${keyword.clicks} | ctr=${(keyword.ctr * 100).toFixed(2)}% | pos=${keyword.position.toFixed(2)}`,
    )
    .join("\n");

  const googleSummary = item.google
    ? `Google: ${item.google.impressions} impressions, ${item.google.clicks} clics, CTR ${(item.google.ctr * 100).toFixed(2)}%, position ${item.google.position.toFixed(2)}`
    : "Google: aucun signal direct retenu";

  const bingSummary = item.bing
    ? `Bing: ${item.bing.impressions} impressions, ${item.bing.clicks} clics, CTR ${(item.bing.ctr * 100).toFixed(2)}%, position ${item.bing.position.toFixed(2)}`
    : "Bing: aucun signal direct retenu";

  return [
    {
      role: "system",
      content:
        "Tu es un expert SEO francophone charge de preparer un brief de correction pour Claude. Tu ne reecris pas toute la page. Tu indiques uniquement ou corriger, quoi ajuster et pourquoi, avec prudence sur les pages YMYL.",
    },
    {
      role: "user",
      content: [
        "Analyse cette page prioritaire a partir des signaux Google + Bing.",
        `Page cible: ${item.page || "(a definir)"}`,
        `Type: ${item.pageType}`,
        `Fichier local: ${item.filePath || "(introuvable)"}`,
        `Score fusionne: ${item.mergedScore.toFixed(2)}`,
        googleSummary,
        bingSummary,
        `Title actuel: ${context.title || "(inconnu)"}`,
        `Meta actuelle: ${context.metaDescription || "(inconnue)"}`,
        `H1 actuel: ${context.h1 || "(inconnu)"}`,
        `H2 actuels: ${(context.h2s || []).join(" | ") || "(aucun)"} `,
        `Extrait visible: ${context.excerpt || "(non disponible)"}`,
        "",
        "Keywords Bing a exploiter:",
        bingKeywords || "(aucun)",
        "",
        "Objectif:",
        "Donner a Claude un plan de correction ultra concret sans reecriture globale.",
        "",
        "Contraintes:",
        "- Francais naturel.",
        "- Prioriser les zones a corriger: title, meta, hero, reponse directe, CTA, FAQ, maillage, bloc calcul si pertinent.",
        "- Si la page est YMYL/pilier, rester prudent et ne pas recommander de promesses agressives.",
        "- Si la page est pSEO, insister sur promesse, cas concret, featured snippet, lien retour hub.",
        "- S'appuyer explicitement sur les requetes Bing quand elles sont utiles.",
      ].join("\n"),
    },
  ];
}

function buildSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      target_page: { type: "string" },
      page_type: { type: "string", enum: ["hub_or_pillar", "pseo"] },
      priority_summary: { type: "string" },
      correction_zones: {
        type: "array",
        minItems: 4,
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            zone: { type: "string" },
            issue: { type: "string" },
            why_it_matters: { type: "string" },
            claude_instruction: { type: "string" },
          },
          required: ["zone", "issue", "why_it_matters", "claude_instruction"],
        },
      },
      bing_keyword_injections: {
        type: "array",
        minItems: 2,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            keyword: { type: "string" },
            use_in: { type: "string" },
            note: { type: "string" },
          },
          required: ["keyword", "use_in", "note"],
        },
      },
      safe_changes_first: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: { type: "string" },
      },
      claude_brief: {
        type: "object",
        additionalProperties: false,
        properties: {
          objective: { type: "string" },
          must_keep: {
            type: "array",
            minItems: 2,
            maxItems: 5,
            items: { type: "string" },
          },
          must_fix: {
            type: "array",
            minItems: 3,
            maxItems: 8,
            items: { type: "string" },
          },
        },
        required: ["objective", "must_keep", "must_fix"],
      },
    },
    required: [
      "target_page",
      "page_type",
      "priority_summary",
      "correction_zones",
      "bing_keyword_injections",
      "safe_changes_first",
      "claude_brief",
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

async function requestOpenAi(apiKey, item, context) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      store: false,
      reasoning: { effort: "medium" },
      input: buildPrompt(item, context),
      text: {
        format: {
          type: "json_schema",
          name: "google_bing_page_fix_plan",
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
    throw new Error("Reponse OpenAI vide");
  }
  return JSON.parse(content);
}

function buildMarkdown(report) {
  const lines = [];
  lines.push(`# Briefs Claude - Priorites Google + Bing (${report.generatedAt})`);
  lines.push("");
  lines.push("## Parametres");
  lines.push(`- Input: \`${report.input}\``);
  lines.push(`- Modele OpenAI: \`${report.model}\``);
  lines.push(`- Pages analysees: \`${report.summary.analyzedPages}\``);
  lines.push("");

  for (const item of report.items) {
    lines.push(`## ${item.page || item.analysis?.target_page || "(page inconnue)"}`);
    lines.push(`- Fichier local: \`${item.filePath || "introuvable"}\``);
    lines.push(`- Type: ${item.pageType}`);
    lines.push(`- Score fusionne: ${item.mergedScore.toFixed(2)}`);

    if (item.analysis?.error) {
      lines.push(`- Erreur IA: ${item.analysis.error}`);
      lines.push("");
      continue;
    }

    lines.push(`- Resume priorite: ${item.analysis.priority_summary}`);
    lines.push("");
    lines.push("Zones a corriger:");
    for (const zone of item.analysis.correction_zones) {
      lines.push(`- ${zone.zone}: ${zone.issue}`);
      lines.push(`  Pourquoi: ${zone.why_it_matters}`);
      lines.push(`  Instruction Claude: ${zone.claude_instruction}`);
    }

    lines.push("");
    lines.push("Keywords Bing a injecter:");
    for (const keyword of item.analysis.bing_keyword_injections) {
      lines.push(`- ${keyword.keyword} -> ${keyword.use_in} (${keyword.note})`);
    }

    lines.push("");
    lines.push("Safe changes first:");
    for (const change of item.analysis.safe_changes_first) {
      lines.push(`- ${change}`);
    }

    lines.push("");
    lines.push("Brief Claude:");
    lines.push(`- Objectif: ${item.analysis.claude_brief.objective}`);
    lines.push("- A conserver:");
    for (const keep of item.analysis.claude_brief.must_keep) {
      lines.push(`  - ${keep}`);
    }
    lines.push("- A corriger:");
    for (const fix of item.analysis.claude_brief.must_fix) {
      lines.push(`  - ${fix}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv);
  const inputPath = path.resolve(process.cwd(), options.input);
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const selected = (input.merged || []).slice(0, Math.max(1, options.top));
  const apiKey = options.dryRun ? null : ensureApiKey();

  const analyzed = [];
  for (let index = 0; index < selected.length; index += 1) {
    const item = selected[index];
    const context = readPageContext(item);
    console.log(`[${index + 1}/${selected.length}] Brief OpenAI: ${item.page || item.bing?.cluster || "unknown"}`);

    if (options.dryRun) {
      analyzed.push({
        ...item,
        analysis: {
          target_page: item.page || "",
          page_type: item.pageType === "pseo" ? "pseo" : "hub_or_pillar",
          priority_summary: "dry-run actif",
          correction_zones: [],
          bing_keyword_injections: [],
          safe_changes_first: [],
          claude_brief: {
            objective: "",
            must_keep: [],
            must_fix: [],
          },
        },
      });
      continue;
    }

    try {
      const analysis = await requestOpenAi(apiKey, item, context);
      analyzed.push({ ...item, analysis });
    } catch (error) {
      analyzed.push({
        ...item,
        analysis: {
          error: error.message,
        },
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    input: path.relative(process.cwd(), inputPath),
    model: OPENAI_MODEL,
    summary: {
      analyzedPages: analyzed.length,
    },
    items: analyzed,
  };

  const reportsDir = path.resolve(process.cwd(), "reports");
  const baseName = options.output || `google-bing-openai-briefs-${new Date().toISOString().slice(0, 10)}`;
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const mdPath = path.join(reportsDir, `${baseName}.md`);
  const latestJsonPath = path.join(reportsDir, "google-bing-openai-briefs-latest.json");
  const latestMdPath = path.join(reportsDir, "google-bing-openai-briefs-latest.md");

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, `${buildMarkdown(report)}\n`, "utf8");
  fs.writeFileSync(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(latestMdPath, `${buildMarkdown(report)}\n`, "utf8");

  console.log(`Rapport JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Rapport Markdown: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`Rapport latest JSON: ${path.relative(process.cwd(), latestJsonPath)}`);
  console.log(`Rapport latest Markdown: ${path.relative(process.cwd(), latestMdPath)}`);
}

main().catch((error) => {
  console.error(`Echec analyse Google+Bing+OpenAI: ${error.message}`);
  process.exit(1);
});
