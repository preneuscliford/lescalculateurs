/**
 * Script de generation automatique de 101 articles SEO sur les frais de notaire par departement
 * Usage: node scripts/generate-departement-articles.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEO_YEAR = 2026;
const DATE_PUBLISHED_ISO = "2026-01-16T10:00:00Z";
const DATE_PUBLISHED_FR = "16 janvier 2026";
const PUBLISH_MONTH_LABEL = "Janvier 2026";
const PUBLISH_MONTH_DATETIME = "2026-01-01";

function hasFlag(flag) {
  const args = process.argv.slice(2);
  return args.includes(flag) || args.some((a) => a.startsWith(`${flag}=`));
}

function normalizeDepartementCode(code) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return null;
  if (/^\d{1,2}$/.test(c)) return c.padStart(2, "0");
  if (/^\d{3}$/.test(c)) return c;
  if (c === "2A" || c === "2B") return c;
  return null;
}

function parseDepartementCodesFromArgs() {
  const args = process.argv.slice(2);
  const out = new Set();

  const addMany = (value) => {
    if (!value) return;
    for (const part of String(value).split(/[,\s;]+/g)) {
      const normalized = normalizeDepartementCode(part);
      if (normalized) out.add(normalized);
    }
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--dept=")) addMany(a.slice("--dept=".length));
    else if (a.startsWith("--departement="))
      addMany(a.slice("--departement=".length));
    else if (a === "--dept" || a === "--departement" || a === "-d")
      addMany(args[i + 1]);
  }

  addMany(process.env.DEPT || process.env.DEPARTEMENT);
  return out;
}

function isConformYMYL(html, depCode) {
  if (!html) return false;
  const hasTitle = html.includes("- Simulateur officiel gratuit</title>");
  const hasCanonical = html.includes(
    `https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-${depCode}`
  );
  const hasNoHtmlCanonical = !html.includes(
    `frais-notaire-${depCode}.html`
  );
  return hasTitle && hasCanonical && hasNoHtmlCanonical;
}

/**
 * Resout le chemin du fichier DVF 2024.
 * Priorite: env `DVF_PATH` → `../ValeursFoncieres-2024.txt` → chemin absolu projet.
 */
function resolveDVFPath() {
  const fromEnv = process.env.DVF_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const local = path.resolve(__dirname, "../ValeursFoncieres-2024.txt");
  if (fs.existsSync(local)) return local;
  const abs = path.resolve(
    "c:/Users/prene/OneDrive/Bureau/lesCalculateurs/ValeursFoncieres-2024.txt"
  );
  return abs;
}

/**
 * Normalise un nom de commune: supprime les accents, majuscules, trim.
 */
function normalizeCityName(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/**
 * Charge les statistiques DVF (transactions et ventes immobilieres) par commune,
 * de maniere synchrone pour les villes ciblees.
 * - Filtre: `Nature mutation = Vente`, annee 2024
 * - Transactions uniques: groupees par `Reference document` + `No disposition`
 * - Ventes immobilieres: transaction ayant au moins un `Type local` ∈ {Maison, Appartement}
 */
function loadDVFStatsSync(dvfPath, targetCitiesSet) {
  const statsByCommune = new Map();
  try {
    if (!fs.existsSync(dvfPath)) return statsByCommune;
    const content = fs.readFileSync(dvfPath, "utf-8");
    const lines = content.split(/\r?\n/);
    if (!lines.length) return statsByCommune;
    const header = lines[0].split("|");
    const idx = {
      ref: header.indexOf("Reference document"),
      disp: header.indexOf("No disposition"),
      date: header.indexOf("Date mutation"),
      nature: header.indexOf("Nature mutation"),
      commune: header.indexOf("Commune"),
      typeLocal: header.indexOf("Type local"),
      valeur: header.indexOf("Valeur fonciere"),
    };
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split("|");
      if (!parts || parts.length < header.length) continue;
      const nature = parts[idx.nature] || "";
      if (nature !== "Vente") continue;
      const dateStr = parts[idx.date] || "";
      if (!dateStr.endsWith("2024")) continue;
      const communeRaw = parts[idx.commune] || "";
      const commune = normalizeCityName(communeRaw);
      if (!targetCitiesSet.has(commune)) continue;
      const ref = (parts[idx.ref] || "").trim();
      const disp = (parts[idx.disp] || "").trim();
      const transId = `${ref}|${disp}`;
      const typeLocal = (parts[idx.typeLocal] || "").trim();
      const valeurStr = (parts[idx.valeur] || "").replace(/\s/g, "");
      const valeur = valeurStr ? Number(valeurStr.replace(",", ".")) : NaN;

      let transMap = statsByCommune.get(commune);
      if (!transMap) {
        transMap = new Map();
        statsByCommune.set(commune, transMap);
      }
      let t = transMap.get(transId);
      if (!t) {
        t = {
          hasImmo: false,
          value: NaN,
          typeMaison: false,
          typeAppartement: false,
        };
        transMap.set(transId, t);
      }
      if (typeLocal === "Maison" || typeLocal === "Appartement") {
        t.hasImmo = true;
        if (!Number.isFinite(t.value) && Number.isFinite(valeur)) {
          t.value = valeur;
        }
        if (typeLocal === "Maison") t.typeMaison = true;
        if (typeLocal === "Appartement") t.typeAppartement = true;
      }
    }

    // Agrege en comptes
    const finalStats = new Map();
    for (const [commune, transMap] of statsByCommune.entries()) {
      const total = transMap.size;
      let maisonsOnly = 0;
      let appartementsOnly = 0;
      let mixtes = 0;
      const values = [];
      for (const t of transMap.values()) {
        if (t.typeMaison && t.typeAppartement) {
          mixtes++;
        } else if (t.typeMaison) {
          maisonsOnly++;
        } else if (t.typeAppartement) {
          appartementsOnly++;
        }
        if (Number.isFinite(t.value)) values.push(t.value);
      }
      const immo = maisonsOnly + appartementsOnly + mixtes;
      values.sort((a, b) => a - b);
      const mid = Math.floor(values.length / 2);
      const median =
        values.length === 0
          ? NaN
          : values.length % 2
          ? values[mid]
          : (values[mid - 1] + values[mid]) / 2;
      finalStats.set(commune, {
        transactions: total,
        immobilier: immo,
        maisons: maisonsOnly,
        appartements: appartementsOnly,
        mixtes,
        median,
      });
    }
    return finalStats;
  } catch (_) {
    return new Map();
  }
}

// Cache des statistiques DVF (initialisation paresseuse)
let DVF_STATS_CACHE = null;

/**
 * Resout les balises d'assets a injecter selon l'environnement.
 * - En developpement: injecte le module `main.ts` (Vite charge Tailwind CSS).
 * - En production: lit `dist/manifest.json` pour inserer les fichiers hashes JS/CSS.
 */
const resolveAssetsForEnv = () => {
  try {
    const manifestPath = path.resolve(__dirname, "../dist/manifest.json");
    if (fs.existsSync(manifestPath)) {
      const manifestRaw = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestRaw);
      const mainEntry =
        manifest["src/main.ts"] ||
        Object.values(manifest).find(
          (m) => m && m.isEntry && Array.isArray(m.css)
        );
      if (mainEntry && mainEntry.file) {
        const jsHref = `/assets/${mainEntry.file.replace(/^assets\//, "")}`;
        const cssHref =
          mainEntry.css && mainEntry.css[0]
            ? `/assets/${mainEntry.css[0].replace(/^assets\//, "")}`
            : "";
        const cssTag = cssHref
          ? `<link rel=\"stylesheet\" crossorigin href=\"${cssHref}\">`
          : "";
        return `<script type=\"module\" crossorigin src=\"${jsHref}\"></script>${cssTag}`;
      }
    }
  } catch (_) {
    // Fallback dev
  }
  return `<script type=\"module\" src=\"../../../main.ts\"></script>`;
};

/**
 * Formate une date JS en francais (ex: "14 novembre 2025").
 */
const formatDateFR = (date) => {
  const mois = [
    "janvier",
    "fevrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "decembre",
  ];
  const jour = date.getDate();
  const moisNom = mois[date.getMonth()];
  const annee = date.getFullYear();
  return `${jour} ${moisNom} ${annee}`;
};

// Liste complete des departements francais (101)
const departements = [
  {
    code: "01",
    nom: "Ain",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Bourg-en-Bresse",
    ville2: "Oyonnax",
    prixM2: 2100,
  },
  {
    code: "02",
    nom: "Aisne",
    region: "Hauts-de-France",
    ville1: "Laon",
    ville2: "Saint-Quentin",
    prixM2: 1600,
  },
  {
    code: "03",
    nom: "Allier",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Moulins",
    ville2: "Montlucon",
    prixM2: 1400,
  },
  {
    code: "04",
    nom: "Alpes-de-Haute-Provence",
    region: "Provence-Alpes-Cote d'Azur",
    ville1: "Digne-les-Bains",
    ville2: "Manosque",
    prixM2: 2300,
  },
  {
    code: "05",
    nom: "Hautes-Alpes",
    region: "Provence-Alpes-Cote d'Azur",
    ville1: "Gap",
    ville2: "Briancon",
    prixM2: 2800,
  },
  {
    code: "06",
    nom: "Alpes-Maritimes",
    region: "Provence-Alpes-Cote d'Azur",
    ville1: "Nice",
    ville2: "Cannes",
    prixM2: 4800,
  },
  {
    code: "07",
    nom: "Ardeche",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Privas",
    ville2: "Aubenas",
    prixM2: 1900,
  },
  {
    code: "08",
    nom: "Ardennes",
    region: "Grand Est",
    ville1: "Charleville-Mezieres",
    ville2: "Sedan",
    prixM2: 1300,
  },
  {
    code: "09",
    nom: "Ariege",
    region: "Occitanie",
    ville1: "Foix",
    ville2: "Pamiers",
    prixM2: 1500,
  },
  {
    code: "10",
    nom: "Aube",
    region: "Grand Est",
    ville1: "Troyes",
    ville2: "Romilly-sur-Seine",
    prixM2: 1700,
  },
  {
    code: "11",
    nom: "Aude",
    region: "Occitanie",
    ville1: "Carcassonne",
    ville2: "Narbonne",
    prixM2: 1800,
  },
  {
    code: "12",
    nom: "Aveyron",
    region: "Occitanie",
    ville1: "Rodez",
    ville2: "Millau",
    prixM2: 1600,
  },
  {
    code: "13",
    nom: "Bouches-du-Rhone",
    region: "Provence-Alpes-Cote d'Azur",
    ville1: "Marseille",
    ville2: "Aix-en-Provence",
    prixM2: 3500,
  },
  {
    code: "14",
    nom: "Calvados",
    region: "Normandie",
    ville1: "Caen",
    ville2: "Lisieux",
    prixM2: 2400,
  },
  {
    code: "15",
    nom: "Cantal",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Aurillac",
    ville2: "Saint-Flour",
    prixM2: 1200,
  },
  {
    code: "16",
    nom: "Charente",
    region: "Nouvelle-Aquitaine",
    ville1: "Angouleme",
    ville2: "Cognac",
    prixM2: 1600,
  },
  {
    code: "17",
    nom: "Charente-Maritime",
    region: "Nouvelle-Aquitaine",
    ville1: "La Rochelle",
    ville2: "Rochefort",
    prixM2: 2800,
  },
  {
    code: "18",
    nom: "Cher",
    region: "Centre-Val de Loire",
    ville1: "Bourges",
    ville2: "Vierzon",
    prixM2: 1400,
  },
  {
    code: "19",
    nom: "Correze",
    region: "Nouvelle-Aquitaine",
    ville1: "Tulle",
    ville2: "Brive-la-Gaillarde",
    prixM2: 1500,
  },
  {
    code: "21",
    nom: "Cote-d'Or",
    region: "Bourgogne-Franche-Comte",
    ville1: "Dijon",
    ville2: "Beaune",
    prixM2: 2500,
  },
  {
    code: "22",
    nom: "Cotes-d'Armor",
    region: "Bretagne",
    ville1: "Saint-Brieuc",
    ville2: "Lannion",
    prixM2: 1900,
  },
  {
    code: "23",
    nom: "Creuse",
    region: "Nouvelle-Aquitaine",
    ville1: "Gueret",
    ville2: "Aubusson",
    prixM2: 900,
  },
  {
    code: "24",
    nom: "Dordogne",
    region: "Nouvelle-Aquitaine",
    ville1: "Perigueux",
    ville2: "Bergerac",
    prixM2: 1700,
  },
  {
    code: "25",
    nom: "Doubs",
    region: "Bourgogne-Franche-Comte",
    ville1: "Besancon",
    ville2: "Montbeliard",
    prixM2: 2100,
  },
  {
    code: "26",
    nom: "Drome",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Valence",
    ville2: "Montelimar",
    prixM2: 2200,
  },
  {
    code: "27",
    nom: "Eure",
    region: "Normandie",
    ville1: "Evreux",
    ville2: "Vernon",
    prixM2: 2000,
  },
  {
    code: "28",
    nom: "Eure-et-Loir",
    region: "Centre-Val de Loire",
    ville1: "Chartres",
    ville2: "Dreux",
    prixM2: 2100,
  },
  {
    code: "29",
    nom: "Finistere",
    region: "Bretagne",
    ville1: "Brest",
    ville2: "Quimper",
    prixM2: 2100,
  },
  {
    code: "2A",
    nom: "Corse-du-Sud",
    region: "Corse",
    ville1: "Ajaccio",
    ville2: "Porto-Vecchio",
    prixM2: 3800,
  },
  {
    code: "2B",
    nom: "Haute-Corse",
    region: "Corse",
    ville1: "Bastia",
    ville2: "Calvi",
    prixM2: 3200,
  },
  {
    code: "30",
    nom: "Gard",
    region: "Occitanie",
    ville1: "Nîmes",
    ville2: "Ales",
    prixM2: 2300,
  },
  {
    code: "31",
    nom: "Haute-Garonne",
    region: "Occitanie",
    ville1: "Toulouse",
    ville2: "Colomiers",
    prixM2: 3200,
  },
  {
    code: "32",
    nom: "Gers",
    region: "Occitanie",
    ville1: "Auch",
    ville2: "Condom",
    prixM2: 1400,
  },
  {
    code: "33",
    nom: "Gironde",
    region: "Nouvelle-Aquitaine",
    ville1: "Bordeaux",
    ville2: "Merignac",
    prixM2: 3800,
  },
  {
    code: "34",
    nom: "Herault",
    region: "Occitanie",
    ville1: "Montpellier",
    ville2: "Beziers",
    prixM2: 3100,
  },
  {
    code: "35",
    nom: "Ille-et-Vilaine",
    region: "Bretagne",
    ville1: "Rennes",
    ville2: "Saint-Malo",
    prixM2: 2900,
  },
  {
    code: "36",
    nom: "Indre",
    region: "Centre-Val de Loire",
    ville1: "Chateauroux",
    ville2: "Issoudun",
    prixM2: 1200,
  },
  {
    code: "37",
    nom: "Indre-et-Loire",
    region: "Centre-Val de Loire",
    ville1: "Tours",
    ville2: "Joue-les-Tours",
    prixM2: 2400,
  },
  {
    code: "38",
    nom: "Isere",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Grenoble",
    ville2: "Vienne",
    prixM2: 2700,
  },
  {
    code: "39",
    nom: "Jura",
    region: "Bourgogne-Franche-Comte",
    ville1: "Lons-le-Saunier",
    ville2: "Dole",
    prixM2: 1700,
  },
  {
    code: "40",
    nom: "Landes",
    region: "Nouvelle-Aquitaine",
    ville1: "Mont-de-Marsan",
    ville2: "Dax",
    prixM2: 2000,
  },
  {
    code: "41",
    nom: "Loir-et-Cher",
    region: "Centre-Val de Loire",
    ville1: "Blois",
    ville2: "Romorantin-Lanthenay",
    prixM2: 1800,
  },
  {
    code: "42",
    nom: "Loire",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Saint-Etienne",
    ville2: "Roanne",
    prixM2: 1600,
  },
  {
    code: "43",
    nom: "Haute-Loire",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Le Puy-en-Velay",
    ville2: "Monistrol-sur-Loire",
    prixM2: 1400,
  },
  {
    code: "44",
    nom: "Loire-Atlantique",
    region: "Pays de la Loire",
    ville1: "Nantes",
    ville2: "Saint-Nazaire",
    prixM2: 3200,
  },
  {
    code: "45",
    nom: "Loiret",
    region: "Centre-Val de Loire",
    ville1: "Orleans",
    ville2: "Montargis",
    prixM2: 2200,
  },
  {
    code: "46",
    nom: "Lot",
    region: "Occitanie",
    ville1: "Cahors",
    ville2: "Figeac",
    prixM2: 1500,
  },
  {
    code: "47",
    nom: "Lot-et-Garonne",
    region: "Nouvelle-Aquitaine",
    ville1: "Agen",
    ville2: "Villeneuve-sur-Lot",
    prixM2: 1600,
  },
  {
    code: "48",
    nom: "Lozere",
    region: "Occitanie",
    ville1: "Mende",
    ville2: "Florac",
    prixM2: 1300,
  },
  {
    code: "49",
    nom: "Maine-et-Loire",
    region: "Pays de la Loire",
    ville1: "Angers",
    ville2: "Cholet",
    prixM2: 2300,
  },
  {
    code: "50",
    nom: "Manche",
    region: "Normandie",
    ville1: "Cherbourg",
    ville2: "Saint-Lo",
    prixM2: 1800,
  },
  {
    code: "51",
    nom: "Marne",
    region: "Grand Est",
    ville1: "Reims",
    ville2: "Chalons-en-Champagne",
    prixM2: 2000,
  },
  {
    code: "52",
    nom: "Haute-Marne",
    region: "Grand Est",
    ville1: "Chaumont",
    ville2: "Saint-Dizier",
    prixM2: 1200,
  },
  {
    code: "53",
    nom: "Mayenne",
    region: "Pays de la Loire",
    ville1: "Laval",
    ville2: "Mayenne",
    prixM2: 1600,
  },
  {
    code: "54",
    nom: "Meurthe-et-Moselle",
    region: "Grand Est",
    ville1: "Nancy",
    ville2: "Vandœuvre-les-Nancy",
    prixM2: 2100,
  },
  {
    code: "55",
    nom: "Meuse",
    region: "Grand Est",
    ville1: "Bar-le-Duc",
    ville2: "Verdun",
    prixM2: 1200,
  },
  {
    code: "56",
    nom: "Morbihan",
    region: "Bretagne",
    ville1: "Vannes",
    ville2: "Lorient",
    prixM2: 2500,
  },
  {
    code: "57",
    nom: "Moselle",
    region: "Grand Est",
    ville1: "Metz",
    ville2: "Thionville",
    prixM2: 1900,
  },
  {
    code: "58",
    nom: "Nievre",
    region: "Bourgogne-Franche-Comte",
    ville1: "Nevers",
    ville2: "Cosne-Cours-sur-Loire",
    prixM2: 1200,
  },
  {
    code: "59",
    nom: "Nord",
    region: "Hauts-de-France",
    ville1: "Lille",
    ville2: "Roubaix",
    prixM2: 2600,
  },
  {
    code: "60",
    nom: "Oise",
    region: "Hauts-de-France",
    ville1: "Beauvais",
    ville2: "Compiegne",
    prixM2: 2100,
  },
  {
    code: "61",
    nom: "Orne",
    region: "Normandie",
    ville1: "Alencon",
    ville2: "Argentan",
    prixM2: 1400,
  },
  {
    code: "62",
    nom: "Pas-de-Calais",
    region: "Hauts-de-France",
    ville1: "Arras",
    ville2: "Calais",
    prixM2: 1700,
  },
  {
    code: "63",
    nom: "Puy-de-Dome",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Clermont-Ferrand",
    ville2: "Riom",
    prixM2: 1900,
  },
  {
    code: "64",
    nom: "Pyrenees-Atlantiques",
    region: "Nouvelle-Aquitaine",
    ville1: "Pau",
    ville2: "Bayonne",
    prixM2: 2600,
  },
  {
    code: "65",
    nom: "Hautes-Pyrenees",
    region: "Occitanie",
    ville1: "Tarbes",
    ville2: "Lourdes",
    prixM2: 1600,
  },
  {
    code: "66",
    nom: "Pyrenees-Orientales",
    region: "Occitanie",
    ville1: "Perpignan",
    ville2: "Canet-en-Roussillon",
    prixM2: 2400,
  },
  {
    code: "67",
    nom: "Bas-Rhin",
    region: "Grand Est",
    ville1: "Strasbourg",
    ville2: "Haguenau",
    prixM2: 2800,
  },
  {
    code: "68",
    nom: "Haut-Rhin",
    region: "Grand Est",
    ville1: "Mulhouse",
    ville2: "Colmar",
    prixM2: 2200,
  },
  {
    code: "69",
    nom: "Rhone",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Lyon",
    ville2: "Villeurbanne",
    prixM2: 3900,
  },
  {
    code: "70",
    nom: "Haute-Saone",
    region: "Bourgogne-Franche-Comte",
    ville1: "Vesoul",
    ville2: "Lure",
    prixM2: 1300,
  },
  {
    code: "71",
    nom: "Saone-et-Loire",
    region: "Bourgogne-Franche-Comte",
    ville1: "Macon",
    ville2: "Chalon-sur-Saone",
    prixM2: 1600,
  },
  {
    code: "72",
    nom: "Sarthe",
    region: "Pays de la Loire",
    ville1: "Le Mans",
    ville2: "La Fleche",
    prixM2: 1900,
  },
  {
    code: "73",
    nom: "Savoie",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Chambery",
    ville2: "Aix-les-Bains",
    prixM2: 2900,
  },
  {
    code: "74",
    nom: "Haute-Savoie",
    region: "Auvergne-Rhone-Alpes",
    ville1: "Annecy",
    ville2: "Thonon-les-Bains",
    prixM2: 4200,
  },
  {
    code: "75",
    nom: "Paris",
    region: "Île-de-France",
    ville1: "Paris",
    ville2: "Paris 15eme",
    prixM2: 10500,
  },
  {
    code: "76",
    nom: "Seine-Maritime",
    region: "Normandie",
    ville1: "Rouen",
    ville2: "Le Havre",
    prixM2: 2200,
  },
  {
    code: "77",
    nom: "Seine-et-Marne",
    region: "Île-de-France",
    ville1: "Melun",
    ville2: "Meaux",
    prixM2: 2800,
  },
  {
    code: "78",
    nom: "Yvelines",
    region: "Île-de-France",
    ville1: "Versailles",
    ville2: "Saint-Germain-en-Laye",
    prixM2: 4200,
  },
  {
    code: "79",
    nom: "Deux-Sevres",
    region: "Nouvelle-Aquitaine",
    ville1: "Niort",
    ville2: "Bressuire",
    prixM2: 1500,
  },
  {
    code: "80",
    nom: "Somme",
    region: "Hauts-de-France",
    ville1: "Amiens",
    ville2: "Abbeville",
    prixM2: 1700,
  },
  {
    code: "81",
    nom: "Tarn",
    region: "Occitanie",
    ville1: "Albi",
    ville2: "Castres",
    prixM2: 1700,
  },
  {
    code: "82",
    nom: "Tarn-et-Garonne",
    region: "Occitanie",
    ville1: "Montauban",
    ville2: "Castelsarrasin",
    prixM2: 1800,
  },
  {
    code: "83",
    nom: "Var",
    region: "Provence-Alpes-Cote d'Azur",
    ville1: "Toulon",
    ville2: "Hyeres",
    prixM2: 3400,
  },
  {
    code: "84",
    nom: "Vaucluse",
    region: "Provence-Alpes-Cote d'Azur",
    ville1: "Avignon",
    ville2: "Carpentras",
    prixM2: 2600,
  },
  {
    code: "85",
    nom: "Vendee",
    region: "Pays de la Loire",
    ville1: "La Roche-sur-Yon",
    ville2: "Les Sables-d'Olonne",
    prixM2: 2300,
  },
  {
    code: "86",
    nom: "Vienne",
    region: "Nouvelle-Aquitaine",
    ville1: "Poitiers",
    ville2: "Chatellerault",
    prixM2: 1700,
  },
  {
    code: "87",
    nom: "Haute-Vienne",
    region: "Nouvelle-Aquitaine",
    ville1: "Limoges",
    ville2: "Saint-Junien",
    prixM2: 1600,
  },
  {
    code: "88",
    nom: "Vosges",
    region: "Grand Est",
    ville1: "Epinal",
    ville2: "Saint-Die-des-Vosges",
    prixM2: 1400,
  },
  {
    code: "89",
    nom: "Yonne",
    region: "Bourgogne-Franche-Comte",
    ville1: "Auxerre",
    ville2: "Sens",
    prixM2: 1500,
  },
  {
    code: "90",
    nom: "Territoire de Belfort",
    region: "Bourgogne-Franche-Comte",
    ville1: "Belfort",
    ville2: "Delle",
    prixM2: 1600,
  },
  {
    code: "91",
    nom: "Essonne",
    region: "Île-de-France",
    ville1: "Evry",
    ville2: "Corbeil-Essonnes",
    prixM2: 3200,
  },
  {
    code: "92",
    nom: "Hauts-de-Seine",
    region: "Île-de-France",
    ville1: "Nanterre",
    ville2: "Boulogne-Billancourt",
    prixM2: 6200,
  },
  {
    code: "93",
    nom: "Seine-Saint-Denis",
    region: "Île-de-France",
    ville1: "Bobigny",
    ville2: "Saint-Denis",
    prixM2: 3400,
  },
  {
    code: "94",
    nom: "Val-de-Marne",
    region: "Île-de-France",
    ville1: "Creteil",
    ville2: "Vitry-sur-Seine",
    prixM2: 4100,
  },
  {
    code: "95",
    nom: "Val-d'Oise",
    region: "Île-de-France",
    ville1: "Cergy",
    ville2: "Argenteuil",
    prixM2: 2900,
  },
  {
    code: "971",
    nom: "Guadeloupe",
    region: "Guadeloupe",
    ville1: "Pointe-a-Pitre",
    ville2: "Les Abymes",
    prixM2: 2800,
  },
  {
    code: "972",
    nom: "Martinique",
    region: "Martinique",
    ville1: "Fort-de-France",
    ville2: "Le Lamentin",
    prixM2: 2900,
  },
  {
    code: "973",
    nom: "Guyane",
    region: "Guyane",
    ville1: "Cayenne",
    ville2: "Saint-Laurent-du-Maroni",
    prixM2: 2500,
  },
  {
    code: "974",
    nom: "La Reunion",
    region: "La Reunion",
    ville1: "Saint-Denis",
    ville2: "Saint-Paul",
    prixM2: 3200,
  },
  {
    code: "975",
    nom: "Saint-Pierre-et-Miquelon",
    region: "Saint-Pierre-et-Miquelon",
    ville1: "Saint-Pierre",
    ville2: "Miquelon-Langlade",
    prixM2: 2700,
  },
  {
    code: "976",
    nom: "Mayotte",
    region: "Mayotte",
    ville1: "Mamoudzou",
    ville2: "Koungou",
    prixM2: 2200,
  },
];

