/**
 * Revenu médian par commune (Insee, Filosofi 2023) + calcul « où je me situe ».
 *
 * - Recherche de commune : API Géo (geo.api.gouv.fr), comme la page taxe foncière.
 * - Chiffres : /data/revenus-communes-2023.json, généré par
 *   scripts/build-revenus-communes-2023.cjs à partir du fichier Insee FILOSOFI_CC.
 * - Le calcul du niveau de vie se fait uniquement dans le navigateur :
 *   aucun montant saisi n'est envoyé ni enregistré.
 */

type CommuneEntry = [number, number | null]; // [médiane du niveau de vie, taux de pauvreté]

type DepartementEntry = {
  nom?: string;
  m: number | null;
  p: number | null;
  deciles?: number[] | null; // D1..D9 si diffusés
};

type RevenusData = {
  millesime: number;
  sourceUrl: string;
  france: {
    medianeMetro: number;
    seuilPauvreteAnnuel: number;
    tauxPauvreteMetro: number | null;
  };
  departements: Record<string, DepartementEntry>;
  communes: Record<string, CommuneEntry>;
};

type GeoCommune = { nom: string; code: string; codeDepartement: string };

const DATA_URL = "/data/revenus-communes-2023.json";
const GEO_URL = "https://geo.api.gouv.fr/communes";

let dataPromise: Promise<RevenusData | null> | null = null;

function loadData(): Promise<RevenusData | null> {
  if (!dataPromise) {
    dataPromise = fetch(DATA_URL)
      .then((r) => (r.ok ? (r.json() as Promise<RevenusData>) : null))
      .catch(() => null);
  }
  return dataPromise;
}

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function depFromCode(code: string) {
  return code.startsWith("97") ? code.slice(0, 3) : code.slice(0, 2);
}

function debounce<T extends (...a: any[]) => void>(fn: T, ms: number) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

async function searchCommunes(query: string): Promise<GeoCommune[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const isPostal = /^\d{5}$/.test(q);
  const url = isPostal
    ? `${GEO_URL}?codePostal=${q}&fields=nom,code,codeDepartement&limit=8`
    : `${GEO_URL}?nom=${encodeURIComponent(q)}&fields=nom,code,codeDepartement&boost=population&limit=8`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return (await res.json()) as GeoCommune[];
  } catch {
    return [];
  }
}

async function fetchCommuneByCode(code: string): Promise<GeoCommune | null> {
  try {
    const res = await fetch(
      `${GEO_URL}/${encodeURIComponent(code)}?fields=nom,code,codeDepartement`,
    );
    if (!res.ok) return null;
    return (await res.json()) as GeoCommune;
  } catch {
    return null;
  }
}

/** Part des communes du département dont la médiane est inférieure à celle de la commune. */
function shareBelowInDepartement(data: RevenusData, code: string, mediane: number) {
  const dep = depFromCode(code);
  let below = 0;
  let total = 0;
  for (const [c, entry] of Object.entries(data.communes)) {
    if (depFromCode(c) !== dep) continue;
    total++;
    if (entry[0] < mediane) below++;
  }
  return total > 1 ? { share: (below / total) * 100, total } : null;
}

function ecartTexte(valeur: number, reference: number) {
  const diff = valeur - reference;
  const rel = (diff / reference) * 100;
  if (Math.abs(rel) < 1) return "au niveau de";
  return `${rel > 0 ? "+" : "−"}${pct.format(Math.abs(rel))} % par rapport à`;
}

type State = { commune: GeoCommune | null };
const state: State = { commune: null };

