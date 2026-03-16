export const asfAbsenceRevenuScenarios = [
  {
    slug: "asf-parent-isole-sans-pension",
    title: "ASF parent isole sans pension : estimation 2026",
    description:
      "Estimation indicative de l'ASF 2026 pour un parent isole sans pension alimentaire et avec de faibles ressources.",
    summary:
      "Cette page repond a une situation tres concrete de parent isole qui n'est plus aide par l'autre parent et cherche un repere rapide.",
    audience: "Parent isole sans pension alimentaire",
    tags: ["asf", "parent-isole", "sans-pension", "faibles-ressources"],
    input: {
      situation: "parentisole",
      nombreEnfants: 1,
      revenus: 0,
      enfantACharge: true,
    },
    checklist: [
      "Verifier que l'enfant est bien a charge et age de moins de 21 ans.",
      "Comparer avec le RSA et l'APL si vous n'avez plus de revenu.",
      "Verifier aussi la situation de pension alimentaire impayee ou inexistante.",
    ],
    faq: [
      {
        question: "Peut-on toucher l'ASF sans pension alimentaire ?",
        answer:
          "Oui, l'ASF peut concerner un parent isole lorsque la pension n'est pas versee ou n'existe pas, sous conditions.",
      },
      {
        question: "Faut-il aussi verifier le RSA et l'APL ?",
        answer:
          "Oui, surtout si le foyer n'a plus de revenu et doit couvrir un logement avec enfant a charge.",
      },
    ],
  },
];
