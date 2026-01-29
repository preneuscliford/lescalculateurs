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

  test("APL positive pour revenus modestes et loyer élevé, plafonnée", () => {
    const r = calculerAPL({
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 900,
      loyer_mensuel: 800,
      region: "idf",
    });
    expect(r.success).toBe(true);
    expect(r.data?.apl_estimee).toBeGreaterThan(0);
    expect(r.data?.apl_estimee).toBeLessThanOrEqual(r.data?.plafond_apl ?? Number.POSITIVE_INFINITY);
  });
});

