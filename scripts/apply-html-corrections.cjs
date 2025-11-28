#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const CORR = path.join(root, "reports", "duplication-corrections.json");
const DEPT_DIR = path.join(root, "src", "pages", "blog", "departements");

function ts() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
function safeRead(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return null;
  }
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const corr = safeRead(CORR);
if (!corr || !Array.isArray(corr.items)) {
  console.error("No corrections found in", CORR);
  process.exit(2);
}

const files = require("fs")
  .readdirSync(DEPT_DIR)
  .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

for (const item of corr.items) {
  const code = String(item.code || "").toLowerCase();
  if (!code) continue;

  // find candidate files containing the code
  const matches = files.filter((f) =>
    f.toLowerCase().includes(code.toLowerCase())
  );
  if (!matches.length) {
    console.warn("No HTML file found for code", code);
    continue;
  }

  const intro = item.after && item.after.intro ? item.after.intro : null;
  const notaires =
    item.after && item.after.notaires ? item.after.notaires : null;

  for (const fname of matches) {
    const full = path.join(DEPT_DIR, fname);
    const bak = full + ".bak." + ts();
    const raw = fs.readFileSync(full, "utf8");
    fs.writeFileSync(bak, raw, "utf8");
    console.log("Backup", fname, "->", path.basename(bak));

    let out = raw;

    if (intro) {
      // replace first lead paragraph with class text-xl text-gray-600 leading-relaxed
      const pRe =
        /<p\s+class="text-xl text-gray-600 leading-relaxed">[\s\S]*?<\/p>/i;
      const newP = `<p class="text-xl text-gray-600 leading-relaxed">\n          <strong>${escapeHtml(
        intro
      )}</strong>\n        </p>`;
      if (pRe.test(out)) {
        out = out.replace(pRe, newP);
        console.log("Updated intro in", fname);
      } else {
        console.warn("Intro placeholder not found in", fname);
      }
    }

    if (notaires) {
      // find the h2 heading for 'Où trouver un notaire' and replace the first <p class="text-gray-700"> after it
      const h2Re = /<h2[^>]*>\s*🏛️\s*Où trouver un notaire[\s\S]*?<\/h2>/i;
      const secIndex = out.search(h2Re);
      if (secIndex !== -1) {
        // from that index, find the next <p class="text-gray-700"> occurrence
        const tail = out.slice(secIndex);
        const pRe2 = /<p\s+class="text-gray-700">([\s\S]*?)<\/p>/i;
        const m = pRe2.exec(tail);
        const replacement = `<p class="text-gray-700">${escapeHtml(
          notaires
        )} Pour contacter un professionnel, consultez l’annuaire officiel des notaires de la région.</p>`;
        if (m) {
          const before = out.slice(0, secIndex);
          const after = tail.replace(pRe2, replacement);
          out = before + after;
          console.log("Updated notaires paragraph in", fname);
        } else {
          // if no p found, insert a new section after the H2
          const insertPos = secIndex + tail.indexOf("</h2>") + "</h2>".length;
          out =
            out.slice(0, insertPos) +
            '\n\n      <section class="bg-gray-50 p-4 rounded-lg mt-6">\n        <p class="text-gray-700">' +
            escapeHtml(notaires) +
            ' Pour contacter un professionnel, consultez l’annuaire officiel des notaires de la région.</p>\n        <a href="https://www.notaires.fr" class="text-blue-600 hover:underline">Annuaire officiel</a>\n      </section>\n' +
            out.slice(insertPos);
          console.log("Inserted notaires section in", fname);
        }
      } else {
        console.warn('No "Où trouver un notaire" heading found in', fname);
      }
    }

    // write back
    fs.writeFileSync(full, out, "utf8");
  }
}

console.log(
  "HTML corrections applied. Review backups in the same directory (.bak.*)"
);
