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

$releaseTags = @(gh release list --limit 1000 --json tagName --jq '.[].tagName')
if ($LASTEXITCODE -ne 0) {
  throw "Impossible de lister les releases GitHub."
}

if ($releaseTags -notcontains $releaseTag) {
  Write-Host "Release absente pour le tag '$releaseTag', rien à nettoyer."
  exit 0
}

$existingAssets = @(gh release view $releaseTag --json assets --jq '.assets[].name')
if ($LASTEXITCODE -ne 0) {
  throw "Impossible de lire les assets de la release '$releaseTag'."
}

foreach ($assetName in @($assetNames | Select-Object -Unique)) {
  if ($existingAssets -contains $assetName) {
    gh release delete-asset $releaseTag $assetName --yes
    if ($LASTEXITCODE -ne 0) {
      throw "Impossible de supprimer l'asset '$assetName' de la release '$releaseTag'."
    }
    Write-Host "Asset supprimé: $assetName"
  } else {
    Write-Host "Asset absent ou déjà supprimé: $assetName"
  }
}
