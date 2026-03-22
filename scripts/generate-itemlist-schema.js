/**
 * Script de generation automatique du JSON-LD ItemList pour les 101 departements
 * Usage: node scripts/generate-itemlist-schema.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste complete des departements francais (101)
const departements = [
  { code: "01", nom: "Ain" },
  { code: "02", nom: "Aisne" },
  { code: "03", nom: "Allier" },
  { code: "04", nom: "Alpes-de-Haute-Provence" },
  { code: "05", nom: "Hautes-Alpes" },
  { code: "06", nom: "Alpes-Maritimes" },
  { code: "07", nom: "Ardeche" },
  { code: "08", nom: "Ardennes" },
  { code: "09", nom: "Ariege" },
  { code: "10", nom: "Aube" },
  { code: "11", nom: "Aude" },
  { code: "12", nom: "Aveyron" },
  { code: "13", nom: "Bouches-du-Rhone" },
  { code: "14", nom: "Calvados" },
  { code: "15", nom: "Cantal" },
  { code: "16", nom: "Charente" },
  { code: "17", nom: "Charente-Maritime" },
  { code: "18", nom: "Cher" },
  { code: "19", nom: "Correze" },
  { code: "2A", nom: "Corse-du-Sud" },
  { code: "2B", nom: "Haute-Corse" },
  { code: "21", nom: "Cote-d'Or" },
  { code: "22", nom: "Cotes-d'Armor" },
  { code: "23", nom: "Creuse" },
  { code: "24", nom: "Dordogne" },
  { code: "25", nom: "Doubs" },
  { code: "26", nom: "Drome" },
  { code: "27", nom: "Eure" },
  { code: "28", nom: "Eure-et-Loir" },
  { code: "29", nom: "Finistere" },
  { code: "30", nom: "Gard" },
  { code: "31", nom: "Haute-Garonne" },
  { code: "32", nom: "Gers" },
  { code: "33", nom: "Gironde" },
  { code: "34", nom: "Herault" },
  { code: "35", nom: "Ille-et-Vilaine" },
  { code: "36", nom: "Indre" },
  { code: "37", nom: "Indre-et-Loire" },
  { code: "38", nom: "Isere" },
  { code: "39", nom: "Jura" },
  { code: "40", nom: "Landes" },
  { code: "41", nom: "Loir-et-Cher" },
  { code: "42", nom: "Loire" },
  { code: "43", nom: "Haute-Loire" },
  { code: "44", nom: "Loire-Atlantique" },
  { code: "45", nom: "Loiret" },
  { code: "46", nom: "Lot" },
  { code: "47", nom: "Lot-et-Garonne" },
  { code: "48", nom: "Lozere" },
  { code: "49", nom: "Maine-et-Loire" },
  { code: "50", nom: "Manche" },
  { code: "51", nom: "Marne" },
  { code: "52", nom: "Haute-Marne" },
  { code: "53", nom: "Mayenne" },
  { code: "54", nom: "Meurthe-et-Moselle" },
  { code: "55", nom: "Meuse" },
  { code: "56", nom: "Morbihan" },
  { code: "57", nom: "Moselle" },
  { code: "58", nom: "Nievre" },
  { code: "59", nom: "Nord" },
  { code: "60", nom: "Oise" },
  { code: "61", nom: "Orne" },
  { code: "62", nom: "Pas-de-Calais" },
  { code: "63", nom: "Puy-de-Dome" },
  { code: "64", nom: "Pyrenees-Atlantiques" },
  { code: "65", nom: "Hautes-Pyrenees" },
  { code: "66", nom: "Pyrenees-Orientales" },
  { code: "67", nom: "Bas-Rhin" },
  { code: "68", nom: "Haut-Rhin" },
  { code: "69", nom: "Rhone" },
  { code: "70", nom: "Haute-Saone" },
  { code: "71", nom: "Saone-et-Loire" },
  { code: "72", nom: "Sarthe" },
  { code: "73", nom: "Savoie" },
  { code: "74", nom: "Haute-Savoie" },
  { code: "75", nom: "Paris" },
  { code: "76", nom: "Seine-Maritime" },
  { code: "77", nom: "Seine-et-Marne" },
  { code: "78", nom: "Yvelines" },
  { code: "79", nom: "Deux-Sevres" },
  { code: "80", nom: "Somme" },
  { code: "81", nom: "Tarn" },
  { code: "82", nom: "Tarn-et-Garonne" },
  { code: "83", nom: "Var" },
  { code: "84", nom: "Vaucluse" },
  { code: "85", nom: "Vendee" },
  { code: "86", nom: "Vienne" },
  { code: "87", nom: "Haute-Vienne" },
  { code: "88", nom: "Vosges" },
  { code: "89", nom: "Yonne" },
  { code: "90", nom: "Territoire de Belfort" },
  { code: "91", nom: "Essonne" },
  { code: "92", nom: "Hauts-de-Seine" },
  { code: "93", nom: "Seine-Saint-Denis" },
  { code: "94", nom: "Val-de-Marne" },
  { code: "95", nom: "Val-d'Oise" },
  { code: "971", nom: "Guadeloupe" },
  { code: "972", nom: "Martinique" },
  { code: "973", nom: "Guyane" },
  { code: "974", nom: "La Reunion" },
  { code: "976", nom: "Mayotte" },
];

// Generation du JSON-LD ItemList
function generateItemListSchema() {
  const itemListElements = departements.map((dept, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${dept.code}.html`,
    name: `Frais de notaire ${dept.nom} (${dept.code})`,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Frais de notaire par departement 2025",
    description:
      "Liste complete des 101 departements francais avec simulateur de frais de notaire",
    numberOfItems: departements.length,
    itemListElement: itemListElements,
  };

  return schema;
}

// Generation du code HTML a inserer
function generateHTMLSchema() {
  const schema = generateItemListSchema();
  return `    <!-- Schema.org ItemList (101 departements) -->
    <script type="application/ld+json">
      ${JSON.stringify(schema, null, 6).replace(/^/gm, "      ").trim()}
    </script>`;
}

// Fonction principale
function main() {
  console.log("🔧 Generation du JSON-LD ItemList...\n");

  const htmlSchema = generateHTMLSchema();

  // Affichage du resultat
  console.log("✅ JSON-LD genere avec succes !\n");
  console.log(`📊 Nombre de departements : ${departements.length}`);
  console.log(`📏 Taille du schema : ${htmlSchema.length} caracteres\n`);

  // Sauvegarde dans un fichier
  const outputPath = path.join(__dirname, "../temp/itemlist-schema.html");
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, htmlSchema, "utf-8");
  console.log(`💾 Schema sauvegarde : ${outputPath}\n`);

  // Affichage d'un apercu
  console.log("📄 Apercu (premieres lignes) :\n");
  const lines = htmlSchema.split("\n");
  console.log(lines.slice(0, 15).join("\n"));
  console.log("      ...");
  console.log(`      ${lines.length - 15} lignes supplementaires`);
  console.log("    </script>");

  console.log(
    "\n✨ Vous pouvez maintenant copier le contenu de temp/itemlist-schema.html"
  );
  console.log(
    "   et le coller dans src/pages/blog/frais-notaire-departements.html"
  );
}

// Execution
main();