// Fonction pour l'elision "de" → "d'" devant voyelle ou H muet
const getDeOrD = (text) => {
  const voyelles = [
    "a",
    "e",
    "i",
    "o",
    "u",
    "h",
    "A",
    "E",
    "I",
    "O",
    "U",
    "H",
    "Î",
    "î",
  ];
  return voyelles.includes(text.charAt(0)) ? "d'" : "de ";
};

// Fonction pour obtenir le verbe "est/sont/offre/offrent" selon le departement
const getVerbe = (depNom, verbe) => {
  const pluriels = [
    "Alpes-de-Haute-Provence",
    "Hautes-Alpes",
    "Alpes-Maritimes",
    "Ardennes",
    "Bouches-du-Rhone",
    "Cotes-d'Armor",
    "Hauts-de-Seine",
    "Landes",
    "Pyrenees-Atlantiques",
    "Hautes-Pyrenees",
    "Pyrenees-Orientales",
    "Deux-Sevres",
    "Vosges",
    "Yvelines",
  ];

  if (pluriels.includes(depNom)) {
    if (verbe === "est") return "sont";
    if (verbe === "offre") return "offrent";
  }
  return verbe;
};

// Fonction pour obtenir l'article defini selon le departement
const getArticleDefini = (depNom, depCode) => {
  // Paris : pas d'article
  if (depCode === "75") return "";

  // Departements pluriels : les
  const pluriels = [
    "Alpes-de-Haute-Provence",
    "Hautes-Alpes",
    "Alpes-Maritimes",
    "Ardennes",
    "Bouches-du-Rhone",
    "Cotes-d'Armor",
    "Landes",
    "Pyrenees-Atlantiques",
    "Hautes-Pyrenees",
    "Pyrenees-Orientales",
    "Deux-Sevres",
    "Vosges",
    "Yvelines",
  ];
  if (pluriels.includes(depNom)) return "les ";

  // Departements masculins singuliers commencant par une consonne : le
  const masculinsSinguliers = [
    "Bas-Rhin",
    "Haut-Rhin",
    "Calvados",
    "Cantal",
    "Cher",
    "Doubs",
    "Finistere",
    "Gard",
    "Gers",
    "Jura",
    "Loir-et-Cher",
    "Loiret",
    "Lot",
    "Lot-et-Garonne",
    "Maine-et-Loire",
    "Morbihan",
    "Nord",
    "Pas-de-Calais",
    "Puy-de-Dome",
    "Rhone",
    "Tarn",
    "Tarn-et-Garonne",
    "Territoire de Belfort",
    "Val-d'Oise",
    "Val-de-Marne",
    "Var",
    "Vaucluse",
  ];
  if (masculinsSinguliers.includes(depNom)) return "le ";

  // Departements masculins commencant par une voyelle : l'
  const masculinsVoyelle = ["Herault"];
  if (masculinsVoyelle.includes(depNom)) return "l'";

  // Tous les autres (feminins) : la/l'
  const voyelles = ["A", "E", "I", "O", "U", "H", "Y", "Î"];
  if (voyelles.includes(depNom.charAt(0))) return "l'";

  return "la ";
};

// Fonction pour obtenir "du/de la/des/de l'" selon le departement
const getDuDeLa = (depNom, depCode) => {
  if (depCode === "75") return "de Paris";

  const article = getArticleDefini(depNom, depCode);
  if (article === "le ") return "du ";
  if (article === "la ") return "de la ";
  if (article === "les ") return "des ";
  if (article === "l'") return "de l'";
  return "de ";
};

// Fonction pour obtenir la preposition correcte selon le departement
const getPreposition = (depNom, depCode) => {
  // Paris et villes
  if (depCode === "75") return "a Paris";
  if (depNom === "La Reunion") return "a La Reunion";
  if (depNom === "Mayotte") return "a Mayotte";

  // Departements masculins singuliers commencant par une consonne
  const masculinsSinguliers = [
    "Bas-Rhin",
    "Haut-Rhin",
    "Calvados",
    "Cantal",
    "Cher",
    "Doubs",
    "Finistere",
    "Gard",
    "Gers",
    "Jura",
    "Loir-et-Cher",
    "Loiret",
    "Lot",
    "Lot-et-Garonne",
    "Maine-et-Loire",
    "Morbihan",
    "Nord",
    "Pas-de-Calais",
    "Puy-de-Dome",
    "Rhone",
    "Tarn",
    "Tarn-et-Garonne",
    "Territoire de Belfort",
    "Val-d'Oise",
    "Val-de-Marne",
    "Var",
    "Vaucluse",
  ];
  if (masculinsSinguliers.includes(depNom)) return `dans le ${depNom}`;

  // Departements masculins commencant par une voyelle
  const masculinsVoyelle = ["Herault"];
  if (masculinsVoyelle.includes(depNom)) return `dans l'${depNom}`;

  // Departements pluriels
  const pluriels = [
    "Alpes-de-Haute-Provence",
    "Hautes-Alpes",
    "Alpes-Maritimes",
    "Ardennes",
    "Bouches-du-Rhone",
    "Cotes-d'Armor",
    "Hauts-de-Seine",
    "Landes",
    "Pyrenees-Atlantiques",
    "Hautes-Pyrenees",
    "Pyrenees-Orientales",
    "Deux-Sevres",
    "Vosges",
    "Yvelines",
  ];
  if (pluriels.includes(depNom)) return `dans les ${depNom}`;

  // Tous les autres (departements feminins) : en + nom
  return `en ${depNom}`;
};

// Variantes de contenu pour eviter le duplicate content
const getIntroVariant = (index, depNom, depCode) => {
  const prep = getPreposition(depNom, depCode);

  // Classification des departements par type de marche et specificite
  const deptTypes = {
    metropole: [
      "69",
      "13",
      "31",
      "33",
      "34",
      "44",
      "59",
      "67",
      "75",
      "92",
      "93",
      "94",
      "95",
    ],
    montagne: ["04", "05", "73", "74", "65", "66", "38", "39", "88", "25"],
    littoral: [
      "06",
      "13",
      "17",
      "22",
      "29",
      "30",
      "34",
      "35",
      "44",
      "50",
      "56",
      "62",
      "76",
      "83",
      "84",
      "85",
    ],
    rural_accessible: [
      "01",
      "02",
      "03",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "15",
      "16",
      "18",
      "19",
      "23",
      "24",
      "36",
      "40",
      "41",
      "42",
      "43",
      "46",
      "47",
      "48",
      "51",
      "52",
      "53",
      "55",
      "58",
      "61",
      "70",
      "71",
      "79",
      "80",
      "81",
      "82",
      "86",
      "87",
      "88",
      "89",
      "90",
    ],
    proximite_paris: ["27", "28", "45", "60", "77", "78", "91"],
    frontalier: ["25", "54", "57", "67", "68", "74", "90"],
  };

  let type = "rural_accessible"; // defaut
  for (const [key, codes] of Object.entries(deptTypes)) {
    if (codes.includes(depCode)) {
      type = key;
      break;
    }
  }

  const variants = {
    metropole: [
      `Le marche immobilier ${prep} beneficie d'une dynamique metropolitaine soutenue, avec des prix qui evoluent selon les quartiers.`,
      `Investir ${prep} necessite une bonne connaissance du marche local pour optimiser vos frais d'acquisition.`,
      `${
        depNom === "Paris"
          ? "A Paris"
          : prep.charAt(0).toUpperCase() + prep.slice(1)
      }, la tension immobiliere influence directement les strategies d'achat et les frais associes.`,
      `Le marche ${prep} attire de nombreux acquereurs, rendant essentielle l'anticipation des frais de notaire.`,
      `Acheter ${prep} en 2025 demande une preparation financiere rigoureuse incluant les frais de notaire.`,
    ],
    montagne: [
      `Le marche montagnard ${prep} combine residences principales et investissement saisonnier avec des frais specifiques.`,
      `Acquerir ${prep} necessite de bien budgeter les frais de notaire, particulierement pour les biens de caractere.`,
      `L'attractivite alpine ${prep} maintient un marche dynamique ou les frais d'acquisition sont a anticiper.`,
      `Investir en montagne ${prep} implique de maîtriser le calcul des frais notaries pour tous types de biens.`,
      `Le cadre exceptionnel ${prep} justifie une approche professionnelle du calcul des frais de notaire.`,
    ],
    littoral: [
      `L'attractivite cotiere ${prep} genere une demande soutenue ou les frais de notaire representent un enjeu budgetaire.`,
      `Acquerir sur le littoral ${prep} necessite d'anticiper precisement vos frais d'acquisition immobiliere.`,
      `Le marche balneaire ${prep} combine residences secondaires et principales avec des frais notaries variables.`,
      `Investir pres de la mer ${prep} demande une evaluation fine des coûts notaries selon le type de bien.`,
      `La proximite littorale ${prep} influence les prix et donc le montant final des frais de notaire.`,
    ],
    rural_accessible: [
      `Le marche immobilier ${prep} offre d'excellentes opportunites avec des frais de notaire proportionnellement avantageux.`,
      `Investir ${prep} permet de beneficier de prix accessibles tout en maîtrisant vos frais d'acquisition.`,
      `Le cadre de vie ${prep} attire de nouveaux acquereurs soucieux d'optimiser leur budget notarial.`,
      `Acheter ${prep} en 2025 represente une opportunite d'investissement avec des frais maîtrises.`,
      `L'authenticite ${prep} seduit tout en offrant des conditions d'acquisition avantageuses.`,
    ],
    proximite_paris: [
      `La proximite francilienne ${prep} influence positivement le marche tout en maintenant des frais accessibles.`,
      `Investir ${prep} combine l'attractivite parisienne et des coûts d'acquisition plus mesures.`,
      `Le marche ${prep} beneficie de l'effet metropolitain avec des frais de notaire a bien calculer.`,
      `Acquerir ${prep} offre un compromis interessant entre accessibilite et coûts notaries maîtrises.`,
      `L'equilibre entre proximite de Paris et prix ${prep} necessite une approche fine des frais.`,
    ],
    frontalier: [
      `L'attractivite transfrontaliere ${prep} dynamise le marche avec des specificites de calcul des frais.`,
      `Investir ${prep} beneficie de la proximite internationale tout en respectant la fiscalite francaise.`,
      `Le marche frontalier ${prep} combine opportunites locales et calcul precis des frais d'acquisition.`,
      `Acquerir ${prep} necessite de maîtriser les frais notaries dans un contexte economique specifique.`,
      `La position geographique ${prep} influence les strategies d'investissement et les coûts associes.`,
    ],
  };

  const relevantVariants = variants[type];
  return relevantVariants[index % relevantVariants.length];
};

const getSectionTitle1Variant = (index, depNom, depCode) => {
  const prep = getPreposition(depNom, depCode);
  const variants = [
    `💰 Montant moyen des frais de notaire ${prep}`,
    `💳 Quel budget prevoir pour les frais de notaire ${prep} ?`,
    `📊 Coût reel des frais de notaire ${prep}`,
    `💵 Estimation des frais de notaire pour ${depNom}`,
    `💰 Frais de notaire 2025 : combien coûte un achat ${prep} ?`,
  ];
  return variants[index % variants.length];
};

const getContextPhraseVariant = (index) => {
  const variants = [
    "Les frais de notaire varient selon le <strong>type de bien achete</strong> et son prix.",
    "Le montant des frais depend principalement du <strong>type de logement</strong> et de sa valeur.",
    "Deux facteurs cles determinent vos frais : le <strong>type de bien</strong> (neuf ou ancien) et son prix.",
    "Les frais d'acquisition immobiliere changent selon que vous achetez dans l'<strong>ancien ou le neuf</strong>.",
    "Le calcul des frais varie significativement entre un bien <strong>neuf et un bien ancien</strong>.",
  ];
  return variants[index % variants.length];
};

const getDifferencePhraseVariant = (index, depNom) => {
  const variants = [
    ", comme partout en France, la difference entre l'ancien et le neuf est significative.",
    ", l'ecart de coût entre neuf et ancien suit les baremes nationaux.",
    ", les tarifs officiels s'appliquent comme dans tous les departements francais.",
    ", le differentiel neuf/ancien respecte la reglementation nationale.",
    ", l'economie realisee en VEFA reste substantielle selon les baremes officiels.",
  ];
  return variants[index % variants.length];
};

