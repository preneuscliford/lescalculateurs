import ComparaisonAPL from "../../utils/comparaisonAPL.ts";
import { ComparisonModal } from "../../components/ComparisonModal.ts";

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
      // Recalculer l'APL avec les nouvelles valeurs
      const {
        situation,
        enfants,
        revenus_mensuels,
        type_logement,
        loyer_mensuel,
        region,
        economie,
      } = values;

      try {
        const revenu = Number(revenus_mensuels);
        const loyer = Number(loyer_mensuel);
        const plafondIDF = 1500;
        const plafondProvince = 1200;
        const plafondDOM = 1600;

        let plafond = plafondProvince;
        if (region === "idf") plafond = plafondIDF;
        else if (region === "dom") plafond = plafondDOM;

        const loyerPrisEnCompte = Math.min(loyer, plafond);
        let partEnfants = 0;
        if (enfants > 0) {
          partEnfants = enfants * 100;
        }

        const participationPersonnelle = Math.max(
          0,
          revenu * 0.07 + partEnfants - 200
        );
        const aplEstimee = Math.max(
          0,
          loyerPrisEnCompte - participationPersonnelle
        );

        // Mapper les valeurs pour la comparaison
        const mappedValues = {
          situation,
          revenus: revenu,
          nombre_enfants: enfants,
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
          data: { apl: aplEstimee },
        };

        console.log("Nouveau scénario APL:", { mappedValues, result });
        comparaisonAPL.ajouterCalcul(result, mappedValues);
      } catch (error) {
        alert("Erreur lors du calcul. Veuillez vérifier vos données.");
        console.error(error);
      }
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
