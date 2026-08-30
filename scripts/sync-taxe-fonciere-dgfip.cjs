#!/usr/bin/env node
/**
 * Synchronise les taux de taxe fonciere sur le bati (TFB) par commune
 * depuis le dataset officiel DGFiP "Fiscalite locale des particuliers"
 * (data.gouv.fr / data.economie.gouv.fr). Verifie via MCP data.gouv.fr le
 * 30/08/2026 : colonne Taux_Global_TFB = somme des composantes E* du taux
 * (part commune + EPCI + GEMAPI...), une ligne par commune et par exercice
 * (EXERCICE), identifiant commune = INSEE COM.
 *
 * Ne garde que le dernier exercice disponible, pour chaque commune, dans
 * un fichier compact servi en asset statique (public/data/) - jamais
 * interroge en direct par calcul utilisateur (voir src/pages/taxe.html,
 * qui le fetch une seule fois et le met en cache cote client).
 *
 * Usage : node scripts/sync-taxe-fonciere-dgfip.cjs [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const CSV_URL =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/fiscalite-locale-des-particuliers/exports/csv?use_labels=true";
const DATASET_URL = "https://www.data.gouv.fr/datasets/fiscalite-locale-des-particuliers/";
const OUTPUT_PATH = path.resolve(process.cwd(), "public", "data", "taxe-fonciere-communes.json");

// Bornes de securite : une source qui derive fortement de ces plages
// indique un probleme de parsing/structure, pas une vraie donnee a ecrire.
const MIN_COMMUNES_EXPECTED = 30000; // ~34 900 attendu (verifie le 30/08/2026)
const MIN_TAUX_PLAUSIBLE = 0;
// Le taux global TFB le plus eleve constate en France depasse legerement
// 100% dans de rares communes (ex. 101,13% verifie ce soir) : la borne
// haute sert a attraper une vraie corruption de donnees (valeur en
// milliers), pas a rejeter des cas extremes mais reels.
const MAX_TAUX_PLAUSIBLE = 150;

async function fetchCsv() {
  const res = await fetch(CSV_URL);
  if (!res.ok) {
    throw new Error(`Echec telechargement CSV DGFiP : HTTP ${res.status}`);
  }
  return await res.text();
}

/**
 * Parse le CSV (delimiteur ';', fin de ligne CRLF, BOM UTF-8 en tete).
 */
function parseCsv(raw) {
  const lines = raw
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim().length > 0);

  const header = lines[0].replace(/^﻿/, "").split(";");
  const idx = (name) => {
    const i = header.indexOf(name);
    if (i === -1) {
      throw new Error(
        `Colonne "${name}" introuvable dans le CSV DGFiP - la structure du dataset a peut-etre change.`,
      );
    }
    return i;
  };

  const iExercice = idx("EXERCICE");
  const iInsee = idx("INSEE COM");
  const iLibcom = idx("LIBCOM");
  const iDep = idx("DEP");
  const iTaux = idx("Taux_Global_TFB");

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    rows.push({
      exercice: Number(cols[iExercice]),
      code: cols[iInsee],
      nom: cols[iLibcom],
      dep: cols[iDep],
      taux: cols[iTaux] === "" ? null : Number(cols[iTaux]),
    });
  }
  return rows;
}

/**
 * Ne garde que l'exercice le plus recent, une ligne par commune, avec
 * verification de plausibilite sur chaque taux.
 */
function extractLatestPerCommune(rows) {
  const maxExercice = rows.reduce((m, r) => Math.max(m, r.exercice), 0);
  const communes = {};
  let rejected = 0;

  for (const r of rows) {
    if (r.exercice !== maxExercice) continue;
    if (r.taux === null || Number.isNaN(r.taux)) {
      rejected++;
      continue;
    }
    if (r.taux < MIN_TAUX_PLAUSIBLE || r.taux > MAX_TAUX_PLAUSIBLE) {
      console.warn(`⚠️ Taux hors bornes ignore pour ${r.code} (${r.nom}) : ${r.taux}%`);
      rejected++;
      continue;
    }
    communes[r.code] = { nom: r.nom, departement: r.dep, taux: r.taux };
  }

  return { maxExercice, communes, rejected };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("Telechargement du dataset DGFiP (Fiscalite locale des particuliers)...");
  const csv = await fetchCsv();
  const rows = parseCsv(csv);
  console.log(`${rows.length} lignes brutes recuperees.`);

  const { maxExercice, communes, rejected } = extractLatestPerCommune(rows);
  const count = Object.keys(communes).length;
  console.log(`Exercice retenu : ${maxExercice}. Communes valides : ${count}. Rejetees : ${rejected}.`);

  if (count < MIN_COMMUNES_EXPECTED) {
    throw new Error(
      `Nombre de communes obtenu (${count}) sous le seuil de securite (${MIN_COMMUNES_EXPECTED}) : ` +
        `synchro annulee plutot que d'ecrire une donnee suspecte.`,
    );
  }

  const output = {
    meta: {
      source: DATASET_URL,
      resourceUrl: CSV_URL,
      colonneSource: "Taux_Global_TFB",
      exercice: maxExercice,
      fetchedAt: new Date().toISOString(),
      totalCommunes: count,
      communesRejetees: rejected,
    },
    communes,
  };

  if (dryRun) {
    console.log(`(--dry-run) Rien ecrit. Exercice ${maxExercice}, ${count} communes pretes.`);
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output), "utf-8");
  console.log(`✅ Ecrit : ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error("Echec synchro taxe fonciere DGFiP:", err.message);
  process.exit(1);
});
