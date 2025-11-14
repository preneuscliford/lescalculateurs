## Diagnostic
- Le script inline du mini‑calculateur utilise des imports dynamiques.
- En production (`dist/assets`), les exports de modules sont minifiés (ex: `CalculatorFrame` → `C`, `formatCurrency` → `f`). La destructuration `{ CalculatorFrame }` / `{ formatCurrency }` / `{ baremes }` peut devenir `undefined`.
- Dans `src/pages/blog/departements/*.html`, j’ai déjà remplacé la destructuration par une résolution robuste (fallback sur `.C`/`.default` et `.f`). Mais vos pages `dist` affichent encore l’ancienne destructuration.
- Le bouton passe à « Chargement… » et reste bloqué car une exception se produit avant création du calculateur.

## Plan d’actions
1. **Propager le correctif vers `dist/`**
   - Re‑copier les pages SEO actualisées vers `dist/pages/blog/departements/` (en gardant la réécriture des chemins `main.ts` et des imports dynamiques vers `assets`).
   - Vérifier que le bloc script inline des pages `dist` contient bien:
     - `const [cfMod, mainMod, dataMod] = await Promise.all([...]);`
     - `const CalculatorFrame = cfMod.CalculatorFrame || cfMod.C || cfMod.default;`
     - `const formatCurrency = mainMod.formatCurrency || mainMod.f || (…);`
     - `const baremes = dataMod.baremes || dataMod.default;`
   - Valider que le bouton est réactivé après succès et en cas d’erreur (texte « Réessayer »).

2. **Filets de sécurité supplémentaires**
   - Adapter `scripts/copy-seo-pages.js` pour transformer l’ancienne destructuration s’il en reste (regex ciblée), afin d’éviter tout reliquat sur certaines pages.
   - S’assurer que les imports dynamiques sont bien réécrits vers `../../../assets/*.js` (déjà en place) et qu’aucun import `.ts` ne subsiste.

3. **Vérifications ciblées**
   - Ouvrir `dist/pages/blog/departements/frais-notaire-971.html` (DOM/TOM) et un département métropolitain (ex: `75`) et tester:
     - Clic « Calculer vos frais ici »: le mini‑calculateur apparaît.
     - Le bouton redevient actif (« Calculer vos frais ici ») après insertion.
     - Les liens « Voir aussi » ne sont pas vides (fallback Outre‑mer actif).

## Résultat attendu
- Plus aucun blocage sur « Chargement… » au clic.
- Mini‑calculateur fonctionnel sur toutes les pages départementales (dev et prod).
- Imports dynamiques robustes aux exports minifiés.

Souhaitez‑vous que j’exécute ces étapes maintenant (recopie des pages et ajustement anti‑régression), puis je vous montre les vérifications sur 2–3 pages ?