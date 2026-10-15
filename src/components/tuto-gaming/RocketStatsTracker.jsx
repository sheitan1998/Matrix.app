import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RocketRankResults from '@/components/tuto-gaming/RocketRankResults';
const PLAYER_NOT_FOUND_MESSAGE = 'Joueur introuvable ou profil privé';
const ERROR_MESSAGES = {
  missing_api_key: 'Le tracker Rocket League n’est pas configuré par l’administrateur.',
  rate_limited: 'Trop de recherches. Réessayez dans quelques minutes.',
  not_found: PLAYER_NOT_FOUND_MESSAGE,
  private_or_forbidden: PLAYER_NOT_FOUND_MESSAGE,
  malformed_or_private_profile: PLAYER_NOT_FOUND_MESSAGE,
  invalid_request: 'Plateforme ou identifiant invalide.',
  timeout: 'Le tracker ne répond pas pour le moment.',
  network_error: 'Le tracker est temporairement indisponible.',
  upstream_error: 'Le tracker est temporairement indisponible.',
  upstream_rejected: 'Le tracker a refusé la requête.',
  malformed_response: 'Les statistiques reçues sont inutilisables.',
  internal_error: 'Le tracker est temporairement indisponible.',
};
export default function RocketStatsTracker() {
  const [platform,setPlatform]=useState('epic');
  const [gamertag,setGamertag]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [stats,setStats]=useState(null);
  async function submit(e){e.preventDefault();if(loading)return;setError('');setStats(null);if(!gamertag.trim()){setError('Saisissez un pseudo.');return;}setLoading(true);
    try{const {data}=await base44.functions.invoke('rocketLeagueApi',{action:'getPlayerStats',platform,gamertag:gamertag.trim()});if(data?.error)setError(ERROR_MESSAGES[data.code]||data.error);else if(data)setStats(data);else setError('Le tracker est temporairement indisponible.');}
    catch(error){const payload=error?.response?.data||error?.data;setError(ERROR_MESSAGES[payload?.code]||payload?.error||'Le tracker est temporairement indisponible.');}
    finally{setLoading(false);}
  }
  return <section className="max-w-3xl space-y-4"><h2 className="text-xl font-bold">Tracker de statistiques</h2>
    <form onSubmit={submit} className="flex flex-wrap gap-2"><select aria-label="Plateforme" disabled={loading} value={platform} onChange={e=>setPlatform(e.target.value)} className="px-3 py-3 rounded-lg border bg-card">{[['epic','Epic Games'],['steam','Steam'],['psn','PlayStation'],['xbox','Xbox']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><input aria-label="Pseudo du joueur" disabled={loading} value={gamertag} onChange={e=>setGamertag(e.target.value)} placeholder={platform==='steam'?'Steam ID 64 ou pseudo':'Pseudo du joueur'} maxLength={100} className="flex-1 min-w-48 px-3 py-3 rounded-lg border bg-card"/><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Rechercher</button></form>
    <p className="text-xs text-muted-foreground">Rangs 1v1, 2v2 et 3v3 fournis par Tracker Network. Les profils privés ne sont pas accessibles.</p>
    {error&&<p role="alert" className="border border-destructive rounded-lg bg-muted p-4 text-sm text-destructive">{error}</p>}
    {stats&&<RocketRankResults stats={stats}/>}
  </section>;
}