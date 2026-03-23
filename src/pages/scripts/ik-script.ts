import ComparaisonIK from "../../utils/comparaisonIK.ts";
import { ComparisonModal } from "../../components/ComparisonModal.ts";
import { baremes } from "../../data/baremes.ts";

// Gestion de la comparaison IK
const comparaisonIK = new ComparaisonIK("ik-comparaison");
(window as any).comparaisonIK = comparaisonIK;

const resetBtn = document.getElementById("ik-reset-compare");
if (resetBtn && comparaisonIK.getNombreCalculs() > 0) {
  resetBtn.classList.remove("hidden");
}

function computeIK(values: any) {
  const typeVehicule = values.type_vehicule;
  const kilometres = Number(values.kilometres);

  if (!typeVehicule) {
    return { success: false, error: "Veuillez sélectionner le type de véhicule." };
  }
  if (!isFinite(kilometres) || kilometres <= 0) {
    return { success: false, error: "Veuillez saisir un nombre de kilomètres valide." };
  }

  let indemniteParKm = 0;
  let total = 0;

  if (typeVehicule === "voiture") {
    const puissance = values.puissance;
    if (!puissance) {
      return { success: false, error: "Veuillez sélectionner la puissance fiscale (CV)." };
    }
    const tableVoiture =
      baremes.indemnites_kilometriques.voiture.latest ||
      baremes.indemnites_kilometriques.voiture["2024"];
    const baremePuissance = tableVoiture.find((b) => b.puissance === puissance);
    if (!baremePuissance) {
      return { success: false, error: "Puissance non trouvée dans le barème." };
    }

    if (kilometres <= 5000) {
      total = kilometres * baremePuissance.jusqu_5000;
      indemniteParKm = baremePuissance.jusqu_5000;
    } else if (kilometres <= 20000) {
      total =
        5000 * baremePuissance.jusqu_5000 +
        (kilometres - 5000) * baremePuissance.de_5001_20000;
      indemniteParKm = total / kilometres;
    } else {
      total =
        5000 * baremePuissance.jusqu_5000 +
        15000 * baremePuissance.de_5001_20000 +
        (kilometres - 20000) * baremePuissance.au_dela_20000;
      indemniteParKm = total / kilometres;
    }
  } else {
    const cylindree = values.cylindree_moto;
    if (!cylindree) {
      return { success: false, error: "Veuillez sélectionner la cylindrée (deux-roues)." };
    }
    const ik = baremes.indemnites_kilometriques.deux_roues[cylindree];
    if (!isFinite(ik)) {
      return { success: false, error: "Cylindrée non trouvée dans le barème." };
    }
    indemniteParKm = ik;
    total = kilometres * indemniteParKm;
  }

  return {
    success: true,
    data: {
      total,
      indemniteParKm,
      kilometres,
      typeVehicule,
      puissance: values.puissance,
      cylindree: values.cylindree_moto,
    },
  };
}

// Gestionnaire du bouton "Ajouter à la comparaison"
document.getElementById("ik-add-to-compare")?.addEventListener("click", () => {
  const last = (window as any)["dernierCalcul_ik-calculator"];
  const lastValues = last?.values || {};

  const modal = new ComparisonModal({
    title: "Ajouter un scénario à la comparaison",
    fields: [
      {
        id: "type_vehicule",
        label: "Type de véhicule",
        type: "select",
        value: lastValues.type_vehicule || "voiture",
        required: true,
        options: [
          { value: "voiture", label: "Voiture" },
          { value: "deux_roues", label: "Deux-roues" },
        ],
      },
      {
        id: "puissance",
        label: "Puissance fiscale (CV)",
        type: "select",
        value: lastValues.puissance || "5CV",
        required: false,
        options: [
          { value: "3CV et moins", label: "3 CV et moins" },
          { value: "4CV", label: "4 CV" },
          { value: "5CV", label: "5 CV" },
          { value: "6CV", label: "6 CV" },
          { value: "7CV et plus", label: "7 CV et plus" },
        ],
      },
      {
        id: "cylindree_moto",
        label: "Cylindrée (deux‑roues)",
        type: "select",
        value: lastValues.cylindree_moto || "50cc_125cc",
        required: false,
        options: [
          { value: "moins_50cc", label: "Moins de 50cc" },
          { value: "50cc_125cc", label: "50cc à 125cc" },
          { value: "plus_125cc", label: "Plus de 125cc" },
        ],
      },
      {
        id: "kilometres",
        label: "Nombre de kilomètres annuels",
        type: "number",
        value: lastValues.kilometres ?? 15000,
        required: true,
        min: 1,
        step: 1,
      },
    ],
    onConfirm: (values) => {
      const type = String(values.type_vehicule || "");
      const km = Number(values.kilometres) || 0;
      const puissance = String(values.puissance || "");
      const cylindree = String(values.cylindree_moto || "");

      const normalized: any = {
        type_vehicule: type,
        kilometres: km,
      };
      if (type === "voiture") normalized.puissance = puissance;
      if (type === "deux_roues") normalized.cylindree_moto = cylindree;

      const result = computeIK(normalized);
      if (!result.success) {
        alert(result.error);
        return;
      }

      comparaisonIK.ajouterCalcul(result, normalized);
      document.getElementById("ik-reset-compare")?.classList.remove("hidden");
      document.getElementById("ik-comparaison")?.scrollIntoView({ behavior: "smooth" });
    },
  });

  modal.open();
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
