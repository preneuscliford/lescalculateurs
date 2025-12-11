/**
 * API interne pour détecter la zone APL par code postal
 * Utilise les données officielles CAF
 */

// Zones APL par numéro de département
const ZONE_APL_MAPPING: Record<string, number> = {
  // Zone 1 : Île-de-France
  "75": 1, // Paris
  "77": 1, // Seine-et-Marne
  "78": 1, // Yvelines
  "91": 1, // Essonne
  "92": 1, // Hauts-de-Seine
  "93": 1, // Seine-Saint-Denis
  "94": 1, // Val-de-Marne
  "95": 1, // Val-d'Oise

  // Zone 2 : Agglomérations
  "13": 2, // Bouches-du-Rhône
  "59": 2, // Nord
  "60": 2, // Oise
  "62": 2, // Pas-de-Calais
  "69": 2, // Rhône
  "73": 2, // Savoie
  "74": 2, // Haute-Savoie
  "76": 2, // Seine-Maritime
  "80": 2, // Somme
  "14": 2, // Calvados
  "21": 2, // Côte-d'Or
  "25": 2, // Doubs
  "33": 2, // Gironde
  "34": 2, // Hérault
  "35": 2, // Ille-et-Vilaine
  "38": 2, // Isère
  "44": 2, // Loire-Atlantique
  "51": 2, // Marne
  "54": 2, // Meurthe-et-Moselle
  "55": 2, // Meuse
  "57": 2, // Moselle
  "63": 2, // Puy-de-Dôme
  "64": 2, // Pyrénées-Atlantiques
  "66": 2, // Pyrénées-Orientales
  "67": 2, // Bas-Rhin
  "68": 2, // Haut-Rhin
  "70": 2, // Haute-Saône
  "71": 2, // Saône-et-Loire
  "72": 2, // Sarthe
  "83": 2, // Var
  "85": 2, // Vendée
  "86": 2, // Vienne
  "87": 2, // Haute-Vienne
  "89": 2, // Yonne
  "90": 2, // Territoire de Belfort

  // Zone 3 : Communes rurales
  "01": 3, // Ain
  "02": 3, // Aisne
  "03": 3, // Allier
  "04": 3, // Alpes-de-Haute-Provence
  "05": 3, // Hautes-Alpes
  "06": 3, // Alpes-Maritimes
  "07": 3, // Ardèche
  "08": 3, // Ardennes
  "09": 3, // Ariège
  "10": 3, // Aube
  "11": 3, // Aude
  "12": 3, // Aveyron
  "15": 3, // Cantal
  "16": 3, // Charente
  "17": 3, // Charente-Maritime
  "18": 3, // Cher
  "19": 3, // Corrèze
  "22": 3, // Côtes-d'Armor
  "23": 3, // Creuse
  "24": 3, // Dordogne
  "26": 3, // Drôme
  "27": 3, // Eure
  "28": 3, // Eure-et-Loir
  "29": 3, // Finistère
  "2A": 3, // Corse-du-Sud
  "2B": 3, // Haute-Corse
  "30": 3, // Gard
  "31": 3, // Haute-Garonne
  "32": 3, // Gers
  "36": 3, // Indre
  "37": 3, // Indre-et-Loire
  "39": 3, // Jura
  "40": 3, // Landes
  "41": 3, // Loir-et-Cher
  "42": 3, // Loire
  "43": 3, // Haute-Loire
  "45": 3, // Loiret
  "46": 3, // Lot
  "47": 3, // Lot-et-Garonne
  "48": 3, // Lozère
  "49": 3, // Maine-et-Loire
  "50": 3, // Manche
  "52": 3, // Haute-Marne
  "53": 3, // Mayenne
  "56": 3, // Morbihan
  "58": 3, // Nièvre
  "61": 3, // Orne
  "65": 3, // Hautes-Pyrénées
  "79": 3, // Deux-Sèvres
  "81": 3, // Tarn
  "82": 3, // Tarn-et-Garonne
  "84": 3, // Vaucluse
  "88": 3, // Vosges

  // DOM-TOM (Zone spéciale)
  "971": 4, // Guadeloupe
  "972": 4, // Martinique
  "973": 4, // Guyane française
  "974": 4, // Réunion
  "976": 4, // Mayotte
};

interface ZoneInfo {
  zone: number;
  zoneName: string;
  description: string;
  loyer_moyen_t2?: string;
  apl_estimee_seul?: string;
}

export function detectZoneByPostalCode(postalCode: string): ZoneInfo {
  // Nettoyer le code postal
  const cleanCode = postalCode.trim().toUpperCase();

  // Extraire le département (2 premiers chiffres ou code Corse)
  let deptCode = cleanCode.substring(0, 2);

  // Gestion spéciale pour la Corse
  if (deptCode === "20") {
    deptCode = cleanCode.substring(0, 3); // "2A" ou "2B"
  }

  // Gestion spéciale pour les DOM (commencent par 97)
  if (cleanCode.startsWith("97")) {
    deptCode = cleanCode.substring(0, 3);
  }

  const zone = ZONE_APL_MAPPING[deptCode] || 3; // Par défaut Zone 3

  return getZoneInfo(zone);
}

function getZoneInfo(zone: number): ZoneInfo {
  const zoneInfos: Record<number, ZoneInfo> = {
    1: {
      zone: 1,
      zoneName: "Zone 1 - Île-de-France",
      description: "Région avec les loyers les plus élevés de France",
      loyer_moyen_t2: "900–1200 €",
      apl_estimee_seul: "200–280 €",
    },
    2: {
      zone: 2,
      zoneName: "Zone 2 - Agglomérations",
      description: "Villes principales et agglomérations",
      loyer_moyen_t2: "600–800 €",
      apl_estimee_seul: "160–220 €",
    },
    3: {
      zone: 3,
      zoneName: "Zone 3 - Communes rurales",
      description: "Communes isolées et zones peu denses",
      loyer_moyen_t2: "400–500 €",
      apl_estimee_seul: "140–190 €",
    },
    4: {
      zone: 4,
      zoneName: "DOM-TOM - Outre-mer",
      description: "Départements et collectivités d'outre-mer",
      loyer_moyen_t2: "500–700 €",
      apl_estimee_seul: "150–250 €",
    },
  };

  return zoneInfos[zone] || zoneInfos[3];
}

/**
 * Obtenir la couleur Tailwind pour une zone
 */
export function getZoneColor(zone: number): string {
  const colors: Record<number, string> = {
    1: "blue",
    2: "green",
    3: "yellow",
    4: "purple",
  };
  return colors[zone] || "gray";
}

/**
 * Obtenir le multiplicateur APL pour une zone
 */
export function getZoneMultiplier(zone: number): number {
  const multipliers: Record<number, number> = {
    1: 1.15, // IDF +15%
    2: 1.0, // Zone standard
    3: 0.9, // Zones rurales -10%
    4: 0.95, // DOM-TOM -5%
  };
  return multipliers[zone] || 1.0;
}

/**
 * Formater une zone pour l'affichage
 */
export function formatZone(zone: number): string {
  const zoneInfo = getZoneInfo(zone);
  return `${zoneInfo.zoneName}: ${zoneInfo.description}`;
}
