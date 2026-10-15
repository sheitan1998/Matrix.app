import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  COMMUNITY_CATALOG_URL,
  estimateRocketLeaguePrice,
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
  allowedRocketImageUrl,
  assertPublicRocketImageHost,
  fetchRocketImage,
  MAX_ROCKET_IMAGE_BYTES,
  parseRocketImageHosts,
  readRocketImageBytes,
  resolveRocketImageCache,
  validateRocketImageBytes,
  validateRocketImageMetadata,
} from '../base44/shared/rocketLeagueMedia.ts';
import {
  resolveRocketImageSources,
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
  assert.equal(items.every(item => item.price > 0), true);
});

test('assigns deterministic non-zero catalog estimates inside normalized rarity ranges', () => {
  const cases = [
    ['Commun', 100, 200],
    ['Standard', 100, 200],
    ['Rare', 400, 700],
    ['Très rare', 400, 700],
    ['Importé', 800, 1100],
    ['Exotique', 1200, 1600],
    ['Marché noir', 2000, 2500],
  ];
  for (const [rarity, minimum, maximum] of cases) {
    const first = estimateRocketLeaguePrice('stable-item', rarity);
    assert.equal(first, estimateRocketLeaguePrice('stable-item', rarity));
    assert.ok(first >= minimum && first <= maximum);
    assert.equal(first % 100, 0);
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
      expectedCode: 'not_found',
      expectedMessage: 'Joueur introuvable ou profil privé',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 404 }) },
    },
    {
      expectedCode: 'invalid_api_key',
      expectedMessage: 'La clé Tracker Network configurée est invalide ou non autorisée.',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 401 }) },
    },
    {
      expectedCode: 'private_or_forbidden',
      expectedMessage: 'Joueur introuvable ou profil privé',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 403 }) },
    },
    {
      expectedCode: 'rate_limited',
      expectedMessage: 'Le service de statistiques limite les requêtes. Réessayez dans quelques minutes.',
      options: { apiKey: 'key', fetchImpl: async () => new Response(null, { status: 429 }) },
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

test('normalizes exact ranked values including tournaments without inventing absent modes', async () => {
      const result = await requestRocketLeaguePlayerStats({
        platform: 'epic',
        playerId: 'Exact Player',
        apiKey: 'key',
        fetchImpl: async () => Response.json({
          data: {
            platformInfo: { platformSlug: 'epic', platformUserHandle: 'Exact Player' },
            metadata: { currentSeason: 22 },
            segments: [
              {
                type: 'playlist',
                attributes: { playlistId: 11, season: 22 },
                metadata: { name: 'Ranked Doubles 2v2' },
                stats: {
                  tier: { metadata: { name: 'Champion II' } },
                  division: { metadata: { name: 'Division III' } },
                  rating: { value: 1247 },
                  matchesPlayed: { value: 42 },
                  wins: { value: 25 },
                },
              },
              {
                type: 'playlist',
                attributes: { playlistId: 34, season: 22 },
                metadata: { name: 'Tournament Matches' },
                stats: {
                  tier: { metadata: { name: 'Diamond III' } },
                  rating: { value: 1010 },
                },
              },
              {
                type: 'overview',
                stats: {
                  wins: { value: 100 },
                  goals: { value: 250 },
                  assists: { value: 80 },
                  saves: { value: 140 },
                },
              },
            ],
          },
        }),
      });
      assert.equal(result.ok, true);
      assert.equal(result.profile.season, 22);
      assert.deepEqual(result.profile.ranks, [
        {
          playlist: '2v2',
          tier: 'Champion II',
          division: 'Division III',
          rating: 1247,
          season: 22,
          matchesPlayed: 42,
          wins: 25,
        },
        {
          playlist: 'Tournois',
          tier: 'Diamond III',
          division: null,
          rating: 1010,
          season: 22,
          matchesPlayed: null,
          wins: null,
        },
      ]);
      assert.equal(result.profile.overview.goals, 250);
      assert.equal(result.profile.overview.assists, 80);
      assert.equal(result.profile.overview.saves, 140);
    });

    test('Rocket League image proxy validation blocks SSRF and unsafe redirects', async () => {
      const hosts = parseRocketImageHosts('media.example.test,cdn.example.test,localhost,127.0.0.1');
      assert.deepEqual([...hosts], ['media.example.test', 'cdn.example.test']);
      assert.equal(
        allowedRocketImageUrl('https://media.example.test/items/octane.webp', hosts).hostname,
        'media.example.test',
      );
      for (const source of [
        'http://media.example.test/items/octane.webp',
        'https://media.example.test.evil.test/items/octane.webp',
        'https://user:pass@media.example.test/items/octane.webp',
        'https://media.example.test:8443/items/octane.webp',
        'https://127.0.0.1/items/octane.webp',
      ]) {
        assert.throws(() => allowedRocketImageUrl(source, hosts));
      }
      await assert.rejects(
        assertPublicRocketImageHost(
          new URL('https://media.example.test/items/octane.webp'),
          async () => ['127.0.0.1'],
        ),
        /réseau privé/,
      );
      await assert.rejects(
        fetchRocketImage('https://media.example.test/items/octane.webp', {
          allowedHosts: hosts,
          resolveHost: async () => ['93.184.216.34'],
          fetchImpl: async () => new Response(null, {
            status: 302,
            headers: { Location: 'https://evil.example.test/internal' },
          }),
        }),
        /non autorisée/,
      );
    });

    test('Rocket League image proxy accepts only bounded image responses', () => {
      assert.deepEqual(validateRocketImageMetadata('image/webp', 1024), {
        contentType: 'image/webp',
        declaredSize: 1024,
      });

      assert.throws(() => validateRocketImageMetadata('text/html', 100), /image autorisée/);
      assert.throws(
        () => validateRocketImageMetadata('image/png', MAX_ROCKET_IMAGE_BYTES + 1),
        /8 Mio/,
      );
      const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]).buffer;
      assert.doesNotThrow(() => validateRocketImageBytes(png, 'image/png'));
      assert.throws(
        () => validateRocketImageBytes(new TextEncoder().encode('<html>').buffer, 'image/png'),
        /image valide/,
      );
    });

