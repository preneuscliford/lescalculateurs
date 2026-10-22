import fs from "fs";
import os from "os";
import path from "path";
import { classer } from "../scripts/keyword-scan/lib/classement.cjs";
import { scorer, proposer, signal } from "../scripts/keyword-scan/lib/score.cjs";
import { qualifierResultat, niveauConcurrence } from "../scripts/keyword-scan/lib/serp.cjs";
import { lireCsv, chargerEntrees } from "../scripts/keyword-scan/lib/entrees.cjs";
import { creerCache } from "../scripts/keyword-scan/lib/cache.cjs";
import { creerAutocompletion } from "../scripts/keyword-scan/lib/autocompletion.cjs";
import { chargerEnv } from "../scripts/keyword-scan/lib/env.cjs";

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../scripts/keyword-scan/config.json"), "utf8"));
const theme = JSON.parse(fs.readFileSync(path.join(__dirname, "../scripts/keyword-scan/seeds.json"), "utf8")).themes.find(
  (t: { id: string }) => t.id === "chomage",
);

describe("keyword-scan : classement", () => {
  test.each([
    ["date fin de droits chômage", "date"],
    ["délai de carence chômage rupture conventionnelle", "delai"],
    ["durée indemnisation chômage 55 ans", "duree"],
    ["dégressivité chômage calcul", "montant"],
    ["droit au chômage après démission", "eligibilite"],
  ])("« %s » est un calcul personnel (%s)", (formulation, type) => {
    const c = classer(formulation);
    expect(c.categorie).toBe("calcul");
    expect(c.typeCalcul).toBe(type);
  });

  test.each([
    "france travail numéro de téléphone",
    "france travail se connecter",
    "attestation france travail pdf",
    "chômage définition",
    "france travail agence paris",
    "dégressivité chômage belgique",
  ])("« %s » est de l'information générale", (formulation) => {
    expect(classer(formulation).categorie).toBe("information");
  });

  test("détecte les paramètres personnels (âge, contrat, lieu)", () => {
    expect(classer("fin de droits chômage à 62 ans").parametres).toContain("age");
    expect(classer("carence chômage rupture conventionnelle").parametres).toContain("contrat");
    expect(classer("délai caf paris").parametres).toContain("lieu");
  });
});

describe("keyword-scan : score et proposition", () => {
  const candidat = (formulation: string, sources: object, concurrence?: object) => {
    const c: any = { formulation, sources, classement: classer(formulation), concurrence };
    return Object.assign(c, scorer(c));
  };

  test("le signal croît avec le rang, les occurrences et les volumes", () => {
    expect(signal({ autocompletion: { directe: true, meilleurRang: 0, occurrences: 1 } })).toBeGreaterThan(
      signal({ autocompletion: { directe: false, meilleurRang: 5, occurrences: 1 } }),
    );
    expect(signal({ gsc: { impressions: 1000, clics: 10 } })).toBeCloseTo(6, 0);
    expect(signal({ semrush: { volume: 99 } })).toBeCloseTo(4, 0);
  });

  test("information générale : score 0 et proposition « rien »", () => {
    const c = candidat("france travail numéro de téléphone", { autocompletion: { directe: true, meilleurRang: 0, occurrences: 5 } });
    expect(c.score).toBe(0);
    expect(proposer(c, theme).proposition).toBe("rien");
  });

  test("la concurrence forte réduit le score, la faible l'augmente", () => {
    const sources = { gsc: { impressions: 500, clics: 5 } };
    const forte = candidat("date fin de droits chômage", sources, { niveau: "forte" });
    const faible = candidat("date fin de droits chômage", sources, { niveau: "faible" });
    expect(faible.score).toBeGreaterThan(forte.score);
  });

  test("page dédiée seulement avec un signal fort ET un paramètre de règle", () => {
    const fort = candidat("fin de droits chômage à 62 ans", { semrush: { volume: 2000 }, autocompletion: { directe: true, meilleurRang: 0, occurrences: 2 } });
    expect(proposer(fort, theme, { seuilPageDediee: config.seuilPageDediee }).proposition).toBe("page dédiée à étudier");
    const faible = candidat("fin de droits chômage à 62 ans", { autocompletion: { directe: false, meilleurRang: 6, occurrences: 1 } });
    expect(proposer(faible, theme, { seuilPageDediee: config.seuilPageDediee }).proposition).toBe("page principale");
    const sansParametre = candidat("date fin de droits chômage", { semrush: { volume: 5000 } });
    expect(proposer(sansParametre, theme).proposition).toBe("page principale");
  });

  test("rattache la formulation au bon calculateur", () => {
    expect(proposer(candidat("délai de carence chômage", {}), theme).calculateur).toMatch(/carence/i);
    expect(proposer(candidat("dégressivité chômage calcul", {}), theme).calculateur).toMatch(/gressivit/i);
  });
});