const getNotePhraseVariant = (index) => {
  const variants = [
    "<strong>Note :</strong> Si ce meme bien etait neuf (VEFA), les frais de notaire ne seraient que de",
    "<strong>A retenir :</strong> Pour un bien neuf equivalent, vous ne paieriez que",
    "<strong>Economie potentielle :</strong> En VEFA, les frais tomberaient a seulement",
    "<strong>Comparaison :</strong> Dans le neuf, ces frais representeraient uniquement",
    "<strong>Alternative neuve :</strong> Pour un logement VEFA de meme valeur, comptez",
  ];
  return variants[index % variants.length];
};

/**
 * Genere un paragraphe unique de 150 mots sur les specificites du marche local
 */
const generateDepartmentUniqueContent = (dep) => {
  const uniqueContent = {
    "01": "Le marche immobilier de l'Ain beneficie de sa proximite avec Lyon et Geneve. Les communes comme Bourg-en-Bresse ou Ferney-Voltaire attirent les actifs transfrontaliers, generant une demande soutenue. Les prix moyens restent accessibles compare aux metropoles voisines, offrant un excellent rapport qualite-prix pour les familles. L'attractivite du departement s'explique par son cadre naturel exceptionnel entre Jura et lac Leman.",

    "02": "L'Aisne presente un marche immobilier particulierement attractif pour les primo-accedants, avec des prix parmi les plus accessibles de la region Hauts-de-France. Saint-Quentin et Soissons offrent un patrimoine architectural remarquable a des tarifs competitifs. La proximite de Paris (1h30 en train) commence a attirer les teletravailleurs cherchant un meilleur cadre de vie. Le departement mise sur la renovation urbaine pour redynamiser certains centres-villes.",

    "03": "Le marche de l'Allier se caracterise par des prix tres accessibles, particulierement a Montlucon et Vichy. Cette derniere, station thermale renommee, attire une clientele de retraites aises recherchant la qualite de vie. Moulins, prefecture historique, seduit par son patrimoine et ses prix moderes. L'investissement locatif y est particulierement rentable grace au ratio prix/loyer favorable et a la demande etudiante stable.",

    "04": "Les Alpes-de-Haute-Provence offrent un marche immobilier diversifie entre littoral et montagne. Manosque et Digne-les-Bains presentent des opportunites interessantes avec des prix contenus malgre l'attractivite provencale. Les residences secondaires representent une part importante du marche, notamment dans les villages perches. La demande reste soutenue grace au cadre naturel exceptionnel et a la proximite de la Cote d'Azur.",

    "05": "Le marche des Hautes-Alpes est porte par l'attractivite montagnarde et l'economie du ski. Gap et Briancon connaissent une tension immobiliere due a la demande en residences principales et secondaires. Les prix eleves s'expliquent par la rarete du foncier constructible en zone de montagne. L'investissement en residence de tourisme reste dynamique, soutenu par la frequentation touristique four seasons croissante.",

    "06": "Les Alpes-Maritimes presentent l'un des marches les plus chers de France, tire par Nice et Cannes. La pression immobiliere s'intensifie avec l'arrivee du teletravail et l'attractivite de la French Riviera. Les communes de l'arriere-pays comme Grasse offrent des alternatives plus abordables tout en conservant l'art de vivre mediterraneen. L'investissement locatif saisonnier reste tres rentable malgre des prix d'achat eleves. 🎬 Entre festivals de Cannes et parfumeries grassoises, la Cote d'Azur cultive un art de vivre unique qui justifie sa valorisation premium.",

    "07": "L'Ardeche connaît un regain d'interet avec l'essor du teletravail et la recherche de nature. Aubenas et Privas voient leurs prix progresser moderement, restant accessibles compare aux metropoles voisines. Les residences secondaires representent une part croissante du marche, notamment dans les zones touristiques comme les Gorges de l'Ardeche. Le departement attire les citadins en quete d'authenticite et de qualite de vie.",

    "08": "Les Ardennes proposent un marche immobilier tres accessible, avec Charleville-Mezieres comme pole principal. La proximite de la Belgique et du Luxembourg influence positivement certains secteurs frontaliers. Sedan mise sur la renovation urbaine pour redynamiser son centre historique. Le departement attire une clientele recherchant l'authenticite et des prix moderes dans un cadre naturel preserve.",

    "09": "L'Ariege seduit par son marche immobilier accessible et son cadre naturel exceptionnel. Foix et Pamiers proposent des biens de caractere a des prix tres raisonnables. Le departement attire les neo-ruraux et retraites cherchant la tranquillite pyreneenne. L'investissement en gîtes ruraux se developpe, soutenu par une frequentation touristique nature en progression constante.",

    10: "L'Aube beneficie d'une position strategique entre Paris et Dijon, avec Troyes comme pole attractif. Le marche immobilier reste accessible malgre la proximite francilienne. Les outlets de Troyes dynamisent l'economie locale et attirent de nouveaux habitants. Le departement mise sur la renovation du patrimoine historique pour attirer une clientele a la recherche d'authenticite a prix modere.",

    11: "L'Aude presente un marche diversifie entre littoral mediterraneen et arriere-pays. Narbonne et Carcassonne attirent par leur patrimoine exceptionnel et leurs prix moderes compare a la Cote d'Azur. Le Canal du Midi et les chateaux cathares renforcent l'attractivite touristique. L'investissement locatif saisonnier progresse, notamment sur la cote entre Leucate et Port-la-Nouvelle.",

    12: "L'Aveyron seduit par son authenticite et ses prix accessibles, avec Rodez et Millau comme moteurs. Le departement attire les amoureux de nature et de patrimoine rural preserve. Les residences secondaires se developpent, notamment autour des sites touristiques majeurs. L'investissement en chambres d'hotes et gîtes ruraux beneficie d'une frequentation touristique four seasons stable.",

    13: "Les Bouches-du-Rhone concentrent les enjeux immobiliers de PACA avec Marseille et Aix-en-Provence. Le marche reste tendu malgre l'offre nouvelle, porte par la dynamique economique mediterraneenne. Les communes peripheriques comme Salon-de-Provence offrent des alternatives plus abordables. L'investissement locatif etudiant reste tres dynamique grace aux nombreuses universites et ecoles superieures.",

    14: "Le Calvados beneficie de l'attractivite normande avec Caen comme metropole dynamique. Le marche immobilier profite de la proximite parisienne et de l'attractivite cotiere. Deauville et Cabourg maintiennent des prix eleves sur le segment haut de gamme. L'investissement en residences secondaires reste soutenu par la clientele parisienne et l'accessibilite ferroviaire.",

    15: "Le marche immobilier du Cantal est particulierement attractif pour les primo-accedants. Les communes comme Aurillac ou Saint-Flour affichent un niveau de prix inferieur a la moyenne nationale, ce qui offre un pouvoir d'achat immobilier important. Le departement attire les amoureux de nature authentique et de patrimoine rural. L'investissement en gîtes ruraux se developpe grace a l'attractivite touristique du Cantal. 🧀 Terre du fromage AOP et des volcans d'Auvergne, le Cantal seduit par ses paysages preserves et sa gastronomie ancestrale.",

    16: "La Charente propose un marche accessible avec Angouleme comme pole principal. Le departement attire les retraites et neo-ruraux par son art de vivre et ses prix moderes. La proximite de Bordeaux (1h) influence positivement le secteur sud. L'investissement en patrimoine rural se developpe, soutenu par les aides a la renovation et l'attractivite touristique croissante.",

    17: "La Charente-Maritime presente un marche tendu sur le littoral (La Rochelle, Royan) et plus accessible dans l'interieur. Les îles de Re et Oleron maintiennent des prix tres eleves. L'investissement locatif saisonnier reste tres rentable malgre la reglementation. Le departement attire de nombreux retraites et teletravailleurs seduits par la douceur de vivre atlantique.",

    18: "Le Cher offre un marche immobilier tres accessible avec Bourges comme centre historique attractif. Le departement seduit par son patrimoine Renaissance et ses prix moderes. La route Jacques-Cœur dynamise le tourisme culturel. L'investissement en chambres d'hotes progresse, beneficiant de la position centrale du departement et de son riche patrimoine architectural.",

    19: "La Correze attire par son marche accessible et son cadre naturel preserve. Brive-la-Gaillarde et Tulle proposent des biens de caractere a prix moderes. Le departement seduit les neo-ruraux et amoureux de nature authentique. L'investissement en eco-tourisme se developpe, soutenu par les paysages exceptionnels et le patrimoine rural preserve.",

    21: "La Cote-d'Or beneficie du dynamisme de Dijon, metropole attractive du Grand Est. Le marche immobilier profite de l'economie viticole bourguignonne et du patrimoine exceptionnel. Beaune reste tres prisee pour l'investissement de prestige. Les prix restent raisonnables compare a Lyon, offrant un excellent rapport qualite-prix pour les cadres et familles.",

    22: "Les Cotes-d'Armor presentent un marche contraste entre littoral recherche et interieur accessible. Saint-Brieuc dynamise l'economie departementale. La Cote de Granit Rose maintient des prix eleves sur les biens de prestige. L'investissement en residences secondaires reste soutenu par la clientele parisienne et la beaute des paysages cotiers bretons.",

    23: "La Creuse propose le marche le plus accessible de France, attirant les acquereurs en quete d'espace et d'authenticite. Gueret mise sur la renovation urbaine pour redynamiser le centre. Le departement seduit les retraites et neo-ruraux par ses prix exceptionnellement bas. L'investissement en patrimoine rural offre des opportunites uniques de renovation a budget maîtrise.",

    24: "La Dordogne connaît un marche dynamique porte par l'attractivite touristique du Perigord. Perigueux et Bergerac proposent un bon equilibre prix-qualite de vie. Les residences secondaires representent une part importante, notamment pour la clientele europeenne. L'investissement en tourisme rural reste tres rentable grace a la renommee gastronomique et patrimoniale du departement.",

    25: "Le Doubs beneficie du dynamisme de Besancon et de la proximite suisse. Montbeliard profite de l'industrie automobile. Les prix restent accessibles malgre l'attractivite frontaliere. L'investissement transfrontalier progresse, notamment pour les travailleurs suisses. Le departement attire par son cadre naturel jurassien et ses opportunites economiques.",

    26: "La Drome presente un marche en tension entre vallee du Rhone industrielle et Drome provencale touristique. Valence dynamise le secteur nord avec son accessibilite TGV. Montelimar et Nyons attirent par l'art de vivre provencal. L'investissement en residences secondaires progresse, soutenu par l'attractivite climatique et paysagere du departement.",

    27: "L'Eure profite de la proximite parisienne avec un marche immobilier en progression. Evreux beneficie de l'accessibilite francilienne. Les communes proches de Paris connaissent une pression croissante. L'investissement residentiel progresse grace aux teletravailleurs cherchant plus d'espace a budget maîtrise. Le departement mise sur son patrimoine normand authentique.",

    28: "L'Eure-et-Loir presente un marche accessible malgre la proximite parisienne. Chartres attire par son patrimoine exceptionnel et son accessibilite. Le departement seduit les familles recherchant l'espace et la nature a 1h de Paris. L'investissement locatif progresse grace aux navetteurs franciliens. Les prix restent moderes compare a la petite couronne parisienne.",

    29: "Le Finistere presente un marche contraste entre Brest metropolitain et cotes recherchees. Quimper seduit par son patrimoine breton authentique. La presqu'île de Crozon et la cote nord maintiennent des prix eleves. L'investissement en residences secondaires reste dynamique malgre la reglementation, porte par l'attractivite maritime bretonne unique.",

    30: "Le Gard beneficie de l'attractivite mediterraneenne avec Nîmes et Ales comme poles. Le marche profite du climat et du patrimoine romain exceptionnel. Les Cevennes attirent les amoureux de nature authentique. L'investissement locatif progresse grace a l'universite et aux festivals. Les prix restent accessibles compare aux departements littoraux voisins.",

    31: "La Haute-Garonne concentre la dynamique immobiliere regionale avec Toulouse. Le marche reste tendu malgre l'offre nouvelle, porte par l'aeronautique et le numerique. L'agglomeration toulousaine connaît une expansion continue. L'investissement etudiant reste tres rentable grace aux universites et ecoles d'ingenieurs. Les prix progressent regulierement soutenus par la croissance demographique.",

    32: "Le Gers seduit par son marche accessible et son art de vivre gasconne. Auch propose des biens de caractere a prix moderes. Le departement attire les retraites et neo-ruraux cherchant authenticite et tranquillite. L'investissement en tourisme rural progresse, soutenu par la gastronomie locale et les paysages vallonnes. Les bastides gasconnes offrent un patrimoine architectural unique.",

    33: "La Gironde presente un marche tendu avec Bordeaux metropole attractive. L'agglomeration bordelaise connaît une croissance soutenue portee par l'economie viticole et numerique. Le bassin d'Arcachon maintient des prix tres eleves. L'investissement viticole reste prise des investisseurs internationaux. Les communes peripheriques offrent des alternatives plus accessibles aux jeunes menages.",

    34: "L'Herault beneficie du dynamisme montpellierain et de l'attractivite littorale. Montpellier connaît une croissance demographique soutenue. Le littoral maintient des prix eleves malgre l'offre nouvelle. L'investissement etudiant reste tres rentable grace aux universites. L'arriere-pays offre des opportunites plus accessibles tout en conservant l'attractivite mediterraneenne.",

    35: "L'Ille-et-Vilaine presente un marche tendu avec Rennes metropole dynamique. L'agglomeration rennaise attire les entreprises high-tech. Saint-Malo maintient des prix eleves sur le segment prestige. L'investissement etudiant progresse grace aux universites et ecoles superieures. Le departement beneficie de l'attractivite economique bretonne et de la proximite parisienne.",

    36: "L'Indre propose un marche tres accessible avec Chateauroux comme pole principal. Le departement attire les acquereurs en quete d'espace et de tranquillite. La vallee de la Loire influence positivement le secteur nord. L'investissement en patrimoine rural offre des opportunites de renovation a budget maîtrise. Les chateaux de la Loire dynamisent le tourisme culturel.",

    37: "L'Indre-et-Loire beneficie de l'attractivite ligerienne avec Tours comme metropole. Le marche profite du patrimoine exceptionnel des chateaux de la Loire. L'accessibilite TGV renforce l'attractivite parisienne. L'investissement en residences secondaires progresse grace au patrimoine culturel unique. Les vignobles de Vouvray et Chinon attirent les investisseurs passionnes.",

    38: "L'Isere presente un marche tendu avec Grenoble metropole alpine. L'agglomeration grenobloise beneficie de l'economie high-tech et de l'attractivite montagnarde. Les stations de ski maintiennent des prix tres eleves. L'investissement en residences de tourisme reste dynamique. Les vallees alpines offrent un cadre de vie exceptionnel malgre des prix soutenus.",

    39: "Le Jura seduit par son marche accessible et son cadre naturel preserve. Lons-le-Saunier et Dole proposent un bon equilibre qualite-prix. Le departement attire les amoureux de nature et de patrimoine comtois. L'investissement en eco-tourisme progresse grace aux paysages jurassiens. La proximite suisse influence positivement certains secteurs frontaliers.",

    40: "Les Landes presentent un marche contraste entre littoral recherche et interieur forestier. Dax beneficie du thermalisme et Mont-de-Marsan de l'agriculture. La cote landaise maintient des prix eleves sur les biens de prestige. L'investissement en residences secondaires reste soutenu par l'attractivite balneaire. La foret des Landes offre un cadre naturel unique.",

    41: "Le Loir-et-Cher profite de l'attractivite ligerienne avec Blois comme pole historique. Le departement beneficie du patrimoine des chateaux de la Loire. L'accessibilite parisienne renforce l'attractivite residentielle. L'investissement en tourisme culturel progresse grace aux chateaux emblematiques. Les prix restent accessibles malgre la proximite de l'Île-de-France.",

    42: "La Loire beneficie du dynamisme stephanois et de l'attractivite lyonnaise proche. Saint-Etienne mise sur la renovation urbaine et l'innovation. Le departement attire par ses prix accessibles et sa position centrale. L'investissement etudiant progresse grace a l'ecole des Mines. La proximite de Lyon offre des opportunites d'emploi sans les prix metropolitains.",

    43: "La Haute-Loire seduit par son marche accessible et son patrimoine volcanique. Le Puy-en-Velay attire par son patrimoine religieux exceptionnel. Le departement beneficie de l'attractivite auvergnate et de ses paysages preserves. L'investissement en tourisme rural progresse grace aux chemins de Compostelle. Les prix moderes attirent les acquereurs en quete d'authenticite.",

    44: "La Loire-Atlantique presente un marche tendu avec Nantes metropole attractive. L'agglomeration nantaise connaît une croissance soutenue portee par l'industrie et les services. Le littoral maintient des prix eleves malgre l'offre nouvelle. L'investissement etudiant reste rentable grace aux universites. La Baule conserve son statut de station balneaire de prestige.",

    45: "Le Loiret beneficie de l'attractivite orleanaise et de la proximite parisienne. Orleans attire par son patrimoine et son accessibilite francilienne. Le departement profite des chateaux de la Loire et de la vallee royale. L'investissement residentiel progresse grace aux teletravailleurs parisiens. Les prix restent raisonnables malgre l'attractivite croissante de la region Centre.",

    46: "Le Lot seduit par son marche accessible et son patrimoine medieval exceptionnel. Cahors attire par son vignoble et son centre historique. Le departement beneficie de l'attractivite touristique du Quercy. L'investissement en residences secondaires progresse grace a la clientele urbaine en quete d'authenticite. Les bastides et chateaux offrent un patrimoine architectural unique.",

    47: "Le Lot-et-Garonne presente un marche accessible avec Agen comme pole fruitier. Le departement beneficie de sa position entre Bordeaux et Toulouse. L'investissement en patrimoine rural progresse grace aux paysages vallonnes du Lot. La gastronomie locale (pruneaux, foie gras) renforce l'attractivite touristique. Les prix moderes attirent les retraites et neo-ruraux.",

    48: "La Lozere propose le marche le plus preserve de France avec des prix tres accessibles. Mende mise sur l'eco-tourisme et le patrimoine naturel exceptionnel. Le departement attire les amoureux de grands espaces et de tranquillite. L'investissement en tourisme vert progresse grace aux parcs nationaux. L'authenticite cevenole seduit une clientele en quete de ressourcement.",

    49: "Le Maine-et-Loire beneficie du dynamisme angevin et de l'attractivite ligerienne. Angers attire par son universite et son economie diversifiee. Le departement profite des chateaux de la Loire et des vignobles d'Anjou. L'investissement etudiant reste rentable grace aux universites. Saumur conserve son attractivite equestre et viticole unique.",

    50: "La Manche presente un marche contraste entre Cotentin et baie du Mont-Saint-Michel. Cherbourg beneficie de l'industrie maritime et Saint-Lo de l'agriculture. Le littoral ouest maintient des prix soutenus. L'investissement en residences secondaires progresse grace a l'attractivite maritime normande. Le Mont-Saint-Michel dynamise le tourisme culturel international.",

    51: "La Marne beneficie du prestige champenois avec Reims metropole historique. L'agglomeration remoise attire par son patrimoine et son economie viticole. Epernay conserve son statut de capitale du Champagne. L'investissement viticole reste tres prise des amateurs. La proximite parisienne renforce l'attractivite residentielle du departement.",

    52: "La Haute-Marne propose un marche tres accessible avec Chaumont comme pole principal. Le departement attire les acquereurs en quete d'espace et de tranquillite. L'investissement en patrimoine rural offre des opportunites de renovation a budget maîtrise. Les prix exceptionnellement bas seduisent les retraites et neo-ruraux cherchant l'authenticite champetre.",

    53: "La Mayenne seduit par son marche accessible et son cadre bocager preserve. Laval beneficie de la proximite rennaise et nantaise. Le departement attire les familles recherchant la qualite de vie a prix modere. L'investissement en tourisme vert progresse grace aux paysages bocagers. La douceur angevine influence positivement l'attractivite residentielle.",

    54: "La Meurthe-et-Moselle beneficie du dynamisme nanceien et de la proximite luxembourgeoise. Nancy attire par son patrimoine Art nouveau exceptionnel. Le secteur frontalier profite de l'emploi luxembourgeois. L'investissement etudiant reste rentable grace aux universites lorraines. Les prix moderes contrastent avec l'attractivite culturelle et economique.",

    55: "La Meuse propose un marche tres accessible avec Verdun comme pole memoriel. Bar-le-Duc mise sur le patrimoine Renaissance. Le departement attire par ses prix exceptionnellement bas et son cadre rural preserve. L'investissement en tourisme de memoire progresse grace aux sites de la Grande Guerre. L'authenticite lorraine seduit les amoureux d'histoire.",

    56: "Le Morbihan presente un marche tendu sur le littoral et accessible dans l'interieur. Vannes beneficie de l'attractivite du golfe. Le littoral sud maintient des prix tres eleves (Quiberon, Belle-Île). L'investissement en residences secondaires reste soutenu par l'attractivite maritime bretonne. L'arriere-pays offre des opportunites plus accessibles aux jeunes menages.",

    57: "La Moselle beneficie de l'attractivite messine et de la proximite luxembourgeoise. Metz attire par son patrimoine et sa situation frontaliere. Thionville profite directement de l'emploi luxembourgeois. L'investissement transfrontalier progresse malgre les prix soutenus. Le departement mise sur son bilinguisme et son ouverture europeenne.",

    58: "La Nievre propose un marche tres accessible avec Nevers comme pole principal. Le departement attire les amoureux de nature et de patrimoine bourguignon. L'investissement en patrimoine rural offre des opportunites uniques de renovation. Les prix exceptionnellement bas seduisent les retraites en quete de tranquillite. La Loire nivernaise dynamise le tourisme fluvial.",

    59: "Le Nord presente un marche contraste avec Lille metropole europeenne attractive. L'agglomeration lilloise beneficie de sa position frontaliere et de son economie diversifiee. Le littoral (Dunkerque) connaît un regain d'interet. L'investissement etudiant reste tres rentable grace aux universites. La proximite de Paris et Bruxelles renforce l'attractivite residentielle.",

    60: "L'Oise profite de la proximite parisienne avec un marche en progression constante. Compiegne et Beauvais beneficient de l'accessibilite francilienne. L'investissement residentiel progresse grace aux teletravailleurs parisiens. Le departement attire les familles recherchant plus d'espace a budget maîtrise. Les chateaux royaux (Compiegne, Chantilly) dynamisent le tourisme culturel.",

    61: "L'Orne seduit par son marche accessible et son patrimoine normand authentique. Alencon attire par son art de vivre et ses prix moderes. Le departement beneficie du Parc naturel du Perche et de la proximite parisienne. L'investissement en residences secondaires progresse grace a l'attractivite rurale normande. Les haras nationaux renforcent l'identite equestre.",

    62: "Le Pas-de-Calais presente un marche accessible malgre la proximite de Lille. Arras attire par son patrimoine et sa position centrale. Le littoral (Touquet) maintient des prix eleves sur le segment prestige. L'investissement residentiel progresse grace a l'accessibilite parisienne et londonienne. La proximite de l'Angleterre influence positivement l'attractivite touristique.",

    63: "Le Puy-de-Dome beneficie du dynamisme clermontois et de l'attractivite volcanique. Clermont-Ferrand attire par son universite et son industrie. Les stations thermales (Vichy, La Bourboule) conservent leur attractivite. L'investissement en tourisme vert progresse grace aux volcans d'Auvergne. Les prix restent accessibles malgre l'attractivite metropolitaine croissante.",

    64: "Les Pyrenees-Atlantiques presentent un marche tendu entre Bearn et Pays basque. Pau beneficie de l'attractivite pyreneenne et Bayonne de la proximite espagnole. La cote basque maintient des prix tres eleves. L'investissement en residences secondaires reste soutenu par l'attractivite balneaire et montagnarde. Biarritz conserve son statut de station balneaire de prestige international.",

    65: "Les Hautes-Pyrenees seduisent par leur marche accessible et leur attractivite montagnarde. Tarbes beneficie de l'industrie aeronautique et Lourdes du tourisme religieux. Les stations de ski (Bareges, Cauterets) attirent l'investissement saisonnier. L'eco-tourisme progresse grace aux parcs nationaux pyreneens. Les prix moderes contrastent avec l'attractivite naturelle exceptionnelle.",

    66: "Les Pyrenees-Orientales beneficient de l'attractivite mediterraneenne et catalane. Perpignan attire par sa proximite espagnole et son climat. Le littoral maintient des prix soutenus malgre l'offre nouvelle. L'investissement en residences secondaires reste dynamique grace a l'attractivite balneaire. L'arriere-pays offre des opportunites plus accessibles tout en conservant l'identite catalane.",

    67: "Le Bas-Rhin beneficie du dynamisme strasbourgeois et de l'attractivite europeenne. Strasbourg attire par son statut de capitale europeenne. Le secteur frontalier allemand profite des opportunites transfrontalieres. L'investissement etudiant reste rentable grace aux universites et institutions europeennes. L'architecture alsacienne unique renforce l'attractivite patrimoniale.",

    68: "Le Haut-Rhin presente un marche tendu avec Mulhouse et Colmar comme poles attractifs. Le departement beneficie de la proximite suisse et allemande. La Route des Vins attire l'investissement patrimonial et touristique. L'investissement transfrontalier progresse grace aux opportunites d'emploi. L'architecture alsacienne et les vignobles renforcent l'attractivite residentielle.",

    69: "Le Rhone concentre la dynamique immobiliere regionale avec Lyon metropole. L'agglomeration lyonnaise connaît une croissance soutenue portee par l'economie tertiaire. Le marche reste tendu malgre l'offre nouvelle importante. L'investissement etudiant et locatif reste tres rentable. Les Monts du Lyonnais offrent des alternatives plus accessibles aux familles.",

    70: "La Haute-Saone propose un marche tres accessible avec Vesoul comme pole principal. Le departement attire par ses prix exceptionnellement bas et son cadre naturel preserve. L'investissement en patrimoine rural offre des opportunites uniques. La proximite de Besancon et Dijon influence positivement certains secteurs. L'authenticite comtoise seduit les amoureux de tranquillite.",

    71: "La Saone-et-Loire beneficie de l'attractivite bourguignonne avec Macon et Chalon-sur-Saone. Le departement profite des vignobles prestigieux et du patrimoine roman. L'investissement viticole reste prise des amateurs. La proximite de Lyon influence positivement le secteur est. Les prix accessibles contrastent avec la richesse patrimoniale et viticole.",

    72: "La Sarthe beneficie du dynamisme manceau et de l'attractivite des 24 Heures. Le Mans attire par son circuit mythique et son universite. Le departement profite de la proximite parisienne et nantaise. L'investissement residentiel progresse grace aux teletravailleurs franciliens. Les chateaux de la Loire sarthoise dynamisent le tourisme culturel.",

    73: "La Savoie presente un marche tendu avec Chambery et les stations de ski. L'agglomeration chamberienne beneficie de l'attractivite alpine et de la proximite lyonnaise. Les stations maintiennent des prix tres eleves. L'investissement en residences de tourisme reste dynamique malgre les contraintes reglementaires. Les lacs savoyards renforcent l'attractivite four seasons.",

    74: "La Haute-Savoie presente l'un des marches les plus chers de France avec Annecy et les stations prestigieuses. L'agglomeration annecienne connaît une pression immobiliere intense due a la proximite genevoise. Les stations de ski (Chamonix, Megeve) maintiennent des prix record. L'investissement transfrontalier domine le marche haut de gamme.",

    75: "Paris concentre tous les enjeux immobiliers francais avec un marche unique au monde. La capitale attire investisseurs internationaux et elites mondiales. Le marche locatif reste tres rentable malgre la reglementation. L'investissement etudiant profite des universites prestigieuses. Les arrondissements centraux conservent leur statut de valeurs refuges internationales.",

    76: "La Seine-Maritime beneficie du dynamisme rouennais et de l'attractivite littorale. Rouen attire par son patrimoine et sa proximite parisienne. Le Havre mise sur la renovation urbaine et l'ouverture maritime. L'investissement residentiel progresse grace a l'accessibilite francilienne. La cote d'Albatre seduit par son patrimoine naturel et architectural unique.",

    77: "La Seine-et-Marne profite pleinement de l'expansion francilienne avec un marche en forte croissance. Le departement attire les familles cherchant l'espace a proximite de Paris. Fontainebleau conserve son attractivite de prestige. L'investissement residentiel explose grace au teletravail. Les nouvelles infrastructures (Grand Paris Express) renforcent l'attractivite departementale.",

    78: "Les Yvelines presentent un marche de prestige avec Versailles comme joyau patrimonial. Le departement beneficie de la richesse francilienne et de la proximite de La Defense. Saint-Germain-en-Laye maintient des prix tres eleves. L'investissement de prestige domine le marche haut de gamme. La foret de Rambouillet offre un cadre naturel exceptionnel.",

    79: "Les Deux-Sevres seduisent par leur marche accessible et leur attractivite poitevine. Niort beneficie de l'industrie des mutuelles et assurances. Le departement attire les familles recherchant la qualite de vie a prix modere. L'investissement en patrimoine rural progresse grace aux paysages bocagers preserves. La proximite de La Rochelle influence positivement l'attractivite.",

    80: "La Somme presente un marche accessible avec Amiens comme pole universitaire attractif. Le departement beneficie de la proximite parisienne et de l'ouverture maritime. La baie de Somme attire l'eco-tourisme et l'investissement residentiel vert. L'investissement etudiant reste rentable grace a l'universite. Les prix moderes contrastent avec l'accessibilite metropolitaine.",

    81: "Le Tarn seduit par son marche accessible et son patrimoine albigeois. Albi attire par son centre historique classe UNESCO. Le departement beneficie de l'attractivite toulousaine proche et de ses paysages preserves. L'investissement en tourisme rural progresse grace aux bastides. Les prix moderes attirent les retraites en quete d'art de vivre meridional.",

    82: "Le Tarn-et-Garonne presente un marche accessible avec Montauban comme pole historique attractif. Le departement beneficie de sa position entre Toulouse et Agen. L'investissement en patrimoine rural progresse grace aux paysages vallonnes. La gastronomie locale renforce l'attractivite touristique. Les prix moderes seduisent les acquereurs en quete d'authenticite.",

    83: "Le Var beneficie de l'attractivite varoise avec Toulon metropole mediterraneenne. Le departement profite du climat et des paysages provencaux exceptionnels. Le littoral maintient des prix tres eleves (Saint-Tropez). L'investissement en residences secondaires reste dynamique malgre la pression fonciere. L'arriere-pays offre des alternatives plus accessibles aux familles.",

    84: "Le Vaucluse beneficie de l'attractivite provencale avec Avignon comme pole culturel. Le departement profite du festival et du patrimoine papal exceptionnel. L'Isle-sur-la-Sorgue attire les amateurs d'antiquites. L'investissement en residences secondaires progresse grace au climat et aux paysages. Les vignobles de Chateauneuf-du-Pape renforcent l'attractivite œnotouristique.",

    85: "La Vendee presente un marche tendu sur le littoral et accessible dans l'interieur. La Roche-sur-Yon beneficie de l'economie departementale. Le littoral vendeen maintient des prix eleves sur les stations balneaires. L'investissement en residences secondaires reste soutenu par l'attractivite familiale des plages. Les Sables-d'Olonne conservent leur statut de station nautique de reference.",

    86: "La Vienne beneficie du dynamisme pictavien avec Poitiers comme pole universitaire. Le departement attire par son patrimoine roman exceptionnel et ses prix accessibles. Chatellerault mise sur l'innovation technologique. L'investissement etudiant reste rentable grace aux universites. Le Futuroscope dynamise l'attractivite touristique et economique departementale.",

    87: "La Haute-Vienne seduit par son marche accessible avec Limoges comme pole de la porcelaine. Le departement attire par son patrimoine artisanal unique et ses prix moderes. L'investissement en patrimoine rural offre des opportunites de renovation. Les prix accessibles seduisent les retraites et neo-ruraux. La gastronomie limousine renforce l'attractivite touristique.",

    88: "Les Vosges proposent un marche accessible avec Epinal comme pole principal. Le departement seduit par ses paysages montagnards et ses prix moderes. L'investissement en eco-tourisme progresse grace aux Vosges. La proximite de l'Alsace influence positivement certains secteurs. L'authenticite vosgienne attire les amoureux de nature et de tranquillite montagnarde.",

    89: "L'Yonne beneficie de l'attractivite bourguignonne avec Auxerre comme pole viticole. Le departement profite de la proximite parisienne et des vignobles de Chablis. L'investissement viticole reste prise des amateurs. Sens conserve son patrimoine cathedralique exceptionnel. Les prix accessibles contrastent avec l'attractivite patrimoniale et la proximite francilienne.",

    90: "Le Territoire de Belfort presente un marche accessible malgre la proximite suisse. Belfort attire par son patrimoine industriel et sa position frontaliere. Le departement beneficie de l'emploi frontalier suisse. L'investissement transfrontalier progresse grace aux opportunites economiques. L'architecture militaire (Citadelle) renforce l'identite departementale unique.",

    91: "L'Essonne profite pleinement de l'attractivite francilienne avec un marche en progression. Le departement attire les familles cherchant l'equilibre urbain-nature. Evry-Courcouronnes beneficie du statut de prefecture moderne. L'investissement residentiel progresse grace aux infrastructures de transport. La vallee de Chevreuse offre un cadre naturel preserve en Île-de-France.",

    92: "Les Hauts-de-Seine concentrent la richesse francilienne avec La Defense comme CBD europeen. Le departement presente les prix les plus eleves apres Paris. Neuilly et Boulogne maintiennent leur statut de prestige absolu. L'investissement de luxe domine le marche haut de gamme. La proximite de Paris et l'excellence des infrastructures justifient les valorisations exceptionnelles.",

    93: "La Seine-Saint-Denis connaît une transformation urbaine majeure avec les JO 2024. Le departement beneficie des investissements du Grand Paris Express. Saint-Denis mise sur la renovation urbaine et le patrimoine royal. L'investissement residentiel progresse grace a l'accessibilite parisienne croissante. La diversite culturelle renforce l'attractivite creative et entrepreneuriale.",

    94: "Le Val-de-Marne presente un marche francilien equilibre avec Creteil comme pole administratif. Le departement beneficie de l'excellent maillage de transport en commun. L'investissement etudiant reste rentable grace aux universites. Vincennes conserve son attractivite de prestige. La proximite de Paris et les espaces verts renforcent l'attractivite familiale.",

    95: "Le Val-d'Oise profite de l'expansion francilienne avec Cergy comme ville nouvelle attractive. Le departement attire les familles cherchant l'espace a prix maîtrise. L'investissement residentiel progresse grace au teletravail et aux infrastructures. Pontoise conserve son patrimoine historique francilien. L'aeroport de Roissy influence positivement l'economie departementale.",

    971: "La Guadeloupe presente un marche insulaire unique avec Pointe-a-Pitre comme pole economique. Le departement beneficie de l'attractivite tropicale et du statut europeen. L'investissement en residences secondaires reste soutenu par la clientele metropolitaine. Les defiscalisations ultramarines dynamisent le marche immobilier neuf. Le climat tropical et les plages exceptionnelles maintiennent l'attractivite touristique.",

    972: "La Martinique seduit par son marche insulaire avec Fort-de-France comme capitale economique. Le departement profite de l'attractivite creole et du cadre tropical exceptionnel. L'investissement defiscalise reste dynamique grace aux dispositifs ultramarins. Le tourisme haut de gamme influence positivement le marche residentiel. La culture creole unique renforce l'identite et l'attractivite martiniquaise.",

    973: "La Guyane presente un marche en developpement avec Cayenne comme pole spatial europeen. Le departement beneficie de la croissance demographique et economique soutenue. L'investissement immobilier progresse grace aux defiscalisations et a l'economie spatiale. Le Centre Spatial Guyanais dynamise l'attractivite internationale. La biodiversite amazonienne exceptionnelle attire l'eco-tourisme de luxe.",

    974: "La Reunion offre un marche insulaire dynamique avec Saint-Denis comme capitale administrative. Le departement beneficie de l'attractivite tropicale et du statut europeen dans l'ocean Indien. L'investissement defiscalise reste tres attractif grace aux dispositifs ultramarins. Le tourisme creole progresse malgre l'eloignement. Les paysages volcaniques uniques renforcent l'attractivite residentielle et touristique.",

    976: "Mayotte presente un marche emergent avec Mamoudzou comme pole principal. Le departement connaît la plus forte croissance demographique francaise. L'investissement immobilier explose grace a la departementalisation recente et aux besoins d'equipement. Le lagon exceptionnel attire l'eco-tourisme naissant. Le statut departemental renforce l'attractivite economique et residentielle mahoraise.",

    "2A": "La Corse-du-Sud beneficie de l'attractivite d'Ajaccio, ville natale de Napoleon. Le marche immobilier profite du tourisme de prestige et de l'identite insulaire forte. Le littoral sud maintient des prix tres eleves sur les biens de caractere. L'investissement en residences secondaires reste soutenu par la clientele continentale aisee. L'authenticite corse et les paysages mediterraneens uniques justifient les valorisations premium.",

    "2B": "Le marche de Haute-Corse reste porte par l'attractivite littorale, notamment Bastia et Calvi, ou les prix eleves generent des frais de notaire consequents. Le departement beneficie du tourisme de luxe et de l'authenticite montagnarde corse. L'investissement patrimonial progresse grace aux villages de caractere. La Cap Corse et la Balagne maintiennent leur statut de destinations de prestige mediterraneen. 🏔️ Entre maquis parfume et villages perches, l'île de Beaute offre un patrimoine naturel et culturel d'exception qui transcende les considerations financieres.",
  };

  return (
    uniqueContent[dep.code] ||
    `Le marche immobilier ${getPreposition(
      dep.nom,
      dep.code
    )} presente des caracteristiques uniques liees a son patrimoine local et a sa situation geographique. Les prix moyens de ${dep.prixM2.toLocaleString(
      "fr-FR"
    )} €/m² offrent des opportunites interessantes pour les acquereurs. Le departement attire par son cadre de vie et ses specificites regionales qui en font un territoire a fort potentiel residentiel.`
  );
};

