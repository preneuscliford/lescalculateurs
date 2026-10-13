#!/usr/bin/env node
/**
 * Vérifie les liens officiels de src/data/sources-officielles.json (source unique des
 * liens « Sources officielles » injectés en bas des pages) :
 * - réponse HTTP 200 après redirections ;
 * - pas de renvoi vers une page d'accueil (lien devenu générique).
 * Les sites qui bloquent les robots (403/429, Légifrance notamment) sont signalés
 * « NON VÉRIFIÉ » : à ouvrir à la main.
 *
 * Usage : node scripts/check-sources-officielles.cjs   (code de sortie 1 si un lien est cassé)
 */
const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../src/data/sources-officielles.json");
const { families } = JSON.parse(fs.readFileSync(file, "utf8"));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

function estAccueil(url) {
  const p = new URL(url).pathname.replace(/\/+$/, "");
  return p === "" || /^\/(fr\/)?(accueil|home)(\.html)?$/i.test(p) || /^\/fr$/i.test(p);
}

async function verifier(url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA } });
    if (res.status === 403 || res.status === 429) return { etat: "NON VÉRIFIÉ", detail: `HTTP ${res.status} (anti-robot)` };
    if (res.status !== 200) return { etat: "CASSÉ", detail: `HTTP ${res.status}` };
    if (estAccueil(res.url) && !estAccueil(url)) return { etat: "CASSÉ", detail: `renvoie vers l'accueil ${res.url}` };
    return { etat: "OK", detail: res.url !== url ? `→ ${res.url}` : "" };
  } catch (e) {
    return { etat: "NON VÉRIFIÉ", detail: e.message };
  }
}

(async () => {
  const urls = new Map();
  for (const [nom, fam] of Object.entries(families)) {
    for (const s of fam.sources) {
      if (!urls.has(s.url)) urls.set(s.url, []);
      urls.get(s.url).push(nom);
    }
  }
  let casses = 0;
  for (const [url, noms] of urls) {
    const r = await verifier(url);
    if (r.etat === "CASSÉ") casses++;
    console.log(`${r.etat.padEnd(12)} ${url} [${noms.join(", ")}] ${r.detail}`);
  }
  console.log(`\n${urls.size} liens vérifiés, ${casses} cassé(s).`);
  process.exit(casses ? 1 : 0);
})();
