import { calculerASF } from "../src/utils/asfCalculEngine";

describe("asfCalculEngine", () => {
  test("pas d'enfant à charge => non éligible", () => {
    const r = calculerASF({
      situation: "parentisole",
      nombreEnfants: 2,
      revenus: 1200,
      enfantACharge: false,
    });
    expect(r.eligible).toBe(false);
    expect(r.montantEstime).toBe(0);
  });

  test("zéro enfant déclaré => non éligible", () => {
    const r = calculerASF({
      situation: "parentisole",
      nombreEnfants: 0,
      revenus: 1200,
      enfantACharge: true,
    });
    expect(r.eligible).toBe(false);
  });

  test("parent isolé, 2 enfants => montant standard x 2", () => {
    const r = calculerASF({
      situation: "parentisole",
      nombreEnfants: 2,
      revenus: 1200,
      enfantACharge: true,
    });
    expect(r.eligible).toBe(true);
    expect(r.montantEstime).toBeCloseTo(401.56, 1);
    expect(r.details.montantParEnfant).toBeCloseTo(200.78, 1);
  });

  test("enfant privé de ses deux parents => montant majoré", () => {
    const r = calculerASF({
      situation: "depourvu",
      nombreEnfants: 1,
      revenus: 1200,
      enfantACharge: true,
    });
    expect(r.eligible).toBe(true);
    expect(r.montantEstime).toBeCloseTo(267.63, 1);
  });

  test("l'ASF est versée sans condition de ressources", () => {
    const rBasRevenus = calculerASF({
      situation: "parentisole",
      nombreEnfants: 1,
      revenus: 0,
      enfantACharge: true,
    });
    const rHautRevenus = calculerASF({
      situation: "parentisole",
      nombreEnfants: 1,
      revenus: 5000,
      enfantACharge: true,
    });
    expect(rBasRevenus.montantEstime).toBe(rHautRevenus.montantEstime);
  });
});
