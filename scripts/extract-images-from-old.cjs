/**
 * Script pour extraire les URLs d'images des anciennes pages
 * et générer un mapping département -> image
 */

const { execSync } = require("child_process");

const CODES = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "2A",
  "2B",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "60",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "70",
  "71",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "78",
  "79",
  "80",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "90",
  "91",
  "92",
  "93",
  "94",
  "95",
  "971",
  "972",
  "973",
  "974",
  "975",
  "976",
];

const COMMIT = "eb2a1e6a77511656591826bc0c85a112a1b4a8d0";
const images = {};

console.log("Extraction des images des anciennes pages...\n");

for (const code of CODES) {
  try {
    const cmd = `git show ${COMMIT}:src/pages/blog/departements/frais-notaire-${code}.html`;
    const content = execSync(cmd, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });

    // Chercher l'URL de l'image
    const match = content.match(
      /src="(https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/[^"]+)"/,
    );
    if (match) {
      images[code] = match[1];
      console.log(`✅ ${code}: ${match[1].substring(0, 80)}...`);
    } else {
      console.log(`⚠️  ${code}: Pas d'image Wikimedia trouvée`);
    }
  } catch (e) {
    console.log(`❌ ${code}: Erreur - ${e.message.substring(0, 50)}`);
  }
}

console.log("\n\n// === MAPPING À COPIER DANS LE TEMPLATE ===\n");
console.log("const IMAGES = {");
for (const [code, url] of Object.entries(images)) {
  console.log(`  "${code}": "${url}",`);
}
console.log("};");
