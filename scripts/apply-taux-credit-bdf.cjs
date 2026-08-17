#!/usr/bin/env node
/**
 * Propage le taux credit immobilier (data/taux-credit-bdf.json, alimente
 * par scripts/sync-taux-credit-bdf.cjs) dans les scenarios "FORWARD"
 * (capital -> mensualite -> revenu) de src/pages/pret.html.
 *
 * Ne touche PAS les scenarios "REVERSE" (capacite d'emprunt a partir d'un
 * revenu : boutons EXEMPLE, sections "avec 2000€/3000€ de revenu") : leur
 * methodologie d'origine ne se reconcilie pas avec la formule d'annuite
 * standard (verifie le 17/08/2026), donc les auto-corriger reviendrait a
 * deviner plutot qu'a calculer. Voir le commit "actualise le taux de
 * credit immobilier indicatif de 4% a 3,5%" pour le detail de cette
 * verification.
 *
 * Usage : node scripts/apply-taux-credit-bdf.cjs [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const CACHE_PATH = path.resolve(process.cwd(), "data", "taux-credit-bdf.json");
const PRET_HTML_PATH = path.resolve(process.cwd(), "src", "pages", "pret.html");
const TAUX_ENDETTEMENT_MAX = 0.35;

function mensualite(capital, tauxAnnuel, annees) {
  const r = tauxAnnuel / 12;
  const n = annees * 12;
  return capital * (r / (1 - Math.pow(1 + r, -n)));
}

function revenu(mensualiteVal, charges = 0) {
  return mensualiteVal / TAUX_ENDETTEMENT_MAX + charges;
}

/** Arrondit au multiple de `step` le plus proche. */
function roundTo(value, step) {
  return Math.round(value / step) * step;
}

/**
 * Formate un nombre avec des milliers separes par une espace normale
 * (U+0020), conforme au reste de pret.html. `toLocaleString("fr-FR")`
 * insere une espace fine insecable (U+202F) qui casse le pattern
 * `[\d ]+` des remplacements suivants et rend le script non idempotent.
 */
function fr(n) {
  return n.toLocaleString("fr-FR").replace(/[  ]/g, " ");
}

function computeScenario(capital, annees, tauxAnnuel, charges = 0) {
  const m = mensualite(capital, tauxAnnuel, annees);
  const mRounded = roundTo(m, 10);
  const revSansCharges = roundTo(revenu(m), 100);
  const revAvecCharges = roundTo(revenu(m, charges), 100);
  return { mensualite: mRounded, revenu: revSansCharges, revenuAvecCharges: revAvecCharges };
}

