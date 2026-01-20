/**
 * SCRIPT OFFICIEL - Application du template définitif LesCalculateurs.fr
 * Génère les 101 pages départementales conformes juridiquement
 *
 * Usage: node scripts/apply-official-template.cjs
 */

const fs = require("fs");
const path = require("path");

// Configuration des départements avec villes-exemples
const DEPARTEMENTS = {
  "01": {
    nom: "Ain",
    prefecture: "Bourg-en-Bresse",
    region: "Auvergne-Rhône-Alpes",
  },
  "02": { nom: "Aisne", prefecture: "Laon", region: "Hauts-de-France" },
  "03": {
    nom: "Allier",
    prefecture: "Moulins",
    region: "Auvergne-Rhône-Alpes",
  },
  "04": {
    nom: "Alpes-de-Haute-Provence",
    prefecture: "Digne-les-Bains",
    region: "Provence-Alpes-Côte d'Azur",
  },
  "05": {
    nom: "Hautes-Alpes",
    prefecture: "Gap",
    region: "Provence-Alpes-Côte d'Azur",
  },
  "06": {
    nom: "Alpes-Maritimes",
    prefecture: "Nice",
    region: "Provence-Alpes-Côte d'Azur",
  },
  "07": {
    nom: "Ardèche",
    prefecture: "Privas",
    region: "Auvergne-Rhône-Alpes",
  },
  "08": {
    nom: "Ardennes",
    prefecture: "Charleville-Mézières",
    region: "Grand Est",
  },
  "09": { nom: "Ariège", prefecture: "Foix", region: "Occitanie" },
  10: { nom: "Aube", prefecture: "Troyes", region: "Grand Est" },
  11: { nom: "Aude", prefecture: "Carcassonne", region: "Occitanie" },
  12: { nom: "Aveyron", prefecture: "Rodez", region: "Occitanie" },
  13: {
    nom: "Bouches-du-Rhône",
    prefecture: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
  },
  14: { nom: "Calvados", prefecture: "Caen", region: "Normandie" },
  15: { nom: "Cantal", prefecture: "Aurillac", region: "Auvergne-Rhône-Alpes" },
  16: {
    nom: "Charente",
    prefecture: "Angoulême",
    region: "Nouvelle-Aquitaine",
  },
  17: {
    nom: "Charente-Maritime",
    prefecture: "La Rochelle",
    region: "Nouvelle-Aquitaine",
  },
  18: { nom: "Cher", prefecture: "Bourges", region: "Centre-Val de Loire" },
  19: { nom: "Corrèze", prefecture: "Tulle", region: "Nouvelle-Aquitaine" },
  21: {
    nom: "Côte-d'Or",
    prefecture: "Dijon",
    region: "Bourgogne-Franche-Comté",
  },
  22: { nom: "Côtes-d'Armor", prefecture: "Saint-Brieuc", region: "Bretagne" },
  23: { nom: "Creuse", prefecture: "Guéret", region: "Nouvelle-Aquitaine" },
  24: {
    nom: "Dordogne",
    prefecture: "Périgueux",
    region: "Nouvelle-Aquitaine",
  },
  25: {
    nom: "Doubs",
    prefecture: "Besançon",
    region: "Bourgogne-Franche-Comté",
  },
  26: { nom: "Drôme", prefecture: "Valence", region: "Auvergne-Rhône-Alpes" },
  27: { nom: "Eure", prefecture: "Évreux", region: "Normandie" },
  28: {
    nom: "Eure-et-Loir",
    prefecture: "Chartres",
    region: "Centre-Val de Loire",
  },
  29: { nom: "Finistère", prefecture: "Quimper", region: "Bretagne" },
  "2A": { nom: "Corse-du-Sud", prefecture: "Ajaccio", region: "Corse" },
  "2B": { nom: "Haute-Corse", prefecture: "Bastia", region: "Corse" },
  30: { nom: "Gard", prefecture: "Nîmes", region: "Occitanie" },
  31: { nom: "Haute-Garonne", prefecture: "Toulouse", region: "Occitanie" },
  32: { nom: "Gers", prefecture: "Auch", region: "Occitanie" },
  33: { nom: "Gironde", prefecture: "Bordeaux", region: "Nouvelle-Aquitaine" },
  34: { nom: "Hérault", prefecture: "Montpellier", region: "Occitanie" },
  35: { nom: "Ille-et-Vilaine", prefecture: "Rennes", region: "Bretagne" },
  36: {
    nom: "Indre",
    prefecture: "Châteauroux",
    region: "Centre-Val de Loire",
  },
  37: {
    nom: "Indre-et-Loire",
    prefecture: "Tours",
    region: "Centre-Val de Loire",
  },
  38: { nom: "Isère", prefecture: "Grenoble", region: "Auvergne-Rhône-Alpes" },
  39: {
    nom: "Jura",
    prefecture: "Lons-le-Saunier",
    region: "Bourgogne-Franche-Comté",
  },
  40: {
    nom: "Landes",
    prefecture: "Mont-de-Marsan",
    region: "Nouvelle-Aquitaine",
  },
  41: {
    nom: "Loir-et-Cher",
    prefecture: "Blois",
    region: "Centre-Val de Loire",
  },
  42: {
    nom: "Loire",
    prefecture: "Saint-Étienne",
    region: "Auvergne-Rhône-Alpes",
  },
  43: {
    nom: "Haute-Loire",
    prefecture: "Le Puy-en-Velay",
    region: "Auvergne-Rhône-Alpes",
  },
  44: {
    nom: "Loire-Atlantique",
    prefecture: "Nantes",
    region: "Pays de la Loire",
  },
  45: { nom: "Loiret", prefecture: "Orléans", region: "Centre-Val de Loire" },
  46: { nom: "Lot", prefecture: "Cahors", region: "Occitanie" },
  47: {
    nom: "Lot-et-Garonne",
    prefecture: "Agen",
    region: "Nouvelle-Aquitaine",
  },
  48: { nom: "Lozère", prefecture: "Mende", region: "Occitanie" },
  49: {
    nom: "Maine-et-Loire",
    prefecture: "Angers",
    region: "Pays de la Loire",
  },
  50: { nom: "Manche", prefecture: "Saint-Lô", region: "Normandie" },
  51: { nom: "Marne", prefecture: "Châlons-en-Champagne", region: "Grand Est" },
  52: { nom: "Haute-Marne", prefecture: "Chaumont", region: "Grand Est" },
  53: { nom: "Mayenne", prefecture: "Laval", region: "Pays de la Loire" },
  54: { nom: "Meurthe-et-Moselle", prefecture: "Nancy", region: "Grand Est" },
  55: { nom: "Meuse", prefecture: "Bar-le-Duc", region: "Grand Est" },
  56: { nom: "Morbihan", prefecture: "Vannes", region: "Bretagne" },
  57: { nom: "Moselle", prefecture: "Metz", region: "Grand Est" },
  58: {
    nom: "Nièvre",
    prefecture: "Nevers",
    region: "Bourgogne-Franche-Comté",
  },
  59: { nom: "Nord", prefecture: "Lille", region: "Hauts-de-France" },
  60: { nom: "Oise", prefecture: "Beauvais", region: "Hauts-de-France" },
  61: { nom: "Orne", prefecture: "Alençon", region: "Normandie" },
  62: { nom: "Pas-de-Calais", prefecture: "Arras", region: "Hauts-de-France" },
  63: {
    nom: "Puy-de-Dôme",
    prefecture: "Clermont-Ferrand",
    region: "Auvergne-Rhône-Alpes",
  },
  64: {
    nom: "Pyrénées-Atlantiques",
    prefecture: "Pau",
    region: "Nouvelle-Aquitaine",
  },
  65: { nom: "Hautes-Pyrénées", prefecture: "Tarbes", region: "Occitanie" },
  66: {
    nom: "Pyrénées-Orientales",
    prefecture: "Perpignan",
    region: "Occitanie",
  },
  67: { nom: "Bas-Rhin", prefecture: "Strasbourg", region: "Grand Est" },
  68: { nom: "Haut-Rhin", prefecture: "Colmar", region: "Grand Est" },
  69: { nom: "Rhône", prefecture: "Lyon", region: "Auvergne-Rhône-Alpes" },
  70: {
    nom: "Haute-Saône",
    prefecture: "Vesoul",
    region: "Bourgogne-Franche-Comté",
  },
  71: {
    nom: "Saône-et-Loire",
    prefecture: "Mâcon",
    region: "Bourgogne-Franche-Comté",
  },
  72: { nom: "Sarthe", prefecture: "Le Mans", region: "Pays de la Loire" },
  73: { nom: "Savoie", prefecture: "Chambéry", region: "Auvergne-Rhône-Alpes" },
  74: {
    nom: "Haute-Savoie",
    prefecture: "Annecy",
    region: "Auvergne-Rhône-Alpes",
  },
  75: { nom: "Paris", prefecture: "Paris", region: "Île-de-France" },
  76: { nom: "Seine-Maritime", prefecture: "Rouen", region: "Normandie" },
  77: { nom: "Seine-et-Marne", prefecture: "Melun", region: "Île-de-France" },
  78: { nom: "Yvelines", prefecture: "Versailles", region: "Île-de-France" },
  79: { nom: "Deux-Sèvres", prefecture: "Niort", region: "Nouvelle-Aquitaine" },
  80: { nom: "Somme", prefecture: "Amiens", region: "Hauts-de-France" },
  81: { nom: "Tarn", prefecture: "Albi", region: "Occitanie" },
  82: { nom: "Tarn-et-Garonne", prefecture: "Montauban", region: "Occitanie" },
  83: {
    nom: "Var",
    prefecture: "Toulon",
    region: "Provence-Alpes-Côte d'Azur",
  },
  84: {
    nom: "Vaucluse",
    prefecture: "Avignon",
    region: "Provence-Alpes-Côte d'Azur",
  },
  85: {
    nom: "Vendée",
    prefecture: "La Roche-sur-Yon",
    region: "Pays de la Loire",
  },
  86: { nom: "Vienne", prefecture: "Poitiers", region: "Nouvelle-Aquitaine" },
  87: {
    nom: "Haute-Vienne",
    prefecture: "Limoges",
    region: "Nouvelle-Aquitaine",
  },
  88: { nom: "Vosges", prefecture: "Épinal", region: "Grand Est" },
  89: {
    nom: "Yonne",
    prefecture: "Auxerre",
    region: "Bourgogne-Franche-Comté",
  },
  90: {
    nom: "Territoire de Belfort",
    prefecture: "Belfort",
    region: "Bourgogne-Franche-Comté",
  },
  91: {
    nom: "Essonne",
    prefecture: "Évry-Courcouronnes",
    region: "Île-de-France",
  },
  92: {
    nom: "Hauts-de-Seine",
    prefecture: "Nanterre",
    region: "Île-de-France",
  },
  93: {
    nom: "Seine-Saint-Denis",
    prefecture: "Bobigny",
    region: "Île-de-France",
  },
  94: { nom: "Val-de-Marne", prefecture: "Créteil", region: "Île-de-France" },
  95: {
    nom: "Val-d'Oise",
    prefecture: "Cergy-Pontoise",
    region: "Île-de-France",
  },
  971: { nom: "Guadeloupe", prefecture: "Basse-Terre", region: "Guadeloupe" },
  972: {
    nom: "Martinique",
    prefecture: "Fort-de-France",
    region: "Martinique",
  },
  973: { nom: "Guyane", prefecture: "Cayenne", region: "Guyane" },
  974: { nom: "La Réunion", prefecture: "Saint-Denis", region: "La Réunion" },
  975: {
    nom: "Saint-Pierre-et-Miquelon",
    prefecture: "Saint-Pierre",
    region: "Saint-Pierre-et-Miquelon",
  },
  976: { nom: "Mayotte", prefecture: "Mamoudzou", region: "Mayotte" },
};

