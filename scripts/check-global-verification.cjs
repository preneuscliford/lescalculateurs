#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Load global monitoring config
const globalConfig = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/global-monitoring.json"),
    "utf8"
  )
);

console.log(
  "\n╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║  🌍 VERIFICATION GLOBALE - Tous les Calculateurs               ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

console.log(`📊 RESUME PLATEFORME:`);
console.log(`   Total calculateurs: ${globalConfig.summary.total_calculators}`);
console.log(`   ✅ A jour: ${globalConfig.summary.up_to_date}`);
console.log(`   ⚠️  A verifier: ${globalConfig.summary.need_verification}`);
console.log(`   Dernier audit: ${globalConfig.summary.last_full_audit}`);
console.log(
  `   Prochain audit complet: ${globalConfig.summary.next_full_audit}\n`
);

// Display each calculator
console.log(
  "╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║  📋 ETAT DE CHAQUE CALCULATEUR                                 ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

globalConfig.calculators.forEach((calc, idx) => {
  console.log(`\n${idx + 1}. ${calc.name}`);
  console.log(`   Status: ${calc.status}`);
  console.log(`   Pages: ${calc.pages}`);
  console.log(`   Description: ${calc.description}`);

  const sources = Object.keys(calc.data_sources);
  console.log(`   📌 Sources de donnees (${sources.length}):`);

  sources.forEach((key) => {
    const source = calc.data_sources[key];
    const nextCheck = new Date(source.next_check);
    const today = new Date("2025-11-30");
    const daysUntil = Math.floor((nextCheck - today) / (1000 * 60 * 60 * 24));

    let urgency = "🟢";
    if (daysUntil <= 30) urgency = "🔴 URGENT";
    else if (daysUntil <= 90) urgency = "🟡 BIENTÔT";

    console.log(`      • ${key}`);
    console.log(`        Frequence: ${source.frequency}`);
    console.log(
      `        Prochain check: ${source.next_check} (${daysUntil} jours) ${urgency}`
    );
    console.log(`        Source: ${source.source}`);
  });
});

// Calendar view
console.log(
  "\n╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║  📅 CALENDRIER GLOBAL DE VERIFICATION                          ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

globalConfig.global_checks.forEach((check) => {
  const checkDate = new Date(check.date);
  const today = new Date("2025-11-30");
  const daysUntil = Math.floor((checkDate - today) / (1000 * 60 * 60 * 24));

  let urgency = "🟢 OK";
  if (daysUntil <= 30) urgency = "🔴 URGENT";
  else if (daysUntil <= 90) urgency = "🟡 BIENTÔT";

  console.log(`📌 ${check.date} - ${urgency} (${daysUntil} jours)`);
  check.checklist.forEach((item) => {
    console.log(`   ✓ ${item}`);
  });
});

// Verification gaps
console.log(
  "\n╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║  ⚠️  CALCULATEURS NECESSITANT VERIFICATION                      ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

const needsVerification = globalConfig.calculators.filter((c) =>
  c.status.includes("A verifier")
);
needsVerification.forEach((calc) => {
  console.log(`\n❌ ${calc.name}`);

  const dataSources = Object.keys(calc.data_sources);
  const nextChecks = dataSources.map(
    (key) => new Date(calc.data_sources[key].next_check)
  );
  const urgentChecks = nextChecks.filter((d) => {
    const today = new Date("2025-11-30");
    const daysUntil = Math.floor((d - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30;
  });

  if (urgentChecks.length > 0) {
    console.log(`   🔴 ${urgentChecks.length} verification(s) URGENTE(S)`);
  }

  console.log(`   A FAIRE:`);
  console.log(`   1. Localiser page du calculateur`);
  console.log(`   2. Verifier chaque source de donnees`);
  console.log(`   3. Mettre a jour si necessaire`);
  console.log(`   4. Tester calculs avec exemples`);
  console.log(`   5. Marquer comme "✅ A jour" ici`);
});

// Action plan
console.log(
  "\n╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║  🎯 PLAN D'ACTION PRIORITAIRE                                 ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

console.log("Priorite 1 - AVANT le 15 decembre 2025:");
console.log("  □ Pret immobilier - Verifier taux + assurance emprunteur");
console.log("  □ Frais agence - Verifier commission moyenne");

console.log("\nPriorite 2 - AVANT le 1er janvier 2026:");
console.log("  □ Plus-value - Verifier impot + prelevement social");
console.log("  □ Investissement locatif - Verifier taxe fonciere + rendement");
console.log("  □ APL - Verifier montants et plafonds");
console.log("  □ Charges locatives - Verifier taxe fonciere");
console.log("  □ Notaire - Mise a jour annuelle (tranches, droits, CSI, TVA)");

console.log("\nPriorite 3 - AVANT le 1er fevrier 2026:");
console.log("  □ Notaire - Revision trimestrielle baremes");

console.log("\n✅ Executer ce script regulierement pour rester synchronise!");
console.log(
  "📧 Suggestions: configurer rappel mail pour chaque date importante\n"
);
