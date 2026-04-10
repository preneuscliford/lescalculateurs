export const areAbsenceRevenuScenarios = [
  {
    slug: "are-fin-de-droits-aides-2026",
    title: "Fin de droits ARE : quelles aides en 2026 ?",
    description:
      "Repere 2026 pour orienter rapidement vers les aides a verifier apres l'arret des allocations chomage.",
    summary:
      "Cette page sert les intentions de transition apres l'ARE et oriente vers RSA, APL et Prime d'activite.",
    audience: "Personne en fin de droits ARE sans revenu stable",
    tags: ["are", "fin-droits", "aides", "rsa", "apl"],
    input: {
      situation: "seul",
      ancienneteEmploi: 14,
      salaireReferent: 1700,
      personnesCharge: 0,
      agePersonne: 41,
    },
    checklist: [
      "Verifier la date exacte de fin de droits.",
      "Comparer RSA et APL selon la situation de logement.",
      "Tester aussi la Prime d'activite en cas de reprise partielle.",
    ],
    faq: [
      {
        question: "Que verifier en premier apres une fin de droits ARE ?",
        answer:
          "Le RSA, l'APL et les autres aides de foyer modeste sont souvent les premiers dispositifs a comparer.",
      },
      {
        question: "La fin de droits ARE ouvre-t-elle automatiquement le RSA ?",
        answer:
          "Non. Les conditions de ressources et de foyer doivent toujours etre verifiees.",
      },
    ],
  },
  {
    slug: "are-duree-indemnisation-2026",
    title: "Duree d'indemnisation ARE 2026 : estimation simple",
    description:
      "Page dediee a la duree ARE pour comprendre combien de temps l'indemnisation peut durer.",
    summary:
      "Cette page capte l'intention 'duree are' avec un angle distinct du montant et du cumul salaire.",
    audience: "Demandeur d'emploi qui veut estimer sa duree ARE",
    tags: ["are", "duree", "indemnisation"],
    input: {
      situation: "seul",
      ancienneteEmploi: 20,
      salaireReferent: 2000,
      personnesCharge: 0,
      agePersonne: 38,
    },
    checklist: [
      "Verifier l'anciennete et les periodes travaillees.",
      "Comparer la duree estimee avec un cas de reprise d'emploi.",
      "Verifier la regle officielle avant decision.",
    ],
    faq: [
      {
        question: "La duree ARE depend-elle du salaire ?",
        answer:
          "Le salaire influence surtout le montant. La duree depend d'abord des periodes d'activite et des regles en vigueur.",
      },
      {
        question: "Peut-on prolonger l'ARE en reprise partielle ?",
        answer:
          "Cela depend des regles de cumul et de la situation exacte. Une verification officielle reste necessaire.",
      },
    ],
  },
];
