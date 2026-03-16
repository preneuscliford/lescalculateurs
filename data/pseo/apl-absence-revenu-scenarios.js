export const aplAbsenceRevenuScenarios = [
  {
    slug: "apl-sans-revenu-personne-seule",
    intent: "apl sans revenu personne seule",
    title: "APL sans revenu pour une personne seule : estimation 2026",
    description:
      "Estimation indicative de l'APL pour une personne seule sans revenu avec un loyer modéré en 2026.",
    summary:
      "Cette page répond au cas d'une personne seule qui n'a plus de revenu et cherche un ordre de grandeur rapide pour son aide au logement.",
    audience: "Personne seule sans revenu avec un logement loué",
    tags: ["sans-revenu", "personne-seule", "apl", "foyer-modeste"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 0,
      loyer_mensuel: 540,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Vérifier que le loyer est bien renseigné hors charges.",
      "Comparer avec un hébergement gratuit si votre situation est instable.",
      "Tester aussi le RSA ou le simulateur multi-aides si vous n'avez plus aucun revenu.",
    ],
    faq: [
      {
        question: "Peut-on toucher l'APL sans revenu quand on vit seul ?",
        answer:
          "Oui, dans certains cas. L'APL dépend du logement, du loyer retenu, de la zone et de la situation du foyer.",
      },
      {
        question: "L'APL reste-t-elle due si je n'ai plus aucun salaire ?",
        answer:
          "Une absence de revenu peut maintenir une aide au logement, mais la situation exacte doit toujours être vérifiée avec la CAF.",
      },
    ],
  },
  {
    slug: "apl-sans-revenu-avec-enfant",
    intent: "apl sans revenu avec enfant",
    title: "APL sans revenu avec enfant : estimation 2026",
    description:
      "Exemple d'APL 2026 pour un foyer sans revenu avec un enfant à charge et un loyer modéré.",
    summary:
      "Cette page donne un repère rapide à un foyer qui n'a plus de revenu et doit continuer à payer un logement avec enfant à charge.",
    audience: "Parent isolé sans revenu avec un enfant",
    tags: ["sans-revenu", "enfant", "apl", "parent-isole"],
    input: {
      situation: "monoparental",
      enfants: 1,
      revenus_mensuels: 0,
      loyer_mensuel: 690,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Vérifier le nombre d'enfants effectivement retenus dans le foyer.",
      "Comparer avec le RSA parent isolé si vous n'avez plus de revenu du tout.",
      "Tester aussi un loyer un peu plus bas pour voir le reste à charge.",
    ],
    faq: [
      {
        question: "L'APL est-elle plus élevée avec un enfant quand il n'y a plus de revenu ?",
        answer:
          "La composition du foyer peut augmenter l'aide, mais le montant dépend aussi du loyer retenu et de la zone.",
      },
      {
        question: "Faut-il refaire une simulation si la garde ou le logement change ?",
        answer:
          "Oui. Un changement de foyer ou de logement peut modifier nettement l'estimation de l'APL.",
      },
    ],
  },
  {
    slug: "apl-fin-de-droits-chomage",
    intent: "apl fin de droits chomage",
    title: "APL après fin de droits chômage : estimation 2026",
    description:
      "Repère APL 2026 pour une personne en fin de droits chômage avec forte baisse de revenus.",
    summary:
      "Cette page vise les personnes qui sortent de l'ARE et veulent estimer rapidement si l'APL peut amortir une baisse brutale de ressources.",
    audience: "Personne en fin de droits chômage",
    tags: ["fin-droits", "chomage", "apl", "sans-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 90,
      loyer_mensuel: 610,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Vérifier la date exacte de fin de droits et les ressources encore perçues.",
      "Comparer avec un scénario sans revenu du tout.",
      "Tester aussi le RSA et le simulateur global aides si vous n'avez plus d'ARE.",
    ],
    faq: [
      {
        question: "L'APL peut-elle aider après une fin de droits chômage ?",
        answer:
          "Oui, l'APL peut rester un soutien important si vous continuez à payer un loyer avec des ressources très faibles.",
      },
      {
        question: "La baisse de revenus augmente-t-elle automatiquement l'APL ?",
        answer:
          "Pas toujours de façon linéaire. Le loyer retenu et la zone continuent à encadrer le montant estimé.",
      },
    ],
  },
];
