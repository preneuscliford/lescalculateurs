#!/usr/bin/env node
/**
 * Script de suivi des dates de publication
 * Affiche quand verifier les mises a jour officielles
 */

const fs = require("fs");

const monitoring = JSON.parse(
  fs.readFileSync("data/monitoring-calendar.json", "utf-8")
);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  📅 CALENDRIER DE SUIVI - Frais Notaire 2025-2026              ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`\n⏰ DERNIÈRE VERIFICATION: ${monitoring.last_updated}\n`);

console.log(`\n📌 TCHES DE MONITORING:\n`);
console.log(`${"─".repeat(70)}\n`);

monitoring.monitoring_tasks.forEach((task, idx) => {
  const checkDate = new Date(task.next_check);
  const today = new Date();
  const daysUntil = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));
  const urgency =
    daysUntil <= 30 ? "🔴 URGENT" : daysUntil <= 90 ? "🟡 BIENTÔT" : "🟢 OK";

  console.log(`${idx + 1}. ${task.task}`);
  console.log(`   Frequence: ${task.frequency}`);
  console.log(
    `   Prochaine verification: ${task.next_check} (${daysUntil} jours) ${urgency}`
  );
  console.log(`   Source: ${task.source}`);
  console.log();
});

console.log(`${"─".repeat(70)}\n`);

console.log(`\n📊 BARÈMES ACTUELS:\n`);
console.log(`Version: ${monitoring.baremes_notariaux.version}`);
console.log(
  `Derniere mise a jour: ${monitoring.baremes_notariaux.effective_date}`
);
console.log(
  `Prochaine revision attendue: ${monitoring.baremes_notariaux.next_expected_update}\n`
);

console.log(`Tranches d'emoluments:`);
monitoring.baremes_notariaux.tranches.forEach((t) => {
  console.log(
    `  ${t.min.toLocaleString()} - ${t.max.toLocaleString()}€: ${(
      t.taux * 100
    ).toFixed(2)}%`
  );
});

console.log(`\n\n✅ ACTIONS RECOMMANDEES:\n`);
console.log(`1. ✓ Verifie les sources officielles mensuellement`);
console.log(`2. ✓ Mets a jour les donnees des la publication officielle`);
console.log(`3. ✓ Teste les calculateurs apres chaque mise a jour`);
console.log(`4. ✓ Notifie les utilisateurs des changements majeurs`);
console.log(`5. ✓ Archive les anciennes versions pour reference\n`);

console.log(`\n📬 ALERTES A CONFIGURER:\n`);
monitoring.alert_rules.alert_on.forEach((alert) => {
  console.log(`  • ${alert}`);
});

console.log(`\n${"═".repeat(70)}\n`);
