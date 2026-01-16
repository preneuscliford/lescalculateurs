/**
 * Script de mise à jour de la page plus-value immobilière
 * 2025 → 2026
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/plusvalue.html');

let content = fs.readFileSync(filePath, 'utf8');

// Remplacements 2025 → 2026
content = content.replace(/Plus-value Immobilière 2025/g, 'Plus-value Immobilière 2026');
content = content.replace(/plus-value immobilière 2025/g, 'plus-value immobilière 2026');
content = content.replace(/Plus-Value Immobilière 2025/g, 'Plus-Value Immobilière 2026');
content = content.replace(/abattements 2025/gi, 'abattements 2026');
content = content.replace(/Abattements 2025/g, 'Abattements 2026');
content = content.replace(/barèmes 2025/g, 'barèmes 2026');
content = content.replace(/réglementation fiscale 2025/g, 'réglementation fiscale 2026');
content = content.replace(/exonérations 2025/g, 'exonérations 2026');

// Ne PAS changer les max date (max="2025-12-31" reste valide pour les dates de vente passées)

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Page plusvalue.html mise à jour vers 2026');
