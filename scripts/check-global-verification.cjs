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
  "║  🌍 VÉRIFICATION GLOBALE - Tous les Calculateurs               ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

console.log(`📊 RÉSUMÉ PLATEFORME:`);
console.log(`   Total calculateurs: ${globalConfig.summary.total_calculators}`);
console.log(`   ✅ À jour: ${globalConfig.summary.up_to_date}`);
console.log(`   ⚠️  À vérifier: ${globalConfig.summary.need_verification}`);
console.log(`   Dernier audit: ${globalConfig.summary.last_full_audit}`);
console.log(
  `   Prochain audit complet: ${globalConfig.summary.next_full_audit}\n`
);

// Display each calculator
console.log(
  "╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║  📋 ÉTAT DE CHAQUE CALCULATEUR                                 ║"
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
  console.log(`   📌 Sources de données (${sources.length}):`);

  sources.forEach((key) => {
    const source = calc.data_sources[key];
    const nextCheck = new Date(source.next_check);
    const today = new Date("2025-11-30");
    const daysUntil = Math.floor((nextCheck - today) / (1000 * 60 * 60 * 24));

    let urgency = "🟢";
    if (daysUntil <= 30) urgency = "🔴 URGENT";
    else if (daysUntil <= 90) urgency = "🟡 BIENTÔT";

    console.log(`      • ${key}`);
    console.log(`        Fréquence: ${source.frequency}`);
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
  "║  📅 CALENDRIER GLOBAL DE VÉRIFICATION                          ║"
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
  "║  ⚠️  CALCULATEURS NÉCESSITANT VÉRIFICATION                      ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

const needsVerification = globalConfig.calculators.filter((c) =>
  c.status.includes("À vérifier")
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
    console.log(`   🔴 ${urgentChecks.length} vérification(s) URGENTE(S)`);
  }

  console.log(`   À FAIRE:`);
  console.log(`   1. Localiser page du calculateur`);
  console.log(`   2. Vérifier chaque source de données`);
  console.log(`   3. Mettre à jour si nécessaire`);
  console.log(`   4. Tester calculs avec exemples`);
  console.log(`   5. Marquer comme "✅ À jour" ici`);
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

console.log("Priorité 1 - AVANT le 15 décembre 2025:");
console.log("  □ Prêt immobilier - Vérifier taux + assurance emprunteur");
console.log("  □ Frais agence - Vérifier commission moyenne");

console.log("\nPriorité 2 - AVANT le 1er janvier 2026:");
console.log("  □ Plus-value - Vérifier impôt + prélèvement social");
console.log("  □ Investissement locatif - Vérifier taxe foncière + rendement");
console.log("  □ APL - Vérifier montants et plafonds");
console.log("  □ Charges locatives - Vérifier taxe foncière");
console.log("  □ Notaire - Mise à jour annuelle (tranches, droits, CSI, TVA)");

console.log("\nPriorité 3 - AVANT le 1er février 2026:");
console.log("  □ Notaire - Révision trimestrielle barèmes");

console.log("\n✅ Exécuter ce script régulièrement pour rester synchronisé!");
console.log(
  "📧 Suggestions: configurer rappel mail pour chaque date importante\n"
);
