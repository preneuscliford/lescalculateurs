import { calculerFinDroits, type FinDroitsData } from "../src/utils/finDroitsChomageCalculEngine";
import { calculerDureeIndemnisation, calculerARE } from "../src/utils/areCalculEngine";

const base: FinDroitsData = {
  dateFinContrat: "2026-11-01",
  dateInscription: "2026-11-02",
  agePersonne: 40,
  dateDebutPremierContrat: "2020-01-01",
  typeRupture: "licenciement",
  salaireMensuelBrut: 2500,
};

describe("délai d'attente et différés (exemples de la fiche Unédic)", () => {
  test("fin le 1er novembre, inscription le 10, différé spécifique de 12 jours : indemnisé à partir du 20 novembre", () => {
    const r = calculerFinDroits({ ...base, dateInscription: "2026-11-10", indemnitesSupraLegales: 12 * 111.8 });
    expect(r.differeSpecifiqueJours).toBe(12);
    expect(r.premierJourIndemnise).toBe("2026-11-20");
  });

  test("inscription le 1er décembre, différés expirés : indemnisé à partir du 8 décembre", () => {
    const r = calculerFinDroits({ ...base, dateInscription: "2026-12-01", indemnitesSupraLegales: 12 * 111.8 });
    expect(r.premierJourIndemnise).toBe("2026-12-08");
  });

  test("différé spécifique plafonné à 150 jours, 75 jours en cas de licenciement économique", () => {
    expect(calculerFinDroits({ ...base, indemnitesSupraLegales: 100000 }).differeSpecifiqueJours).toBe(150);
    expect(calculerFinDroits({ ...base, typeRupture: "licenciement-economique", indemnitesSupraLegales: 100000 }).differeSpecifiqueJours).toBe(75);
  });

  test("différé congés payés = indemnité ÷ SJR, 30 jours au plus", () => {
    // SJR = 2 500 × 12 / 365 = 82,19 € ; 1 000 € ÷ 82,19 = 12 jours
    expect(calculerFinDroits({ ...base, indemniteCongesPayes: 1000 }).differeCongesPayesJours).toBe(12);
    expect(calculerFinDroits({ ...base, indemniteCongesPayes: 10000 }).differeCongesPayesJours).toBe(30);
  });

  test("délai d'attente déjà appliqué dans les 12 derniers mois : pas de nouveau délai", () => {
    const r = calculerFinDroits({ ...base, delaiAttenteDejaApplique: true });
    expect(r.delaiAttenteJours).toBe(0);
    expect(r.premierJourIndemnise).toBe("2026-11-02");
  });
});

describe("durée d'indemnisation", () => {
  test("24 mois travaillés : 730 jours × 0,75 = 548 jours (18 mois)", () => {
    const r = calculerFinDroits({ ...base, dateDebutPremierContrat: "2024-11-02" });
    expect(r.duree?.joursCalendaires).toBe(730);
    expect(r.dureeJours).toBe(548);
    expect(r.premierJourIndemnise).toBe("2026-11-09");
    expect(r.dateFinDroits).toBe("2028-05-09");
  });

  test("12 mois travaillés : 365 × 0,75 = 274 jours (et non 365)", () => {
    expect(calculerFinDroits({ ...base, dateDebutPremierContrat: "2025-11-02" }).dureeJours).toBe(274);
  });

  test("plancher de 182 jours et condition de 6 mois d'affiliation", () => {
    const sept = calculerFinDroits({ ...base, dateDebutPremierContrat: "2026-04-01" });
    expect(sept.dureeJours).toBe(182);
    expect(sept.duree?.plancherApplique).toBe(true);
    expect(calculerFinDroits({ ...base, dateDebutPremierContrat: "2026-07-01" }).eligible).toBe(false);
  });

  test("jours sans contrat retenus dans la limite de 70 % des jours travaillés", () => {
    const d = calculerDureeIndemnisation({ joursCalendaires: 730, joursNonTravailles: 400, agePersonne: 40 });
    // 330 jours travaillés + min(400, 231) = 561 jours, × 0,75 = 421
    expect(d.joursAvantCoefficient).toBe(561);
    expect(d.jours).toBe(421);
  });

  test("plafonds selon l'âge : 548, 685 et 822 jours (période de référence de 36 mois à partir de 55 ans)", () => {
    expect(calculerFinDroits({ ...base, agePersonne: 54 }).dureeJours).toBe(548);
    expect(calculerFinDroits({ ...base, agePersonne: 56 }).dureeJours).toBe(685);
    expect(calculerFinDroits({ ...base, agePersonne: 58 }).dureeJours).toBe(822);
  });

  test("rupture conventionnelle à partir du 1er septembre 2026 : 456 jours avant 55 ans, 624 ensuite", () => {
    expect(calculerFinDroits({ ...base, typeRupture: "rupture-conventionnelle" }).dureeJours).toBe(456);
    expect(calculerFinDroits({ ...base, typeRupture: "rupture-conventionnelle", agePersonne: 58 }).dureeJours).toBe(624);
    expect(
      calculerFinDroits({ ...base, typeRupture: "rupture-conventionnelle", dateFinContrat: "2026-08-31", dateInscription: "2026-09-01" }).dureeJours,
    ).toBe(548);
  });

  test("le simulateur ARE applique désormais le coefficient de 0,75 (18 mois travaillés : 13,5 mois)", () => {
    const r = calculerARE({ situation: "seul", ancienneteEmploi: 18, salaireReferent: 2000, personnesCharge: 0, agePersonne: 35 });
    expect(r.durationMax).toBe(13.5);
  });
});

