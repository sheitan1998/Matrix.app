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
