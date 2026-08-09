import { verifierEligibilitePTZ } from "../src/utils/ptzEligibiliteCalculEngine";

describe("ptzEligibiliteCalculEngine", () => {
  test("zone A, 1 personne, RFR sous le plafond (49 000€) => éligible", () => {
    const r = verifierEligibilitePTZ({ zone: "A", nombrePersonnes: 1, revenuFiscalReference: 40000 });
    expect(r.eligible).toBe(true);
    expect(r.plafondApplicable).toBe(49000);
  });

  test("zone A, 1 personne, RFR au-dessus du plafond => non éligible", () => {
    const r = verifierEligibilitePTZ({ zone: "A", nombrePersonnes: 1, revenuFiscalReference: 60000 });
    expect(r.eligible).toBe(false);
  });

  test("RFR exactement égal au plafond => éligible (limite incluse)", () => {
    const r = verifierEligibilitePTZ({ zone: "C", nombrePersonnes: 1, revenuFiscalReference: 28500 });
    expect(r.eligible).toBe(true);
    expect(r.ecart).toBe(0);
  });

  test("zone C, 8 personnes => plafond 94 050€", () => {
    const r = verifierEligibilitePTZ({ zone: "C", nombrePersonnes: 8, revenuFiscalReference: 90000 });
    expect(r.plafondApplicable).toBe(94050);
    expect(r.eligible).toBe(true);
  });

  test("plus de 8 personnes => plafonné au palier 8", () => {
    const r = verifierEligibilitePTZ({ zone: "A", nombrePersonnes: 12, revenuFiscalReference: 150000 });
    expect(r.plafondApplicable).toBe(161700);
  });

  test("zone B1, 4 personnes => plafond 72 450€", () => {
    const r = verifierEligibilitePTZ({ zone: "B1", nombrePersonnes: 4, revenuFiscalReference: 70000 });
    expect(r.plafondApplicable).toBe(72450);
    expect(r.eligible).toBe(true);
  });
});
