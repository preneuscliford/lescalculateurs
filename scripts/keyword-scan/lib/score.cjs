/**
 * Score d'opportunité et proposition (page principale, page dédiée ou rien).
 *
 * signal = autocomplétion (amorce directe ou expansion a…z, rang, occurrences)
 *        + impressions Search Console + volume Semrush (échelles logarithmiques)
 * score  = signal × facteur de concurrence, et 0 pour une information générale.
 *
 * Une page dédiée n'est proposée qu'avec un signal suffisant ET un paramètre susceptible de
 * changer la règle (âge, type de contrat, situation) : le critère 2 du brief (réponse
 * matériellement différente) reste à confirmer par un humain. Sinon, la page principale répond.
 */
const { normaliser } = require("./normaliser.cjs");

const FACTEUR_CONCURRENCE = { forte: 0.6, moyenne: 0.85, faible: 1.25, "non vérifiée": 1 };
const PARAMETRES_DE_REGLE = ["age", "contrat", "situation"];

function signal({ autocompletion, gsc, semrush }) {
  let s = 0;
  if (autocompletion) {
    const base = autocompletion.directe ? 3 : 1.5;
    s += Math.max(0.5, base - Math.min(autocompletion.meilleurRang, 9) * 0.15);
    s += Math.min(3, (autocompletion.occurrences - 1) * 0.5);
  }
  if (gsc) s += Math.log10(gsc.impressions + 1) * 2;
  if (semrush) s += Math.log10(semrush.volume + 1) * 2;
  return Math.round(s * 10) / 10;
}

function scorer(candidat) {
  const sig = signal(candidat.sources);
  if (candidat.classement.categorie !== "calcul") return { signal: sig, score: 0 };
  const facteur = FACTEUR_CONCURRENCE[candidat.concurrence?.niveau || "non vérifiée"] ?? 1;
  return { signal: sig, score: Math.round(sig * facteur * 10) / 10 };
}

function rattacher(formulation, theme) {
  const t = normaliser(formulation);
  const trouve = (theme.calculateurs || []).find((c) => c.motifs.some((m) => new RegExp(m).test(t)));
  return trouve ? trouve.libelle : theme.calculateurParDefaut;
}

function proposer(candidat, theme, { seuilPageDediee = 6 } = {}) {
  const calculateur = rattacher(candidat.formulation, theme);
  if (candidat.classement.categorie !== "calcul") {
    return { proposition: "rien", calculateur: "", justification: candidat.classement.raisons.join(" ; ") };
  }
  const regle = candidat.classement.parametres.filter((p) => PARAMETRES_DE_REGLE.includes(p));
  if (regle.length && candidat.signal >= seuilPageDediee) {
    return {
      proposition: "page dédiée à étudier",
      calculateur,
      justification: `signal ${candidat.signal}, paramètre ${regle.join(", ")} : vérifier que la règle ou la date diffère (critère 2) et la source (critère 3)`,
    };
  }
  return {
    proposition: "page principale",
    calculateur,
    justification: regle.length
      ? `paramètre ${regle.join(", ")} mais signal ${candidat.signal} < ${seuilPageDediee} : traité par la saisie du calculateur`
      : "réponse donnée par les saisies du calculateur",
  };
}

module.exports = { signal, scorer, proposer, rattacher, FACTEUR_CONCURRENCE };
