export const rsaPilotScenarios = [
  {
    slug: "combien-touche-t-on-au-rsa",
    title: "Combien touche-t-on au RSA ? (2026)",
    description: "Ordre de grandeur du RSA 2026 pour un foyer sans revenus ou avec des ressources très faibles.",
    summary: "Cette page donne un premier repère sur le montant du RSA et oriente ensuite vers des cas plus précis.",
    audience: "Foyer cherchant un ordre de grandeur du RSA",
    tags: ["rsa", "montant", "general"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier la composition exacte du foyer.",
      "Comparer avec votre niveau de revenus réel.",
      "Tenir compte du logement ou d'un hébergement gratuit.",
    ],
    faq: [
      {
        question: "Le RSA est-il le même pour tous ?",
        answer: "Non. Le montant dépend du foyer, des revenus et de la situation de logement.",
      },
      {
        question: "Ce montant est-il définitif ?",
        answer: "Non. Il s'agit d'un ordre de grandeur avant vérification par la CAF.",
      },
    ],
  },
  {
    slug: "qui-a-droit-au-rsa",
    title: "Qui a droit au RSA ? (2026)",
    description: "Conditions principales d'accès au RSA en 2026 avec un scénario type de ressources faibles.",
    summary: "Cette page aide à comprendre l'éligibilité au RSA avant de passer au simulateur complet.",
    audience: "Personne qui vérifie son éligibilité au RSA",
    tags: ["rsa", "conditions", "eligibilite"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 300,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier votre âge et votre résidence en France.",
      "Comparer vos revenus avec le foyer déclaré.",
      "Confirmer le type de logement ou d'hébergement.",
    ],
    faq: [
      {
        question: "Peut-on avoir le RSA avec un petit revenu ?",
        answer: "Oui, dans certains cas. Le RSA complète des ressources faibles selon la situation du foyer.",
      },
      {
        question: "Faut-il être sans emploi pour toucher le RSA ?",
        answer: "Non. Une activité faible ou partielle peut rester compatible avec le RSA.",
      },
    ],
  },
  {
    slug: "rsa-auto-entrepreneur",
    title: "RSA auto-entrepreneur (2026)",
    description: "Estimation indicative du RSA pour un auto-entrepreneur avec des revenus modestes.",
    summary: "Cette page répond à une situation fréquente de revenus variables et de besoin de complément.",
    audience: "Auto-entrepreneur avec faibles revenus",
    tags: ["rsa", "activite", "independant"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 500,
      logement: "loue",
      activite: "actif",
    },
    checklist: [
      "Vérifier vos revenus moyens réels.",
      "Comparer un mois faible et un mois plus élevé.",
      "Tester aussi un cas sans revenus d'activité.",
    ],
    faq: [
      {
        question: "Un auto-entrepreneur peut-il toucher le RSA ?",
        answer: "Oui, sous conditions de ressources et selon les revenus retenus par la CAF.",
      },
      {
        question: "Des revenus variables changent-ils le montant ?",
        answer: "Oui, les variations d'activité peuvent modifier l'estimation du RSA.",
      },
    ],
  },
  {
    slug: "rsa-chomage-fin-de-droits",
    title: "RSA chômage après fin de droits (2026)",
    description: "Estimation indicative du RSA après une fin de droits chômage si les ressources deviennent faibles.",
    summary: "Cette page relie la fin de droits ARE à un scénario RSA très proche de la recherche réelle.",
    audience: "Personne en fin de droits chômage",
    tags: ["rsa", "chomage", "fin-droits"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 150,
      logement: "loue",
      activite: "chomage",
    },
    checklist: [
      "Comparer votre situation avant et après la fin de droits.",
      "Vérifier si d'autres aides logement s'ajoutent.",
      "Tester aussi un cas avec reprise d'activité partielle.",
    ],
    faq: [
      {
        question: "Le RSA peut-il prendre le relais après l'ARE ?",
        answer: "Oui, si les ressources deviennent suffisamment faibles et si les autres conditions sont remplies.",
      },
      {
        question: "Faut-il refaire une simulation après la fin de droits ?",
        answer: "Oui, car le niveau de ressources et les aides perçues peuvent changer rapidement.",
      },
    ],
  },
  {
    slug: "rsa-conditions-2026",
    title: "RSA conditions 2026",
    description: "Principales conditions du RSA en 2026 avec un cas type de foyer à faibles ressources.",
    summary: "Cette page sert de porte d'entrée vers le cluster conditions et éligibilité RSA.",
    audience: "Foyer qui vérifie les conditions du RSA",
    tags: ["rsa", "conditions", "2026"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 250,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier l'âge et la résidence habituelle.",
      "Comparer les revenus du foyer et le logement.",
      "Utiliser ensuite le simulateur complet.",
    ],
    faq: [
      {
        question: "Les conditions RSA changent-elles selon le foyer ?",
        answer: "Oui, la situation familiale et les revenus retenus modifient fortement l'estimation.",
      },
      {
        question: "Le logement compte-t-il dans le RSA ?",
        answer: "Oui, selon votre situation de logement ou d'hébergement.",
      },
    ],
  },
  {
    slug: "rsa-couple-avec-enfant",
    title: "RSA couple avec enfant (2026)",
    description: "Estimation indicative du RSA pour un couple avec enfant et ressources faibles.",
    summary: "Cette page couvre une intention fréquente de foyer familial avec besoin d'estimation rapide.",
    audience: "Couple avec enfant",
    tags: ["rsa", "couple", "enfant"],
    input: {
      situation: "couple",
      enfants: 1,
      revenus: 450,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier le nombre d'enfants à charge.",
      "Comparer avec le cas couple sans enfant.",
      "Tester aussi un cas avec petit revenu d'activité.",
    ],
    faq: [
      {
        question: "Un enfant augmente-t-il le RSA ?",
        answer: "Oui, la composition du foyer fait évoluer le montant forfaitaire retenu.",
      },
      {
        question: "Les revenus du couple restent-ils pris en compte ?",
        answer: "Oui, les ressources du foyer continuent de réduire le montant final.",
      },
    ],
  },
  {
    slug: "rsa-couple-sans-enfant",
    title: "RSA couple sans enfant (2026)",
    description: "Estimation indicative du RSA pour un couple sans enfant avec peu ou pas de revenus.",
    summary: "Cette page sert une recherche simple sur le RSA couple et permet ensuite de comparer plusieurs variantes.",
    audience: "Couple sans enfant",
    tags: ["rsa", "couple", "sans-enfant"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus: 300,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Comparer avec le cas personne seule.",
      "Vérifier le revenu total du foyer.",
      "Tester aussi un cas avec temps partiel.",
    ],
    faq: [
      {
        question: "Le RSA d'un couple est-il plus élevé qu'une personne seule ?",
        answer: "Oui, le montant forfaitaire de base est plus élevé pour un couple.",
      },
      {
        question: "Un petit revenu annule-t-il le RSA ?",
        answer: "Pas toujours. Il peut réduire le montant sans faire disparaître totalement l'aide.",
      },
    ],
  },
  {
    slug: "rsa-et-apl-cumul",
    title: "RSA et APL : cumul (2026)",
    description: "Ordre de grandeur du RSA lorsqu'un foyer perçoit aussi une aide au logement.",
    summary: "Cette page répond à une intention de cumul très courante entre RSA et APL.",
    audience: "Foyer qui cumule RSA et APL",
    tags: ["rsa", "apl", "cumul"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 200,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier votre situation de logement.",
      "Comparer avec un hébergement gratuit.",
      "Tester ensuite le simulateur APL en plus du RSA.",
    ],
    faq: [
      {
        question: "Peut-on cumuler RSA et APL ?",
        answer: "Oui, dans de nombreux cas, même si le logement peut influencer le montant retenu.",
      },
      {
        question: "Le logement change-t-il le RSA ?",
        answer: "Oui, selon le type de logement ou l'hébergement gratuit.",
      },
    ],
  },
  {
    slug: "rsa-hebergement-gratuit",
    title: "RSA avec hébergement gratuit (2026)",
    description: "Estimation indicative du RSA pour une personne hébergée gratuitement.",
    summary: "Cette page couvre un cas souvent mal compris, avec un impact possible du logement sur le montant final.",
    audience: "Personne hébergée gratuitement",
    tags: ["rsa", "hebergement", "logement"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 100,
      logement: "gratuit",
      activite: "inactif",
    },
    checklist: [
      "Vérifier si l'hébergement est totalement gratuit.",
      "Comparer avec un logement loué.",
      "Tenir compte des autres ressources du foyer.",
    ],
    faq: [
      {
        question: "Le RSA baisse-t-il si je suis hébergé gratuitement ?",
        answer: "Le logement peut modifier l'estimation retenue pour le RSA.",
      },
      {
        question: "Dois-je quand même déclarer ma situation de logement ?",
        answer: "Oui, c'est un point important du dossier.",
      },
    ],
  },
  {
    slug: "rsa-interim",
    title: "RSA intérim (2026)",
    description: "Estimation indicative du RSA pour une personne en intérim avec des revenus irréguliers.",
    summary: "Cette page répond à une situation de revenus instables très fréquente dans les recherches RSA.",
    audience: "Personne en intérim",
    tags: ["rsa", "interim", "activite"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 700,
      logement: "loue",
      activite: "actif",
    },
    checklist: [
      "Comparer un mois faible et un mois plus élevé.",
      "Vérifier si le foyer a d'autres revenus.",
      "Tester aussi un cas sans activité.",
    ],
    faq: [
      {
        question: "Peut-on toucher le RSA en intérim ?",
        answer: "Oui, si les revenus retenus restent suffisamment faibles.",
      },
      {
        question: "Les revenus variables changent-ils beaucoup le RSA ?",
        answer: "Oui, des mois différents peuvent faire varier l'estimation.",
      },
    ],
  },
  {
    slug: "rsa-jeune-moins-de-25-ans",
    title: "RSA jeune de moins de 25 ans (2026)",
    description: "Repère indicatif sur le RSA pour un jeune de moins de 25 ans avec faibles ressources.",
    summary: "Cette page couvre un cas sensible où les conditions doivent être vérifiées avec attention.",
    audience: "Jeune de moins de 25 ans",
    tags: ["rsa", "jeune", "conditions"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 200,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier les conditions spécifiques d'âge.",
      "Comparer avec une situation de parent isolé si besoin.",
      "Vérifier aussi les pages officielles avant toute démarche.",
    ],
    faq: [
      {
        question: "Peut-on avoir le RSA avant 25 ans ?",
        answer: "Le cas existe mais dépend de conditions spécifiques à vérifier avec les références officielles.",
      },
      {
        question: "Cette page suffit-elle pour savoir si j'y ai droit ?",
        answer: "Non. Elle donne un repère mais la vérification finale reste indispensable.",
      },
    ],
  },
  {
    slug: "rsa-logement-social",
    title: "RSA logement social (2026)",
    description: "Estimation indicative du RSA pour un foyer en logement social.",
    summary: "Cette page relie situation de logement et estimation RSA, avec un besoin fréquent de comparaison avec l'APL.",
    audience: "Foyer en logement social",
    tags: ["rsa", "logement", "social"],
    input: {
      situation: "seul",
      enfants: 1,
      revenus: 250,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier si une aide logement est déjà perçue.",
      "Comparer avec un hébergement gratuit.",
      "Tester aussi le simulateur APL si besoin.",
    ],
    faq: [
      {
        question: "Le logement social change-t-il le RSA ?",
        answer: "Le logement peut influencer le montant final selon les aides déjà perçues et la situation déclarée.",
      },
      {
        question: "Faut-il tester l'APL en plus ?",
        answer: "Oui, selon le cas, il est souvent utile de comparer avec l'aide au logement.",
      },
    ],
  },
  {
    slug: "rsa-personne-seule-montant",
    title: "RSA personne seule : montant (2026)",
    description: "Ordre de grandeur du RSA 2026 pour une personne seule avec ressources faibles.",
    summary: "Cette page sert une requête centrale du cluster RSA et aide à comparer plusieurs cas proches.",
    audience: "Personne seule",
    tags: ["rsa", "personne-seule", "montant"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Vérifier les revenus réels retenus.",
      "Comparer avec hébergement gratuit ou petit salaire.",
      "Utiliser ensuite le simulateur complet.",
    ],
    faq: [
      {
        question: "Combien touche une personne seule au RSA ?",
        answer: "Le montant dépend surtout des ressources, du logement et de la situation déclarée.",
      },
      {
        question: "Le RSA peut-il tomber à zéro ?",
        answer: "Oui, si les revenus retenus dépassent le montant de base.",
      },
    ],
  },
  {
    slug: "rsa-sans-logement",
    title: "RSA sans logement stable (2026)",
    description: "Estimation indicative du RSA pour une personne sans logement stable ou en situation très précaire.",
    summary: "Cette page couvre un cas sensible qui demande un cadre prudent et un renvoi clair vers les sources officielles.",
    audience: "Personne sans logement stable",
    tags: ["rsa", "sans-logement", "precarite"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 0,
      logement: "sans_abri",
      activite: "inactif",
    },
    checklist: [
      "Vérifier les démarches officielles adaptées à votre situation.",
      "Comparer avec un hébergement gratuit si cela correspond mieux.",
      "Consulter rapidement les références officielles.",
    ],
    faq: [
      {
        question: "Peut-on toucher le RSA sans logement stable ?",
        answer: "La situation doit être vérifiée avec attention. Cette page donne seulement un repère indicatif.",
      },
      {
        question: "Pourquoi faut-il vérifier avec la CAF ?",
        answer: "Parce que ce type de situation peut impliquer des règles spécifiques ou des ajustements de dossier.",
      },
    ],
  },
  {
    slug: "rsa-travail-a-temps-partiel",
    title: "RSA travail à temps partiel (2026)",
    description: "Estimation indicative du RSA pour une personne qui travaille à temps partiel.",
    summary: "Cette page couvre une recherche utile sur le complément RSA en cas de faibles revenus d'activité.",
    audience: "Personne à temps partiel",
    tags: ["rsa", "temps-partiel", "activite"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 650,
      logement: "loue",
      activite: "actif",
    },
    checklist: [
      "Comparer avec une absence d'activité.",
      "Vérifier les revenus moyens pris en compte.",
      "Tester aussi le cas couple si besoin.",
    ],
    faq: [
      {
        question: "Peut-on toucher le RSA en travaillant à temps partiel ?",
        answer: "Oui, dans certains cas, si les revenus retenus restent faibles.",
      },
      {
        question: "Le complément RSA est-il fixe ?",
        answer: "Non. Il dépend du revenu d'activité et de la composition du foyer.",
      },
    ],
  },
  {
    slug: "rsa-personne-seule-logement-social",
    title: "RSA personne seule en logement social (2026)",
    description: "Estimation indicative du RSA pour une personne seule en logement social avec faibles ressources.",
    summary: "Cette page teste un transfert du motif logement social vers le cluster RSA sans partir sur un angle trop large.",
    audience: "Personne seule en logement social",
    tags: ["rsa", "personne-seule", "logement-social"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus: 180,
      logement: "loue",
      activite: "inactif",
    },
    checklist: [
      "Verifier si une aide logement est deja percue en plus du RSA.",
      "Comparer avec le cas personne seule montant pour situer l'ordre de grandeur.",
      "Tester aussi l'APL si le loyer social reste significatif.",
    ],
    faq: [
      {
        question: "Le logement social change-t-il le RSA d'une personne seule ?",
        answer: "Le logement peut influencer l'estimation, surtout selon les aides logement deja percues et la situation declaree.",
      },
      {
        question: "Faut-il verifier aussi l'APL ?",
        answer: "Oui, car RSA et aide au logement peuvent se lire ensemble pour comprendre votre budget reel.",
      },
    ],
  },
];
