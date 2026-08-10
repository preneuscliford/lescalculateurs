/**
 * Documentation interactive de l'API LesCalculateurs (/pages/api).
 * Un onglet par endpoint : description, paramètres, exemple de requête
 * (curl + JS) et exemple de réponse réel (capturé sur les moteurs de calcul).
 */

interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiEndpointDoc {
  id: string;
  label: string;
  emoji: string;
  path: string;
  description: string;
  params: ApiParam[];
  body: Record<string, unknown>;
  response: string;
}

const BASE_URL = "https://www.lescalculateurs.fr";

const ENDPOINTS: ApiEndpointDoc[] = [
  {
    id: "rsa",
    label: "RSA",
    emoji: "🧮",
    path: "/api/v1/rsa",
    description: "Simule le montant mensuel de RSA selon la situation familiale, les ressources et le logement.",
    params: [
      { name: "situation", type: '"seul" | "couple" | "monoparental"', required: true, description: "Situation familiale" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "revenus", type: "number", required: true, description: "Revenus mensuels nets, hors RSA" },
      { name: "logement", type: '"loue" | "proprio" | "gratuit" | "sans-abri"', required: true, description: "Situation de logement" },
      { name: "activite", type: '"actif" | "inactif" | "chomage"', required: true, description: "Situation professionnelle" },
    ],
    body: { situation: "seul", enfants: 0, revenus: 300, logement: "loue", activite: "inactif" },
    response: JSON.stringify(
      {
        success: true,
        montantEstime: 351.69,
        eligibilite: "Probablement eligible",
        explication:
          "Cette estimation utilise le bareme RSA en vigueur, vos ressources mensuelles et, si besoin, le forfait logement applique par la CAF.",
        details: { montantBase: 651.69, majorations: 0, revenusPris: 300, abattement: 0, forfaitLogement: 0, montantFinal: 351.69 },
      },
      null,
      2,
    ),
  },
  {
    id: "apl",
    label: "APL",
    emoji: "🏠",
    path: "/api/v1/apl",
    description: "Simule l'aide personnalisée au logement (APL) selon le loyer, les revenus et la zone géographique.",
    params: [
      { name: "situation", type: '"seul" | "couple" | "monoparental" | "autre"', required: true, description: "Situation familiale" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "revenus_mensuels", type: "number", required: true, description: "Revenus mensuels du foyer" },
      { name: "loyer_mensuel", type: "number", required: true, description: "Loyer mensuel hors charges" },
      { name: "region", type: '"idf" | "province" | "dom"', required: true, description: "Zone géographique du logement" },
      { name: "type_logement", type: '"location" | "accession" | "hlm" | "colocation"', required: false, description: "Type de logement" },
    ],
    body: { situation: "seul", enfants: 0, revenus_mensuels: 1200, loyer_mensuel: 600, region: "province" },
    response: JSON.stringify(
      {
        success: true,
        data: {
          apl_estimee: 222,
          apl_brute: 222,
          loyer_mensuel: 600,
          loyer_pris_compte: 510,
          participation: 288,
          forfait_logement: 72,
          reste_charge: 378,
          situation: "seul",
          enfants: 0,
          revenus_mensuels: 1200,
          zone: "province",
          plafond_loyer: 510,
          plafond_apl: 320,
          is_plafonne: false,
        },
      },
      null,
      2,
    ),
  },
  {
    id: "are",
    label: "ARE",
    emoji: "💼",
    path: "/api/v1/are",
    description: "Simule l'allocation d'aide au retour à l'emploi (chômage) selon le salaire de référence et l'ancienneté.",
    params: [
      { name: "situation", type: '"seul" | "couple" | "parent"', required: true, description: "Situation familiale" },
      { name: "ancienneteEmploi", type: "number", required: true, description: "Mois travaillés sur la période de référence" },
      { name: "salaireReferent", type: "number", required: true, description: "Salaire mensuel brut de référence" },
      { name: "personnesCharge", type: "number", required: false, description: "Personnes à charge (défaut 0)" },
      { name: "agePersonne", type: "number", required: true, description: "Âge du demandeur" },
    ],
    body: { situation: "seul", ancienneteEmploi: 24, salaireReferent: 2200, personnesCharge: 0, agePersonne: 35 },
    response: JSON.stringify(
      {
        eligible: true,
        montantEstime: 1289.83,
        durationMax: 18,
        explication:
          "Cette estimation applique la formule officielle France Travail sur votre salaire journalier de reference, avec une duree maximale d'environ 18 mois selon votre anciennete et votre age.",
        details: { tauxRemplacement: 0.5862, montantMinimum: 977, montantMaximum: 1540 },
      },
      null,
      2,
    ),
  },
  {
    id: "retraite",
    label: "Retraite",
    emoji: "🎓",
    path: "/api/v1/retraite",
    description: "Calcule l'âge légal de départ à la retraite et le nombre de trimestres requis pour le taux plein.",
    params: [
      { name: "dateNaissance", type: "string (YYYY-MM-DD)", required: true, description: "Date de naissance" },
      { name: "trimestresValides", type: "number", required: false, description: "Trimestres déjà validés" },
    ],
    body: { dateNaissance: "1964-06-15", trimestresValides: 140 },
    response: JSON.stringify(
      {
        ageLegalYears: 62,
        ageLegalMonths: 9,
        trimestresRequis: 170,
        dateAgeLegal: "2027-03-15T00:00:00.000Z",
        dateTauxPleinAutomatique: "2031-06-15T00:00:00.000Z",
        trimestresValides: 140,
        trimestresManquants: 30,
        bareme: "reforme-2023-suspension-2026",
      },
      null,
      2,
    ),
  },
  {
    id: "indemnite-licenciement",
    label: "Indemnité licenciement",
    emoji: "📄",
    path: "/api/v1/indemnite-licenciement",
    description: "Calcule l'indemnité légale minimale de licenciement selon l'ancienneté et le salaire moyen.",
    params: [
      { name: "dateEntree", type: "string (YYYY-MM-DD)", required: true, description: "Date d'entrée dans l'entreprise" },
      { name: "dateSortie", type: "string (YYYY-MM-DD)", required: true, description: "Date de fin de contrat" },
      { name: "salaireMensuelBrutMoyen", type: "number", required: true, description: "Salaire mensuel brut moyen" },
    ],
    body: { dateEntree: "2015-03-01", dateSortie: "2026-08-01", salaireMensuelBrutMoyen: 2600 },
    response: JSON.stringify(
      {
        eligible: true,
        ancienneteMois: 137,
        ancienneteAnneesDecimal: 11.416666666666666,
        portionJusqua10Ans: 10,
        portionAuDela10Ans: 1.416666666666666,
        montantJusqua10Ans: 6500,
        montantAuDela10Ans: 1227.7777777777771,
        montantTotal: 7727.78,
      },
      null,
      2,
    ),
  },
  {
    id: "salaire-net",
    label: "Salaire net",
    emoji: "💶",
    path: "/api/v1/salaire-net",
    description: "Convertit un salaire brut en net, avec cotisations et prélèvement à la source estimés.",
    params: [
      { name: "salaireBrut", type: "number", required: true, description: "Salaire brut mensuel" },
      { name: "statut", type: '"salarie" | "independant" | "auto-entrepreneur"', required: true, description: "Statut professionnel" },
      { name: "primes", type: "number", required: false, description: "Primes mensuelles (défaut 0)" },
      { name: "heuresSup", type: "number", required: false, description: "Heures supplémentaires en euros (défaut 0)" },
      { name: "ticketsResto", type: "number", required: false, description: "Valeur des tickets restaurant (défaut 0)" },
      { name: "mutuelle", type: "number", required: false, description: "Part mutuelle prise en charge (défaut 0)" },
      { name: "enfants", type: "number", required: false, description: "Nombre d'enfants à charge (défaut 0)" },
      { name: "mariageOrPacs", type: "boolean", required: false, description: "Marié(e) ou pacsé(e) (défaut false)" },
    ],
    body: { salaireBrut: 2800, statut: "salarie", enfants: 0, mariageOrPacs: false },
    response: JSON.stringify(
      {
        success: true,
        salaireNetMensuel: 2153.0971666666665,
        salaireNetAnnuel: 25837.165999999997,
        impotPasTotal: 1395.6339999999996,
        cotisationsSociales: 6367.200000000002,
        salaireGrossMensuel: 2800,
        tauxEffectif: 0.23103672619047622,
        explications: "Avec un salaire brut de 2800.00€ et 0 enfant(s), votre salaire net estimé est 2153.10€ par mois.",
        details: {
          salaireBase: 2800,
          primes: 0,
          heuresSup: 0,
          brutTotal: 2800,
          cotisationsEmploye: 530.6000000000001,
          prelevementSource: 116.3028333333333,
          ticketsResto: 0,
          mutuelle: 0,
          netTotal: 2153.0971666666665,
        },
      },
      null,
      2,
    ),
  },
];

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildCurl(endpoint: ApiEndpointDoc): string {
  const bodyJson = JSON.stringify(endpoint.body, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : "  " + line))
    .join("\n");
  return `curl -X POST ${BASE_URL}${endpoint.path} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: VOTRE_CLE" \\
  -d '${bodyJson}'`;
}

