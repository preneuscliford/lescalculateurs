/**
 * Page « Date de fin de droits chômage » : formulaire et affichage du calendrier ARE.
 * Calcul : src/utils/finDroitsChomageCalculEngine.ts.
 */
import { calculerFinDroits, formaterDateLongue, type TypeRupture } from "../../utils/finDroitsChomageCalculEngine";

const form = document.getElementById("fd-form") as HTMLFormElement | null;
const resultat = document.getElementById("fd-resultat") as HTMLDivElement | null;
const erreur = document.getElementById("fd-erreur") as HTMLParagraphElement | null;

const valeur = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value || "";
const nombre = (id: string) => Number(valeur(id).replace(",", ".")) || 0;
const coche = (id: string) => Boolean((document.getElementById(id) as HTMLInputElement | null)?.checked);
const euros = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function carte(titre: string, valeurPrincipale: string, detail = "") {
  return `<div class="rounded-lg border border-sky-200 bg-sky-50 p-4">
    <p class="text-sm font-medium text-sky-900">${titre}</p>
    <p class="mt-1 text-xl font-bold text-sky-900">${valeurPrincipale}</p>
    ${detail ? `<p class="mt-1 text-xs text-sky-900">${detail}</p>` : ""}
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
  if (!valeur("fd-fin") || !valeur("fd-inscription") || !valeur("fd-debut") || !valeur("fd-age")) {
    afficherErreur("Renseignez les dates de fin de contrat, d'inscription et de début du premier contrat, ainsi que votre âge.");
    return;
  }

  const r = calculerFinDroits({
    dateFinContrat: valeur("fd-fin"),
    dateInscription: valeur("fd-inscription"),
    agePersonne: nombre("fd-age"),
    dateDebutPremierContrat: valeur("fd-debut"),
    joursSansContrat: nombre("fd-sans-contrat"),
    typeRupture: valeur("fd-rupture") as TypeRupture,
    salaireMensuelBrut: nombre("fd-salaire"),
    indemniteCongesPayes: nombre("fd-iccp"),
    indemnitesSupraLegales: nombre("fd-supra"),
    delaiAttenteDejaApplique: coche("fd-attente-deja"),
    outreMer: coche("fd-outre-mer"),
    joursArretMaladie: nombre("fd-arret"),
    joursFormation: nombre("fd-formation"),
    salaireRepriseMensuelBrut: nombre("fd-reprise-salaire"),
    moisReprise: nombre("fd-reprise-mois"),
  });

  if (!r.eligible) {
    afficherErreur(r.message);
    return;
  }
  if (!resultat) return;

  const mois = r.dureeJours ? (Math.round((r.dureeJours / 30.42) * 2) / 2).toLocaleString("fr-FR") : "";
  const cartes = [
    carte("Premier jour indemnisé", formaterDateLongue(r.premierJourIndemnise)),
    r.dureeJours ? carte("Durée de vos droits", `${r.dureeJours} jours`, `environ ${mois} mois`) : "",
    r.dateFinDroits
      ? carte(
          "Dernier jour indemnisé",
          formaterDateLongue(r.dateFinDroits),
          r.dateFinDroits !== r.report.dateFinSansInterruption
            ? `au lieu du ${formaterDateLongue(r.report.dateFinSansInterruption)} sans interruption`
            : "si l'indemnisation n'est pas interrompue",
        )
      : "",
    carte("Inscription au plus tard le", formaterDateLongue(r.dateLimiteInscription), "12 mois après la fin du contrat"),
  ].join("");

  const detailDuree = r.duree
    ? `${r.duree.joursCalendaires} jours calendaires dans la période de référence${r.duree.coefficientApplique ? ", × 0,75" : ""}${
        r.duree.plancherApplique ? ", relevés au minimum de 182 jours" : ""
      }${r.duree.plafondApplique ? `, plafonnés à ${r.duree.plafondJours} jours` : ""}.`
    : "";

  const degressivite = r.degressivite.applicable
    ? `<p>Votre allocation (environ ${euros(r.allocationJournaliere)} par jour) baisse de 30 % à partir du 7e mois d'indemnisation, vers le <strong>${formaterDateLongue(
        r.degressivite.dateDebut,
      )}</strong> si l'indemnisation est continue : environ <strong>${euros(r.degressivite.allocationApres || 0)}</strong> par jour ensuite.</p>`
    : `<p>Pas de dégressivité : ${echapper(r.degressivite.raison)}. Allocation estimée : environ ${euros(r.allocationJournaliere)} par jour.</p>`;

  const finDroits = r.dateFinDroits ? formaterDateLongue(r.dateFinDroits) : "la fin de vos droits";

  const lignesReport: string[] = [];
  if (r.report.arretMaladieJours) {
    lignesReport.push(`Arrêt maladie : ${r.report.arretMaladieJours} jour(s) non indemnisés par France Travail, qui repoussent d'autant la fin de vos droits.`);
  }
  if (r.report.repriseJoursIndemnisesParMois !== null) {
    lignesReport.push(
      `Reprise d'emploi : chaque mois, environ ${r.report.repriseJoursIndemnisesParMois} jour(s) indemnisés, soit ${euros(
        r.report.repriseAllocationMensuelle || 0,
      )} d'allocation en plus du salaire ; ${r.report.repriseJoursNonIndemnises} jour(s) de droits reportés au total.`,
    );
  }
  const blocReport = lignesReport.length
    ? `<div class="rounded-lg border border-gray-200 p-4 text-sm text-gray-700"><h3 class="font-semibold text-gray-900 mb-2">Ce qui repousse votre fin de droits</h3><ul class="list-disc list-inside space-y-1">${lignesReport
        .map((l) => `<li>${echapper(l)}</li>`)
        .join("")}</ul></div>`
    : "";

  resultat.innerHTML = `
    ${r.inscriptionHorsDelai ? `<p class="rounded-lg bg-red-50 p-3 text-sm text-red-800">${echapper(r.message)}</p>` : ""}
    <div class="grid gap-4 sm:grid-cols-2">${cartes}</div>
    ${detailDuree ? `<p class="text-sm text-gray-700">${detailDuree}</p>` : ""}
    <div class="rounded-lg border border-gray-200 p-4">
      <h3 class="font-semibold text-gray-900 mb-2">Délai de carence</h3>
      <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
        <li>Différé spécifique (indemnités au-delà du minimum légal) : ${r.differeSpecifiqueJours} jour(s)</li>
        <li>Différé congés payés : ${r.differeCongesPayesJours} jour(s)</li>
        <li>Délai d'attente : ${r.delaiAttenteJours} jour(s), à partir du ${
          r.delaiAttenteJours ? "jour où les différés sont écoulés, ou de votre inscription si elle est plus tardive" : "premier jour possible"
        }</li>
      </ul>
    </div>
    ${blocReport}
    <div class="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
      <h3 class="font-semibold text-gray-900 mb-2">Dégressivité</h3>
      ${degressivite}
    </div>
    <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <h3 class="font-semibold mb-2">Et après ?</h3>
      <p>Demandez le <a class="underline" href="/pages/rsa">RSA</a> dès le mois de ${finDroits} : il n'est pas versé pour les mois antérieurs à la demande. Si vous travaillez, la <a class="underline" href="/pages/prime-activite">prime d'activité</a> peut s'ajouter. France Travail peut aussi examiner vos droits à l'allocation de solidarité spécifique (ASS).</p>
    </div>
    ${
      r.aVerifier.length
        ? `<div class="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><h3 class="font-semibold mb-2">Non calculé</h3><ul class="list-disc list-inside">${r.aVerifier
            .map((t) => `<li>${echapper(t)}</li>`)
            .join("")}</ul></div>`
        : ""
    }
    <p class="text-xs text-gray-600">${echapper(
      r.inscriptionHorsDelai ? "Estimation pour une indemnisation continue." : r.message,
    )} Seule la notification de France Travail fait foi.</p>`;
  resultat.classList.remove("hidden");
  resultat.scrollIntoView({ behavior: "smooth", block: "start" });
});
