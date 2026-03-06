(function () {
  if (window.__lcThirdPartyLoaded) return;
  window.__lcThirdPartyLoaded = true;

  var ADSENSE_CLIENT_ID = "ca-pub-2209781252231399";
  var ADSENSE_PUB_ID = "2209781252231399";
  var GTM_ID = "GTM-TPFZCGX5";
  var GA4_ID = "G-2HNTGCYQ1X";
  var CONSENT_STORAGE_KEY = "lc_cookie_consent_v1";

  var BANNER_ID = "lc-consent-banner";
  var MODAL_ID = "lc-consent-modal";
  var STYLE_ID = "lc-consent-style";

  function ensureDataLayerAndGtagStub() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
  }

  function applyConsentModeDefaults() {
    ensureDataLayerAndGtagStub();
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 2000
    });
  }

  function alreadyHasScript(srcIncludes) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf(srcIncludes) !== -1) return true;
    }
    return false;
  }

  function addLink(rel, href, crossOrigin) {
    var link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
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

  function loadGA4() {
    if (!GA4_ID || alreadyHasScript("googletagmanager.com/gtag/js")) return;
    addLink("dns-prefetch", "https://www.googletagmanager.com");
    addLink("preconnect", "https://www.googletagmanager.com");

    ensureDataLayerAndGtagStub();
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID));
  }

  function loadGTM() {
    if (!GTM_ID || alreadyHasScript("googletagmanager.com/gtm.js")) return;
    addLink("dns-prefetch", "https://www.googletagmanager.com");
    addLink("preconnect", "https://www.googletagmanager.com");

    ensureDataLayerAndGtagStub();
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    addScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID));
  }

  function setAdsPersonalization(adsGranted) {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = adsGranted ? 0 : 1;
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

  function getStoredConsentState() {
    try {
      var raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;

      if (raw === "accepted") return { essential: true, analytics: true, ads: true, source: "legacy" };
      if (raw === "rejected" || raw === "essential") {
        return { essential: true, analytics: false, ads: false, source: "legacy" };
      }

      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.status) return null;

      if (parsed.status === "accepted") {
        return { essential: true, analytics: true, ads: true, source: parsed.source || "stored" };
      }
      if (parsed.status === "rejected" || parsed.status === "essential") {
        return { essential: true, analytics: false, ads: false, source: parsed.source || "stored" };
      }
      if (parsed.status === "custom") {
        return {
          essential: true,
          analytics: parsed.analytics === true,
          ads: parsed.ads === true,
          source: parsed.source || "stored"
        };
      }
    } catch (_e) {}
    return null;
  }

  function persistConsentState(state, source) {
    var payload = {
      status: "custom",
      essential: true,
      analytics: !!state.analytics,
      ads: !!state.ads,
      source: source || "banner",
      updatedAt: new Date().toISOString()
    };

    if (state.analytics && state.ads) payload.status = "accepted";
    if (!state.analytics && !state.ads) payload.status = "rejected";

    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch (_e) {}
  }

  function applyConsentState(state) {
    ensureDataLayerAndGtagStub();

    window.gtag("consent", "update", {
      analytics_storage: state.analytics ? "granted" : "denied",
      ad_storage: state.ads ? "granted" : "denied",
      ad_user_data: state.ads ? "granted" : "denied",
      ad_personalization: state.ads ? "granted" : "denied"
    });
    window.gtag("set", "allow_google_signals", !!state.analytics && !!state.ads);
    window.gtag("set", "allow_ad_personalization_signals", !!state.ads);

    setAdsPersonalization(!!state.ads);

    // Keep GA4 loaded for cookieless pings (modeled measurement).
    loadGA4();

    // Ads can load in both modes; non personalized ads are used when denied.
    loadFundingChoices();
    loadAdsense();

    // Keep GTM only when analytics consent is granted.
    if (state.analytics) loadGTM();
  }

  function hideBanner() {
    var banner = document.getElementById(BANNER_ID);
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }

  function hideModal() {
    var modal = document.getElementById(MODAL_ID);
    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
  }

  function ensureConsentUIStyle() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "#" + BANNER_ID + "{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;background:#111827;color:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.35);padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
      "#" + BANNER_ID + " .lc-title{font-size:16px;font-weight:700;margin:0 0 8px}" +
      "#" + BANNER_ID + " .lc-copy{font-size:14px;line-height:1.45;color:#e5e7eb;margin:0 0 14px}" +
      "#" + BANNER_ID + " .lc-actions{display:flex;gap:8px;flex-wrap:wrap}" +
      "#" + BANNER_ID + " button{border:0;border-radius:10px;padding:10px 12px;font-size:13px;font-weight:600;cursor:pointer}" +
      "#" + BANNER_ID + " .lc-accept{background:#059669;color:#fff;flex:1}" +
      "#" + BANNER_ID + " .lc-reject{background:#374151;color:#fff;flex:1}" +
      "#" + BANNER_ID + " .lc-custom{background:transparent;color:#9ca3af;border:1px solid #4b5563}" +
      "#" + MODAL_ID + "{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
      "#" + MODAL_ID + " .lc-content{background:#111827;color:#fff;border-radius:16px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,.5)}" +
      "#" + MODAL_ID + " .lc-header{padding:24px 24px 0}" +
      "#" + MODAL_ID + " .lc-body{padding:16px 24px}" +
      "#" + MODAL_ID + " .lc-row{padding:12px 0;border-bottom:1px solid #374151;display:flex;align-items:center;justify-content:space-between}" +
      "#" + MODAL_ID + " .lc-row:last-child{border-bottom:none}" +
      "#" + MODAL_ID + " .lc-desc{font-size:12px;color:#9ca3af;margin-top:4px;line-height:1.4}" +
      "#" + MODAL_ID + " .lc-footer{padding:16px 24px 24px;display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #374151}" +
      "#" + MODAL_ID + " .lc-primary{background:#059669;color:#fff;border:0;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer}" +
      "#" + MODAL_ID + " .lc-secondary{background:#374151;color:#fff;border:0;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer}" +
      "#" + MODAL_ID + " .lc-link{background:transparent;color:#9ca3af;border:0;padding:10px 14px;font-size:14px;cursor:pointer;text-decoration:underline}" +
      "@media (min-width:768px){#" + BANNER_ID + "{max-width:760px;right:auto}}";

    document.head.appendChild(style);
  }

  function openCustomizeModal() {
    if (document.getElementById(MODAL_ID)) return;
    ensureConsentUIStyle();

    var current = getStoredConsentState() || { essential: true, analytics: false, ads: false };

    var modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML =
      '<div class="lc-content">' +
      '<div class="lc-header"><h2>Personnaliser les cookies</h2></div>' +
      '<div class="lc-body">' +
      '<div class="lc-row"><div><strong>Cookies essentiels</strong><div class="lc-desc">Necessaires au fonctionnement du site.</div></div><input type="checkbox" checked disabled></div>' +
      '<div class="lc-row"><div><strong>Mesure d\'audience</strong><div class="lc-desc">Mesure Analytics, y compris en mode anonymise si refuse.</div></div><input id="lc-modal-analytics" type="checkbox" ' + (current.analytics ? "checked" : "") + '></div>' +
      '<div class="lc-row"><div><strong>Publicite</strong><div class="lc-desc">Publicites personnalisees si acceptees, non personnalisees sinon.</div></div><input id="lc-modal-ads" type="checkbox" ' + (current.ads ? "checked" : "") + '></div>' +
      '</div>' +
      '<div class="lc-footer">' +
      '<button class="lc-link" data-action="close" type="button">Fermer</button>' +
      '<button class="lc-secondary" data-action="save" type="button">Enregistrer</button>' +
      '<button class="lc-primary" data-action="accept" type="button">Tout accepter</button>' +
      '</div>' +
      '</div>';

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        hideModal();
        return;
      }

      var btn = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
      if (!btn) return;
      var action = btn.getAttribute("data-action");

      if (action === "close") {
        hideModal();
        return;
      }

      if (action === "accept") {
        var accepted = { essential: true, analytics: true, ads: true };
        persistConsentState(accepted, "customize-modal");
        applyConsentState(accepted);
        hideModal();
        hideBanner();
        return;
      }

      if (action === "save") {
        var analytics = !!modal.querySelector("#lc-modal-analytics").checked;
        var ads = !!modal.querySelector("#lc-modal-ads").checked;
        var custom = { essential: true, analytics: analytics, ads: ads };
        persistConsentState(custom, "customize-modal");
        applyConsentState(custom);
        hideModal();
        hideBanner();
      }
    });

    document.body.appendChild(modal);
  }

  function showConsentBanner() {
    if (document.getElementById(BANNER_ID)) return;
    if (getStoredConsentState()) return;

    ensureConsentUIStyle();

    var banner = document.createElement("section");
    banner.id = BANNER_ID;
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");

    banner.innerHTML =
      '<p class="lc-title">Gestion des cookies</p>' +
      '<p class="lc-copy">LesCalculateurs utilise des cookies essentiels pour fonctionner correctement, ainsi que des cookies d\'analyse et publicitaires pour améliorer le service et le maintenir gratuit. Si vous refusez, la mesure reste anonymisee (Consent Mode) et les pubs deviennent non personnalisees.</p>' +
      '<div class="lc-actions">' +
      '<button type="button" class="lc-accept" data-consent="accept">Accepter tout</button>' +
      '<button type="button" class="lc-reject" data-consent="reject">Refuser</button>' +
      '<button type="button" class="lc-custom" data-consent="custom">Personnaliser</button>' +
      '</div>';

    banner.addEventListener("click", function (event) {
      var btn = event.target && event.target.closest ? event.target.closest("button[data-consent]") : null;
      if (!btn) return;

      var action = btn.getAttribute("data-consent");

      if (action === "accept") {
        var accepted = { essential: true, analytics: true, ads: true };
        persistConsentState(accepted, "banner");
        applyConsentState(accepted);
        hideBanner();
        return;
      }

      if (action === "reject") {
        var rejected = { essential: true, analytics: false, ads: false };
        persistConsentState(rejected, "banner");
        applyConsentState(rejected);
        hideBanner();
        return;
      }

      if (action === "custom") {
        openCustomizeModal();
      }
    });

    document.body.appendChild(banner);
  }

  function applyStoredConsentOnLoad() {
    var stored = getStoredConsentState();
    if (!stored) return;
    applyConsentState(stored);
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

  window.lcOpenCookiePreferences = function () {
    openCustomizeModal();
  };

  window.lcResetCookiePreferences = function () {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch (_e) {}
    applyConsentState({ essential: true, analytics: false, ads: false });
    hideModal();
    showConsentBanner();
  };

  window.lcEnsureCookieBanner = function () {
    showConsentBanner();
  };

  ensureGlobalFavicons();
  applyConsentModeDefaults();

  // Load GA4 and AdSense in cookieless mode first, then update once user chooses.
  setAdsPersonalization(false);
  loadGA4();
  loadFundingChoices();
  loadAdsense();

  applyStoredConsentOnLoad();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        showConsentBanner();
      },
      { once: true }
    );
  } else {
    showConsentBanner();
  }
})();
