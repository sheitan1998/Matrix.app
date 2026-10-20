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

The `/rocket-league` item shop and **Custom Preset / Garage** use a paginated,
cached server-side catalogue. Epic Games and Epic Online Services do not publish
a generally available Rocket League cosmetics, shop, garage, price, or media API.
For an explicitly approved Epic/Psyonix partner integration,
`ROCKET_LEAGUE_EPIC_CATALOG_URL` must contain the granted HTTPS endpoint and
`ROCKET_LEAGUE_EPIC_ACCESS_TOKEN` its server-side bearer credential.
`ROCKET_LEAGUE_IMAGE_HOSTS` is the exact comma-separated allowlist of official
media hosts authorized by that agreement. The credential needs permission to
read Rocket League item definitions and painted variants; shop or player-garage
scopes are additionally required only if the granted endpoint returns those
resources. These variables belong to the Base44 function environment and must
never use the `VITE_` prefix or be returned to the browser.

Allowed item images are attempted directly, then through the internal
`/api/rocket-league-proxy` Base44 route. That proxy is not public-purpose: it accepts
POST only, revalidates the exact host allowlist on every redirect, propagates
intentional upstream access denials, resolves DNS
and rejects private/reserved addresses, applies rate limiting and timeouts, and
accepts only PNG/JPEG/WebP/AVIF responses up to 8 MiB. Successful responses are
cached for one day and expose `X-Proxy-Cache: HIT` or `MISS`; only a cache hit
avoids upstream latency. Configure only image hosts for which the project has an
explicit redistribution or hotlinking right.

When that partner feed is absent, unauthorized, rate-limited, or unavailable,
the response exposes an `epic_*` fallback reason and the server uses the pinned LGPL metadata
snapshot `@rocketleagueapi/items` v3.2.16 from its versioned GitHub URL. It was
extracted from game data in October 2024 and is not an official or live Psyonix
API. TRN only supplies player statistics; BakkesMod exposes local game data rather
than a hosted API; RL Garage has no documented public catalogue API or image reuse
grant. No public official Rocket League item-image CDN is available, so MATRIX
does not hotlink RL Garage or fabricate official HD URLs. Sources without an
explicitly allowlisted image host use a stable typographic MATRIX card showing
the item name, localized category, rarity, and catalog price. No generated
vehicle, silhouette, monogram, or placeholder is presented as an official image.
The pinned community snapshot contains item metadata but no image URLs; BakkesMod
thumbnail fields are local Unreal asset identifiers rather than public web URLs.

The catalog groups painted definitions under their primary model; paint variants
provide `paint_id`, `color_name`, `color_hex`, nullable `image_url`, and
`estimated_credits`. Paints are selectors, not standalone catalog cards. The
garage covers bodies, wheels, decals, and goal explosions. Presets
and the current draft are stored locally under the versioned key
`matrix:rocket-league:garage:v2`; v1 data is migrated on read, corrupt or
unavailable browser storage safely falls back to an empty usable garage, and up
to 50 named presets are retained. Share links contain a validated, size-limited,
base64url configuration at `/rocket-league?preset=...` and require no server
record. Missing provider prices are deterministic catalog estimates, clearly
labelled in the UI and derived from normalized rarity bands rather than presented
as live market prices. PNG export captures only the **APERÇU DU PRESET** block
identified by `#preset-preview-box`, whose local typographic fallback
fallback remains capture-safe even when a remote image is absent, broken, too
slow, or blocked by CORS.

Player lookup is the only Tracker Network integration. Configure the server-side
`TRN_API_KEY` environment variable; it is sent only by `rocketLeagueApi` using the
official `TRN-Api-Key` header and is never exposed to the browser. Epic, Steam,
PSN, and Xbox (`xbl`) identifiers are encoded server-side. MATRIX displays only
the overview and ranked segments TRN actually returns, including 1v1, 2v2, 3v3,
and tournament details when present. Private profiles, API-key rejection, missing
players, rate limits, timeouts, and upstream outages remain distinct errors.
TRN access requires an approved key and remains subject to Tracker Network's
rate limits and API terms; without one, the UI reports that the tracker is not
configured rather than inventing statistics. Run the focused tests with:

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
- l’Almanax du jour (Méryde, offrande et bonus), avec un instantané daté explicite
  lorsque la source publique est indisponible.

Les classes et sorts n'utilisent pas de données de remplacement : une indisponibilité de DofusDB est signalée explicitement. Le catalogue conserve uniquement son instantané de référence existant pour assurer un affichage dégradé. Les contrôles ciblés du builder s'exécutent avec `npm run test:dofus`.

### Fortnite maps and cosmetics

- Creative and UEFN map details have canonical shareable URLs at `/fortnite-maps/:mapCode`.
- Cosmetic details have canonical shareable URLs at `/fortnite-cosmetics/:cosmeticId`.
- Opening one of these URLs resolves and opens the matching detail dialog. Opening, closing, and selecting related cosmetics keeps browser history synchronized.
- Map discovery uses the existing 15-minute Fortnite API cache and serves lightweight thumbnails in grids, while detail dialogs retain the source image. Cosmetic media is loaded from the existing Fortnite-API sources; no media or descriptive content is republished outside those source fields.
- Player statistics use `fortnite-api.com` from the `fortniteApi` server function.
  Configure `fortnite_api_key` in the server-only `FortniteConfig` entity through
  the existing admin configuration. Missing, invalid, rate-limited, private and
  unavailable states are returned explicitly; no key or invented statistic is sent
  to the client.
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
