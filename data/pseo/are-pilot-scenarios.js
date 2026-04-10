export const arePilotScenarios = [
  {
    slug: "montant-are-2026",
    title: "Montant ARE 2026 : calcul et estimation chomage",
    description:
      "Estimation indicative du montant ARE 2026 a partir du salaire de reference et de l'anciennete.",
    summary:
      "Cette page capte l'intention principale de calcul ARE avec un scenario simple a comprendre.",
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
        answer:
          "Non. Le montant final depend toujours de l'instruction par l'organisme officiel.",
      },
    ],
  },
  {
    slug: "are-cumul-salaire-temps-partiel-2026",
    title: "Cumul ARE et salaire a temps partiel : simulation 2026",
    description:
      "Page dediee au cumul ARE et salaire en reprise partielle pour estimer l'impact mensuel.",
    summary:
      "Cette page cible l'intention forte 'cumul are et salaire simulation' avec un angle concret.",
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
      "Cette page sert l'intention de calcul technique ARE avec un angle distinct du cumul et de la fin de droits.",
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
        answer:
          "Parce qu'il influence directement la base de calcul de l'allocation ARE.",
      },
      {
        question: "Faut-il aussi tester un cas de reprise ?",
        answer:
          "Oui, pour mesurer la difference entre un calcul ARE standard et un cas de cumul.",
      },
    ],
  },
];
