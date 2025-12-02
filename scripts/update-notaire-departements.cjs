#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

/**
 * Met à jour les mini calculateurs des pages département pour utiliser src/data/baremes.json
 * - Remplace les tranches d'émoluments par baremes.notaire.tranches
 * - Corrige les taux des droits: standard, neuf, réduits selon baremes.json
 * - Remplace la TVA par baremes.notaire.tva
 * - Calcule la CSI via baremes.notaire.csi (taux/minimum)
 * - Corrige le pourcentage (facteur 10000)
 */
function main() {
  const root = process.cwd();
  const dir = path.join(root, "src", "pages", "blog", "departements");
  const dataJsonPath = path.join(root, "src", "data", "baremes.json");

  /**
   * Charge et valide baremes.json pour garantir la présence des clés nécessaires
   */
  function loadBaremes() {
    const raw = fs.readFileSync(dataJsonPath, "utf8");
    const json = JSON.parse(raw);
    if (!json.notaire || !json.notaire.tranches) {
      throw new Error("baremes.json invalide: notaire.tranches manquant");
    }
    return json;
  }

  /**
   * Insère un fetch de baremes.json en haut du <script type="module"> inline
   */
  function injectBaremesFetch(content) {
    return content.replace(
      /(\<script type="module"\>\s*)(?!.*baremes\.json)/,
      (m, p1) =>
        `${p1}const baremes = await (await fetch("../../../data/baremes.json")).json();\n`
    );
  }

  /**
   * Remplace le bloc des tranches par baremes.notaire.tranches
   */
  function replaceTranches(content) {
    return content.replace(
      /const\s+tranches\s*=\s*\[(?:[\s\S]*?)\];/g,
      "const tranches = baremes.notaire.tranches;"
    );
  }

  /**
   * Aligne la TVA et la CSI sur baremes.json
   */
  function fixTvaCsi(content) {
    let out = content;
    out = out.replace(
      /const\s+tva\s*=\s*Math\.round\(\(([^)]+)\)\s*\*\s*0\.2\s*\*\s*100\)\s*\/\s*100\);/g,
      "const tva = Math.round((($1) * baremes.notaire.tva) * 100) / 100;"
    );
    out = out.replace(
      /const\s+csi\s*=\s*50\s*;/g,
      "const csi = Math.max(Math.round(prixNetImmobilier * baremes.notaire.csi.taux), baremes.notaire.csi.minimum);"
    );
    return out;
  }

  /**
   * Met à jour les droits d'enregistrement selon type et départements réduits
   */
  function fixDroits(content) {
    let out = content;
    // Valeur par défaut (standard)
    out = out.replace(
      /let\s+tauxDroits\s*=\s*(0\.059|0\.058|0\.065)\s*;/g,
      "let tauxDroits = baremes.notaire.droitsMutation.standard;"
    );
    // Neuf
    out = out.replace(
      /if\s*\(\s*typeBien\s*===\s*"neuf"\s*\)\s*\{[\s\S]*?\}/g,
      "if (typeBien === \"neuf\") { tauxDroits = baremes.notaire.droitsMutation.neuf; }"
    );
    // Réduits par département (hors neuf)
    // Insertion après la ligne d'initialisation
    out = out.replace(
      /(let\s+tauxDroits\s*=\s*baremes\.notaire\.droitsMutation\.standard\s*;)/,
      `$1\nif (typeBien !== \"neuf\" && baremes.notaire.droitsMutation.departementsReduits.includes(values.departement)) { tauxDroits = baremes.notaire.droitsMutation.reduit; }`
    );
    return out;
  }

  /**
   * Corrige le calcul du pourcentage (normalisé sur 10000)
   */
  function fixPourcentage(content) {
    return content.replace(
      /const\s+pourcentage\s*=\s*prixAchat\s*>\s*0\s*\?\s*Math\.round\(\(total\s*\/\s*prixAchat\)\s*\*\s*[^)]+\)\s*\/\s*100\s*:\s*0\s*;/g,
      "const pourcentage = prixAchat > 0 ? Math.round((total / prixAchat) * 10000) / 100 : 0;"
    );
  }

  /**
   * Traite un fichier HTML de département et applique toutes les corrections
   */
  function processFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    let updated = content;
    updated = injectBaremesFetch(updated);
    updated = replaceTranches(updated);
    updated = fixTvaCsi(updated);
    updated = fixDroits(updated);
    updated = fixPourcentage(updated);

    if (updated !== content) {
      fs.writeFileSync(filePath, updated, "utf8");
      return true;
    }
    return false;
  }

  const baremes = loadBaremes();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
  let changed = 0;
  for (const f of files) {
    const fp = path.join(dir, f);
    if (processFile(fp)) changed++;
  }
  console.log(`Mises à jour terminées: ${changed} fichiers modifiés sur ${files.length}`);
}

main();
