import baremesJson from "./baremes.json";

type SourceMeta = {
  version: string;
  dateEffet: string;
  sourceUrl: string;
  sourceUrls?: string[];
  note?: string;
};

type AplJson = {
  version: string;
  plafonds_loyer: {
    zone1: Record<string, number>;
    zone2: Record<string, number>;
    zone3: Record<string, number>;
  };
  multiplicateurs_region: Record<string, number>;
};

const baremesData = baremesJson as { apl: AplJson };

const APRIL_2026_UPLIFT = 1.008;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function revalorise(value: number): number {
  return round2(value * APRIL_2026_UPLIFT);
}

export const socialBaremes = {
  rsa: {
    version: "2026.04",
    dateEffet: "2026-04-01",
    sourceUrl:
      "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026",
    sourceUrls: [
      "https://www.service-public.fr/particuliers/vosdroits/N19775",
      "https://www.caf.fr/allocataires/caf-des-bouches-du-rhone/offre-de-service/vie-professionnelle/le-revenu-de-solidarite-active-rsa",
    ],
    note:
      "Montants 2026 derives de la revalorisation officielle de 0,8 % appliquee au bareme RSA du 1er avril 2025.",
    montantForfaitaireBase: 651.69,
    coefficientsFoyer: {
      seulSansEnfant: 1,
      coupleOuSeulAvec1Enfant: 1.5,
      coupleAvec1OuSeulAvec2Enfants: 1.8,
      coupleAvec2Enfants: 2.1,
      personneSupplementaire: 0.4,
    },
    forfaitLogement: {
      unePersonne: revalorise(77.58),
      deuxPersonnes: revalorise(155.16),
      troisPersonnesOuPlus: revalorise(192.01),
    },
    revenusActivitePrisEnCompte: 0.62,
  },
  primeActivite: {
    version: "2026.04",
    dateEffet: "2026-04-01",
    sourceUrl:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite",
    sourceUrls: [
      "https://www.caf.fr/allocataires/actualites/actualites-nationales/la-prime-d-activite-augmente-en-2026",
      "https://www.service-public.fr/particuliers/vosdroits/F2882",
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
    bonification: {
      montantMaximum: 240.63,
      seuilDebut: 709.18,
      seuilMaximum: 1658.76,
    },
    revenusProfessionnelsPrisEnCompte: 0.61,
    montantMinimumVerse: 15,
  },
  asf: {
    version: "2026.04",
    dateEffet: "2026-04-01",
    sourceUrl:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf",
    sourceUrls: [
      "https://www.service-public.fr/particuliers/vosdroits/F33647",
      "https://pension-alimentaire.caf.fr/web/guest/l-allocation-de-soutien-familial-asf",
    ],
    sansConditionRessources: true,
    montantParEnfant: 200.78,
    montantParEnfantPriveDeuxParents: 267.63,
  },
  are: {
    version: "2025.07",
    dateEffet: "2025-07-01",
    sourceUrl:
      "https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/lallocation-chomage-lessentiel-a/montant-allocation-france-travai.html",
    sourceUrls: [
      "https://www.service-public.fr/particuliers/vosdroits/F38881",
      "https://www.service-public.fr/particuliers/actualites/A15787",
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
      plafondPourcentageSjr: 0.7,
      coefficientMensuel: 30.42,
    },
    dureeMaximaleJours: {
      moinsDe55Ans: 548,
      de55a56Ans: 685,
      aPartirDe57Ans: 822,
    },
  },
  apl: {
    version: "2025.10",
    dateEffet: "2025-10-01",
    sourceUrl: "https://www.service-public.fr/particuliers/actualites/A16807",
    sourceUrls: [
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-aides-au-logement",
      "https://www.service-public.fr/particuliers/vosdroits/F12006",
    ],
    plafondsLoyer: baremesData.apl.plafonds_loyer,
    multiplicateursRegion: baremesData.apl.multiplicateurs_region,
    moteur: {
      bonusLoyerParEnfant: 60,
      bonusLoyerCouple: 60,
      forfaitLogement: {
        seul: 72,
        couple: 102,
        monoparental: 87,
        autre: 72,
      },
      tauxParticipation: 0.3,
      participationMinimum: 35,
      plafondAplBase: {
        seul: 320,
        couple: 420,
        monoparental: 500,
        autre: 350,
      },
      bonusPlafondAplParEnfant: 150,
      plafondAplAbsolu: 900,
    },
  },
} as const;

export type SocialBaremes = typeof socialBaremes;

