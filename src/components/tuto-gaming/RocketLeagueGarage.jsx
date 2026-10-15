import React, { useEffect, useRef, useState } from 'react';
import { ImageDown, RefreshCw, RotateCcw, Save, Share2, Trash2 } from 'lucide-react';
import RocketLeagueImage from '@/components/tuto-gaming/RocketLeagueImage';
import { captureRocketLeaguePreview } from '@/components/tuto-gaming/rocketLeaguePreviewCapture';
import useRocketLeagueCatalog from './useRocketLeagueCatalog';
import {
  createRocketPresetConfig,
  decodeRocketPresetConfig,
  EMPTY_ROCKET_SELECTION,
  encodeRocketPresetConfig,
  loadRocketGarage,
  normalizeRocketSelection,
  saveRocketGarage,
  safeRocketFilename,
} from '@/components/tuto-gaming/rocketLeaguePresetStorage';

const CATEGORY_DETAILS = [
  { key: 'body', label: 'Carrosserie' },
  { key: 'paint', label: 'Couleur' },
  { key: 'decal', label: 'Sticker' },
  { key: 'wheels', label: 'Roues' },
  { key: 'goalExplosion', label: 'Explosion de but' },
];

function selectedItem(items, id) {
  return items.find(item => item.id === id) || null;
}

