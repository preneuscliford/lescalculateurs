# 📐 Template & Exemples : Pages Taxe Foncière

## 1️⃣ Structure HTML Standard

Chaque page doit suivre cette structure (générée par DeepSeek via prompt) :

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Taxe Foncière Paris (75) 2025 - Simulation et Calcul Gratuit</title>
    <meta
      name="description"
      content="Calculez votre taxe foncière en Île-de-France. Simulation gratuite, montants moyens, comparatif ancien/neuf et taux à Paris (75)."
    />
    <meta
      name="keywords"
      content="taxe foncière paris, simulation taxe 75, montant moyen île-de-france, calcul taxe foncière 2025"
    />
    <meta name="author" content="LesCalculateurs.fr" />
    <meta name="robots" content="index, follow" />

    <link
      rel="canonical"
      href="https://lescalculateurs.fr/pages/taxe-fonciere/paris-75"
    />
    <meta
      property="og:url"
      content="https://lescalculateurs.fr/pages/taxe-fonciere/paris-75"
    />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="Taxe Foncière Paris (75) 2025" />
    <meta
      property="og:description"
      content="Guide complet et simulateur gratuit pour Paris"
    />
    <meta
      property="og:image"
      content="https://lescalculateurs.fr/assets/favicon-32x32.png"
    />

    <!-- SEO Schema -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Taxe Foncière Paris (75) 2025 - Simulation et Calcul Gratuit",
        "description": "Calculez votre taxe foncière à Paris avec notre simulateur gratuit.",
        "author": {
          "@type": "Organization",
          "name": "LesCalculateurs.fr",
          "url": "https://lescalculateurs.fr"
        },
        "datePublished": "2026-01-20",
        "dateModified": "2026-01-20",
        "inLanguage": "fr",
        "isPartOf": {
          "@type": "Website",
          "url": "https://lescalculateurs.fr"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Accueil",
              "item": "https://lescalculateurs.fr"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Taxe Foncière",
              "item": "https://lescalculateurs.fr/pages/taxe-fonciere"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Paris (75)",
              "item": "https://lescalculateurs.fr/pages/taxe-fonciere/paris-75"
            }
          ]
        }
      }
    </script>

    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="/assets/favicon-32x32.png"
    />
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399"
      crossorigin="anonymous"
    ></script>
    <script type="module" src="../../../main.ts"></script>
  </head>
  <body class="bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <img src="/logo.svg" alt="LesCalculateurs.fr" class="w-8 h-8" />
            <a
              href="/pages/taxe-fonciere"
              class="text-blue-600 hover:text-blue-700 font-medium"
              >← Taxe Foncière</a
            >
          </div>
          <a
            href="/index.html"
            class="text-sm text-gray-600 hover:text-gray-900"
            >Accueil</a
          >
        </div>
      </div>
    </header>

    <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- CONTENU GÉNÉRÉ PAR DEEPSEEK -->
      <!-- Section 1: H1 + Intro -->
      <!-- Section 2: Simulateur -->
      <!-- Section 3: Fourchette -->
      <!-- Section 4: Facteurs locaux -->
      <!-- Section 5: Exemple -->
      <!-- Section 6: FAQ -->
      <!-- Section 7: CTA -->
    </article>

    <footer class="bg-gray-900 text-gray-300 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p>&copy; 2026 LesCalculateurs.fr - Tous droits réservés</p>
      </div>
    </footer>
  </body>
