#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const REQ_DIR = path.join(root, "reports", "deepseek-requests");
const OUT_DIR = path.join(root, "reports", "finalize-dryrun");

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function summarizeInput(input) {
  return {
    departement_nom: input.departement_nom,
    departement_numero: input.departement_numero,
    prix_m2: input.prix_m2,
    ancien_pct: input.ancien_pct,
    neuf_pct: input.neuf_pct,
    has_table_html: !!input.table_html,
    local_advices_count: (input.local_advices || []).length,
    local_faqs_count: (input.local_faqs || []).length,
    has_sources: !!(input.sources_shuffled || input.sources),
    has_jsonld: !!input.jsonld,
  };
}

ensureDir(OUT_DIR);

const files = fs
  .readdirSync(REQ_DIR)
  .filter((f) => f.startsWith("request-") && f.endsWith(".json"));
const summary = { total: files.length, missing_pages: [], items: [] };

files.forEach((f) => {
  try {
    const full = path.join(REQ_DIR, f);
    const j = JSON.parse(fs.readFileSync(full, "utf8"));
    const input = j.input || j;
    const code =
      String(
        (input.departement_numero || input.departement || "").toString()
      ).padStart(2, "0") || f.replace(/request-|\.json/g, "");
    const out = {
      code,
      summary: summarizeInput(input),
      sample_table_html: (input.table_html || "").slice(0, 1000),
      sample_local_advices: input.local_advices || input.localAdvices || [],
      sample_local_faqs: input.local_faqs || input.localFaqs || [],
      sample_sources: input.sources_shuffled || input.sources || [],
      jsonld: input.jsonld || null,
    };
    fs.writeFileSync(
      path.join(OUT_DIR, `dryrun-${code}.json`),
      JSON.stringify(out, null, 2),
      "utf8"
    );
    summary.items.push({ code, summary: out.summary });
  } catch (e) {
    console.error("err", f, e && e.message);
  }
});

fs.writeFileSync(
  path.join(OUT_DIR, "summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8"
);
console.log("Dry-run reports written to", OUT_DIR);
