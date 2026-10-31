import { mkdir, cp } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'servicios.html', 'flota.html', 'nosotros.html', 'contacto.html', 'servicios', 'flota', 'nosotros', 'contacto', 'reservar', 'styles.css', 'script.js', 'assets', 'fotos', 'favicon.ico', 'site.webmanifest', 'robots.txt']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log('Sitio preparado en dist/');
