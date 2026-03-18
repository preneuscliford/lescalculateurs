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
  {
    slug: "apl-sans-revenu-couple-sans-enfant",
    intent: "apl sans revenu couple sans enfant",
    title: "APL sans revenu pour un couple sans enfant : estimation 2026",
    description:
      "Ordre de grandeur de l'APL 2026 pour un couple sans enfant qui n'a plus de revenu et paie encore un loyer.",
    summary:
      "Cette page répond au cas d'un couple sans enfant qui cherche à savoir si une aide au logement reste possible après une perte totale de revenu.",
    audience: "Couple sans enfant sans revenu",
    tags: ["sans-revenu", "couple", "sans-enfant", "apl"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus_mensuels: 0,
      loyer_mensuel: 720,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Vérifier si les deux adultes sont bien sans revenu sur la période retenue.",
      "Comparer avec un hébergement gratuit si le loyer ne sera plus supporté.",
      "Tester aussi le RSA couple si le foyer n'a plus aucune ressource.",
    ],
    faq: [
      {
        question: "Un couple sans enfant peut-il toucher l'APL sans revenu ?",
        answer:
          "Oui, selon le logement, le loyer retenu et la situation exacte du foyer. Le calcul reste toutefois indicatif.",
      },
      {
        question: "Le fait d'être deux au foyer supprime-t-il automatiquement l'APL ?",
        answer:
          "Non. Le couple est pris en compte dans le calcul, mais le droit dépend encore du loyer, de la zone et des ressources retenues.",
      },
    ],
  },
  {
    slug: "apl-sans-revenu-parent-isole",
    intent: "apl sans revenu parent isole",
    title: "APL sans revenu pour un parent isolé : estimation 2026",
    description:
      "Estimation APL 2026 pour un parent isolé sans revenu avec enfant à charge et logement loué.",
    summary:
      "Cette page sert un cas de forte urgence budgétaire : un parent isolé qui n'a plus de revenu et doit continuer à payer son logement.",
    audience: "Parent isolé sans revenu avec enfant à charge",
    tags: ["sans-revenu", "parent-isole", "apl", "enfant"],
    input: {
      situation: "monoparental",
      enfants: 1,
      revenus_mensuels: 0,
      loyer_mensuel: 760,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Vérifier si le nombre d'enfants et la résidence habituelle sont correctement renseignés.",
      "Comparer avec le RSA parent isolé et l'ASF selon votre situation familiale.",
      "Tester un loyer plus bas pour mesurer le reste à charge.",
    ],
    faq: [
      {
        question: "Un parent isolé sans revenu peut-il avoir une APL plus favorable ?",
        answer:
          "La composition familiale peut rendre l'estimation plus favorable, mais le montant final dépend encore du loyer retenu et de la zone.",
      },
      {
        question: "Faut-il simuler aussi le RSA et l'ASF ?",
        answer:
          "Oui, surtout si vous avez un enfant à charge et que vous n'avez plus de revenu stable.",
      },
    ],
  },
  {
    slug: "apl-fin-de-droits-personne-seule",
    intent: "apl fin de droits personne seule",
    title: "APL en fin de droits pour une personne seule : estimation 2026",
    description:
      "Repère APL 2026 pour une personne seule qui arrive en fin de droits et cherche à amortir une chute de revenu.",
    summary:
      "Cette page vise les personnes seules qui sortent du chômage indemnisé et veulent estimer ce que l'APL peut encore couvrir sur leur budget logement.",
    audience: "Personne seule en fin de droits",
    tags: ["fin-droits", "personne-seule", "apl", "chomage"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 60,
      loyer_mensuel: 580,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Vérifier les derniers revenus encore perçus et la date de fin d'indemnisation.",
      "Comparer avec un scénario sans revenu du tout si l'ARE s'arrête complètement.",
      "Tester aussi le RSA et les aides globales pour mesurer le total possible.",
    ],
    faq: [
      {
        question: "L'APL peut-elle rester utile juste après la fin de droits ?",
        answer:
          "Oui, elle peut rester un appui important si le loyer continue de peser et que les revenus chutent fortement.",
      },
      {
        question: "Faut-il refaire une simulation quand l'ARE s'arrête ?",
        answer:
          "Oui, car le passage d'une petite allocation à zéro revenu peut modifier l'estimation de façon sensible.",
      },
    ],
  },
  {
    slug: "apl-smic-couple-sans-enfant",
    intent: "apl smic couple sans enfant",
    title: "APL au SMIC pour un couple sans enfant : estimation 2026",
    description:
      "Exemple d'APL pour un couple sans enfant avec revenus proches du SMIC et loyer moyen.",
    summary:
      "Cette page prolonge le pattern revenus modestes vers un couple sans enfant, pour une recherche très concrète sur le maintien de l'APL avec deux petits salaires.",
    audience: "Couple sans enfant avec revenus proches du SMIC",
    tags: ["smic", "couple", "sans-enfant", "apl"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus_mensuels: 2250,
      loyer_mensuel: 760,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Vérifier les revenus réels des deux adultes retenus dans le calcul.",
      "Comparer avec un couple sans revenu ou avec un seul salaire.",
      "Tester aussi une variante avec un enfant si la composition du foyer change.",
    ],
    faq: [
      {
        question: "Un couple au SMIC peut-il encore toucher l'APL ?",
        answer:
          "Oui, dans certains cas, surtout si le loyer reste important au regard des revenus du foyer et de la zone retenue.",
      },
      {
        question: "Deux petits salaires annulent-ils automatiquement l'aide ?",
        answer:
          "Non. Le droit dépend du revenu global, du loyer retenu, de la zone et du foyer déclaré.",
      },
    ],
  },
  {
    slug: "apl-reprise-emploi-personne-seule",
    intent: "apl reprise emploi personne seule",
    title: "APL en reprise d'emploi pour une personne seule : estimation 2026",
    description:
      "Estimation APL 2026 pour une personne seule qui reprend une activité après une période sans revenu.",
    summary:
      "Cette page répond à la transition entre absence de revenu et reprise d'emploi, un cas fréquent quand le budget logement reste sous tension.",
    audience: "Personne seule en reprise d'emploi",
    tags: ["reprise-emploi", "personne-seule", "apl", "foyer-modeste"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1250,
      loyer_mensuel: 640,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Comparer la situation avant et après reprise d'emploi pour voir l'effet sur l'APL.",
      "Vérifier si les revenus d'activité viennent juste de reprendre ou s'ils sont stabilisés.",
      "Tester aussi une version avec chômage résiduel si la reprise est partielle.",
    ],
    faq: [
      {
        question: "Une reprise d'emploi fait-elle baisser l'APL tout de suite ?",
        answer:
          "Elle peut réduire l'aide, mais le niveau exact dépend des ressources retenues et du loyer toujours supporté.",
      },
      {
        question: "Faut-il refaire un calcul après le retour au travail ?",
        answer:
          "Oui, car la transition entre zéro revenu, chômage et reprise d'emploi peut changer l'estimation de manière importante.",
      },
    ],
  },
];
