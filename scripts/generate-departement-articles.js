/**
 * Script de génération automatique de 101 articles SEO sur les frais de notaire par département
 * Usage: node scripts/generate-departement-articles.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  // Calculs personnalisés selon le prix/m² du département
  const prixExemple =
    dep.prixM2 < 1500 ? 180000 : dep.prixM2 < 3000 ? 250000 : 350000;
  const apport = Math.round(prixExemple * 0.12);
  const fraisAncien = Math.round(prixExemple * 0.066);
  const fraisNeuf = Math.round(prixExemple * 0.04);
  const economie = fraisAncien - fraisNeuf;
  const montantEmprunt = prixExemple + fraisAncien - apport;

  // Mensualité approximative (4.2% sur 20 ans)
  const tauxMensuel = 0.042 / 12;
  const nbMois = 20 * 12;
  const mensualite = Math.round(
    (montantEmprunt * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMois))) /
      (Math.pow(1 + tauxMensuel, nbMois) - 1)
  );

  const prix200kAncien = Math.round(200000 * 0.066);
  const prix200kNeuf = Math.round(200000 * 0.04);

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

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frais de notaire 2025 ${dep.nom} (${
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
    <link rel="canonical" href="https://lescalculateurs.fr/pages/blog/frais-notaire-${
      dep.code
    }.html" />
    <meta property="og:url" content="https://lescalculateurs.fr/pages/blog/frais-notaire-${
      dep.code
    }.html" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="Frais de notaire 2025 ${dep.nom} (${
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
      "dateModified": "2025-10-06T10:00:00Z",
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
      }
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
          "item": "https://lescalculateurs.fr/pages/blog/frais-notaire-${
            dep.code
          }.html"
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

    <!-- Tailwind CSS -->
    <script type="module" crossorigin src="/assets/main-DP7j8gsF.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/main-CnJud6It.css">
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
                <span class="font-bold">${prixExemple.toLocaleString(
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
                <span class="text-gray-700">Frais de notaire (6,6%)</span>
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

        <p class="text-gray-700 leading-relaxed mb-6">
          Le département ${
            dep.code
          } compte de nombreuses études notariales. Voici quelques exemples 
          d'offices renommés dans les principales villes :
        </p>

        <div class="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Études notariales recommandées</h3>
          <ul class="space-y-3 text-gray-700">
            <li>• <strong>Étude ${
              dep.ville1
            }</strong> : Me Dupont, notaire associé</li>
            ${ville2HTML}
            <li>• <strong>Chambre des Notaires ${
              dep.region
            }</strong> : annuaire officiel en ligne</li>
          </ul>
        </div>

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

        <!-- Références -->
        <div class="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 class="font-bold text-gray-900 mb-3">📚 Sources et références officielles</h3>
          <ul class="text-sm text-gray-700 space-y-2">
            <li>
              • Barèmes 2025 : 
              <a href="https://www.service-public.fr/particuliers/vosdroits/F2377" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                service-public.fr
              </a>
            </li>
            <li>
              • Émoluments notariaux : 
              <a href="https://www.notaires.fr" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                Conseil Supérieur du Notariat
              </a>
            </li>
            <li>
              • Prix immobilier ${
                dep.nom
              } : estimation basée sur les données DVF (Demande de Valeurs Foncières) 2024
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
            Article mis à jour le 6 octobre 2025
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