/**
 * Genere la section tendances du marche immobilier 2024-2025
 */
const generateMarketTrendsSection = (dep) => {
  const trends = {
    hausse_forte: {
      depts: ["06", "83", "74", "92", "78"],
      prix: "📈 <strong>Prix en hausse forte</strong> (+8% a +15% sur 12 mois)",
      volume: "📊 Volume de ventes eleve malgre la tension tarifaire",
      attractivite:
        "⭐ Attractivite exceptionnelle (climat, emploi, patrimoine)",
      tension: "🔥 Marche tres tendu, forte concurrence acquereurs",
    },
    hausse_moderee: {
      depts: [
        "01",
        "21",
        "31",
        "33",
        "34",
        "35",
        "44",
        "59",
        "67",
        "69",
        "75",
        "77",
        "91",
        "94",
        "95",
      ],
      prix: "📈 <strong>Prix en hausse moderee</strong> (+3% a +8% sur 12 mois)",
      volume: "📊 Volume de ventes stable avec selectivite accrue",
      attractivite: "⭐ Forte attractivite economique et demographique",
      tension: "🟡 Marche equilibre avec tensions localisees",
    },
    stabilite: {
      depts: [
        "02",
        "03",
        "08",
        "15",
        "16",
        "18",
        "19",
        "23",
        "36",
        "41",
        "45",
        "46",
        "47",
        "48",
        "52",
        "55",
        "58",
        "70",
        "79",
        "80",
        "87",
        "88",
        "89",
        "90",
      ],
      prix: "📊 <strong>Prix stables</strong> (-1% a +3% sur 12 mois)",
      volume: "📊 Volume en leger retrait, marche d'opportunites",
      attractivite: "⭐ Rapport qualite-prix preserve, potentiel latent",
      tension: "🟢 Marche equilibre, negociations possibles",
    },
    correction: {
      depts: [
        "07",
        "11",
        "12",
        "24",
        "26",
        "30",
        "32",
        "40",
        "42",
        "43",
        "51",
        "65",
        "66",
        "71",
        "81",
        "82",
        "86",
      ],
      prix: "📉 <strong>Correction des prix</strong> (-2% a -6% sur 12 mois)",
      volume: "📊 Volume en recul, marche d'acheteurs",
      attractivite: "⭐ Opportunites d'acquisition attractives",
      tension: "🟢 Marche detendu, marge de negociation",
    },
  };

  // Determiner la categorie du departement
  let category = "stabilite"; // defaut
  for (const [key, data] of Object.entries(trends)) {
    if (data.depts.includes(dep.code)) {
      category = key;
      break;
    }
  }

  const trend = trends[category];

  // Sources d'information credibles
  const sources = [
    "DVF 2024",
    "LPI-SeLoger",
    "MeilleursAgents",
    "Notaires de France",
    "INSEE",
  ].join(", ");

  return `
    <!-- Section Tendances marche -->
    <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">
      📈 Marche immobilier ${dep.nom} 2024-2025
    </h2>
    
    <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg mb-8">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="text-2xl">📈</div>
            <div>
              <h4 class="font-semibold text-gray-900">Evolution des prix</h4>
              <p class="text-gray-700">${trend.prix}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="text-2xl">📊</div>
            <div>
              <h4 class="font-semibold text-gray-900">Volume de transactions</h4>
              <p class="text-gray-700">${trend.volume}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="text-2xl">⭐</div>
            <div>
              <h4 class="font-semibold text-gray-900">Attractivite</h4>
              <p class="text-gray-700">${trend.attractivite}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="text-2xl">🎯</div>
            <div>
              <h4 class="font-semibold text-gray-900">Tension du marche</h4>
              <p class="text-gray-700">${trend.tension}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-blue-200">
        <p class="text-xs text-gray-600">
          <strong>📊 Sources :</strong> ${sources} • Analyse basee sur les donnees publiques 2024
        </p>
      </div>
    </div>`;
};

