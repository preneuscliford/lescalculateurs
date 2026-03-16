export const areAbsenceRevenuScenarios = [
  {
    slug: "are-fin-de-droits-quelles-aides",
    title: "Fin de droits ARE : quelles aides apres l'absence de revenu ?",
    description:
      "Repere 2026 pour une personne en fin de droits ARE qui cherche les aides a verifier apres l'arret des allocations chomage.",
    summary:
      "Cette page repond aux recherches d'apres-ARE et oriente vers les aides essentielles quand il n'y a plus de revenu stable.",
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
      "Verifier la date exacte de fin de droits et les allocations encore percues.",
      "Comparer ensuite avec le RSA et l'APL selon votre logement.",
      "Tester aussi le simulateur global aides si vous n'avez plus de revenu mensuel.",
    ],
    faq: [
      {
        question: "Que verifier en premier apres une fin de droits ARE ?",
        answer:
          "Le RSA, l'APL et les autres aides de foyer modeste sont souvent les premiers dispositifs a comparer.",
      },
      {
        question: "Cette page calcule-t-elle un nouveau droit ARE ?",
        answer:
          "Non. Elle sert surtout de passerelle vers les aides a verifier quand l'ARE s'arrete.",
      },
    ],
  },
];
