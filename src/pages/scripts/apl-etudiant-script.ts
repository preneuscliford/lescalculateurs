/**
 * APL Étudiant / Jeune Actif Form Handler - 2026
 */

import {
 calculerAPLEtudiant,
 type APLEtudiantData,
} from "../../utils/aplEtudiantCalculEngine";

const form = document.getElementById("apl-étudiant-form") as HTMLFormElement;
const resultDiv = document.getElementById(
 "apl-étudiant-result",
) as HTMLDivElement;
const resultContent = document.getElementById(
 "apl-étudiant-result-content",
) as HTMLDivElement;
const scrollButton = document.getElementById(
 "apl-étudiant-scroll-to-form",
) as HTMLButtonElement;

if (form) {
 form.addEventListener("submit", (e) => {
 e.preventDefault();

 const situation = (
 document.getElementById("apl-étudiant-situation") as HTMLSelectElement
)?.value;
 const chargesLocatives = parseFloat(
 (document.getElementById("apl-étudiant-charges") as HTMLInputElement)
 ?.value || "0",
);
 const revenus = parseFloat(
 (document.getElementById("apl-étudiant-revenus") as HTMLInputElement)
 ?.value || "0",
);
 const personnesCharge = parseInt(
 (document.getElementById("apl-étudiant-enfants") as HTMLInputElement)
 ?.value || "0",
);

 if (! situation) {
 alert("Veuillez sélectionner une situation familiale");
 return;
 }

 const data: APLEtudiantData = {
 situation: situation as "seul" | "couple" | "parent",
 age: 22, // typical student age
 revenus,
 chargesLocatives,
 personnesCharge,
 };

 const result = calculerAPLEtudiant(data);

 // Display result
 const montantDisplay = document.getElementById(
 "apl-étudiant-montant",
) as HTMLElement;
 const explicationDisplay = document.getElementById(
 "apl-étudiant-explication",
) as HTMLElement;

 if (montantDisplay) {
 montantDisplay.textContent = result.eligible
 ? `${result.montantEstime.toFixed(2)}€/mois`
 : "---";
 }
 if (explicationDisplay) {
 explicationDisplay.textContent = result.explication;
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