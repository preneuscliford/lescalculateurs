import { createRequire } from "module";

const require = createRequire(import.meta.url);
const cheerio = require("cheerio");
const {
  applyCorrectionsSafe,
  applyCorrectionsToHtml,
  getTextNodes,
  isSafe,
  shouldIgnore,
} = require("../scripts/lib/html-safe-french-corrections.cjs");

describe("html-safe-french-corrections", () => {
  test("getTextNodes ne remonte que le texte visible", () => {
    const $ = cheerio.load(`
      <!doctype html>
      <html>
        <head>
          <title>SEO</title>
          <script>const x = "Jusqu'a";</script>
        </head>
        <body>
          <div>Bonjour <strong>le monde</strong></div>
          <style>.x { color: red; }</style>
        </body>
      </html>
    `);

    const texts = getTextNodes($, { minLength: 1 }).map((entry: { text: string }) => entry.text.trim()).filter(Boolean);

    expect(texts).toEqual(["Bonjour", "le monde"]);
  });

  test("applyCorrectionsSafe remplace seulement le mot complet", () => {
    const result = applyCorrectionsSafe("calculateurs a Paris", [
      {
        error: "a",
        suggestions: ["à"],
        context: "calculateurs a Paris",
      },
    ]);

    expect(result.updated).toBe("calculateurs à Paris");
    expect(result.applied).toHaveLength(1);
  });

  test("applyCorrectionsToHtml ne touche pas les attributs ni le JavaScript", () => {
    const html = `
      <!doctype html>
      <html>
        <body>
          <a title="Jusqu'a" href="/jusqua">Jusqu'a 3 scenarios</a>
          <script>const label = "Jusqu'a";</script>
        </body>
      </html>
    `;

    const result = applyCorrectionsToHtml(html, [
      {
        error: "Jusqu'a",
        suggestions: ["Jusqu'à"],
        text: "Jusqu'a 3 scenarios",
        context: "Jusqu'a 3 scenarios",
      },
    ]);

    expect(result.html).toContain(">Jusqu'à 3 scenarios<");
    expect(result.html).toContain('title="Jusqu\'a"');
    expect(result.html).toContain('const label = "Jusqu\'a";');
  });

  test("isSafe rejette les remplacements sensibles ou suspects", () => {
    expect(
      isSafe({
        original: "Montant 200 € a payer",
        candidate: "200",
        replacement: "deux cents",
        updated: "Montant deux cents € a payer",
      }),
    ).toBe(false);
  });

  test("shouldIgnore rejette les noeuds code ou dates sensibles", () => {
    expect(shouldIgnore("const total = montant + 10;")).toBe(true);
    expect(shouldIgnore("Derniere mise a jour: 04/03/2026")).toBe(true);
    expect(shouldIgnore("Jusqu'a 3 scenarios cote a cote")).toBe(false);
  });
});