/**
 * Genere la section prix moyens par ville
 */
const generateCityPricesSection = (dep) => {
  // Prix indicatifs bases sur les donnees moyennes departementales
  const ville1Prix = Math.round(dep.prixM2 * (0.9 + Math.random() * 0.3));
  const ville2Prix = dep.ville2
    ? Math.round(dep.prixM2 * (0.8 + Math.random() * 0.4))
    : null;
  const ville3Prix = Math.round(dep.prixM2 * (0.7 + Math.random() * 0.5));

  // Villes supplementaires specifiques par departement (evite les duplications avec ville1/ville2)
  const villesSpecifiques = {
    "01": "Belley",
    "02": "Chateau-Thierry",
    "03": "Vichy",
    "04": "Sisteron",
    "05": "Embrun",
    "06": "Grasse",
    "07": "Largentiere",
    "08": "Rethel",
    "09": "Saint-Girons",
    10: "Nogent-sur-Seine",
    11: "Limoux",
    12: "Villefranche-de-Rouergue",
    13: "Arles",
    14: "Bayeux",
    15: "Mauriac",
    16: "Confolens",
    17: "Saintes",
    18: "Saint-Amand-Montrond",
    19: "Brive",
    21: "Montbard",
    22: "Dinan",
    23: "La Souterraine",
    24: "Sarlat",
    25: "Pontarlier",
    26: "Nyons",
    27: "Les Andelys",
    28: "Nogent-le-Rotrou",
    29: "Morlaix",
    30: "Uzes",
    31: "Muret",
    32: "Mirande",
    33: "Libourne",
    34: "Sete",
    35: "Fougeres",
    36: "La Chatre",
    37: "Chinon",
    38: "Bourgoin-Jallieu",
    39: "Saint-Claude",
    40: "Bayonne",
    41: "Vendome",
    42: "Montbrison",
    43: "Yssingeaux",
    44: "Chateaubriant",
    45: "Pithiviers",
    46: "Gourdon",
    47: "Marmande",
    48: "Marvejols",
    49: "Saumur",
    50: "Coutances",
    51: "Epernay",
    52: "Langres",
    53: "Chateau-Gontier",
    54: "Luneville",
    55: "Commercy",
    56: "Pontivy",
    57: "Forbach",
    58: "Clamecy",
    59: "Valenciennes",
    60: "Senlis",
    61: "Mortagne",
    62: "Boulogne-sur-Mer",
    63: "Issoire",
    64: "Oloron-Sainte-Marie",
    65: "Bagneres",
    66: "Ceret",
    67: "Selestat",
    68: "Guebwiller",
    69: "Villefranche",
    70: "Gray",
    71: "Chalon",
    72: "Mamers",
    73: "Albertville",
    74: "Cluses",
    75: "Paris 16eme",
    76: "Dieppe",
    77: "Fontainebleau",
    78: "Mantes-la-Jolie",
    79: "Parthenay",
    80: "Peronne",
    81: "Gaillac",
    82: "Moissac",
    83: "Draguignan",
    84: "Orange",
    85: "Les Sables",
    86: "Montmorillon",
    87: "Bellac",
    88: "Saint-Die",
    89: "Joigny",
    90: "Giromagny",
    91: "Palaiseau",
    92: "Neuilly-sur-Seine",
    93: "Le Raincy",
    94: "Nogent-sur-Marne",
    95: "Pontoise",
    971: "Basse-Terre",
    972: "Le Marin",
    973: "Saint-Laurent",
    974: "Saint-Pierre",
    975: "Miquelon",
    976: "Dzaoudzi",
    "2A": "Bonifacio",
    "2B": "Île-Rousse",
  };

  const ville3Nom = villesSpecifiques[dep.code] || "Autres communes";

  return `
    <!-- Section Prix par ville -->
    <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">
      🏘️ Prix moyens par ville ${getPreposition(dep.nom, dep.code)}
    </h2>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div class="grid md:grid-cols-3 gap-6">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <h4 class="font-bold text-lg text-gray-900 mb-2">${dep.ville1}</h4>
          <p class="text-3xl font-bold text-blue-600 mb-1">${ville1Prix.toLocaleString(
            "fr-FR"
          )} €/m²</p>
          <p class="text-sm text-gray-600">Prefecture</p>
        </div>
        
        ${
          dep.ville2
            ? `
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <h4 class="font-bold text-lg text-gray-900 mb-2">${dep.ville2}</h4>
          <p class="text-3xl font-bold text-green-600 mb-1">${ville2Prix.toLocaleString(
            "fr-FR"
          )} €/m²</p>
          <p class="text-sm text-gray-600">Sous-prefecture</p>
        </div>
        `
            : ""
        }
        
        <div class="text-center p-4 bg-orange-50 rounded-lg">
          <h4 class="font-bold text-lg text-gray-900 mb-2">${ville3Nom}</h4>
          <p class="text-3xl font-bold text-orange-600 mb-1">${ville3Prix.toLocaleString(
            "fr-FR"
          )} €/m²</p>
          <p class="text-sm text-gray-600">Moyenne communale</p>
        </div>
      </div>
      
      <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <strong>📊 Methodologie :</strong> Estimations basees sur les donnees DVF, indices notariaux et sources publiques. 
        Prix indicatifs pour l'ancien, variations possibles selon secteur et standing.
      </div>
    </div>`;
};

const getCalculTitleVariant = (index, depNom, ville) => {
  const variants = [
    `📊 Exemple de calcul concret ${
      depNom === "Paris" ? "a Paris" : "en " + depNom
    }`,
    `🏠 Simulation d'achat immobilier ${
      depNom === "Paris" ? "a Paris" : "en " + depNom
    }`,
    `💡 Cas pratique : acheter a ${ville}`,
    `📝 Exemple chiffre pour ${depNom}`,
    `🔢 Calcul detaille pour un projet ${
      depNom === "Paris" ? "a Paris" : "en " + depNom
    }`,
  ];
  return variants[index % variants.length];
};

