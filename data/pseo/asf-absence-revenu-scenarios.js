export const asfAbsenceRevenuScenarios = [
  {
    slug: "asf-parent-isole-sans-pension",
    title: "ASF parent isolé sans pension : estimation 2026",
    description:
      "Estimation indicative de l'ASF 2026 pour un parent isolé sans pension alimentaire et avec de faibles ressources.",
    summary:
      "Cette page répond à une situation très concrète de parent isolé qui n'est plus aidé par l'autre parent et cherche un repère rapide.",
    audience: "Parent isolé sans pension alimentaire",
    tags: ["asf", "parent-isole", "sans-pension", "faibles-ressources"],
    input: {
      situation: "parentisole",
      nombreEnfants: 1,
      revenus: 0,
      enfantACharge: true,
    },
    checklist: [
      "Vérifier que l'enfant est bien à charge et âgé de moins de 21 ans.",
      "Comparer avec le RSA et l'APL si vous n'avez plus de revenu.",
      "Vérifier aussi la situation de pension alimentaire impayée ou inexistante.",
    ],
    faq: [
      {
        question: "Peut-on toucher l'ASF sans pension alimentaire ?",
        answer:
          "Oui, l'ASF peut concerner un parent isolé lorsque la pension n'est pas versée ou n'existe pas, sous conditions.",
      },
      {
        question: "Faut-il aussi vérifier le RSA et l'APL ?",
        answer:
          "Oui, surtout si le foyer n'a plus de revenu et doit couvrir un logement avec enfant à charge.",
      },
    ],
  },
  {
    slug: "asf-parent-isole-sans-revenu",
    title: "ASF parent isolé sans revenu : estimation 2026",
    description:
      "Repère ASF 2026 pour un parent isolé sans revenu, avec enfant à charge et besoin d'aide rapide.",
    summary:
      "Cette page couvre un cas de forte fragilité budgétaire où l'ASF peut venir s'ajouter à d'autres aides essentielles.",
    audience: "Parent isolé sans revenu avec enfant à charge",
    tags: ["asf", "parent-isole", "sans-revenu", "enfant"],
    input: {
      situation: "parentisole",
      nombreEnfants: 1,
      revenus: 0,
      enfantACharge: true,
    },
    checklist: [
      "Vérifier si l'absence de pension est bien constatée ou durable.",
      "Comparer avec le RSA et l'APL pour mesurer le total d'aides possibles.",
      "Vérifier aussi la situation exacte du parent isolé et de l'enfant à charge.",
    ],
    faq: [
      {
        question: "L'ASF peut-elle aider quand un parent isolé n'a plus de revenu ?",
        answer:
          "Oui, l'ASF peut jouer un rôle utile si la pension n'est pas versée et si l'enfant est bien à charge.",
      },
      {
        question: "Faut-il quand même tester le RSA et l'APL ?",
        answer:
          "Oui, car l'ASF ne remplace pas les autres aides de base du foyer et peut venir en complément.",
      },
    ],
  },
  {
    slug: "asf-sans-pension-et-apl",
    title: "ASF sans pension et APL : estimation 2026",
    description:
      "Page repère 2026 pour un parent isolé sans pension qui veut estimer l'ASF et vérifier aussi l'APL.",
    summary:
      "Cette page répond à une intention de cumul ou de parcours d'aides entre ASF et APL quand le logement reste à payer.",
    audience: "Parent isolé sans pension avec loyer à payer",
    tags: ["asf", "sans-pension", "apl", "parent-isole"],
    input: {
      situation: "parentisole",
      nombreEnfants: 1,
      revenus: 120,
      enfantACharge: true,
    },
    checklist: [
      "Vérifier si la pension n'est plus versée ou jamais mise en place.",
      "Comparer ensuite l'ASF avec une simulation APL si vous payez un loyer.",
      "Tester aussi le RSA si les autres ressources du foyer sont très faibles.",
    ],
    faq: [
      {
        question: "Peut-on cumuler ASF et APL ?",
        answer:
          "Oui, dans de nombreux cas, car ces aides ne répondent pas au même besoin et doivent être vérifiées séparément.",
      },
      {
        question: "Pourquoi tester l'APL en plus de l'ASF ?",
        answer:
          "Parce que l'ASF aide sur la pension manquante, alors que l'APL peut soulager le budget logement si vous avez un loyer.",
      },
    ],
  },
  {
    slug: "asf-parent-isole-deux-enfants",
    title: "ASF parent isole avec 2 enfants : estimation 2026",
    description:
      "Estimation indicative de l'ASF 2026 pour un parent isole avec deux enfants a charge et ressources modestes.",
    summary:
      "Cette page reprend le motif parent isole en l'etendant a un foyer avec deux enfants, pour tester un transfert propre hors APL.",
    audience: "Parent isole avec deux enfants a charge",
    tags: ["asf", "parent-isole", "2-enfants", "faibles-ressources"],
    input: {
      situation: "parentisole",
      nombreEnfants: 2,
      revenus: 650,
      enfantACharge: true,
    },
    checklist: [
      "Verifier que les deux enfants sont bien a charge et ages de moins de 21 ans.",
      "Comparer avec le cas parent isole sans revenu si la situation se degrade.",
      "Tester aussi l'APL si vous supportez un loyer important.",
    ],
    faq: [
      {
        question: "L'ASF augmente-t-elle avec deux enfants ?",
        answer:
          "Oui, le montant estime depend du nombre d'enfants eligibles a charge.",
      },
      {
        question: "Faut-il aussi verifier RSA et APL ?",
        answer:
          "Oui, surtout si le foyer reste fragile et que le budget logement pese lourd.",
      },
    ],
  },
];
