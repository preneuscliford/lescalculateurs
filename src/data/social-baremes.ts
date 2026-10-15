import baremesJson from "./baremes.json";

type SourceMeta = {
  version: string;
  dateEffet: string;
  sourceUrl: string;
  sourceUrls?: string[];
  note?: string;
};

type PlafondsLoyerZone = {
  seul: number;
  couple: number;
  une_personne_a_charge: number;
  par_personne_supplementaire: number;
};

type AplJson = {
  version: string;
  plafonds_loyer: {
    date_effet: string;
    source: string;
    zone1: PlafondsLoyerZone;
    zone2: PlafondsLoyerZone;
    zone3: PlafondsLoyerZone;
  };
};

const baremesData = baremesJson as { apl: AplJson };

export const socialBaremes = {
  rsa: {
    version: "2026.05",
    dateEffet: "2026-04-01",
    sourceUrl:
      "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026",
    sourceUrls: [
      "https://www.service-public.gouv.fr/particuliers/vosdroits/N19775",
      "https://www.caf.fr/allocataires/caf-des-bouches-du-rhone/offre-de-service/vie-professionnelle/le-revenu-de-solidarite-active-rsa",
    ],
    note: "Montants 2026 derives de la revalorisation officielle de 0,8 % appliquee au bareme RSA du 1er avril 2025.",
    montantForfaitaireBase: 651.69,
    coefficientsFoyer: {
      seulSansEnfant: 1,
      coupleOuSeulAvec1Enfant: 1.5,
      coupleAvec1OuSeulAvec2Enfants: 1.8,
      coupleAvec2Enfants: 2.1,
      personneSupplementaire: 0.4,
    },
    // Montants officiels au 1er avril 2026 (service-public.gouv.fr F19778)
    forfaitLogement: {
      unePersonne: 78.2,
      deuxPersonnes: 156.41,
      troisPersonnesOuPlus: 193.55,
    },
    // Depuis le 1er janvier 2016, le complement de revenus d'activite (ancien
    // "RSA activite", 62 %) est remplace par la prime d'activite : les revenus
    // d'activite sont retenus en totalite dans les ressources du RSA (DREES,
    // fiche "La prime d'activite").
    revenusActivitePrisEnCompte: 1,
    // Le RSA n'est pas verse si le montant du est inferieur a 6 EUR (CAF, via MoneyVox 2026)
    montantMinimumVerse: 6,
  },
  primeActivite: {
    version: "2026.05",
    dateEffet: "2026-04-01",
    sourceUrl:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite",
    sourceUrls: [
      "https://www.caf.fr/allocataires/actualites/actualites-nationales/la-prime-d-activite-augmente-en-2026",
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F2882",
    ],
    montantForfaitaire: {
      nonMajoree: {
        unePersonne: 638.28,
        coupleOuIsole1Enfant: 957.42,
        couple1EnfantOuIsole2Enfants: 1148.9,
        couple2Enfants: 1340.38,
        isole3Enfants: 1404.21,
        couple3Enfants: 1595.69,
        personneSupplementaire: 255.32,
      },
      majoree: {
        grossesse: 819.63,
        isole1Enfant: 1092.84,
        isole2Enfants: 1366.05,
        isole3Enfants: 1639.26,
        isole4Enfants: 1912.47,
        personneSupplementaire: 271.04,
      },
    },
    forfaitLogement: {
      unePersonne: 76.59,
      deuxPersonnes: 153.19,
      troisPersonnesOuPlus: 189.57,
    },
    // Bonification individuelle, calculée pour chaque membre du foyer qui travaille
    // (service-public.gouv.fr F2882, vérifié le 1er juin 2026)
    bonification: {
      montantMaximum: 240.63,
      seuilDebut: 726.29,
      seuilMaximum: 1698.78,
    },
    // 59,85 % depuis le 1er avril 2025 (61 % auparavant) - DREES, Minima
    // sociaux et prestations sociales, edition 2025, fiche 30.
    revenusProfessionnelsPrisEnCompte: 0.5985,
    montantMinimumVerse: 15,
  },
  // Allocations familiales au 1er avril 2026 (montants nets de CRDS, taux plein) et
  // plafonds 2026 sur les revenus 2024 (service-public.gouv.fr F13213). Comptées
  // dans les ressources de la prime d'activité (F39753, vérifié le 1er juillet 2026).
  allocationsFamiliales: {
    version: "2026.04",
    dateEffet: "2026-04-01",
    sourceUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F13213",
    tauxPlein: { deuxEnfants: 152.25, troisEnfants: 347.32, parEnfantSupplementaire: 195.07 },
    moitie: { deuxEnfants: 76.13, troisEnfants: 173.67, parEnfantSupplementaire: 97.53 },
    quart: { deuxEnfants: 38.07, troisEnfants: 86.83, parEnfantSupplementaire: 48.77 },
    majorationAge: { tauxPlein: 76.13, moitie: 38.07, quart: 19.03 },
    plafondsRessources: { tranche1DeuxEnfants: 79980, tranche2DeuxEnfants: 106604, parEnfantSupplementaire: 6664 },
  },
  asf: {
    version: "2026.05",
    dateEffet: "2026-04-01",
    sourceUrl:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf",
    sourceUrls: [
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F33647",
      "https://pension-alimentaire.caf.fr/web/guest/l-allocation-de-soutien-familial-asf",
    ],
    sansConditionRessources: true,
    montantParEnfant: 200.78,
    montantParEnfantPriveDeuxParents: 267.63,
  },
  are: {
    // Pas de revalorisation au 1er juillet 2026 (CA Unedic du 30/06/2026) :
    // les montants du 1er juillet 2025 restent en vigueur.
    version: "2026.07",
    dateEffet: "2025-07-01",
    sourceUrl:
      "https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/lallocation-chomage-lessentiel-a/montant-allocation-france-travai.html",
    sourceUrls: [
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F38881",
      "https://www.service-public.gouv.fr/particuliers/actualites/A15787",
    ],
    reglesEligibilite: {
      dureeAffiliationMois: 6,
      fenetreReferenceMoins55AnsMois: 24,
      fenetreReference55AnsEtPlusMois: 36,
    },
    calculJournalier: {
      tauxOption1: 0.404,
      partFixe: 13.18,
      tauxOption2: 0.57,
      minimumJournalier: 32.13,
      plafondPourcentageSjr: 0.75,
      coefficientMensuel: 30.42,
    },
    dureeMaximaleJours: {
      moinsDe55Ans: 548,
      de55a56Ans: 685,
      aPartirDe57Ans: 822,
    },
    // Rupture conventionnelle : durees reduites pour les contrats rompus a
    // compter du 1er septembre 2026 (loi n° 2026-470 du 11 juin 2026) :
    // 15 mois avant 55 ans, 20,5 mois a partir de 55 ans.
    ruptureConventionnelle: {
      dateEffet: "2026-09-01",
      sourceUrl:
        "https://normandie.dreets.gouv.fr/Rupture-conventionnelle-et-chomage-ce-qui-change-au-1er-septembre-2026-%F0%9F%93%84",
      dureeMaximaleJours: {
        moinsDe55Ans: 456,
        de55a56Ans: 624,
        aPartirDe57Ans: 624,
      },
    },
  },
  apl: {
    version: "2026.10",
    dateEffet: "2026-10-01",
    sourceUrl: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054913928",
    sourceUrls: [
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-aides-au-logement",
      "https://www.service-public.gouv.fr/particuliers/vosdroits/F12006",
    ],
    plafondsLoyer: baremesData.apl.plafonds_loyer,
    // Formule officielle du secteur locatif (articles D. 823-16 et D. 823-17 du CCH),
    // paramètres de l'arrêté du 27 septembre 2019 en vigueur au 1er octobre 2026
    // (version consolidée Légifrance relue le 15/10/2026).
    formule: {
      // Art. 9 : forfait charges ; art. 16 : colocation
      forfaitCharges: { base: 61.29, parPersonneACharge: 13.9 },
      forfaitChargesColocation: { seul: 30.64, couple: 61.29, parPersonneACharge: 13.9 },
      coefficientPlafondColocation: 0.75,
      // Art. 10 : dégressivité puis suppression au-delà de ces multiples du plafond de loyer
      coefficientsDegressivite: {
        zone1: { degressivite: 3.4, suppression: 4 },
        zone2: { degressivite: 2.5, suppression: 3.1 },
        zone3: { degressivite: 2.5, suppression: 3.1 },
      },
      // Art. 11 : minoration forfaitaire ; art. 12 : seuil de versement (avant CRDS)
      minorationForfaitaire: 5,
      seuilVersement: { apl: 0, allocationLogement: 10 },
      // Art. 13 : participation minimale P0 = max(8,5 % de (L + C) ; 40,01 €)
      participationMinimale: { taux: 0.085, forfait: 40.01 },
      // Art. 14 : TF selon le nombre de personnes à charge (0 = isolé / couple)
      tauxFamille: {
        isole: 0.0283,
        couple: 0.0315,
        parPersonnesACharge: [0.027, 0.0238, 0.0201, 0.0185, 0.0179, 0.0173],
        majorationParPersonneSupplementaire: -0.0006,
      },
      // Art. 14 : TL par tranches du rapport RL = L / LR
      tauxLoyer: { seuils: [0.45, 0.75], taux: [0.0045, 0.0068] },
      loyerReference: { isole: 293.68, couple: 359.47, unePersonneACharge: 404.49, parPersonneSupplementaire: 58.88 },
      // Art. 15 : forfait R0 (annuel)
      r0: {
        isole: 5235,
        couple: 7501,
        parPersonnesACharge: [8947, 9148, 9498, 9851, 10202, 10554],
        parPersonneSupplementaire: 346,
      },
      // Ressources : revenus nets catégoriels (abattement 10 % pour frais professionnels),
      // arrondis à la centaine d'euros supérieure
      abattementFraisProfessionnels: 0.1,
      tauxCrds: 0.005,
      // Art. 46 : outre-mer (Guadeloupe, Guyane, Martinique, La Réunion, Mayotte…)
      outreMer: {
        r0UnePersonneACharge: 8656,
        forfaitCharges: { base: 41.15, parPersonneACharge: 10.59 },
        tauxFamille: {
          isole: 0.0281,
          couple: 0.0299,
          parPersonnesACharge: [0.0238, 0.0217, 0.0194, 0.018, 0.0169, 0.0162, 0.0167],
          majorationParPersonneSupplementaire: -0.0006,
        },
      },
    },
  },
} as const;

export type SocialBaremes = typeof socialBaremes;
