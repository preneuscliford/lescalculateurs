#!/usr/bin/env node
/**
 * Audit des données officielles 2026 pour nos calculateurs.
 * Vérifie la disponibilité (publication/date) sans rien écrire.
 * Couverture: Notaire (émoluments), DMTO, IK, Impôt (IR), SMIC, APL, URSSAF cotisations.
 */
const { readFileSync } = require("fs");
const path = require("path");

/** Effectue une requête HTTP GET simple et renvoie le texte. */
async function httpGet(url) {
  const res = await fetch(url, { headers: { "User-Agent": "lescalculateurs-audit/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  return await res.text();
}

/** Extrait une date FR (publié le ...) au format ISO AAAA-MM-JJ si trouvée. */
function parseFrenchDate(text) {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const months = {
    janvier: "01", février: "02", fevrier: "02", mars: "03", avril: "04",
    mai: "05", juin: "06", juillet: "07", août: "08", aout: "08",
    septembre: "09", octobre: "10", novembre: "11", décembre: "12", decembre: "12",
  };
  const m = text.match(/publi[ée]?\s*le\s*(\d{1,2})\s+([A-Za-zéèêëàâäïîôöûüç]+)\s+(\d{4})/i);
  if (m) {
    const d = String(m[1]).padStart(2, "0");
    const month = months[(m[2] || "").toLowerCase()];
    const y = m[3];
    if (month) return `${y}-${month}-${d}`;
  }
  return null;
}

/** Retourne l'année de publication si détectée. */
function getYearFromText(text) {
  const date = parseFrenchDate(text);
  if (date) return Number(date.slice(0, 4));
  const yMatch = text.match(/\b(20\d{2})\b/g);
  if (yMatch) {
    const years = yMatch.map((y) => Number(y)).filter((y) => y >= 2010 && y <= 2100);
    return years.length ? Math.max(...years) : null;
  }
  return null;
}

/** Format résultat uniforme. */
function result(service, url, ok, publicationDate, note) {
  return { service, url, status: ok ? "published_or_current" : "unknown_or_2025", publication_date: publicationDate || null, note: note || null };
}

/** Vérifie Notaires (émoluments) — page souvent "sans année", on valide par taux. */
async function checkNotaire() {
  const url = "https://www.notaires.fr/fr/les-baremes-notariaux";
  const html = await httpGet(url);
  const expected = [0.0387, 0.01596, 0.01064, 0.00799].every((t) => html.includes(String(t)));
  const y = getYearFromText(html);
  return result("notaire_emoluments", url, expected, y, expected ? "Taux présents" : "Taux non détectés");
}

/** Vérifie DMTO (droits d'enregistrement) — département à taux réduit. */
async function checkDMTO() {
  const url = "https://www.impots.gouv.fr/particulier/les-droits-denregistrement";
  const html = await httpGet(url);
  const reduced = ["56", "57", "67", "68"].every((d) => html.includes(d));
  const y = getYearFromText(html);
  return result("dmto", url, reduced, y, reduced ? "Départements réduits présents" : "Liste réduite non détectée");
}

/** Vérifie Indemnités Kilométriques — F1879 (souvent publié fin Q1). */
async function checkIK() {
  const url = "https://www.service-public.fr/particuliers/vosdroits/F1879";
  const html = await httpGet(url);
  const contains = html.toLowerCase().includes("barème kilométrique") || html.toLowerCase().includes("indemnités kilométriques");
  const y = getYearFromText(html);
  const note = y >= 2026 ? "Page référencée 2026 détectée" : "Dernière publication avant 2026";
  return result("ik", url, contains && y >= 2025, y, note);
}

/** Vérifie Barème IR — page officielle. */
async function checkIR() {
  const url = "https://www.impots.gouv.fr/particulier/le-bareme-de-limpot-sur-le-revenu";
  const html = await httpGet(url);
  const contains = html.toLowerCase().includes("barème") && html.toLowerCase().includes("impôt sur le revenu");
  const y = getYearFromText(html);
  const note = y >= 2026 ? "Publication 2026 détectée" : "Publication antérieure";
  return result("impot_ir", url, contains && y >= 2025, y, note);
}

/** Vérifie SMIC — page Ministère du Travail. */
async function checkSMIC() {
  const url = "https://travail-emploi.gouv.fr/salaire-minimum-interprofessionnel-de-croissance-smic";
  const html = await httpGet(url);
  const contains = html.toLowerCase().includes("smic");
  const y = getYearFromText(html);
  const note = y >= 2026 ? "Publication 2026 détectée" : "Publication antérieure";
  return result("smic", url, contains && y >= 2025, y, note);
}

/** Vérifie APL — Service‑Public plafonds. */
async function checkAPL() {
  const url = "https://www.service-public.fr/particuliers/vosdroits/F12006";
  const html = await httpGet(url);
  const contains = html.toLowerCase().includes("aide personnalisée au logement") || html.toLowerCase().includes("apl");
  const y = getYearFromText(html);
  const note = y >= 2026 ? "Publication 2026 détectée" : "Publication antérieure";
  return result("apl", url, contains && y >= 2025, y, note);
}

/** Vérifie URSSAF — page taux et montants (cotisations). */
async function checkURSSAF() {
  const url = "https://www.urssaf.fr/portail/";
  const html = await httpGet(url);
  const contains = html.toLowerCase().includes("cotisations") || html.toLowerCase().includes("taux et montants");
  const y = getYearFromText(html);
  const note = y >= 2026 ? "Publication 2026 détectée" : "Publication antérieure";
  return result("urssaf_cotisations", url, contains && y >= 2025, y, note);
}

/** Point d'entrée: exécute tous les contrôles et affiche un rapport synthétique. */
async function main() {
  const checks = [checkNotaire, checkDMTO, checkIK, checkIR, checkSMIC, checkAPL, checkURSSAF];
  const results = [];
  for (const fn of checks) {
    try {
      results.push(await fn());
    } catch (e) {
      results.push({ service: fn.name, url: null, status: "error", publication_date: null, note: e.message });
    }
  }
  const published2026 = results.filter((r) => (r.publication_date ? Number(String(r.publication_date).slice(0, 4)) >= 2026 : false));
  console.log("=== AUDIT OFFICIEL 2026 ===");
  results.forEach((r) => {
    console.log(`${r.service.padEnd(22)} | ${String(r.status).padEnd(22)} | pub:${r.publication_date || "n/a"} | ${r.url}`);
    if (r.note) console.log(`   -> ${r.note}`);
  });
  console.log(`\nSynthèse: ${published2026.length} service(s) avec publication 2026 détectée`);
}

main().catch((e) => {
  console.error("Audit 2026 - erreur:", e);
  process.exitCode = 1;
});

