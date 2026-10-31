import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const routes = ['/', '/servicios/', '/flota/', '/nosotros/', '/contacto/'];
const configuredOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : null;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const escapeXml = value => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));

http.createServer(async (req, res) => {
  const send = (status, body, type = 'text/html; charset=utf-8', headers = {}) => {
    res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...headers });
    res.end(req.method === 'HEAD' ? undefined : body);
  };
  if (!['GET', 'HEAD'].includes(req.method)) return send(405, 'Método no permitido', 'text/plain', { Allow: 'GET, HEAD' });
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const origin = configuredOrigin || new URL(`${protocol}://${host}`).origin;
    const redirect = target => send(301, '', 'text/plain', { Location: target + url.search });
    if (pathname === '/index.html') return redirect('/');
    if (/^\/(servicios|flota|nosotros|contacto)(?:\.html|\/index\.html)?$/.test(pathname)) {
      return redirect(`/${pathname.split('/')[1].replace('.html', '')}/`);
    }
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
        .replace(/"(@id|url|logo|image)":"\//g, (_, key) => `"${key}":"${origin}/`);
    }
    send(200, body, types[extension] || 'application/octet-stream', { 'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=86400' });
  } catch (error) {
    send(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400, 'Recurso no disponible', 'text/plain; charset=utf-8');
  }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log(`TransHuancas en puerto ${process.env.PORT || 3000}`));
