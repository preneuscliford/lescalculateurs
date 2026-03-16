export const simulateursAbsenceRevenuScenarios = [
  {
    slug: "quelles-aides-sans-revenu",
    title: "Quelles aides sans revenu ? Simulation 2026",
    description:
      "Simulation globale 2026 pour estimer les aides a verifier quand un foyer n'a plus de revenu.",
    summary:
      "Cette page sert de point d'entree global pour les personnes qui n'ont plus de revenu et veulent savoir quelles aides tester en priorite.",
    audience: "Foyer sans revenu",
    tags: ["sans-revenu", "multi-aides", "caf", "foyer-modeste"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 0,
      revenusPro: 0,
      autresRevenus: 0,
      loyer: 560,
      region: "province",
      logement: "loue",
      activite: "inactif",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier que le loyer est bien renseigne hors charges.",
      "Comparer ensuite les resultats aide par aide.",
      "Tester aussi une situation de parent isole si la composition du foyer change.",
    ],
    faq: [
      {
        question: "Quelles aides verifier quand on n'a plus de revenu ?",
        answer:
          "Le RSA, l'APL, l'ASF selon le foyer, et parfois la Prime d'activite en cas de reprise peuvent faire partie des aides a tester.",
      },
      {
        question: "Cette page suffit-elle pour confirmer mes droits ?",
        answer:
          "Non. Elle donne une estimation globale et oriente ensuite vers les simulateurs ou organismes officiels.",
      },
    ],
  },
  {
    slug: "aides-apres-perte-emploi",
    title: "Aides apres perte d'emploi : simulation 2026",
    description:
      "Repere 2026 pour tester rapidement les aides utiles apres une perte d'emploi ou un arret brutal de revenu.",
    summary:
      "Cette page aide a comparer les principales aides quand une personne vient de perdre son emploi ou ses revenus habituels.",
    audience: "Personne apres perte d'emploi",
    tags: ["perte-emploi", "sans-revenu", "multi-aides", "chomage"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 120,
      revenusPro: 0,
      autresRevenus: 120,
      loyer: 620,
      region: "province",
      logement: "loue",
      activite: "chomage",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier si une allocation chomage residuelle est encore percue.",
      "Comparer avec une situation sans revenu du tout.",
      "Tester ensuite le RSA, l'APL et les aides globales selon votre logement.",
    ],
    faq: [
      {
        question: "Quelles aides tester apres une perte d'emploi ?",
        answer:
          "Le bon ordre de verification depend du foyer, du logement et des revenus encore percus. Cette page aide a prioriser les simulations.",
      },
      {
        question: "Faut-il attendre la fin complete des revenus pour simuler ?",
        answer:
          "Non. Une simulation utile peut deja etre faite avec une allocation residuelle ou une baisse forte de revenu.",
      },
    ],
  },
];