describe("dégressivité", () => {
  test("allocation supérieure à 92,57 € avant 55 ans : -30 % à partir du 7e mois, plancher 92,57 €", () => {
    // 6 000 € brut : SJR 197,26 €, allocation 57 % = 112,44 € ; après -30 % : 78,71 €, relevé à 92,57 €
    const r = calculerFinDroits({ ...base, salaireMensuelBrut: 6000 });
    expect(r.degressivite.applicable).toBe(true);
    expect(r.degressivite.allocationApres).toBe(92.57);
    expect(r.degressivite.dateDebut).toBe("2027-05-09");
    // 10 000 € brut : allocation 187,40 €, après -30 % : 131,18 €
    expect(calculerFinDroits({ ...base, salaireMensuelBrut: 10000 }).degressivite.allocationApres).toBeCloseTo(131.18, 1);
  });

  test("pas de dégressivité à partir de 55 ans ni sous le seuil", () => {
    expect(calculerFinDroits({ ...base, salaireMensuelBrut: 6000, agePersonne: 55 }).degressivite.applicable).toBe(false);
    expect(calculerFinDroits({ ...base, salaireMensuelBrut: 2500 }).degressivite.applicable).toBe(false);
  });

  test("fin de contrat avant le 1er avril 2025 : exemption à partir de 57 ans", () => {
    const r = calculerFinDroits({ ...base, salaireMensuelBrut: 6000, agePersonne: 56, dateFinContrat: "2025-03-31", dateInscription: "2025-04-01" });
    expect(r.degressivite.applicable).toBe(true);
  });
});

describe("cas particuliers", () => {
  test("démission non légitime : pas de droits", () => {
    expect(calculerFinDroits({ ...base, typeRupture: "demission" }).eligible).toBe(false);
  });

  test("inscription plus de 12 mois après la fin du contrat : signalée", () => {
    const r = calculerFinDroits({ ...base, dateInscription: "2027-11-03" });
    expect(r.dateLimiteInscription).toBe("2027-11-01");
    expect(r.inscriptionHorsDelai).toBe(true);
  });

  test("outre-mer : durée non calculée, point à vérifier", () => {
    const r = calculerFinDroits({ ...base, outreMer: true });
    expect(r.dureeJours).toBeNull();
    expect(r.dateFinDroits).toBeNull();
    expect(r.aVerifier.length).toBe(1);
  });
});

describe("report de la date de fin (arrêt maladie, reprise d'emploi, formation)", () => {
  test("arrêt maladie : la date de fin est repoussée du nombre de jours d'arrêt", () => {
    const r = calculerFinDroits({ ...base, dateDebutPremierContrat: "2024-11-02", joursArretMaladie: 15 });
    expect(r.report.dateFinSansInterruption).toBe("2028-05-09");
    expect(r.dateFinDroits).toBe("2028-05-24");
  });

  test("reprise d'emploi : exemple Unédic (allocation 57 €/jour, salaire 2 100 €) = 4 jours indemnisés, 26 jours reportés", () => {
    // SJR de 100 € (salaire de 3 041,67 €) : allocation journalière de 57 €, plafond 3 042 €
    const r = calculerFinDroits({ ...base, salaireMensuelBrut: 3041.67, salaireRepriseMensuelBrut: 2100, moisReprise: 1 });
    expect(r.allocationJournaliere).toBeCloseTo(57, 1);
    expect(r.report.repriseJoursIndemnisesParMois).toBe(4);
    expect(r.report.repriseAllocationMensuelle).toBeCloseTo(228, 0);
    expect(r.report.repriseJoursNonIndemnises).toBe(26);
  });

  test("reprise d'emploi à temps plein : aucun jour indemnisé, tout le mois est reporté", () => {
    const r = calculerFinDroits({ ...base, salaireRepriseMensuelBrut: 2500, moisReprise: 3 });
    expect(r.report.repriseJoursIndemnisesParMois).toBe(0);
    expect(r.report.repriseJoursNonIndemnises).toBe(90);
  });

  test("formation et arrêt maladie retardent la dégressivité", () => {
    const sans = calculerFinDroits({ ...base, salaireMensuelBrut: 6000 });
    const avec = calculerFinDroits({ ...base, salaireMensuelBrut: 6000, joursFormation: 30, joursArretMaladie: 10 });
    expect(sans.degressivite.dateDebut).toBe("2027-05-09");
    expect(avec.degressivite.dateDebut).toBe("2027-06-18");
  });
});
