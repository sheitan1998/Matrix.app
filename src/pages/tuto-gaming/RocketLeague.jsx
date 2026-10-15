import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CarFront, ShoppingBag, Trophy } from 'lucide-react';
import RocketLeagueGarage from '@/components/tuto-gaming/RocketLeagueGarage';
import RocketLeagueShop from '@/components/tuto-gaming/RocketLeagueShop';
import RocketStatsTracker from '@/components/tuto-gaming/RocketStatsTracker';

const TABS = [
  { id: 'shop', label: 'Item Shop', icon: ShoppingBag },
  { id: 'garage', label: 'Custom Preset / Garage', icon: CarFront },
  { id: 'stats', label: 'Stats Joueurs', icon: Trophy },
];

export default function RocketLeague() {
  const [tab, setTab] = useState('shop');
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-7xl">
        <Link to="/tuto-gaming" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Retour au Hub
        </Link>
        <h1 className="mb-2 text-3xl font-bold">Rocket League</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Boutique native, garage personnalisé et statistiques classées.
        </p>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Sections Rocket League">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              role="tab"
              id={`rocket-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`rocket-panel-${id}`}
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id="rocket-panel-shop" aria-labelledby="rocket-tab-shop" hidden={tab !== 'shop'}>
          <RocketLeagueShop />
        </div>
        <div role="tabpanel" id="rocket-panel-garage" aria-labelledby="rocket-tab-garage" hidden={tab !== 'garage'}>
          <RocketLeagueGarage />
        </div>
        <div role="tabpanel" id="rocket-panel-stats" aria-labelledby="rocket-tab-stats" hidden={tab !== 'stats'}>
          <RocketStatsTracker />
        </div>
      </div>
    </main>
  );
}