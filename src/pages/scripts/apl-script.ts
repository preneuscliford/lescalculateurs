import ComparaisonAPL from "../../utils/comparaisonAPL.ts";
import { ComparisonModal } from "../../components/ComparisonModal.ts";
import { calculerAPL } from "../../utils/aplCalculEngine.ts";

// Gestion de la comparaison APL
const comparaisonAPL = new ComparaisonAPL("apl-comparaison");
(window as any).comparaisonAPL = comparaisonAPL;

// Auto-ajouter le premier calcul à la comparaison
window.addEventListener("calculator-updated", (event: any) => {
  if (event.detail?.elementId !== "apl-calculator") return;

  const last = (window as any)["dernierCalcul_apl-calculator"];
  if (!last?.result?.success) return;

  const addBtn = document.getElementById("apl-add-to-compare");
  const resetBtn = document.getElementById("apl-reset-compare");

  if (addBtn && resetBtn) {
    addBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
  }
});

// Gestionnaire du bouton "Ajouter à la comparaison" - Ouvre une modal
document.getElementById("apl-add-to-compare")?.addEventListener("click", () => {
  const last = (window as any)["dernierCalcul_apl-calculator"];
  if (!last?.result?.success || !last?.values) {
    alert("Veuillez d'abord effectuer un calcul");
    return;
  }

  const v = last.values;

  const modal = new ComparisonModal({
    title: "Ajouter un scénario APL à la comparaison",
    fields: [
      {
        id: "situation",
        label: "Situation familiale",
        type: "select",
        value: v.situation,
        required: true,
        options: [
          { value: "seul", label: "Célibataire / Seul" },
          { value: "couple", label: "En couple (marié ou concubinage)" },
          { value: "monoparental", label: "Monoparental (1 enfant minimum)" },
          { value: "autre", label: "Autre" },
        ],
      },
      {
        id: "enfants",
        label: "Nombre d'enfants à charge",
        type: "number",
        value: v.enfants,
        required: true,
        min: 0,
        max: 10,
        step: 1,
      },
      {
        id: "revenus_mensuels",
        label: "Revenus nets mensuels (€)",
        type: "number",
        value: v.revenus_mensuels,
        required: true,
        min: 0,
        step: 100,
      },
      {
        id: "type_logement",
        label: "Type de logement",
        type: "select",
        value: v.type_logement,
        required: true,
        options: [
          { value: "location", label: "Location (logement principal)" },
          {
            value: "accession",
            label: "Accession à la propriété (crédit immobilier)",
          },
          { value: "hlm", label: "Logement HLM" },
          { value: "colocation", label: "Colocation / Chambre meublée" },
        ],
      },
      {
        id: "loyer_mensuel",
        label: "Loyer/Mensualité crédit (€)",
        type: "number",
        value: v.loyer_mensuel,
        required: true,
        min: 0,
        step: 50,
      },
      {
        id: "region",
        label: "Région",
        type: "select",
        value: v.region,
        required: true,
        options: [
          { value: "idf", label: "Île-de-France" },
          { value: "province", label: "Province (hors IDF)" },
          { value: "dom", label: "DOM-TOM" },
        ],
      },
      {
        id: "economie",
        label: "Économies / Épargne (optionnel)",
        type: "number",
        value: v.economie || 0,
        required: false,
        min: 0,
        step: 500,
        placeholder: "Laissez vide si inconnu",
      },
    ],
    onConfirm: (values) => {
      // ✅ PROPOSITION 1: Utiliser le moteur de calcul unique
      const {
        situation,
        enfants,
        revenus_mensuels,
        type_logement,
        loyer_mensuel,
        region,
        economie,
      } = values;

      // Appel au moteur unique (même logique que le calcul principal)
      const calcResult = calculerAPL({
        situation,
        enfants: Number(enfants) || 0,
        revenus_mensuels: Number(revenus_mensuels),
        loyer_mensuel: Number(loyer_mensuel),
        region,
        type_logement,
        economie: Number(economie) || 0,
      });

      if (!calcResult.success || !calcResult.data) {
        alert(
          calcResult.error ||
            "Erreur lors du calcul. Veuillez vérifier vos données."
        );
        return;
      }

      // Mapper les valeurs pour la comparaison
      const mappedValues = {
        situation,
        revenus: Number(revenus_mensuels),
        nombre_enfants: Number(enfants) || 0,
        type_logement,
        zone:
          region === "idf"
            ? "zone_1"
            : region === "province"
            ? "zone_2"
            : "zone_3",
      };

      const result = {
        success: true,
        data: { apl: calcResult.data.apl_estimee },
      };

      console.log("Nouveau scénario APL (moteur unique):", {
        mappedValues,
        result,
      });
      comparaisonAPL.ajouterCalcul(result, mappedValues);
    },
  });

  modal.open();
});

// Gestionnaire du bouton "Réinitialiser"
document.getElementById("apl-reset-compare")?.addEventListener("click", () => {
  if (confirm("Êtes-vous sûr ? Cela supprimera tous les scénarios.")) {
    comparaisonAPL.reinitialiser();
    document.getElementById("apl-reset-compare")?.classList.add("hidden");
  }
});

// Réinitialisation au clic du bouton réinitialiser dans le tableau
document.addEventListener("click", (e) => {
  if ((e.target as HTMLElement)?.id === "apl-reset-compare") {
    comparaisonAPL.reinitialiser();
    document.getElementById("apl-reset-compare")?.classList.add("hidden");
  }
});

// ✅ TASK 1: PRESETS ENFANTS (0/1/2/3)
document.querySelectorAll(".preset-enfants").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const enfants = (e.target as HTMLElement).dataset.enfants;
    // Le champ est généré par CalculatorFrame avec l'ID: apl-calculator_enfants
    const input = document.getElementById(
      "apl-calculator_enfants"
    ) as HTMLInputElement;

    if (input && enfants) {
      input.value = enfants;

      // Déclencher l'event change pour mettre à jour le calculateur
      const event = new Event("change", { bubbles: true });
      input.dispatchEvent(event);

      // Visual feedback
      (e.target as HTMLElement).classList.add(
        "ring-2",
        "ring-purple-500",
        "scale-95"
      );
      setTimeout(() => {
        (e.target as HTMLElement).classList.remove(
          "ring-2",
          "ring-purple-500",
          "scale-95"
        );
      }, 300);
    }
  });
});
