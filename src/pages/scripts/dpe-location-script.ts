/**
 * Page « DPE et location » : date d'interdiction, bail en cours, gel du loyer.
 * Calcul : src/utils/dpeLocationCalculEngine.ts.
 */
import { calculerDpeLocation, formaterDateLongue, type ClasseDpe, type TypeBail } from "../../utils/dpeLocationCalculEngine";

const form = document.getElementById("dpe-form") as HTMLFormElement | null;
const resultat = document.getElementById("dpe-resultat") as HTMLDivElement | null;
const erreur = document.getElementById("dpe-erreur") as HTMLParagraphElement | null;

const valeur = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value || "";
const coche = (id: string) => Boolean((document.getElementById(id) as HTMLInputElement | null)?.checked);
const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function carte(titre: string, principal: string, detail = "", ton: "neutre" | "alerte" | "ok" = "neutre") {
  const c = { neutre: "border-amber-200 bg-amber-50 text-amber-900", alerte: "border-red-200 bg-red-50 text-red-900", ok: "border-emerald-200 bg-emerald-50 text-emerald-900" }[ton];
  return `<div class="rounded-lg border ${c} p-4">
    <p class="text-sm font-medium">${titre}</p>
    <p class="mt-1 text-xl font-bold">${principal}</p>
    ${detail ? `<p class="mt-1 text-xs">${detail}</p>` : ""}
  </div>`;
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  erreur?.classList.add("hidden");
  const typeBail = valeur("dpe-bail") as TypeBail | "";
  if (typeBail && !valeur("dpe-debut")) {
    if (erreur) {
      erreur.textContent = "Indiquez la date de début du bail en cours.";
      erreur.classList.remove("hidden");
    }
    return;
  }
  const r = calculerDpeLocation({
    classe: valeur("dpe-classe") as ClasseDpe,
    outreMer: coche("dpe-outre-mer"),
    typeBail: typeBail || undefined,
    dateDebutBail: valeur("dpe-debut") || undefined,
    dateReference: aujourdhui(),
  });
  if (!resultat) return;

  const cartes: string[] = [];
  if (r.aVerifier.length === 0) {
    cartes.push(
      r.dateInterdiction
        ? carte(
            r.nouveauBailPossible ? "Plus de nouveau bail à partir du" : "Nouveau bail interdit depuis le",
            formaterDateLongue(r.dateInterdiction),
            "ni renouvellement, ni reconduction tacite sans travaux",
            r.nouveauBailPossible ? "neutre" : "alerte",
          )
        : carte("Interdiction de location", "Aucune prévue", "classes A à D", "ok"),
    );
    if (r.echeanceConcernee) {
      cartes.push(
        r.echeanceDepassee
          ? carte(
              "Échéance déjà passée",
              formaterDateLongue(r.echeanceConcernee),
              "à cette date, le logement aurait dû atteindre la classe exigée",
              "alerte",
            )
          : carte(
              r.bailSansReconduction ? "Le bail s'arrête à son terme le" : "Le bail en cours peut continuer jusqu'au",
              formaterDateLongue(r.bailEnCoursJusquAu),
              r.bailSansReconduction
                ? "pas de reconduction : un nouveau bail suppose un logement décent"
                : `à l'échéance du ${formaterDateLongue(r.echeanceConcernee)}, ni renouvellement ni reconduction sans travaux`,
            ),
      );
    }
    cartes.push(
      r.loyerGele
        ? carte("Loyer", "Gelé", "pas de révision annuelle ni de hausse à la relocation ou au renouvellement", "alerte")
        : carte("Loyer", "Hausse possible", "dans les conditions habituelles (révision annuelle selon l'IRL)", "ok"),
    );
  }

  resultat.innerHTML = `
    <p class="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">${echapper(r.message)}</p>
    ${cartes.length ? `<div class="grid gap-4 sm:grid-cols-2">${cartes.join("")}</div>` : ""}
    ${
      r.aVerifier.length
        ? `<div class="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><h3 class="font-semibold mb-2">Non calculé</h3><ul class="list-disc list-inside">${r.aVerifier
            .map((t) => `<li>${echapper(t)}</li>`)
            .join("")}</ul></div>`
        : ""
    }
    ${
      r.echeanceDepassee
        ? `<p class="text-sm text-gray-700">Le locataire peut demander la mise en conformité à l'amiable, puis saisir la commission départementale de conciliation ou le juge.</p>`
        : ""
    }`;
  resultat.classList.remove("hidden");
  resultat.scrollIntoView({ behavior: "smooth", block: "start" });
});
