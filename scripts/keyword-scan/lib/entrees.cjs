/**
 * Lecture facultative des exports déposés dans reports/keyword-scan/input/ :
 * - Search Console (CSV « Requêtes ») : colonnes requête, clics, impressions ;
 * - Semrush (CSV) : colonnes Keyword, Volume.
 * Le séparateur (virgule, point-virgule ou tabulation) et l'en-tête sont détectés.
 */
const fs = require("fs");
const path = require("path");
const { normaliser } = require("./normaliser.cjs");

function lireCsv(texte) {
  const lignes = texte.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lignes.length) return [];
  const entete = lignes[0];
  const sep = [";", "\t", ","].map((s) => [s, entete.split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
  const decouper = (ligne) => {
    const cellules = [];
    let cour = "";
    let guillemets = false;
    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i];
      if (c === '"' && ligne[i + 1] === '"' && guillemets) {
        cour += '"';
        i++;
      } else if (c === '"') guillemets = !guillemets;
      else if (c === sep && !guillemets) {
        cellules.push(cour);
        cour = "";
      } else cour += c;
    }
    cellules.push(cour);
    return cellules.map((x) => x.trim());
  };
  const colonnes = decouper(entete).map((c) => normaliser(c));
  return lignes.slice(1).map((l) => Object.fromEntries(decouper(l).map((v, i) => [colonnes[i], v])));
}

const nombre = (v) => Number(String(v || "0").replace(/\s| | /g, "").replace(",", ".")) || 0;

/** Index { formulation normalisée -> { impressions, clics } } et { -> volume } */
function chargerEntrees(dossier) {
  const gsc = new Map();
  const semrush = new Map();
  const fichiers = [];
  if (!fs.existsSync(dossier)) return { gsc, semrush, fichiers };

  for (const nom of fs.readdirSync(dossier).filter((f) => f.toLowerCase().endsWith(".csv"))) {
    const lignes = lireCsv(fs.readFileSync(path.join(dossier, nom), "utf8"));
    if (!lignes.length) continue;
    const cles = Object.keys(lignes[0]);
    const colRequete = cles.find((c) => /requete|query|top queries/.test(c));
    const colImpr = cles.find((c) => /impression/.test(c));
    const colClics = cles.find((c) => /clic|click/.test(c));
    const colMot = cles.find((c) => c === "keyword" || c === "mot cle");
    const colVol = cles.find((c) => /volume/.test(c));

    if (colRequete && colImpr) {
      for (const l of lignes) {
        const q = normaliser(l[colRequete]);
        if (!q) continue;
        const prec = gsc.get(q) || { impressions: 0, clics: 0, texte: l[colRequete] };
        prec.impressions += nombre(l[colImpr]);
        prec.clics += nombre(colClics ? l[colClics] : 0);
        gsc.set(q, prec);
      }
      fichiers.push(`${nom} (Search Console, ${lignes.length} lignes)`);
    } else if (colMot && colVol) {
      for (const l of lignes) {
        const q = normaliser(l[colMot]);
        if (q) semrush.set(q, { volume: Math.max(nombre(l[colVol]), semrush.get(q)?.volume || 0), texte: l[colMot] });
      }
      fichiers.push(`${nom} (Semrush, ${lignes.length} lignes)`);
    } else {
      fichiers.push(`${nom} (format non reconnu, ignoré)`);
    }
  }
  return { gsc, semrush, fichiers };
}

module.exports = { lireCsv, chargerEntrees };
