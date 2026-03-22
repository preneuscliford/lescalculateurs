# ============================================================================
# 🔒 WRAPPER POWERSHELL - FORCE UTF-8 POUR TOUT
# ============================================================================

# 1. FORCE UTF-8 AU NIVEAU CONSOLE
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 2. FORCE UTF-8 AU NIVEAU FICHIER (Node.js aussi)
$env:NODE_OPTIONS = "--input-type=commonjs"

Write-Host "[INIT] Force UTF-8 (console + stdin/stdout)" -ForegroundColor Green

# 3. VERIFICATION : détecte si les fichiers sont déjà cassés
Write-Host "[CHECK] Scan des fichiers HTML pour les encodages cassés..." -ForegroundColor Yellow

$filesToCheck = @(
  "content_SAFE/are.html",
  "content_SAFE/apl.html",
  "content_SAFE/rsa.html",
  "content_SAFE/prime-activite.html",
  "content_SAFE/asf.html",
  "content_SAFE/charges.html",
  "content_SAFE/notaire.html",
  "content_SAFE/impot.html"
)

$brokenFiles = @()
foreach ($file in $filesToCheck) {
  $fullPath = Join-Path (Get-Location) $file
  if (Test-Path $fullPath) {
    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    if ($content -match 'Ã|â€™|ðŸ|Â|Ù|û|ï') {
      $brokenFiles += $file
      Write-Host "  [BROKEN] $file" -ForegroundColor Red
    }
  }
}

if ($brokenFiles.Count -gt 0) {
  Write-Host "`n[ALERT] $($brokenFiles.Count) fichier(s) avec encodage casse detecte" -ForegroundColor Red
  Write-Host "  Correction requise avant traitement" -ForegroundColor Red
  Write-Host "`nFichiers affectes :" -ForegroundColor Red
  $brokenFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

# 4. LANCE LE SCRIPT AVEC STDERR EN UTF-8
Write-Host "`n[RUN] Lancement du script de correction..." -ForegroundColor Green

# Utilise Set-Content pour forcer UTF-8 sur les resultats
& node scripts/auto-correct-seo.cjs 2>&1 | Set-Content -Path temp_output.log -Encoding UTF8
Get-Content temp_output.log -Encoding UTF8 | Write-Host

# 5. VERIFICATION FINALE
Write-Host "`n[VERIFY] Verification des fichiers apres correction..." -ForegroundColor Yellow
$stillBroken = @()
foreach ($file in $filesToCheck) {
  $fullPath = Join-Path (Get-Location) $file
  if (Test-Path $fullPath) {
    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    if ($content -match 'Ã|â€™|ðŸ|Â|Ù|û|ï') {
      $stillBroken += $file
    }
  }
}

if ($stillBroken.Count -eq 0) {
  Write-Host "[OK] Tous les fichiers sont en UTF-8 correct" -ForegroundColor Green
} else {
  Write-Host "[WARN] $($stillBroken.Count) fichier(s) avec encoding probleme encore present" -ForegroundColor Yellow
  $stillBroken | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}

# 6. NETTOYAGE
Remove-Item temp_output.log -ErrorAction SilentlyContinue

Write-Host "`n[DONE] Fin du processus" -ForegroundColor Green
