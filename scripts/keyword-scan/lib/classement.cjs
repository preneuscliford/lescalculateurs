/**
 * Classement d'une formulation : calcul personnel (une date, un délai, un montant ou une durée
 * qui dépend de la situation de la personne) ou information générale / navigation.
 * Les motifs portent sur le texte normalisé (minuscules, sans accents).
 */
const { normaliser } = require("./normaliser.cjs");

// Recherches de navigation ou d'information générale : jamais une page de calcul
const INFORMATION = [
  /\b(numero|telephone|contact|joindre|adresse|horaires?|agence|accueil|rendez vous|rdv)\b/,
  /\b(connexion|se connecter|mon compte|espace (perso|personnel)|identifiant|mot de passe|appli|application)\b/,
  /\b(courrier|lettre|modele|cerfa|formulaire|pdf|attestation|imprimer|telecharger)\b/,
  /\b(definition|c ?'?est quoi|qu ?'?est ce|signification|veut dire|synonyme)\b/,
  /\b(avis|forum|reddit|wikipedia|actualite|news|greve|recrutement|offre d ?'?emploi|emploi store)\b/,
  // Règles d'un autre pays : hors du périmètre du site
  /\b(belgique|belge|suisse|luxembourg|quebec|canada|maroc|tunisie|algerie|senegal)\b/,
];

// Type de calcul attendu par la recherche (le premier trouvé l'emporte)
const TYPES = [
  ["date", /\b(date|quand|a partir de quand|jusqu ?'?a quand|quel jour|premier (paiement|versement)|fin de droits?)\b/],
  ["delai", /\b(delais?|combien de temps|attente|depasse|retard|carence|differe|preavis|en cours depuis|rappel)\b/],
  ["duree", /\b(duree|combien de (mois|jours|semaines|annees)|nombre de jours)\b/],
  ["montant", /\b(montant|combien|calcul(er|ette)?|simulat(ion|eur)|taux|penalite|indemnit(e|es)|baisse|degressivite|bareme)\b/],
  ["eligibilite", /\b(droits?|eligib\w*|conditions?|cumul\w*|a t ?'?on droit|peut on)\b/],
];

// Paramètres qui personnalisent la réponse (et peuvent justifier une règle différente)
const PARAMETRES = [
  ["age", /\b(\d{2}) ans\b/],
  ["contrat", /\b(cdd|cdi|interim|rupture conventionnelle|demission|licenciement|fin de contrat|saisonnier|temps partiel|apprenti\w*|alternan\w*|interimaire)\b/],
  ["montant", /\b\d+ ?(euros?|eur)\b/],
  ["duree", /\b\d+ (mois|jours|ans|semaines)\b/],
  ["situation", /\b(enceinte|naissance|enfants?|seule?|couple|parent isole|etudiant|retraite|senior|arret maladie|maladie|invalidite|inaptitude|handicap\w*|creation d ?'?entreprise|formation|conge parental)\b/],
  ["lieu", /\b(paris|lyon|marseille|toulouse|nice|nantes|strasbourg|montpellier|bordeaux|lille|rennes|departement|region|zone \d)\b/],
];

function classer(formulation) {
  const t = normaliser(formulation);
  const raisons = [];
  const info = INFORMATION.find((re) => re.test(t));
  const type = TYPES.find(([, re]) => re.test(t));
  const parametres = PARAMETRES.filter(([, re]) => re.test(t)).map(([nom]) => nom);

  if (info) {
    raisons.push(`navigation ou information (${t.match(info)[0]})`);
    return { categorie: "information", typeCalcul: null, parametres, raisons };
  }
  if (!type) {
    raisons.push("aucun marqueur de calcul (date, délai, durée, montant, droits)");
    return { categorie: "information", typeCalcul: null, parametres, raisons };
  }
  raisons.push(`calcul : ${type[0]}`);
  return { categorie: "calcul", typeCalcul: type[0], parametres, raisons };
}

module.exports = { classer };
