export const salairePilotScenarios = [
  // ─── Tranches 1500€ ───
  {
    slug: "salaire-brut-net-1500",
    intent: "salaire 1500 brut en net",
    title: "Salaire 1500\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 1500\u00A0\u20AC brut mensuel en 2026.",
    summary:
      "Cette page cible les recherches de conversion brut/net pour un salaire de 1500\u00A0\u20AC.",
    audience: "Salaire mensuel de 1500\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "1500", "non-cadre"],
    input: { brutMensuel: 1500, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier si le statut cadre ou non-cadre s'applique.",
      "Comparer avec un salaire de 1800\u00A0\u20AC.",
      "Utiliser le simulateur complet pour affiner.",
    ],
    faq: [
      {
        question: "Quel est le net pour 1500\u00A0\u20AC brut ?",
        answer:
          "Cette estimation donne un ordre de grandeur indicatif. Le net exact d\u00e9pend du statut, des cotisations et du pr\u00e9l\u00e8vement \u00e0 la source.",
      },
      {
        question: "Ce montant est-il garanti ?",
        answer:
          "Non, cette page donne une estimation indicative bas\u00e9e sur des taux standards. Le montant r\u00e9el figure sur votre bulletin de paie.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-1500-cadre",
    intent: "salaire 1500 brut en net cadre",
    title: "Salaire 1500\u00A0\u20AC brut en net cadre : simulation 2026",
    description:
      "Estimation du salaire net pour 1500\u00A0\u20AC brut mensuel avec statut cadre en 2026.",
    summary:
      "Cette page cible les cadres avec un salaire de 1500\u00A0\u20AC brut cherchant une estimation nette.",
    audience: "Cadre avec 1500\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "1500", "cadre"],
    input: { brutMensuel: 1500, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre statut cadre exact.",
      "Comparer avec le statut non-cadre.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "Quelle diff\u00e9rence entre cadre et non-cadre pour 1500\u00A0\u20AC brut ?",
        answer:
          "Le statut cadre implique des cotisations l\u00e9g\u00e8rement plus \u00e9lev\u00e9es, r\u00e9duisant le net avant imp\u00f4t.",
      },
      {
        question: "Cette page inclut-elle le pr\u00e9l\u00e8vement \u00e0 la source ?",
        answer:
          "Le calcul donne le net avant imp\u00f4t. Le simulateur complet permet d'ajouter votre taux de PAS.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-1500-temps-partiel-80",
    intent: "salaire 1500 brut net temps partiel",
    title: "Salaire 1500\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description:
      "Estimation du salaire net pour 1500\u00A0\u20AC brut en temps partiel 80% en 2026.",
    summary:
      "Cette page cible les salari\u00e9s \u00e0 temps partiel avec un brut de 1500\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 1500\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "1500", "temps-partiel"],
    input: { brutMensuel: 1500, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier que le brut indiqu\u00e9 correspond bien \u00e0 un temps partiel 80%.",
      "Comparer avec un temps plein au m\u00eame taux horaire.",
      "Tester aussi le simulateur complet.",
    ],
    faq: [
      {
        question: "Le temps partiel change-t-il le calcul brut/net ?",
        answer:
          "Non, le taux de cotisations est le m\u00eame. Seul le montant brut change proportionnellement au temps de travail.",
      },
      {
        question: "Quel net pour 1500\u00A0\u20AC brut \u00e0 80% ?",
        answer:
          "L'estimation donne un ordre de grandeur. Le net exact d\u00e9pend de votre statut et de votre taux de PAS.",
      },
    ],
  },
  // ─── Tranches 1800€ ───
  {
    slug: "salaire-brut-net-1800",
    intent: "salaire 1800 brut en net",
    title: "Salaire 1800\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 1800\u00A0\u20AC brut mensuel en 2026.",
    summary:
      "Cette page r\u00e9pond \u00e0 la recherche fr\u00e9quente de conversion brut/net pour 1800\u00A0\u20AC.",
    audience: "Salari\u00e9 avec 1800\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "1800", "non-cadre"],
    input: { brutMensuel: 1800, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre statut cadre/non-cadre.",
      "Comparer avec 1500\u00A0\u20AC et 2000\u00A0\u20AC.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "Quel net pour 1800\u00A0\u20AC brut en 2026 ?",
        answer:
          "L'estimation indicative donne un ordre de grandeur bas\u00e9 sur un taux de cotisations standard non-cadre.",
      },
      {
        question: "Ce montant inclut-il les heures suppl\u00e9mentaires ?",
        answer:
          "Non, cette page donne une estimation pour un brut fixe sans variable ni heures suppl\u00e9mentaires.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-1800-cadre",
    intent: "salaire 1800 brut en net cadre",
    title: "Salaire 1800\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 1800\u00A0\u20AC brut mensuel cadre en 2026.",
    summary:
      "Cette page cible les cadres cherchant \u00e0 estimer leur net pour 1800\u00A0\u20AC brut.",
    audience: "Cadre avec 1800\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "1800", "cadre"],
    input: { brutMensuel: 1800, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre statut cadre et convention collective.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet.",
    ],
    faq: [
      {
        question: "Cadre : quel net pour 1800\u00A0\u20AC brut ?",
        answer:
          "Avec des cotisations cadre (~25%), le net avant imp\u00f4t est d'environ 1350\u00A0\u20AC selon cette estimation.",
      },
      {
        question: "Les cotisations cadre sont-elles fixes ?",
        answer:
          "Le taux de 25% est une approximation. Des cotisations sp\u00e9cifiques (pr\u00e9voyance, mutuelle) peuvent s'ajouter.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-1800-temps-partiel-80",
    intent: "salaire 1800 brut net temps partiel",
    title: "Salaire 1800\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description:
      "Estimation du salaire net pour 1800\u00A0\u20AC brut en temps partiel 80% en 2026.",
    summary: "Cette page cible les temps partiels avec un brut de 1800\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 1800\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "1800", "temps-partiel"],
    input: { brutMensuel: 1800, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre quotit\u00e9 de temps partiel.",
      "Comparer avec un \u00e9quivalent temps plein.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "1800\u00A0\u20AC brut en temps partiel 80% : quel net ?",
        answer:
          "L'estimation donne un ordre de grandeur indicatif bas\u00e9 sur le statut non-cadre.",
      },
      {
        question: "Le taux de cotisations est-il r\u00e9duit \u00e0 temps partiel ?",
        answer:
          "Non, le taux de cotisations salariales ne d\u00e9pend pas du temps de travail mais du statut.",
      },
    ],
  },
  // ─── Tranches 2000€ ───
  {
    slug: "salaire-brut-net-2000",
    intent: "salaire 2000 brut en net",
    title: "Salaire 2000\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 2000\u00A0\u20AC brut mensuel en 2026.",
    summary:
      "Cette page r\u00e9pond \u00e0 une recherche tr\u00e8s fr\u00e9quente de conversion brut/net pour 2000\u00A0\u20AC.",
    audience: "Salari\u00e9 avec 2000\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2000", "non-cadre"],
    input: { brutMensuel: 2000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre statut.",
      "Comparer avec 1800\u00A0\u20AC et 2500\u00A0\u20AC.",
      "Utiliser le simulateur complet avec votre taux de PAS.",
    ],
    faq: [
      {
        question: "Quel est le salaire net pour 2000\u00A0\u20AC brut ?",
        answer:
          "Pour un non-cadre, l'estimation indicative tourne autour de 1540\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "Comment est calcul\u00e9 ce montant ?",
        answer:
          "Le calcul applique un taux de cotisations salariales standard d'environ 23% pour un non-cadre.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2000-cadre",
    intent: "salaire 2000 brut en net cadre",
    title: "Salaire 2000\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 2000\u00A0\u20AC brut mensuel cadre en 2026.",
    summary:
      "Cette page cible les cadres avec un salaire de r\u00e9f\u00e9rence de 2000\u00A0\u20AC brut.",
    audience: "Cadre avec 2000\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "2000", "cadre"],
    input: { brutMensuel: 2000, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier les cotisations sp\u00e9cifiques cadre.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet.",
    ],
    faq: [
      {
        question: "Cadre : quel net pour 2000\u00A0\u20AC brut ?",
        answer:
          "Avec ~25% de cotisations cadre, le net avant imp\u00f4t est d'environ 1500\u00A0\u20AC.",
      },
      {
        question: "Pourquoi le net est-il plus bas en statut cadre ?",
        answer:
          "Les cotisations salariales cadre sont l\u00e9g\u00e8rement sup\u00e9rieures, notamment pour la retraite compl\u00e9mentaire.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2000-temps-partiel-80",
    intent: "salaire 2000 brut net temps partiel",
    title: "Salaire 2000\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description:
      "Estimation du salaire net pour 2000\u00A0\u20AC brut en temps partiel 80% en 2026.",
    summary: "Cette page cible les salari\u00e9s \u00e0 80% avec un brut de 2000\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 2000\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2000", "temps-partiel"],
    input: { brutMensuel: 2000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "Confirmer votre quotit\u00e9 exacte.",
      "Comparer avec le temps plein \u00e9quivalent.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "2000\u00A0\u20AC brut \u00e0 80% : quel net mensuel ?",
        answer:
          "L'estimation donne un ordre de grandeur. Le net d\u00e9pend du statut et de votre taux de PAS.",
      },
      {
        question: "Est-ce diff\u00e9rent d'un 2000\u00A0\u20AC brut \u00e0 temps plein ?",
        answer:
          "Le taux de cotisation est identique. La diff\u00e9rence vient uniquement du montant brut.",
      },
    ],
  },
  // ─── Tranches 2200€ ───
  {
    slug: "salaire-brut-net-2200",
    intent: "salaire 2200 brut en net",
    title: "Salaire 2200\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 2200\u00A0\u20AC brut mensuel en 2026.",
    summary: "Cette page cible les recherches de conversion pour 2200\u00A0\u20AC brut.",
    audience: "Salari\u00e9 avec 2200\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2200", "non-cadre"],
    input: { brutMensuel: 2200, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre statut.",
      "Comparer avec 2000\u00A0\u20AC et 2500\u00A0\u20AC.",
      "Tester le simulateur complet.",
    ],
    faq: [
      {
        question: "Quel net pour 2200\u00A0\u20AC brut ?",
        answer:
          "Pour un non-cadre, le net avant imp\u00f4t est estim\u00e9 autour de 1694\u00A0\u20AC.",
      },
      {
        question: "Ce montant inclut-il le PAS ?",
        answer:
          "Non, cette estimation est avant pr\u00e9l\u00e8vement \u00e0 la source. Le simulateur complet permet d'ajouter votre taux.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2200-cadre",
    intent: "salaire 2200 brut en net cadre",
    title: "Salaire 2200\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 2200\u00A0\u20AC brut mensuel cadre en 2026.",
    summary: "Cette page cible les cadres avec un salaire de 2200\u00A0\u20AC brut.",
    audience: "Cadre avec 2200\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "2200", "cadre"],
    input: { brutMensuel: 2200, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier vos cotisations sp\u00e9cifiques.",
      "Comparer avec le statut non-cadre.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "Cadre 2200\u00A0\u20AC brut : quel net ?",
        answer:
          "Avec ~25% de cotisations, l'estimation indicative du net avant imp\u00f4t est d'environ 1650\u00A0\u20AC.",
      },
      {
        question: "Les cotisations augmentent-elles avec le salaire ?",
        answer:
          "Certaines cotisations sont plafonn\u00e9es. Au-del\u00e0 du plafond de la S\u00e9curit\u00e9 sociale, le taux marginal peut changer.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2200-temps-partiel-80",
    intent: "salaire 2200 brut net temps partiel",
    title: "Salaire 2200\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description: "Estimation du salaire net pour 2200\u00A0\u20AC brut \u00e0 80% en 2026.",
    summary:
      "Cette page cible les salari\u00e9s \u00e0 temps partiel avec un brut de 2200\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 2200\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2200", "temps-partiel"],
    input: { brutMensuel: 2200, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "Confirmer le pourcentage exact de temps partiel.",
      "Comparer avec un \u00e9quivalent temps plein.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "2200\u00A0\u20AC brut \u00e0 80% \u00e9quivaut \u00e0 combien en net ?",
        answer: "L'estimation indicative donne un ordre de grandeur pour un non-cadre.",
      },
      {
        question: "Puis-je comparer avec un temps plein ?",
        answer:
          "Oui, le simulateur complet permet de tester les deux situations avec le m\u00eame taux horaire.",
      },
    ],
  },
  // ─── Tranches 2500€ ───
  {
    slug: "salaire-brut-net-2500",
    intent: "salaire 2500 brut en net",
    title: "Salaire 2500\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 2500\u00A0\u20AC brut mensuel en 2026.",
    summary:
      "Cette page r\u00e9pond \u00e0 la recherche de conversion brut/net pour 2500\u00A0\u20AC.",
    audience: "Salari\u00e9 avec 2500\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2500", "non-cadre"],
    input: { brutMensuel: 2500, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier le plafond de la S\u00e9curit\u00e9 sociale.",
      "Comparer avec 2200\u00A0\u20AC et 3000\u00A0\u20AC.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "Quel net pour 2500\u00A0\u20AC brut en 2026 ?",
        answer:
          "Pour un non-cadre, l'estimation indicative est d'environ 1925\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "Le plafond de la S\u00e9curit\u00e9 sociale impacte-t-il le calcul ?",
        answer:
          "Pour 2500\u00A0\u20AC, le salaire reste sous le plafond mensuel (~3666\u00A0\u20AC en 2025), donc le taux standard s'applique.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2500-cadre",
    intent: "salaire 2500 brut en net cadre",
    title: "Salaire 2500\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 2500\u00A0\u20AC brut mensuel cadre en 2026.",
    summary:
      "Cette page cible les cadres avec un salaire interm\u00e9diaire de 2500\u00A0\u20AC brut.",
    audience: "Cadre avec 2500\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "2500", "cadre"],
    input: { brutMensuel: 2500, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre convention collective.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet.",
    ],
    faq: [
      {
        question: "Cadre 2500\u00A0\u20AC brut : net estim\u00e9 ?",
        answer:
          "Avec ~25% de cotisations, l'estimation indicative est d'environ 1875\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "La diff\u00e9rence cadre/non-cadre est-elle importante ?",
        answer:
          "Sur 2500\u00A0\u20AC brut, la diff\u00e9rence est d'environ 50\u00A0\u20AC par mois entre les deux statuts.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2500-temps-partiel-80",
    intent: "salaire 2500 brut net temps partiel",
    title: "Salaire 2500\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description: "Estimation du salaire net pour 2500\u00A0\u20AC brut \u00e0 80% en 2026.",
    summary: "Cette page cible les temps partiels avec un brut de 2500\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 2500\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2500", "temps-partiel"],
    input: { brutMensuel: 2500, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre quotit\u00e9 exacte.",
      "Comparer avec le plein temps.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "2500\u00A0\u20AC brut \u00e0 80% : quel net ?",
        answer: "L'estimation donne un ordre de grandeur indicatif pour le statut non-cadre.",
      },
      {
        question: "Comment calculer l'\u00e9quivalent temps plein ?",
        answer:
          "Divisez le brut par le pourcentage de temps partiel, puis utilisez le simulateur avec ce montant.",
      },
    ],
  },
  // ─── Tranches 2800€ ───
  {
    slug: "salaire-brut-net-2800",
    intent: "salaire 2800 brut en net",
    title: "Salaire 2800\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 2800\u00A0\u20AC brut mensuel en 2026.",
    summary: "Cette page cible les salaires interm\u00e9diaires autour de 2800\u00A0\u20AC brut.",
    audience: "Salari\u00e9 avec 2800\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2800", "non-cadre"],
    input: { brutMensuel: 2800, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier le plafond de S\u00e9curit\u00e9 sociale.",
      "Comparer avec 2500\u00A0\u20AC et 3000\u00A0\u20AC.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "Quel net pour 2800\u00A0\u20AC brut ?",
        answer:
          "Pour un non-cadre, l'estimation indicative donne environ 2156\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "Le net augmente-t-il proportionnellement au brut ?",
        answer:
          "Oui dans cette tranche, car le salaire reste sous le plafond mensuel de la S\u00e9curit\u00e9 sociale.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2800-cadre",
    intent: "salaire 2800 brut en net cadre",
    title: "Salaire 2800\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 2800\u00A0\u20AC brut mensuel cadre en 2026.",
    summary: "Cette page cible les cadres avec un salaire de 2800\u00A0\u20AC brut.",
    audience: "Cadre avec 2800\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "2800", "cadre"],
    input: { brutMensuel: 2800, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier les cotisations cadre.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet.",
    ],
    faq: [
      {
        question: "Cadre 2800\u00A0\u20AC brut : net estim\u00e9 ?",
        answer:
          "L'estimation indicative donne environ 2100\u00A0\u20AC net avant imp\u00f4t avec le statut cadre.",
      },
      {
        question: "Le taux marginal change-t-il \u00e0 ce niveau ?",
        answer:
          "Pour 2800\u00A0\u20AC, le salaire reste globalement sous le plafond. Les cotisations suivent le taux standard.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-2800-temps-partiel-80",
    intent: "salaire 2800 brut net temps partiel",
    title: "Salaire 2800\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description: "Estimation du salaire net pour 2800\u00A0\u20AC brut \u00e0 80% en 2026.",
    summary: "Cette page cible les temps partiels avec un brut de 2800\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 2800\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "2800", "temps-partiel"],
    input: { brutMensuel: 2800, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre quotit\u00e9 exacte de temps partiel.",
      "Comparer avec un temps plein.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "2800\u00A0\u20AC brut \u00e0 80% : estimation nette ?",
        answer: "L'estimation donne un ordre de grandeur indicatif pour un non-cadre.",
      },
      {
        question: "Comment estimer mon net si je passe \u00e0 temps plein ?",
        answer:
          "Utilisez le simulateur complet en ajustant le brut proportionnellement \u00e0 100%.",
      },
    ],
  },
  // ─── Tranches 3000€ ───
  {
    slug: "salaire-brut-net-3000",
    intent: "salaire 3000 brut en net",
    title: "Salaire 3000\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 3000\u00A0\u20AC brut mensuel en 2026.",
    summary:
      "Cette page r\u00e9pond \u00e0 la recherche de conversion brut/net pour 3000\u00A0\u20AC.",
    audience: "Salari\u00e9 avec 3000\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "3000", "non-cadre"],
    input: { brutMensuel: 3000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier le plafond de la S\u00e9curit\u00e9 sociale.",
      "Comparer avec 2800\u00A0\u20AC et 3500\u00A0\u20AC.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "Quel net pour 3000\u00A0\u20AC brut ?",
        answer:
          "Pour un non-cadre, l'estimation indicative donne environ 2310\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "Le plafond S\u00e9cu impacte-t-il ce montant ?",
        answer:
          "Pour 3000\u00A0\u20AC, on reste sous le plafond mensuel. Le taux standard de 23% s'applique.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-3000-cadre",
    intent: "salaire 3000 brut en net cadre",
    title: "Salaire 3000\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 3000\u00A0\u20AC brut mensuel cadre en 2026.",
    summary: "Cette page cible les cadres avec un salaire de 3000\u00A0\u20AC brut.",
    audience: "Cadre avec 3000\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "3000", "cadre"],
    input: { brutMensuel: 3000, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier vos cotisations cadre.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet avec votre taux de PAS.",
    ],
    faq: [
      {
        question: "Cadre 3000\u00A0\u20AC brut : quel net ?",
        answer:
          "Avec ~25% de cotisations, l'estimation indicative donne environ 2250\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question:
          "La diff\u00e9rence cadre/non-cadre est-elle significative \u00e0 3000\u00A0\u20AC ?",
        answer:
          "Oui, environ 60\u00A0\u20AC par mois de diff\u00e9rence, surtout li\u00e9e aux cotisations retraite compl\u00e9mentaire.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-3000-temps-partiel-80",
    intent: "salaire 3000 brut net temps partiel",
    title: "Salaire 3000\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description: "Estimation du salaire net pour 3000\u00A0\u20AC brut \u00e0 80% en 2026.",
    summary: "Cette page cible les temps partiels avec un brut de 3000\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 3000\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "3000", "temps-partiel"],
    input: { brutMensuel: 3000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre quotit\u00e9 de temps partiel.",
      "Comparer avec un \u00e9quivalent plein temps.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "3000\u00A0\u20AC brut \u00e0 80% : estimation du net ?",
        answer: "L'estimation indicative donne un ordre de grandeur pour le statut non-cadre.",
      },
      {
        question: "Le taux de PAS change-t-il selon le temps partiel ?",
        answer:
          "Non, le taux de pr\u00e9l\u00e8vement \u00e0 la source d\u00e9pend de votre situation fiscale globale, pas du temps de travail.",
      },
    ],
  },
  // ─── Tranches 3500€ ───
  {
    slug: "salaire-brut-net-3500",
    intent: "salaire 3500 brut en net",
    title: "Salaire 3500\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 3500\u00A0\u20AC brut mensuel en 2026.",
    summary: "Cette page cible les salaires autour de 3500\u00A0\u20AC brut.",
    audience: "Salari\u00e9 avec 3500\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "3500", "non-cadre"],
    input: { brutMensuel: 3500, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier l'approche du plafond S\u00e9curit\u00e9 sociale.",
      "Comparer avec 3000\u00A0\u20AC et 4000\u00A0\u20AC.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "Quel net pour 3500\u00A0\u20AC brut ?",
        answer:
          "Pour un non-cadre, l'estimation indicative donne environ 2695\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "\u00c0 partir de quel brut le plafond S\u00e9cu est-il atteint ?",
        answer:
          "Le plafond mensuel de la S\u00e9curit\u00e9 sociale est d'environ 3666\u00A0\u20AC en 2025. Au-del\u00e0, certaines cotisations ne s'appliquent plus.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-3500-cadre",
    intent: "salaire 3500 brut en net cadre",
    title: "Salaire 3500\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 3500\u00A0\u20AC brut mensuel cadre en 2026.",
    summary: "Cette page cible les cadres avec un salaire de 3500\u00A0\u20AC brut.",
    audience: "Cadre avec 3500\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "3500", "cadre"],
    input: { brutMensuel: 3500, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier les cotisations cadre proches du plafond.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet.",
    ],
    faq: [
      {
        question: "Cadre 3500\u00A0\u20AC brut : net estim\u00e9 ?",
        answer: "Avec ~25% de cotisations, le net avant imp\u00f4t est d'environ 2625\u00A0\u20AC.",
      },
      {
        question: "Le plafond S\u00e9cu change-t-il le calcul \u00e0 ce niveau ?",
        answer:
          "\u00c0 3500\u00A0\u20AC, on approche du plafond mensuel. La partie au-dessus du plafond peut avoir un taux de cotisation diff\u00e9rent.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-3500-temps-partiel-80",
    intent: "salaire 3500 brut net temps partiel",
    title: "Salaire 3500\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description: "Estimation du salaire net pour 3500\u00A0\u20AC brut \u00e0 80% en 2026.",
    summary:
      "Cette page cible les temps partiels avec un brut \u00e9lev\u00e9 de 3500\u00A0\u20AC.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 3500\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "3500", "temps-partiel"],
    input: { brutMensuel: 3500, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier votre quotit\u00e9 exacte.",
      "Comparer avec un temps plein \u00e9quivalent.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "3500\u00A0\u20AC brut \u00e0 80% : quel net ?",
        answer:
          "L'estimation donne un ordre de grandeur indicatif. Le taux de cotisations reste le m\u00eame malgr\u00e9 le temps partiel.",
      },
      {
        question: "Le temps partiel r\u00e9duit-il le plafond S\u00e9cu ?",
        answer:
          "Oui, le plafond est proratis\u00e9 en fonction du temps de travail pour certaines cotisations.",
      },
    ],
  },
  // ─── Tranches 4000€ ───
  {
    slug: "salaire-brut-net-4000",
    intent: "salaire 4000 brut en net",
    title: "Salaire 4000\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 4000\u00A0\u20AC brut mensuel en 2026.",
    summary: "Cette page cible les salaires autour de 4000\u00A0\u20AC brut.",
    audience: "Salari\u00e9 avec 4000\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "4000", "non-cadre"],
    input: { brutMensuel: 4000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier le d\u00e9passement du plafond S\u00e9curit\u00e9 sociale.",
      "Comparer avec 3500\u00A0\u20AC et 5000\u00A0\u20AC.",
      "Utiliser le simulateur complet pour plus de pr\u00e9cision.",
    ],
    faq: [
      {
        question: "Quel net pour 4000\u00A0\u20AC brut ?",
        answer:
          "Pour un non-cadre, l'estimation indicative donne environ 3080\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "Le calcul change-t-il au-dessus du plafond S\u00e9cu ?",
        answer:
          "Avec notre moteur simplifi\u00e9, le taux reste constant. En r\u00e9alit\u00e9, la partie au-dessus du plafond peut avoir un taux r\u00e9duit.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-4000-cadre",
    intent: "salaire 4000 brut en net cadre",
    title: "Salaire 4000\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 4000\u00A0\u20AC brut mensuel cadre en 2026.",
    summary: "Cette page cible les cadres avec un salaire de 4000\u00A0\u20AC brut.",
    audience: "Cadre avec 4000\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "4000", "cadre"],
    input: { brutMensuel: 4000, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier vos cotisations cadre au-dessus du plafond.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet avec votre taux de PAS.",
    ],
    faq: [
      {
        question: "Cadre 4000\u00A0\u20AC brut : quel net ?",
        answer:
          "Avec ~25% de cotisations, l'estimation indicative donne environ 3000\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "Les cotisations retraite cadre sont-elles plus \u00e9lev\u00e9es ?",
        answer:
          "Oui, les cadres cotisent \u00e0 des r\u00e9gimes compl\u00e9mentaires sp\u00e9cifiques (AGIRC-ARRCO) avec des taux suppl\u00e9mentaires.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-4000-temps-partiel-80",
    intent: "salaire 4000 brut net temps partiel",
    title: "Salaire 4000\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description: "Estimation du salaire net pour 4000\u00A0\u20AC brut \u00e0 80% en 2026.",
    summary: "Cette page cible les cadres dirigeants ou profils experts \u00e0 temps partiel.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 4000\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "4000", "temps-partiel"],
    input: { brutMensuel: 4000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier la proratisation du plafond.",
      "Comparer avec un temps plein.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "4000\u00A0\u20AC brut \u00e0 80% : quel net estim\u00e9 ?",
        answer:
          "L'estimation indicative donne un ordre de grandeur. Le taux de cotisations reste standard.",
      },
      {
        question: "Un temps partiel \u00e0 4000\u00A0\u20AC brut est-il courant ?",
        answer:
          "C'est un profil plus rare, souvent des cadres exp\u00e9riment\u00e9s ou des consultants en temps r\u00e9duit.",
      },
    ],
  },
  // ─── Tranches 5000€ ───
  {
    slug: "salaire-brut-net-5000",
    intent: "salaire 5000 brut en net",
    title: "Salaire 5000\u00A0\u20AC brut en net : simulation 2026",
    description: "Estimation du salaire net pour 5000\u00A0\u20AC brut mensuel en 2026.",
    summary: "Cette page r\u00e9pond \u00e0 la recherche de conversion pour 5000\u00A0\u20AC brut.",
    audience: "Salari\u00e9 avec 5000\u00A0\u20AC brut mensuel",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "5000", "non-cadre"],
    input: { brutMensuel: 5000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier le plafond S\u00e9curit\u00e9 sociale pour la partie haute.",
      "Comparer avec 4000\u00A0\u20AC.",
      "Utiliser le simulateur complet pour une estimation plus fine.",
    ],
    faq: [
      {
        question: "Quel net pour 5000\u00A0\u20AC brut en 2026 ?",
        answer:
          "Pour un non-cadre, l'estimation indicative donne environ 3850\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "\u00c0 5000\u00A0\u20AC, le taux de cotisation est-il diff\u00e9rent ?",
        answer:
          "Notre moteur simplifi\u00e9 applique un taux fixe. En pratique, la partie au-dessus du plafond (~3666\u00A0\u20AC) peut avoir un taux r\u00e9duit.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-5000-cadre",
    intent: "salaire 5000 brut en net cadre",
    title: "Salaire 5000\u00A0\u20AC brut en net cadre : simulation 2026",
    description: "Estimation du salaire net pour 5000\u00A0\u20AC brut mensuel cadre en 2026.",
    summary:
      "Cette page cible les cadres sup\u00e9rieurs avec un salaire de 5000\u00A0\u20AC brut.",
    audience: "Cadre avec 5000\u00A0\u20AC brut mensuel",
    statut: "cadre",
    tags: ["salaire", "brut-net", "5000", "cadre"],
    input: { brutMensuel: 5000, statut: "cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier les cotisations cadre au-dessus du plafond.",
      "Comparer avec le statut non-cadre.",
      "Tester le simulateur complet avec votre taux de PAS.",
    ],
    faq: [
      {
        question: "Cadre 5000\u00A0\u20AC brut : net estim\u00e9 ?",
        answer:
          "Avec ~25% de cotisations, l'estimation indicative donne environ 3750\u00A0\u20AC net avant imp\u00f4t.",
      },
      {
        question: "Y a-t-il un plafonnement des cotisations \u00e0 ce niveau ?",
        answer:
          "Oui, au-del\u00e0 du plafond S\u00e9curit\u00e9 sociale, les cotisations d\u00e9plafonn\u00e9es (CSG, CRDS) continuent de s'appliquer.",
      },
    ],
  },
  {
    slug: "salaire-brut-net-5000-temps-partiel-80",
    intent: "salaire 5000 brut net temps partiel",
    title: "Salaire 5000\u00A0\u20AC brut en net temps partiel 80% : simulation 2026",
    description: "Estimation du salaire net pour 5000\u00A0\u20AC brut \u00e0 80% en 2026.",
    summary: "Cette page cible les hauts salaires en temps partiel.",
    audience: "Salari\u00e9 \u00e0 temps partiel avec 5000\u00A0\u20AC brut",
    statut: "non_cadre",
    tags: ["salaire", "brut-net", "5000", "temps-partiel"],
    input: { brutMensuel: 5000, statut: "non_cadre", tauxPAS: 0 },
    checklist: [
      "V\u00e9rifier le plafond proratis\u00e9.",
      "Comparer avec un temps plein.",
      "Utiliser le simulateur complet.",
    ],
    faq: [
      {
        question: "5000\u00A0\u20AC brut \u00e0 80% : quel net ?",
        answer:
          "L'estimation indicative donne un ordre de grandeur. Le plafond S\u00e9cu est proratis\u00e9 pour le temps partiel.",
      },
      {
        question: "Le taux marginal est-il diff\u00e9rent \u00e0 ce niveau de salaire ?",
        answer:
          "Au-del\u00e0 du plafond, le taux marginal de cotisations peut baisser, mais la CSG-CRDS reste d\u00e9plafonn\u00e9e.",
      },
    ],
  },
];
