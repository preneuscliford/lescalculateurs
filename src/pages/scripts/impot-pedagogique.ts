import { CalculatorFrame } from "../../components/CalculatorFrame.ts";
import { ComparisonModal } from "../../components/ComparisonModal.ts";
import { formatCurrency } from "../../main.ts";

const bareme = [
  { plafond: 11497, taux: 0 },
  { plafond: 29315, taux: 0.11 },
  { plafond: 83823, taux: 0.3 },
  { plafond: 180294, taux: 0.41 },
  { plafond: Infinity, taux: 0.45 },
];

// Fonction pour calculer la distribution du revenu par tranche
function calculateDistribution(qf: number) {
  const distribution = [];
  let prev = 0;

  for (let i = 0; i < bareme.length; i++) {
    const tranchePlafond = bareme[i].plafond;
    const taux = bareme[i].taux;

    if (qf <= prev) break;

    const montant = Math.min(qf, tranchePlafond) - prev;
    distribution.push({
      tranche: i + 1,
      de: prev,
      a: Math.min(qf, tranchePlafond),
      montant,
      taux,
      impotParPart: montant * taux,
    });

    prev = tranchePlafond;
    if (qf <= tranchePlafond) break;
  }

  return distribution;
}

// Fonction pour calculer l'IR brut à partir d'un revenu et de parts
function calculateIR(revenu: number, parts: number): number {
  const qf = revenu / parts;
  let impotsParPart = 0;
  let prev = 0;

  for (let i = 0; i < bareme.length; i++) {
    const tranchePlafond = bareme[i].plafond;
    const taux = bareme[i].taux;
    const base = Math.max(0, Math.min(qf, tranchePlafond) - prev);
    impotsParPart += base * taux;
    prev = tranchePlafond;
    if (qf <= tranchePlafond) break;
  }

  return impotsParPart * parts;
}

// Interface pour les scénarios de comparaison
interface ComparisonScenario {
  id: string;
  name: string;
  revenu: number;
  parts: number;
  custom: boolean;
}

// Stockage et gestion des scénarios
const comparisonStorage = {
  getScenarios(): ComparisonScenario[] {
    const stored = localStorage.getItem("impot-scenarios");
    return stored ? JSON.parse(stored) : [];
  },
  addScenario(scenario: ComparisonScenario) {
    const scenarios = this.getScenarios();
    scenarios.push(scenario);
    localStorage.setItem("impot-scenarios", JSON.stringify(scenarios));
  },
  removeScenario(id: string) {
    const scenarios = this.getScenarios().filter((s) => s.id !== id);
    localStorage.setItem("impot-scenarios", JSON.stringify(scenarios));
  },
};