function buildJs(endpoint: ApiEndpointDoc): string {
  const bodyJson = JSON.stringify(endpoint.body, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : "  " + line))
    .join("\n");
  return `const res = await fetch("${BASE_URL}${endpoint.path}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "VOTRE_CLE",
  },
  body: JSON.stringify(${bodyJson}),
});
const data = await res.json();`;
}

function renderParamsTable(params: ApiParam[]): string {
  const rows = params
    .map(
      (p) => `
        <tr>
          <td class="p-2 font-mono text-indigo-700 whitespace-nowrap">${escapeHtml(p.name)}</td>
          <td class="p-2 font-mono text-gray-500 text-xs whitespace-nowrap">${escapeHtml(p.type)}</td>
          <td class="p-2 text-center">${p.required ? '<span class="text-red-600 font-semibold">requis</span>' : '<span class="text-gray-400">optionnel</span>'}</td>
          <td class="p-2 text-gray-600">${escapeHtml(p.description)}</td>
        </tr>`,
    )
    .join("");

  return `
    <div class="overflow-x-auto">
      <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-6">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="text-left p-2 font-semibold">Paramètre</th>
            <th class="text-left p-2 font-semibold">Type</th>
            <th class="text-left p-2 font-semibold">Requis</th>
            <th class="text-left p-2 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">${rows}</tbody>
      </table>
    </div>`;
}

