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

### Univers Dofus

La route `/dofus` propose trois modules alimentés par DofusDB :

- un catalogue avec filtres combinables par thème, catégories d'équipement, niveaux et recherche instantanée ;
- un builder de stuff à 16 emplacements, avec règles de type, statistiques en temps réel et presets stockés localement dans le navigateur ;
- les 19 classes, leurs visuels et leurs sorts/rangs/effets disponibles dans la source.

Les classes et sorts n'utilisent pas de données de remplacement : une indisponibilité de DofusDB est signalée explicitement. Le catalogue conserve uniquement son instantané de référence existant pour assurer un affichage dégradé. Les contrôles ciblés du builder s'exécutent avec `npm test`.

### Desktop OAuth & OTA updates (Tauri)

- OAuth desktop flow now uses the canonical callback `https://matrix-hub.app/oauth/callback`, then forwards desktop returns via deep link `matrix://oauth/callback`.
- Tauri updater checks `https://matrix-hub.app/updates/latest.json` first.
- During release workflow, `latest.json` is generated automatically with `npm run tauri:generate-latest-json` and uploaded as a release asset.

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
