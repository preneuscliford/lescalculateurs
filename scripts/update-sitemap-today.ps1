$file='reports/generated-pseo-urls-2026-05-25.txt'
if(-not (Test-Path $file)){
  Write-Output 'Report file not found'
  exit 1
}
$urls = Get-Content $file | Where-Object { $_ -match '^https?://' } | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
$sitemap = Get-Content public/sitemap.xml -Raw
$inserted = @()
foreach($u in $urls){
  if($sitemap -notmatch [regex]::Escape($u)){
    $entry = "  <url>`n    <loc>$u</loc>`n  </url>`n"
    $sitemap = $sitemap -replace '</urlset>', ($entry + '</urlset>')
    $inserted += $u
  }
}
if($inserted.Count -gt 0){
  Set-Content public/sitemap.xml -Value $sitemap -Encoding UTF8
  Write-Output "Inserted $($inserted.Count) URLs:"
  $inserted | ForEach-Object { Write-Output $_ }
} else {
  Write-Output 'No URLs to insert.'
}
$count = (Get-Content public/sitemap.xml | Select-String '<loc>' | Measure-Object).Count
Write-Output "`nNew sitemap count: $count`n"
Write-Output '---DIFF (public/sitemap.xml)---'
git --no-pager diff -- public/sitemap.xml