test('Rocket League image proxy stops streaming above its byte limit', async () => {
  const accepted = await readRocketImageBytes(
    new Response(Uint8Array.from([137, 80, 78, 71])),
    4,
  );
  assert.equal(accepted.byteLength, 4);
  await assert.rejects(
    readRocketImageBytes(new Response(new Uint8Array(9)), 8),
    /8 Mio/,
  );
});

test('Rocket League proxy cache reports a network-free hit after one miss', async () => {
  let cached;
  let loaderCalls = 0;
  const options = {
    getCached: () => cached,
    setCached: (_key, value) => {
      cached = value;
    },
    loader: async () => {
      loaderCalls += 1;
      return { bytes: Uint8Array.from([1, 2, 3]) };
    },
  };
  const miss = await resolveRocketImageCache('https://media.example.test/octane.webp', options);
  const hit = await resolveRocketImageCache('https://media.example.test/octane.webp', options);
  assert.equal(miss.cacheStatus, 'MISS');
  assert.equal(hit.cacheStatus, 'HIT');
  assert.equal(hit.value, miss.value);
  assert.equal(loaderCalls, 1);
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

test('Rocket League media UI contains no generic car icon, spinner, or JSON export', async () => {
  const [imageComponent, fallbackCard, garage, page, proxy] = await Promise.all([
    readFile(new URL('../src/components/tuto-gaming/RocketLeagueImage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/tuto-gaming/RocketLeagueFallbackCard.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/tuto-gaming/RocketLeagueGarage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/tuto-gaming/RocketLeague.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../base44/functions/api/entry.ts', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(
    `${imageComponent}\n${fallbackCard}\n${garage}\n${page}`,
    /CarFront|Loader2|animate-spin|initials|rocketVehicleProfile/,
  );
  assert.doesNotMatch(fallbackCard, /<svg|<canvas|<path|<line|radial-gradient|linear-gradient/i);
  assert.doesNotMatch(garage, /exportJson|serializeRocketPreset|>\s*JSON\s*</);
  assert.match(imageComponent, /functions\.fetch\('\/api\/rocket-league-proxy'/);
  assert.match(fallbackCard, /name \|\| 'Objet non sélectionné'/);
  assert.match(fallbackCard, /categoryLabel/);
  assert.match(fallbackCard, /rarityLabel/);
  assert.match(fallbackCard, /Prix estimé/);
  assert.match(garage, /id="preset-preview-box"/);
  assert.match(proxy, /ROUTE_SUFFIX = '\/api\/rocket-league-proxy'/);
  assert.match(proxy, /'X-Proxy-Cache': cacheStatus/);
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
