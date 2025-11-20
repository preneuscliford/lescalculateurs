/**
 * Script de génération automatique de 101 articles SEO sur les frais de notaire par département
 * Usage: node scripts/generate-departement-articles.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Résout le chemin du fichier DVF 2024.
 * Priorité: env `DVF_PATH` → `../ValeursFoncieres-2024.txt` → chemin absolu projet.
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
 * Charge les statistiques DVF (transactions et ventes immobilières) par commune,
 * de manière synchrone pour les villes ciblées.
 * - Filtre: `Nature mutation = Vente`, année 2024
 * - Transactions uniques: groupées par `Reference document` + `No disposition`
 * - Ventes immobilières: transaction ayant au moins un `Type local` ∈ {Maison, Appartement}
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
        t = { hasImmo: false, value: NaN, typeMaison: false, typeAppartement: false };
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

    // Agrège en comptes
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
      const median = values.length === 0 ? NaN : (values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2);
      finalStats.set(commune, { transactions: total, immobilier: immo, maisons: maisonsOnly, appartements: appartementsOnly, mixtes, median });
    }
    return finalStats;
  } catch (_) {
    return new Map();
  }
}

// Cache des statistiques DVF (initialisation paresseuse)
let DVF_STATS_CACHE = null;

/**
 * Résout les balises d'assets à injecter selon l'environnement.
 * - En développement: injecte le module `main.ts` (Vite charge Tailwind CSS).
 * - En production: lit `dist/manifest.json` pour insérer les fichiers hashés JS/CSS.
 */
const resolveAssetsForEnv = () => {
  try {
    const manifestPath = path.resolve(__dirname, "../dist/manifest.json");
    if (fs.existsSync(manifestPath)) {
      const manifestRaw = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestRaw);
      const mainEntry = manifest["src/main.ts"] || Object.values(manifest).find((m) => m && m.isEntry && Array.isArray(m.css));
      if (mainEntry && mainEntry.file) {
        const jsHref = `/assets/${mainEntry.file.replace(/^assets\//, "")}`;
        const cssHref = (mainEntry.css && mainEntry.css[0]) ? `/assets/${mainEntry.css[0].replace(/^assets\//, "")}` : "";
        const cssTag = cssHref ? `<link rel=\"stylesheet\" crossorigin href=\"${cssHref}\">` : "";
        return `<script type=\"module\" crossorigin src=\"${jsHref}\"></script>${cssTag}`;
      }
    }
  } catch (_) {
    // Fallback dev
  }
  return `<script type=\"module\" src=\"../../../main.ts\"></script>`;
};

/**
 * Formate une date JS en français (ex: "14 novembre 2025").
 */
const formatDateFR = (date) => {
  const mois = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];
  const jour = date.getDate();
  const moisNom = mois[date.getMonth()];
  const annee = date.getFullYear();
  return `${jour} ${moisNom} ${annee}`;
};

