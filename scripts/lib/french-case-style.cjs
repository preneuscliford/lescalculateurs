const UPPERCASE_GLOSSARY_WORDS = [
  "aah",
  "apl",
  "are",
  "asf",
  "caf",
  "cdd",
  "cdi",
  "mdph",
  "rsa",
  "smic",
];

const TITLECASE_GLOSSARY_WORDS = [
  "ardeche",
  "ariege",
  "france",
  "haute-saone",
  "ile-de-france",
  "ile de france",
  "lyon",
  "marseille",
  "nantes",
  "lille",
  "orleans",
  "paris",
  "pyrenees-atlantiques",
  "saone",
  "toulouse",
];

const LOWERCASE_MONTHS = [
  ["janvier", "janvier"],
  ["fevrier", "février"],
  ["mars", "mars"],
  ["avril", "avril"],
  ["mai", "mai"],
  ["juin", "juin"],
  ["juillet", "juillet"],
  ["aout", "août"],
  ["septembre", "septembre"],
  ["octobre", "octobre"],
  ["novembre", "novembre"],
  ["decembre", "décembre"],
];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toTitleCase(word) {
  if (word === "ile-de-france" || word === "ile de france") {
    return "Île-de-France";
  }

  return word.charAt(0).toUpperCase() + word.slice(1);
}

function preserveLeadingCase(source, replacement) {
  if (!source) {
    return replacement;
  }

  const first = source.charAt(0);
  if (first === first.toUpperCase() && first !== first.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function normalizeFrenchCaseStyle(input) {
  let output = String(input || "");

  for (const word of UPPERCASE_GLOSSARY_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
    output = output.replace(pattern, word.toUpperCase());
  }

  for (const word of TITLECASE_GLOSSARY_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
    output = output.replace(pattern, (match) => preserveLeadingCase(match, toTitleCase(word)));
  }

  for (const [plainMonth, normalizedMonth] of LOWERCASE_MONTHS) {
    const pattern = new RegExp(`\\b${escapeRegex(plainMonth)}\\b`, "giu");
    output = output.replace(pattern, normalizedMonth);
  }

  return output;
}

function collectCaseStyleFixes(input) {
  const original = String(input || "");
  const normalized = normalizeFrenchCaseStyle(original);
  const fixes = [];

  for (const word of UPPERCASE_GLOSSARY_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
    let match = pattern.exec(original);
    while (match) {
      const replacement = word.toUpperCase();
      if (match[0] !== replacement) {
        fixes.push({
          original: match[0],
          replacement,
        });
      }
      match = pattern.exec(original);
    }
  }

  for (const word of TITLECASE_GLOSSARY_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
    let match = pattern.exec(original);
    while (match) {
      const replacement = preserveLeadingCase(match[0], toTitleCase(word));
      if (match[0] !== replacement) {
        fixes.push({
          original: match[0],
          replacement,
        });
      }
      match = pattern.exec(original);
    }
  }

  for (const [plainMonth, normalizedMonth] of LOWERCASE_MONTHS) {
    const pattern = new RegExp(`\\b${escapeRegex(plainMonth)}\\b`, "giu");
    let match = pattern.exec(original);
    while (match) {
      if (match[0] !== normalizedMonth) {
        fixes.push({
          original: match[0],
          replacement: normalizedMonth,
        });
      }
      match = pattern.exec(original);
    }
  }

  return {
    normalized,
    fixes,
  };
}

module.exports = {
  collectCaseStyleFixes,
  normalizeFrenchCaseStyle,
};