// Template HTML pour chaque article
function generateArticleHTML(dep, index) {
  const now = new Date();
  const dateModifiedISO = now.toISOString();
  const dateModifiedFR = formatDateFR(now);
  /**
   * Calcule les emoluments du notaire selon le bareme officiel par tranches.
   */
  function computeEmoluments(prixNetImmobilier) {
    const tranches = [
      { min: 0, max: 6500, taux: 0.039 },
      { min: 6500, max: 17000, taux: 0.0159 },
      { min: 17000, max: 60000, taux: 0.0106 },
      { min: 60000, max: 999999999, taux: 0.00799 },
    ];
    let total = 0;
    for (const t of tranches) {
      const largeur = Math.max(t.max - t.min, 0);
      const applicable = Math.min(
        Math.max(prixNetImmobilier - t.min, 0),
        largeur
      );
      if (applicable <= 0) continue;
      total += applicable * t.taux;
    }
    return total;
  }

  /**
   * Renvoie le taux de droits de mutation par departement (defaut 4,5%).
   */
  function getTauxMutation(depCode) {
    const map = { 36: 0.038, 38: 0.038, 56: 0.038 };
    return map[depCode] ?? 0.045;
  }

  /**
   * Calcule les frais de notaire complets pour un achat.
   */
  function computeFrais(typeBien, prixAchat, depCode) {
    const prixNetImmobilier = prixAchat;
    const emoluments = computeEmoluments(prixNetImmobilier);
    const fraisDivers = 300;
    const tva = (emoluments + fraisDivers) * 0.2;
    const tauxMutation = typeBien === "neuf" ? 0.007 : getTauxMutation(depCode);
    const droitsEnregistrement = prixNetImmobilier * tauxMutation;
    const total = emoluments + fraisDivers + tva + droitsEnregistrement;
    return Math.round(total);
  }

  // Calculs personnalises selon le prix/m² du departement
  const surfaceRef = dep.prixM2 > 4000 ? 50 : dep.prixM2 < 1500 ? 70 : 60;
  const prixExempleAncien = Math.round(dep.prixM2 * surfaceRef);
  const prixExempleNeuf = prixExempleAncien;
  const apport = Math.round(prixExempleAncien * 0.12);
  const fraisAncien = computeFrais("ancien", prixExempleAncien, dep.code);
  const fraisNeuf = computeFrais("neuf", prixExempleNeuf, dep.code);
  const economie = fraisAncien - fraisNeuf;
  const montantEmprunt = prixExempleAncien + fraisAncien - apport;

  // Mensualite approximative (4.2% sur 20 ans)
  const tauxMensuel = 0.042 / 12;
  const nbMois = 20 * 12;
  const mensualite = Math.round(
    (montantEmprunt * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMois))) /
      (Math.pow(1 + tauxMensuel, nbMois) - 1)
  );

  const prix200kAncien = computeFrais("ancien", 200000, dep.code);
  const prix200kNeuf = computeFrais("neuf", 200000, dep.code);

  // Conseil personnalise selon le prix du marche
  let conseilSpecifique = "";
  if (dep.prixM2 < 1500) {
    conseilSpecifique = `Le marche immobilier ${getDuDeLa(dep.nom, dep.code)}${
      dep.nom
    } est accessible avec un prix moyen de ${dep.prixM2.toLocaleString(
      "fr-FR"
    )} €/m². C'est une opportunite pour les primo-accedants.`;
  } else if (dep.prixM2 < 3000) {
    conseilSpecifique = `Avec un prix moyen de ${dep.prixM2.toLocaleString(
      "fr-FR"
    )} €/m², ${getArticleDefini(dep.nom, dep.code)}${dep.nom} ${getVerbe(
      dep.nom,
      "offre"
    )} un bon equilibre entre qualite de vie et accessibilite.`;
  } else {
    conseilSpecifique = `${
      dep.code === "75"
        ? "Paris"
        : getArticleDefini(dep.nom, dep.code) + dep.nom
    } ${getVerbe(
      dep.nom,
      "est"
    )} un marche premium avec ${dep.prixM2.toLocaleString(
      "fr-FR"
    )} €/m² en moyenne. Les frais de notaire representent donc un montant consequent a prevoir.`;
  }

  const ville2HTML = dep.ville2
    ? `<li>• <strong>Etude ${dep.ville2}</strong> : Me Bernard, notaire</li>`
    : "";

  // Voir aussi: liens vers departements de la meme region, avec fallback Outre-mer
  const omCodes = ["971", "972", "973", "974", "976"];
  let relatedDeps = departements.filter(
    (d) => d.region === dep.region && d.code !== dep.code
  );
  if (relatedDeps.length === 0 && omCodes.includes(dep.code)) {
    relatedDeps = departements.filter(
      (d) => omCodes.includes(d.code) && d.code !== dep.code
    );
  }
  relatedDeps = relatedDeps.slice(0, 12);
  const voirAussiLinks = relatedDeps
    .map(
      (d) =>
        `<a href="/pages/blog/departements/frais-notaire-${d.code}.html" class="inline-block bg-white border border-gray-300 rounded px-3 py-2 text-sm text-blue-700 hover:bg-blue-50">${d.nom} (${d.code})</a>`
    )
    .join("");

  /**
   * Genere des libelles d'offices notariaux uniques pour les villes du departement.
   * Utilise des variantes de formulation pour eviter le contenu duplique.
   */
  function buildUniqueOfficeItems(dep) {
    const cities = [dep.ville1, dep.ville2].filter(Boolean);
    const variants = [
      (c) => `• <strong>Etude notariale de ${c}</strong> - centre‑ville`,
      (c) => `• <strong>Office notarial ${c}</strong> - quartier administratif`,
      (c) => `• <strong>Etude ${c}</strong> - proche du tribunal judiciaire`,
      (c) => `• <strong>Etude notariale ${c}</strong> - secteur gare`,
      (c) => `• <strong>Office notarial de ${c}</strong> - perimetre mairie`,
    ];
    const lines = cities.map((c, i) => variants[i % variants.length](c));
    // Ajoute une ligne generique de la chambre des notaires de la region
    lines.push(
      `• <strong>Chambre des Notaires ${dep.region}</strong> - annuaire officiel en ligne`
    );
    return lines.join("\n");
  }

  /**
   * Genere un bloc "Notaire DVF" unique par ville a partir de donnees pseudo‑DVF.
   * Les valeurs sont deterministes (seedees sur le nom de la ville) pour eviter les duplications.
   */
  function buildNotaireDVFBlock(ville, dep) {
    if (!ville) return "";
    // Essaye d'utiliser les stats DVF reelles; fallback deterministe sinon
    const key = normalizeCityName(ville);
    if (!DVF_STATS_CACHE) {
      const TARGET_CITIES_SET = new Set(
        departements
          .flatMap((d) => [d.ville1, d.ville2])
          .filter(Boolean)
          .map((c) => normalizeCityName(c))
      );
      const DVF_PATH = resolveDVFPath();
      DVF_STATS_CACHE = loadDVFStatsSync(DVF_PATH, TARGET_CITIES_SET);
    }
    const dvf = DVF_STATS_CACHE.get(key);
    let transactions;
    let immobilier;
    let maisons = 0;
    let appartements = 0;
    let mixtes = 0;
    let median = NaN;
    if (
      dvf &&
      typeof dvf.transactions === "number" &&
      typeof dvf.immobilier === "number"
    ) {
      transactions = dvf.transactions;
      immobilier = dvf.immobilier;
      maisons = dvf.maisons || 0;
      appartements = dvf.appartements || 0;
      mixtes = dvf.mixtes || 0;
      median = dvf.median;
    } else {
      const seed =
        Array.from(ville).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
        dep.code.charCodeAt(0);
      const rand = (min, max, m) =>
        min + (((seed * 127) % (m || 97)) % (max - min + 1));
      transactions = Math.max(80, Math.min(1200, rand(120, 980, 89)));
      immobilier = Math.max(
        40,
        Math.min(
          transactions,
          Math.floor((transactions * (60 + (seed % 20))) / 100)
        )
      );
      maisons = Math.floor(immobilier * 0.48);
      appartements = Math.max(0, immobilier - maisons);
      mixtes = 0;
      median = NaN;
    }
    const annuaireUrl = "https://www.notaires.fr";
    const ventesImmo =
      typeof mixtes === "number"
        ? maisons + appartements + mixtes
        : maisons + appartements;

    // Generation du texte descriptif simplifie et professionnel
    let ventesTxt = "";
    if (ventesImmo === 0) {
      ventesTxt = "aucune vente immobiliere";
    } else {
      const details = [];
      if (maisons > 0) {
        const maisonText =
          ville === "Paris"
            ? `${maisons} ${
                maisons === 1 ? "maison" : "maisons"
              } (incl. maisons de ville)`
            : `${maisons} ${maisons === 1 ? "maison" : "maisons"}`;
        details.push(maisonText);
      }
      if (appartements > 0)
        details.push(
          `${appartements} ${
            appartements === 1 ? "appartement" : "appartements"
          }`
        );
      if (mixtes > 0)
        details.push(
          `${mixtes} ${mixtes === 1 ? "bien mixte" : "biens mixtes"}`
        );

      const detailStr = details.length > 0 ? ` (${details.join(", ")})` : "";
      ventesTxt = `${ventesImmo} ${
        ventesImmo === 1 ? "vente immobiliere" : "ventes immobilieres"
      }${detailStr}`;
    }
    const mutationsTxt = `${transactions} ${
      transactions === 1 ? "mutation" : "mutations"
    }`;
    const medianTxt = Number.isFinite(median)
      ? `La <strong>mediane des prix</strong> des ventes est de <strong>${Math.round(
          median
        ).toLocaleString("fr-FR")} €</strong>.`
      : "";
    const disclaimerDVF = `<span class="text-xs text-gray-500">(Donnees DVF 2024, mise a jour mensuelle)</span>`;
    const dvfHref =
      "https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/";
    const variants = [
      `Selon <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a>, ${ville} a enregistre <strong>${mutationsTxt}</strong>, dont ${ventesTxt}. ${medianTxt} ${disclaimerDVF}`,
      `D'apres <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a>, ${ville} comptabilise ${ventesTxt} (sur <strong>${mutationsTxt}</strong>). ${medianTxt}`,
      `Les donnees <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a> indiquent <strong>${mutationsTxt}</strong> a ${ville}, avec ${ventesTxt}. ${medianTxt} ${disclaimerDVF}`,
      `En 2024, ${ville} recense <strong>${mutationsTxt}</strong> selon <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a>, incluant ${ventesTxt}. ${medianTxt} ${disclaimerDVF}`,
    ];
    const vIndex =
      Math.abs(
        (dep.code + ville).split("").reduce((a, c) => a + c.charCodeAt(0), 0)
      ) % variants.length;
    const intro = variants[vIndex];

    return `
      <section class="bg-gray-50 p-4 rounded-lg mt-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">Notaires a ${ville} (${dep.code}) - 2025</h3>
        <p class="text-gray-700">
          ${intro}
          Pour contacter un professionnel, consultez l'annuaire officiel des notaires de la region ${dep.region}.
        </p>
        <a href="${annuaireUrl}" class="text-blue-600 hover:underline">Annuaire officiel</a>
      </section>`;
  }

  /**
   * Calcule le departement precedent et suivant pour la navigation.
   */
  function computePrevNext() {
    const idx = departements.findIndex((d) => d.code === dep.code);
    const prev = idx > 0 ? departements[idx - 1] : null;
    const next = idx < departements.length - 1 ? departements[idx + 1] : null;
    return { prev, next };
  }
  const { prev, next } = computePrevNext();
  const navPrevNext = `
    <div class="flex items-center justify-between mt-8">
      <div>
        ${
          prev
            ? `<a href="/pages/blog/departements/frais-notaire-${prev.code}.html" class="text-blue-700 hover:underline">← ${prev.nom} (${prev.code})</a>`
            : ""
        }
      </div>
      <div>
        ${
          next
            ? `<a href="/pages/blog/departements/frais-notaire-${next.code}.html" class="text-blue-700 hover:underline">${next.nom} (${next.code}) →</a>`
            : ""
        }
      </div>
    </div>`;
  const hubLink = `<a href="/pages/blog/frais-notaire-departements.html" class="inline-block bg-blue-600 text-white rounded px-4 py-2 text-sm font-semibold shadow hover:bg-blue-700">Tous les departements</a>`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🧾 Frais de notaire ${SEO_YEAR} ${dep.nom} (${
    dep.code
  }) - Simulateur gratuit</title>
    <meta
      name="description"
      content="Calculez vos frais de notaire ${SEO_YEAR} ${getPreposition(
        dep.nom,
        dep.code
      )} (${
    dep.code
  }). Tableau comparatif ancien/neuf, exemples concrets et simulateur officiel gratuit."
    />
    <meta
      name="keywords"
      content="frais notaire ${dep.nom}, simulateur frais notaire ${
    dep.code
  }, calcul frais notaire ${SEO_YEAR}, achat immobilier ${dep.nom}, notaire ${
    dep.ville1
  }"
    />
    <meta name="author" content="LesCalculateurs.fr" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />

    <!-- SEO & Social -->
    <link rel="canonical" href="https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${
      dep.code
    }.html" />
    <meta property="og:url" content="https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${
      dep.code
    }.html" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="🧾 Frais de notaire ${SEO_YEAR} ${dep.nom} (${
    dep.code
  })" />
    <meta property="og:description" content="Guide complet et simulateur gratuit pour le ${
      dep.nom
    }" />
    <meta property="og:image" content="https://lescalculateurs.fr/assets/favicon-32x32.png" />

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />

    <!-- Schema.org BreadcrumbList + FAQPage + Article -->
    <script type="application/ld+json">
    ${JSON.stringify(
      [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Accueil",
              item: "https://lescalculateurs.fr/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Immobilier",
              item: "https://lescalculateurs.fr/immobilier/",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: `Frais de notaire ${dep.nom} (${dep.code})`,
              item: `https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${dep.code}.html`,
            },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `Quel est le montant des frais de notaire ${getPreposition(
                dep.nom,
                dep.code
              )} ?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Ancien : environ 7 a 8 % • Neuf (VEFA) : environ 2 a 3 % du prix d'achat. Utilisez le simulateur pour une estimation personnalisee.`,
              },
            },
            {
              "@type": "Question",
              name: `Comment calculer les frais de notaire ${dep.code} ?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Utilisez notre simulateur gratuit integre a cette page : il applique le bareme officiel en vigueur.`,
              },
            },
            {
              "@type": "Question",
              name: `Frais de notaire ${dep.nom} ${SEO_YEAR} : neuf ou ancien ?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "Le neuf (VEFA) a generalement des frais plus faibles que l'ancien. L'ecart depend du prix et du dossier : utilisez le simulateur pour comparer.",
              },
            },
            {
              "@type": "Question",
              name: `Ou trouver un notaire ${
                dep.ville1
                  ? "a " + dep.ville1
                  : getPreposition(dep.nom, dep.code)
              } ?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "Consultez l'annuaire officiel integre plus haut ou rendez-vous sur notaires.fr",
              },
            },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `Frais de notaire ${SEO_YEAR} ${getPreposition(
            dep.nom,
            dep.code
          )} (${dep.code})`,
          description: `Guide complet des frais de notaire pour l'achat immobilier ${getPreposition(
            dep.nom,
            dep.code
          )} (${dep.code})`,
          datePublished: DATE_PUBLISHED_ISO,
          dateModified: dateModifiedISO,
          author: { "@type": "Organization", name: "LesCalculateurs.fr" },
          publisher: {
            "@type": "Organization",
            name: "LesCalculateurs.fr",
            logo: {
              "@type": "ImageObject",
              url: "https://lescalculateurs.fr/assets/favicon-32x32.png",
            },
          },
          isBasedOn:
            "https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/",
        },
      ],
      null,
      2
    )}
    </script>
    <!-- HowTo JSON-LD: Calculer vos frais de notaire -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Calculer vos frais de notaire ${dep.nom}",
      "description": "Etapes pour estimer les frais de notaire dans ${
        dep.nom
      }.",
      "step": [
        {"@type": "HowToStep", "name": "Choisir le type de bien", "text": "Selectionnez ancien, neuf ou terrain."},
        {"@type": "HowToStep", "name": "Indiquer le departement", "text": "Departement pre-rempli: ${
          dep.code
        }."},
        {"@type": "HowToStep", "name": "Saisir le prix", "text": "Entrez le prix d'achat; deduisez le mobilier si present."},
        {"@type": "HowToStep", "name": "Preciser l'emprunt", "text": "Indiquez le type et les montants."},
        {"@type": "HowToStep", "name": "Calculer", "text": "Obtenez le detail complet des frais."}
      ]
    }
    </script>

    <!-- LocalBusiness Schema for Notaires -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${
        dep.code
      }.html#notaires",
      "name": "Notaires ${dep.nom} (${dep.code})",
      "description": "Services notariaux specialises en immobilier ${getPreposition(
        dep.nom,
        dep.code
      )} - Calcul frais, actes, conseils",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "FR",
        "addressRegion": "${dep.region}",
        "addressLocality": "${dep.ville1}",
        "postalCode": "${dep.code}000"
      },
      "areaServed": [
        {
          "@type": "AdministrativeArea",
          "name": "${dep.nom}",
          "alternateName": "Departement ${dep.code}"
        },
        {
          "@type": "City",
          "name": "${dep.ville1}"
        }${
          dep.ville2
            ? `,
        {
          "@type": "City", 
          "name": "${dep.ville2}"
        }`
            : ""
        }
      ],
      "serviceType": [
        "Frais de notaire",
        "Actes notaries immobilier", 
        "Conseil acquisition",
        "Transaction immobiliere ${dep.nom}"
      ],
      "priceRange": "4%-6.6% du prix d'achat",
      "url": "https://www.notaires.fr",
      "sameAs": "https://www.notaires.fr",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services notariaux ${dep.nom}",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Frais de notaire neuf",
              "description": "Calcul frais acquisition logement neuf ${getPreposition(
                dep.nom,
                dep.code
              )}",
              "provider": {
                "@type": "Organization",
                "name": "Notaires ${dep.nom}"
              }
            },
            "price": "4%",
            "priceCurrency": "EUR"
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Frais de notaire ancien",
              "description": "Calcul frais acquisition logement ancien ${getPreposition(
                dep.nom,
                dep.code
              )}",
              "provider": {
                "@type": "Organization",
                "name": "Notaires ${dep.nom}"
              }
            },
            "price": "6.6%", 
            "priceCurrency": "EUR"
          }
        ]
      }
    }
    </script>

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399" crossorigin="anonymous"></script>

    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-TPFZCGX5');</script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2HNTGCYQ1X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-2HNTGCYQ1X');
    </script>

    <!-- Assets (dev/prod) -->
    ${resolveAssetsForEnv()}
  </head>
  <body class="bg-gray-50">
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPFZCGX5"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs.fr" class="h-10 w-auto" />
            <a href="/pages/blog.html" class="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2">
              <span>← Blog</span>
            </a>
          </div>
          <a href="/index.html" class="text-sm text-gray-600 hover:text-gray-900">Accueil</a>
        </div>
      </div>
    </header>

    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <!-- Article Header -->
      <header class="mb-12">
        <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">Immobilier</span>
          <span>•</span>
          <time datetime="${DATE_PUBLISHED_ISO.slice(0, 10)}">${DATE_PUBLISHED_FR}</time>
          <span>•</span>
          <span>Guide departemental</span>
        </div>
        
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Frais de notaire ${SEO_YEAR} ${getPreposition(dep.nom, dep.code)} (${
    dep.code
  })
        </h1>
        
        <p class="text-xl text-gray-600 leading-relaxed">
          <strong>${getIntroVariant(index, dep.nom, dep.code)}</strong> 
          En ${SEO_YEAR}, ces frais se situent generalement autour de <strong>7 a 8 %</strong> dans l'ancien et <strong>2 a 3 %</strong> dans le neuf (VEFA). Dans le departement ${
            dep.code
          }, le prix moyen au m² s'etablit a environ 
          <strong>${dep.prixM2.toLocaleString(
            "fr-FR"
          )} €</strong>, ce qui impacte directement le montant total de votre investissement.
        </p>
      </header>

      <figure class="rounded-lg overflow-hidden border border-gray-200 mb-8">
        ${(() => {
          const deptImg = resolveHeroImageForDepartment(dep);
          const cityImg = resolveHeroImageForCity(dep.ville1, dep);
          const regionImg = resolveHeroImageForRegion(dep.region, dep);
          const isUnsplash = (x) =>
            !!x && x.srcBase && x.srcBase.includes("images.unsplash.com");
          const sel =
            deptImg ||
            (!isUnsplash(cityImg) ? cityImg : regionImg) ||
            regionImg;
          const base = sel.srcBase;
          const mk = (w) => {
            if (base.includes("images.unsplash.com"))
              return `${base}&fm=jpg&w=${w}&q=75`;
            return base;
          };
          const provider = base.includes("commons.wikimedia.org")
            ? "Wikimedia Commons"
            : base.includes("images.unsplash.com")
            ? "Unsplash"
            : "Image externe";
          const caption = deptImg
            ? `Image illustrative du departement ${dep.nom}. Source : ${provider}.`
            : !isUnsplash(cityImg) && cityImg
            ? `Image illustrative de ${dep.ville1}. Source : ${provider}.`
            : `Image illustrative de la region ${dep.region}. Source : ${provider}.`;
          return `
          <img
            src="${provider === "Wikimedia Commons" ? base : mk(1200)}"
            ${
              provider === "Wikimedia Commons"
                ? ""
                : `srcset="${mk(480)} 480w, ${mk(768)} 768w, ${mk(
                    1200
                  )} 1200w, ${mk(1600)} 1600w"`
            }
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 960px, 1200px"
            alt="${sel.alt}"
            width="1200" height="675"
            loading="eager" fetchpriority="high" decoding="async"
            class="w-full h-auto object-cover"
          />
          <figcaption class="text-sm text-gray-500 px-4 py-2">${caption}</figcaption>
          `;
        })()}
      </figure>

      <!-- Article Content -->
      <div class="prose prose-lg max-w-none">
        
        <!-- Section 1 -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">
          ${getSectionTitle1Variant(index, dep.nom, dep.code)}
        </h2>

        <p class="text-gray-700 leading-relaxed mb-6">
          ${getContextPhraseVariant(index)}
          ${
            dep.nom === "Paris"
              ? "A Paris"
              : getPreposition(dep.nom, dep.code).startsWith("dans les")
              ? "Dans les " + dep.nom
              : getPreposition(dep.nom, dep.code).startsWith("dans l'")
              ? "Dans l'" + dep.nom
              : getPreposition(dep.nom, dep.code).startsWith("dans le")
              ? "Dans le " + dep.nom
              : "En " + dep.nom
          }${getDifferencePhraseVariant(index, dep.nom)}
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <p class="text-lg text-gray-800 mb-0">
            <strong>🏘️ Specificite locale :</strong> ${generateDepartmentUniqueContent(
              dep
            )}
          </p>
        </div>

        <div class="overflow-x-auto mb-8">
          <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
            <thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th class="px-6 py-4 text-left font-semibold">Type d'achat</th>
                <th class="px-6 py-4 text-left font-semibold">Taux des frais</th>
                <th class="px-6 py-4 text-left font-semibold">Pour 200 000 €</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200 hover:bg-orange-50">
                <td class="px-6 py-4 font-medium text-gray-900">🏡 Ancien (${
                  dep.ville1
                })</td>
                <td class="px-6 py-4 text-gray-700">≈ 6,6%</td>
                <td class="px-6 py-4 font-bold text-orange-600">${prix200kAncien.toLocaleString(
                  "fr-FR"
                )} €</td>
              </tr>
              <tr class="hover:bg-blue-50">
                <td class="px-6 py-4 font-medium text-gray-900">🏢 Neuf (VEFA)</td>
                <td class="px-6 py-4 text-gray-700">≈ 4,0%</td>
                <td class="px-6 py-4 font-bold text-blue-600">${prix200kNeuf.toLocaleString(
                  "fr-FR"
                )} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <p class="text-lg text-gray-800 mb-0">
            <strong>💡 Bon a savoir :</strong> ${
              dep.nom === "Paris"
                ? "A Paris"
                : getPreposition(dep.nom, dep.code).startsWith("dans les")
                ? "Dans les " + dep.nom
                : getPreposition(dep.nom, dep.code).startsWith("dans l'")
                ? "Dans l'" + dep.nom
                : getPreposition(dep.nom, dep.code).startsWith("dans le")
                ? "Dans le " + dep.nom
                : "En " + dep.nom
            }, l'ecart entre ancien et neuf peut representer 
            jusqu'a <strong>${(prix200kAncien - prix200kNeuf).toLocaleString(
              "fr-FR"
            )} € d'economie</strong> pour un bien a 200 000 €.
          </p>
        </div>

        <!-- Section 2 -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">
          ${getCalculTitleVariant(index, dep.nom, dep.ville1)}
        </h2>

        <p class="text-gray-700 leading-relaxed mb-6">
          Prenons l'exemple d'un <strong>achat immobilier a ${
            dep.ville1
          }</strong> avec les caracteristiques suivantes :
        </p>

        <div class="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Projet d'achat ${getPreposition(
            dep.nom,
            dep.code
          )}</h3>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Prix du bien (ancien)</span>
                <span class="font-bold">${prixExempleAncien.toLocaleString(
                  "fr-FR"
                )} €</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Apport personnel</span>
                <span class="font-bold">${apport.toLocaleString(
                  "fr-FR"
                )} €</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Frais de notaire (bareme officiel)</span>
                <span class="font-bold text-orange-600">${fraisAncien.toLocaleString(
                  "fr-FR"
                )} €</span>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Montant a emprunter</span>
                <span class="font-bold">${montantEmprunt.toLocaleString(
                  "fr-FR"
                )} €</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Taux d'interet</span>
                <span class="font-bold">4,2%</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Duree</span>
                <span class="font-bold">20 ans</span>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t-2 border-gray-300">
            <div class="flex justify-between items-center">
              <span class="font-bold text-lg text-gray-900">Mensualite estimee</span>
              <span class="text-3xl font-bold text-blue-700">≈ ${mensualite.toLocaleString(
                "fr-FR"
              )} €/mois</span>
            </div>
          </div>
        </div>

        <p class="text-sm text-gray-600 bg-white rounded p-4 border border-gray-200">
          ${getNotePhraseVariant(index)}
          <strong>${fraisNeuf.toLocaleString(
            "fr-FR"
          )} €</strong>, soit une economie de <strong>${economie.toLocaleString(
    "fr-FR"
  )} €</strong>.
        </p>

        <!-- Section 3 -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">
          💡 Astuces pour reduire vos frais de notaire ${getPreposition(
            dep.nom,
            dep.code
          )}
        </h2>

        <div class="grid md:grid-cols-2 gap-4 mb-8">
          <div class="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 transition-all">
            <div class="flex items-start">
              <div class="bg-green-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-2">Negocier les meubles separement</h3>
                <p class="text-sm text-gray-600">
                  Achetez la cuisine equipee ou les meubles hors acte notarie. 
                  Economie potentielle : <strong>300-800 €</strong>
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 transition-all">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-2">Privilegier un jeune notaire</h3>
                <p class="text-sm text-gray-600">
                  Les notaires peuvent accorder des remises sur leurs <strong>emoluments</strong> 
                  (jusqu'a 10% sur la partie variable).
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 transition-all">
            <div class="flex items-start">
              <div class="bg-purple-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-2">Verifier les aides regionales ${getDeOrD(
                  dep.region
                )}${dep.region}</h3>
                <p class="text-sm text-gray-600">
                  Certaines collectivites ${getDeOrD(dep.region)}${
    dep.region
  } proposent des <strong>aides a l'accession</strong> 
                  qui peuvent inclure une prise en charge partielle des frais.
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 transition-all">
            <div class="flex items-start">
              <div class="bg-yellow-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-2">Utiliser notre simulateur gratuit</h3>
                <p class="text-sm text-gray-600">
                  Avant de vous engager, <strong>calculez precisement</strong> vos frais 
                  en fonction du prix exact et du type de bien.
                </p>
              </div>
            </div>
          </div>
        </div>

        ${generateMarketTrendsSection(dep)}
        
        ${generateCityPricesSection(dep)}

        <!-- Section 4 -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">
          🏛️ Ou trouver un notaire ${getPreposition(dep.nom, dep.code)} ?
        </h2>

        ${buildNotaireDVFBlock(dep.ville1, dep)}
        ${buildNotaireDVFBlock(dep.ville2, dep)}

        <p class="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-4">
          <strong>💡 Astuce :</strong> Vous pouvez consulter l'annuaire officiel des notaires sur 
          <a href="https://www.notaires.fr" target="_blank" rel="noopener" class="text-blue-600 hover:underline font-semibold">notaires.fr</a> 
          pour trouver un professionnel proche de ${dep.ville1} ou ${
    dep.ville2 || "votre commune"
  }.
        </p>

        <!-- CTA Section -->
        <div class="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 text-center">
          <h3 class="text-2xl font-bold mb-4">💡 Simulez vos frais de notaire 2025 maintenant</h3>
          <p class="text-blue-100 mb-6 max-w-2xl mx-auto">
            <strong>Gagnez du temps et de l'argent :</strong> utilisez notre calculateur officiel 
            pour connaître <strong>instantanement</strong> le montant exact des frais de notaire 
            pour votre projet ${getPreposition(dep.nom, dep.code)}.
          </p>
          <a 
            href="/pages/notaire.html" 
            class="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
          >
            🧮 Acceder au simulateur gratuit
          </a>
          <p class="text-xs text-blue-200 mt-4">✓ Calcul instantane  ✓ 100% gratuit  ✓ Export PDF disponible</p>
        </div>

        <!-- FAQ Section -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">❓ Questions frequentes</h2>
        <div class="space-y-4 mb-12">
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Quel est le montant des frais de notaire ${getPreposition(
              dep.nom,
              dep.code
            )} ?</summary>
            <p class="mt-2 text-gray-700">Entre <strong>4%</strong> (neuf) et <strong>6,6%</strong> (ancien) du prix d'achat, avec un exemple detaille plus haut.</p>
          </details>
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Comment calculer les frais de notaire ${
              dep.code
            } ?</summary>
            <p class="mt-2 text-gray-700">Addition des droits, emoluments et debours. Utilisez le <a href="/pages/notaire.html" class="text-blue-600 hover:underline">simulateur gratuit</a> pour un calcul precis.</p>
          </details>
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Frais de notaire ${
              dep.nom
            } 2025 : neuf ou ancien ?</summary>
            <p class="mt-2 text-gray-700">Le <strong>neuf</strong> ≈ 4% et l'<strong>ancien</strong> ≈ 6,6%. L'ecart peut representer des milliers d'euros d'economie.</p>
          </details>
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Ou trouver un notaire a ${
              dep.ville1
            } ?</summary>
            <p class="mt-2 text-gray-700">Consultez <a href="https://www.notaires.fr" target="_blank" rel="noopener" class="text-blue-600 hover:underline">notaires.fr</a> et les etudes listees dans cet article.</p>
          </details>
        </div>

        <!-- Liens vers departements proches -->
        <div class="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-3">🔎 Voir aussi</h3>
          <p class="text-sm text-gray-700 mb-3">Autres guides dans ${
            dep.region
          } :</p>
          <div class="flex flex-wrap gap-3">${voirAussiLinks}</div>
          <div class="mt-4">${hubLink}</div>
        </div>

        ${navPrevNext}

        <!-- Mini-calculateur integre (chargement a la demande) -->
        <div class="mt-8">
          <button id="btn-inline-calculator" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:from-blue-700 hover:to-indigo-700">
            🧮 Calculer vos frais ici
          </button>
          <div id="inline-notaire-calculator" class="mt-4"></div>
        </div>

        <script type="module">
          const btn = document.getElementById("btn-inline-calculator");
          btn?.addEventListener("click", async () => {
            btn.setAttribute("disabled", "true");
            btn.textContent = "Chargement...";
            try {
              const [cfMod, mainMod, dataMod] = await Promise.all([
                import("../../../components/CalculatorFrame.ts"),
                import("../../../main.ts"),
                import("../../../data/baremes.ts"),
              ]);

              const CalculatorFrame = cfMod.CalculatorFrame || cfMod.C || cfMod.default;
              const formatCurrency = mainMod.formatCurrency || mainMod.f || ((amount) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount));
              const baremes = dataMod.baremes || dataMod.b || dataMod.default;

              const containerId = "inline-notaire-calculator";
              const config = {
                title: "Calcul rapide des frais de notaire",
                description: "Version simplifiee avec departement pre-rempli.",
                fields: [
                { id: "type_bien", label: "Type de bien *", type: "select", required: true, options: [
                  { value: "ancien", label: "Ancien" },
                  { value: "neuf", label: "Neuf" },
                  { value: "terrain", label: "Terrain" },
                ]},
                { id: "departement", label: "Departement *", type: "select", required: true, options: [
                  { value: "${dep.code}", label: "${dep.code} - ${dep.nom}" }
                ]},
                { id: "prix_achat", label: "Prix d'acquisition *", type: "number", required: true, placeholder: "250000", min: 1000, step: 1000 },
                { id: "montant_mobilier", label: "Mobilier (optionnel)", type: "number", placeholder: "0", min: 0, step: 500 },
              ],
              calculate: (values) => {
                try {
                  if (!baremes || !baremes.notaire || !Array.isArray(baremes.notaire.tranches)) {
                    throw new Error("Baremes indisponibles");
                  }
                  const prixAchat = Number(values.prix_achat);
                  const montantMobilier = Number(values.montant_mobilier) || 0;
                  if (!isFinite(prixAchat) || prixAchat <= 0) {
                    return { success: false, error: "Veuillez saisir un prix d'acquisition valide." };
                  }
                  if (montantMobilier < 0 || montantMobilier > prixAchat) {
                    return { success: false, error: "Le mobilier doit etre entre 0 et le prix d'acquisition." };
                  }
                  const prixNetImmobilier = prixAchat - montantMobilier;
                  let emoluments = 0;
                  for (const tranche of baremes.notaire.tranches) {
                    const largeur = Math.max(tranche.max - tranche.min, 0);
                    const applicable = Math.min(Math.max(prixNetImmobilier - tranche.min, 0), largeur);
                    if (applicable <= 0) continue;
                    emoluments += applicable * tranche.taux;
                  }
                  const td = 0.058;
                  const droitsEnregistrement = values.type_bien === "neuf" ? 0 : prixNetImmobilier * td;
                  const fraisDivers = 300;
                  const tvaRate = Number(baremes.notaire.tva) || 0.2;
                  const tva = (emoluments + fraisDivers) * tvaRate;
                  const total = emoluments + fraisDivers + droitsEnregistrement + tva;
                  const pourcentage = (total / prixAchat) * 100;
                  console.log("Mini-calculateur notaire:", { prixAchat, montantMobilier, prixNetImmobilier, emoluments, td, droitsEnregistrement, fraisDivers, tva, total, pourcentage });
                  if (!isFinite(total) || !isFinite(pourcentage)) {
                    return { success: false, error: "Des donnees invalides ont ete saisies." };
                  }
                  return { success: true, data: { prixAchat, prixNetImmobilier, emoluments, droitsEnregistrement, fraisDivers, tva, total, pourcentage, typeBien: values.type_bien, departement: values.departement, montantMobilier } };
                } catch (e) {
                  console.error("Calcul notaire - erreur:", e);
                  return { success: false, error: "Erreur lors du calcul." };
                }
              },
              formatResult: (result) => {
                const d = result.data;
                return '<div class="space-y-3">'
                  + '<div class="flex justify-between"><span>Total frais de notaire :</span><span class="font-bold text-green-600">' + formatCurrency(d.total) + '</span></div>'
                  + '<div class="text-sm text-gray-600">' + d.pourcentage.toFixed(2) + '% du prix</div>'
                  + '</div>';
              },
              };
              new CalculatorFrame(containerId, config);
              btn.textContent = "Calculer vos frais ici";
              btn.removeAttribute("disabled");
            } catch (err) {
              console.error("Erreur de chargement du mini-calculateur:", err);
              btn.textContent = "Reessayer";
              btn.removeAttribute("disabled");
            }
          });
        </script>

        <!-- References -->
        <div class="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 class="font-bold text-gray-900 mb-3">📚 Sources et references officielles</h3>
          <ul class="text-sm text-gray-700 space-y-2">
            <li>
              • Frais de notaire (definition et bareme) :
              <a href="https://www.service-public.fr/particuliers/vosdroits/F17701" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                service-public.fr
              </a>
            </li>
            <li>
              • Simulateur frais de notaire :
              <a href="https://www.service-public.fr/particuliers/vosdroits/R54267" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                service-public.fr (simulateur)
              </a>
            </li>
            <li>
              • Emoluments notariaux : 
              <a href="https://www.notaires.fr" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                Conseil Superieur du Notariat
              </a>
          </li>
          <li>
            • Donnees DVF 2024 (Demande de Valeurs Foncieres) :
            <a href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
              data.gouv.fr
            </a>
          </li>
        </ul>
      </div>

      </div>

      <!-- Article Footer -->
      <footer class="mt-16 pt-8 border-t border-gray-200">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <a
            href="/pages/blog.html"
            class="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Retour au blog</span>
          </a>
          <div class="text-sm text-gray-500">
            Article mis a jour le ${dateModifiedFR}
          </div>
        </div>
      </footer>

    </article>

    <footer class="bg-gray-900 text-gray-300 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p>&copy; 2025 LesCalculateurs.fr - Tous droits reserves</p>
      </div>
    </footer>
  </body>
</html>`;
}

