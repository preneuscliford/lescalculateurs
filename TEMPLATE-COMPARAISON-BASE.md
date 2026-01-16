# 🧬 TEMPLATE GÉNÉRALISÉ — ComparaisonBase.ts

> **Objectif** : Une seule architecture = Copier-coller pour Notaire, Prêt, Salaire

---

## 📋 STRUCTURE GÉNÉRIQUE

```typescript
/**
 * ComparaisonBase.ts - Template réutilisable pour tous les comparateurs
 *
 * Utilisation:
 * 1. Hériter: class ComparaisonNotaire extends ComparaisonBase { }
 * 2. Implémenter: calclerResult(variables) { return montant; }
 * 3. Customizer: titre, labels, couleurs
 */

export interface ScenarioComparaison {
  id: string;
  timestamp: number;
  label: string;
  emoji: string;
  variables: Record<string, any>;
  result: number; // Montant principal (APL, frais, mensualité, etc)
  resultLabel?: string; // "APL", "Frais de notaire", "Mensualité", etc
}

export interface ConfigComparaison {
  // UI
  titre: string; // "📊 Comparaison APL", "📊 Comparaison Frais", etc
  couleurPrimaire: string; // "purple", "blue", "green", etc (Tailwind)
  emoji: string; // Pour le bloc principal

  // Données
  maxScenarios: number; // Default: 5
  storageKey: string; // "comparaison_apl", "comparaison_notaire", etc

  // Labels
  labelVariable: Record<string, string>; // Traduction des variables
  labelResult: string; // "APL mensuelle", "Frais de notaire", etc

  // Callback
  calculerResult: (variables: Record<string, any>) => number;
}

export class ComparaisonBase {
  protected scenarios: ScenarioComparaison[] = [];
  protected config: ConfigComparaison;
  protected containerId: string;

  constructor(containerId: string, config: ConfigComparaison) {
    this.containerId = containerId;
    this.config = config;
    this.chargerDuStorage();
  }

  /**
   * Ajoute un scénario à la comparaison
   */
  public ajouterScenario(
    label: string,
    emoji: string,
    variables: Record<string, any>
  ): void {
    if (this.scenarios.length >= this.config.maxScenarios) {
      alert(
        `Vous ne pouvez comparer que ${this.config.maxScenarios} scénarios maximum`
      );
      return;
    }

    const result = this.config.calculerResult(variables);

    const scenario: ScenarioComparaison = {
      id: `scenario-${Date.now()}`,
      timestamp: Date.now(),
      label,
      emoji,
      variables,
      result,
    };

    this.scenarios.push(scenario);
    this.afficherComparaison();
    this.sauvegarderDuStorage();
  }

  /**
   * Supprime un scénario
   */
  public supprimerScenario(id: string): void {
    this.scenarios = this.scenarios.filter((s) => s.id !== id);
    this.afficherComparaison();
    this.sauvegarderDuStorage();
  }

  /**
   * Réinitialise tous les scénarios
   */
  public reinitialiser(): void {
    this.scenarios = [];
    localStorage.removeItem(this.config.storageKey);
    const container = document.getElementById(this.containerId);
    if (container) container.innerHTML = "";
    this.masquerComparaison();
  }

  /**
   * Génère le tableau HTML
   */
  protected genererTableau(): string {
    if (this.scenarios.length === 0) return "";

    const maxResult = Math.max(...this.scenarios.map((s) => s.result));
    const minResult = Math.min(...this.scenarios.map((s) => s.result));

    const headers = this.scenarios
      .map(
        (s) =>
          `<th class="p-3 text-center border-r border-gray-200">
            <div class="text-2xl mb-1">${s.emoji}</div>
            <div class="text-xs font-semibold text-gray-700">${s.label}</div>
            <button onclick="window.comparaison.supprimerScenario('${s.id}')" 
              class="text-xs text-red-600 hover:text-red-800 mt-1">✕</button>
          </th>`
      )
      .join("");

    const lignes = this.scenarios
      .map((s, idx) => {
        const isMax = s.result === maxResult;
        const diff = idx === 0 ? 0 : s.result - this.scenarios[0].result;
        const diffPct =
          idx === 0
            ? 0
            : ((s.result - this.scenarios[0].result) /
                this.scenarios[0].result) *
              100;

        return `
          <td class="p-3 text-center font-bold text-lg ${
            isMax
              ? `bg-${this.config.couleurPrimaire}-100 text-${this.config.couleurPrimaire}-900`
              : ""
          } border-r border-gray-200">
            <div>${this.formatCurrency(s.result)}</div>
            ${
              idx > 0
                ? `<div class="text-xs text-${
                    diff > 0 ? "green" : "red"
                  }-600 mt-1">
              ${diff > 0 ? "+" : ""}${this.formatCurrency(diff)}
              <span class="text-xs">(${diff > 0 ? "+" : ""}${diffPct.toFixed(
                    1
                  )}%)</span>
            </div>`
                : ""
            }
          </td>`;
      })
      .join("");

    return `
      <div class="bg-white rounded-lg shadow-lg p-6 mt-8 border-2 border-${
        this.config.couleurPrimaire
      }-300">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">${this.config.emoji} ${
      this.config.titre
    }</h3>
          <button id="comparaison-reset" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm">
            🔄 Réinitialiser
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-${this.config.couleurPrimaire}-50">
                <th class="p-3 text-left font-semibold border-r border-gray-200">Critère</th>
                ${headers}
              </tr>
            </thead>
            <tbody>
              <tr class="hover:bg-${this.config.couleurPrimaire}-50 bg-white">
                <td class="p-3 font-bold border-r border-gray-200 text-lg">${
                  this.config.labelResult
                }</td>
                ${lignes}
              </tr>
              ${this.genererLignesVariables()}
            </tbody>
          </table>
        </div>
        
        ${this.genererInsights()}
      </div>
    `;
  }

  /**
   * Génère les lignes de variables
   * À personnaliser par héritage
   */
  protected genererLignesVariables(): string {
    return this.scenarios
      .map((_, idx) =>
        idx === 0
          ? `<tr class="hover:bg-gray-50"><td colspan="100" class="text-center text-gray-500 italic text-xs py-2">Personnalisez en héritage</td></tr>`
          : ""
      )
      .join("");
  }

  /**
   * Génère insights automatiques
   * À personnaliser par héritage
   */
  protected genererInsights(): string {
    if (this.scenarios.length < 2) return "";

    const max = Math.max(...this.scenarios.map((s) => s.result));
    const min = Math.min(...this.scenarios.map((s) => s.result));
    const delta = max - min;
    const deltaPercent = ((delta / min) * 100).toFixed(1);

    return `
      <div class="mt-6 p-4 bg-${
        this.config.couleurPrimaire
      }-50 rounded-lg border-l-4 border-${this.config.couleurPrimaire}-500">
        <h4 class="font-bold text-${
          this.config.couleurPrimaire
        }-900 mb-2">💡 Insights</h4>
        <p class="text-sm text-${this.config.couleurPrimaire}-800">
          <strong>Écart maximum</strong> : ${this.formatCurrency(
            delta
          )} (${deltaPercent}%)
        </p>
      </div>
    `;
  }

  /**
   * Utilitaires
   */
  protected formatCurrency(value: number): string {
    if (!value || isNaN(value)) return "0 €";
    return value.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    });
  }

  /**
   * Persistence
   */
  private sauvegarderDuStorage(): void {
    localStorage.setItem(
      this.config.storageKey,
      JSON.stringify(this.scenarios)
    );
  }

  private chargerDuStorage(): void {
    const data = localStorage.getItem(this.config.storageKey);
    if (data) this.scenarios = JSON.parse(data);
  }

  /**
   * Affichage
   */
  private afficherComparaison(): void {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.scenarios.length > 0) {
      container.innerHTML = this.genererTableau();
      document
        .getElementById("comparaison-reset")
        ?.addEventListener("click", () => {
          if (confirm("Êtes-vous sûr ? Cela supprimera tous les scénarios.")) {
            this.reinitialiser();
          }
        });
    }
  }

  private masquerComparaison(): void {
    const container = document.getElementById(this.containerId);
    if (container) container.innerHTML = "";
  }

  /**
   * Utilitaires publics
   */
  public getNombreScenarios(): number {
    return this.scenarios.length;
  }

  public exporterJSON(): string {
    return JSON.stringify(this.scenarios, null, 2);
  }

  public exporterURL(): string {
    const encoded = btoa(JSON.stringify(this.scenarios));
    return `?compare=${encoded}`;
  }
}
```

