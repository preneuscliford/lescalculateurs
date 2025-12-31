#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MONITOR_PATH = path.join(ROOT, "data/monitoring-calendar.json");
const GLOBAL_MONITOR_PATH = path.join(ROOT, "data/global-monitoring.json");

/**
 * Effectue une requête HTTP GET et renvoie { text, url }
 */
async function httpGet(url) {
  const res = await fetch(url, { headers: { "User-Agent": "lescalculateurs-agent_juridique/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  const text = await res.text();
  return { text, url };
}

/**
 * Extrait et normalise une date française depuis contenu HTML
 */
function parseFrenchDate(text) {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const months = { janvier:"01", février:"02", fevrier:"02", mars:"03", avril:"04", mai:"05", juin:"06", juillet:"07", août:"08", aout:"08", septembre:"09", octobre:"10", novembre:"11", décembre:"12", decembre:"12" };
  const m = text.match(/publi[ée]?\s*le\s*(\d{1,2})\s+([A-Za-zéèêëàâäïîôöûüç]+)\s+(\d{4})/i);
  if (m) {
    const d = String(m[1]).padStart(2, "0");
    const month = months[(m[2] || "").toLowerCase()];
    const y = m[3];
    if (month) return `${y}-${month}-${d}`;
  }
  return null;
}

/**
 * Extrait le titre de page depuis le HTML
 */
function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : "Titre non détecté";
}

/**
 * Retire les balises et compresse le texte
 */
function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Extrait un extrait textuel autour d’un mot‑clé
 */
function snippet(html, keyword) {
  const idx = html.toLowerCase().indexOf(keyword.toLowerCase());
  const clean = stripTags(html);
  if (idx < 0) return clean.slice(0, 300);
  const start = Math.max(0, idx - 300);
  const end = Math.min(clean.length, idx + 300);
  return clean.slice(start, end);
}

/**
 * Vérifie si le cluster est dû selon les fichiers de monitoring
 */
function isDue(cluster, monitor, globalMon) {
  const today = new Date();
  if (cluster === "apl") {
    const calc = (globalMon?.calculators || []).find((c) => c.id === "apl");
    const d = new Date(calc?.data_sources?.montants_apl?.next_check || 0);
    return today >= d;
  }
  if (cluster === "ir") {
    return today.getUTCMonth() === 0;
  }
  if (cluster === "ik") {
    const calc = (globalMon?.calculators || []).find((c) => c.id === "indemnite_km");
    const d = new Date(calc?.data_sources?.bareme_2025?.next_check || 0);
    return today >= d;
  }
  if (cluster === "notaire") {
    const d = new Date(monitor?.baremes_notariaux?.next_expected_update || 0);
    return today >= d;
  }
  if (cluster === "dmto") {
    const d = new Date(monitor?.droits_enregistrement?.next_expected_update || 0);
    return today >= d;
  }
  return true;
}

/**
 * Liste des domaines autorisés par cluster
 */
function allowedDomainsFor(cluster) {
  if (cluster === "apl") return ["caf.fr", "service-public.fr"];
  if (cluster === "ir") return ["impots.gouv.fr", "bofip.impots.gouv.fr", "legifrance.gouv.fr", "service-public.fr"];
  if (cluster === "ik") return ["bofip.impots.gouv.fr", "impots.gouv.fr", "service-public.fr"];
  if (cluster === "notaire") return ["legifrance.gouv.fr", "service-public.fr"];
  if (cluster === "dmto") return ["impots.gouv.fr", "legifrance.gouv.fr", "service-public.fr"];
  return [];
}

/**
 * Assure que l’URL appartient aux domaines autorisés
 */
function assertDomainAllowed(url, domains) {
  const u = new URL(url);
  const host = u.hostname.toLowerCase();
  if (!domains.some((d) => host.endsWith(d))) {
    throw new Error(`Source non autorisée: ${url}`);
  }
}

/**
 * Structure vide pour sortie JSON
 */
function makeOutput() {
  return {
    regles_officielles: [],
    plafonds: {},
    zones_geographiques: [],
    exceptions: [],
    sources_exactes: [],
  };
}

/**
 * Ajoute le bloc source (URL, titre, date)
 */
function addSource(output, url, html) {
  output.sources_exactes.push({
    url,
    titre: extractTitle(html),
    date_publication: parseFrenchDate(html) || "Information officielle non trouvée",
  });
}

/**
 * Ajoute un extrait textuel exact lié à une source
 */
function addExtract(output, source, extrait) {
  output.regles_officielles.push({ source, extrait });
}

/**
 * Collecte APL depuis CAF (prioritaire) puis Service‑Public (cross‑check)
 */
function collectAPL(htmlSP) {
  const out = makeOutput();
  addSource(out, htmlSP.url, htmlSP.text);
  addExtract(out, htmlSP.url, snippet(htmlSP.text, "Plafond"));
  out.plafonds = { validite: parseFrenchDate(htmlSP.text) || "Information officielle non trouvée" };
  const zonesExtract = snippet(htmlSP.text, "zone");
  out.zones_geographiques.push(zonesExtract || "Information officielle non trouvée");
  return out;
}

/**
 * Collecte IR depuis impots.gouv.fr (prioritaire) avec extrait exact
 */
function collectIR(htmlImpots) {
  const out = makeOutput();
  addSource(out, htmlImpots.url, htmlImpots.text);
  addExtract(out, htmlImpots.url, snippet(htmlImpots.text, "barème"));
  out.plafonds = { bareme: "Tranches et taux du barème en vigueur", validite: parseFrenchDate(htmlImpots.text) || "Information officielle non trouvée" };
  const ex = snippet(htmlImpots.text, "décote");
  out.exceptions.push(ex || "Information officielle non trouvée");
  return out;
}

/**
 * Collecte IK depuis Service‑Public (prioritaire) avec extrait exact
 */
function collectIK(htmlSP) {
  const out = makeOutput();
  addSource(out, htmlSP.url, htmlSP.text);
  addExtract(out, htmlSP.url, snippet(htmlSP.text, "barème kilométrique"));
  out.plafonds = { type: "Formules par CV et kilométrage", validite: parseFrenchDate(htmlSP.text) || "Information officielle non trouvée" };
  const ex = snippet(htmlSP.text, "véhicule électrique");
  out.exceptions.push(ex || "Information officielle non trouvée");
  return out;
}

/**
 * Collecte Notaire depuis Service‑Public ou Légifrance
 */
function collectNotaire(htmlSPorLegi) {
  const out = makeOutput();
  addSource(out, htmlSPorLegi.url, htmlSPorLegi.text);
  addExtract(out, htmlSPorLegi.url, snippet(htmlSPorLegi.text, "émoluments"));
  out.plafonds = { emoluments: "Tranches proportionnelles (barème légal)", validite: parseFrenchDate(htmlSPorLegi.text) || "Information officielle non trouvée" };
  const ex = snippet(htmlSPorLegi.text, "remise");
  out.exceptions.push(ex || "Information officielle non trouvée");
  return out;
}

/**
 * Collecte DMTO depuis impots.gouv.fr
 */
function collectDMTO(htmlImpots) {
  const out = makeOutput();
  addSource(out, htmlImpots.url, htmlImpots.text);
  addExtract(out, htmlImpots.url, snippet(htmlImpots.text, "droits d’enregistrement"));
  out.plafonds = { fourchette: "3,8% à 4,5% (éventuelles hausses encadrées)", validite: parseFrenchDate(htmlImpots.text) || "Information officielle non trouvée" };
  out.zones_geographiques.push("Variation par département (métropole et DOM)");
  out.exceptions.push("Primo‑accédants: exemptions/limitations selon textes applicables.");
  return out;
}

/**
 * Point d’entrée: sélection des sources autorisées et génération JSON
 */
async function main() {
  const args = process.argv.slice(2);
  const clusterArg = args.find((a) => a.startsWith("--cluster="));
  const dueArg = args.find((a) => a.startsWith("--due="));
  if (!clusterArg) {
    console.error("Usage: node scripts/agent-juridique.cjs --cluster=apl|ir|ik|notaire|dmto [--due=true|false]");
    process.exit(1);
  }
  const cluster = clusterArg.split("=")[1];
  const dueOnly = dueArg ? dueArg.split("=")[1] === "true" : true;
  const monitor = JSON.parse(fs.readFileSync(MONITOR_PATH, "utf-8"));
  const globalMon = JSON.parse(fs.readFileSync(GLOBAL_MONITOR_PATH, "utf-8"));
  if (dueOnly && !isDue(cluster, monitor, globalMon)) {
    console.log(JSON.stringify({ message: "Non dû selon calendrier", cluster }, null, 2));
    return;
  }
  const domains = allowedDomainsFor(cluster);
  let output = makeOutput();
  try {
    if (cluster === "apl") {
      const urlCAF = "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/aide-personnalisee-au-logement";
      const urlSP = "https://www.service-public.fr/particuliers/vosdroits/F12006";
      assertDomainAllowed(urlCAF, domains);
      assertDomainAllowed(urlSP, domains);
      const caf = await httpGet(urlCAF);
      const sp = await httpGet(urlSP);
      output = collectAPL(caf);
      addSource(output, sp.url, sp.text);
      addExtract(output, sp.url, snippet(sp.text, "Plafond"));
      const z2 = snippet(sp.text, "zone");
      if (z2) output.zones_geographiques.push(z2);
    } else if (cluster === "ir") {
      const urlImpots = "https://www.impots.gouv.fr/particulier/le-bareme-de-limpot-sur-le-revenu";
      const urlBofip = "https://bofip.impots.gouv.fr/bofip/2491-PGP.html/identifiant=BOI-IR-LIQ-20-10-20250414";
      assertDomainAllowed(urlImpots, domains);
      assertDomainAllowed(urlBofip, domains);
      const imp = await httpGet(urlImpots);
      const bof = await httpGet(urlBofip);
      output = collectIR(imp);
      addSource(output, bof.url, bof.text);
      addExtract(output, bof.url, snippet(bof.text, "Barème pour l’imposition sur les revenus 2024"));
    } else if (cluster === "ik") {
      const urlSP = "https://www.service-public.fr/particuliers/vosdroits/F1879";
      const urlBofip = "https://bofip.impots.gouv.fr/bofip/2185-PGP.html/identifiant=BOI-BAREME-000001-20230720";
      assertDomainAllowed(urlSP, domains);
      assertDomainAllowed(urlBofip, domains);
      const sp = await httpGet(urlSP);
      const bof = await httpGet(urlBofip);
      output = collectIK(sp);
      addSource(output, bof.url, bof.text);
      addExtract(output, bof.url, snippet(bof.text, "Barème applicable aux automobiles"));
    } else if (cluster === "notaire") {
      const urlSP = "https://www.service-public.fr/particuliers/vosdroits/N367";
      assertDomainAllowed(urlSP, domains);
      const sp = await httpGet(urlSP);
      output = collectNotaire(sp);
    } else if (cluster === "dmto") {
      const urlImp = "https://www.impots.gouv.fr/particulier/les-droits-denregistrement";
      assertDomainAllowed(urlImp, domains);
      const imp = await httpGet(urlImp);
      output = collectDMTO(imp);
    } else {
      throw new Error("Cluster non supporté");
    }
  } catch (e) {
    output.regles_officielles.push({ source: "Information officielle non trouvée", extrait: e.message });
  }
  const outPath = path.join(ROOT, "data", `agent-juridique-${cluster}-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(JSON.stringify(output, null, 2));
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
