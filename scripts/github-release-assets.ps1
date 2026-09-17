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

function Split-GitHubRepository {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repository
  )

  $repositoryValue = ([string]$Repository).Trim()
  $parts = $repositoryValue -split '/'
  if ($parts.Count -ne 2 -or [string]::IsNullOrWhiteSpace($parts[0]) -or [string]::IsNullOrWhiteSpace($parts[1])) {
    throw "Invalid GitHub repository identifier '$Repository'. Expected 'owner/name'."
  }

  return [PSCustomObject]@{
    Owner = $parts[0]
    Name = $parts[1]
  }
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

  $repositoryParts = Split-GitHubRepository -Repository $repositoryValue
  $releaseQuery = @'
query($owner:String!, $name:String!, $tag:String!) {
  repository(owner: $owner, name: $name) {
    release(tagName: $tag) {
      databaseId
      tagName
      url
    }
  }
}
'@

  $releaseOutput = gh api graphql -f query="$releaseQuery" -f owner="$($repositoryParts.Owner)" -f name="$($repositoryParts.Name)" -f tag="$tagValue" 2>&1
  if ($LASTEXITCODE -ne 0) {
    $errorText = ([string]::Join("`n", @($releaseOutput))).Trim()
    throw "Failed to fetch release '$tagValue' in repository '$repositoryValue'. $errorText"
  }

  $releaseJson = [string]::Join("`n", @($releaseOutput))
  if ([string]::IsNullOrWhiteSpace($releaseJson)) {
    return $null
  }

  $releaseGraph = $releaseJson | ConvertFrom-Json
  if (-not $releaseGraph.data -or -not $releaseGraph.data.repository -or -not $releaseGraph.data.repository.release) {
    return $null
  }

  $release = $releaseGraph.data.repository.release
  return [PSCustomObject]@{
    id = [System.Convert]::ToInt64([string]$release.databaseId, [System.Globalization.CultureInfo]::InvariantCulture)
    tagName = [string]$release.tagName
    url = [string]$release.url
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
  $assets = New-Object System.Collections.Generic.List[object]

  if (-not $releaseIdValue) {
    throw "ReleaseId is required to list GitHub release assets."
  }

  $assetsPagesOutput = gh api --paginate --slurp "repos/$repositoryValue/releases/$releaseIdValue/assets?per_page=100" 2>&1
  if ($LASTEXITCODE -ne 0) {
    $errorText = ([string]::Join("`n", @($assetsPagesOutput))).Trim()
    throw "Failed to list release assets for release id '$releaseIdValue' in repository '$repositoryValue'. $errorText"
  }

  $assetsPagesJson = [string]::Join("`n", @($assetsPagesOutput))
  if ([string]::IsNullOrWhiteSpace($assetsPagesJson)) {
    return @()
  }

  $assetPages = @($assetsPagesJson | ConvertFrom-Json)
  foreach ($assetPage in $assetPages) {
    foreach ($asset in @($assetPage)) {
      $assets.Add($asset)
    }
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
  $assetName = [string]$Asset.name
  if ([string]::IsNullOrWhiteSpace($assetName)) {
    return
  }

  Write-Host "Deleting existing release asset '$assetName' $Reason."
  $deleteOutput = @()
  $assetId = ConvertTo-GitHubReleaseId -ReleaseId $Asset.id -ParameterName "Asset.id"
  if ($assetId) {
    $deleteOutput = gh api --method DELETE "repos/$repositoryValue/releases/assets/$assetId" 2>&1
  } else {
    $tagValue = Resolve-GitHubReleaseTag
    if (-not $tagValue) {
      throw "Unable to resolve release tag to delete asset '$assetName'."
    }

    $deleteOutput = gh release delete-asset "$tagValue" "$assetName" --repo "$repositoryValue" --yes 2>&1
  }

  if ($LASTEXITCODE -ne 0) {
    $errorText = ([string]::Join("`n", @($deleteOutput))).Trim()
    throw "Failed to delete release asset '$assetName'. $errorText"
  }
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

  $existingAssets = if ($PSBoundParameters.ContainsKey('ReleaseAssets') -and $null -ne $ReleaseAssets) {
    @($ReleaseAssets | Where-Object { $assetNameSet.Contains([string]$_.name) })
  } else {
    @(Get-GitHubReleaseAssets -Repository $repositoryValue -Headers $Headers -ReleaseId $ReleaseId | Where-Object { $assetNameSet.Contains([string]$_.name) })
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