function renderCommune(root: HTMLElement, data: RevenusData, c: GeoCommune) {
  const out = root.querySelector<HTMLElement>("[data-rc-result]");
  if (!out) return;
  const entry = data.communes[c.code];
  const dep = data.departements[c.codeDepartement];

  if (!entry) {
    out.innerHTML = `<div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
      <p class="font-semibold">${esc(c.nom)} (${esc(c.codeDepartement)}) : chiffre non diffusé par l'Insee</p>
      <p class="mt-2 text-sm">L'Insee ne publie rien pour les communes de moins de 100 habitants fiscaux, ni pour la Guadeloupe, la Martinique, la Guyane et Mayotte.${
        dep?.m
          ? ` Repère : la médiane du département est de <strong>${euro.format(dep.m)}</strong> par an.`
          : ""
      }</p>
    </div>`;
    out.hidden = false;
    return;
  }

  const [m, p] = entry;
  const rank = shareBelowInDepartement(data, c.code, m);
  const lines: string[] = [];
  lines.push(
    `<li><strong>${ecartTexte(m, data.france.medianeMetro)}</strong> la médiane de France métropolitaine (${euro.format(
      data.france.medianeMetro,
    )}).</li>`,
  );
  if (dep?.m) {
    lines.push(
      `<li><strong>${ecartTexte(m, dep.m)}</strong> la médiane du département${
        dep.nom ? ` (${esc(dep.nom)})` : ""
      } : ${euro.format(dep.m)}.</li>`,
    );
  }
  if (rank) {
    lines.push(
      `<li>Plus élevée que dans <strong>${Math.round(rank.share)} %</strong> des ${rank.total} communes du département pour lesquelles l'Insee publie une médiane.</li>`,
    );
  }

  out.innerHTML = `<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
    <p class="text-sm font-semibold uppercase tracking-wide text-emerald-800">${esc(c.nom)} (${esc(c.codeDepartement)})</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <div><p class="text-xs text-slate-600">Revenu médian (niveau de vie) par an</p><p class="text-2xl font-black text-slate-950">${euro.format(m)}</p></div>
      <div><p class="text-xs text-slate-600">Soit par mois</p><p class="text-2xl font-black text-slate-950">${euro.format(m / 12)}</p></div>
      <div><p class="text-xs text-slate-600">Taux de pauvreté</p><p class="text-2xl font-black text-slate-950">${
        p === null
          ? '<span class="text-base font-semibold text-slate-500">non diffusé</span>'
          : `${pct.format(p)} %`
      }</p></div>
    </div>
    <ul class="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">${lines.join("")}</ul>
    <p class="mt-3 text-xs text-slate-500">Revenu disponible par unité de consommation, Insee Filosofi ${data.millesime}. La moitié des habitants vit avec moins, l'autre moitié avec plus.</p>
  </div>`;
  out.hidden = false;
}

function readInt(root: HTMLElement, name: string, fallback: number) {
  const el = root.querySelector<HTMLInputElement>(`[name="${name}"]`);
  const v = el ? parseFloat(el.value.replace(",", ".")) : NaN;
  return Number.isFinite(v) && v >= 0 ? v : fallback;
}

function renderCalcul(root: HTMLElement, data: RevenusData) {
  const out = root.querySelector<HTMLElement>("[data-rc-calc-result]");
  if (!out) return;
  const revenu = readInt(root, "rc-revenu", 0);
  if (revenu <= 0) {
    out.hidden = true;
    return;
  }
  const adultes = Math.max(1, Math.round(readInt(root, "rc-adultes", 1)));
  const enfants = Math.round(readInt(root, "rc-enfants", 0));
  const uc = 1 + 0.5 * (adultes - 1) + 0.3 * enfants;
  const niveauVie = (revenu * 12) / uc;

  const refs: string[] = [];
  const france = data.france.medianeMetro;
  refs.push(
    `<li><strong>${ecartTexte(niveauVie, france)}</strong> la médiane de France métropolitaine (${euro.format(france)} par an).</li>`,
  );

  const c = state.commune;
  const entry = c ? data.communes[c.code] : undefined;
  if (c && entry) {
    refs.push(
      `<li><strong>${ecartTexte(niveauVie, entry[0])}</strong> la médiane de ${esc(c.nom)} (${euro.format(entry[0])}).</li>`,
    );
  }

  const dep = c ? data.departements[c.codeDepartement] : undefined;
  if (dep?.deciles && dep.deciles.length === 9) {
    const d = dep.deciles;
    let idx = d.findIndex((v) => niveauVie < v); // 0..8, -1 si au-dessus de D9
    const lieu = `du département${dep.nom ? ` (${esc(dep.nom)})` : ""}`;
    const texte =
      idx === 0
        ? `Vous faites partie des <strong>10 % des habitants les plus modestes</strong> ${lieu}.`
        : idx === -1
          ? `Vous faites partie des <strong>10 % des habitants les plus aisés</strong> ${lieu}.`
          : `Votre niveau de vie dépasse celui de <strong>${idx * 10} à ${(idx + 1) * 10} % des habitants</strong> ${lieu}.`;
    refs.push(`<li>${texte}</li>`);
  }

  const seuil = data.france.seuilPauvreteAnnuel;
  const pauvre = niveauVie < seuil;
  refs.push(
    `<li>${
      pauvre ? "<strong>Sous</strong>" : "Au-dessus du"
    } seuil de pauvreté (60 % de la médiane : ${euro.format(seuil)} par an, soit ${euro.format(seuil / 12)} par mois et par unité de consommation).</li>`,
  );

  out.innerHTML = `<div class="rounded-2xl border border-blue-200 bg-blue-50 p-5">
    <p class="text-sm text-slate-700">Votre niveau de vie (${pct.format(uc)} unité${uc > 1 ? "s" : ""} de consommation)</p>
    <p class="mt-1 text-3xl font-black text-slate-950">${euro.format(niveauVie)} <span class="text-base font-semibold text-slate-600">par an</span></p>
    <p class="text-sm text-slate-600">soit ${euro.format(niveauVie / 12)} par mois et par unité de consommation</p>
    <ul class="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">${refs.join("")}</ul>
    ${
      pauvre
        ? '<p class="mt-4 text-sm"><a class="font-semibold text-blue-700 underline" href="/pages/prime-activite">Vérifier mes droits à la prime d\'activité</a> · <a class="font-semibold text-blue-700 underline" href="/pages/apl">Simuler mon APL</a></p>'
        : ""
    }
    ${
      !c
        ? '<p class="mt-3 text-xs text-slate-500">Choisissez votre commune ci-dessus pour comparer aussi avec elle et votre département.</p>'
        : ""
    }
  </div>`;
  out.hidden = false;
}

