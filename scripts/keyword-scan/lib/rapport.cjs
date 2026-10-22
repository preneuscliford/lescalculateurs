/**
 * Rapport par thème : un fichier Markdown (lecture et décision) et un CSV (tri, filtres).
 * Rien n'est publié : le rapport sert à décider.
 */
const fs = require("fs");
const path = require("path");

const echapperMd = (t) => String(t ?? "").replace(/\|/g, "\\|");
const echapperCsv = (t) => {
  const s = String(t ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function decrireSignal(c) {
  const morceaux = [];
  const a = c.sources.autocompletion;
  if (a) morceaux.push(`autocompl. ${a.directe ? "directe" : "a…z"} rang ${a.meilleurRang + 1}${a.occurrences > 1 ? ` ×${a.occurrences}` : ""}`);
  if (c.sources.gsc) morceaux.push(`${c.sources.gsc.impressions} impr.`);
  if (c.sources.semrush) morceaux.push(`vol. ${c.sources.semrush.volume}`);
  return morceaux.join(", ");
}

function decrireConcurrence(c) {
  const cc = c.concurrence;
  if (!cc || cc.niveau === "non vérifiée") return "non vérifiée";
  return `${cc.niveau} (${cc.forts} forts, ${cc.faibles} faibles${cc.rangSite ? `, notre site #${cc.rangSite}` : ""})`;
}

const COLONNES = ["formulation", "categorie", "type_calcul", "parametres", "signal", "score", "autocompletion", "impressions_gsc", "clics_gsc", "volume_semrush", "concurrence", "domaines_top10", "proposition", "calculateur", "justification", "amorces"];

function ligneCsv(c) {
  return [
    c.formulation,
    c.classement.categorie,
    c.classement.typeCalcul || "",
    c.classement.parametres.join(" "),
    c.signal,
    c.score,
    c.sources.autocompletion ? `${c.sources.autocompletion.directe ? "directe" : "a-z"} rang ${c.sources.autocompletion.meilleurRang + 1} x${c.sources.autocompletion.occurrences}` : "",
    c.sources.gsc?.impressions ?? "",
    c.sources.gsc?.clics ?? "",
    c.sources.semrush?.volume ?? "",
    c.concurrence?.niveau || "non vérifiée",
    (c.concurrence?.domaines || []).join(" "),
    c.proposition,
    c.calculateur,
    c.justification,
    [...c.amorces].join(" | "),
  ].map(echapperCsv).join(";");
}

function ecrireRapportTheme({ dossier, theme, candidats, meta, top = 60 }) {
  fs.mkdirSync(dossier, { recursive: true });
  const calcul = candidats.filter((c) => c.classement.categorie === "calcul").sort((a, b) => b.score - a.score);
  const info = candidats.filter((c) => c.classement.categorie !== "calcul").sort((a, b) => b.signal - a.signal);
  const dediees = calcul.filter((c) => c.proposition === "page dédiée à étudier");

  const parCalculateur = new Map();
  for (const c of calcul) {
    const k = c.calculateur || "(non rattaché)";
    const e = parCalculateur.get(k) || { nb: 0, signal: 0, exemples: [] };
    e.nb++;
    e.signal += c.signal;
    if (e.exemples.length < 4) e.exemples.push(c.formulation);
    parCalculateur.set(k, e);
  }

  const md = [];
  md.push(`# Scan de mots-clés : ${theme.libelle} (${meta.date})`, "");
  md.push(`- Formulations analysées : ${candidats.length} (calcul personnel : ${calcul.length}, information générale écartée : ${info.length})`);
  md.push(`- Sources : ${meta.sources.join(" ; ")}`);
  md.push(`- Concurrence (10 premiers résultats Google) : ${meta.concurrence}`);
  md.push(`- Propositions : ${dediees.length} page(s) dédiée(s) à étudier, ${calcul.length - dediees.length} formulation(s) traitées par la page principale`, "");
  md.push("> Rapport d'aide à la décision : rien n'est publié automatiquement. Une « page dédiée à étudier » remplit le critère 1 (formulation recherchée) ; les critères 2 (réponse matériellement différente) et 3 (source propre) restent à valider.", "");

  md.push("## Calculateurs concernés", "", "| Calculateur | Formulations | Signal cumulé | Exemples |", "|---|---:|---:|---|");
  for (const [k, e] of [...parCalculateur].sort((a, b) => b[1].signal - a[1].signal)) {
    md.push(`| ${echapperMd(k)} | ${e.nb} | ${Math.round(e.signal)} | ${echapperMd(e.exemples.join(" · "))} |`);
  }
  md.push("");

  if (dediees.length) {
    md.push("## Pages dédiées à étudier", "", "| Formulation | Signal | Concurrence | Calcul | Paramètres | Justification |", "|---|---|---|---|---|---|");
    for (const c of dediees) {
      md.push(`| ${echapperMd(c.formulation)} | ${echapperMd(decrireSignal(c))} | ${decrireConcurrence(c)} | ${c.classement.typeCalcul} | ${c.classement.parametres.join(", ")} | ${echapperMd(c.justification)} |`);
    }
    md.push("");
  }

  md.push(`## Formulations de calcul personnel (top ${Math.min(top, calcul.length)} par score)`, "", "| # | Formulation | Score | Signal | Concurrence | Calcul | Paramètres | Proposition | Calculateur |", "|---:|---|---:|---|---|---|---|---|---|");
  calcul.slice(0, top).forEach((c, i) => {
    md.push(`| ${i + 1} | ${echapperMd(c.formulation)} | ${c.score} | ${echapperMd(decrireSignal(c))} | ${decrireConcurrence(c)} | ${c.classement.typeCalcul} | ${c.classement.parametres.join(", ")} | ${c.proposition} | ${echapperMd(c.calculateur)} |`);
  });
  md.push("");

  md.push(`## Information générale écartée (${info.length}, extrait)`, "");
  md.push(info.slice(0, 25).map((c) => `- ${c.formulation} — ${c.classement.raisons.join(" ; ")}`).join("\n") || "- (aucune)", "");
  md.push(`Données complètes : \`${theme.id}.csv\`.`, "");

  fs.writeFileSync(path.join(dossier, `${theme.id}.md`), md.join("\n"), "utf8");
  const csv = [COLONNES.join(";"), ...[...calcul, ...info].map(ligneCsv)].join("\n");
  fs.writeFileSync(path.join(dossier, `${theme.id}.csv`), "﻿" + csv + "\n", "utf8");
}

module.exports = { ecrireRapportTheme, decrireSignal };
