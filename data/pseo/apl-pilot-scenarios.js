export const aplPilotScenarios = [
  {
    "slug": "apl-etudiant-paris",
    "intent": "apl etudiant paris",
    "title": "APL Ã©tudiant Ã  Paris : estimation 2026",
    "description": "ScÃ©nario APL pour un Ã©tudiant Ã  Paris avec un loyer Ã©levÃ© et peu de revenus.",
    "summary": "Cette page cible une intention forte chez les Ã©tudiants qui cherchent un ordre de grandeur rapide avant une simulation complÃ¨te.",
    "audience": "Ã©tudiant en location privÃ©e Ã  Paris",
    "tags": [
      "etudiant",
      "paris",
      "idf",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 650,
      "loyer_mensuel": 850,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le logement est conventionnÃ© ou non.",
      "Confirmer les revenus rÃ©ellement pris en compte par la CAF.",
      "Comparer avec un scÃ©nario CROUS ou colocation si besoin."
    ],
    "faq": [
      {
        "question": "Un Ã©tudiant Ã  Paris peut-il toucher l'APL ?",
        "answer": "Oui, sous conditions de logement et de ressources. Le niveau de loyer reste important, mais le plafond de zone limite le montant retenu."
      },
      {
        "question": "Un job Ã©tudiant fait-il baisser l'APL ?",
        "answer": "Oui, les revenus peuvent rÃ©duire l'aide. Il est utile de tester plusieurs niveaux de salaire mensuel si vous travaillez en parallÃŽle."
      }
    ]
  },
  {
    "slug": "apl-etudiant-lyon",
    "intent": "apl etudiant lyon",
    "title": "APL Ã©tudiant Ã  Lyon : estimation 2026",
    "description": "Exemple de simulation APL pour un Ã©tudiant locataire Ã  Lyon.",
    "summary": "Cette page vise les recherches Ã©tudiantes hors Paris avec une pression locative toujours forte mais plus modÃ©rÃ©e qu'en ÃŽle-de-France.",
    "audience": "Ã©tudiant locataire Ã  Lyon",
    "tags": [
      "etudiant",
      "lyon",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 500,
      "loyer_mensuel": 620,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le loyer retenu est bien hors charges.",
      "Comparer avec une colocation si le budget est serrÃ©.",
      "Tester aussi une rÃ©sidence etudiante si ce type de logement est envisage."
    ],
    "faq": [
      {
        "question": "L'APL etudiante est-elle diffÃ©rente Ã  Lyon et Ã  Paris ?",
        "answer": "La logique de calcul reste la mÃªme, mais le plafond de loyer dÃ©pend de la zone. Le montant retenu n'est donc pas identique."
      },
      {
        "question": "Faut-il dÃ©clarer les aides familiales pour l'APL ?",
        "answer": "Cela dÃ©pend de la nature de l'aide. La vÃ©rification finale doit toujours Ãªtre faite avec les rÃ¨gles de la CAF."
      }
    ]
  },
  {
    "slug": "apl-etudiant-colocation",
    "intent": "apl etudiant colocation",
    "title": "APL Ã©tudiant en colocation : estimation 2026",
    "description": "Cas pratique d'APL pour un Ã©tudiant en colocation avec quote-part de loyer.",
    "summary": "Cette page rÃ©pond a une recherche frÃ©quente chez les Ã©tudiants qui mutualisent leur logement pour rÃ©duire le reste Ã  charge.",
    "audience": "Ã©tudiant en colocation",
    "tags": [
      "etudiant",
      "colocation",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 550,
      "loyer_mensuel": 430,
      "region": "province",
      "type_logement": "colocation",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le bail est individuel ou collectif.",
      "Conserver une trace claire de votre quote-part de loyer.",
      "Comparer avec une location classique pour mesurer l ecart."
    ],
    "faq": [
      {
        "question": "L'APL en colocation est-elle calculÃ©e par personne ?",
        "answer": "Oui, chaque situation est examinÃ©e individuellement. Le loyer retenu correspond en gÃ©nÃ©ral a votre part rÃ©elle."
      },
      {
        "question": "Une colocation reduit-elle automatiquement l'APL ?",
        "answer": "Pas automatiquement. Tout dÃ©pend de la part de loyer, des revenus et du type de bail dÃ©clarÃ©."
      }
    ]
  },
  {
    "slug": "apl-celibataire-paris-petit-revenu",
    "intent": "apl celibataire paris",
    "title": "APL cÃ©libataire Ã  Paris avec petit revenu : estimation 2026",
    "description": "Estimation APL pour une personne seule Ã  Paris avec un revenu modeste.",
    "summary": "Cette page couvre une requÃªte centrale du cluster APL urbain, avec un vrai enjeu de budget logement en zone tendue.",
    "audience": "CÃ©libataire Ã  Paris avec petit revenu",
    "tags": [
      "celibataire",
      "paris",
      "idf",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1200,
      "loyer_mensuel": 780,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier que le loyer retenu est bien le loyer hors charges.",
      "Tester une variante avec revenus variables si vous avez des primes.",
      "Comparer avec un scÃ©nario province si vous envisagez de dÃ©mÃ©nager."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL Ã  Paris en Ã©tant seul ?",
        "answer": "Oui, mais le calcul dÃ©pend fortement du revenu et du plafond de loyer applicable Ã  la zone francilienne."
      },
      {
        "question": "Le reste Ã  charge reste-t-il Ã©levÃ© Ã  Paris mÃªme avec l'APL ?",
        "answer": "Souvent oui. L'APL aide a absorber une partie du coÃ»t, mais le plafond de loyer limite l'effet de l'aide."
      }
    ]
  },
  {
    "slug": "apl-celibataire-smic",
    "intent": "apl smic celibataire",
    "title": "APL au SMIC pour un cÃ©libataire : estimation 2026",
    "description": "ScÃ©nario APL d'une personne seule au SMIC avec un loyer moyen.",
    "summary": "Cette page sert une requÃªte trÃ¨s claire : savoir si un salaire proche du SMIC laisse encore un droit Ã  l'APL.",
    "audience": "CÃ©libataire au SMIC",
    "tags": [
      "celibataire",
      "smic",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1450,
      "loyer_mensuel": 620,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier votre salaire net rÃ©el sur les mois retenus.",
      "Comparer un loyer ? 550 EUR et ? 700 EUR.",
      "Tester aussi un scÃ©nario avec prime d'activitÃ© en parallÃŽle."
    ],
    "faq": [
      {
        "question": "Peut-on encore toucher l'APL avec un salaire au SMIC ?",
        "answer": "Oui dans certains cas, surtout si le loyer reste significatif par rapport au revenu. Le montant peut toutefois baisser assez vite."
      },
      {
        "question": "Le type de contrat change-t-il le calcul de l'APL ?",
        "answer": "Pas directement. Ce sont d'abord les ressources retenues et le logement qui pilotent l'estimation."
      }
    ],
    "pilotProduct": {
      "variants": [
        {
          "label": "Tester avec un loyer de 500 EUR",
          "description": "Comparer avec un loyer plus bas pour voir si le reste Ã  charge change nettement.",
          "href": "/pages/apl/apl-loyer-500-revenu-900"
        },
        {
          "label": "Tester avec un loyer de 700 EUR",
          "description": "Voir l'impact d'un loyer un peu plus Ã©levÃ© a revenu proche.",
          "href": "/pages/apl/apl-cdi-loyer-700"
        },
        {
          "label": "Comparer avec une personne seule au chÃ´mage",
          "description": "Mesurer l'effet d'une baisse de revenus sur l'estimation APL.",
          "href": "/pages/apl/apl-chomage-loyer-moyen"
        }
      ],
      "drivers": [
        {
          "title": "Le loyer retenu dans la limite du plafond",
          "description": "Un loyer plus Ã©levÃ© n'augmente pas toujours l'aide de la mÃªme facon, car la CAF retient un plafond selon la zone."
        },
        {
          "title": "Le niveau rÃ©el de revenus retenus",
          "description": "Deux personnes proches du SMIC peuvent obtenir des rÃ©sultats diffÃ©rents selon les revenus effectivement retenus sur la pÃ©riode de rÃ©fÃ©rence."
        },
        {
          "title": "Les aides et revenus qui se cumulent",
          "description": "Une prime d'activitÃ©, des primes variables ou une reprise d'emploi peuvent modifier l'estimation finale."
        },
        {
          "title": "La zone gÃ©ographique du logement",
          "description": "Ã€ loyer comparable, une grande ville ou une zone plus tendue peut changer le loyer retenu et donc le montant estimÃ©."
        }
      ],
      "comparisonLinks": [
        {
          "label": "APL avec petit loyer et revenu modeste",
          "href": "/pages/apl/apl-loyer-500-revenu-900"
        },
        {
          "label": "APL en cas de chÃ´mage avec loyer moyen",
          "href": "/pages/apl/apl-chomage-loyer-moyen"
        },
        {
          "label": "APL cÃ©libataire Ã  Paris avec petit revenu",
          "href": "/pages/apl/apl-celibataire-paris-petit-revenu"
        },
        {
          "label": "Ouvrir le simulateur APL complet",
          "href": "/pages/apl"
        }
      ],
      "journey": [
        "Comparez d'abord votre loyer rÃ©el avec le scÃ©nario affichÃ©.",
        "VÃ©rifiez ensuite si vos revenus varient d'un mois ? l'autre ou si vous percevez d'autres aides.",
        "Lancez enfin une simulation complÃ¨te pour approcher votre situation exacte."
      ]
    }
  },
  {
    "slug": "apl-celibataire-loyer-eleve",
    "intent": "apl loyer eleve personne seule",
    "title": "APL avec loyer eleve pour une personne seule : estimation 2026",
    "description": "Cas APL d'une personne seule avec un loyer supÃ©rieur au plafond de zone.",
    "summary": "Cette page rÃ©pond a une frustration trÃ¨s frÃ©quente : comprendre pourquoi un loyer Ã©levÃ© ne se traduit pas toujours par une aide plus forte.",
    "audience": "Personne seule avec loyer Ã©levÃ©",
    "tags": [
      "celibataire",
      "loyer-eleve",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1300,
      "loyer_mensuel": 920,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le plafond de loyer applicable ? votre zone.",
      "Tester une solution colocation si le reste ? charge devient trop fort.",
      "Ne pas supposer que tout le loyer sera retenu dans le calcul."
    ],
    "faq": [
      {
        "question": "Pourquoi mon loyer n'est-il pas retenu en totalitÃ© ?",
        "answer": "Le calcul de l'APL applique un plafond de loyer. Au-delÃ , la partie excedentaire n'augmente plus l'aide."
      },
      {
        "question": "Un loyer plus cher donne-t-il toujours plus d'APL ?",
        "answer": "Non. Une fois le plafond atteint, le gain disparaÃ®t alors que votre reste Ã  charge continue d'augmenter."
      }
    ]
  },
  {
    "slug": "apl-celibataire-marseille",
    "intent": "apl marseille celibataire",
    "title": "APL cÃ©libataire Ã  Marseille : estimation 2026",
    "description": "Simulation type pour une personne seule Ã  Marseille avec loyer intermÃ©diaire.",
    "summary": "Cette page couvre une grande ville de province avec une requÃªte gÃ©olocalisÃ©e claire et une tension locative concrÃ¨te.",
    "audience": "CÃ©libataire Ã  Marseille",
    "tags": [
      "celibataire",
      "marseille",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1100,
      "loyer_mensuel": 590,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec Toulouse ou Lyon si vous cherchez un ordre de grandeur en grande ville.",
      "VÃ©rifier la part de charges exclue du loyer retenu.",
      "Tester une variante avec revenu ? 1300 EUR si votre activitÃ© Ã©volue."
    ],
    "faq": [
      {
        "question": "L'APL Ã  Marseille suit-elle la mÃªme logique qu ailleurs ?",
        "answer": "Oui, avec un plafond adaptÃ© Ã  la zone province. La ville change surtout le niveau de loyer observe dans la pratique."
      },
      {
        "question": "Faut-il un code postal pour simuler l'APL ?",
        "answer": "Le code postal'aide a affiner la zone exacte dans les outils complets. Cette page donne seulement un scÃ©nario type."
      }
    ]
  },
  {
    "slug": "apl-celibataire-toulouse",
    "intent": "apl toulouse celibataire",
    "title": "APL cÃ©libataire Ã  Toulouse : estimation 2026",
    "description": "Exemple APL pour un actif ou un Ã©tudiant seul Ã  Toulouse.",
    "summary": "Cette page couvre une ville universitaire et active avec une vraie demande sur le logement locatif.",
    "audience": "Personne seule Ã  Toulouse",
    "tags": [
      "celibataire",
      "toulouse",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1050,
      "loyer_mensuel": 560,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier la rÃ©gularitÃ© des revenus si vous Ãªtes en mission ou en alternance.",
      "Comparer avec un scÃ©nario colocation dans un quartier Ã©tudiant.",
      "Tester un loyer ? 650 EUR si vous visez un T2."
    ],
    "faq": [
      {
        "question": "Une personne seule Ã  Toulouse peut-elle toucher l'APL ?",
        "answer": "Oui, surtout avec un revenu modeste et un loyer encore compatible avec les plafonds de zone."
      },
      {
        "question": "Un T1 ou un T2 change-t-il beaucoup l'APL ?",
        "answer": "Indirectement, via le loyer. Le calcul ne dÃ©pend pas directement de la surface mais du montant retenu."
      }
    ]
  },
  {
    "slug": "apl-loyer-500-revenu-900",
    "intent": "apl loyer 500 revenu 900",
    "title": "APL avec 900 EUR de revenus et 500 EUR de loyer : estimation 2026",
    "description": "ScÃ©nario budgetaire pour un revenu modeste avec un loyer encore contenu.",
    "summary": "Cette page garde un angle chiffres tout en rÃ©pondant a une question concrÃ¨te de budget logement.",
    "audience": "Locataire seul avec budget serrÃ©",
    "tags": [
      "celibataire",
      "petit-revenu",
      "budget",
      "province"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 900,
      "loyer_mensuel": 500,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le loyer de 500 EUR est bien indiquÃ© hors charges.",
      "Comparer avec un revenu ? 800 EUR ou 1000 EUR.",
      "Tester aussi une version colocation si besoin."
    ],
    "faq": [
      {
        "question": "Avec 900 EUR de revenus peut-on encore toucher une bonne APL ?",
        "answer": "Souvent oui si le loyer reste significatif. Le montant exact dÃ©pend toutefois de la zone et du logement."
      },
      {
        "question": "Pourquoi partir de cette estimation avant le calcul complet ?",
        "answer": "Parce qu'elle donne un ordre de grandeur rapide, puis oriente vers le simulateur complet pour affiner la situation."
      }
    ]
  },
  {
    "slug": "apl-loyer-800-revenu-1300",
    "intent": "apl loyer 800 revenu 1300",
    "title": "APL avec 1300 EUR de revenus et 800 EUR de loyer : estimation 2026",
    "description": "ScÃ©nario de tension budgetaire avec un loyer Ã©levÃ© par rapport au revenu.",
    "summary": "Cette page rÃ©pond a une vraie question de locataire : savoir si un loyer important laisse encore une aide utile.",
    "audience": "Locataire seul avec loyer tendu",
    "tags": [
      "celibataire",
      "loyer-eleve",
      "budget",
      "idf"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1300,
      "loyer_mensuel": 800,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le logement dÃ©passe le plafond de loyer applicable.",
      "Comparer avec un loyer ? 700 EUR ou 900 EUR.",
      "Tester un scÃ©nario studio ou colocation."
    ],
    "faq": [
      {
        "question": "Un loyer de 800 EUR avec 1300 EUR de revenus laisse-t-il un droit ?",
        "answer": "Souvent oui en thÃ©orie, mais le plafond de loyer limite vite le gain. Le reste Ã  charge reste un critere central."
      },
      {
        "question": "Pourquoi ce type de scÃ©nario est-il utile ?",
        "answer": "Parce qu'il rÃ©pond a une vraie question budgetaire avant une signature de bail ou un changement de logement."
      }
    ]
  },
  {
    "slug": "apl-cdi-loyer-700",
    "intent": "apl cdi loyer 700",
    "title": "APL avec CDI et loyer de 700 EUR : estimation 2026",
    "description": "Exemple APL pour un salariÃ© en CDI avec un loyer autour de 700 EUR.",
    "summary": "Cette page vise une requÃªte trÃ¨s concrÃ¨te sur le rapport entre salaire stable et niveau de loyer.",
    "audience": "SalariÃ© en CDI",
    "tags": [
      "cdi",
      "actif",
      "province",
      "loyer-700"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1600,
      "loyer_mensuel": 700,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si vos primes ou heures supplÃ©mentaires gonflent le revenu retenu.",
      "Comparer avec un loyer ? 650 EUR ou 750 EUR.",
      "Tester aussi un scÃ©nario avec prime d'activitÃ©."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL en CDI ?",
        "answer": "Oui. Le type de contrat ne bloque pas l'APL. Ce sont surtout le revenu et le loyer qui comptent."
      },
      {
        "question": "Ã€ partir de quel salaire le droit disparaÃ®t-il ?",
        "answer": "Il n'existe pas de seuil unique. Tout dÃ©pend de la zone, de la composition du foyer et du loyer retenu."
      }
    ]
  },
  {
    "slug": "apl-cdd-loyer-600",
    "intent": "apl cdd loyer 600",
    "title": "APL avec CDD et loyer de 600 EUR : estimation 2026",
    "description": "ScÃ©nario APL d'un salariÃ© en CDD avec revenus modestes et loyer moyen.",
    "summary": "Cette page couvre une recherche plausible dans les phases d'emploi plus instable ou de transition.",
    "audience": "SalariÃ© en CDD",
    "tags": [
      "cdd",
      "actif",
      "province",
      "loyer-600"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1350,
      "loyer_mensuel": 600,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier la moyenne de revenus si vous avez des mois incomplets.",
      "Comparer avec un scÃ©nario chÃ´mage si votre contrat se termine.",
      "Tester un logement ? 550 EUR puis ? 650 EUR."
    ],
    "faq": [
      {
        "question": "Le CDD donne-t-il plus d'APL qu'un CDI ?",
        "answer": "Non. Ce n'est pas le contrat qui pilote l'aide, mais les ressources retenues et les caractÃ©ristiques du logement."
      },
      {
        "question": "Comment simuler si mes revenus changent souvent ?",
        "answer": "Il faut tester plusieurs scÃ©narios reprÃ©sentatifs plutÃ´t que supposer un revenu fixe sur toute l'annÃ©e."
      }
    ]
  },
  {
    "slug": "apl-chomage-loyer-moyen",
    "intent": "apl chomage loyer moyen",
    "title": "APL au ch?mage : estimation indicative avec loyer moyen en 2026",
    "description": "Estimation indicative APL 2026 pour une personne seule au ch?mage avec loyer moyen : ~312 EUR par mois dans ce sc?nario type.",
    "summary": "Cette page traite une intention sensible li?e ? la baisse de revenus et ? la gestion du reste ? charge.",
    "audience": "Personne au ch?mage",
    "tags": [
      "chomage",
      "celibataire",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 900,
      "loyer_mensuel": 570,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "V?rifier quelles indemnit?s sont retenues comme ressources.",
      "Comparer avec un sc?nario RSA si les revenus chutent davantage.",
      "Tester un sc?nario avec h?bergement gratuit si la situation change."
    ],
    "faq": [
      {
        "question": "Qui peut toucher l'APL au ch?mage ?",
        "answer": "Une personne seule ou un foyer au ch?mage peut parfois conserver ou ouvrir un droit si le logement est ?ligible et si les ressources retenues par la CAF restent modestes. Estimation indicative ? v?rifier sur caf.fr."
      },
      {
        "question": "Quel montant d'APL pour une personne au ch?mage avec loyer moyen en 2026 ?",
        "answer": "Dans ce sc?nario type, l'estimation indicative tourne autour de 312 EUR par mois. Le montant final d?pend du loyer retenu, de la zone, des indemnit?s ch?mage et des autres ressources du foyer."
      },
      {
        "question": "Les indemnit?s ch?mage sont-elles prises en compte pour l'APL ?",
        "answer": "Oui, les indemnit?s ch?mage peuvent ?tre retenues dans le calcul. C'est pourquoi deux situations de ch?mage proches peuvent donner des r?sultats diff?rents selon les montants r?ellement pris en compte."
      },
      {
        "question": "L'APL au ch?mage suffit-elle pour payer le loyer ?",
        "answer": "Rarement ? elle seule. L'APL peut r?duire le reste ? charge, mais elle ne remplace pas un budget logement complet. Il faut v?rifier le montant final sur caf.fr."
      },
      {
        "question": "O? v?rifier son APL au ch?mage apr?s cette estimation ?",
        "answer": "Le bon r?flexe est d'ouvrir le simulateur APL complet avec vos param?tres r?els, puis de v?rifier le r?sultat final sur caf.fr avec votre dossier exact."
      }
    ],
    "briefEnhancements": {
      "metaTitle": "Estimation APL 2026 : ch?mage et loyer moyen (~312 EUR)",
      "metaDescription": "Estimation indicative APL 2026 pour une personne au ch?mage avec loyer moyen : ~312 EUR par mois. Utilisez notre simulateur complet et v?rifiez sur caf.fr.",
      "directAnswer": "Estimation indicative : ~312 EUR par mois pour une personne seule au ch?mage avec loyer moyen en 2026.",
      "directAnswerDetails": "Le montant final d?pend du loyer retenu, de la zone, des indemnit?s ch?mage r?ellement prises en compte et de votre situation administrative. V?rifiez toujours le r?sultat sur caf.fr.",
      "methodSteps": [
        {
          "title": "Sources utilis?es",
          "description": "Cette estimation repose sur le moteur APL du site et doit ?tre rapproch?e des informations publi?es par la CAF et Service-Public."
        },
        {
          "title": "Hypoth?se standard du sc?nario",
          "description": "Le cas type retient ici une personne seule, 900 EUR de revenus mensuels, 570 EUR de loyer et une zone province."
        },
        {
          "title": "Marge de variation",
          "description": "Le montant r?el peut ?voluer selon les indemnit?s ch?mage retenues, le loyer plafonn?, la zone exacte et les autres ressources d?clar?es."
        }
      ]
    }
  },
  {
    "slug": "apl-reprise-emploi",
    "intent": "apl reprise emploi",
    "title": "APL apres une reprise d'emploi : estimation 2026",
    "description": "Exemple d'impact d'une reprise d'activitÃ© sur l'APL.",
    "summary": "Cette page traite une situation Ã©volutive utile pour les foyers qui sortent d'une pÃ©riode de chÃ´mage ou d inactivitÃ©.",
    "audience": "Personne qui reprend'un emploi",
    "tags": [
      "reprise-emploi",
      "actif",
      "province",
      "celibataire"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1250,
      "loyer_mensuel": 560,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer l avant et l aprÃ¨s reprise d'activitÃ©.",
      "VÃ©rifier si d'autres aides prennent le relais.",
      "Tester plusieurs niveaux de salaire si la reprise est progressive."
    ],
    "faq": [
      {
        "question": "La reprise d'emploi fait-elle baisser l'APL ?",
        "answer": "Souvent oui Ã  terme, car les revenus augmentent. L'effet exact dÃ©pend du loyer et de la zone."
      },
      {
        "question": "Faut-il prevenir la CAF rapidement aprÃ¨s reprise d'emploi ?",
        "answer": "Oui, pour garder un dossier cohÃ©rent avec votre situation rÃ©elle et Ã©viter un dÃ©calage entre droits et ressources."
      }
    ]
  },
  {
    "slug": "apl-jeune-actif-premier-logement",
    "intent": "apl jeune actif premier logement",
    "title": "APL jeune actif pour un premier logement : estimation 2026",
    "description": "Cas pratique d'APL pour un jeune actif qui prend son premier appartement.",
    "summary": "Cette page cible une requÃªte de dÃ©but de parcours locatif, utile pour capter les nouveaux entrants sur le marchÃ©.",
    "audience": "Jeune actif premier logement",
    "tags": [
      "jeune-actif",
      "premier-logement",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1350,
      "loyer_mensuel": 610,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier la date d entrÃ©e dans le logement.",
      "Tester un scÃ©nario avec salaire d essai ou revenu variable.",
      "Comparer avec une colocation si le budget est trop tendu."
    ],
    "faq": [
      {
        "question": "Un jeune actif peut-il toucher l'APL dÃ¨s son premier logement ?",
        "answer": "Oui si les conditions de logement et de ressources sont remplies. Le premier bail ne bloque pas l'aide."
      },
      {
        "question": "Le salaire du premier emploi supprime-t-il vite l'APL ?",
        "answer": "Cela dÃ©pend du niveau de loyer. Un revenu modeste peut encore laisser une aide partielle pendant un temps."
      }
    ]
  },
  {
    "slug": "apl-alternant",
    "intent": "apl alternant",
    "title": "APL alternant : estimation 2026",
    "description": "Estimation APL pour un alternant avec revenu regulier mais modeste.",
    "summary": "Cette page couvre une requÃªte frÃ©quente chez les jeunes actifs en formation et en entrÃ©e dans la vie professionnelle.",
    "audience": "Alternant en location",
    "tags": [
      "alternant",
      "jeune-actif",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 980,
      "loyer_mensuel": 540,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si vos revenus d alternance varient selon les mois.",
      "Comparer avec un scÃ©nario Ã©tudiant si votre statut reste proche.",
      "Tester aussi une rÃ©sidence partagee ou une colocation."
    ],
    "faq": [
      {
        "question": "Un alternant peut-il cumuler salaire et APL ?",
        "answer": "Oui, mais le salaire est pris en compte dans les ressources. Il faut donc mesurer son effet sur l'aide."
      },
      {
        "question": "Alternant et Ã©tudiant ont-ils la mÃªme APL ?",
        "answer": "La logique est proche, mais la structure des revenus peut modifier le rÃ©sultat."
      }
    ]
  },
  {
    "slug": "apl-apprenti",
    "intent": "apl apprenti",
    "title": "APL apprenti : estimation 2026",
    "description": "ScÃ©nario APL pour un apprenti avec petit salaire et loyer modÃ©rÃ©.",
    "summary": "Cette page cible une intention prÃ©cise souvent recherchÃ©e avec une concurrence encore raisonnable.",
    "audience": "Apprenti locataire",
    "tags": [
      "apprenti",
      "jeune-actif",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 820,
      "loyer_mensuel": 480,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le revenu net rÃ©el verse par l employeur.",
      "Comparer avec un scÃ©nario alternance si votre statut est hybride.",
      "Tester aussi un scÃ©nario en rÃ©sidence si vous Ãªtes hÃ©bergÃ© en foyer."
    ],
    "faq": [
      {
        "question": "Un apprenti a-t-il droit Ã  l'APL ?",
        "answer": "Oui, sous conditions de logement et de ressources. Les revenus modestes de l apprentissage peuvent laisser une aide."
      },
      {
        "question": "Le contrat d apprentissage change-t-il le calcul ?",
        "answer": "Le statut ne suffit pas Ã  lui seul. Ce sont surtout les revenus et le logement qui dÃ©terminent l'estimation."
      }
    ]
  },
  {
    "slug": "apl-colocation-jeune-actif",
    "intent": "apl colocation jeune actif",
    "title": "APL jeune actif en colocation : estimation 2026",
    "description": "Cas APL pour un jeune actif en colocation avec revenu modeste.",
    "summary": "Cette page sert un besoin trÃ¨s concret sur les premiers logements urbains et la gestion du reste Ã  charge.",
    "audience": "Jeune actif en colocation",
    "tags": [
      "colocation",
      "jeune-actif",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1250,
      "loyer_mensuel": 460,
      "region": "province",
      "type_logement": "colocation",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier la quote-part de loyer mentionnee au bail.",
      "Tester une variante avec revenu ? 1400 EUR.",
      "Comparer avec un studio si vous hÃ©sitez entre les deux."
    ],
    "faq": [
      {
        "question": "La colocation reste-t-elle intÃ©ressante avec l'APL ?",
        "answer": "Oui si elle reduit suffisamment le reste Ã  charge. Il faut raisonner sur votre part de loyer et non sur le loyer total."
      },
      {
        "question": "Un jeune actif en colocation doit-il dÃ©clarer le loyer total ?",
        "answer": "Non, la logique porte sur votre quote-part rÃ©elle ou sur ce que le bail permet de justifier."
      }
    ]
  },
  {
    "slug": "apl-hlm-petit-revenu",
    "intent": "apl hlm petit revenu",
    "title": "APL en HLM avec petit revenu : estimation 2026",
    "description": "Exemple APL pour un foyer modeste loge en HLM.",
    "summary": "Cette page rÃ©pond a une intention claire autour d'un type de logement trÃ¨s frÃ©quent dans les recherches APL.",
    "audience": "Locataire HLM avec petit revenu",
    "tags": [
      "hlm",
      "petit-revenu",
      "province",
      "foyer"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 980,
      "loyer_mensuel": 430,
      "region": "province",
      "type_logement": "hlm",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le montant du loyer net retenu sur l'avis de paiement.",
      "Tester une variante couple ou parent isolÃ© si la composition du foyer change.",
      "Comparer avec un logement privÃ© au mÃªme niveau de loyer."
    ],
    "faq": [
      {
        "question": "L'APL est-elle plus simple en HLM ?",
        "answer": "Le type de logement peut clarifier certains paramÃ¨tres, mais le revenu et la composition du foyer restent decisifs."
      },
      {
        "question": "Un petit loyer signifie-t-il forcÃ©ment une petite APL ?",
        "answer": "Pas toujours, mais un loyer plus faible limite mecaniquement la base de calcul de l'aide."
      }
    ]
  },
  {
    "slug": "apl-petite-surface-paris",
    "intent": "apl studio paris",
    "title": "APL pour un studio Ã  Paris : estimation 2026",
    "description": "Exemple APL pour une petite surface parisienne avec revenu limite.",
    "summary": "Cette page vise les recherches sur les studios parisiens, trÃ¨s frÃ©quentes chez les jeunes actifs et les Ã©tudiants.",
    "audience": "Locataire d'un studio Ã  Paris",
    "tags": [
      "studio",
      "paris",
      "idf",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1000,
      "loyer_mensuel": 760,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier que le loyer est bien renseignÃ© hors charges.",
      "Comparer avec une chambre ou une colocation.",
      "Tester un revenu ? 800 EUR puis ? 1200 EUR."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL pour un studio Ã  Paris ?",
        "answer": "Oui, surtout avec des revenus modestes. Le calcul reste toutefois limite par le plafond de loyer de la zone."
      },
      {
        "question": "Studio et chambre donnent-ils la mÃªme APL ?",
        "answer": "Pas forcÃ©ment. Le rÃ©sultat dÃ©pend du loyer dÃ©clarÃ© et des caractÃ©ristiques du logement."
      }
    ]
  },
  {
    "slug": "apl-couple-paris",
    "intent": "apl couple paris",
    "title": "APL pour un couple Ã  Paris : estimation 2026",
    "description": "Cas pratique d'un couple parisien avec loyer francilien et revenus intermediaires.",
    "summary": "Cette page couvre une requÃªte gÃ©olocalisÃ©e couple plus loyer tendu, frÃ©quente sur les budgets de dÃ©but de vie commune.",
    "audience": "Couple Ã  Paris",
    "tags": [
      "couple",
      "paris",
      "idf",
      "foyer"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 2200,
      "loyer_mensuel": 980,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le loyer hors charges indiquÃ© dans le bail.",
      "Tester un scÃ©nario avec revenus ? 2000 EUR puis ? 2500 EUR.",
      "Comparer avec une proche banlieue si vous etudiez plusieurs options."
    ],
    "faq": [
      {
        "question": "Un couple Ã  Paris peut-il toucher une APL significative ?",
        "answer": "Oui dans certains cas, mais le plafond de loyer retient seulement une partie du coÃ»t rÃ©el du logement."
      },
      {
        "question": "Les revenus combinÃ©s annulent-ils souvent l'APL ?",
        "answer": "Ils peuvent la rÃ©duire rapidement. Il faut donc vÃ©rifier le rapport entre revenus du foyer et loyer."
      }
    ]
  },
  {
    "slug": "apl-couple-lyon",
    "intent": "apl couple lyon",
    "title": "APL pour un couple Ã  Lyon : estimation 2026",
    "description": "Simulation type APL pour un couple Ã  Lyon avec logement dans le parc privÃ©.",
    "summary": "Cette page couvre une grande ville de province avec une recherche gÃ©olocalisÃ©e utile pour les couples sans enfant.",
    "audience": "Couple Ã  Lyon",
    "tags": [
      "couple",
      "lyon",
      "province",
      "foyer"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 2050,
      "loyer_mensuel": 790,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si les deux revenus sont stables sur la pÃ©riode retenue.",
      "Comparer avec un scÃ©nario couple avec enfant si la situation doit Ã©voluer vite.",
      "Tester aussi un loyer ? 700 EUR puis ? 850 EUR."
    ],
    "faq": [
      {
        "question": "Le calcul de l'APL d'un couple Ã  Lyon reste-t-il int?ressant ?",
        "answer": "Oui dans certains cas, surtout si le loyer reste soutenu au regard des revenus du foyer."
      },
      {
        "question": "Une grande ville de province reste-t-elle en zone province ?",
        "answer": "Oui dans ce type de scÃ©nario. La distinction principale oppose ici l ÃŽle-de-France, la province et les DOM."
      }
    ]
  },
  {
    "slug": "apl-couple-sans-enfant",
    "intent": "apl couple sans enfant",
    "title": "APL pour un couple sans enfant : estimation 2026",
    "description": "ScÃ©nario APL pour un couple locataire sans enfant avec revenus modestes.",
    "summary": "Cette page rÃ©pond a une intention large et rentable pour le cluster foyer, avec un cas simple ? comparer.",
    "audience": "Couple sans enfant",
    "tags": [
      "couple",
      "province",
      "foyer",
      "petit-revenu"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 1800,
      "loyer_mensuel": 720,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Additionner les deux revenus rÃ©els du foyer.",
      "Tester le scÃ©nario avec et sans prime variable.",
      "Comparer avec un logement HLM si c'est une option plausible."
    ],
    "faq": [
      {
        "question": "Le revenu du conjoint est-il pris en compte pour l'APL ?",
        "answer": "Oui, le calcul tient compte des ressources du foyer. L'aide peut donc baisser plus vite que pour une personne seule."
      },
      {
        "question": "Un couple sans enfant a-t-il un plafond diff?rent ?",
        "answer": "Oui, le plafond de loyer et certains paramÃ¨tres de calcul Ã©voluent avec la composition du foyer."
      }
    ]
  },
  {
    "slug": "apl-couple-un-enfant",
    "intent": "apl couple 1 enfant",
    "title": "APL couple avec 1 enfant : estimation 2026",
    "description": "ScÃ©nario APL pour un couple avec un enfant et loyer familial moyen.",
    "summary": "Cette page couvre une requÃªte large et sert de pivot vers les autres cas famille plus prÃ©cis.",
    "audience": "Couple avec un enfant",
    "tags": [
      "couple",
      "1-enfant",
      "province",
      "famille"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 2200,
      "loyer_mensuel": 850,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier la composition exacte du foyer.",
      "Comparer avec un scÃ©nario deux enfants ou parent isolÃ©.",
      "Tester aussi un logement social si c'est votre cas."
    ],
    "faq": [
      {
        "question": "Le premier enfant change-t-il beaucoup l'APL ?",
        "answer": "Il peut rendre le calcul plus favorable, mais le revenu du foyer reste dÃ©terminant."
      },
      {
        "question": "Faut-il recalculer l'APL aprÃ¨s une naissance ?",
        "answer": "Oui, car la composition du foyer influence directement plusieurs paramÃ¨tres du calcul."
      }
    ]
  },
  {
    "slug": "apl-couple-loyer-eleve",
    "intent": "apl couple loyer eleve",
    "title": "APL pour un couple avec loyer eleve : estimation 2026",
    "description": "ScÃ©nario APL pour un couple avec un loyer Ã©levÃ© par rapport au revenu du foyer.",
    "summary": "Cette page rÃ©pond a une question rÃ©currente de budget logement en zone tendue pour les couples sans enfant.",
    "audience": "Couple avec loyer Ã©levÃ©",
    "tags": [
      "couple",
      "loyer-eleve",
      "foyer",
      "idf"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 2300,
      "loyer_mensuel": 1080,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le plafond de loyer applicable dans la zone.",
      "Comparer avec un scÃ©nario hors ÃŽle-de-France.",
      "Tester une baisse ou une hausse de revenus pour mesurer la sensibilite."
    ],
    "faq": [
      {
        "question": "Un loyer trÃ¨s Ã©levÃ© empÃªche-t-il l'APL ?",
        "answer": "Pas necessairement, mais une partie du loyer peut dÃ©passer le plafond retenu et ne plus augmenter l'aide."
      },
      {
        "question": "Faut-il viser un logement moins cher pour garder l'APL ?",
        "answer": "Souvent, un loyer plus raisonnable permet surtout de rÃ©duire le reste Ã  charge, mÃªme si l'aide baisse un peu."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-un-enfant",
    "intent": "apl parent isole 1 enfant",
    "title": "APL parent isolÃ© avec 1 enfant : estimation 2026",
    "description": "Cas pratique APL pour un parent isolÃ© avec un enfant en location.",
    "summary": "Cette page vise une intention trÃ¨s concrÃ¨te avec un besoin fort de rÃ©ponse rapide sur le niveau d'aide.",
    "audience": "Parent isolÃ© avec un enfant",
    "tags": [
      "parent-isol",
      "1-enfant",
      "province",
      "famille"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 1350,
      "loyer_mensuel": 760,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le nombre d'enfants ? charge retenu.",
      "Comparer avec le RSA ou la prime d'activitÃ© si besoin.",
      "Tester un scÃ©nario HLM si le logement est social."
    ],
    "faq": [
      {
        "question": "Un parent isolÃ© touche-t-il plus d'APL ?",
        "answer": "Le calcul peut Ãªtre plus favorable qu avec un adulte seul, mais il dÃ©pend toujours du revenu et du loyer retenu."
      },
      {
        "question": "Les pensions alimentaires changent-elles l'APL ?",
        "answer": "Oui, elles peuvent modifier les ressources prises en compte. Il faut donc les intÃ©grer a la vÃ©rification finale."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-deux-enfants",
    "intent": "apl parent isole 2 enfants",
    "title": "APL parent isolÃ© avec 2 enfants : estimation 2026",
    "description": "ScÃ©nario APL pour un parent solo avec deux enfants et loyer familial.",
    "summary": "Cette page couvre une recherche a forte utilitÃ© pratique pour les foyers monoparentaux avec charges Ã©levÃ©es.",
    "audience": "Parent isolÃ© avec deux enfants",
    "tags": [
      "parent-isol",
      "2-enfants",
      "province",
      "famille"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 2,
      "revenus_mensuels": 1500,
      "loyer_mensuel": 840,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si les enfants sont tous considÃ©rÃ©s ? charge.",
      "Tester un scÃ©nario avec garde alternee si la situation est complexe.",
      "Comparer avec un logement social si vous Ãªtes dÃ©jÃ  en HLM."
    ],
    "faq": [
      {
        "question": "L'APL monte-t-elle nettement avec deux enfants ?",
        "answer": "Le calcul est souvent plus favorable, mais il dÃ©pend toujours du revenu et du loyer retenu par la zone."
      },
      {
        "question": "Le parent isolÃ© doit-il dÃ©clarer toutes les aides familiales ?",
        "answer": "Oui, les ressources prises en compte doivent Ãªtre vÃ©rifiÃ©es de maniÃ¨re complÃ¨te avant de dÃ©poser un dossier."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-paris",
    "intent": "apl parent isole paris",
    "title": "APL parent isolÃ© Ã  Paris : estimation 2026",
    "description": "Estimation APL pour un parent solo Ã  Paris avec un enfant et loyer francilien.",
    "summary": "Cette page combine intention familiale et gÃ©olocalisation forte, avec un vrai enjeu de reste Ã  charge en ÃŽle-de-France.",
    "audience": "Parent isolÃ© Ã  Paris",
    "tags": [
      "parent-isol",
      "paris",
      "idf",
      "1-enfant"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 1400,
      "loyer_mensuel": 960,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le loyer retenu hors charges.",
      "Comparer avec une proche banlieue si vous cherchez un ordre de grandeur.",
      "Tester aussi un scÃ©nario avec deux enfants si la situation Ã©volue vite."
    ],
    "faq": [
      {
        "question": "Un parent solo Ã  Paris peut-il encore toucher une APL utile ?",
        "answer": "Oui, surtout avec des revenus modestes, mais le coÃ»t du logement reste souvent bien supÃ©rieur au plafond retenu."
      },
      {
        "question": "Pourquoi le reste Ã  charge reste-t-il Ã©levÃ© Ã  Paris ?",
        "answer": "Parce que l'APL ne suit pas intÃ©gralement le loyer rÃ©el au-delÃ  du plafond applicable Ã  la zone."
      }
    ]
  },
  {
    "slug": "apl-famille-deux-enfants-province",
    "intent": "apl famille 2 enfants",
    "title": "APL famille avec 2 enfants en province : estimation 2026",
    "description": "Cas APL pour un couple avec deux enfants dans une grande ville de province.",
    "summary": "Cette page donne un scÃ©nario familial trÃ¨s lisible pour comprendre l'impact du foyer sur le calcul.",
    "audience": "Couple avec deux enfants en province",
    "tags": [
      "famille",
      "2-enfants",
      "province",
      "couple"
    ],
    "input": {
      "situation": "couple",
      "enfants": 2,
      "revenus_mensuels": 2400,
      "loyer_mensuel": 920,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le nombre exact d enfants retenus au foyer.",
      "Comparer avec un logement social si vous y Ãªtes Ã©ligibles.",
      "Tester une variation de revenu si un parent reprend'une activitÃ©."
    ],
    "faq": [
      {
        "question": "Une famille avec deux enfants peut-elle encore toucher l'APL ?",
        "answer": "Oui, surtout si le logement reste coÃ»teux au regard des revenus du foyer. La composition familiale joue souvent en faveur du calcul."
      },
      {
        "question": "Le couple doit-il dÃ©clarer toutes les ressources du foyer ?",
        "answer": "Oui, y compris les revenus des deux adultes et les autres ressources retenues par la CAF."
      }
    ]
  },
  {
    "slug": "apl-famille-idf",
    "intent": "apl famille ile de france",
    "title": "APL famille en ?le-de-France : estimation 2026",
    "description": "Simulation type APL pour une famille en ÃŽle-de-France avec loyer Ã©levÃ©.",
    "summary": "Cette page rÃ©pond a une recherche a forte tension budgetaire dans une zone ou le reste Ã  charge reste souvent lourd.",
    "audience": "Famille en ÃŽle-de-France",
    "tags": [
      "famille",
      "idf",
      "couple",
      "1-enfant"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 2500,
      "loyer_mensuel": 1100,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le logement dÃ©passe les plafonds de zone.",
      "Comparer avec un scÃ©nario province si une mobilitÃ© est envisagÃ©e.",
      "Tester aussi une variante avec deux enfants."
    ],
    "faq": [
      {
        "question": "Une famille francilienne peut-elle vraiment compter sur l'APL ?",
        "answer": "L'APL peut aider, mais elle ne suit pas gÃ©nÃ©ralement la hausse rÃ©elle des loyers en zone tendue."
      },
      {
        "question": "Pourquoi le montant semble parfois faible en ÃŽle-de-France ?",
        "answer": "Parce que le calcul applique un plafond de loyer et tient compte de l'ensemble des ressources du foyer."
      }
    ]
  },
  {
    "slug": "apl-personne-seule-smic",
    "intent": "apl personne seule smic",
    "title": "APL personne seule au SMIC : estimation 2026",
    "description": "Estimation APL pour une personne seule avec un salaire proche du SMIC et un loyer courant.",
    "summary": "Cette page dÃ©rive directement du pattern le plus fort observÃ© sur le cluster APL autour du SMIC et de la personne seule.",
    "audience": "Personne seule au SMIC",
    "tags": [
      "celibataire",
      "smic",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1430,
      "loyer_mensuel": 610,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le salaire net rÃ©ellement retenu sur la pÃ©riode de rÃ©fÃ©rence.",
      "Comparer avec un loyer autour de 550 EUR puis de 700 EUR.",
      "Tester aussi un scÃ©nario avec reprise d'emploi ou prime d'activitÃ©."
    ],
    "faq": [
      {
        "question": "Une personne seule au SMIC peut-elle encore toucher l'APL ?",
        "answer": "Oui, dans certains cas. Le loyer, la zone et les revenus retenus peuvent encore laisser une aide logement indicative."
      },
      {
        "question": "Le fait d'Ãªtre seul change-t-il fortement le calcul ?",
        "answer": "Oui, la composition du foyer joue sur le plafond de loyer et sur l'Ã©quilibre global du calcul."
      }
    ]
  },
  {
    "slug": "apl-smic-seul",
    "intent": "apl smic seul",
    "title": "APL au SMIC pour une personne seule : estimation indicative 2026",
    "description": "Estimation indicative APL 2026 pour une personne seule au SMIC avec loyer moyen : ~144 EUR par mois dans ce sc?nario type.",
    "summary": "Cette page vise une variante de requ?te tr?s proche du pattern gagnant d?j? test? par Google.",
    "audience": "Personne seule avec salaire au SMIC",
    "tags": [
      "celibataire",
      "smic",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1460,
      "loyer_mensuel": 640,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le loyer retenu est bien indiquÃ© hors charges.",
      "Comparer avec un petit loyer si vous hÃ©sitez entre deux logements.",
      "Tester aussi un scÃ©nario sans activitÃ© pour mesurer l'Ã©cart."
    ],
    "faq": [
      {
        "question": "Peut-on encore toucher l'APL avec un salaire au SMIC ?",
        "answer": "Oui, dans certains cas. Une personne seule au SMIC peut encore garder un droit si le loyer reste significatif au regard des ressources retenues par la CAF."
      },
      {
        "question": "Quel montant d'APL pour une personne seule au SMIC en 2026 ?",
        "answer": "Dans ce sc?nario type, l'estimation indicative tourne autour de 144 EUR par mois. Le montant final d?pend du loyer retenu, de la zone et des ressources r?ellement prises en compte."
      },
      {
        "question": "Le SMIC suffit-il ? faire tomber l'APL ? z?ro ?",
        "answer": "Pas automatiquement. Tout d?pend du loyer, de la zone et des ressources retenues par la CAF. Un loyer plus bas ou plus haut peut faire varier le r?sultat."
      },
      {
        "question": "Pourquoi deux personnes seules au SMIC peuvent-elles avoir une APL diff?rente ?",
        "answer": "Parce que le niveau exact du loyer retenu, la zone g?ographique, les autres revenus et la p?riode de r?f?rence peuvent modifier le calcul final."
      },
      {
        "question": "Comment v?rifier cette estimation APL au SMIC ?",
        "answer": "Le plus utile est d'ouvrir le simulateur APL complet avec votre loyer r?el, puis de v?rifier votre r?sultat final sur caf.fr avant toute d?marche."
      }
    ],
    "briefEnhancements": {
      "metaTitle": "APL au SMIC seul : estimation indicative 2026 (~144 EUR)",
      "metaDescription": "Estimation indicative APL 2026 pour une personne seule au SMIC : ~144 EUR par mois dans ce sc?nario type. Ouvrez le simulateur complet et v?rifiez sur caf.fr.",
      "directAnswer": "Estimation indicative : ~144 EUR par mois pour une personne seule au SMIC avec loyer moyen en 2026.",
      "directAnswerDetails": "Le montant final d?pend du loyer retenu, de la zone, des ressources r?ellement prises en compte et de votre situation administrative. V?rifiez toujours sur caf.fr.",
      "methodSteps": [
        {
          "title": "Sources utilis?es",
          "description": "Cette estimation est calcul?e avec le moteur APL du site et doit ?tre recoup?e avec les informations officielles de la CAF."
        },
        {
          "title": "Hypoth?se standard du sc?nario",
          "description": "Le cas type retient ici une personne seule, 1 460 EUR de revenus mensuels, 640 EUR de loyer et une zone province."
        },
        {
          "title": "Marge de variation",
          "description": "Le r?sultat r?el peut varier selon le loyer plafonn?, la zone exacte, les autres revenus du foyer et la p?riode retenue par la CAF."
        }
      ]
    }
  },
  {
    "slug": "apl-celibataire-petit-salaire",
    "intent": "apl celibataire petit salaire",
    "title": "APL cÃ©libataire avec petit salaire : estimation 2026",
    "description": "Cas APL pour un cÃ©libataire avec un revenu modeste lÃ©gÃ¨rement infÃ©rieur au SMIC.",
    "summary": "Cette page Ã©tend le pattern cÃ©libataire plus petit revenu, qui ressort dÃ©jÃ  Ã  la fois dans les pages et dans les requÃªtes.",
    "audience": "CÃ©libataire avec petit salaire",
    "tags": [
      "celibataire",
      "petit-revenu",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1180,
      "loyer_mensuel": 590,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si vous avez des revenus variables ou des primes ponctuelles.",
      "Comparer avec un loyer lÃ©gÃ¨rement plus Ã©levÃ© en zone tendue.",
      "Tester un scÃ©nario avec personne seule au SMIC pour comparer."
    ],
    "faq": [
      {
        "question": "Un petit salaire augmente-t-il fortement l'APL ?",
        "answer": "Il peut rendre l'estimation plus favorable, mais le loyer retenu et la zone restent dÃ©terminants."
      },
      {
        "question": "Faut-il dÃ©clarer toutes les aides perÃ§ues ?",
        "answer": "Oui, la vÃ©rification finale doit toujours intÃ©grer les autres ressources prises en compte par la CAF."
      }
    ]
  },
  {
    "slug": "apl-chomage-personne-seule",
    "intent": "apl chomage personne seule",
    "title": "APL au chÃ´mage pour une personne seule : estimation 2026",
    "description": "Estimation APL pour une personne seule sans activitÃ© avec un loyer courant.",
    "summary": "Cette page prolonge le pattern chÃ´mage qui remonte dÃ©jÃ  dans les requÃªtes et sur la page chÃ´mage avec loyer moyen.",
    "audience": "Personne seule au chÃ´mage",
    "tags": [
      "celibataire",
      "chomage",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 980,
      "loyer_mensuel": 610,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si les revenus retenus correspondent bien Ã  votre situation actuelle.",
      "Comparer avec une reprise d'emploi partielle si vous envisagez un retour rapide au travail.",
      "Tester aussi un loyer plus bas pour mesurer le reste Ã  charge."
    ],
    "faq": [
      {
        "question": "Le chÃ´mage ouvre-t-il plus facilement droit Ã  l'APL ?",
        "answer": "Souvent oui si les ressources retenues baissent, mais le montant dÃ©pend toujours du loyer plafonnÃ© et de la zone."
      },
      {
        "question": "L'ARE est-elle prise en compte ?",
        "answer": "Oui, selon la pÃ©riode et les rÃ¨gles retenues par la CAF, l'indemnisation chÃ´mage peut influencer le calcul."
      }
    ]
  },
  {
    "slug": "apl-chomage-avec-enfant",
    "intent": "apl chomage avec enfant",
    "title": "APL au chÃ´mage avec enfant : estimation 2026",
    "description": "ScÃ©nario APL pour un parent avec un enfant et des revenus en baisse liÃ©s au chÃ´mage.",
    "summary": "Cette page permet d'Ã©tendre le pattern chÃ´mage vers une situation familiale, souvent plus porteuse en besoin utilisateur.",
    "audience": "Parent avec un enfant au chÃ´mage",
    "tags": [
      "parent-isole",
      "chomage",
      "province",
      "1-enfant"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 1100,
      "loyer_mensuel": 760,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si toutes les ressources de remplacement sont bien prises en compte.",
      "Comparer avec un scÃ©nario parent isolÃ© en emploi partiel.",
      "Tester une variante avec deux enfants si la composition familiale Ã©volue."
    ],
    "faq": [
      {
        "question": "Le fait d'avoir un enfant change-t-il beaucoup l'estimation APL ?",
        "answer": "Oui, la composition familiale peut rendre le calcul plus favorable, mais le loyer et les ressources restent dÃ©cisifs."
      },
      {
        "question": "Les allocations familiales suffisent-elles Ã  annuler l'APL ?",
        "answer": "Pas automatiquement. Il faut regarder l'ensemble des revenus retenus et le plafond de loyer applicable."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi-loyer-eleve",
    "intent": "apl reprise emploi loyer eleve",
    "title": "APL avec reprise d'emploi et loyer Ã©levÃ© : estimation 2026",
    "description": "Exemple APL pour une personne seule qui reprend une activitÃ© avec un loyer dÃ©jÃ  Ã©levÃ©.",
    "summary": "Cette page dÃ©rive du pattern reprise d'emploi dÃ©jÃ  testÃ©, avec une variable loyer Ã©levÃ© qui aide Ã  capter une intention plus concrÃ¨te.",
    "audience": "Personne seule en reprise d'emploi avec loyer Ã©levÃ©",
    "tags": [
      "celibataire",
      "reprise-emploi",
      "loyer-eleve",
      "province"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1380,
      "loyer_mensuel": 820,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec un loyer moyen pour mesurer la part rÃ©ellement retenue.",
      "VÃ©rifier si vos premiers revenus d'activitÃ© changent fortement l'estimation.",
      "Tester aussi une version chÃ´mage si la reprise n'est pas encore stabilisÃ©e."
    ],
    "faq": [
      {
        "question": "Une reprise d'emploi fait-elle baisser l'APL rapidement ?",
        "answer": "Elle peut rÃ©duire l'aide selon les revenus retenus, mais un loyer Ã©levÃ© peut encore laisser un droit indicatif."
      },
      {
        "question": "Le plafond de loyer limite-t-il l'effet d'un loyer plus cher ?",
        "answer": "Oui, au-delÃ  d'un certain seuil, une partie du loyer n'augmente plus le montant retenu."
      }
    ]
  },
  {
    "slug": "apl-couple-petit-revenu",
    "intent": "apl couple petit revenu",
    "title": "APL couple avec petit revenu : estimation 2026",
    "description": "Simulation APL pour un couple sans enfant avec revenus modestes et loyer moyen.",
    "summary": "Cette page prolonge le pattern couple sans enfant dÃ©jÃ  bien positionnÃ©, avec un angle plus resserrÃ© sur les petits revenus.",
    "audience": "Couple sans enfant avec petit revenu",
    "tags": [
      "couple",
      "petit-revenu",
      "province",
      "sans-enfant"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 1700,
      "loyer_mensuel": 690,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si les revenus des deux adultes sont bien additionnÃ©s.",
      "Comparer avec un couple au loyer Ã©levÃ© pour mesurer l'Ã©cart.",
      "Tester aussi une variante avec un enfant si la situation Ã©volue."
    ],
    "faq": [
      {
        "question": "Un couple sans enfant peut-il encore toucher l'APL avec des revenus modestes ?",
        "answer": "Oui, surtout si le loyer reste significatif au regard des ressources globales du foyer."
      },
      {
        "question": "Le montant baisse-t-il vite dÃ¨s que les deux salaires augmentent ?",
        "answer": "Oui, l'ensemble des revenus retenus du couple peut rÃ©duire l'aide assez rapidement."
      }
    ]
  },
  {
    "slug": "apl-couple-un-enfant-loyer-moyen",
    "intent": "apl couple 1 enfant loyer moyen",
    "title": "APL couple avec 1 enfant et loyer moyen : estimation 2026",
    "description": "Cas APL pour un couple avec un enfant dans une situation locative standard.",
    "summary": "Cette page permet de densifier le sous-cluster couple plus enfant, sans repartir d'une combinaison trop large.",
    "audience": "Couple avec un enfant et loyer moyen",
    "tags": [
      "couple",
      "1-enfant",
      "province",
      "famille"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 2150,
      "loyer_mensuel": 780,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si l'enfant est bien comptÃ© Ã  charge sur toute la pÃ©riode.",
      "Comparer avec un couple sans enfant pour mesurer l'impact du foyer.",
      "Tester un logement lÃ©gÃ¨rement plus grand si vous hÃ©sitez entre deux loyers."
    ],
    "faq": [
      {
        "question": "Le premier enfant change-t-il beaucoup le calcul APL ?",
        "answer": "Il peut amÃ©liorer l'estimation, mais le niveau exact de revenus et le loyer retenu restent essentiels."
      },
      {
        "question": "Faut-il un grand loyer pour conserver l'APL en couple avec enfant ?",
        "answer": "Pas forcÃ©ment, mais un loyer plus significatif par rapport aux revenus rend l'aide plus probable."
      }
    ]
  },
  {
    "slug": "apl-famille-trois-enfants",
    "intent": "apl 3 enfants",
    "title": "APL famille avec 3 enfants : estimation indicative 2026",
    "description": "Estimation indicative APL 2026 pour une famille avec 3 enfants : ~87 EUR par mois dans ce sc?nario type.",
    "summary": "Cette page prolonge naturellement les signaux d?j? vus sur les familles avec enfants et la requ?te g?n?rique autour de l'APL avec enfants.",
    "audience": "Famille avec trois enfants",
    "tags": [
      "famille",
      "3-enfants",
      "province",
      "couple"
    ],
    "input": {
      "situation": "couple",
      "enfants": 3,
      "revenus_mensuels": 2550,
      "loyer_mensuel": 980,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier le nombre exact d'enfants retenus au foyer.",
      "Comparer avec un logement social si vous avez accÃ¨s Ã  ce type de parc.",
      "Tester aussi une variante avec deux enfants pour voir l'effet de composition familiale."
    ],
    "faq": [
      {
        "question": "Quel montant d'APL pour une famille avec 3 enfants en 2026 ?",
        "answer": "Dans ce sc?nario type, l'estimation indicative tourne autour de 87 EUR par mois. Le montant final d?pend du loyer retenu, de la zone, des ressources du foyer et de la composition familiale exacte."
      },
      {
        "question": "Avec trois enfants, l'APL monte-t-elle toujours fortement ?",
        "answer": "Pas toujours. La pr?sence de trois enfants peut rendre le calcul plus favorable, mais le niveau global de revenus du foyer et le loyer plafonn? restent d?cisifs."
      },
      {
        "question": "Un logement plus grand augmente-t-il automatiquement l'APL ?",
        "answer": "Pas automatiquement, car le plafond de loyer limite la part r?ellement retenue. Un logement plus cher peut donc augmenter le reste ? charge sans faire monter l'aide au m?me rythme."
      },
      {
        "question": "Pourquoi v?rifier le r?sultat d'APL famille sur caf.fr ?",
        "answer": "Parce que la CAF tient compte de la situation r?elle du foyer, du logement, des ressources retenues et des ?ventuelles aides d?j? per?ues. L'estimation affich?e ici reste indicative."
      },
      {
        "question": "Comment affiner cette estimation pour une famille avec 3 enfants ?",
        "answer": "Le plus simple est d'ouvrir le simulateur APL complet avec votre loyer r?el, votre zone et vos revenus actuels, puis de v?rifier le r?sultat final sur caf.fr."
      }
    ],
    "briefEnhancements": {
      "metaTitle": "APL famille 3 enfants : estimation indicative 2026 (~87 EUR)",
      "metaDescription": "Estimation indicative APL 2026 pour une famille avec 3 enfants : ~87 EUR par mois. Ouvrez le simulateur complet et v?rifiez le montant final sur caf.fr.",
      "directAnswer": "Estimation indicative : ~87 EUR par mois pour une famille avec 3 enfants en 2026, dans ce sc?nario type.",
      "directAnswerDetails": "Le montant final d?pend du loyer retenu, de la zone, des ressources du foyer et de la composition familiale exacte. V?rifiez toujours sur caf.fr.",
      "methodSteps": [
        {
          "title": "Sources utilis?es",
          "description": "Cette estimation repose sur le moteur APL du site et doit ?tre compar?e aux informations officielles de la CAF et de Service-Public."
        },
        {
          "title": "Hypoth?se standard du sc?nario",
          "description": "Le cas type retient ici un couple avec 3 enfants, 2 550 EUR de revenus mensuels, 980 EUR de loyer et une zone province."
        },
        {
          "title": "Marge de variation",
          "description": "Le montant r?el peut varier selon le loyer plafonn?, la zone exacte, la composition du foyer retenue et les autres ressources prises en compte."
        }
      ]
    }
  },
  {
    "slug": "apl-etudiant-studio",
    "intent": "apl etudiant studio",
    "title": "APL Ã©tudiant en studio : estimation 2026",
    "description": "ScÃ©nario APL pour un Ã©tudiant seul en studio avec budget serrÃ©.",
    "summary": "Cette page reste trÃ¨s proche du cluster Ã©tudiant dÃ©jÃ  visible, avec un angle logement simple et trÃ¨s courant.",
    "audience": "Ã‰tudiant en studio",
    "tags": [
      "etudiant",
      "studio",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 520,
      "loyer_mensuel": 540,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le studio est bien dÃ©clarÃ© en location indÃ©pendante.",
      "Comparer avec une rÃ©sidence Ã©tudiante ou une colocation.",
      "Tester plusieurs niveaux de revenus si vous avez un job Ã©tudiant."
    ],
    "faq": [
      {
        "question": "Un studio Ã©tudiant ouvre-t-il souvent droit Ã  l'APL ?",
        "answer": "Oui, c'est un cas frÃ©quent, surtout avec peu de revenus et un loyer adaptÃ© Ã  la zone."
      },
      {
        "question": "Le CROUS et le studio privÃ© donnent-ils le mÃªme rÃ©sultat ?",
        "answer": "Non, le type de logement peut modifier le montant retenu et les conditions de calcul."
      }
    ]
  },
  {
    "slug": "apl-etudiant-petit-loyer",
    "intent": "apl etudiant petit loyer",
    "title": "APL Ã©tudiant avec petit loyer : estimation 2026",
    "description": "Exemple APL pour un Ã©tudiant avec un loyer modÃ©rÃ© et de faibles revenus.",
    "summary": "Cette page couvre une variante utile du cluster Ã©tudiant, pour les profils qui arbitrent entre petit loyer et aide logement.",
    "audience": "Ã‰tudiant avec petit loyer",
    "tags": [
      "etudiant",
      "petit-loyer",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 450,
      "loyer_mensuel": 420,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le loyer retenu correspond bien Ã  votre part rÃ©elle.",
      "Comparer avec un studio plus cher ou une colocation.",
      "Tester aussi un scÃ©nario Ã©tudiant en grande ville."
    ],
    "faq": [
      {
        "question": "Un petit loyer rÃ©duit-il forcÃ©ment l'APL d'un Ã©tudiant ?",
        "answer": "Le montant peut Ãªtre plus faible, mais le reste Ã  charge global peut rester plus favorable."
      },
      {
        "question": "Faut-il quand mÃªme faire une simulation si le loyer est bas ?",
        "answer": "Oui, car mÃªme un loyer modÃ©rÃ© peut laisser une estimation utile selon vos revenus."
      }
    ]
  },
  {
    "slug": "apl-alternant-paris",
    "intent": "apl alternant paris",
    "title": "APL alternant Ã  Paris : estimation 2026",
    "description": "Estimation APL pour un alternant en location Ã  Paris avec salaire modeste.",
    "summary": "Cette page dÃ©rive d'un pattern dÃ©jÃ  cliquÃ© sur alternant, en ajoutant l'angle gÃ©olocalisÃ© Paris qui reste trÃ¨s dÃ©fendable.",
    "audience": "Alternant Ã  Paris",
    "tags": [
      "alternant",
      "paris",
      "idf",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 980,
      "loyer_mensuel": 780,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier votre revenu net rÃ©ellement retenu sur la pÃ©riode.",
      "Comparer avec une colocation si le loyer parisien est Ã©levÃ©.",
      "Tester aussi un scÃ©nario apprenti si votre contrat change."
    ],
    "faq": [
      {
        "question": "Un alternant Ã  Paris peut-il encore toucher l'APL ?",
        "answer": "Oui, surtout si le loyer reste Ã©levÃ© au regard du salaire d'alternance et de la zone retenue."
      },
      {
        "question": "Le salaire d'alternance est-il pris en compte ?",
        "answer": "Oui, il influence le calcul, d'oÃ¹ l'intÃ©rÃªt d'une simulation prÃ©-remplie et d'une vÃ©rification finale."
      }
    ]
  },
  {
    "slug": "apl-apprenti-loyer-500",
    "intent": "apl apprenti loyer 500",
    "title": "APL apprenti avec loyer de 500 EUR : estimation 2026",
    "description": "Cas APL pour un apprenti avec loyer modÃ©rÃ© et revenus de dÃ©but d'activitÃ©.",
    "summary": "Cette page suit le pattern apprenti dÃ©jÃ  testÃ©, avec une variable de loyer simple qui correspond Ã  une vraie recherche utilitaire.",
    "audience": "Apprenti avec loyer de 500 EUR",
    "tags": [
      "apprenti",
      "petit-loyer",
      "province",
      "actif"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 820,
      "loyer_mensuel": 500,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le bail indique bien un loyer hors charges.",
      "Comparer avec un loyer Ã  600 EUR pour mesurer l'Ã©cart.",
      "Tester aussi une version alternant si votre statut est proche."
    ],
    "faq": [
      {
        "question": "Un apprenti avec petit loyer peut-il toucher l'APL ?",
        "answer": "Oui, le statut d'apprenti et le niveau de revenus peuvent laisser une aide indicative selon la zone."
      },
      {
        "question": "Le loyer Ã  500 EUR est-il trop bas pour garder l'APL ?",
        "answer": "Pas forcÃ©ment. Le montant peut Ãªtre plus modÃ©rÃ©, mais l'aide reste possible selon votre situation."
      }
    ]
  },
  {
    "slug": "apl-celibataire-lyon",
    "intent": "apl celibataire lyon",
    "title": "APL cÃ©libataire Ã  Lyon : estimation 2026",
    "description": "Simulation APL pour une personne seule locataire Ã  Lyon avec budget urbain classique.",
    "summary": "Cette page complÃ¨te le trio des grandes villes dÃ©jÃ  visibles avec Paris, Marseille et Toulouse.",
    "audience": "CÃ©libataire Ã  Lyon",
    "tags": [
      "celibataire",
      "lyon",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1280,
      "loyer_mensuel": 690,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec Paris si vous hÃ©sitez entre deux zones tendues.",
      "VÃ©rifier si le loyer retenu est bien hors charges.",
      "Tester aussi un scÃ©nario Ã©tudiant si votre situation est hybride."
    ],
    "faq": [
      {
        "question": "Un cÃ©libataire Ã  Lyon peut-il encore toucher l'APL ?",
        "answer": "Oui, surtout avec revenus modÃ©rÃ©s et loyer urbain significatif, mÃªme si le plafond de loyer limite le calcul."
      },
      {
        "question": "Lyon est-elle plus favorable que Paris pour l'APL ?",
        "answer": "Le calcul dÃ©pend de la zone et du loyer retenu. Le reste Ã  charge peut parfois Ãªtre plus supportable hors ÃŽle-de-France."
      }
    ]
  },
  {
    "slug": "apl-etudiant-toulouse",
    "intent": "apl etudiant toulouse",
    "title": "APL Ã©tudiant Ã  Toulouse : estimation 2026",
    "description": "Exemple APL pour un Ã©tudiant Ã  Toulouse avec loyer modÃ©rÃ© et revenus limitÃ©s.",
    "summary": "Cette page Ã©tend le cluster Ã©tudiant ville, dÃ©jÃ  prÃ©sent sur Paris et Lyon, vers une ville universitaire trÃ¨s naturelle.",
    "audience": "Ã‰tudiant Ã  Toulouse",
    "tags": [
      "etudiant",
      "toulouse",
      "province",
      "petit-revenu"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 520,
      "loyer_mensuel": 560,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "VÃ©rifier si le logement est bien Ã©ligible Ã  l'APL.",
      "Comparer avec une colocation si vous avez un budget serrÃ©.",
      "Tester aussi une version Ã©tudiant Ã  Lyon pour situer l'Ã©cart."
    ],
    "faq": [
      {
        "question": "Un Ã©tudiant Ã  Toulouse peut-il toucher une APL utile ?",
        "answer": "Oui, avec peu de revenus et un loyer cohÃ©rent avec la zone, une estimation indicative reste frÃ©quente."
      },
      {
        "question": "Le montant est-il souvent proche de celui de Lyon ?",
        "answer": "Pas exactement. Le loyer, la zone et le type de logement font varier l'ordre de grandeur."
      }
    ]
  },
  {
    "slug": "apl-smic-couple-un-enfant",
    "intent": "apl smic couple un enfant",
    "title": "APL au SMIC pour un couple avec 1 enfant : estimation 2026",
    "description": "Scenario APL pour un couple avec un enfant et des revenus proches du SMIC.",
    "summary": "Cette page prolonge le motif SMIC vers un foyer familial simple, avec une intention concrete sur le maintien de l'aide.",
    "audience": "Couple avec un enfant et revenus proches du SMIC",
    "tags": [
      "couple",
      "smic",
      "1-enfant",
      "famille"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 2350,
      "loyer_mensuel": 840,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier les revenus reels du couple sur la periode retenue.",
      "Comparer avec le cas couple sans enfant si votre foyer change.",
      "Tester aussi un loyer plus haut si vous cherchez un logement plus grand."
    ],
    "faq": [
      {
        "question": "Un couple au SMIC avec un enfant peut-il encore toucher l'APL ?",
        "answer": "Oui dans certains cas, surtout si le loyer reste significatif au regard des revenus du foyer et de la zone."
      },
      {
        "question": "Le premier enfant change-t-il beaucoup l'estimation APL ?",
        "answer": "Il peut rendre l'estimation plus favorable, mais le revenu global et le loyer retenu restent decisifs."
      }
    ]
  },
  {
    "slug": "apl-smic-parent-isole-un-enfant",
    "intent": "apl smic parent isole un enfant",
    "title": "APL au SMIC pour un parent isole avec 1 enfant : estimation 2026",
    "description": "Estimation APL pour un parent isole avec un enfant et un revenu proche du SMIC.",
    "summary": "Cette page combine deux motifs solides du cluster APL : SMIC et parent isole.",
    "audience": "Parent isole avec un enfant et salaire proche du SMIC",
    "tags": [
      "parent-isole",
      "smic",
      "1-enfant",
      "famille"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 1450,
      "loyer_mensuel": 760,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si l'enfant est bien retenu a charge sur toute la periode.",
      "Comparer avec un parent isole sans revenu si la situation evolue.",
      "Tester aussi une variante avec logement social si votre loyer baisse."
    ],
    "faq": [
      {
        "question": "Un parent isole au SMIC peut-il toucher l'APL ?",
        "answer": "Oui, selon le loyer, la zone et les ressources retenues. Le parent isole reste souvent un profil pertinent pour l'aide au logement."
      },
      {
        "question": "Le SMIC annule-t-il forcement l'APL pour un parent isole ?",
        "answer": "Non. Le droit depend du foyer, du loyer retenu et de l'ensemble des ressources declarees."
      }
    ]
  },
  {
    "slug": "apl-smic-parent-isole-deux-enfants",
    "intent": "apl smic parent isole deux enfants",
    "title": "APL au SMIC pour un parent isole avec 2 enfants : estimation 2026",
    "description": "Scenario APL pour un parent isole avec deux enfants et un salaire proche du SMIC.",
    "summary": "Cette page densifie le motif parent isole en ajoutant une composition familiale plus forte.",
    "audience": "Parent isole avec deux enfants et revenu proche du SMIC",
    "tags": [
      "parent-isole",
      "smic",
      "2-enfants",
      "famille"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 2,
      "revenus_mensuels": 1500,
      "loyer_mensuel": 860,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si les deux enfants sont bien pris en compte dans le foyer.",
      "Comparer avec le cas parent isole avec un enfant pour mesurer l'ecart.",
      "Tester aussi une version logement social si vous changez de parc locatif."
    ],
    "faq": [
      {
        "question": "Deux enfants rendent-ils l'APL plus favorable pour un parent isole ?",
        "answer": "La composition familiale peut amÃ©liorer l'estimation, mais le loyer retenu et les revenus restent centraux."
      },
      {
        "question": "Le revenu proche du SMIC supprime-t-il automatiquement l'aide ?",
        "answer": "Non, pas automatiquement. L'estimation depend encore de la zone et du logement."
      }
    ]
  },
  {
    "slug": "apl-smic-logement-social",
    "intent": "apl smic logement social",
    "title": "APL au SMIC en logement social : estimation 2026",
    "description": "Estimation APL pour une personne seule au SMIC en logement social.",
    "summary": "Cette page relie le motif SMIC a un type de logement tres concret et souvent cherche.",
    "audience": "Personne seule au SMIC en logement social",
    "tags": [
      "smic",
      "logement-social",
      "hlm",
      "celibataire"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1450,
      "loyer_mensuel": 470,
      "region": "province",
      "type_logement": "hlm",
      "economie": 0
    },
    "checklist": [
      "Verifier si le loyer indique correspond bien au loyer hors charges.",
      "Comparer avec un logement prive si vous hesitez entre deux options.",
      "Tester aussi une version couple si le foyer change a court terme."
    ],
    "faq": [
      {
        "question": "Le logement social change-t-il l'estimation APL ?",
        "answer": "Oui, indirectement, via le niveau de loyer et la situation de logement retenue dans la simulation."
      },
      {
        "question": "Peut-on toucher l'APL au SMIC en HLM ?",
        "answer": "Oui, dans de nombreux cas, surtout si le loyer reste coherent avec vos revenus et votre zone."
      }
    ]
  },
  {
    "slug": "apl-loyer-600-smic",
    "intent": "apl loyer 600 smic",
    "title": "APL avec loyer de 600 EUR et salaire au SMIC : estimation 2026",
    "description": "Scenario budgetaire pour une personne seule avec un loyer de 600 EUR et un revenu proche du SMIC.",
    "summary": "Cette page renforce le motif chiffres + SMIC deja valide par les pages gagnantes du cluster.",
    "audience": "Personne seule au SMIC avec loyer de 600 EUR",
    "tags": [
      "smic",
      "loyer",
      "budget",
      "celibataire"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1450,
      "loyer_mensuel": 600,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec un loyer de 500 EUR et de 700 EUR.",
      "Verifier si vos revenus mensuels sont stables d'un mois a l'autre.",
      "Tester aussi une version logement social si vous avez cette option."
    ],
    "faq": [
      {
        "question": "Avec un loyer de 600 EUR et le SMIC, l'APL reste-t-elle possible ?",
        "answer": "Oui dans certains cas, car le loyer et la zone peuvent encore laisser une estimation utile."
      },
      {
        "question": "Pourquoi raisonner avec un couple revenu + loyer ?",
        "answer": "Parce que c'est une facon simple de repondre a une question budgetaire concrete avant une simulation plus complete."
      }
    ]
  },
  {
    "slug": "apl-loyer-700-personne-seule",
    "intent": "apl loyer 700 personne seule",
    "title": "APL avec loyer de 700 EUR pour une personne seule : estimation 2026",
    "description": "Estimation APL pour une personne seule avec un loyer de 700 EUR et un revenu modere.",
    "summary": "Cette page pousse le motif loyer vers une situation tres concrete de personne seule.",
    "audience": "Personne seule avec loyer de 700 EUR",
    "tags": [
      "loyer",
      "personne-seule",
      "budget",
      "celibataire"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1300,
      "loyer_mensuel": 700,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec un loyer de 600 EUR puis 800 EUR.",
      "Verifier si votre logement depasse le plafond de loyer retenu.",
      "Tester aussi une version couple si vous partagez bientot le logement."
    ],
    "faq": [
      {
        "question": "Une personne seule avec 700 EUR de loyer peut-elle encore toucher l'APL ?",
        "answer": "Oui, selon le revenu retenu et la zone. Le plafond de loyer peut toutefois limiter le montant final."
      },
      {
        "question": "Un loyer plus haut donne-t-il toujours plus d'APL ?",
        "answer": "Non. Au-dela d'un certain niveau, le plafond de loyer peut freiner l'effet sur l'estimation."
      }
    ]
  },
  {
    "slug": "apl-loyer-900-couple-un-enfant",
    "intent": "apl loyer 900 couple un enfant",
    "title": "APL avec loyer de 900 EUR pour un couple avec 1 enfant : estimation 2026",
    "description": "Scenario APL pour un couple avec un enfant et un loyer de 900 EUR.",
    "summary": "Cette page combine le motif loyer fort avec une structure familiale deja visible dans le cluster APL.",
    "audience": "Couple avec un enfant et loyer de 900 EUR",
    "tags": [
      "loyer",
      "couple",
      "1-enfant",
      "famille"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 2300,
      "loyer_mensuel": 900,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si le loyer est coherent avec votre zone de logement.",
      "Comparer avec un loyer moyen si vous hesitez entre deux biens.",
      "Tester aussi une version avec deux enfants si la famille s'agrandit."
    ],
    "faq": [
      {
        "question": "Un loyer de 900 EUR laisse-t-il encore un droit a l'APL pour un couple avec enfant ?",
        "answer": "Oui dans certains cas, mais le plafond de loyer applicable limite vite la part reellement retenue."
      },
      {
        "question": "La zone geographique change-t-elle beaucoup le resultat ?",
        "answer": "Oui, car les plafonds de loyer et le niveau du marche locatif ne sont pas les memes partout."
      }
    ]
  },
  {
    "slug": "apl-chomage-couple-sans-enfant",
    "intent": "apl chomage couple sans enfant",
    "title": "APL au chomage pour un couple sans enfant : estimation 2026",
    "description": "Estimation APL pour un couple sans enfant avec revenus en baisse lies au chomage.",
    "summary": "Cette page etend le motif chomage vers le foyer couple sans enfant, encore absent du cluster.",
    "audience": "Couple sans enfant au chomage ou avec faibles revenus de remplacement",
    "tags": [
      "chomage",
      "couple",
      "sans-enfant",
      "apl"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 1400,
      "loyer_mensuel": 760,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si les deux adultes sont bien dans une situation de revenus en baisse.",
      "Comparer avec le cas couple avec un enfant si le foyer change.",
      "Tester aussi une version sans revenu si la situation se degrade."
    ],
    "faq": [
      {
        "question": "Un couple au chomage peut-il encore toucher l'APL ?",
        "answer": "Oui, selon le niveau de revenus retenus et le loyer, un droit indicatif peut subsister."
      },
      {
        "question": "Deux revenus de remplacement annulent-ils toujours l'aide ?",
        "answer": "Non. Le calcul depend du loyer retenu, de la zone et des ressources exactes du foyer."
      }
    ]
  },
  {
    "slug": "apl-chomage-couple-un-enfant",
    "intent": "apl chomage couple un enfant",
    "title": "APL au chomage pour un couple avec 1 enfant : estimation 2026",
    "description": "Scenario APL pour un couple avec un enfant et des revenus de remplacement ou de chomage.",
    "summary": "Cette page relie le motif chomage a une structure familiale concrete et frequente.",
    "audience": "Couple avec un enfant en situation de chomage",
    "tags": [
      "chomage",
      "couple",
      "1-enfant",
      "famille"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 1500,
      "loyer_mensuel": 820,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si toutes les ressources de remplacement sont bien prises en compte.",
      "Comparer avec le cas parent isole si la composition familiale change.",
      "Tester aussi un loyer plus bas pour mesurer le reste a charge."
    ],
    "faq": [
      {
        "question": "Le chomage d'un couple avec enfant peut-il laisser un droit a l'APL ?",
        "answer": "Oui, surtout si le loyer reste significatif au regard des revenus de remplacement du foyer."
      },
      {
        "question": "Le premier enfant change-t-il l'estimation ?",
        "answer": "Il peut amÃ©liorer l'estimation, mais le niveau de revenus et le loyer retenu restent essentiels."
      }
    ]
  },
  {
    "slug": "apl-chomage-parent-isole-un-enfant",
    "intent": "apl chomage parent isole un enfant",
    "title": "APL au chomage pour un parent isole avec 1 enfant : estimation 2026",
    "description": "Estimation APL pour un parent isole avec un enfant et revenus en baisse lies au chomage.",
    "summary": "Cette page combine les motifs chomage, parent isole et enfant dans un angle distinct des pages deja en ligne.",
    "audience": "Parent isole avec un enfant en situation de chomage",
    "tags": [
      "chomage",
      "parent-isole",
      "1-enfant",
      "apl"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 1100,
      "loyer_mensuel": 740,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si l'enfant est bien comptabilise a charge.",
      "Comparer avec une reprise d'emploi si votre situation evolue bientot.",
      "Tester aussi une version sans revenu si la baisse de ressources se poursuit."
    ],
    "faq": [
      {
        "question": "Un parent isole au chomage peut-il encore toucher l'APL ?",
        "answer": "Oui, selon le loyer, la zone et les revenus retenus. La composition familiale peut rendre l'estimation plus favorable."
      },
      {
        "question": "Le chomage change-t-il fortement l'estimation APL ?",
        "answer": "Il peut modifier l'aide si les ressources retenues baissent, mais le logement reste un facteur decisif."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi-couple-sans-enfant",
    "intent": "apl reprise emploi couple sans enfant",
    "title": "APL en reprise d'emploi pour un couple sans enfant : estimation 2026",
    "description": "Scenario APL pour un couple sans enfant qui reprend une activite apres une baisse de revenus.",
    "summary": "Cette page etend le motif reprise d'emploi vers un foyer couple, sans dupliquer les pages deja existantes.",
    "audience": "Couple sans enfant en reprise d'emploi",
    "tags": [
      "reprise-emploi",
      "couple",
      "sans-enfant",
      "apl"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 1900,
      "loyer_mensuel": 760,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer la situation avant et apres reprise d'emploi.",
      "Verifier si les revenus d'activite sont stabilises ou encore progressifs.",
      "Tester aussi un cas avec un enfant si le foyer change."
    ],
    "faq": [
      {
        "question": "Une reprise d'emploi en couple fait-elle baisser l'APL rapidement ?",
        "answer": "Elle peut reduire l'aide, mais le loyer et le niveau exact des ressources continuent de piloter l'estimation."
      },
      {
        "question": "Faut-il refaire une simulation apres retour au travail ?",
        "answer": "Oui, car la transition entre inactivite, chomage et reprise d'emploi peut changer le resultat."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi-loyer-moyen",
    "intent": "apl reprise emploi loyer moyen",
    "title": "APL avec reprise d'emploi et loyer moyen : estimation 2026",
    "description": "Estimation APL pour une personne seule qui reprend une activite avec un loyer moyen.",
    "summary": "Cette page renforce le motif reprise d'emploi avec un angle loyer moyen plus naturel que le loyer eleve.",
    "audience": "Personne seule en reprise d'emploi avec loyer moyen",
    "tags": [
      "reprise-emploi",
      "loyer-moyen",
      "celibataire",
      "apl"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1280,
      "loyer_mensuel": 640,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec le cas loyer eleve deja en ligne.",
      "Verifier si vos revenus de reprise sont deja stabilises.",
      "Tester aussi une version personne seule au chomage pour mesurer l'ecart."
    ],
    "faq": [
      {
        "question": "Une reprise d'emploi avec loyer moyen laisse-t-elle encore un droit a l'APL ?",
        "answer": "Oui dans certains cas, surtout si le loyer reste significatif par rapport au revenu retenu."
      },
      {
        "question": "Pourquoi une page loyer moyen est-elle utile ?",
        "answer": "Parce qu'elle correspond mieux a une recherche pratique que des loyers extremes et donne un repere plus courant."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-trois-enfants",
    "intent": "apl parent isole trois enfants",
    "title": "APL parent isole avec 3 enfants : estimation 2026",
    "description": "Scenario APL pour un parent isole avec trois enfants et un logement familial.",
    "summary": "Cette page consolide le sous-cluster parent isole avec un angle familial plus fort et distinct.",
    "audience": "Parent isole avec trois enfants",
    "tags": [
      "parent-isole",
      "3-enfants",
      "famille",
      "apl"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 3,
      "revenus_mensuels": 1650,
      "loyer_mensuel": 980,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier le nombre exact d'enfants a charge retenus dans le foyer.",
      "Comparer avec le cas parent isole avec deux enfants deja present.",
      "Tester aussi une version logement social si le reste a charge devient trop fort."
    ],
    "faq": [
      {
        "question": "Trois enfants rendent-ils l'APL plus favorable pour un parent isole ?",
        "answer": "La composition familiale peut renforcer l'estimation, mais le revenu retenu et le loyer restent importants."
      },
      {
        "question": "Faut-il un loyer eleve pour garder une aide ?",
        "answer": "Pas forcement, mais le loyer retenu doit rester coherent avec la zone et la taille du foyer."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-logement-social",
    "intent": "apl parent isole logement social",
    "title": "APL parent isole en logement social : estimation 2026",
    "description": "Estimation APL pour un parent isole en logement social avec un enfant a charge.",
    "summary": "Cette page consolide le motif parent isole avec un angle logement social encore absent.",
    "audience": "Parent isole en logement social",
    "tags": [
      "parent-isole",
      "logement-social",
      "hlm",
      "apl"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 980,
      "loyer_mensuel": 520,
      "region": "province",
      "type_logement": "hlm",
      "economie": 0
    },
    "checklist": [
      "Verifier si le logement social est bien renseigne comme tel dans votre simulation.",
      "Comparer avec une location privee si vous etes en attente de mutation.",
      "Tester aussi une variante avec deux enfants si votre foyer est plus grand."
    ],
    "faq": [
      {
        "question": "Le logement social change-t-il beaucoup l'APL d'un parent isole ?",
        "answer": "Il peut changer le resultat via le niveau de loyer et le type de logement retenu."
      },
      {
        "question": "Un parent isole en HLM peut-il toujours percevoir l'APL ?",
        "answer": "Oui, dans de nombreux cas, surtout avec un revenu modeste et un enfant a charge."
      }
    ]
  },
  {
    "slug": "apl-famille-un-enfant-province",
    "intent": "apl famille un enfant province",
    "title": "APL famille avec 1 enfant en province : estimation 2026",
    "description": "Estimation APL pour une famille avec un enfant et un loyer courant en province.",
    "summary": "Cette page consolide le cluster famille avec un angle plus simple que les variantes tres ciblees existantes.",
    "audience": "Famille avec un enfant en province",
    "tags": [
      "famille",
      "1-enfant",
      "province",
      "couple"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 2200,
      "loyer_mensuel": 780,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec un couple sans enfant pour mesurer l'effet du foyer.",
      "Verifier si le loyer retenu est bien hors charges.",
      "Tester aussi une version Paris si vous comparez deux zones."
    ],
    "faq": [
      {
        "question": "Une famille avec un enfant en province peut-elle encore toucher l'APL ?",
        "answer": "Oui, selon le revenu du foyer, le loyer et la zone, une estimation utile reste frequente."
      },
      {
        "question": "Le premier enfant suffit-il a changer nettement l'estimation ?",
        "answer": "Il peut amÃ©liorer l'aide, mais le niveau de revenus et le loyer retenu restent trÃ¨s importants."
      }
    ]
  },
  {
    "slug": "apl-famille-deux-enfants-paris",
    "intent": "apl famille deux enfants paris",
    "title": "APL famille avec 2 enfants a Paris : estimation 2026",
    "description": "Scenario APL pour une famille avec deux enfants et un logement a Paris.",
    "summary": "Cette page consolide le sous-cluster famille avec un angle geographique distinct et defendable.",
    "audience": "Famille avec deux enfants a Paris",
    "tags": [
      "famille",
      "2-enfants",
      "paris",
      "idf"
    ],
    "input": {
      "situation": "couple",
      "enfants": 2,
      "revenus_mensuels": 2600,
      "loyer_mensuel": 1100,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Comparer avec la version province deja presente dans le cluster famille.",
      "Verifier si le logement parisien depasse le plafond retenu.",
      "Tester aussi une version avec trois enfants si la composition du foyer evolue."
    ],
    "faq": [
      {
        "question": "Deux enfants a Paris suffisent-ils a garder une APL ?",
        "answer": "Oui dans certains cas, mais le niveau de loyer parisien et les revenus du foyer influencent fortement le resultat."
      },
      {
        "question": "Paris change-t-il beaucoup l'ordre de grandeur ?",
        "answer": "Oui, car les plafonds de zone et les niveaux de loyer n'y sont pas comparables a ceux de la province."
      }
    ]
  },
  {
    "slug": "apl-famille-trois-enfants-paris",
    "intent": "apl famille trois enfants paris",
    "title": "APL famille avec 3 enfants a Paris : estimation 2026",
    "description": "Estimation APL pour une famille avec trois enfants et un loyer eleve a Paris.",
    "summary": "Cette page apporte un angle nettement distinct sur le motif famille nombreuse en zone tendue.",
    "audience": "Famille avec trois enfants a Paris",
    "tags": [
      "famille",
      "3-enfants",
      "paris",
      "idf"
    ],
    "input": {
      "situation": "couple",
      "enfants": 3,
      "revenus_mensuels": 2850,
      "loyer_mensuel": 1250,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier le nombre d'enfants retenus dans le calcul.",
      "Comparer avec la version famille trois enfants deja presente hors Paris.",
      "Tester aussi un logement social si vous comparez deux situations de logement."
    ],
    "faq": [
      {
        "question": "Une famille nombreuse a Paris peut-elle encore toucher l'APL ?",
        "answer": "Oui dans certains cas, mais le montant depend du revenu global, du loyer retenu et du plafond applicable."
      },
      {
        "question": "Le loyer parisien augmente-t-il toujours l'APL ?",
        "answer": "Non. Une fois le plafond de loyer atteint, la hausse du loyer ne se traduit pas automatiquement par plus d'aide."
      }
    ]
  },
  {
    "slug": "apl-smic-couple-deux-enfants",
    "intent": "apl smic couple deux enfants",
    "title": "APL au SMIC pour un couple avec 2 enfants : estimation 2026",
    "description": "Estimation APL pour un couple avec deux enfants et des revenus proches du SMIC cumule.",
    "summary": "Cette page cible un angle familial distinct avec un foyer a deux revenus modestes et deux enfants a charge.",
    "audience": "Couple avec deux enfants et revenus proches du SMIC",
    "tags": [
      "smic",
      "couple",
      "2-enfants",
      "apl"
    ],
    "input": {
      "situation": "couple",
      "enfants": 2,
      "revenus_mensuels": 2550,
      "loyer_mensuel": 880,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier le revenu mensuel total du foyer avant la simulation.",
      "Comparer avec la version couple sans enfant pour mesurer l'effet du foyer.",
      "Tester un scenario logement social si le loyer actuel est plus bas."
    ],
    "faq": [
      {
        "question": "Un couple au SMIC avec deux enfants peut-il toucher l'APL ?",
        "answer": "Oui, selon le loyer, la zone et les ressources retenues. Le foyer avec enfants peut conserver un droit dans plusieurs cas."
      },
      {
        "question": "Le deuxieme enfant change-t-il beaucoup l'estimation ?",
        "answer": "Il peut renforcer l'aide, mais le revenu du foyer et le loyer retenu restent determinants."
      }
    ]
  },
  {
    "slug": "apl-smic-parent-isole-trois-enfants",
    "intent": "apl smic parent isole trois enfants",
    "title": "APL au SMIC pour un parent isole avec 3 enfants : estimation 2026",
    "description": "Estimation APL pour un parent isole avec trois enfants et un revenu proche du SMIC.",
    "summary": "Cette page ouvre un angle fort sur la combinaison parent isole, SMIC et famille nombreuse.",
    "audience": "Parent isole avec trois enfants et revenu proche du SMIC",
    "tags": [
      "smic",
      "parent-isole",
      "3-enfants",
      "apl"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 3,
      "revenus_mensuels": 1580,
      "loyer_mensuel": 900,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si tous les enfants sont bien declares a charge.",
      "Comparer avec un scenario parent isole sans activite pour mesurer l'ecart.",
      "Tester aussi une version logement social."
    ],
    "faq": [
      {
        "question": "Un parent isole au SMIC avec trois enfants peut-il encore toucher l'APL ?",
        "answer": "Oui, cette situation peut garder un droit selon le loyer retenu et la zone du logement."
      },
      {
        "question": "Le type de logement change-t-il fortement le resultat ?",
        "answer": "Oui, car le niveau de loyer retenu et la categorie de logement peuvent modifier l'ordre de grandeur."
      }
    ]
  },
  {
    "slug": "apl-smic-colocation",
    "intent": "apl smic colocation",
    "title": "APL au SMIC en colocation : estimation 2026",
    "description": "Estimation APL pour une personne seule au SMIC en colocation avec quote-part de loyer.",
    "summary": "Cette page traite une intention frequente chez les jeunes actifs qui cumulent salaire modeste et colocation.",
    "audience": "Personne seule au SMIC en colocation",
    "tags": [
      "smic",
      "colocation",
      "personne-seule",
      "apl"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1500,
      "loyer_mensuel": 430,
      "region": "province",
      "type_logement": "colocation",
      "economie": 0
    },
    "checklist": [
      "Verifier votre quote-part de loyer reelle.",
      "Comparer avec un scenario location classique au meme revenu.",
      "Confirmer que le type de bail est bien renseigne."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL au SMIC en colocation ?",
        "answer": "Oui, selon votre part de loyer, vos ressources et la zone du logement."
      },
      {
        "question": "La colocation reduit-elle automatiquement l'APL ?",
        "answer": "Pas automatiquement. Tout depend du loyer retenu, des revenus et du type de bail."
      }
    ]
  },
  {
    "slug": "apl-smic-couple-logement-social",
    "intent": "apl smic couple logement social",
    "title": "APL au SMIC pour un couple en logement social : estimation 2026",
    "description": "Estimation APL pour un couple avec revenus modestes en logement social.",
    "summary": "Cette page relie le pattern SMIC au motif logement social avec un angle couple absent des pages actuelles.",
    "audience": "Couple au SMIC en logement social",
    "tags": [
      "smic",
      "couple",
      "logement-social",
      "apl"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 2400,
      "loyer_mensuel": 560,
      "region": "province",
      "type_logement": "hlm",
      "economie": 0
    },
    "checklist": [
      "Verifier le type de logement retenu.",
      "Comparer avec un couple en location privee au meme revenu.",
      "Tester avec un enfant si votre foyer evolue."
    ],
    "faq": [
      {
        "question": "Un couple au SMIC en HLM peut-il toucher l'APL ?",
        "answer": "Oui, cette situation peut ouvrir un droit selon les ressources et le loyer retenu."
      },
      {
        "question": "Le logement social suffit-il a garantir une aide ?",
        "answer": "Non, le calcul depend aussi du revenu du foyer et de la composition familiale."
      }
    ]
  },
  {
    "slug": "apl-loyer-500-personne-seule",
    "intent": "apl loyer 500 personne seule",
    "title": "APL avec loyer de 500 EUR pour une personne seule : estimation 2026",
    "description": "Estimation APL pour une personne seule avec un loyer de 500 EUR et revenus modestes.",
    "summary": "Cette page cible les requetes tres concretes basees sur un montant de loyer precis.",
    "audience": "Personne seule avec loyer de 500 EUR",
    "tags": [
      "loyer",
      "500",
      "personne-seule",
      "apl"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1200,
      "loyer_mensuel": 500,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier que le loyer est renseigne hors charges.",
      "Comparer avec un scenario a 600 EUR pour mesurer l'ecart.",
      "Tester aussi une variante avec revenus plus faibles."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL avec un loyer de 500 EUR ?",
        "answer": "Oui, selon vos ressources et votre zone. Ce type de loyer peut rester eligible dans plusieurs profils."
      },
      {
        "question": "Le montant de 500 EUR suffit-il pour estimer l'aide ?",
        "answer": "Non, il faut aussi prendre en compte vos revenus et la composition du foyer."
      }
    ]
  },
  {
    "slug": "apl-loyer-650-couple-sans-enfant",
    "intent": "apl loyer 650 couple sans enfant",
    "title": "APL avec loyer de 650 EUR pour un couple sans enfant : estimation 2026",
    "description": "Estimation APL pour un couple sans enfant avec un loyer de 650 EUR.",
    "summary": "Cette page renforce le pattern loyer precise sur un foyer couple sans enfant.",
    "audience": "Couple sans enfant avec loyer de 650 EUR",
    "tags": [
      "loyer",
      "650",
      "couple",
      "apl"
    ],
    "input": {
      "situation": "couple",
      "enfants": 0,
      "revenus_mensuels": 2100,
      "loyer_mensuel": 650,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier le total des revenus du foyer.",
      "Comparer avec un loyer de 750 EUR pour voir la sensibilite.",
      "Tester une variante avec un enfant si besoin."
    ],
    "faq": [
      {
        "question": "Un couple sans enfant peut-il avoir l'APL avec 650 EUR de loyer ?",
        "answer": "Oui, selon les revenus retenus et la zone, une estimation positive reste possible."
      },
      {
        "question": "Le statut du logement influence-t-il cette estimation ?",
        "answer": "Oui, location privee, social ou autre statut peuvent changer l'ordre de grandeur."
      }
    ]
  },
  {
    "slug": "apl-loyer-750-parent-isole-un-enfant",
    "intent": "apl loyer 750 parent isole un enfant",
    "title": "APL avec loyer de 750 EUR pour parent isole avec 1 enfant : estimation 2026",
    "description": "Estimation APL pour un parent isole avec un enfant et loyer de 750 EUR.",
    "summary": "Cette page associe un montant de loyer concret a un foyer monoparental frequemment recherche.",
    "audience": "Parent isole avec un enfant et loyer de 750 EUR",
    "tags": [
      "loyer",
      "750",
      "parent-isole",
      "1-enfant"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 1450,
      "loyer_mensuel": 750,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier le loyer hors charges.",
      "Comparer avec une version logement social.",
      "Tester un scenario avec deux enfants si votre foyer est plus grand."
    ],
    "faq": [
      {
        "question": "Un parent isole avec un enfant peut-il toucher l'APL avec 750 EUR de loyer ?",
        "answer": "Oui, selon les ressources et la zone, ce cas peut garder une estimation utile."
      },
      {
        "question": "Le revenu mensuel change-t-il fortement l'aide dans ce cas ?",
        "answer": "Oui, une variation de revenu peut modifier sensiblement le resultat final."
      }
    ]
  },
  {
    "slug": "apl-loyer-1000-couple-deux-enfants",
    "intent": "apl loyer 1000 couple deux enfants",
    "title": "APL avec loyer de 1000 EUR pour un couple avec 2 enfants : estimation 2026",
    "description": "Estimation APL pour une famille avec deux enfants et un loyer de 1000 EUR.",
    "summary": "Cette page vise un angle familial a loyer eleve pour capter une demande concrÃ¨te sur le budget logement.",
    "audience": "Couple avec deux enfants et loyer de 1000 EUR",
    "tags": [
      "loyer",
      "1000",
      "couple",
      "2-enfants"
    ],
    "input": {
      "situation": "couple",
      "enfants": 2,
      "revenus_mensuels": 2700,
      "loyer_mensuel": 1000,
      "region": "idf",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier le loyer retenu dans la zone.",
      "Comparer avec un scenario province pour le meme foyer.",
      "Tester avec un revenu legerement plus bas si besoin."
    ],
    "faq": [
      {
        "question": "Un loyer de 1000 EUR avec deux enfants peut-il rester compatible avec l'APL ?",
        "answer": "Oui dans certains cas, selon le revenu du foyer et la zone du logement."
      },
      {
        "question": "Le passage en Ile-de-France change-t-il la lecture ?",
        "answer": "Oui, les plafonds de zone et le loyer retenu rendent la comparaison utile."
      }
    ]
  },
  {
    "slug": "apl-chomage-personne-seule-sans-enfant",
    "intent": "apl chomage personne seule sans enfant",
    "title": "APL au chomage pour une personne seule sans enfant : estimation 2026",
    "description": "Estimation APL pour une personne seule sans enfant avec revenus de chomage.",
    "summary": "Cette page affine l'angle chomage avec une formulation explicite sans enfant pour une intention plus nette.",
    "audience": "Personne seule sans enfant au chomage",
    "tags": [
      "chomage",
      "personne-seule",
      "sans-enfant",
      "apl"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 980,
      "loyer_mensuel": 620,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier les revenus reellement retenus sur la periode.",
      "Comparer avec un scenario reprise d'emploi.",
      "Tester aussi un loyer plus bas pour mesurer la variation."
    ],
    "faq": [
      {
        "question": "Au chomage, une personne seule sans enfant peut-elle toucher l'APL ?",
        "answer": "Oui, selon le loyer et les revenus retenus, cette situation peut garder un droit."
      },
      {
        "question": "Pourquoi preciser sans enfant dans la page ?",
        "answer": "Parce que la composition du foyer influence le calcul et la precision de la recherche."
      }
    ]
  },
  {
    "slug": "apl-chomage-parent-isole-deux-enfants",
    "intent": "apl chomage parent isole deux enfants",
    "title": "APL au chomage pour parent isole avec 2 enfants : estimation 2026",
    "description": "Estimation APL pour un parent isole avec deux enfants en situation de chomage.",
    "summary": "Cette page etend le pattern chomage parent isole avec un foyer plus large et un angle distinct.",
    "audience": "Parent isole avec deux enfants au chomage",
    "tags": [
      "chomage",
      "parent-isole",
      "2-enfants",
      "apl"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 2,
      "revenus_mensuels": 1050,
      "loyer_mensuel": 790,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier les enfants declares a charge.",
      "Comparer avec un cas un enfant pour evaluer l'ecart.",
      "Tester un scenario logement social."
    ],
    "faq": [
      {
        "question": "Un parent isole au chomage avec deux enfants peut-il garder l'APL ?",
        "answer": "Oui, ce profil peut conserver une aide selon le loyer retenu et les ressources."
      },
      {
        "question": "La baisse de revenus suffit-elle toujours a augmenter l'aide ?",
        "answer": "Pas toujours, car le loyer retenu et les plafonds de zone restent structurants."
      }
    ]
  },
  {
    "slug": "apl-chomage-loyer-700-personne-seule",
    "intent": "apl chomage loyer 700 personne seule",
    "title": "APL au chomage avec loyer de 700 EUR pour une personne seule : estimation 2026",
    "description": "Estimation APL pour une personne seule au chomage avec un loyer de 700 EUR.",
    "summary": "Cette page combine intention chomage et loyer chiffre, un motif concret a fort potentiel CTR.",
    "audience": "Personne seule au chomage avec loyer de 700 EUR",
    "tags": [
      "chomage",
      "loyer-700",
      "personne-seule",
      "apl"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 950,
      "loyer_mensuel": 700,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier le loyer saisi hors charges.",
      "Comparer avec un loyer de 600 EUR si votre situation varie.",
      "Tester aussi la reprise d'emploi pour anticiper la suite."
    ],
    "faq": [
      {
        "question": "Avec 700 EUR de loyer au chomage, peut-on toucher l'APL ?",
        "answer": "Oui dans certains cas, selon les ressources retenues et la zone du logement."
      },
      {
        "question": "Le montant de loyer est-il plus important que le revenu ?",
        "answer": "Les deux comptent, mais l'estimation depend d'un equilibre entre loyer retenu, zone et ressources."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi-personne-seule-loyer-700",
    "intent": "apl reprise emploi personne seule loyer 700",
    "title": "APL en reprise d'emploi avec loyer de 700 EUR : personne seule, estimation 2026",
    "description": "Estimation APL pour une personne seule qui reprend un emploi avec un loyer de 700 EUR.",
    "summary": "Cette page cible la transition reprise d'emploi avec un repere de loyer concret.",
    "audience": "Personne seule en reprise d'emploi avec loyer de 700 EUR",
    "tags": [
      "reprise-emploi",
      "personne-seule",
      "loyer-700",
      "apl"
    ],
    "input": {
      "situation": "seul",
      "enfants": 0,
      "revenus_mensuels": 1320,
      "loyer_mensuel": 700,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier si les revenus de reprise sont stables.",
      "Comparer avec un scenario au chomage pour mesurer la transition.",
      "Tester un loyer plus bas si vous envisagez un demenagement."
    ],
    "faq": [
      {
        "question": "En reprise d'emploi avec 700 EUR de loyer, l'APL peut-elle rester positive ?",
        "answer": "Oui, selon le niveau de revenus retenus et la zone de logement."
      },
      {
        "question": "Faut-il actualiser souvent la simulation en reprise d'emploi ?",
        "answer": "Oui, car les revenus peuvent evoluer rapidement pendant cette phase."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi-parent-isole-un-enfant",
    "intent": "apl reprise emploi parent isole un enfant",
    "title": "APL en reprise d'emploi pour parent isole avec 1 enfant : estimation 2026",
    "description": "Estimation APL pour un parent isole avec un enfant qui reprend une activite.",
    "summary": "Cette page traite la transition emploi pour un foyer monoparental avec un angle tres actionnable.",
    "audience": "Parent isole avec un enfant en reprise d'emploi",
    "tags": [
      "reprise-emploi",
      "parent-isole",
      "1-enfant",
      "apl"
    ],
    "input": {
      "situation": "monoparental",
      "enfants": 1,
      "revenus_mensuels": 1420,
      "loyer_mensuel": 760,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier la date de reprise d'emploi et les revenus declares.",
      "Comparer avec un scenario parent isole au chomage.",
      "Tester un cas avec deux enfants si votre foyer change."
    ],
    "faq": [
      {
        "question": "Un parent isole qui reprend un emploi peut-il garder l'APL ?",
        "answer": "Oui dans certains cas, surtout si le loyer reste significatif face au revenu."
      },
      {
        "question": "La reprise d'emploi coupe-t-elle automatiquement l'aide ?",
        "answer": "Non, l'effet depend du revenu retenu, du loyer et de la composition familiale."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi-couple-un-enfant",
    "intent": "apl reprise emploi couple un enfant",
    "title": "APL en reprise d'emploi pour un couple avec 1 enfant : estimation 2026",
    "description": "Estimation APL pour un couple avec un enfant en reprise d'emploi.",
    "summary": "Cette page ajoute un angle reprise d'emploi familial non couvert par les pages deja lancees.",
    "audience": "Couple avec un enfant en reprise d'emploi",
    "tags": [
      "reprise-emploi",
      "couple",
      "1-enfant",
      "apl"
    ],
    "input": {
      "situation": "couple",
      "enfants": 1,
      "revenus_mensuels": 2350,
      "loyer_mensuel": 860,
      "region": "province",
      "type_logement": "location",
      "economie": 0
    },
    "checklist": [
      "Verifier les revenus des deux adultes.",
      "Comparer avec le cas couple sans enfant en reprise d'emploi.",
      "Tester aussi un scenario loyer plus bas."
    ],
    "faq": [
      {
        "question": "Un couple avec un enfant en reprise d'emploi peut-il conserver l'APL ?",
        "answer": "Oui, selon les revenus retenus, le loyer et la zone de logement."
      },
      {
        "question": "Pourquoi comparer avec le cas sans enfant ?",
        "answer": "La composition familiale change les parametres de calcul et aide a mieux lire le resultat."
      }
    ]
  },
  {
    "slug": "apl-famille-deux-enfants-logement-social",
    "intent": "apl famille deux enfants logement social",
    "title": "APL famille avec 2 enfants en logement social : estimation 2026",
    "description": "Estimation APL pour une famille avec deux enfants en logement social.",
    "summary": "Cette page consolide le sous-cluster famille en ajoutant l'angle logement social.",
    "audience": "Famille avec deux enfants en logement social",
    "tags": [
      "famille",
      "2-enfants",
      "logement-social",
      "apl"
    ],
    "input": {
      "situation": "couple",
      "enfants": 2,
      "revenus_mensuels": 2300,
      "loyer_mensuel": 620,
      "region": "province",
      "type_logement": "hlm",
      "economie": 0
    },
    "checklist": [
      "Verifier le type de logement social dans le formulaire.",
      "Comparer avec une location privee de meme surface.",
      "Tester un scenario avec trois enfants si besoin."
    ],
    "faq": [
      {
        "question": "Une famille avec deux enfants en logement social peut-elle toucher l'APL ?",
        "answer": "Oui, selon les ressources du foyer et le loyer retenu."
      },
      {
        "question": "Le logement social garantit-il une aide elevee ?",
        "answer": "Pas forcement, le montant depend aussi des revenus et de la composition familiale."
      }
    ]
  }
];
