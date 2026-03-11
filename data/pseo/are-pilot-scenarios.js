export const arePilotScenarios = [
  {
    slug: "montant-are-2026",
    title: "Montant ARE 2026 : calcul et estimation chômage",
    description: "Estimation indicative du montant ARE 2026 à partir d'un salaire de référence et d'une ancienneté type.",
    summary: "Cette page sert les intentions de calcul ARE et d'estimation chômage avec un scénario simple à comprendre.",
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
      "Vérifier le salaire de référence utilisé.",
      "Comparer avec un cas de reprise d'activité ou de temps partiel.",
      "Vérifier ensuite les références officielles France Travail.",
    ],
    faq: [
      {
        question: "Comment estimer rapidement le montant ARE ?",
        answer: "Cette page donne un ordre de grandeur à partir d'un profil type, avant un calcul plus détaillé.",
      },
      {
        question: "Le montant est-il définitif ?",
        answer: "Non. Le montant final dépend toujours de l'instruction par l'organisme officiel.",
      },
    ],
  },
  {
    slug: "are-fin-de-droits-aides",
    title: "Fin de droits ARE : quelles aides en 2026 ?",
    description: "Repères utiles après la fin de droits ARE avec orientation vers les aides et simulateurs pertinents.",
    summary: "Cette page sert les personnes en fin de droits qui cherchent une suite logique vers d'autres aides ou une nouvelle simulation.",
    audience: "Personne en fin de droits ARE",
    tags: ["are", "fin-droits", "aides"],
    input: {
      situation: "seul",
      ancienneteEmploi: 12,
      salaireReferent: 1600,
      personnesCharge: 0,
      agePersonne: 42,
    },
    checklist: [
      "Vérifier si une autre aide devient prioritaire.",
      "Comparer avec RSA et APL selon votre situation.",
      "Vérifier les références officielles avant toute démarche.",
    ],
    faq: [
      {
        question: "Que faire après une fin de droits ARE ?",
        answer: "Cette page donne des pistes de vérification et oriente vers les simulateurs utiles selon votre situation.",
      },
      {
        question: "Le RSA peut-il prendre le relais ?",
        answer: "Oui, dans certains cas, selon vos ressources et votre foyer. Une vérification dédiée est utile.",
      },
    ],
  },
];
