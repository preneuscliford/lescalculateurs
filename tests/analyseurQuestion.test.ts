import fs from "fs";
import path from "path";
import { analyserQuestion } from "../src/utils/questions/analyseurQuestion";
import { creerIndexCommunes, type DonneesZones } from "../src/utils/questions/communesZones";
import { SIMULATEURS, SIMULATEURS_IDS, validerParametres, cheminResultat, type SimulateurId } from "../src/utils/questions/simulateursQuestions";
import { nombreDeParts } from "../src/utils/questions/definitions/revenus";

const AUJOURDHUI = "2026-10-25";

const communes = creerIndexCommunes(
  JSON.parse(fs.readFileSync(path.resolve(__dirname, "../public/data/zones-apl-communes.json"), "utf8")) as DonneesZones,
);
const analyser = (q: string) => analyserQuestion(q, { communes });

describe("analyseur de questions : APL", () => {
  test("exemple du brief", () => {
    const r = analyser("combien d'APL pour 700 € de loyer avec 2 enfants à Lyon");
    expect(r.simulateur).toBe("apl");
    expect(r.validation?.params).toMatchObject({ loyer: 700, enfants: 2, zone: "zone2", ville: "Lyon", logement: "location" });
    expect(r.validation?.manquants.sort()).toEqual(["revenus", "situation"]);
  });

  test("question complète : chemin de résultat", () => {
    const r = analyser("APL couple 2 enfants, loyer 850 €, on gagne 1 900 € par mois, à Toulouse");
    expect(r.validation?.manquants).toEqual([]);
    expect(r.validation?.params).toMatchObject({ situation: "couple", enfants: 2, loyer: 850, revenus: 1900, zone: "zone2" });
    expect(r.chemin).toBe("/r/apl?loyer=850&revenus=1900&situation=couple&enfants=2&zone=zone2&logement=location&ville=Toulouse");
  });

  test("Paris (zone 1 bis rattachée à la zone 1), arrondissement", () => {
    expect(analyser("apl à paris 15e pour 1100 euros de loyer").validation?.params.zone).toBe("zone1");
  });

  test("commune de zone 3, commune composée", () => {
    expect(analyser("APL a Mézières-sur-Ponthouin loyer 400").validation?.params.zone).toBe("zone3");
    expect(analyser("apl à Saint-Étienne, loyer 380 €").validation?.params.zone).toBe("zone2");
  });

  test("homonymes : résolus par le département, sinon zone demandée", () => {
    expect(analyser("APL à Saint-Denis 93 pour 600 € de loyer").validation?.params.zone).toBe("zone1");
    expect(analyser("APL à Saint-Denis (974) pour 600 € de loyer").validation?.params.zone).toBe("dom");
    const r = analyser("APL à Saint-Denis pour 600 € de loyer");
    expect(r.validation?.manquants).toContain("zone");
    expect(r.remarques.join(" ")).toMatch(/Plusieurs communes/);
  });

  test("zone écrite, outre-mer, Mayotte", () => {
    expect(analyser("apl zone 3 loyer 500").validation?.params.zone).toBe("zone3");
    expect(analyser("apl en Guadeloupe loyer 500").validation?.params.zone).toBe("dom");
    const m = analyser("apl à Mayotte loyer 500");
    expect(m.validation?.manquants).toContain("zone");
    expect(m.remarques.join(" ")).toMatch(/Mayotte/);
  });

  test("revenus annuels ramenés au mois, mère seule, colocation", () => {
    const r = analyser("aide au logement pour une mère seule avec 1 enfant, colocation 450 € de loyer, 18 000 € de revenus par an à Rennes");
    expect(r.validation?.params).toMatchObject({ situation: "monoparental", enfants: 1, loyer: 450, revenus: 1500, logement: "colocation", zone: "zone2" });
  });

  test("sans revenu, personne seule, sans enfant par défaut", () => {
    const r = analyser("APL personne seule sans revenu loyer de 500 € à Brest");
    expect(r.validation?.params).toMatchObject({ situation: "seul", enfants: 0, revenus: 0, loyer: 500 });
    expect(r.validation?.hypotheses).toContain("enfants");
  });

  test("les mots courants ne sont pas pris pour des communes", () => {
    const r = analyser("apl mère seule en ville avec 2 enfants loyer 700");
    expect(r.commune).toBeNull();
    expect(r.validation?.params.situation).toBe("monoparental");
  });

  test("formulations courantes", () => {
    expect(analyser("APL 2 enfants 1500 euros salaire loyer 800 Marseille couple").validation?.params).toMatchObject({ loyer: 800, revenus: 1500, zone: "zone2" });
    expect(analyser("montant apl loyer 900€ salaire 2000€ célibataire Nice").validation?.params).toMatchObject({ loyer: 900, revenus: 2000, zone: "zone2" });
    expect(analyser("apl pour un studio a 480e a bordeaux je gagne 1200").validation?.params).toMatchObject({ loyer: 480, revenus: 1200 });
    expect(analyser("apl au Mans loyer 550").validation?.params).toMatchObject({ zone: "zone2", ville: "Le Mans" });
    const caf = analyser("Combien de CAF pour mon loyer de 650 euros à Nantes ? Nous sommes mariés avec 3 enfants");
    expect(caf.simulateur).toBe("apl");
    expect(caf.validation?.params).toMatchObject({ loyer: 650, situation: "couple", enfants: 3, zone: "zone2" });
  });

  test("sans index des communes : signale qu'il faut le charger", () => {
    const r = analyserQuestion("combien d'APL pour 700 € de loyer à Lyon");
    expect(r.communeAChercher).toBe(true);
    expect(r.validation?.manquants).toContain("zone");
  });
});

