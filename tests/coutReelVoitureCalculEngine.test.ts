import { calculerCoutReelVoiture } from "../src/utils/coutReelVoitureCalculEngine";

describe("coutReelVoitureCalculEngine", () => {
  test("cas standard essence vérifié", () => {
    const r = calculerCoutReelVoiture({
      carburant: "essence",
      kilometrageAnnuel: 12000,
      consommation: 6.5,
      prixCarburant: 1.85,
      assuranceAnnuelle: 600,
      carteGriseAnnuelle: 0,
      revisionAnnuelle: 250,
      parking: 0,
      peagesAnnuels: 0,
      contraventions: 0,
      creditMensuel: 0,
    });
    expect(r.success).toBe(true);
    expect(r.coutMensuelTotal).toBeCloseTo(191.08, 1);
    expect(r.coutAnnuelTotal).toBeCloseTo(2293, 0);
  });

  test("véhicule électrique : même formule, unité kWh", () => {
    const r = calculerCoutReelVoiture({
      carburant: "electrique",
      kilometrageAnnuel: 10000,
      consommation: 15,
      prixCarburant: 0.2,
      assuranceAnnuelle: 0,
      carteGriseAnnuelle: 0,
      revisionAnnuelle: 0,
      parking: 0,
      peagesAnnuels: 0,
      contraventions: 0,
      creditMensuel: 0,
    });
    expect(r.details.carburantMensuel).toBeCloseTo(25, 1);
  });

  test("le crédit mensuel s'ajoute directement au total", () => {
    const sansCredit = calculerCoutReelVoiture({
      carburant: "essence",
      kilometrageAnnuel: 10000,
      consommation: 6,
      prixCarburant: 1.8,
      assuranceAnnuelle: 500,
      carteGriseAnnuelle: 0,
      revisionAnnuelle: 200,
      parking: 0,
      peagesAnnuels: 0,
      contraventions: 0,
      creditMensuel: 0,
    });
    const avecCredit = calculerCoutReelVoiture({
      carburant: "essence",
      kilometrageAnnuel: 10000,
      consommation: 6,
      prixCarburant: 1.8,
      assuranceAnnuelle: 500,
      carteGriseAnnuelle: 0,
      revisionAnnuelle: 200,
      parking: 0,
      peagesAnnuels: 0,
      contraventions: 0,
      creditMensuel: 250,
    });
    expect(avecCredit.coutMensuelTotal - sansCredit.coutMensuelTotal).toBeCloseTo(250, 1);
  });

  test("coût au km nul quand le kilométrage annuel est nul", () => {
    const r = calculerCoutReelVoiture({
      carburant: "essence",
      kilometrageAnnuel: 0,
      consommation: 6,
      prixCarburant: 1.8,
      assuranceAnnuelle: 500,
      carteGriseAnnuelle: 0,
      revisionAnnuelle: 0,
      parking: 0,
      peagesAnnuels: 0,
      contraventions: 0,
      creditMensuel: 0,
    });
    expect(r.coutParKm).toBe(0);
  });
});