</html>
```

---

## 2️⃣ JSON Data Examples (101 Départements)

### Structure complète : `src/data/taxe-fonciere-departements.json`

```json
{
  "version": "2026-01",
  "last_updated": "2026-01-10T10:30:00Z",
  "total_departments": 101,
  "departements": {
    "75": {
      "code": "75",
      "code_3chiffres": "075",
      "nom": "Paris",
      "slug": "paris-75",
      "region": {
        "code": "11",
        "nom": "Île-de-France"
      },
      "taxe_fonciere": {
        "taux_moyen_communal": 0.0135,
        "taux_regional_min": 0.0125,
        "taux_regional_max": 0.0145,
        "montant_moyen": 850,
        "montant_min": 500,
        "montant_max": 2500,
        "montant_median": 750,
        "base_locative_moyenne": 35000,
        "base_locative_min": 25000,
        "base_locative_max": 50000,
        "source": "DGFiP 2025"
      },
      "territoire": {
        "type": "urbain",
        "densité_population": "très_dense",
        "tension_immobilière": "très_forte",
        "prix_m2_moyen": 8500,
        "prix_m2_min": 5000,
        "prix_m2_max": 15000
      },
      "exonerations": {
        "residence_principale": {
          "taux": 0.15,
          "local": false,
          "notes": "Abattement national standard"
        }
      },
      "capitale_dept": "Paris",
      "communes_principales": ["Paris"],
      "notes": "Taux très élevé en Île-de-France, particulièrement à Paris. Majorité de biens en copropriété."
    },
    "59": {
      "code": "59",
      "code_3chiffres": "059",
      "nom": "Nord",
      "slug": "nord-59",
      "region": {
        "code": "32",
        "nom": "Hauts-de-France"
      },
      "taxe_fonciere": {
        "taux_moyen_communal": 0.0145,
        "taux_regional_min": 0.013,
        "taux_regional_max": 0.016,
        "montant_moyen": 720,
        "montant_min": 400,
        "montant_max": 1800,
        "montant_median": 650,
        "base_locative_moyenne": 28000,
        "base_locative_min": 20000,
        "base_locative_max": 40000,
        "source": "DGFiP 2025"
      },
      "territoire": {
        "type": "mixte",
        "densité_population": "dense",
        "tension_immobilière": "modérée",
        "prix_m2_moyen": 2800,
        "prix_m2_min": 1500,
        "prix_m2_max": 5000
      },
      "exonerations": {
        "residence_principale": {
          "taux": 0.15,
          "local": false,
          "notes": "Abattement national standard"
        }
      },
      "capitale_dept": "Lille",
      "communes_principales": ["Lille", "Roubaix", "Tourcoing"],
      "notes": "Région industrielle historique. Bons immobilier d'entrée de gamme. Taux plus élevés en agglomération lilloise."
    },
    "69": {
      "code": "69",
      "code_3chiffres": "069",
      "nom": "Rhône",
      "slug": "rhone-69",
      "region": {
        "code": "84",
        "nom": "Auvergne-Rhône-Alpes"
      },
      "taxe_fonciere": {
        "taux_moyen_communal": 0.0128,
        "taux_regional_min": 0.0115,
        "taux_regional_max": 0.014,
        "montant_moyen": 680,
        "montant_min": 350,
        "montant_max": 1600,
        "montant_median": 620,
        "base_locative_moyenne": 32000,
        "base_locative_min": 22000,
        "base_locative_max": 45000,
        "source": "DGFiP 2025"
      },
      "territoire": {
        "type": "urbain",
        "densité_population": "dense",
        "tension_immobilière": "forte",
        "prix_m2_moyen": 5200,
        "prix_m2_min": 2500,
        "prix_m2_max": 9000
      },
      "exonerations": {
        "residence_principale": {
          "taux": 0.15,
          "local": false,
          "notes": "Abattement national standard"
        }
      },
      "capitale_dept": "Lyon",
      "communes_principales": ["Lyon", "Villeurbanne", "Vénissieux"],
      "notes": "Lyon : métropole importante, taux variés. Vallée du Rhône moins cher. Attraction résidentielle forte."
    },
    "13": {
      "code": "13",
      "code_3chiffres": "013",
      "nom": "Bouches-du-Rhône",
      "slug": "bouches-du-rhone-13",
      "region": {
        "code": "93",
        "nom": "Provence-Alpes-Côte d'Azur"
      },
      "taxe_fonciere": {
        "taux_moyen_communal": 0.0142,
        "taux_regional_min": 0.013,
        "taux_regional_max": 0.0155,
        "montant_moyen": 950,
        "montant_min": 500,
        "montant_max": 2800,
        "montant_median": 850,
        "base_locative_moyenne": 38000,
        "base_locative_min": 28000,
        "base_locative_max": 55000,
        "source": "DGFiP 2025"
      },
      "territoire": {
        "type": "urbain",
        "densité_population": "dense",
        "tension_immobilière": "très_forte",
        "prix_m2_moyen": 5800,
        "prix_m2_min": 3000,
        "prix_m2_max": 12000
      },
      "exonerations": {
        "residence_principale": {
          "taux": 0.15,
          "local": false,
          "notes": "Abattement national standard"
        }
      },
      "capitale_dept": "Marseille",
      "communes_principales": ["Marseille", "Aix-en-Provence", "Arles"],
      "notes": "Taux élevés, particulièrement Marseille-Aix. Côtier (Provence côte). Base locative forte en agglomération."
    },
    "974": {
      "code": "974",
      "code_3chiffres": "974",
      "nom": "La Réunion",
      "slug": "reunion-974",
      "region": {
        "code": "94",
        "nom": "La Réunion (DOM)"
      },
      "taxe_fonciere": {
        "taux_moyen_communal": 0.0155,
        "taux_regional_min": 0.014,
        "taux_regional_max": 0.017,
        "montant_moyen": 520,
        "montant_min": 250,
        "montant_max": 1200,
        "montant_median": 450,
        "base_locative_moyenne": 18000,
        "base_locative_min": 12000,
        "base_locative_max": 28000,
        "source": "DGFiP 2025"
      },
      "territoire": {
        "type": "urbain",
        "densité_population": "modérée",
        "tension_immobilière": "modérée",
        "prix_m2_moyen": 3200,
        "prix_m2_min": 1800,
        "prix_m2_max": 6000
      },
      "exonerations": {
        "residence_principale": {
          "taux": 0.15,
          "local": false,
          "notes": "Abattement national standard + avantages DOM possibles"
        }
      },
      "capitale_dept": "Saint-Denis",
      "communes_principales": ["Saint-Denis", "Saint-Paul", "Saint-Pierre"],
      "notes": "DOM : régime spécial possible, taux plus élevés. Climat tropical = dépréciation immobilière. Base locative moins élevée."
    }
  },
  "regions": {
    "11": {
      "code": "11",
      "nom": "Île-de-France",
      "taux_moyen_regional": 0.0135,
      "departements": ["75", "77", "78", "91", "92", "93", "94", "95"],
      "description": "Région la plus chère, taux fiscalité élevée"
    },
    "32": {
      "code": "32",
      "nom": "Hauts-de-France",
      "taux_moyen_regional": 0.0145,
      "departements": ["02", "59", "60", "62", "80"],
      "description": "Nord industriel, taux modérés à élevés"
    },
    "84": {
      "code": "84",
      "nom": "Auvergne-Rhône-Alpes",
      "taux_moyen_regional": 0.0128,
      "departements": [
        "01",
        "03",
        "07",
        "15",
        "26",
        "38",
        "42",
        "43",
        "63",
        "69",
        "73",
        "74"
      ],
      "description": "Région vaste, taux généralement bas à modérés"
    }
  },
  "sources_metadata": {
    "DGFiP": "Direction Générale des Finances Publiques - Données 2025",
    "INSEE": "Cadastre, base locative, démographie",
    "Cerema": "Centre d'études et d'expertise sur les risques, l'environnement, la mobilité et l'aménagement",
    "Collectivités": "Données taux municipaux officiels",
    "last_audit": "2026-01-10"
  }
}
```

---

## 3️⃣ Exemple Contenu Article Généré

### Para 1: Introduction (UNIQUE PAR DÉPARTEMENT)

**Paris (75) :**

```
En Île-de-France, la taxe foncière se situe légèrement au-dessus de la moyenne
nationale avec un taux moyen de 1,35 % de la base locative. À Paris en particulier,
ce taux peut atteindre 1,45 % dans certains arrondissements. C'est en partie dû
à la forte densité urbaine et aux enjeux d'aménagement du territoire dans la région
la plus chère de France. Pour un Parisien propriétaire d'un bien immobilier,
la taxe foncière représente un élément important du coût d'entretien d'une résidence.
```

**Nord (59) :**

```
Le Nord, région historiquement industrielle du nord-est français, maintient des taux
de taxe foncière légèrement supérieurs à la moyenne nationale (1,45 %). Cependant,
grâce à des prix d'immobilier plus accessibles qu'en Île-de-France, le montant
absolue de la taxe reste modéré pour la plupart des propriétaires. Lille et sa
métropole concentrent les taux les plus élevés, tandis que les zones rurales
bénéficient de fiscalité locale moins importante.
```

**Creuse (23) :**

```
La Creuse, département rural situé dans la région du Limousin-Aquitaine, figure
parmi les territoires aux taux de taxe foncière les plus bas de France avec 1,20 %.
Cette fiscalité avantageuse s'explique par la faible densité de population,
l'absence de grandes agglomérations et un contexte économique centré sur l'agriculture.
Pour les propriétaires fonciers, cela représente un avantage fiscal non négligeable.
```

⚠️ **Chaque intro DOIT être unique et spécifique au contexte local**

---

### Para 3: Fourchette Départementale (Tableau)

**Paris (75) :**

```html
<table class="w-full border-collapse border border-gray-300 my-8">
  <thead>
    <tr class="bg-blue-100">
      <th class="border border-gray-300 p-3 text-left">Type de bien</th>
      <th class="border border-gray-300 p-3 text-right">
        Taxe foncière annuelle
      </th>
    </tr>
  </thead>
  <tbody>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Petit appartement (50 m²) - 1e-10e
      </td>
      <td class="border border-gray-300 p-3 text-right">450 € - 650 €</td>
    </tr>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Appartement standard (80 m²) - Marais
      </td>
      <td class="border border-gray-300 p-3 text-right">650 € - 950 €</td>
    </tr>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Grand appartement/duplex (150 m²) - 8e
      </td>
      <td class="border border-gray-300 p-3 text-right">1200 € - 1800 €</td>
    </tr>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Maison ancienne (200 m²) - Banlieue proche
      </td>
      <td class="border border-gray-300 p-3 text-right">1500 € - 2200 €</td>
    </tr>
  </tbody>
