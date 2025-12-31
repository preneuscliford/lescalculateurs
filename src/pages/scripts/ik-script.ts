import ComparaisonIK from "../../utils/comparaisonIK.ts";

// Gestion de la comparaison IK
const comparaisonIK = new ComparaisonIK("ik-comparaison");
(window as any).comparaisonIK = comparaisonIK;

// Auto-afficher les boutons après le premier calcul
window.addEventListener("calculator-updated", (event: any) => {
  if (event.detail?.elementId !== "ik-calculator") return;

  const last = (window as any)["dernierCalcul_ik-calculator"];
  if (!last?.result?.success) return;

  const addBtn = document.getElementById("ik-add-to-compare");
  const resetBtn = document.getElementById("ik-reset-compare");

  if (addBtn && resetBtn) {
    addBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
  }
});

// Gestionnaire du bouton "Ajouter à la comparaison"
document.getElementById("ik-add-to-compare")?.addEventListener("click", () => {
  const last = (window as any)["dernierCalcul_ik-calculator"];
  if (!last?.result?.success || !last?.values) {
    alert("Veuillez d'abord effectuer un calcul");
    return;
  }
  comparaisonIK.ajouterCalcul(last.result, last.values);
});

// Gestionnaire du bouton "Réinitialiser"
document.getElementById("ik-reset-compare")?.addEventListener("click", () => {
  if (confirm("Êtes-vous sûr ? Cela supprimera tous les scénarios.")) {
    comparaisonIK.reinitialiser();
    document.getElementById("ik-reset-compare")?.classList.add("hidden");
  }
});

// Réinitialisation au clic du bouton réinitialiser dans le tableau
document.addEventListener("click", (e) => {
  if ((e.target as HTMLElement)?.id === "ik-reset-compare") {
    comparaisonIK.reinitialiser();
    document.getElementById("ik-reset-compare")?.classList.add("hidden");
  }
});
