# Despliegue en EasyPanel

1. Crea un servicio **App** y conecta este repositorio o sube el proyecto completo comprimido.
2. En Build selecciona **Dockerfile**, ruta `Dockerfile`, contexto `.`.
3. En Environment configura `SITE_URL=https://transportes-huancas.stkkft.easypanel.host` con el dominio temporal activo de EasyPanel, sin rutas. `PORT=3000` ya está definido en la imagen.
4. En Domains agrega el dominio y dirige el tráfico al puerto interno **3000**, protocolo HTTP. Activa HTTPS en EasyPanel.
5. Pulsa Deploy y verifica `/`, `/servicios/`, `/flota/`, `/nosotros/`, `/contacto/`, `/robots.txt` y `/sitemap.xml`.

No necesitas volumen, base de datos ni instalar paquetes npm. El servidor Node sirve el sitio y genera URLs absolutas para canonical, Open Graph, Twitter, datos estructurados y sitemap. Si falta `SITE_URL`, usa el dominio temporal conocido, definido en `site.config.mjs`; no depende de la cabecera Host de los visitantes.

Las URLs antiguas `.html`, las rutas sin barra final y `/reservar/` redirigen con HTTP 301. Las páginas inexistentes responden HTTP 404. Los archivos HTML siguen siendo archivos internos; no aparecen en las URLs públicas.

## Comprobación local

Con Node 22 o superior: `npm run build` y `npm start`. Abre `http://localhost:3000`. Para usar otro dominio, define `SITE_URL` antes de iniciar. No abras los HTML directamente desde el explorador de archivos.

`dist/` es una copia generada. Modifica los archivos de la raíz y ejecuta el build para actualizarla. En EasyPanel despliega el proyecto con su Dockerfile, no únicamente la carpeta dist: las redirecciones HTTP y el SEO del dominio dependen del servidor.

## SEO incluido

- Títulos y descripciones propios, idioma español, un H1 por página y enlaces internos con rutas limpias.
- Canonical absoluto, Open Graph, Twitter Card y datos estructurados del negocio en la portada.
- Sitemap con las ocho páginas indexables y robots con la URL del sitemap.
- Redirecciones permanentes para consolidar las versiones antiguas.

Después de publicar, envía `https://tu-dominio.pe/sitemap.xml` a Google Search Console. La indexación depende de Google.

## Dominio temporal y enfoque local

El contenido está orientado a Transportes Huancas y consultas de viajes entre Piura, Chiclayo y Huarmaca. No publica salidas ni tarifas fijas. Usa el dominio temporal real en SITE_URL mientras esté activo. Cuando compres transporteshuancas.com, configura HTTPS, actualiza SITE_URL y establece redirecciones 301 desde el temporal conservando las rutas.

## Verificación de Google Search Console

El código público proporcionado por el propietario ya está en `site.config.mjs`. El servidor lo incorpora como `google-site-verification` en el HTML de todas las páginas. Puede reemplazarse mediante `GOOGLE_SITE_VERIFICATION` sin editar archivos.

1. Sube este proyecto y vuelve a desplegar en EasyPanel con Dockerfile y puerto 3000.
2. Abre el código fuente de la portada y busca `google-site-verification`. Debe aparecer el código proporcionado, una sola vez.
3. En Search Console, selecciona la propiedad de tipo **Prefijo de URL**: `https://transportes-huancas.stkkft.easypanel.host/`.
4. En el método **Etiqueta HTML**, pulsa **Verificar**. Conserva la etiqueta tras verificar.
5. En Sitemaps, envía `sitemap.xml`.
6. En Inspección de URLs, comprueba y solicita indexación de la portada y luego `/piura-chiclayo/`, `/piura-huarmaca/` y `/chiclayo-huarmaca/`.

La verificación, el envío y la solicitud de indexación se completan desde la cuenta autorizada del propietario. Incluir la etiqueta no equivale a haber realizado esos pasos. Google decide la indexación y el posicionamiento.

## Contenido y pruebas

Las tres rutas confirmadas se generan desde `content/*.json` utilizando la misma cabecera, pie, estilos y asistente de cotización. Los archivos en `content/drafts/` no se publican. Ejecutivo, turismo privado y traslados para grupos requieren confirmar que se ofrecen antes de añadirlos a `site.config.mjs`.

Ejecuta `npm run build` y `npm test`. El test comprueba respuestas, canonical, Open Graph, JSON-LD, enlaces, recursos, compresión, sitemap, redirecciones, 404 y verificación de Google.

Las fuentes DM Sans y Manrope se alojan localmente en WOFF2; sus licencias OFL están en `assets/fonts/`. El diseño utiliza las mismas familias y pesos. Los logos WebP y las variantes móviles mantienen la composición visual.
