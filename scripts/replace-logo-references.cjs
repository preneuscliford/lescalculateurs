const fs = require("node:fs/promises");
const path = require("node:path");

/**
 * Recursively lists all files under a directory.
 * @param {string} directoryPath
 * @returns {Promise<string[]>}
 */
async function listFilesRecursive(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Applies ordered regex replacements to content.
 * @param {string} content
 * @param {{name: string, regex: RegExp, replacement: string}[]} rules
 * @returns {{updated: string, appliedCounts: Record<string, number>}}
 */
function applyReplacements(content, rules) {
  let updated = content;
  /** @type {Record<string, number>} */
  const appliedCounts = {};

  for (const rule of rules) {
    let count = 0;
    updated = updated.replace(rule.regex, () => {
      count += 1;
      return rule.replacement;
    });
    if (count > 0) appliedCounts[rule.name] = count;
  }

  return { updated, appliedCounts };
}

/**
 * Rewrites logo references in HTML files to a stable public URL (/assets/logo.svg).
 * @param {{rootDir: string, dryRun: boolean}} options
 * @returns {Promise<{changedFiles: {filePath: string, appliedCounts: Record<string, number>}[]}>}
 */
async function rewriteLogoReferences(options) {
  const rules = [
    {
      name: "img-src-relative-assets-logo-svg",
      regex: /src=(["'])(?:\.\.\/)+assets\/logo\.svg\1/g,
      replacement: 'src="/assets/logo.svg"',
    },
    {
      name: "img-src-dot-assets-logo-svg",
      regex: /src=(["'])\.\/assets\/logo\.svg\1/g,
      replacement: 'src="/assets/logo.svg"',
    },
    {
      name: "img-src-root-logo-svg",
      regex: /src=(["'])\/logo\.svg\1/g,
      replacement: 'src="/assets/logo.svg"',
    },
    {
      name: "img-src-root-assets-logo-svg",
      regex: /src=(["'])\/assets\/logo\.svg\1/g,
      replacement: 'src="/assets/logo.svg"',
    },
    {
      name: "img-src-new-logo-png-relative",
      regex:
        /src=(["'])(?:\.\.\/)+assets\/lescalculateurs-new-logo\.png\1/g,
      replacement: 'src="/assets/logo.svg"',
    },
    {
      name: "img-src-new-logo-png-dot",
      regex: /src=(["'])\.\/assets\/lescalculateurs-new-logo\.png\1/g,
      replacement: 'src="/assets/logo.svg"',
    },
    {
      name: "img-src-new-logo-png-root",
      regex: /src=(["'])\/assets\/lescalculateurs-new-logo\.png\1/g,
      replacement: 'src="/assets/logo.svg"',
    },
    {
      name: "jsonld-logo-lescalculateurs-fr",
      regex:
        /"logo"\s*:\s*"https?:\/\/(www\.)?lescalculateurs\.fr\/assets\/logo\.svg"/g,
      replacement: '"logo": "https://lescalculateurs.fr/assets/logo.svg"',
    },
    {
      name: "jsonld-logo-lescalculateurs-fr-new-png",
      regex:
        /"logo"\s*:\s*"https?:\/\/(www\.)?lescalculateurs\.fr\/assets\/lescalculateurs-new-logo\.png"/g,
      replacement: '"logo": "https://lescalculateurs.fr/assets/logo.svg"',
    },
    {
      name: "jsonld-logo-www-lescalculateurs-fr",
      regex:
        /"logo"\s*:\s*"https?:\/\/(www\.)?lescalculateurs\.fr\/assets\/logo\.svg"/g,
      replacement: '"logo": "https://lescalculateurs.fr/assets/logo.svg"',
    },
  ];

  const allFiles = await listFilesRecursive(options.rootDir);
  const htmlFiles = allFiles.filter((filePath) => filePath.endsWith(".html"));

  /** @type {{filePath: string, appliedCounts: Record<string, number>}[]} */
  const changedFiles = [];

  for (const filePath of htmlFiles) {
    const original = await fs.readFile(filePath, "utf8");
    const { updated, appliedCounts } = applyReplacements(original, rules);
    const didChange = updated !== original;
    if (!didChange) continue;

    changedFiles.push({ filePath, appliedCounts });
    if (!options.dryRun) {
      await fs.writeFile(filePath, updated, "utf8");
    }
  }

  return { changedFiles };
}

/**
 * CLI entrypoint.
 * @returns {Promise<void>}
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const srcDir = path.resolve(process.cwd(), "src");
  const { changedFiles } = await rewriteLogoReferences({
    rootDir: srcDir,
    dryRun,
  });

  const totalChanges = changedFiles.reduce((sum, file) => {
    const fileSum = Object.values(file.appliedCounts).reduce(
      (fileAcc, n) => fileAcc + n,
      0,
    );
    return sum + fileSum;
  }, 0);

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Logo: ${changedFiles.length} fichiers modifiés, ${totalChanges} remplacements.`,
  );

  for (const file of changedFiles) {
    const relative = path.relative(process.cwd(), file.filePath);
    const details = Object.entries(file.appliedCounts)
      .map(([name, count]) => `${name}:${count}`)
      .join(", ");
    console.log(`- ${relative}${details ? ` (${details})` : ""}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

