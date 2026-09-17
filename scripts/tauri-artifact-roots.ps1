$ErrorActionPreference = 'Stop'

$candidateRoots = @()

foreach ($root in @(
  "src-tauri/target/release/bundle",
  "src-tauri/target/release",
  "target/release/bundle",
  "target/release"
)) {
  if (Test-Path $root) {
    $candidateRoots += (Resolve-Path $root).Path
  }
}

if ($env:TAURI_ARTIFACT_PATHS) {
  try {
    $artifactPaths = @(ConvertFrom-Json -InputObject $env:TAURI_ARTIFACT_PATHS)
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
          $candidateRoots += (Resolve-Path $candidate).Path
        }
      }
    }
  } catch {
    Write-Warning "Unable to parse tauri-action artifactPaths output: $($_.Exception.Message)"
  }
}

@($candidateRoots | Sort-Object -Unique) | ConvertTo-Json -Compress
