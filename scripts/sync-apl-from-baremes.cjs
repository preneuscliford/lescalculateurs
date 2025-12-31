#!/usr/bin/env node
/**
 * Synchronise APL (plafonds et multiplicateurs région) depuis src/data/baremes.json vers src/pages/apl.html
 * - Met à jour les tableaux des plafonds Zone 1/2/3
 * - Met à jour la logique de calcul: multiplicateur_région et plafond_apl
 */

const fs = require("fs");
const path = require("path");

/**
 * Charge baremes.json
 */
function loadBaremes() {
  const p = path.resolve(process.cwd(), "src", "data", "baremes.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

/**
 * Met à jour les tableaux des plafonds CAF dans apl.html
 */
function updateTables(html, apl) {
  const z1 = apl.plafonds_loyer.zone1;
  const z2 = apl.plafonds_loyer.zone2;
  const z3 = apl.plafonds_loyer.zone3;
  let out = html;
  // Zone 1
  out = out.replace(/>\s*610\s*€\s*</, `> ${z1.seul} €<`);
  out = out.replace(/>\s*670\s*€\s*</, `> ${z1.couple} €<`);
  out = out.replace(/>\s*730\s*€\s*</, `> ${z1.couple_1_enfant} €<`);
  out = out.replace(/>\s*790\s*€\s*</, `> ${z1.couple_2_enfants} €<`);
  // Zone 2
  out = out.replace(/>\s*510\s*€\s*</, `> ${z2.seul} €<`);
  out = out.replace(/>\s*560\s*€\s*</, `> ${z2.couple} €<`);
  out = out.replace(/>\s*610\s*€\s*</, (m) => {
    // éviter collision avec zone 1; ici occurrence sous Zone 2
    return m.includes("Zone 2") ? `> ${z2.couple_1_enfant} €<` : m;
  });
  out = out.replace(/>\s*660\s*€\s*</, `> ${z2.couple_2_enfants} €<`);
  // Zone 3
  out = out.replace(/>\s*430\s*€\s*</, `> ${z3.seul} €<`);
  out = out.replace(/>\s*480\s*€\s*</, `> ${z3.couple} €<`);
  out = out.replace(/>\s*530\s*€\s*</, `> ${z3.couple_1_enfant} €<`);
  out = out.replace(/>\s*580\s*€\s*</, `> ${z3.couple_2_enfants} €<`);
  return out;
}

/**
 * Met à jour la logique de calcul (multiplicateur région et plafonds simplifiés)
 */
function updateLogic(html, apl) {
  const mult = apl.multiplicateurs_region || { idf: 1.15, province: 1.0, dom: 0.95 };
  const z1 = apl.plafonds_loyer.zone1;
  const z2 = apl.plafonds_loyer.zone2;
  const z3 = apl.plafonds_loyer.zone3;
  let out = html;
  // multiplicateur_region
  out = out.replace(
    /let\s+multiplicateur_region\s*=\s*1;[\s\S]*?if\s*\(region\s*===\s*"idf"\)\s*multiplicateur_region\s*=\s*[\d.]+;[\s\S]*?else\s+if\s*\(region\s*===\s*"dom"\)\s*multiplicateur_region\s*=\s*[\d.]+;/,
    `let multiplicateur_region = 1;
            if (region === "idf") multiplicateur_region = ${mult.idf};
            else if (region === "dom") multiplicateur_region = ${mult.dom};`
  );
  // plafond_apl simplifié par zone (on utilise la valeur "seul" par défaut)
  out = out.replace(
    /const\s+plafond_apl\s*=\s*region\s*===\s*"idf"\s*\?\s*\d+\s*:\s*\d+;/,
    `const plafond_apl = region === "idf" ? ${z1.seul} : (region === "dom" ? ${z3.seul} : ${z2.seul});`
  );
  return out;
}

/**
 * Point d'entrée: applique les mises à jour à src/pages/apl.html
 */
function main() {
  const aplPath = path.resolve(process.cwd(), "src", "pages", "apl.html");
  let html = fs.readFileSync(aplPath, "utf-8");
  const baremes = loadBaremes();
  const apl = baremes.apl;
  if (!apl || !apl.plafonds_loyer) {
    console.warn("⚠️ Données APL manquantes dans baremes.json");
    return;
  }
  let updated = html;
  updated = updateTables(updated, apl);
  updated = updateLogic(updated, apl);
  if (updated !== html) {
    fs.writeFileSync(aplPath, updated, "utf-8");
    console.log("✅ APL synchronisé dans src/pages/apl.html");
  } else {
    console.log("ℹ️ Aucune mise à jour APL nécessaire");
  }
}

main();

