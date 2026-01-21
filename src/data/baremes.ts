export const baremes = {
  notaire: {
    tranches: [
      { min: 0, max: 6500, taux: 0.0387 },
      { min: 6500, max: 17000, taux: 0.01596 },
      { min: 17000, max: 60000, taux: 0.01064 },
      { min: 60000, max: 999999999, taux: 0.00799 },
    ],
    fraisDivers: {
      hypotheque: 450,
      cadastre: 125,
      conservation: 150,
      formalites: 200,
    },
    tva: 0.2,
    csi: {
      taux: 0.001, // 0,10 %
      minimum: 15,
    },
    droitsMutation: {
      standard: 0.0632, // taux majoré 2026 (5% voté = 6.32% total)
      neuf: 0.00715, // taux réduit pour le neuf (≈ 0,71498%)
      reduit: 0.0509, // taux réduit 2026 (3.80% voté = 5.09% total)
      departementsReduits: ["36", "976"], // Indre et Mayotte uniquement en 2026
    },
  },
  indemnites_kilometriques: {
    voiture: {
      latest: [
        {
          puissance: "3CV et moins",
          jusqu_5000: 0.502,
          de_5001_20000: 0.3,
          au_dela_20000: 0.36,
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.575,
          de_5001_20000: 0.323,
          au_dela_20000: 0.387,
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.603,
          de_5001_20000: 0.339,
          au_dela_20000: 0.407,
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.631,
          de_5001_20000: 0.355,
          au_dela_20000: 0.427,
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.659,
          de_5001_20000: 0.371,
          au_dela_20000: 0.447,
        },
      ],
      "2024": [
        {
          puissance: "3CV et moins",
          jusqu_5000: 0.502,
          de_5001_20000: 0.3,
          au_dela_20000: 0.36,
        },
        {
          puissance: "4CV",
          jusqu_5000: 0.575,
          de_5001_20000: 0.323,
          au_dela_20000: 0.387,
        },
        {
          puissance: "5CV",
          jusqu_5000: 0.603,
          de_5001_20000: 0.339,
          au_dela_20000: 0.407,
        },
        {
          puissance: "6CV",
          jusqu_5000: 0.631,
          de_5001_20000: 0.355,
          au_dela_20000: 0.427,
        },
        {
          puissance: "7CV et plus",
          jusqu_5000: 0.659,
          de_5001_20000: 0.371,
          au_dela_20000: 0.447,
        },
      ],
    },
    deux_roues: {
      moins_50cc: 0.315,
      "50cc_125cc": 0.388,
      plus_125cc: 0.453,
    },
  },
  jours_feries: {
    "2025": [
      { date: "2025-01-01", nom: "Jour de l'An", fixe: true },
      { date: "2025-04-21", nom: "Lundi de Pâques", fixe: false },
      { date: "2025-05-01", nom: "Fête du Travail", fixe: true },
      { date: "2025-05-08", nom: "Fête de la Victoire", fixe: true },
      { date: "2025-05-29", nom: "Ascension", fixe: false },
      { date: "2025-06-09", nom: "Lundi de Pentecôte", fixe: false },
      { date: "2025-07-14", nom: "Fête Nationale", fixe: true },
      { date: "2025-08-15", nom: "Assomption", fixe: true },
      { date: "2025-11-01", nom: "Toussaint", fixe: true },
      { date: "2025-11-11", nom: "Armistice", fixe: true },
      { date: "2025-12-25", nom: "Noël", fixe: true },
    ],
    "2026": [
      { date: "2026-01-01", nom: "Jour de l'An", fixe: true },
      { date: "2026-04-06", nom: "Lundi de Pâques", fixe: false },
      { date: "2026-05-01", nom: "Fête du Travail", fixe: true },
      { date: "2026-05-08", nom: "Fête de la Victoire", fixe: true },
      { date: "2026-05-14", nom: "Ascension", fixe: false },
      { date: "2026-05-25", nom: "Lundi de Pentecôte", fixe: false },
      { date: "2026-07-14", nom: "Fête Nationale", fixe: true },
      { date: "2026-08-15", nom: "Assomption", fixe: true },
      { date: "2026-11-01", nom: "Toussaint", fixe: true },
      { date: "2026-11-11", nom: "Armistice", fixe: true },
      { date: "2026-12-25", nom: "Noël", fixe: true },
    ],
  },
  taxe_fonciere: {
    degrevements_indicatifs: {
      personne_agee: { seuil_age: 75, taux: 0.1 },
      personne_handicapee: 0.1,
    },
    taux_moyens_par_region: {
      ile_de_france: 0.29,
      provence_alpes_cote_azur: 0.33,
      auvergne_rhone_alpes: 0.31,
      occitanie: 0.35,
      nouvelle_aquitaine: 0.34,
      grand_est: 0.32,
      hauts_de_france: 0.34,
      normandie: 0.33,
      centre_val_de_loire: 0.34,
      bourgogne_franche_comte: 0.33,
      pays_de_la_loire: 0.32,
      bretagne: 0.33,
      corse: 0.28,
    },
  },
  duree_travail: {
    duree_legale_hebdomadaire: 35,
    duree_legale_annuelle: 1607,
    majorations_heures_sup: {
      de_36_43h: 0.25,
      au_dela_43h: 0.5,
    },
    contingent_annuel_heures_sup: 220,
    repos_compensateur: {
      seuil_declenchement: 43,
      taux: 1.5,
    },
  },
};
