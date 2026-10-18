import { calculerAPL } from "../src/utils/aplCalculEngine";

describe("aplCalculEngine", () => {
  test("refuse les entrées incomplètes", () => {
    const r = calculerAPL({
      situation: "seul",
      enfants: 0,
      revenus_mensuels: -10,
      loyer_mensuel: 500,
      region: "province",
    });
    expect(r.success).toBe(false);
  });

  test("APL est nulle pour revenus élevés (raison_zero renseignée)", () => {
    const r = calculerAPL({
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 8000,
      loyer_mensuel: 400,
      region: "province",
    });
    expect(r.success).toBe(true);
    expect(r.data?.apl_estimee).toBe(0);
    expect(r.data?.raison_zero).toBeTruthy();
  });

  test("formule officielle : personne seule, zone 2, 900 EUR/mois, loyer 500 EUR", () => {
    const r = calculerAPL({
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 900,
      loyer_mensuel: 500,
      region: "province",
    });
    const d = r.data!;
    expect(d.loyer_pris_compte).toBe(293.68); // plafond art. 7
    expect(d.forfait_charges).toBe(61.29); // art. 9
    expect(d.ressources_annuelles).toBe(9800); // 900 x 12 x 0,9 = 9 720, centaine supérieure
    expect(d.abattement_r0).toBe(5235); // art. 15
    expect(d.taux_participation).toBeCloseTo(0.03135, 5); // TF 2,83 % + TL 0,305 % (RL = 100 %)
    // Pp = 40,01 + 3,135 % x 4 565 = 183,12 ; 354,97 - 183,12 - 5 = 166,85 ; CRDS -> 166
    expect(d.apl_estimee).toBe(166);
  });

  // Plafonds de ressources publiés par la CAF au 01/10/2026 (au-delà, aucune aide)
  const seuilAnnulation = (situation: "seul" | "couple", region: "idf" | "province", loyer: number) => {
    let m = 0;
    const calc = (rev: number) =>
      calculerAPL({ situation, enfants: 0, revenus_mensuels: rev, loyer_mensuel: loyer, region }).data!;
    while (calc(m).apl_estimee > 0) m += 5;
    return calc(m).ressources_annuelles;
  };
  test("seuils d'annulation conformes aux plafonds CAF", () => {
    expect(seuilAnnulation("seul", "idf", 340)).toBe(15900);
    expect(seuilAnnulation("seul", "province", 300)).toBe(14900);
    expect(Math.abs(seuilAnnulation("couple", "province", 360) - 18200)).toBeLessThanOrEqual(100);
  });

  test("dégressivité puis suppression pour un loyer très élevé (art. 10)", () => {
    const calc = (loyer: number) =>
      calculerAPL({ situation: "seul", enfants: 0, revenus_mensuels: 0, loyer_mensuel: loyer, region: "province" }).data!;
    expect(calc(700).coefficient_degressivite).toBe(1); // < 2,5 x 293,68
    expect(calc(800).coefficient_degressivite).toBeLessThan(1);
    expect(calc(950).apl_estimee).toBe(0); // > 3,1 x 293,68
  });

  test("accession : plus de nouvelle aide depuis 2018", () => {
    const r = calculerAPL({ situation: "seul", enfants: 0, revenus_mensuels: 500, loyer_mensuel: 500, region: "province", type_logement: "accession" });
    expect(r.data?.apl_estimee).toBe(0);
    expect(r.data?.raison_zero).toMatch(/2018/);
  });

  test("zones : zone 3 plafonnée plus bas que la zone 2, alias idf/province conservés", () => {
    const base = { situation: "seul" as const, enfants: 0, revenus_mensuels: 900, loyer_mensuel: 600 };
    const z1 = calculerAPL({ ...base, region: "zone1" }).data!;
    const z2 = calculerAPL({ ...base, region: "zone2" }).data!;
    const z3 = calculerAPL({ ...base, region: "zone3" }).data!;
    expect(z1.plafond_loyer).toBe(336.97);
    expect(z2.plafond_loyer).toBe(293.68);
    expect(z3.plafond_loyer).toBe(275.25);
    expect(z3.apl_estimee).toBeLessThan(z2.apl_estimee);
    expect(calculerAPL({ ...base, region: "idf" }).data!.apl_estimee).toBe(z1.apl_estimee);
    expect(calculerAPL({ ...base, region: "province" }).data!.apl_estimee).toBe(z2.apl_estimee);
  });

  test("outre-mer : plafonds de la zone II (Martinique, personne seule : 293,68 EUR)", () => {
    const r = calculerAPL({ situation: "seul", enfants: 0, revenus_mensuels: 900, loyer_mensuel: 600, region: "dom" }).data!;
    expect(r.plafond_loyer).toBe(293.68);
  });
});
