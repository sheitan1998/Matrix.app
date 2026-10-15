import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Save, Trash2 } from 'lucide-react';
import RocketLeagueImage from '@/components/tuto-gaming/RocketLeagueImage';
import { getLocalRocketLeagueCatalog } from '../../../base44/shared/rocketLeagueCatalog';
import {
  EMPTY_ROCKET_SELECTION,
  loadRocketGarage,
  normalizeRocketSelection,
  saveRocketGarage,
} from '@/components/tuto-gaming/rocketLeaguePresetStorage';

const CATEGORY_DETAILS = [
  { key: 'body', label: 'Carrosserie' },
  { key: 'paint', label: 'Peinture' },
  { key: 'finish', label: 'Finition' },
  { key: 'decal', label: 'Sticker' },
  { key: 'wheels', label: 'Roues' },
  { key: 'goalExplosion', label: 'Explosion de but' },
];

const LOCAL_CATALOG = getLocalRocketLeagueCatalog();

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

export default function RocketLeagueGarage() {
  const storageRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);
  const [selection, setSelection] = useState(() => normalizeRocketSelection(EMPTY_ROCKET_SELECTION));
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [message, setMessage] = useState('');
  const [storageError, setStorageError] = useState(false);

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

  const garage = LOCAL_CATALOG.garage;
  const resolved = Object.fromEntries(
    CATEGORY_DETAILS.map(({ key }) => [key, selectedItem(garage[key] || [], selection[key])]),
  );
  const paint = resolved.paint || garage.paint[0];
  const finish = resolved.finish || garage.finish[0];

  function choose(key, id) {
    setSelection(current => ({ ...current, [key]: id }));
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
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
      name: name.slice(0, 80),
      selection: normalizeRocketSelection(selection),
      savedAt: new Date().toISOString(),
    };
    setPresets(current => [...current.filter(item => item.name !== preset.name), preset].slice(-50));
    setMessage('Preset enregistré sur cet appareil.');
  }

  function loadPreset(preset) {
    setSelection(normalizeRocketSelection(preset.selection));
    setPresetName(preset.name);
    setMessage(`Preset « ${preset.name} » restauré.`);
  }

  return (
    <section aria-labelledby="rocket-garage-title" className="space-y-6">
      <div>
        <h2 id="rocket-garage-title" className="text-xl font-bold">Custom Preset / Garage</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Assemblez un preset depuis le catalogue local. L’aperçu est une composition MATRIX, pas un rendu en jeu.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          {CATEGORY_DETAILS.map(({ key, label }) => {
            const items = garage[key] || [];
            return (
              <fieldset key={key} className="rounded-2xl border bg-card p-4">
                <legend className="px-1 font-bold">{label}</legend>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map(item => {
                    const checked = selection[key] === item.id;
                    return (
                      <label
                        key={item.id}
                        className={`cursor-pointer overflow-hidden rounded-xl border bg-background transition ${checked ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/60'}`}
                      >
                        <input
                          type="radio"
                          name={key}
                          value={item.id}
                          checked={checked}
                          onChange={() => choose(key, item.id)}
                          className="sr-only"
                        />
                        <RocketLeagueImage
                          src={item.image}
                          alt=""
                          fallbackLabel={item.name}
                          accent={item.accent}
                          className="aspect-square w-full"
                        />
                        <span className="block p-2 text-xs font-semibold">{item.name}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div
              className="border-b p-4"
              style={{ borderColor: paint.accent, boxShadow: `inset 0 0 3rem ${paint.accent}33` }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu du preset</p>
              <RocketLeagueImage
                src={resolved.body?.image}
                alt={resolved.body ? `Carrosserie ${resolved.body.name}` : 'Aucune carrosserie sélectionnée'}
                fallbackLabel={resolved.body?.name || 'Choisissez une carrosserie'}
                accent={resolved.body?.accent || paint.accent}
                className="mt-3 aspect-video w-full rounded-xl"
              />
              <p className="mt-2 text-sm font-bold">{resolved.body?.name || 'Choisissez une carrosserie'}</p>
              <p className="text-xs text-muted-foreground">
                Peinture : {paint.name} · Finition : {finish.name}
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
                          alt=""
                          fallbackLabel={item.name}
                          accent={item.accent}
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
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <h3 className="font-bold">Mes presets</h3>
            <form onSubmit={savePreset} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="rocket-preset-name">Nom du preset</label>
              <input
                id="rocket-preset-name"
                maxLength={80}
                value={presetName}
                onChange={event => setPresetName(event.target.value)}
                placeholder="Nom du preset"
                className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                <Save aria-hidden="true" className="h-4 w-4" />
                Sauvegarder
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setSelection({ ...EMPTY_ROCKET_SELECTION });
                setMessage('Garage réinitialisé.');
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Réinitialiser
            </button>
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
