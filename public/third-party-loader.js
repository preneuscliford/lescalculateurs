(function () {
  if (window.__lcThirdPartyLoaded) return;
  window.__lcThirdPartyLoaded = true;

  var ADSENSE_CLIENT_ID = "ca-pub-2209781252231399";
  var ADSENSE_PUB_ID = "2209781252231399";
  var GTM_ID = "GTM-TPFZCGX5";
  var GA4_ID = "G-2HNTGCYQ1X";
  var CONSENT_STORAGE_KEY = "lc_cookie_consent_v1";
  var CONSENT_BANNER_ID = "lc-consent-banner";
  var CONSENT_STYLE_ID = "lc-consent-style";
  var CONSENT_MODAL_ID = "lc-consent-modal";
  var CONSENT_MODAL_STYLE_ID = "lc-consent-modal-style";

  function getStoredConsentStatus() {
    try {
      var raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;
      if (raw === "accepted") return "accepted";
      if (raw === "rejected") return "rejected";
      if (raw === "essential") return "essential";

      var parsed = JSON.parse(raw);
      if (parsed && parsed.status) {
        return parsed.status;
      }
    } catch (_e) {}

    return null;
  }

  function getStoredConsentPreferences() {
    try {
      var raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;

      var parsed = JSON.parse(raw);
      if (parsed && parsed.status === "custom") {
        return {
          essential: true,
          analytics: parsed.analytics === true,
          ads: parsed.ads === true
        };
      }
      if (parsed && parsed.status === "accepted") {
        return { essential: true, analytics: true, ads: true };
      }
      if (parsed && parsed.status === "essential") {
        return { essential: true, analytics: false, ads: false };
      }
      if (parsed && parsed.status === "rejected") {
        return { essential: true, analytics: false, ads: false };
      }
    } catch (_e) {}

    return null;
  }

  function persistConsentStatus(status, source) {
    try {
      window.localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ status: status, source: source || "fallback-banner", updatedAt: new Date().toISOString() })
      );
    } catch (_e) {}
  }

  function hideFallbackConsentBanner() {
    var banner = document.getElementById(CONSENT_BANNER_ID);
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }

  function hideConsentModal() {
    var modal = document.getElementById(CONSENT_MODAL_ID);
    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
  }

  function showCustomizeModal() {
    if (document.getElementById(CONSENT_MODAL_ID)) return;
    
    var prefs = getStoredConsentPreferences() || { essential: true, analytics: false, ads: false };
    
    var modal = document.createElement("div");
    modal.id = CONSENT_MODAL_ID;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "lc-modal-title");
    
    modal.innerHTML = 
      '<div class="lc-modal-content">' +
        '<div class="lc-modal-header">' +
          '<h2 id="lc-modal-title">Personnaliser les cookies</h2>' +
        '</div>' +
        '<div class="lc-modal-body">' +
          '<div class="lc-cookie-category">' +
            '<div class="lc-category-header">' +
              '<span class="lc-category-title">Cookies essentiels</span>' +
              '<label class="lc-toggle">' +
                '<input type="checkbox" checked disabled data-category="essential">' +
                '<span class="lc-toggle-slider"></span>' +
              '</label>' +
            '</div>' +
            '<p class="lc-category-desc">Necessaires au fonctionnement du site (securite, navigation, preferences de base). Ne peuvent pas etre desactives.</p>' +
          '</div>' +
          '<div class="lc-cookie-category">' +
            '<div class="lc-category-header">' +
              '<span class="lc-category-title">Cookies analytiques</span>' +
              '<label class="lc-toggle">' +
                '<input type="checkbox" ' + (prefs.analytics ? "checked" : "") + ' data-category="analytics">' +
                '<span class="lc-toggle-slider"></span>' +
              '</label>' +
            '</div>' +
            '<p class="lc-category-desc">Nous aident a comprendre comment vous utilisez le site pour ameliorer (Google Analytics).</p>' +
          '</div>' +
          '<div class="lc-cookie-category">' +
            '<div class="lc-category-header">' +
              '<span class="lc-category-title">Cookies publicitaires</span>' +
              '<label class="lc-toggle">' +
                '<input type="checkbox" ' + (prefs.ads ? "checked" : "") + ' data-category="ads">' +
                '<span class="lc-toggle-slider"></span>' +
              '</label>' +
            '</div>' +
            '<p class="lc-category-desc">Permettent d afficher des publicites pertinentes et de mesurer leur performance (Google AdSense).</p>' +
          '</div>' +
        '</div>' +
        '<div class="lc-modal-footer">' +
          '<button type="button" class="lc-btn-text" data-action="close">Fermer</button>' +
          '<button type="button" class="lc-btn-secondary" data-action="save">Enregistrer mes choix</button>' +
          '<button type="button" class="lc-btn-primary" data-action="accept-all">Tout accepter</button>' +
        '</div>' +
      '</div>';
    
    modal.addEventListener("click", function(event) {
      var target = event.target;
      if (target === modal) {
        hideConsentModal();
        return;
      }
      var actionBtn = target.closest("[data-action]");
      if (!actionBtn) return;
      var action = actionBtn.getAttribute("data-action");
      if (action === "close") {
        hideConsentModal();
      } else if (action === "accept-all") {
        persistConsentStatus("accepted", "customize-modal");
        updateConsentMode(true);
        hideConsentModal();
        hideFallbackConsentBanner();
      } else if (action === "save") {
        var analyticsChecked = modal.querySelector('[data-category="analytics"]').checked;
        var adsChecked = modal.querySelector('[data-category="ads"]').checked;
        try {
          window.localStorage.setItem(
            CONSENT_STORAGE_KEY,
            JSON.stringify({
              status: "custom",
              essential: true,
              analytics: analyticsChecked,
              ads: adsChecked,
              source: "customize-modal",
              updatedAt: new Date().toISOString()
            })
          );
        } catch (_e) {}
        updateConsentModeCustom(analyticsChecked, adsChecked);
        hideConsentModal();
        hideFallbackConsentBanner();
      }
    });
    
    document.body.appendChild(modal);
  }

  function updateConsentModeCustom(analytics, ads) {
    ensureDataLayerAndGtagStub();
    window.gtag("consent", "update", {
      ad_storage: ads ? "granted" : "denied",
      analytics_storage: analytics ? "granted" : "denied",
      ad_user_data: ads ? "granted" : "denied",
      ad_personalization: ads ? "granted" : "denied"
    });
    if (analytics) {
      loadGA4();
      loadGTM();
    }
    if (ads) {
      loadFundingChoices();
      loadAdsense();
    }
    console.log("[LC] Consentement personnalise applique - Analytics:", analytics, "Ads:", ads);
  }

  function ensureFallbackConsentStyle() {
    if (document.getElementById(CONSENT_STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = CONSENT_STYLE_ID;
    style.textContent =
      "#" +
      CONSENT_BANNER_ID +
      "{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;background:#111827;color:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.35);padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
      "#" +
      CONSENT_BANNER_ID +
      " .lc-consent-title{font-size:16px;font-weight:700;margin:0 0 8px}" +
      "#" +
      CONSENT_BANNER_ID +
      " .lc-consent-copy{font-size:14px;line-height:1.45;color:#e5e7eb;margin:0 0 14px}" +
      "#" +
      CONSENT_BANNER_ID +
      " .lc-consent-actions{display:flex;gap:8px;flex-wrap:wrap}" +
      "#" +
      CONSENT_BANNER_ID +
      " button{border:0;border-radius:10px;padding:10px 12px;font-size:13px;font-weight:600;cursor:pointer}" +
      "#" +
      CONSENT_BANNER_ID +
      " .lc-btn-essential{background:#374151;color:#fff;flex:1}" +
      "#" +
      CONSENT_BANNER_ID +
      " .lc-btn-accept{background:#059669;color:#fff;flex:1}" +
      "#" +
      CONSENT_BANNER_ID +
      " .lc-btn-customize{background:transparent;color:#9ca3af;border:1px solid #4b5563;font-size:12px;padding:8px 12px}" +
      "@media (min-width: 768px){#" + CONSENT_BANNER_ID + "{max-width:760px;right:auto}}" +
      "#" +
      CONSENT_MODAL_ID +
      "{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-modal-content{background:#111827;color:#fff;border-radius:16px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,.5)}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-modal-header{padding:24px 24px 0}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-modal-header h2{font-size:20px;font-weight:700;margin:0}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-modal-body{padding:16px 24px}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-modal-footer{padding:16px 24px 24px;display:flex;gap:12px;justify-content:flex-end;border-top:1px solid #374151}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-cookie-category{padding:16px 0;border-bottom:1px solid #374151}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-cookie-category:last-child{border-bottom:none}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-category-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-category-title{font-size:15px;font-weight:600}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-category-desc{font-size:13px;color:#9ca3af;line-height:1.5}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-toggle{position:relative;display:inline-block;width:48px;height:26px}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-toggle input{opacity:0;width:0;height:0}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-toggle-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#374151;border-radius:26px;transition:.3s}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-toggle-slider:before{position:absolute;content:'';height:20px;width:20px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-toggle input:checked+.lc-toggle-slider{background:#059669}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-toggle input:checked+.lc-toggle-slider:before{transform:translateX(22px)}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-toggle input:disabled+.lc-toggle-slider{opacity:.5;cursor:not-allowed}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-btn-primary{background:#059669;color:#fff;border:0;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-btn-secondary{background:#374151;color:#fff;border:0;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer}" +
      "#" +
      CONSENT_MODAL_ID +
      " .lc-btn-text{background:transparent;color:#9ca3af;border:0;padding:10px 16px;font-size:14px;cursor:pointer;text-decoration:underline}"; 
    document.head.appendChild(style);
  }

  function showFallbackConsentBanner() {
    if (document.getElementById(CONSENT_BANNER_ID)) return;
    if (getStoredConsentStatus()) return;

    ensureFallbackConsentStyle();

    var banner = document.createElement("section");
    banner.id = CONSENT_BANNER_ID;
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML =
      '<p class="lc-consent-title">Vos données, votre choix</p>' +
      '<p class="lc-consent-copy">LesCalculateurs utilise des cookies essentiels pour fonctionner correctement, ainsi que des cookies d\'analyse et publicitaires pour améliorer le service et le financer. Vous pouvez accepter uniquement l\'essentiel, tout accepter ou personnaliser vos préférences.</p>' +
      '<div class="lc-consent-actions">' +
      '<button type="button" class="lc-btn-essential" data-consent="essential">Accepter l\'essentiel</button>' +
      '<button type="button" class="lc-btn-accept" data-consent="accept">Accepter tout</button>' +
      '<button type="button" class="lc-btn-customize" data-consent="customize">Personnaliser</button>' +
      "</div>";

    banner.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button[data-consent]") : null;
      if (!button) return;

      var consentType = button.getAttribute("data-consent");
      
      if (consentType === "accept") {
        // Tout accepter : GA4 + AdSense + GTM activés
        persistConsentStatus("accepted", "fallback-banner");
        updateConsentMode(true);
        hideFallbackConsentBanner();
      } else if (consentType === "essential") {
        // Essentiel uniquement : pas de tracking
        persistConsentStatus("essential", "fallback-banner");
        updateConsentMode(false);
        hideFallbackConsentBanner();
      } else if (consentType === "customize") {
        // Ouvrir le modal de personnalisation
        showCustomizeModal();
      }
    });

    document.body.appendChild(banner);
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
      var raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return;

      var status = null;
      var source = "legacy";
      if (raw === "accepted" || raw === "essential") {
        status = raw;
      } else {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.status) {
          status = parsed.status;
          source = parsed.source || source;
        }
      }

      // Gerer les differents statuts de consentement
      if (status === "custom") {
        // Consentement personnalise - charger selon les preferences
        var prefs = getStoredConsentPreferences();
        if (prefs) {
          updateConsentModeCustom(prefs.analytics, prefs.ads);
        }
        return;
      }
      
      if (status !== "accepted") {
        if (status === "essential") {
          console.log("[LC] Consentement essentiel uniquement - pas de tracking charge");
        }
        return;
      }

      ensureDataLayerAndGtagStub();
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted"
      });
      
      // Consentement deja accepté, charger tous les scripts
      loadGA4();
      loadFundingChoices();
      loadAdsense();
      loadGTM();
    } catch (_e) {}
  }

  function updateConsentMode(granted) {
    try {
      ensureDataLayerAndGtagStub();
      window.gtag("consent", "update", {
        ad_storage: granted ? "granted" : "denied",
        analytics_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied"
      });
      
      // Si consentement accorde, charger tous les scripts maintenant
      if (granted) {
        console.log("[LC] Consentement accepte, chargement GA4/AdSense/GTM");
        loadGA4();
        loadFundingChoices();
        loadAdsense();
        loadGTM();
      }
    } catch (_e) {}
  }

  function applyTcfConsentIfAny() {
    var tries = 0;
    var maxTries = 40;

    function onTcfData(tcData) {
      try {
        if (!tcData || !tcData.purpose || !tcData.purpose.consents) return;

        // Conservative mapping for Consent Mode: require core ad purposes.
        var consents = tcData.purpose.consents;
        var hasP1 = !!consents["1"]; // store/access info on device
        var hasP3 = !!consents["3"]; // personalized ads profile
        var hasP4 = !!consents["4"]; // personalized ads selection
        var hasP7 = !!consents["7"]; // ad performance measurement
        var hasP10 = !!consents["10"]; // product improvement

        var adsGranted = hasP1 && hasP3 && hasP4;
        var analyticsGranted = hasP1 && (hasP7 || hasP10);
        var granted = adsGranted || analyticsGranted;

        ensureDataLayerAndGtagStub();
        window.gtag("consent", "update", {
          ad_storage: adsGranted ? "granted" : "denied",
          analytics_storage: analyticsGranted ? "granted" : "denied",
          ad_user_data: adsGranted ? "granted" : "denied",
          ad_personalization: adsGranted ? "granted" : "denied"
        });

        // Charger les scripts si consentement accordé
        if (granted) {
          loadGA4();
          loadFundingChoices();
          loadAdsense();
          loadGTM();
        }

        // Backward compatibility if old code checks this key.
        try {
          window.localStorage.setItem(
            CONSENT_STORAGE_KEY,
            JSON.stringify({ status: granted ? "accepted" : "rejected", source: "tcf" })
          );
        } catch (_e) {}
      } catch (_e) {}
    }

    function attachTcfListener() {
      if (typeof window.__tcfapi !== "function") {
        tries++;
        if (tries >= maxTries) return;
        window.setTimeout(attachTcfListener, 500);
        return;
      }

      try {
        window.__tcfapi("addEventListener", 2, function (tcData, success) {
          if (!success) return;
          if (!tcData) return;
          if (tcData.eventStatus === "tcloaded" || tcData.eventStatus === "useractioncomplete") {
            onTcfData(tcData);
          }
        });
      } catch (_e) {}
    }

    attachTcfListener();
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

  function loadThirdParty(requireConsent) {
    // Si consentement requis mais pas donne, on ne charge rien
    if (requireConsent) {
      var status = getStoredConsentStatus();
      var prefs = getStoredConsentPreferences();
      
      if (status === "custom" && prefs) {
        // Consentement personnalise - charger selon les preferences
        if (prefs.analytics) {
          loadGA4();
          loadGTM();
        }
        if (prefs.ads) {
          loadFundingChoices();
          loadAdsense();
        }
        return;
      }
      
      if (status !== "accepted") {
        console.log("[LC] Consentement requis pour charger GA4/AdSense/GTM");
        return;
      }
    }
    
    // Charger tous les scripts avec consentement
    loadGA4();
    loadFundingChoices();
    loadAdsense();
    loadGTM();
  }

  function scheduleThirdPartyLoad() {
    var deferOnMobile = isMobileLike() || isConstrainedNetwork();
    
    // Verifier si on a deja un consentement stocke
    var status = getStoredConsentStatus();
    var hasConsent = status === "accepted" || status === "custom" || status === "essential";
    var requireConsent = !hasConsent;

    function scheduleIdleLoad() {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(function() {
          loadThirdParty(requireConsent);
        }, { timeout: 3000 });
        return;
      }
      window.setTimeout(function() {
        loadThirdParty(requireConsent);
      }, 1500);
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
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch (_e) {}
    showFallbackConsentBanner();
    window.lcOpenCookiePreferences();
  };

  window.lcEnsureCookieBanner = function () {
    showFallbackConsentBanner();
  };

  ensureGlobalFavicons();
  applyConsentModeDefaults();
  applyLegacyConsentIfAny();
  applyTcfConsentIfAny();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        normalizeBrandLockups();
        showFallbackConsentBanner();
        scheduleThirdPartyLoad(); // Tous les scripts attendent consentement (RGPD)
      },
      { once: true }
    );
  } else {
    normalizeBrandLockups();
    showFallbackConsentBanner();
    scheduleThirdPartyLoad(); // GA4 charge immediatement, AdSense/GTM attendent consentement
  }
})();
