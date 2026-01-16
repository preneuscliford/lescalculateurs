import fs from "node:fs";
import path from "node:path";

// Taux DMTO 2026 officiels par département (en %)
const DMTO_2026 = {
  // Taux réduit 5.09%
  36: 5.09, // Indre
  976: 5.09, // Mayotte
  // Taux standard 5.80%
  "05": 5.8,
  "06": 5.8,
  "07": 5.8,
  16: 5.8,
  26: 5.8,
  27: 5.8,
  48: 5.8,
  60: 5.8,
  65: 5.8,
  71: 5.8,
  971: 5.8,
  972: 5.8,
  // Tous les autres = 6.32% (taux majoré)
};

const DMTO_DEFAULT = 6.32; // Taux majoré 2026 (87 départements)
const DMTO_NEUF = 0.715; // Droits réduits neuf

// Configuration émoluments 2025
const EMOLUMENTS = [
  { tranche_max: 6500, taux: 3.87 },
  { tranche_max: 17000, taux: 1.596 },
  { tranche_max: 60000, taux: 1.064 },
  { tranche_max: null, taux: 0.799 },
];

function getDmtoRate(code) {
  return DMTO_2026[code] ?? DMTO_DEFAULT;
}

function computeEmoluments(price) {
  let remaining = price;
  let total = 0;
  for (let i = 0; i < EMOLUMENTS.length; i++) {
    const tr = EMOLUMENTS[i];
    const taux = tr.taux / 100;
    if (tr.tranche_max == null) {
      total += remaining * taux;
      break;
    }
    const prevMax = i === 0 ? 0 : EMOLUMENTS[i - 1].tranche_max || 0;
    const cap = Math.max(0, Math.min(price, tr.tranche_max) - prevMax);
    total += cap * taux;
    remaining -= cap;
  }
  return total;
}

function computeFraisNotaire(code, price, type) {
  const dmtoRate = type === "neuf" ? DMTO_NEUF : getDmtoRate(code);
  const droits = (price * dmtoRate) / 100;
  const emoluments = computeEmoluments(price);
  const debours = 800; // moyenne
  const formalites = 400; // moyenne
  const csi = price * 0.001; // CSI 0.1%
  const tva = emoluments * 0.2;
  return {
    droits,
    emoluments,
    debours,
    formalites,
    csi,
    tva,
    total: droits + emoluments + debours + formalites + csi + tva,
    dmtoRate,
  };
}

function euro(n) {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
      Math.round(n),
    ) + " €"
  );
}

function formatPct(rate) {
  return rate.toFixed(2).replace(".", ",") + "%";
}

function processFile(filePath) {
  const base = path.basename(filePath);
  // Extraire le code département (01, 02, ..., 971, 972, 973, 974, 976, 2A, 2B)
  const match = base.match(/frais-notaire-(\d+|2A|2B)\.html$/i);
  if (!match) return false;

  const code =
    match[1].toUpperCase() === "2A"
      ? "2A"
      : match[1].toUpperCase() === "2B"
        ? "2B"
        : match[1];

  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  const price = 200000;
  const ancien = computeFraisNotaire(code, price, "ancien");
  const neuf = computeFraisNotaire(code, price, "neuf");

  const newAncienTotal = euro(ancien.total).replace("€", "").trim();
  const newNeufTotal = euro(neuf.total).replace("€", "").trim();
  const newAncienPct = formatPct(ancien.dmtoRate);
  const newNeufPct = formatPct(neuf.dmtoRate);

  // Pattern 1: "droits ≈ X,XX%" - remplace le taux ancien
  // Matcher les patterns comme "droits ≈ 5,80%" et les remplacer par le bon taux
  html = html.replace(/droits\s*≈\s*\d+[,\.]\d+\s*%/gi, (match) => {
    // Si c'est dans un contexte "neuf", garde le taux neuf
    return match;
  });

  // Pattern 2: Ligne complète "Frais de notaire 2026 en X : ≈ Y € pour 200 000 € (ancien, droits ≈ Z%) • ≈ W € (neuf, droits ≈ 0,71%)"
  html = html.replace(
    /(Frais de notaire 202\d en [^:]+:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(ancien,?\s*droits?\s*≈?\s*)[\d,\.]+\s*%(\)\s*•\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(neuf,?\s*droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    `$1${newAncienTotal} €$2${newAncienPct}$3${newNeufTotal} €$4${newNeufPct}`,
  );

  // Pattern 3: Format alternatif "≈ 14 704 € pour 200 000 € (droits ≈ 5,80%)"
  html = html.replace(
    /(≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\((?:ancien,?\s*)?droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    (match, p1, p2) => {
      // Détermine si c'est ancien ou neuf par le contexte
      if (/neuf/i.test(match)) {
        return `${p1}${newNeufTotal} €${p2}${newNeufPct}`;
      }
      return `${p1}${newAncienTotal} €${p2}${newAncienPct}`;
    },
  );

  // Pattern 4: Dans les blocs "Immobilier ancien" → ≈ X,XX%
  html = html.replace(
    /(Immobilier ancien<\/span><span[^>]*>)≈?\s*[\d,\.]+\s*%/gi,
    `$1≈ ${newAncienPct}`,
  );

  // Pattern 5: bg-green-100 avec le taux
  html = html.replace(
    /(<span class="font-mono bg-green-100[^"]*">)≈?\s*[\d,\.]+\s*%(<\/span>\s*<\/div>\s*<div[^>]*>\s*<span[^>]*>Immobilier neuf)/gi,
    `$1≈ ${newAncienPct}$2`,
  );

  // Pattern 6: Seul le taux ancien "5,80%" → "6,32%" dans contexte approprié (pas neuf)
  // Cibler spécifiquement les zones connues

  // Pattern 7: Schema.org / JSON-LD updates
  html = html.replace(
    /("description"\s*:\s*"[^"]*Ancien\s*:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(droits?\s*≈?\s*)[\d,\.]+\s*%(\)[^"]*Neuf\s*:\s*≈\s*)[\d\s]+\s*€(\s*pour\s*200\s*000\s*€\s*\(droits?\s*≈?\s*)[\d,\.]+\s*%/gi,
    `$1${newAncienTotal} €$2${newAncienPct}$3${newNeufTotal} €$4${newNeufPct}`,
  );

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(
      `✓ ${base}: DMTO ${newAncienPct} (ancien) / ${newNeufPct} (neuf)`,
    );
    return true;
  }
  return false;
}

function main() {
  const dir = path.resolve(
    process.cwd(),
    "src",
    "pages",
    "blog",
    "departements",
  );
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

  let updated = 0;
  for (const f of files) {
    if (processFile(path.join(dir, f))) updated++;
  }

  console.log(
    `\n✓ ${updated} fichiers départements mis à jour avec les taux DMTO 2026`,
  );
}

main();