describe("analyseur de questions : RSA, prime d'activité, salaire", () => {
  test("RSA couple sans revenu", () => {
    const r = analyser("RSA couple 2 enfants sans revenu, hébergés chez mes parents");
    expect(r.simulateur).toBe("rsa");
    expect(r.validation?.params).toMatchObject({ situation: "couple", enfants: 2, revenus: 0, logement: "gratuit" });
    expect(r.validation?.manquants).toEqual(["activite"]);
  });

  test("RSA avec allocations chômage et APL", () => {
    const r = analyser("combien de RSA avec 450 € de chômage, seul, locataire avec APL");
    expect(r.validation?.params).toMatchObject({ situation: "seul", revenus: 450, activite: "chomage", logement: "aide_logement" });
  });

  test("prime d'activité au SMIC", () => {
    const r = analyser("prime d'activité au smic, célibataire sans enfant, propriétaire");
    expect(r.simulateur).toBe("prime-activite");
    expect(r.validation?.params).toMatchObject({ salaire: 1477.93, situation: "seul", enfants: 0, logement: "proprio", activite: "salarie" });
    expect(r.validation?.manquants).toEqual([]);
  });

  test("prime d'activité : salaire et chômage séparés", () => {
    const r = analyser("prime activite je gagne 900 € et je touche 300 € de chômage, parent isolé 2 enfants");
    expect(r.validation?.params).toMatchObject({ salaire: 900, autres: 300, situation: "monoparental", enfants: 2 });
  });

  test("salaire brut en net, cadre, annuel", () => {
    expect(analyser("2 500 € brut en net").validation?.params).toMatchObject({ brut: 2500, statut: "non_cadre" });
    expect(analyser("salaire 42 000 € brut par an cadre en net").validation?.params).toMatchObject({ brut: 3500, statut: "cadre" });
    expect(analyser("1 800 € net combien en brut").validation?.params.brut).toBeCloseTo(1800 / (1 - 0.2084), 1);
  });

  test("net en brut, SMIC seul, auto-entrepreneur", () => {
    expect(analyser("2000 net c'est combien en brut").validation?.params.brut).toBeCloseTo(2000 / (1 - 0.2084), 1);
    expect(analyser("smic net 2026").validation?.params).toMatchObject({ brut: 1867.02 });
    expect(analyser("ppa auto-entrepreneur 800€ par mois").validation?.params).toMatchObject({ salaire: 800, activite: "independant" });
  });

  test("une aide citée l'emporte sur « net »", () => {
    expect(analyser("prime d'activité pour 1 500 € net par mois").simulateur).toBe("prime-activite");
  });

  test("question hors sujet : pas de simulateur", () => {
    const r = analyser("quel temps fera-t-il demain");
    expect(r.simulateur).toBeNull();
    expect(r.chemin).toBeNull();
  });
});

