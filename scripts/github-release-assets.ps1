$ErrorActionPreference = 'Stop'

$releaseTag = if ($env:RELEASE_TAG) {
  $env:RELEASE_TAG
} elseif ($env:GITHUB_REF_NAME) {
  $env:GITHUB_REF_NAME
} else {
  throw "RELEASE_TAG or GITHUB_REF_NAME is required."
}

$productName = if ($env:TAURI_PRODUCT_NAME) {
  $env:TAURI_PRODUCT_NAME -replace '\s+', '_'
} else {
  'Matrix'
}

$assetNames = @(
  'latest.json',
  'Matrix-Setup.msi',
  'Matrix-Setup.exe'
)

if ($env:TAURI_APP_VERSION) {
  $baseName = "${productName}_$($env:TAURI_APP_VERSION)_x64"
  $assetNames += @(
    "${baseName}_en-US.msi",
    "${baseName}_en-US.msi.sig",
    "${baseName}-setup.exe",
    "${baseName}-setup.exe.sig"
  )
}

Write-Host "Nettoyage des anciens assets de la release..."

foreach ($assetName in @($assetNames | Select-Object -Unique)) {
  gh release delete-asset $releaseTag $assetName --yes 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Asset supprimé: $assetName"
  } else {
    Write-Host "Asset absent ou déjà supprimé: $assetName"
  }
}
