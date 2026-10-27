(function () {
  // Emplacements AdSense manuels, chargés par third-party-loader.js.
  // Règles : 3 annonces au plus, toujours placées avant un titre de section (jamais
  // contre un bouton ou un champ), espacées d'au moins deux sections, demandées
  // seulement à l'approche de l'écran. Celle d'après le simulateur attend que le
  // visiteur ait lancé un calcul.
  if (window.__lcEmplacementsPub) return;
  window.__lcEmplacementsPub = true;

  var CLIENT = "ca-pub-2209781252231399";
  // Identifiants des blocs d'annonces créés dans AdSense. Vide = emplacement désactivé.
  var BLOCS = {
    "apres-simulateur": "8938422172",
    "milieu-texte": "8248157036",
    "avant-faq": "2476955600",
  };
  var PAGES_EXCLUES = /^\/(r\/|pages\/(mentions-legales|politique-|contact|a-propos|api|plan-du-site)|404)/;
  var SIMULATEURS =
    '[id$="-calculator-slot"], [id$="-calculator"], #calculator-container, #simulateur, [data-simulateur]';
  var TITRE_FAQ = /questions fr[ée]quentes|^\W*faq\b(?! express)/i;
  var ECART_MIN = 2; // sections entre deux annonces
  var TEXTE_MIN = 1200; // caractères de contenu sous lesquels la page ne reçoit aucune annonce
  // Nombre d'annonces selon la longueur du texte : 1 sous 2 000 caractères, 2 sous 3 500, 3 au-delà
  function maxAnnonces(texte) {
    return texte < 2000 ? 1 : texte < 3500 ? 2 : 3;
  }
  var STYLE_ID = "lc-pub-style";
  // ?lc_pub_test=1 : annonces de test (data-adtest), emplacements posés même sans bloc configuré
  var testAnnonces = /[?&]lc_pub_test=1\b/.test(window.location.search);

  function ajouterStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".lc-pub{margin:48px auto 40px;max-width:970px;text-align:center;clear:both}" +
      ".lc-pub[hidden]{display:none}" +
      ".lc-pub-libelle{display:block;font:500 11px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:6px}" +
      ".lc-pub ins.adsbygoogle{display:block;min-height:250px}" +
      ".lc-pub ins.adsbygoogle[data-ad-status=unfilled]{display:none!important}" +
      ".lc-pub:has(ins[data-ad-status=unfilled]){display:none}";
    document.head.appendChild(style);
  }

  function dans(el, selecteur) {
    return !!(el.closest && el.closest(selecteur));
  }

  function enColonnes(el) {
    var s = window.getComputedStyle(el);
    if (/grid/.test(s.display)) return s.gridTemplateColumns.split(" ").length > 1;
    return /flex/.test(s.display) && !/column/.test(s.flexDirection);
  }

  // Bloc de section d'un titre : l'ancêtre le plus haut sous <main> qui ne contient que ce titre-là.
  function blocDe(titre, main) {
    var bloc = titre;
    while (bloc.parentElement && bloc.parentElement !== main && bloc.parentElement.querySelectorAll("h2").length === 1) {
      bloc = bloc.parentElement;
    }
    // Section posée dans une grille ou une rangée de cartes : l'annonce va avant la grille entière.
    while (bloc.parentElement && bloc.parentElement !== main && enColonnes(bloc.parentElement)) {
      bloc = bloc.parentElement;
    }
    return bloc;
  }

  function titresDeContenu(main, simulateur) {
    var tous = main.querySelectorAll("h2");
    var liste = [];
    for (var i = 0; i < tous.length; i++) {
      var h = tous[i];
      if (dans(h, "header, nav, aside, footer, [data-barre-question], details, .lc-pub")) continue;
      if (simulateur && (simulateur === h || simulateur.contains(h))) continue;
      if (!h.textContent.trim() || h.offsetParent === null) continue;
      liste.push(h);
    }
    return liste;
  }

  function apres(a, b) {
    return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  function creerEmplacement(nom) {
    var div = document.createElement("div");
    div.className = "lc-pub";
    div.setAttribute("data-lc-pub", nom);
    div.setAttribute("aria-label", "Publicité");
    div.hidden = true;
    var libelle = document.createElement("span");
    libelle.className = "lc-pub-libelle";
    libelle.textContent = "Publicité";
    div.appendChild(libelle);
    return div;
  }

  // Le bloc <ins> n'est ajouté qu'au moment de la demande : adsbygoogle.push() remplit
  // le premier <ins> vide de la page, quel qu'il soit.
  function creerAnnonce(nom) {
    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.setAttribute("data-ad-client", CLIENT);
    ins.setAttribute("data-ad-slot", BLOCS[nom] || "0");
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");
    if (testAnnonces) ins.setAttribute("data-adtest", "on");
    return ins;
  }

  // Demande l'annonce quand l'emplacement approche de l'écran.
  function activer(div) {
    if (div.getAttribute("data-lc-pub-actif")) return;
    div.setAttribute("data-lc-pub-actif", "1");
    div.hidden = false;
    var demander = function () {
      if (div.getAttribute("data-lc-pub-demande")) return;
      div.setAttribute("data-lc-pub-demande", "1");
      div.appendChild(creerAnnonce(div.getAttribute("data-lc-pub")));
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_e) {}
    };
    if (!("IntersectionObserver" in window)) return demander();
    var obs = new IntersectionObserver(
      function (entrees) {
        for (var i = 0; i < entrees.length; i++) {
          if (entrees[i].isIntersecting) {
            obs.disconnect();
            demander();
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    obs.observe(div);
  }

  // Après le simulateur : seulement une fois un calcul lancé (clic dans le simulateur,
  // ou page ouverte avec des paramètres qui lancent le calcul).
  function activerApresCalcul(div, simulateur) {
    var lance = false;
    var declencher = function () {
      if (lance) return;
      lance = true;
      window.setTimeout(function () {
        activer(div);
      }, 800);
    };
    if (window.location.search.replace(/[?&]lc_pub_test=1\b/, "").length > 1) declencher();
    simulateur.addEventListener(
      "click",
      function (e) {
        if (e.target && e.target.closest && e.target.closest('button, input[type="submit"]')) declencher();
      },
      true,
    );
    simulateur.addEventListener("submit", declencher, true);
  }

  function placer() {
    if (PAGES_EXCLUES.test(window.location.pathname)) return;
    // Zone de contenu : <main>, sinon l'article (anciennes pages de blog), sinon la page
    var main = document.querySelector("main") || document.querySelector("article") || document.body;
    if (!main || main.querySelector(".lc-pub")) return;
    var texte = (main.textContent || "").replace(/\s+/g, " ").length;
    if (texte < TEXTE_MIN) return;
    var max = maxAnnonces(texte);

    var simulateur = null;
    var candidats = main.querySelectorAll(SIMULATEURS);
    for (var c = 0; c < candidats.length; c++) {
      if (!dans(candidats[c], "[data-barre-question]")) {
        simulateur = candidats[c];
        break;
      }
    }

    var titres = titresDeContenu(main, simulateur);
    var places = []; // index de titre devant lequel une annonce est posée
    var poser = function (nom, index) {
      if ((!BLOCS[nom] && !testAnnonces) || places.length >= max || index < 0 || index >= titres.length) return null;
      for (var p = 0; p < places.length; p++) {
        if (Math.abs(places[p] - index) < ECART_MIN) return null;
      }
      var bloc = blocDe(titres[index], main);
      var div = creerEmplacement(nom);
      bloc.parentNode.insertBefore(div, bloc);
      places.push(index);
      return div;
    };

    // 1. Après le simulateur : devant la première section qui le suit.
    //    Sans simulateur : après l'introduction, devant la deuxième section.
    var debut = 1;
    if (simulateur) {
      debut = -1;
      for (var i = 0; i < titres.length; i++) {
        if (apres(simulateur, titres[i])) {
          debut = i;
          break;
        }
      }
    }
    var premier = poser("apres-simulateur", debut);
    if (premier) {
      if (simulateur) activerApresCalcul(premier, simulateur);
      else activer(premier);
    }

    // 2. Avant la FAQ (le dernier titre « Questions fréquentes »).
    var faq = -1;
    for (var f = titres.length - 1; f >= 0; f--) {
      if (TITRE_FAQ.test(titres[f].textContent.trim())) {
        faq = f;
        break;
      }
    }
    var avantFaq = faq > 0 ? poser("avant-faq", faq) : null;
    if (avantFaq) activer(avantFaq);

    // 3. Au milieu du texte, entre les deux précédentes.
    var de = premier ? debut : 0;
    var a = avantFaq ? faq : titres.length;
    var milieu = poser("milieu-texte", Math.round((de + a) / 2));
    if (milieu) activer(milieu);
  }

  function demarrer() {
    ajouterStyle();
    // Laisse le temps aux simulateurs rendus en JavaScript de se monter.
    window.setTimeout(placer, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer, { once: true });
  } else {
    demarrer();
  }
})();
