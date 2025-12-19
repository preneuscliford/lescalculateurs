# 🤖 Plan d'Indexation IA - LesCalculateurs.fr

**Date**: 19 décembre 2025  
**Objectif**: Optimiser les pages simulateur pour Google SGE, Bing Copilot, Perplexity, Brave Search  
**Scope**: Pages simulateur uniquement

---

## 📊 Audit des Pages Simulateur

### Pages à optimiser (priorité haute)

1. **notaire.html** - Frais de Notaire 2025
2. **pret.html** - Simulateur Prêt Immobilier
3. **plusvalue.html** - Calcul Plus-Value Immobilière
4. **impot.html** - Calculateur Impôt sur le Revenu
5. **salaire.html** - Calcul Salaire Net / Brut
6. **taxe.html** - Taxe Foncière 2025
7. **ik.html** - Indemnités Kilométriques 2025
8. **travail.html** - Durée Légale du Travail & Heures Sup
9. **ponts.html** - Calcul Ponts & Jours Fériés
10. **charges.html** - Charges Copropriété

### Pages à créer (réponses directes)

- Méthodologie & Sources (page nouvelle)
- 5-10 pages réponse courte (800-1200 mots max)

---

## 🧱 PHASE 1 — RENDRE LES PAGES "IA-READY"

### Tâche 1.1: Question explicite en haut de page (H2)

**Pattern à ajouter** (après `<h1>`, avant contenu):

```html
<section class="ai-intro">
  <h2>❓ [Votre question] ?</h2>
  <p class="ai-response">[Réponse courte, factuelle, 2-3 lignes max]</p>
</section>
```

**Exemples par page:**

- **notaire.html**: "Comment calculer les frais de notaire en France en 2025?"
- **pret.html**: "Quel est le coût réel de votre prêt immobilier 2025?"
- **plusvalue.html**: "Comment calculer la plus-value immobilière?"
- **impot.html**: "Quel est votre impôt sur le revenu 2025?"
- **salaire.html**: "Comment passer du salaire brut au salaire net?"
- **taxe.html**: "Comment est calculée la taxe foncière?"
- **ik.html**: "Quel barème pour les indemnités kilométriques 2025?"
- **travail.html**: "Comment calculer les heures supplémentaires légales?"
- **ponts.html**: "Quels sont les jours fériés et ponts 2025?"
- **charges.html**: "Comment calculer les charges de copropriété?"

---

### Tâche 1.2: Bloc "Résumé IA" (CRUCIAL)

**Pattern à ajouter** (section visible ou semi-visible):

```html
<section
  class="ai-summary"
  role="complementary"
  aria-label="Résumé pour moteurs IA"
>
  <h3>📌 Résumé rapide</h3>
  <ul>
    <li>Source: Barème officiel [année]</li>
    <li>Calcul: [Formule simple en 1 ligne]</li>
    <li>Particularité: [Point clé]</li>
    <li>Outil: Simulation gratuite, mise à jour [date]</li>
  </ul>
</section>
```

**Exemples:**

- **notaire.html**:

  - Source: Chambre des Notaires France 2025
  - Calcul: Droits + Émoluments réglementés (variable selon prix bien)
  - Particularité: Différence notable ancien vs neuf
  - Outil: Simulation gratuite, mise à jour janvier 2025

- **salaire.html**:
  - Source: URSSAF 2025
  - Calcul: Brut - Cotisations sociales = Net
  - Particularité: Différence SMIC vs salaire élevé
  - Outil: Simulation gratuite, mise à jour janvier 2025

---

### Tâche 1.3: Données vérifiables (sources explicites)

**Ajouter une section** "Sources et données utilisées":

```html
<section class="ai-sources">
  <h3>📚 Sources vérifiables</h3>
  <ul>
    <li>
      <a href="https://www.service-public.fr">Service-public.fr</a> - Données
      officielles
    </li>
    <li>
      <a href="https://www.data.gouv.fr">Data.gouv.fr</a> - DVF et statistiques
    </li>
    <li>
      <a href="https://www.notaires.fr">Chambre des Notaires</a> - Barèmes
      officiels
    </li>
    <li><a href="https://www.insee.fr">INSEE</a> - Données économiques</li>
  </ul>
  <p class="text-sm text-gray-600">Mise à jour automatique : [DATE]</p>
</section>
```

---

## 🧩 PHASE 2 — STRUCTURATION SÉMANTIQUE

### Tâche 2.1: Schéma Calculator

