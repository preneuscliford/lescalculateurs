#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log(
  "\n╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║  🚗 RAPPEL URGENTE - Indemnite Kilometrique 2025               ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

const today = new Date("2025-11-30");
const checkDate = new Date("2025-12-20");
const daysUntil = Math.floor((checkDate - today) / (1000 * 60 * 60 * 24));

console.log(`📅 SITUATION ACTUELLE (30 novembre 2025):`);
console.log(`   Calculateur existant: ✅ Oui (base sur taux 2024)`);
console.log(`   Taux 2025: ⏳ Non publies (attendus tres bientot)`);
console.log(`   Publication attendue: 20-31 decembre 2025`);
console.log(`   Mise en vigueur: 1er janvier 2026\n`);

console.log(`⏰ TIMELINE CRITIQUE:`);
console.log(
  `   🟡 20 decembre 2025 (${daysUntil} jours): Debut verification BOFIP`
);
console.log(
  `   🟡 31 decembre 2025 (${
    daysUntil + 11
  } jours): Dernier jour avant application`
);
console.log(
  `   🔴 1er janvier 2026 (${daysUntil + 32} jours): Taux doivent etre actifs\n`
);

console.log(`📚 SOURCES A CONSULTER:`);
console.log(`   1. https://bofip.impots.gouv.fr/`);
console.log(
  `      Rechercher: "IR - Frais professionnels - Indemnite kilometrique"`
);
console.log(`\n   2. https://www.impots.gouv.fr/documentation`);
console.log(`      Rechercher: "Indemnite kilometrique 2025"`);
console.log(`\n   3. https://www.service-public.gouv.fr`);
console.log(`      Rechercher: "Deduction frais kilometriques"`);
console.log(`\n   4. https://www.notaires.fr`);
console.log(`      Frais professionnels deductibles\n`);

console.log(`🚗 TAUX ACTUELS 2024 (A CONFIRMER 2025):`);
console.log(`   ┌─ Automobile         │ 0,676 €/km (ou 0,683)*`);
console.log(`   ├─ Motocyclette       │ 0,217 €/km (ou 0,286)*`);
console.log(`   ├─ Cyclomoteur        │ 0,164 €/km`);
console.log(`   ├─ Velo electrique    │ 0,005 €/km (ou 0,276)*`);
console.log(`   └─ Moto electrique    │ 0,237 €/km`);
console.log(`   * Ecarts detectes - A clarifier avec BOFIP\n`);

console.log(`✅ CHECKLIST AVANT PUBLICATION TAUX 2025:`);
console.log(`   [ ] Consulter BOFIP regulierement (a partir du 20/12)`);
console.log(`   [ ] Recuperer document "Indemnite kilometrique 2025"`);
console.log(`   [ ] Noter tous les taux par type de vehicule`);
console.log(`   [ ] Comparer avec taux 2024`);
console.log(`   [ ] Identifier changements\n`);

console.log(`📝 CHECKLIST MISE A JOUR:`);
console.log(
  `   [ ] Localiser fichier: src/pages/calcul-indemnite-kilometrique.ts`
);
console.log(`   [ ] Mettre a jour constantes de taux`);
console.log(`   [ ] Ajouter commentaire avec date et source`);
console.log(`   [ ] Tester: 5000 km auto, 3000 km moto, 1000 km velo`);
console.log(`   [ ] Verifier page affiche "Donnees 2025" ou "Bareme 2025"`);
console.log(`   [ ] Committer: "Update: mileage rates 2025 from BOFIP"`);
console.log(`   [ ] Mettre a jour global-monitoring.json status\n`);

console.log(`📊 STATUS:`);
console.log(`   Calculateur: ⚠️ A verifier (donnees 2024 en place)`);
console.log(`   Urgence: 🔴 HAUTE - Publication imminente`);
console.log(`   Priorite: P1 - URGENT\n`);

console.log(`💾 DOCUMENTATION:`);
console.log(`   • VERIFICATION-INDEMNITE-KM.md: Guide complet de verification`);
console.log(`   • global-monitoring.json: Suivi global des calculateurs`);
console.log(`   • check-global-verification.cjs: Script de verification\n`);

console.log(`🎯 ACTION IMMEDIATE:`);
console.log(`   1. Marquer votre calendrier: 20 decembre 2025`);
console.log(`   2. Configurer rappel pour consulter BOFIP`);
console.log(`   3. Preparer mise a jour calculateur`);
console.log(`   4. Tester des reception des taux 2025\n`);

console.log(`✉️  SUGGESTION:`);
console.log(`   Ajouter rappel calendrier:`);
console.log(`   • 20 decembre 2025: Verifier BOFIP (debut)`);
console.log(`   • 27 decembre 2025: Mettre a jour calculateur`);
console.log(`   • 31 decembre 2025: Test final avant passage en prod\n`);
