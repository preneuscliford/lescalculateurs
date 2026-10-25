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
};