const impotConfig = {
  title: "Impôt sur le revenu 2026",
  description:
    "Barème progressif et quotient familial (estimation indicative, hors décote/réductions/crédits).",
  fields: [
    {
      id: "revenu",
      label: "Revenu imposable annuel (€)",
      type: "number" as const,
      required: true,
      placeholder: "38000",
      min: 0,
      step: 100,
    },
    {
      id: "parts",
      label: "Nombre de parts",
      type: "number" as const,
      required: true,
      placeholder: "1",
      min: 0.5,
      step: 0.5,
    },
  ],
  calculate: (values: Record<string, any>) => {
    try {
      const revenu = Number(values.revenu);
      const parts = Number(values.parts);
      if (!isFinite(revenu) || revenu < 0 || !isFinite(parts) || parts <= 0) {
        return {
          success: false,
          error: "Veuillez saisir un revenu et un nombre de parts valides.",
        };
      }
      const qf = revenu / parts;
      let impotsParPart = 0;
      let prev = 0;
      for (let i = 0; i < bareme.length; i++) {
        const tranchePlafond = bareme[i].plafond;
        const taux = bareme[i].taux;
        const base = Math.max(0, Math.min(qf, tranchePlafond) - prev);
        impotsParPart += base * taux;
        prev = tranchePlafond;
        if (qf <= tranchePlafond) break;
      }
      const irBrut = impotsParPart * parts;
      const tauxMoyen = revenu > 0 ? irBrut / revenu : 0;
      const mensualiteMoyenne = irBrut / 12;
      const tauxMarginal = bareme.find((b) => qf <= b.plafond)?.taux || 0;
      return {
        success: true,
        data: {
          revenu,
          parts,
          qf,
          irBrut,
          tauxMoyen,
          tauxMarginal,
          mensualiteMoyenne,
        },
      };
    } catch (e) {
      return {
        success: false,
        error: "Erreur lors du calcul. Vérifiez vos données.",
      };
    }
  },
  formatResult: (result: any) => {
    const d = result.data;
    const distribution = calculateDistribution(d.qf);
    const impotParPart = d.parts > 0 ? d.irBrut / d.parts : 0;
    const isZeroIR = d.irBrut <= 0;

    // Déterminer l'explication des parts fiscales
    let partsExplication = "";
    if (d.parts === 1) {
      partsExplication = "👤 Célibataire, divorcé(e) ou veuf(ve) sans enfant";
    } else if (d.parts === 1.5) {
      partsExplication = "👤👧 Célibataire avec 1 enfant à charge";
    } else if (d.parts === 2) {
      partsExplication = "👨‍👩 Couple marié ou PACS";
    } else if (d.parts === 2.5) {
      partsExplication = "👨‍👩‍👧 Couple avec 1 enfant";
    } else if (d.parts === 3) {
      partsExplication = "👨‍👩‍👧‍👦 Couple avec 2 enfants";
    } else {
      partsExplication = `${Math.floor(d.parts)} part(s) fiscale(s)`;
    }

    // Générer les cas automatiques de comparaison
    const autoCases = [
      { name: "Célibataire (1 part)", parts: 1, emoji: "👤" },
      { name: "Couple (2 parts)", parts: 2, emoji: "👨‍👩" },
      { name: "Couple + 1 enfant (2,5 parts)", parts: 2.5, emoji: "👨‍👩‍👧" },
      { name: "Couple + 2 enfants (3 parts)", parts: 3, emoji: "👨‍👩‍👧‍👦" },
    ];

    // Construire les données de comparaison (revenu fixe de l'utilisateur, parts variables)
    const allCases: ComparisonScenario[] = autoCases.map((c, i) => ({
      id: `auto-${i}`,
      name: c.name,
      revenu: d.revenu,
      parts: c.parts,
      custom: false,
    }));

    // Ajouter les scénarios personnalisés
    const customScenarios = comparisonStorage.getScenarios();
    allCases.push(...customScenarios);

    // Calculer IR pour chaque cas
    const casesWithIR = allCases.map((c, i) => ({
      ...c,
      emoji: autoCases[i]?.emoji || "🔧",
      ir: calculateIR(c.revenu, c.parts),
      tauxMoyen: (calculateIR(c.revenu, c.parts) / c.revenu) * 100,
      tauxMarginal: (() => {
        const qf = c.revenu / c.parts;
        return (bareme.find((b) => qf <= b.plafond)?.taux || 0) * 100;
      })(),
    }));

    // HTML pour le tableau de comparaison
    const comparisonTableHTML = `
      <div class="space-y-6 mt-6">
        <!-- Bloc de Comparaison -->
        <div class="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
          <h3 class="text-lg font-bold text-teal-900 mb-2">🔍 Comparez votre impôt à d'autres situations</h3>
          <p class="text-sm text-teal-700 mb-4">Découvrez comment votre impôt varie selon votre situation familiale ou vos revenus.</p>

          <!-- Tableau de Comparaison -->
          <div class="overflow-x-auto mb-6">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-teal-100">
                  <th class="p-3 text-left border border-teal-200 font-semibold">Situation</th>
                  <th class="p-3 text-center border border-teal-200 font-semibold">Parts</th>
                  <th class="p-3 text-right border border-teal-200 font-semibold">IR à payer</th>
                  <th class="p-3 text-center border border-teal-200 font-semibold">Taux moyen</th>
                  <th class="p-3 text-center border border-teal-200 font-semibold">Taux marginal</th>
                  ${
                    customScenarios.length > 0
                      ? '<th class="p-3 text-center border border-teal-200 font-semibold">Action</th>'
                      : ""
                  }
                </tr>
              </thead>
              <tbody>
                ${casesWithIR
                  .map((c, i) => {
                    const isCurrentCase = c.parts === d.parts;
                    const rowBG = isCurrentCase ? "bg-blue-50" : "bg-white";
                    const badge = isCurrentCase
                      ? "✓ Votre cas"
                      : c.custom
                      ? "🔧 Perso"
                      : "";

                    return `
                    <tr class="${rowBG} border-b border-teal-100 hover:bg-teal-50 transition">
                      <td class="p-3 border border-teal-200 font-semibold">
                        <div class="flex items-center gap-2">
                          <span>${c.emoji || "📊"}</span>
                          <span>${c.name}</span>
                        </div>
                        ${
                          badge
                            ? `<span class="text-xs text-blue-600 font-bold">${badge}</span>`
                            : ""
                        }
                      </td>
                      <td class="p-3 border border-teal-200 text-center">${
                        c.parts
                      }</td>
                      <td class="p-3 border border-teal-200 text-right font-bold text-gray-900">${formatCurrency(
                        c.ir
                      )}</td>
                      <td class="p-3 border border-teal-200 text-center">${c.tauxMoyen.toFixed(
                        1
                      )}%</td>
                      <td class="p-3 border border-teal-200 text-center">${c.tauxMarginal.toFixed(
                        0
                      )}%</td>
                      ${
                        c.custom
                          ? `<td class="p-3 border border-teal-200 text-center">
                        <button class="btn-remove-scenario text-red-500 hover:text-red-700 font-bold" data-id="${c.id}">✕</button>
                      </td>`
                          : ""
                      }
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>

          <!-- Graphique de Comparaison -->
          <div class="bg-white rounded-lg p-4 border border-teal-100 mb-6">
            <p class="text-xs font-semibold text-gray-600 mb-4">📈 Impôt par situation</p>
            <div style="position: relative; height: 300px; width: 100%;">
              <canvas id="chart-comparison"></canvas>
            </div>
          </div>

          <!-- Bouton Ajouter Scénario -->
          <button id="btn-add-scenario" class="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
            ➕ Ajouter un scénario
          </button>
        </div>
      </div>
    `;

    // Afficher le HTML complet
    const mainHTML = `
    <div class="space-y-6">
      <!-- Résultat Principal -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 class="font-semibold text-gray-800">💰 Impôt estimé (barème brut)</h4>
          <p class="text-2xl font-bold text-blue-600">${formatCurrency(
            d.irBrut
          )}</p>
          <p class="text-sm text-gray-600 mt-1">Mensualité: ${formatCurrency(
            d.mensualiteMoyenne
          )}</p>
          <p class="text-xs text-gray-500 mt-2">Taux moyen: ${(
            d.tauxMoyen * 100
          ).toFixed(1)}%</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 class="font-semibold text-gray-800">📊 Quotient familial</h4>
          <p class="text-2xl font-bold text-green-600">${formatCurrency(
            d.qf
          )}</p>
          <p class="text-sm text-gray-600 mt-1">${partsExplication}</p>
          <p class="text-xs text-gray-500 mt-2">Taux marginal: ${(
            d.tauxMarginal * 100
          ).toFixed(0)}%</p>
        </div>
      </div>

      ${
        isZeroIR
          ? `
      <div class="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-green-900 mb-2">✅ Pourquoi l'impôt est à 0 € ?</h3>
        <ul class="text-sm text-green-900 list-disc list-inside space-y-1">
          <li>Votre quotient familial (${formatCurrency(
            d.qf
          )}) reste dans la tranche à 0 % (jusqu'à ${formatCurrency(
            bareme[0].plafond
          )} par part).</li>
          <li>Ce résultat est une estimation “barème brut” (hors décote, réductions et crédits d'impôt).</li>
          <li>En pratique, la décote et vos avantages fiscaux peuvent changer le montant final.</li>
        </ul>
      </div>
      `
          : ""
      }

      <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h3 class="text-lg font-bold text-blue-900 mb-2">🧠 Logique de calcul (simplifiée)</h3>
        <ul class="text-sm text-blue-900 list-disc list-inside space-y-1">
          <li>Quotient familial (QF) = Revenu imposable ÷ Nombre de parts</li>
          <li>Impôt par part = application du barème progressif sur le QF</li>
          <li>Impôt estimé = (Impôt par part) × Nombre de parts</li>
        </ul>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-3">📊 Détail chiffré (étape par étape)</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-50">
                <th class="p-2 text-left border border-gray-200">Tranche</th>
                <th class="p-2 text-center border border-gray-200">De - À (par part)</th>
                <th class="p-2 text-center border border-gray-200">Taux</th>
                <th class="p-2 text-right border border-gray-200">Base (par part)</th>
                <th class="p-2 text-right border border-gray-200">Impôt (par part)</th>
              </tr>
            </thead>
            <tbody>
              ${distribution
                .map(
                  (dist: any) => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="p-2 border border-gray-200">${dist.tranche}</td>
                  <td class="p-2 text-center border border-gray-200">${formatCurrency(
                    dist.de
                  )} à ${dist.a === Infinity ? "∞" : formatCurrency(dist.a)}</td>
                  <td class="p-2 text-center border border-gray-200 font-semibold">${(
                    dist.taux * 100
                  ).toFixed(0)}%</td>
                  <td class="p-2 text-right border border-gray-200">${formatCurrency(
                    dist.montant
                  )}</td>
                  <td class="p-2 text-right border border-gray-200 font-semibold">${formatCurrency(
                    dist.impotParPart
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr class="bg-gray-50">
                <td class="p-2 border border-gray-200 font-semibold" colspan="4">Impôt par part</td>
                <td class="p-2 border border-gray-200 text-right font-bold">${formatCurrency(
                  impotParPart
                )}</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="p-2 border border-gray-200 font-semibold" colspan="4">Impôt estimé (toutes parts)</td>
                <td class="p-2 border border-gray-200 text-right font-bold text-blue-700">${formatCurrency(
                  d.irBrut
                )}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Explication du Barème Progressif -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-amber-900 mb-3">📚 Comment fonctionne le barème progressif ?</h3>
        <p class="text-sm text-amber-800 mb-4">
          Votre revenu n'est PAS taxé à un seul taux. Il est divisé en tranches, chaque tranche ayant son propre taux :
        </p>
        
        <!-- Tableau des tranches -->
        <div class="overflow-x-auto mb-4">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-amber-100">
                <th class="p-2 text-left border border-amber-200">Tranche</th>
                <th class="p-2 text-center border border-amber-200">De - À</th>
                <th class="p-2 text-center border border-amber-200">Taux</th>
                <th class="p-2 text-right border border-amber-200">Votre situation</th>
              </tr>
            </thead>
            <tbody>
              ${bareme
                .map((b, i) => {
                  const prev = i > 0 ? bareme[i - 1].plafond : 0;
                  const plafond =
                    b.plafond === Infinity ? "∞" : formatCurrency(b.plafond);
                  const start = formatCurrency(prev);
                  const isCurrent = d.qf > prev && d.qf <= b.plafond;
                  const className = isCurrent
                    ? "bg-blue-100 border-blue-300"
                    : "border-amber-200";
                  return `
                  <tr class="border ${className}">
                    <td class="p-2 border">${i + 1}</td>
                    <td class="p-2 text-center border">${start} à ${plafond}</td>
                    <td class="p-2 text-center border font-semibold">${(
                      b.taux * 100
                    ).toFixed(0)}%</td>
                    <td class="p-2 text-right border">${
                      isCurrent ? "✓ Votre tranche" : ""
                    }</td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <!-- Explication visuelle de la distribution -->
        <div class="bg-white rounded p-4 border border-amber-100">
          <p class="text-xs font-semibold text-gray-600 mb-3">📊 Distribution de votre revenu par tranche :</p>
          <div class="space-y-2">
            ${distribution
              .map((dist: any, i: number) => {
                const colors = [
                  "bg-green-500",
                  "bg-yellow-500",
                  "bg-orange-500",
                  "bg-red-500",
                  "bg-purple-500",
                ];
                const color = colors[i % colors.length];
                const total = d.qf > 0 ? d.qf : 0;
                const pct =
                  distribution.length === 1
                    ? "100.0"
                    : total > 0
                    ? ((dist.montant / total) * 100).toFixed(1)
                    : "0.0";
                return `
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="font-semibold">Tranche ${i + 1}: ${
                  dist.montant > 0 ? formatCurrency(dist.montant) : "—"
                }</span>
                    <span class="text-gray-600">${pct}% (taxé à ${(
                  dist.taux * 100
                ).toFixed(0)}%)</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="${color} h-3 rounded-full" style="width: ${pct}%"></div>
                  </div>
                </div>`;
              })
              .join("")}
          </div>
          <p class="text-xs text-gray-600 mt-3 bg-amber-100 p-2 rounded">
            💡 <strong>Au-dessus de ${formatCurrency(
              bareme[1].plafond
            )} par part, la partie correspondante est taxée à 30 % :</strong> environ ${formatCurrency(
              Math.max(0, Math.min(d.qf, bareme[2].plafond) - bareme[1].plafond)
            )} dans votre cas.
          </p>
        </div>
      </div>

      <!-- Explication des Parts Fiscales -->
      <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-indigo-900 mb-3">👥 Les parts fiscales expliquées</h3>
        <p class="text-sm text-indigo-800 mb-4">
          Le quotient familial divise votre revenu par le nombre de parts. Plus vous avez de parts, plus votre revenu est divisé, ce qui réduit l'impôt :
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-white rounded p-3 border border-indigo-200">
            <p class="text-xs font-semibold text-indigo-700 mb-2">📌 Votre situation</p>
            <p class="text-sm"><strong>Revenu annuel :</strong> ${formatCurrency(
              d.revenu
            )}</p>
            <p class="text-sm"><strong>Nombre de parts :</strong> ${d.parts}</p>
            <p class="text-sm"><strong>Quotient familial :</strong> ${formatCurrency(
              d.qf
            )}</p>
          </div>
          <div class="bg-white rounded p-3 border border-indigo-200">
            <p class="text-xs font-semibold text-indigo-700 mb-2">💡 Impact des parts</p>
            <p class="text-sm text-indigo-600"><strong>Avec ${
              d.parts
            } part(s) :</strong> ${formatCurrency(d.irBrut)}</p>
            <p class="text-sm text-indigo-600"><strong>Avec 0.5 part seulement :</strong> ~${formatCurrency(
              (d.irBrut * d.parts) / 0.5
            )}</p>
            <p class="text-xs text-gray-600 mt-2">Les enfants ajoutent 0.5 part chacun</p>
            <p class="text-xs text-gray-600 mt-2">
              ℹ️ Le quotient familial est plafonné : au-delà d’un certain avantage par demi-part, le gain fiscal est limité.
            </p>
          </div>
        </div>
      </div>

      <!-- Explication de la Décote -->
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-purple-900 mb-3">🎁 La décote (pourquoi certains ne paient pas d'impôt)</h3>
        <p class="text-sm text-purple-800 mb-4">
          La décote peut réduire votre impôt si celui-ci est faible. Dans certains cas, elle peut même ramener l'impôt final à 0 €.
        </p>
        <div class="bg-white rounded p-4 border border-purple-200">
          <p class="text-xs text-gray-600 mt-3 bg-purple-100 p-2 rounded">
            ℹ️ Ce simulateur n'applique pas la décote : il affiche une estimation “barème brut”. Pour un résultat exact, utilisez le simulateur officiel DGFIP.
          </p>
        </div>
      </div>

      <!-- Avertissement -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-xs text-yellow-800">
          ⚠️ <strong>Estimation indicative :</strong> Cette simulation applique le barème progressif mais ne tient pas compte de la décote, des réductions d'impôt, des crédits d'impôt, ou des prélèvements à la source. Pour une évaluation précise, consultez un fiscaliste ou impots.gouv.fr.
        </p>
      </div>

      ${comparisonTableHTML}
    </div>
    `;

    // Retourner le HTML et initialiser les éléments interactifs
    setTimeout(() => {
      initComparisonUI(casesWithIR, d);
    }, 100);

    return mainHTML;
  },
};

// Fonction pour initialiser les éléments interactifs de comparaison
function initComparisonUI(casesWithIR: any[], currentData: any) {
  // Créer le graphique de comparaison
  const canvas = document.querySelector(
    `#chart-comparison`
  ) as HTMLCanvasElement;

  if (canvas && typeof window !== "undefined" && (window as any).Chart) {
    const Chart = (window as any).Chart;
    const ctx = canvas.getContext("2d");

    const labels = casesWithIR.map((c) => c.name.replace(/\s+\(.+?\)/g, ""));
    const data = casesWithIR.map((c) => c.ir);

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Impôt à payer (€)",
            data,
            backgroundColor: casesWithIR.map((c) =>
              c.parts === currentData.parts ? "#3b82f6" : "#10b981"
            ),
            borderColor: "#1e40af",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: { size: 12 },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatCurrency(value as number),
            },
          },
        },
      },
    });
  }

  // Bouton pour ajouter un scénario personnalisé
  const btnAdd = document.querySelector(
    "#btn-add-scenario"
  ) as HTMLButtonElement;
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      showScenarioModal(currentData.revenu);
    });
  }

  // Boutons pour supprimer les scénarios personnalisés
  document.querySelectorAll(".btn-remove-scenario").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = (e.target as HTMLElement).getAttribute("data-id");
      if (id) {
        comparisonStorage.removeScenario(id);
        location.reload();
      }
    });
  });
}

