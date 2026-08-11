import { calculerResteAVivre, type ResteAVivreCalculData } from "../src/utils/resteAVivreCalculEngine";

function baseData(overrides: Partial<ResteAVivreCalculData>): ResteAVivreCalculData {
  return {
    salaireNetMensuel: 0,
    autresRevenus: 0,
    primActivite: 0,
    rsa: 0,
    apl: 0,
    aah: 0,
    autresAides: 0,
    loyer: 0,
    assuranceLogement: 0,
    electricite: 0,
    eau: 0,
    internet: 0,
    telephone: 0,
    transportRoutier: 0,
    transportPublic: 0,
    assuranceSante: 0,
    gardienEnfants: 0,
    alimentation: 0,
    hygiene: 0,
    vetements: 0,
    loisirs: 0,
    autres: 0,
    nbPersonnes: 1,
    nbEnfants: 0,
    ...overrides,
  };
}

describe("resteAVivreCalculEngine", () => {
  test("cas composite vérifié : revenus/charges détaillés", () => {
    const r = calculerResteAVivre(
      baseData({
        salaireNetMensuel: 2000,
        loyer: 700,
        assuranceLogement: 15,
        electricite: 60,
        eau: 20,
        internet: 30,
        telephone: 20,
        transportRoutier: 150,
        assuranceSante: 40,
        alimentation: 300,
        hygiene: 30,
        vetements: 50,
        loisirs: 80,
      }),
    );
    expect(r.resteAVivre).toBeCloseTo(505, 1);
    expect(r.tauxEndettement).toBeCloseTo(74.75, 1);
    expect(r.niveauRisque).toBe("élevé");
  });

  test("taux d'endettement faible (< 40%)", () => {
    const r = calculerResteAVivre(baseData({ salaireNetMensuel: 3000, loyer: 1000 }));
    expect(r.niveauRisque).toBe("faible");
  });

  test("taux d'endettement modéré (40-60%)", () => {
    const r = calculerResteAVivre(baseData({ salaireNetMensuel: 2000, loyer: 1000 }));
    expect(r.niveauRisque).toBe("modéré");
  });

  test("taux d'endettement critique (>= 85%)", () => {
    const r = calculerResteAVivre(baseData({ salaireNetMensuel: 1000, loyer: 900 }));
    expect(r.niveauRisque).toBe("critique");
  });

  test("reste par personne divise correctement selon la taille du foyer", () => {
    const r = calculerResteAVivre(baseData({ salaireNetMensuel: 2000, loyer: 500, nbPersonnes: 4 }));
    expect(r.details.resteParPersonne).toBeCloseTo(r.resteAVivre / 4, 1);
  });
});
