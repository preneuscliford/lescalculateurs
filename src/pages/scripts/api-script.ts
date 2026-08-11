/**
 * Documentation interactive de l'API LesCalculateurs (/pages/api).
 * Un onglet par endpoint : description, paramètres, exemple de requête
 * (curl + JS) et exemple de réponse réel (capturé sur les moteurs de calcul).
 */

interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiEndpointDoc {
  id: string;
  label: string;
  emoji: string;
  path: string;
  description: string;
  params: ApiParam[];
  body: Record<string, unknown>;
  response: string;
}

const BASE_URL = "https://www.lescalculateurs.fr";

const ENDPOINTS: ApiEndpointDoc[] = [
  {
    id: "rsa",
    label: "RSA",
    emoji: "🧮",
    path: "/api/v1/rsa",
    description: "Simule le montant mensuel de RSA selon la situation familiale, les ressources et le logement.",
    params: [
      { name: "situation", type: '"seul" | "couple" | "monoparental"', required: true, description: "Situation familiale" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "revenus", type: "number", required: true, description: "Revenus mensuels nets, hors RSA" },
      { name: "logement", type: '"loue" | "proprio" | "gratuit" | "sans-abri"', required: true, description: "Situation de logement" },
      { name: "activite", type: '"actif" | "inactif" | "chomage"', required: true, description: "Situation professionnelle" },
    ],
    body: { situation: "seul", enfants: 0, revenus: 300, logement: "loue", activite: "inactif" },
    response: JSON.stringify(
      {
        success: true,
        montantEstime: 351.69,
        eligibilite: "Probablement eligible",
        explication:
          "Cette estimation utilise le bareme RSA en vigueur, vos ressources mensuelles et, si besoin, le forfait logement applique par la CAF.",
        details: { montantBase: 651.69, majorations: 0, revenusPris: 300, abattement: 0, forfaitLogement: 0, montantFinal: 351.69 },
        meta: { calculator: "rsa", version: "1.0.0", rulesVersion: "2026.05", effectiveDate: "2026-05-01", source: "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026" },
      },
      null,
      2,
    ),
  },
  {
    id: "apl",
    label: "APL",
    emoji: "🏠",
    path: "/api/v1/apl",
    description: "Simule l'aide personnalisée au logement (APL) selon le loyer, les revenus et la zone géographique.",
    params: [
      { name: "situation", type: '"seul" | "couple" | "monoparental" | "autre"', required: true, description: "Situation familiale" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "revenus_mensuels", type: "number", required: true, description: "Revenus mensuels du foyer" },
      { name: "loyer_mensuel", type: "number", required: true, description: "Loyer mensuel hors charges" },
      { name: "region", type: '"idf" | "province" | "dom"', required: true, description: "Zone géographique du logement" },
      { name: "type_logement", type: '"location" | "accession" | "hlm" | "colocation"', required: false, description: "Type de logement" },
    ],
    body: { situation: "seul", enfants: 0, revenus_mensuels: 1200, loyer_mensuel: 600, region: "province" },
    response: JSON.stringify(
      {
        success: true,
        data: {
          apl_estimee: 222,
          apl_brute: 222,
          loyer_mensuel: 600,
          loyer_pris_compte: 510,
          participation: 288,
          forfait_logement: 72,
          reste_charge: 378,
          situation: "seul",
          enfants: 0,
          revenus_mensuels: 1200,
          zone: "province",
          plafond_loyer: 510,
          plafond_apl: 320,
          is_plafonne: false,
        },
        meta: { calculator: "apl", version: "1.0.0", rulesVersion: "2025.10", effectiveDate: "2025-10-01", source: "https://www.service-public.gouv.fr/particuliers/actualites/A16807" },
      },
      null,
      2,
    ),
  },
  {
    id: "are",
    label: "ARE",
    emoji: "💼",
    path: "/api/v1/are",
    description: "Simule l'allocation d'aide au retour à l'emploi (chômage) selon le salaire de référence et l'ancienneté.",
    params: [
      { name: "situation", type: '"seul" | "couple" | "parent"', required: true, description: "Situation familiale" },
      { name: "ancienneteEmploi", type: "number", required: true, description: "Mois travaillés sur la période de référence" },
      { name: "salaireReferent", type: "number", required: true, description: "Salaire mensuel brut de référence" },
      { name: "personnesCharge", type: "number", required: false, description: "Personnes à charge (défaut 0)" },
      { name: "agePersonne", type: "number", required: true, description: "Âge du demandeur" },
    ],
    body: { situation: "seul", ancienneteEmploi: 24, salaireReferent: 2200, personnesCharge: 0, agePersonne: 35 },
    response: JSON.stringify(
      {
        eligible: true,
        montantEstime: 1289.83,
        durationMax: 18,
        explication:
          "Cette estimation applique la formule officielle France Travail sur votre salaire journalier de reference, avec une duree maximale d'environ 18 mois selon votre anciennete et votre age.",
        details: { tauxRemplacement: 0.5862, montantMinimum: 977, montantMaximum: 1540 },
        meta: { calculator: "are", version: "1.0.0", rulesVersion: "2025.07", effectiveDate: "2025-07-01", source: "https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/lallocation-chomage-lessentiel-a/montant-allocation-france-travai.html" },
      },
      null,
      2,
    ),
  },
  {
    id: "retraite",
    label: "Retraite",
    emoji: "🎓",
    path: "/api/v1/retraite",
    description: "Calcule l'âge légal de départ à la retraite et le nombre de trimestres requis pour le taux plein.",
    params: [
      { name: "dateNaissance", type: "string (YYYY-MM-DD)", required: true, description: "Date de naissance" },
      { name: "trimestresValides", type: "number", required: false, description: "Trimestres déjà validés" },
    ],
    body: { dateNaissance: "1964-06-15", trimestresValides: 140 },
    response: JSON.stringify(
      {
        ageLegalYears: 62,
        ageLegalMonths: 9,
        trimestresRequis: 170,
        dateAgeLegal: "2027-03-15T00:00:00.000Z",
        dateTauxPleinAutomatique: "2031-06-15T00:00:00.000Z",
        trimestresValides: 140,
        trimestresManquants: 30,
        bareme: "reforme-2023-suspension-2026",
        meta: { calculator: "retraite", version: "1.0.0", rulesVersion: "reforme-2023 + suspension-LFSS-2026", source: "https://www.info-retraite.fr/portail-info/sites/PortailInformationnel/home/reforme-des-retraites/reforme-des-retraites---age-le-1.html" },
      },
      null,
      2,
    ),
  },
  {
    id: "indemnite-licenciement",
    label: "Indemnité licenciement",
    emoji: "📄",
    path: "/api/v1/indemnite-licenciement",
    description: "Calcule l'indemnité légale minimale de licenciement selon l'ancienneté et le salaire moyen.",
    params: [
      { name: "dateEntree", type: "string (YYYY-MM-DD)", required: true, description: "Date d'entrée dans l'entreprise" },
      { name: "dateSortie", type: "string (YYYY-MM-DD)", required: true, description: "Date de fin de contrat" },
      { name: "salaireMensuelBrutMoyen", type: "number", required: true, description: "Salaire mensuel brut moyen" },
    ],
    body: { dateEntree: "2015-03-01", dateSortie: "2026-08-01", salaireMensuelBrutMoyen: 2600 },
    response: JSON.stringify(
      {
        eligible: true,
        ancienneteMois: 137,
        ancienneteAnneesDecimal: 11.416666666666666,
        portionJusqua10Ans: 10,
        portionAuDela10Ans: 1.416666666666666,
        montantJusqua10Ans: 6500,
        montantAuDela10Ans: 1227.7777777777771,
        montantTotal: 7727.78,
        meta: { calculator: "indemnite-licenciement", version: "1.0.0", rulesVersion: "en vigueur (quotes-parts légales inchangées)", source: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035644154" },
      },
      null,
      2,
    ),
  },
  {
    id: "salaire-net",
    label: "Salaire net",
    emoji: "💶",
    path: "/api/v1/salaire-net",
    description: "Convertit un salaire brut en net, avec cotisations et prélèvement à la source estimés.",
    params: [
      { name: "salaireBrut", type: "number", required: true, description: "Salaire brut mensuel" },
      { name: "statut", type: '"salarie" | "independant" | "auto-entrepreneur"', required: true, description: "Statut professionnel" },
      { name: "primes", type: "number", required: false, description: "Primes mensuelles (défaut 0)" },
      { name: "heuresSup", type: "number", required: false, description: "Heures supplémentaires en euros (défaut 0)" },
      { name: "ticketsResto", type: "number", required: false, description: "Valeur des tickets restaurant (défaut 0)" },
      { name: "mutuelle", type: "number", required: false, description: "Part mutuelle prise en charge (défaut 0)" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "mariageOrPacs", type: "boolean", required: false, description: "Marié(e) ou pacsé(e) (défaut false)" },
    ],
    body: { salaireBrut: 2800, statut: "salarie", enfants: 0, mariageOrPacs: false },
    response: JSON.stringify(
      {
        success: true,
        salaireNetMensuel: 2100.3534816666665,
        salaireNetAnnuel: 25204.241779999997,
        impotPasTotal: 1393.43422,
        cotisationsSociales: 7002.323999999999,
        salaireGrossMensuel: 2800,
        tauxEffectif: 0.249873756547619,
        explications: "Avec un salaire brut de 2800.00€ et 0 enfant(s), votre salaire net estimé est 2100.35€ par mois.",
        details: {
          salaireBase: 2800,
          primes: 0,
          heuresSup: 0,
          brutTotal: 2800,
          cotisationsEmploye: 583.5269999999999,
          prelevementSource: 116.11951833333335,
          ticketsResto: 0,
          mutuelle: 0,
          netTotal: 2100.3534816666665,
        },
        meta: { calculator: "salaire-net", version: "1.0.0", rulesVersion: "2026 (non-cadre, tranche 1, régime général)", source: "https://www.legisocial.fr/reperes-sociaux/cotisations-agirc-arrco-2026.html" },
      },
      null,
      2,
    ),
  },
  {
    id: "notaire",
    label: "Frais de notaire",
    emoji: "🏛️",
    path: "/api/v1/notaire",
    description: "Calcule les frais de notaire complets (émoluments, droits de mutation, débours, CSI) pour un achat immobilier.",
    params: [
      { name: "prixAchat", type: "number", required: true, description: "Prix d'achat du bien" },
      { name: "typeBien", type: '"ancien" | "neuf" | "terrain"', required: true, description: "Type de bien" },
      { name: "departement", type: "string", required: true, description: "Code département (ex: \"75\")" },
      { name: "montantMobilier", type: "number", required: false, description: "Valeur du mobilier déduit du prix (défaut 0)" },
      { name: "typeEmprunt", type: '"sans" | "sans_garantie" | "avec_garantie"', required: false, description: "Type d'emprunt (défaut \"sans\")" },
      { name: "pretsAides", type: "number", required: false, description: "Montant PTZ/PEL/CEL (défaut 0)" },
      { name: "autresPrets", type: "number", required: false, description: "Montant des autres prêts (défaut 0)" },
      { name: "remiseNotarialeVariable", type: "boolean", required: false, description: "Applique une remise de 10% sur la part variable (défaut false)" },
    ],
    body: { prixAchat: 250000, typeBien: "ancien", departement: "75" },
    response: JSON.stringify(
      {
        success: true,
        emoluments: 2394.75,
        emolumentsSansRemise: 2394.75,
        remiseMontant: 0,
        debours: 330,
        formalites: 220,
        csi: 250,
        fraisHypotheque: 0,
        fraisTerrain: 0,
        droitsEnregistrement: 15800,
        tauxDroits: 0.0632,
        tva: 522.95,
        total: 19517.7,
        pourcentage: 7.81,
        prixAchat: 250000,
        prixNetImmobilier: 250000,
        montantMobilier: 0,
        montantTotalPrets: 0,
        meta: { calculator: "notaire", version: "1.0.0", rulesVersion: "2026", source: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053593921" },
      },
      null,
      2,
    ),
  },
  {
    id: "aah",
    label: "AAH",
    emoji: "🤝",
    path: "/api/v1/aah",
    description: "Simule le montant de l'allocation adulte handicapé (AAH) selon le taux d'incapacité et les ressources.",
    params: [
      { name: "situation", type: "string", required: true, description: "Situation familiale (\"seul\", \"couple\", \"monoparental\")" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "tauxIncapacite", type: "number", required: true, description: "Taux d'incapacité reconnu par la MDPH (50 à 100)" },
      { name: "revenus", type: "number", required: false, description: "Revenus mensuels du foyer (défaut 0)" },
      { name: "logement", type: "string", required: true, description: "Situation de logement (\"locataire\", \"proprio\", \"heberge\")" },
    ],
    body: { situation: "seul", enfants: 0, tauxIncapacite: 80, revenus: 300, logement: "locataire" },
    response: JSON.stringify(
      {
        success: true,
        montantEstime: 771.59,
        eligibilite: "Probablement éligible",
        explication:
          "Vous pourriez percevoir environ 771.59€ par mois. Ce montant est plafonné au plafond réglementaire de l'AAH. L'estimation dépend de votre situation exacte et de la décision finale de la CAF, qui prendra en compte votre taux d'incapacité reconnu par la MDPH, vos ressources et votre situation familiale.",
        details: { montantBase: 1041.59, majorations: 0, revenusComptabilises: 270, abattement: 30, montantFinal: 771.59 },
        meta: { calculator: "aah", version: "1.0.0", rulesVersion: "2026.05", effectiveDate: "2026-05-01", source: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053734356" },
      },
      null,
      2,
    ),
  },
  {
    id: "apl-etudiant",
    label: "APL étudiant",
    emoji: "🎓",
    path: "/api/v1/apl-etudiant",
    description: "Simule l'APL pour un étudiant ou jeune actif selon l'âge, les revenus et le loyer.",
    params: [
      { name: "situation", type: '"seul" | "couple" | "parent"', required: true, description: "Situation familiale" },
      { name: "age", type: "number", required: true, description: "Âge du demandeur" },
      { name: "revenus", type: "number", required: true, description: "Revenus mensuels" },
      { name: "chargesLocatives", type: "number", required: true, description: "Loyer mensuel" },
      { name: "personnesCharge", type: "number", required: false, description: "Personnes à charge (défaut 0)" },
    ],
    body: { situation: "seul", age: 21, revenus: 400, chargesLocatives: 450, personnesCharge: 0 },
    response: JSON.stringify(
      {
        eligible: true,
        montantEstime: 247.5,
        explication:
          "En fonction de votre situation, vous pourriez percevoir environ 247.50€ par mois. Ce montant dépend notamment de la zone géographique du logement, du loyer retenu par la CAF et de votre situation personnelle. Consultez la CAF pour confirmer.",
        details: { ressourcesMaxi: 1500, pourcentageLoyer: 0.55 },
        meta: { calculator: "apl-etudiant", version: "1.0.0", rulesVersion: "2026 (modèle simplifié)", source: "Barèmes CROUS/CNOUS 2026, simplifiés" },
      },
      null,
      2,
    ),
  },
  {
    id: "asf",
    label: "ASF",
    emoji: "👨‍👧",
    path: "/api/v1/asf",
    description: "Simule l'allocation de soutien familial (ASF) pour un parent isolé ou un enfant privé de l'un ou ses deux parents.",
    params: [
      { name: "situation", type: '"parentisole" | "orphelin" | "depourvu"', required: true, description: "Situation familiale" },
      { name: "nombreEnfants", type: "number", required: true, description: "Nombre d'enfants concernés" },
      { name: "revenus", type: "number", required: false, description: "Revenus mensuels (non conditionnant)" },
      { name: "enfantACharge", type: "boolean", required: false, description: "Enfant effectivement à charge (défaut false)" },
    ],
    body: { situation: "parentisole", nombreEnfants: 2, revenus: 1200, enfantACharge: true },
    response: JSON.stringify(
      {
        eligible: true,
        montantEstime: 401.56,
        explication:
          "L'ASF est versee sans condition de ressources quand les conditions familiales sont remplies. Le montant indicatif est d'environ 401.56 EUR par mois pour 2 enfant(s). La CAF confirmera le droit exact selon votre dossier.",
        details: { montantParEnfant: 200.78, ressourcesMaxi: 0, nombreEnfantsEligibles: 2 },
        meta: { calculator: "asf", version: "1.0.0", rulesVersion: "2026.05", effectiveDate: "2026-05-01", source: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf" },
      },
      null,
      2,
    ),
  },
  {
    id: "prime-activite",
    label: "Prime d'activité",
    emoji: "💰",
    path: "/api/v1/prime-activite",
    description: "Simule le montant de la prime d'activité selon les revenus professionnels et la situation familiale.",
    params: [
      { name: "situation", type: "string", required: true, description: "Situation familiale (\"seul\", \"couple\", \"monoparental\")" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "revenusProf", type: "number", required: true, description: "Revenus professionnels mensuels" },
      { name: "autresRevenus", type: "number", required: false, description: "Autres revenus mensuels (défaut 0)" },
      { name: "logement", type: "string", required: true, description: "Situation de logement (\"loue\", \"proprio\", \"gratuit\")" },
      { name: "typeActivite", type: "string", required: true, description: "Type d'activité professionnelle" },
    ],
    body: { situation: "seul", enfants: 0, revenusProf: 1400, autresRevenus: 0, logement: "loue", typeActivite: "salarie" },
    response: JSON.stringify(
      {
        success: true,
        montantEstime: 267.34,
        eligibilite: "Probablement eligible",
        explication:
          "Cette estimation repose sur le forfait foyer 2026, la bonification individuelle et les revenus declares. La CAF confirmera le montant final a partir de votre declaration trimestrielle.",
        details: {
          montantBase: 638.28,
          bonification: 175.06,
          majorations: 0,
          forfaitLogement: 0,
          revenusProfsComptabilises: 854,
          autresRevenusComptabilises: 0,
          totalRevenusComptabilises: 1400,
          montantFinal: 267.34,
        },
        meta: { calculator: "prime-activite", version: "1.0.0", rulesVersion: "2026.05", effectiveDate: "2026-05-01", source: "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite" },
      },
      null,
      2,
    ),
  },
  {
    id: "ptz",
    label: "PTZ (éligibilité)",
    emoji: "🏦",
    path: "/api/v1/ptz",
    description: "Vérifie l'éligibilité au prêt à taux zéro selon le plafond de ressources (ne calcule pas le montant du prêt).",
    params: [
      { name: "zone", type: '"A" | "B1" | "B2" | "C"', required: true, description: "Zone géographique du bien" },
      { name: "nombrePersonnes", type: "number", required: true, description: "Nombre de personnes destinées à occuper le logement" },
      { name: "revenuFiscalReference", type: "number", required: true, description: "Revenu fiscal de référence du foyer" },
    ],
    body: { zone: "B1", nombrePersonnes: 3, revenuFiscalReference: 45000 },
    response: JSON.stringify(
      {
        eligible: true,
        plafondApplicable: 62100,
        ecart: 17100,
        meta: { calculator: "ptz", version: "1.0.0", rulesVersion: "2026 (inchangé vs 2025)", source: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10871" },
      },
      null,
      2,
    ),
  },
  {
    id: "impot-revenu",
    label: "Impôt sur le revenu",
    emoji: "🧾",
    path: "/api/v1/impot-revenu",
    description: "Calcule l'impôt sur le revenu selon le barème par tranches et le nombre de parts fiscales.",
    params: [
      { name: "revenu", type: "number", required: true, description: "Revenu net imposable annuel" },
      { name: "parts", type: "number", required: true, description: "Nombre de parts fiscales du foyer" },
    ],
    body: { revenu: 35000, parts: 1 },
    response: JSON.stringify(
      {
        revenu: 35000,
        parts: 1,
        qf: 35000,
        irBrut: 3603.99,
        tauxMoyen: 0.10297114285714284,
        tauxMarginal: 0.3,
        mensualiteMoyenne: 300.3325,
        meta: { calculator: "impot-revenu", version: "1.0.0", rulesVersion: "2026 (imposition des revenus 2025)", source: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954" },
      },
      null,
      2,
    ),
  },
  {
    id: "reste-a-vivre",
    label: "Reste à vivre",
    emoji: "📊",
    path: "/api/v1/reste-a-vivre",
    description: "Calcule le reste à vivre mensuel et le taux d'endettement à partir des revenus et charges du foyer.",
    params: [
      { name: "salaireNetMensuel", type: "number", required: true, description: "Salaire net mensuel" },
      { name: "loyer", type: "number", required: true, description: "Loyer ou mensualité de crédit immobilier" },
      { name: "autresRevenus, primActivite, rsa, apl, aah, autresAides", type: "number", required: false, description: "Revenus complémentaires (défaut 0 chacun)" },
      { name: "assuranceLogement, electricite, eau, internet, telephone", type: "number", required: false, description: "Charges de logement (défaut 0 chacune)" },
      { name: "transportRoutier, transportPublic, assuranceSante, gardienEnfants", type: "number", required: false, description: "Autres charges fixes (défaut 0 chacune)" },
      { name: "alimentation, hygiene, vetements, loisirs, autres", type: "number", required: false, description: "Charges variables estimées (défaut 0 chacune)" },
      { name: "nbPersonnes, nbEnfants", type: "number", required: false, description: "Composition du foyer (défaut 1 et 0)" },
    ],
    body: {
      salaireNetMensuel: 2000, loyer: 700, assuranceLogement: 15, electricite: 60, eau: 20, internet: 30,
      telephone: 20, transportRoutier: 150, assuranceSante: 40, alimentation: 300, hygiene: 30,
      vetements: 50, loisirs: 80, nbPersonnes: 1,
    },
    response: JSON.stringify(
      {
        success: true,
        resteAVivre: 505,
        toutcharges: 1495,
        revenus: 2000,
        tauxEndettement: 74.75,
        niveauRisque: "élevé",
        explications: "⚠️⚠️ Avec des revenus de 2000.00€ et des charges de 1495.00€, il vous reste environ 505.00€ par mois pour vivre.",
        details: {
          revenusTotal: 2000, chargesLogementi: 845, chargesTransport: 150, chargesSante: 40,
          chargesAlimentaires: 330, chargesAffaires: 50, chargesDiverses: 80, chargesTotal: 1495,
          resteDisponible: 505, resteParPersonne: 505,
        },
        meta: { calculator: "reste-a-vivre", version: "1.0.0", rulesVersion: "agrégation arithmétique (non réglementaire)" },
      },
      null,
      2,
    ),
  },
  {
    id: "cout-reel-voiture",
    label: "Coût réel voiture",
    emoji: "🚗",
    path: "/api/v1/cout-reel-voiture",
    description: "Calcule le coût mensuel réel d'une voiture (carburant, assurance, entretien, crédit) selon l'usage.",
    params: [
      { name: "carburant", type: '"essence" | "diesel" | "hybride" | "electrique"', required: true, description: "Type de motorisation" },
      { name: "kilometrageAnnuel", type: "number", required: true, description: "Kilométrage parcouru par an" },
      { name: "consommation", type: "number", required: true, description: "L/100km (ou kWh/100km si électrique)" },
      { name: "prixCarburant", type: "number", required: true, description: "Prix au litre (ou au kWh)" },
      { name: "assuranceAnnuelle", type: "number", required: false, description: "Assurance annuelle (défaut 0)" },
      { name: "carteGriseAnnuelle", type: "number", required: false, description: "Carte grise amortie sur l'année (défaut 0)" },
      { name: "revisionAnnuelle", type: "number", required: false, description: "Entretien/révisions annuels (défaut 0)" },
      { name: "parking, peagesAnnuels, contraventions, creditMensuel", type: "number", required: false, description: "Autres coûts (défaut 0 chacun)" },
    ],
    body: {
      carburant: "essence", kilometrageAnnuel: 12000, consommation: 6.5, prixCarburant: 1.85,
      assuranceAnnuelle: 600, carteGriseAnnuelle: 0, revisionAnnuelle: 250, parking: 0,
      peagesAnnuels: 0, contraventions: 0, creditMensuel: 0,
    },
    response: JSON.stringify(
      {
        success: true,
        coutMensuelTotal: 191.08333333333334,
        coutAnnuelTotal: 2293,
        coutParKm: 0.19108333333333333,
        details: {
          carburantMensuel: 120.25, carburantAnnuel: 1443, assuranceMensuel: 50,
          entretienMensuel: 20.833333333333332, parkingMensuel: 0, othersMensuel: 0,
          creditMensuel: 0, totalMensuel: 191.08333333333334,
        },
        explications: "Avec une voiture consommant 6.5 L/100km et 12000 km par an, le coût réel estimé est 191.08€ par mois.",
        meta: { calculator: "cout-reel-voiture", version: "1.0.0", rulesVersion: "agrégation arithmétique (non réglementaire)" },
      },
      null,
      2,
    ),
  },
  {
    id: "salaire",
    label: "Salaire (simplifié)",
    emoji: "💶",
    path: "/api/v1/salaire",
    description: "Conversion brut → net simplifiée par taux forfaitaire cadre/non-cadre. Pour une conversion détaillée, voir l'endpoint « Salaire net ».",
    params: [
      { name: "brutMensuel", type: "number", required: true, description: "Salaire brut mensuel" },
      { name: "statut", type: '"cadre" | "non_cadre"', required: true, description: "Statut professionnel" },
      { name: "tauxPAS", type: "number", required: false, description: "Taux de prélèvement à la source, en % (défaut 0)" },
    ],
    body: { brutMensuel: 3000, statut: "cadre", tauxPAS: 8 },
    response: JSON.stringify(
      {
        brut: 3000, statut: "cadre", tauxSalarial: 0.25, netAvantImpot: 2250, pasMensuel: 180,
        netApresImpot: 2070, brutAnnuel: 36000, netAvantImpotAnnuel: 27000, pasAnnuel: 2160,
        netApresImpotAnnuel: 24840, tauxPAS: 8,
        meta: { calculator: "salaire", version: "1.0.0", rulesVersion: "estimation forfaitaire (non réglementaire)" },
      },
      null,
      2,
    ),
  },
];

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildCurl(endpoint: ApiEndpointDoc): string {
  const bodyJson = JSON.stringify(endpoint.body, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : "  " + line))
    .join("\n");
  return `curl -X POST ${BASE_URL}${endpoint.path} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: VOTRE_CLE" \\
  -d '${bodyJson}'`;
}

function buildJs(endpoint: ApiEndpointDoc): string {
  const bodyJson = JSON.stringify(endpoint.body, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : "  " + line))
    .join("\n");
  return `const res = await fetch("${BASE_URL}${endpoint.path}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "VOTRE_CLE",
  },
  body: JSON.stringify(${bodyJson}),
});
const data = await res.json();`;
}

function renderParamsTable(params: ApiParam[]): string {
  const rows = params
    .map(
      (p) => `
        <tr>
          <td class="p-2 font-mono text-indigo-700 whitespace-nowrap">${escapeHtml(p.name)}</td>
          <td class="p-2 font-mono text-gray-500 text-xs whitespace-nowrap">${escapeHtml(p.type)}</td>
          <td class="p-2 text-center">${p.required ? '<span class="text-red-600 font-semibold">requis</span>' : '<span class="text-gray-400">optionnel</span>'}</td>
          <td class="p-2 text-gray-600">${escapeHtml(p.description)}</td>
        </tr>`,
    )
    .join("");

  return `
    <div class="overflow-x-auto">
      <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-6">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="text-left p-2 font-semibold">Paramètre</th>
            <th class="text-left p-2 font-semibold">Type</th>
            <th class="text-left p-2 font-semibold">Requis</th>
            <th class="text-left p-2 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">${rows}</tbody>
      </table>
    </div>`;
}

function renderPanel(endpoint: ApiEndpointDoc): string {
  return `
    <div>
      <div class="flex items-center gap-2 mb-2">
        <span class="font-mono text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold">POST</span>
        <span class="font-mono text-sm text-gray-800">${escapeHtml(endpoint.path)}</span>
      </div>
      <p class="text-gray-600 mb-5">${escapeHtml(endpoint.description)}</p>

      <h3 class="font-semibold text-gray-800 mb-2">Paramètres</h3>
      ${renderParamsTable(endpoint.params)}

      <h3 class="font-semibold text-gray-800 mb-2">Exemple de requête</h3>
      <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto mb-2">
        <pre class="text-sm text-green-300 font-mono whitespace-pre">${escapeHtml(buildCurl(endpoint))}</pre>
      </div>
      <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto mb-6">
        <pre class="text-sm text-blue-300 font-mono whitespace-pre">${escapeHtml(buildJs(endpoint))}</pre>
      </div>

      <h3 class="font-semibold text-gray-800 mb-2">Exemple de réponse</h3>
      <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto">
        <pre class="text-sm text-amber-200 font-mono whitespace-pre">${escapeHtml(endpoint.response)}</pre>
      </div>
    </div>`;
}

function initApiDocs(): void {
  const tabsEl = document.getElementById("api-doc-tabs");
  const panelEl = document.getElementById("api-doc-panel");
  if (!tabsEl || !panelEl) return;

  function selectTab(id: string): void {
    const endpoint = ENDPOINTS.find((e) => e.id === id) || ENDPOINTS[0];
    panelEl!.innerHTML = renderPanel(endpoint);

    tabsEl!.querySelectorAll<HTMLButtonElement>("button[data-endpoint]").forEach((btn) => {
      const active = btn.dataset.endpoint === endpoint.id;
      btn.classList.toggle("bg-indigo-600", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("bg-gray-100", !active);
      btn.classList.toggle("text-gray-700", !active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  tabsEl.innerHTML = ENDPOINTS.map(
    (e) => `
      <button
        type="button"
        data-endpoint="${e.id}"
        role="tab"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
      >${e.emoji} ${escapeHtml(e.label)}</button>`,
  ).join("");

  tabsEl.querySelectorAll<HTMLButtonElement>("button[data-endpoint]").forEach((btn) => {
    btn.addEventListener("click", () => selectTab(btn.dataset.endpoint!));
  });

  selectTab(ENDPOINTS[0].id);
}

function initMobileMenu(): void {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => menu.classList.toggle("hidden"));
}

interface GenerateKeyResponse {
  key: string;
  issuedAt: string;
  expiresAt: string;
  error?: string;
}

function initKeyGenerator(): void {
  const btn = document.getElementById("generate-key-btn") as HTMLButtonElement | null;
  const resultEl = document.getElementById("generate-key-result");
  if (!btn || !resultEl) return;

  function showError(message: string): void {
    resultEl!.innerHTML = `<div class="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4">${escapeHtml(message)}</div>`;
    resultEl!.classList.remove("hidden");
  }

  btn.addEventListener("click", async () => {
    const originalLabel = btn.textContent || "Générer ma clé API";
    btn.disabled = true;
    btn.textContent = "Génération...";

    try {
      const res = await fetch("/api/v1/keys", { method: "POST" });
      const data = (await res.json()) as GenerateKeyResponse;

      if (!res.ok) {
        showError(data.error || "Erreur lors de la génération de la clé.");
        return;
      }

      const expiresDisplay = new Date(data.expiresAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      resultEl.innerHTML = `
        <div class="bg-white border-2 border-green-500 rounded-lg p-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">Votre clé API (valable jusqu'au ${expiresDisplay}) :</p>
          <div class="flex items-center gap-2">
            <code class="flex-1 bg-gray-100 text-gray-900 text-xs p-2 rounded overflow-x-auto whitespace-nowrap">${escapeHtml(data.key)}</code>
            <button id="copy-key-btn" type="button" class="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded whitespace-nowrap">Copier</button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Conservez-la : elle ne sera plus affichée. Revenez sur cette page pour en générer une nouvelle à tout moment.</p>
        </div>`;
      resultEl.classList.remove("hidden");

      const copyBtn = document.getElementById("copy-key-btn");
      copyBtn?.addEventListener("click", async () => {
        await navigator.clipboard.writeText(data.key);
        copyBtn.textContent = "Copié !";
        window.setTimeout(() => {
          copyBtn.textContent = "Copier";
        }, 1500);
      });
    } catch {
      showError("Erreur réseau, réessayez.");
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}

initApiDocs();
initMobileMenu();
initKeyGenerator();
