function New-GitHubReleaseHeaders {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Token,

    [string]$ContentType
  )

  $headers = @{
    Authorization = "token $Token"
    Accept = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
  }

  if ($ContentType) {
    $headers["Content-Type"] = [string]$ContentType
  }

  return $headers
}

function Resolve-GitHubReleaseTag {
  param(
    [string]$TagName
  )

  if (-not [string]::IsNullOrWhiteSpace([string]$TagName)) {
    return ([string]$TagName).Trim()
  }

  if (-not [string]::IsNullOrWhiteSpace([string]$env:RELEASE_TAG)) {
    return ([string]$env:RELEASE_TAG).Trim()
  }

  if (-not [string]::IsNullOrWhiteSpace([string]$env:GITHUB_REF_NAME)) {
    return ([string]$env:GITHUB_REF_NAME).Trim()
  }

  $githubRef = [string]$env:GITHUB_REF
  if ($githubRef -and $githubRef.StartsWith("refs/tags/", [System.StringComparison]::OrdinalIgnoreCase)) {
    return $githubRef.Substring(10)
  }

  return $null
}

function ConvertTo-GitHubReleaseId {
  param(
    [AllowNull()]
    [object]$ReleaseId,

    [string]$ParameterName = "ReleaseId"
  )

  if ($null -eq $ReleaseId -or [string]::IsNullOrWhiteSpace([string]$ReleaseId)) {
    return $null
  }

  try {
    return [System.Convert]::ToInt64(([string]$ReleaseId).Trim(), [System.Globalization.CultureInfo]::InvariantCulture)
  } catch {
    throw "Invalid GitHub release id for '$ParameterName': '$ReleaseId'. $($_.Exception.Message)"
  }
}

function Get-GitHubReleaseByTag {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,

    [Parameter(Mandatory = $true)]
    [string]$TagName
  )

  $repositoryValue = [string]$Repository
  $tagValue = Resolve-GitHubReleaseTag -TagName $TagName
  if (-not $tagValue) {
    return $null
  }

  $releaseJson = gh release view "$tagValue" --repo "$repositoryValue" --json id,tagName,url 2>$null
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace([string]$releaseJson)) {
    return $null
  }

  return ($releaseJson | ConvertFrom-Json)
}

function Get-GitHubReleaseId {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,

    [Parameter(Mandatory = $true)]
    [string]$TagName,

    [object]$ReleaseId
  )

  $explicitReleaseId = ConvertTo-GitHubReleaseId -ReleaseId $ReleaseId -ParameterName "ReleaseId"
  if ($null -ne $explicitReleaseId) {
    return $explicitReleaseId
  }

  $release = Get-GitHubReleaseByTag -Repository ([string]$Repository) -Headers $Headers -TagName ([string]$TagName)
  if ($release -and $release.id) {
    return (ConvertTo-GitHubReleaseId -ReleaseId $release.id -ParameterName "release.id")
  }

  return $null
}

function Get-GitHubReleaseAssets {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,

    [Parameter(Mandatory = $true)]
    [object]$ReleaseId
  )

  $repositoryValue = [string]$Repository
  $releaseIdValue = ConvertTo-GitHubReleaseId -ReleaseId $ReleaseId -ParameterName "ReleaseId"
  $assetsJson = $null

  if ($releaseIdValue) {
    $assetsJson = gh api "repos/$repositoryValue/releases/$releaseIdValue/assets?per_page=100" 2>$null
  } else {
    $tagValue = Resolve-GitHubReleaseTag
    if (-not $tagValue) {
      return @()
    }

    $assetsJson = gh release view "$tagValue" --repo "$repositoryValue" --json assets --jq '.assets' 2>$null
  }

  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace([string]$assetsJson)) {
    return @()
  }

  return @($assetsJson | ConvertFrom-Json)
}

