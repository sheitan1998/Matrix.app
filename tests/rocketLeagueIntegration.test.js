import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalRocketLeagueCatalog,
  LOCAL_ROCKET_LEAGUE_ITEMS,
  normalizeRocketLeagueCatalogItem,
  paginateRocketLeagueCatalog,
} from '../base44/shared/rocketLeagueCatalog.ts';
import {
  normalizeRocketPlatform,
  normalizeRocketOverview,
  requestRocketLeaguePlayerStats,
} from '../base44/shared/rocketLeagueTracker.ts';
import {
  generatedRocketImage,
  resolveRocketImageSources,
} from '../src/components/tuto-gaming/rocketLeagueImages.js';

test('local fallback catalog is comprehensive and garage-ready', () => {
  const catalog = getLocalRocketLeagueCatalog();
  const names = new Set(catalog.items.map(item => item.name));
  for (const required of [
    'Octane',
    'Fennec',
    'Dominus',
    'Zomba',
    'Draco',
    'Dueling Dragons',
    'Cristianos',
  ]) {
    assert.equal(names.has(required), true, `${required} should be available`);
  }
  assert.equal(catalog.source, 'local');
  assert.ok(LOCAL_ROCKET_LEAGUE_ITEMS.length >= 30);
  for (const category of ['body', 'paint', 'finish', 'wheels', 'decal', 'goalExplosion']) {
    assert.ok(catalog.garage[category].length >= 4, `${category} should be populated`);
  }
});

test('maps every supported platform and sends the API key server-side', async () => {
  assert.deepEqual(
    ['epic', 'steam', 'psn', 'xbox'].map(normalizeRocketPlatform),
    ['epic', 'steam', 'psn', 'xbl'],
  );

  let captured;
  const result = await requestRocketLeaguePlayerStats({
    platform: 'xbox',
    playerId: 'Player Name/One',
    apiKey: 'server-secret',
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return Response.json({
        data: {
          platformInfo: {
            platformSlug: 'xbl',
            platformUserHandle: 'Player Name/One',
          },
          segments: [],
        },
      });
    },
  });

  assert.equal(result.ok, true);
  assert.match(captured.url, /\/xbl\/Player%20Name%2FOne$/);
  assert.equal(captured.options.headers['TRN-Api-Key'], 'server-secret');
  assert.equal(captured.options.headers.Accept, 'application/json');
});

test('normalizes private, upstream, malformed, and missing-key failures', async () => {
  const cases = [
    {
      expectedCode: 'missing_api_key',
      expectedMessage: 'Le tracker Rocket League n’est pas configuré.',
      options: { apiKey: undefined, fetchImpl: async () => assert.fail('fetch should not run') },
    },
    {
      expectedCode: 'private_or_forbidden',
      expectedMessage: 'Joueur introuvable ou profil privé',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 403 }) },
    },
    {
      expectedCode: 'upstream_error',
      expectedMessage: 'Le service de statistiques est temporairement indisponible.',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 503 }) },
    },
    {
      expectedCode: 'malformed_response',
      expectedMessage: 'Le service de statistiques a renvoyé une réponse inutilisable.',
      options: {
        apiKey: 'key',
        fetchImpl: async () => new Response('not-json', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      },
    },
  ];

  for (const { expectedCode, expectedMessage, options } of cases) {
    const result = await requestRocketLeaguePlayerStats({
      platform: 'epic',
      playerId: 'Player',
      ...options,
    });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, expectedCode);
    assert.equal(result.error.message, expectedMessage);
  }
});

test('normalizes Tracker timeouts to the friendly player message', async () => {
  const result = await requestRocketLeaguePlayerStats({
    platform: 'steam',
    playerId: '76561198000000000',
    apiKey: 'key',
    timeoutMs: 5,
    fetchImpl: async (_url, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        reject(new DOMException('Timed out', 'AbortError'));
      });
    }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'timeout');
  assert.equal(result.error.message, 'Le service de statistiques ne répond pas pour le moment.');
});

test('normalizes API catalog HD images and paginates the complete result', () => {
  const normalized = normalizeRocketLeagueCatalogItem({
    id: 'api/octane',
    name: 'Octane HD',
    category: 'body',
    type: 'Body',
    imageHd: 'https://cdn.example.test/octane-hd.png',
    image: 'https://cdn.example.test/octane.png',
    price: 500,
  });
  assert.equal(normalized.image, 'https://cdn.example.test/octane-hd.png');
  assert.deepEqual(normalized.images, [
    'https://cdn.example.test/octane-hd.png',
    'https://cdn.example.test/octane.png',
  ]);
  const page = paginateRocketLeagueCatalog([normalized, normalized, normalized], 2, 2);
  assert.equal(page.items.length, 1);
  assert.equal(page.total, 3);
  assert.equal(page.hasMore, false);
});

test('image sources prefer supplied HD URLs and end in one deterministic generated fallback', () => {
  const fallback = generatedRocketImage('Octane', '#f97316');
  assert.equal(fallback, generatedRocketImage('Octane', '#f97316'));
  const sources = resolveRocketImageSources({
    src: 'https://cdn.example.test/standard.png',
    sources: ['https://cdn.example.test/hd.png'],
    fallbackLabel: 'Octane',
    accent: '#f97316',
  });
  assert.deepEqual(sources.slice(0, 2), [
    'https://cdn.example.test/hd.png',
    'https://cdn.example.test/standard.png',
  ]);
  assert.equal(sources.at(-1), fallback);
});

test('maps reliable overview values and only derives W/L when both values exist', () => {
  const overview = normalizeRocketOverview({
    wins: { value: 12, displayName: 'Wins', displayValue: '12' },
    losses: { value: 8, displayName: 'Losses', displayValue: '8' },
    goals: { value: 25, displayName: 'Goals', displayValue: '25' },
    saves: { value: 9, displayName: 'Saves', displayValue: '9' },
  });
  assert.equal(overview.winLossRatio, 1.5);
  assert.equal(overview.goals, 25);
  assert.equal(overview.saves, 9);
  assert.equal(overview.details.length, 4);
  assert.equal(normalizeRocketOverview({ wins: { value: 3 } }).winLossRatio, null);
});
