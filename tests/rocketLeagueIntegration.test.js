import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMUNITY_CATALOG_URL,
  normalizeRocketLeagueCatalogItem,
  normalizeRocketLeagueCatalogPayload,
  paginateRocketLeagueCatalog,
} from '../base44/shared/rocketLeagueCatalog.ts';
import {
  normalizeRocketPlatform,
  normalizeRocketOverview,
  requestRocketLeaguePlayerStats,
} from '../base44/shared/rocketLeagueTracker.ts';
import {
  resolveRocketImageSources,
  rocketFallbackColors,
} from '../src/components/tuto-gaming/rocketLeagueImages.js';

test('normalizes a BakkesMod-compatible product dump and adds the versioned paint set', () => {
  const items = normalizeRocketLeagueCatalogPayload({
    23: { name: 'Octane', slot: 0, quality: 0 },
    100: { name: 'Cristiano', slot: 2, quality: 3 },
    101: { name: 'Ignored topper', slot: 5, quality: 1 },
  }, { source: 'community-snapshot' });
  assert.match(COMMUNITY_CATALOG_URL, /\/v3\.2\.16\//);
  assert.equal(items.some(item => item.id === '23' && item.category === 'body'), true);
  assert.equal(items.some(item => item.id === '100' && item.category === 'wheels'), true);
  assert.equal(items.some(item => item.name === 'Ignored topper'), false);
  assert.ok(items.filter(item => item.category === 'paint').length >= 15);
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
  }, 0, { allowedImageHosts: new Set(['cdn.example.test']) });
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

test('image sources accept distinct HTTPS URLs without schematic generated fallbacks', () => {
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
  assert.equal(sources.length, 2);
  assert.deepEqual(resolveRocketImageSources({ src: 'data:image/svg+xml,invalid' }), []);
});

test('local MATRIX image fallbacks are deterministic and honor paint colors', () => {
  assert.deepEqual(rocketFallbackColors('Octane'), rocketFallbackColors('Octane'));
  assert.deepEqual(rocketFallbackColors('Cobalt', '#2563eb'), {
    primary: '#2563eb',
    secondary: '#7c3aed',
  });
  assert.notDeepEqual(rocketFallbackColors('Octane'), rocketFallbackColors('Fennec'));
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
