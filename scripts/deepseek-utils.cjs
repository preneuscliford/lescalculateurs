// Utilities for DeepSeek prompt generation: jittering numbers and hints
const crypto = require("crypto");

function rand() {
  // deterministic-ish seed from crypto for better randomness
  return parseInt(crypto.randomBytes(4).toString("hex"), 16) / 0xffffffff;
}

function jitterInt(n, pct = 0.03) {
  if (typeof n !== "number") return n;
  const delta = Math.max(1, Math.round(Math.abs(n) * pct));
  const off = Math.floor(rand() * (delta * 2 + 1)) - delta;
  return Math.max(0, n + off);
}

function jitterMoney(n, granularity = 25) {
  if (typeof n !== "number") return n;
  const off = Math.round((rand() * 41 - 20) * (granularity / 10));
  const v = Math.max(0, Math.round((n + off) / granularity) * granularity);
  return v;
}

function jitterPercent(base, minPct = -0.05, maxPct = 0.05) {
  if (typeof base !== "number") return base;
  const pct = minPct + rand() * (maxPct - minPct);
  return +(base * (1 + pct)).toFixed(3);
}

function randomInRange(min, max) {
  return min + rand() * (max - min);
}

function randomPercentRange(min, max) {
  return +randomInRange(min, max).toFixed(3);
}

function pickStructureVariant() {
  const variants = [
    "A",
    "B",
    "C",
    "swap_market_before_tips",
    "add_trends_section",
  ];
  return variants[Math.floor(rand() * variants.length)];
}

function notaireHint(name, commune) {
  // safe non-assertive hints
  const templates = [
    `étude présente depuis plusieurs décennies dans la région`,
    `réputée pour son expertise en transactions résidentielles et copropriété`,
    `souvent sollicitée pour des dossiers de VEFA et programmmes neufs`,
    `proche de la mairie locale et habituée aux dossiers urbains`,
    `dispose d'une équipe spécialisée en droit immobilier local`,
  ];
  const pick = templates[Math.floor(rand() * templates.length)];
  const parts = [];
  if (commune) parts.push(`basée à ${commune}`);
  parts.push(pick);
  return parts.join(", ");
}

module.exports = {
  jitterInt,
  jitterMoney,
  jitterPercent,
  randomPercentRange,
  pickStructureVariant,
  notaireHint,
};
