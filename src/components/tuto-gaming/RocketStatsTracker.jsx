import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RocketRankResults from '@/components/tuto-gaming/RocketRankResults';
const PLAYER_NOT_FOUND_MESSAGE = 'Joueur introuvable ou profil privé';
export default function RocketStatsTracker() {
  const [platform,setPlatform]=useState('epic');
  const [gamertag,setGamertag]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [stats,setStats]=useState(null);
  async function submit(e){e.preventDefault();if(loading)return;setError('');setStats(null);if(!gamertag.trim()){setError('Saisissez un pseudo.');return;}setLoading(true);
    try{const {data}=await base44.functions.invoke('rocketLeagueApi',{action:'getPlayerStats',platform,gamertag:gamertag.trim()});if(data?.error)setError(PLAYER_NOT_FOUND_MESSAGE);else if(data)setStats(data);else setError(PLAYER_NOT_FOUND_MESSAGE);}
    catch{setError(PLAYER_NOT_FOUND_MESSAGE);}
    finally{setLoading(false);}
  }
  return <section className="max-w-3xl space-y-4"><h2 className="text-xl font-bold">Tracker de statistiques</h2>
    <form onSubmit={submit} className="flex flex-wrap gap-2"><select aria-label="Plateforme" disabled={loading} value={platform} onChange={e=>setPlatform(e.target.value)} className="px-3 py-3 rounded-lg border bg-card">{[['epic','Epic Games'],['steam','Steam'],['psn','PlayStation'],['xbox','Xbox']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><input aria-label="Pseudo du joueur" disabled={loading} value={gamertag} onChange={e=>setGamertag(e.target.value)} placeholder={platform==='steam'?'Steam ID 64 ou pseudo':'Pseudo du joueur'} maxLength={100} className="flex-1 min-w-48 px-3 py-3 rounded-lg border bg-card"/><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Rechercher</button></form>
    <p className="text-xs text-muted-foreground">Rangs 1v1, 2v2 et 3v3 fournis par Tracker Network. Les profils privés ne sont pas accessibles.</p>
    {error&&<p role="alert" className="border border-destructive rounded-lg bg-muted p-4 text-sm text-destructive">{error}</p>}
    {stats&&<RocketRankResults stats={stats}/>}
  </section>;
}