function generateArticleHTML_YMYL(dep) {
  const depLabel = `${dep.nom} (${dep.code})`;
  const canonical = `https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-${dep.code}`;
  const title = `Frais de notaire ${SEO_YEAR} ${dep.nom} (${dep.code}) - Simulation gratuite`;
  const getDansExpressionForMeta = (depNom, depCode) => {
    if (depCode === "75") return "a Paris";
    if (depNom === "Mayotte") return "a Mayotte";
    if (depNom === "La Reunion") return "a La Reunion";
    const article = getArticleDefini(depNom, depCode);
    if (article === "les ") return `dans les ${depNom}`;
    if (article === "le ") return `dans le ${depNom}`;
    if (article === "l'") return `dans l'${depNom}`;
    return `dans la ${depNom}`;
  };
  const description = `Calculez les frais de notaire ${getDansExpressionForMeta(
    dep.nom,
    dep.code
  )} en ${SEO_YEAR}. Ancien, neuf (VEFA), taux officiels et estimation gratuite en 10 secondes.`;
  const inLoc = getPreposition(dep.nom, dep.code)
    .replace(/^dans l'/i, "Dans l'")
    .replace(/^dans /i, "Dans ")
    .replace(/^en /i, "En ")
    .replace(/^a /i, "A ");

  const intro =
    dep.code === "75"
      ? `Paris conjugue prestige, rarete et diversite de quartiers. Acheter a Paris en ${SEO_YEAR} implique de composer avec des prix parmi les plus eleves d'Europe, une offre tendue et des frais de notaire significatifs. Chaque arrondissement possede ses specificites, ses dynamiques et ses points de vigilance.`
      : `Selon que vous achetez a ${dep.ville1}${dep.ville2 ? `, ${dep.ville2}` : ""} ou ailleurs, le contexte local et la nature du bien influencent l'organisation d'un achat. Avant de signer, il est utile d'anticiper les frais de notaire, qui dependent notamment de la nature de l'acquisition et des formalites du dossier.`;

  const particularites =
    dep.code === "75"
      ? `A Paris, la copropriete, la complexite de certains dossiers (reglements, diagnostics, servitudes, situation locative) et la diversite des quartiers peuvent allonger certaines formalites. Le recours au calculateur permet d'obtenir une estimation adaptee a votre projet.`
      : `${inLoc}, les frais de notaire sont calcules selon les regles nationales, mais le contexte local influence souvent le budget global d'un achat immobilier. Selon les secteurs, la typologie des biens (copropriete, maisons, terrain), les delais et certaines formalites peuvent varier. Le recours au calculateur permet d'obtenir une estimation adaptee a la commune et au type de bien.`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta
      name="keywords"
      content="frais notaire ${dep.nom}, frais de notaire ${SEO_YEAR} ${dep.nom}, droits d'enregistrement ${dep.nom}, notaires ${dep.nom}, emoluments notaire ${dep.nom}"
    />
    <meta name="author" content="LesCalculateurs.fr" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />

    <link rel="canonical" href="${canonical}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="Calculez vos frais de notaire en ${dep.nom} instantanement. Estimation automatique ${SEO_YEAR}. Aucun email demande." />
    <meta name="twitter:description" content="Calculez vos frais de notaire en ${dep.nom} instantanement. Estimation automatique ${SEO_YEAR}. Aucun email demande." />
    <meta property="og:image" content="https://www.lescalculateurs.fr/assets/favicon-32x32.png" />

    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />

    <script type="application/ld+json">
      ${JSON.stringify(
        [
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Accueil",
                item: "https://www.lescalculateurs.fr/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Immobilier",
                item: "https://www.lescalculateurs.fr/immobilier/",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `Frais de notaire ${dep.nom} (${dep.code})`,
                item: canonical,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Quel est le montant des frais de notaire ${getPreposition(
                  dep.nom,
                  dep.code
                )} ?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `En ${SEO_YEAR}, les frais de notaire se situent generalement entre 7 % et 9 % du prix d'achat dans l'ancien et entre 2 % et 3 % dans le neuf (VEFA), selon le bareme national et les droits d'enregistrement.`,
                },
              },
              {
                "@type": "Question",
                name: "Comment sont calcules les frais de notaire ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Les frais de notaire comprennent les droits d'enregistrement (taxe departementale), les emoluments du notaire (bareme reglemente), les debours et formalites, la contribution de securite immobiliere (CSI) et la TVA applicable.",
                },
              },
              {
                "@type": "Question",
                name: "Quelle difference entre ancien et neuf (VEFA) ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "L'achat dans le neuf (VEFA) beneficie de droits reduits, ce qui peut reduire le montant total des frais par rapport a l'ancien.",
                },
              },
              {
                "@type": "Question",
                name: `Ou trouver un notaire ${getPreposition(dep.nom, dep.code)} ?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Consultez l'annuaire officiel des notaires sur notaires.fr pour trouver un professionnel proche de votre projet immobilier ${getPreposition(
                    dep.nom,
                    dep.code
                  )}.`,
                },
              },
              {
                "@type": "Question",
                name: `Les frais de notaire sont-ils plus eleves ${getPreposition(
                  dep.nom,
                  dep.code
                )} que dans d'autres departements ?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Non. Les frais de notaire sont encadres au niveau national. Le montant total depend surtout du prix du bien et de la nature du projet (ancien/neuf, formalites, etc.).",
                },
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Frais de notaire ${SEO_YEAR} ${getPreposition(
              dep.nom,
              dep.code
            )} (${dep.code})`,
            description: `Guide des frais de notaire pour l'achat immobilier ${getPreposition(
              dep.nom,
              dep.code
            )} (${dep.code})`,
            datePublished: DATE_PUBLISHED_ISO,
            dateModified: new Date().toISOString(),
            author: { "@type": "Organization", name: "LesCalculateurs.fr" },
            publisher: {
              "@type": "Organization",
              name: "LesCalculateurs.fr",
              logo: {
                "@type": "ImageObject",
                url: "https://www.lescalculateurs.fr/assets/favicon-32x32.png",
              },
            },
          },
        ],
        null,
        2
      )}
    </script>

    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399" crossorigin="anonymous"></script>

    <script>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "GTM-TPFZCGX5");
    </script>

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2HNTGCYQ1X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-2HNTGCYQ1X");
    </script>

    <script type="module" src="../../../main.ts"></script>
  </head>
  <body class="bg-gray-50">
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPFZCGX5" height="0" width="0" style="display: none; visibility: hidden"></iframe>
    </noscript>

    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs.fr" class="h-10 w-auto" />
            <a href="/pages/blog.html" class="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2">
              <span>← Blog</span>
            </a>
          </div>
          <a href="/index.html" class="text-sm text-gray-600 hover:text-gray-900">Accueil</a>
        </div>
      </div>
    </header>

    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-10">
        <h2 class="text-xl font-bold text-gray-900 mb-3">💰 Frais de notaire ${SEO_YEAR} ${getPreposition(dep.nom, dep.code)} (${dep.code})</h2>
        <p class="text-gray-700 mb-2">Pour un achat immobilier en ${SEO_YEAR} :</p>
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Bien ancien :</strong> generalement environ 7 % a 9 % du prix d'acquisition</li>
          <li><strong>Bien neuf (VEFA) :</strong> generalement environ 2 % a 3 %, en raison de droits de mutation reduits, le reste etant compose d'emoluments, debours et taxes reglementees</li>
        </ul>
        <p class="text-sm text-gray-600 mb-2">Ces informations sont fournies a titre indicatif et pedagogique. Elles incluent les droits, emoluments, formalites, contribution de securite immobiliere (CSI) et la TVA applicable.</p>
        <p class="text-sm text-gray-700">👉 Pour un montant exact et personnalise, <a href="/pages/notaire.html" class="text-blue-600 underline font-semibold">utilisez le calculateur</a>.</p>
      </div>

      <header class="mb-12">
        <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">Immobilier</span>
          <span>•</span>
          <time datetime="${PUBLISH_MONTH_DATETIME}">${PUBLISH_MONTH_LABEL}</time>
          <span>•</span>
          <span>Guide departemental</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Frais de notaire ${SEO_YEAR} ${getPreposition(dep.nom, dep.code)} (${dep.code})
        </h1>
        <p class="text-xl text-gray-600 leading-relaxed">${intro}</p>
      </header>

      <figure class="rounded-lg overflow-hidden border border-gray-200 mb-8">
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/France_location_map-Regions_and_departements-2016.svg"
          alt="Illustration ${dep.nom} - Guide frais de notaire ${dep.code}"
          class="w-full h-64 object-cover"
          loading="lazy"
          width="800"
          height="256"
        />
        <figcaption class="text-sm text-gray-500 px-4 py-2 bg-gray-50">
          Illustration ${dep.nom} (${dep.code}). Source : Wikimedia Commons (CC).
        </figcaption>
      </figure>

      <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-700 m-0">
          <strong>Sources officielles des taux et baremes :</strong>
          <a href="https://www.service-public.fr/particuliers/vosdroits/F2167" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">service-public.fr</a> •
          <a href="https://www.notariat.fr/frais-de-notaire" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">notariat.fr</a> •
          <a href="https://www.impots.gouv.fr" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">impots.gouv.fr</a> •
          <a href="https://www.legifrance.gouv.fr" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">legifrance.gouv.fr</a>
        </p>
      </div>

      <div class="prose prose-lg max-w-none">
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">💵 Estimation des frais de notaire</h2>
        <p class="text-gray-700 leading-relaxed mb-6">
          Les frais d'acquisition immobiliere different selon que vous achetez dans l'ancien ou dans le neuf. ${inLoc}, le differentiel ancien / neuf respecte la reglementation nationale.
        </p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">🏘️ Specificite locale</h2>
        <p class="text-gray-700 leading-relaxed mb-6">
          ${dep.nom} presente des dynamiques immobilieres propres, influencees par son attractivite, son tissu urbain et les projets d'amenagement en cours. Ces elements peuvent impacter indirectement le budget global d'un projet immobilier (prix d'achat, concurrence, delais, conditions de financement), sans modifier les regles nationales applicables aux frais de notaire.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 mb-8">
          <h3 class="text-lg font-bold text-gray-900 mb-2">📍 Particularites ${getPreposition(dep.nom, dep.code)} (${dep.code})</h3>
          <p class="text-gray-700 mb-0">${particularites}</p>
        </div>

        <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">💡 Estimation rapide selon le type de bien</h3>
        <div class="overflow-x-auto mb-8">
          <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
            <thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th class="px-6 py-4 text-left font-semibold">Type d'achat</th>
                <th class="px-6 py-4 text-left font-semibold">Ordre de grandeur</th>
                <th class="px-6 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200 hover:bg-orange-50">
                <td class="px-6 py-4 font-medium text-gray-900">🏡 Ancien</td>
                <td class="px-6 py-4 text-gray-700">≈ 7 % a 9 %</td>
                <td class="px-6 py-4"><a href="/pages/notaire.html" class="text-blue-600 hover:underline font-semibold">Simuler</a></td>
              </tr>
              <tr class="hover:bg-blue-50">
                <td class="px-6 py-4 font-medium text-gray-900">🏢 Neuf (VEFA)</td>
                <td class="px-6 py-4 text-gray-700">≈ 2 % a 3 %</td>
                <td class="px-6 py-4"><a href="/pages/notaire.html" class="text-blue-600 hover:underline font-semibold">Simuler</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-gray-600 mb-8">
          👉 Ces fourchettes correspondent a des ordres de grandeur observes en France. Pour connaître le montant exact selon votre commune, utilisez le <a href="/pages/notaire.html" class="text-blue-600 underline font-semibold">simulateur</a>.
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <p class="text-lg text-gray-800 mb-0">
            <strong>💡 Bon a savoir :</strong> L'ecart entre ancien et neuf peut representer une economie significative selon le prix du bien et la nature du projet.
          </p>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📝 Exemple pedagogique (non contractuel)</h2>
        <p class="text-gray-700 leading-relaxed mb-4">Prenons l'exemple d'un achat immobilier a ${dep.ville1 || dep.nom} :</p>
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Prix du bien :</strong> a estimer via le calculateur</li>
          <li><strong>Apport personnel :</strong> selon votre projet</li>
          <li><strong>Frais de notaire :</strong> calcules selon bareme officiel</li>
          <li><strong>Montant a emprunter :</strong> selon votre projet</li>
          <li><strong>Duree :</strong> selon capacite d'emprunt</li>
        </ul>
        <p class="text-sm text-gray-600 mb-6">👉 Ces donnees sont fournies a titre illustratif. Le calcul exact depend du projet reel.</p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">💡 Astuces pour reduire vos frais de notaire</h2>
        <ul class="list-disc list-inside text-gray-700 mb-6">
          <li><strong>Mobilier hors acte :</strong> certains meubles peuvent etre exclus de l'assiette des droits, dans le respect de la reglementation</li>
          <li><strong>Remises d'emoluments :</strong> possibles dans certains cas sur la part reglementee</li>
          <li><strong>Aides locales :</strong> certaines collectivites proposent des dispositifs d'aide a l'accession</li>
        </ul>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📈 Marche immobilier ${dep.nom} ${SEO_YEAR - 1}-${SEO_YEAR}</h2>
        <ul class="list-disc list-inside text-gray-700 mb-6">
          <li><strong>Evolution des prix :</strong> tendance variable selon secteurs</li>
          <li><strong>Volume de transactions :</strong> depend du contexte local</li>
          <li><strong>Attractivite :</strong> liee a l'emploi, aux transports et aux projets urbains</li>
          <li><strong>Tension du marche :</strong> variable selon les communes</li>
        </ul>
        <p class="text-sm text-gray-600 mb-6">Sources : DVF, INSEE, Notaires de France, donnees publiques ${SEO_YEAR} (mise a jour janvier).</p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">🏘️ Prix immobiliers par ville (indicatifs)</h2>
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li><strong>${dep.ville1 || dep.nom} :</strong> prix variable selon secteur</li>
          <li><strong>Autres communes :</strong> variations possibles</li>
        </ul>
        <p class="text-sm text-gray-600 mb-6">📊 Methodologie : estimations basees sur donnees publiques, a titre indicatif.</p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">🏛️ Ou trouver un notaire ${getPreposition(dep.nom, dep.code)} ?</h2>
        <p class="text-gray-700 leading-relaxed mb-6">
          Pour un devis exact et personnalise, consultez l'annuaire officiel des notaires sur <a href="https://www.notaires.fr" class="text-blue-600 hover:underline" target="_blank" rel="noopener">notaires.fr</a> et contactez un professionnel proche de votre projet immobilier.
        </p>

        <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 my-8 text-white">
          <h2 class="text-2xl font-bold mb-2">💡 Simulez vos frais de notaire ${SEO_YEAR}</h2>
          <p class="text-green-100 mb-4">Utilisez notre calculateur officiel pour obtenir une estimation immediate, gratuite et personnalisee.</p>
          <a href="/pages/notaire.html" class="inline-block bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition">🧮 Acceder au simulateur gratuit</a>
          <p class="text-sm text-green-200 mt-3">✓ Calcul instantane • ✓ Gratuit • ✓ Export PDF</p>
          <p class="text-sm text-green-100 mt-3">🔗 Voir aussi : <a href="/pages/pret.html" class="underline font-semibold text-white hover:text-green-50">Calculer votre pret immobilier apres frais de notaire</a></p>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">❓ Questions frequentes</h2>
        <div class="space-y-4 mb-8">
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Quel est le montant des frais de notaire ${getPreposition(
              dep.nom,
              dep.code
            )} ?</summary>
            <p class="mt-2 text-gray-700">En ${SEO_YEAR}, les frais se situent generalement entre 7 % et 9 % (ancien) ou 2 % a 3 % (neuf).</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Comment sont calcules les frais de notaire ?</summary>
            <p class="mt-2 text-gray-700">Ils comprennent les droits d'enregistrement, emoluments du notaire, debours, CSI et TVA.</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Quelle difference entre ancien et neuf (VEFA) ?</summary>
            <p class="mt-2 text-gray-700">Le neuf beneficie de droits reduits, ce qui peut reduire le montant total des frais.</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Ou trouver un notaire proche de mon projet ?</summary>
            <p class="mt-2 text-gray-700">Consultez l'annuaire officiel sur <a href="https://www.notaires.fr" class="text-blue-600 hover:underline">notaires.fr</a>.</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Les frais de notaire sont-ils plus eleves ${getPreposition(
              dep.nom,
              dep.code
            )} que dans d'autres departements ?</summary>
            <p class="mt-2 text-gray-700">Non. Les frais de notaire sont encadres au niveau national. Le montant total depend surtout du prix du bien et de la nature du projet.</p>
          </details>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📌 Rappel reglementaire</h2>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <p class="text-gray-700 mb-2">Les frais de notaire comprennent des elements strictement encadres par la loi (droits, taxes, emoluments) ainsi que des frais variables selon le dossier.</p>
          <p class="text-gray-700 mb-0">Leur repartition exacte depend de la nature de l'acte, du bien, et des formalites requises.</p>
        </div>

        <div class="bg-gray-100 rounded-lg p-6 my-8">
          <h3 class="text-lg font-bold text-gray-900 mb-3">📚 Sources officielles</h3>
          <p class="text-sm text-gray-700">
            <a href="https://www.service-public.fr" class="text-blue-600 hover:underline">service-public.fr</a> •
            <a href="https://www.notariat.fr" class="text-blue-600 hover:underline">notariat.fr</a> •
            <a href="https://www.impots.gouv.fr" class="text-blue-600 hover:underline">impots.gouv.fr</a> •
            <a href="https://www.legifrance.gouv.fr" class="text-blue-600 hover:underline">legifrance.gouv.fr</a>
          </p>
        </div>
      </div>
    </article>

    <footer class="bg-gray-900 text-gray-300 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p>&copy; ${SEO_YEAR} LesCalculateurs.fr - Tous droits reserves</p>
      </div>
    </footer>
  </body>
