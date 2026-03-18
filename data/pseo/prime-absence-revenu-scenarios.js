export const primeAbsenceRevenuScenarios = [
  {
    slug: "prime-activite-reprise-emploi-apres-chomage",
    title: "Prime d'activité après reprise d'emploi post-chômage : estimation 2026",
    description:
      "Estimation indicative de la Prime d'activité 2026 pour une reprise d'emploi après une période de chômage ou d'absence de revenu.",
    summary:
      "Cette page sert les personnes qui reprennent une activité modeste après le chômage et veulent savoir si la Prime d'activité peut prendre le relais.",
    audience: "Personne en reprise d'emploi après chômage",
    tags: ["prime-activite", "reprise-emploi", "chomage", "petit-salaire"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 170,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Vérifier si vos revenus d'activité sont déjà stabilisés ou encore variables.",
      "Comparer avec une situation sans reprise d'emploi pour voir si la Prime d'activité devient pertinente.",
      "Tester aussi l'APL et le simulateur global aides si votre loyer reste élevé.",
    ],
    faq: [
      {
        question: "Peut-on toucher la Prime d'activité après le chômage ?",
        answer:
          "Oui, surtout si une reprise d'emploi modeste remplace une période sans revenu ou avec allocation résiduelle.",
      },
      {
        question: "Faut-il aussi vérifier le RSA ou l'APL ?",
        answer:
          "Oui, selon votre logement, votre foyer et vos autres revenus, plusieurs aides peuvent rester utiles à comparer.",
      },
    ],
  },
];