</table>
```

**Nord (59) :**

```html
<table class="w-full border-collapse border border-gray-300 my-8">
  <thead>
    <tr class="bg-blue-100">
      <th class="border border-gray-300 p-3 text-left">Type de bien</th>
      <th class="border border-gray-300 p-3 text-right">
        Taxe foncière annuelle
      </th>
    </tr>
  </thead>
  <tbody>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Petite maison (100 m²) - Roubaix
      </td>
      <td class="border border-gray-300 p-3 text-right">380 € - 480 €</td>
    </tr>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Maison régulière (150 m²) - Lille périphérie
      </td>
      <td class="border border-gray-300 p-3 text-right">520 € - 680 €</td>
    </tr>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Propriété bourgeoise (250 m²) - Lille centre
      </td>
      <td class="border border-gray-300 p-3 text-right">900 € - 1200 €</td>
    </tr>
    <tr class="hover:bg-gray-50">
      <td class="border border-gray-300 p-3">
        Terrain/jardinage (2000 m²) - rural
      </td>
      <td class="border border-gray-300 p-3 text-right">150 € - 300 €</td>
    </tr>
  </tbody>
</table>
```

---

### Para 5: Exemple Concret (DIFFÉRENT PAR DÉPARTEMENT)

**Paris (75) :**

```
Exemple concret : Un couple achète un appartement de 85 m² dans le 6e arrondissement
(Rive gauche) pour 650 000 €. La base locative cadastrale est estimée à 35 000 €
pour ce type de bien dans ce secteur.

