#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { setTimeout: wait } = require("timers/promises");

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

const API_URL =
  process.env.DEEPSEEK_API_URL ||
  "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || null;

if (!fs.existsSync(CLEAN)) {
  console.error("Missing", CLEAN);
  process.exit(2);
}

const masterPromptTemplate = fs.readFileSync(PROMPT_FILE, "utf8");
const clean = JSON.parse(fs.readFileSync(CLEAN, "utf8"));
const utils = require(path.join(__dirname, "deepseek-utils.cjs"));

const codeArg = process.argv[2] || "93";
const codeDesired = String(codeArg)
  .toUpperCase()
  .replace(/\s+/g, "")
  .replace(/\W+/g, "");

const item = clean.find((it) => {
  const codeRaw = String(
    it.code || it.departement_numero || it.departement || ""
  ).toUpperCase();
  const safe = codeRaw.replace(/\s+/g, "").replace(/\W+/g, "");
  return safe === codeDesired;
});

if (!item) {
  console.error("Department not found for code", codeDesired);
  process.exit(3);
}

(async function main() {
  try {
    const codeRaw = String(
      item.code || item.departement_numero || ""
    ).toUpperCase();
    const codeSafe = codeRaw.replace(/\s+/g, "").replace(/\W+/g, "");
    const deptName = item.nom || item.departement_nom || "";
    const region = item.region || "";
    const prix_m2 = item.prix_m2_median || item.prix_m2 || null;

    // Build enriched input with jitter and hints
    const basePrix = prix_m2 || item.prix_m2_median || null;
    const mutationsBase = item.mutations || item.mutations_total || 0;
    const ventesBase = item.ventes || 0;
    const maisonsBase = item.maisons || 0;
    const appartBase = item.appartements || 0;

    const prix_m2_jitter = basePrix ? utils.jitterMoney(basePrix, 10) : null;
    const mutations_jitter = utils.jitterInt(mutationsBase, 0.035);
    const ventes_jitter = utils.jitterInt(ventesBase, 0.035);
    const maisons_jitter = utils.jitterInt(maisonsBase, 0.04);
    const appart_jitter = utils.jitterInt(appartBase, 0.04);

    // derive proportions if possible
    let prop_maisons = null;
    if (maisons_jitter + appart_jitter > 0) {
      prop_maisons = +(
        maisons_jitter /
        (maisons_jitter + appart_jitter)
      ).toFixed(3);
    }

    const ancien_pct = utils.randomPercentRange(6.8, 8.0);
    const neuf_pct = utils.randomPercentRange(2.0, 3.2);
    const structure_variant =
      item.structure_variant || utils.pickStructureVariant();
    const notaire_hint = utils.notaireHint(
      item.nom || deptName,
      (item.villes && item.villes[0] && item.villes[0].nom) || null
    );

    // Helper: deterministic pseudo-random from department code for reproducible variations
    function hashTo01(s) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++)
        h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
      return (h % 100000) / 100000;
    }

    function coordFromCode(code) {
      const t = hashTo01(String(code));
      const lat = 41 + t * 10; // 41..51
      const lon = -5 + hashTo01(String(code) + "x") * 14; // -5..9
      return { lat: +lat.toFixed(5), lon: +lon.toFixed(5) };
    }

    function buildTableHtml(prixMedian) {
      // choose extra line: low or very high depending on median
      const extraHigh = prixMedian && prixMedian > 4000;
      const extraLine = extraHigh ? 1000000 : 150000;
      const rows = [500000, 400000, 650000, 900000, extraLine];
      // sometimes put 500k first
      if (hashTo01(codeSafe) > 0.5)
        rows.unshift(rows.splice(rows.indexOf(500000), 1)[0]);

      // maybe change header label in ~30% cases
      const ancienLabel =
        hashTo01(codeSafe + "lbl") > 0.7
          ? "Droits + émoluments (ancien)"
          : "Frais ancien";

      const ancienPct = ancien_pct; // already jittered
      const neufPct = neuf_pct;

      const makeRow = (price) => {
        const fraisAncien = Math.round(price * (ancienPct / 100));
        const fraisNeuf = Math.round(price * (neufPct / 100));
        const eco = fraisAncien - fraisNeuf;
        return `<tr><td>${price.toLocaleString(
          "fr-FR"
        )} €</td><td>${fraisAncien.toLocaleString(
          "fr-FR"
        )} €</td><td>${fraisNeuf.toLocaleString(
          "fr-FR"
        )} €</td><td>${eco.toLocaleString("fr-FR")} €</td></tr>`;
      };

      const rowsHtml = rows.map(makeRow).join("\n");
      return `<table><thead><tr><th>Prix du bien</th><th>${ancienLabel}</th><th>Frais neuf</th><th>Économie</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;
    }

    function buildLocalAdvices(name, villes) {
      const city =
        (villes && villes[0] && villes[0].nom) || (villes && villes[0]) || name;
      const adv1 = `Dans ${city}, vérifiez les périmètres de rénovation urbaine : certaines aides locales réduisent les coûts de travaux.`;
      const adv2 = `Consultez la mairie de ${city} pour connaître les dispositifs d'exonération temporaires sur la taxe foncière lors de nouvelles constructions.`;
      // ensure short (<=25 words)
      return [adv1, adv2].map((s) => s.split("\n").join(" ").trim());
    }

    function buildLocalFaqs(name, code) {
      const q1 = `Peut-on financer les frais de notaire par un prêt local si l'on est frontalier ${name}?`;
      const a1 = `Certains établissements locaux proposent des prêts spécifiques pour les frontaliers; rapprochez-vous des banques de la zone pour une offre personnalisée.`;
      const q2 = `Existe-t-il une surtaxe pour les résidences secondaires dans le ${name} ?`;
      const a2 = `La fiscalité locale varie selon les communes : certaines appliquent des majorations, vérifiez auprès de la commune concernée.`;
      return [
        { q: q1, a: a1 },
        { q: q2, a: a2 },
      ];
    }

    function shuffleSources() {
      const base = [
        { label: "Tarif 2025 – CSN", url: "https://notaires.fr" },
        {
          label: "Base DVF 2024 – DGFiP",
          url: "https://data.dvf.etalab.gouv.fr",
        },
        {
          label: "Annuaire – notaires.fr",
          url: "https://annuaire.notaires.fr",
        },
        { label: `Stats démo – INSEE ${region}`, url: "https://insee.fr" },
      ];
      // deterministic shuffle
      const t = hashTo01(codeSafe);
      for (let i = 0; i < base.length; i++) {
        const j = Math.floor(((t + i * 0.13) % 1) * base.length);
        const tmp = base[i];
        base[i] = base[j];
        base[j] = tmp;
      }
      return base;
    }

    const table_html = buildTableHtml(basePrix);
    const local_advices = buildLocalAdvices(deptName, item.villes || []);
    const local_faqs = buildLocalFaqs(deptName, codeSafe);
    const sources_shuffled = shuffleSources();
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "Place",
      name: deptName,
      identifier: `DEP-${codeSafe}`,
      geo: coordFromCode(codeSafe),
      priceMedian: basePrix,
    };

    const input = {
      departement_nom: deptName,
      departement_numero: codeSafe,
      prix_m2: prix_m2_jitter,
      mutations: mutations_jitter,
      ventes: ventes_jitter,
      maisons: maisons_jitter,
      appartements: appart_jitter,
      proportion_maisons: prop_maisons,
      villes: item.villes || [],
      region: region,
      template: item.template || ["A", "B", "C"][Math.floor(Math.random() * 3)],
      ancien_pct,
      neuf_pct,
      structure_variant,
      notaire_hint,
    };

    const prompt = masterPromptTemplate.replace(
      "{{input}}",
      JSON.stringify(input, null, 2)
    );

    const payload = {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are DeepSeek." },
        { role: "user", content: prompt },
      ],
      max_tokens: 8000,
    };

    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.mkdirSync(PAGES_DIR, { recursive: true });

    const outPath = path.join(OUT_DIR, `request-${codeSafe}.json`);
    fs.writeFileSync(
      outPath,
      JSON.stringify({ payload, input, apiUrl: API_URL }, null, 2),
      "utf8"
    );
    console.log("Wrote request payload to", outPath);

    if (!API_KEY)
      throw new Error("DEEPSEEK_API_KEY not set in environment (.env)");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error ${res.status}: ${txt}`);
    }

    const data = await res.json();
    // Extract HTML content from response
    let html = null;
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      html = data.choices[0].message.content;
    } else if (data.output_html) {
      html = data.output_html;
    } else if (data.content) {
      html = data.content;
    } else {
      html = JSON.stringify(data, null, 2);
    }

    const pagePath = path.join(PAGES_DIR, `frais-notaire-${codeSafe}.html`);
    if (fs.existsSync(pagePath)) {
      const bak =
        pagePath + ".bak." + new Date().toISOString().replace(/[:.]/g, "-");
      fs.copyFileSync(pagePath, bak);
      console.log("Backed up", pagePath, "->", bak);
    }

    fs.writeFileSync(pagePath, html, "utf8");
    console.log("Wrote page", pagePath);

    // polite wait
    await wait(1200);
    console.log("Done");
  } catch (err) {
    console.error("Error:", err && err.message ? err.message : err);
    process.exit(1);
  }
})();
