export const areAbsenceRevenuScenarios = [
  {
    slug: "are-fin-de-droits-quelles-aides",
    title: "Fin de droits ARE : quelles aides après l'absence de revenu ?",
    description:
      "Repère 2026 pour une personne en fin de droits ARE qui cherche les aides à vérifier après l'arrêt des allocations chômage.",
    summary:
      "Cette page répond aux recherches d'après-ARE et oriente vers les aides essentielles quand il n'y a plus de revenu stable.",
    audience: "Personne en fin de droits ARE sans revenu stable",
    tags: ["are", "fin-droits", "sans-revenu", "aides"],
    input: {
      situation: "seul",
      ancienneteEmploi: 14,
      salaireReferent: 1700,
      personnesCharge: 0,
      agePersonne: 41,
    },
    checklist: [
      "Vérifier la date exacte de fin de droits et les allocations encore perçues.",
      "Comparer ensuite avec le RSA et l'APL selon votre logement.",
      "Tester aussi le simulateur global aides si vous n'avez plus de revenu mensuel.",
    ],
    faq: [
      {
        question: "Que vérifier en premier après une fin de droits ARE ?",
        answer:
          "Le RSA, l'APL et les autres aides de foyer modeste sont souvent les premiers dispositifs à comparer.",
      },
      {
        question: "Cette page calcule-t-elle un nouveau droit ARE ?",
        answer:
          "Non. Elle sert surtout de passerelle vers les aides à vérifier quand l'ARE s'arrête.",
      },
    ],
  },
  {
    slug: "are-fin-de-droits-rsa-ou-apl",
    title: "Fin de droits ARE : RSA ou APL ensuite ?",
    description:
      "Page repère 2026 pour comparer rapidement les aides à vérifier après la fin de droits ARE, notamment RSA et APL.",
    summary:
      "Cette page aide à prioriser la suite après l'ARE quand il faut choisir quelles aides tester en premier selon le logement et le foyer.",
    audience: "Personne en fin de droits ARE qui compare RSA et APL",
    tags: ["are", "fin-droits", "rsa", "apl"],
    input: {
      situation: "seul",
      ancienneteEmploi: 12,
      salaireReferent: 1650,
      personnesCharge: 0,
      agePersonne: 39,
    },
    checklist: [
      "Vérifier si une allocation résiduelle est encore perçue au moment de la simulation.",
      "Comparer votre situation de logement avant de prioriser l'APL ou le RSA.",
      "Tester aussi le simulateur global aides pour avoir une vue d'ensemble.",
    ],
    faq: [
      {
        question: "Faut-il tester d'abord le RSA ou l'APL après l'ARE ?",
        answer:
          "Cela dépend surtout du logement, des revenus encore perçus et de la composition du foyer. Les deux simulations restent souvent utiles.",
      },
      {
        question: "La fin de droits ARE donne-t-elle automatiquement droit au RSA ?",
        answer:
          "Non. Il faut toujours vérifier les conditions de ressources, de foyer et de logement avant d'en déduire un droit.",
      },
    ],
  },
  {
    slug: "are-reprise-emploi-temps-partiel",
    title: "ARE et reprise d'emploi à temps partiel : estimation 2026",
    description:
      "Repère ARE 2026 pour une reprise d'emploi à temps partiel avec besoin d'estimer l'impact sur les droits et les aides.",
    summary:
      "Cette page cible les personnes qui reprennent une activité réduite et veulent comprendre comment évoluent l'ARE et les aides essentielles.",
    audience: "Demandeur d'emploi en reprise à temps partiel",
    tags: ["are", "reprise-emploi", "temps-partiel", "chomage"],
    input: {
      situation: "seul",
      ancienneteEmploi: 18,
      salaireReferent: 1900,
      personnesCharge: 0,
      agePersonne: 36,
    },
    checklist: [
      "Vérifier si vos nouveaux revenus d'activité sont déjà connus ou seulement estimés.",
      "Comparer avec une situation sans reprise d'emploi pour mesurer l'écart.",
      "Tester aussi la Prime d'activité si votre reprise devient régulière.",
    ],
    faq: [
      {
        question: "Une reprise d'emploi à temps partiel change-t-elle fortement l'ARE ?",
        answer:
          "Oui, selon vos revenus d'activité et les règles de cumul, l'impact peut être significatif et doit être revérifié.",
      },
      {
        question: "Faut-il aussi tester la Prime d'activité ?",
        answer:
          "Oui, surtout si votre reprise devient stable et que vous avez des revenus professionnels modestes.",
      },
    ],
  },
];