// Fonction pour afficher le modal d'ajout de scénario
function showScenarioModal(currentRevenu: number) {
  const modal = document.createElement("div");
  modal.id = "modal-add-scenario";
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
      <h3 class="text-xl font-bold text-gray-900 mb-4">➕ Ajouter un scénario</h3>
      
      <form id="form-scenario" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Nom du scénario</label>
          <input
            type="text"
            id="scenario-name"
            placeholder="ex: Mon cas personnalisé"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Revenu imposable (€)</label>
          <input
            type="number"
            id="scenario-revenu"
            value="${currentRevenu}"
            min="0"
            step="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre de parts</label>
          <input
            type="number"
            id="scenario-parts"
            placeholder="1"
            min="0.5"
            step="0.5"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div class="flex gap-2 pt-4">
          <button
            type="button"
            onclick="document.querySelector('#modal-add-scenario').remove()"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const form = document.querySelector("#form-scenario") as HTMLFormElement;
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.querySelector("#scenario-name") as HTMLInputElement)
      .value;
    const revenu = Number(
      (document.querySelector("#scenario-revenu") as HTMLInputElement).value
    );
    const parts = Number(
      (document.querySelector("#scenario-parts") as HTMLInputElement).value
    );

    const scenario: ComparisonScenario = {
      id: `custom-${Date.now()}`,
      name,
      revenu,
      parts,
      custom: true,
    };

    comparisonStorage.addScenario(scenario);
    location.reload();
  });

  // Fermer le modal en cliquant sur le fond
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

new CalculatorFrame("impot-calculator", impotConfig);
