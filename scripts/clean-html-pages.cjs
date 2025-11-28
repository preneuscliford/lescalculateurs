#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const inputDir = path.join(
  __dirname,
  "..",
  "src",
  "pages",
  "blog",
  "departements"
);
const outputDir = path.join(
  __dirname,
  "..",
  "src",
  "pages",
  "blog",
  "departements-clean"
);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper functions
const removeDuplicateLines = (content) => {
  const lines = content.split("\n");
  const filtered = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 || lines[i].trim() !== lines[i - 1].trim()) {
      filtered.push(lines[i]);
    }
  }
  return filtered.join("\n");
};

const fixWikimedia = (content, dept) => {
  return content.replace(
    /fichier hébergé par wikimedia commons\.?|matériel publié sur wikimedia commons\.?|origine : wikimedia commons\.?/gi,
    `Image illustrative du département ${dept} — Source : Wikimedia Commons.`
  );
};

const removeDoubleCommasAndSpaces = (content) => {
  return content
    .replace(/,,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
};

const fixDeepSeekMerging = (content) => {
  return content
    .replace(/la([A-Z])/g, "la $1")
    .replace(/dans la([A-Z])/g, "dans la $1")
    .replace(/dans le([A-Z])/g, "dans le $1")
    .replace(/département ([A-Z][a-zâ€™'-]+)'[A-Z][a-z]+/g, "département $1")
    .replace(/Val-dâ€™Oise/g, "Val-d'Oise")
    .replace(/d’Oise'Oise/g, "d'Oise");
};

const fixDepartmentNames = (content, deptName, code) => {
  // Simple fixes for common errors
  return (
    content
      .replace(/laVal-d’Oise/g, "le Val-d'Oise")
      .replace(/dans laVal-d’Oise/g, "dans le Val-d'Oise")
      .replace(/laSavoie/g, "la Savoie")
      .replace(/dans laSavoie/g, "dans la Savoie")
      // Add more as needed
      .replace(new RegExp(`la${deptName}`, "g"), `la ${deptName}`)
      .replace(new RegExp(`dans la${deptName}`, "g"), `dans la ${deptName}`)
  );
};

const fixDuplicateGuide = (content) => {
  return content.replace(
    /(Ce guide est pour le département [^\.]+\.)\s*\1/g,
    "$1"
  );
};

const fixIntro = (content) => {
  return content
    .replace(/En 2025, à la([A-Z])/g, "En 2025, à la $1")
    .replace(/dans la([A-Z])/g, "dans la $1");
};

const fixDuplicateGuideLine = (content) => {
  const regex =
    /(Ce guide est pour le département [A-Za-zÀ-ÿ0-9\(\) ]+\.\s*){2,}/gi;
  return content.replace(regex, (match) => {
    const parts = match.split(".");
    return parts[0] + ".";
  });
};

const fixIntros = (content) => {
  return content
    .replace(/En 2025, dans ([A-Za-zÀ-ÿ\- ]+),/g, "En 2025, à $1,")
    .replace(/Pour le département (\d+),,/g, "Pour le département $1,");
};

// Simple table fix: if lines look like numbers, try to rebuild
const fixTables = (content) => {
  // This is simplistic; in real, use HTML parser
  // For now, assume tables are in <table> and fix if broken
  // Skip for now, as it's complex
  return content;
};

// Reorganize sections: too complex without parser, skip or simple regex
const reorganizeSections = (content) => {
  // Skip for now
  return content;
};

const fixDVFData = (content) => {
  // Simple adjustments, hard to implement fully
  return content;
};

const generalCleanup = (content) => {
  return content
    .replace(/matériel/g, "image")
    .replace(/<br\s*\/?>\s*<br\s*\/?>/g, "<br>");
};

const fixMoreMergers = (content) => {
  return content
    .replace(/Val-d’Oise€™Oise/g, "Val-d'Oise")
    .replace(/\.\./g, ".")
    .replace(/95, présente/g, "95 présente")
    .replace(/la Val-d'Oise/g, "le Val-d'Oise")
    .replace(/dans la Val-d'Oise/g, "dans le Val-d'Oise")
    .replace(/à la Val-d'Oise/g, "au Val-d'Oise")
    .replace(
      "./././components/CalculatorFrame.ts",
      "../../../components/CalculatorFrame.ts"
    )
    .replace("./././main.ts", "../../../main.ts")
    .replace("./././data/baremes.ts", "../../../data/baremes.ts");
  // add more if needed
};

// Main loop
const files = fs.readdirSync(inputDir).filter((file) => file.endsWith(".html"));

files.forEach((file) => {
  const filePath = path.join(inputDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Extract dept from filename, e.g., frais-notaire-01.html -> 01
  const deptMatch = file.match(/frais-notaire-(\d+|2A|2B)\.html/);
  if (!deptMatch) return;
  const deptCode = deptMatch[1];
  // Need dept name, perhaps from clean.json
  const cleanPath = path.join(
    __dirname,
    "..",
    "reports",
    "duplication-fuzzy-clean.json"
  );
  let deptName = deptCode;
  if (fs.existsSync(cleanPath)) {
    const clean = JSON.parse(fs.readFileSync(cleanPath, "utf8"));
    const item = clean.find(
      (it) => String(it.code || it.departement_numero) === deptCode
    );
    if (item) deptName = item.nom || item.departement_nom || deptCode;
  }

  let cleaned = content;

  cleaned = removeDuplicateLines(cleaned);
  cleaned = fixWikimedia(cleaned, deptName);
  cleaned = removeDoubleCommasAndSpaces(cleaned);
  cleaned = fixDuplicateGuideLine(cleaned);
  cleaned = fixIntros(cleaned);
  cleaned = fixTables(cleaned);
  cleaned = reorganizeSections(cleaned);
  cleaned = fixDVFData(cleaned);
  cleaned = generalCleanup(cleaned);

  // New fixes
  cleaned = fixDeepSeekMerging(cleaned);
  cleaned = fixDepartmentNames(cleaned, deptName, deptCode);
  cleaned = fixDuplicateGuide(cleaned);
  cleaned = fixIntro(cleaned);
  cleaned = fixMoreMergers(cleaned);

  const outputPath = path.join(outputDir, file);
  fs.writeFileSync(outputPath, cleaned, "utf8");
  console.log(`✔ Cleaned: ${file}`);
});

console.log("All files processed.");
