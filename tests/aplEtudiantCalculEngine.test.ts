import { calculerAPLEtudiant } from "../src/utils/aplEtudiantCalculEngine";

const base = {
  situation: "seul" as const,
  revenus: 400,
  chargesLocatives: 450,
  personnesCharge: 0,
  zone: "2" as const,
};

describe("aplEtudiantCalculEngine", () => {
  test("non boursier : ressources retenues au moins égales au forfait de 8 600 EUR/an", () => {
    const r = calculerAPLEtudiant(base);
    expect(r.eligible).toBe(true);
    expect(r.details.ressourcesRetenues).toBeCloseTo(716.67, 1);
    // loyer plafonné 293,68 + charges 61,29 - participation (30 % x 716,67 - 72) = 211,97 -> 211
    expect(r.montantEstime).toBe(211);
  });

  test("boursier : forfait plus bas (6 900 EUR/an), donc APL plus élevée", () => {
    const r = calculerAPLEtudiant({ ...base, boursier: true });
    expect(r.details.ressourcesRetenues).toBeCloseTo(575, 1);
    expect(r.montantEstime).toBe(254);
  });

  test("étudiant hors UE non boursier sans exception => non éligible (réforme du 01/07/2026)", () => {
    const r = calculerAPLEtudiant({ ...base, horsUE: true });
    expect(r.eligible).toBe(false);
    expect(r.montantEstime).toBe(0);
    expect(r.explication).toMatch(/1er juillet 2026/);
  });

  test("étudiant hors UE : boursier ou apprenti => reste éligible", () => {
    expect(calculerAPLEtudiant({ ...base, horsUE: true, boursier: true }).eligible).toBe(true);
    expect(calculerAPLEtudiant({ ...base, horsUE: true, exception: "apprenti" }).eligible).toBe(true);
  });

  test("revenus élevés => aide nulle", () => {
    const r = calculerAPLEtudiant({ ...base, revenus: 2000 });
    expect(r.eligible).toBe(false);
    expect(r.montantEstime).toBe(0);
  });

  test("le loyer est retenu dans la limite du plafond de la zone", () => {
    const r = calculerAPLEtudiant({ ...base, chargesLocatives: 1000, zone: "1" });
    expect(r.details.plafondLoyer).toBeCloseTo(336.97, 2);
    expect(r.details.loyerRetenu).toBeCloseTo(336.97, 2);
  });
});
