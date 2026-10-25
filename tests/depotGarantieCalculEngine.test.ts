import { calculerDepotGarantie, moisDeRetardCommences, type DepotGarantieData } from "../src/utils/depotGarantieCalculEngine";

const base: DepotGarantieData = {
  typeLocation: "vide",
  loyerHorsCharges: 700,
  depotVerse: 700,
  dateRemiseCles: "2026-03-15",
  etatDesLieuxConforme: true,
  dateReference: "2026-04-10",
  nouvelleAdresseCommuniquee: true,
};

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("dépôt de garantie", () => {
  test("exemple service-public : dépôt de 90 €, loyer de 120 €, 5 mois de retard → 60 € de pénalité", () => {
    const r = calculerDepotGarantie({ ...base, loyerHorsCharges: 120, depotVerse: 90, dateRemiseCles: "2026-01-10", dateReference: "2026-07-05" });
    expect(r.dateLimite).toBe("2026-02-10");
    expect(r.moisDeRetard).toBe(5);
    expect(r.penaliteParMois).toBe(12);
    expect(r.penalite).toBe(60);
  });

  test("délai : 1 mois si l'état des lieux est conforme, 2 mois sinon, à compter de la remise des clés", () => {
    expect(calculerDepotGarantie(base).dateLimite).toBe("2026-04-15");
    expect(calculerDepotGarantie({ ...base, etatDesLieuxConforme: false }).dateLimite).toBe("2026-05-15");
    // Fin de mois : remise le 31 janvier, limite le 28 février
    expect(calculerDepotGarantie({ ...base, dateRemiseCles: "2026-01-31" }).dateLimite).toBe("2026-02-28");
  });

  test("mois de retard commencés : un jour de retard compte pour un mois", () => {
    const limite = d("2026-02-10");
    expect(moisDeRetardCommences(limite, d("2026-02-10"))).toBe(0);
    expect(moisDeRetardCommences(limite, d("2026-02-11"))).toBe(1);
    expect(moisDeRetardCommences(limite, d("2026-03-10"))).toBe(1);
    expect(moisDeRetardCommences(limite, d("2026-03-11"))).toBe(2);
  });

  test("pas de pénalité si la nouvelle adresse n'a pas été communiquée", () => {
    const r = calculerDepotGarantie({ ...base, dateReference: "2026-06-01", nouvelleAdresseCommuniquee: false });
    expect(r.moisDeRetard).toBe(2);
    expect(r.penaliteApplicable).toBe(false);
    expect(r.penalite).toBe(0);
  });

  test("montant maximal : 1 mois de loyer hors charges en vide, 2 en meublé, interdit en bail mobilité", () => {
    expect(calculerDepotGarantie(base).depotMaximal).toBe(700);
    expect(calculerDepotGarantie({ ...base, depotVerse: 1400 }).depotExcessif).toBe(true);
    expect(calculerDepotGarantie({ ...base, typeLocation: "meuble", depotVerse: 1400 }).depotExcessif).toBe(false);
    const mobilite = calculerDepotGarantie({ ...base, typeLocation: "mobilite" });
    expect(mobilite.valide).toBe(false);
    expect(mobilite.depotExcessif).toBe(true);
  });

  test("copropriété : provision de 20 % au plus ; saisine du juge pendant 3 ans", () => {
    const r = calculerDepotGarantie({ ...base, copropriete: true });
    expect(r.provisionCoproprieteMax).toBe(140);
    expect(r.dateLimiteJuge).toBe("2029-04-15");
  });
});
