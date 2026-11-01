import React, { useEffect, useRef, useState } from 'react';
import { ImageDown, RefreshCw, RotateCcw, Save, Share2, Trash2 } from 'lucide-react';
import RocketLeagueShopCard from '@/components/tuto-gaming/RocketLeagueShopCard';
import RocketLeagueShopItemModal from '@/components/tuto-gaming/RocketLeagueShopItemModal';
import RocketLeaguePaintSwatches, { ROCKET_PAINTS } from '@/components/tuto-gaming/RocketLeaguePaintSwatches';
import useRocketLeagueCatalog from './useRocketLeagueCatalog';
import { captureRocketLeaguePreview } from '@/components/tuto-gaming/rocketLeaguePreviewCapture';
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
  const [detailItem, setDetailItem] = useState(null);
  const [paintId, setPaintId] = useState('default');
  const { data: catalog, loading, error, retry } = useRocketLeagueCatalog();

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
    if (!hydrated || loading || !requestedPreset) return;
    const parsed = decodeRocketPresetConfig(requestedPreset);
    if (!parsed) { setMessage('Le lien de preset est invalide.'); onPresetUrlError?.(); return; }
    setSelection(parsed.selection);
    setConfigId(parsed.config.id);
    setPresetName('Preset partagé');
    setMessage('Preset partagé chargé depuis le lien.');
  }, [catalog, loading, hydrated, onPresetUrlError, requestedPreset]);

  const garage = catalog?.garage || {};
  const resolved = Object.fromEntries(
    CATEGORY_DETAILS.map(({ key }) => [key, selectedItem(garage[key] || [], selection[key])]),
  );
  const selectedPaint = ROCKET_PAINTS.find(p => p.id === paintId);
  const overlayColor = selectedPaint?.color;

  function invalidateSharedPreset() { setConfigId(''); onPresetUrlError?.(); }

  function choose(key, id) {
    setSelection(current => ({ ...current, [key]: id }));
    invalidateSharedPreset();
    setMessage('');
  }

  function savePreset(event) {
    event.preventDefault();
    const name = presetName.trim();
    if (!name) { setMessage('Donnez un nom au preset.'); return; }
    const preset = { id: newPresetId(), name: name.slice(0, 80), selection: normalizeRocketSelection(selection), savedAt: new Date().toISOString() };
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
      setMessage("Le rendu image n'a pas pu être téléchargé.");
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
        <p className="text-xs text-muted-foreground">Données en temps réel via itemshop.gg</p>
        {loading && (
          <p className="mt-2 inline-flex rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground" role="status">
            Chargement du catalogue…
          </p>
        )}
        {error && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-destructive" role="alert">
            <p>{error}</p>
            <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2">
              <RefreshCw className="h-4 w-4" /> Réessayer
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          {CATEGORY_DETAILS.map(({ key, label }) => {
            const items = garage[key] || [];
            return (
              <fieldset key={key} className="rounded-2xl border bg-card p-4">
                <legend className="px-1 font-bold">{label}</legend>
                <p className="mb-2 text-xs text-muted-foreground">{items.length} choix disponibles</p>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun objet disponible.</p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                    {items.map(item => (
                      <div key={item.id} className="shrink-0 w-32">
                        <RocketLeagueShopCard
                          item={item}
                          onSelect={id => choose(key, id)}
                          selected={selection[key] === item.id}
                          onOpen={setDetailItem}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div id="preset-preview-box" ref={previewRef} className="overflow-hidden rounded-2xl border bg-card">
            <div className="relative isolate overflow-hidden border-b p-4" style={{ borderColor: '#3b82f6', backgroundColor: '#3b82f622' }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">APERÇU DU PRESET</p>
              <div className="relative mt-3 aspect-video overflow-hidden rounded-xl bg-background/70">
                {resolved.body?.image ? (
                  <img src={resolved.body.image} alt={resolved.body.name} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-contain" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Aucune carrosserie sélectionnée</div>
                )}
                {overlayColor && (
                  <div className="absolute inset-0 pointer-events-none" style={{ background: overlayColor, mixBlendMode: 'multiply', opacity: 0.45 }} />
                )}
                {resolved.decal?.image && (
                  <img src={resolved.decal.image} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-contain opacity-70 mix-blend-screen" />
                )}
                {resolved.wheels?.image && (
                  <>
                    <img src={resolved.wheels.image} alt="" referrerPolicy="no-referrer" className="absolute bottom-0 left-[8%] h-1/3 w-1/3 object-contain drop-shadow-xl" />
                    <img src={resolved.wheels.image} alt="" referrerPolicy="no-referrer" className="absolute bottom-0 right-[8%] h-1/3 w-1/3 object-contain drop-shadow-xl" />
                  </>
                )}
              </div>
              <p className="mt-2 text-sm font-bold">{resolved.body?.name || 'Aucune carrosserie'}</p>
              <p className="text-xs text-muted-foreground">Peinture: {selectedPaint?.name || 'Par défaut'}</p>
            </div>

            <div className="p-4">
              <p className="mb-2 text-xs font-bold text-muted-foreground">Peinture / Variante</p>
              <RocketLeaguePaintSwatches selected={paintId} onSelect={setPaintId} />
            </div>

            <dl className="grid gap-x-4 gap-y-2 border-t p-4 text-xs sm:grid-cols-2">
              {[
                ['Carrosserie', resolved.body?.name || 'Non choisie'],
                ['Peinture', selectedPaint?.name || 'Par défaut'],
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
                onChange={event => { setPresetName(event.target.value); invalidateSharedPreset(); }}
                placeholder="Nom du preset"
                className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </form>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={copyShareLink} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Share2 className="h-4 w-4" />Partager</button>
              <button type="button" disabled={downloadingImage} onClick={exportImage} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"><ImageDown className="h-4 w-4" />Image</button>
              <button type="button" onClick={() => { setSelection({ ...EMPTY_ROCKET_SELECTION }); invalidateSharedPreset(); setMessage('Garage réinitialisé.'); }} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <RotateCcw className="h-4 w-4" />Réinitialiser
              </button>
            </div>
            {message && <p className="mt-3 text-xs text-muted-foreground" role="status">{message}</p>}
            {storageError && <p className="mt-3 text-xs text-destructive" role="alert">La sauvegarde locale a échoué.</p>}
            {presets.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">Aucun preset enregistré sur cet appareil.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {presets.map(preset => (
                  <li key={preset.id} className="flex items-center gap-2 rounded-lg bg-muted p-2">
                    <button type="button" onClick={() => loadPreset(preset)} className="min-w-0 flex-1 truncate text-left text-sm font-semibold">{preset.name}</button>
                    <button type="button" aria-label={`Supprimer ${preset.name}`} onClick={() => setPresets(current => current.filter(item => item.id !== preset.id))} className="rounded p-2 hover:bg-background">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {detailItem && <RocketLeagueShopItemModal item={detailItem} onClose={() => setDetailItem(null)} />}
    </section>
  );
}