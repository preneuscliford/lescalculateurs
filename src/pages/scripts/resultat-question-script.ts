/**
 * Pages de résultat /r/<simulateur>?… (noindex, canonique vers le simulateur complet).
 * Les paramètres de l'URL sont validés (simulateursQuestions), les informations manquantes sont demandées,
 * puis le moteur du simulateur calcule.
 */
import {
  SIMULATEURS,
  aujourdhuiIso,
  cheminResultat,
  resumeSituation,
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

function champFormulaire(champ: ChampQuestion, valeur: string | number | undefined, manquant: boolean, hypothese: boolean): string {
  const id = `rq-${champ.cle}`;
  const bordure = manquant ? "border-amber-400 ring-1 ring-amber-300" : "border-gray-300";
  const aide = [champ.aide, hypothese ? "valeur supposée, à corriger si besoin" : "", manquant ? "à compléter" : ""].filter(Boolean).join(" · ");
  let saisie: string;
  if (champ.type === "choix") {
    saisie = `<select id="${id}" name="${champ.cle}" class="mt-1 w-full rounded-lg border ${bordure} p-2.5">
      ${manquant ? `<option value="" selected>Choisir…</option>` : ""}
      ${champ.options!.map((o) => `<option value="${echapper(o.valeur)}"${String(valeur) === o.valeur ? " selected" : ""}>${echapper(o.libelle)}</option>`).join("")}
    </select>`;
  } else if (champ.type === "date") {
    saisie = `<input id="${id}" name="${champ.cle}" type="date" value="${echapper(String(valeur ?? ""))}" class="mt-1 w-full rounded-lg border ${bordure} p-2.5" />`;
  } else {
    saisie = `<div class="mt-1 flex items-center gap-2"><input id="${id}" name="${champ.cle}" type="number" inputmode="decimal" step="any"
      min="${champ.min ?? ""}" max="${champ.max ?? ""}" value="${valeur ?? ""}" class="w-full min-w-0 rounded-lg border ${bordure} p-2.5" />
      ${champ.suffixe ? `<span class="shrink-0 text-sm text-gray-600">${echapper(champ.suffixe)}</span>` : ""}</div>`;
  }
  return `<label class="block text-sm font-medium text-gray-800" for="${id}">${echapper(champ.libelle)}${saisie}
    ${aide ? `<span class="mt-1 block text-xs ${manquant ? "text-amber-800" : "text-gray-500"}">${echapper(aide)}</span>` : ""}</label>`;
}

function afficher(def: DefinitionSimulateur, remarques: string[]) {
  const brut = Object.fromEntries(new URLSearchParams(window.location.search));
  const { params, manquants, hypotheses } = validerParametres(def.id, brut);
  const complet = manquants.length === 0;
  const resultat = complet ? def.calculer(params, aujourdhuiIso()) : null;

  const titre = document.getElementById("rq-titre");
  const situation = resumeSituation(def.id, params, manquants);
  // « DPE : jusqu'à quand… ? — classe F » plutôt que deux « : » à la suite
  if (titre) titre.textContent = situation ? `${def.titre}${/[:?]/.test(def.titre) ? " — " : " : "}${situation}` : def.titre;

  const zone = document.getElementById("rq-resultat");
  if (zone) {
    if (resultat && "principal" in resultat) {
      zone.innerHTML = `
        <div class="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <p class="text-sm text-blue-900">${echapper(resultat.phrase)}</p>
          <p class="mt-2 text-3xl sm:text-4xl font-black text-blue-900">${echapper(resultat.principal)}${resultat.unite ? ` <span class="text-lg font-semibold">${echapper(resultat.unite)}</span>` : ""}</p>
          <p class="mt-1 text-sm font-medium text-blue-900">${echapper(resultat.libelle)}</p>
        </div>
        ${resultat.details.length ? `<dl class="grid gap-3 sm:grid-cols-2">
          ${resultat.details.map((d) => `<div class="rounded-lg border border-gray-200 bg-white p-3"><dt class="text-xs text-gray-600">${echapper(d.libelle)}</dt><dd class="font-semibold text-gray-900">${echapper(d.valeur)}</dd></div>`).join("")}
        </dl>` : ""}
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
      // La ville ne vaut que pour la zone ou le département trouvés : elle disparaît s'ils changent
      if (params.ville && (saisie.zone ?? saisie.departement) === (params.zone ?? params.departement)) saisie.ville = params.ville;
      history.pushState(null, "", cheminResultat(def.id, validerParametres(def.id, saisie).params));
      afficher(def, []);
      document.getElementById("rq-resultat")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }

  const proches = document.getElementById("rq-proches");
  if (proches) {
    const liens = complet && resultat && "principal" in resultat ? def.proches(params).filter((l) => validerParametres(def.id, l.params).manquants.length === 0) : [];
    proches.innerHTML = liens
      .map((l) => `<li><a class="text-blue-700 underline hover:text-blue-900" href="${echapper(cheminResultat(def.id, l.params))}">${echapper(l.libelle)}</a></li>`)
      .join("");
    proches.closest("section")?.classList.toggle("hidden", liens.length === 0);
  }
}

const id = document.body.dataset.simulateur as SimulateurId | undefined;
const def = id ? SIMULATEURS[id] : undefined;
if (def) {
  afficher(def, lireRemarques());
  window.addEventListener("popstate", () => afficher(def, []));
}
monterBarresQuestion();
