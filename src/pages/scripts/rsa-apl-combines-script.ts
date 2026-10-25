/**
 * Page "impact combiné" — APL puis RSA.
 * L'APL est calculée sur les autres ressources du foyer : le RSA, non imposable, n'entre pas
 * dans les ressources retenues pour l'aide au logement. Le RSA est ensuite diminué du forfait
 * logement quand le foyer touche une aide au logement (art. R262-9 du CASF).
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

    // Calcul 1 : APL sur les autres ressources (le RSA n'est pas retenu dans les ressources APL)
    const aplInput: APLInput = {
      situation,
      enfants,
      revenus_mensuels: autresRevenus,
      loyer_mensuel: loyer,
      region,
      type_logement: logement === "proprietaire" ? "accession" : "location",
    };
    const aplResult = calculerAPL(aplInput);
    const aplMontant = aplResult.success && aplResult.data ? aplResult.data.apl_estimee : 0;

    // Calcul 2 : RSA sur les autres ressources, diminué du forfait logement si une aide au
    // logement est versée (un locataire sans aide ou un propriétaire qui rembourse un prêt n'a pas de forfait)
    const rsaData: RSACalculData = {
      situation,
      enfants,
      revenus: autresRevenus,
      logement: aplMontant > 0 ? "aide-logement" : "loue",
      activite,
    };
    const rsaResult = calculerRSA(rsaData);
    const rsaMontant = rsaResult.success ? rsaResult.montantEstime : 0;
    const forfaitLogement = rsaResult.success ? rsaResult.details.forfaitLogement : 0;

    const rsaDisplay = document.getElementById("combo-rsa") as HTMLElement;
    const aplDisplay = document.getElementById("combo-apl") as HTMLElement;
    const totalDisplay = document.getElementById("combo-total") as HTMLElement;
    const explicationDisplay = document.getElementById("combo-explication") as HTMLElement;

    if (rsaDisplay) rsaDisplay.textContent = rsaResult.success ? `${formatEuro(rsaMontant)} / mois` : "---";
    if (aplDisplay) aplDisplay.textContent = aplResult.success ? `${formatEuro(aplMontant)} / mois` : "Non éligible";

    const totalMensuel = autresRevenus + rsaMontant + aplMontant;
    if (totalDisplay) totalDisplay.textContent = `${formatEuro(totalMensuel)} / mois`;

    if (explicationDisplay) {
      explicationDisplay.textContent =
        aplMontant > 0
          ? `L'APL est calculée sur vos ${formatEuro(autresRevenus)} d'autres revenus : le RSA n'entre pas dans ses ressources. Comme vous touchez une aide au logement, la CAF retire du RSA un forfait logement de ${formatEuro(forfaitLogement)}. Votre revenu mensuel réel additionne autres revenus, RSA et APL.`
          : `Sans aide au logement, aucun forfait logement n'est retiré du RSA. Votre revenu mensuel réel additionne vos autres revenus et le RSA.`;
    }

    const detailsDiv = document.getElementById("combo-details");
    const detailsContent = document.getElementById("combo-details-content");
    if (detailsDiv && detailsContent) {
      const lines = [
        `• Autres revenus déclarés : ${formatEuro(autresRevenus)}`,
        `• RSA estimé : ${formatEuro(rsaMontant)}`,
        `• Ressources retenues pour l'APL (hors RSA) : ${formatEuro(autresRevenus)}`,
        `• APL estimée : ${formatEuro(aplMontant)}`,
        `• Forfait logement retiré du RSA : ${formatEuro(forfaitLogement)}`,
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
