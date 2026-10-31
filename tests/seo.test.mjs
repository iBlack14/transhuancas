import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { publicRoutes } from '../site.config.mjs';

test('SEO, rutas, recursos y verificación sin dependencias externas', async t => {
  const origin = 'https://transportes-huancas.stkkft.easypanel.host';
  const child = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: '3197', SITE_URL: origin, GOOGLE_SITE_VERIFICATION: 'test-token' }, stdio: ['ignore', 'pipe', 'inherit'] });
  t.after(() => child.kill());
  await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(() => { throw new Error('El servidor no arrancó'); })]);
  const get = (url, options) => fetch(`http://localhost:3197${url}`, options);
  const titles = new Set(), descriptions = new Set(), assets = new Set();
  for (const route of publicRoutes) {
    const response = await get(route), html = await response.text();
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type'), /text\/html; charset=utf-8/);
    assert.ok(html.includes(`rel="canonical" href="${origin}${route}"`), route);
    assert.ok(html.includes(`property="og:url" content="${origin}${route}"`));
    assert.ok(html.includes('name="google-site-verification" content="test-token"'));
    assert.ok(!/<meta name="robots" content="[^"\n]*noindex/.test(html));
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    assert.ok(!/href="[^"#]*\.html/.test(html));
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
    assert.ok(!titles.has(title), `Título duplicado: ${route}`); titles.add(title);
    assert.ok(!descriptions.has(description), `Descripción duplicada: ${route}`); descriptions.add(description);
    assert.match(html, /https:\/\/wa.me\/51918174705/);
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(json);
      assert.equal(data['@context'], 'https://schema.org');
      const inspect = value => {
        for (const [key, item] of Object.entries(value)) {
          assert.ok(!['priceRange', 'address', 'sameAs', 'aggregateRating', 'openingHours'].includes(key), key);
          if (['@id', 'url', 'logo', 'image'].includes(key) && typeof item === 'string') assert.ok(item.startsWith(origin), item);
          if (item && typeof item === 'object') inspect(item);
        }
      };
      inspect(data);
    }
    for (const [, href] of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) {
      if (/^\/(?:assets|fotos)\//.test(href) || /\.(css|js|webmanifest)$/.test(href)) assets.add(href);
      else assert.ok(publicRoutes.includes(href), `Enlace inexistente: ${href}`);
    }
    if (route !== '/') {
      const base = route.slice(0, -1);
      for (const alias of [base, `${base}.html`, `${base}/index.html`]) {
        const result = await get(`${alias}?origen=seo`, { redirect: 'manual' });
        assert.equal(result.status, 301);
        assert.equal(result.headers.get('location'), `${route}?origen=seo`);
      }
    }
  }
  for (const asset of assets) assert.equal((await get(asset)).status, 200, asset);
  const xml = await (await get('/sitemap.xml')).text();
  assert.equal((xml.match(/<loc>/g) || []).length, publicRoutes.length);
  for (const route of publicRoutes) assert.ok(xml.includes(`<loc>${origin}${route}</loc>`));
  assert.match(await (await get('/robots.txt')).text(), /Sitemap: https:\/\/transportes-huancas.stkkft.easypanel.host\/sitemap.xml/);
  for (const route of ['/inexistente/', '/content/drafts/turismo-privado.json', '/transporte-ejecutivo/', '/turismo-privado/', '/traslados-para-grupos/', '/.git/config', '/server.mjs']) {
    const response = await get(route);
    assert.equal(response.status, 404, route);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex');
  }
  const css = await get('/styles.css', { headers: { 'Accept-Encoding': 'gzip' } });
  assert.equal(css.headers.get('content-encoding'), 'gzip');
  assert.match(await css.text(), /font-face/);
  assert.equal((await get('/contacto/', { method: 'HEAD' })).status, 200);
  assert.equal((await get('/', { method: 'POST' })).status, 405);
  const home = await (await get('/')).text();
  assert.match(home, /<noscript><style>\.reveal/);
  assert.match(home, /Viajes de Piura a Chiclayo/);
  assert.match(home, /as="image"[^>]*fetchpriority="high"/);
  const source = await readFile('script.js', 'utf8');
  assert.match(source, /window.open\(`https:\/\/wa.me/);
  console.log(`Verificadas ${publicRoutes.length} páginas, ${assets.size} recursos, sitemap, aliases, JSON-LD, 404, compresión y token de Google.`);
});