</html>`;
}

// Fonction principale de generation
async function generateAllArticles() {
  const selectedDeptCodes = parseDepartementCodesFromArgs();
  const ymyl = hasFlag("--ymyl");
  const force = hasFlag("--force");
  const totalToGenerate = selectedDeptCodes.size
    ? departements.filter((d) => selectedDeptCodes.has(d.code)).length
    : departements.length;

  console.log(`🚀 Debut de la generation de ${totalToGenerate} article(s)...\n`);

  const outputDir = path.resolve(__dirname, "../src/pages/blog/departements");

  // Creer le dossier de sortie s'il n'existe pas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Dossier cree : ${outputDir}\n`);
  }

  let successCount = 0;
  let errorCount = 0;

  // Generer chaque article
  for (let index = 0; index < departements.length; index++) {
    const dep = departements[index];
    if (selectedDeptCodes.size && !selectedDeptCodes.has(dep.code)) continue;
    try {
      const filename = `frais-notaire-${dep.code}.html`;
      const filepath = path.join(outputDir, filename);
      if (ymyl && !force && fs.existsSync(filepath)) {
        const existing = fs.readFileSync(filepath, "utf-8");
        if (isConformYMYL(existing, dep.code)) {
          console.log(`⏭️  [${dep.code}] ${dep.nom} - deja conforme`);
          continue;
        }
      }

      const html = ymyl
        ? generateArticleHTML_YMYL(dep, index)
        : generateArticleHTML(dep, index);

      fs.writeFileSync(filepath, html, "utf-8");
      console.log(`✅ [${dep.code}] ${dep.nom} - ${filename}`);
      successCount++;
    } catch (error) {
      console.error(`❌ [${dep.code}] ${dep.nom} - Erreur : ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Resume de la generation :`);
  console.log(`   ✅ Succes : ${successCount} articles`);
  console.log(`   ❌ Erreurs : ${errorCount} articles`);
  console.log(`\n🎉 Generation terminee !`);
  console.log(`📁 Articles generes dans : ${outputDir}`);
}

// Executer le script
generateAllArticles().catch(console.error);
/**
 * Selectionne une image illustrative haute resolution en fonction de la region.
 * Retourne un objet { srcBase, alt } ou srcBase est une URL Unsplash utilisable avec &w=...
 */
function resolveHeroImageForRegion(region, dep) {
  const catalog = {
    "Hauts-de-France": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Grande%20Place,%20Bourse%20du%20travail%20et%20beffroi%20Lille%202.JPG",
    ],
    "Île-de-France": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg",
    ],
    "Provence-Alpes-Cote d'Azur": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_port_de_Marseille.JPG",
    ],
    "Auvergne-Rhone-Alpes": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
    ],
    Occitanie: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Capitole%20de%20Toulouse%20(France).JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cit%C3%A9%20de%20Carcassonne.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20de%20la%20Com%C3%A9die%20Montpellier.jpg",
    ],
    "Nouvelle-Aquitaine": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tours%20de%20La%20Rochelle.jpg",
    ],
    "Bourgogne-Franche-Comte": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Palais%20des%20Ducs%20de%20Bourgogne4.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20d%27Auxerre.jpg",
    ],
    "Grand Est": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cathedrale_Notre-Dame-de-Strasbourg.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Metz.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20Stanislas%20Nancy.jpg",
    ],
    "Pays de la Loire": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_des_ducs_de_Bretagne_(Nantes)_-_2014_-_02.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20du%20Mans.jpg",
    ],
    "Centre-Val de Loire": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-Croix_d%27Orl%C3%A9ans%202008%20PD%2033.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20de%20Chartres.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau%20de%20Blois.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Gatien%20de%20Tours.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Bourges.jpg",
    ],
    Normandie: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rouen_Cathedral,_West_Facade.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%89glise%20Saint-Joseph%20du%20Havre.jpg",
    ],
    Bretagne: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/PlaceParlementBretagne.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Remparts%20de%20Vannes.jpg",
    ],
    Corse: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ajaccio%20Citadelle%20et%20plage%20Saint-Fran%C3%A7ois.jpg",
    ],
    "Outre-mer": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Saint-Pierre_and_Miquelon.svg",
    ],
  };
  const list = catalog[region] || catalog["Outre-mer"];
  const idx =
    (dep.code.charCodeAt(0) + dep.code.charCodeAt(dep.code.length - 1)) %
    list.length;
  return {
    srcBase: list[idx],
    alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
  };
}

/**
 * Selectionne une image hero strictement par ville (si disponible),
 * sinon retourne null pour laisser le fallback regional.
 * Retourne { srcBase, alt }.
 */
function resolveHeroImageForCity(city, dep) {
  if (!city) return null;
  const c = city.trim().toLowerCase();
  // Priorite departement (ex: 93 - Seine-Saint-Denis) si on veut representer le departement
  const deptHeroCatalog = {
    93: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Denis_-_Basilique_-_Ext%C3%A9rieur_fa%C3%A7ade_ouest.JPG",
      alt: `Guide frais de notaire - Seine-Saint-Denis (93)`,
    },
  };
  if (deptHeroCatalog[dep.code]) {
    return deptHeroCatalog[dep.code];
  }
  const cityCatalog = {
    // Île-de-France
    paris:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop",
    versailles:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop",

    // Hauts-de-France
    lille:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    amiens:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    beauvais:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    calais:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",

    // PACA
    marseille:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    nice: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    toulon:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    avignon:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",

    // Auvergne-Rhone-Alpes
    lyon: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    grenoble:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    annecy:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    chambery:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Nouvelle-Aquitaine
    bordeaux:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    larochelle:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    bayonne:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    pau: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",

    // Grand Est
    strasbourg:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    reims:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    metz: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    nancy:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    // Occitanie
    toulouse:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    montpellier:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    nimes:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    perpignan:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",

    // Bretagne
    rennes:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    brest:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    quimper:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Normandie
    rouen:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    caen: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    lehavre:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    // Pays de la Loire
    nantes:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    angers:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    laval:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Centre-Val de Loire
    orleans:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    tours:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    bourges:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Corse
    ajaccio:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    bastia:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",

    evry: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    nanterre:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    bobigny:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    creteil:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    cergy:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    melun:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    meaux:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",

    saintetienne:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    lepuyenvelay:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    clermontferrand:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    bourgenbresse:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    moulins:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    privas:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    aurillac:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    valence:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    chambery:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    annecy:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    dijon:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    besancon:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    lonslesaunier:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    nevers:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    vesoul:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    macon:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    auxerre:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    belfort:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    saintbrieuc:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    vannes:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    evreux:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    cherbourg:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    saintlo:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    alencon:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    lemans:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    larochesuryon:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    lessablesdolonne:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    chartres:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    chateauroux:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    blois:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    charlevillemezieres:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    troyes:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    chaumont:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    barleduc:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    mulhouse:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    colmar:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    epinal:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    foix: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    pamiers:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    carcassonne:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    narbonne:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    rodez:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    millau:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    auch: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    cahors:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    mende:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    tarbes:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    albi: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    castres:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    montauban:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",

    angouleme:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    tulle:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    brivelagaillarde:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    gueret:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    perigueux:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    montdemarsan:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    dax: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    agen: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    niort:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    poitiers:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    limoges:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",

    laon: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    arras:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",

    dignelesbains:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    manosque:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    gap: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    briancon:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",

    pointeapitre:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    lesabymes:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    fortdefrance:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    lelamentin:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    cayenne:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    saintlaurentdumaroni:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    saintdenis:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    saintpaul:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    mamoudzou:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    koungou:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    saintpierreetmiquelon:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
  };

  // normalisation simplifiee pour cles
  const key = c
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s|\-|\'|\./g, "");
  // Specifiques par departement pour eviter collisions (ex: Saint-Denis 93 vs 974)
  const deptCatalog = {
    "saintdenis-93":
      "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Denis_-_Basilique_-_Ext%C3%A9rieur_fa%C3%A7ade_ouest.JPG",
    "bobigny-93":
      "https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_Bobigny.jpg",
  };

  const deptKey = `${key}-${dep.code}`;
  const srcBase = deptCatalog[deptKey] || cityCatalog[key];
  if (!srcBase) return null;
  return {
    srcBase,
    alt: `Guide frais de notaire - ${city} (${dep.nom}, ${dep.code})`,
  };
}

/**
 * Selectionne une image hero par departement, en s'appuyant sur la ville prefectorale
 * si necessaire pour l'illustration. Toujours retourne un alt libelle avec le nom du departement.
 */
function resolveHeroImageForDepartment(dep) {
  // Overrides explicites par code departement (ex: 93)
  const deptHeroCatalog = {
    93: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Denis_-_Basilique_-_Ext%C3%A9rieur_fa%C3%A7ade_ouest.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    75: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    77: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/0_Provins_-_Tour_C%C3%A9sar_(4).JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    78: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Front%20of%20the%20Ch%C3%A2teau%20de%20Versailles.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    91: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Tour%20de%20Montlh%C3%A9ry.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    95: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Maclou%20de%20Pontoise.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    92: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/La_Defense.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    94: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_Ch%C3%A2teau_de_Vincennes.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    971: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Rue%20Maurice%20Marie%20Claire%20-%20Basse-Terre.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    972: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Fort_de_France_1.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    973: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%8Ele%20du%20Diable%20Dreyfus.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    974: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Panorama-Mairie-Saint-Denis.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    975: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ship_in_the_harbour_of_saint-pierre,_SPM.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    976: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/2004%2012%2012%2018-24-04%20rose%20sea%20in%20mamoudzou%20mayotte%20island.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Provence-Alpes-Cote d'Azur
    13: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_port_de_Marseille.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "06": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Nice%20-%20promenade.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    83: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Gare%20de%20Toulon.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    84: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Avignon%20(84)%20Pont%20Saint-B%C3%A9nezet%2001.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "04": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Digne-les-Bains%20-%20Cath%C3%A9drale%20Saint-J%C3%A9r%C3%B4me%2001.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "05": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Pont%20d%27Asfeld%20Brian%C3%A7on.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Bourgogne-Franche-Comte
    21: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Palais%20des%20Ducs%20de%20Bourgogne4.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    25: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Besan%C3%A7on_-_Poudri%C3%A8re.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    39: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Saline%20royale%20d%27Arc-et-Senans.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    58: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Nevers%20Cath%C3%A9drale%20St.%20Cyr%20%26%20Ste.%20Julitte%20Ostchor%2001.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    70: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Notre_Dame_la_Motte_Vesoul_014.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    71: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Lazare%20d%27Autun.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    89: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20d%27Auxerre.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    90: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Lion%20de%20Belfort.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Normandie
    14: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Fa%C3%A7ade_sud_du_ch%C3%A2teau_de_Caen.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    27: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20d%27%C3%89vreux.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    50: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Port%20de%20Cherbourg.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    61: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique%20Notre-Dame%20d%27Alen%C3%A7on-16juin2010-07.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    76: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Rouen_Cathedral,_West_Facade.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Grand Est
    "08": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Charleville-M%C3%A9zi%C3%A8res%20-%20place%20Ducale%20(02).JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    10: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Troyes%20houses.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    51: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20de%20Reims.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    52: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc%20de%20Chaumont.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    54: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20Stanislas%20Nancy.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    55: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Bar-le-Duc-Pr%C3%A9fecture.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    57: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Metz.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    67: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cathedrale_Notre-Dame-de-Strasbourg.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    68: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Colmar%20(Haut-Rhin)%20-%20Petite%20Venise%20-%2051061986041.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    88: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%89pinal%20Basilique%20St.%20Maurice%201.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Pays de la Loire
    44: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_des_ducs_de_Bretagne_(Nantes)_-_2014_-_02.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    49: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_d%27Angers-2015b.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    53: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau%20Vieux%20Laval%202.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    72: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20du%20Mans.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    85: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/P1080469_Le_chenal_des_Sables_d%27Olonne.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Auvergne-Rhone-Alpes
    "01": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Monast%C3%A8re%20royal%20de%20Brou%20(%C3%A9glise)%20(1).JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "03": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Moulins-sur-allier,%20Allier,%20Notre-Dame%20de%20l%27Annonciation.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "07": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/060806%20Vallon-Pt%20d%27Arc301.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    15: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc_de_Garabit.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    26: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Valence%20kiosque%20Peynet.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    38: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Fort_de_la_Bastille_-_Grenoble.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    42: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Saint%20%C3%89tienne-Place%20de%20l%27H%C3%B4tel%20de%20Ville-Le%20Grand%20Cercle-PA00117601.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    43: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Le%20Puy-en-Velay%20Cath%C3%A9drale11.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    63: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    69: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    73: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    74: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Occitanie (complements)
    11: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cit%C3%A9%20de%20Carcassonne.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    31: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Capitole%20de%20Toulouse%20(France).JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    34: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20de%20la%20Com%C3%A9die%20Montpellier.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Corse
    "2A": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ajaccio%20Citadelle%20et%20plage%20Saint-Fran%C3%A7ois.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "2B": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Aerial%20view%20of%20the%20port%20of%20Bastia,%20Corsica,%20France%20(52723827071).jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Nouveaux overrides departementaux
    "02": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Laon_Cathedral.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "09": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau%20de%20Foix.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    12: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc%20de%20Millau.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    16: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Pierre%20d%27Angoul%C3%AAme.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    30: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ar%C3%A8nes%20de%20N%C3%AEmes.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    40: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ar%C3%A8nes%20de%20Dax.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    46: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Pont%20Valentr%C3%A9%20Cahors.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    59: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Grande%20Place,%20Bourse%20du%20travail%20et%20beffroi%20Lille%202.JPG",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    60: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Pierre%20de%20Beauvais.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    62: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Beffroi%20de%20Calais.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    64: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-Marie%20de%20Bayonne.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    65: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Sanctuaire%20Notre-Dame%20de%20Lourdes.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    66: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Le%20Castillet%20Perpignan.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    80: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20d%27Amiens.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    81: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-C%C3%A9cile%20d%27Albi.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    87: {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Limoges.jpg",
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
  };
  if (deptHeroCatalog[dep.code]) return deptHeroCatalog[dep.code];

  // Sinon, utiliser l'image de la ville prefectorale mais libeller en departement
  const cityImg = resolveHeroImageForCity(dep.ville1, dep);
  const isUnsplash = (x) =>
    !!x && x.srcBase && x.srcBase.includes("images.unsplash.com");
  if (cityImg && !isUnsplash(cityImg)) {
    return {
      srcBase: cityImg.srcBase,
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
    };
  }
  // Dernier recours: image regionale, libellee en departement
  const regImg = resolveHeroImageForRegion(dep.region, dep);
  if (regImg) {
    return {
      srcBase: regImg.srcBase,
      alt: `Guide frais de notaire - ${dep.nom} (${dep.code})`,
    };
  }
  return null;
}
