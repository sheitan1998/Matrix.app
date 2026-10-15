import React from 'react';
import { User } from 'lucide-react';
export default function RocketRankResults({stats}) {
  const overview=stats.overview||{};
  const highlights=[
    ['Victoires',overview.wins],
    ['Défaites',overview.losses],
    ['Ratio V/D',overview.winLossRatio],
    ['Buts',overview.goals],
    ['Arrêts',overview.saves],
    ['Passes décisives',overview.assists],
    ['Tirs',overview.shots],
    ['Matchs',overview.matchesPlayed],
    ['MVP',overview.mvp],
  ].filter(([,value])=>value!==null&&value!==undefined);
  return <div className="space-y-5">
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4"><User className="w-10 h-10 text-primary"/><div><h2 className="text-lg font-bold">{stats.username}</h2><p className="text-xs text-muted-foreground">Plateforme : {stats.platform}</p></div></div>
    <section><h3 className="font-semibold mb-3">Rangs classés</h3><div className="grid sm:grid-cols-3 gap-3">{stats.ranks?.map(rank=><div key={rank.playlist} className="border bg-card rounded-xl p-4"><h4 className="font-semibold">{rank.playlist}</h4><p className="text-primary font-bold mt-2">{rank.rank}</p><p className="text-sm text-muted-foreground">{rank.division}</p>{rank.rating>0&&<p className="text-sm mt-2">MMR : {rank.rating}</p>}</div>)}</div></section>
    {highlights.length>0&&<section><h3 className="font-semibold mb-3">Statistiques générales</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{highlights.map(([label,value])=><div key={label} className="border rounded-xl bg-card p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p></div>)}</div></section>}
    {overview.details?.length>0&&<details className="rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold">Tous les détails fiables exposés</summary><dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{overview.details.map(detail=><div key={detail.key}><dt className="text-xs text-muted-foreground">{detail.displayName}</dt><dd className="font-semibold">{detail.displayValue}</dd></div>)}</dl></details>}
  </div>;
}