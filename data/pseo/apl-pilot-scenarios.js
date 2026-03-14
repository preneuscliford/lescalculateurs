export const aplPilotScenarios = [
  {
    "slug": "apl-etudiant-paris",
    "intent": "apl etudiant paris",
    "title": "APL ?tudiant  ? Paris : estimation 2026",
    "description": "Sc?nario APL pour un ?tudiant  ? Paris avec un loyer ?lev? et peu de revenus.",
    "summary": "Cette page cible une intention forte chez les ?tudiants qui cherchent un ordre de grandeur rapide avant une simulation compl?te.",
    "audience": "?tudiant en location priv?e  ? Paris",
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
      "V?rifier si le logement est conventionn? ou non.",
      "Confirmer les revenus r?ellement pris en compte par la CAF.",
      "Comparer avec un sc?nario CROUS ou colocation si besoin."
    ],
    "faq": [
      {
        "question": "Un ?tudiant  ? Paris peut-il toucher l'APL ?",
        "answer": "Oui, sous conditions de logement et de ressources. Le niveau de loyer reste important, mais le plafond de zone limite le montant retenu."
      },
      {
        "question": "Un job ?tudiant fait-il baisser l'APL ?",
        "answer": "Oui, les revenus peuvent r?duire l'aide. Il est utile de tester plusieurs niveaux de salaire mensuel si vous travaillez en parall?le."
      }
    ]
  },
  {
    "slug": "apl-etudiant-lyon",
    "intent": "apl etudiant lyon",
    "title": "APL ?tudiant  ? Lyon : estimation 2026",
    "description": "Exemple de simulation APL pour un ?tudiant locataire  ? Lyon.",
    "summary": "Cette page vise les recherches ?tudiantes hors Paris avec une pression locative toujours forte mais plus mod?r?e qu'en ?le-de-France.",
    "audience": "?tudiant locataire  ? Lyon",
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
      "V?rifier si le loyer retenu est bien hors charges.",
      "Comparer avec une colocation si le budget est serr?.",
      "Tester aussi une r?sidence etudiante si ce type de logement est envisage."
    ],
    "faq": [
      {
        "question": "L'APL etudiante est-elle diff?rente  ? Lyon et  ? Paris ?",
        "answer": "La logique de calcul reste la m?me, mais le plafond de loyer d?pend de la zone. Le montant retenu n'est donc pas identique."
      },
      {
        "question": "Faut-il d?clarer les aides familiales pour l'APL ?",
        "answer": "Cela d?pend de la nature de l'aide. La v?rification finale doit toujours ?tre faite avec les r?gles de la CAF."
      }
    ]
  },
  {
    "slug": "apl-etudiant-colocation",
    "intent": "apl etudiant colocation",
    "title": "APL ?tudiant en colocation : estimation 2026",
    "description": "Cas pratique d APL pour un ?tudiant en colocation avec quote-part de loyer.",
    "summary": "Cette page r?pond a une recherche fr?quente chez les ?tudiants qui mutualisent leur logement pour r?duire le reste  ? charge.",
    "audience": "?tudiant en colocation",
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
      "V?rifier si le bail est individuel ou collectif.",
      "Conserver une trace claire de votre quote-part de loyer.",
      "Comparer avec une location classique pour mesurer l ecart."
    ],
    "faq": [
      {
        "question": "L'APL en colocation est-elle calculee par personne ?",
        "answer": "Oui, chaque situation est examinee individuellement. Le loyer retenu correspond en general a votre part r?elle."
      },
      {
        "question": "Une colocation reduit-elle automatiquement l'APL ?",
        "answer": "Pas automatiquement. Tout d?pend de la part de loyer, des revenus et du type de bail d?clar?."
      }
    ]
  },
  {
    "slug": "apl-celibataire-paris-petit-revenu",
    "intent": "apl celibataire paris",
    "title": "APL c?libataire  ? Paris avec petit revenu : estimation 2026",
    "description": "Estimation APL pour une personne seule  ? Paris avec un revenu modeste.",
    "summary": "Cette page couvre une requ?te centrale du cluster APL urbain, avec un vrai enjeu de budget logement en zone tendue.",
    "audience": "C?libataire  ? Paris avec petit revenu",
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
      "V?rifier que le loyer retenu est bien le loyer hors charges.",
      "Tester une variante avec revenus variables si vous avez des primes.",
      "Comparer avec un sc?nario province si vous envisagez de d?m?nager."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL  ? Paris en ?tant seul ?",
        "answer": "Oui, mais le calcul d?pend fortement du revenu et du plafond de loyer applicable ? la zone francilienne."
      },
      {
        "question": "Le reste  ? charge reste-t-il ?lev?  ? Paris m?me avec l'APL ?",
        "answer": "Souvent oui. L'APL aide a absorber une partie du co?t, mais le plafond de loyer limite l'effet de l'aide."
      }
    ]
  },
  {
    "slug": "apl-celibataire-smic",
    "intent": "apl smic celibataire",
    "title": "APL au SMIC pour un c?libataire : estimation 2026",
    "description": "Sc?nario APL d'une personne seule au SMIC avec un loyer moyen.",
    "summary": "Cette page sert une requ?te tr?s claire : savoir si un salaire proche du SMIC laisse encore un droit ? l'APL.",
    "audience": "C?libataire au SMIC",
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
      "V?rifier votre salaire net r?el sur les mois retenus.",
      "Comparer un loyer ? 550 EUR et ? 700 EUR.",
      "Tester aussi un sc?nario avec prime d'activit? en parall?le."
    ],
    "faq": [
      {
        "question": "Peut-on encore toucher l'APL avec un salaire au SMIC ?",
        "answer": "Oui dans certains cas, surtout si le loyer reste significatif par rapport au revenu. Le montant peut toutefois baisser assez vite."
      },
      {
        "question": "Le type de contrat change-t-il le calcul'APL ?",
        "answer": "Pas directement. Ce sont d'abord les ressources retenues et le logement qui pilotent l'estimation."
      }
    ],
    "pilotProduct": {
      "variants": [
        {
          "label": "Tester avec un loyer de 500 EUR",
          "description": "Comparer avec un loyer plus bas pour voir si le reste  ? charge change nettement.",
          "href": "/pages/apl/apl-loyer-500-revenu-900"
        },
        {
          "label": "Tester avec un loyer de 700 EUR",
          "description": "Voir l'impact d'un loyer un peu plus ?lev? a revenu proche.",
          "href": "/pages/apl/apl-cdi-loyer-700"
        },
        {
          "label": "Comparer avec une personne seule au ch?mage",
          "description": "Mesurer l'effet d'une baisse de revenus sur l'estimation APL.",
          "href": "/pages/apl/apl-chomage-loyer-moyen"
        }
      ],
      "drivers": [
        {
          "title": "Le loyer retenu dans la limite du plafond",
          "description": "Un loyer plus ?lev? n'augmente pas toujours l'aide de la m?me facon, car la CAF retient un plafond selon la zone."
        },
        {
          "title": "Le niveau r?el de revenus retenus",
          "description": "Deux personnes proches du SMIC peuvent obtenir des r?sultats diff?rents selon les revenus effectivement retenus sur la p?riode de r?f?rence."
        },
        {
          "title": "Les aides et revenus qui se cumulent",
          "description": "Une prime d'activit?, des primes variables ou une reprise d'emploi peuvent modifier l'estimation finale."
        },
        {
          "title": "La zone g?ographique du logement",
          "description": "? loyer comparable, une grande ville ou une zone plus tendue peut changer le loyer retenu et donc le montant estime."
        }
      ],
      "comparisonLinks": [
        {
          "label": "APL avec petit loyer et revenu modeste",
          "href": "/pages/apl/apl-loyer-500-revenu-900"
        },
        {
          "label": "APL en cas de ch?mage avec loyer moyen",
          "href": "/pages/apl/apl-chomage-loyer-moyen"
        },
        {
          "label": "APL c?libataire  ? Paris avec petit revenu",
          "href": "/pages/apl/apl-celibataire-paris-petit-revenu"
        },
        {
          "label": "Ouvrir le simulateur APL complet",
          "href": "/pages/apl"
        }
      ],
      "journey": [
        "Comparez d'abord votre loyer r?el avec le sc?nario affich?.",
        "V?rifiez ensuite si vos revenus varient d'un mois  ? l'autre ou si vous percevez d'autres aides.",
        "Lancez enfin une simulation compl?te pour approcher votre situation exacte."
      ]
    }
  },
  {
    "slug": "apl-celibataire-loyer-eleve",
    "intent": "apl loyer eleve personne seule",
    "title": "APL avec loyer eleve pour une personne seule : estimation 2026",
    "description": "Cas APL d'une personne seule avec un loyer sup?rieur au plafond de zone.",
    "summary": "Cette page r?pond a une frustration tr?s fr?quente : comprendre pourquoi un loyer ?lev? ne se traduit pas toujours par une aide plus forte.",
    "audience": "Personne seule avec loyer ?lev?",
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
      "V?rifier le plafond de loyer applicable ? votre zone.",
      "Tester une solution colocation si le reste  ? charge devient trop fort.",
      "Ne pas supposer que tout le loyer sera retenu dans le calcul."
    ],
    "faq": [
      {
        "question": "Pourquoi mon loyer n'est-il pas retenu en totalit? ?",
        "answer": "Le calcul'APL applique un plafond de loyer. Au-del?, la partie excedentaire n'augmente plus l'aide."
      },
      {
        "question": "Un loyer plus cher donne-t-il toujours plus d APL ?",
        "answer": "Non. Une fois le plafond atteint, le gain disparait alors que votre reste  ? charge continue d augmenter."
      }
    ]
  },
  {
    "slug": "apl-celibataire-marseille",
    "intent": "apl marseille celibataire",
    "title": "APL c?libataire  ? Marseille : estimation 2026",
    "description": "Simulation type pour une personne seule  ? Marseille avec loyer interm?diaire.",
    "summary": "Cette page couvre une grande ville de province avec une requ?te g?olocalis?e claire et une tension locative concr?te.",
    "audience": "C?libataire  ? Marseille",
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
      "V?rifier la part de charges exclue du loyer retenu.",
      "Tester une variante avec revenu ? 1300 EUR si votre activit? ?volue."
    ],
    "faq": [
      {
        "question": "L'APL  ? Marseille suit-elle la m?me logique qu ailleurs ?",
        "answer": "Oui, avec un plafond adapte ? la zone province. La ville change surtout le niveau de loyer observe dans la pratique."
      },
      {
        "question": "Faut-il un code postal pour simuler l'APL ?",
        "answer": "Le code postal'aide a affiner la zone exacte dans les outils complets. Cette page donne seulement un sc?nario type."
      }
    ]
  },
  {
    "slug": "apl-celibataire-toulouse",
    "intent": "apl toulouse celibataire",
    "title": "APL c?libataire  ? Toulouse : estimation 2026",
    "description": "Exemple APL pour un actif ou un ?tudiant seul  ? Toulouse.",
    "summary": "Cette page couvre une ville universitaire et active avec une vraie demande sur le logement locatif.",
    "audience": "Personne seule  ? Toulouse",
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
      "V?rifier la r?gularit? des revenus si vous ?tes en mission ou en alternance.",
      "Comparer avec un sc?nario colocation dans un quartier ?tudiant.",
      "Tester un loyer a 650 EUR si vous visez un T2."
    ],
    "faq": [
      {
        "question": "Une personne seule  ? Toulouse peut-elle toucher l'APL ?",
        "answer": "Oui, surtout avec un revenu modeste et un loyer encore compatible avec les plafonds de zone."
      },
      {
        "question": "Un T1 ou un T2 change-t-il beaucoup l'APL ?",
        "answer": "Indirectement, via le loyer. Le calcul ne d?pend pas directement de la surface mais du montant retenu."
      }
    ]
  },
  {
    "slug": "apl-loyer-500-revenu-900",
    "intent": "apl loyer 500 revenu 900",
    "title": "APL avec 900 EUR de revenus et 500 EUR de loyer : estimation 2026",
    "description": "Sc?nario budgetaire pour un revenu modeste avec un loyer encore contenu.",
    "summary": "Cette page garde un angle chiffres tout en r?pondant a une question concr?te de budget logement.",
    "audience": "Locataire seul avec budget serr?",
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
      "V?rifier si le loyer de 500 EUR est bien indiqu? hors charges.",
      "Comparer avec un revenu a 800 EUR ou 1000 EUR.",
      "Tester aussi une version colocation si besoin."
    ],
    "faq": [
      {
        "question": "Avec 900 EUR de revenus peut-on encore toucher une bonne APL ?",
        "answer": "Souvent oui si le loyer reste significatif. Le montant exact d?pend toutefois de la zone et du logement."
      },
      {
        "question": "Pourquoi utiliser une page sc?nario plutot qu'un calcul unique ?",
        "answer": "Parce qu'elle donne un ordre de grandeur rapide, puis oriente vers le simulateur complet pour affiner la situation."
      }
    ]
  },
  {
    "slug": "apl-loyer-800-revenu-1300",
    "intent": "apl loyer 800 revenu 1300",
    "title": "APL avec 1300 EUR de revenus et 800 EUR de loyer : estimation 2026",
    "description": "Sc?nario de tension budgetaire avec un loyer ?lev? par rapport au revenu.",
    "summary": "Cette page r?pond a une vraie question de locataire : savoir si un loyer important laisse encore une aide utile.",
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
      "V?rifier si le logement d?passe le plafond de loyer applicable.",
      "Comparer avec un loyer ? 700 EUR ou 900 EUR.",
      "Tester un sc?nario studio ou colocation."
    ],
    "faq": [
      {
        "question": "Un loyer de 800 EUR avec 1300 EUR de revenus laisse-t-il un droit ?",
        "answer": "Souvent oui en th?orie, mais le plafond de loyer limite vite le gain. Le reste  ? charge reste un critere central."
      },
      {
        "question": "Pourquoi ce type de sc?nario est-il utile ?",
        "answer": "Parce qu'il r?pond a une vraie question budgetaire avant une signature de bail ou un changement de logement."
      }
    ]
  },
  {
    "slug": "apl-cdi-loyer-700",
    "intent": "apl cdi loyer 700",
    "title": "APL avec CDI et loyer de 700 EUR : estimation 2026",
    "description": "Exemple APL pour un salari? en CDI avec un loyer autour de 700 EUR.",
    "summary": "Cette page vise une requ?te tr?s concr?te sur le rapport entre salaire stable et niveau de loyer.",
    "audience": "Salari? en CDI",
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
      "V?rifier si vos primes ou heures suppl?mentaires gonflent le revenu retenu.",
      "Comparer avec un loyer a 650 EUR ou 750 EUR.",
      "Tester aussi un sc?nario avec prime d'activit?."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL en CDI ?",
        "answer": "Oui. Le type de contrat ne bloque pas l'APL. Ce sont surtout le revenu et le loyer qui comptent."
      },
      {
        "question": "? partir de quel salaire le droit disparait-il ?",
        "answer": "Il n'existe pas de seuil unique. Tout d?pend de la zone, de la composition du foyer et du loyer retenu."
      }
    ]
  },
  {
    "slug": "apl-cdd-loyer-600",
    "intent": "apl cdd loyer 600",
    "title": "APL avec CDD et loyer de 600 EUR : estimation 2026",
    "description": "Sc?nario APL d'un salari? en CDD avec revenus modestes et loyer moyen.",
    "summary": "Cette page couvre une recherche plausible dans les phases d'emploi plus instable ou de transition.",
    "audience": "Salari? en CDD",
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
      "V?rifier la moyenne de revenus si vous avez des mois incomplets.",
      "Comparer avec un sc?nario ch?mage si votre contrat se termine.",
      "Tester un logement ? 550 EUR puis a 650 EUR."
    ],
    "faq": [
      {
        "question": "Le CDD donne-t-il plus d APL qu'un CDI ?",
        "answer": "Non. Ce n'est pas le contrat qui pilote l'aide, mais les ressources retenues et les caract?ristiques du logement."
      },
      {
        "question": "Comment simuler si mes revenus changent souvent ?",
        "answer": "Il faut tester plusieurs sc?narios repr?sentatifs plutot que supposer un revenu fixe sur toute l ann?e."
      }
    ]
  },
  {
    "slug": "apl-chomage-loyer-moyen",
    "intent": "apl chomage loyer moyen",
    "title": "APL au chomage avec loyer moyen : estimation 2026",
    "description": "Simulation APL d'une personne seule en p?riode de ch?mage avec loyer standard.",
    "summary": "Cette page traite une intention sensible liee a la baisse de revenus et a la gestion du reste  ? charge.",
    "audience": "Personne au ch?mage",
    "tags": [
      "chmage",
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
        "question": "Le ch?mage augmente-t-il l'APL ?",
        "answer": "Une baisse de revenus peut rendre l'aide plus favorable. Il faut toutefois int?grer correctement les indemnit?s retenues."
      },
      {
        "question": "L'APL au ch?mage suffit-elle pour compenser le loyer ?",
        "answer": "Rarement ? elle seule. Elle peut r?duire le reste  ? charge, mais ne remplace pas un budget logement complet."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi",
    "intent": "apl reprise emploi",
    "title": "APL apres une reprise d'emploi : estimation 2026",
    "description": "Exemple d impact d'une reprise d'activit? sur l'APL.",
    "summary": "Cette page traite une situation ?volutive utile pour les foyers qui sortent d'une p?riode de ch?mage ou d inactivit?.",
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
      "Comparer l avant et l apr?s reprise d'activit?.",
      "V?rifier si d'autres aides prennent le relais.",
      "Tester plusieurs niveaux de salaire si la reprise est progressive."
    ],
    "faq": [
      {
        "question": "La reprise d'emploi fait-elle baisser l'APL ?",
        "answer": "Souvent oui a terme, car les revenus augmentent. L'effet exact d?pend du loyer et de la zone."
      },
      {
        "question": "Faut-il prevenir la CAF rapidement apr?s reprise d'emploi ?",
        "answer": "Oui, pour garder un dossier coh?rent avec votre situation r?elle et ?viter un d?calage entre droits et ressources."
      }
    ]
  },
  {
    "slug": "apl-jeune-actif-premier-logement",
    "intent": "apl jeune actif premier logement",
    "title": "APL jeune actif pour un premier logement : estimation 2026",
    "description": "Cas pratique d APL pour un jeune actif qui prend son premier appartement.",
    "summary": "Cette page cible une requ?te de d?but de parcours locatif, utile pour capter les nouveaux entrants sur le march?.",
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
      "V?rifier la date d entr?e dans le logement.",
      "Tester un sc?nario avec salaire d essai ou revenu variable.",
      "Comparer avec une colocation si le budget est trop tendu."
    ],
    "faq": [
      {
        "question": "Un jeune actif peut-il toucher l'APL d?s son premier logement ?",
        "answer": "Oui si les conditions de logement et de ressources sont remplies. Le premier bail ne bloque pas l'aide."
      },
      {
        "question": "Le salaire du premier emploi supprime-t-il vite l'APL ?",
        "answer": "Cela d?pend du niveau de loyer. Un revenu modeste peut encore laisser une aide partielle pendant un temps."
      }
    ]
  },
  {
    "slug": "apl-alternant",
    "intent": "apl alternant",
    "title": "APL alternant : estimation 2026",
    "description": "Estimation APL pour un alternant avec revenu regulier mais modeste.",
    "summary": "Cette page couvre une requ?te fr?quente chez les jeunes actifs en formation et en entr?e dans la vie professionnelle.",
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
      "V?rifier si vos revenus d alternance varient selon les mois.",
      "Comparer avec un sc?nario ?tudiant si votre statut reste proche.",
      "Tester aussi une r?sidence partagee ou une colocation."
    ],
    "faq": [
      {
        "question": "Un alternant peut-il cumuler salaire et APL ?",
        "answer": "Oui, mais le salaire est pris en compte dans les ressources. Il faut donc mesurer son effet sur l'aide."
      },
      {
        "question": "Alternant et ?tudiant ont-ils la m?me APL ?",
        "answer": "La logique est proche, mais la structure des revenus peut modifier le r?sultat."
      }
    ]
  },
  {
    "slug": "apl-apprenti",
    "intent": "apl apprenti",
    "title": "APL apprenti : estimation 2026",
    "description": "Sc?nario APL pour un apprenti avec petit salaire et loyer mod?r?.",
    "summary": "Cette page cible une intention pr?cise souvent recherch?e avec une concurrence encore raisonnable.",
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
      "V?rifier le revenu net r?el verse par l employeur.",
      "Comparer avec un sc?nario alternance si votre statut est hybride.",
      "Tester aussi un sc?nario en r?sidence si vous ?tes h?berg? en foyer."
    ],
    "faq": [
      {
        "question": "Un apprenti a-t-il droit ? l'APL ?",
        "answer": "Oui, sous conditions de logement et de ressources. Les revenus modestes de l apprentissage peuvent laisser une aide."
      },
      {
        "question": "Le contrat d apprentissage change-t-il le calcul ?",
        "answer": "Le statut ne suffit pas a lui seul. Ce sont surtout les revenus et le logement qui determinent l'estimation."
      }
    ]
  },
  {
    "slug": "apl-colocation-jeune-actif",
    "intent": "apl colocation jeune actif",
    "title": "APL jeune actif en colocation : estimation 2026",
    "description": "Cas APL pour un jeune actif en colocation avec revenu modeste.",
    "summary": "Cette page sert un besoin tr?s concret sur les premiers logements urbains et la gestion du reste  ? charge.",
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
      "V?rifier la quote-part de loyer mentionnee au bail.",
      "Tester une variante avec revenu a 1400 EUR.",
      "Comparer avec un studio si vous h?sitez entre les deux."
    ],
    "faq": [
      {
        "question": "La colocation reste-t-elle int?ressante avec l'APL ?",
        "answer": "Oui si elle reduit suffisamment le reste  ? charge. Il faut raisonner sur votre part de loyer et non sur le loyer total."
      },
      {
        "question": "Un jeune actif en colocation doit-il d?clarer le loyer total ?",
        "answer": "Non, la logique porte sur votre quote-part r?elle ou sur ce que le bail permet de justifier."
      }
    ]
  },
  {
    "slug": "apl-hlm-petit-revenu",
    "intent": "apl hlm petit revenu",
    "title": "APL en HLM avec petit revenu : estimation 2026",
    "description": "Exemple APL pour un foyer modeste loge en HLM.",
    "summary": "Cette page r?pond a une intention claire autour d'un type de logement tr?s fr?quent dans les recherches APL.",
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
      "V?rifier le montant du loyer net retenu sur l'avis de paiement.",
      "Tester une variante couple ou parent isol? si la composition du foyer change.",
      "Comparer avec un logement priv? au m?me niveau de loyer."
    ],
    "faq": [
      {
        "question": "L'APL est-elle plus simple en HLM ?",
        "answer": "Le type de logement peut clarifier certains param?tres, mais le revenu et la composition du foyer restent decisifs."
      },
      {
        "question": "Un petit loyer signifie-t-il forc?ment une petite APL ?",
        "answer": "Pas toujours, mais un loyer plus faible limite mecaniquement la base de calcul de l'aide."
      }
    ]
  },
  {
    "slug": "apl-petite-surface-paris",
    "intent": "apl studio paris",
    "title": "APL pour un studio  ? Paris : estimation 2026",
    "description": "Exemple APL pour une petite surface parisienne avec revenu limite.",
    "summary": "Cette page vise les recherches sur les studios parisiens, tr?s fr?quentes chez les jeunes actifs et les ?tudiants.",
    "audience": "Locataire d'un studio  ? Paris",
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
      "V?rifier que le loyer est bien renseign? hors charges.",
      "Comparer avec une chambre ou une colocation.",
      "Tester un revenu a 800 EUR puis a 1200 EUR."
    ],
    "faq": [
      {
        "question": "Peut-on toucher l'APL pour un studio  ? Paris ?",
        "answer": "Oui, surtout avec des revenus modestes. Le calcul reste toutefois limite par le plafond de loyer de la zone."
      },
      {
        "question": "Studio et chambre donnent-ils la m?me APL ?",
        "answer": "Pas forc?ment. Le r?sultat d?pend du loyer d?clar? et des caract?ristiques du logement."
      }
    ]
  },
  {
    "slug": "apl-couple-paris",
    "intent": "apl couple paris",
    "title": "APL pour un couple  ? Paris : estimation 2026",
    "description": "Cas pratique d'un couple parisien avec loyer francilien et revenus intermediaires.",
    "summary": "Cette page couvre une requ?te g?olocalis?e couple plus loyer tendu, fr?quente sur les budgets de d?but de vie commune.",
    "audience": "Couple  ? Paris",
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
      "V?rifier le loyer hors charges indiqu? dans le bail.",
      "Tester un sc?nario avec revenus ? 2000 EUR puis ? 2500 EUR.",
      "Comparer avec une proche banlieue si vous etudiez plusieurs options."
    ],
    "faq": [
      {
        "question": "Un couple  ? Paris peut-il toucher une APL significative ?",
        "answer": "Oui dans certains cas, mais le plafond de loyer retient seulement une partie du co?t r?el du logement."
      },
      {
        "question": "Les revenus combin?s annulent-ils souvent l'APL ?",
        "answer": "Ils peuvent la r?duire rapidement. Il faut donc v?rifier le rapport entre revenus du foyer et loyer."
      }
    ]
  },
  {
    "slug": "apl-couple-lyon",
    "intent": "apl couple lyon",
    "title": "APL pour un couple  ? Lyon : estimation 2026",
    "description": "Simulation type APL pour un couple  ? Lyon avec logement dans le parc priv?.",
    "summary": "Cette page couvre une grande ville de province avec une recherche g?olocalis?e utile pour les couples sans enfant.",
    "audience": "Couple  ? Lyon",
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
      "V?rifier si les deux revenus sont stables sur la p?riode retenue.",
      "Comparer avec un sc?nario couple avec enfant si la situation doit ?voluer vite.",
      "Tester aussi un loyer ? 700 EUR puis a 850 EUR."
    ],
    "faq": [
      {
        "question": "Le calcul'APL d'un couple  ? Lyon reste-t-il interessant ?",
        "answer": "Oui dans certains cas, surtout si le loyer reste soutenu au regard des revenus du foyer."
      },
      {
        "question": "Une grande ville de province reste-t-elle en zone province ?",
        "answer": "Oui dans ce type de sc?nario. La distinction principale oppose ici l ?le-de-France, la province et les DOM."
      }
    ]
  },
  {
    "slug": "apl-couple-sans-enfant",
    "intent": "apl couple sans enfant",
    "title": "APL pour un couple sans enfant : estimation 2026",
    "description": "Sc?nario APL pour un couple locataire sans enfant avec revenus modestes.",
    "summary": "Cette page r?pond a une intention large et rentable pour le cluster foyer, avec un cas simple ? comparer.",
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
      "Additionner les deux revenus r?els du foyer.",
      "Tester le sc?nario avec et sans prime variable.",
      "Comparer avec un logement HLM si c'est une option plausible."
    ],
    "faq": [
      {
        "question": "Le revenu du conjoint est-il pris en compte pour l'APL ?",
        "answer": "Oui, le calcul tient compte des ressources du foyer. L'aide peut donc baisser plus vite que pour une personne seule."
      },
      {
        "question": "Un couple sans enfant a-t-il un plafond different ?",
        "answer": "Oui, le plafond de loyer et certains param?tres de calcul ?voluent avec la composition du foyer."
      }
    ]
  },
  {
    "slug": "apl-couple-un-enfant",
    "intent": "apl couple 1 enfant",
    "title": "APL couple avec 1 enfant : estimation 2026",
    "description": "Sc?nario APL pour un couple avec un enfant et loyer familial moyen.",
    "summary": "Cette page couvre une requ?te large et sert de pivot vers les autres cas famille plus pr?cis.",
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
      "V?rifier la composition exacte du foyer.",
      "Comparer avec un sc?nario deux enfants ou parent isol?.",
      "Tester aussi un logement social si c'est votre cas."
    ],
    "faq": [
      {
        "question": "Le premier enfant change-t-il beaucoup l'APL ?",
        "answer": "Il peut rendre le calcul plus favorable, mais le revenu du foyer reste determinant."
      },
      {
        "question": "Faut-il recalculer l'APL apr?s une naissance ?",
        "answer": "Oui, car la composition du foyer influence directement plusieurs param?tres du calcul."
      }
    ]
  },
  {
    "slug": "apl-couple-loyer-eleve",
    "intent": "apl couple loyer eleve",
    "title": "APL pour un couple avec loyer eleve : estimation 2026",
    "description": "Sc?nario APL pour un couple avec un loyer ?lev? par rapport au revenu du foyer.",
    "summary": "Cette page r?pond a une question r?currente de budget logement en zone tendue pour les couples sans enfant.",
    "audience": "Couple avec loyer ?lev?",
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
      "V?rifier le plafond de loyer applicable dans la zone.",
      "Comparer avec un sc?nario hors ?le-de-France.",
      "Tester une baisse ou une hausse de revenus pour mesurer la sensibilite."
    ],
    "faq": [
      {
        "question": "Un loyer tr?s ?lev? emp?che-t-il l'APL ?",
        "answer": "Pas necessairement, mais une partie du loyer peut d?passer le plafond retenu et ne plus augmenter l'aide."
      },
      {
        "question": "Faut-il viser un logement moins cher pour garder l'APL ?",
        "answer": "Souvent, un loyer plus raisonnable permet surtout de r?duire le reste  ? charge, m?me si l'aide baisse un peu."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-un-enfant",
    "intent": "apl parent isole 1 enfant",
    "title": "APL parent isol? avec 1 enfant : estimation 2026",
    "description": "Cas pratique APL pour un parent isol? avec un enfant en location.",
    "summary": "Cette page vise une intention tr?s concr?te avec un besoin fort de r?ponse rapide sur le niveau d'aide.",
    "audience": "Parent isol? avec un enfant",
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
      "V?rifier le nombre d enfants  ? charge retenu.",
      "Comparer avec le RSA ou la prime d'activit? si besoin.",
      "Tester un sc?nario HLM si le logement est social."
    ],
    "faq": [
      {
        "question": "Un parent isol? touche-t-il plus d APL ?",
        "answer": "Le calcul peut ?tre plus favorable qu avec un adulte seul, mais il d?pend toujours du revenu et du loyer retenu."
      },
      {
        "question": "Les pensions alimentaires changent-elles l'APL ?",
        "answer": "Oui, elles peuvent modifier les ressources prises en compte. Il faut donc les int?grer a la v?rification finale."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-deux-enfants",
    "intent": "apl parent isole 2 enfants",
    "title": "APL parent isol? avec 2 enfants : estimation 2026",
    "description": "Sc?nario APL pour un parent solo avec deux enfants et loyer familial.",
    "summary": "Cette page couvre une recherche a forte utilit? pratique pour les foyers monoparentaux avec charges ?lev?es.",
    "audience": "Parent isol? avec deux enfants",
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
      "V?rifier si les enfants sont tous consid?r?s  ? charge.",
      "Tester un sc?nario avec garde alternee si la situation est complexe.",
      "Comparer avec un logement social si vous ?tes d?j? en HLM."
    ],
    "faq": [
      {
        "question": "L'APL monte-t-elle nettement avec deux enfants ?",
        "answer": "Le calcul est souvent plus favorable, mais il d?pend toujours du revenu et du loyer retenu par la zone."
      },
      {
        "question": "Le parent isol? doit-il d?clarer toutes les aides familiales ?",
        "answer": "Oui, les ressources prises en compte doivent ?tre v?rifiees de maniere compl?te avant de d?d?poser un dossier."
      }
    ]
  },
  {
    "slug": "apl-parent-isole-paris",
    "intent": "apl parent isole paris",
    "title": "APL parent isol?  ? Paris : estimation 2026",
    "description": "Estimation APL pour un parent solo  ? Paris avec un enfant et loyer francilien.",
    "summary": "Cette page combine intention familiale et g?olocalisation forte, avec un vrai enjeu de reste  ? charge en ?le-de-France.",
    "audience": "Parent isol?  ? Paris",
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
      "V?rifier le loyer retenu hors charges.",
      "Comparer avec une proche banlieue si vous cherchez un ordre de grandeur.",
      "Tester aussi un sc?nario avec deux enfants si la situation ?volue vite."
    ],
    "faq": [
      {
        "question": "Un parent solo  ? Paris peut-il encore toucher une APL utile ?",
        "answer": "Oui, surtout avec des revenus modestes, mais le co?t du logement reste souvent bien sup?rieur au plafond retenu."
      },
      {
        "question": "Pourquoi le reste  ? charge reste-t-il ?lev?  ? Paris ?",
        "answer": "Parce que l'APL ne suit pas int?gralement le loyer r?el au-del? du plafond applicable ? la zone."
      }
    ]
  },
  {
    "slug": "apl-famille-deux-enfants-province",
    "intent": "apl famille 2 enfants",
    "title": "APL famille avec 2 enfants en province : estimation 2026",
    "description": "Cas APL pour un couple avec deux enfants dans une grande ville de province.",
    "summary": "Cette page donne un sc?nario familial tr?s lisible pour comprendre l'impact du foyer sur le calcul.",
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
      "V?rifier le nombre exact d enfants retenus au foyer.",
      "Comparer avec un logement social si vous y ?tes ?ligibles.",
      "Tester une variation de revenu si un parent reprend'une activit?."
    ],
    "faq": [
      {
        "question": "Une famille avec deux enfants peut-elle encore toucher l'APL ?",
        "answer": "Oui, surtout si le logement reste couteux au regard des revenus du foyer. La composition familiale joue souvent en faveur du calcul."
      },
      {
        "question": "Le couple doit-il d?clarer toutes les ressources du foyer ?",
        "answer": "Oui, y compris les revenus des deux adultes et les autres ressources retenues par la CAF."
      }
    ]
  },
  {
    "slug": "apl-famille-idf",
    "intent": "apl famille ile de france",
    "title": "APL famille en Ile-de-France : estimation 2026",
    "description": "Simulation type APL pour une famille en ?le-de-France avec loyer ?lev?.",
    "summary": "Cette page r?pond a une recherche a forte tension budgetaire dans une zone ou le reste  ? charge reste souvent lourd.",
    "audience": "Famille en ?le-de-France",
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
      "V?rifier si le logement d?passe les plafonds de zone.",
      "Comparer avec un sc?nario province si une mobilit? est envisag?e.",
      "Tester aussi une variante avec deux enfants."
    ],
    "faq": [
      {
        "question": "Une famille francilienne peut-elle vraiment compter sur l'APL ?",
        "answer": "L'APL peut aider, mais elle ne suit pas g?n?ralement la hausse r?elle des loyers en zone tendue."
      },
      {
        "question": "Pourquoi le montant semble parfois faible en ?le-de-France ?",
        "answer": "Parce que le calcul applique un plafond de loyer et tient compte de l ensemble des ressources du foyer."
      }
    ]
  },
  {
    "slug": "apl-personne-seule-smic",
    "intent": "apl personne seule smic",
    "title": "APL personne seule au SMIC : estimation 2026",
    "description": "Estimation APL pour une personne seule avec un salaire proche du SMIC et un loyer courant.",
    "summary": "Cette page dérive directement du pattern le plus fort observé sur le cluster APL autour du SMIC et de la personne seule.",
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
      "Vérifier le salaire net réellement retenu sur la période de référence.",
      "Comparer avec un loyer autour de 550 EUR puis de 700 EUR.",
      "Tester aussi un scénario avec reprise d'emploi ou prime d'activité."
    ],
    "faq": [
      {
        "question": "Une personne seule au SMIC peut-elle encore toucher l'APL ?",
        "answer": "Oui, dans certains cas. Le loyer, la zone et les revenus retenus peuvent encore laisser une aide logement indicative."
      },
      {
        "question": "Le fait d'être seul change-t-il fortement le calcul ?",
        "answer": "Oui, la composition du foyer joue sur le plafond de loyer et sur l'équilibre global du calcul."
      }
    ]
  },
  {
    "slug": "apl-smic-seul",
    "intent": "apl smic seul",
    "title": "APL avec SMIC seul : estimation 2026",
    "description": "Simulation APL pour une personne seule rémunérée au SMIC avec un loyer moyen.",
    "summary": "Cette page vise une variante de requête très proche du pattern gagnant déjà testé par Google.",
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
      "Vérifier si le loyer retenu est bien indiqué hors charges.",
      "Comparer avec un petit loyer si vous hésitez entre deux logements.",
      "Tester aussi un scénario sans activité pour mesurer l'écart."
    ],
    "faq": [
      {
        "question": "Le SMIC seul suffit-il à faire tomber l'APL à zéro ?",
        "answer": "Pas automatiquement. Tout dépend du loyer, de la zone et des ressources retenues par la CAF."
      },
      {
        "question": "Pourquoi deux situations proches peuvent-elles donner des résultats différents ?",
        "answer": "Parce que le niveau exact de loyer retenu et les revenus de référence peuvent faire varier le calcul final."
      }
    ]
  },
  {
    "slug": "apl-celibataire-petit-salaire",
    "intent": "apl celibataire petit salaire",
    "title": "APL célibataire avec petit salaire : estimation 2026",
    "description": "Cas APL pour un célibataire avec un revenu modeste légèrement inférieur au SMIC.",
    "summary": "Cette page étend le pattern célibataire plus petit revenu, qui ressort déjà à la fois dans les pages et dans les requêtes.",
    "audience": "Célibataire avec petit salaire",
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
      "Vérifier si vous avez des revenus variables ou des primes ponctuelles.",
      "Comparer avec un loyer légèrement plus élevé en zone tendue.",
      "Tester un scénario avec personne seule au SMIC pour comparer."
    ],
    "faq": [
      {
        "question": "Un petit salaire augmente-t-il fortement l'APL ?",
        "answer": "Il peut rendre l'estimation plus favorable, mais le loyer retenu et la zone restent déterminants."
      },
      {
        "question": "Faut-il déclarer toutes les aides perçues ?",
        "answer": "Oui, la vérification finale doit toujours intégrer les autres ressources prises en compte par la CAF."
      }
    ]
  },
  {
    "slug": "apl-chomage-personne-seule",
    "intent": "apl chomage personne seule",
    "title": "APL au chômage pour une personne seule : estimation 2026",
    "description": "Estimation APL pour une personne seule sans activité avec un loyer courant.",
    "summary": "Cette page prolonge le pattern chômage qui remonte déjà dans les requêtes et sur la page chômage avec loyer moyen.",
    "audience": "Personne seule au chômage",
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
      "Vérifier si les revenus retenus correspondent bien à votre situation actuelle.",
      "Comparer avec une reprise d'emploi partielle si vous envisagez un retour rapide au travail.",
      "Tester aussi un loyer plus bas pour mesurer le reste à charge."
    ],
    "faq": [
      {
        "question": "Le chômage ouvre-t-il plus facilement droit à l'APL ?",
        "answer": "Souvent oui si les ressources retenues baissent, mais le montant dépend toujours du loyer plafonné et de la zone."
      },
      {
        "question": "L'ARE est-elle prise en compte ?",
        "answer": "Oui, selon la période et les règles retenues par la CAF, l'indemnisation chômage peut influencer le calcul."
      }
    ]
  },
  {
    "slug": "apl-chomage-avec-enfant",
    "intent": "apl chomage avec enfant",
    "title": "APL au chômage avec enfant : estimation 2026",
    "description": "Scénario APL pour un parent avec un enfant et des revenus en baisse liés au chômage.",
    "summary": "Cette page permet d'étendre le pattern chômage vers une situation familiale, souvent plus porteuse en besoin utilisateur.",
    "audience": "Parent avec un enfant au chômage",
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
      "Vérifier si toutes les ressources de remplacement sont bien prises en compte.",
      "Comparer avec un scénario parent isolé en emploi partiel.",
      "Tester une variante avec deux enfants si la composition familiale évolue."
    ],
    "faq": [
      {
        "question": "Le fait d'avoir un enfant change-t-il beaucoup l'estimation APL ?",
        "answer": "Oui, la composition familiale peut rendre le calcul plus favorable, mais le loyer et les ressources restent décisifs."
      },
      {
        "question": "Les allocations familiales suffisent-elles à annuler l'APL ?",
        "answer": "Pas automatiquement. Il faut regarder l'ensemble des revenus retenus et le plafond de loyer applicable."
      }
    ]
  },
  {
    "slug": "apl-reprise-emploi-loyer-eleve",
    "intent": "apl reprise emploi loyer eleve",
    "title": "APL avec reprise d'emploi et loyer élevé : estimation 2026",
    "description": "Exemple APL pour une personne seule qui reprend une activité avec un loyer déjà élevé.",
    "summary": "Cette page dérive du pattern reprise d'emploi déjà testé, avec une variable loyer élevé qui aide à capter une intention plus concrète.",
    "audience": "Personne seule en reprise d'emploi avec loyer élevé",
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
      "Comparer avec un loyer moyen pour mesurer la part réellement retenue.",
      "Vérifier si vos premiers revenus d'activité changent fortement l'estimation.",
      "Tester aussi une version chômage si la reprise n'est pas encore stabilisée."
    ],
    "faq": [
      {
        "question": "Une reprise d'emploi fait-elle baisser l'APL rapidement ?",
        "answer": "Elle peut réduire l'aide selon les revenus retenus, mais un loyer élevé peut encore laisser un droit indicatif."
      },
      {
        "question": "Le plafond de loyer limite-t-il l'effet d'un loyer plus cher ?",
        "answer": "Oui, au-delà d'un certain seuil, une partie du loyer n'augmente plus le montant retenu."
      }
    ]
  },
  {
    "slug": "apl-couple-petit-revenu",
    "intent": "apl couple petit revenu",
    "title": "APL couple avec petit revenu : estimation 2026",
    "description": "Simulation APL pour un couple sans enfant avec revenus modestes et loyer moyen.",
    "summary": "Cette page prolonge le pattern couple sans enfant déjà bien positionné, avec un angle plus resserré sur les petits revenus.",
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
      "Vérifier si les revenus des deux adultes sont bien additionnés.",
      "Comparer avec un couple au loyer élevé pour mesurer l'écart.",
      "Tester aussi une variante avec un enfant si la situation évolue."
    ],
    "faq": [
      {
        "question": "Un couple sans enfant peut-il encore toucher l'APL avec des revenus modestes ?",
        "answer": "Oui, surtout si le loyer reste significatif au regard des ressources globales du foyer."
      },
      {
        "question": "Le montant baisse-t-il vite dès que les deux salaires augmentent ?",
        "answer": "Oui, l'ensemble des revenus retenus du couple peut réduire l'aide assez rapidement."
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
      "Vérifier si l'enfant est bien compté à charge sur toute la période.",
      "Comparer avec un couple sans enfant pour mesurer l'impact du foyer.",
      "Tester un logement légèrement plus grand si vous hésitez entre deux loyers."
    ],
    "faq": [
      {
        "question": "Le premier enfant change-t-il beaucoup le calcul APL ?",
        "answer": "Il peut améliorer l'estimation, mais le niveau exact de revenus et le loyer retenu restent essentiels."
      },
      {
        "question": "Faut-il un grand loyer pour conserver l'APL en couple avec enfant ?",
        "answer": "Pas forcément, mais un loyer plus significatif par rapport aux revenus rend l'aide plus probable."
      }
    ]
  },
  {
    "slug": "apl-famille-trois-enfants",
    "intent": "apl 3 enfants",
    "title": "APL famille avec 3 enfants : estimation 2026",
    "description": "Estimation APL pour une famille avec trois enfants et un loyer adapté à un logement plus grand.",
    "summary": "Cette page prolonge naturellement les signaux déjà vus sur les familles avec enfants et la requête générique autour de l'APL avec enfants.",
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
      "Vérifier le nombre exact d'enfants retenus au foyer.",
      "Comparer avec un logement social si vous avez accès à ce type de parc.",
      "Tester aussi une variante avec deux enfants pour voir l'effet de composition familiale."
    ],
    "faq": [
      {
        "question": "Avec trois enfants, l'APL monte-t-elle toujours fortement ?",
        "answer": "Le foyer peut rendre l'estimation plus favorable, mais le niveau global de revenus reste décisif."
      },
      {
        "question": "Un logement plus grand augmente-t-il automatiquement l'APL ?",
        "answer": "Pas automatiquement, car le plafond de loyer limite la part réellement retenue."
      }
    ]
  },
  {
    "slug": "apl-etudiant-studio",
    "intent": "apl etudiant studio",
    "title": "APL étudiant en studio : estimation 2026",
    "description": "Scénario APL pour un étudiant seul en studio avec budget serré.",
    "summary": "Cette page reste très proche du cluster étudiant déjà visible, avec un angle logement simple et très courant.",
    "audience": "Étudiant en studio",
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
      "Vérifier si le studio est bien déclaré en location indépendante.",
      "Comparer avec une résidence étudiante ou une colocation.",
      "Tester plusieurs niveaux de revenus si vous avez un job étudiant."
    ],
    "faq": [
      {
        "question": "Un studio étudiant ouvre-t-il souvent droit à l'APL ?",
        "answer": "Oui, c'est un cas fréquent, surtout avec peu de revenus et un loyer adapté à la zone."
      },
      {
        "question": "Le CROUS et le studio privé donnent-ils le même résultat ?",
        "answer": "Non, le type de logement peut modifier le montant retenu et les conditions de calcul."
      }
    ]
  },
  {
    "slug": "apl-etudiant-petit-loyer",
    "intent": "apl etudiant petit loyer",
    "title": "APL étudiant avec petit loyer : estimation 2026",
    "description": "Exemple APL pour un étudiant avec un loyer modéré et de faibles revenus.",
    "summary": "Cette page couvre une variante utile du cluster étudiant, pour les profils qui arbitrent entre petit loyer et aide logement.",
    "audience": "Étudiant avec petit loyer",
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
      "Vérifier si le loyer retenu correspond bien à votre part réelle.",
      "Comparer avec un studio plus cher ou une colocation.",
      "Tester aussi un scénario étudiant en grande ville."
    ],
    "faq": [
      {
        "question": "Un petit loyer réduit-il forcément l'APL d'un étudiant ?",
        "answer": "Le montant peut être plus faible, mais le reste à charge global peut rester plus favorable."
      },
      {
        "question": "Faut-il quand même faire une simulation si le loyer est bas ?",
        "answer": "Oui, car même un loyer modéré peut laisser une estimation utile selon vos revenus."
      }
    ]
  },
  {
    "slug": "apl-alternant-paris",
    "intent": "apl alternant paris",
    "title": "APL alternant à Paris : estimation 2026",
    "description": "Estimation APL pour un alternant en location à Paris avec salaire modeste.",
    "summary": "Cette page dérive d'un pattern déjà cliqué sur alternant, en ajoutant l'angle géolocalisé Paris qui reste très défendable.",
    "audience": "Alternant à Paris",
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
      "Vérifier votre revenu net réellement retenu sur la période.",
      "Comparer avec une colocation si le loyer parisien est élevé.",
      "Tester aussi un scénario apprenti si votre contrat change."
    ],
    "faq": [
      {
        "question": "Un alternant à Paris peut-il encore toucher l'APL ?",
        "answer": "Oui, surtout si le loyer reste élevé au regard du salaire d'alternance et de la zone retenue."
      },
      {
        "question": "Le salaire d'alternance est-il pris en compte ?",
        "answer": "Oui, il influence le calcul, d'où l'intérêt d'une simulation pré-remplie et d'une vérification finale."
      }
    ]
  },
  {
    "slug": "apl-apprenti-loyer-500",
    "intent": "apl apprenti loyer 500",
    "title": "APL apprenti avec loyer de 500 EUR : estimation 2026",
    "description": "Cas APL pour un apprenti avec loyer modéré et revenus de début d'activité.",
    "summary": "Cette page suit le pattern apprenti déjà testé, avec une variable de loyer simple qui correspond à une vraie recherche utilitaire.",
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
      "Vérifier si le bail indique bien un loyer hors charges.",
      "Comparer avec un loyer à 600 EUR pour mesurer l'écart.",
      "Tester aussi une version alternant si votre statut est proche."
    ],
    "faq": [
      {
        "question": "Un apprenti avec petit loyer peut-il toucher l'APL ?",
        "answer": "Oui, le statut d'apprenti et le niveau de revenus peuvent laisser une aide indicative selon la zone."
      },
      {
        "question": "Le loyer à 500 EUR est-il trop bas pour garder l'APL ?",
        "answer": "Pas forcément. Le montant peut être plus modéré, mais l'aide reste possible selon votre situation."
      }
    ]
  },
  {
    "slug": "apl-celibataire-lyon",
    "intent": "apl celibataire lyon",
    "title": "APL célibataire à Lyon : estimation 2026",
    "description": "Simulation APL pour une personne seule locataire à Lyon avec budget urbain classique.",
    "summary": "Cette page complète le trio des grandes villes déjà visibles avec Paris, Marseille et Toulouse.",
    "audience": "Célibataire à Lyon",
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
      "Comparer avec Paris si vous hésitez entre deux zones tendues.",
      "Vérifier si le loyer retenu est bien hors charges.",
      "Tester aussi un scénario étudiant si votre situation est hybride."
    ],
    "faq": [
      {
        "question": "Un célibataire à Lyon peut-il encore toucher l'APL ?",
        "answer": "Oui, surtout avec revenus modérés et loyer urbain significatif, même si le plafond de loyer limite le calcul."
      },
      {
        "question": "Lyon est-elle plus favorable que Paris pour l'APL ?",
        "answer": "Le calcul dépend de la zone et du loyer retenu. Le reste à charge peut parfois être plus supportable hors Île-de-France."
      }
    ]
  },
  {
    "slug": "apl-etudiant-toulouse",
    "intent": "apl etudiant toulouse",
    "title": "APL étudiant à Toulouse : estimation 2026",
    "description": "Exemple APL pour un étudiant à Toulouse avec loyer modéré et revenus limités.",
    "summary": "Cette page étend le cluster étudiant ville, déjà présent sur Paris et Lyon, vers une ville universitaire très naturelle.",
    "audience": "Étudiant à Toulouse",
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
      "Vérifier si le logement est bien éligible à l'APL.",
      "Comparer avec une colocation si vous avez un budget serré.",
      "Tester aussi une version étudiant à Lyon pour situer l'écart."
    ],
    "faq": [
      {
        "question": "Un étudiant à Toulouse peut-il toucher une APL utile ?",
        "answer": "Oui, avec peu de revenus et un loyer cohérent avec la zone, une estimation indicative reste fréquente."
      },
      {
        "question": "Le montant est-il souvent proche de celui de Lyon ?",
        "answer": "Pas exactement. Le loyer, la zone et le type de logement font varier l'ordre de grandeur."
      }
    ]
  }
];
