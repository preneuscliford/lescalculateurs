#!/usr/bin/env node
/**
 * Synchronise le barème IR officiel depuis src/data/baremes.json vers src/pages/scripts/impot.ts
 * Remplace le tableau `const bareme = [...]` par les tranches issues de baremes.impot.tranches
 */

const fs = require("fs");
const path = require("path");

function loadBaremes() {
  const p = path.resolve(process.cwd(), "src", "data", "baremes.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function formatBaremeArray(tranches) {
  const items = tranches.map((t) => {
    const plafond =
      t.plafond === Infinity || t.plafond === "Infinity" ? "Infinity" : Number(t.plafond);
    const taux = Number(t.taux);
    return `  { plafond: ${plafond}, taux: ${taux} }`;
  });
  return `[\n${items.join(",\n")}\n]`;
}

function syncImpotTs(baremes) {
  const target = path.resolve(process.cwd(), "src", "pages", "scripts", "impot.ts");
  let content = fs.readFileSync(target, "utf-8");
  const match = content.match(/const\s+bareme\s*=\s*\[[\s\S]*?\];/);
  if (!match) {
    throw new Error("Bloc 'const bareme = [...]' introuvable dans impot.ts");
  }
  const arr = formatBaremeArray(baremes.impot?.tranches || []);
  const replacement = `const bareme = ${arr};`;
  content = content.replace(/const\s+bareme\s*=\s*\[[\s\S]*?\];/, replacement);
  fs.writeFileSync(target, content, "utf-8");
  console.log("✅ Barème IR synchronisé dans src/pages/scripts/impot.ts");
}

function main() {
  const baremes = loadBaremes();
  if (!baremes.impot?.tranches || baremes.impot.tranches.length === 0) {
    console.warn("⚠️ Aucune tranche IR disponible dans baremes.json");
  }
  syncImpotTs(baremes);
}

main();