Calcul de la taxe foncière annuelle :
- Base locative : 35 000 €
- Taux moyen Paris (6e arr.) : 1,42 %
- Taxe brute : 35 000 € × 1,42 % = 497 €
- + frais communaux : ~150 € (département + commune + intercommunalité)
- **Total annuel estimé : 647 € / an**

Soit environ 54 € par mois. À titre comparatif, ce même appartement
dans le 20e arrondissement, bien que moins cher à l'achat, aurait une taxe
légèrement inférieure du fait d'un taux municipal moins élevé.
```

**Nord (59) :**

```
Exemple concret : Un couple acquiert une maison bourgeoise rénovée de 180 m²
à Lille pour 320 000 €. La base locative cadastrale est estimée à 28 000 €
(estimation DGFiP pour ce type de bien).

Calcul de la taxe foncière annuelle :
- Base locative : 28 000 €
- Taux moyen Lille : 1,48 %
- Taxe brute : 28 000 € × 1,48 % = 414 €
- + frais d'intercommunalité : ~120 € (Métropole lilloise)
- **Total annuel estimé : 534 € / an**

Soit environ 45 € par mois. Comparé à une maison similaire dans
une petite commune rurale du Nord (ex: Hazebrouck), la taxe serait
de 350-400 € annuels seulement.
```

⚠️ **Chaque exemple DOIT utiliser des chiffres réalistes du département**

---

### Para 6: FAQ Locale (QUESTIONS DIFFÉRENTES)

**Paris (75) FAQ :**

```html
<div class="space-y-6">
  <div class="bg-blue-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold text-blue-900 mb-3">
      1. Comment bénéficier de l'abattement résidence principale à Paris ?
    </h3>
    <p class="text-gray-700">
      Paris applique un abattement standard de 15% sur la taxe foncière pour les
      résidences principales. Il s'agit de l'abattement national minimum.
      Certaines communes d'Île-de-France proposent des abattements plus
      importants (jusqu'à 25%), mais Paris s'en tient au minimum légal. Aucune
      démarche particulière n'est nécessaire : l'abattement est automatiquement
      appliqué.
    </p>
  </div>

  <div class="bg-blue-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold text-blue-900 mb-3">
      2. Existe-t-il une exonération pour les personnes âgées à Paris ?
    </h3>
    <p class="text-gray-700">
      Paris ne propose pas d'exonération locale spécifique pour les personnes
      âgées. Seul l'abattement national de 15% s'applique. En revanche,
      certaines communes limitrophes (Boulogne-Billancourt, Neuilly) offrent des
      réductions supplémentaires. Pour les personnes à revenus modestes,
      vérifiez auprès de votre mairie l'existence d'autres aides.
    </p>
  </div>

  <div class="bg-blue-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold text-blue-900 mb-3">
      3. Comment se compare le taux de Paris avec la Province ?
    </h3>
    <p class="text-gray-700">
      Le taux moyen à Paris (1,35-1,42%) est supérieur à la moyenne nationale
      (1,28%) et très supérieur aux zones rurales (0,95-1,10%). Un bien
      similaire coûterait en taxe foncière 2-3 fois plus cher à Paris qu'en
      Province. Cela s'explique par la densité urbaine, les coûts de services
      publics, et l'attrait immobilier de la région capitale.
    </p>
  </div>
</div>
```

**Nord (59) FAQ :**

```html
<div class="space-y-6">
  <div class="bg-blue-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold text-blue-900 mb-3">
      1. Peut-on déduire la taxe foncière des revenus locatifs ?
    </h3>
    <p class="text-gray-700">
      Oui ! Si votre bien est loué (investissement locatif), la taxe foncière
      est totalement déductible de vos revenus bruts fonciers. En Nord, avec des
      taux avantageuses, cela rend les investissements immobiliers
      particulièrement intéressants fiscalement. Cette déduction réduit
      considérablement votre imposition sur le revenu.
    </p>
  </div>

  <div class="bg-blue-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold text-blue-900 mb-3">
      2. Y a-t-il des réductions pour les agriculteurs en Nord ?
    </h3>
    <p class="text-gray-700">
      Oui, le Nord compte plusieurs zones agricoles. Les propriétaires
      exploitant leurs terres en tant qu'agriculteur peuvent bénéficier de
      réductions ou exonérations selon leur statut. Contactez votre SAFER
      (Société d'aménagement foncier et d'établissement rural) ou la Chambre
      d'agriculture du Nord.
    </p>
  </div>

  <div class="bg-blue-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold text-blue-900 mb-3">
      3. Comment Lille se compare-t-elle à Arras (Pas-de-Calais) ?
    </h3>
    <p class="text-gray-700">
      Lille (59) : taux ~1,48%, montant moyen 720€/an Arras (62) : taux ~1,42%,
      montant moyen 680€/an La différence est mineure (5-10€/an). Lille, grande
      métropole, a des taux légèrement plus élevés mais offre un marché
      immobilier plus dynamique. Arras, plus petite, offre une fiscalité
      légèrement avantageuse.
    </p>
  </div>
</div>
```

⚠️ **Les questions DOIVENT être spécifiques au contexte local du département**

---

## 4️⃣ Checklist Anti-Duplication

Avant publication, chaque page doit passer ce filtre :

### Pour l'intro (100-150 mots)

- [ ] Pas identique à d'autres intros
- [ ] Contient contexte spécifique du département
- [ ] Compare avec national ou régional
- [ ] Mentionne 1-2 villes principales OU caractéristique territoriale

### Pour le tableau

- [ ] Exemples réalistes du département (prix, surfaces)
- [ ] Pas copié d'autres tableaux
- [ ] Types de biens appropriés au territoire

### Pour l'exemple concret

- [ ] Utilise prix immobilier réaliste du département
- [ ] Mention ville/arrondissement spécifique
- [ ] Calcul unique (pas réutilisé ailleurs)

### Pour la FAQ

- [ ] 3 questions différentes les unes des autres
- [ ] Pas les mêmes questions que autres départements
- [ ] Réponses adressent spécificités locales

### Outil de vérification

```bash
# Fuzzy matching sur toutes les pages
npm run validate:taxe-fonciere:duplication

# Output : similarity_score < 70% = ✅ OK
#          similarity_score > 80% = ⚠️  Review needed
#          similarity_score > 90% = ❌ Reject & regenerate
```

---

## 5️⃣ Points d'Attention

### ✅ À FAIRE

1. Lire les 101 articles générés rapidement (scan pour erreurs évidentes)
2. Vérifier 5-10 pages au hasard (QA manuel)
3. Vérifier que le simulateur est bien intégré
4. Vérifier canonical URLs sont correctes

### ❌ À ÉVITER

1. Ne pas laisser de `[PLACEHOLDER]` ou `{...}` dans le HTML
2. Ne pas copier-coller d'articles
3. Ne pas publier avant validation anti-duplication
4. Ne pas avoir d'erreurs HTML (DOCTYPE, /head, /body)

---

## 📚 Références

- Exemple complet frais notaire : `src/pages/blog/departements/frais-notaire-75.html`
- Données barèmes : `src/data/baremes.json`
- Script génération : `scripts/generate-department-pages-deepseek.cjs`
