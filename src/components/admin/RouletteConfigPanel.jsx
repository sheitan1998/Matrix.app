import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_ROULETTE_CONFIG,
  ROULETTE_CONFIG_FIELDS,
  mergeRouletteConfig,
} from '@/lib/rouletteConfig';

function RangeRow({ label, hint, value, min, max, onChange }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-white/80">{label}</span>
        <span className="font-mono text-[11px] font-black text-amber-200">{value}%</span>
      </div>
      {hint && <p className="text-[9px] text-white/35">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1.5 w-full accent-amber-400"
      />
    </label>
  );
}

function MessageField({ label, hint, value, onChange }) {
  return (
    <label className="block">
      <p className="text-[11px] font-bold text-white/80">{label}</p>
      <p className="mb-1 text-[9px] text-white/35">{hint}</p>
      <textarea
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white outline-none focus:border-amber-400/60"
      />
    </label>
  );
}

const SECTIONS = [
  {
    title: 'Affichage de la roue',
    fields: [{ key: 'wheel_scale', label: 'Échelle globale de la roue', min: 60, max: 160 }],
  },
  {
    title: 'Panneau de mises',
    hint: 'Positions en % de l’écran (vue desktop).',
    fields: [
      { key: 'bet_panel_pos_x', label: 'Position horizontale', hint: '0 = gauche, 100 = droite', min: 0, max: 100 },
      { key: 'bet_panel_pos_y', label: 'Position verticale', hint: '0 = haut, 100 = bas', min: 0, max: 100 },
      { key: 'bet_panel_scale', label: 'Échelle du panneau', min: 60, max: 160 },
    ],
  },
  {
    title: 'Boutons de l’interface',
    hint: 'Mises rapides, total misé et bouton de lancer.',
    fields: [
      { key: 'controls_pos_x', label: 'Position horizontale', hint: '0 = gauche, 100 = droite', min: 0, max: 100 },
      { key: 'controls_pos_y', label: 'Position verticale', hint: '0 = haut, 100 = bas', min: 0, max: 100 },
      { key: 'controls_scale', label: 'Échelle des boutons', min: 60, max: 160 },
    ],
  },
];

const MESSAGES = [
  {
    key: 'dealer_message_greeting',
    label: 'Réplique d’accueil',
    hint: 'Affichée avant le premier lancer.',
  },
  {
    key: 'dealer_message_win',
    label: 'Réplique gagnante',
    hint: 'Variables : {n} = numéro, {details} = couleur/parité, {gain} = gain.',
  },
  {
    key: 'dealer_message_lose',
    label: 'Réplique perdante',
    hint: 'Variables : {n} = numéro, {details} = couleur/parité.',
  },
  {
    key: 'dealer_message_zero',
    label: 'Réplique zéro',
    hint: 'Affichée quand la bille tombe sur le 0.',
  },
];

export default function RouletteConfigPanel() {
  const [config, setConfig] = useState(DEFAULT_ROULETTE_CONFIG);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    base44.entities.RouletteConfig.list('-created_date', 1)
      .then((records) => {
        if (cancelled) return;
        if (records?.[0]) {
          setRecordId(records[0].id);
          setConfig(mergeRouletteConfig(records[0]));
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger la configuration roulette');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    const payload = ROULETTE_CONFIG_FIELDS.reduce(
      (data, field) => ({ ...data, [field]: config[field] }),
      {},
    );
    try {
      if (recordId) {
        await base44.entities.RouletteConfig.update(recordId, payload);
      } else {
        const created = await base44.entities.RouletteConfig.create(payload);
        setRecordId(created.id);
      }
      toast.success('Configuration de la roulette enregistrée');
    } catch {
      toast.error('Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 p-4" style={{ background: 'rgba(15,10,25,0.6)' }}>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-white">Roulette Nexus</h3>
          <p className="text-[10px] text-white/40">Taille de la roue, positions des panneaux et répliques de la croupière.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfig({ ...DEFAULT_ROULETTE_CONFIG })}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/70"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-black text-black disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f6e0a0, #d9a63c)' }}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-2xl border border-white/10 p-4" style={{ background: 'rgba(15,10,25,0.6)' }}>
            <h4 className="mb-1 text-xs font-black uppercase tracking-tight text-white">{section.title}</h4>
            {section.hint && <p className="mb-3 text-[9px] text-white/35">{section.hint}</p>}
            <div className="space-y-3">
              {section.fields.map((field) => (
                <RangeRow
                  key={field.key}
                  label={field.label}
                  hint={field.hint}
                  value={Number(config[field.key]) || 0}
                  min={field.min}
                  max={field.max}
                  onChange={(value) => set(field.key, value)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-white/10 p-4 md:col-span-2" style={{ background: 'rgba(15,10,25,0.6)' }}>
          <h4 className="mb-1 text-xs font-black uppercase tracking-tight text-white">Croupière — bulle de dialogue</h4>
          <p className="mb-3 text-[9px] text-white/35">Les répliques personnalisées remplacent les messages par défaut.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {MESSAGES.map((message) => (
              <MessageField
                key={message.key}
                label={message.label}
                hint={message.hint}
                value={config[message.key] || ''}
                onChange={(value) => set(message.key, value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}