#!/usr/bin/env node
/**
 * Corrige les pages avec structure HTML incomplète :
 * - Type 1 : </html> manquant → ajoute </body></html> après </footer>
 * - Type 2 : </body> manquant → insère </body> avant </html>
 */
const fs = require("fs");
const path = require("path");

const SRC_PAGES = path.resolve(__dirname, "..", "src", "pages");

// Fichiers à exclure (template, snippet, etc.)
const EXCLUDE = ["notaire-enhancements.html"];

function collectHtmlFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "scripts" && !e.name.startsWith(".")) {
      results.push(...collectHtmlFiles(full));
    } else if (e.isFile() && e.name.endsWith(".html") && !EXCLUDE.includes(e.name)) {
      results.push(full);
    }
  }
  return results;
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(SRC_PAGES, filePath);
  let fixed = content;
  let reason = "";

  const hasBody = /<body[^>]*>/i.test(content);
  const hasCloseBody = /<\/body>/i.test(content);
  const hasCloseHtml = /<\/html>/i.test(content);

  if (!hasBody) {
    // Pas de body du tout → snippet, on skip
    return { file: relPath, skipped: "Pas de <body>" };
  }

  if (!hasCloseBody && !hasCloseHtml) {
    // Type 1: ni </body> ni </html> → ajouter </body></html>
    const lastFooter = content.lastIndexOf("</footer>");
    if (lastFooter > 0) {
      const indent = content.slice(lastFooter).match(/^\s*/)[0];
      fixed = content.slice(0, lastFooter + "</footer>".length) + "\n";
      // Chercher le dernier </div> après footer (nettoyer)
      const afterFooter = content.slice(lastFooter + "</footer>".length);
      const lastDiv = afterFooter.lastIndexOf("</div>");
      if (lastDiv > 0) {
        fixed += afterFooter.slice(0, lastDiv + "</div>".length) + "\n";
      }
      fixed += indent + "  </body>\n" + indent + "</html>\n";
      reason = "Type 1: +</body></html>";
    } else {
      // Pas de footer, on ajoute simplement à la fin
      fixed = content.trimEnd() + "\n  </body>\n</html>\n";
      reason = "Type 1: +</body></html> (no footer)";
    }
  } else if (!hasCloseBody && hasCloseHtml) {
    // Type 2: </body> manquant mais </html> présent → insérer </body> avant </html>
    const closeHtmlIdx = fixed.lastIndexOf("</html>");
    const before = fixed.slice(0, closeHtmlIdx);
    const indent = before.match(/^(\s*)/m)?.[1] || "  ";
    fixed = before.trimEnd() + "\n" + indent + "  </body>\n" + fixed.slice(closeHtmlIdx);
    reason = "Type 2: +</body> avant </html>";
  } else {
    return { file: relPath, skipped: "Déjà OK" };
  }

  // Vérification post-fix
  const hasCloseBodyAfter = /<\/body>/i.test(fixed);
  const hasCloseHtmlAfter = /<\/html>/i.test(fixed);
  if (!hasCloseBodyAfter || !hasCloseHtmlAfter) {
    return { file: relPath, error: "Correction échouée: structure toujours incomplète" };
  }

  fs.writeFileSync(filePath, fixed, "utf-8");
  return { file: relPath, fixed: reason };
}

// MAIN
const files = collectHtmlFiles(SRC_PAGES);
console.log(`🔧 Correction structurelle de ${files.length} fichiers...\n`);

let fixed = 0;
let skipped = 0;
let errors = 0;

for (const f of files) {
  const result = fixFile(f);
  if (result.fixed) {
    console.log(`  ✅ ${result.file.padEnd(65)} ${result.fixed}`);
    fixed++;
  } else if (result.skipped) {
    skipped++;
  } else if (result.error) {
    console.log(`  ❌ ${result.file.padEnd(65)} ${result.error}`);
    errors++;
  }
}

console.log(`\n📊 Corrigés: ${fixed} | Déjà OK: ${skipped} | Erreurs: ${errors}`);
