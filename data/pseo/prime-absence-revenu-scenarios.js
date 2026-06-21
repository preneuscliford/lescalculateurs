export const primeAbsenceRevenuScenarios = [
  {
    slug: "prime-activite-reprise-emploi-personne-seule",
    title: "Prime d'activite reprise d'emploi personne seule : estimation 2026",
    description:
      "Estimation indicative de la Prime d'activite 2026 pour une personne seule qui reprend un emploi modeste.",
    summary: "Cette page traite la reprise d'emploi pour une personne seule avec un cas concret.",
    audience: "Personne seule en reprise d'emploi avec petit salaire",
    tags: ["prime-activite", "reprise-emploi", "personne-seule", "petit-salaire"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 980,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier que les revenus d'activite sont bien stables.",
      "Comparer avec un scenario apres chomage si allocation residuelle.",
      "Tester aussi l'APL si le loyer est eleve.",
    ],
    faq: [
      {
        question:
          "Une personne seule qui reprend un emploi peut-elle toucher la Prime d'activite ?",
        answer: "Oui, surtout quand les revenus d'activite sont modestes et reguliers.",
      },
      {
        question: "Faut-il comparer aussi avec l'APL ?",
        answer: "Oui, car la Prime agit sur le revenu et l'APL sur le budget logement.",
      },
    ],
  },
  {
    slug: "prime-activite-reprise-emploi-apres-chomage",
    title: "Prime d'activite apres reprise d'emploi et chomage : estimation 2026",
    description: "Estimation indicative de la Prime d'activite 2026 apres une periode de chomage.",
    summary:
      "Cette page traite la transition ARE vers emploi avec un cas différent de la page personne seule standard.",
    audience: "Personne en reprise d'emploi apres chomage",
    tags: ["prime-activite", "reprise-emploi", "chomage", "transition"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 900,
      autresRevenus: 120,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier les revenus d'activite et les allocations residuelles.",
      "Comparer avec un scenario sans autres revenus.",
      "Verifier aussi RSA ou APL si le budget reste trop serre.",
    ],
    faq: [
      {
        question: "Peut-on toucher la Prime d'activite apres le chomage ?",
        answer: "Oui, particulierement en cas de reprise d'emploi avec revenus modestes.",
      },
      {
        question: "Le cumul avec d'autres aides est-il possible ?",
        answer: "Oui selon la situation, il faut comparer avec APL et RSA.",
      },
    ],
  },
  {
    slug: "prime-activite-temps-partiel-smic",
    title: "Prime d'activite temps partiel au SMIC : simulation 2026",
    description:
      "Page dediee aux revenus temps partiel proches du SMIC pour estimer rapidement la Prime d'activite.",
    summary:
      "Cette page répond à la recherche « prime activité temps partiel » avec un cas de revenu concret.",
    audience: "Salarie a temps partiel avec revenu proche du SMIC",
    tags: ["prime-activite", "temps-partiel", "smic", "simulation"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 820,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier le revenu moyen mensuel reel.",
      "Comparer avec un scenario temps plein proche SMIC.",
      "Tester aussi la page plafond Prime d'activite 2026.",
    ],
    faq: [
      {
        question: "Le temps partiel ouvre-t-il droit a la Prime d'activite ?",
        answer: "Souvent oui si vous exercez une activite et que les revenus restent modestes.",
      },
      {
        question: "Pourquoi utiliser un cas proche du SMIC ?",
        answer: "Parce que cette zone de revenu concentre une grande partie des recherches utiles.",
      },
    ],
  },
  {
    slug: "prime-activite-couple-sans-enfant-smic",
    title: "Prime d'activite couple sans enfant au SMIC : estimation 2026",
    description:
      "Simulation Prime d'activite 2026 pour un couple sans enfant avec revenus d'activite modestes.",
    summary: "Cette page propose un cas couple sans enfant, complementaire des cas personne seule.",
    audience: "Couple sans enfant avec revenus proches du SMIC",
    tags: ["prime-activite", "couple", "sans-enfant", "smic"],
    input: {
      situation: "couple",
      enfants: 0,
      revenusProf: 1550,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier les revenus d'activite du foyer entier.",
      "Comparer avec un scenario couple + 1 enfant.",
      "Verifier APL si le loyer est eleve pour le foyer.",
    ],
    faq: [
      {
        question: "Le statut couple change-t-il le montant estime ?",
        answer: "Oui, le forfait foyer et les ressources prises en compte changent.",
      },
      {
        question: "Faut-il comparer avec la page personne seule ?",
        answer: "Non, le bon repere est un scenario de foyer similaire au votre.",
      },
    ],
  },
  {
    slug: "prime-activite-couple-un-enfant",
    title: "Prime d'activite couple avec un enfant : estimation 2026",
    description:
      "Estimation indicative de la Prime d'activite 2026 pour un couple avec un enfant et revenus modestes.",
    summary:
      "Cette page couvre une situation familiale très lisible, distincte des cas couple sans enfant et parent isolé.",
    audience: "Couple avec un enfant et revenus modestes",
    tags: ["prime-activite", "couple", "enfant", "simulation"],
    input: {
      situation: "couple",
      enfants: 1,
      revenusProf: 1720,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier les revenus d'activite du foyer entier.",
      "Comparer avec un scenario couple sans enfant pour mesurer l'ecart.",
      "Tester aussi l'APL si le loyer pèse sur le budget mensuel.",
    ],
    faq: [
      {
        question: "Un couple avec un enfant peut-il toucher la Prime d'activite ?",
        answer: "Oui, selon les revenus du foyer et la composition familiale.",
      },
      {
        question: "Pourquoi ce cas est-il différent du couple sans enfant ?",
        answer:
          "Parce que le nombre d'enfants modifie le montant forfaitaire et donc le niveau de la Prime.",
      },
    ],
  },
  {
    slug: "prime-activite-parent-isole-un-enfant",
    title: "Prime d'activite parent isole avec un enfant : simulation 2026",
    description:
      "Estimation Prime d'activite 2026 pour un parent isole avec un enfant et revenus modestes.",
    summary:
      "Cette page traite une situation parentale fréquente, complémentaire des cas couple et personne seule.",
    audience: "Parent isole avec un enfant",
    tags: ["prime-activite", "parent-isole", "enfant", "simulation"],
    input: {
      situation: "monoparental",
      enfants: 1,
      revenusProf: 1050,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier les revenus d'activite et aides complementaires.",
      "Comparer avec un scenario parent isole sans revenu d'activite.",
      "Croiser avec ASF et APL selon la situation de logement.",
    ],
    faq: [
      {
        question: "Un parent isole peut-il toucher la Prime d'activite ?",
        answer: "Oui, selon les revenus d'activite du foyer et la composition familiale.",
      },
      {
        question: "Pourquoi comparer avec ASF et APL ?",
        answer: "Parce que ces aides peuvent modifier fortement le budget mensuel total.",
      },
    ],
  },
  {
    slug: "prime-activite-1500-euros",
    title: "Prime d'activité avec 1500 € net : estimation 2026",
    description:
      "Estimez votre Prime d'activité 2026 avec un salaire de 1500 € net par mois. Cas concret célibataire sans enfant.",
    summary:
      "Cette page répond à la recherche « prime activité 1500 € » avec un cas de revenu précis.",
    audience: "Salarié célibataire avec 1500 € net mensuel",
    tags: ["prime-activite", "1500-euros", "celibataire", "simulation"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 1500,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Vérifier le montant net mensuel exact.",
      "Comparer avec un scénario à 1800 € pour mesurer l'écart.",
      "Tester aussi l'APL si vous êtes locataire.",
    ],
    faq: [
      {
        question: "Peut-on toucher la Prime d'activité avec 1500 € net ?",
        answer:
          "Oui, selon votre situation familiale et vos autres ressources. Le montant dépend de la composition du foyer.",
      },
      {
        question: "Le montant baisse-t-il quand le salaire augmente ?",
        answer:
          "Oui, la Prime d'activité diminue progressivement à mesure que les revenus augmentent.",
      },
    ],
  },
  {
    slug: "prime-activite-1800-euros",
    title: "Prime d'activité avec 1800 € net : simulation 2026",
    description:
      "Calculez votre Prime d'activité 2026 avec 1800 € net mensuel. Estimation gratuite pour célibataire sans enfant.",
    summary:
      "Cette page répond à la recherche « prime activité 1800 € » avec un cas de revenu intermédiaire.",
    audience: "Salarié célibataire avec 1800 € net mensuel",
    tags: ["prime-activite", "1800-euros", "celibataire", "simulation"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 1800,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Vérifier le montant net mensuel exact.",
      "Comparer avec un scénario à 1500 € pour mesurer l'écart.",
      "Tester aussi l'APL si vous êtes locataire.",
    ],
    faq: [
      {
        question: "La Prime d'activité est-elle encore accessible avec 1800 € net ?",
        answer:
          "L'éligibilité devient plus limitée à ce niveau de revenu. Une simulation reste recommandée.",
      },
      {
        question: "Un célibataire à 1800 € peut-il encore percevoir une aide ?",
        answer:
          "Cela dépend des barèmes en vigueur. Notre simulateur vous donne une estimation personnalisée.",
      },
    ],
  },
  {
    slug: "prime-activite-2000-euros",
    title: "Prime d'activité avec 2000 € net : estimation 2026",
    description:
      "Simulez votre Prime d'activité 2026 avec 2000 € net par mois. Cas concret pour célibataire sans enfant.",
    summary:
      "Cette page répond à la recherche « prime activité 2000 € » avec un cas de revenu plus élevé.",
    audience: "Salarié célibataire avec 2000 € net mensuel",
    tags: ["prime-activite", "2000-euros", "celibataire", "simulation"],
    input: {
      situation: "seul",
      enfants: 0,
      revenusProf: 2000,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Vérifier le montant net mensuel exact.",
      "Comparer avec un scénario à 1800 € pour mesurer l'écart.",
      "Tester aussi le RSA si vos revenus baissent.",
    ],
    faq: [
      {
        question: "A-t-on encore droit à la Prime d'activité avec 2000 € net ?",
        answer:
          "L'éligibilité est très limitée à ce niveau, mais peut rester possible selon la composition du foyer.",
      },
      {
        question: "Pourquoi le montant estimé peut-il être nul ?",
        answer:
          "Le dépassement des plafonds de ressources peut entraîner une éligibilité nulle. Une simulation permet de vérifier.",
      },
    ],
  },
  {
    slug: "prime-activite-couple-deux-enfants",
    title: "Prime d'activité couple avec 2 enfants : simulation 2026",
    description:
      "Estimation Prime d'activité 2026 pour un couple avec 2 enfants et revenus modestes. Cas concret avec deux salaires.",
    summary:
      "Cette page couvre une situation familiale fréquente, distincte du cas couple avec 4 enfants.",
    audience: "Couple avec 2 enfants et revenus modestes",
    tags: ["prime-activite", "couple", "2-enfants", "famille", "simulation"],
    input: {
      situation: "couple",
      enfants: 2,
      revenusProf: 2400,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Vérifier les revenus d'activité du foyer entier.",
      "Comparer avec un scénario couple sans enfant pour mesurer l'écart.",
      "Croiser avec APL et allocations familiales selon le budget logement.",
    ],
    faq: [
      {
        question: "Un couple avec 2 enfants peut-il toucher la Prime d'activité ?",
        answer: "Oui, les majorations familiales augmentent le montant potentiel de la Prime.",
      },
      {
        question: "Le nombre d'enfants change-t-il beaucoup le montant ?",
        answer:
          "Oui. Chaque enfant supplémentaire augmente le montant forfaitaire et donc la Prime potentielle.",
      },
    ],
  },
  {
    slug: "prime-activite-couple-4-enfants",
    title: "Prime d'activite couple avec 4 enfants : calcul 2026",
    description:
      "Estimation indicative de la Prime d'activite 2026 pour un couple avec 4 enfants a charge et revenus modestes.",
    summary:
      "Cette page traite un cas de famille nombreuse avec besoin d'estimation rapide de la Prime d'activite.",
    audience: "Couple avec 4 enfants et revenus modestes",
    tags: ["prime-activite", "couple", "4-enfants", "famille-nombreuse", "simulation"],
    input: {
      situation: "couple",
      enfants: 4,
      revenusProf: 1780,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    },
    checklist: [
      "Verifier les revenus d'activite et la composition exacte du foyer.",
      "Comparer avec un scenario couple avec 3 enfants pour mesurer l'ecart.",
      "Croiser avec APL et allocations familiales selon le budget logement.",
    ],
    faq: [
      {
        question: "Un couple avec 4 enfants peut-il toucher la Prime d'activite ?",
        answer:
          "Oui, le montant forfaitaire augmente avec le nombre d'enfants a charge, ce qui peut ameliorer l'estimation.",
      },
      {
        question: "Le nombre d'enfants change-t-il beaucoup le montant ?",
        answer:
          "Oui. Chaque enfant supplementaire augmente le montant forfaitaire et donc le montant potentiel de la Prime.",
      },
    ],
  },
];
