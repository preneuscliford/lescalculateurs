export const aplPilotScenarios = [
  {
    slug: "apl-etudiant-paris",
    intent: "apl etudiant paris",
    title: "APL etudiant a Paris : estimation 2026",
    description:
      "Scenario APL pour un etudiant a Paris avec un loyer eleve et peu de revenus.",
    summary:
      "Cette page cible une intention forte chez les etudiants qui cherchent un ordre de grandeur rapide avant une simulation complete.",
    audience: "Etudiant en location privee a Paris",
    tags: ["etudiant", "paris", "idf", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 650,
      loyer_mensuel: 850,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si le logement est conventionne ou non.",
      "Confirmer les revenus reellement pris en compte par la CAF.",
      "Comparer avec un scenario CROUS ou colocation si besoin.",
    ],
    faq: [
      {
        question: "Un etudiant a Paris peut-il toucher l APL ?",
        answer:
          "Oui, sous conditions de logement et de ressources. Le niveau de loyer reste important, mais le plafond de zone limite le montant retenu.",
      },
      {
        question: "Un job etudiant fait-il baisser l APL ?",
        answer:
          "Oui, les revenus peuvent reduire l aide. Il est utile de tester plusieurs niveaux de salaire mensuel si vous travaillez en parallele.",
      },
    ],
  },
  {
    slug: "apl-etudiant-lyon",
    intent: "apl etudiant lyon",
    title: "APL etudiant a Lyon : estimation 2026",
    description: "Exemple de simulation APL pour un etudiant locataire a Lyon.",
    summary:
      "Cette page vise les recherches etudiantes hors Paris avec une pression locative toujours forte mais plus moderee qu en Ile-de-France.",
    audience: "Etudiant locataire a Lyon",
    tags: ["etudiant", "lyon", "province", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 500,
      loyer_mensuel: 620,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si le loyer retenu est bien hors charges.",
      "Comparer avec une colocation si le budget est serre.",
      "Tester aussi une residence etudiante si ce type de logement est envisage.",
    ],
    faq: [
      {
        question: "L APL etudiante est-elle differente a Lyon et a Paris ?",
        answer:
          "La logique de calcul reste la meme, mais le plafond de loyer depend de la zone. Le montant retenu n est donc pas identique.",
      },
      {
        question: "Faut-il declarer les aides familiales pour l APL ?",
        answer:
          "Cela depend de la nature de l aide. La verification finale doit toujours etre faite avec les regles de la CAF.",
      },
    ],
  },
  {
    slug: "apl-etudiant-colocation",
    intent: "apl etudiant colocation",
    title: "APL etudiant en colocation : estimation 2026",
    description:
      "Cas pratique d APL pour un etudiant en colocation avec quote-part de loyer.",
    summary:
      "Cette page repond a une recherche frequente chez les etudiants qui mutualisent leur logement pour reduire le reste a charge.",
    audience: "Etudiant en colocation",
    tags: ["etudiant", "colocation", "province", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 550,
      loyer_mensuel: 430,
      region: "province",
      type_logement: "colocation",
      economie: 0,
    },
    checklist: [
      "Verifier si le bail est individuel ou collectif.",
      "Conserver une trace claire de votre quote-part de loyer.",
      "Comparer avec une location classique pour mesurer l ecart.",
    ],
    faq: [
      {
        question: "L APL en colocation est-elle calculee par personne ?",
        answer:
          "Oui, chaque situation est examinee individuellement. Le loyer retenu correspond en general a votre part reelle.",
      },
      {
        question: "Une colocation reduit-elle automatiquement l APL ?",
        answer:
          "Pas automatiquement. Tout depend de la part de loyer, des revenus et du type de bail declare.",
      },
    ],
  },
  {
    slug: "apl-celibataire-paris-petit-revenu",
    intent: "apl celibataire paris",
    title: "APL celibataire a Paris avec petit revenu : estimation 2026",
    description:
      "Estimation APL pour une personne seule a Paris avec un revenu modeste.",
    summary:
      "Cette page couvre une requete centrale du cluster APL urbain, avec un vrai enjeu de budget logement en zone tendue.",
    audience: "Celibataire a Paris avec petit revenu",
    tags: ["celibataire", "paris", "idf", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1200,
      loyer_mensuel: 780,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier que le loyer retenu est bien le loyer hors charges.",
      "Tester une variante avec revenus variables si vous avez des primes.",
      "Comparer avec un scenario province si vous envisagez de demenager.",
    ],
    faq: [
      {
        question: "Peut-on toucher l APL a Paris en etant seul ?",
        answer:
          "Oui, mais le calcul depend fortement du revenu et du plafond de loyer applicable a la zone francilienne.",
      },
      {
        question: "Le reste a charge reste-t-il eleve a Paris meme avec l APL ?",
        answer:
          "Souvent oui. L APL aide a absorber une partie du cout, mais le plafond de loyer limite l effet de l aide.",
      },
    ],
  },
  {
    slug: "apl-celibataire-smic",
    intent: "apl smic celibataire",
    title: "APL au SMIC pour un celibataire : estimation 2026",
    description: "Scenario APL d une personne seule au SMIC avec un loyer moyen.",
    summary:
      "Cette page sert une requete tres claire : savoir si un salaire proche du SMIC laisse encore un droit a l APL.",
    audience: "Celibataire au SMIC",
    tags: ["celibataire", "smic", "province", "actif"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1450,
      loyer_mensuel: 620,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier votre salaire net reel sur les mois retenus.",
      "Comparer un loyer a 550 EUR et a 700 EUR.",
      "Tester aussi un scenario avec prime d activite en parallele.",
    ],
    faq: [
      {
        question: "Peut-on encore toucher l APL avec un salaire au SMIC ?",
        answer:
          "Oui dans certains cas, surtout si le loyer reste significatif par rapport au revenu. Le montant peut toutefois baisser assez vite.",
      },
      {
        question: "Le type de contrat change-t-il le calcul APL ?",
        answer:
          "Pas directement. Ce sont d abord les ressources retenues et le logement qui pilotent l estimation.",
      },
    ],
  },
  {
    slug: "apl-celibataire-loyer-eleve",
    intent: "apl loyer eleve personne seule",
    title: "APL avec loyer eleve pour une personne seule : estimation 2026",
    description:
      "Cas APL d une personne seule avec un loyer superieur au plafond de zone.",
    summary:
      "Cette page repond a une frustration tres frequente : comprendre pourquoi un loyer eleve ne se traduit pas toujours par une aide plus forte.",
    audience: "Personne seule avec loyer eleve",
    tags: ["celibataire", "loyer-eleve", "province", "actif"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1300,
      loyer_mensuel: 920,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier le plafond de loyer applicable a votre zone.",
      "Tester une solution colocation si le reste a charge devient trop fort.",
      "Ne pas supposer que tout le loyer sera retenu dans le calcul.",
    ],
    faq: [
      {
        question: "Pourquoi mon loyer n est-il pas retenu en totalite ?",
        answer:
          "Le calcul APL applique un plafond de loyer. Au-dela, la partie excedentaire n augmente plus l aide.",
      },
      {
        question: "Un loyer plus cher donne-t-il toujours plus d APL ?",
        answer:
          "Non. Une fois le plafond atteint, le gain disparait alors que votre reste a charge continue d augmenter.",
      },
    ],
  },
  {
    slug: "apl-celibataire-marseille",
    intent: "apl marseille celibataire",
    title: "APL celibataire a Marseille : estimation 2026",
    description:
      "Simulation type pour une personne seule a Marseille avec loyer intermediaire.",
    summary:
      "Cette page couvre une grande ville de province avec une requete geolocalisee claire et une tension locative concrete.",
    audience: "Celibataire a Marseille",
    tags: ["celibataire", "marseille", "province", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1100,
      loyer_mensuel: 590,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Comparer avec Toulouse ou Lyon si vous cherchez un ordre de grandeur en grande ville.",
      "Verifier la part de charges exclue du loyer retenu.",
      "Tester une variante avec revenu a 1300 EUR si votre activite evolue.",
    ],
    faq: [
      {
        question: "L APL a Marseille suit-elle la meme logique qu ailleurs ?",
        answer:
          "Oui, avec un plafond adapte a la zone province. La ville change surtout le niveau de loyer observe dans la pratique.",
      },
      {
        question: "Faut-il un code postal pour simuler l APL ?",
        answer:
          "Le code postal aide a affiner la zone exacte dans les outils complets. Cette page donne seulement un scenario type.",
      },
    ],
  },
  {
    slug: "apl-celibataire-toulouse",
    intent: "apl toulouse celibataire",
    title: "APL celibataire a Toulouse : estimation 2026",
    description: "Exemple APL pour un actif ou un etudiant seul a Toulouse.",
    summary:
      "Cette page couvre une ville universitaire et active avec une vraie demande sur le logement locatif.",
    audience: "Personne seule a Toulouse",
    tags: ["celibataire", "toulouse", "province", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1050,
      loyer_mensuel: 560,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier la regularite des revenus si vous etes en mission ou en alternance.",
      "Comparer avec un scenario colocation dans un quartier etudiant.",
      "Tester un loyer a 650 EUR si vous visez un T2.",
    ],
    faq: [
      {
        question: "Une personne seule a Toulouse peut-elle toucher l APL ?",
        answer:
          "Oui, surtout avec un revenu modeste et un loyer encore compatible avec les plafonds de zone.",
      },
      {
        question: "Un T1 ou un T2 change-t-il beaucoup l APL ?",
        answer:
          "Indirectement, via le loyer. Le calcul ne depend pas directement de la surface mais du montant retenu.",
      },
    ],
  },
  {
    slug: "apl-loyer-500-revenu-900",
    intent: "apl loyer 500 revenu 900",
    title: "APL avec 900 EUR de revenus et 500 EUR de loyer : estimation 2026",
    description:
      "Scenario budgetaire pour un revenu modeste avec un loyer encore contenu.",
    summary:
      "Cette page garde un angle chiffres tout en repondant a une question concrete de budget logement.",
    audience: "Locataire seul avec budget serre",
    tags: ["celibataire", "petit-revenu", "budget", "province"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 900,
      loyer_mensuel: 500,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si le loyer de 500 EUR est bien indique hors charges.",
      "Comparer avec un revenu a 800 EUR ou 1000 EUR.",
      "Tester aussi une version colocation si besoin.",
    ],
    faq: [
      {
        question: "Avec 900 EUR de revenus peut-on encore toucher une bonne APL ?",
        answer:
          "Souvent oui si le loyer reste significatif. Le montant exact depend toutefois de la zone et du logement.",
      },
      {
        question: "Pourquoi utiliser une page scenario plutot qu un calcul unique ?",
        answer:
          "Parce qu elle donne un ordre de grandeur rapide, puis oriente vers le simulateur complet pour affiner la situation.",
      },
    ],
  },
  {
    slug: "apl-loyer-800-revenu-1300",
    intent: "apl loyer 800 revenu 1300",
    title: "APL avec 1300 EUR de revenus et 800 EUR de loyer : estimation 2026",
    description:
      "Scenario de tension budgetaire avec un loyer eleve par rapport au revenu.",
    summary:
      "Cette page repond a une vraie question de locataire : savoir si un loyer important laisse encore une aide utile.",
    audience: "Locataire seul avec loyer tendu",
    tags: ["celibataire", "loyer-eleve", "budget", "idf"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1300,
      loyer_mensuel: 800,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si le logement depasse le plafond de loyer applicable.",
      "Comparer avec un loyer a 700 EUR ou 900 EUR.",
      "Tester un scenario studio ou colocation.",
    ],
    faq: [
      {
        question: "Un loyer de 800 EUR avec 1300 EUR de revenus laisse-t-il un droit ?",
        answer:
          "Souvent oui en theorie, mais le plafond de loyer limite vite le gain. Le reste a charge reste un critere central.",
      },
      {
        question: "Pourquoi ce type de scenario est-il utile ?",
        answer:
          "Parce qu il repond a une vraie question budgetaire avant une signature de bail ou un changement de logement.",
      },
    ],
  },
  {
    slug: "apl-cdi-loyer-700",
    intent: "apl cdi loyer 700",
    title: "APL avec CDI et loyer de 700 EUR : estimation 2026",
    description:
      "Exemple APL pour un salarie en CDI avec un loyer autour de 700 EUR.",
    summary:
      "Cette page vise une requete tres concrete sur le rapport entre salaire stable et niveau de loyer.",
    audience: "Salarie en CDI",
    tags: ["cdi", "actif", "province", "loyer-700"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1600,
      loyer_mensuel: 700,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si vos primes ou heures supplementaires gonflent le revenu retenu.",
      "Comparer avec un loyer a 650 EUR ou 750 EUR.",
      "Tester aussi un scenario avec prime d activite.",
    ],
    faq: [
      {
        question: "Peut-on toucher l APL en CDI ?",
        answer:
          "Oui. Le type de contrat ne bloque pas l APL. Ce sont surtout le revenu et le loyer qui comptent.",
      },
      {
        question: "A partir de quel salaire le droit disparait-il ?",
        answer:
          "Il n existe pas de seuil unique. Tout depend de la zone, de la composition du foyer et du loyer retenu.",
      },
    ],
  },
  {
    slug: "apl-cdd-loyer-600",
    intent: "apl cdd loyer 600",
    title: "APL avec CDD et loyer de 600 EUR : estimation 2026",
    description:
      "Scenario APL d un salarie en CDD avec revenus modestes et loyer moyen.",
    summary:
      "Cette page couvre une recherche plausible dans les phases d emploi plus instable ou de transition.",
    audience: "Salarie en CDD",
    tags: ["cdd", "actif", "province", "loyer-600"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1350,
      loyer_mensuel: 600,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier la moyenne de revenus si vous avez des mois incomplets.",
      "Comparer avec un scenario chomage si votre contrat se termine.",
      "Tester un logement a 550 EUR puis a 650 EUR.",
    ],
    faq: [
      {
        question: "Le CDD donne-t-il plus d APL qu un CDI ?",
        answer:
          "Non. Ce n est pas le contrat qui pilote l aide, mais les ressources retenues et les caracteristiques du logement.",
      },
      {
        question: "Comment simuler si mes revenus changent souvent ?",
        answer:
          "Il faut tester plusieurs scenarios representatifs plutot que supposer un revenu fixe sur toute l annee.",
      },
    ],
  },
  {
    slug: "apl-chomage-loyer-moyen",
    intent: "apl chomage loyer moyen",
    title: "APL au chomage avec loyer moyen : estimation 2026",
    description:
      "Simulation APL d une personne seule en periode de chomage avec loyer standard.",
    summary:
      "Cette page traite une intention sensible liee a la baisse de revenus et a la gestion du reste a charge.",
    audience: "Personne au chomage",
    tags: ["chomage", "celibataire", "province", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 900,
      loyer_mensuel: 570,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier quelles indemnites sont retenues comme ressources.",
      "Comparer avec un scenario RSA si les revenus chutent davantage.",
      "Tester un scenario avec hebergement gratuit si la situation change.",
    ],
    faq: [
      {
        question: "Le chomage augmente-t-il l APL ?",
        answer:
          "Une baisse de revenus peut rendre l aide plus favorable. Il faut toutefois integrer correctement les indemnites retenues.",
      },
      {
        question: "L APL au chomage suffit-elle pour compenser le loyer ?",
        answer:
          "Rarement a elle seule. Elle peut reduire le reste a charge, mais ne remplace pas un budget logement complet.",
      },
    ],
  },
  {
    slug: "apl-reprise-emploi",
    intent: "apl reprise emploi",
    title: "APL apres une reprise d emploi : estimation 2026",
    description:
      "Exemple d impact d une reprise d activite sur l APL.",
    summary:
      "Cette page traite une situation evolutive utile pour les foyers qui sortent d une periode de chomage ou d inactivite.",
    audience: "Personne qui reprend un emploi",
    tags: ["reprise-emploi", "actif", "province", "celibataire"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1250,
      loyer_mensuel: 560,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Comparer l avant et l apres reprise d activite.",
      "Verifier si d autres aides prennent le relais.",
      "Tester plusieurs niveaux de salaire si la reprise est progressive.",
    ],
    faq: [
      {
        question: "La reprise d emploi fait-elle baisser l APL ?",
        answer:
          "Souvent oui a terme, car les revenus augmentent. L effet exact depend du loyer et de la zone.",
      },
      {
        question: "Faut-il prevenir la CAF rapidement apres reprise d emploi ?",
        answer:
          "Oui, pour garder un dossier coherent avec votre situation reelle et eviter un decalage entre droits et ressources.",
      },
    ],
  },
  {
    slug: "apl-jeune-actif-premier-logement",
    intent: "apl jeune actif premier logement",
    title: "APL jeune actif pour un premier logement : estimation 2026",
    description:
      "Cas pratique d APL pour un jeune actif qui prend son premier appartement.",
    summary:
      "Cette page cible une requete de debut de parcours locatif, utile pour capter les nouveaux entrants sur le marche.",
    audience: "Jeune actif premier logement",
    tags: ["jeune-actif", "premier-logement", "province", "actif"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1350,
      loyer_mensuel: 610,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier la date d entree dans le logement.",
      "Tester un scenario avec salaire d essai ou revenu variable.",
      "Comparer avec une colocation si le budget est trop tendu.",
    ],
    faq: [
      {
        question: "Un jeune actif peut-il toucher l APL des son premier logement ?",
        answer:
          "Oui si les conditions de logement et de ressources sont remplies. Le premier bail ne bloque pas l aide.",
      },
      {
        question: "Le salaire du premier emploi supprime-t-il vite l APL ?",
        answer:
          "Cela depend du niveau de loyer. Un revenu modeste peut encore laisser une aide partielle pendant un temps.",
      },
    ],
  },
  {
    slug: "apl-alternant",
    intent: "apl alternant",
    title: "APL alternant : estimation 2026",
    description:
      "Estimation APL pour un alternant avec revenu regulier mais modeste.",
    summary:
      "Cette page couvre une requete frequente chez les jeunes actifs en formation et en entree dans la vie professionnelle.",
    audience: "Alternant en location",
    tags: ["alternant", "jeune-actif", "province", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 980,
      loyer_mensuel: 540,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si vos revenus d alternance varient selon les mois.",
      "Comparer avec un scenario etudiant si votre statut reste proche.",
      "Tester aussi une residence partagee ou une colocation.",
    ],
    faq: [
      {
        question: "Un alternant peut-il cumuler salaire et APL ?",
        answer:
          "Oui, mais le salaire est pris en compte dans les ressources. Il faut donc mesurer son effet sur l aide.",
      },
      {
        question: "Alternant et etudiant ont-ils la meme APL ?",
        answer:
          "La logique est proche, mais la structure des revenus peut modifier le resultat.",
      },
    ],
  },
  {
    slug: "apl-apprenti",
    intent: "apl apprenti",
    title: "APL apprenti : estimation 2026",
    description:
      "Scenario APL pour un apprenti avec petit salaire et loyer modere.",
    summary:
      "Cette page cible une intention precise souvent recherchee avec une concurrence encore raisonnable.",
    audience: "Apprenti locataire",
    tags: ["apprenti", "jeune-actif", "province", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 820,
      loyer_mensuel: 480,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier le revenu net reel verse par l employeur.",
      "Comparer avec un scenario alternance si votre statut est hybride.",
      "Tester aussi un scenario en residence si vous etes heberge en foyer.",
    ],
    faq: [
      {
        question: "Un apprenti a-t-il droit a l APL ?",
        answer:
          "Oui, sous conditions de logement et de ressources. Les revenus modestes de l apprentissage peuvent laisser une aide.",
      },
      {
        question: "Le contrat d apprentissage change-t-il le calcul ?",
        answer:
          "Le statut ne suffit pas a lui seul. Ce sont surtout les revenus et le logement qui determinent l estimation.",
      },
    ],
  },
  {
    slug: "apl-colocation-jeune-actif",
    intent: "apl colocation jeune actif",
    title: "APL jeune actif en colocation : estimation 2026",
    description:
      "Cas APL pour un jeune actif en colocation avec revenu modeste.",
    summary:
      "Cette page sert un besoin tres concret sur les premiers logements urbains et la gestion du reste a charge.",
    audience: "Jeune actif en colocation",
    tags: ["colocation", "jeune-actif", "province", "actif"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1250,
      loyer_mensuel: 460,
      region: "province",
      type_logement: "colocation",
      economie: 0,
    },
    checklist: [
      "Verifier la quote-part de loyer mentionnee au bail.",
      "Tester une variante avec revenu a 1400 EUR.",
      "Comparer avec un studio si vous hesitez entre les deux.",
    ],
    faq: [
      {
        question: "La colocation reste-t-elle interessante avec l APL ?",
        answer:
          "Oui si elle reduit suffisamment le reste a charge. Il faut raisonner sur votre part de loyer et non sur le loyer total.",
      },
      {
        question: "Un jeune actif en colocation doit-il declarer le loyer total ?",
        answer:
          "Non, la logique porte sur votre quote-part reelle ou sur ce que le bail permet de justifier.",
      },
    ],
  },
  {
    slug: "apl-hlm-petit-revenu",
    intent: "apl hlm petit revenu",
    title: "APL en HLM avec petit revenu : estimation 2026",
    description: "Exemple APL pour un foyer modeste loge en HLM.",
    summary:
      "Cette page repond a une intention claire autour d un type de logement tres frequent dans les recherches APL.",
    audience: "Locataire HLM avec petit revenu",
    tags: ["hlm", "petit-revenu", "province", "foyer"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 980,
      loyer_mensuel: 430,
      region: "province",
      type_logement: "hlm",
      economie: 0,
    },
    checklist: [
      "Verifier le montant du loyer net retenu sur l avis de paiement.",
      "Tester une variante couple ou parent isole si la composition du foyer change.",
      "Comparer avec un logement prive au meme niveau de loyer.",
    ],
    faq: [
      {
        question: "L APL est-elle plus simple en HLM ?",
        answer:
          "Le type de logement peut clarifier certains parametres, mais le revenu et la composition du foyer restent decisifs.",
      },
      {
        question: "Un petit loyer signifie-t-il forcement une petite APL ?",
        answer:
          "Pas toujours, mais un loyer plus faible limite mecaniquement la base de calcul de l aide.",
      },
    ],
  },
  {
    slug: "apl-petite-surface-paris",
    intent: "apl studio paris",
    title: "APL pour un studio a Paris : estimation 2026",
    description:
      "Exemple APL pour une petite surface parisienne avec revenu limite.",
    summary:
      "Cette page vise les recherches sur les studios parisiens, tres frequentes chez les jeunes actifs et les etudiants.",
    audience: "Locataire d un studio a Paris",
    tags: ["studio", "paris", "idf", "petit-revenu"],
    input: {
      situation: "seul",
      enfants: 0,
      revenus_mensuels: 1000,
      loyer_mensuel: 760,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier que le loyer est bien renseigne hors charges.",
      "Comparer avec une chambre ou une colocation.",
      "Tester un revenu a 800 EUR puis a 1200 EUR.",
    ],
    faq: [
      {
        question: "Peut-on toucher l APL pour un studio a Paris ?",
        answer:
          "Oui, surtout avec des revenus modestes. Le calcul reste toutefois limite par le plafond de loyer de la zone.",
      },
      {
        question: "Studio et chambre donnent-ils la meme APL ?",
        answer:
          "Pas forcement. Le resultat depend du loyer declare et des caracteristiques du logement.",
      },
    ],
  },
  {
    slug: "apl-couple-paris",
    intent: "apl couple paris",
    title: "APL pour un couple a Paris : estimation 2026",
    description:
      "Cas pratique d un couple parisien avec loyer francilien et revenus intermediaires.",
    summary:
      "Cette page couvre une requete geolocalisee couple plus loyer tendu, frequente sur les budgets de debut de vie commune.",
    audience: "Couple a Paris",
    tags: ["couple", "paris", "idf", "foyer"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus_mensuels: 2200,
      loyer_mensuel: 980,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier le loyer hors charges indique dans le bail.",
      "Tester un scenario avec revenus a 2000 EUR puis a 2500 EUR.",
      "Comparer avec une proche banlieue si vous etudiez plusieurs options.",
    ],
    faq: [
      {
        question: "Un couple a Paris peut-il toucher une APL significative ?",
        answer:
          "Oui dans certains cas, mais le plafond de loyer retient seulement une partie du cout reel du logement.",
      },
      {
        question: "Les revenus combines annulent-ils souvent l APL ?",
        answer:
          "Ils peuvent la reduire rapidement. Il faut donc verifier le rapport entre revenus du foyer et loyer.",
      },
    ],
  },
  {
    slug: "apl-couple-lyon",
    intent: "apl couple lyon",
    title: "APL pour un couple a Lyon : estimation 2026",
    description:
      "Simulation type APL pour un couple a Lyon avec logement dans le parc prive.",
    summary:
      "Cette page couvre une grande ville de province avec une recherche geolocalisee utile pour les couples sans enfant.",
    audience: "Couple a Lyon",
    tags: ["couple", "lyon", "province", "foyer"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus_mensuels: 2050,
      loyer_mensuel: 790,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si les deux revenus sont stables sur la periode retenue.",
      "Comparer avec un scenario couple avec enfant si la situation doit evoluer vite.",
      "Tester aussi un loyer a 700 EUR puis a 850 EUR.",
    ],
    faq: [
      {
        question: "Le calcul APL d un couple a Lyon reste-t-il interessant ?",
        answer:
          "Oui dans certains cas, surtout si le loyer reste soutenu au regard des revenus du foyer.",
      },
      {
        question: "Une grande ville de province reste-t-elle en zone province ?",
        answer:
          "Oui dans ce type de scenario. La distinction principale oppose ici l Ile-de-France, la province et les DOM.",
      },
    ],
  },
  {
    slug: "apl-couple-sans-enfant",
    intent: "apl couple sans enfant",
    title: "APL pour un couple sans enfant : estimation 2026",
    description:
      "Scenario APL pour un couple locataire sans enfant avec revenus modestes.",
    summary:
      "Cette page repond a une intention large et rentable pour le cluster foyer, avec un cas simple a comparer.",
    audience: "Couple sans enfant",
    tags: ["couple", "province", "foyer", "petit-revenu"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus_mensuels: 1800,
      loyer_mensuel: 720,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Additionner les deux revenus reels du foyer.",
      "Tester le scenario avec et sans prime variable.",
      "Comparer avec un logement HLM si c est une option plausible.",
    ],
    faq: [
      {
        question: "Le revenu du conjoint est-il pris en compte pour l APL ?",
        answer:
          "Oui, le calcul tient compte des ressources du foyer. L aide peut donc baisser plus vite que pour une personne seule.",
      },
      {
        question: "Un couple sans enfant a-t-il un plafond different ?",
        answer:
          "Oui, le plafond de loyer et certains parametres de calcul evoluent avec la composition du foyer.",
      },
    ],
  },
  {
    slug: "apl-couple-un-enfant",
    intent: "apl couple 1 enfant",
    title: "APL couple avec 1 enfant : estimation 2026",
    description:
      "Scenario APL pour un couple avec un enfant et loyer familial moyen.",
    summary:
      "Cette page couvre une requete large et sert de pivot vers les autres cas famille plus precis.",
    audience: "Couple avec un enfant",
    tags: ["couple", "1-enfant", "province", "famille"],
    input: {
      situation: "couple",
      enfants: 1,
      revenus_mensuels: 2200,
      loyer_mensuel: 850,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier la composition exacte du foyer.",
      "Comparer avec un scenario deux enfants ou parent isole.",
      "Tester aussi un logement social si c est votre cas.",
    ],
    faq: [
      {
        question: "Le premier enfant change-t-il beaucoup l APL ?",
        answer:
          "Il peut rendre le calcul plus favorable, mais le revenu du foyer reste determinant.",
      },
      {
        question: "Faut-il recalculer l APL apres une naissance ?",
        answer:
          "Oui, car la composition du foyer influence directement plusieurs parametres du calcul.",
      },
    ],
  },
  {
    slug: "apl-couple-loyer-eleve",
    intent: "apl couple loyer eleve",
    title: "APL pour un couple avec loyer eleve : estimation 2026",
    description:
      "Scenario APL pour un couple avec un loyer eleve par rapport au revenu du foyer.",
    summary:
      "Cette page repond a une question recurrente de budget logement en zone tendue pour les couples sans enfant.",
    audience: "Couple avec loyer eleve",
    tags: ["couple", "loyer-eleve", "foyer", "idf"],
    input: {
      situation: "couple",
      enfants: 0,
      revenus_mensuels: 2300,
      loyer_mensuel: 1080,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier le plafond de loyer applicable dans la zone.",
      "Comparer avec un scenario hors Ile-de-France.",
      "Tester une baisse ou une hausse de revenus pour mesurer la sensibilite.",
    ],
    faq: [
      {
        question: "Un loyer tres eleve empeche-t-il l APL ?",
        answer:
          "Pas necessairement, mais une partie du loyer peut depasser le plafond retenu et ne plus augmenter l aide.",
      },
      {
        question: "Faut-il viser un logement moins cher pour garder l APL ?",
        answer:
          "Souvent, un loyer plus raisonnable permet surtout de reduire le reste a charge, meme si l aide baisse un peu.",
      },
    ],
  },
  {
    slug: "apl-parent-isole-un-enfant",
    intent: "apl parent isole 1 enfant",
    title: "APL parent isole avec 1 enfant : estimation 2026",
    description:
      "Cas pratique APL pour un parent isole avec un enfant en location.",
    summary:
      "Cette page vise une intention tres concrete avec un besoin fort de reponse rapide sur le niveau d aide.",
    audience: "Parent isole avec un enfant",
    tags: ["parent-isole", "1-enfant", "province", "famille"],
    input: {
      situation: "monoparental",
      enfants: 1,
      revenus_mensuels: 1350,
      loyer_mensuel: 760,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier le nombre d enfants a charge retenu.",
      "Comparer avec le RSA ou la prime d activite si besoin.",
      "Tester un scenario HLM si le logement est social.",
    ],
    faq: [
      {
        question: "Un parent isole touche-t-il plus d APL ?",
        answer:
          "Le calcul peut etre plus favorable qu avec un adulte seul, mais il depend toujours du revenu et du loyer retenu.",
      },
      {
        question: "Les pensions alimentaires changent-elles l APL ?",
        answer:
          "Oui, elles peuvent modifier les ressources prises en compte. Il faut donc les integrer a la verification finale.",
      },
    ],
  },
  {
    slug: "apl-parent-isole-deux-enfants",
    intent: "apl parent isole 2 enfants",
    title: "APL parent isole avec 2 enfants : estimation 2026",
    description:
      "Scenario APL pour un parent solo avec deux enfants et loyer familial.",
    summary:
      "Cette page couvre une recherche a forte utilite pratique pour les foyers monoparentaux avec charges elevees.",
    audience: "Parent isole avec deux enfants",
    tags: ["parent-isole", "2-enfants", "province", "famille"],
    input: {
      situation: "monoparental",
      enfants: 2,
      revenus_mensuels: 1500,
      loyer_mensuel: 840,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si les enfants sont tous consideres a charge.",
      "Tester un scenario avec garde alternee si la situation est complexe.",
      "Comparer avec un logement social si vous etes deja en HLM.",
    ],
    faq: [
      {
        question: "L APL monte-t-elle nettement avec deux enfants ?",
        answer:
          "Le calcul est souvent plus favorable, mais il depend toujours du revenu et du loyer retenu par la zone.",
      },
      {
        question: "Le parent isole doit-il declarer toutes les aides familiales ?",
        answer:
          "Oui, les ressources prises en compte doivent etre verifiees de maniere complete avant de deposer un dossier.",
      },
    ],
  },
  {
    slug: "apl-parent-isole-paris",
    intent: "apl parent isole paris",
    title: "APL parent isole a Paris : estimation 2026",
    description:
      "Estimation APL pour un parent solo a Paris avec un enfant et loyer francilien.",
    summary:
      "Cette page combine intention familiale et geolocalisation forte, avec un vrai enjeu de reste a charge en Ile-de-France.",
    audience: "Parent isole a Paris",
    tags: ["parent-isole", "paris", "idf", "1-enfant"],
    input: {
      situation: "monoparental",
      enfants: 1,
      revenus_mensuels: 1400,
      loyer_mensuel: 960,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier le loyer retenu hors charges.",
      "Comparer avec une proche banlieue si vous cherchez un ordre de grandeur.",
      "Tester aussi un scenario avec deux enfants si la situation evolue vite.",
    ],
    faq: [
      {
        question: "Un parent solo a Paris peut-il encore toucher une APL utile ?",
        answer:
          "Oui, surtout avec des revenus modestes, mais le cout du logement reste souvent bien superieur au plafond retenu.",
      },
      {
        question: "Pourquoi le reste a charge reste-t-il eleve a Paris ?",
        answer:
          "Parce que l APL ne suit pas integralement le loyer reel au-dela du plafond applicable a la zone.",
      },
    ],
  },
  {
    slug: "apl-famille-deux-enfants-province",
    intent: "apl famille 2 enfants",
    title: "APL famille avec 2 enfants en province : estimation 2026",
    description:
      "Cas APL pour un couple avec deux enfants dans une grande ville de province.",
    summary:
      "Cette page donne un scenario familial tres lisible pour comprendre l impact du foyer sur le calcul.",
    audience: "Couple avec deux enfants en province",
    tags: ["famille", "2-enfants", "province", "couple"],
    input: {
      situation: "couple",
      enfants: 2,
      revenus_mensuels: 2400,
      loyer_mensuel: 920,
      region: "province",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier le nombre exact d enfants retenus au foyer.",
      "Comparer avec un logement social si vous y etes eligibles.",
      "Tester une variation de revenu si un parent reprend une activite.",
    ],
    faq: [
      {
        question: "Une famille avec deux enfants peut-elle encore toucher l APL ?",
        answer:
          "Oui, surtout si le logement reste couteux au regard des revenus du foyer. La composition familiale joue souvent en faveur du calcul.",
      },
      {
        question: "Le couple doit-il declarer toutes les ressources du foyer ?",
        answer:
          "Oui, y compris les revenus des deux adultes et les autres ressources retenues par la CAF.",
      },
    ],
  },
  {
    slug: "apl-famille-idf",
    intent: "apl famille ile de france",
    title: "APL famille en Ile-de-France : estimation 2026",
    description:
      "Simulation type APL pour une famille en Ile-de-France avec loyer eleve.",
    summary:
      "Cette page repond a une recherche a forte tension budgetaire dans une zone ou le reste a charge reste souvent lourd.",
    audience: "Famille en Ile-de-France",
    tags: ["famille", "idf", "couple", "1-enfant"],
    input: {
      situation: "couple",
      enfants: 1,
      revenus_mensuels: 2500,
      loyer_mensuel: 1100,
      region: "idf",
      type_logement: "location",
      economie: 0,
    },
    checklist: [
      "Verifier si le logement depasse les plafonds de zone.",
      "Comparer avec un scenario province si une mobilite est envisagee.",
      "Tester aussi une variante avec deux enfants.",
    ],
    faq: [
      {
        question: "Une famille francilienne peut-elle vraiment compter sur l APL ?",
        answer:
          "L APL peut aider, mais elle ne suit pas generalement la hausse reelle des loyers en zone tendue.",
      },
      {
        question: "Pourquoi le montant semble parfois faible en Ile-de-France ?",
        answer:
          "Parce que le calcul applique un plafond de loyer et tient compte de l ensemble des ressources du foyer.",
      },
    ],
  },
];
