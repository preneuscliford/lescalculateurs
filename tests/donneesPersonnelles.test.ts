import {
  detecterDonneesPersonnelles,
  nettoyerDonneesPersonnelles,
  LONGUEUR_MAX_QUESTION,
} from "../src/utils/questions/donneesPersonnelles";

/** Question contenant une donnée personnelle, et le fragment qui ne doit plus apparaître après nettoyage */
const AVEC_DONNEES: [string, string][] = [
  ["combien d'APL, mon mail est jean.dupont@gmail.com", "dupont"],
  ["APL pour 700 € de loyer, écrivez-moi : marie_l+caf@orange.fr", "orange"],
  ["rsa ? contact jean point dupont arobase gmail point com", "dupont"],
  ["prime d'activité, appelez-moi au 06 12 34 56 78", "56 78"],
  ["APL loyer 600 € tel 0612345678", "0612345678"],
  ["mon numéro 06.12.34.56.78 pour l'APL", "56.78"],
  ["mon numéro 06-12-34-56-78", "56-78"],
  ["rsa couple +33 6 12 34 56 78", "56 78"],
  ["rsa couple +33 (0)6 12 34 56 78", "56 78"],
  ["prime activite 0033 612345678", "612345678"],
  ["fixe 01 45 67 89 10 combien d'apl", "89 10"],
  ["virement sur FR76 3000 6000 0112 3456 7890 189 pour mon APL", "3456"],
  ["mon iban FR7630006000011234567890189", "fr7630006000011234567890189"],
  ["iban BE68 5390 0754 7034", "7034"],
  ["mon numéro de sécu 1 85 05 78 006 084 36", "006 084"],
  ["sécurité sociale 185057800608436 rsa", "185057800608436"],
  ["secu 2 90 12 2A 004 123 rsa", "2a 004"],
  ["j'habite au 12 rue de la Paix à Lyon, combien d'APL ?", "paix"],
  ["APL pour le 3 bis avenue Victor Hugo, 700 € de loyer", "victor"],
  ["loyer 650 € au 45 bd Haussmann", "haussmann"],
  ["8 allée des Tilleuls, Rennes, APL étudiant", "tilleuls"],
  ["APL 27 chemin des Vignes 600 euros", "vignes"],
  ["je m'appelle Jean Dupont, combien d'APL avec 2 enfants", "dupont"],
  ["Je m’appelle Marie et je gagne 1200 €", "marie"],
  ["mon nom est Martin, RSA pour une personne seule", "martin"],
  ["mon prénom c'est Kevin, prime d'activité", "kevin"],
  ["je suis Madame Durand, APL", "durand"],
  ["Monsieur Lefebvre 1500 € de salaire prime d'activité", "lefebvre"],
  ["moi c'est Sophie, APL à Lille", "sophie"],
  ["prime d'activité, j'habite 12 rue Nationale", "nationale"],
];

/** Questions sans donnée personnelle : elles doivent passer telles quelles */
const SANS_DONNEES = [
  "combien d'APL pour 700 € de loyer avec 2 enfants à Lyon",
  "RSA couple 2 enfants sans revenu",
  "prime d'activité pour 1 500 € net par mois, célibataire",
  "salaire 2 500 € brut en net",
  "APL zone 2, loyer 1 200 €, revenus 24 000 € par an",
  "APL étudiant 450 € de loyer à Saint-Denis 93",
  "j'ai 3 enfants et je gagne 1867,02 € brut",
  "APL pour un loyer de 750 € au 1er janvier 2027",
  "rsa avec 650 euros de chômage en 2026",
  "combien d'APL à Paris 15e pour 1100 euros",
  "prime d'activité au smic avec 1 enfant",
  "APL pour 1 200 € de loyer, 2 400 € de revenus et 3 enfants",
  "RSA 2026 pour un couple avec 4 enfants, 0 revenu",
  "salaire 32 000 € brut par an en net mensuel",
  "APL à Marseille 13 pour 800 euros, mère seule avec 2 enfants",
  "frais de notaire pour 250 000 € dans le 69",
];

describe("filtre de données personnelles (navigateur)", () => {
  test.each(AVEC_DONNEES)("bloque : %s", (question) => {
    const r = detecterDonneesPersonnelles(question);
    expect(r.bloque).toBe(true);
    expect(r.types.length).toBeGreaterThan(0);
  });

  test.each(SANS_DONNEES)("laisse passer : %s", (question) => {
    expect(detecterDonneesPersonnelles(question)).toEqual({ bloque: false, types: [], tropLongue: false });
  });

  test("bloque une question trop longue", () => {
    const r = detecterDonneesPersonnelles("a".repeat(LONGUEUR_MAX_QUESTION + 1));
    expect(r.bloque).toBe(true);
    expect(r.tropLongue).toBe(true);
  });
});

describe("nettoyage des données personnelles (serveur)", () => {
  test.each(AVEC_DONNEES)("nettoie : %s", (question, fragment) => {
    const r = nettoyerDonneesPersonnelles(question);
    expect(r.texte).not.toContain(fragment.toLowerCase());
    expect(r.retires.length).toBeGreaterThan(0);
    expect(r.texte).not.toMatch(/@|\d{5,}|(?:\d{2}[\s.-]){3,}\d{2}/);
  });

  test("garde les informations utiles au calcul", () => {
    const r = nettoyerDonneesPersonnelles("je m'appelle Jean Dupont, combien d'APL avec 2 enfants à Lyon pour 700 € de loyer");
    expect(r.texte).toContain("apl");
    expect(r.texte).toContain("2 enfants");
    expect(r.texte).toContain("lyon");
    expect(r.texte).toContain("700");
  });

  test.each(SANS_DONNEES)("ne retire rien : %s", (question) => {
    expect(nettoyerDonneesPersonnelles(question).retires).toEqual([]);
  });

  test("tronque à la longueur maximale", () => {
    expect(nettoyerDonneesPersonnelles("apl ".repeat(200)).texte.length).toBeLessThanOrEqual(LONGUEUR_MAX_QUESTION);
  });
});