// Liste complète des départements français (101)
const departements = [
  {
    code: "01",
    nom: "Ain",
    region: "Auvergne-Rhône-Alpes",
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
    region: "Auvergne-Rhône-Alpes",
    ville1: "Moulins",
    ville2: "Montluçon",
    prixM2: 1400,
  },
  {
    code: "04",
    nom: "Alpes-de-Haute-Provence",
    region: "Provence-Alpes-Côte d'Azur",
    ville1: "Digne-les-Bains",
    ville2: "Manosque",
    prixM2: 2300,
  },
  {
    code: "05",
    nom: "Hautes-Alpes",
    region: "Provence-Alpes-Côte d'Azur",
    ville1: "Gap",
    ville2: "Briançon",
    prixM2: 2800,
  },
  {
    code: "06",
    nom: "Alpes-Maritimes",
    region: "Provence-Alpes-Côte d'Azur",
    ville1: "Nice",
    ville2: "Cannes",
    prixM2: 4800,
  },
  {
    code: "07",
    nom: "Ardèche",
    region: "Auvergne-Rhône-Alpes",
    ville1: "Privas",
    ville2: "Aubenas",
    prixM2: 1900,
  },
  {
    code: "08",
    nom: "Ardennes",
    region: "Grand Est",
    ville1: "Charleville-Mézières",
    ville2: "Sedan",
    prixM2: 1300,
  },
  {
    code: "09",
    nom: "Ariège",
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
    nom: "Bouches-du-Rhône",
    region: "Provence-Alpes-Côte d'Azur",
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
    region: "Auvergne-Rhône-Alpes",
    ville1: "Aurillac",
    ville2: "Saint-Flour",
    prixM2: 1200,
  },
  {
    code: "16",
    nom: "Charente",
    region: "Nouvelle-Aquitaine",
    ville1: "Angoulême",
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
    nom: "Corrèze",
    region: "Nouvelle-Aquitaine",
    ville1: "Tulle",
    ville2: "Brive-la-Gaillarde",
    prixM2: 1500,
  },
  {
    code: "21",
    nom: "Côte-d'Or",
    region: "Bourgogne-Franche-Comté",
    ville1: "Dijon",
    ville2: "Beaune",
    prixM2: 2500,
  },
  {
    code: "22",
    nom: "Côtes-d'Armor",
    region: "Bretagne",
    ville1: "Saint-Brieuc",
    ville2: "Lannion",
    prixM2: 1900,
  },
  {
    code: "23",
    nom: "Creuse",
    region: "Nouvelle-Aquitaine",
    ville1: "Guéret",
    ville2: "Aubusson",
    prixM2: 900,
  },
  {
    code: "24",
    nom: "Dordogne",
    region: "Nouvelle-Aquitaine",
    ville1: "Périgueux",
    ville2: "Bergerac",
    prixM2: 1700,
  },
  {
    code: "25",
    nom: "Doubs",
    region: "Bourgogne-Franche-Comté",
    ville1: "Besançon",
    ville2: "Montbéliard",
    prixM2: 2100,
  },
  {
    code: "26",
    nom: "Drôme",
    region: "Auvergne-Rhône-Alpes",
    ville1: "Valence",
    ville2: "Montélimar",
    prixM2: 2200,
  },
  {
    code: "27",
    nom: "Eure",
    region: "Normandie",
    ville1: "Évreux",
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
    nom: "Finistère",
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
    ville2: "Alès",
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
    ville2: "Mérignac",
    prixM2: 3800,
  },
  {
    code: "34",
    nom: "Hérault",
    region: "Occitanie",
    ville1: "Montpellier",
    ville2: "Béziers",
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
    ville1: "Châteauroux",
    ville2: "Issoudun",
    prixM2: 1200,
  },
  {
    code: "37",
    nom: "Indre-et-Loire",
    region: "Centre-Val de Loire",
    ville1: "Tours",
    ville2: "Joué-lès-Tours",
    prixM2: 2400,
  },
  {
    code: "38",
    nom: "Isère",
    region: "Auvergne-Rhône-Alpes",
    ville1: "Grenoble",
    ville2: "Vienne",
    prixM2: 2700,
  },
  {
    code: "39",
    nom: "Jura",
    region: "Bourgogne-Franche-Comté",
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
    region: "Auvergne-Rhône-Alpes",
    ville1: "Saint-Étienne",
    ville2: "Roanne",
    prixM2: 1600,
  },
  {
    code: "43",
    nom: "Haute-Loire",
    region: "Auvergne-Rhône-Alpes",
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
    ville1: "Orléans",
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
    nom: "Lozère",
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
    ville2: "Saint-Lô",
    prixM2: 1800,
  },
  {
    code: "51",
    nom: "Marne",
    region: "Grand Est",
    ville1: "Reims",
    ville2: "Châlons-en-Champagne",
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
    ville2: "Vandœuvre-lès-Nancy",
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
    nom: "Nièvre",
    region: "Bourgogne-Franche-Comté",
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
    ville2: "Compiègne",
    prixM2: 2100,
  },
  {
    code: "61",
    nom: "Orne",
    region: "Normandie",
    ville1: "Alençon",
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
    nom: "Puy-de-Dôme",
    region: "Auvergne-Rhône-Alpes",
    ville1: "Clermont-Ferrand",
    ville2: "Riom",
    prixM2: 1900,
  },
  {
    code: "64",
    nom: "Pyrénées-Atlantiques",
    region: "Nouvelle-Aquitaine",
    ville1: "Pau",
    ville2: "Bayonne",
    prixM2: 2600,
  },
  {
    code: "65",
    nom: "Hautes-Pyrénées",
    region: "Occitanie",
    ville1: "Tarbes",
    ville2: "Lourdes",
    prixM2: 1600,
  },
  {
    code: "66",
    nom: "Pyrénées-Orientales",
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
    nom: "Rhône",
    region: "Auvergne-Rhône-Alpes",
    ville1: "Lyon",
    ville2: "Villeurbanne",
    prixM2: 3900,
  },
  {
    code: "70",
    nom: "Haute-Saône",
    region: "Bourgogne-Franche-Comté",
    ville1: "Vesoul",
    ville2: "Lure",
    prixM2: 1300,
  },
  {
    code: "71",
    nom: "Saône-et-Loire",
    region: "Bourgogne-Franche-Comté",
    ville1: "Mâcon",
    ville2: "Chalon-sur-Saône",
    prixM2: 1600,
  },
  {
    code: "72",
    nom: "Sarthe",
    region: "Pays de la Loire",
    ville1: "Le Mans",
    ville2: "La Flèche",
    prixM2: 1900,
  },
  {
    code: "73",
    nom: "Savoie",
    region: "Auvergne-Rhône-Alpes",
    ville1: "Chambéry",
    ville2: "Aix-les-Bains",
    prixM2: 2900,
  },
  {
    code: "74",
    nom: "Haute-Savoie",
    region: "Auvergne-Rhône-Alpes",
    ville1: "Annecy",
    ville2: "Thonon-les-Bains",
    prixM2: 4200,
  },
  {
    code: "75",
    nom: "Paris",
    region: "Île-de-France",
    ville1: "Paris",
    ville2: "",
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
    nom: "Deux-Sèvres",
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
    region: "Provence-Alpes-Côte d'Azur",
    ville1: "Toulon",
    ville2: "Hyères",
    prixM2: 3400,
  },
  {
    code: "84",
    nom: "Vaucluse",
    region: "Provence-Alpes-Côte d'Azur",
    ville1: "Avignon",
    ville2: "Carpentras",
    prixM2: 2600,
  },
  {
    code: "85",
    nom: "Vendée",
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
    ville2: "Châtellerault",
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
    ville1: "Épinal",
    ville2: "Saint-Dié-des-Vosges",
    prixM2: 1400,
  },
  {
    code: "89",
    nom: "Yonne",
    region: "Bourgogne-Franche-Comté",
    ville1: "Auxerre",
    ville2: "Sens",
    prixM2: 1500,
  },
  {
    code: "90",
    nom: "Territoire de Belfort",
    region: "Bourgogne-Franche-Comté",
    ville1: "Belfort",
    ville2: "Delle",
    prixM2: 1600,
  },
  {
    code: "91",
    nom: "Essonne",
    region: "Île-de-France",
    ville1: "Évry",
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
    ville1: "Créteil",
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
    ville1: "Pointe-à-Pitre",
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
    nom: "La Réunion",
    region: "La Réunion",
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

// Fonction pour l'élision "de" → "d'" devant voyelle ou H muet
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

// Fonction pour obtenir le verbe "est/sont/offre/offrent" selon le département
const getVerbe = (depNom, verbe) => {
  const pluriels = [
    "Alpes-de-Haute-Provence",
    "Hautes-Alpes",
    "Alpes-Maritimes",
    "Ardennes",
    "Bouches-du-Rhône",
    "Côtes-d'Armor",
    "Landes",
    "Pyrénées-Atlantiques",
    "Hautes-Pyrénées",
    "Pyrénées-Orientales",
    "Deux-Sèvres",
    "Vosges",
    "Yvelines",
  ];

  if (pluriels.includes(depNom)) {
    if (verbe === "est") return "sont";
    if (verbe === "offre") return "offrent";
  }
  return verbe;
};

// Fonction pour obtenir l'article défini selon le département
const getArticleDefini = (depNom, depCode) => {
  // Paris : pas d'article
  if (depCode === "75") return "";

  // Départements pluriels : les
  const pluriels = [
    "Alpes-de-Haute-Provence",
    "Hautes-Alpes",
    "Alpes-Maritimes",
    "Ardennes",
    "Bouches-du-Rhône",
    "Côtes-d'Armor",
    "Landes",
    "Pyrénées-Atlantiques",
    "Hautes-Pyrénées",
    "Pyrénées-Orientales",
    "Deux-Sèvres",
    "Vosges",
    "Yvelines",
  ];
  if (pluriels.includes(depNom)) return "les ";

  // Départements masculins singuliers commençant par une consonne : le
  const masculinsSinguliers = [
    "Bas-Rhin",
    "Haut-Rhin",
    "Calvados",
    "Cantal",
    "Cher",
    "Doubs",
    "Finistère",
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
    "Puy-de-Dôme",
    "Rhône",
    "Tarn",
    "Tarn-et-Garonne",
    "Territoire de Belfort",
    "Val-d'Oise",
    "Val-de-Marne",
    "Var",
    "Vaucluse",
  ];
  if (masculinsSinguliers.includes(depNom)) return "le ";

  // Départements masculins commençant par une voyelle : l'
  const masculinsVoyelle = ["Hérault"];
  if (masculinsVoyelle.includes(depNom)) return "l'";

  // Tous les autres (féminins) : la/l'
  const voyelles = ["A", "E", "I", "O", "U", "H", "Î"];
  if (voyelles.includes(depNom.charAt(0))) return "l'";

  return "la ";
};

// Fonction pour obtenir "du/de la/des/de l'" selon le département
const getDuDeLa = (depNom, depCode) => {
  if (depCode === "75") return "de Paris";

  const article = getArticleDefini(depNom, depCode);
  if (article === "le ") return "du ";
  if (article === "la ") return "de la ";
  if (article === "les ") return "des ";
  if (article === "l'") return "de l'";
  return "de ";
};

// Fonction pour obtenir la préposition correcte selon le département
const getPreposition = (depNom, depCode) => {
  // Paris et villes
  if (depCode === "75") return "à Paris";
  if (depNom === "La Réunion") return "à La Réunion";
  if (depNom === "Mayotte") return "à Mayotte";

  // Départements masculins singuliers commençant par une consonne
  const masculinsSinguliers = [
    "Bas-Rhin",
    "Haut-Rhin",
    "Calvados",
    "Cantal",
    "Cher",
    "Doubs",
    "Finistère",
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
    "Puy-de-Dôme",
    "Rhône",
    "Tarn",
    "Tarn-et-Garonne",
    "Territoire de Belfort",
    "Val-d'Oise",
    "Val-de-Marne",
    "Var",
    "Vaucluse",
  ];
  if (masculinsSinguliers.includes(depNom)) return `dans le ${depNom}`;

  // Départements masculins commençant par une voyelle
  const masculinsVoyelle = ["Hérault"];
  if (masculinsVoyelle.includes(depNom)) return `dans l'${depNom}`;

  // Départements pluriels
  const pluriels = [
    "Alpes-de-Haute-Provence",
    "Hautes-Alpes",
    "Alpes-Maritimes",
    "Ardennes",
    "Bouches-du-Rhône",
    "Côtes-d'Armor",
    "Landes",
    "Pyrénées-Atlantiques",
    "Hautes-Pyrénées",
    "Pyrénées-Orientales",
    "Deux-Sèvres",
    "Vosges",
    "Yvelines",
  ];
  if (pluriels.includes(depNom)) return `dans les ${depNom}`;

  // Tous les autres (départements féminins) : en + nom
  return `en ${depNom}`;
};

// Variantes de contenu pour éviter le duplicate content
const getIntroVariant = (index, depNom, depCode) => {
  const prep = getPreposition(depNom, depCode);
  const variants = [
    `Acheter un bien immobilier ${prep} nécessite d'anticiper les frais de notaire.`,
    `Vous préparez un achat immobilier ${prep} ? Les frais de notaire sont un élément clé de votre budget.`,
    `Projet d'acquisition ${prep} ? Comprendre les frais de notaire est essentiel pour bien budgéter.`,
    `Investir dans l'immobilier ${prep} implique de prévoir les frais de notaire dès le départ.`,
    `Vous envisagez d'acheter ${prep} ? Découvrez comment calculer précisément vos frais de notaire.`,
  ];
  return variants[index % variants.length];
};

const getSectionTitle1Variant = (index, depNom, depCode) => {
  const prep = getPreposition(depNom, depCode);
  const variants = [
    `💰 Montant moyen des frais de notaire ${prep}`,
    `💳 Quel budget prévoir pour les frais de notaire ${prep} ?`,
    `📊 Coût réel des frais de notaire ${prep}`,
    `💵 Estimation des frais de notaire pour ${depNom}`,
    `💰 Frais de notaire 2025 : combien coûte un achat ${prep} ?`,
  ];
  return variants[index % variants.length];
};

const getContextPhraseVariant = (index) => {
  const variants = [
    "Les frais de notaire varient selon le <strong>type de bien acheté</strong> et son prix.",
    "Le montant des frais dépend principalement du <strong>type de logement</strong> et de sa valeur.",
    "Deux facteurs clés déterminent vos frais : le <strong>type de bien</strong> (neuf ou ancien) et son prix.",
    "Les frais d'acquisition immobilière changent selon que vous achetez dans l'<strong>ancien ou le neuf</strong>.",
    "Le calcul des frais varie significativement entre un bien <strong>neuf et un bien ancien</strong>.",
  ];
  return variants[index % variants.length];
};

const getCalculTitleVariant = (index, depNom, ville) => {
  const variants = [
    `📊 Exemple de calcul concret ${
      depNom === "Paris" ? "à Paris" : "en " + depNom
    }`,
    `🏠 Simulation d'achat immobilier ${
      depNom === "Paris" ? "à Paris" : "en " + depNom
    }`,
    `💡 Cas pratique : acheter à ${ville}`,
    `📝 Exemple chiffré pour ${depNom}`,
    `🔢 Calcul détaillé pour un projet ${
      depNom === "Paris" ? "à Paris" : "en " + depNom
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
   * Calcule les émoluments du notaire selon le barème officiel par tranches.
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
      const applicable = Math.min(Math.max(prixNetImmobilier - t.min, 0), largeur);
      if (applicable <= 0) continue;
      total += applicable * t.taux;
    }
    return total;
  }

  /**
   * Renvoie le taux de droits de mutation par département (défaut 4,5%).
   */
  function getTauxMutation(depCode) {
    const map = { "36": 0.038, "38": 0.038, "56": 0.038 };
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

  // Calculs personnalisés selon le prix/m² du département
  const surfaceRef = dep.prixM2 > 4000 ? 50 : dep.prixM2 < 1500 ? 70 : 60;
  const prixExempleAncien = Math.round(dep.prixM2 * surfaceRef);
  const prixExempleNeuf = prixExempleAncien;
  const apport = Math.round(prixExempleAncien * 0.12);
  const fraisAncien = computeFrais("ancien", prixExempleAncien, dep.code);
  const fraisNeuf = computeFrais("neuf", prixExempleNeuf, dep.code);
  const economie = fraisAncien - fraisNeuf;
  const montantEmprunt = prixExempleAncien + fraisAncien - apport;

  // Mensualité approximative (4.2% sur 20 ans)
  const tauxMensuel = 0.042 / 12;
  const nbMois = 20 * 12;
  const mensualite = Math.round(
    (montantEmprunt * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMois))) /
      (Math.pow(1 + tauxMensuel, nbMois) - 1)
  );

  const prix200kAncien = computeFrais("ancien", 200000, dep.code);
  const prix200kNeuf = computeFrais("neuf", 200000, dep.code);

  // Conseil personnalisé selon le prix du marché
  let conseilSpecifique = "";
  if (dep.prixM2 < 1500) {
    conseilSpecifique = `Le marché immobilier ${getDuDeLa(dep.nom, dep.code)}${
      dep.nom
    } est accessible avec un prix moyen de ${dep.prixM2.toLocaleString(
      "fr-FR"
    )} €/m². C'est une opportunité pour les primo-accédants.`;
  } else if (dep.prixM2 < 3000) {
    conseilSpecifique = `Avec un prix moyen de ${dep.prixM2.toLocaleString(
      "fr-FR"
    )} €/m², ${getArticleDefini(dep.nom, dep.code)}${dep.nom} ${getVerbe(
      dep.nom,
      "offre"
    )} un bon équilibre entre qualité de vie et accessibilité.`;
  } else {
    conseilSpecifique = `${
      dep.code === "75"
        ? "Paris"
        : getArticleDefini(dep.nom, dep.code) + dep.nom
    } ${getVerbe(
      dep.nom,
      "est"
    )} un marché premium avec ${dep.prixM2.toLocaleString(
      "fr-FR"
    )} €/m² en moyenne. Les frais de notaire représentent donc un montant conséquent à prévoir.`;
  }

  const ville2HTML = dep.ville2
    ? `<li>• <strong>Étude ${dep.ville2}</strong> : Me Bernard, notaire</li>`
    : "";

  // Voir aussi: liens vers départements de la même région, avec fallback Outre-mer
  const omCodes = ["971", "972", "973", "974", "976"];
  let relatedDeps = departements.filter((d) => d.region === dep.region && d.code !== dep.code);
  if (relatedDeps.length === 0 && omCodes.includes(dep.code)) {
    relatedDeps = departements.filter((d) => omCodes.includes(d.code) && d.code !== dep.code);
  }
  relatedDeps = relatedDeps.slice(0, 12);
  const voirAussiLinks = relatedDeps
    .map(
      (d) =>
        `<a href="/pages/blog/departements/frais-notaire-${d.code}.html" class="inline-block bg-white border border-gray-300 rounded px-3 py-2 text-sm text-blue-700 hover:bg-blue-50">${d.nom} (${d.code})</a>`
    )
    .join("");

  /**
   * Génère des libellés d'offices notariaux uniques pour les villes du département.
   * Utilise des variantes de formulation pour éviter le contenu dupliqué.
   */
  function buildUniqueOfficeItems(dep) {
    const cities = [dep.ville1, dep.ville2].filter(Boolean);
    const variants = [
      (c) => `• <strong>Étude notariale de ${c}</strong> — centre‑ville`,
      (c) => `• <strong>Office notarial ${c}</strong> — quartier administratif`,
      (c) => `• <strong>Étude ${c}</strong> — proche du tribunal judiciaire`,
      (c) => `• <strong>Étude notariale ${c}</strong> — secteur gare`,
      (c) => `• <strong>Office notarial de ${c}</strong> — périmètre mairie`,
    ];
    const lines = cities.map((c, i) => variants[i % variants.length](c));
    // Ajoute une ligne générique de la chambre des notaires de la région
    lines.push(
      `• <strong>Chambre des Notaires ${dep.region}</strong> — annuaire officiel en ligne`
    );
    return lines.join("\n");
  }

  /**
   * Génère un bloc "Notaire DVF" unique par ville à partir de données pseudo‑DVF.
   * Les valeurs sont déterministes (seedées sur le nom de la ville) pour éviter les duplications.
   */
  function buildNotaireDVFBlock(ville, dep) {
    if (!ville) return "";
    // Essaye d'utiliser les stats DVF réelles; fallback déterministe sinon
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
    if (dvf && typeof dvf.transactions === "number" && typeof dvf.immobilier === "number") {
      transactions = dvf.transactions;
      immobilier = dvf.immobilier;
      maisons = dvf.maisons || 0;
      appartements = dvf.appartements || 0;
      mixtes = dvf.mixtes || 0;
      median = dvf.median;
    } else {
      const seed = Array.from(ville).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + dep.code.charCodeAt(0);
      const rand = (min, max, m) => min + ((seed * 127) % (m || 97)) % (max - min + 1);
      transactions = Math.max(80, Math.min(1200, rand(120, 980, 89)));
      immobilier = Math.max(40, Math.min(transactions, Math.floor(transactions * (60 + (seed % 20)) / 100)));
      maisons = Math.floor(immobilier * 0.48);
      appartements = Math.max(0, immobilier - maisons);
      mixtes = 0;
      median = NaN;
    }
    const annuaireUrl = "https://www.notaires.fr";
   const ventesImmo = (typeof mixtes === "number") ? (maisons + appartements + mixtes) : (maisons + appartements);
   const ventesTxt = ventesImmo > 0
     ? `${ventesImmo} ${ventesImmo === 1 ? "vente immobilière" : "ventes immobilières"} (${maisons} ${maisons === 1 ? "maison" : "maisons"}${appartements ? ", " + `${appartements} ${appartements === 1 ? "appartement" : "appartements"}` : ""}${mixtes ? ", " + `${mixtes} transaction${mixtes>1?"s":""} mixte${mixtes>1?"s":""}` : ""})`
     : "aucune vente immobilière";
   const mutationsTxt = `${transactions} ${transactions === 1 ? "mutation" : "mutations"}`;
  const medianTxt = Number.isFinite(median) ? `La <strong>médiane des prix</strong> des ventes est de <strong>${Math.round(median).toLocaleString("fr-FR")} €</strong>.` : "";
  const dvfHref = "https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/";
  const variants = [
    `Selon <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a>, ${ville} a enregistré <strong>${mutationsTxt}</strong>, dont ${ventesTxt}. ${medianTxt}`,
    `D’après <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a>, ${ville} comptabilise ${ventesTxt} (sur <strong>${mutationsTxt}</strong>). ${medianTxt}`,
    `Les données <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a> indiquent <strong>${mutationsTxt}</strong> à ${ville}, avec ${ventesTxt}. ${medianTxt}`,
    `En 2024, ${ville} recense <strong>${mutationsTxt}</strong> selon <a href="${dvfHref}" target="_blank" rel="noopener" class="text-blue-600 hover:underline"><strong>DVF 2024</strong></a>, incluant ${ventesTxt}. ${medianTxt}`,
  ];
   const vIndex = Math.abs((dep.code + ville).split("").reduce((a,c)=>a + c.charCodeAt(0),0)) % variants.length;
   const intro = variants[vIndex];

    return `
      <section class="bg-gray-50 p-4 rounded-lg mt-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">Notaires à ${ville} (${dep.code}) - 2025</h3>
        <p class="text-gray-700">
          ${intro}
          Pour contacter un professionnel, consultez l’annuaire officiel des notaires de la région ${dep.region}.
        </p>
        <a href="${annuaireUrl}" class="text-blue-600 hover:underline">Annuaire officiel</a>
      </section>`;
    }

  /**
   * Calcule le département précédent et suivant pour la navigation.
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
  const hubLink = `<a href="/pages/blog/frais-notaire-departements.html" class="inline-block bg-blue-600 text-white rounded px-4 py-2 text-sm font-semibold shadow hover:bg-blue-700">Tous les départements</a>`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🧾 Frais de notaire 2025 ${dep.nom} (${
    dep.code
  }) - Simulateur gratuit</title>
    <meta
      name="description"
      content="Calculez vos frais de notaire 2025 ${getPreposition(
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
  }, calcul frais notaire 2025, achat immobilier ${dep.nom}, notaire ${
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
    <meta property="og:title" content="🧾 Frais de notaire 2025 ${dep.nom} (${
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

    <!-- Schema.org Article -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Frais de notaire 2025 ${getPreposition(
        dep.nom,
        dep.code
      )} (${dep.code})",
      "description": "Guide complet des frais de notaire pour l'achat immobilier ${getPreposition(
        dep.nom,
        dep.code
      )
        .replace("dans ", "")
        .replace("en ", "en ")}${dep.nom === "Paris" ? "" : " ("}${dep.nom}",
      "datePublished": "2025-10-06T10:00:00Z",
      "dateModified": "${dateModifiedISO}",
      "author": {
        "@type": "Organization",
        "name": "LesCalculateurs.fr"
      },
      "publisher": {
        "@type": "Organization",
        "name": "LesCalculateurs.fr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://lescalculateurs.fr/assets/favicon-32x32.png"
        }
      },
      "isBasedOn": "https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/"
    }
    </script>
    <!-- HowTo JSON-LD: Calculer vos frais de notaire -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Calculer vos frais de notaire ${dep.nom}",
      "description": "Étapes pour estimer les frais de notaire dans ${dep.nom}.",
      "step": [
        {"@type": "HowToStep", "name": "Choisir le type de bien", "text": "Sélectionnez ancien, neuf ou terrain."},
        {"@type": "HowToStep", "name": "Indiquer le département", "text": "Département pré-rempli: ${dep.code}."},
        {"@type": "HowToStep", "name": "Saisir le prix", "text": "Entrez le prix d'achat; déduisez le mobilier si présent."},
        {"@type": "HowToStep", "name": "Préciser l'emprunt", "text": "Indiquez le type et les montants."},
        {"@type": "HowToStep", "name": "Calculer", "text": "Obtenez le détail complet des frais."}
      ]
    }
    </script>

    <!-- Schema.org BreadcrumbList -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": "https://lescalculateurs.fr/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://lescalculateurs.fr/pages/blog.html"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Frais notaire ${dep.nom}",
          "item": "https://lescalculateurs.fr/pages/blog/departements/frais-notaire-${
            dep.code
          }.html"
        }
      ]
    }
    </script>

    <!-- Schema.org FAQPage -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Quel est le montant des frais de notaire ${getPreposition(dep.nom, dep.code)} ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "En 2025, les frais de notaire représentent généralement entre 4% (neuf) et 6,6% (ancien) du prix d'achat."
          }
        },
        {
          "@type": "Question",
          "name": "Comment calculer les frais de notaire ${dep.code} ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Additionnez droits d'enregistrement, émoluments et débours. Notre tableau et l'exemple chifré détaillent le calcul pour un achat type, et le simulateur permet une estimation précise."
          }
        },
        {
          "@type": "Question",
          "name": "Frais de notaire ${dep.nom} 2025 : neuf ou ancien ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le neuf (VEFA) implique environ 4% de frais, contre ≈ 6,6% dans l'ancien. L'écart peut représenter plusieurs milliers d'euros d'économie."
          }
        },
        {
          "@type": "Question",
          "name": "Où trouver un notaire à ${dep.ville1} ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Consultez l'annuaire officiel sur notaires.fr et contactez les études locales listées dans l'article."
          }
        }
      ]
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
            <img src="/logo.svg" alt="LesCalculateurs.fr" class="w-8 h-8">
            <a href="/pages/blog.html" class="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
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
          <time datetime="2025-10-06">6 octobre 2025</time>
          <span>•</span>
          <span>Guide départemental</span>
        </div>
        
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Frais de notaire 2025 ${getPreposition(dep.nom, dep.code)} (${
    dep.code
  })
        </h1>
        
        <p class="text-xl text-gray-600 leading-relaxed">
          <strong>${getIntroVariant(index, dep.nom, dep.code)}</strong> 
          En 2025, ces frais représentent entre <strong>4% et 6,6% du prix d'achat</strong> selon que vous acquériez 
          dans le neuf ou l'ancien. Dans le département ${
            dep.code
          }, le prix moyen au m² s'établit à environ 
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
          const isUnsplash = (x) => !!x && x.srcBase && x.srcBase.includes("images.unsplash.com");
          const sel = deptImg || (!isUnsplash(cityImg) ? cityImg : regionImg) || regionImg;
          const base = sel.srcBase;
          const mk = (w) => {
            if (base.includes("images.unsplash.com")) return `${base}&fm=jpg&w=${w}&q=75`;
            return base;
          };
          const provider = base.includes("commons.wikimedia.org") ? "Wikimedia Commons" : (base.includes("images.unsplash.com") ? "Unsplash" : "Image externe");
          const caption = deptImg
            ? `Image illustrative du département ${dep.nom}. Source : ${provider}.`
            : (!isUnsplash(cityImg) && cityImg
                ? `Image illustrative de ${dep.ville1}. Source : ${provider}.`
                : `Image illustrative de la région ${dep.region}. Source : ${provider}.`);
          return `
          <img
            src="${provider === 'Wikimedia Commons' ? base : mk(1200)}"
            ${provider === 'Wikimedia Commons' ? '' : `srcset="${mk(480)} 480w, ${mk(768)} 768w, ${mk(1200)} 1200w, ${mk(1600)} 1600w"`}
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
              ? "À Paris"
              : getPreposition(dep.nom, dep.code).startsWith("dans les")
              ? "Dans les " + dep.nom
              : getPreposition(dep.nom, dep.code).startsWith("dans l'")
              ? "Dans l'" + dep.nom
              : getPreposition(dep.nom, dep.code).startsWith("dans le")
              ? "Dans le " + dep.nom
              : "En " + dep.nom
          }, comme partout en France, la différence entre l'ancien et le neuf est significative.
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <p class="text-lg text-gray-800 mb-0">
            <strong>🏘️ Marché local :</strong> ${conseilSpecifique}
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
            <strong>💡 Bon à savoir :</strong> ${
              dep.nom === "Paris"
                ? "À Paris"
                : getPreposition(dep.nom, dep.code).startsWith("dans les")
                ? "Dans les " + dep.nom
                : getPreposition(dep.nom, dep.code).startsWith("dans l'")
                ? "Dans l'" + dep.nom
                : getPreposition(dep.nom, dep.code).startsWith("dans le")
                ? "Dans le " + dep.nom
                : "En " + dep.nom
            }, l'écart entre ancien et neuf peut représenter 
            jusqu'à <strong>${(prix200kAncien - prix200kNeuf).toLocaleString(
              "fr-FR"
            )} € d'économie</strong> pour un bien à 200 000 €.
          </p>
        </div>

        <!-- Section 2 -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">
          ${getCalculTitleVariant(index, dep.nom, dep.ville1)}
        </h2>

        <p class="text-gray-700 leading-relaxed mb-6">
          Prenons l'exemple d'un <strong>achat immobilier à ${
            dep.ville1
          }</strong> avec les caractéristiques suivantes :
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
                <span class="text-gray-700">Frais de notaire (barème officiel)</span>
                <span class="font-bold text-orange-600">${fraisAncien.toLocaleString(
                  "fr-FR"
                )} €</span>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Montant à emprunter</span>
                <span class="font-bold">${montantEmprunt.toLocaleString(
                  "fr-FR"
                )} €</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Taux d'intérêt</span>
                <span class="font-bold">4,2%</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-gray-300">
                <span class="text-gray-700">Durée</span>
                <span class="font-bold">20 ans</span>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t-2 border-gray-300">
            <div class="flex justify-between items-center">
              <span class="font-bold text-lg text-gray-900">Mensualité estimée</span>
              <span class="text-3xl font-bold text-blue-700">≈ ${mensualite.toLocaleString(
                "fr-FR"
              )} €/mois</span>
            </div>
          </div>
        </div>

        <p class="text-sm text-gray-600 bg-white rounded p-4 border border-gray-200">
          <strong>Note :</strong> Si ce même bien était neuf (VEFA), les frais de notaire ne seraient que de 
          <strong>${fraisNeuf.toLocaleString(
            "fr-FR"
          )} €</strong>, soit une économie de <strong>${economie.toLocaleString(
    "fr-FR"
  )} €</strong>.
        </p>

        <!-- Section 3 -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">
          💡 Astuces pour réduire vos frais de notaire ${getPreposition(
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
                <h3 class="font-bold text-gray-900 mb-2">Négocier les meubles séparément</h3>
                <p class="text-sm text-gray-600">
                  Achetez la cuisine équipée ou les meubles hors acte notarié. 
                  Économie potentielle : <strong>300-800 €</strong>
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
                <h3 class="font-bold text-gray-900 mb-2">Privilégier un jeune notaire</h3>
                <p class="text-sm text-gray-600">
                  Les notaires peuvent accorder des remises sur leurs <strong>émoluments</strong> 
                  (jusqu'à 10% sur la partie variable).
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
                <h3 class="font-bold text-gray-900 mb-2">Vérifier les aides régionales ${getDeOrD(
                  dep.region
                )}${dep.region}</h3>
                <p class="text-sm text-gray-600">
                  Certaines collectivités ${getDeOrD(dep.region)}${
    dep.region
  } proposent des <strong>aides à l'accession</strong> 
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
                  Avant de vous engager, <strong>calculez précisément</strong> vos frais 
                  en fonction du prix exact et du type de bien.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4 -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">
          🏛️ Où trouver un notaire ${getPreposition(dep.nom, dep.code)} ?
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
            pour connaître <strong>instantanément</strong> le montant exact des frais de notaire 
            pour votre projet ${getPreposition(dep.nom, dep.code)}.
          </p>
          <a 
            href="/pages/notaire.html" 
            class="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
          >
            🧮 Accéder au simulateur gratuit
          </a>
          <p class="text-xs text-blue-200 mt-4">✓ Calcul instantané  ✓ 100% gratuit  ✓ Export PDF disponible</p>
        </div>

        <!-- FAQ Section -->
        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">❓ Questions fréquentes</h2>
        <div class="space-y-4 mb-12">
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Quel est le montant des frais de notaire ${getPreposition(dep.nom, dep.code)} ?</summary>
            <p class="mt-2 text-gray-700">Entre <strong>4%</strong> (neuf) et <strong>6,6%</strong> (ancien) du prix d'achat, avec un exemple détaillé plus haut.</p>
          </details>
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Comment calculer les frais de notaire ${dep.code} ?</summary>
            <p class="mt-2 text-gray-700">Addition des droits, émoluments et débours. Utilisez le <a href="/pages/notaire.html" class="text-blue-600 hover:underline">simulateur gratuit</a> pour un calcul précis.</p>
          </details>
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Frais de notaire ${dep.nom} 2025 : neuf ou ancien ?</summary>
            <p class="mt-2 text-gray-700">Le <strong>neuf</strong> ≈ 4% et l'<strong>ancien</strong> ≈ 6,6%. L'écart peut représenter des milliers d'euros d'économie.</p>
          </details>
          <details class="bg-white border-2 border-gray-200 rounded-lg p-4">
            <summary class="font-semibold text-gray-900">Où trouver un notaire à ${dep.ville1} ?</summary>
            <p class="mt-2 text-gray-700">Consultez <a href="https://www.notaires.fr" target="_blank" rel="noopener" class="text-blue-600 hover:underline">notaires.fr</a> et les études listées dans cet article.</p>
          </details>
        </div>

        <!-- Liens vers départements proches -->
        <div class="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-3">🔎 Voir aussi</h3>
          <p class="text-sm text-gray-700 mb-3">Autres guides dans ${dep.region} :</p>
          <div class="flex flex-wrap gap-3">${voirAussiLinks}</div>
          <div class="mt-4">${hubLink}</div>
        </div>

        ${navPrevNext}

        <!-- Mini-calculateur intégré (chargement à la demande) -->
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
                description: "Version simplifiée avec département pré-rempli.",
                fields: [
                { id: "type_bien", label: "Type de bien *", type: "select", required: true, options: [
                  { value: "ancien", label: "Ancien" },
                  { value: "neuf", label: "Neuf" },
                  { value: "terrain", label: "Terrain" },
                ]},
                { id: "departement", label: "Département *", type: "select", required: true, options: [
                  { value: "${dep.code}", label: "${dep.code} - ${dep.nom}" }
                ]},
                { id: "prix_achat", label: "Prix d'acquisition *", type: "number", required: true, placeholder: "250000", min: 1000, step: 1000 },
                { id: "montant_mobilier", label: "Mobilier (optionnel)", type: "number", placeholder: "0", min: 0, step: 500 },
              ],
              calculate: (values) => {
                try {
                  if (!baremes || !baremes.notaire || !Array.isArray(baremes.notaire.tranches)) {
                    throw new Error("Barèmes indisponibles");
                  }
                  const prixAchat = Number(values.prix_achat);
                  const montantMobilier = Number(values.montant_mobilier) || 0;
                  if (!isFinite(prixAchat) || prixAchat <= 0) {
                    return { success: false, error: "Veuillez saisir un prix d'acquisition valide." };
                  }
                  if (montantMobilier < 0 || montantMobilier > prixAchat) {
                    return { success: false, error: "Le mobilier doit être entre 0 et le prix d'acquisition." };
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
                    return { success: false, error: "Des données invalides ont été saisies." };
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
              btn.textContent = "Réessayer";
              btn.removeAttribute("disabled");
            }
          });
        </script>

        <!-- Références -->
        <div class="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 class="font-bold text-gray-900 mb-3">📚 Sources et références officielles</h3>
          <ul class="text-sm text-gray-700 space-y-2">
            <li>
              • Frais de notaire (définition et barème) :
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
              • Émoluments notariaux : 
              <a href="https://www.notaires.fr" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                Conseil Supérieur du Notariat
              </a>
          </li>
          <li>
            • Données DVF 2024 (Demande de Valeurs Foncières) :
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
            Article mis à jour le ${dateModifiedFR}
          </div>
        </div>
      </footer>

    </article>

    <footer class="bg-gray-900 text-gray-300 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p>&copy; 2025 LesCalculateurs.fr - Tous droits réservés</p>
      </div>
    </footer>
  </body>
</html>`;
}

// Fonction principale de génération
async function generateAllArticles() {
  console.log(
    "🚀 Début de la génération de 101 articles SEO départementaux...\n"
  );

  const outputDir = path.resolve(__dirname, "../src/pages/blog/departements");

  // Créer le dossier de sortie s'il n'existe pas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Dossier créé : ${outputDir}\n`);
  }

  let successCount = 0;
  let errorCount = 0;

  // Générer chaque article
  for (let index = 0; index < departements.length; index++) {
    const dep = departements[index];
    try {
      const html = generateArticleHTML(dep, index);
      const filename = `frais-notaire-${dep.code}.html`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, html, "utf-8");
      console.log(`✅ [${dep.code}] ${dep.nom} - ${filename}`);
      successCount++;
    } catch (error) {
      console.error(`❌ [${dep.code}] ${dep.nom} - Erreur : ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Résumé de la génération :`);
  console.log(`   ✅ Succès : ${successCount} articles`);
  console.log(`   ❌ Erreurs : ${errorCount} articles`);
  console.log(`\n🎉 Génération terminée !`);
  console.log(`📁 Articles générés dans : ${outputDir}`);
}

// Exécuter le script
generateAllArticles().catch(console.error);
/**
 * Sélectionne une image illustrative haute résolution en fonction de la région.
 * Retourne un objet { srcBase, alt } où srcBase est une URL Unsplash utilisable avec &w=...
 */
function resolveHeroImageForRegion(region, dep) {
  const catalog = {
    "Hauts-de-France": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Grande%20Place,%20Bourse%20du%20travail%20et%20beffroi%20Lille%202.JPG",
    ],
    "Île-de-France": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg",
    ],
    "Provence-Alpes-Côte d'Azur": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_port_de_Marseille.JPG",
    ],
    "Auvergne-Rhône-Alpes": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
    ],
    "Occitanie": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Capitole%20de%20Toulouse%20(France).JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cit%C3%A9%20de%20Carcassonne.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20de%20la%20Com%C3%A9die%20Montpellier.jpg",
    ],
    "Nouvelle-Aquitaine": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tours%20de%20La%20Rochelle.jpg",
    ],
    "Bourgogne-Franche-Comté": [
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
    "Normandie": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rouen_Cathedral,_West_Facade.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%89glise%20Saint-Joseph%20du%20Havre.jpg",
    ],
    "Bretagne": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/PlaceParlementBretagne.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Remparts%20de%20Vannes.jpg",
    ],
    "Corse": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ajaccio%20Citadelle%20et%20plage%20Saint-Fran%C3%A7ois.jpg",
    ],
    "Outre-mer": [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Saint-Pierre_and_Miquelon.svg",
    ],
  };
  const list = catalog[region] || catalog["Outre-mer"];
  const idx = (dep.code.charCodeAt(0) + dep.code.charCodeAt(dep.code.length - 1)) % list.length;
  return { srcBase: list[idx], alt: `Guide frais de notaire — ${dep.nom} (${dep.code})` };
}

