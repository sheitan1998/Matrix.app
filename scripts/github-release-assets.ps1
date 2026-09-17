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
    $headers["Content-Type"] = $ContentType
  }

  return $headers
}

function Get-GitHubReleaseHttpStatusCode {
  param(
    [Parameter(Mandatory = $true)]
    [System.Management.Automation.ErrorRecord]$ErrorRecord
  )

  if (-not $ErrorRecord.Exception.Response) {
    return $null
  }

  return [int]$ErrorRecord.Exception.Response.StatusCode
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

  $releaseUrl = "https://api.github.com/repos/$Repository/releases/tags/$([System.Uri]::EscapeDataString($TagName))"

  try {
    return Invoke-RestMethod -Uri $releaseUrl -Headers $Headers -Method Get -ErrorAction Stop
  } catch {
    if ((Get-GitHubReleaseHttpStatusCode $_) -eq 404) {
      return $null
    }

    throw
  }
}

function Get-GitHubReleaseId {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,

    [Parameter(Mandatory = $true)]
    [string]$TagName,

    [string]$ReleaseId
  )

  if ($ReleaseId) {
    return [int]$ReleaseId
  }

  $release = Get-GitHubReleaseByTag -Repository $Repository -Headers $Headers -TagName $TagName
  if ($release) {
    return [int]$release.id
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
    [int]$ReleaseId
  )

  $assets = New-Object System.Collections.Generic.List[object]
  $assetPageNumber = 1

  while ($true) {
    $assetListUrl = "https://api.github.com/repos/$Repository/releases/$ReleaseId/assets?per_page=100&page=$assetPageNumber"
    $assetPage = @(Invoke-RestMethod -Uri $assetListUrl -Headers $Headers -Method Get -ErrorAction Stop)

    foreach ($asset in $assetPage) {
      $assets.Add($asset)
    }

    if ($assetPage.Count -lt 100) {
      break
    }

    $assetPageNumber++
  }

  return @($assets)
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

  $deleteUrl = "https://api.github.com/repos/$Repository/releases/assets/$($Asset.id)"
  Write-Host "Deleting existing release asset '$($Asset.name)' (id=$($Asset.id)) $Reason."
  Invoke-RestMethod -Uri $deleteUrl -Headers $Headers -Method Delete -ErrorAction Stop
}

function Remove-GitHubReleaseAssetsByName {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [hashtable]$Headers,

    [Parameter(Mandatory = $true)]
    [int]$ReleaseId,

    [Parameter(Mandatory = $true)]
    [string[]]$AssetNames,

    [object[]]$ReleaseAssets
  )

  $assetNameSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($assetName in $AssetNames) {
    [void]$assetNameSet.Add($assetName)
  }

  $existingAssets = if ($PSBoundParameters.ContainsKey('ReleaseAssets') -and $null -ne $ReleaseAssets) {
    @($ReleaseAssets | Where-Object { $assetNameSet.Contains($_.name) })
  } else {
    @(Get-GitHubReleaseAssets -Repository $Repository -Headers $Headers -ReleaseId $ReleaseId | Where-Object { $assetNameSet.Contains($_.name) })
  }

  foreach ($asset in $existingAssets) {
    Remove-GitHubReleaseAsset -Repository $Repository -Headers $Headers -Asset $asset
  }
}

function Get-TauriWindowsExpectedAssetNames {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ProductName,

    [Parameter(Mandatory = $true)]
    [string]$Version
  )

  $productFileName = $ProductName -replace '\s+', '_'
  $baseName = "${productFileName}_${Version}_x64"

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
