import React from 'react';
import { User } from 'lucide-react';

export default function RocketRankResults({ stats }) {
  const overview = stats.overview || {};
  const highlights = [
    ['Victoires', overview.wins],
    ['Défaites', overview.losses],
    ['Ratio V/D', overview.winLossRatio],
    ['Buts', overview.goals],
    ['Passes décisives', overview.assists],
    ['Arrêts', overview.saves],
    ['Tirs', overview.shots],
    ['Matchs', overview.matchesPlayed],
    ['MVP', overview.mvp],
  ].filter(([, value]) => value !== null && value !== undefined);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
        <User className="h-10 w-10 text-primary" />
        <div>
          <h2 className="text-lg font-bold">{stats.username}</h2>
          <p className="text-xs text-muted-foreground">
            Plateforme : {stats.platform}{stats.season !== null ? ` · Saison ${stats.season}` : ''}
          </p>
        </div>
      </div>

      <section>
        <h3 className="mb-3 font-semibold">Rangs classés</h3>
        {stats.ranks?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.ranks.map(rank => (
              <div key={rank.playlist} className="rounded-xl border bg-card p-4">
                <h4 className="font-semibold">{rank.playlist}</h4>
                {rank.tier && <p className="mt-2 font-bold text-primary">{rank.tier}</p>}
                {rank.division && <p className="text-sm text-muted-foreground">{rank.division}</p>}
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {rank.rating !== null && <div><dt className="text-muted-foreground">MMR</dt><dd className="font-semibold">{rank.rating}</dd></div>}
                  {rank.season !== null && <div><dt className="text-muted-foreground">Saison</dt><dd className="font-semibold">{rank.season}</dd></div>}
                  {rank.matchesPlayed !== null && <div><dt className="text-muted-foreground">Matchs</dt><dd className="font-semibold">{rank.matchesPlayed}</dd></div>}
                  {rank.wins !== null && <div><dt className="text-muted-foreground">Victoires</dt><dd className="font-semibold">{rank.wins}</dd></div>}
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border bg-muted p-4 text-sm text-muted-foreground">
            Aucun rang détaillé n’est fourni pour ce profil.
          </p>
        )}
      </section>

      {highlights.length > 0 && (
        <section>
          <h3 className="mb-3 font-semibold">Statistiques générales</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {highlights.map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