describe("validation des paramètres et calcul par les moteurs", () => {
  test("les valeurs hors bornes ou inconnues sont refusées", () => {
    const v = validerParametres("apl", { loyer: "-5", revenus: "abc", situation: "marié", enfants: "2", zone: "zone9", pirate: "1" });
    expect(v.manquants.sort()).toEqual(["loyer", "revenus", "situation", "zone"]);
    expect(v.params).not.toHaveProperty("pirate");
  });

  test("chemin et relecture donnent les mêmes paramètres", () => {
    const p = { loyer: 700, revenus: 1200, situation: "couple", enfants: 2, zone: "zone2", logement: "location" };
    const chemin = cheminResultat("apl", p);
    const relu = validerParametres("apl", Object.fromEntries(new URLSearchParams(chemin.split("?")[1])));
    expect(relu.params).toEqual(p);
  });

  test("le montant vient du moteur du site", () => {
    // Même calcul que l'exemple de src/pages/apl-zones.html (couple, 1 000 €, loyer 700 €, zone 2 : 260 €)
    const r = SIMULATEURS.apl.calculer({ loyer: 700, revenus: 1000, situation: "couple", enfants: 0, zone: "zone2", logement: "location" }, AUJOURDHUI);
    expect("montant" in r && Math.round(r.montant!)).toBe(260);
  });

  test("dates : valides seulement si elles existent", () => {
    const v = validerParametres("depot-garantie", { cles: "2026-02-30", rendu: "2026-03-15" });
    expect(v.manquants).toContain("cles");
    expect(v.params.rendu).toBe("2026-03-15");
  });

  test("champ facultatif : ni demandé, ni supposé", () => {
    const v = validerParametres("retraite", { annee: 1970, mois: "5" });
    expect(v.manquants).toEqual([]);
    expect(v.params).not.toHaveProperty("trimestres");
  });

  /** Paramètres complets de chaque simulateur, pour vérifier le calcul et les variantes proches */
  const COMPLETS: Record<SimulateurId, Record<string, string | number>> = {
    apl: { loyer: 600, revenus: 1000, situation: "seul", enfants: 0, zone: "zone1", logement: "location" },
    "apl-etudiant": { loyer: 450, boursier: "oui", zone: "2", revenus: 0, logement: "classique", horsue: "non" },
    rsa: { situation: "seul", enfants: 0, revenus: 0, activite: "inactif", logement: "aide_logement" },
    "prime-activite": { salaire: 1200, situation: "seul", enfants: 0, autres: 0, logement: "loue", activite: "salarie" },
    aah: { taux: "80", situation: "seul", enfants: 0, revenus: 400, logement: "locataire" },
    asf: { cas: "parentisole", enfants: 2 },
    salaire: { brut: 2500, statut: "non_cadre", pas: 0 },
    impot: { revenu: 35000, situation: "seul", enfants: 0 },
    are: { salaire: 2200, age: 38, anciennete: 24, rupture: "non" },
    "fin-droits": { fin: "2026-10-31", inscription: "2026-11-03", rupture: "licenciement", salaire: 2600, age: 42, debut: "2022-03-01", iccp: 1300, supra: 2500 },
    "indemnite-licenciement": { salaire: 2400, anciennete: 8 },
    retraite: { annee: 1966, mois: "3" },
    notaire: { prix: 250000, bien: "ancien", departement: "33", primo: "non" },
    ptz: { zone: "B1", personnes: 3, rfr: 45000 },
    "dpe-location": { classe: "F", bail: "vide-particulier", debut: "2025-09-01", outremer: "non" },
    "depot-garantie": { type: "vide", loyer: 750, depot: 750, cles: "2026-04-30", conforme: "oui", rendu: "2026-08-15", adresse: "oui" },
  };

  test.each(SIMULATEURS_IDS)("%s : l'exemple de la barre est reconnu, calcul et variantes proches", (id) => {
    const def = SIMULATEURS[id];
    expect(analyser(def.exemple).simulateur).toBe(id);
    const v = validerParametres(id, COMPLETS[id]);
    expect(v.manquants).toEqual([]);
    const r = def.calculer(v.params, AUJOURDHUI);
    expect("principal" in r).toBe(true);
    for (const lien of def.proches(v.params)) expect(validerParametres(id, lien.params).manquants).toEqual([]);
  });
});

