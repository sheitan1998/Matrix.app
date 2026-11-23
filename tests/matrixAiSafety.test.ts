import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_TIER_PLANS, MATRIX_AI_PLANS } from '../base44/shared/aiPlans.ts';
import { extractUrls, isImageRequest } from '../base44/shared/aiIntent.ts';
import { assertSafeUrl, fetchReadablePage, htmlToReadable, isPrivateAddress } from '../base44/shared/aiWeb.ts';
import { validateAttachments } from '../base44/shared/aiFiles.ts';
import { composeImagePrompt, normalizeBrief } from '../base44/shared/aiImage.ts';

const publicResolver = async () => ['93.184.216.34'];

test('tarifs Matrix+ et Matrix Ultra', () => {
  assert.equal(AI_TIER_PLANS.plus.priceCents, 1999);
  assert.equal(AI_TIER_PLANS.ultra.priceCents, 8999);
  assert.equal(MATRIX_AI_PLANS.plus.priceCents, 1999);
  assert.equal(MATRIX_AI_PLANS.ultra.priceCents, 8999);
  assert.equal(AI_TIER_PLANS.ultra.limit, AI_TIER_PLANS.plus.limit * 7 * 10);
});

test('détection des demandes d\'image en langage naturel', () => {
  assert.ok(isImageRequest('/image un dragon'));
  assert.ok(isImageRequest('Génère-moi une image de dragon violet néon'));
  assert.ok(isImageRequest('Peux-tu créer un logo pour mon serveur Discord ?'));
  assert.ok(isImageRequest('Je voudrais une illustration de forêt'));
  assert.ok(isImageRequest('Dessine-moi un robot'));
  assert.ok(!isImageRequest('Comment créer une image Docker ?'));
  assert.ok(!isImageRequest('Quels sont les meilleurs serveurs Minecraft ?'));
});

test('extraction des liens', () => {
  const urls = extractUrls('Lis https://exemple.fr/a, puis (https://exemple.fr/b). Doublon https://exemple.fr/a#x ftp://x.fr');
  assert.deepEqual(urls, ['https://exemple.fr/a', 'https://exemple.fr/b']);
});

test('SSRF : adresses privées et hôtes internes refusés', async () => {
  for (const address of ['127.0.0.1', '10.1.2.3', '192.168.0.5', '172.20.1.1', '169.254.169.254', '::1', 'fd00::1', '::ffff:127.0.0.1']) {
    assert.ok(isPrivateAddress(address), address);
  }
  assert.ok(!isPrivateAddress('93.184.216.34'));
  for (const url of [
    'http://localhost/',
    'http://127.0.0.1/',
    'http://2130706433/',
    'http://[::1]/',
    'http://intranet/',
    'http://exemple.fr:8080/',
    'file:///etc/passwd',
    'https://user:pass@exemple.fr/',
  ]) {
    await assert.rejects(() => assertSafeUrl(url, publicResolver), { code: 'blocked' }, url);
  }
  await assert.rejects(() => assertSafeUrl('https://rebind.exemple.fr/', async () => ['10.0.0.1']), { code: 'blocked' });
  await assert.doesNotReject(() => assertSafeUrl('https://exemple.fr/', publicResolver));
});

test('redirections revalidées et contenu extrait', async () => {
  const redirectToPrivate = (async () =>
    new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest' } })) as typeof fetch;
  const blocked = await fetchReadablePage('https://exemple.fr/', { resolver: publicResolver, fetchImpl: redirectToPrivate });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.error, 'blocked');

  const loop = (async () => new Response(null, { status: 302, headers: { location: 'https://exemple.fr/' } })) as typeof fetch;
  const looped = await fetchReadablePage('https://exemple.fr/', { resolver: publicResolver, fetchImpl: loop });
  assert.equal(looped.error, 'too_many_redirects');

  const page = (async () =>
    new Response('<html><head><title>Salut &amp; bienvenue</title></head><body><script>x()</script><p>Bonjour</p></body></html>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })) as typeof fetch;
  const ok = await fetchReadablePage('https://exemple.fr/', { resolver: publicResolver, fetchImpl: page });
  assert.equal(ok.ok, true);
  assert.equal(ok.title, 'Salut & bienvenue');
  assert.equal(ok.text, 'Bonjour');

  const binary = (async () => new Response('x', { headers: { 'content-type': 'application/zip' } })) as typeof fetch;
  assert.equal((await fetchReadablePage('https://exemple.fr/', { resolver: publicResolver, fetchImpl: binary })).error, 'unsupported_type');

  const huge = (async () =>
    new Response('a'.repeat(5000), { headers: { 'content-type': 'text/plain' } })) as typeof fetch;
  const capped = await fetchReadablePage('https://exemple.fr/', { resolver: publicResolver, fetchImpl: huge, maxBytes: 1000 });
  assert.equal(capped.truncated, true);
  assert.equal(capped.text?.length, 1000);
  assert.equal(htmlToReadable('<p>a</p><p>b</p>').text, 'a\nb');
});

test('pièces jointes : validation serveur', () => {
  const ok = validateAttachments([
    { url: 'https://cdn.exemple.fr/a.png', name: 'a.png', type: 'image/png', size: 1000 },
    { url: 'https://cdn.exemple.fr/b.pdf', name: 'b.pdf', type: 'application/pdf', size: 2000 },
  ]);
  assert.equal(ok.accepted.length, 2);
  assert.equal(ok.rejected.length, 0);
  const bad = validateAttachments([
    { url: 'https://cdn.exemple.fr/a.exe', name: 'a.exe', type: '', size: 10 },
    { url: 'https://cdn.exemple.fr/big.png', name: 'big.png', type: 'image/png', size: 99_000_000 },
    { url: 'http://cdn.exemple.fr/a.png', name: 'a.png', type: 'image/png', size: 10 },
  ]);
  assert.equal(bad.accepted.length, 0);
  assert.equal(bad.rejected.length, 3);
});

test('prompt image structuré et repli', () => {
  assert.equal(composeImagePrompt('un chat', null), 'un chat');
  const brief = normalizeBrief({ subject: 'a purple cat', style: 'neon illustration', details: ['green eyes'] });
  const prompt = composeImagePrompt('un chat violet', brief);
  assert.match(prompt, /Subject: a purple cat/);
  assert.match(prompt, /green eyes/);
  assert.match(prompt, /un chat violet/);
  assert.equal(normalizeBrief({}), null);
});
