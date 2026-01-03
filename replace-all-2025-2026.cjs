const fs = require("fs");
const path = require("path");
const glob = require("glob");

const blogPath = "src/pages/blog";
const files = glob.sync(path.join(blogPath, "**/*.html"));

let totalCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // D'abord, protéger les barèmes officiels avec un placeholder
  content = content.replace(
    /Barème officiel 2024-2025/g,
    "<<<BAREME_OFFICIEL_2024_2025>>>"
  );
  content = content.replace(
    /Barèmes officiels 2024-2025/g,
    "<<<BAREMES_OFFICIELS_2024_2025>>>"
  );

  // Remplacer toutes les autres occurrences de 2025 par 2026
  content = content.replace(/(\s|>|:|–|—|-)2025([^-]|$)/g, "$12026$2");
  content = content.replace(/2025([^-0-9])/g, "2026$1");
  content = content.replace(/2025–/g, "2026–");
  content = content.replace(/2025-/g, "2026-");
  content = content.replace(/En 2025/g, "En 2026");
  content = content.replace(/en 2025/g, "en 2026");

  // Remplacer 2024-2025 par 2025-2026
  content = content.replace(/2024-2025/g, "2025-2026");
  content = content.replace(/2024–2025/g, "2025–2026");

  // Restaurer les barèmes officiels
  content = content.replace(
    /<<<BAREME_OFFICIEL_2024_2025>>>/g,
    "Barème officiel 2024-2025"
  );
  content = content.replace(
    /<<<BAREMES_OFFICIELS_2024_2025>>>/g,
    "Barèmes officiels 2024-2025"
  );

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    totalCount++;
    console.log(`✅ ${path.basename(file)}`);
  }
});

console.log(
  `\n✅ Total: ${totalCount} fichiers mis à jour pour remplacer 2025 par 2026 partout (sauf barèmes officiels)`
);
