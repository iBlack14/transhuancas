import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { defaultSiteUrl, defaultGoogleSiteVerification, publicRoutes } from './site.config.mjs';

const root = path.resolve('dist');
const routes = publicRoutes;
const configuredOrigin = new URL(process.env.SITE_URL || defaultSiteUrl).origin;
if (!/^https?:\/\//.test(configuredOrigin)) throw new Error('SITE_URL debe ser una URL HTTP o HTTPS');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const escapeXml = value => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));

http.createServer(async (req, res) => {
  const send = (status, body, type = 'text/html; charset=utf-8', headers = {}) => {
    const common = { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...headers };
    if (status >= 400) common['X-Robots-Tag'] = 'noindex';
    if (/(?:text\/|javascript|json|xml)/.test(type)) {
      common.Vary = 'Accept-Encoding';
      if (/\bgzip\b(?!\s*;\s*q=0(?:\D|$))/.test(req.headers['accept-encoding'] || '') && Buffer.byteLength(body) > 1024) {
        body = gzipSync(body);
        common['Content-Encoding'] = 'gzip';
      }
    }
    res.writeHead(status, common);
    res.end(req.method === 'HEAD' ? undefined : body);
  };
  if (!['GET', 'HEAD'].includes(req.method)) return send(405, 'Método no permitido', 'text/plain', { Allow: 'GET, HEAD' });
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const origin = configuredOrigin;
    const redirect = target => send(301, '', 'text/plain', { Location: target + url.search });
    for (const route of routes.filter(route => route !== '/')) {
      const base = route.slice(0, -1);
      if ([base, `${base}.html`, `${base}/index.html`].includes(pathname)) return redirect(route);
    }
    if (routes.includes(pathname) && url.pathname !== pathname) return redirect(pathname);
    if (pathname === '/index.html') return redirect('/');
    if (/^\/reservar(?:\/|\.html|\/index\.html)?$/.test(pathname)) return redirect('/contacto/');
    if (pathname === '/sitemap.xml') {
      return send(200, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${escapeXml(origin + route)}</loc></url>`).join('')}</urlset>`, 'application/xml; charset=utf-8');
    }
    if (pathname === '/robots.txt') return send(200, `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, 'text/plain; charset=utf-8');
    let relative;
    if (routes.includes(pathname)) relative = `${pathname.slice(1)}index.html`;
    else if (/^\/(assets|fotos)\//.test(pathname) || /^\/(styles\.css|script\.js|favicon\.ico|site\.webmanifest)$/.test(pathname)) relative = pathname.slice(1);
    else return send(404, '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Página no encontrada | TransHuancas</title><h1>Página no encontrada</h1><a href="/">Volver al inicio</a></html>');
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) return send(404, 'No encontrado');
    let body = await readFile(filename);
    const extension = path.extname(filename);
    if (extension === '.html') {
      const safeOrigin = escapeXml(origin);
      body = body.toString().replace(/(<link rel="canonical" href=")\//g, `$1${safeOrigin}/`)
        .replace(/(<meta (?:property="og:(?:url|image)"|name="twitter:image") content=")\//g, `$1${safeOrigin}/`)
        .replace(/"(@id|url|logo|image)"\s*:\s*"\//g, (_, key) => `"${key}":"${origin}/`);
      const token = process.env.GOOGLE_SITE_VERIFICATION || defaultGoogleSiteVerification;
      if (token) body = body.replace('</head>', `<meta name="google-site-verification" content="${escapeXml(token)}"></head>`);
    }
    send(200, body, types[extension] || 'application/octet-stream', { 'Cache-Control': ['.html', '.css', '.js', '.webmanifest'].includes(extension) ? 'no-cache' : 'public, max-age=86400' });
  } catch (error) {
    send(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400, 'Recurso no disponible', 'text/plain; charset=utf-8');
  }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log(`TransHuancas en puerto ${process.env.PORT || 3000}`));
