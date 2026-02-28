import { calculerRSA, formatRSAResult } from "../../utils/rsaCalculEngine";
import { 
  initFeedbackForm, 
  initStatsDisplay,
  generateProfileHash 
} from "../../components/observatory";

/**
 * Script de gestion du calculateur RSA
 */

// Éléments du formulaire
const form = document.getElementById("rsa-form") as HTMLFormElement;
const situationSelect = document.getElementById(
  "rsa-situation",
) as HTMLSelectElement;
const enfantsInput = document.getElementById("rsa-enfants") as HTMLInputElement;
const revenusInput = document.getElementById("rsa-revenus") as HTMLInputElement;
const logementSelect = document.getElementById(
  "rsa-logement",
) as HTMLSelectElement;
const activiteSelect = document.getElementById(
  "rsa-activite",
) as HTMLSelectElement;

// Éléments de résultat
const resultDiv = document.getElementById("rsa-result") as HTMLDivElement;
const montantDisplay = document.getElementById("rsa-montant") as HTMLElement;
const explDisplay = document.getElementById("rsa-explication") as HTMLElement;

// Bouton de scroll
const scrollButton = document.getElementById(
  "rsa-scroll-to-form",
) as HTMLButtonElement;

/**
 * Gestion du formulaire
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    situation: situationSelect.value,
    enfants: parseInt(enfantsInput.value) || 0,
    revenus: parseInt(revenusInput.value) || 0,
    logement: logementSelect.value,
    activite: activiteSelect.value,
  };

  // Calcul
  const result = calculerRSA(data);

  // Affichage des résultats
  if (result.success) {
    const formatted = formatRSAResult(result);
    montantDisplay.textContent = formatted.montantDisplay;
    explDisplay.textContent = formatted.explDisplay;

    // Affichage du bloc résultat
    resultDiv.classList.remove("invisible");
    resultDiv.scrollIntoView({ behavior: "smooth" });

    // Afficher l'observatoire communautaire
    showObservatory(data);

    // Dispatch événement personnalisé pour suivi
    window.dispatchEvent(
      new CustomEvent("rsa-calculated", {
        detail: result,
      }),
    );
  }
});

/**
 * Bouton de scroll vers le formulaire
 */
if (scrollButton) {
  scrollButton.addEventListener("click", () => {
    form.scrollIntoView({ behavior: "smooth" });
    situationSelect.focus();
  });
}

/**
 * Masquer le résultat quand on modifie le formulaire
 */
[
  situationSelect,
  enfantsInput,
  revenusInput,
  logementSelect,
  activiteSelect,
].forEach((elem) => {
  elem.addEventListener("change", () => {
    resultDiv.classList.add("invisible");
    
    // Masquer aussi l'observatoire
    const observatorySection = document.getElementById("observatory-section");
    if (observatorySection) {
      observatorySection.classList.add("hidden");
    }
  });
});


/**
 * Afficher l'observatoire communautaire apres simulation
 */
async function showObservatory(data: {
  situation: string;
  enfants: number;
  revenus: number;
  logement: string;
}): Promise<void> {
  const section = document.getElementById("observatory-section");
  if (!section) return;
  
  section.classList.remove("hidden");
  
  // Generer le hash du profil
  const profile = {
    situation: data.situation,
    revenus: getRevenuBracket(data.revenus),
    logement: data.logement,
    enfants: data.enfants
  };
  
  const profileHash = await generateProfileHash(profile);
  
  // Afficher les stats existantes
  initStatsDisplay("observatory-stats", {
    profileHash,
    simulatorType: "rsa",
    profileDescription: getProfileDescription(profile)
  });
  
  // Afficher le formulaire
  initFeedbackForm("observatory-feedback", {
    simulatorType: "rsa",
    profile,
    onSubmitted: () => {
      // Rafraichir les stats apres soumission
      setTimeout(() => {
        initStatsDisplay("observatory-stats", {
          profileHash,
          simulatorType: "rsa"
        });
      }, 1000);
    },
    onCancel: () => {
      const feedbackDiv = document.getElementById("observatory-feedback");
      if (feedbackDiv) feedbackDiv.style.display = "none";
    }
  });
}

/**
 * Tranche de revenus pour le profil
 */
function getRevenuBracket(revenus: number): string {
  if (revenus < 500) return "0-500";
  if (revenus < 1000) return "500-1000";
  if (revenus < 1500) return "1000-1500";
  if (revenus < 2000) return "1500-2000";
  return "2000+";
}

/**
 * Description lisible du profil
 */
function getProfileDescription(profile: {
  situation: string;
  revenus: string;
  logement: string;
  enfants: number;
}): string {
  const situationLabels: Record<string, string> = {
    seul: "Personne seule",
    couple: "Couple",
    celibataire: "Celibataire",
    monoparentale: "Famille monoparentale"
  };
  
  const parts = [
    situationLabels[profile.situation] || profile.situation,
    profile.enfants > 0 ? `${profile.enfants} enfant(s)` : null,
    profile.logement
  ].filter(Boolean);
  
  return parts.join(", ");
}
