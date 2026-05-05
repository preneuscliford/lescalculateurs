/**
 * COFIDIS Affiliate Widget Component
 * Réutilisable sur plusieurs pages
 *
 * Usage:
 * <div id="cofidis-widget"
 *      data-product="PSM"
 *      data-page="pret"
 *      data-amount="250000"
 *      data-duration="240">
 * </div>
 *
 * new CofidisWidget('cofidis-widget');
 */

interface CofidisWidgetConfig {
  product: "PSM" | "Accessio" | "RachatCredit"; // PSM = Prêt Personnel, Accessio = Crédit Renouvelable
  page: "pret" | "notaire" | "charges" | "salaire"; // Page d'intégration
  amount?: number; // Montant par défaut
  duration?: number; // Durée par défaut (mois)
  rate?: number; // Taux estimé par défaut
  ctaText?: string; // Texte du bouton CTA
  ctaVariant?: "urgency" | "benefit" | "trust"; // Variante CTA pour A/B testing
}

export class CofidisWidget {
  private config: Required<CofidisWidgetConfig>;
  private container: HTMLElement;

  constructor(containerId: string, userConfig?: Partial<CofidisWidgetConfig>) {
    this.container = document.getElementById(containerId) || document.body;

    // Première passe: extraire product et page pour getDefaultCtaText
    const product = (this.container.dataset.product as any) || "PSM";
    const page = (this.container.dataset.page as any) || "pret";
    const defaultCtaText = this.getDefaultCtaTextFor(product, page);

    // Configuration par défaut + overrides
    this.config = {
      product,
      page,
      amount: parseInt(this.container.dataset.amount || "250000"),
      duration: parseInt(this.container.dataset.duration || "240"),
      rate: parseFloat(this.container.dataset.rate || "3.5"),
      ctaText: this.container.dataset.ctaText || defaultCtaText,
      ctaVariant: (this.container.dataset.ctaVariant as any) || "urgency",
      ...userConfig,
    };

    this.render();
    this.attachEventListeners();
  }

  private getDefaultCtaText(): string {
    const ctaMap: Record<string, Record<string, string>> = {
      PSM: {
        pret: "🚀 Obtenir mon offre Cofidis PSM",
        notaire: "💳 Demander financement COFIDIS",
        charges: "💰 Réduire mes dépenses",
        salaire: "✨ Explorer financement",
      },
      Accessio: {
        pret: "🔄 Crédit renouvelable COFIDIS",
        notaire: "💳 Accessio - Crédit flex",
        charges: "💰 Accessio jusqu'à 6 000€",
        salaire: "✨ Petit crédit rapide",
      },
      RachatCredit: {
        pret: "📉 Rachat crédit COFIDIS",
        notaire: "💼 Regrouper vos crédits",
        charges: "💰 Réduire vos mensualités",
        salaire: "✨ Consolidation rapide",
      },
    };

    return ctaMap[this.config.product]?.[this.config.page] || "Obtenir offre COFIDIS";
  }

  private getDefaultCtaTextFor(product: string, page: string): string {
    const ctaMap: Record<string, Record<string, string>> = {
      PSM: {
        pret: "🚀 Obtenir mon offre Cofidis PSM",
        notaire: "💳 Demander financement COFIDIS",
        charges: "💰 Réduire mes dépenses",
        salaire: "✨ Explorer financement",
      },
      Accessio: {
        pret: "🔄 Crédit renouvelable COFIDIS",
        notaire: "💳 Accessio - Crédit flex",
        charges: "💰 Accessio jusqu'à 6 000€",
        salaire: "✨ Petit crédit rapide",
      },
      RachatCredit: {
        pret: "📉 Rachat crédit COFIDIS",
        notaire: "💼 Regrouper vos crédits",
        charges: "💰 Réduire vos mensualités",
        salaire: "✨ Consolidation rapide",
      },
    };

    return ctaMap[product]?.[page] || "Obtenir offre COFIDIS";
  }

  private getCtaButtonClass(): string {
    const baseClass = "w-full py-3 px-4 rounded-lg font-semibold text-white transition-all";

    const variantClass = {
      urgency: "bg-orange-500 hover:bg-orange-600",
      benefit: "bg-green-500 hover:bg-green-600",
      trust: "bg-blue-500 hover:bg-blue-600",
    };

    return `${baseClass} ${variantClass[this.config.ctaVariant]}`;
  }

