/**
 * Injection de la barre de question dans les pages, au build (plugin lc-barre-question de vite.config.ts).
 *
 * Une seule configuration, src/data/barre-question.json : chaque page listée (et ses sous-pages) reçoit
 * la barre, pré-remplie avec le simulateur de la page et, si elle en a un, avec son scénario
 * (data/pseo/*-scenarios.js). Aucune modification manuelle page par page.
 */
import config from "../../data/barre-question.json";
import { SIMULATEURS, resumeSituation, validerParametres, type ParametresQuestion, type SimulateurId } from "./simulateursQuestions";
import { QUESTIONS, blocLiensSituations } from "./pagesQuestions";
import { PAGES_NOTAIRE } from "./pagesNotaire";

export interface PageBarre {
  simulateur: SimulateurId;
  /** Chemin de la page relatif à src/pages (« apl/apl-smic-seul ») */
  chemin: string;
  /** Sous-page d'un chemin listé (« apl/apl-smic-seul ») : son identifiant de scénario */
  slug: string | null;
  scenarios?: string;
}

/** Chemin de la page relatif à src/pages, sans « .html » ni « /index.html » */
export function cheminPage(fichier: string): string | null {
  const rel = fichier.replace(/\\/g, "/").split("/src/pages/")[1];
  if (!rel) return null;
  return rel.replace(/\/index\.html$/, "").replace(/\.html$/, "");
}

/** Simulateur de la page, d'après src/data/barre-question.json */
export function pagePourBarre(fichier: string): PageBarre | null {
  const chemin = cheminPage(fichier);
  if (!chemin) return null;
  for (const entree of config.pages) {
    for (const base of entree.chemins) {
      if (chemin === base || chemin.startsWith(`${base}/`)) {
        return {
          simulateur: entree.simulateur as SimulateurId,
          chemin,
          slug: chemin === base ? null : chemin.slice(base.length + 1),
          scenarios: "scenarios" in entree ? (entree as { scenarios?: string }).scenarios : undefined,
        };
      }
    }
  }
  return null;
}

/** Paramètres du moteur APL d'un scénario pSEO → paramètres de la question */
export function paramsScenarioApl(input: Record<string, unknown>): ParametresQuestion {
  const zone = { idf: "zone1", province: "zone2" }[String(input.region)] ?? input.region;
  return validerParametres("apl", {
    situation: input.situation,
    enfants: input.enfants,
    revenus: input.revenus_mensuels,
    loyer: input.loyer_mensuel,
    zone,
    logement: input.type_logement,
  }).params;
}

/**
 * Paramètres d'une page de questions générée (src/data/questions-validees.json) : nombre d'enfants, et
 * situation quand elle est connue (sans enfant). Avec enfants, parent isolé ou couple reste à choisir.
 */
export function paramsPageQuestion(chemin: string): ParametresQuestion | null {
  // Page « frais de notaire » d'un département : le département est connu (pas pour la Corse, deux départements)
  const notaire = PAGES_NOTAIRE.find((p) => p.slug === chemin);
  if (notaire) return notaire.code === "corse" ? {} : { departement: notaire.codeMoteur };
  const ancienne = /^blog\/departements\/frais-notaire-(\d{2,3}|2A|2B)$/.exec(chemin);
  if (ancienne) return { departement: ancienne[1] };
  const q = QUESTIONS.find((e) => e.slug === chemin);
  if (!q) return null;
  return {
    enfants: q.enfants,
    ...(q.enfants === 0 ? { situation: q.situation === "couple" ? "couple" : "seul" } : {}),
  };
}

/** Sur la page principale d'un simulateur : liens vers ses pages de situations, après la barre */
export function insererLiensSituations(html: string, simulateur: SimulateurId): string {
  const bloc = blocLiensSituations(simulateur);
  if (!bloc || html.includes("data-lc-situations")) return html;
  const barre = html.indexOf('aria-label="Affiner le calcul"');
  if (barre < 0) return html;
  const fin = html.indexOf("</section>", barre) + "</section>".length;
  return `${html.slice(0, fin)}\n      ${bloc}${html.slice(fin)}`;
}

const echapperAttribut = (t: string) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Bloc HTML de la barre, avec le simulateur, les paramètres de la page et leur résumé */
export function blocBarre(simulateur: SimulateurId, params: ParametresQuestion = {}): string {
  const resume = Object.keys(params).length ? resumeSituation(simulateur, params) : "";
  const attributs = [
    `data-barre-question`,
    `data-bq-simulateur="${simulateur}"`,
    Object.keys(params).length ? `data-bq-params="${echapperAttribut(JSON.stringify(params))}"` : "",
    resume ? `data-bq-resume="${echapperAttribut(resume)}"` : "",
  ].filter(Boolean);
  return `<section class="mb-8" aria-label="Affiner le calcul"><div class="max-w-4xl mx-auto"><div ${attributs.join(" ")} class="min-h-[8rem]"></div></div></section>`;
}

export const SCRIPT_BARRE = `<script type="module" src="/pages/scripts/barre-question.ts"></script>`;

/**
 * Insère le bloc : après la section qui contient le titre <h1> si elle est dans <main>, sinon au début
 * de <main>. Renvoie le HTML inchangé si la page a déjà une barre ou n'a pas de <main>.
 */
export function insererBarre(html: string, bloc: string): string {
  if (html.includes("data-barre-question")) return html;
  const main = /<main\b[^>]*>/i.exec(html);
  if (!main) return html;
  const finMain = main.index + main[0].length;
  const h1 = html.indexOf("<h1", finMain);
  let position = finMain;
  if (h1 > 0) {
    const debutSection = html.lastIndexOf("<section", h1);
    if (debutSection >= finMain) {
      let profondeur = 0;
      const motif = /<(\/?)section\b[^>]*>/gi;
      motif.lastIndex = debutSection;
      for (let m = motif.exec(html); m; m = motif.exec(html)) {
        profondeur += m[1] ? -1 : 1;
        if (profondeur === 0) {
          position = m.index + m[0].length;
          break;
        }
      }
    }
  }
  const avecBloc = `${html.slice(0, position)}\n      ${bloc}\n${html.slice(position)}`;
  return avecBloc.replace(/<\/body>/i, `  ${SCRIPT_BARRE}\n  </body>`);
}

/** Simulateur connu (garde-fou pour la configuration) */
export const simulateurConnu = (id: string): id is SimulateurId => id in SIMULATEURS;
