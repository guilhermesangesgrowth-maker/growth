# Gera as thank-you pages dos guias a partir do index.html de cada guia.
# Rode de novo sempre que editar guia-growth-30d/index.html ou guia-high-ticket-agentico/index.html:
#   powershell -ExecutionPolicy Bypass -File gerar-thank-you-pages.ps1
# A página gerada é igual à do guia, com noindex e os arquivos do guia apontando para a pasta original.
# Canonical e og:url continuam apontando para o guia (quem compartilhar o link divulga o guia, não a entrega).
$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)

$pages = @(
  @{
    src = "guia-growth-30d"; dst = "thank-you-page-growth-30d"
    swaps = @(
      @('href="guia.css"', 'href="../guia-growth-30d/guia.css"'),
      @('src="guia.js"', 'src="../guia-growth-30d/guia.js"'),
      @('content="index, follow, max-image-preview:large, max-snippet:-1"', 'content="noindex, nofollow"')
    )
  },
  @{
    src = "guia-high-ticket-agentico"; dst = "thank-you-page-high-ticket-agentico"
    swaps = @(
      @('href="agentico.css"', 'href="../guia-high-ticket-agentico/agentico.css"'),
      @('src="agentico-data.js"', 'src="../guia-high-ticket-agentico/agentico-data.js"'),
      @('src="agentico.js" data-base=""', 'src="../guia-high-ticket-agentico/agentico.js" data-base="../guia-high-ticket-agentico/"'),
      @('content="noindex, follow"', 'content="noindex, nofollow"')
    )
  }
)

foreach ($p in $pages) {
  $html = [System.IO.File]::ReadAllText((Join-Path $root "$($p.src)\index.html"), $utf8)
  foreach ($s in $p.swaps) {
    if (-not $html.Contains($s[0])) { throw "Trecho nao encontrado em $($p.src)/index.html: $($s[0])" }
    $html = $html.Replace($s[0], $s[1])
  }
  $i = $html.IndexOf(">") + 1   # logo depois do <!doctype html>
  $html = $html.Insert($i, "`n<!-- Gerado por gerar-thank-you-pages.ps1 a partir de $($p.src)/index.html. Nao edite aqui. -->")
  $dir = Join-Path $root $p.dst
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText((Join-Path $dir "index.html"), $html, $utf8)
  Write-Host "OK  /$($p.dst)/"
}
