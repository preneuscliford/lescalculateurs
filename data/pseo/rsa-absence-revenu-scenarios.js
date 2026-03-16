export const rsaAbsenceRevenuScenarios = [
  {
    slug: "rsa-sans-revenu-personne-seule",
    title: "RSA sans revenu pour une personne seule : estimation 2026",
    description:
      "Estimation indicative du RSA 2026 pour une personne seule sans revenu et sans activite.",
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
      "Verifier si le logement est loue, gratuit ou pris en charge par un proche.",
      "Comparer avec une situation de chomage avec petite allocation residuelle.",
      "Tester aussi l'APL si vous payez un loyer.",
    ],
    faq: [
      {
        question: "Quel RSA peut toucher une personne seule sans revenu ?",
        answer:
          "Cette page donne un ordre de grandeur indicatif. Le montant final depend toujours du logement, du foyer et des ressources retenues.",
      },
      {
        question: "Le RSA est-il automatique quand on n'a aucun revenu ?",
        answer:
          "Non. Il faut remplir les conditions d'eligibilite et declarer sa situation a la CAF.",
      },
    ],
  },
  {
    slug: "rsa-couple-sans-revenu",
    title: "RSA couple sans revenu : estimation 2026",
    description:
      "Ordre de grandeur du RSA 2026 pour un couple sans revenu avec logement loue.",
    summary:
      "Cette page repond aux couples qui veulent estimer rapidement le RSA quand les deux adultes n'ont plus de revenu.",
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
      "Verifier si un autre revenu du foyer doit encore etre pris en compte.",
      "Comparer avec un hebergement gratuit si vous n'avez plus de loyer.",
      "Tester aussi le cas avec un enfant si la composition du foyer change.",
    ],
    faq: [
      {
        question: "Le RSA d'un couple sans revenu est-il plus eleve ?",
        answer:
          "Le montant theorique augmente avec la composition du foyer, mais il reste toujours soumis aux conditions de ressources et de situation.",
      },
      {
        question: "Le logement change-t-il le RSA estime ?",
        answer:
          "Oui. Un logement gratuit ou une aide au logement peut modifier l'estimation finale.",
      },
    ],
  },
  {
    slug: "rsa-parent-isole-sans-revenu",
    title: "RSA parent isole sans revenu : estimation 2026",
    description:
      "Exemple de RSA 2026 pour un parent isole sans revenu avec enfant a charge.",
    summary:
      "Cette page cible les situations les plus sensibles de rupture de revenu avec enfant a charge et besoin d'aide rapide.",
    audience: "Parent isole sans revenu",
    tags: ["rsa", "sans-revenu", "parent-isole", "enfant"],
    input: {
      situation: "monoparental",
      enfants: 1,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Verifier le nombre d'enfants pris en compte dans le foyer.",
      "Comparer avec l'ASF si une pension alimentaire n'est plus versee.",
      "Tester aussi l'APL pour mesurer le total d'aides possibles.",
    ],
    faq: [
      {
        question: "Un parent isole sans revenu peut-il toucher plus de RSA ?",
        answer:
          "Le montant peut etre plus eleve selon la composition du foyer, mais la situation doit toujours etre verifiee avec la CAF.",
      },
      {
        question: "Faut-il aussi simuler l'APL et l'ASF ?",
        answer:
          "Oui, surtout si vous avez un logement a payer ou une pension alimentaire impayee.",
      },
    ],
  },
];
