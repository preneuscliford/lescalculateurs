export const notaireScenarios = [
  {
    slug: "frais-notaire-ancien-simulation",
    title: "Frais de notaire ancien 2026 : simulation pour un achat à 250 000 €",
    description:
      "Estimation indicative des frais de notaire 2026 pour un achat dans l'ancien à 250 000 €. Détail des droits de mutation, émoluments et frais divers.",
    summary:
      "Cette page simule les frais de notaire pour un achat ancien type à 250 000 €, avec le détail complet des coûts.",
    audience: "Acheteur d'un bien ancien autour de 250 000 €",
    tags: ["frais-notaire", "ancien", "simulation", "250000", "2026"],
    input: {
      prix: 250000,
      type: "ancien",
      departement: "75",
    },
    checklist: [
      "Vérifier le taux DMTO du département (majoré, standard ou réduit).",
      {
        text: "Comparer avec un achat dans le neuf pour le même budget.",
        comparisonSlug: "comparaison-ancien-neuf-250k",
      },
      "Inclure les frais d'hypothèque si emprunt bancaire.",
      "Prévoir les débours et formalités en sus.",
    ],
    comparisons: [
      {
        slug: "comparaison-ancien-neuf-250k",
        text: "Voir la comparaison ancien vs neuf à 250 000 €",
      },
    ],
    faq: [
      {
        question: "Quel est le montant des frais de notaire pour un achat ancien à 250 000 € ?",
        answer:
          "Pour un achat ancien à Paris (75), comptez environ 7 à 8 % du prix, soit autour de 17 500 à 20 000 € selon le taux DMTO applicable.",
      },
      {
        question: "Le taux DMTO change-t-il selon le département ?",
        answer:
          "Oui. Dans la plupart des départements le taux est majoré à 6,32 %. Dans 12 départements il est à 5,80 %, et dans l'Indre et Mayotte à 5,09 %.",
      },
      {
        question: "Les frais de notaire sont-ils les mêmes partout en France ?",
        answer:
          "Non. Les droits de mutation (DMTO) varient selon le département. Les émoluments du notaire et la CSI sont fixes par barème national.",
      },
      {
        question: "Peut-on négocier les frais de notaire ?",
        answer:
          "Les émoluments du notaire sont réglementés et non négociables. Les frais divers (débours) peuvent varier selon le dossier.",
      },
    ],
  },
  {
    slug: "frais-notaire-neuf-reduction",
    title: "Frais de notaire dans le neuf 2026 : simulation pour un achat à 200 000 €",
    description:
      "Estimation indicative des frais de notaire 2026 pour un achat dans le neuf à 200 000 €. Découvrez la réduction par rapport à l'ancien.",
    summary:
      "Cette page détaille les frais de notaire réduits pour un achat dans le neuf à 200 000 €, avec comparaison par rapport à l'ancien.",
    audience: "Acheteur d'un bien neuf autour de 200 000 €",
    tags: ["frais-notaire", "neuf", "simulation", "200000", "2026", "reduction"],
    input: {
      prix: 200000,
      type: "neuf",
      departement: "75",
    },
    checklist: [
      {
        text: "Comparer avec l'ancien pour le même budget : l'écart peut dépasser 10 000 €.",
        comparisonSlug: "comparaison-neuf-ancien-200k",
      },
      "Vérifier si le bien est en VEFA (vente en l'état futur d'achèvement).",
      "Les frais de notaire dans le neuf incluent la TVA sur les émoluments.",
    ],
    comparisons: [
      {
        slug: "comparaison-neuf-ancien-200k",
        text: "Voir la comparaison neuf vs ancien à 200 000 €",
      },
    ],
    faq: [
      {
        question: "Quel est le montant des frais de notaire pour un neuf à 200 000 € ?",
        answer:
          "Pour un achat dans le neuf, comptez environ 2 à 3 % du prix, soit autour de 4 000 à 6 000 €. C'est bien moins que dans l'ancien.",
      },
      {
        question: "Pourquoi les frais de notaire sont-ils moins chers dans le neuf ?",
        answer:
          "Parce que les droits de mutation (DMTO) sont réduits : 0,715 % dans le neuf contre environ 6 % dans l'ancien. Cela représente plusieurs milliers d'euros d'économie.",
      },
      {
        question: "Quelle différence de prix entre ancien et neuf pour 200 000 € ?",
        answer:
          "Pour 200 000 €, comptez environ 15 000 € de frais dans l'ancien contre seulement 4 000 à 5 000 € dans le neuf, soit une économie d'environ 10 000 €.",
      },
    ],
  },
  {
    slug: "frais-notaire-terrain",
    title: "Frais de notaire pour un terrain à bâtir 2026 : simulation à 100 000 €",
    description:
      "Estimation indicative des frais de notaire 2026 pour l'achat d'un terrain à bâtir à 100 000 €. Droits de mutation et frais notariés spécifiques.",
    summary:
      "Cette page estime les frais de notaire pour un terrain à bâtir à 100 000 €, avec le détail des droits et taxes applicables.",
    audience: "Acheteur d'un terrain à bâtir autour de 100 000 €",
    tags: ["frais-notaire", "terrain", "simulation", "100000", "2026", "terrain-a-batir"],
    input: {
      prix: 100000,
      type: "ancien",
      departement: "33",
    },
    checklist: [
      "Le terrain à bâtir est taxé comme l'ancien (taux DMTO standard ou majoré).",
      "Ajouter les frais de géomètre et de bornage si non inclus.",
      {
        text: "Comparer avec l'achat d'une maison ancienne au même prix.",
        comparisonSlug: "comparaison-terrain-ancien-100k",
      },
      "Vérifier les taxes d'urbanisme et d'aménagement en sus.",
    ],
    comparisons: [
      {
        slug: "comparaison-terrain-ancien-100k",
        text: "Voir la comparaison terrain vs maison ancienne à 100 000 €",
      },
    ],
    faq: [
      {
        question: "Quels sont les frais de notaire pour un terrain à 100 000 € ?",
        answer:
          "Pour un terrain à bâtir, comptez environ 7 à 8 % du prix comme dans l'ancien, soit environ 7 000 à 8 000 € selon le département.",
      },
      {
        question: "Le terrain à bâtir bénéficie-t-il de frais réduits comme le neuf ?",
        answer:
          "Non. Le terrain est considéré comme un bien ancien pour les droits de mutation. Les taux DMTO standard (5,80 %) ou majoré (6,32 %) s'appliquent.",
      },
      {
        question: "Y a-t-il des frais supplémentaires pour un terrain ?",
        answer:
          "Oui, il faut prévoir les frais de géomètre, de bornage et éventuellement les taxes d'urbanisme et d'aménagement qui s'ajoutent aux frais de notaire.",
      },
    ],
  },
  {
    slug: "frais-notaire-residence-secondaire",
    title: "Frais de notaire résidence secondaire 2026 : calcul",
    description:
      "Estimation indicative des frais de notaire 2026 pour l'achat d'une résidence secondaire dans l'ancien.",
    summary:
      "Cette page cible un achat patrimonial fréquent, différent d'une résidence principale ou d'un terrain.",
    audience: "Acheteur d'une résidence secondaire dans l'ancien",
    tags: ["frais-notaire", "residence-secondaire", "ancien", "2026"],
    input: {
      prix: 280000,
      type: "ancien",
      departement: "33",
    },
    checklist: [
      "Vérifier le département où se situe le bien pour le taux DMTO.",
      "Comparer avec un achat dans le neuf pour mesurer l'écart de frais.",
      "Prévoir les frais annexes liés au financement si un emprunt est utilisé.",
    ],
    comparisons: [],
    faq: [
      {
        question: "Les frais de notaire changent-ils pour une résidence secondaire ?",
        answer:
          "Le calcul reste le même pour la nature du bien, mais l'intention d'achat et le budget global sont différents.",
      },
      {
        question: "Pourquoi cette page est-elle utile ?",
        answer:
          "Parce qu'elle donne un repère concret pour un achat de loisir ou patrimonial, pas seulement pour une résidence principale.",
      },
    ],
  },
];
