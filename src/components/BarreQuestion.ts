/**
 * Barre de question en langage naturel (« combien d'APL pour 700 € de loyer avec 2 enfants à Lyon »).
 *
 * 1. Filtre de données personnelles : la question n'est pas analysée si elle contient un e-mail, un
 *    téléphone, un IBAN, un numéro de sécurité sociale, une adresse ou un nom.
 * 2. Analyse dans le navigateur (analyseurQuestion) : la question ne quitte jamais l'appareil.
 * 3. Redirection vers la page de résultat /r/<simulateur>?…, qui ne contient que des paramètres
 *    structurés (montants, situation, zone, ville), jamais le texte de la question.
 */
import { detecterDonneesPersonnelles, LONGUEUR_MAX_QUESTION, MESSAGE_VIE_PRIVEE } from "../utils/questions/donneesPersonnelles";
import { analyserQuestion } from "../utils/questions/analyseurQuestion";
import { chargerIndexCommunes } from "../utils/questions/communesZones";

/** Remarques d'analyse transmises à la page de résultat (jamais la question elle-même) */
export const CLE_REMARQUES = "lc-question-remarques";

const EXEMPLES = [
  "Combien d'APL pour 700 € de loyer avec 2 enfants à Lyon ?",
  "RSA pour un couple avec 2 enfants sans revenu",
  "Prime d'activité au SMIC, seul, locataire avec APL",
  "2 500 € brut en net",
];

function echapper(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function monterBarreQuestion(conteneur: HTMLElement): void {
  const sombre = conteneur.dataset.bqTheme === "sombre";
  const id = `bq-${Math.random().toString(36).slice(2, 8)}`;
  conteneur.innerHTML = `
    <form class="rounded-xl ${sombre ? "bg-white/10 border border-white/25" : "bg-white border border-blue-200 shadow-sm"} p-4" novalidate role="search" aria-label="Poser une question">
      <label for="${id}" class="block text-sm font-semibold ${sombre ? "text-white" : "text-gray-900"} mb-2">Posez votre question, le simulateur fait le calcul</label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <input id="${id}" type="text" maxlength="${LONGUEUR_MAX_QUESTION}" autocomplete="off" spellcheck="true"
          data-clarity-mask="true"
          class="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="${echapper(EXEMPLES[0])}" />
        <button type="submit" class="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">Calculer</button>
      </div>
      <p class="mt-2 text-xs ${sombre ? "text-slate-200" : "text-gray-600"}">Sans nom, e-mail, téléphone ni adresse : les montants, la ville et la situation suffisent. La question n'est ni envoyée ni conservée.</p>
      <p data-bq-message class="mt-2 hidden rounded-lg px-3 py-2 text-sm" role="alert"></p>
      <div class="mt-3 flex flex-wrap gap-2">
        ${EXEMPLES.map(
          (e) =>
            `<button type="button" data-bq-exemple class="rounded-full ${sombre ? "bg-white/10 text-slate-100 hover:bg-white/20" : "bg-blue-50 text-blue-800 hover:bg-blue-100"} px-3 py-1 text-xs">${echapper(e)}</button>`,
        ).join("")}
      </div>
    </form>`;

  const form = conteneur.querySelector("form") as HTMLFormElement;
  const champ = conteneur.querySelector("input") as HTMLInputElement;
  const message = conteneur.querySelector("[data-bq-message]") as HTMLParagraphElement;
  const bouton = conteneur.querySelector('button[type="submit"]') as HTMLButtonElement;

  const afficher = (texte: string, ton: "erreur" | "info") => {
    message.innerHTML = texte;
    message.className = `mt-2 rounded-lg px-3 py-2 text-sm ${ton === "erreur" ? "bg-red-50 text-red-800 border border-red-200" : "bg-amber-50 text-amber-900 border border-amber-200"}`;
  };

  conteneur.querySelectorAll<HTMLButtonElement>("[data-bq-exemple]").forEach((b) =>
    b.addEventListener("click", () => {
      champ.value = b.textContent || "";
      form.requestSubmit();
    }),
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.classList.add("hidden");
    const question = champ.value.trim();
    if (!question) {
      champ.focus();
      return;
    }

    const filtre = detecterDonneesPersonnelles(question);
    if (filtre.bloque) {
      afficher(
        filtre.types.length ? MESSAGE_VIE_PRIVEE : `La question est trop longue : ${LONGUEUR_MAX_QUESTION} caractères au maximum.`,
        "erreur",
      );
      return;
    }

    let analyse = analyserQuestion(question);
    if (analyse.communeAChercher) {
      bouton.disabled = true;
      bouton.textContent = "…";
      try {
        analyse = analyserQuestion(question, { communes: await chargerIndexCommunes() });
      } catch {
        // Sans le fichier des communes, la zone sera demandée sur la page de résultat
      } finally {
        bouton.disabled = false;
        bouton.textContent = "Calculer";
      }
    }

    if (!analyse.simulateur || !analyse.chemin) {
      afficher(
        `Je n'ai pas reconnu le calcul demandé. Les questions comprises portent sur l'APL, le RSA, la prime d'activité et le salaire brut en net. <a class="underline font-semibold" href="/pages/simulateurs">Voir tous les simulateurs</a>`,
        "info",
      );
      return;
    }

    try {
      sessionStorage.setItem(CLE_REMARQUES, JSON.stringify(analyse.remarques));
    } catch {
      // Stockage indisponible : les remarques ne sont pas affichées
    }
    window.location.href = analyse.chemin;
  });
}

export function monterBarresQuestion(racine: ParentNode = document): void {
  racine.querySelectorAll<HTMLElement>("[data-barre-question]").forEach(monterBarreQuestion);
}
