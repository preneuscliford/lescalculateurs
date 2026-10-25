import fs from "fs";
import path from "path";
import { analyserQuestion } from "../src/utils/questions/analyseurQuestion";
import { creerIndexCommunes, type DonneesZones } from "../src/utils/questions/communesZones";
import { SIMULATEURS, validerParametres, cheminResultat } from "../src/utils/questions/simulateursQuestions";

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
    expect(analyser("apl étudiant à Saint-Étienne, loyer 380 €").validation?.params.zone).toBe("zone2");
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
    const r = SIMULATEURS.apl.calculer({ loyer: 700, revenus: 1000, situation: "couple", enfants: 0, zone: "zone2", logement: "location" });
    expect("montant" in r && Math.round(r.montant)).toBe(260);
  });

  test.each(Object.keys(SIMULATEURS))("%s : calcul et variantes proches", (id) => {
    const def = SIMULATEURS[id as keyof typeof SIMULATEURS];
    const exemple: Record<string, Record<string, string | number>> = {
      apl: { loyer: 600, revenus: 1000, situation: "seul", enfants: 0, zone: "zone1", logement: "location" },
      rsa: { situation: "seul", enfants: 0, revenus: 0, activite: "inactif", logement: "aide_logement" },
      "prime-activite": { salaire: 1200, situation: "seul", enfants: 0, autres: 0, logement: "loue", activite: "salarie" },
      salaire: { brut: 2500, statut: "non_cadre", pas: 0 },
    };
    const r = def.calculer(exemple[id]);
    expect("montant" in r).toBe(true);
    for (const lien of def.proches(exemple[id])) expect(validerParametres(def.id, lien.params).manquants).toEqual([]);
  });
});