function browserStorage() {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function downloadBlob(contents, type, filename) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function newPresetId() {
  return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}`;
}

function compatibleWithBody(item, bodyId) {
  return !item?.compatibleBodies?.length || !bodyId || item.compatibleBodies.includes(bodyId);
}

function selectionExistsInGarage(selection, garage) {
  return CATEGORY_DETAILS.every(({ key }) => {
    const id = selection[key];
    const items = garage[key] || [];
    return !id || !items.length || items.some(item => item.id === id);
  });
}

export default function RocketLeagueGarage({ requestedPreset = '', onPresetUrlError }) {
  const storageRef = useRef(null);
  const previewRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);
  const [selection, setSelection] = useState(() => normalizeRocketSelection(EMPTY_ROCKET_SELECTION));
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [message, setMessage] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [configId, setConfigId] = useState('');
  const [downloadingImage, setDownloadingImage] = useState(false);
  const {
    data: catalog,
    loading: catalogLoading,
    error: catalogError,
    retry: retryCatalog,
  } = useRocketLeagueCatalog();

  useEffect(() => {
    storageRef.current = browserStorage();
    const stored = loadRocketGarage(storageRef.current);
    setSelection(stored.draft);
    setPresets(stored.presets);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved = saveRocketGarage(storageRef.current, { draft: selection, presets });
    setStorageError(!saved);
  }, [hydrated, presets, selection]);

  useEffect(() => {
    if (!hydrated || catalogLoading || !requestedPreset) return;
    const parsed = decodeRocketPresetConfig(requestedPreset);
    if (!parsed || !selectionExistsInGarage(parsed.selection, catalog?.garage || {})) {
      setMessage('Le lien de preset est invalide.');
      onPresetUrlError?.();
      return;
    }
    setSelection(parsed.selection);
    setConfigId(parsed.config.id);
    setPresetName('Preset partagé');
    setMessage('Preset partagé chargé depuis le lien.');
  }, [catalog, catalogLoading, hydrated, onPresetUrlError, requestedPreset]);

  const garage = catalog?.garage || {};
  const resolved = Object.fromEntries(
    CATEGORY_DETAILS.map(({ key }) => [key, selectedItem(garage[key] || [], selection[key])]),
  );
  const paint = resolved.paint || garage.paint?.[0] || { name: 'Original', accent: '#334155' };
  const previewBody = resolved.body
    || (garage.body || []).find(item => item.name.toLowerCase() === 'octane')
    || null;

  function invalidateSharedPreset() {
    setConfigId('');
    onPresetUrlError?.();
  }

  function choose(key, id) {
    setSelection(current => {
      const next = { ...current, [key]: id };
      if (key === 'body') {
        const decal = selectedItem(garage.decal || [], current.decal);
        if (!compatibleWithBody(decal, id)) next.decal = null;
      }
      return next;
    });
    invalidateSharedPreset();
    setMessage('');
  }

  function savePreset(event) {
    event.preventDefault();
    const name = presetName.trim();
    if (!name) {
      setMessage('Donnez un nom au preset.');
      return;
    }
    const preset = {
      id: newPresetId(),
      name: name.slice(0, 80),
      selection: normalizeRocketSelection(selection),
      savedAt: new Date().toISOString(),
    };
    setPresets(current => [...current.filter(item => item.name !== preset.name), preset].slice(-50));
    setConfigId(preset.id);
    setMessage('Preset enregistré sur cet appareil.');
  }

  function loadPreset(preset) {
    setSelection(normalizeRocketSelection(preset.selection));
    setPresetName(preset.name);
    setConfigId(preset.id);
    setMessage(`Preset « ${preset.name} » restauré.`);
  }

  async function exportImage() {
    if (!previewRef.current || downloadingImage) return;
    setDownloadingImage(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const blob = await captureRocketLeaguePreview(previewRef.current, html2canvas);
      downloadBlob(blob, 'image/png', safeRocketFilename(presetName || 'preset-rocket-league', 'png'));
      setMessage('Image du preset téléchargée.');
    } catch {
      setMessage('Le rendu image n’a pas pu être téléchargé.');
    } finally {
      setDownloadingImage(false);
    }
  }

  async function copyShareLink() {
    const id = configId || newPresetId();
    const encoded = encodeRocketPresetConfig(createRocketPresetConfig(selection, id));
    const url = new URL('/rocket-league', window.location.origin);
    url.searchParams.set('preset', encoded);
    try {
      await navigator.clipboard.writeText(url.href);
      setConfigId(id);
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      setMessage('Lien de partage copié.');
    } catch {
      setMessage(`Lien de partage : ${url.href}`);
    }
  }

  return (
    <section aria-labelledby="rocket-garage-title" className="space-y-6">
      <div>
        <h2 id="rocket-garage-title" className="text-xl font-bold">Custom Preset / Garage</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Assemblez un preset depuis les métadonnées disponibles. L’aperçu 2D superpose les visuels autorisés quand la source en fournit.
        </p>
        {catalogLoading && (
          <p className="mt-2 inline-flex rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground" role="status">
            Catalogue en cours de chargement, aperçu local disponible.
          </p>
        )}
        {catalogError && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-destructive" role="alert">
            <p>{catalogError}</p>
            <button type="button" onClick={retryCatalog} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2">
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Réessayer
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          {CATEGORY_DETAILS.map(({ key, label }) => {
            const items = (garage[key] || []).filter(item => (
              key !== 'decal' || compatibleWithBody(item, selection.body)
            ));
            return (
              <fieldset key={key} className="rounded-2xl border bg-card p-4">
                <legend className="px-1 font-bold">{label}</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center">
                  <select
                    name={key}
                    value={selection[key] || ''}
                    onChange={event => choose(key, event.target.value || null)}
                    disabled={!items.length}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-60"
                  >
                    <option value="">Non sélectionné</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <RocketLeagueImage
                    src={resolved[key]?.image}
                    sources={resolved[key]?.images}
                    alt=""
                    fallbackLabel={resolved[key]?.name || `${label} non sélectionné`}
                    accent={resolved[key]?.accent}
                    className="aspect-video w-full rounded-lg sm:aspect-square"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {items.length ? `${items.length} choix disponibles` : 'Aucun choix disponible pour cette source.'}
                </p>
              </fieldset>
            );
          })}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div ref={previewRef} className="overflow-hidden rounded-2xl border bg-card">
            <div
              className="relative isolate overflow-hidden border-b p-4"
              style={{ borderColor: paint.accent, backgroundColor: `${paint.accent}22` }}
            >
              <RocketLeagueImage
                src={resolved.goalExplosion?.image}
                sources={resolved.goalExplosion?.images}
                alt=""
                showFallback={false}
                captureRemote={false}
                contain={false}
                className="absolute inset-0 -z-10 h-full w-full opacity-30"
              />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">APERÇU DU PRESET</p>
              <div className="relative mt-3 aspect-video overflow-hidden rounded-xl bg-background/70">
                <RocketLeagueImage
                  src={previewBody?.image}
                  sources={previewBody?.images}
                  alt={`Carrosserie ${previewBody?.name || 'Octane'}`}
                  fallbackLabel={previewBody?.name || 'Octane'}
                  accent={paint.accent}
                  captureRemote={false}
                  className="absolute inset-0 h-full w-full"
                />
                <RocketLeagueImage
                  src={resolved.decal?.image}
                  sources={resolved.decal?.images}
                  alt=""
                  showFallback={false}
                  captureRemote={false}
                  className="absolute inset-0 h-full w-full opacity-70 mix-blend-screen"
                />
                <RocketLeagueImage
                  src={resolved.wheels?.image}
                  sources={resolved.wheels?.images}
                  alt=""
                  showFallback={false}
                  captureRemote={false}
                  className="absolute bottom-0 left-[8%] h-1/3 w-1/3 drop-shadow-xl"
                />
                <RocketLeagueImage
                  src={resolved.wheels?.image}
                  sources={resolved.wheels?.images}
                  alt=""
                  showFallback={false}
                  captureRemote={false}
                  className="absolute bottom-0 right-[8%] h-1/3 w-1/3 drop-shadow-xl"
                />
              </div>
              <p className="mt-2 text-sm font-bold">{resolved.body?.name || 'Octane (aperçu par défaut)'}</p>
              <p className="text-xs text-muted-foreground">
                Couleur : {paint.name}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-2 p-4">
              {[
                ['Sticker', resolved.decal],
                ['Roues', resolved.wheels],
                ['Explosion', resolved.goalExplosion],
              ].map(([label, item]) => (
                <div key={label} className="min-w-0 rounded-lg bg-muted p-2">
                  <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
                  <dd className="mt-1">
                    {item ? (
                      <>
                        <RocketLeagueImage
                          src={item.image}
                          sources={item.images}
                          alt=""
                          fallbackLabel={item.name}
                          accent={item.accent}
                          captureRemote={false}
                          className="aspect-square w-full rounded-md"
                        />
                        <span className="mt-1 block truncate text-xs font-semibold">{item.name}</span>
                      </>
                    ) : (
                      <span className="block py-5 text-center text-xs text-muted-foreground">Non choisi</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <dl className="grid gap-x-4 gap-y-2 border-t p-4 text-xs sm:grid-cols-2">
              {[
                ['Carrosserie', resolved.body?.name || 'Non choisie'],
                ['Couleur', paint.name],
                ['Roues', resolved.wheels?.name || 'Non choisies'],
                ['Sticker', resolved.decal?.name || 'Non choisi'],
                ['Explosion', resolved.goalExplosion?.name || 'Non choisie'],
              ].map(([label, value]) => (
                <div key={label} className="flex min-w-0 justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="truncate font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <h3 className="font-bold">Mes presets</h3>
            <form onSubmit={savePreset} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="rocket-preset-name">Nom du preset</label>
              <input
                id="rocket-preset-name"
                maxLength={80}
                value={presetName}
                onChange={event => {
                  setPresetName(event.target.value);
                  invalidateSharedPreset();
                }}
                placeholder="Nom du preset"
                className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                <Save aria-hidden="true" className="h-4 w-4" />
                Enregistrer
              </button>
            </form>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={copyShareLink} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Share2 aria-hidden="true" className="h-4 w-4" />Partager</button>
              <button type="button" disabled={downloadingImage} onClick={exportImage} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"><ImageDown aria-hidden="true" className="h-4 w-4" />Image</button>
              <button
                type="button"
                onClick={() => {
                  setSelection({ ...EMPTY_ROCKET_SELECTION });
                  invalidateSharedPreset();
                  setMessage('Garage réinitialisé.');
                }}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Réinitialiser
              </button>
            </div>
            {message && <p className="mt-3 text-xs text-muted-foreground" role="status">{message}</p>}
            {storageError && (
              <p className="mt-3 text-xs text-destructive" role="alert">
                La sauvegarde locale a échoué. Vérifiez que le stockage du navigateur est autorisé.
              </p>
            )}
            {presets.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">Aucun preset enregistré sur cet appareil.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {presets.map(preset => (
                  <li key={preset.id} className="flex items-center gap-2 rounded-lg bg-muted p-2">
                    <button type="button" onClick={() => loadPreset(preset)} className="min-w-0 flex-1 truncate text-left text-sm font-semibold">
                      {preset.name}
                    </button>
                    <button
                      type="button"
                      aria-label={`Supprimer ${preset.name}`}
                      onClick={() => setPresets(current => current.filter(item => item.id !== preset.id))}
                      className="rounded p-2 hover:bg-background"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

    </section>
  );
}
