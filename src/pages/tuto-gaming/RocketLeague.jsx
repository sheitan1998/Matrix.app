import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft,ShoppingBag,Trophy } from 'lucide-react';
import RocketLeagueShop from '@/components/tuto-gaming/RocketLeagueShop';
import RocketStatsTracker from '@/components/tuto-gaming/RocketStatsTracker';
export default function RocketLeague() {
  const [tab,setTab]=useState('shop');
  return <main className="min-h-screen bg-background text-foreground px-4 py-6"><div className="max-w-7xl mx-auto">
    <Link to="/tuto-gaming" className="inline-flex gap-2 items-center text-sm text-muted-foreground mb-5"><ArrowLeft className="w-4 h-4"/>Retour au Hub</Link>
    <h1 className="text-3xl font-bold mb-2">Rocket League</h1><p className="text-muted-foreground text-sm mb-6">Châssis, roues, explosions de but et statistiques classées.</p>
    <nav className="flex gap-2 mb-6" aria-label="Sections Rocket League">{[['shop','Item Shop',ShoppingBag],['stats','Stats Joueurs',Trophy]].map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={`flex gap-2 items-center px-4 py-2 rounded-lg font-semibold text-sm ${tab===id?'bg-primary text-primary-foreground':'bg-secondary text-secondary-foreground'}`}><Icon className="w-4 h-4"/>{label}</button>)}</nav>
    <div hidden={tab!=='shop'}><RocketLeagueShop/></div><div hidden={tab!=='stats'}><RocketStatsTracker/></div>
  </div></main>;
}