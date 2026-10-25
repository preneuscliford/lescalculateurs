/**
 * Règles de location d'habitation (résidence principale).
 * Source : service-public.gouv.fr, fiche F31269 « Dépôt de garantie » (vérifiée le 09/06/2026),
 * article 22 de la loi n° 89-462 du 6 juillet 1989.
 */
export const logementBaremes = {
  depotGarantie: {
    sourceUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F31269",
    // Montant maximal, en mois de loyer hors charges (interdit si le loyer est payé par trimestre
    // d'avance, et en bail mobilité)
    maxMoisLoyer: { vide: 1, meuble: 2, mobilite: 0 },
    // Délai de restitution à compter de la remise des clés (en mains propres ou par lettre
    // recommandée avec avis de réception)
    delaiMois: { conforme: 1, nonConforme: 2 },
    // Pénalité : 10 % du loyer mensuel hors charges pour chaque mois de retard commencé, sauf si
    // le locataire n'a pas indiqué sa nouvelle adresse lors de la remise des clés
    penaliteParMoisCommence: 0.1,
    // Copropriété : provision conservée au plus jusqu'à l'arrêté annuel des comptes de
    // l'immeuble, régularisée dans le mois qui suit leur approbation définitive
    provisionCoproprieteMax: 0.2,
    // Saisine du juge possible pendant 3 ans à partir du jour où le dépôt aurait dû être rendu
    prescriptionAns: 3,
  },
  // Décence énergétique (ministère de la Transition écologique, FAQ « Décence énergétique et gel
  // des loyers » mise à jour le 19/12/2025 ; article 6 de la loi n° 89-462). En métropole, un
  // logement n'est plus décent pour un nouveau bail, un renouvellement ou une reconduction tacite :
  // G+ (plus de 450 kWh d'énergie finale/m²/an) depuis le 01/01/2023, G depuis le 01/01/2025,
  // F à partir du 01/01/2028, E à partir du 01/01/2034. Les baux en cours ne sont concernés qu'à
  // leur renouvellement ou reconduction tacite. Loyers des logements F et G gelés depuis août 2022
  // (révision annuelle, relocation, renouvellement). Outre-mer : calendrier non vérifié.
  decenceEnergetique: {
    sourceUrl: "https://www.ecologie.gouv.fr/politiques-publiques/location-gel-loyers-passoires-energetiques",
    interdictionMetropole: { "G+": "2023-01-01", G: "2025-01-01", F: "2028-01-01", E: "2034-01-01" } as Record<string, string>,
    seuilGPlusKwhEnergieFinale: 450,
    classesGelLoyer: ["G+", "G", "F"],
  },
  // Durée du bail d'habitation (service-public.gouv.fr F920 et F2315) : vide 3 ans (bailleur
  // personne physique) ou 6 ans (personne morale), meublé 1 an reconduit tacitement, meublé
  // étudiant 9 mois sans reconduction, bail mobilité de 1 à 10 mois non renouvelable.
  dureeBail: {
    sourceUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F920",
    mois: { "vide-particulier": 36, "vide-societe": 72, meuble: 12, "meuble-etudiant": 9, mobilite: 10 } as Record<string, number>,
    sansReconduction: ["meuble-etudiant", "mobilite"],
  },
};
