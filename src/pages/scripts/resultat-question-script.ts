/**
 * Pages de résultat /r/<simulateur>?… (noindex, canonique vers le simulateur complet).
 * Les paramètres de l'URL sont validés (simulateursQuestions), les informations manquantes sont demandées,
 * puis le moteur du simulateur calcule.
 */
import {
  SIMULATEURS,
  cheminResultat,
  euros,
  validerParametres,
  type ChampQuestion,
  type DefinitionSimulateur,
  type ParametresQuestion,
  type SimulateurId,
} from "../../utils/questions/simulateursQuestions";
import { CLE_REMARQUES, monterBarresQuestion } from "../../components/BarreQuestion";

const echapper = (t: string) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function lireRemarques(): string[] {
  try {
    const brut = sessionStorage.getItem(CLE_REMARQUES);
    sessionStorage.removeItem(CLE_REMARQUES);
    const r = brut ? JSON.parse(brut) : [];
    return Array.isArray(r) ? r.filter((x) => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

/** Formulation courte de chaque information dans le titre (chaîne vide : non affichée) */
const RESUME: Record<string, (v: string | number, p: ParametresQuestion) => string> = {
  situation: (v) => ({ seul: "personne seule", couple: "couple", monoparental: "parent isolé" })[v as "seul"] ?? "",
  enfants: (v) => (Number(v) === 0 ? "sans enfant" : `${v} enfant${Number(v) > 1 ? "s" : ""}`),
  loyer: (v) => `loyer de ${euros(Number(v))}`,
  revenus: (v) => (Number(v) === 0 ? "sans revenu" : `${euros(Number(v))} de revenus`),
  salaire: (v) => `${euros(Number(v))} de salaire net`,
  autres: (v) => (Number(v) > 0 ? `${euros(Number(v))} d'autres revenus` : ""),
  zone: (v, p) => {
    const zone = v === "dom" ? "outre-mer" : String(v).replace("zone", "zone ");
    return p.ville ? `${p.ville} (${zone})` : zone;
  },
  logement: (v) =>
    ({
      colocation: "colocation",
      hlm: "logement social",
      aide_logement: "locataire avec APL",
      loue: "locataire sans APL",
      proprio: "propriétaire",
      gratuit: "logé gratuitement",
      "sans-abri": "sans logement stable",
    })[v as "hlm"] ?? "",
  activite: (v) => ({ chomage: "demandeur d'emploi", inactif: "sans activité", independant: "indépendant", apprenti: "apprenti" })[v as "chomage"] ?? "",
  brut: (v) => `${euros(Number(v))} brut`,
  statut: (v) => (v === "cadre" ? "cadre" : "non-cadre"),
  pas: (v) => (Number(v) > 0 ? `prélèvement à la source de ${v} %` : ""),
};
const ORDRE_RESUME = ["situation", "enfants"];

/** Résumé de la situation : « couple, 2 enfants, loyer de 700 €, 1 500 € de revenus, Lyon (zone 2) » */
function resumeSituation(def: DefinitionSimulateur, p: ParametresQuestion, manquants: string[]): string {
  const cles = def.champs.map((c) => c.cle).sort((a, b) => {
    const ia = ORDRE_RESUME.indexOf(a), ib = ORDRE_RESUME.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return cles
    .filter((cle) => !manquants.includes(cle) && p[cle] !== undefined)
    .map((cle) => RESUME[cle]?.(p[cle], p) ?? "")
    .filter(Boolean)
    .join(", ");
}

function champFormulaire(champ: ChampQuestion, valeur: string | number | undefined, manquant: boolean, hypothese: boolean): string {
  const id = `rq-${champ.cle}`;
  const bordure = manquant ? "border-amber-400 ring-1 ring-amber-300" : "border-gray-300";
  const aide = [champ.aide, hypothese ? "valeur supposée, à corriger si besoin" : "", manquant ? "à compléter" : ""].filter(Boolean).join(" · ");
  const saisie =
    champ.type === "choix"
      ? `<select id="${id}" name="${champ.cle}" class="mt-1 w-full rounded-lg border ${bordure} p-2.5">
          ${manquant ? `<option value="" selected>Choisir…</option>` : ""}
          ${champ.options!.map((o) => `<option value="${o.valeur}"${String(valeur) === o.valeur ? " selected" : ""}>${echapper(o.libelle)}</option>`).join("")}
        </select>`
      : `<div class="mt-1 flex items-center gap-2"><input id="${id}" name="${champ.cle}" type="number" inputmode="decimal" step="any"
          min="${champ.min ?? ""}" max="${champ.max ?? ""}" value="${valeur ?? ""}" class="w-full rounded-lg border ${bordure} p-2.5" />
          ${champ.suffixe ? `<span class="shrink-0 text-sm text-gray-600">${echapper(champ.suffixe)}</span>` : ""}</div>`;
  return `<label class="block text-sm font-medium text-gray-800" for="${id}">${echapper(champ.libelle)}${saisie}
    ${aide ? `<span class="mt-1 block text-xs ${manquant ? "text-amber-800" : "text-gray-500"}">${echapper(aide)}</span>` : ""}</label>`;
}

function afficher(def: DefinitionSimulateur, remarques: string[]) {
  const brut = Object.fromEntries(new URLSearchParams(window.location.search));
  const { params, manquants, hypotheses } = validerParametres(def.id, brut);
  const complet = manquants.length === 0;
  const resultat = complet ? def.calculer(params) : null;

  const titre = document.getElementById("rq-titre");
  const situation = resumeSituation(def, params, manquants);
  if (titre) titre.textContent = situation ? `${def.titre} : ${situation}` : def.titre;

  const zone = document.getElementById("rq-resultat");
  if (zone) {
    if (resultat && "montant" in resultat) {
      zone.innerHTML = `
        <div class="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <p class="text-sm text-blue-900">${echapper(resultat.phrase)}</p>
          <p class="mt-2 text-4xl font-black text-blue-900">${euros(resultat.montant, resultat.montant % 1 ? 2 : 0)} <span class="text-lg font-semibold">${echapper(resultat.unite)}</span></p>
          <p class="mt-1 text-sm font-medium text-blue-900">${echapper(resultat.libelle)}</p>
        </div>
        <dl class="grid gap-3 sm:grid-cols-2">
          ${resultat.details.map((d) => `<div class="rounded-lg border border-gray-200 bg-white p-3"><dt class="text-xs text-gray-600">${echapper(d.libelle)}</dt><dd class="font-semibold text-gray-900">${echapper(d.valeur)}</dd></div>`).join("")}
        </dl>
        <div class="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p class="font-semibold text-gray-900">Limites de cette estimation</p>
          <ul class="mt-1 list-disc pl-5">${[...resultat.limites, ...hypotheses.map((h) => `Valeur supposée : ${def.champs.find((c) => c.cle === h)?.libelle.toLowerCase()}.`)].map((l) => `<li>${echapper(l)}</li>`).join("")}</ul>
        </div>`;
    } else if (resultat && "erreur" in resultat) {
      zone.innerHTML = `<p class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">${echapper(resultat.erreur)}</p>`;
    } else {
      zone.innerHTML = `<p class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Il manque ${manquants.length > 1 ? "quelques informations" : "une information"} pour calculer : ${manquants
        .map((m) => echapper(def.champs.find((c) => c.cle === m)!.libelle.toLowerCase()))
        .join(", ")}. Complétez le formulaire ci-dessous.</p>`;
    }
    if (remarques.length) {
      zone.insertAdjacentHTML("afterbegin", `<ul class="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">${remarques.map((r) => `<li>${echapper(r)}</li>`).join("")}</ul>`);
    }
  }

  const form = document.getElementById("rq-form") as HTMLFormElement | null;
  if (form) {
    form.innerHTML = `
      <div class="grid gap-4 sm:grid-cols-2">${def.champs.map((c) => champFormulaire(c, params[c.cle], manquants.includes(c.cle), hypotheses.includes(c.cle))).join("")}</div>
      <button type="submit" class="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">${complet ? "Recalculer" : "Calculer"}</button>`;
    form.onsubmit = (e) => {
      e.preventDefault();
      const saisie: ParametresQuestion = Object.fromEntries(new FormData(form).entries()) as ParametresQuestion;
      // La ville ne vaut que pour la zone trouvée : elle disparaît si la zone change
      if (params.ville && saisie.zone === params.zone) saisie.ville = params.ville;
      history.pushState(null, "", cheminResultat(def.id, validerParametres(def.id, saisie).params));
      afficher(def, []);
      document.getElementById("rq-resultat")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }

  const proches = document.getElementById("rq-proches");
  if (proches) {
    proches.innerHTML = complet
      ? def
          .proches(params)
          .map((l) => `<li><a class="text-blue-700 underline hover:text-blue-900" href="${echapper(cheminResultat(def.id, l.params))}">${echapper(l.libelle)}</a></li>`)
          .join("")
      : "";
    proches.closest("section")?.classList.toggle("hidden", !complet);
  }
}

const id = document.body.dataset.simulateur as SimulateurId | undefined;
const def = id ? SIMULATEURS[id] : undefined;
if (def) {
  afficher(def, lireRemarques());
  window.addEventListener("popstate", () => afficher(def, []));
}
monterBarresQuestion();
