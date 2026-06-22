#!/usr/bin/env node
/**
 * Audit des pages manquantes pour les clusters APL, ARE, Salaire
 * Compare les slugs existants sur disque avec les suggestions GPT
 */

const fs = require("fs");
const path = require("path");

function getSlugsOnDisk(dir) {
  const full = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  const entries = fs.readdirSync(full, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".html") && e.name !== "index.html")
    .map((e) => e.name.replace(/\.html$/, ""));
}

// ======================= CLUSTER APL =======================
const aplSlugs = getSlugsOnDisk("src/pages/apl");
console.log("=== APL: Pages existantes =", aplSlugs.length, "===");

const aplLoyersCibles = [350, 550, 850, 900];
const aplSituations = {
  "personne-seule": { situation: "seul", enfants: 0 },
  "couple-sans-enfant": { situation: "couple", enfants: 0 },
  "parent-isole-un-enfant": { situation: "parent-isole", enfants: 1 },
};

const aplMissing = [];
for (const loyer of aplLoyersCibles) {
  for (const [sitSlug, sitData] of Object.entries(aplSituations)) {
    const slug = `apl-loyer-${loyer}-${sitSlug}`;
    if (!aplSlugs.includes(slug)) {
      aplMissing.push({
        slug,
        intent: `apl loyer ${loyer} ${sitSlug.replace(/-/g, " ")}`,
        title: `APL avec loyer de ${loyer}\u00A0\u20AC pour ${sitSlug.replace(/-/g, " ").replace("personne seule", "une personne seule").replace("couple sans enfant", "un couple sans enfant").replace("parent isole un enfant", "un parent isol\u00E9 avec 1 enfant")} : estimation 2026`,
        description: `Estimation APL 2026 pour ${sitSlug.replace(/-/g, " ")} avec un loyer de ${loyer}\u00A0\u20AC.`,
        input: {
          situation: sitData.situation === "parent-isole" ? "parent_isole" : sitData.situation,
          enfants: sitData.enfants,
          revenus_mensuels: loyer <= 550 ? 950 : loyer <= 850 ? 1200 : 1350,
          loyer_mensuel: loyer,
          region: "province",
          type_logement: "location",
          economie: 0,
        },
        tags: [
          "loyer-" + loyer,
          sitSlug.includes("couple")
            ? "couple"
            : sitSlug.includes("parent")
              ? "parent-isole"
              : "celibataire",
          "province",
        ],
      });
    }
  }
}

console.log("\nPages APL manquantes:", aplMissing.length);
aplMissing.forEach((m) => console.log("  " + m.slug));

// ======================= CLUSTER ARE =======================
const areSlugs = getSlugsOnDisk("src/pages/are");
console.log("\n=== ARE: Pages existantes =", areSlugs.length, "===");

const areSalaireCibles = [1500, 1800, 2000, 2500];
const areSituations = [
  {
    slug: "salaire-1500",
    intent: "are salaire 1500",
    title: "ARE avec salaire de 1500\u00A0\u20AC : estimation 2026",
    salaireReferent: 1500,
    anciennete: 12,
  },
  {
    slug: "salaire-1800",
    intent: "are salaire 1800",
    title: "ARE avec salaire de 1800\u00A0\u20AC : estimation 2026",
    salaireReferent: 1800,
    anciennete: 18,
  },
  {
    slug: "salaire-2000",
    intent: "are salaire 2000",
    title: "ARE avec salaire de 2000\u00A0\u20AC : estimation 2026",
    salaireReferent: 2000,
    anciennete: 18,
  },
  {
    slug: "salaire-2500",
    intent: "are salaire 2500",
    title: "ARE avec salaire de 2500\u00A0\u20AC : estimation 2026",
    salaireReferent: 2500,
    anciennete: 24,
  },
];

