export const rsaAbsenceRevenuScenarios = [
  {
    slug: "rsa-sans-revenu-personne-seule",
    title: "RSA sans revenu pour une personne seule : estimation 2026",
    description:
      "Estimation indicative du RSA 2026 pour une personne seule sans revenu et sans activité.",
    summary:
      "Cette page sert les recherches de base sur le RSA quand une personne seule n'a plus aucun revenu et cherche un premier ordre de grandeur.",
    audience: "Personne seule sans revenu",
    tags: ["rsa", "sans-revenu", "personne-seule"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier si le logement est loué, gratuit ou pris en charge par un proche.",
      "Comparer avec une situation de chômage avec petite allocation résiduelle.",
      "Tester aussi l'APL si vous payez un loyer.",
    ],
    faq: [
      {
        question: "Quel RSA peut toucher une personne seule sans revenu ?",
        answer:
          "Cette page donne un ordre de grandeur indicatif. Le montant final dépend toujours du logement, du foyer et des ressources retenues.",
      },
      {
        question: "Le RSA est-il automatique quand on n'a aucun revenu ?",
        answer:
          "Non. Il faut remplir les conditions d'éligibilité et déclarer sa situation à la CAF.",
      },
    ],
  },
  {
    slug: "rsa-couple-sans-revenu",
    title: "RSA couple sans revenu : estimation 2026",
    description:
      "Ordre de grandeur du RSA 2026 pour un couple sans revenu avec logement loué.",
    summary:
      "Cette page répond aux couples qui veulent estimer rapidement le RSA quand les deux adultes n'ont plus de revenu.",
    audience: "Couple sans revenu",
    tags: ["rsa", "sans-revenu", "couple"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier si un autre revenu du foyer doit encore être pris en compte.",
      "Comparer avec un hébergement gratuit si vous n'avez plus de loyer.",
      "Tester aussi le cas avec un enfant si la composition du foyer change.",
    ],
    faq: [
      {
        question: "Le RSA d'un couple sans revenu est-il plus élevé ?",
        answer:
          "Le montant théorique augmente avec la composition du foyer, mais il reste toujours soumis aux conditions de ressources et de situation.",
      },
      {
        question: "Le logement change-t-il le RSA estimé ?",
        answer:
          "Oui. Un logement gratuit ou une aide au logement peut modifier l'estimation finale.",
      },
    ],
  },
  {
    slug: "rsa-parent-isole-sans-revenu",
    title: "RSA parent isolé sans revenu : estimation 2026",
    description:
      "Exemple de RSA 2026 pour un parent isolé sans revenu avec enfant à charge.",
    summary:
      "Cette page traite les situations de rupture de revenu avec enfant à charge, pour donner un repère rapide et utile.",
    audience: "Parent isolé sans revenu",
    tags: ["rsa", "sans-revenu", "parent-isole", "enfant"],
    input: {
      situation: "monoparental",
      enfants: 1,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier le nombre d'enfants pris en compte dans le foyer.",
      "Comparer avec l'ASF si une pension alimentaire n'est plus versée.",
      "Tester aussi l'APL pour mesurer le total d'aides possibles.",
    ],
    faq: [
      {
        question: "Un parent isolé sans revenu peut-il toucher plus de RSA ?",
        answer:
          "Le montant peut être plus élevé selon la composition du foyer, mais la situation doit toujours être vérifiée avec la CAF.",
      },
      {
        question: "Faut-il aussi simuler l'APL et l'ASF ?",
        answer:
          "Oui, surtout si vous avez un logement à payer ou une pension alimentaire impayée.",
      },
    ],
  },
  {
    slug: "rsa-fin-de-droits-chomage-personne-seule",
    title: "RSA après fin de droits chômage pour une personne seule : estimation 2026",
    description:
      "Repère RSA 2026 pour une personne seule qui arrive en fin de droits chômage avec très faibles ressources.",
    summary:
      "Cette page sert les transitions ARE vers RSA, quand une personne seule cherche une aide de relais après l'arrêt des allocations.",
    audience: "Personne seule en fin de droits chômage",
    tags: ["rsa", "fin-droits", "chomage", "personne-seule"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 80,
      logement: "loue",
      activite: "chomage",
    },
    checklist: [
      "Vérifier la date exacte de fin de droits et les ressources encore perçues.",
      "Comparer avec un scénario sans revenu du tout si plus aucune allocation n'est versée.",
      "Tester aussi l'APL pour mesurer le total possible avec votre logement.",
    ],
    faq: [
      {
        question: "Le RSA peut-il prendre le relais juste après la fin de droits ?",
        answer:
          "Oui, dans certains cas, si vos ressources deviennent très faibles et si les autres conditions sont remplies.",
      },
      {
        question: "Faut-il refaire une simulation quand l'ARE s'arrête ?",
        answer:
          "Oui, car le passage d'une allocation résiduelle à zéro revenu peut modifier fortement l'estimation.",
      },
    ],
  },
  {
    slug: "rsa-sans-revenu-avec-enfant",
    title: "RSA sans revenu avec enfant : estimation 2026",
    description:
      "Exemple de RSA 2026 pour un foyer sans revenu avec enfant à charge et logement loué.",
    summary:
      "Cette page couvre un cas familial fréquent quand le foyer n'a plus de revenu et cherche d'abord un ordre de grandeur du RSA.",
    audience: "Foyer sans revenu avec enfant",
    tags: ["rsa", "sans-revenu", "enfant", "famille"],
    input: {
      situation: "couple",
      enfants: 1,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier si le nombre d'enfants retenus dans le foyer est exact.",
      "Comparer avec un parent isolé si la situation familiale a changé.",
      "Tester aussi l'APL pour mesurer le total d'aides mobilisables.",
    ],
    faq: [
      {
        question: "Un enfant augmente-t-il le RSA même sans revenu ?",
        answer:
          "Oui, la composition du foyer peut augmenter le montant théorique, sous réserve des conditions de situation et de ressources.",
      },
      {
        question: "Faut-il aussi regarder l'APL dans ce cas ?",
        answer:
          "Oui, surtout si vous payez un loyer et que le budget logement reste lourd à supporter.",
      },
    ],
  },
  {
    slug: "rsa-couple-sans-revenu-avec-enfant",
    title: "RSA couple sans revenu avec enfant : estimation 2026",
    description:
      "Ordre de grandeur du RSA 2026 pour un couple avec enfant sans revenu et avec logement loué.",
    summary:
      "Cette page vise les couples avec enfant qui traversent une rupture de revenu et cherchent un repère rapide sur le RSA.",
    audience: "Couple avec enfant sans revenu",
    tags: ["rsa", "couple", "sans-revenu", "enfant"],
    input: {
      situation: "couple",
      enfants: 1,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier si toutes les ressources du foyer sont bien à zéro ou résiduelles.",
      "Comparer avec le cas couple sans enfant pour mesurer l'effet du foyer.",
      "Tester aussi l'APL et les aides globales si le logement reste à payer.",
    ],
    faq: [
      {
        question: "Le RSA d'un couple avec enfant est-il plus élevé ?",
        answer:
          "Le montant théorique peut être plus favorable qu'un couple sans enfant, mais il reste soumis aux conditions de la CAF.",
      },
      {
        question: "Le logement peut-il réduire le RSA estimé ?",
        answer:
          "Oui. Le type de logement et l'existence d'une aide logement peuvent modifier l'estimation finale.",
      },
    ],
  },
];
