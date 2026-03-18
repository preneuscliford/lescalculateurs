export const simulateursAbsenceRevenuScenarios = [
  {
    slug: "quelles-aides-sans-revenu",
    title: "Quelles aides sans revenu ? Simulation 2026",
    description:
      "Simulation globale 2026 pour estimer les aides à vérifier quand un foyer n'a plus de revenu.",
    summary:
      "Cette page sert de point d'entrée global pour les personnes qui n'ont plus de revenu et veulent savoir quelles aides tester en priorité.",
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
      "Vérifier que le loyer est bien renseigné hors charges.",
      "Comparer ensuite les résultats aide par aide.",
      "Tester aussi une situation de parent isolé si la composition du foyer change.",
    ],
    faq: [
      {
        question: "Quelles aides vérifier quand on n'a plus de revenu ?",
        answer:
          "Le RSA, l'APL, l'ASF selon le foyer, et parfois la Prime d'activité en cas de reprise peuvent faire partie des aides à tester.",
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
    title: "Aides après perte d'emploi : simulation 2026",
    description:
      "Repère 2026 pour tester rapidement les aides utiles après une perte d'emploi ou un arrêt brutal de revenu.",
    summary:
      "Cette page aide à comparer les principales aides quand une personne vient de perdre son emploi ou ses revenus habituels.",
    audience: "Personne après perte d'emploi",
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
      "Vérifier si une allocation chômage résiduelle est encore perçue.",
      "Comparer avec une situation sans revenu du tout.",
      "Tester ensuite le RSA, l'APL et les aides globales selon votre logement.",
    ],
    faq: [
      {
        question: "Quelles aides tester après une perte d'emploi ?",
        answer:
          "Le bon ordre de vérification dépend du foyer, du logement et des revenus encore perçus. Cette page aide à prioriser les simulations.",
      },
      {
        question: "Faut-il attendre la fin complète des revenus pour simuler ?",
        answer:
          "Non. Une simulation utile peut déjà être faite avec une allocation résiduelle ou une baisse forte de revenu.",
      },
    ],
  },
  {
    slug: "quelles-aides-fin-de-droits-chomage",
    title: "Quelles aides après fin de droits chômage ? Simulation 2026",
    description:
      "Page repère 2026 pour orienter un foyer vers les aides à vérifier après la fin de droits chômage.",
    summary:
      "Cette page aide à prioriser les simulations utiles quand une indemnisation s'arrête et que le revenu du foyer baisse fortement.",
    audience: "Foyer en fin de droits chômage",
    tags: ["fin-droits", "chomage", "multi-aides", "sans-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 90,
      revenusPro: 0,
      autresRevenus: 90,
      loyer: 590,
      region: "province",
      logement: "loue",
      activite: "chomage",
      typeActivite: "salarie",
    },
    checklist: [
      "Vérifier la date de fin de droits et les revenus encore perçus.",
      "Comparer avec un scénario sans revenu du tout si plus aucune allocation n'est versée.",
      "Tester ensuite l'APL, le RSA et les aides familiales selon votre situation.",
    ],
    faq: [
      {
        question: "Quelles aides vérifier en premier après une fin de droits ?",
        answer:
          "Le RSA, l'APL et les aides familiales sont souvent les premiers dispositifs à comparer après une fin de droits chômage.",
      },
      {
        question: "Cette page remplace-t-elle les simulateurs détaillés ?",
        answer:
          "Non. Elle sert de point d'entrée global avant de lancer les simulations plus précises aide par aide.",
      },
    ],
  },
  {
    slug: "quelles-aides-couple-sans-revenu",
    title: "Quelles aides pour un couple sans revenu ? Simulation 2026",
    description:
      "Simulation globale 2026 pour un couple sans revenu qui cherche les aides prioritaires à vérifier.",
    summary:
      "Cette page couvre le cas d'un couple sans revenu qui doit prioriser ses simulations entre RSA, APL et autres aides essentielles.",
    audience: "Couple sans revenu",
    tags: ["couple", "sans-revenu", "multi-aides", "foyer-modeste"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus: 0,
      revenusPro: 0,
      autresRevenus: 0,
      loyer: 730,
      region: "province",
      logement: "loue",
      activite: "inactif",
      typeActivite: "salarie",
    },
    checklist: [
      "Vérifier si les deux adultes sont bien sans revenu sur la période simulée.",
      "Comparer avec un hébergement gratuit si le loyer change ou disparaît.",
      "Tester aussi une version avec enfant si la composition du foyer évolue.",
    ],
    faq: [
      {
        question: "Quelles aides vérifier pour un couple sans revenu ?",
        answer:
          "Le RSA, l'APL et certaines aides familiales ou de reprise sont souvent les premiers dispositifs à regarder selon le logement et le foyer.",
      },
      {
        question: "Le fait d'être en couple change-t-il beaucoup la simulation ?",
        answer:
          "Oui, les ressources, le foyer et le logement sont lus au niveau du couple et peuvent faire varier nettement l'estimation.",
      },
    ],
  },
];
