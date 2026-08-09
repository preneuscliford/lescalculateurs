/**
 * Page "impact combiné" — RSA puis APL.
 * Le RSA est calculé d'abord sur les autres ressources, puis injecté
 * comme ressource dans le calcul APL (revenus_mensuels), reflétant la
 * vraie règle CAF : le RSA compte dans les ressources prises en compte
 * pour l'aide au logement.
 */

import { calculerRSA, type RSACalculData } from "../../utils/rsaCalculEngine";
import { calculerAPL, type APLInput, type SituationFamiliale, type Zone } from "../../utils/aplCalculEngine";

const form = document.getElementById("combo-form") as HTMLFormElement;
const resultDiv = document.getElementById("combo-result") as HTMLDivElement;
const scrollButton = document.getElementById("combo-scroll-to-form") as HTMLButtonElement;

function formatEuro(value: number): string {
  return (
    value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const situation = (document.getElementById("combo-situation") as HTMLSelectElement)?.value as
      | SituationFamiliale
      | "";
    const enfants = parseInt((document.getElementById("combo-enfants") as HTMLInputElement)?.value || "0", 10);
    const autresRevenus = parseFloat((document.getElementById("combo-revenus") as HTMLInputElement)?.value || "0");
    const activite = (document.getElementById("combo-activite") as HTMLSelectElement)?.value;
    const logement = (document.getElementById("combo-logement") as HTMLSelectElement)?.value;
    const loyer = parseFloat((document.getElementById("combo-loyer") as HTMLInputElement)?.value || "0");
    const region = (document.getElementById("combo-region") as HTMLSelectElement)?.value as Zone | "";

    if (!situation || !activite || !logement || !region) {
      alert("Veuillez renseigner toutes les informations demandées");
      return;
    }

    // Calcul 1 : RSA sur les autres ressources déclarées
    const rsaData: RSACalculData = {
      situation,
      enfants,
      revenus: autresRevenus,
      logement,
      activite,
    };
    const rsaResult = calculerRSA(rsaData);
    const rsaMontant = rsaResult.success ? rsaResult.montantEstime : 0;

    // Calcul 2 : APL, ressources = autres revenus + RSA perçu
    const aplInput: APLInput = {
      situation,
      enfants,
      revenus_mensuels: autresRevenus + rsaMontant,
      loyer_mensuel: loyer,
      region,
      type_logement: logement === "proprietaire" ? "accession" : "location",
    };
    const aplResult = calculerAPL(aplInput);
    const aplMontant = aplResult.success && aplResult.data ? aplResult.data.apl_estimee : 0;

    const rsaDisplay = document.getElementById("combo-rsa") as HTMLElement;
    const aplDisplay = document.getElementById("combo-apl") as HTMLElement;
    const totalDisplay = document.getElementById("combo-total") as HTMLElement;
    const explicationDisplay = document.getElementById("combo-explication") as HTMLElement;

    if (rsaDisplay) rsaDisplay.textContent = rsaResult.success ? `${formatEuro(rsaMontant)} / mois` : "---";
    if (aplDisplay) aplDisplay.textContent = aplResult.success ? `${formatEuro(aplMontant)} / mois` : "Non éligible";

    const totalMensuel = autresRevenus + rsaMontant + aplMontant;
    if (totalDisplay) totalDisplay.textContent = `${formatEuro(totalMensuel)} / mois`;

    if (explicationDisplay) {
      explicationDisplay.textContent = `Le RSA (${formatEuro(rsaMontant)}) a été compté comme ressource dans le calcul de l'APL, en plus de vos ${formatEuro(autresRevenus)} d'autres revenus déclarés. Votre revenu mensuel réel additionne les trois : autres revenus, RSA et APL.`;
    }

    const detailsDiv = document.getElementById("combo-details");
    const detailsContent = document.getElementById("combo-details-content");
    if (detailsDiv && detailsContent) {
      const lines = [
        `• Autres revenus déclarés : ${formatEuro(autresRevenus)}`,
        `• RSA estimé : ${formatEuro(rsaMontant)}`,
        `• Ressources utilisées pour l'APL (autres revenus + RSA) : ${formatEuro(autresRevenus + rsaMontant)}`,
        `• APL estimée : ${formatEuro(aplMontant)}`,
        `• = Revenu mensuel réel combiné : ${formatEuro(totalMensuel)}`,
      ];
      detailsContent.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
      detailsDiv.classList.remove("hidden");
    }

    resultDiv.classList.remove("invisible");
    resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (scrollButton) {
  scrollButton.addEventListener("click", () => {
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
