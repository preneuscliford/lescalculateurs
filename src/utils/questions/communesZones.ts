/**
 * Commune citée dans une question : département et zone APL, d'après public/data/zones-apl-communes.json
 * (généré par scripts/build-zones-apl.cjs depuis les données du simulateur service-public).
 */

export type CodeZone = "1" | "2" | "3" | "D" | "M";

export interface DonneesZones {
  /** departements[département][zone] = noms de communes normalisés */
  departements: Record<string, Partial<Record<CodeZone, string[]>>>;
}

export interface Localisation {
  departement: string;
  zone: CodeZone;
}

export interface CommuneTrouvee {
  /** Nom tel qu'écrit dans la question (normalisé) */
  nom: string;
  /** Département et zone, ou null si plusieurs communes portent ce nom et que le département n'est pas cité */
  departement: string | null;
  zone: CodeZone | null;
  /** Départements possibles pour un homonyme non résolu */
  departements?: string[];
}

export interface IndexCommunes {
  localisations(nom: string): Localisation[];
}

/** Même normalisation que scripts/build-zones-apl.cjs */
export function normaliserNomCommune(nom: string): string {
  return String(nom)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bst(e?)\b/g, "saint$1")
    .trim();
}

export function creerIndexCommunes(donnees: DonneesZones): IndexCommunes {
  const parNom = new Map<string, Localisation[]>();
  for (const [departement, zones] of Object.entries(donnees.departements)) {
    for (const [zone, noms] of Object.entries(zones) as [CodeZone, string[]][]) {
      for (const nom of noms) {
        if (!parNom.has(nom)) parNom.set(nom, []);
        parNom.get(nom)!.push({ departement, zone });
      }
    }
  }
  return { localisations: (nom) => parNom.get(nom) ?? [] };
}

/**
 * Noms de communes qui sont aussi des mots courants des questions : jamais pris pour une commune
 * (« mère seule », « en ville »…).
 */
const MOTS_COURANTS = new Set([
  "mer", "mere", "pere", "parent", "ville", "campagne", "plus", "moins", "an", "mois", "enfant", "enfants",
  "couple", "seul", "seule", "loyer", "aide", "net", "brut", "zone", "france", "logement", "location",
  "y", "eu", "bus", "port", "val", "mont", "plan", "bois", "lac", "la", "le", "les", "pont", "font",
  "neuf", "ancien", "terrain", "maison", "appartement", "bail", "vide", "notaire",
]);

/** Prépositions qui introduisent une commune */
const PREPOSITIONS = /\b(?:a|au|aux|sur|dans|vers|habite|habitant|vis|vit|commune de|ville de|pres de)\s+/g;

/** Départements cités dans la question : « 93 », « (69) », « dans le 13 », « 974 » */
export function departementsCites(texte: string): string[] {
  const deps = new Set<string>();
  for (const m of texte.matchAll(/(?:\(|\bdans le |\ble |\ben |\b)(\d{2,3}|2a|2b)(?:\)|\b)(?!\s*(?:€|e\b|eur|euro|k|000|enfant|ans?\b|%|mois|m2|m²))/g)) {
    const d = m[1].toUpperCase();
    if (/^(0[1-9]|[1-8]\d|9[0-5]|97[1-6]|2A|2B)$/.test(d)) deps.add(d);
  }
  return [...deps];
}

/**
 * Cherche une commune dans une question déjà normalisée (normaliserNomCommune) :
 * la plus longue suite de 1 à 6 mots après une préposition (« à Lyon », « sur Saint-Denis »).
 */
export function trouverCommune(texteNormalise: string, index: IndexCommunes): CommuneTrouvee | null {
  const texte = texteNormalise.replace(/\b(paris|lyon|marseille) \d{1,2}(?:e|eme|er)?\b/g, "$1");
  const deps = departementsCites(texte);
  const resoudre = (nom: string, locs: Localisation[]): CommuneTrouvee => {
    const zones = new Set(locs.map((l) => l.zone));
    const cites = locs.filter((l) => deps.includes(l.departement));
    const loc = locs.length === 1 ? locs[0] : cites.length === 1 ? cites[0] : null;
    if (loc) return { nom, departement: loc.departement, zone: loc.zone };
    return {
      nom,
      departement: null,
      // Homonymes tous dans la même zone : la zone est connue même sans le département
      zone: zones.size === 1 ? locs[0].zone : null,
      departements: locs.map((l) => l.departement),
    };
  };

  // 1. Après une préposition : « à Lyon », « au Mans » (Le Mans), « aux Mureaux » (Les Mureaux)
  for (const m of texte.matchAll(PREPOSITIONS)) {
    const mots = texte.slice((m.index ?? 0) + m[0].length).split(" ");
    const article = ({ au: "le ", aux: "les " } as Record<string, string>)[m[0].trim()] ?? "";
    for (let n = Math.min(6, mots.length); n >= 1; n--) {
      const suite = mots.slice(0, n).join(" ");
      if (MOTS_COURANTS.has(suite) || /^\d/.test(suite)) continue;
      for (const nom of article ? [article + suite, suite] : [suite]) {
        const locs = index.localisations(nom);
        if (locs.length) return resoudre(nom, locs);
      }
    }
  }

  // 2. Sans préposition (« APL Marseille couple ») : seulement une commune unique des zones 1 et 2 ou
  // d'outre-mer, de plus de trois lettres, pour ne pas confondre un mot courant avec un village
  const mots = texte.split(" ");
  for (let n = 4; n >= 1; n--) {
    for (let i = 0; i + n <= mots.length; i++) {
      const nom = mots.slice(i, i + n).join(" ");
      if (nom.length <= 3 || MOTS_COURANTS.has(nom) || /\d/.test(nom)) continue;
      const locs = index.localisations(nom);
      if (locs.length === 1 && ["1", "2", "D"].includes(locs[0].zone)) return resoudre(nom, locs);
    }
  }
  return null;
}

let chargement: Promise<IndexCommunes> | null = null;

/** Charge (une seule fois) le fichier des communes dans le navigateur */
export function chargerIndexCommunes(url = "/data/zones-apl-communes.json"): Promise<IndexCommunes> {
  chargement ??= fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`communes ${r.status}`);
      return r.json() as Promise<DonneesZones>;
    })
    .then(creerIndexCommunes)
    .catch((e) => {
      chargement = null;
      throw e;
    });
  return chargement;
}