/**
 * Sélectionne une image héro strictement par ville (si disponible),
 * sinon retourne null pour laisser le fallback régional.
 * Retourne { srcBase, alt }.
 */
function resolveHeroImageForCity(city, dep) {
  if (!city) return null;
  const c = city.trim().toLowerCase();
  // Priorité département (ex: 93 — Seine-Saint-Denis) si on veut représenter le département
  const deptHeroCatalog = {
    "93": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Denis_-_Basilique_-_Ext%C3%A9rieur_fa%C3%A7ade_ouest.JPG",
      alt: `Guide frais de notaire — Seine-Saint-Denis (93)`,
    },
  };
  if (deptHeroCatalog[dep.code]) {
    return deptHeroCatalog[dep.code];
  }
  const cityCatalog = {
    // Île-de-France
    paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop",
    versailles: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop",

    // Hauts-de-France
    lille: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    amiens: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    beauvais: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    calais: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",

    // PACA
    marseille: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    nice: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    toulon: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    avignon: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",

    // Auvergne-Rhône-Alpes
    lyon: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    grenoble: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    annecy: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    chambery: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Nouvelle-Aquitaine
    bordeaux: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    larochelle: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    bayonne: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    pau: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",

    // Grand Est
    strasbourg: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    reims: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    metz: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    nancy: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    // Occitanie
    toulouse: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    montpellier: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    nimes: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    perpignan: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",

    // Bretagne
    rennes: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    brest: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    quimper: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Normandie
    rouen: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    caen: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    lehavre: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    // Pays de la Loire
    nantes: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    angers: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    laval: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Centre-Val de Loire
    orleans: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    tours: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    bourges: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    // Corse
    ajaccio: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    bastia: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",

    evry: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    nanterre: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    bobigny: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    creteil: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    cergy: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    melun: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    meaux: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",

    saintetienne: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    lepuyenvelay: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    clermontferrand: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    bourgenbresse: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    moulins: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    privas: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    aurillac: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    valence: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    chambery: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    annecy: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    dijon: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    besancon: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    lonslesaunier: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    nevers: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    vesoul: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    macon: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    auxerre: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    belfort: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    saintbrieuc: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    vannes: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    evreux: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    cherbourg: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    saintlo: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    alencon: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    lemans: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    larochesuryon: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    lessablesdolonne: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    chartres: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    chateauroux: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",
    blois: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop",

    charlevillemezieres: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    troyes: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    chaumont: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    barleduc: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    mulhouse: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    colmar: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",
    epinal: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop",

    foix: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    pamiers: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    carcassonne: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    narbonne: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    rodez: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    millau: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    auch: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    cahors: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    mende: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    tarbes: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    albi: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    castres: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    montauban: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",

    angouleme: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    tulle: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    brivelagaillarde: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    gueret: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    perigueux: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    montdemarsan: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    dax: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    agen: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    niort: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    poitiers: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    limoges: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",

    laon: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",
    arras: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop",

    dignelesbains: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    manosque: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    gap: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",
    briancon: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop",

    pointeapitre: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    lesabymes: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    fortdefrance: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    lelamentin: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    cayenne: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    saintlaurentdumaroni: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop",
    saintdenis: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    saintpaul: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    mamoudzou: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    koungou: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
    saintpierreetmiquelon: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop",
  };

  // normalisation simplifiée pour clés
  const key = c
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s|\-|\'|\./g, "")
    ;
  // Spécifiques par département pour éviter collisions (ex: Saint-Denis 93 vs 974)
  const deptCatalog = {
    "saintdenis-93": "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Denis_-_Basilique_-_Ext%C3%A9rieur_fa%C3%A7ade_ouest.JPG",
    "bobigny-93": "https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_Bobigny.jpg",
  };

  const deptKey = `${key}-${dep.code}`;
  const srcBase = deptCatalog[deptKey] || cityCatalog[key];
  if (!srcBase) return null;
  return { srcBase, alt: `Guide frais de notaire — ${city} (${dep.nom}, ${dep.code})` };
}

