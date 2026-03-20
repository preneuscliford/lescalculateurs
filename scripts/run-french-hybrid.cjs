#!/usr/bin/env node

const { spawnSync } = require("child_process");
const { loadEnvFile } = require("./lib/load-env.cjs");

loadEnvFile();

function parseArgs() {
  const args = process.argv.slice(2);
  const findArg = (name, fallback) => {
    const match = args.find((arg) => arg.startsWith(`--${name}=`));
    return match ? match.split("=").slice(1).join("=") : fallback;
  };

  return {
    scope: findArg("scope", "french-pilot-20"),
    htmlMode: findArg("mode", "both"),
    limit: Number.parseInt(findArg("limit", "20"), 10) || 20,
    maxIssues: Number.parseInt(findArg("max-issues", "12"), 10) || 12,
    suffix: findArg("suffix", "v1"),
    skipOpenAi: args.includes("--skip-openai"),
    skipLanguageTool: args.includes("--skip-languagetool"),
    reportOnly: args.includes("--report-only"),
    failOnLanguageTool: args.includes("--fail-on-languagetool"),
  };
}

function normalizeScopeAlias(scope) {
  const aliases = {
    "french-pilot-20": "pilot20",
    "pseo-rendered": "pseo",
    "simulateurs-rendered": "simulateurs",
    "pillars-rendered": "pillars",
    "site-rendered": "site",
  };

  return aliases[scope] || scope.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

function getModes(htmlMode) {
  if (htmlMode === "both") {
    return ["visible", "seo"];
  }

  if (htmlMode === "visible" || htmlMode === "seo") {
    return [htmlMode];
  }

  throw new Error(`Mode invalide: ${htmlMode}. Utilise visible, seo ou both.`);
}

function runStep(label, command, args, options = {}) {
  const { allowFailure = false } = options;
  console.log(`\n[HYBRID] ${label}`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  const status = Number.isInteger(result.status) ? result.status : 1;
  if (status !== 0 && !allowFailure) {
    process.exit(status);
  }

  return status;
}

function buildOpenAiOutput(scope, mode, suffix) {
  return `openai-french-review-${normalizeScopeAlias(scope)}-${mode}-${suffix}`;
}

function main() {
  const options = parseArgs();
  const modes = getModes(options.htmlMode);
  const openAiOutputs = [];

  runStep("UTF-8 gate", "node", ["scripts/verify-utf8.cjs", `--scope=${options.scope}`]);

  for (const mode of modes) {
    runStep(`Normalisation locale (${mode})`, "node", [
      "scripts/normalize-french-text.cjs",
      `--scope=${options.scope}`,
      `--html-mode=${mode}`,
      "--write",
    ]);
  }

  let languageToolStatus = 0;
  if (!options.skipLanguageTool) {
    languageToolStatus = runStep(
      "LanguageTool apres corrections locales",
      "node",
      ["scripts/check-french-with-languagetool.cjs", `--scope=${options.scope}`],
      { allowFailure: true },
    );
  }

  if (!options.skipOpenAi) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY manquant. Ajoute la cle avant de lancer la phase OpenAI.");
    }

    for (const mode of modes) {
      const output = buildOpenAiOutput(options.scope, mode, options.suffix);
      openAiOutputs.push(output);

      runStep(`OpenAI review (${mode})`, "node", [
        "scripts/check-french-with-openai.cjs",
        `--scope=${options.scope}`,
        `--mode=${mode}`,
        `--limit=${options.limit}`,
        `--max-issues=${options.maxIssues}`,
        `--output=${output}`,
      ]);

      runStep(`Rapport safe candidates (${mode})`, "node", [
        "scripts/report-openai-safe-candidates.cjs",
        `--input=reports/${output}.json`,
      ]);

      if (!options.reportOnly) {
        runStep(`Application safe (${mode})`, "node", [
          "scripts/apply-openai-safe-candidates.cjs",
          `--input=reports/${output}.json`,
        ]);
      }
    }
  }

  let finalLanguageToolStatus = 0;
  if (!options.skipLanguageTool) {
    finalLanguageToolStatus = runStep(
      "LanguageTool final",
      "node",
      ["scripts/check-french-with-languagetool.cjs", `--scope=${options.scope}`],
      { allowFailure: true },
    );
  }

  runStep("Rapport qualite final", "node", ["scripts/report-site-quality.cjs", `--scope=${options.scope}`]);

  console.log(`\nPipeline hybride termine pour ${options.scope}`);
  if (openAiOutputs.length > 0) {
    console.log(`Rapports OpenAI: ${openAiOutputs.map((value) => `${value}.json`).join(", ")}`);
  }

  if ((languageToolStatus !== 0 || finalLanguageToolStatus !== 0) && options.failOnLanguageTool) {
    process.exit(1);
  }

  if (languageToolStatus !== 0 || finalLanguageToolStatus !== 0) {
    console.log("LanguageTool a encore remonte des alertes. Le pipeline continue, mais une revue manuelle reste utile.");
  }
}

try {
  main();
} catch (error) {
  console.error(`Pipeline hybride indisponible : ${error.message}`);
  process.exit(1);
}