---

## 🚀 EXEMPLE D'UTILISATION — ComparaisonNotaire

```typescript
// comparaisonNotaire.ts
import { ComparaisonBase, ConfigComparaison } from "./ComparaisonBase";

export class ComparaisonNotaire extends ComparaisonBase {
  constructor(containerId: string) {
    const config: ConfigComparaison = {
      titre: "Comparaison Frais de Notaire",
      couleurPrimaire: "blue",
      emoji: "📋",
      maxScenarios: 5,
      storageKey: "comparaison_notaire",
      labelResult: "💰 Frais de notaire",
      labelVariable: {
        prix: "Prix du bien",
        type_bien: "Type",
        taux: "Taux",
        departement: "Département",
      },
      calculerResult: (variables) => {
        return this.calculerFraisNotaire(variables);
      },
    };

    super(containerId, config);
  }

  private calculerFraisNotaire(variables: Record<string, any>): number {
    const prix = variables.prix || 0;
    const taux = variables.taux === "reduit" ? 0.04 : 0.077;
    return prix * taux;
  }

  // Personnalisation: afficher les variables importantes
  protected genererLignesVariables(): string {
    return this.scenarios
      .map(
        (s) => `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-semibold border-r border-gray-200">Prix du bien</td>
          <td class="p-3 text-center">${this.formatCurrency(
            s.variables.prix
          )}</td>
        </tr>
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-semibold border-r border-gray-200">Type</td>
          <td class="p-3 text-center">${
            s.variables.type_bien === "neuf" ? "🏢 Neuf" : "🏠 Ancien"
          }</td>
        </tr>
      `
      )
      .join("");
  }

  protected genererInsights(): string {
    if (this.scenarios.length < 2) return "";

    const neuf = this.scenarios.find((s) => s.variables.type_bien === "neuf");
    const ancien = this.scenarios.find(
      (s) => s.variables.type_bien === "ancien"
    );

    if (neuf && ancien) {
      const economie = ancien.result - neuf.result;
      return `
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-bold text-blue-900 mb-2">💡 Économies potentielles</h4>
          <p class="text-sm text-blue-800">
            Acheter du <strong>neuf</strong> vous coûte <strong>${this.formatCurrency(
              Math.abs(economie)
            )} moins cher</strong> en frais de notaire
          </p>
        </div>
      `;
    }

    return super.genererInsights();
  }
}

// Usage dans notaire-script.ts:
const comparaison = new ComparaisonNotaire("notaire-comparaison");
window.comparaison = comparaison;

// Ajouter un scenario:
comparaison.ajouterScenario("Neuf 250k IDF", "🏢", {
  prix: 250000,
  type_bien: "neuf",
  taux: "standard",
  departement: "idf",
});
```

