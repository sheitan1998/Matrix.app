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

Write-Host "Cleaning existing release assets..."

$releaseViewErrorFile = Join-Path ([System.IO.Path]::GetTempPath()) "gh-release-assets-view.err"
Remove-Item $releaseViewErrorFile -ErrorAction SilentlyContinue
$existingAssets = @(gh release view $releaseTag --json assets --jq '.assets[].name' 2>$releaseViewErrorFile)
if ($LASTEXITCODE -ne 0) {
  $releaseViewError = if (Test-Path $releaseViewErrorFile) {
    (Get-Content $releaseViewErrorFile -Raw).Trim()
  } else {
    ""
  }

  if ($releaseViewError -match '(?i)(release|tag).*(not found|404)') {
    Write-Host "Release '$releaseTag' does not exist yet; nothing to clean."
    exit 0
  }

  throw "Unable to read assets for release '$releaseTag'. $releaseViewError".Trim()
}

foreach ($assetName in @($assetNames | Select-Object -Unique)) {
  if ($existingAssets -contains $assetName) {
    gh release delete-asset $releaseTag $assetName --yes
    if ($LASTEXITCODE -ne 0) {
      throw "Unable to delete asset '$assetName' from release '$releaseTag'."
    }
    Write-Host "Deleted asset: $assetName"
  } else {
    Write-Host "Asset already absent: $assetName"
  }
}
