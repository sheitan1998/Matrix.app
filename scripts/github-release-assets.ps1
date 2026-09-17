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

function ConvertTo-GitHubReleaseId {
  param(
    [Parameter(Mandatory = $true)]
    [AllowNull()]
    [object]$ReleaseId,

    [string]$ParameterName = "ReleaseId"
  )

  if ($null -eq $ReleaseId -or [string]::IsNullOrWhiteSpace([string]$ReleaseId)) {
    return $null
  }

  try {
    # GitHub release ids are 64-bit values. GitHub Actions outputs/env vars arrive as strings,
    # while API responses can be Int64/JsonElement depending on the PowerShell runtime.
    return [System.Convert]::ToInt64(([string]$ReleaseId).Trim(), [System.Globalization.CultureInfo]::InvariantCulture)
  } catch {
    throw "Invalid GitHub release id for '$ParameterName': '$ReleaseId'. $($_.Exception.Message)"
  }
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

  $repositoryValue = [string]$Repository
  $tagNameValue = [string]$TagName
  $releaseUrl = "https://api.github.com/repos/$repositoryValue/releases/tags/$([System.Uri]::EscapeDataString($tagNameValue))"

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

    [object]$ReleaseId
  )

  $explicitReleaseId = ConvertTo-GitHubReleaseId -ReleaseId $ReleaseId -ParameterName "ReleaseId"
  if ($null -ne $explicitReleaseId) {
    return $explicitReleaseId
  }

  $repositoryValue = [string]$Repository
  $tagNameValue = [string]$TagName
  $release = Get-GitHubReleaseByTag -Repository $repositoryValue -Headers $Headers -TagName $tagNameValue
  if ($release) {
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
  if ($null -eq $releaseIdValue) {
    throw "ReleaseId is required to list GitHub release assets."
  }

  $assets = New-Object System.Collections.Generic.List[object]
  $assetPageNumber = 1

  while ($true) {
    $assetListUrl = "https://api.github.com/repos/$repositoryValue/releases/$releaseIdValue/assets?per_page=100&page=$assetPageNumber"
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

  $repositoryValue = [string]$Repository
  $assetId = ConvertTo-GitHubReleaseId -ReleaseId $Asset.id -ParameterName "Asset.id"
  $deleteUrl = "https://api.github.com/repos/$repositoryValue/releases/assets/$assetId"
  Write-Host "Deleting existing release asset '$($Asset.name)' (id=$assetId) $Reason."
  Invoke-RestMethod -Uri $deleteUrl -Headers $Headers -Method Delete -ErrorAction Stop
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
  $releaseIdValue = ConvertTo-GitHubReleaseId -ReleaseId $ReleaseId -ParameterName "ReleaseId"
  if ($null -eq $releaseIdValue) {
    throw "ReleaseId is required to remove GitHub release assets."
  }

  $assetNameSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($assetName in $AssetNames) {
    if (-not [string]::IsNullOrWhiteSpace([string]$assetName)) {
      [void]$assetNameSet.Add([string]$assetName)
    }
  }

  $existingAssets = if ($PSBoundParameters.ContainsKey('ReleaseAssets') -and $null -ne $ReleaseAssets) {
    @($ReleaseAssets | Where-Object { $assetNameSet.Contains([string]$_.name) })
  } else {
    @(Get-GitHubReleaseAssets -Repository $repositoryValue -Headers $Headers -ReleaseId $releaseIdValue | Where-Object { $assetNameSet.Contains([string]$_.name) })
  }

  foreach ($asset in $existingAssets) {
    Remove-GitHubReleaseAsset -Repository $repositoryValue -Headers $Headers -Asset $asset
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
