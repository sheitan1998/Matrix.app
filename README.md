**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
VITE_BASE44_FUNCTIONS_VERSION=prod

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://matrix-hub.app
VITE_BASE44_FUNCTIONS_VERSION=prod
```

Run the app: `npm run dev`

### Rocket League

The `/rocket-league` item shop and **Custom Preset / Garage** use the checked-in
MATRIX catalogue and remain available offline. The garage covers bodies, paints,
finishes, wheels, decals, and goal explosions. Presets and the current draft are
stored locally under the versioned key `matrix:rocket-league:garage:v1`; corrupt or
unavailable browser storage safely falls back to an empty usable garage, and up to
50 named presets are retained.

Player lookup is the only Tracker Network integration. Configure the server-side
`TRN_API_KEY` environment variable; it is sent only by `rocketLeagueApi` using the
`TRN-Api-Key` header and is never exposed to the browser. Run the focused tests with:

```sh
npm run test:rocket-league
```

### Catalogue Farming Simulator 25

La route canonique `/farming` présente une sélection du ModHub officiel classée par
catégories. Un mod peut être partagé avec `/farming?mod=ID`; le bouton retour ferme
la modale avant de quitter le catalogue.

- Les images et ZIP restent hébergés par GIANTS. Les fonctions backend valident
  strictement les hôtes `cdnN.giants-software.com`, les chemins ModHub, les types,
  les redirections et les tailles (5 Mio par image, 2 Gio par ZIP).
- Le proxy d'images applique une limite de débit et un cache mémoire borné. Les ZIP
  sont diffusés sans mise en cache et sans exposer de redirection au navigateur.
- La traduction anglais/allemand vers le français utilise l'intégration LLM Base44
  côté serveur, avec limite de débit, taille d'entrée et erreurs explicites. Aucun
  secret ni appel direct au fournisseur de traduction n'est envoyé au client.
- Le catalogue est une sélection des premières pages des filtres publics ModHub,
  pas un miroir exhaustif. Une catégorie ou un téléchargement refusé/absent chez
  GIANTS est signalé comme indisponible; l'application ne contourne pas ces limites.

Tests ciblés : `npm run test:fs25`.

### Univers Dofus

La route `/dofus` propose trois modules alimentés par DofusDB :

- un catalogue avec filtres combinables par thème, catégories d'équipement, niveaux et recherche instantanée ;
- un builder de stuff à 16 emplacements, avec règles de type, statistiques en temps réel et presets stockés localement dans le navigateur ;
- les 19 classes, leurs visuels et leurs sorts/rangs/effets disponibles dans la source.

Les classes et sorts n'utilisent pas de données de remplacement : une indisponibilité de DofusDB est signalée explicitement. Le catalogue conserve uniquement son instantané de référence existant pour assurer un affichage dégradé. Les contrôles ciblés du builder s'exécutent avec `npm run test:dofus`.

### Fortnite maps and cosmetics

- Creative and UEFN map details have canonical shareable URLs at `/fortnite-maps/:mapCode`.
- Cosmetic details have canonical shareable URLs at `/fortnite-cosmetics/:cosmeticId`.
- Opening one of these URLs resolves and opens the matching detail dialog. Opening, closing, and selecting related cosmetics keeps browser history synchronized.
- Map discovery uses the existing 15-minute Fortnite API cache and serves lightweight thumbnails in grids, while detail dialogs retain the source image. Cosmetic media is loaded from the existing Fortnite-API sources; no media or descriptive content is republished outside those source fields.
- Run the focused route contract tests with `npm run test:fortnite`.

### Desktop OAuth & OTA updates (Tauri)

- OAuth desktop flow now uses the canonical callback `https://matrix-hub.app/oauth/callback`, then forwards desktop returns via deep link `matrix://oauth/callback`.
- Tauri updater checks `https://matrix-hub.app/updates/latest.json` first.
- During release workflow, `latest.json` is generated automatically with `npm run tauri:generate-latest-json` and uploaded as a release asset.

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
