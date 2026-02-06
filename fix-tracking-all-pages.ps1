# Script pour ajouter les codes de tracking sur toutes les pages HTML
$folders = @("content_SAFE", "pages_YMYL_SAFE")

# Codes à insérer
$adsenseScript = @"
    <!-- Google AdSense -->
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399"
      crossorigin="anonymous"
    ></script>
"@

$gtmScript = @"

    <!-- Google Tag Manager -->
    <script>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "GTM-TPFZCGX5");
    </script>
    <!-- End Google Tag Manager -->
"@

$ga4Script = @"

    <!-- Google tag (gtag.js) -->
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-2HNTGCYQ1X"
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());

      gtag("config", "G-2HNTGCYQ1X");
    </script>
"@

$gtmNoScript = @"
    <!-- Google Tag Manager (noscript) -->
    <noscript
      ><iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-TPFZCGX5"
        height="0"
        width="0"
        style="display: none; visibility: hidden"
      ></iframe
    ></noscript>
    <!-- End Google Tag Manager (noscript) -->

"@

$fixedCount = 0

foreach ($folder in $folders) {
    Write-Host "`nTraitement du dossier: $folder" -ForegroundColor Cyan
    
    $pages = Get-ChildItem -Path $folder -Filter "*.html"
    
    foreach ($page in $pages) {
        $content = Get-Content $page.FullName -Raw
        $originalContent = $content
        $modified = $false
        
        # Vérifier si la page a déjà les scripts
        $hasAdSense = $content -match "adsbygoogle\.js"
        $hasGTM = $content -match "GTM-TPFZCGX5"
        $hasGA4 = $content -match "G-2HNTGCYQ1X"
        $hasNoScript = $content -match "googletagmanager\.com/ns\.html"
        
        # Ajouter AdSense après la meta google-adsense-account
        if (-not $hasAdSense -and $content -match '<meta name="google-adsense-account"') {
            $content = $content -replace '(<meta name="google-adsense-account"[^>]*>)', "`$1`n$adsenseScript"
            $modified = $true
        }
        
        # Ajouter GTM après le commentaire SEO & Social ou après AdSense
        if (-not $hasGTM) {
            if ($content -match '<!-- Google AdSense -->') {
                $content = $content -replace '(<!-- Google AdSense -->[\s\S]*?</script>)', "`$1$gtmScript"
            } elseif ($content -match '<meta name="google-adsense-account"') {
                $content = $content -replace '(<meta name="google-adsense-account"[^>]*>)', "`$1`n$adsenseScript$gtmScript"
            }
            $modified = $true
        }
        
        # Ajouter GA4 après GTM
        if (-not $hasGA4 -and $content -match 'GTM-TPFZCGX5') {
            $content = $content -replace '(<!-- End Google Tag Manager -->)', "`$1$ga4Script"
            $modified = $true
        }
        
        # Ajouter le noscript après <body>
        if (-not $hasNoScript -and $content -match '<body[^>]*>') {
            $content = $content -replace '(<body[^>]*>)', "`$1`n$gtmNoScript"
            $modified = $true
        }
        
        # Sauvegarder si modifié
        if ($modified -and $content -ne $originalContent) {
            Set-Content -Path $page.FullName -Value $content -Encoding UTF8
            Write-Host "  ✅ Corrigé: $($page.Name)" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "  ⏭️  Ignoré: $($page.Name) (déjà à jour ou structure différente)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Total de pages corrigées: $fixedCount" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
