import { blocBarre, insererBarre, pagePourBarre, paramsScenarioApl } from "../src/utils/questions/injectionBarre";
import { analyserQuestion } from "../src/utils/questions/analyseurQuestion";

const fichier = (rel: string) => `C:/dev/lesCalculateurs/src/pages/${rel}`;

describe("barre de question injectée au build", () => {
  test("simulateur de la page : la page et ses sous-pages, sans déborder sur les pages voisines", () => {
    expect(pagePourBarre(fichier("apl.html"))).toMatchObject({ simulateur: "apl", slug: null });
    expect(pagePourBarre(fichier("apl/apl-smic-seul/index.html"))).toMatchObject({ simulateur: "apl", slug: "apl-smic-seul", scenarios: "apl" });
    expect(pagePourBarre(fichier("apl-etudiant.html"))).toMatchObject({ simulateur: "apl-etudiant" });
    expect(pagePourBarre(fichier("apl-zones.html"))).toMatchObject({ simulateur: "apl" });
    expect(pagePourBarre(fichier("fin-de-droits-chomage.html"))).toMatchObject({ simulateur: "fin-droits" });
    expect(pagePourBarre(fichier("plusvalue.html"))).toBeNull();
    expect(pagePourBarre("C:/dev/lesCalculateurs/src/r/apl.html")).toBeNull();
  });

  test("après la section du titre quand le titre est dans <main>", () => {
    const html = `<body><main><section><div><h1>Titre</h1></div><section>imbriquée</section></section><section>suite</section></main></body>`;
    const r = insererBarre(html, "<BARRE/>");
    expect(r.indexOf("<BARRE/>")).toBeGreaterThan(r.indexOf("imbriquée</section></section>"));
    expect(r.indexOf("<BARRE/>")).toBeLessThan(r.indexOf("<section>suite"));
    expect(r).toContain('<script type="module" src="/pages/scripts/barre-question.ts"></script>');
  });

  test("au début de <main> quand le titre est au-dessus", () => {
    const html = `<body><section><h1>Titre</h1></section><main class="x"><h2>Calcul</h2></main></body>`;
    expect(insererBarre(html, "<BARRE/>")).toMatch(/<main class="x">\s*<BARRE\/>\s*<h2>/);
  });

  test("une seule barre, et rien sans <main>", () => {
    const deja = `<main><div data-barre-question></div></main>`;
    expect(insererBarre(deja, "<BARRE/>")).toBe(deja);
    expect(insererBarre("<body><h1>x</h1></body>", "<BARRE/>")).toBe("<body><h1>x</h1></body>");
  });

  test("pré-remplissage avec le scénario APL de la page (format de data/pseo)", () => {
    const input = { situation: "seul", enfants: 0, revenus_mensuels: 1300, loyer_mensuel: 700, region: "zone2", type_logement: "location", economie: 0 };
    const params = paramsScenarioApl(input);
    expect(params).toMatchObject({ loyer: 700, revenus: 1300, situation: "seul", zone: "zone2", logement: "location" });
    expect(paramsScenarioApl({ ...input, region: "idf" }).zone).toBe("zone1");
    const bloc = blocBarre("apl", params);
    expect(bloc).toContain('data-bq-simulateur="apl"');
    expect(bloc).toContain("loyer de 700");
    expect(bloc).toMatch(/data-bq-params="\{&quot;loyer&quot;:700/);
  });

  test("question sans simulateur cité, posée sur la page d'un simulateur", () => {
    const r = analyserQuestion("loyer 650, 1300 € de revenus", { simulateurParDefaut: "apl" });
    expect(r.simulateur).toBe("apl");
    expect(r.extraits).toMatchObject({ loyer: 650, revenus: 1300 });
  });
});
