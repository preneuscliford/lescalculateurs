/**
 * Filtre de données personnelles du champ de question libre.
 *
 * Utilisé deux fois, avec la même liste de motifs :
 * - dans le navigateur (detecterDonneesPersonnelles) : la question n'est pas envoyée si un motif est trouvé ;
 * - sur le serveur (nettoyerDonneesPersonnelles) : ce qui passe malgré tout est supprimé avant tout
 *   traitement. Le serveur ne fait jamais confiance au filtre du navigateur.
 *
 * Le site ne collecte aucune donnée personnelle : seuls les montants, la situation familiale, la ville et
 * les dates sont utiles au calcul.
 */

export const LONGUEUR_MAX_QUESTION = 200;

export const MESSAGE_VIE_PRIVEE =
  "Pour protéger ta vie privée, n'indique ni nom, ni e-mail, ni téléphone, ni adresse. Les montants, la ville et la situation suffisent.";

export type TypeDonneePersonnelle = "email" | "telephone" | "iban" | "securite-sociale" | "adresse" | "presentation";

const TYPES_VOIE =
  "rue|avenue|av|boulevard|bd|bld|blvd|chemin|impasse|allee|place|quai|route|rte|cours|square|residence|lotissement|lot|cite|passage|faubourg|fbg|voie|sentier|hameau|lieu dit|lieudit";

/**
 * Motifs appliqués au texte normalisé (minuscules, sans accents, apostrophes droites) : voir normaliser().
 * Chaque motif doit être global (/g) pour le nettoyage.
 */
const MOTIFS: { type: TypeDonneePersonnelle; motif: RegExp }[] = [
  // E-mail, y compris écrit « arobase » ou « at »
  { type: "email", motif: /[a-z0-9._%+-]+\s*(?:@|\(at\)|\[at\]|\barobase\b)\s*[a-z0-9-]+(?:\s*(?:\.|\bpoint\b)\s*[a-z0-9-]+)+/g },
  // IBAN (avant le téléphone : un IBAN contient des suites de chiffres)
  { type: "iban", motif: /\b[a-z]{2}\s?\d{2}(?:[\s-]?[a-z0-9]{4}){3,7}(?:[\s-]?[a-z0-9]{1,4})?\b/g },
  // Numéro de sécurité sociale : 13 chiffres (+ clé de 2), séparateurs facultatifs, 2A/2B pour la Corse
  { type: "securite-sociale", motif: /\b[12][\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?(?:\d{2}|2a|2b)[\s.-]?\d{3}[\s.-]?\d{3}(?:[\s.-]?\d{2})?\b/g },
  // Téléphone : 0X XX XX XX XX, +33 X XX XX XX XX, 0033…, avec espaces, points ou tirets
  { type: "telephone", motif: /(?:\+|\b00)\s?\d{2,3}[\s.-]?\(?0?\)?[\s.-]?[1-9](?:[\s.-]?\d{2}){4}\b|\b0[1-9](?:[\s.-]?\d{2}){4}\b/g },
  // Adresse postale : numéro (bis, ter) suivi d'un type de voie et du nom de la voie
  {
    type: "adresse",
    motif: new RegExp(
      `\\b\\d{1,4}\\s*(?:bis|ter|b|t)?\\s*,?\\s*(?:${TYPES_VOIE})\\b\\.?(?:\\s+(?:de|du|des|la|le|les|l|d|a|au|aux|et)\\b)*(?:\\s+[a-z][a-z-]*){0,4}`,
      "g",
    ),
  },
  // Formule de présentation, suivie du nom (jusqu'à trois mots)
  {
    type: "presentation",
    motif:
      /\b(?:je m appelle|je m apelle|je me nomme|je me prenomme|mon nom est|mon nom c est|mon nom|mon prenom est|mon prenom c est|mon prenom|moi c est|c est moi|je suis (?:madame|monsieur|mme|mr|m\.|mlle|mademoiselle)|(?:madame|monsieur|mme|mlle|mademoiselle)\s+[a-z]{2,})(?:\s+(?!(?:et|j|je|avec|en|a|pour|combien|qui|ai|suis|de)\b)[a-z][a-z-]*){0,3}/g,
  },
];

/** Minuscules, sans accents, apostrophes et espaces normalisés (la longueur peut changer) */
export function normaliser(texte: string): string {
  return String(texte ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/'/g, " ")
    .replace(/[  \s]+/g, " ")
    .trim();
}

export interface DetectionDonneesPersonnelles {
  bloque: boolean;
  types: TypeDonneePersonnelle[];
  /** Question trop longue (au-delà de LONGUEUR_MAX_QUESTION caractères) */
  tropLongue: boolean;
}

/** Contrôle du navigateur : faut-il bloquer l'envoi de la question ? */
export function detecterDonneesPersonnelles(question: string): DetectionDonneesPersonnelles {
  const texte = normaliser(question);
  const types = MOTIFS.filter(({ motif }) => new RegExp(motif.source).test(texte)).map(({ type }) => type);
  const tropLongue = String(question ?? "").length > LONGUEUR_MAX_QUESTION;
  return { bloque: types.length > 0 || tropLongue, types, tropLongue };
}

export interface NettoyageDonneesPersonnelles {
  /** Question normalisée, débarrassée des données personnelles et tronquée */
  texte: string;
  /** Types de données retirées (jamais leur contenu) */
  retires: TypeDonneePersonnelle[];
}

/**
 * Nettoyage du serveur : retire tout ce qui ressemble à une donnée personnelle et tronque à
 * LONGUEUR_MAX_QUESTION caractères. Le texte renvoyé est normalisé (minuscules, sans accents).
 */
export function nettoyerDonneesPersonnelles(question: string): NettoyageDonneesPersonnelles {
  let texte = normaliser(String(question ?? "").slice(0, LONGUEUR_MAX_QUESTION * 2));
  const retires: TypeDonneePersonnelle[] = [];
  for (const { type, motif } of MOTIFS) {
    const suivant = texte.replace(new RegExp(motif.source, "g"), " ");
    if (suivant !== texte) retires.push(type);
    texte = suivant;
  }
  texte = texte.replace(/\s+/g, " ").trim().slice(0, LONGUEUR_MAX_QUESTION).trim();
  return { texte, retires };
}
