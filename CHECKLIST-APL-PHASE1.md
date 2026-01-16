# ✅ CHECKLIST DÉTAILLÉE — APL PHASE 1 (8 HEURES)

## 🎯 Objectif

Transformer APL de "65% conforme" → **"95% conforme + ready-to-clone"**

---

## 📋 TÂCHES DÉTAILLÉES

### 1️⃣ PRESETS ENFANTS (1h)

**Fichier** : [src/pages/scripts/apl-script.ts](src/pages/scripts/apl-script.ts)

#### À faire

- [ ] Ajouter 4 boutons rapides **0 / 1 / 2 / 3 enfants** au-dessus du champ "nombre d'enfants"
- [ ] UI: Badge buttons (gris sauf celui sélectionné = bleu/purple)
- [ ] Chaque clic rempli directement le champ `<input id="apl-enfants">`
- [ ] Au clic, déclenche recalcul auto (optionnel mais meilleur UX)

#### Code pattern

```html
<!-- Avant le champ nombre d'enfants -->
<div class="mb-4">
  <label class="block text-sm font-semibold text-gray-700 mb-2">
    👶 Nombre d'enfants (rapide)
  </label>
  <div class="flex gap-2 mb-3">
    <button
      data-enfants="0"
      class="preset-btn px-3 py-2 bg-gray-200 rounded hover:bg-blue-300 text-sm font-semibold"
    >
      0 enfant
    </button>
    <button
      data-enfants="1"
      class="preset-btn px-3 py-2 bg-gray-200 rounded hover:bg-blue-300 text-sm font-semibold"
    >
      1 enfant
    </button>
    <button
      data-enfants="2"
      class="preset-btn px-3 py-2 bg-gray-200 rounded hover:bg-blue-300 text-sm font-semibold"
    >
      2 enfants
    </button>
    <button
      data-enfants="3"
      class="preset-btn px-3 py-2 bg-gray-200 rounded hover:bg-blue-300 text-sm font-semibold"
    >
      3+ enfants
    </button>
  </div>
</div>
```

#### Event listener

```typescript
document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const enfants = e.target.dataset.enfants;
    document.getElementById("apl-enfants").value = enfants;
    // Optionnel : recalcul auto
    // triggerCalcul();
  });
});
```

**Durée** : 45min (incluant tests)

---

### 2️⃣ BOUTONS ±REVENUS (2h)

**Fichier** : [src/pages/scripts/apl-script.ts](src/pages/scripts/apl-script.ts)

#### À faire

- [ ] Ajouter 4 boutons **+200€ / -200€ / +500€ / -500€** à côté du champ "revenus"
- [ ] Chaque clic **ajoute/soustrait** le montant au champ courant
- [ ] Validation : Montant ≥ 0 (min 500€ probable)
- [ ] Feedback visuel : Clic = flash bleu puis gris

#### Code pattern

```html
<!-- À côté du champ revenus -->
<div class="flex gap-1 text-xs mt-1">
  <button
    type="button"
    class="revenue-delta px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-green-700 font-semibold"
    data-delta="+200"
  >
    +200€
  </button>
  <button
    type="button"
    class="revenue-delta px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700 font-semibold"
    data-delta="-200"
  >
    -200€
  </button>
  <button
    type="button"
    class="revenue-delta px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-green-700 font-semibold"
    data-delta="+500"
  >
    +500€
  </button>
  <button
    type="button"
    class="revenue-delta px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700 font-semibold"
    data-delta="-500"
  >
    -500€
  </button>
</div>
```

#### Event listener

```typescript
document.querySelectorAll(".revenue-delta").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const delta = parseInt(e.target.dataset.delta);
    const revenusInput = document.getElementById(
      "apl-revenus"
    ) as HTMLInputElement;
    const newValue = Math.max(0, parseInt(revenusInput.value) + delta);
    revenusInput.value = String(newValue);
    revenusInput.focus(); // Feedback
  });
});
```

**Durée** : 1h30 (incluant styling + tests)

---

### 3️⃣ LOYER VARIABLE (3h)

**Fichiers** :