---

## 📝 CHECKLIST CLONAGE RAPIDE

Pour chaque **nouveau comparateur** (Frais, Prêt, Salaire) :

```
1. ✅ Créer classe héritière
   └─ class ComparaisonXXX extends ComparaisonBase { }

2. ✅ Implémenter calculerResult()
   └─ La logique métier spécifique

3. ✅ Personnaliser genererLignesVariables()
   └─ Afficher les variables importantes

4. ✅ Personnaliser genererInsights()
   └─ Insights pertinents au domaine

5. ✅ Implémenter dans le formulaire
   └─ Bouton "Ajouter à la comparaison" + modal

6. ✅ Tester localStorage + URL
   └─ Persistence et partage

7. ✅ Adapter CSS (couleur primaire)
   └─ blue/green/purple selon domaine

```

**Temps par comparateur** : 4-6h (vs 16-20h from scratch)

---

## 🎨 VARIANTES PAR DOMAINE

| Domaine | Couleur | Emoji | Max | storageKey            |
| ------- | ------- | ----- | --- | --------------------- |
| APL     | purple  | 💜    | 5   | `comparaison_apl`     |
| Notaire | blue    | 📋    | 5   | `comparaison_notaire` |
| Prêt    | green   | 🏦    | 5   | `comparaison_pret`    |
| Salaire | indigo  | 💰    | 5   | `comparaison_salaire` |

---

**Verdict** : 🎯 **Architecture scalable = 60% gain de temps** ✅
