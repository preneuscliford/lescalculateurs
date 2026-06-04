$files = Get-ChildItem src/pages/blog/departements/frais-notaire-*.html
$bad = @()
foreach($f in $files){
  $c = Get-Content $f.FullName -Raw
  if(($c -split '<!DOCTYPE html>').Count -gt 2){
    $bad += $f.Name
  }
}
Write-Output "BAD_COUNT=$($bad.Count)"
$bad