- [src/pages/apl.html](src/pages/apl.html) (formulaire)
- [src/pages/scripts/apl-script.ts](src/pages/scripts/apl-script.ts) (calcul)
- [src/utils/comparaisonAPL.ts](src/utils/comparaisonAPL.ts) (stockage comparaison)

#### À faire

- [ ] **Ajouter input** : "Loyer estimé (€/mois)" au formulaire principal
- [ ] **Récupérer valeur** dans calcul APL
- [ ] **Passer au comparateur** : `values.loyer`
- [ ] **Afficher dans tableau** : nouvelle ligne "Loyer mensuel"
- [ ] **Inclure dans delta** : Si loyer ±200€ → APL change

#### Étapes code

**1. Formulaire HTML** ([apl.html](src/pages/apl.html))

```html
<div class="form-group">
  <label for="apl-loyer" class="block text-sm font-semibold text-gray-700">
    🏠 Loyer estimé (€/mois)
  </label>
  <input
    type="number"
    id="apl-loyer"
    placeholder="700"
    min="0"
    step="50"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
</div>
```

**2. Récupérer dans apl-script.ts** (lors du calcul)

```typescript
const loyer = parseFloat(document.getElementById('apl-loyer').value) || 0;

// ... calcul APL ... //

const mappedValues = {
  situation,
  revenus: revenu,
  nombre_enfants: enfants,
  type_logement,
  zone: ...,
  loyer, // ← NOUVEAU
};
```

**3. Stocker dans comparaisonAPL.ts**

```typescript
export interface CalculAPL {
  // ... existant ...
  loyer: number; // ← NOUVEAU
}

// Dans ajouterCalcul()
const calcul: CalculAPL = {
  // ... existant ...
  loyer: values.loyer,
};
```

**4. Afficher dans tableau**

```typescript
// Dans genererHTML() de ComparaisonAPL
const tableauHTML = `
  <!-- existant -->
  <tr class="hover:bg-purple-50">
    <td class="p-3 font-semibold border-r border-gray-200">🏠 Loyer (€/mois)</td>
    ${this.calculs
      .map(
        (c) =>
          `<td class="p-3 text-center text-gray-700 border-r border-gray-200">${formatCurrency(
            c.loyer
          )}</td>`
      )
      .join("")}
  </tr>
`;
```

**5. Presets loyer** (bonus UX)

```html
<!-- Buttons rapides pour loyer -->
<div class="flex gap-2 text-xs mt-1">
  <button
    type="button"
    class="loyer-preset px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
    data-loyer="500"
  >
    500€
  </button>
  <button
    type="button"
    class="loyer-preset px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
    data-loyer="700"
  >
    700€
  </button>
  <button
    type="button"
    class="loyer-preset px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
    data-loyer="900"
  >
    900€
  </button>
  <button
    type="button"
    class="loyer-preset px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
    data-loyer="1100"
  >
    1100€
  </button>
</div>
```

**Durée** : 2h30 (incluant tests + validations)

---

### 4️⃣ MAX 5 SCÉNARIOS (1h)

**Fichier** : [src/utils/comparaisonAPL.ts](src/utils/comparaisonAPL.ts)

#### À faire

- [ ] Modifier `private maxComparaisons = 3` → **`= 5`**
- [ ] **Optionnel** : Ajouter scroll horizontal si tableau > viewport
- [ ] Tester sur mobile (ne doit pas casser)

#### Code

```typescript
class ComparaisonAPL {
  private maxComparaisons = 5; // WAS 3
}
```

#### CSS (si scroll needed)

```css
.overflow-x-auto {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Mobile: afficher 2.5 colonnes max */
@media (max-width: 640px) {
  table {
    font-size: 0.75rem;
  }
  td,
  th {
    padding: 0.5rem;
  }
}
```

**Durée** : 45min

---

### 5️⃣ INSIGHTS AUTOMATIQUES (1h)

**Fichier** : [src/utils/comparaisonAPL.ts](src/utils/comparaisonAPL.ts)

#### À faire

- [ ] Ajouter fonction `genererInsights()` qui analyse deltas
- [ ] Détecter **quelle variable** crée le plus d'écart
- [ ] Générer phrase auto : "Vous gagnez X€ en changeant Y"
- [ ] Afficher en bloc bleu/vert sous le tableau