const areSpeciaux = [
  {
    slug: "couple",
    intent: "are couple",
    title: "ARE pour un couple : estimation 2026",
    situation: "couple",
    salaireReferent: 2100,
  },
  {
    slug: "avec-enfant",
    intent: "are avec enfant",
    title: "ARE avec enfant \u00E0 charge : estimation 2026",
    situation: "seul",
    personnesCharge: 1,
    salaireReferent: 2000,
  },
  {
    slug: "interim",
    intent: "are interim",
    title: "ARE apr\u00E8s int\u00E9rim : estimation 2026",
    salaireReferent: 1800,
    anciennete: 10,
  },
];

const areMissing = [];

for (const s of areSalaireCibles) {
  const slug = `are-salaire-${s}`;
  const exists = areSlugs.some((sl) => sl.includes("salaire-" + s) || sl === slug);
  if (!exists) {
    areMissing.push({
      slug,
      intent: `are salaire ${s}`,
      title: `ARE avec salaire de ${s}\u00A0\u20AC : estimation 2026`,
      description: `Estimation ARE 2026 pour un salaire de r\u00E9f\u00E9rence de ${s}\u00A0\u20AC.`,
      input: {
        situation: "seul",
        ancienneteEmploi: s >= 2500 ? 24 : 18,
        salaireReferent: s,
        personnesCharge: 0,
        agePersonne: 35,
      },
    });
  }
}

for (const spec of areSpeciaux) {
  const slug = `are-${spec.slug}`;
  if (!areSlugs.includes(slug)) {
    areMissing.push({
      slug,
      intent: spec.intent,
      title: spec.title,
      description: `Estimation ARE 2026 pour ${spec.slug.replace(/-/g, " ")}.`,
      input: {
        situation: spec.situation || "seul",
        ancienneteEmploi: spec.anciennete || 18,
        salaireReferent: spec.salaireReferent || 2000,
        personnesCharge: spec.personnesCharge || 0,
        agePersonne: 38,
      },
    });
  }
}

console.log("\nPages ARE manquantes:", areMissing.length);
areMissing.forEach((m) => console.log("  " + m.slug));

// ======================= CLUSTER SALAIRE =======================
const salaireSlugs = getSlugsOnDisk("src/pages/salaire");
const allSalaireSlugs = [
  ...salaireSlugs,
  "salaire-brut-net-calcul-2026",
  "salaire-net-apres-impot",
  "salaire-seo",
];
console.log("\n=== SALAIRE: Pages existantes =", allSalaireSlugs.length, "===");

const salaireTranches = [1500, 1800, 2000, 2200, 2500, 2800, 3000, 3500, 4000, 5000];
const salaireVariantes = [
  { suffix: "", label: "standard", statut: "non-cadre" },
  { suffix: "-cadre", label: "cadre", statut: "cadre" },
  { suffix: "-temps-partiel-80", label: "temps partiel 80%", statut: "non-cadre" },
];

const salaireMissing = [];
for (const montant of salaireTranches) {
  for (const variante of salaireVariantes) {
    const slug = `salaire-brut-net-${montant}${variante.suffix}`;
    const exists = allSalaireSlugs.some(
      (s) => s.includes("salaire-brut-net-" + montant) || s === slug,
    );
    if (!exists) {
      salaireMissing.push({ slug, montant, variante: variante.label });
    }
  }
}

console.log("\nPages SALAIRE manquantes:", salaireMissing.length);
salaireMissing.forEach((m) => console.log("  " + m.slug));

// ======================= RESUME =======================
console.log("\n=== RESUME ===");
console.log(`APL \u00E0 cr\u00E9er: ${aplMissing.length}`);
console.log(`ARE \u00E0 cr\u00E9er: ${areMissing.length}`);
console.log(`Salaire \u00E0 cr\u00E9er: ${salaireMissing.length}`);
console.log(`TOTAL: ${aplMissing.length + areMissing.length + salaireMissing.length}`);

// Export pour usage ult\u00E9rieur
const report = { apl: aplMissing, are: areMissing, salaire: salaireMissing };
fs.writeFileSync(
  path.resolve(process.cwd(), "reports", "missing-pages-audit.json"),
  JSON.stringify(report, null, 2),
  "utf-8",
);
console.log("\nRapport sauvegard\u00E9: reports/missing-pages-audit.json");