function Remove-GitHubReleaseAsset {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,

    [Parameter(Mandatory = $true)]
    [object]$Asset,

    [string]$Reason = "before upload"
  )

  $repositoryValue = [string]$Repository
  $assetName = [string]$Asset.name
  if ([string]::IsNullOrWhiteSpace($assetName)) {
    return
  }

  $tagValue = Resolve-GitHubReleaseTag
  if (-not $tagValue) {
    throw "Unable to resolve release tag to delete asset '$assetName'."
  }

  Write-Host "Deleting existing release asset '$assetName' $Reason."
  gh release delete-asset "$tagValue" "$assetName" --repo "$repositoryValue" --yes 2>$null
}

function Remove-GitHubReleaseAssetsByName {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,

    [Parameter(Mandatory = $true)]
    [object]$ReleaseId,

    [Parameter(Mandatory = $true)]
    [string[]]$AssetNames,

    [object[]]$ReleaseAssets
  )

  $repositoryValue = [string]$Repository
  $tagValue = Resolve-GitHubReleaseTag
  if (-not $tagValue) {
    throw "Unable to resolve release tag while deleting release assets."
  }

  $assetNameSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($assetName in $AssetNames) {
    if (-not [string]::IsNullOrWhiteSpace([string]$assetName)) {
      [void]$assetNameSet.Add([string]$assetName)
    }
  }

  foreach ($assetName in $assetNameSet) {
    gh release delete-asset "$tagValue" "$assetName" --repo "$repositoryValue" --yes 2>$null
  }
}

function Get-TauriWindowsExpectedAssetNames {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ProductName,

    [Parameter(Mandatory = $true)]
    [string]$Version
  )

  $productNameValue = [string]$ProductName
  $versionValue = [string]$Version
  $productFileName = $productNameValue -replace '\s+', '_'
  $baseName = "${productFileName}_${versionValue}_x64"

  return @(
    "${baseName}_en-US.msi",
    "${baseName}_en-US.msi.sig",
    "${baseName}-setup.exe",
    "${baseName}-setup.exe.sig"
  )
}

function Get-TauriArtifactCandidateRoots {
  param(
    [string]$ArtifactPathsJson
  )

  $candidateRoots = New-Object System.Collections.Generic.List[string]

  foreach ($root in @(
    "src-tauri/target/release/bundle",
    "src-tauri/target/release",
    "target/release/bundle",
    "target/release"
  )) {
    if (Test-Path $root) {
      $candidateRoots.Add((Resolve-Path $root).Path)
    }
  }

  if ($ArtifactPathsJson) {
    try {
      $artifactPaths = @(ConvertFrom-Json -InputObject $ArtifactPathsJson)
      foreach ($artifactPath in $artifactPaths) {
        if (-not $artifactPath) {
          continue
        }

        foreach ($candidate in @(
          ((Test-Path $artifactPath -PathType Container) ? $artifactPath : $null),
          (Split-Path -Parent $artifactPath),
          ((Split-Path -Parent $artifactPath) ? (Split-Path -Parent (Split-Path -Parent $artifactPath)) : $null)
        )) {
          if ($candidate -and (Test-Path $candidate)) {
            $candidateRoots.Add((Resolve-Path $candidate).Path)
          }
        }
      }
    } catch {
      throw "Unable to parse tauri-action artifactPaths output: $($_.Exception.Message)"
    }
  }

  return @($candidateRoots | Sort-Object -Unique)
}

function Get-TauriWindowsInstallerArtifacts {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$CandidateRoots
  )

  $msiInstallers = @(
    foreach ($root in $CandidateRoots) {
      Get-ChildItem -Path $root -Recurse -File -Filter "*.msi" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -match '[\\/](bundle[\\/])?msi[\\/]'
      }
    }
  )
  $exeInstallers = @(
    foreach ($root in $CandidateRoots) {
      Get-ChildItem -Path $root -Recurse -File -Filter "*.exe" -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -like "*setup.exe" -and $_.FullName -match '[\\/](bundle[\\/])?nsis[\\/]'
      }
    }
  )

  return [PSCustomObject]@{
    MsiInstallers = @($msiInstallers | Sort-Object FullName -Unique)
    ExeInstallers = @($exeInstallers | Sort-Object FullName -Unique)
  }
}