#### Code pattern

```typescript
private genererInsights(): string {
  if (this.calculs.length < 2) return "";

  const first = this.calculs[0];
  const max = Math.max(...this.calculs.map(c => c.apl));
  const min = Math.min(...this.calculs.map(c => c.apl));
  const maxDelta = max - min;

  const bestScenario = this.calculs.find(c => c.apl === max);
  const worstScenario = this.calculs.find(c => c.apl === min);

  let insight = "";

  // Détecter quelle variable diffère
  if (bestScenario.situation !== worstScenario.situation) {
    insight = `💡 ${bestScenario.situation} vous rapporte <strong>+${formatCurrency(maxDelta)}/mois</strong> vs ${worstScenario.situation}`;
  } else if (bestScenario.zone !== worstScenario.zone) {
    insight = `💡 Zone ${bestScenario.zone.split(' ')[1]} vous rapporte <strong>+${formatCurrency(maxDelta)}/mois</strong>`;
  } else if (bestScenario.loyer !== worstScenario.loyer) {
    insight = `💡 Un loyer moins élevé de ${formatCurrency(bestScenario.loyer - worstScenario.loyer)} vous rapporte <strong>+${formatCurrency(maxDelta)}/mois</strong>`;
  }

  return insight ? `<div class="p-3 bg-green-50 border-l-4 border-green-500 text-green-800 mt-4">${insight}</div>` : "";
}

// Dans genererHTML(), ajouter après tableau :
private genererHTML(): string {
  const insights = this.genererInsights();
  return `${tableHTML}${insights}`;
}
```

**Durée** : 1h (incluant tests)

---

## 🧪 TESTS REQUIS

- [ ] **Desktop** : 1920x1080 + tableau lisible, boutons accessibles
- [ ] **Mobile** : iPhone SE (375px) + pas de débordement
- [ ] **Interaction** :
  - [ ] Presets enfants : remplissent le champ
  - [ ] ±Revenus : addition/soustraction correcte, min 0
  - [ ] Loyer : calcul correct, intégré à comparaison
  - [ ] Max 5 : 5 scénarios affichés, 6ème rejetée avec alerte
  - [ ] Insights : texte autogénéré correct
- [ ] **Persistance** : localStorage rechargé après F5
- [ ] **Performance** : Tableau 5 colonnes < 500ms rendu

---

## 📝 DOCUMENTATION À CRÉER

- [ ] **README-APL-COMPARATEUR.md** : Architecture + extension guide
- [ ] **PATTERN-COMPARATEUR.ts** : Template générique pour Notaire/Prêt/Salaire
- [ ] **EXEMPLES-SCENARIO.json** : 5-10 scenarios pré-cuits (pour demo)

---

## 🎁 LIVRABLES À LA FIN

```
✅ APL PHASE 1 COMPLETE
├─ Presets enfants (0/1/2/3)
├─ Boutons ±revenus (+200, -200, +500, -500)
├─ Loyer variable (input + display)
├─ Max 5 scénarios
├─ Insights automatiques
├─ Tests tous navigateurs
├─ Documentation architecture
└─ Ready-to-clone pattern
```

---

## ⏱️ ESTIMATION TEMPS

| Task             | Temps   | Notes                      |
| ---------------- | ------- | -------------------------- |
| Presets enfants  | 45min   | Copy-paste UI, simple      |
| Boutons ±revenus | 1h30    | Styling + tests            |
| Loyer variable   | 2h30    | Plus complexe (3 fichiers) |
| Max 5 scénarios  | 45min   | 1 ligne code + CSS mobile  |
| Insights auto    | 1h      | Logique analyse deltas     |
| **TOTAL**        | **~8h** | Avec breaks                |

---

## 🚀 DÉMARRAGE IMMÉDIAT

```bash
# 1. Open VS Code
# 2. File → src/pages/scripts/apl-script.ts
# 3. Start with Task 1 (Presets enfants)
# 4. Test chaque feature après implémentation
# 5. Commit git avant Task suivante
```

---

**Status** : ✅ **READY TO START**