function renderPanel(endpoint: ApiEndpointDoc): string {
  return `
    <div>
      <div class="flex items-center gap-2 mb-2">
        <span class="font-mono text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold">POST</span>
        <span class="font-mono text-sm text-gray-800">${escapeHtml(endpoint.path)}</span>
      </div>
      <p class="text-gray-600 mb-5">${escapeHtml(endpoint.description)}</p>

      <h3 class="font-semibold text-gray-800 mb-2">Paramètres</h3>
      ${renderParamsTable(endpoint.params)}

      <h3 class="font-semibold text-gray-800 mb-2">Exemple de requête</h3>
      <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto mb-2">
        <pre class="text-sm text-green-300 font-mono whitespace-pre">${escapeHtml(buildCurl(endpoint))}</pre>
      </div>
      <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto mb-6">
        <pre class="text-sm text-blue-300 font-mono whitespace-pre">${escapeHtml(buildJs(endpoint))}</pre>
      </div>

      <h3 class="font-semibold text-gray-800 mb-2">Exemple de réponse</h3>
      <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto">
        <pre class="text-sm text-amber-200 font-mono whitespace-pre">${escapeHtml(endpoint.response)}</pre>
      </div>
    </div>`;
}

function initApiDocs(): void {
  const tabsEl = document.getElementById("api-doc-tabs");
  const panelEl = document.getElementById("api-doc-panel");
  if (!tabsEl || !panelEl) return;

  function selectTab(id: string): void {
    const endpoint = ENDPOINTS.find((e) => e.id === id) || ENDPOINTS[0];
    panelEl!.innerHTML = renderPanel(endpoint);

    tabsEl!.querySelectorAll<HTMLButtonElement>("button[data-endpoint]").forEach((btn) => {
      const active = btn.dataset.endpoint === endpoint.id;
      btn.classList.toggle("bg-indigo-600", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("bg-gray-100", !active);
      btn.classList.toggle("text-gray-700", !active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  tabsEl.innerHTML = ENDPOINTS.map(
    (e) => `
      <button
        type="button"
        data-endpoint="${e.id}"
        role="tab"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
      >${e.emoji} ${escapeHtml(e.label)}</button>`,
  ).join("");

  tabsEl.querySelectorAll<HTMLButtonElement>("button[data-endpoint]").forEach((btn) => {
    btn.addEventListener("click", () => selectTab(btn.dataset.endpoint!));
  });

  selectTab(ENDPOINTS[0].id);
}

function initMobileMenu(): void {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => menu.classList.toggle("hidden"));
}

interface GenerateKeyResponse {
  key: string;
  issuedAt: string;
  expiresAt: string;
  error?: string;
}

function initKeyGenerator(): void {
  const btn = document.getElementById("generate-key-btn") as HTMLButtonElement | null;
  const resultEl = document.getElementById("generate-key-result");
  if (!btn || !resultEl) return;

  function showError(message: string): void {
    resultEl!.innerHTML = `<div class="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-4">${escapeHtml(message)}</div>`;
    resultEl!.classList.remove("hidden");
  }

  btn.addEventListener("click", async () => {
    const originalLabel = btn.textContent || "Générer ma clé API";
    btn.disabled = true;
    btn.textContent = "Génération...";

    try {
      const res = await fetch("/api/v1/keys", { method: "POST" });
      const data = (await res.json()) as GenerateKeyResponse;

      if (!res.ok) {
        showError(data.error || "Erreur lors de la génération de la clé.");
        return;
      }

      const expiresDisplay = new Date(data.expiresAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      resultEl.innerHTML = `
        <div class="bg-white border-2 border-green-500 rounded-lg p-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">Votre clé API (valable jusqu'au ${expiresDisplay}) :</p>
          <div class="flex items-center gap-2">
            <code class="flex-1 bg-gray-100 text-gray-900 text-xs p-2 rounded overflow-x-auto whitespace-nowrap">${escapeHtml(data.key)}</code>
            <button id="copy-key-btn" type="button" class="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded whitespace-nowrap">Copier</button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Conservez-la : elle ne sera plus affichée. Revenez sur cette page pour en générer une nouvelle à tout moment.</p>
        </div>`;
      resultEl.classList.remove("hidden");

      const copyBtn = document.getElementById("copy-key-btn");
      copyBtn?.addEventListener("click", async () => {
        await navigator.clipboard.writeText(data.key);
        copyBtn.textContent = "Copié !";
        window.setTimeout(() => {
          copyBtn.textContent = "Copier";
        }, 1500);
      });
    } catch {
      showError("Erreur réseau, réessayez.");
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}

initApiDocs();
initMobileMenu();
initKeyGenerator();