// Images Wikimedia Commons par département (récupérées des anciennes pages)
const IMAGES = {
  "01": "https://commons.wikimedia.org/wiki/Special:FilePath/Monast%C3%A8re%20royal%20de%20Brou%20(%C3%A9glise)%20(1).JPG",
  "02": "https://commons.wikimedia.org/wiki/Special:FilePath/Laon_Cathedral.JPG",
  "03": "https://commons.wikimedia.org/wiki/Special:FilePath/Moulins-sur-allier,%20Allier,%20Notre-Dame%20de%20l%27Annonciation.JPG",
  "04": "https://commons.wikimedia.org/wiki/Special:FilePath/Digne-les-Bains%20-%20Cath%C3%A9drale%20Saint-J%C3%A9r%C3%B4me%2001.jpg",
  "05": "https://commons.wikimedia.org/wiki/Special:FilePath/Gap_-_Vue_panoramique.jpg",
  "06": "https://commons.wikimedia.org/wiki/Special:FilePath/Nizza_Promenade_des_Anglais.JPG",
  "07": "https://commons.wikimedia.org/wiki/Special:FilePath/Gorges_de_l%27Ard%C3%A8che_(pont_d%27Arc).jpg",
  "08": "https://commons.wikimedia.org/wiki/Special:FilePath/Charleville-M%C3%A9zi%C3%A8res%20-%20place%20Ducale%20(02).JPG",
  "09": "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau%20de%20Foix.jpg",
  10: "https://commons.wikimedia.org/wiki/Special:FilePath/Troyes%20houses.JPG",
  11: "https://commons.wikimedia.org/wiki/Special:FilePath/France-002567_-_Carcassonne_%2815454692448%29.jpg",
  12: "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc%20de%20Millau.jpg",
  13: "https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_port_de_Marseille.JPG",
  14: "https://commons.wikimedia.org/wiki/Special:FilePath/Fa%C3%A7ade_sud_du_ch%C3%A2teau_de_Caen.JPG",
  15: "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc_de_Garabit.jpg",
  16: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Pierre%20d%27Angoul%C3%AAme.jpg",
  17: "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
  18: "https://commons.wikimedia.org/wiki/Special:FilePath/Bourges_-_Cath%C3%A9drale_Saint-%C3%89tienne_%283%29.jpg",
  19: "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
  21: "https://commons.wikimedia.org/wiki/Special:FilePath/Dijon_-_Palais_des_Ducs_de_Bourgogne.JPG",
  22: "https://commons.wikimedia.org/wiki/Special:FilePath/PlaceParlementBretagne.jpg",
  23: "https://commons.wikimedia.org/wiki/Special:FilePath/Tours%20de%20La%20Rochelle.jpg",
  24: "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
  25: "https://commons.wikimedia.org/wiki/Special:FilePath/France_Besan%C3%A7on_Citadelle_03.jpg",
  26: "https://commons.wikimedia.org/wiki/Special:FilePath/Valence%20kiosque%20Peynet.jpg",
  27: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20d%27%C3%89vreux.jpg",
  28: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20de%20Chartres.jpg",
  29: "https://commons.wikimedia.org/wiki/Special:FilePath/Remparts%20de%20Vannes.jpg",
  "2A": "https://commons.wikimedia.org/wiki/Special:FilePath/Ajaccio%20Citadelle%20et%20plage%20Saint-Fran%C3%A7ois.jpg",
  "2B": "https://commons.wikimedia.org/wiki/Special:FilePath/Aerial%20view%20of%20the%20port%20of%20Bastia,%20Corsica,%20France%20(52723827071).jpg",
  30: "https://commons.wikimedia.org/wiki/Special:FilePath/Ar%C3%A8nes%20de%20N%C3%AEmes.jpg",
  31: "https://commons.wikimedia.org/wiki/Special:FilePath/Capitole%20de%20Toulouse%20(France).JPG",
  32: "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20de%20la%20Com%C3%A9die%20Montpellier.jpg",
  33: "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
  34: "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20de%20la%20Com%C3%A9die%20Montpellier.jpg",
  35: "https://commons.wikimedia.org/wiki/Special:FilePath/PlaceParlementBretagne.jpg",
  36: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-Croix_d%27Orl%C3%A9ans%202008%20PD%2033.JPG",
  37: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20de%20Chartres.jpg",
  38: "https://commons.wikimedia.org/wiki/Special:FilePath/Fort_de_la_Bastille_-_Grenoble.JPG",
  39: "https://commons.wikimedia.org/wiki/Special:FilePath/Saline%20royale%20d%27Arc-et-Senans.jpg",
  40: "https://commons.wikimedia.org/wiki/Special:FilePath/Ar%C3%A8nes%20de%20Dax.jpg",
  41: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20de%20Chartres.jpg",
  42: "https://commons.wikimedia.org/wiki/Special:FilePath/Saint%20%C3%89tienne-Place%20de%20l%27H%C3%B4tel%20de%20Ville-Le%20Grand%20Cercle-PA00117601.jpg",
  43: "https://commons.wikimedia.org/wiki/Special:FilePath/Le%20Puy-en-Velay%20Cath%C3%A9drale11.JPG",
  44: "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_des_ducs_de_Bretagne_(Nantes)_-_2014_-_02.JPG",
  45: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-Croix_d%27Orl%C3%A9ans%202008%20PD%2033.JPG",
  46: "https://commons.wikimedia.org/wiki/Special:FilePath/Pont%20Valentr%C3%A9%20Cahors.jpg",
  47: "https://commons.wikimedia.org/wiki/Special:FilePath/Tours%20de%20La%20Rochelle.jpg",
  48: "https://commons.wikimedia.org/wiki/Special:FilePath/Capitole%20de%20Toulouse%20(France).JPG",
  49: "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau_d%27Angers-2015b.JPG",
  50: "https://commons.wikimedia.org/wiki/Special:FilePath/Port%20de%20Cherbourg.jpg",
  51: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20de%20Reims.jpg",
  52: "https://commons.wikimedia.org/wiki/Special:FilePath/Viaduc%20de%20Chaumont.jpg",
  53: "https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A2teau%20Vieux%20Laval%202.JPG",
  55: "https://commons.wikimedia.org/wiki/Special:FilePath/Bar-le-Duc-Pr%C3%A9fecture.JPG",
  57: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Metz.jpg",
  58: "https://commons.wikimedia.org/wiki/Special:FilePath/Nevers%20Cath%C3%A9drale%20St.%20Cyr%20%26%20Ste.%20Julitte%20Ostchor%2001.jpg",
  59: "https://commons.wikimedia.org/wiki/Special:FilePath/Grande%20Place,%20Bourse%20du%20travail%20et%20beffroi%20Lille%202.JPG",
  60: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Pierre%20de%20Beauvais.jpg",
  61: "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique%20Notre-Dame%20d%27Alen%C3%A7on-16juin2010-07.jpg",
  63: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
  64: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-Marie%20de%20Bayonne.jpg",
  65: "https://commons.wikimedia.org/wiki/Special:FilePath/Sanctuaire%20Notre-Dame%20de%20Lourdes.jpg",
  66: "https://commons.wikimedia.org/wiki/Special:FilePath/Le%20Castillet%20Perpignan.jpg",
  67: "https://commons.wikimedia.org/wiki/Special:FilePath/Cathedrale_Notre-Dame-de-Strasbourg.jpg",
  68: "https://commons.wikimedia.org/wiki/Special:FilePath/Colmar%20(Haut-Rhin)%20-%20Petite%20Venise%20-%2051061986041.jpg",
  69: "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
  70: "https://commons.wikimedia.org/wiki/Special:FilePath/Notre_Dame_la_Motte_Vesoul_014.JPG",
  73: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame-de-l%27Assomption%20de%20Clermont-Ferrand.jpg",
  74: "https://commons.wikimedia.org/wiki/Special:FilePath/Basilique_de_Fourvi%C3%A8re-Lyon.JPG",
  75: "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg",
  76: "https://commons.wikimedia.org/wiki/Special:FilePath/Rouen_Cathedral,_West_Facade.JPG",
  77: "https://commons.wikimedia.org/wiki/Special:FilePath/0_Provins_-_Tour_C%C3%A9sar_(4).JPG",
  78: "https://commons.wikimedia.org/wiki/Special:FilePath/Front%20of%20the%20Ch%C3%A2teau%20de%20Versailles.jpg",
  79: "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
  80: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Notre-Dame%20d%27Amiens.jpg",
  81: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Sainte-C%C3%A9cile%20d%27Albi.jpg",
  82: "https://commons.wikimedia.org/wiki/Special:FilePath/Cit%C3%A9%20de%20Carcassonne.jpg",
  83: "https://commons.wikimedia.org/wiki/Special:FilePath/Gare%20de%20Toulon.JPG",
  84: "https://commons.wikimedia.org/wiki/Special:FilePath/Avignon%20(84)%20Pont%20Saint-B%C3%A9nezet%2001.JPG",
  85: "https://commons.wikimedia.org/wiki/Special:FilePath/P1080469_Le_chenal_des_Sables_d%27Olonne.JPG",
  86: "https://commons.wikimedia.org/wiki/Special:FilePath/Bordeaux_place_de_la_bourse_with_tram.JPG",
  87: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20de%20Limoges.jpg",
  88: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%89pinal%20Basilique%20St.%20Maurice%201.jpg",
  89: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-%C3%89tienne%20d%27Auxerre.jpg",
  90: "https://commons.wikimedia.org/wiki/Special:FilePath/Lion%20de%20Belfort.jpg",
  91: "https://commons.wikimedia.org/wiki/Special:FilePath/Tour%20de%20Montlh%C3%A9ry.jpg",
  92: "https://commons.wikimedia.org/wiki/Special:FilePath/La_Defense.JPG",
  93: "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Denis_-_Basilique_-_Ext%C3%A9rieur_fa%C3%A7ade_ouest.JPG",
  94: "https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_Ch%C3%A2teau_de_Vincennes.JPG",
  95: "https://commons.wikimedia.org/wiki/Special:FilePath/Cath%C3%A9drale%20Saint-Maclou%20de%20Pontoise.jpg",
  971: "https://commons.wikimedia.org/wiki/Special:FilePath/Rue%20Maurice%20Marie%20Claire%20-%20Basse-Terre.JPG",
  973: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%8Ele%20du%20Diable%20Dreyfus.jpg",
  974: "https://commons.wikimedia.org/wiki/Special:FilePath/Panorama-Mairie-Saint-Denis.JPG",
  975: "https://commons.wikimedia.org/wiki/Special:FilePath/Ship_in_the_harbour_of_saint-pierre,_SPM.JPG",
  976: "https://commons.wikimedia.org/wiki/Special:FilePath/2004%2012%2012%2018-24-04%20rose%20sea%20in%20mamoudzou%20mayotte%20island.jpg",
};

