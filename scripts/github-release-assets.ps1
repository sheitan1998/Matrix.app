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
