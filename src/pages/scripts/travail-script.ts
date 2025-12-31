import ComparaisonTravail from "../../utils/comparaisonTravail.ts";

// Gestion de la comparaison Travail
const comparaisonTravail = new ComparaisonTravail("travail-comparaison");
(window as any).comparaisonTravail = comparaisonTravail;

// Auto-afficher les boutons après le premier calcul
window.addEventListener("calculator-updated", (event: any) => {
  if (event.detail?.elementId !== "travail-calculator") return;

  const last = (window as any)["dernierCalcul_travail-calculator"];
  if (!last?.result?.success) return;

  const addBtn = document.getElementById("travail-add-to-compare");
  const resetBtn = document.getElementById("travail-reset-compare");

  if (addBtn && resetBtn) {
    addBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
  }
});

// Gestionnaire du bouton "Ajouter à la comparaison"
document
  .getElementById("travail-add-to-compare")
  ?.addEventListener("click", () => {
    const last = (window as any)["dernierCalcul_travail-calculator"];
    if (!last?.result?.success || !last?.values) {
      alert("Veuillez d'abord effectuer un calcul");
      return;
    }
    comparaisonTravail.ajouterCalcul(last.result, last.values);
  });

// Gestionnaire du bouton "Réinitialiser"
document
  .getElementById("travail-reset-compare")
  ?.addEventListener("click", () => {
    if (confirm("Êtes-vous sûr ? Cela supprimera tous les scénarios.")) {
      comparaisonTravail.reinitialiser();
      document.getElementById("travail-reset-compare")?.classList.add("hidden");
    }
  });

// Réinitialisation au clic du bouton réinitialiser dans le tableau
document.addEventListener("click", (e) => {
  if ((e.target as HTMLElement)?.id === "travail-reset-compare") {
    comparaisonTravail.reinitialiser();
    document.getElementById("travail-reset-compare")?.classList.add("hidden");
  }
});
