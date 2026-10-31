import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { routePages } from './site.config.mjs';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'servicios.html', 'flota.html', 'nosotros.html', 'contacto.html', 'servicios', 'flota', 'nosotros', 'contacto', 'reservar', 'styles.css', 'script.js', 'assets', 'fotos', 'favicon.ico', 'site.webmanifest', 'robots.txt']) {
  await cp(file, `dist/${file}`, { recursive: true, filter: source => file !== 'fotos' || !/\.(png|jpe?g|mp4)$/i.test(source) });
}
const template = await readFile('servicios.html', 'utf8');
const escapeHtml = value => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[char]));
for (const route of routePages) {
  const page = JSON.parse(await readFile(`content/${route.split('/')[1]}.json`, 'utf8'));
  if (!page.verified) throw new Error(`Servicio sin verificar: ${route}`);
  let html = template.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/(<meta (?:name="(?:description|twitter:description)"|property="og:description") content=")[^"]*/g, (_, prefix) => prefix + escapeHtml(page.description))
    .replace(/(<meta (?:name="twitter:title"|property="og:title") content=")[^"]*/g, (_, prefix) => prefix + escapeHtml(page.title))
    .replace(/(rel="canonical" href=|property="og:url" content=)"\/servicios\/"/g, `$1"${route}"`);
  const whatsApp = `https://wa.me/51918174705?text=${encodeURIComponent(page.message)}`;
  const sections = page.sections.map(section => `<section class="about-story section"><div><h2>${escapeHtml(section.title)}</h2></div><div>${section.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}${section.links ? `<p>${section.links.map(link => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(' · ')}</p>` : ''}</div></section>`).join('\n');
  const main = `<main><section class="page-hero services-hero"><div><p class="eyebrow"><span></span> Transportes Huancas</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.intro)}</p></div></section>${sections}<section class="fleet-cta section"><h2>Consulta tu viaje con Transportes Huancas</h2><p>Disponibilidad, tarifa, modalidad de viaje y punto de recojo se confirman por WhatsApp.</p><a class="btn btn-gold" href="${whatsApp}" target="_blank" rel="noopener">Consultar por WhatsApp →</a></section></main>`;
  html = html.replace(/<main>[\s\S]*?<\/main>/, main);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${route}#webpage`, url: route, name: page.title, description: page.description, inLanguage: 'es-PE', isPartOf: { '@id': '/#website' }, about: { '@id': '/#organization' } };
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head>`);
  await mkdir(`dist${route}`, { recursive: true });
  await writeFile(`dist${route}index.html`, html);
}
// Archivos pesados de fotos originales no se necesitan para servir las páginas.
// La compresión HTTP se aplica al contenido textual desde el servidor.
console.log('Sitio preparado en dist/');
