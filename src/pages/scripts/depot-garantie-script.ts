/**
 * Page « Dépôt de garantie » : date limite de restitution et pénalité de retard.
 * Calcul : src/utils/depotGarantieCalculEngine.ts.
 */
import { calculerDepotGarantie, formaterDateLongue, type TypeLocation } from "../../utils/depotGarantieCalculEngine";

const form = document.getElementById("dg-form") as HTMLFormElement | null;
const resultat = document.getElementById("dg-resultat") as HTMLDivElement | null;
const erreur = document.getElementById("dg-erreur") as HTMLParagraphElement | null;

const valeur = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value || "";
const nombre = (id: string) => Number(valeur(id).replace(",", ".")) || 0;
const coche = (id: string) => Boolean((document.getElementById(id) as HTMLInputElement | null)?.checked);
const euros = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function carte(titre: string, principal: string, detail = "", alerte = false) {
  const c = alerte ? "border-red-200 bg-red-50 text-red-900" : "border-teal-200 bg-teal-50 text-teal-900";
  return `<div class="rounded-lg border ${c} p-4">
    <p class="text-sm font-medium">${titre}</p>
    <p class="mt-1 text-xl font-bold">${principal}</p>
    ${detail ? `<p class="mt-1 text-xs">${detail}</p>` : ""}
  </div>`;
}

function afficherErreur(message: string) {
  if (!erreur) return;
  erreur.textContent = message;
  erreur.classList.remove("hidden");
  resultat?.classList.add("hidden");
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  erreur?.classList.add("hidden");
  if (!valeur("dg-cles") || !valeur("dg-loyer")) {
    afficherErreur("Indiquez le loyer hors charges et la date de remise des clés.");
    return;
  }
  const rendu = valeur("dg-rendu");
  const depot = nombre("dg-depot");
  const r = calculerDepotGarantie({
    typeLocation: valeur("dg-type") as TypeLocation,
    loyerHorsCharges: nombre("dg-loyer"),
    depotVerse: depot,
    dateRemiseCles: valeur("dg-cles"),
    etatDesLieuxConforme: valeur("dg-etat") === "conforme",
    dateReference: rendu || aujourdhui(),
    nouvelleAdresseCommuniquee: coche("dg-adresse"),
    copropriete: coche("dg-copro"),
  });

  if (!r.valide) {
    afficherErreur(r.message);
    return;
  }
  if (!resultat) return;

  const enRetard = r.moisDeRetard > 0;
  const cartes = [
    carte("Date limite de restitution", formaterDateLongue(r.dateLimite), `${r.delaiMois} mois après la remise des clés`),
    enRetard
      ? carte(
          rendu ? "Retard" : "Retard à ce jour",
          `${r.moisDeRetard} mois commencé(s)`,
          r.penaliteApplicable ? `pénalité de ${euros(r.penaliteParMois)} par mois` : "pas de pénalité (nouvelle adresse non indiquée)",
          true,
        )
      : carte("Retard", "Aucun", rendu ? "dépôt rendu dans les délais" : "le délai court encore"),
    r.penaliteApplicable ? carte("Pénalité due", euros(r.penalite), "10 % du loyer hors charges par mois commencé", true) : "",
    r.penaliteApplicable
      ? carte("Total dû par le propriétaire", euros(depot + r.penalite), "dépôt + pénalité, moins les retenues justifiées", true)
      : "",
  ].join("");

  const remarques: string[] = [];
  if (r.depotExcessif) {
    remarques.push(`Le dépôt versé (${euros(depot)}) dépasse le maximum légal de ${euros(r.depotMaximal)} pour ce type de location.`);
  }
  if (r.provisionCoproprieteMax !== null) {
    remarques.push(
      `Copropriété : le propriétaire peut garder au plus ${euros(r.provisionCoproprieteMax)} (20 % du dépôt) jusqu'à l'approbation des comptes annuels de l'immeuble, puis doit rendre le solde dans le mois qui suit.`,
    );
  }
  if (enRetard) {
    remarques.push(
      `Envoyez une mise en demeure par lettre recommandée en rappelant la pénalité. Vous pouvez saisir le juge jusqu'au ${formaterDateLongue(r.dateLimiteJuge)}.`,
    );
  }

  resultat.innerHTML = `
    <p class="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">${echapper(r.message)}</p>
    <div class="grid gap-4 sm:grid-cols-2">${cartes}</div>
    ${
      remarques.length
        ? `<ul class="list-disc list-inside space-y-1 text-sm text-gray-700">${remarques.map((t) => `<li>${echapper(t)}</li>`).join("")}</ul>`
        : ""
    }
    <p class="text-xs text-gray-600">Les retenues justifiées (impayés, réparations locatives) se déduisent du montant à rendre.</p>`;
  resultat.classList.remove("hidden");
  resultat.scrollIntoView({ behavior: "smooth", block: "start" });
});
