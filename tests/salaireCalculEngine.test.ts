import { calculerSalaire } from "../src/utils/salaireCalculEngine";

describe("salaireCalculEngine", () => {
  test("refuse un brut invalide", () => {
    expect(() => calculerSalaire({ brutMensuel: 0, statut: "cadre" })).toThrow();
  });

  test("refuse un taux PAS hors bornes", () => {
    expect(() =>
      calculerSalaire({ brutMensuel: 3000, statut: "non_cadre", tauxPAS: -1 })
    ).toThrow();
    expect(() =>
      calculerSalaire({ brutMensuel: 3000, statut: "non_cadre", tauxPAS: 101 })
    ).toThrow();
  });

  test("cadre a un taux salarial supérieur au non-cadre", () => {
    const nc = calculerSalaire({ brutMensuel: 3000, statut: "non_cadre", tauxPAS: 0 });
    const c = calculerSalaire({ brutMensuel: 3000, statut: "cadre", tauxPAS: 0 });
    expect(c.tauxSalarial).toBeGreaterThan(nc.tauxSalarial);
    expect(c.netAvantImpot).toBeLessThan(nc.netAvantImpot);
  });

  test("PAS diminue le net après impôt", () => {
    const r0 = calculerSalaire({ brutMensuel: 3000, statut: "non_cadre", tauxPAS: 0 });
    const r10 = calculerSalaire({ brutMensuel: 3000, statut: "non_cadre", tauxPAS: 10 });
    expect(r10.netApresImpot).toBeLessThan(r0.netApresImpot);
    expect(r10.pasMensuel).toBeGreaterThan(0);
  });

  test("cohérence annuel vs mensuel", () => {
    const r = calculerSalaire({ brutMensuel: 2500, statut: "cadre", tauxPAS: 7.5 });
    expect(r.brutAnnuel).toBeCloseTo(r.brut * 12, 6);
    expect(r.netApresImpotAnnuel).toBeCloseTo(r.netApresImpot * 12, 6);
  });
});

