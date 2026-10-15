import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalRocketLeagueCatalog,
  LOCAL_ROCKET_LEAGUE_ITEMS,
} from '../base44/shared/rocketLeagueCatalog.ts';
import {
  normalizeRocketPlatform,
  requestRocketLeaguePlayerStats,
  ROCKET_PLAYER_NOT_FOUND_MESSAGE,
} from '../base44/shared/rocketLeagueTracker.ts';

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
      options: { apiKey: undefined, fetchImpl: async () => assert.fail('fetch should not run') },
    },
    {
      expectedCode: 'private_or_forbidden',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 403 }) },
    },
    {
      expectedCode: 'upstream_error',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 503 }) },
    },
    {
      expectedCode: 'malformed_response',
      options: {
        apiKey: 'key',
        fetchImpl: async () => new Response('not-json', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      },
    },
  ];

  for (const { expectedCode, options } of cases) {
    const result = await requestRocketLeaguePlayerStats({
      platform: 'epic',
      playerId: 'Player',
      ...options,
    });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, expectedCode);
    assert.equal(result.error.message, ROCKET_PLAYER_NOT_FOUND_MESSAGE);
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
  assert.equal(result.error.message, ROCKET_PLAYER_NOT_FOUND_MESSAGE);
});
