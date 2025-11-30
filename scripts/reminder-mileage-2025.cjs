#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  🚗 RAPPEL URGENTE - Indemnité Kilométrique 2025               ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const today = new Date('2025-11-30');
const checkDate = new Date('2025-12-20');
const daysUntil = Math.floor((checkDate - today) / (1000 * 60 * 60 * 24));

console.log(`📅 SITUATION ACTUELLE (30 novembre 2025):`);
console.log(`   Calculateur existant: ✅ Oui (basé sur taux 2024)`);
console.log(`   Taux 2025: ⏳ Non publiés (attendus très bientôt)`);
console.log(`   Publication attendue: 20-31 décembre 2025`);
console.log(`   Mise en vigueur: 1er janvier 2026\n`);

console.log(`⏰ TIMELINE CRITIQUE:`);
console.log(`   🟡 20 décembre 2025 (${daysUntil} jours): Début vérification BOFIP`);
console.log(`   🟡 31 décembre 2025 (${daysUntil + 11} jours): Dernier jour avant application`);
console.log(`   🔴 1er janvier 2026 (${daysUntil + 32} jours): Taux doivent être actifs\n`);

console.log(`📚 SOURCES À CONSULTER:`);
console.log(`   1. https://bofip.impots.gouv.fr/`);
console.log(`      Rechercher: "IR - Frais professionnels - Indemnité kilométrique"`);
console.log(`\n   2. https://www.impots.gouv.fr/documentation`);
console.log(`      Rechercher: "Indemnité kilométrique 2025"`);
console.log(`\n   3. https://www.service-public.gouv.fr`);
console.log(`      Rechercher: "Déduction frais kilométriques"`);
console.log(`\n   4. https://www.notaires.fr`);
console.log(`      Frais professionnels déductibles\n`);

console.log(`🚗 TAUX ACTUELS 2024 (À CONFIRMER 2025):`);
console.log(`   ┌─ Automobile         │ 0,676 €/km (ou 0,683)*`);
console.log(`   ├─ Motocyclette       │ 0,217 €/km (ou 0,286)*`);
console.log(`   ├─ Cyclomoteur        │ 0,164 €/km`);
console.log(`   ├─ Vélo électrique    │ 0,005 €/km (ou 0,276)*`);
console.log(`   └─ Moto électrique    │ 0,237 €/km`);
console.log(`   * Écarts détectés - À clarifier avec BOFIP\n`);

console.log(`✅ CHECKLIST AVANT PUBLICATION TAUX 2025:`);
console.log(`   [ ] Consulter BOFIP régulièrement (à partir du 20/12)`);
console.log(`   [ ] Récupérer document "Indemnité kilométrique 2025"`);
console.log(`   [ ] Noter tous les taux par type de véhicule`);
console.log(`   [ ] Comparer avec taux 2024`);
console.log(`   [ ] Identifier changements\n`);

console.log(`📝 CHECKLIST MISE À JOUR:`);
console.log(`   [ ] Localiser fichier: src/pages/calcul-indemnite-kilometrique.ts`);
console.log(`   [ ] Mettre à jour constantes de taux`);
console.log(`   [ ] Ajouter commentaire avec date et source`);
console.log(`   [ ] Tester: 5000 km auto, 3000 km moto, 1000 km vélo`);
console.log(`   [ ] Vérifier page affiche "Données 2025" ou "Barème 2025"`);
console.log(`   [ ] Committer: "Update: mileage rates 2025 from BOFIP"`);
console.log(`   [ ] Mettre à jour global-monitoring.json status\n`);

console.log(`📊 STATUS:`);
console.log(`   Calculateur: ⚠️ À vérifier (données 2024 en place)`);
console.log(`   Urgence: 🔴 HAUTE - Publication imminente`);
console.log(`   Priorité: P1 - URGENT\n`);

console.log(`💾 DOCUMENTATION:`);
console.log(`   • VERIFICATION-INDEMNITE-KM.md: Guide complet de vérification`);
console.log(`   • global-monitoring.json: Suivi global des calculateurs`);
console.log(`   • check-global-verification.cjs: Script de vérification\n`);

console.log(`🎯 ACTION IMMÉDIATE:`);
console.log(`   1. Marquer votre calendrier: 20 décembre 2025`);
console.log(`   2. Configurer rappel pour consulter BOFIP`);
console.log(`   3. Préparer mise à jour calculateur`);
console.log(`   4. Tester dès réception des taux 2025\n`);

console.log(`✉️  SUGGESTION:`);
console.log(`   Ajouter rappel calendrier:`);
console.log(`   • 20 décembre 2025: Vérifier BOFIP (début)`);
console.log(`   • 27 décembre 2025: Mettre à jour calculateur`);
console.log(`   • 31 décembre 2025: Test final avant passage en prod\n`);