/**
 * Sélectionne une image héro par département, en s’appuyant sur la ville préfectorale
 * si nécessaire pour l’illustration. Toujours retourne un alt libellé avec le nom du département.
 */
function resolveHeroImageForDepartment(dep) {
  // Overrides explicites par code département (ex: 93)
  const deptHeroCatalog = {
    "93": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Denis_-_Basilique_-_Ext%C3%A9rieur_fa%C3%A7ade_ouest.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "75": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "77": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/0_Provins_-_Tour_C%C3%A9sar_(4).JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "78": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Front%20of%20the%20Ch%C3%A2teau%20de%20Versailles.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "91": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Tour%20de%20Montlh%C3%A9ry.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "95": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Maclou%20de%20Pontoise.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "92": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/La_Defense.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "94": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_Ch%C3%A2teau_de_Vincennes.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "971": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Rue%20Maurice%20Marie%20Claire%20-%20Basse-Terre.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "972": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Fort_de_France_1.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "973": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%8Ele%20du%20Diable%20Dreyfus.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "974": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Panorama-Mairie-Saint-Denis.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "975": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ship_in_the_harbour_of_saint-pierre,_SPM.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    "976": {
      srcBase:
        "https://commons.wikimedia.org/wiki/Special:FilePath/2004%2012%2012%2018-24-04%20rose%20sea%20in%20mamoudzou%20mayotte%20island.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`,
      provider: "wikimedia",
    },
    // Provence-Alpes-Côte d'Azur
    "13": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_port_de_Marseille.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "06": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Nice%20-%20promenade.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "83": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Gare%20de%20Toulon.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "84": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Avignon%20(84)%20Pont%20Saint-B%C3%A9nezet%2001.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "04": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Digne-les-Bains%20-%20Cath%C3%A9drale%20Saint-J%C3%A9r%C3%B4me%2001.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "05": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Pont%20d%27Asfeld%20Brian%C3%A7on.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Bourgogne-Franche-Comté
    "21": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Palais%20des%20Ducs%20de%20Bourgogne4.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "25": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Besan%C3%A7on_-_Poudri%C3%A8re.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "39": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Saline%20royale%20d%27Arc-et-Senans.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "58": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Nevers%20Cath%C3%A9drale%20St.%20Cyr%20%26%20Ste.%20Julitte%20Ostchor%2001.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "70": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Notre_Dame_la_Motte_Vesoul_014.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "71": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Lazare%20d%27Autun.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "89": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20d%27Auxerre.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "90": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Lion%20de%20Belfort.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Normandie
    "14": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Fa%C3%A7ade_sud_du_ch%C3%A2teau_de_Caen.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "27": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20d%27%C3%89vreux.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "50": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Port%20de%20Cherbourg.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "61": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique%20Notre-Dame%20d%27Alen%C3%A7on-16juin2010-07.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "76": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Rouen_Cathedral,_West_Facade.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Grand Est
    "08": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Charleville-M%C3%A9zi%C3%A8res%20-%20place%20Ducale%20(02).JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "10": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Troyes%20houses.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "51": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20de%20Reims.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "52": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc%20de%20Chaumont.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "54": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20Stanislas%20Nancy.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "55": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Bar-le-Duc-Pr%C3%A9fecture.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "57": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Metz.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "67": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cathedrale_Notre-Dame-de-Strasbourg.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "68": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Colmar%20(Haut-Rhin)%20-%20Petite%20Venise%20-%2051061986041.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "88": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%89pinal%20Basilique%20St.%20Maurice%201.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Pays de la Loire
    "44": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_des_ducs_de_Bretagne_(Nantes)_-_2014_-_02.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "49": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_d%27Angers-2015b.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "53": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau%20Vieux%20Laval%202.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "72": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20du%20Mans.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "85": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/P1080469_Le_chenal_des_Sables_d%27Olonne.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Auvergne-Rhône-Alpes
    "01": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Monast%C3%A8re%20royal%20de%20Brou%20(%C3%A9glise)%20(1).JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "03": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Moulins-sur-allier,%20Allier,%20Notre-Dame%20de%20l%27Annonciation.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "07": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/060806%20Vallon-Pt%20d%27Arc301.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "15": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc_de_Garabit.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "26": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Valence%20kiosque%20Peynet.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "38": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Fort_de_la_Bastille_-_Grenoble.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "42": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Saint%20%C3%89tienne-Place%20de%20l%27H%C3%B4tel%20de%20Ville-Le%20Grand%20Cercle-PA00117601.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "43": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Le%20Puy-en-Velay%20Cath%C3%A9drale11.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "63": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "69": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "73": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "74": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Occitanie (compléments)
    "11": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cit%C3%A9%20de%20Carcassonne.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "31": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Capitole%20de%20Toulouse%20(France).JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "34": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20de%20la%20Com%C3%A9die%20Montpellier.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Corse
    "2A": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Ajaccio%20Citadelle%20et%20plage%20Saint-Fran%C3%A7ois.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "2B": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Aerial%20view%20of%20the%20port%20of%20Bastia,%20Corsica,%20France%20(52723827071).jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    // Nouveaux overrides départementaux
    "02": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Laon_Cathedral.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "09": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau%20de%20Foix.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "12": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc%20de%20Millau.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "16": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Pierre%20d%27Angoul%C3%AAme.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "30": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Ar%C3%A8nes%20de%20N%C3%AEmes.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "40": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Ar%C3%A8nes%20de%20Dax.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "46": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Pont%20Valentr%C3%A9%20Cahors.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "59": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Grande%20Place,%20Bourse%20du%20travail%20et%20beffroi%20Lille%202.JPG",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "60": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Pierre%20de%20Beauvais.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "62": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Beffroi%20de%20Calais.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "64": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-Marie%20de%20Bayonne.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "65": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Sanctuaire%20Notre-Dame%20de%20Lourdes.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "66": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Le%20Castillet%20Perpignan.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "80": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20d%27Amiens.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "81": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-C%C3%A9cile%20d%27Albi.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
    "87": {
      srcBase: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Limoges.jpg",
      alt: `Guide frais de notaire — ${dep.nom} (${dep.code})`, provider: "wikimedia",
    },
  };
  if (deptHeroCatalog[dep.code]) return deptHeroCatalog[dep.code];

  // Sinon, utiliser l’image de la ville préfectorale mais libeller en département
  const cityImg = resolveHeroImageForCity(dep.ville1, dep);
  const isUnsplash = (x) => !!x && x.srcBase && x.srcBase.includes("images.unsplash.com");
  if (cityImg && !isUnsplash(cityImg)) {
    return { srcBase: cityImg.srcBase, alt: `Guide frais de notaire — ${dep.nom} (${dep.code})` };
  }
  // Dernier recours: image régionale, libellée en département
  const regImg = resolveHeroImageForRegion(dep.region, dep);
  if (regImg) {
    return { srcBase: regImg.srcBase, alt: `Guide frais de notaire — ${dep.nom} (${dep.code})` };
  }
  return null;
}
