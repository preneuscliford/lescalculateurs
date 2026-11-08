import { calculerAidesFoyer } from "../src/utils/aidesFoyerCalculEngine";
import { calculerRSA } from "../src/utils/rsaCalculEngine";
import { socialBaremes } from "../src/data/social-baremes";

const parentIsole = (enfants: number, salaire: number, majorationIsolement = false) =>
  calculerAidesFoyer({ situation: "parent-isole", enfants, salaire, zone: "zone2", loyer: 460 + (enfants - 1) * 60, majorationIsolement });

describe("aides d'un foyer (parent isolé)", () => {
  test("RSA majoré : 836,85 € (grossesse) et 1 115,80 € avec un enfant, montants publiés au 1er avril 2026", () => {
    const base = (enfants: number) =>
      calculerRSA({ situation: "seul", enfants, revenus: 0, logement: "loue", activite: "inactif", majorationIsolement: true }).details.montantBase;
    expect(base(0)).toBeCloseTo(836.85, 2);
    expect(base(1)).toBeCloseTo(1115.8, 2);
    expect(base(2)).toBeCloseTo(1394.75, 2);
  });

  test("1 enfant sans revenu : RSA = 977,54 − forfait logement 156,41 − ASF comptée 107,59 = 713,54 €", () => {
    const r = parentIsole(1, 0);
    expect(socialBaremes.asf.partRessourcesRsaPrime * socialBaremes.bmaf.montant).toBeCloseTo(107.59, 2);
    expect(r.rsa).toBeCloseTo(713.54, 2);
    expect(r.asf).toBeCloseTo(200.78, 2);
    expect(r.allocationsFamiliales).toBe(0);
    expect(r.prime).toBe(0);
    expect(r.apl).toBeGreaterThan(0);
    expect(r.aides).toBeCloseTo(r.rsa + r.prime + r.apl + r.asf + r.allocationsFamiliales, 2);
    // avec majoration : 1 115,80 − 156,41 − 107,59
    expect(parentIsole(1, 0, true).rsa).toBeCloseTo(851.8, 2);
  });

  test("2 enfants : allocations familiales versées et déduites du RSA", () => {
    const r = parentIsole(2, 0);
    expect(r.allocationsFamiliales).toBeCloseTo(152.25, 2);
    // 651,69 × 1,8 − 152,25 − 2 × 107,59 − 193,55 (forfait 3 personnes)
    expect(r.rsa).toBeCloseTo(1173.04 - 152.25 - 215.18 - 193.55, 1);
  });

  test("petit salaire : RSA et prime d'activité se cumulent", () => {
    const r = parentIsole(1, 700);
    expect(r.rsa).toBeGreaterThan(0);
    expect(r.prime).toBeGreaterThan(0);
    expect(r.total).toBeCloseTo(700 + r.aides, 2);
  });

  test("plus le salaire monte, plus le revenu total augmente", () => {
    for (const enfants of [1, 2, 3, 4]) {
      const totaux = [0, 700, 1000, 1478, 2000].map((s) => parentIsole(enfants, s).total);
      for (let i = 1; i < totaux.length; i++) expect(totaux[i]).toBeGreaterThan(totaux[i - 1]);
    }
  });
});
