/**
 * ARE (Allocation Retour Emploi) Form Handler - 2026
 * Chômage benefits via France Travail
 */

import { calculerARE, type AREData } from "../../utils/areCalculEngine";

const form = document.getElementById("are-form") as HTMLFormElement;
const resultDiv = document.getElementById("are-result") as HTMLDivElement;
const scrollButton = document.getElementById(
 "are-scroll-to-form",
) as HTMLButtonElement;

function initFromURL(): void {
 const params = new URLSearchParams(window.location.search);
 if (! params.size) return;

 const fieldIds = [
 "are-situation",
 "are-age",
 "are-anciennete",
 "are-salaire",
 "are-enfants",
];

 let hasValue = false;

 fieldIds.forEach((fieldId) => {
 const value = params.get(fieldId);
 if (value === null) return;
 const input = document.getElementById(fieldId) as HTMLInputElement | HTMLSelectElement | null;
 if (! input) return;
 input.value = value;
 hasValue = true;
 });

 if (hasValue) {
 form?.requestSubmit();
 }
}

if (form) {
 form.addEventListener("submit", (e) => {
 e.preventDefault();

 const situation = (
 document.getElementById("are-situation") as HTMLSelectElement
)?.value;
 const ancienneteEmploi = parseInt(
 (document.getElementById("are-anciennete") as HTMLInputElement)?.value ||
 "0",
);
 const salaireReferent = parseFloat(
 (document.getElementById("are-salaire") as HTMLInputElement)?.value ||
 "0",
);
 const personnesCharge = parseInt(
 (document.getElementById("are-enfants") as HTMLInputElement)?.value ||
 "0",
);
 const agePersonne = parseInt(
 (document.getElementById("are-age") as HTMLInputElement)?.value || "35",
);

 if (! situation) {
 alert("Veuillez sélectionner votre situation familiale");
 return;
 }

 const data: AREData = {
 situation: situation as "seul" | "couple" | "parent",
 ancienneteEmploi,
 salaireReferent,
 personnesCharge,
 agePersonne,
 };

 const result = calculerARE(data);
 console.log("ARE Calculation Result: ", result);

 const montantDisplay = document.getElementById(
 "are-montant",
) as HTMLElement;
 const explicationDisplay = document.getElementById(
 "are-explication",
) as HTMLElement;

 console.log("Montant Display Element: ", montantDisplay);
 console.log("Explication Display Element: ", explicationDisplay);

 if (montantDisplay) {
 montantDisplay.textContent = result.eligible
 ? `${result.montantEstime.toFixed(2)}€/mois`
 : "---";
 console.log("Montant set to: ", montantDisplay.textContent);
 }
 if (explicationDisplay) {
 explicationDisplay.textContent = result.explication;
 console.log("Explication set to: ", explicationDisplay.textContent);
 }

 if (resultDiv) {
 resultDiv.classList.remove("invisible");
 resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
 console.log("Result div shown");
 }
 });
}

if (scrollButton) {
 scrollButton.addEventListener("click", () => {
 form?.scrollIntoView({ behavior: "smooth", block: "start" });
 });
}

initFromURL();