  private getProductBadges(): string {
    const productMap: Record<string, string[]> = {
      PSM: ["PSM (Prêt Personnel)", "Rachat de crédit", "Accessio (Crédit Renouvelable)"],
      Accessio: ["Accessio (Crédit Renouvelable)", "PSM (Prêt Personnel)", "Rachat de crédit"],
      RachatCredit: ["Rachat de Crédit", "PSM (Prêt Personnel)", "Accessio (Crédit Renouvelable)"],
    };

    return productMap[this.config.product]
      .map(
        (p) =>
          `<span class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2 mb-2 font-medium">${p}</span>`,
      )
      .join("");
  }

  private render(): void {
    const html = `
      <div class="cofidis-widget mt-8 p-6 bg-white rounded-lg shadow-lg text-gray-900">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <img src="/assets/logo_cofidis.svg" alt="COFIDIS" class="h-8 object-contain" />
          <h3 class="text-lg font-bold text-gray-900">
            ${this.getProductTitle()}
          </h3>
        </div>

        <!-- Description -->
        <p class="text-blue-600 text-sm mb-5 font-medium">
          ${this.getProductDescription()}
        </p>

        <!-- Form Fields -->
        <div class="space-y-3 mb-5">
          <div>
            <label class="block text-xs font-semibold mb-1 text-blue-700">Montant (€)</label>
            <input 
              type="number" 
              class="cofidis-amount w-full px-3 py-2 rounded bg-gray-50 text-gray-900 border border-gray-300 font-semibold"
              value="${this.config.amount}"
              min="500"
              max="35000"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold mb-1 text-blue-700">Durée (mois)</label>
              <input 
                type="number" 
                class="cofidis-duration w-full px-3 py-2 rounded bg-gray-50 text-gray-900 border border-gray-300 font-semibold"
                value="${this.config.duration}"
                min="6"
                max="84"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1 text-blue-700">Taux est. (%)</label>
              <input 
                type="number" 
                class="cofidis-rate w-full px-3 py-2 rounded bg-gray-50 text-gray-900 border border-gray-300 font-semibold"
                step="0.1"
                value="${this.config.rate}"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <button class="cofidis-cta-btn ${this.getCtaButtonClass()} mb-4">
          ${this.config.ctaText}
        </button>

        <!-- Product Badges -->
        <div class="text-xs opacity-90 pt-3 border-t border-gray-300">
          <p class="font-semibold mb-2 text-gray-700">Produits disponibles:</p>
          <div>${this.getProductBadges()}</div>
        </div>

        <!-- Disclaimer -->
        <div class="text-xs opacity-75 mt-4 pt-3 border-t border-gray-200 text-gray-600 leading-relaxed space-y-1">
          <p class="font-medium text-gray-700">💡 Offre sans engagement. Sous réserve d'acceptation par Cofidis.</p>
          <p>Taux et mensualités indicatifs, personnalisés selon votre profil.</p>
          <p>Vous disposez d'un droit de rétractation de 14 jours.</p>
          <p>Crédit réservé aux personnes physiques majeures.</p>
        </div>
        
      </div>
    `;

    this.container.innerHTML = html;
  }

  private getProductTitle(): string {
    const titles: Record<string, Record<string, string>> = {
      PSM: {
        pret: "Prêt Personnel de 500€ à 35 000€",
        notaire: "Financer vos frais d'acquisition",
        charges: "Financer vos projets",
        salaire: "Prêt personnel rapide",
      },
      Accessio: {
        pret: "Crédit Renouvelable - 500€ à 6 000€",
        notaire: "Accessio - Crédit flex",
        charges: "Accessio - Paiements flexibles",
        salaire: "Crédit renouvelable rapide",
      },
      RachatCredit: {
        pret: "Rachat de Crédit COFIDIS",
        notaire: "Regrouper vos crédits",
        charges: "Réduire vos mensualités",
        salaire: "Rachat de crédit COFIDIS",
      },
    };

    return titles[this.config.product]?.[this.config.page] || "COFIDIS - Financement";
  }

