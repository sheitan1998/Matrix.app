# Images : optimisation et migration vers Cloudflare R2

## Variables d'environnement

**Backend Base44 (secrets de la fonction `r2Upload`)** : `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL` (domaine custom/CDN du bucket recommandé), `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, optionnel `R2_MAX_UPLOAD_MB` (défaut 8, utilisateurs non-admin).

**Script de migration** : les 5 `R2_*` ci-dessus + `BASE44_APP_ID`, `BASE44_TOKEN` (token d'un admin), optionnel `BASE44_SERVER_URL`.

## Upload côté app

`uploadOptimizedImage(file, { usage })` (`src/lib/imageStorage.js`) redimensionne en WebP sans déformation ni agrandissement
(galerie/annonce 1600 px, vignette 400 px, icône 256 px), puis envoie sur R2 ; si R2 échoue, fallback sur `UploadPublicFile`.
GIF, SVG, vidéos et images animées ne sont jamais modifiés. Les utilisateurs non-admin peuvent uploader des images uniquement
dans `gallery, listings, visuals, icons, thumbs, uploads` (taille limitée et signée dans l'URL présignée).

## Migration par lot

```bash
node scripts/migrate-images-to-r2.mjs --dry-run                 # simulation, rien n'est écrit
node scripts/migrate-images-to-r2.mjs --entity Listing --limit 20
node scripts/migrate-images-to-r2.mjs                           # toutes les entités
node scripts/migrate-images-to-r2.mjs --rollback migration-output/rollback.json
```

Sécurités : les anciens fichiers ne sont jamais supprimés ; clé R2 déterministe (relancer est idempotent) ;
les références ne sont mises à jour qu'après upload vérifié (taille R2 + HEAD sur l'URL publique) ;
`migration-output/url-map.json` (ancien → nouveau), `rollback.json` (valeurs précédentes) et `report.json` (gains) sont écrits.
Les images déjà sur R2, GIF/SVG/vidéos/animés et les images qui ne s'allègent pas sont ignorés.
Entités/champs traités : voir `TARGETS` dans le script.
