#!/usr/bin/env node
/**
 * Revenu médian par commune — Insee Filosofi 2023.
 *
 * Entrée : le CSV « Revenus et pauvreté des ménages en 2023 - Tous les niveaux
 * géographiques » (https://www.insee.fr/fr/statistiques/8984752, FILOSOFI_CC_csv.zip),
 * décompressé.
 *
 * Sorties :
 *   - public/data/revenus-communes-2023.json  (lu par src/utils/revenuCommune.ts)
 *   - les blocs <!-- GEN:xxx --> de src/pages/revenu-median-commune.html
 *     (classement des grandes villes, chiffres clés, FAQ + JSON-LD)
 *
 * Usage :
 *   node scripts/build-revenus-communes-2023.cjs chemin/vers/FILOSOFI_CC.csv [--inspect]
 */

const fs = require("fs");
const path = require("path");
const { writeFiches } = require("./lib/revenus-fiches-2023.cjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_JSON = path.join(ROOT, "public/data/revenus-communes-2023.json");
const PAGE = path.join(ROOT, "src/pages/revenu-median-commune.html");
const SOURCE_URL = "https://www.insee.fr/fr/statistiques/8984752";
const MILLESIME = 2023;

// 40 grandes villes (code Insee de la commune, nom affiché). Paris, Lyon et
// Marseille sont prises au niveau de la commune entière, pas des arrondissements.
const GRANDES_VILLES = [
  ["75056", "Paris"],
  ["13055", "Marseille"],
  ["69123", "Lyon"],
  ["31555", "Toulouse"],
  ["06088", "Nice"],
  ["44109", "Nantes"],
  ["34172", "Montpellier"],
  ["67482", "Strasbourg"],
  ["33063", "Bordeaux"],
  ["59350", "Lille"],
  ["35238", "Rennes"],
  ["83137", "Toulon"],
  ["51454", "Reims"],
  ["42218", "Saint-Étienne"],
  ["76351", "Le Havre"],
  ["69266", "Villeurbanne"],
  ["21231", "Dijon"],
  ["49007", "Angers"],
  ["38185", "Grenoble"],
  ["93066", "Saint-Denis (93)"],
  ["30189", "Nîmes"],
  ["13001", "Aix-en-Provence"],
  ["63113", "Clermont-Ferrand"],
  ["72181", "Le Mans"],
  ["29019", "Brest"],
  ["37261", "Tours"],
  ["80021", "Amiens"],
  ["74010", "Annecy"],
  ["87085", "Limoges"],
  ["57463", "Metz"],
  ["92012", "Boulogne-Billancourt"],
  ["66136", "Perpignan"],
  ["25056", "Besançon"],
  ["45234", "Orléans"],
  ["97411", "Saint-Denis (La Réunion)"],
  ["76540", "Rouen"],
  ["93048", "Montreuil"],
  ["95018", "Argenteuil"],
  ["68224", "Mulhouse"],
  ["14118", "Caen"],
];

// Fiches villes existantes (lien depuis le classement).
const FICHES = {
  75056: "/pages/revenus/paris",
  13055: "/pages/revenus/marseille",
  69123: "/pages/revenus/lyon",
  31555: "/pages/revenus/toulouse",
  "06088": "/pages/revenus/nice",
  44109: "/pages/revenus/nantes",
  34172: "/pages/revenus/montpellier",
  67482: "/pages/revenus/strasbourg",
  33063: "/pages/revenus/bordeaux",
  59350: "/pages/revenus/lille",
};

// ---------------------------------------------------------------------------
// Lecture du CSV Insee
// ---------------------------------------------------------------------------

function parseCsv(file) {
  let txt = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  const firstLine = txt.slice(0, txt.indexOf("\n"));
  const delim =
    (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (inQ) {
      if (ch === '"') {
        if (txt[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === delim) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && txt[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else cur += ch;
  }
  if (cur !== "" || row.length) {
    row.push(cur);
    rows.push(row);
  }
  const header = rows.shift().map((h) => h.trim());
  return { header, rows, delim };
}

function num(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().replace(/\s/g, "").replace(",", ".");
  if (!s || /^(s|nd|vm|na|n\/a|-)$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalise le fichier en Map<geoKey, {level, code, label, measures:{}}>.
 * Gère le format « long » du catalogue Insee (GEO, GEO_OBJECT, FILOSOFI_MEASURE,
 * OBS_VALUE) et un format « large » (CODGEO, LIBGEO, colonnes d'indicateurs).
 */
function normalize({ header, rows }) {
  const idx = (re) => header.findIndex((h) => re.test(h));
  const iGeo = idx(/^GEO$/i);
  const iObj = idx(/^GEO_OBJECT$/i);
  const iMeas = idx(/^FILOSOFI_MEASURE$/i);
  const iVal = idx(/^OBS_VALUE$/i);
  const iLabel = idx(/^(GEO_LABEL|LIBGEO|LIBELLE|NOM)$/i);
  const iTime = idx(/^TIME_PERIOD$/i);
  const iUnit = idx(/^UNIT_MEASURE$/i);
  const extraDims = header
    .map((h, i) => [h, i])
    .filter(([h]) => /^(AGE|AGE_GP|SEX|TSH|OCS|TYPMEN|HOUSEHOLD|UNIT_MULT)$/i.test(h));

  const geo = new Map();
  if (iGeo >= 0 && iMeas >= 0 && iVal >= 0) {
    for (const r of rows) {
      if (iTime >= 0 && r[iTime] && !String(r[iTime]).startsWith(String(MILLESIME))) continue;
      // On ne garde que la population totale si le fichier est ventilé.
      if (
        extraDims.some(
          ([h, i]) => !/^UNIT_MULT$/i.test(h) && r[i] && !/^(_T|T|TOTAL|_Z)$/i.test(r[i]),
        )
      )
        continue;
      const level = iObj >= 0 ? r[iObj] : "?";
      const code = r[iGeo];
      const key = `${level}|${code}`;
      if (!geo.has(key))
        geo.set(key, { level, code, label: iLabel >= 0 ? r[iLabel] : "", measures: {} });
      geo.get(key).measures[r[iMeas]] = num(r[iVal]);
    }
    return { format: "long", geo };
  }

  const iCod = idx(/^CODGEO$/i);
  if (iCod >= 0) {
    for (const r of rows) {
      const code = r[iCod];
      const measures = {};
      header.forEach((h, i) => {
        if (i !== iCod && i !== iLabel) measures[h] = num(r[i]);
      });
      geo.set(`COM|${code}`, { level: "COM", code, label: iLabel >= 0 ? r[iLabel] : "", measures });
    }
    return { format: "wide", geo };
  }

  throw new Error(`Format non reconnu. En-têtes : ${header.join(" | ")}`);
}

/** Libellés des territoires : fichier *_metadata.csv livré avec les données Insee. */
function applyLabels(norm, dataFile) {
  const meta = dataFile.replace(/_data\.csv$/i, "_metadata.csv");
  if (meta === dataFile || !fs.existsSync(meta)) return;
  const { header, rows } = parseCsv(meta);
  const iVar = header.indexOf("COD_VAR");
  const iMod = header.indexOf("COD_MOD");
  const iLib = header.indexOf("LIB_MOD");
  const iObj = header.indexOf("GEO_OBJECT");
  for (const r of rows) {
    if (r[iVar] !== "GEO") continue;
    const g = norm.geo.get(`${r[iObj]}|${r[iMod]}`);
    if (g && !g.label) g.label = r[iLib];
  }
}

function inspect(norm) {
  const levels = {};
  const measures = {};
  for (const g of norm.geo.values()) {
    levels[g.level] = (levels[g.level] || 0) + 1;
    for (const m of Object.keys(g.measures)) measures[m] = (measures[m] || 0) + 1;
  }
  console.log("Format :", norm.format);
  console.log("Niveaux géographiques :", levels);
  console.log("Indicateurs :", measures);
  const sample = [...norm.geo.values()].filter((g) => /COM/i.test(g.level)).slice(0, 3);
  console.log("Exemples communes :", JSON.stringify(sample, null, 1));
  const fr = [...norm.geo.values()].filter(
    (g) => !/^(COM|ARM|DEP|REG|EPCI|ARR|AAV|UU|ZE|BV|EPT|CTCD)/i.test(g.level),
  );
  console.log("Autres niveaux (France ?) :", JSON.stringify(fr.slice(0, 5), null, 1));
}

// Codes d'indicateurs (format long du catalogue Insee). Ajustés après --inspect.
const MEAS = {
  mediane: ["MED_SL", "MED23", "Q223"],
  pauvrete: ["PR_MD60", "TP6023"],
  // Le 5e décile n'est pas publié à part : c'est la médiane.
  deciles: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) =>
    d === 5 ? ["D5_SL", "MED_SL"] : [`D${d}_SL`, `D${d}23`, `D${d}`],
  ),
};

function pick(measures, keys) {
  for (const k of keys) if (measures[k] !== undefined && measures[k] !== null) return measures[k];
  return null;
}

// ---------------------------------------------------------------------------
// Construction des données
// ---------------------------------------------------------------------------

function build(norm) {
  const communes = {};
  const departements = {};
  let france = null;

  for (const g of norm.geo.values()) {
    const lvl = String(g.level).toUpperCase();
    const m = pick(g.measures, MEAS.mediane);
    const p = pick(g.measures, MEAS.pauvrete);
    if (lvl === "COM") {
      if (m !== null) communes[g.code] = [m, p];
    } else if (lvl === "DEP") {
      const deciles = MEAS.deciles.map((keys) => pick(g.measures, keys));
      departements[g.code] = {
        ...(g.label ? { nom: g.label } : {}),
        m,
        p,
        deciles: deciles.every((d) => d !== null) ? deciles : null,
      };
    } else if (
      /^(FRANCE|FRMETRO|METRO|FRM|FM|PAYS|FE)/.test(lvl) ||
      /^(FM|FRM|FRMETRO|1)$/i.test(g.code)
    ) {
      if (m !== null && (!france || /METRO|FM|FRM/i.test(lvl + g.code)))
        france = { m, p, level: lvl, code: g.code };
    }
  }

  if (!france)
    throw new Error("Médiane de France métropolitaine introuvable : relancer avec --inspect.");
  const nCom = Object.keys(communes).length;
  if (nCom < 30000)
    throw new Error(`Seulement ${nCom} communes avec une médiane : vérifier le fichier.`);

  return {
    millesime: MILLESIME,
    source: "Insee, Filosofi 2023 (géographie au 01/01/2026)",
    sourceUrl: SOURCE_URL,
    generatedAt: new Date().toISOString().slice(0, 10),
    france: {
      medianeMetro: france.m,
      seuilPauvreteAnnuel: Math.round((france.m * 0.6) / 10) * 10,
      tauxPauvreteMetro: france.p,
    },
    departements,
    communes,
  };
}

// ---------------------------------------------------------------------------
// Génération des blocs HTML de la page
// ---------------------------------------------------------------------------

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n).replace(/ /g, " ");
const fmt1 = (n) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n);
const eur = (n) => `${fmt(n)} €`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function panel(data) {
  const list = GRANDES_VILLES.map(([code, nom]) => {
    const e = data.communes[code];
    if (!e) throw new Error(`Pas de médiane pour ${nom} (${code})`);
    return { code, nom, m: e[0], p: e[1] };
  });
  list.sort((a, b) => b.m - a.m || a.nom.localeCompare(b.nom, "fr"));
  return list;
}

function blocks(data) {
  const fr = data.france.medianeMetro;
  const villes = panel(data);
  const top = villes[0];
  const bottom = villes[villes.length - 1];
  const max = top.m;

  const hero = `        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100">
          En ${MILLESIME}, la moitié des habitants de France métropolitaine vit avec moins de
          <strong>${eur(fr)} par an</strong> (${eur(fr / 12)} par mois et par unité de consommation).
          Parmi ${villes.length} grandes villes, <strong>${esc(top.nom)}</strong> arrive en tête avec
          ${eur(top.m)}, <strong>${esc(bottom.nom)}</strong> ferme la marche avec ${eur(bottom.m)}.
          Cherchez votre commune et comparez votre propre niveau de vie.
        </p>`;

  const intro = `        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          Revenu disponible médian par unité de consommation en ${MILLESIME}, du plus élevé au plus
          bas. Repère : <strong>${eur(fr)}</strong> pour la France métropolitaine. Votre ville n'y
          est pas&nbsp;? <a href="#recherche" class="font-semibold text-blue-700 underline">Cherchez-la</a>.
        </p>`;

  const rows = villes
    .map((v, i) => {
      const diff = ((v.m - fr) / fr) * 100;
      const sign = diff >= 0 ? "+" : "−";
      const color = diff >= 0 ? "text-emerald-700" : "text-red-700";
      const name = FICHES[v.code]
        ? `<a href="${FICHES[v.code]}" class="text-blue-700 hover:underline">${esc(v.nom)}</a>`
        : esc(v.nom);
      const width = ((v.m / max) * 100).toFixed(1);
      return `              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-semibold text-slate-950">${i + 1}. ${name}</td>
                <td class="px-4 py-3" data-label="Revenu médian annuel">
                  <span class="font-semibold">${eur(v.m)}</span>
                  <span class="mt-1 hidden h-2 rounded-full bg-emerald-500 md:block" style="width: ${width}%" aria-hidden="true"></span>
                </td>
                <td class="px-4 py-3" data-label="Par mois">${eur(v.m / 12)}</td>
                <td class="px-4 py-3 font-semibold ${color}" data-label="Écart à la France">${sign}${fmt1(Math.abs(diff))} %</td>
                <td class="px-4 py-3" data-label="Taux de pauvreté">${v.p === null ? "non diffusé" : `${fmt1(v.p)} %`}</td>
              </tr>`;
    })
    .join("\n");

  const note = `        <p class="mt-3 text-xs text-slate-500">
          Source : Insee, Filosofi ${MILLESIME} (publié en août 2026). Écart calculé par rapport à la
          médiane de France métropolitaine (${eur(fr)}). Taux de pauvreté : part des habitants sous
          60 % de cette médiane. Paris, Lyon et Marseille : commune entière.
        </p>`;

  const seuil = data.france.seuilPauvreteAnnuel;
  const faq = [
    [
      "Quelle grande ville a le revenu médian le plus élevé ?",
      `Parmi les ${villes.length} grandes villes de notre classement, ${top.nom} arrive en tête avec un revenu médian de ${eur(top.m)} par an en ${MILLESIME}, soit ${eur(top.m / 12)} par mois et par unité de consommation. ${bottom.nom} est la dernière, avec ${eur(bottom.m)}.`,
    ],
    [
      "Quel est le revenu médian en France ?",
      `En ${MILLESIME}, le niveau de vie médian en France métropolitaine est de ${eur(fr)} par an, soit ${eur(fr / 12)} par mois pour une personne seule (Insee, Filosofi). Le seuil de pauvreté, fixé à 60 % de cette médiane, est de ${eur(seuil)} par an.`,
    ],
    [
      "Le revenu médian d'une ville est-il un salaire ?",
      "Non. C'est le revenu disponible des habitants (salaires, retraites, allocations, revenus du patrimoine, moins les impôts directs), divisé par le nombre d'unités de consommation du foyer. Il inclut les retraités, les chômeurs et les étudiants. Pour votre salaire, utilisez un calcul du brut en net.",
    ],
    [
      "Comment connaître le revenu médian de ma commune ?",
      "Tapez le nom de votre commune ou son code postal dans la recherche de cette page. Toutes les communes publiées par l'Insee sont disponibles, soit celles d'au moins 100 habitants fiscaux en France métropolitaine et à La Réunion.",
    ],
    [
      "Pourquoi ces chiffres diffèrent-ils de ceux d'autres sites ?",
      "Beaucoup de sites affichent encore les données 2020 ou 2021. L'Insee a changé de méthode pour 2023 (les étudiants sont désormais comptés là où ils vivent) et précise que les chiffres ne se comparent pas avec les années précédentes.",
    ],
  ];

  // Espace insécable avant « ? » (typographie française).
  for (const item of faq) item[0] = item[0].replace(/ \?$/, "\u00a0?");

  const faqHtml = faq
    .map(
      ([
        q,
        a,
      ]) => `        <details class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <summary class="cursor-pointer font-semibold text-slate-950">${esc(q)}</summary>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">${esc(a)}</p>
        </details>`,
    )
    .join("\n");

  const faqJsonLd = `    <script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  },
  null,
  2,
)
  .split("\n")
  .map((l) => `      ${l}`)
  .join("\n")}
    </script>`;

  return {
    hero,
    "classement-intro": intro,
    table: rows,
    "table-note": note,
    faq: faqHtml,
    "faq-jsonld": faqJsonLd,
  };
}

function inject(html, name, content) {
  const re = new RegExp(`(<!-- GEN:${name}:START -->)[\\s\\S]*?(<!-- GEN:${name}:END -->)`);
  if (!re.test(html)) throw new Error(`Marqueur GEN:${name} absent de la page`);
  return html.replace(re, `$1\n${content}\n$2`);
}

// ---------------------------------------------------------------------------

function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error(
      "Usage : node scripts/build-revenus-communes-2023.cjs FILOSOFI_CC.csv [--inspect]",
    );
    process.exit(1);
  }
  const norm = normalize(parseCsv(file));
  applyLabels(norm, file);
  if (process.argv.includes("--inspect")) return inspect(norm);

  const data = build(norm);
  fs.writeFileSync(OUT_JSON, JSON.stringify(data));
  const nDec = Object.values(data.departements).filter((d) => d.deciles).length;
  console.log(
    `✓ ${OUT_JSON} : ${Object.keys(data.communes).length} communes, ${Object.keys(data.departements).length} départements (${nDec} avec déciles), médiane métropole ${data.france.medianeMetro} €`,
  );

  let html = fs.readFileSync(PAGE, "utf8");
  for (const [name, content] of Object.entries(blocks(data))) html = inject(html, name, content);
  fs.writeFileSync(PAGE, html);
  console.log(`✓ ${path.relative(ROOT, PAGE)} mise à jour`);
  for (const v of panel(data)) console.log(`  ${v.nom.padEnd(26)} ${v.m}  ${v.p ?? "-"}`);

  // Fiches villes (/pages/revenus/{ville}) : arrondissements et structure des revenus.
  const arms = [];
  const depMeasures = {};
  for (const g of norm.geo.values()) {
    if (g.level === "ARM" && g.measures.MED_SL != null)
      arms.push({
        code: g.code,
        label: g.label,
        m: g.measures.MED_SL,
        p: g.measures.PR_MD60 ?? null,
      });
    if (g.level === "DEP") depMeasures[g.code] = g.measures;
  }
  const slugs = writeFiches({
    data,
    panel: panel(data),
    arms,
    depMeasures,
    millesime: MILLESIME,
    pagesDir: path.join(ROOT, "src/pages/revenus"),
  });
  console.log(`✓ ${slugs.length} fiches villes : ${slugs.join(", ")}`);
}

main();
