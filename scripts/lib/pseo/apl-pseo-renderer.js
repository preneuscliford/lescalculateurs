import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  normalizeFrenchText: normalizeFrenchCopy,
  repairMojibakeText,
} = require("../french-normalization.cjs");

const DOMAIN = "https://www.lescalculateurs.fr";
const PILLAR_PATH = "/pages/apl";
const GENERATED_MARKER = "<!-- GENERATED:PSEO:APL -->";
const FAVICON_OG_IMAGE = `${DOMAIN}/assets/favicon-32x32.png`;

const SITUATION_LABELS = {
  seul: "Personne seule",
  couple: "Couple",
  monoparental: "Parent isol\u00e9",
  autre: "Autre foyer",
};

const REGION_LABELS = {
  idf: "\u00cele-de-France",
  province: "Province",
  dom: "DOM-TOM",
};

const LOGEMENT_LABELS = {
  location: "Location",
  accession: "Accession \u00e0 la propri\u00e9t\u00e9",
  hlm: "Logement HLM",
  colocation: "Colocation",
};

function buildAplSimulatorUrl(input) {
  const params = new URLSearchParams();
  Object.entries(input || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return `${PILLAR_PATH}${query ? `?${query}` : ""}#apl-calculator`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function encodeHtmlEntities(value) {
  return String(value).replace(/[^\x20-\x7E]/g, (char) => {
    const code = char.charCodeAt(0).toString(10);
    return `&#${code};`;
  });
}

function escapeJsonUnicode(value) {
  return String(value).replace(/[^\x20-\x7E]/g, (char) => {
    const code = char.charCodeAt(0).toString(16).padStart(4, "0");
    return `\\u${code}`;
  });
}

function repairCorruptedFrench(value) {
  return String(value)
    .replace(/\?/g, (match, offset, input) => {
      const prev = input[offset - 1] || "";
      const next = input[offset + 1] || "";
      if (prev === " " && next === " ") return "Ã ";
      if (prev === " " && /[A-Z]/.test(next)) return "Ã ";
      return "?";
    })
    .replace(/Sc\?narios/g, "Sc\u00e9narios")
    .replace(/sc\?narios/g, "sc\u00e9narios")
    .replace(/Sc\?nario/g, "Sc\u00e9nario")
    .replace(/sc\?nario/g, "sc\u00e9nario")
    .replace(/c\?libataire/g, "c\u00e9libataire")
    .replace(/C\?libataire/g, "C\u00e9libataire")
    .replace(/\?tudiantes/g, "\u00e9tudiantes")
    .replace(/\?tudiantes/g, "\u00e9tudiantes")
    .replace(/\?tudiants/g, "\u00e9tudiants")
    .replace(/\?tudiant/g, "\u00e9tudiant")
    .replace(/\?tudiante/g, "\u00e9tudiante")
    .replace(/isol\?/g, "isol\u00e9")
    .replace(/Isol\?/g, "Isol\u00e9")
    .replace(/\?le-de-France/g, "\u00cele-de-France")
    .replace(/\?lev\?s/g, "\u00e9lev\u00e9s")
    .replace(/\?lev\?es/g, "\u00e9lev\u00e9es")
    .replace(/\?lev\?e/g, "\u00e9lev\u00e9e")
    .replace(/\?lev\?/g, "\u00e9lev\u00e9")
    .replace(/g\?ographique/g, "g\u00e9ographique")
    .replace(/g\?ographiques/g, "g\u00e9ographiques")
    .replace(/fr\?quente/g, "fr\u00e9quente")
    .replace(/fr\?quentes/g, "fr\u00e9quentes")
    .replace(/fr\?quents/g, "fr\u00e9quents")
    .replace(/r\?elle/g, "r\u00e9elle")
    .replace(/r\?elles/g, "r\u00e9elles")
    .replace(/r\?el/g, "r\u00e9el")
    .replace(/r\?els/g, "r\u00e9els")
    .replace(/d\?clar\?es/g, "d\u00e9clar\u00e9es")
    .replace(/d\?clar\?e/g, "d\u00e9clar\u00e9e")
    .replace(/d\?clar\?/g, "d\u00e9clar\u00e9")
    .replace(/d\?clarer/g, "d\u00e9clarer")
    .replace(/V\?rifier/g, "V\u00e9rifier")
    .replace(/v\?rifier/g, "v\u00e9rifier")
    .replace(/modifi\?/g, "modifi\u00e9")
    .replace(/modifi\?e/g, "modifi\u00e9e")
    .replace(/int\?grer/g, "int\u00e9grer")
    .replace(/p\?riode/g, "p\u00e9riode")
    .replace(/d\?tail/g, "d\u00e9tail")
    .replace(/s\?rieuse/g, "s\u00e9rieuse")
    .replace(/s\?rieux/g, "s\u00e9rieux")
    .replace(/\?ventuelles/g, "\u00e9ventuelles")
    .replace(/\?ventuelle/g, "\u00e9ventuelle")
    .replace(/\?ligibles/g, "\u00e9ligibles")
    .replace(/\?ligible/g, "\u00e9ligible")
    .replace(/\?tes/g, "\u00eates")
    .replace(/\?tre/g, "\u00eatre")
    .replace(/coh\?rent/g, "coh\u00e9rent")
    .replace(/coh\?rente/g, "coh\u00e9rente")
    .replace(/pr\?cis/g, "pr\u00e9cis")
    .replace(/pr\?cise/g, "pr\u00e9cise")
    .replace(/interm\?diaire/g, "interm\u00e9diaire")
    .replace(/adapt\?e/g, "adapt\u00e9e")
    .replace(/adapt\?/g, "adapt\u00e9")
    .replace(/priv\?e/g, "priv\u00e9e")
    .replace(/priv\?es/g, "priv\u00e9es")
    .replace(/activit\?/g, "activit\u00e9")
    .replace(/calcul\?e/g, "calcul\u00e9e")
    .replace(/calcul\?/g, "calcul\u00e9")
    .replace(/mod\?r\?e/g, "mod\u00e9r\u00e9e")
    .replace(/mod\?r\?/g, "mod\u00e9r\u00e9")
    .replace(/g\?n\?ralement/g, "g\u00e9n\u00e9ralement")
    .replace(/g\?n\?r\?e/g, "g\u00e9n\u00e9r\u00e9e")
    .replace(/g\?n\?r\?es/g, "g\u00e9n\u00e9r\u00e9es")
    .replace(/r\?gles/g, "r\u00e8gles")
    .replace(/concr\?te/g, "concr\u00e8te")
    .replace(/concr\?tes/g, "concr\u00e8tes")
    .replace(/\? Paris/g, "\u00e0 Paris")
    .replace(/\? Lyon/g, "\u00e0 Lyon")
    .replace(/\? Marseille/g, "\u00e0 Marseille")
    .replace(/\? Toulouse/g, "\u00e0 Toulouse")
    .replace(/\? Lille/g, "\u00e0 Lille")
    .replace(/\? Nantes/g, "\u00e0 Nantes")
    .replace(/ avecloyer /g, " avec loyer ")
    .replace(/ unloyer /g, " un loyer ")
    .replace(/ coupleloyer /g, " couple loyer ")
    .replace(/ aplloyer /g, " apl loyer ")
    .replace(/ a Paris/g, " \u00e0 Paris")
    .replace(/ a Lyon/g, " \u00e0 Lyon")
    .replace(/ a Marseille/g, " \u00e0 Marseille")
    .replace(/ a Toulouse/g, " \u00e0 Toulouse")
    .replace(/ a Lille/g, " \u00e0 Lille")
    .replace(/ a Nantes/g, " \u00e0 Nantes")
    .replace(/\bV\?rifier\b/g, "V\u00e9rifier")
    .replace(/\bV\?rifiez\b/g, "V\u00e9rifiez")
    .replace(/\bv\?rification\b/g, "v\u00e9rification")
    .replace(/\bv\?rifier\b/g, "v\u00e9rifier")
    .replace(/\br\?ellement\b/g, "r\u00e9ellement")
    .replace(/\br\?els\b/g, "r\u00e9els")
    .replace(/\br\?el\b/g, "r\u00e9el")
    .replace(/\br\?elles\b/g, "r\u00e9elles")
    .replace(/\br\?elle\b/g, "r\u00e9elle")
    .replace(/\br\?sultats\b/g, "r\u00e9sultats")
    .replace(/\br\?sultat\b/g, "r\u00e9sultat")
    .replace(/\br\?f\?rences\b/g, "r\u00e9f\u00e9rences")
    .replace(/\br\?f\?rence\b/g, "r\u00e9f\u00e9rence")
    .replace(/\bch\?mage\b/g, "ch\u00f4mage")
    .replace(/\bcompl\?te\b/g, "compl\u00e8te")
    .replace(/\btr\?s\b/g, "tr\u00e8s")
    .replace(/\bmod\?r\?e\b/g, "mod\u00e9r\u00e9e")
    .replace(/\bmod\?r\?\b/g, "mod\u00e9r\u00e9")
    .replace(/\bp\?riode\b/g, "p\u00e9riode")
    .replace(/\bg\?ographique\b/g, "g\u00e9ographique")
    .replace(/\bco\?t\b/g, "co\u00fbt")
    .replace(/\bsup\?rieur\b/g, "sup\u00e9rieur")
    .replace(/\bsup\?rieure\b/g, "sup\u00e9rieure")
    .replace(/\bint\?ressante\b/g, "int\u00e9ressante")
    .replace(/\bindemnit\?s\b/g, "indemnit\u00e9s")
    .replace(/\bsuppl\?mentaires\b/g, "suppl\u00e9mentaires")
    .replace(/\br\?gularit\?\b/g, "r\u00e9gularit\u00e9")
    .replace(/\bd\?m\?nager\b/g, "d\u00e9m\u00e9nager")
    .replace(/\bd\?passe\b/g, "d\u00e9passe")
    .replace(/\bd\?but\b/g, "d\u00e9but")
    .replace(/\bentr\?e\b/g, "entr\u00e9e")
    .replace(/\bmarch\?\b/g, "march\u00e9")
    .replace(/\bconventionn\?\b/g, "conventionn\u00e9")
    .replace(/\br\?pond\b/g, "r\u00e9pond")
    .replace(/\br\?duire\b/g, "r\u00e9duire")
    .replace(/\br\?gle\b/g, "r\u00e8gle")
    .replace(/\br\?gles\b/g, "r\u00e8gles")
    .replace(/\brepr?sentatif\b/g, "repr\u00e9sentatif")
    .replace(/\brepr?sentatifs\b/g, "repr\u00e9sentatifs")
    .replace(/\brepr?sentative\b/g, "repr\u00e9sentative")
    .replace(/\brepr?sentatives\b/g, "repr\u00e9sentatives")
    .replace(/\bparall\?le\b/g, "parall\u00e8le")
    .replace(/\brequ\?te\b/g, "requ\u00eate")
    .replace(/\bconventionn\?\b/g, "conventionn\u00e9")
    .replace(/\br\?ponse\b/g, "r\u00e9ponse")
    .replace(/\br\?pond\b/g, "r\u00e9pond")
    .replace(/\brequ\?te\b/g, "requ\u00eate")
    .replace(/\brequ\?tes\b/g, "requ\u00eates")
    .replace(/\bdiff\?rent\b/g, "diff\u00e9rent")
    .replace(/\bdiff\?rents\b/g, "diff\u00e9rents")
    .replace(/\bdiff\?rente\b/g, "diff\u00e9rente")
    .replace(/\bdiff\?rentes\b/g, "diff\u00e9rentes")
    .replace(/\butilit\?\b/g, "utilit\u00e9")
    .replace(/\bcritere\b/g, "crit\u00e8re")
    .replace(/\bcriteres\b/g, "crit\u00e8res")
    .replace(/\betre\b/g, "\u00eatre")
    .replace(/\bEtre\b/g, "\u00catre")
    .replace(/\bd\?clarer\b/g, "d\u00e9clarer")
    .replace(/\bd\?clar\?e\b/g, "d\u00e9clar\u00e9e")
    .replace(/\bd\?clar\?\b/g, "d\u00e9clar\u00e9")
    .replace(/\bd\?pend\b/g, "d\u00e9pend")
    .replace(/\bd\?d\?pend\b/g, "d\u00e9pend")
    .replace(/\bcaract\?ristiques\b/g, "caract\u00e9ristiques")
    .replace(/\bpr\?cise\b/g, "pr\u00e9cise")
    .replace(/\bpr\?cis\b/g, "pr\u00e9cis")
    .replace(/\br\?sidence\b/g, "r\u00e9sidence")
    .replace(/\butilit\?\b/g, "utilit\u00e9")
    .replace(/\br\?currente\b/g, "r\u00e9currente")
    .replace(/\bd\?calage\b/g, "d\u00e9calage")
    .replace(/\bcoh\?rent\b/g, "coh\u00e9rent")
    .replace(/\bcoh\?rente\b/g, "coh\u00e9rente")
    .replace(/\b\?tudiant\b/g, "\u00e9tudiant")
    .replace(/\b\?tudiants\b/g, "\u00e9tudiants")
    .replace(/\b\?tudiantes\b/g, "\u00e9tudiantes")
    .replace(/\bc\?libataire\b/g, "c\u00e9libataire")
    .replace(/\bC\?libataire\b/g, "C\u00e9libataire")
    .replace(/\bisol\?\b/g, "isol\u00e9")
    .replace(/\bg\?olocalisation\b/g, "g\u00e9olocalisation")
    .replace(/\bg\?olocalis\w*/g, (match) =>
      match
        .replace("g?olocalisee", "g\u00e9olocalis\u00e9e")
        .replace("g?olocalisee", "g\u00e9olocalis\u00e9e")
        .replace("g?olocalisee", "g\u00e9olocalis\u00e9e"),
    )
    .replace(/\s+\?(\s+)/g, " \u00e0$1")
    .replace(/\?\s+Paris/g, "\u00e0 Paris")
    .replace(/\?\s+Lyon/g, "\u00e0 Lyon")
    .replace(/\?\s+Marseille/g, "\u00e0 Marseille")
    .replace(/\?\s+Toulouse/g, "\u00e0 Toulouse")
    .replace(/\? loyer comparable/g, "\u00c0 loyer comparable")
    .replace(/\? charge/g, "\u00e0 charge")
    .replace(/\? l'autre/g, "\u00e0 l'autre")
    .replace(/\? elle seule/g, "\u00e0 elle seule")
    .replace(/\bl APL\b/g, "l'APL")
    .replace(/\bL APL\b/g, "L'APL")
    .replace(/LesCalculateurs\.\s+fr/g, "LesCalculateurs.fr")
    .replace(/\bd un\b/g, "d'un")
    .replace(/\bd une\b/g, "d'une")
    .replace(/\bd autres\b/g, "d'autres")
    .replace(/\bd activit\u00e9\b/g, "d'activit\u00e9")
    .replace(/\bd emploi\b/g, "d'emploi")
    .replace(/\ba l'APL\b/g, "\u00e0 l'APL")
    .replace(/\ba Paris\b/g, "\u00e0 Paris")
    .replace(/\ba Lyon\b/g, "\u00e0 Lyon")
    .replace(/\ba Marseille\b/g, "\u00e0 Marseille")
    .replace(/\ba Toulouse\b/g, "\u00e0 Toulouse")
    .replace(/\s{2,}/g, " ");
}

function toFrenchDisplayText(value) {
  return normalizeFrenchCopy(
    repairMojibakeText(
      repairCorruptedFrench(value)
        .replace(/\bScenario\b/g, "Sc\u00e9nario")
    .replace(/\bscenario\b/g, "sc\u00e9nario")
    .replace(/\bScenarios\b/g, "Sc\u00e9narios")
    .replace(/\bscenarios\b/g, "sc\u00e9narios")
    .replace(/\bcelibataire\b/g, "c\u00e9libataire")
    .replace(/\bCelibataire\b/g, "C\u00e9libataire")
    .replace(/\betudiant\b/g, "\u00e9tudiant")
    .replace(/\bEtudiant\b/g, "\u00c9tudiant")
    .replace(/\betudiants\b/g, "\u00e9tudiants")
    .replace(/\bEtudiants\b/g, "\u00c9tudiants")
    .replace(/\bparent isole\b/g, "parent isol\u00e9")
    .replace(/\bParent isole\b/g, "Parent isol\u00e9")
    .replace(/\bmodifiee\b/g, "modifi\u00e9e")
    .replace(/\bmodifie\b/g, "modifi\u00e9")
    .replace(/\bparametres\b/g, "param\u00e8tres")
    .replace(/\bParametres\b/g, "Param\u00e8tres")
    .replace(/param\u00e8tr\u00e8s/g, "param\u00e8tres")
    .replace(/Param\u00e8tr\u00e8s/g, "Param\u00e8tres")
    .replace(/\bVerification\b/g, "V\u00e9rification")
    .replace(/\bverification\b/g, "v\u00e9rification")
    .replace(/\bResultat\b/g, "R\u00e9sultat")
    .replace(/\bresultat\b/g, "r\u00e9sultat")
    .replace(/\breelle\b/g, "r\u00e9elle")
    .replace(/\bReelle\b/g, "R\u00e9elle")
    .replace(/\breel\b/g, "r\u00e9el")
    .replace(/\bReel\b/g, "R\u00e9el")
    .replace(/\breellement\b/g, "r\u00e9ellement")
    .replace(/\baffiche\b/g, "affich\u00e9")
    .replace(/\bAffiche\b/g, "Affich\u00e9")
    .replace(/\bgeographique\b/g, "g\u00e9ographique")
    .replace(/\bGeographique\b/g, "G\u00e9ographique")
    .replace(/\bgeographiques\b/g, "g\u00e9ographiques")
    .replace(/\bspecifique\b/g, "sp\u00e9cifique")
    .replace(/\bSpecifique\b/g, "Sp\u00e9cifique")
    .replace(/\bspecifiques\b/g, "sp\u00e9cifiques")
    .replace(/\bdifferemment\b/g, "diff\u00e9remment")
    .replace(/\bdifferents\b/g, "diff\u00e9rents")
    .replace(/\bdifferentes\b/g, "diff\u00e9rentes")
    .replace(/\bdetail\b/g, "d\u00e9tail")
    .replace(/\bDetail\b/g, "D\u00e9tail")
    .replace(/\bregles\b/g, "r\u00e8gles")
    .replace(/\bRegles\b/g, "R\u00e8gles")
    .replace(/\bperiode\b/g, "p\u00e9riode")
    .replace(/\bPeriode\b/g, "P\u00e9riode")
    .replace(/\bactivite\b/g, "activit\u00e9")
    .replace(/\bActivite\b/g, "Activit\u00e9")
    .replace(/\bactivites\b/g, "activit\u00e9s")
    .replace(/\bfrequentes\b/g, "fr\u00e9quentes")
    .replace(/\bfrequentes\b/g, "fr\u00e9quentes")
    .replace(/\bfrequente\b/g, "fr\u00e9quente")
    .replace(/\bfrancilienne\b/g, "francilienne")
    .replace(/\beleve\b/g, "\u00e9lev\u00e9")
    .replace(/\bEleve\b/g, "\u00c9lev\u00e9")
    .replace(/\belevee\b/g, "\u00e9lev\u00e9e")
    .replace(/\bElevee\b/g, "\u00c9lev\u00e9e")
    .replace(/\beleves\b/g, "\u00e9lev\u00e9s")
    .replace(/\belevee\b/g, "\u00e9lev\u00e9e")
    .replace(/\bestimee\b/g, "estim\u00e9e")
    .replace(/\bEstimee\b/g, "Estim\u00e9e")
    .replace(/\bestime\b/g, "estim\u00e9")
    .replace(/\bEstime\b/g, "Estim\u00e9")
    .replace(/\bcalcule\b/g, "calcul\u00e9")
    .replace(/\bCalcule\b/g, "Calcul\u00e9")
    .replace(/\bestimation a\b/g, "estimation \u00e0")
    .replace(/\butilisee\b/g, "utilis\u00e9e")
    .replace(/\bUtilisee\b/g, "Utilis\u00e9e")
    .replace(/\butilise\b/g, "utilis\u00e9")
    .replace(/\bUtilise\b/g, "Utilis\u00e9")
    .replace(/\bconsidere\b/g, "consid\u00e9r\u00e9")
    .replace(/\bconsideree\b/g, "consid\u00e9r\u00e9e")
    .replace(/\bdeclare\b/g, "d\u00e9clar\u00e9")
    .replace(/\bdeclaree\b/g, "d\u00e9clar\u00e9e")
    .replace(/\bdeclarees\b/g, "d\u00e9clar\u00e9es")
    .replace(/\bdemarche\b/g, "d\u00e9marche")
    .replace(/\bDemarche\b/g, "D\u00e9marche")
    .replace(/\bdemarches\b/g, "d\u00e9marches")
    .replace(/\bconseille\b/g, "conseill\u00e9")
    .replace(/\bConseille\b/g, "Conseill\u00e9")
    .replace(/\bDerniere\b/g, "Derni\u00e8re")
    .replace(/\bderniere\b/g, "derni\u00e8re")
    .replace(/\bmodification\b/g, "modification")
    .replace(/\bfrequentes\b/g, "fr\u00e9quentes")
    .replace(/\bfrequents\b/g, "fr\u00e9quents")
    .replace(/\bconcrete\b/g, "concr\u00e8te")
    .replace(/\bConcrete\b/g, "Concr\u00e8te")
    .replace(/\bconcretes\b/g, "concr\u00e8tes")
    .replace(/\brequete\b/g, "requ\u00eate")
    .replace(/\bRequete\b/g, "Requ\u00eate")
    .replace(/\btres\b/g, "tr\u00e8s")
    .replace(/\bTres\b/g, "Tr\u00e8s")
    .replace(/\blaisse\b/g, "laisse")
    .replace(/\bparallele\b/g, "parall\u00e8le")
    .replace(/\bParallele\b/g, "Parall\u00e8le")
    .replace(/\bhesitez\b/g, "h\u00e9sitez")
    .replace(/\bHesitez\b/g, "H\u00e9sitez")
    .replace(/\bserre\b/g, "serr\u00e9")
    .replace(/\bSerre\b/g, "Serr\u00e9")
    .replace(/\bmoderee\b/g, "mod\u00e9r\u00e9e")
    .replace(/\bModeree\b/g, "Mod\u00e9r\u00e9e")
    .replace(/\bintegralement\b/g, "int\u00e9gralement")
    .replace(/\bIntegrablement\b/g, "Int\u00e9gralement")
    .replace(/\bdetaille\b/g, "d\u00e9taill\u00e9")
    .replace(/\bDetaille\b/g, "D\u00e9taill\u00e9")
    .replace(/\brepond\b/g, "r\u00e9pond")
    .replace(/\bRepond\b/g, "R\u00e9pond")
    .replace(/\bhypotheses\b/g, "hypoth\u00e8ses")
    .replace(/\bHypotheses\b/g, "Hypoth\u00e8ses")
    .replace(/\bgeneree\b/g, "g\u00e9n\u00e9r\u00e9e")
    .replace(/\bgenerees\b/g, "g\u00e9n\u00e9r\u00e9es")
    .replace(/\bgeneration\b/g, "g\u00e9n\u00e9ration")
    .replace(/\bgeneralement\b/g, "g\u00e9n\u00e9ralement")
    .replace(/\bbeneficier\b/g, "b\u00e9n\u00e9ficier")
    .replace(/\bbeneficie\b/g, "b\u00e9n\u00e9ficie")
    .replace(/\bbeneficient\b/g, "b\u00e9n\u00e9ficient")
    .replace(/\bpret\b/g, "pr\u00eat")
    .replace(/\bPret\b/g, "Pr\u00eat")
    .replace(/\bmethodologie\b/g, "m\u00e9thodologie")
    .replace(/\bMethodologie\b/g, "M\u00e9thodologie")
    .replace(/\bmethode\b/g, "m\u00e9thode")
    .replace(/\bMethode\b/g, "M\u00e9thode")
    .replace(/\bbasee\b/g, "bas\u00e9e")
    .replace(/\bBasee\b/g, "Bas\u00e9e")
    .replace(/\bpre-rempli\b/g, "pr\u00e9-rempli")
    .replace(/\bPre-rempli\b/g, "Pr\u00e9-rempli")
    .replace(/\bpre-remplie\b/g, "pr\u00e9-remplie")
    .replace(/\bPre-remplie\b/g, "Pr\u00e9-remplie")
    .replace(/\bcout\b/g, "co\u00fbt")
    .replace(/\bCout\b/g, "Co\u00fbt")
    .replace(/\bevolue\b/g, "\u00e9volue")
    .replace(/\bEvolue\b/g, "\u00c9volue")
    .replace(/\bnecessaire\b/g, "n\u00e9cessaire")
    .replace(/\bNecessaire\b/g, "N\u00e9cessaire")
    .replace(/\bL intention\b/g, "L'intention")
    .replace(/\bl intention\b/g, "l'intention")
    .replace(/\bL objectif\b/g, "L'objectif")
    .replace(/\bl objectif\b/g, "l'objectif")
    .replace(/\bL APL\b/g, "L'APL")
    .replace(/\bl APL\b/g, "l'APL")
    .replace(/\bd un\b/g, "d'un")
    .replace(/\bd une\b/g, "d'une")
    .replace(/\bd autres\b/g, "d'autres")
    .replace(/ d activite\b/g, " d'activit\u00e9")
    .replace(/ d activites\b/g, " d'activit\u00e9s")
    .replace(/\bd abord\b/g, "d'abord")
    .replace(/\bc est\b/g, "c'est")
    .replace(/\bC est\b/g, "C'est")
    .replace(/\bqu un\b/g, "qu'un")
    .replace(/\bqu une\b/g, "qu'une")
    .replace(/\blorsqu on\b/g, "lorsqu'on")
    .replace(/\bLorsqu on\b/g, "Lorsqu'on")
    .replace(/\bj ai\b/g, "j'ai")
    .replace(/\bJ ai\b/g, "J'ai")
    .replace(/\bVerifier\b/g, "V\u00e9rifier")
    .replace(/\bVerifiez\b/g, "V\u00e9rifiez")
    .replace(/\bverifiez\b/g, "v\u00e9rifiez")
    .replace(/\bIle-de-France\b/g, "\u00cele-de-France")
    .replace(/\ba Paris\b/g, "\u00e0 Paris")
    .replace(/\ba Lyon\b/g, "\u00e0 Lyon")
    .replace(/\ba Marseille\b/g, "\u00e0 Marseille")
    .replace(/\ba Toulouse\b/g, "\u00e0 Toulouse")
    .replace(/\ba Lille\b/g, "\u00e0 Lille")
    .replace(/\ba Nantes\b/g, "\u00e0 Nantes")
    .replace(/\ba Bordeaux\b/g, "\u00e0 Bordeaux")
    .replace(/\ba Nice\b/g, "\u00e0 Nice")
    .replace(/\ba Rennes\b/g, "\u00e0 Rennes")
    .replace(/\ba Strasbourg\b/g, "\u00e0 Strasbourg")
    .replace(/\ba Montpellier\b/g, "\u00e0 Montpellier")
    .replace(/\ba partir\b/g, "\u00e0 partir")
    .replace(/\ba la CAF\b/g, "\u00e0 la CAF")
    .replace(/\ba votre situation\b/g, "\u00e0 votre situation")
    .replace(/\ba l intention\b/g, "\u00e0 l'intention")
    .replace(/\ba l estimation\b/g, "\u00e0 l'estimation")
    .replace(/\ba l aide\b/g, "\u00e0 l'aide")
    .replace(/\ba l activite\b/g, "\u00e0 l'activit\u00e9")
    .replace(/\ba l autre\b/g, "\u00e0 l'autre")
    .replace(/\brequ \u00e0 te\b/gi, "requ\u00eate")
    .replace(/\bdiff \u00e0 rent\b/gi, "diff\u00e9rent")
    .replace(/\bdiff \u00e0 rents\b/gi, "diff\u00e9rents")
    .replace(/le loyer est bien renseign(?:\s|\&#224;|Ã )+hors charges/gi, "le loyer est bien renseign\u00e9 hors charges")
    .replace(/verifier que le loyer est bien renseigne(?:\s|\&#224;|Ã )+hors charges/gi, "v\u00e9rifier que le loyer est bien renseign\u00e9 hors charges")
    .replace(/\ba revenu\b/g, "\u00e0 revenu")
    .replace(/\ba ([0-9])/g, "\u00e0 $1")
    .replace(/\bA ([0-9])/g, "\u00c0 $1")
    .replace(/\bcomplete\b/g, "compl\u00e8te")
    .replace(/\bComplete\b/g, "Compl\u00e8te")
        .replace(/\bmodifi?r\b/g, "modifier")
        .replace(/\brecalcul?r\b/g, "recalculer")
        .replace(/\bdes son\b/g, "d\u00e8s son")
        .replace(/param\u00e8tr\u00e8s/g, "param\u00e8tres")
        .replace(/Param\u00e8tr\u00e8s/g, "Param\u00e8tres"),
    ),
  );
}

function normalizeInlineApproxEuro(value) {
  return String(value).replace(/(^|[^\w~])(\d{1,3}(?:[\s\u202f]?\d{3})*|\d+)\s*EUR\b/g, (_match, prefix, amount) => {
    const numeric = Number(String(amount).replace(/[\s\u202f]/g, ""));
    if (!Number.isFinite(numeric)) return `${prefix}${amount} EUR`;
    return `${prefix}~${numeric.toLocaleString("fr-FR")} EUR`;
  });
}

function renderText(value) {
  return encodeHtmlEntities(escapeHtml(normalizeInlineApproxEuro(toFrenchDisplayText(value))));
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${escapeJsonUnicode(
    JSON.stringify(data),
  )}</script>`;
}

function renderRelatedLinks(relatedPages) {
  if (!relatedPages.length) return "";

  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Sc&eacute;narios proches</h2>
        <p class="mb-4 text-slate-700 leading-relaxed">
          Ces pages proposent d'autres estimations selon des profils et des contextes proches.
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          ${relatedPages
            .map(
              (page) => `
          <a href="/pages/apl/${page.slug}" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <span class="block text-sm uppercase tracking-wide text-slate-500 mb-1">${renderText(
              page.intent,
            )}</span>
            <span class="font-semibold">${renderText(page.title)}</span>
          </a>`,
            )
            .join("")}
        </div>
      </section>`;
}

function renderPilotVariants(pilotProduct) {
  if (!pilotProduct?.variants?.length) return "";

  return `
      <section class="mt-8 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Tester 3 variantes</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Si votre situation est proche de ce cas, testez aussi ces variantes pour voir ce qui fait vraiment bouger l'estimation.",
          )}
        </p>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          ${pilotProduct.variants
            .map(
              (item) => `
          <a href="${escapeAttribute(item.href)}" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-slate-900 transition-colors hover:border-emerald-400 hover:bg-emerald-100">
            <p class="font-semibold">${renderText(item.label)}</p>
            <p class="mt-2 text-sm leading-relaxed text-slate-700">${renderText(item.description)}</p>
          </a>`,
            )
            .join("")}
        </div>
      </section>`;
}

function renderPilotDrivers(pilotProduct) {
  if (!pilotProduct?.drivers?.length) return "";

  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Ce qui change le plus le montant</h2>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          ${pilotProduct.drivers
            .map(
              (item) => `
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-lg font-semibold text-slate-900">${renderText(item.title)}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-700">${renderText(item.description)}</p>
          </article>`,
            )
            .join("")}
        </div>
      </section>`;
}

function renderPilotComparison(pilotProduct, simulatorUrl) {
  if (!pilotProduct?.comparisonLinks?.length) return "";

  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Comparer avec un autre cas</h2>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          ${pilotProduct.comparisonLinks
            .map(
              (item) => `
          <a href="${escapeAttribute(
            item.href === PILLAR_PATH ? simulatorUrl || item.href : item.href,
          )}" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 transition-colors hover:border-blue-500 hover:bg-blue-50">
            <span class="font-semibold">${renderText(item.label)}</span>
          </a>`,
            )
            .join("")}
        </div>
      </section>`;
}

function renderPilotJourney(pilotProduct) {
  if (!pilotProduct?.journey?.length) return "";

  return `
      <section class="mt-8 rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Parcours recommand&eacute;</h2>
        <ol class="mt-5 space-y-3">
          ${pilotProduct.journey
            .map(
              (item, index) => `
          <li class="flex gap-3 rounded-2xl bg-white/80 p-4">
            <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">${index + 1}</span>
            <span class="text-slate-700 leading-relaxed">${renderText(item)}</span>
          </li>`,
            )
            .join("")}
        </ol>
      </section>`;
}

function renderMethodologySources() {
  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">M&eacute;thodologie et sources</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Cette estimation repose sur le moteur de simulation APL du site, pr\u00e9-rempli avec un sc\u00e9nario repr\u00e9sentatif. Elle donne un ordre de grandeur utile, mais ne remplace pas une v\u00e9rification finale \u00e0 partir de votre situation exacte.",
          )}
        </p>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-lg font-semibold text-slate-900">${renderText(
              "Sur quoi l'estimation est bas\u00e9e",
            )}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-700">${renderText(
              "Le calcul tient compte ici du profil du foyer, du niveau de revenus, du loyer, de la zone g\u00e9ographique et du type de logement renseign\u00e9s dans le sc\u00e9nario.",
            )}</p>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-lg font-semibold text-slate-900">${renderText(
              "Ce que cette page ne remplace pas",
            )}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-700">${renderText(
              "Le r\u00e9sultat reste indicatif. La CAF peut retenir d'autres \u00e9l\u00e9ments selon votre dossier, votre bail, vos ressources d\u00e9clar\u00e9es et votre situation administrative.",
            )}</p>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-lg font-semibold text-slate-900">${renderText(
              "Pourquoi nous montrons la m\u00e9thode",
            )}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-700">${renderText(
              "L'objectif est de rendre l'estimation plus lisible, plus transparente et plus simple \u00e0 v\u00e9rifier avec les r\u00e9f\u00e9rences officielles.",
            )}</p>
          </article>
        </div>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/pages/methodologie" class="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50">
            Consulter notre m&eacute;thodologie
          </a>
          <a href="https://www.caf.fr/allocataires/aides-et-demarches/mes-aides/aides-au-logement" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-900 transition-colors hover:bg-blue-100">
            Voir la source officielle CAF
          </a>
          <a href="https://www.service-public.fr/particuliers/vosdroits/F12006" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50">
            Voir la fiche service-public.fr
          </a>
        </div>
      </section>`;
}

function renderScenarioComparisonTable(scenario, estimate, relatedPages) {
  const comparablePages = [
    { ...scenario, estimate },
    ...relatedPages.filter((page) => page?.estimate),
  ].slice(0, 4);

  if (comparablePages.length < 2) return "";

  const rows = comparablePages
    .map(
      (page) => `
          <tr class="border-b border-slate-100 last:border-0">
            <td class="px-4 py-3 align-top">
              <a href="/pages/apl/${escapeAttribute(page.slug)}" class="font-semibold text-slate-900 hover:text-blue-700">
                ${renderText(page.audience || page.title)}
              </a>
              <p class="mt-1 text-xs text-slate-500">${renderText(page.intent)}</p>
            </td>
            <td class="px-4 py-3 text-right font-semibold text-slate-900">${renderText(
              page.estimate.formattedApl.startsWith("~")
                ? page.estimate.formattedApl
                : `~${page.estimate.formattedApl}`,
            )}</td>
            <td class="px-4 py-3 text-right text-slate-700">${renderText(
              page.estimate.formattedRevenue,
            )}</td>
            <td class="px-4 py-3 text-right text-slate-700">${renderText(
              page.estimate.formattedRent,
            )}</td>
          </tr>`,
    )
    .join("");

  return `
      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Comparer plusieurs sc&eacute;narios</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Ce tableau permet de voir rapidement comment l'estimation evolue selon des profils et contextes proches.",
          )}
        </p>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-slate-700">Sc&eacute;nario</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-700">APL estim&eacute;e</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-700">Revenus</th>
                <th class="px-4 py-3 text-right font-semibold text-slate-700">Loyer</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </section>`;
}

export function isGeneratedPseoAplPage(content) {
  return String(content).includes(GENERATED_MARKER);
}

export function renderAPLScenarioPage({
  scenario,
  estimate,
  relatedPages,
  targetConfig,
  generatedAt,
}) {
  const canonicalUrl = `${DOMAIN}/pages/apl/${scenario.slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: DOMAIN },
      {
        "@type": "ListItem",
        position: 2,
        name: "Simulateur APL",
        item: `${DOMAIN}${PILLAR_PATH}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: toFrenchDisplayText(scenario.title),
        item: canonicalUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: scenario.faq.map((item) => ({
      "@type": "Question",
      name: toFrenchDisplayText(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: toFrenchDisplayText(item.answer),
      },
    })),
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: toFrenchDisplayText(scenario.title),
    description: toFrenchDisplayText(scenario.description),
    url: canonicalUrl,
    isPartOf: `${DOMAIN}${PILLAR_PATH}`,
    publisher: {
      "@type": "Organization",
      name: "LesCalculateurs.fr",
      url: DOMAIN,
    },
  };

  const checklistItems = scenario.checklist
    .map(
      (item) => `<li class="text-slate-700 leading-relaxed">${renderText(item)}</li>`,
    )
    .join("");

  const faqHtml = scenario.faq
    .map(
      (item) => `
          <details class="group rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary class="cursor-pointer list-none font-semibold text-slate-900">${renderText(
              item.question,
            )}</summary>
            <p class="mt-3 text-slate-700 leading-relaxed">${renderText(item.answer)}</p>
          </details>`,
    )
    .join("");

  const estimationMessage = estimate.reasonZero
    ? `Montant estim\u00e9 \u00e0 ${estimate.formattedApl}. ${estimate.reasonZero}`
    : `Estimation indicative autour de ${estimate.formattedApl} par mois.`;
  const approxAplDisplay = estimate.formattedApl.startsWith("~")
    ? estimate.formattedApl
    : `~${estimate.formattedApl}`;
  const simulatorUrl = buildAplSimulatorUrl(scenario.input);
  const pilotVariantsHtml = renderPilotVariants(scenario.pilotProduct);
  const pilotDriversHtml = renderPilotDrivers(scenario.pilotProduct);
  const pilotComparisonHtml = renderPilotComparison(
    scenario.pilotProduct,
    simulatorUrl,
  );
  const pilotJourneyHtml = renderPilotJourney(scenario.pilotProduct);
  const scenarioComparisonHtml = renderScenarioComparisonTable(
    scenario,
    estimate,
    relatedPages,
  );

  const introText = toFrenchDisplayText(
    `${scenario.description} Cette page donne un premier ordre de grandeur avant d'utiliser le simulateur complet.`,
  );

  const tableRows = [
    ["Situation familiale", toFrenchDisplayText(SITUATION_LABELS[scenario.input.situation] || scenario.input.situation)],
    ["Nombre d'enfants", String(scenario.input.enfants)],
    ["Revenus mensuels", estimate.formattedRevenue],
    ["Loyer mensuel", estimate.formattedRent],
    ["Zone", toFrenchDisplayText(REGION_LABELS[scenario.input.region] || scenario.input.region)],
    ["Type de logement", toFrenchDisplayText(LOGEMENT_LABELS[scenario.input.type_logement] || scenario.input.type_logement)],
  ]
    .map(
      ([label, value]) => `
              <tr class="border-b border-slate-100 last:border-0">
                <th class="px-4 py-3 text-left font-medium text-slate-600">${renderText(label)}</th>
                <td class="px-4 py-3 text-right font-semibold text-slate-900">${renderText(value)}</td>
              </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${renderText(scenario.title)}</title>
    <meta name="description" content="${renderText(scenario.description)}" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-2209781252231399" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${renderText(scenario.title)}" />
    <meta property="og:description" content="${renderText(scenario.description)}" />
    <meta property="og:image" content="${FAVICON_OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${renderText(scenario.title)}" />
    <meta name="twitter:description" content="${renderText(scenario.description)}" />
    <meta name="twitter:image" content="${FAVICON_OG_IMAGE}" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="${targetConfig.stylesHref}" />
    ${renderJsonLd(breadcrumbSchema)}
    ${renderJsonLd(pageSchema)}
    ${renderJsonLd(faqSchema)}
    <script defer src="/third-party-loader.js"></script>
    ${targetConfig.mainScriptTag}
  </head>
  <body
    class="bg-slate-100 text-slate-900"
    data-lc-page-type="pseo"
    data-lc-page-cluster="apl"
    data-lc-page-template="scenario"
    data-lc-page-slug="${escapeAttribute(scenario.slug)}"
    data-lc-page-intent="${escapeAttribute(toFrenchDisplayText(scenario.intent))}"
    data-lc-page-audience="${escapeAttribute(toFrenchDisplayText(scenario.audience))}"
    data-lc-page-variant="pilot-2026"
  >
    ${GENERATED_MARKER}
    <div class="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div class="mx-auto max-w-5xl">
        ${renderText("Estimation indicative. V\u00e9rification finale \u00e0 faire sur")}
        <a href="https://www.caf.fr" class="font-semibold underline" target="_blank" rel="noopener">caf.fr</a>.
      </div>
    </div>

    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <a href="/" class="text-lg font-bold text-slate-900">Les Calculateurs</a>
        <nav class="flex gap-4 text-sm text-slate-600">
          <a href="/">Accueil</a>
          <a href="${PILLAR_PATH}">Simulateur APL</a>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-10">
      <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800 px-6 py-10 text-white shadow-xl ring-1 ring-white/10">
        <p class="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">
          Estimation indicative 2026
        </p>
        <h1 class="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">${renderText(
          scenario.title,
        )}</h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-100">${renderText(
          introText,
        )}</p>
        <p class="mt-4 max-w-3xl text-sm leading-relaxed text-slate-100/90">
          Le montant affich&eacute; est calcul&eacute; &agrave; partir du moteur de simulation APL utilis&eacute; sur LesCalculateurs.fr, avec un sc&eacute;nario repr&eacute;sentatif.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="${simulatorUrl}" class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-400">
            Ouvrir le simulateur APL complet
          </a>
          <a href="#hypotheses" class="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15">
            Voir les hypoth&egrave;ses
          </a>
        </div>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-bold text-slate-900">Estimation rapide</h2>
          <p class="mt-4 text-lg leading-relaxed text-slate-700">${renderText(
            estimationMessage.replace(estimate.formattedApl, approxAplDisplay),
          )}</p>
          <p class="mt-4 text-slate-700 leading-relaxed">${renderText(
            `Cette estimation correspond \u00e0 un profil type : ${scenario.audience}.`,
          )}</p>
          <p class="mt-4 text-slate-700 leading-relaxed">${renderText(
            "Elle reste indicative : le montant r\u00e9el d\u00e9pend notamment du logement, des ressources retenues par la CAF et de la situation administrative.",
          )}</p>
          <div class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">${renderText(
              "R\u00e9sultat estim\u00e9",
            )}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">${renderText(approxAplDisplay)} / mois</p>
            <p class="mt-2 text-sm text-slate-700">${renderText(
              "Montant indicatif calcul\u00e9 \u00e0 partir du moteur de simulation du site.",
            )}</p>
          </div>
        </article>

        <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Profil</p>
          <p class="mt-3 text-lg font-semibold text-slate-950">${renderText(scenario.audience)}</p>
          <p class="mt-3 text-sm leading-relaxed text-slate-600">
            ${renderText(scenario.summary)}
          </p>
        </aside>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Sc&eacute;nario utilis&eacute; pour cette estimation</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Cette estimation repose sur un sc\u00e9nario repr\u00e9sentatif construit \u00e0 partir d'un profil type.",
          )}
        </p>
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table class="min-w-full border-collapse text-sm">
            <tbody>
            ${tableRows}
            </tbody>
          </table>
        </div>
      </section>

      <section id="hypotheses" class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Hypoth&egrave;ses importantes</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Cette estimation repose sur un sc\u00e9nario simplifi\u00e9 et sur des hypoth\u00e8ses moyennes. Avant toute d\u00e9marche, il est conseill\u00e9 de v\u00e9rifier les param\u00e8tres qui influencent r\u00e9ellement le calcul.",
          )}
        </p>
        <ul class="mt-6 list-disc space-y-3 pl-5">
          ${checklistItems}
        </ul>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Dans certains cas, une colocation, un logement HLM ou un autre type de bail peut modifier sensiblement le montant.",
          )}
        </p>
      </section>

      ${renderMethodologySources()}

      ${scenarioComparisonHtml}

      ${pilotVariantsHtml}

      ${pilotDriversHtml}

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Pourquoi cette page existe</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            `Cette page r\u00e9pond \u00e0 l'intention de recherche ${scenario.intent}. Son objectif est de fournir une estimation r\u00e9aliste, d'expliquer les principaux facteurs qui influencent l'APL et d'orienter vers le simulateur d\u00e9taill\u00e9 pour affiner la situation.`,
          )}
        </p>
        <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Derni&egrave;re modification</p>
          <p class="mt-2 text-slate-800">${renderText(generatedAt)}</p>
        </div>
      </section>

      <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Questions fr&eacute;quentes</h2>
        <div class="mt-5 space-y-4">
          ${faqHtml}
        </div>
      </section>

      ${pilotComparisonHtml}

      ${renderRelatedLinks(relatedPages)}

      ${pilotJourneyHtml}

      <section class="mt-8 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Aller plus loin</h2>
        <p class="mt-4 text-slate-700 leading-relaxed">
          ${renderText(
            "Si votre situation ressemble \u00e0 ce sc\u00e9nario, utilisez le simulateur complet pour tester plusieurs param\u00e8tres : loyer, revenus, zone g\u00e9ographique et composition du foyer. Vous obtiendrez ainsi une estimation plus proche de votre situation r\u00e9elle.",
          )}
        </p>
        <a href="${simulatorUrl}" class="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
          Lancer une simulation APL compl&egrave;te
        </a>
      </section>
    </main>
  </body>
</html>`;
}

