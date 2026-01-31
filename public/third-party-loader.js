(function () {
  if (window.__lcThirdPartyLoaded) return;
  window.__lcThirdPartyLoaded = true;

  var ADSENSE_CLIENT_ID = "ca-pub-2209781252231399";
  var GTM_ID = "GTM-TPFZCGX5";

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

  function isMobileLike() {
    try {
      if (
        navigator.userAgentData &&
        typeof navigator.userAgentData.mobile === "boolean"
      ) {
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

  function loadAdsense() {
    if (alreadyHasScript("pagead/js/adsbygoogle.js")) return;
    addLink("dns-prefetch", "https://pagead2.googlesyndication.com");
    addLink("preconnect", "https://pagead2.googlesyndication.com", "anonymous");
    addScript(
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
        encodeURIComponent(ADSENSE_CLIENT_ID),
      { crossorigin: "anonymous" }
    );
  }

  function loadGTM() {
    if (alreadyHasScript("googletagmanager.com/gtm.js")) return;
    addLink("dns-prefetch", "https://www.googletagmanager.com");
    addLink("preconnect", "https://www.googletagmanager.com");
    addLink("dns-prefetch", "https://fundingchoicesmessages.google.com");
    addLink("preconnect", "https://fundingchoicesmessages.google.com");

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    addScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID));
  }

  function loadThirdParty() {
    loadAdsense();
    loadGTM();
  }

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

  function fallbackLoad() {
    if (interactionTriggered) return;
    scheduleIdleLoad();
  }

  window.setTimeout(fallbackLoad, 8000);
})();