export function initializeRevenuCommune() {
  const rootEl = document.querySelector<HTMLElement>("[data-revenu-commune]");
  const inputEl = rootEl?.querySelector<HTMLInputElement>("[data-rc-input]");
  const listEl = rootEl?.querySelector<HTMLElement>("[data-rc-suggestions]");
  if (!rootEl || !inputEl || !listEl) return;
  const root: HTMLElement = rootEl;
  const input: HTMLInputElement = inputEl;
  const list: HTMLElement = listEl;
  const status = root.querySelector<HTMLElement>("[data-rc-status]");

  const setStatus = (t: string) => {
    if (status) status.textContent = t;
  };
  const hide = () => {
    list.hidden = true;
    list.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
  };

  async function select(c: GeoCommune) {
    hide();
    input.value = `${c.nom} (${c.codeDepartement})`;
    state.commune = c;
    setStatus("Chargement des données Insee…");
    const data = await loadData();
    if (!data) {
      setStatus("Les données n'ont pas pu être chargées. Réessayez dans un instant.");
      return;
    }
    setStatus("");
    renderCommune(root, data, c);
    renderCalcul(root, data);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("commune", c.code);
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* ignore */
    }
  }

  const onInput = debounce(async () => {
    state.commune = null;
    const results = await searchCommunes(input.value);
    if (input.value.trim().length < 2) return hide();
    if (!results.length) {
      list.innerHTML =
        '<li class="px-4 py-2 text-sm text-slate-500">Aucune commune trouvée (essayez le nom ou le code postal)</li>';
      list.hidden = false;
      return;
    }
    list.innerHTML = results
      .map(
        (c, i) =>
          `<li role="option" id="rc-opt-${i}" data-i="${i}" class="cursor-pointer px-4 py-2 text-sm hover:bg-blue-50">${esc(
            c.nom,
          )} <span class="text-slate-500">(${esc(c.codeDepartement)})</span></li>`,
      )
      .join("");
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    list.querySelectorAll<HTMLElement>("[data-i]").forEach((li) =>
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        select(results[Number(li.dataset.i)]);
      }),
    );
  }, 250);

  input.addEventListener("input", onInput);
  input.addEventListener("focus", () => void loadData());
  input.addEventListener("blur", () => window.setTimeout(hide, 150));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = list.querySelector<HTMLElement>("[data-i]");
      if (first) first.dispatchEvent(new MouseEvent("mousedown"));
    } else if (e.key === "Escape") hide();
  });

  const form = root.querySelector<HTMLFormElement>("[data-rc-calc]");
  const recalc = debounce(async () => {
    const data = await loadData();
    if (data) renderCalcul(root, data);
  }, 200);
  form?.addEventListener("input", recalc);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    recalc();
  });

  // Lien partageable : ?commune=CODE_INSEE
  const code = new URLSearchParams(window.location.search).get("commune");
  if (code && /^[0-9AB]{5}$/i.test(code)) {
    fetchCommuneByCode(code.toUpperCase()).then((c) => c && select(c));
  }
}
