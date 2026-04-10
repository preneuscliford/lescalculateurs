export const primeAbsenceRevenuScenarios = [
  {
    slug: "prime-activite-reprise-emploi-personne-seule",
    title: "Prime d'activite reprise d'emploi personne seule : estimation 2026",
    description:
      "Estimation indicative de la Prime d'activite 2026 pour une personne seule qui reprend un emploi modeste.",
    summary:
      "Cette page traite la reprise d'emploi pour une personne seule avec un cas concret.",
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
        question: "Une personne seule qui reprend un emploi peut-elle toucher la Prime d'activite ?",
        answer:
          "Oui, surtout quand les revenus d'activite sont modestes et reguliers.",
      },
      {
        question: "Faut-il comparer aussi avec l'APL ?",
        answer:
          "Oui, car la Prime agit sur le revenu et l'APL sur le budget logement.",
      },
    ],
  },
  {
    slug: "prime-activite-reprise-emploi-apres-chomage",
    title: "Prime d'activite apres reprise d'emploi et chomage : estimation 2026",
    description:
      "Estimation indicative de la Prime d'activite 2026 apres une periode de chomage.",
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
        answer:
          "Oui, particulierement en cas de reprise d'emploi avec revenus modestes.",
      },
      {
        question: "Le cumul avec d'autres aides est-il possible ?",
        answer:
          "Oui selon la situation, il faut comparer avec APL et RSA.",
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
        answer:
          "Souvent oui si vous exercez une activite et que les revenus restent modestes.",
      },
      {
        question: "Pourquoi utiliser un cas proche du SMIC ?",
        answer:
          "Parce que cette zone de revenu concentre une grande partie des recherches utiles.",
      },
    ],
  },
  {
    slug: "prime-activite-couple-sans-enfant-smic",
    title: "Prime d'activite couple sans enfant au SMIC : estimation 2026",
    description:
      "Simulation Prime d'activite 2026 pour un couple sans enfant avec revenus d'activite modestes.",
    summary:
      "Cette page propose un cas couple sans enfant, complementaire des cas personne seule.",
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
        answer:
          "Oui, le forfait foyer et les ressources prises en compte changent.",
      },
      {
        question: "Faut-il comparer avec la page personne seule ?",
        answer:
          "Non, le bon repere est un scenario de foyer similaire au votre.",
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
        answer:
          "Oui, selon les revenus d'activite du foyer et la composition familiale.",
      },
      {
        question: "Pourquoi comparer avec ASF et APL ?",
        answer:
          "Parce que ces aides peuvent modifier fortement le budget mensuel total.",
      },
    ],
  },
];
