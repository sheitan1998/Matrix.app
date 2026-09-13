# Guide Complet : Automatiser les Releases avec Auto-Updater Tauri

## 📋 OPTION 1 : Créer le workflow via GitHub Web UI (Recommandé)

### Étape 1 : Créer le fichier workflow

1. Allez sur votre repo : https://github.com/sheitan1998/Matrix.app
2. Cliquez sur **"Add file"** → **"Create new file"**
3. Nommez le fichier : `.github/workflows/release-auto-updater.yml`
4. Collez le contenu suivant :

```yaml
name: Release Tauri App with Auto-Updater

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      ref:
        description: 'Git ref, branch, or commit to build from'
        required: true
        default: 'main'
        type: string

jobs:
  release:
    permissions:
      contents: write
    strategy:
      matrix:
        platform: [windows-latest]
    runs-on: ${{ matrix.platform }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.ref || github.sha }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install frontend dependencies
        run: pnpm install

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable

      - name: Build Tauri App & Create Installer
        uses: tauri-apps/tauri-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          tagName: v__VERSION__
          releaseName: 'Matrix v__VERSION__'
          releaseBody: 'Nouvelle mise à jour de Matrix.'
          releaseDraft: false
          prerelease: false

      - name: Generate latest.json for auto-updater
        shell: pwsh
        run: |
          # Récupère la version depuis le tag
          $version = "${{ github.ref }}".Replace('refs/tags/v', '')
          Write-Host "Building release for version: $version"
          
          # Trouve les fichiers MSI et leur signature
          $msiFiles = Get-ChildItem -Path "src-tauri/target/release/bundle/msi" -Filter "*.msi" -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "*.sig" }
          
          if ($msiFiles.Count -eq 0) {
              Write-Error "❌ No MSI files found in src-tauri/target/release/bundle/msi"
              exit 1
          }
          
          $msiFile = $msiFiles[0]
          $msiSigFile = Get-ChildItem -Path "src-tauri/target/release/bundle/msi" -Filter "$($msiFile.BaseName).msi.sig" -ErrorAction SilentlyContinue
          
          if (-not $msiSigFile) {
              Write-Error "❌ Signature file not found for $($msiFile.Name)"
              exit 1
          }
          
          Write-Host "✓ Found MSI: $($msiFile.Name)"
          Write-Host "✓ Found Signature: $($msiSigFile.Name)"
          
          # Lit la signature
          $signature = Get-Content -Path $msiSigFile.FullName -Raw
          
          # Crée le contenu JSON pour latest.json
          $latestJson = @{
              version = $version
              notes = "Nouvelle mise à jour de Matrix."
              pub_date = (Get-Date -AsUTC -Format 'o')
              platforms = @{
                  "windows-x86_64" = @{
                      signature = $signature.Trim()
                      url = "https://github.com/sheitan1998/Matrix.app/releases/download/v$version/$($msiFile.Name)"
                  }
              }
          } | ConvertTo-Json -Depth 10
          
          # Sauvegarde le fichier latest.json
          Set-Content -Path "latest.json" -Value $latestJson -Encoding UTF8
          
          Write-Host "✅ latest.json generated successfully!"
          Write-Host "Content:"
          Write-Host $latestJson

      - name: Upload latest.json to release
        uses: softprops/action-gh-release@v1
        with:
          files: latest.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  verify-release:
    needs: release
    runs-on: ubuntu-latest
    steps:
      - name: Verify release assets
        run: |
          VERSION="${{ github.ref }}" 
          VERSION="${VERSION#refs/tags/v}"
          RELEASE_URL="https://api.github.com/repos/sheitan1998/Matrix.app/releases/tags/v${VERSION}"
          
          echo "Fetching release: $RELEASE_URL"
          ASSETS=$(curl -s "$RELEASE_URL" | jq '.assets[].name')
          
          echo "Release assets:"
          echo "$ASSETS"
          
          # Vérifie les fichiers requis
          if echo "$ASSETS" | grep -q "latest.json" && echo "$ASSETS" | grep -q ".msi" && echo "$ASSETS" | grep -q ".msi.sig"; then
              echo "✅ All required files are present!"
          else
              echo "❌ Missing required files!"
              exit 1
          fi
```

5. Cliquez sur **"Commit changes"** → Confirmez

---

## 🔐 ÉTAPE 2 : Configurer les GitHub Secrets

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur **"New repository secret"**

Vous avez besoin de 2 secrets :

### Secret 1 : TAURI_SIGNING_PRIVATE_KEY
- **Name** : `TAURI_SIGNING_PRIVATE_KEY`
- **Value** : Votre clé privée Tauri (contenu du fichier `matrix.key`)
  - Si vous n'avez pas la clé, lancez le workflow `Generate Tauri Keys` depuis Actions

### Secret 2 : TAURI_SIGNING_PRIVATE_KEY_PASSWORD
- **Name** : `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- **Value** : Le mot de passe que vous avez défini lors de la génération des clés

---

## 🚀 UTILISATION : Comment créer une release automatiquement

### Méthode 1 : Via Git (Recommandée)

```bash
# 1. Mettez à jour la version dans src-tauri/Cargo.toml et src-tauri/tauri.conf.json
# Changez version "1.0.3" en "1.0.4"

# 2. Commitez les changements
git add .
git commit -m "chore: bump version to 1.0.4"
git push origin main

# 3. Créez et pushez le tag
git tag v1.0.4
git push origin v1.0.4
```

### Méthode 2 : Via GitHub Web UI

1. Allez sur **Releases** → **Draft a new release**
2. Entrez le tag : `v1.0.4`
3. Cliquez **"Publish release"**
4. Le workflow se lance automatiquement ! 🚀

---

## 📊 Le workflow fait automatiquement :

✅ **Build l'application** Tauri sur Windows
✅ **Signe les fichiers** .msi avec votre clé privée
✅ **Génère `latest.json`** avec :
   - Version
   - Signature cryptographique
   - URL de téléchargement
   - Timestamp

✅ **Upload tout** dans la release GitHub
✅ **Vérifie** que tous les fichiers sont présents

---

## ✨ Résultat final dans la release

La release contiendra :
```
📦 v1.0.4
├── Matrix_1.0.4_x64-setup.exe
├── Matrix_1.0.4_x64-setup.exe.sig
├── Matrix_1.0.4_x64_en-US.msi
├── Matrix_1.0.4_x64_en-US.msi.sig
└── latest.json  ✅ (généré automatiquement)
```

Votre app détectera automatiquement cette mise à jour ! 🎉

---

## 🔍 Vérifier le workflow

1. Allez sur **Actions** dans votre repo
2. Cliquez sur le workflow en cours
3. Vérifiez que toutes les étapes sont ✅
4. Vérifiez que `latest.json` est en téléchargement dans la release

---

## ⚠️ Troubleshooting

**"Secrets not found"**
→ Vérifiez que les secrets TAURI_SIGNING_PRIVATE_KEY et TAURI_SIGNING_PRIVATE_KEY_PASSWORD sont définis

**"MSI files not found"**
→ Le build Tauri a échoué, vérifiez les logs du workflow

**"latest.json not generated"**
→ Vérifiez que le format JSON est correct et que les fichiers existent