**Ajouter dans `<head>`** (1 seul par page):

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Calculator",
    "name": "[Nom du calculateur]",
    "description": "[Description courte]",
    "url": "https://www.lescalculateurs.fr/pages/[page].html",
    "applicationCategory": "FinanceApplication",
    "inLanguage": "fr-FR",
    "author": {
      "@type": "Organization",
      "name": "Les Calculateurs",
      "url": "https://www.lescalculateurs.fr"
    }
  }
</script>
```

### Tâche 2.2: Schéma FAQPage

**Ajouter dans le contenu** (après FAQ):

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "[Question]",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[Réponse]"
        }
      }
    ]
  }
</script>
```

### Tâche 2.3: Bloc "Données utilisées pour ce calcul"

```html
<section class="ai-calculation-data">
  <h3>⚙️ Données utilisées pour ce calcul</h3>
  <ul>
    <li>Barème [Type] officiel [Année]</li>
    <li>Source: [Organisme officiel]</li>
    <li>Mise à jour: [Date]</li>
    <li>Conformité: Règles [Texte légal]</li>
  </ul>
</section>
```

---

## 🤖 PHASE 3 — ÊTRE CITÉ PAR LES IA

### Tâche 3.1: Créer 2 pages "Réponse directe"

**Format**: 800-1200 mots MAX, pas de marketing, juste la réponse IA

**Pages prioritaires:**

1. **comment-calculer-frais-notaire.html**

   - Question: "Comment sont calculés les frais de notaire?"
   - Contenu: Formule simple, exemples, sources

2. **comment-calculer-plus-value.html**
   - Question: "Comment calculer la plus-value immobilière?"
   - Contenu: Formule, cas particuliers, exceptions

### Tâche 3.2: Format "IA-friendly"

**Dans chaque page réponse:**

```html
<section class="ai-answer-block">
  <h2>[Question simple]</h2>

  <h3>Réponse courte</h3>
  <p>[1 paragraphe, 2-3 lignes]</p>

  <h3>Étapes du calcul</h3>
  <ol>
    <li>Étape 1</li>
    <li>Étape 2</li>
    <li>Étape 3</li>
  </ol>

  <h3>Exemples concrets</h3>
  <table>
    <tr>
      <th>Cas</th>
      <th>Calcul</th>
      <th>Résultat</th>
    </tr>
    <tr>
      <td>Cas 1</td>
      <td>Formule</td>
      <td>Résultat</td>
    </tr>
  </table>

  <h3>Cas particuliers & exceptions</h3>
  <ul>
    <li>Exception 1</li>
    <li>Exception 2</li>
  </ul>
</section>
```

---

## 🔐 PHASE 4 — SIGNAL DE CONFIANCE (E-E-A-T)

### Tâche 4.1: Page Méthodologie (nouvelle)

**Créer**: `pages/methodologie.html`

```html
<h1>Méthodologie & Fiabilité - Les Calculateurs</h1>

<section class="eeat-block">
  <h2>📊 Expertise</h2>
  <p>
    Tous nos calculateurs sont basés sur les barèmes officiels publiés par :
  </p>
  <ul>
    <li>Service-public.fr (données gouvernementales)</li>
    <li>INSEE (statistiques officielles)</li>
    <li>Ministères concernés (travail, finances, etc.)</li>
  </ul>
</section>

<section class="eeat-block">
  <h2>🔍 Expérience</h2>
  <p>
    Les Calculateurs depuis [année] : [X] millions d'utilisateurs, [X] millions
    de calculs.
  </p>
</section>

<section class="eeat-block">
  <h2>⚖️ Autorité</h2>
  <ul>
    <li>Mise à jour annuelle des barèmes</li>
    <li>Vérification par experts du domaine</li>
    <li>Conformité légale garantie</li>
  </ul>
</section>

<section class="eeat-block">
  <h2>✅ Fiabilité</h2>
  <ul>
    <li>Audits réguliers de précision</li>
    <li>Feedback utilisateurs intégrés</li>
    <li>Corrections immédiate si anomalie détectée</li>
  </ul>
</section>
```

### Tâche 4.2: Page Sources (nouvelle)

**Créer**: `pages/sources.html`

