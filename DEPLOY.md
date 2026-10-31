# Despliegue en EasyPanel

1. Crea un servicio **App** y conecta este repositorio o sube el proyecto completo comprimido.
2. En Build selecciona **Dockerfile**, ruta `Dockerfile`, contexto `.`.
3. En Environment configura `SITE_URL=https://tu-direccion-temporal` con el dominio temporal activo de EasyPanel, sin rutas. `PORT=3000` ya está definido en la imagen.
4. En Domains agrega el dominio y dirige el tráfico al puerto interno **3000**, protocolo HTTP. Activa HTTPS en EasyPanel.
5. Pulsa Deploy y verifica `/`, `/servicios/`, `/flota/`, `/nosotros/`, `/contacto/`, `/robots.txt` y `/sitemap.xml`.

No necesitas volumen, base de datos ni instalar paquetes npm. El servidor Node sirve el sitio y genera URLs absolutas para canonical, Open Graph, Twitter, datos estructurados y sitemap. Si falta `SITE_URL`, usa el host de la petición para permitir una vista previa; configura la variable antes de indexar el dominio definitivo.

Las URLs antiguas `.html`, las rutas sin barra final y `/reservar/` redirigen con HTTP 301. Las páginas inexistentes responden HTTP 404. Los archivos HTML siguen siendo archivos internos; no aparecen en las URLs públicas.

## Comprobación local

Con Node 22 o superior: `npm run build` y `npm start`. Abre `http://localhost:3000`. Para usar otro dominio, define `SITE_URL` antes de iniciar. No abras los HTML directamente desde el explorador de archivos.

`dist/` es una copia generada. Modifica los archivos de la raíz y ejecuta el build para actualizarla. En EasyPanel despliega el proyecto con su Dockerfile, no únicamente la carpeta dist: las redirecciones HTTP y el SEO del dominio dependen del servidor.

## SEO incluido

- Títulos y descripciones propios, idioma español, un H1 por página y enlaces internos con rutas limpias.
- Canonical absoluto, Open Graph, Twitter Card y datos estructurados del negocio en la portada.
- Sitemap con las cinco páginas indexables y robots con la URL del sitemap.
- Redirecciones permanentes para consolidar las versiones antiguas.

Después de publicar, envía `https://tu-dominio.pe/sitemap.xml` a Google Search Console. La indexación depende de Google.

## Dominio temporal y enfoque local

El contenido está orientado a Transportes Huancas y consultas de viajes entre Piura, Chiclayo y Huarmaca. No publica salidas ni tarifas fijas. Usa el dominio temporal real en SITE_URL mientras esté activo. Cuando compres transporteshuancas.com, configura HTTPS, actualiza SITE_URL y establece redirecciones 301 desde el temporal conservando las rutas.