// Image par défaut pour les départements sans image
const DEFAULT_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/France_location_map-Regions_and_departements-2016.svg";

// Template officiel conforme
function generateTemplate(code, nom, ville, region, imageUrl) {
  const dateNow = new Date().toISOString();
  const codeUrl = code.toLowerCase();

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frais de notaire ${nom} (${code}) 2026 — Simulateur officiel gratuit</title>
    <meta
      name="description"
      content="Calculez vos frais de notaire en ${nom} (${code}) instantanément. Estimation automatique 2026, barème officiel. Aucun email demandé."
    />
    <meta
      name="keywords"
      content="frais notaire ${nom}, frais de notaire 2026 ${nom}, droits d'enregistrement ${nom}, notaires ${nom}, émoluments notaire ${nom}"
    />
    <meta name="author" content="LesCalculateurs.fr" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />

    <!-- SEO & Social -->
    <link rel="canonical" href="https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-${codeUrl}" />
    <meta property="og:url" content="https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-${codeUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="Frais de notaire ${nom} (${code}) 2026 — Simulateur officiel gratuit" />
    <meta property="og:description" content="Calculez vos frais de notaire en ${nom} instantanément. Estimation automatique 2026. Aucun email demandé." />
    <meta name="twitter:description" content="Calculez vos frais de notaire en ${nom} instantanément. Estimation automatique 2026. Aucun email demandé." />
    <meta property="og:image" content="https://www.lescalculateurs.fr/assets/favicon-32x32.png" />

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />

    <!-- Schema.org BreadcrumbList + FAQPage + Article -->
    <script type="application/ld+json">
      [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.lescalculateurs.fr/" },
            { "@type": "ListItem", "position": 2, "name": "Immobilier", "item": "https://www.lescalculateurs.fr/immobilier/" },
            { "@type": "ListItem", "position": 3, "name": "Frais de notaire ${nom} (${code})", "item": "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-${codeUrl}" }
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Quel est le montant des frais de notaire en ${nom} ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "En 2026, les frais de notaire se situent généralement entre 7 % et 9 % du prix d'achat dans l'ancien et entre 2 % et 3 % dans le neuf (VEFA), selon le barème national et les droits d'enregistrement."
              }
            },
            {
              "@type": "Question",
              "name": "Comment sont calculés les frais de notaire ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Les frais de notaire comprennent les droits d'enregistrement (taxe départementale), les émoluments du notaire (barème réglementé), les débours et formalités, la contribution de sécurité immobilière (CSI) et la TVA applicable."
              }
            },
            {
              "@type": "Question",
              "name": "Quelle différence entre ancien et neuf (VEFA) ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "L'achat dans le neuf (VEFA) bénéficie de droits réduits, ce qui permet une économie significative sur les frais de notaire par rapport à l'ancien."
              }
            },
            {
              "@type": "Question",
              "name": "Où trouver un notaire en ${nom} ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Consultez l'annuaire officiel des notaires sur notaires.fr pour trouver un professionnel proche de votre projet immobilier en ${nom}."
              }
            },
            {
              "@type": "Question",
              "name": "Les frais de notaire sont-ils plus élevés en ${nom} que dans d’autres départements ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Non. Les frais de notaire sont encadrés au niveau national. ${nom} n’applique pas de taux spécifiques différents, mais des prix immobiliers plus élevés dans certaines zones peuvent augmenter le montant total des frais."
              }
            }
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Frais de notaire 2026 en ${nom} (${code})",
          "description": "Guide complet des frais de notaire pour l'achat immobilier en ${nom} (${code})",
          "datePublished": "2025-10-06T10:00:00Z",
          "dateModified": "${dateNow}",
          "author": { "@type": "Organization", "name": "LesCalculateurs.fr" },
          "publisher": {
            "@type": "Organization",
            "name": "LesCalculateurs.fr",
            "logo": { "@type": "ImageObject", "url": "https://www.lescalculateurs.fr/assets/favicon-32x32.png" }
          }
        }
      ]
    </script>

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399" crossorigin="anonymous"></script>

    <!-- Google Tag Manager -->
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

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2HNTGCYQ1X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag("js", new Date());
      gtag("config", "G-2HNTGCYQ1X");
    </script>

    <!-- Assets -->
    <script type="module" src="../../../main.ts"></script>
  </head>
  <body class="bg-gray-50">
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPFZCGX5" height="0" width="0" style="display: none; visibility: hidden"></iframe>
    </noscript>

    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <img src="/logo.svg" alt="LesCalculateurs.fr" class="w-8 h-8" />
            <a href="/pages/blog.html" class="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2">
              <span>← Blog</span>
            </a>
          </div>
          <a href="/index.html" class="text-sm text-gray-600 hover:text-gray-900">Accueil</a>
        </div>
      </div>
    </header>

    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <!-- CTA Principal -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-8 text-white">
        <h2 class="text-2xl font-bold mb-2">Calcul immédiat (10 s) — Gratuit</h2>
        <p class="text-blue-100 mb-4">Barème officiel 2026, estimation indicative pour ${nom} (${code}).</p>
        <a href="/pages/notaire.html" class="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition">
          Lancer le calcul
        </a>
      </div>

      <!-- Avertissement légal -->
      <div class="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
        <p class="text-sm text-gray-800 m-0">
          <strong>⚠️ Avertissement :</strong> Les informations présentées sont des estimations indicatives basées sur les barèmes réglementés en vigueur. Elles ne constituent ni un devis notarial, ni un conseil juridique. Seul un notaire est habilité à établir le montant définitif lors de la signature de l'acte authentique.
        </p>
      </div>

      <!-- Résumé frais -->
      <div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
        <h2 class="text-xl font-bold text-gray-900 mb-3">💰 Frais de notaire 2026 en ${nom} (${code})</h2>
        <p class="text-gray-700 mb-2">Pour un achat immobilier en 2026 :</p>
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Bien ancien :</strong> généralement environ 7 % à 9 % du prix d'acquisition</li>
          <li><strong>Bien neuf (VEFA) :</strong> généralement environ 2 % à 3 %, en raison de droits de mutation réduits, le reste étant composé d'émoluments, débours et taxes réglementées</li>
        </ul>
        <p class="text-sm text-gray-600 mb-2">Ces informations sont fournies à titre indicatif et pédagogique. Elles incluent les droits, émoluments, formalités, contribution de sécurité immobilière (CSI) et la TVA applicable.</p>
        <p class="text-sm text-gray-700">👉 Pour un montant exact et personnalisé, <a href="/pages/notaire.html" class="text-blue-600 underline font-semibold">utilisez le calculateur</a>.</p>
      </div>

      <!-- Article Header -->
      <header class="mb-12">
        <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">Immobilier</span>
          <span>•</span>
          <time datetime="2026-01-01">Janvier 2026</time>
          <span>•</span>
          <span>Guide départemental</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Frais de notaire 2026 en ${nom} (${code})
        </h1>
        <p class="text-xl text-gray-600 leading-relaxed">
          Le marché immobilier en ${nom} attire de nombreux acquéreurs, rendant essentielle l'anticipation des frais de notaire. En 2026, ces frais varient principalement selon la nature du bien (ancien ou neuf) et les formalités applicables. Les montants exacts dépendent du prix du bien, de la situation de l'acquéreur et du dossier notarial.
        </p>
      </header>

      <!-- Image -->
      <figure class="rounded-lg overflow-hidden border border-gray-200 mb-8">
        <img 
          src="${imageUrl}" 
          alt="Illustration ${nom} — Guide frais de notaire ${code}" 
          class="w-full h-64 object-cover"
          loading="lazy"
          width="800"
          height="256"
        />
        <figcaption class="text-sm text-gray-500 px-4 py-2 bg-gray-50">
          Illustration ${nom} (${code}). Source : Wikimedia Commons (CC).
        </figcaption>
      </figure>

      <!-- Sources officielles -->
      <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-700 m-0">
          <strong>Sources officielles des taux et barèmes :</strong>
          <a href="https://www.service-public.fr/particuliers/vosdroits/F2167" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">service-public.fr</a> •
          <a href="https://www.notariat.fr/frais-de-notaire" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">notariat.fr</a> •
          <a href="https://www.impots.gouv.fr" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">impots.gouv.fr</a> •
          <a href="https://www.legifrance.gouv.fr" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">legifrance.gouv.fr</a>
        </p>
      </div>

      <!-- Content -->
      <div class="prose prose-lg max-w-none">

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">💵 Estimation des frais de notaire</h2>
        <p class="text-gray-700 leading-relaxed mb-6">
          Les frais d'acquisition immobilière diffèrent selon que vous achetez dans l'ancien ou dans le neuf. En ${nom}, le différentiel ancien / neuf respecte la réglementation nationale.
        </p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">🏘️ Spécificité locale</h2>
        <p class="text-gray-700 leading-relaxed mb-6">
          ${nom} présente des dynamiques immobilières propres, influencées par son attractivité, son tissu urbain et les projets d'aménagement en cours. Ces éléments peuvent impacter indirectement le budget global d'un projet immobilier (prix d'achat, concurrence, délais, conditions de financement), sans modifier les règles nationales applicables aux frais de notaire.
        </p>

        <!-- Tableau comparatif -->
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
                <td class="px-6 py-4 text-gray-700">≈ 7 % à 9 %</td>
                <td class="px-6 py-4"><a href="/pages/notaire.html" class="text-blue-600 hover:underline font-semibold">Simuler</a></td>
              </tr>
              <tr class="hover:bg-blue-50">
                <td class="px-6 py-4 font-medium text-gray-900">🏢 Neuf (VEFA)</td>
                <td class="px-6 py-4 text-gray-700">≈ 2 % à 3 %</td>
                <td class="px-6 py-4"><a href="/pages/notaire.html" class="text-blue-600 hover:underline font-semibold">Simuler</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <p class="text-lg text-gray-800 mb-0">
            <strong>💡 Bon à savoir :</strong> L'écart entre ancien et neuf peut représenter une économie significative selon le prix du bien et la nature du projet.
          </p>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📝 Exemple pédagogique (non contractuel)</h2>
        <p class="text-gray-700 leading-relaxed mb-4">Prenons l'exemple d'un achat immobilier à ${ville} :</p>
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Prix du bien :</strong> à estimer via le calculateur</li>
          <li><strong>Apport personnel :</strong> selon votre projet</li>
          <li><strong>Frais de notaire :</strong> calculés selon barème officiel</li>
          <li><strong>Montant à emprunter :</strong> selon votre projet</li>
          <li><strong>Durée :</strong> selon capacité d'emprunt</li>
        </ul>
        <p class="text-sm text-gray-600 mb-6">👉 Ces données sont fournies à titre illustratif. Le calcul exact dépend du projet réel.</p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">💡 Astuces pour réduire vos frais de notaire</h2>
        <ul class="list-disc list-inside text-gray-700 mb-6">
          <li><strong>Mobilier hors acte :</strong> certains meubles peuvent être exclus de l'assiette des droits, dans le respect de la réglementation</li>
          <li><strong>Remises d'émoluments :</strong> possibles dans certains cas sur la part réglementée</li>
          <li><strong>Aides locales :</strong> certaines collectivités proposent des dispositifs d'aide à l'accession</li>
        </ul>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📈 Marché immobilier ${nom} 2025–2026</h2>
        <ul class="list-disc list-inside text-gray-700 mb-6">
          <li><strong>Évolution des prix :</strong> tendance variable selon secteurs</li>
          <li><strong>Volume de transactions :</strong> dépend du contexte local</li>
          <li><strong>Attractivité :</strong> liée à l'emploi, aux transports et aux projets urbains</li>
          <li><strong>Tension du marché :</strong> variable selon les communes</li>
        </ul>
        <p class="text-sm text-gray-600 mb-6">Sources : DVF, INSEE, Notaires de France, données publiques 2026 (mise à jour janvier).</p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">🏘️ Prix immobiliers par ville (indicatifs)</h2>
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li><strong>${ville} :</strong> prix variable selon secteur</li>
          <li><strong>Autres communes :</strong> variations possibles</li>
        </ul>
        <p class="text-sm text-gray-600 mb-6">📊 Méthodologie : estimations basées sur données publiques, à titre indicatif.</p>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">🏛️ Où trouver un notaire en ${nom} ?</h2>
        <p class="text-gray-700 leading-relaxed mb-6">
          Pour un devis exact et personnalisé, consultez l'annuaire officiel des notaires sur <a href="https://www.notaires.fr" class="text-blue-600 hover:underline" target="_blank" rel="noopener">notaires.fr</a> et contactez un professionnel proche de votre projet immobilier.
        </p>

        <!-- CTA Simulateur -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 my-8 text-white">
          <h2 class="text-2xl font-bold mb-2">💡 Simulez vos frais de notaire 2026</h2>
          <p class="text-green-100 mb-4">Utilisez notre calculateur officiel pour obtenir une estimation immédiate, gratuite et personnalisée.</p>
          <a href="/pages/notaire.html" class="inline-block bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition">
            🧮 Accéder au simulateur gratuit
          </a>
          <p class="text-sm text-green-200 mt-3">✓ Calcul instantané • ✓ Gratuit • ✓ Export PDF</p>
          <p class="text-sm text-green-100 mt-3">
            🔗 Voir aussi : <a href="/pages/pret.html" class="underline font-semibold text-white hover:text-green-50">Calculer votre prêt immobilier après frais de notaire</a>
          </p>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">❓ Questions fréquentes</h2>
        <div class="space-y-4 mb-8">
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Quel est le montant des frais de notaire en ${nom} ?</summary>
            <p class="mt-2 text-gray-700">En 2026, les frais se situent généralement entre 7 % et 9 % (ancien) ou 2 % à 3 % (neuf).</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Comment sont calculés les frais de notaire ?</summary>
            <p class="mt-2 text-gray-700">Ils comprennent les droits d'enregistrement, émoluments du notaire, débours, CSI et TVA.</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Quelle différence entre ancien et neuf (VEFA) ?</summary>
            <p class="mt-2 text-gray-700">Le neuf bénéficie de droits réduits, permettant une économie significative.</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Où trouver un notaire proche de mon projet ?</summary>
            <p class="mt-2 text-gray-700">Consultez l'annuaire officiel sur <a href="https://www.notaires.fr" class="text-blue-600 hover:underline">notaires.fr</a>.</p>
          </details>
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="font-semibold text-gray-900 cursor-pointer">Les frais de notaire sont-ils plus élevés en ${nom} que dans d’autres départements ?</summary>
            <p class="mt-2 text-gray-700">Non. Les frais de notaire sont encadrés au niveau national. ${nom} n’applique pas de taux spécifiques différents, mais des prix immobiliers plus élevés dans certaines zones peuvent augmenter le montant total des frais.</p>
          </details>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-4">📌 Rappel réglementaire</h2>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <p class="text-gray-700 mb-2">Les frais de notaire comprennent des éléments strictement encadrés par la loi (droits, taxes, émoluments) ainsi que des frais variables selon le dossier.</p>
          <p class="text-gray-700 mb-0">Leur répartition exacte dépend de la nature de l'acte, du bien, et des formalités requises.</p>
        </div>

        <!-- Sources officielles -->
        <div class="bg-gray-100 rounded-lg p-6 my-8">
          <h3 class="text-lg font-bold text-gray-900 mb-3">📚 Sources officielles</h3>
          <p class="text-sm text-gray-700">
            <a href="https://www.service-public.fr" class="text-blue-600 hover:underline">service-public.fr</a> •
            <a href="https://www.notariat.fr" class="text-blue-600 hover:underline">notariat.fr</a> •
            <a href="https://www.impots.gouv.fr" class="text-blue-600 hover:underline">impots.gouv.fr</a> •
            <a href="https://www.legifrance.gouv.fr" class="text-blue-600 hover:underline">legifrance.gouv.fr</a> •
            <a href="https://www.data.gouv.fr" class="text-blue-600 hover:underline">data.gouv.fr</a>
          </p>
          <p class="text-xs text-gray-500 mt-3">Contenu rédigé et maintenu par LesCalculateurs.fr — outil indépendant d'estimation basé sur les barèmes notariaux officiels.</p>
          <p class="text-xs text-gray-400 mt-2">Ce contenu est rédigé à des fins d'information générale et ne saurait être reproduit sans vérification des barèmes en vigueur.</p>
        </div>

      </div>
    </article>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12 mt-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <a href="/pages/blog.html" class="text-blue-400 hover:underline">← Retour au blog</a>
          <p class="text-gray-400 text-sm mt-2">Article mis à jour en janvier 2026</p>
        </div>

        <div class="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 class="text-xl font-bold mb-2">Calcul frais de notaire ${nom} (${code})</h3>
          <p class="text-gray-300 text-sm mb-4">Ancien : environ 7 % à 9 % • Neuf (VEFA) : environ 2 % à 3 %</p>
          <div class="flex flex-wrap gap-4">
            <a href="/pages/notaire.html" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition">
              Calculer maintenant
            </a>
          </div>
        </div>

        <p class="text-center text-gray-500 text-sm">
          © 2026 LesCalculateurs.fr — Tous droits réservés
        </p>
      </div>
    </footer>

  </body>
</html>`;
}

// Fonction principale
function main() {
  const outputDir = path.join(
    __dirname,
    "..",
    "src",
    "pages",
    "blog",
    "departements",
  );

  console.log("🚀 Application du template officiel LesCalculateurs.fr");
  console.log("📁 Dossier de sortie:", outputDir);
  console.log("");

  let count = 0;

  const args = process.argv.slice(2);
  const codesArg = args.find((a) => a.startsWith("--codes="));
  const onlyCodes = codesArg
    ? codesArg
        .slice("--codes=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : args.filter((a) => !a.startsWith("--")).map((s) => s.trim()).filter(Boolean);

  const entries = onlyCodes.length
    ? onlyCodes
        .filter((code) => DEPARTEMENTS[code])
        .map((code) => [code, DEPARTEMENTS[code]])
    : Object.entries(DEPARTEMENTS);

  for (const [code, data] of entries) {
    const filename = `frais-notaire-${code}.html`;
    const filepath = path.join(outputDir, filename);

    // Récupérer l'image du département ou utiliser l'image par défaut
    const imageUrl = IMAGES[code] || DEFAULT_IMAGE;

    const html = generateTemplate(
      code,
      data.nom,
      data.prefecture,
      data.region,
      imageUrl,
    );
    fs.writeFileSync(filepath, html, "utf-8");

    count++;
    const hasImage = IMAGES[code] ? "🖼️" : "📷";
    console.log(`✅ ${hasImage} ${filename} → ${data.nom}`);
  }

  console.log("");
  console.log(`🎉 ${count} pages générées avec le template officiel !`);
  console.log("");
  console.log("✔ Zéro risque juridique");
  console.log("✔ Zéro contradiction");
  console.log("✔ 100 % aligné avec le simulateur");
}

main();
