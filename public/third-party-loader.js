(function () {
  if (window.__lcThirdPartyLoaded) return;
  window.__lcThirdPartyLoaded = true;

  var ADSENSE_CLIENT_ID = "ca-pub-2209781252231399";
  var ADSENSE_PUB_ID = "2209781252231399";
  var GTM_ID = "GTM-TPFZCGX5";
  var GA4_ID = "G-2HNTGCYQ1X";

  function alreadyHasScript(srcIncludes) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf(srcIncludes) !== -1) return true;
    }
    return false;
  }

  function addLink(rel, href, crossOrigin) {
    try {
      var link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
    } catch (_e) {}
  }

  function addScript(src, attrs) {
    var script = document.createElement("script");
    script.async = true;
    script.src = src;
    if (attrs) {
      for (var key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key)) {
          script.setAttribute(key, attrs[key]);
        }
      }
    }
    document.head.appendChild(script);
  }

  function ensureGlobalFavicons() {
    try {
      var existingIcon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
      if (existingIcon) return;

      var icons = [
        { rel: "apple-touch-icon", href: "/assets/apple-touch-icon.png", sizes: "180x180" },
        { rel: "icon", href: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { rel: "icon", href: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { rel: "manifest", href: "/assets/site.webmanifest" },
        { rel: "shortcut icon", href: "/assets/favicon.ico" }
      ];

      for (var i = 0; i < icons.length; i++) {
        var link = document.createElement("link");
        link.rel = icons[i].rel;
        link.href = icons[i].href;
        if (icons[i].sizes) link.sizes = icons[i].sizes;
        if (icons[i].type) link.type = icons[i].type;
        document.head.appendChild(link);
      }
    } catch (_e) {}
  }

  function normalizeBrandLockups() {
    try {
      var selectors = [
        'a[href="/"]',
        'a[href="/index.html"]',
        'a[href="./index.html"]',
        'a[href="../index.html"]',
        'a[href="index.html"]'
      ].join(", ");
      var links = document.querySelectorAll(selectors);

      for (var i = 0; i < links.length; i++) {
        var anchor = links[i];
        var text = (anchor.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
        var isBrandText = text.indexOf("les calculateurs") !== -1 || text.indexOf("lescalculateurs") !== -1;

        if (!isBrandText) continue;
        if (anchor.querySelector('img[src*="lescalculateurs-new-logo.png"]')) continue;

        anchor.classList.add("inline-flex", "items-center", "gap-2", "font-bold", "text-gray-900");
        anchor.innerHTML =
          '<img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs.fr" class="h-8 w-auto" loading="eager" decoding="async"><span class="whitespace-nowrap">Les Calculateurs</span>';
      }
    } catch (_e) {}
  }

  function isMobileLike() {
    try {
      if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
        return navigator.userAgentData.mobile;
      }
    } catch (_e) {}

    try {
      if (window.matchMedia) return window.matchMedia("(max-width: 768px)").matches;
    } catch (_e2) {}

    return false;
  }

  function isConstrainedNetwork() {
    try {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!conn) return false;
      if (conn.saveData) return true;
      var type = conn.effectiveType || "";
      return type.indexOf("2g") !== -1 || type === "slow-2g";
    } catch (_e) {
      return false;
    }
  }

  function ensureDataLayerAndGtagStub() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
  }

  function applyConsentModeDefaults() {
    try {
      ensureDataLayerAndGtagStub();
      window.gtag("consent", "default", {
        ad_storage: "denied",
        analytics_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 2000
      });
    } catch (_e) {}
  }

  function applyLegacyConsentIfAny() {
    try {
      var raw = window.localStorage.getItem("lc_cookie_consent_v1");
      if (!raw) return;

      var status = null;
      if (raw === "accepted") {
        status = "accepted";
      } else {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.status === "accepted") status = "accepted";
      }

      if (status !== "accepted") return;

      ensureDataLayerAndGtagStub();
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted"
      });
    } catch (_e) {}
  }

  function loadFundingChoices() {
    if (alreadyHasScript("fundingchoicesmessages.google.com/i/pub-")) return;
    addLink("dns-prefetch", "https://fundingchoicesmessages.google.com");
    addLink("preconnect", "https://fundingchoicesmessages.google.com");
    addScript("https://fundingchoicesmessages.google.com/i/pub-" + ADSENSE_PUB_ID + "?ers=1");
  }

  function loadAdsense() {
    if (alreadyHasScript("pagead/js/adsbygoogle.js")) return;
    addLink("dns-prefetch", "https://pagead2.googlesyndication.com");
    addLink("preconnect", "https://pagead2.googlesyndication.com", "anonymous");
    addScript(
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ADSENSE_CLIENT_ID),
      { crossorigin: "anonymous" }
    );
  }

  function loadGTM() {
    if (alreadyHasScript("googletagmanager.com/gtm.js")) return;
    addLink("dns-prefetch", "https://www.googletagmanager.com");
    addLink("preconnect", "https://www.googletagmanager.com");

    ensureDataLayerAndGtagStub();
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    addScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID));
  }

  function loadGA4() {
    if (!GA4_ID) return;
    if (alreadyHasScript("googletagmanager.com/gtag/js")) return;
    addLink("dns-prefetch", "https://www.googletagmanager.com");
    addLink("preconnect", "https://www.googletagmanager.com");

    ensureDataLayerAndGtagStub();
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);

    addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID));
  }

  function loadThirdParty() {
    loadFundingChoices();
    loadAdsense();
    loadGTM();
    loadGA4();
  }

  function scheduleThirdPartyLoad() {
    var deferOnMobile = isMobileLike() || isConstrainedNetwork();

    function scheduleIdleLoad() {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadThirdParty, { timeout: 3000 });
        return;
      }
      window.setTimeout(loadThirdParty, 1500);
    }

    if (!deferOnMobile) {
      scheduleIdleLoad();
      return;
    }

    var interactionTriggered = false;

    function onFirstInteraction() {
      if (interactionTriggered) return;
      interactionTriggered = true;
      removeInteractionListeners();
      scheduleIdleLoad();
    }

    function removeInteractionListeners() {
      window.removeEventListener("pointerdown", onFirstInteraction, true);
      window.removeEventListener("touchstart", onFirstInteraction, true);
      window.removeEventListener("keydown", onFirstInteraction, true);
      window.removeEventListener("scroll", onFirstInteraction, true);
    }

    window.addEventListener("pointerdown", onFirstInteraction, true);
    window.addEventListener("touchstart", onFirstInteraction, true);
    window.addEventListener("keydown", onFirstInteraction, true);
    window.addEventListener("scroll", onFirstInteraction, true);

    window.setTimeout(function () {
      if (interactionTriggered) return;
      scheduleIdleLoad();
    }, 8000);
  }

  window.lcOpenCookiePreferences = function () {
    try {
      if (window.googlefc && typeof window.googlefc.showRevocationMessage === "function") {
        window.googlefc.showRevocationMessage();
      }
    } catch (_e) {}
  };

  window.lcResetCookiePreferences = function () {
    try {
      window.localStorage.removeItem("lc_cookie_consent_v1");
    } catch (_e) {}
    window.lcOpenCookiePreferences();
  };

  ensureGlobalFavicons();
  applyConsentModeDefaults();
  applyLegacyConsentIfAny();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        normalizeBrandLockups();
        scheduleThirdPartyLoad();
      },
      { once: true }
    );
  } else {
    normalizeBrandLockups();
    scheduleThirdPartyLoad();
  }
})();