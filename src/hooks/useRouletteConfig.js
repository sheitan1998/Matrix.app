import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DEFAULT_ROULETTE_CONFIG, mergeRouletteConfig } from '@/lib/rouletteConfig';

export default function useRouletteConfig() {
  const [config, setConfig] = useState(DEFAULT_ROULETTE_CONFIG);

  useEffect(() => {
    base44.entities.RouletteConfig.list('-created_date', 1)
      .then((records) => {
        if (records?.[0]) setConfig(mergeRouletteConfig(records[0]));
      })
      .catch(() => {
        /* la table garde ses valeurs par défaut */
      });
  }, []);

  return config;
}