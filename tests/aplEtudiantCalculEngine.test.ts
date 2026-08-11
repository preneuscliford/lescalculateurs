import { calculerAPLEtudiant } from "../src/utils/aplEtudiantCalculEngine";

describe("aplEtudiantCalculEngine", () => {
  test("cas standard éligible", () => {
    const r = calculerAPLEtudiant({
      situation: "seul",
      age: 21,
      revenus: 400,
      chargesLocatives: 450,
      personnesCharge: 0,
    });
    expect(r.eligible).toBe(true);
    expect(r.montantEstime).toBeCloseTo(247.5, 1);
  });

  test("revenus au-delà du plafond => non éligible", () => {
    const r = calculerAPLEtudiant({
      situation: "seul",
      age: 22,
      revenus: 1600,
      chargesLocatives: 450,
      personnesCharge: 0,
    });
    expect(r.eligible).toBe(false);
    expect(r.montantEstime).toBe(0);
  });

  test("loyer sous le minimum requis => non éligible", () => {
    const r = calculerAPLEtudiant({
      situation: "seul",
      age: 21,
      revenus: 400,
      chargesLocatives: 100,
      personnesCharge: 0,
    });
    expect(r.eligible).toBe(false);
  });

  test("le montant est plafonné selon la situation", () => {
    const r = calculerAPLEtudiant({
      situation: "seul",
      age: 21,
      revenus: 200,
      chargesLocatives: 1000,
      personnesCharge: 0,
    });
    expect(r.eligible).toBe(true);
    expect(r.montantEstime).toBeLessThanOrEqual(350);
  });
});
