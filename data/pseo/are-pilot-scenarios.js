export const arePilotScenarios = [
  {
    slug: "montant-are-2026",
    title: "Montant ARE 2026 : calcul et estimation chomage",
    description:
      "Estimation indicative du montant ARE 2026 a partir du salaire de reference et de l'anciennete.",
    summary:
      "Cette page répond à la question principale sur le calcul ARE avec un scénario simple à comprendre.",
    audience: "Demandeur d'emploi cherchant une estimation ARE",
    tags: ["are", "montant", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 12,
      salaireReferent: 2100,
      personnesCharge: 0,
      agePersonne: 35,
    },
    checklist: [
      "Verifier le salaire de reference utilise.",
      "Comparer avec un cas de reprise d'activite ou de temps partiel.",
      "Verifier ensuite les references officielles France Travail.",
    ],
    faq: [
      {
        question: "Comment estimer rapidement le montant ARE ?",
        answer:
          "Cette page donne un ordre de grandeur a partir d'un profil type, avant un calcul plus detaille.",
      },
      {
        question: "Le montant est-il definitif ?",
        answer: "Non. Le montant final depend toujours de l'instruction par l'organisme officiel.",
      },
    ],
  },
  {
    slug: "are-cumul-salaire-temps-partiel-2026",
    title: "Cumul ARE et salaire a temps partiel : simulation 2026",
    description:
      "Page dediee au cumul ARE et salaire en reprise partielle pour estimer l'impact mensuel.",
    summary:
      "Cette page répond à la recherche « cumul ARE et salaire simulation » avec un cas concret.",
    audience: "Demandeur d'emploi en reprise partielle",
    tags: ["are", "cumul", "salaire", "temps-partiel"],
    input: {
      situation: "seul",
      ancienneteEmploi: 18,
      salaireReferent: 1900,
      personnesCharge: 0,
      agePersonne: 36,
    },
    checklist: [
      "Verifier les revenus reels de reprise sur le mois.",
      "Comparer avec un scenario sans reprise d'emploi.",
      "Verifier ensuite Prime d'activite si la reprise devient stable.",
    ],
    faq: [
      {
        question: "Peut-on cumuler ARE et salaire ?",
        answer:
          "Oui dans certains cas, selon les regles de cumul et les revenus d'activite declares.",
      },
      {
        question: "Cette page remplace-t-elle le calcul officiel ?",
        answer:
          "Non, elle donne un ordre de grandeur. Le calcul final reste valide par l'organisme officiel.",
      },
    ],
  },
  {
    slug: "are-salaire-reference-calcul-2026",
    title: "ARE : calcul du salaire de reference en 2026",
    description:
      "Repere pratique pour comprendre l'effet du salaire de reference sur l'indemnisation ARE.",
    summary:
      "Cette page répond à la question du calcul technique ARE dans un cas différent du cumul et de la fin de droits.",
    audience: "Utilisateur qui veut comprendre la base de calcul ARE",
    tags: ["are", "salaire-reference", "calcul"],
    input: {
      situation: "seul",
      ancienneteEmploi: 24,
      salaireReferent: 2300,
      personnesCharge: 0,
      agePersonne: 40,
    },
    checklist: [
      "Verifier le salaire de reference retenu.",
      "Comparer avec un salaire de reference plus bas et plus haut.",
      "Croiser ensuite avec la page montant ARE pour valider l'ordre de grandeur.",
    ],
    faq: [
      {
        question: "Pourquoi le salaire de reference est-il important ?",
        answer: "Parce qu'il influence directement la base de calcul de l'allocation ARE.",
      },
      {
        question: "Faut-il aussi tester un cas de reprise ?",
        answer: "Oui, pour mesurer la difference entre un calcul ARE standard et un cas de cumul.",
      },
    ],
  },
  {
    slug: "are-fin-de-droits-rsa-ou-apl",
    title: "ARE après fin de droits RSA ou APL : estimation 2026",
    description:
      "Repère 2026 pour une personne au chômage qui arrive en fin de droits RSA ou APL et veut vérifier son ARE.",
    summary:
      "Cette page aide à comprendre quoi vérifier quand une fin de droits RSA ou APL s'ajoute à une situation de chômage ou de reprise partielle.",
    audience: "Personne en transition de droits avec chômage et aides logement",
    tags: ["are", "fin-droits", "rsa", "apl", "transition"],
    input: {
      situation: "seul",
      ancienneteEmploi: 16,
      salaireReferent: 1850,
      personnesCharge: 0,
      agePersonne: 39,
    },
    checklist: [
      "Vérifier la date de fin de droits et les autres aides encore perçues.",
      "Comparer avec un scénario de reprise partielle si un retour au travail est envisagé.",
      "Vérifier ensuite les règles officielles de France Travail.",
    ],
    faq: [
      {
        question: "Que vérifier en premier quand le RSA ou l'APL change ?",
        answer:
          "La priorité est de vérifier l'ARE, les aides logement et les ressources restantes du foyer.",
      },
      {
        question: "Cette page remplace-t-elle un calcul France Travail ?",
        answer: "Non. Elle donne un ordre de grandeur avant une vérification officielle.",
      },
    ],
  },
  {
    slug: "are-reprise-emploi-temps-partiel",
    title: "ARE et reprise d'emploi à temps partiel : estimation 2026",
    description:
      "Estimation indicative de l'ARE 2026 pour une reprise d'emploi à temps partiel avec salaire de référence modeste.",
    summary:
      "Cette page répond à la question du cumul entre ARE et reprise d'emploi à temps partiel avec un cas concret et simple à comparer.",
    audience: "Demandeur d'emploi en reprise à temps partiel",
    tags: ["are", "cumul", "temps-partiel", "reprise-emploi"],
    input: {
      situation: "seul",
      ancienneteEmploi: 18,
      salaireReferent: 1950,
      personnesCharge: 0,
      agePersonne: 36,
    },
    checklist: [
      "Vérifier les revenus réels de reprise sur le mois.",
      "Comparer avec un scénario sans reprise d'emploi.",
      "Vérifier ensuite la Prime d'activité si la reprise devient stable.",
    ],
    faq: [
      {
        question: "Peut-on cumuler l'ARE et un temps partiel ?",
        answer:
          "Oui, dans certains cas, selon les règles de cumul et les revenus d'activité déclarés.",
      },
      {
        question: "Cette page remplace-t-elle le calcul officiel ?",
        answer: "Non. Elle donne un ordre de grandeur avant une vérification officielle.",
      },
    ],
  },
  {
    slug: "are-apres-cdd",
    title: "ARE après CDD : estimation 2026",
    description: "Repère 2026 pour une personne en fin de CDD qui veut estimer rapidement son ARE.",
    summary:
      "Cette page cible une situation de transition très claire après la fin d'un contrat à durée déterminée.",
    audience: "Personne en fin de CDD qui veut un repère ARE",
    tags: ["are", "cdd", "transition", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 11,
      salaireReferent: 2050,
      personnesCharge: 0,
      agePersonne: 34,
    },
    checklist: [
      "Vérifier la fin exacte du CDD et les périodes travaillées retenues.",
      "Comparer avec un scénario de reprise partielle si un nouveau contrat débute.",
      "Vérifier ensuite les aides logement ou ressources restantes du foyer.",
    ],
    faq: [
      {
        question: "Un CDD donne-t-il droit à l'ARE ?",
        answer:
          "Oui, si les conditions d'ouverture de droits sont remplies après la fin du contrat.",
      },
      {
        question: "Pourquoi créer une page spécifique après CDD ?",
        answer:
          "Parce que cette intention est différente d'une simple reprise d'emploi à temps partiel.",
      },
    ],
  },
  {
    slug: "are-salaire-1500",
    intent: "are salaire 1500",
    title: "ARE avec salaire de 1500 EUR : estimation 2026",
    description: "Estimation ARE 2026 pour un salaire de reference de 1500 EUR.",
    summary:
      "Cette page repond a la recherche d'une estimation ARE pour un salaire modeste proche du SMIC.",
    audience: "Demandeur d'emploi avec salaire de 1500 EUR",
    tags: ["are", "salaire", "1500", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 18,
      salaireReferent: 1500,
      personnesCharge: 0,
      agePersonne: 35,
    },
    checklist: [
      "Verifier le salaire de reference utilise.",
      "Comparer avec un salaire plus eleve.",
      "Verifier ensuite les regles officielles France Travail.",
    ],
    faq: [
      {
        question: "Quelle ARE avec un salaire de 1500 EUR ?",
        answer:
          "L'estimation indicative donne un ordre de grandeur. Le montant exact depend de l'anciennete et du salaire de reference retenu.",
      },
      {
        question: "Ce montant est-il garanti ?",
        answer:
          "Non, cette page donne une estimation indicative. Le montant final depend de l'instruction par France Travail.",
      },
    ],
  },
  {
    slug: "are-salaire-1800",
    intent: "are salaire 1800",
    title: "ARE avec salaire de 1800 EUR : estimation 2026",
    description: "Estimation ARE 2026 pour un salaire de reference de 1800 EUR.",
    summary:
      "Cette page cible une recherche frequente sur le montant ARE pour un salaire intermediaire.",
    audience: "Demandeur d'emploi avec salaire de 1800 EUR",
    tags: ["are", "salaire", "1800", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 18,
      salaireReferent: 1800,
      personnesCharge: 0,
      agePersonne: 35,
    },
    checklist: [
      "Verifier le salaire de reference.",
      "Comparer avec un salaire de 1500 EUR et 2000 EUR.",
      "Croiser avec la page montant ARE.",
    ],
    faq: [
      {
        question: "Quelle ARE avec un salaire de 1800 EUR en 2026 ?",
        answer: "L'estimation indicative donne un ordre de grandeur base sur un profil type.",
      },
      {
        question: "L'anciennete change-t-elle le resultat ?",
        answer: "Oui, la duree d'affiliation influence le calcul final de l'ARE.",
      },
    ],
  },
  {
    slug: "are-salaire-2000",
    intent: "are salaire 2000",
    title: "ARE avec salaire de 2000 EUR : estimation 2026",
    description: "Estimation ARE 2026 pour un salaire de reference de 2000 EUR.",
    summary: "Cette page repond a une recherche courante sur l'ARE pour un salaire de 2000 EUR.",
    audience: "Demandeur d'emploi avec salaire de 2000 EUR",
    tags: ["are", "salaire", "2000", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 18,
      salaireReferent: 2000,
      personnesCharge: 0,
      agePersonne: 35,
    },
    checklist: [
      "Verifier le salaire de reference retenu.",
      "Comparer avec un salaire plus haut et plus bas.",
      "Verifier sur le simulateur officiel.",
    ],
    faq: [
      {
        question: "Quel montant ARE pour 2000 EUR de salaire ?",
        answer: "Cette page donne un ordre de grandeur indicatif avant un calcul detaille.",
      },
      {
        question: "Le montant est-il definitif ?",
        answer: "Non, le montant final depend toujours de l'instruction par l'organisme officiel.",
      },
    ],
  },
  {
    slug: "are-salaire-2500",
    intent: "are salaire 2500",
    title: "ARE avec salaire de 2500 EUR : estimation 2026",
    description: "Estimation ARE 2026 pour un salaire de reference de 2500 EUR.",
    summary:
      "Cette page cible les profils avec un salaire plus eleve cherchant une estimation ARE.",
    audience: "Demandeur d'emploi avec salaire de 2500 EUR",
    tags: ["are", "salaire", "2500", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 24,
      salaireReferent: 2500,
      personnesCharge: 0,
      agePersonne: 35,
    },
    checklist: [
      "Verifier le salaire de reference.",
      "Comparer avec un salaire plus bas.",
      "Croiser avec France Travail.",
    ],
    faq: [
      {
        question: "Quelle ARE pour un salaire de 2500 EUR ?",
        answer:
          "L'estimation donne un ordre de grandeur. Le plafond de l'ARE peut limiter le montant final.",
      },
      {
        question: "Le plafond ARE s'applique-t-il ?",
        answer:
          "Oui, l'ARE est plafonnee. Au-dela d'un certain salaire, le montant journalier n'augmente plus.",
      },
    ],
  },
  {
    slug: "are-couple",
    intent: "are couple",
    title: "ARE pour un couple : estimation 2026",
    description: "Estimation ARE 2026 pour un couple avec un seul demandeur d'emploi.",
    summary: "Cette page cible la situation d'un couple ou un seul conjoint est au chomage.",
    audience: "Couple avec un demandeur d'emploi",
    tags: ["are", "couple", "2026"],
    input: {
      situation: "couple",
      ancienneteEmploi: 18,
      salaireReferent: 2100,
      personnesCharge: 0,
      agePersonne: 38,
    },
    checklist: [
      "Verifier la situation familiale declaree.",
      "Comparer avec le cas personne seule.",
      "Verifier les aides complementaires possibles.",
    ],
    faq: [
      {
        question: "L'ARE est-elle differente pour un couple ?",
        answer:
          "Le calcul de base est le meme, mais la situation familiale peut influencer certaines majorations ou la duree.",
      },
      {
        question: "Les revenus du conjoint sont-ils pris en compte ?",
        answer:
          "Non, l'ARE est calculee sur le salaire de reference individuel, pas sur les revenus du foyer.",
      },
    ],
  },
  {
    slug: "are-avec-enfant",
    intent: "are avec enfant",
    title: "ARE avec enfant a charge : estimation 2026",
    description: "Estimation ARE 2026 pour une personne avec un enfant a charge.",
    summary:
      "Cette page cible les demandeurs d'emploi avec enfant a charge cherchant a estimer leur ARE.",
    audience: "Demandeur d'emploi avec enfant a charge",
    tags: ["are", "enfant", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 18,
      salaireReferent: 2000,
      personnesCharge: 1,
      agePersonne: 38,
    },
    checklist: [
      "Verifier le nombre d'enfants a charge.",
      "Comparer avec le cas sans enfant.",
      "Verifier les aides familiales complementaires.",
    ],
    faq: [
      {
        question: "Avoir un enfant change-t-il le montant de l'ARE ?",
        answer:
          "L'ARE de base est la meme, mais la presence d'enfants peut donner droit a des majorations ou a un allongement de la duree.",
      },
      {
        question: "Faut-il declarer les enfants a France Travail ?",
        answer:
          "Oui, la situation familiale doit etre declaree car elle peut influencer certains droits.",
      },
    ],
  },
  {
    slug: "are-interim",
    intent: "are interim",
    title: "ARE apres interim : estimation 2026",
    description: "Estimation ARE 2026 pour une personne en fin de mission d'interim.",
    summary: "Cette page repond a la recherche d'estimation ARE specifique aux interimaires.",
    audience: "Interimaire en fin de mission",
    tags: ["are", "interim", "2026"],
    input: {
      situation: "seul",
      ancienneteEmploi: 10,
      salaireReferent: 1800,
      personnesCharge: 0,
      agePersonne: 38,
    },
    checklist: [
      "Verifier les periodes travaillees en interim.",
      "Comparer avec un cas CDD.",
      "Verifier les regles specifiques interim.",
    ],
    faq: [
      {
        question: "L'ARE apres interim est-elle differente ?",
        answer:
          "Le calcul de base est le meme, mais les specificites des contrats interim peuvent influencer l'anciennete retenue.",
      },
      {
        question: "Comment sont comptees les missions d'interim ?",
        answer:
          "Les periodes travaillees sont additionnees pour determiner l'ouverture des droits et l'anciennete.",
      },
    ],
  },
];