describe("keyword-scan : concurrence", () => {
  test("qualifie les domaines forts, faibles et notre site", () => {
    expect(qualifierResultat({ url: "https://www.mes-allocs.fr/guide" }, config).force).toBe("forte");
    expect(qualifierResultat({ url: "https://plus.transformation.gouv.fr/x" }, config).force).toBe("faible");
    expect(qualifierResultat({ url: "https://exemple.fr/doc.pdf" }, config).force).toBe("faible");
    expect(qualifierResultat({ url: "https://www.lescalculateurs.fr/pages/are" }, config).force).toBe("site");
    expect(qualifierResultat({ url: "https://xcaf.fr/" }, config).force).toBe("neutre");
  });

  test("niveau : forte à partir de 3 concurrents, faible sans concurrent", () => {
    const r = (force: string) => ({ host: "x", force });
    expect(niveauConcurrence([r("forte"), r("forte"), r("forte"), r("neutre")]).niveau).toBe("forte");
    expect(niveauConcurrence([r("forte"), r("faible")]).niveau).toBe("moyenne");
    expect(niveauConcurrence([r("faible"), r("neutre"), r("site")]).niveau).toBe("faible");
    expect(niveauConcurrence([r("neutre"), r("site")]).rangSite).toBe(2);
    expect(niveauConcurrence(null).niveau).toBe("non vérifiée");
  });
});

describe("keyword-scan : entrées et cache", () => {
  test("lit un export Search Console (point-virgule) et Semrush (virgule)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kws-"));
    fs.writeFileSync(path.join(dir, "gsc.csv"), "Requêtes les plus fréquentes;Clics;Impressions\n\"fin de droits chômage\";12;1 249\n");
    fs.writeFileSync(path.join(dir, "semrush.csv"), "Keyword,Intent,Volume\ndegressivite chomage,Informational,1900\n");
    const e = chargerEntrees(dir);
    expect(e.gsc.get("fin de droits chomage")).toMatchObject({ impressions: 1249, clics: 12 });
    expect(e.semrush.get("degressivite chomage")?.volume).toBe(1900);
    expect(lireCsv('a,b\n"x, y",2\n')[0]).toEqual({ a: "x, y", b: "2" });
  });

  test("dry-run : aucun appel réseau, lecture du cache", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kws-cache-"));
    const cache = creerCache(dir, 30);
    cache.ecrire("suggest:fr:délai caf", ["délai caf apl", "délai caf rsa"]);
    const appels = jest.spyOn(globalThis, "fetch" as never);
    const auto = creerAutocompletion({ cache, dryRun: true });
    expect(await auto.suggestions("délai caf")).toEqual(["délai caf apl", "délai caf rsa"]);
    expect(await auto.suggestions("absente du cache")).toEqual([]);
    expect(appels).not.toHaveBeenCalled();
    expect(auto.stats).toMatchObject({ cache: 1, manquants: 1, reseau: 0 });
  });

  test(".env : charge seulement les variables demandées, sans écraser l'existant", () => {
    const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kws-env-")), ".env");
    fs.writeFileSync(f, 'GOOGLE_CSE_KEY="cle-test"\nGOOGLE_CSE_CX=cx-test\nAUTRE_SECRET=x\n');
    delete process.env.GOOGLE_CSE_KEY;
    process.env.GOOGLE_CSE_CX = "deja-defini";
    expect(chargerEnv(f, ["GOOGLE_CSE_KEY", "GOOGLE_CSE_CX"])).toEqual(["GOOGLE_CSE_KEY"]);
    expect(process.env.GOOGLE_CSE_KEY).toBe("cle-test");
    expect(process.env.GOOGLE_CSE_CX).toBe("deja-defini");
    expect(process.env.AUTRE_SECRET).toBeUndefined();
    delete process.env.GOOGLE_CSE_KEY;
    delete process.env.GOOGLE_CSE_CX;
  });
});
