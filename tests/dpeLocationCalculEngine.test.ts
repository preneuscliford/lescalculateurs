import { calculerDpeLocation } from "../src/utils/dpeLocationCalculEngine";

const ref = "2026-10-25";

describe("DPE et location (métropole)", () => {
  test("calendrier : G+ 2023, G 2025, F 2028, E 2034, A à D jamais", () => {
    expect(calculerDpeLocation({ classe: "G+", dateReference: ref }).dateInterdiction).toBe("2023-01-01");
    expect(calculerDpeLocation({ classe: "G", dateReference: ref }).dateInterdiction).toBe("2025-01-01");
    expect(calculerDpeLocation({ classe: "F", dateReference: ref }).dateInterdiction).toBe("2028-01-01");
    expect(calculerDpeLocation({ classe: "E", dateReference: ref }).dateInterdiction).toBe("2034-01-01");
    const d = calculerDpeLocation({ classe: "D", dateReference: ref });
    expect(d.dateInterdiction).toBeNull();
    expect(d.nouveauBailPossible).toBe(true);
  });

  test("nouveau bail : possible en F jusqu'au 31/12/2027, impossible en G en 2026", () => {
    expect(calculerDpeLocation({ classe: "F", dateReference: ref }).nouveauBailPossible).toBe(true);
    expect(calculerDpeLocation({ classe: "F", dateReference: "2028-01-01" }).nouveauBailPossible).toBe(false);
    expect(calculerDpeLocation({ classe: "G", dateReference: ref }).nouveauBailPossible).toBe(false);
  });

  test("bail vide de 3 ans en F : continue jusqu'à la première échéance à partir de 2028", () => {
    // Début le 01/09/2025 : échéances 01/09/2028 (après le 01/01/2028)
    const r = calculerDpeLocation({ classe: "F", typeBail: "vide-particulier", dateDebutBail: "2025-09-01", dateReference: ref });
    expect(r.echeanceConcernee).toBe("2028-09-01");
    expect(r.bailEnCoursJusquAu).toBe("2028-08-31");
    expect(r.echeanceDepassee).toBe(false);
  });

  test("meublé d'un an en F : reconduit chaque année, critère appliqué à la reconduction de 2028", () => {
    const r = calculerDpeLocation({ classe: "F", typeBail: "meuble", dateDebutBail: "2024-03-15", dateReference: ref });
    expect(r.echeanceConcernee).toBe("2028-03-15");
  });

  test("bail vide en G reconduit après 2025 : échéance dépassée, mise aux normes due", () => {
    const r = calculerDpeLocation({ classe: "G", typeBail: "vide-particulier", dateDebutBail: "2020-06-01", dateReference: ref });
    expect(r.echeanceConcernee).toBe("2026-06-01");
    expect(r.echeanceDepassee).toBe(true);
  });

  test("meublé étudiant : pas de reconduction, le bail s'arrête à son terme", () => {
    const r = calculerDpeLocation({ classe: "F", typeBail: "meuble-etudiant", dateDebutBail: "2027-09-01", dateReference: ref });
    expect(r.bailSansReconduction).toBe(true);
    expect(r.echeanceConcernee).toBe("2028-06-01");
  });

  test("gel des loyers pour F, G et G+ seulement", () => {
    expect(calculerDpeLocation({ classe: "F", dateReference: ref }).loyerGele).toBe(true);
    expect(calculerDpeLocation({ classe: "G+", dateReference: ref }).loyerGele).toBe(true);
    expect(calculerDpeLocation({ classe: "E", dateReference: ref }).loyerGele).toBe(false);
  });

  test("outre-mer : non calculé, point à vérifier", () => {
    const r = calculerDpeLocation({ classe: "G", outreMer: true, dateReference: ref });
    expect(r.dateInterdiction).toBeNull();
    expect(r.aVerifier).toHaveLength(1);
  });
});
