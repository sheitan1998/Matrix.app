import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import RocketRankResults from '@/components/tuto-gaming/RocketRankResults';

const PLAYER_NOT_FOUND_MESSAGE = 'Joueur introuvable ou profil privé';
const ERROR_MESSAGES = {
  missing_api_key: 'Le tracker Rocket League n’est pas configuré par l’administrateur.',
  invalid_api_key: 'La clé Tracker Network configurée est invalide ou non autorisée.',
  rate_limited: 'Tracker Network limite les recherches. Réessayez dans quelques minutes.',
  not_found: PLAYER_NOT_FOUND_MESSAGE,
  private_or_forbidden: PLAYER_NOT_FOUND_MESSAGE,
  malformed_or_private_profile: PLAYER_NOT_FOUND_MESSAGE,
  invalid_request: 'Plateforme ou identifiant invalide.',
  timeout: 'Tracker Network ne répond pas pour le moment.',
  network_error: 'Tracker Network est temporairement indisponible.',
  upstream_error: 'Tracker Network est temporairement indisponible.',
  upstream_rejected: 'Tracker Network a refusé la requête.',
  malformed_response: 'Les statistiques reçues sont inutilisables.',
  internal_error: 'Le service de statistiques est temporairement indisponible.',
};

function withTimeout(promise, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('client_timeout')), timeoutMs);
    promise.then(
      value => {
        clearTimeout(timeout);
        resolve(value);
      },
      error => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export default function RocketStatsTracker() {
  const [platform, setPlatform] = useState('epic');
  const [gamertag, setGamertag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');
    setStats(null);
    if (!gamertag.trim()) {
      setError('Saisissez un pseudo.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await withTimeout(base44.functions.invoke('rocketLeagueApi', {
        action: 'getPlayerStats',
        platform,
        gamertag: gamertag.trim(),
      }));
      if (data?.error) setError(ERROR_MESSAGES[data.code] || data.error);
      else if (data) setStats(data);
      else setError(ERROR_MESSAGES.internal_error);
    } catch (requestError) {
      const payload = requestError?.response?.data || requestError?.data;
      setError(
        requestError?.message === 'client_timeout'
          ? ERROR_MESSAGES.timeout
          : ERROR_MESSAGES[payload?.code] || payload?.error || ERROR_MESSAGES.internal_error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-3xl space-y-4">
      <h2 className="text-xl font-bold">Tracker de statistiques</h2>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <select
          aria-label="Plateforme"
          disabled={loading}
          value={platform}
          onChange={event => setPlatform(event.target.value)}
          className="rounded-lg border bg-card px-3 py-3"
        >
          {[
            ['epic', 'Epic Games'],
            ['steam', 'Steam'],
            ['psn', 'PlayStation'],
            ['xbox', 'Xbox'],
          ].map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <input
          aria-label="Pseudo du joueur"
          disabled={loading}
          value={gamertag}
          onChange={event => setGamertag(event.target.value)}
          placeholder={platform === 'steam' ? 'Steam ID 64 ou pseudo' : 'Pseudo du joueur'}
          maxLength={100}
          className="min-w-48 flex-1 rounded-lg border bg-card px-3 py-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Recherche…' : 'Rechercher'}
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        Rangs 1v1, 2v2, 3v3 et tournois fournis par Tracker Network lorsqu’ils sont exposés.
        Les profils privés ne sont pas accessibles.
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive bg-muted p-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {stats && <RocketRankResults stats={stats} />}
    </section>
  );
}
