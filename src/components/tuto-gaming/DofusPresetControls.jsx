import React, { useState } from 'react';
import { Download, RotateCcw, Save, Trash2 } from 'lucide-react';
import { downloadPreset, normalizeEquipment } from '@/components/tuto-gaming/dofusBuilderMath';

const KEY='matrix:dofus:presets:v2';
const LEGACY_KEY='matrix:dofus:presets:v1';

function readPresets() {
  try {
    const value=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)||'[]');
    if(!Array.isArray(value))return [];
    return value.filter(preset=>preset&&typeof preset.name==='string'&&preset.equipment).map(preset=>({...preset,equipment:normalizeEquipment(preset.equipment)}));
  } catch {
    return [];
  }
}

export default function DofusPresetControls({equipment,onLoad,totals}){
  const [name,setName]=useState('');
  const [message,setMessage]=useState('');
  const [presets,setPresets]=useState(readPresets);

  function persist(next) {
    try {
      localStorage.setItem(KEY,JSON.stringify(next));
      setPresets(next);
      return true;
    } catch {
      setMessage('La sauvegarde locale a échoué. Vous pouvez exporter le preset en JSON.');
      return false;
    }
  }
  function save(event) {
    event.preventDefault();
    if(!name.trim()){setMessage('Donnez un nom à votre preset.');return;}
    const preset={id:crypto.randomUUID(),name:name.trim(),equipment:normalizeEquipment(equipment),savedAt:new Date().toISOString(),version:2};
    if(!persist([...presets.filter(value=>value.name!==preset.name),preset]))return;
    setMessage('Preset enregistré sur cet appareil.');
  }

  return <section className="space-y-3 rounded-xl border bg-card p-4">
    <h3 className="font-bold">Mes presets</h3>
    <form onSubmit={save} className="flex flex-wrap gap-2">
      <input aria-label="Nom du preset" maxLength={80} value={name} onChange={event=>setName(event.target.value)} placeholder="Nom du stuff" className="flex-1 min-w-40 rounded-lg border bg-background px-3 py-2"/>
      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg" type="submit"><Save aria-hidden="true" className="w-4 h-4"/>Sauvegarder</button>
      <button type="button" onClick={()=>downloadPreset({name:name.trim()||'stuff-dofus',equipment:normalizeEquipment(equipment),totals})} className="flex items-center gap-2 rounded-lg border px-3 py-2"><Download aria-hidden="true" className="w-4 h-4"/>Exporter JSON</button>
      <button type="button" onClick={()=>{onLoad({});setMessage('Stuff vidé.');}} className="flex items-center gap-2 rounded-lg border px-3 py-2"><RotateCcw aria-hidden="true" className="w-4 h-4"/>Vider</button>
    </form>
    {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}
    {presets.length===0?<p className="text-xs text-muted-foreground">Sauvegarde locale dans ce navigateur. Aucun preset enregistré.</p>:<ul className="space-y-2">{presets.map(preset=><li key={preset.id} className="flex gap-2 items-center rounded-lg bg-muted p-2"><button type="button" onClick={()=>{onLoad(preset.equipment);setName(preset.name);setMessage('Preset chargé.');}} className="flex-1 text-left text-sm">{preset.name}<span className="block text-xs text-muted-foreground">{Object.keys(preset.equipment).length}/16 emplacements</span></button><button type="button" aria-label={`Supprimer ${preset.name}`} onClick={()=>persist(presets.filter(value=>value.id!==preset.id))}><Trash2 aria-hidden="true" className="w-4 h-4"/></button></li>)}</ul>}
  </section>;
}