describe("analyseur de questions : autres simulateurs", () => {
  const params = (q: string) => analyser(q).validation?.params;

  test("frais de notaire : département par la ville ou par son nom, prix en k", () => {
    expect(params("Frais de notaire pour un appartement ancien à 250 000 € à Bordeaux")).toMatchObject({ prix: 250000, bien: "ancien", departement: "33" });
    expect(params("frais de notaire maison neuve 320000 euros dans le Rhône")).toMatchObject({ prix: 320000, bien: "neuf", departement: "69" });
    expect(params("combien de frais de notaire pour 200k premier achat")).toMatchObject({ prix: 200000, primo: "oui" });
  });

  test("frais de notaire : montant identique au moteur (exemple de la page notaire)", () => {
    const r = SIMULATEURS.notaire.calculer({ prix: 250000, bien: "ancien", departement: "33", primo: "non" }, AUJOURDHUI);
    expect("montant" in r && r.montant).toBeGreaterThan(15000);
  });

  test("impôt : nombre de parts (CGI art. 194) et revenu annuel seulement", () => {
    expect(nombreDeParts("seul", 0)).toBe(1);
    expect(nombreDeParts("couple", 2)).toBe(3);
    expect(nombreDeParts("couple", 3)).toBe(4);
    expect(nombreDeParts("monoparental", 1)).toBe(2);
    expect(params("combien d'impôts avec 35000 euros de revenu imposable célibataire")).toMatchObject({ revenu: 35000, situation: "seul" });
    const mensuel = analyser("impot 3000 € par mois marié 1 enfant");
    expect(mensuel.validation?.manquants).toEqual(["revenu"]);
  });

  test("chômage : ARE, ou fin de droits quand la question porte sur la date", () => {
    const are = analyser("je suis au chômage combien je vais toucher, je gagnais 1900 brut, 18 mois de CDD, 29 ans");
    expect(are.simulateur).toBe("are");
    expect(are.validation?.params).toMatchObject({ salaire: 1900, age: 29, anciennete: 18 });
    const fin = analyser("jusqu'à quand je touche le chômage ? rupture conventionnelle le 15 septembre 2026, inscrit le 20 septembre 2026, embauché le 1er mars 2023, 3200 brut, 56 ans");
    expect(fin.simulateur).toBe("fin-droits");
    expect(fin.validation?.params).toMatchObject({ fin: "2026-09-15", inscription: "2026-09-20", debut: "2023-03-01", rupture: "rupture-conventionnelle", salaire: 3200, age: 56 });
  });

  test("chômage cité comme revenu : la question reste une question RSA", () => {
    expect(analyser("avec 450 € de chômage, combien de RSA pour une personne seule").simulateur).toBe("rsa");
  });

  test("indemnité de licenciement : ancienneté en années et mois", () => {
    expect(params("licencié après 12 ans et 6 mois dans l'entreprise, salaire 3100 brut, combien d'indemnité de licenciement")).toMatchObject({ salaire: 3100, anciennete: 12.5 });
  });

  test("retraite : date ou mois de naissance", () => {
    expect(params("je suis née le 14/07/1968 quand puis-je partir à la retraite")).toMatchObject({ annee: 1968, mois: "7" });
    const r = analyser("retraite née en 1972 avec 120 trimestres");
    expect(r.validation?.params).toMatchObject({ annee: 1972, trimestres: 120 });
    expect(r.validation?.manquants).toEqual(["mois"]);
  });

  test("PTZ : personnes déduites du foyer", () => {
    expect(params("ptz zone A couple 2 enfants rfr 70000")).toMatchObject({ zone: "A", personnes: 4, rfr: 70000 });
  });

  test("DPE : classe, type de bail et date de début", () => {
    expect(params("mon appartement est classé G, bail meublé signé le 15 mars 2024, jusqu'à quand puis-je le louer ?")).toMatchObject({ classe: "G", bail: "meuble", debut: "2024-03-15" });
    expect(params("dpe F maison")).toMatchObject({ classe: "F", bail: "aucun" });
  });

  test("dépôt de garantie : caution et loyer distincts, dépôt pas encore rendu", () => {
    const r = analyser("mon proprio ne m'a toujours pas rendu ma caution de 1200 €, loyer 1200 €, meublé, j'ai rendu les clés le 1er juillet 2026, état des lieux avec dégradations");
    expect(r.validation?.params).toMatchObject({ type: "meuble", loyer: 1200, depot: 1200, cles: "2026-07-01", conforme: "non" });
    expect(r.validation?.params).not.toHaveProperty("rendu");
    expect(r.validation?.manquants).toEqual(["adresse"]);
  });

  test("AAH, ASF, APL étudiant", () => {
    expect(params("AAH 60% en couple 900 euros de revenus hébergée chez mes parents")).toMatchObject({ taux: "50", situation: "couple", revenus: 900, logement: "heberge" });
    expect(params("ASF orphelin 1 enfant")).toMatchObject({ cas: "orphelin", enfants: 1 });
    const etudiant = analyser("apl étudiant non boursier 380 € de loyer à Toulouse en résidence universitaire");
    expect(etudiant.simulateur).toBe("apl-etudiant");
    expect(etudiant.validation?.params).toMatchObject({ loyer: 380, boursier: "non", zone: "2", logement: "foyer" });
  });

  test("RSA : « ne travaille pas » n'est pas une activité", () => {
    expect(params("RSA seul, je ne travaille pas, sans revenu, logé gratuitement")).toMatchObject({ activite: "inactif", revenus: 0, logement: "gratuit" });
  });
});
