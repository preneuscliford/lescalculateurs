interface DvfBucket {
  prixM2: number;
  n: number;
}

interface DvfCommuneEntry {
  nom: string;
  appartement: DvfBucket | null;
  maison: DvfBucket | null;
  fiable: boolean;
}

interface DvfDataset {
  annee: number;
  communes: Record<string, DvfCommuneEntry>;
  departements: Record<string, { appartement: DvfBucket | null; maison: DvfBucket | null }>;
}

interface GeoCommune {
  code: string;
  nom: string;
  codeDepartement?: string;
}

const DATA_URL = "/data/dvf-prix-m2.json";
const MIN_VENTES_FIABLE = 5;

let datasetPromise: Promise<DvfDataset> | null = null;

function loadDataset(): Promise<DvfDataset> {
  if (!datasetPromise) {
    datasetPromise = fetch(DATA_URL).then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }
  return datasetPromise;
}

async function resolveCommune(cp: string): Promise<GeoCommune> {
  const res = await fetch(
    "https://geo.api.gouv.fr/communes?codePostal=" + encodeURIComponent(cp) + "&fields=code,nom,codeDepartement",
  );
  if (!res.ok) throw new Error("HTTP " + res.status);
  const results: GeoCommune[] = await res.json();
  if (!results.length) throw new Error("Code postal introuvable");
  return results[0];
}

const numberFr = (value: number) => Math.round(value).toLocaleString("fr-FR");

function renderBucket(label: string, bucket: DvfBucket | null): string {
  if (!bucket) {
    return `
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">${label}</div>
        <div class="text-lg text-gray-400">Pas assez de données</div>
      </div>
    `;
  }
  return `
    <div class="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">${label}</div>
      <div class="text-2xl font-bold text-gray-900">${numberFr(bucket.prixM2)} €</div>
      <div class="text-xs text-gray-400">/ m² · ${bucket.n} vente${bucket.n > 1 ? "s" : ""}</div>
    </div>
  `;
}

export function mountDvfComparables(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-gray-200 p-6 my-8 max-w-3xl mx-auto">
      <h3 class="text-lg font-bold text-gray-900 mb-2">🏠 Prix immobilier réel dans votre commune</h3>
      <p class="text-sm text-gray-600 mb-4">
        Prix médian au m² observé sur les ventes réelles (DVF, DGFiP), pour comparer avec votre situation.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          id="${containerId}-cp"
          type="text"
          inputmode="numeric"
          maxlength="5"
          placeholder="Code postal (ex. 69001)"
          class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          id="${containerId}-btn"
          class="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded transition whitespace-nowrap"
        >
          Voir les prix
        </button>
      </div>
      <div id="${containerId}-status" class="text-sm text-gray-500 text-center py-2"></div>
      <div id="${containerId}-result" class="hidden"></div>
      <p class="text-xs text-gray-400 mt-3">
        Source :
        <a
          href="https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres-geolocalisees"
          target="_blank"
          rel="nofollow noopener"
          class="underline"
          >Demandes de valeurs foncières géolocalisées</a
        >
        (DGFiP / Etalab).
      </p>
    </div>
  `;

  const statusEl = document.getElementById(containerId + "-status") as HTMLDivElement;
  const resultEl = document.getElementById(containerId + "-result") as HTMLDivElement;
  const input = document.getElementById(containerId + "-cp") as HTMLInputElement;
  const btn = document.getElementById(containerId + "-btn") as HTMLButtonElement;

  async function search() {
    const cp = input.value.trim();
    if (!/^\d{5}$/.test(cp)) {
      statusEl.textContent = "Merci de saisir un code postal à 5 chiffres.";
      resultEl.classList.add("hidden");
      return;
    }

    statusEl.textContent = "Recherche en cours…";
    resultEl.classList.add("hidden");

    try {
      const [commune, dataset] = await Promise.all([resolveCommune(cp), loadDataset()]);
      const entry = dataset.communes[commune.code];
      const deptEntry = commune.codeDepartement ? dataset.departements[commune.codeDepartement] : null;

      const useCommune = entry && entry.fiable;
      const appartement = useCommune ? entry!.appartement : deptEntry?.appartement || entry?.appartement || null;
      const maison = useCommune ? entry!.maison : deptEntry?.maison || entry?.maison || null;

      if (!appartement && !maison) {
        statusEl.textContent = "Aucune vente exploitable trouvée pour cette zone en " + dataset.annee + ".";
        return;
      }

      const scopeNote = useCommune
        ? `à ${commune.nom}`
        : `dans le département (peu de ventes recensées à ${commune.nom} pour être fiable)`;

      resultEl.innerHTML = `
        <div class="grid grid-cols-2 gap-3 mb-2">
          ${renderBucket("Appartement", appartement)}
          ${renderBucket("Maison", maison)}
        </div>
        <p class="text-xs text-gray-500">Prix médian ${scopeNote}, sur les ventes ${dataset.annee}.</p>
      `;
      resultEl.classList.remove("hidden");
      statusEl.textContent = "";
    } catch (err) {
      console.error("DVF comparables error:", err);
      statusEl.textContent = "Impossible de récupérer les données pour ce code postal.";
      resultEl.classList.add("hidden");
    }
  }

  btn.addEventListener("click", search);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") search();
  });
}