function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!fs.existsSync(CACHE_PATH)) {
    console.error(
      `Cache introuvable (${path.relative(process.cwd(), CACHE_PATH)}). Lancer d'abord node scripts/sync-taux-credit-bdf.cjs`,
    );
    process.exit(1);
  }
  const { rateFr, timePeriod, source } = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  const tauxAnnuel = Number(rateFr.replace(",", ".")) / 100;

  let html = fs.readFileSync(PRET_HTML_PATH, "utf-8");
  let replacements = 0;

  function replace(pattern, replacement, label) {
    if (!pattern.test(html)) {
      throw new Error(`Pattern introuvable dans pret.html : ${label}`);
    }
    html = html.replace(pattern, replacement);
    replacements++;
  }

  // --- Scenario 200k / 20 ans (schema.org FAQ + tableau + FAQ visible) ---
  const s200_20 = computeScenario(200000, 20, tauxAnnuel, 500);
  replace(
    /Pour emprunter 200 000 € sur 20 ans à [\d,]+%, la mensualité est d'environ [\d ]+€\. Avec un taux d'endettement de 35%, il faut généralement un revenu net mensuel d'environ [\d ]+€ sans autres charges, ou [\d ]+€ avec 500 € de charges existantes\./,
    `Pour emprunter 200 000 € sur 20 ans à ${rateFr}%, la mensualité est d'environ ${fr(s200_20.mensualite)} €. Avec un taux d'endettement de 35%, il faut généralement un revenu net mensuel d'environ ${fr(s200_20.revenu)} € sans autres charges, ou ${fr(s200_20.revenuAvecCharges)} € avec 500 € de charges existantes.`,
    "schema.org FAQ 200k",
  );
  replace(
    /Pour emprunter 200 000 € sur 20 ans à [\d,]+%, la mensualité est d'environ [\d ]+€\. Avec\s+un taux d'endettement de 35%, il faut généralement un\s+<strong>revenu net mensuel d'environ [\d ]+€<\/strong> sans autres charges\./,
    `Pour emprunter 200 000 € sur 20 ans à ${rateFr}%, la mensualité est d'environ ${fr(s200_20.mensualite)} €. Avec\n              un taux d'endettement de 35%, il faut généralement un\n              <strong>revenu net mensuel d'environ ${fr(s200_20.revenu)} €</strong> sans autres charges.`,
    "FAQ visible 200k (duplicate)",
  );
  replace(
    /indicatif de [\d,]+% hors assurance\./,
    `indicatif de ${rateFr}% hors assurance.`,
    "texte 'Comment lire ce tableau'",
  );
  replace(
    /Pour emprunter <strong>200 000 € sur 20 ans<\/strong> à [\d,]+%, avec un endettement\s+maximal de 35%, un revenu net mensuel d'environ <strong>[\d ]+€<\/strong> est\s+recommandé sans charges existantes\. Avec 500 € de charges mensuelles, ce montant\s+passe à <strong>[\d ]+€<\/strong>\./,
    `Pour emprunter <strong>200 000 € sur 20 ans</strong> à ${rateFr}%, avec un endettement\n              maximal de 35%, un revenu net mensuel d'environ <strong>${fr(s200_20.revenu)} €</strong> est\n              recommandé sans charges existantes. Avec 500 € de charges mensuelles, ce montant\n              passe à <strong>${fr(s200_20.revenuAvecCharges)} €</strong>.`,
    "exemple concret tableau",
  );
  replace(
    /\* Estimation basée sur un taux de [\d,]+% et un endettement de 35%\. Hors assurance et\s+charges\s+existantes\./,
    `* Estimation basée sur un taux de ${rateFr}% et un endettement de 35%. Hors assurance et\n            charges existantes.`,
    "footnote estimation",
  );

  // --- Section 150 000 € (15/20/25 ans) ---
  const s150_15 = computeScenario(150000, 15, tauxAnnuel);
  const s150_20 = computeScenario(150000, 20, tauxAnnuel);
  const s150_25 = computeScenario(150000, 25, tauxAnnuel);
  replace(
    /de la durée du prêt et de vos charges existantes\. Sur 20 ans à [\d,]+%, la mensualité\s+s'élève à environ <strong>[\d ]+€ hors assurance<\/strong>\. Avec un taux d'endettement\s+maximal de 35%, il vous faut un <strong>revenu net mensuel d'environ [\d ]+€<\/strong>\s+sans autres charges\./,
    `de la durée du prêt et de vos charges existantes. Sur 20 ans à ${rateFr}%, la mensualité\n            s'élève à environ <strong>${fr(s150_20.mensualite)} € hors assurance</strong>. Avec un taux d'endettement\n            maximal de 35%, il vous faut un <strong>revenu net mensuel d'environ ${fr(s150_20.revenu)} €</strong>\n            sans autres charges.`,
    "150k paragraphe principal",
  );
  replace(
    /•<strong>15 ans :<\/strong> Mensualité ~[\d ]+€ → Revenu nécessaire ~[\d ]+€ \(sans\s+charges\)/,
    `•<strong>15 ans :</strong> Mensualité ~${fr(s150_15.mensualite)} € → Revenu nécessaire ~${fr(s150_15.revenu)} € (sans\n                charges)`,
    "150k detail 15 ans",
  );
  replace(
    /•<strong>20 ans :<\/strong> Mensualité ~[\d ]+€ → Revenu nécessaire ~[\d ]+€ \(sans\s+charges\)/,
    `•<strong>20 ans :</strong> Mensualité ~${fr(s150_20.mensualite)} € → Revenu nécessaire ~${fr(s150_20.revenu)} € (sans\n                charges)`,
    "150k detail 20 ans",
  );
  replace(
    /•<strong>25 ans :<\/strong> Mensualité ~[\d ]+€ → Revenu nécessaire ~[\d ]+€ \(sans\s+charges\)/,
    `•<strong>25 ans :</strong> Mensualité ~${fr(s150_25.mensualite)} € → Revenu nécessaire ~${fr(s150_25.revenu)} € (sans\n                charges)`,
    "150k detail 25 ans",
  );

  // --- Section 200 000 € (bloc "Quel salaire pour emprunter 200 000 €") ---
  const s200_25 = computeScenario(200000, 25, tauxAnnuel);
  replace(
    /première résidence principale en France\. À ce niveau, sur 20 ans à [\d,]+%, la mensualité\s+se situe autour de <strong>[\d ]+€ hors assurance<\/strong>\. Pour respecter le plafond\s+d'endettement de 35%, il faut viser un\s+<strong>revenu net mensuel d'environ [\d ]+€<\/strong> sans charges préexistantes\./,
    `première résidence principale en France. À ce niveau, sur 20 ans à ${rateFr}%, la mensualité\n            se situe autour de <strong>${fr(s200_20.mensualite)} € hors assurance</strong>. Pour respecter le plafond\n            d'endettement de 35%, il faut viser un\n            <strong>revenu net mensuel d'environ ${fr(s200_20.revenu)} €</strong> sans charges préexistantes.`,
    "200k paragraphe principal",
  );
  replace(
    /•<strong>Sans charges :<\/strong> Revenu de <strong>[\d ]+€<\/strong> minimum\s+\(endettement 35%\)/,
    `•<strong>Sans charges :</strong> Revenu de <strong>${fr(s200_20.revenu)} €</strong> minimum\n                (endettement 35%)`,
    "200k sans charges",
  );
  replace(
    /•<strong>Avec 500 € de charges :<\/strong> Revenu de <strong>[\d ]+€<\/strong> requis/,
    `•<strong>Avec 500 € de charges :</strong> Revenu de <strong>${fr(s200_20.revenuAvecCharges)} €</strong> requis`,
    "200k avec charges",
  );
  replace(
    /•<strong>Option 25 ans \(taux [\d,]+%\) :<\/strong> Mensualité réduite à ~[\d ]+€ →\s+Revenu suffisant de ~[\d ]+€/,
    `•<strong>Option 25 ans (taux ${rateFr}%) :</strong> Mensualité réduite à ~${fr(s200_25.mensualite)} € →\n                Revenu suffisant de ~${fr(s200_25.revenu)} €`,
    "200k option 25 ans",
  );

  // --- Section 250 000 € ---
  const s250_20 = computeScenario(250000, 20, tauxAnnuel, 500);
  const s250_25 = computeScenario(250000, 25, tauxAnnuel);
  replace(
    /pour une famille\. Sur une durée classique de 20 ans à [\d,]+%, prévoyez une mensualité\s+d'environ <strong>[\d ]+€ hors assurance<\/strong>\. Le revenu net mensuel conseillé se\s+situe alors autour de <strong>[\d ]+€<\/strong> sans autres crédits en cours\./,
    `pour une famille. Sur une durée classique de 20 ans à ${rateFr}%, prévoyez une mensualité\n            d'environ <strong>${fr(s250_20.mensualite)} € hors assurance</strong>. Le revenu net mensuel conseillé se\n            situe alors autour de <strong>${fr(s250_20.revenu)} €</strong> sans autres crédits en cours.`,
    "250k paragraphe principal",
  );
  replace(
    /•<strong>Sans crédit en cours :<\/strong> Revenu d'au moins <strong>[\d ]+€<\/strong>/,
    `•<strong>Sans crédit en cours :</strong> Revenu d'au moins <strong>${fr(s250_20.revenu)} €</strong>`,
    "250k sans credit",
  );
  replace(
    /•<strong>Avec 500 € de charges mensuelles :<\/strong> Revenu de\s+<strong>[\d ]+€<\/strong> nécessaire/,
    `•<strong>Avec 500 € de charges mensuelles :</strong> Revenu de\n                <strong>${fr(s250_20.revenuAvecCharges)} €</strong> nécessaire`,
    "250k avec charges",
  );
  replace(
    /•<strong>Sur 25 ans \(taux [\d,]+%\) :<\/strong> Mensualité ~[\d ]+€ → Revenu minimal de\s+~[\d ]+€/,
    `•<strong>Sur 25 ans (taux ${rateFr}%) :</strong> Mensualité ~${fr(s250_25.mensualite)} € → Revenu minimal de\n                ~${fr(s250_25.revenu)} €`,
    "250k option 25 ans",
  );

  // --- JS: placeholder du champ taux ---
  replace(
    /placeholder: "[\d.]+",(\s*\n\s*min: 0\.1,)/,
    `placeholder: "${rateFr.replace(",", ".")}",$1`,
    "placeholder JS taux",
  );

  if (dryRun) {
    console.log(`(--dry-run) ${replacements} remplacements calcules, rien d'ecrit.`);
    console.log(`Taux : ${rateFr}% (periode ${timePeriod}, source ${source})`);
    return;
  }

  fs.writeFileSync(PRET_HTML_PATH, html, "utf-8");
  console.log(`✅ pret.html mis à jour : ${replacements} remplacements, taux ${rateFr}%.`);
}

main();
