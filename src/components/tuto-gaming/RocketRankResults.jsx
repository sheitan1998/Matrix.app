import React from 'react';
import { User } from 'lucide-react';
export default function RocketRankResults({stats}) {
  return <div className="space-y-5">
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4"><User className="w-10 h-10 text-primary"/><div><h2 className="text-lg font-bold">{stats.username}</h2><p className="text-xs text-muted-foreground">Plateforme : {stats.platform}</p></div></div>
    <section><h3 className="font-semibold mb-3">Rangs classés</h3><div className="grid sm:grid-cols-3 gap-3">{stats.ranks?.map(rank=><div key={rank.playlist} className="border bg-card rounded-xl p-4"><h4 className="font-semibold">{rank.playlist}</h4><p className="text-primary font-bold mt-2">{rank.rank}</p><p className="text-sm text-muted-foreground">{rank.division}</p>{rank.rating>0&&<p className="text-sm mt-2">MMR : {rank.rating}</p>}</div>)}</div></section>
    {stats.overview&&Object.keys(stats.overview).length>0&&<section><h3 className="font-semibold mb-3">Statistiques générales</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Object.entries(stats.overview).slice(0,8).map(([key,stat])=><div key={key} className="border rounded-xl bg-card p-3"><p className="text-xs text-muted-foreground">{stat.displayName||key.replace(/([A-Z])/g,' $1')}</p><p className="text-lg font-bold">{stat.displayValue??stat.value??'Indisponible'}</p></div>)}</div></section>}
  </div>;
}