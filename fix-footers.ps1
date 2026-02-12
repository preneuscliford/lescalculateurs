# Script pour ajouter le lien historique-mises-a-jour dans tous les footers
$pages = @(
    "a-propos.html", "aah.html", "apl-dom-tom.html", "apl-etudiant.html", 
    "apl-zones.html", "apl.html", "are.html", "asf.html", "blog.html",
    "charges.html", "comment-calculer-frais-notaire.html", "comment-calculer-plus-value.html",
    "crypto-bourse.html", "financement.html", "guide-complet-impot-revenu-2026.html",
    "ik.html", "methodologie.html", "notaire.html", "plusvalue.html",
    "ponts.html", "pret.html", "prime-activite.html", "salaire-seo.html",
    "simulateurs.html", "sources.html", "taxe.html", "travail.html"
)

$lienMisesAJour = @'
          <div class="flex gap-4 text-sm flex-wrap justify-center mb-4">
            <a href="/pages/methodologie" class="text-gray-300 hover:text-white transition-colors">📘 Méthodologie</a>
            <span class="text-gray-500">|</span>
            <a href="/pages/sources" class="text-gray-300 hover:text-white transition-colors">📚 Sources</a>
            <span class="text-gray-500">|</span>
            <a href="/pages/historique-mises-a-jour" class="text-gray-300 hover:text-white transition-colors">🔄 Mises à jour</a>
          </div>
'@

foreach ($page in $pages) {
    $path = "src/pages/$page"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Vérifier si le lien existe déjà
        if ($content -match "historique-mises-a-jour") {
            Write-Host "✅ $page - Déjà à jour" -ForegroundColor Green
            continue
        }
        
        # Pattern 1: Footer avec copyright seul (comme rsa.html)
        if ($content -match '(<footer[^>]*>[\s\S]*?<p[^>]*class="[^"]*mb-[^"]*"[^>]*>[\s\S]*?© 2026[\s\S]*?</p>)') {
            $newContent = $content -replace '(<footer[^>]*>[\s\S]*?<p[^>]*class="[^"]*mb-[^"]*"[^>]*>[\s\S]*?© 2026[\s\S]*?</p>)', "`$1`n$lienMisesAJour"
            if ($newContent -ne $content) {
                Set-Content $path $newContent -NoNewline
                Write-Host "✅ $page - Footer mis à jour" -ForegroundColor Green
                continue
            }
        }
        
        # Pattern 2: Footer simple avec juste un paragraphe de copyright
        if ($content -match '(<footer[^>]*>[\s\S]*?<p>[\s\S]*?© 2026[\s\S]*?</p>)') {
            $newContent = $content -replace '(<footer[^>]*>[\s\S]*?<p>[\s\S]*?© 2026[\s\S]*?</p>)', "`$1`n$lienMisesAJour"
            if ($newContent -ne $content) {
                Set-Content $path $newContent -NoNewline
                Write-Host "✅ $page - Footer mis à jour (pattern 2)" -ForegroundColor Green
                continue
            }
        }
        
        Write-Host "⚠️ $page - Pattern non reconnu, modification manuelle nécessaire" -ForegroundColor Yellow
    } else {
        Write-Host "❌ $page - Fichier non trouvé" -ForegroundColor Red
    }
}

Write-Host "`nTerminé !" -ForegroundColor Cyan
