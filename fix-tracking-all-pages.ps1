# Liste des pages à corriger
$pages = @(
    "a-propos.html",
    "comment-calculer-plus-value.html",
    "apl-etudiant.html",
    "comment-calculer-frais-notaire.html",
    "pret.html",
    "charges.html",
    "blog.html",
    "plusvalue.html",
    "asf.html",
    "are.html",
    "notaire.html",
    "methodologie.html",
    "impot.html",
    "sources.html",
    "simulateurs.html",
    "salaire.html",
    "financement.html",
    "salaire-seo.html",
    "rsa.html",
    "crypto-bourse.html",
    "prime-activite.html",
    "aah.html"
)

foreach ($page in $pages) {
    $path = "pages_YMYL_SAFE/$page"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        
        # Pattern 1: Supprimer Google AdSense script
        $content = $content -replace '(?s)<!-- Google AdSense -->\s*<script[^>]*>[^<]*</script>\s*', ''
        
        # Pattern 2: Supprimer Google Tag Manager script
        $content = $content -replace '(?s)<!-- Google Tag Manager -->\s*<script>\s*\(function\s*\(w,\s*d,\s*s,\s*l,\s*i\)[^<]*</script>\s*<!-- End Google Tag Manager -->\s*', ''
        
        # Pattern 3: Supprimer Google tag (gtag.js)
        $content = $content -replace '(?s)<!-- Google tag \(gtag\.js\) -->\s*<script[^>]*src="https://www\.googletagmanager\.com/gtag/js[^"]*"[^>]*>[^<]*</script>\s*<script>[^<]*</script>\s*', ''
        
        # Pattern 4: Supprimer le noscript GTM du body
        $content = $content -replace '(?s)<!-- Google Tag Manager \(noscript\) -->\s*<noscript>\s*<iframe[^<]*</iframe>\s*</noscript>\s*<!-- End Google Tag Manager \(noscript\) -->\s*', ''
        
        # Pattern 5: Ajouter third-party-loader après google-adsense-account meta
        if (-not ($content -match 'third-party-loader\.js')) {
            $content = $content -replace '(<meta name="google-adsense-account" content="[^"]*" />)', "`$1`n    <script defer src=""/third-party-loader.js""></script>"
        }
        
        Set-Content $path $content -Encoding UTF8 -NoNewline
        Write-Host "Corrige: $page"
    } else {
        Write-Host "Non trouve: $page"
    }
}

Write-Host "Termine!"
