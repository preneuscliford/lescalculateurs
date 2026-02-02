import { CalculatorFrame } from "../../components/CalculatorFrame.ts";
import ComparaisonAPL from "../../utils/comparaisonAPL.ts";

// Initialisation du comparateur
const comparaisonAPL = new ComparaisonAPL("apl-comparaison");
(window as any).comparaisonAPL = comparaisonAPL;

// Auto-afficher les boutons après le premier calcul
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

// Gestionnaire du bouton "Ajouter à la comparaison"
document.getElementById("apl-add-to-compare")?.addEventListener("click", () => {
  const last = (window as any)["dernierCalcul_apl-calculator"];
  if (!last?.result?.success || !last?.values) {
    alert("Veuillez d'abord effectuer un calcul");
    return;
  }
  comparaisonAPL.ajouterCalcul(last.result, last.values);
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
