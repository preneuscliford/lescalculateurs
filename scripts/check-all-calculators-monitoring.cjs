#!/usr/bin/env node
/**
 * Script de suivi complet de tous les calculateurs
 * Affiche l'etat de chaque calculateur et ses taches de monitoring
 */

const fs = require("fs");

const monitoring = JSON.parse(
  fs.readFileSync("data/monitoring-calendar.json", "utf-8")
);

// Grouper les taches par calculateur
const tasksByCalculator = {};
monitoring.monitoring_tasks.forEach((task) => {
  const calc = task.calculator;
  if (!tasksByCalculator[calc]) {
    tasksByCalculator[calc] = [];
  }
  tasksByCalculator[calc].push(task);
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  📊 MONITORING COMPLET - Tous les Calculateurs                 ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`\n⏰ DERNIÈRE VERIFICATION: ${monitoring.last_updated}\n`);

const calculators = [
  "notaire",
  "impot",
  "salaire",
  "plusvalue",
  "apl",
  "ik",
  "pret",
  "charges",
  "crypto-bourse",
  "taxe",
  "financement",
  "travail",
];

let urgentCount = 0;
let soonCount = 0;
let okCount = 0;

// Afficher pour chaque calculateur
calculators.forEach((calc) => {
  if (!tasksByCalculator[calc]) {
    console.log(`\n⚠️  ${calc.toUpperCase()}`);
    console.log(`   ❌ Aucune tache de monitoring configuree\n`);
    return;
  }

  console.log(`\n📱 ${calc.toUpperCase()}`);
  console.log(`   Nombre de taches: ${tasksByCalculator[calc].length}`);
  console.log(`   ${"─".repeat(66)}`);

  let calcUrgent = 0;
  let calcSoon = 0;
  let calcOk = 0;

  tasksByCalculator[calc].forEach((task, idx) => {
    const checkDate = new Date(task.next_check);
    const today = new Date();
    const daysUntil = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));
    const urgency =
      daysUntil <= 30
        ? "🔴 URGENT"
        : daysUntil <= 90
          ? "🟡 BIENTÔT"
          : "🟢 OK";

    if (daysUntil <= 30) calcUrgent++;
    else if (daysUntil <= 90) calcSoon++;
    else calcOk++;

    console.log(`   ${idx + 1}. ${task.task}`);
    console.log(`      Freq: ${task.frequency}`);
    console.log(
      `      ${task.next_check} (${daysUntil}j) ${urgency}`
    );
  });

  console.log(`\n   Synthese: 🔴 ${calcUrgent} URGENT | 🟡 ${calcSoon} BIENTÔT | 🟢 ${calcOk} OK\n`);

  urgentCount += calcUrgent;
  soonCount += calcSoon;
  okCount += calcOk;
});

// Resume global
console.log(`\n${"═".repeat(70)}`);
console.log(`\n📈 SYNTHÈSE GLOBALE:\n`);
console.log(`   Total taches de monitoring: ${monitoring.monitoring_tasks.length}`);
console.log(`   🔴 URGENT: ${urgentCount}`);
console.log(`   🟡 BIENTÔT: ${soonCount}`);
console.log(`   🟢 OK: ${okCount}`);

// Actions a faire immediatement
const urgent = monitoring.monitoring_tasks.filter((task) => {
  const checkDate = new Date(task.next_check);
  const today = new Date();
  const daysUntil = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));
  return daysUntil <= 30;
});

if (urgent.length > 0) {
  console.log(`\n${"─".repeat(70)}\n`);
  console.log(`🚨 ACTIONS PRIORITAIRES (${urgent.length} taches):\n`);
  urgent.forEach((task, idx) => {
    console.log(`${idx + 1}. [${task.calculator.toUpperCase()}] ${task.task}`);
    console.log(`   A faire avant: ${task.next_check}`);
    console.log(`   Source: ${task.source}\n`);
  });
}

// Alertes configurees
console.log(`${"═".repeat(70)}\n`);
console.log(`📬 ALERTES CONFIGUREES:\n`);
monitoring.alert_rules.alert_on.forEach((alert) => {
  console.log(`  • ${alert}`);
});

console.log(`\n📧 Notification: ${monitoring.alert_rules.email_notification}`);
console.log(
  `⏱️  Intervalle de verification: tous les ${monitoring.alert_rules.check_interval_days} jours\n`
);

console.log(`═`.repeat(70));
