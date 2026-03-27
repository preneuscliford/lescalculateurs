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
  {
    slug: "prime-activite-reprise-emploi-personne-seule",
    title: "Prime d'activite en reprise d'emploi pour une personne seule : estimation 2026",
    description:
      "Estimation indicative de la Prime d'activite 2026 pour une personne seule qui reprend un emploi modeste.",
    summary:
      "Cette page transpose le motif reprise d'emploi vers un cas tres simple de personne seule, pour tester le transfert du pattern hors APL.",
    audience: "Personne seule en reprise d'emploi avec petit salaire",
    tags: ["prime-activite", "reprise-emploi", "personne-seule", "petit-salaire"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 180,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier si vos revenus d'activite depassent bien le seuil minimum de la Prime d'activite.",
      "Comparer avec une reprise d'emploi apres chomage si vous aviez une allocation residuelle.",
      "Tester aussi l'APL si le logement reste votre premiere depense.",
    ],
    faq: [
      {
        question: "Une personne seule qui reprend un emploi peut-elle toucher la Prime d'activite ?",
        answer:
          "Oui, dans certains cas, surtout si les revenus d'activite restent modestes et reguliers.",
      },
      {
        question: "Pourquoi comparer Prime d'activite et APL ?",
        answer:
          "Parce que la Prime d'activite soutient le revenu, tandis que l'APL agit sur le budget logement. Les deux peuvent etre utiles a comparer.",
      },
    ],
  },
];