```html
<h1>Sources & Références - Les Calculateurs</h1>

<section>
  <h2>🏛️ Données gouvernementales officielles</h2>
  <ul>
    <li>
      <a href="https://www.service-public.fr">Service-public.fr</a> - État
      français
    </li>
    <li>
      <a href="https://www.data.gouv.fr">Data.gouv.fr</a> - Plateforme ouverte
    </li>
    <li><a href="https://www.insee.fr">INSEE</a> - Institut statistique</li>
  </ul>
</section>

<section>
  <h2>📋 Barèmes professionnels</h2>
  <ul>
    <li>Chambre des Notaires France - Barèmes notariaux</li>
    <li>URSSAF - Cotisations sociales</li>
    <li>Administrations fiscales - Impôts</li>
  </ul>
</section>

<section>
  <h2>📅 Dernière mise à jour</h2>
  <p>Tous les barèmes sont vérifiés et mis à jour en [MOIS] de chaque année.</p>
  <p><strong>Prochaine mise à jour : [DATE]</strong></p>
</section>
```

---

## 🚀 PHASE 5 — ACTIONS CONCRÈTES (SEMAINE 1)

### Timeline d'implémentation

| Phase | Tâche                                                | Ordre | Priorité  |
| ----- | ---------------------------------------------------- | ----- | --------- |
| 1     | Ajouter question + résumé IA sur 10 pages simulateur | 1-10  | 🔴 HAUTE  |
| 1     | Ajouter bloc "Sources vérifiables"                   | 11-20 | 🔴 HAUTE  |
| 2     | Ajouter schémas JSON (Calculator + FAQPage)          | 21-30 | 🟠 MEDIUM |
| 3     | Créer 2 pages réponse directe                        | 31-32 | 🟠 MEDIUM |
| 4     | Créer page Méthodologie                              | 33    | 🟠 MEDIUM |
| 4     | Créer page Sources                                   | 34    | 🟠 MEDIUM |

---

## 📝 Checklist d'implémentation

### PHASE 1 - JOUR 1-2

- [ ] **notaire.html**: Ajouter H2 question + AI summary + sources
- [ ] **pret.html**: Ajouter H2 question + AI summary + sources
- [ ] **plusvalue.html**: Ajouter H2 question + AI summary + sources
- [ ] **impot.html**: Ajouter H2 question + AI summary + sources
- [ ] **salaire.html**: Ajouter H2 question + AI summary + sources

### PHASE 1 - JOUR 3

- [ ] **taxe.html**: Ajouter H2 question + AI summary + sources
- [ ] **ik.html**: Ajouter H2 question + AI summary + sources
- [ ] **travail.html**: Ajouter H2 question + AI summary + sources
- [ ] **ponts.html**: Ajouter H2 question + AI summary + sources
- [ ] **charges.html**: Ajouter H2 question + AI summary + sources

### PHASE 2 - JOUR 4-5

- [ ] Ajouter schémas Calculator à toutes les pages
- [ ] Vérifier validation JSON-LD (https://validator.schema.org)
- [ ] Ajouter bloc "Données utilisées pour ce calcul"

### PHASE 3 - JOUR 6

- [ ] Créer page réponse directe #1
- [ ] Créer page réponse directe #2

### PHASE 4 - JOUR 7

- [ ] Créer page Méthodologie
- [ ] Créer page Sources
- [ ] Lier ces pages depuis pages simulateur

---

## 🎯 Résultats attendus

**Court terme (2-4 semaines):**

- ✅ Pages reconnaissables par IA crawlers
- ✅ Meilleure lisibilité des données structurées
- ✅ Position + haute dans réponses Perplexity/SGE

**Moyen terme (1-2 mois):**

- 📈 Citations par moteurs IA (Google SGE, Bing Copilot)
- 📈 Trafic qualifié depuis réponses IA
- 📈 Crédibilité renforcée (E-E-A-T)

**Long terme:**

- 🚀 Position de référence sur requêtes calcul
- 🚀 Trafic stable et croissant d'IA
- 🚀 Autorité thématique confirmée

---

## ⚙️ Notes techniques

### CSS à ajouter (tailwind.css)

```css
.ai-intro {
  @apply bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-6;
}
.ai-summary {
  @apply bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500 mb-6;
}
.ai-sources {
  @apply bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-6;
}
.ai-calculation-data {
  @apply bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500 mb-6;
}
.ai-answer-block {
  @apply max-w-prose mx-auto space-y-4;
}
.ai-response {
  @apply text-sm text-gray-700 font-medium;
}
.eeat-block {
  @apply mb-8 p-6 bg-white border rounded-lg;
}
```

---

**Prochaine étape**: Commencer PHASE 1 - notaire.html