  private getProductDescription(): string {
    const descriptions: Record<string, Record<string, string>> = {
      PSM: {
        pret: "✅ Montant flexible | ✅ 6 à 84 mois | ✅ Réponse rapide",
        notaire: "✅ Jusqu'à 35 000€ | ✅ Acceptation rapide | ✅ Sans frais de dossier",
        charges: "✅ Pour tous vos besoins | ✅ Signature électronique | ✅ Fonds en 24h",
        salaire: "✅ Prêt personnel adapté | ✅ Taux compétitif | ✅ Quick approval",
      },
      Accessio: {
        pret: "✅ Crédit renouvelable flexible | ✅ Jusqu'à 6 000€ | ✅ Utilisez-le quand vous le souhaitez",
        notaire: "✅ Utilisable immédiatement | ✅ Jusqu'à 6 000€ | ✅ Paiements flexibles",
        charges: "✅ Utiliser au besoin | ✅ Très flexibilité | ✅ Remboursement personnalisé",
        salaire: "✅ Flexible et rapide | ✅ Montants jusqu'à 6 000€ | ✅ Accès instantané",
      },
      RachatCredit: {
        pret: "✅ Un taux unique | ✅ Une mensualité réduite | ✅ Un seul interlocuteur",
        notaire: "✅ Réduisez vos dépenses | ✅ Simplifiez vos crédits | ✅ Taux préférentiel",
        charges: "✅ Jusqu'à -40% de mensualités | ✅ Remboursement allongé | ✅ Effet immédiat",
        salaire: "✅ Consolidation intelligente | ✅ Économies immédiates | ✅ Gestion simplifiée",
      },
    };

    return (
      descriptions[this.config.product]?.[this.config.page] || "Solution de financement adaptée"
    );
  }

  private attachEventListeners(): void {
    const ctaBtn = this.container.querySelector(".cofidis-cta-btn") as HTMLButtonElement;

    if (ctaBtn) {
      ctaBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCtaClick();
      });
    }

    // Update event listeners for form inputs
    this.container
      .querySelectorAll(".cofidis-amount, .cofidis-duration, .cofidis-rate")
      .forEach((input) => {
        input.addEventListener("change", () => {
          this.syncConfigValues();
        });
      });
  }

  private syncConfigValues(): void {
    const amountInput = this.container.querySelector(".cofidis-amount") as HTMLInputElement;
    const durationInput = this.container.querySelector(".cofidis-duration") as HTMLInputElement;
    const rateInput = this.container.querySelector(".cofidis-rate") as HTMLInputElement;

    if (amountInput) this.config.amount = parseInt(amountInput.value);
    if (durationInput) this.config.duration = parseInt(durationInput.value);
    if (rateInput) this.config.rate = parseFloat(rateInput.value);

    // Dispatch custom event for parent components
    window.dispatchEvent(
      new CustomEvent("cofidis-updated", {
        detail: { config: this.config },
      }),
    );
  }

  private handleCtaClick(): void {
    const amount = this.container.querySelector(".cofidis-amount") as HTMLInputElement;
    const duration = this.container.querySelector(".cofidis-duration") as HTMLInputElement;
    const rate = this.container.querySelector(".cofidis-rate") as HTMLInputElement;

    const values = {
      product: this.config.product,
      page: this.config.page,
      amount: amount?.value || this.config.amount,
      duration: duration?.value || this.config.duration,
      rate: rate?.value || this.config.rate,
      timestamp: new Date().toISOString(),
    };

    // Log pour analytics/tracking
    console.log("📊 COFIDIS Widget CTA clicked:", values);

    // Dispatch event for tracking
    window.dispatchEvent(new CustomEvent("cofidis-cta-click", { detail: values }));

    // TODO: Redirect vers formulaire Cofidis avec paramètres
    // Exemple: window.location.href = `https://cofidis.fr/...?amount=${values.amount}&...`

    // Pour now, montrer une alerte demo
    alert(
      `✅ Redirection vers Cofidis...\n\nProduit: ${this.config.product}\nMontant: ${values.amount}€\nDurée: ${values.duration} mois`,
    );
  }

  // Méthodes publiques pour l'ajustement
  public setAmount(amount: number): void {
    const input = this.container.querySelector(".cofidis-amount") as HTMLInputElement;
    if (input) input.value = amount.toString();
    this.config.amount = amount;
  }

  public setDuration(duration: number): void {
    const input = this.container.querySelector(".cofidis-duration") as HTMLInputElement;
    if (input) input.value = duration.toString();
    this.config.duration = duration;
  }

  public setCtaVariant(variant: "urgency" | "benefit" | "trust"): void {
    this.config.ctaVariant = variant;
    this.render();
    this.attachEventListeners();
  }

  public updateConfig(config: Partial<CofidisWidgetConfig>): void {
    this.config = { ...this.config, ...config };
    this.render();
    this.attachEventListeners();
  }
}
