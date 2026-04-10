export const impotPilotScenarios = [
  {
    slug: "impot-revenu-30000-celibataire-2026",
    title: "Impôt 2026 : estimation pour 30 000 EUR de revenu célibataire",
    description:
      "Estimation indicative de l'impôt sur le revenu 2026 pour une personne seule avec 30 000 EUR de revenu imposable annuel.",
    summary:
      "Ce cas donne un ordre de grandeur concret avec un revenu annuel proche des recherches fréquentes.",
    audience: "Personne seule qui veut un ordre de grandeur de son impôt",
    tags: ["impot", "simulation", "30000", "celibataire"],
    input: {
      revenu: 30000,
      parts: 1,
    },
    checklist: [
      "Vérifier que le revenu saisi correspond bien au revenu net imposable annuel.",
      "Comparer avec un scénario voisin pour mesurer la progression de l'impôt.",
      "Vérifier ensuite le montant final sur impots.gouv.fr.",
    ],
    faq: [
      {
        question: "Ce montant est-il définitif ?",
        answer:
          "Non. Cette estimation reste pédagogique. Le calcul final dépend de votre dossier fiscal complet.",
      },
      {
        question: "Pourquoi partir d'un revenu annuel ?",
        answer:
          "Parce que le barème de l'impôt sur le revenu est appliqué sur une base annuelle.",
      },
    ],
  },
  {
    slug: "impot-revenu-45000-couple-2026",
    title: "Impôt 2026 : estimation pour 45 000 EUR de revenu en couple",
    description:
      "Simulation indicative de l'impôt 2026 pour un foyer en couple avec 45 000 EUR de revenu imposable et 2 parts.",
    summary:
      "Ce scénario s'adresse aux couples qui veulent un repère rapide avant une simulation personnalisée.",
    audience: "Couple sans enfant qui veut estimer son impôt",
    tags: ["impot", "couple", "45000", "2-parts"],
    input: {
      revenu: 45000,
      parts: 2,
    },
    checklist: [
      "Vérifier le nombre de parts fiscales du foyer.",
      "Comparer avec le cas célibataire pour comprendre l'effet du quotient familial.",
      "Vérifier les éventuelles réductions et crédits d'impôt hors estimation.",
    ],
    faq: [
      {
        question: "Le statut couple change-t-il beaucoup l'impôt ?",
        answer:
          "Oui, le nombre de parts peut modifier significativement le résultat estimé.",
      },
      {
        question: "Cette page intègre-t-elle les crédits d'impôt ?",
        answer:
          "Non, ce scénario est volontairement simple et se concentre sur le barème et les parts.",
      },
    ],
  },
  {
    slug: "impot-revenu-60000-couple-un-enfant-2026",
    title: "Impôt 2026 : estimation pour 60 000 EUR en couple avec un enfant",
    description:
      "Estimation indicative de l'impôt 2026 pour un couple avec un enfant, revenu imposable annuel de 60 000 EUR.",
    summary:
      "Ce cas montre l'impact d'un enfant sur l'estimation, par rapport aux cas sans enfant.",
    audience: "Couple avec enfant qui veut un repère d'impôt",
    tags: ["impot", "famille", "60000", "enfant"],
    input: {
      revenu: 60000,
      parts: 2.5,
    },
    checklist: [
      "Vérifier que la composition familiale est bien représentée par le nombre de parts.",
      "Comparer avec un scénario couple sans enfant pour mesurer l'effet des parts.",
      "Compléter ensuite sur le simulateur principal pour les situations spécifiques.",
    ],
    faq: [
      {
        question: "L'enfant réduit-il toujours l'impôt ?",
        answer:
          "Le plus souvent, oui via les parts, mais le résultat dépend du revenu et des règles applicables.",
      },
      {
        question: "Pourquoi ce cas est utile ?",
        answer:
          "Il donne un ordre de grandeur rapide pour les foyers familiaux avant calcul détaillé.",
      },
    ],
  },
  {
    slug: "impot-quotient-familial-2-parts-2026",
    title: "Quotient familial 2026 : impact de 2 parts sur l'impôt",
    description:
      "Page pédagogique pour comprendre l'effet du quotient familial avec 2 parts sur l'impôt sur le revenu 2026.",
    summary:
      "Ce scénario permet de comprendre rapidement l'effet des parts fiscales sur le montant de l'impôt.",
    audience: "Contribuable qui veut comprendre l'effet des parts fiscales",
    tags: ["impot", "quotient-familial", "2-parts", "bareme"],
    input: {
      revenu: 40000,
      parts: 2,
    },
    checklist: [
      "Vérifier le nombre de parts retenu par votre situation réelle.",
      "Comparer avec 1 part pour visualiser l'effet du quotient familial.",
      "Vérifier les règles officielles en cas de situation familiale complexe.",
    ],
    faq: [
      {
        question: "À quoi sert le quotient familial ?",
        answer:
          "Il ajuste le calcul de l'impôt en fonction de la composition du foyer fiscal.",
      },
      {
        question: "2 parts signifient-elles toujours moins d'impôt ?",
        answer:
          "Souvent oui, mais l'effet exact dépend du niveau de revenu et des règles en vigueur.",
      },
    ],
  },
  {
    slug: "impot-decote-2026-simulation",
    title: "Décote impôt 2026 : simulation simple et explication",
    description:
      "Repère 2026 pour comprendre la décote de l'impôt et son effet sur les faibles montants d'imposition.",
    summary:
      "Ce scénario aide à vérifier rapidement si la décote peut réduire votre impôt dans un cas concret.",
    audience: "Contribuable qui pense être concerné par la décote",
    tags: ["impot", "decote", "simulation", "petit-impot"],
    input: {
      revenu: 22000,
      parts: 1,
    },
    checklist: [
      "Vérifier le revenu net imposable réel du foyer.",
      "Comparer avec un revenu légèrement plus haut pour voir l'effet de seuil.",
      "Confirmer le résultat définitif sur la déclaration officielle.",
    ],
    faq: [
      {
        question: "La décote est-elle automatique ?",
        answer:
          "Elle est appliquée selon les règles fiscales en vigueur quand les conditions sont remplies.",
      },
      {
        question: "Cette page remplace-t-elle impots.gouv.fr ?",
        answer:
          "Non, elle sert de repère rapide avant vérification officielle.",
      },
    ],
  },
];
