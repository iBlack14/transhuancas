# SEO de Transportes Huancas — 31 de octubre de 2026

## Arquitectura y alcance

HTML estático, CSS y JavaScript propios. No se usa React, Next ni otro framework. Node sirve el contenido de `dist/`; el HTML importante llega completo en la respuesta HTTP. Dockerfile con Node 24, puerto 3000 y cero dependencias npm de producción. `site.config.mjs` concentra el dominio temporal y las rutas públicas. No se ha desplegado desde esta sesión.

Se conservan la composición visual, cabecera, menú, formularios, calendario, buscador de lugares, controles de pasajeros, enlaces y asistente de WhatsApp. Se corrige el orden de capas del calendario abierto para que el botón flotante no intercepte su botón Hoy en móvil. Las páginas nuevas reutilizan el diseño existente. Los títulos H1 de Nosotros y Flota describen su contenido; no se modifica la estructura del menú.

## SEO técnico implementado y comprobado localmente

- Ocho URL indexables, con canonical absoluto, títulos y descripciones únicos, Open Graph, Twitter Card y un H1 por página.
- `/robots.txt` permite el rastreo y enlaza el sitemap del dominio temporal. `/sitemap.xml` contiene exclusivamente las ocho páginas públicas existentes.
- Redirecciones 301 de `.html`, `index.html` y rutas sin barra final hacia la URL canónica. `/reservar/` conserva su redirección a Contacto. Se conserva la cadena de consulta.
- HTTP 404 real para rutas inexistentes, archivos internos y los servicios sin confirmar. Respuestas de error con `X-Robots-Tag: noindex`.
- Contenido y enlaces de rutas en el HTML inicial. Fallback `noscript` para mostrar el contenido que normalmente se anima al entrar en pantalla.
- JSON-LD `Organization`, `WebSite` y `WebPage`. Nombre comercial y teléfono conservados del proyecto. Se eliminan del marcado dirección no verificada, `priceRange`, clasificación como taxi y catálogo no confirmado. No se incorporan valoraciones, horarios ni perfiles sociales sin verificar.
- Compresión gzip de texto y revalidación de HTML, CSS y JS para recibir actualizaciones tras el deploy.

No hay páginas privadas publicadas ni sistema de acceso privado en este proyecto. No se crean rutas de administración.

## Contenido de rutas

Publicadas en el proyecto, pendientes de subir a EasyPanel:

- `/piura-chiclayo/`: ida y regreso, información para solicitar pasajes o reserva y posibles puntos de encuentro.
- `/piura-huarmaca/`: origen y destino exactos, localidades cercanas y confirmación del acceso.
- `/chiclayo-huarmaca/`: referencias de Olmos y Hualapampa y consultas de recojo o descenso.

El propietario confirmó las tres rutas. Los textos no prometen paradas, frecuencias, venta de pasajes disponible, exclusividad, precios ni tiempos de viaje: la modalidad y disponibilidad se consultan por WhatsApp. Son contenidos distintos, con enlaces internos y mensajes de consulta propios.

Las páginas `/transporte-ejecutivo/`, `/turismo-privado/` y `/traslados-para-grupos/` quedan como borradores en `content/drafts/`, fuera del servidor y del sitemap. Requieren confirmar que se ofrecen antes de publicar.

Fuentes geográficas consultadas: [mapa vial de Huarmaca del MTC](https://portal.mtc.gob.pe/transportes/caminos/normas_carreteras/Mapas%20Distritales/Piura/PI_200304%20HUARMACA.pdf), [Municipalidad de Huarmaca: vía Huarmaca–Hualapampa](https://www.gob.pe/institucion/munihuarmaca/noticias/1117083-a-corto-plazo-se-atenderan-tramos-criticos-en-la-via-huarmaca-hualapampa), [referencia de acceso hacia Olmos y Chiclayo](https://andina.pe/agencia/noticia-nueva-via-hualapampahuarmaca-beneficia-a-mas-41000-piuranos-539170.aspx) y [ubicación del peaje de Mórrope en la Panamericana Norte, Ositran](https://www.ositran.gob.pe/anterior/tarifas-de-peajes-en-carreteras-concesionadas/). Estas fuentes describen conexiones viales, no prueban los paraderos ni el itinerario de la empresa. No se publican condiciones actuales de carretera a partir de noticias históricas.

## Rendimiento y accesibilidad

Logos WebP, imágenes con dimensiones, variantes de 640/960 píxeles cuando corresponden, `srcset`, lazy loading fuera de pantalla y precarga de la imagen principal. Se mantienen las fotos originales de la cabecera y las familias DM Sans y Manrope. Las fuentes WOFF2 se sirven localmente, con sus licencias OFL. No se añaden paquetes al sitio para medir rendimiento.

Comparación local con Lighthouse 12, emulación móvil y el mismo equipo:

| Medición | Antes | Después |
| --- | ---: | ---: |
| Rendimiento | 67/100 | 85/100 |
| SEO de Lighthouse | 100/100 | 100/100 |
| Accesibilidad | 90/100 | 96/100 |
| LCP | 9,68 s | 3,47 s |
| CLS | ≈ 0 | ≈ 0 |
| TBT | 0 ms | 217 ms |

El LCP mejora, pero todavía supera 2,5 segundos en esta simulación. El TBT empeoró en esta medición y debe vigilarse en producción; no es INP. Las puntuaciones varían con CPU, red y carga. Las advertencias de contraste que exigirían cambiar colores se conservan por la restricción de diseño. No se afirma que el sitio haya aprobado Core Web Vitals de campo.

INP real pendiente de datos de usuarios en PageSpeed Insights/CrUX o Search Console. Referencia: [Core Web Vitals de Google](https://developers.google.com/search/docs/appearance/core-web-vitals). No hay medición de campo suficiente en esta sesión. Informes completos locales en `output/lighthouse-before.json` y `output/lighthouse-final.json`.

## Comprobación del sitio publicado antes de este despliegue

La URL temporal respondió 200 en portada, robots y sitemap; 301 de HTTP a HTTPS y de `/servicios.html` a `/servicios/`; y 404 en una ruta inexistente. No se observó `noindex` en la portada ni un bloqueo general en robots.

La comprobación TLS estricta de Python falló en este entorno. Una inspección diagnóstica del certificado mostró el nombre `*.stkkft.easypanel.host` y vigencia del 4 de septiembre al 3 de diciembre de 2026, que comprende el 31 de octubre. Los estados HTTP anteriores se inspeccionaron desactivando la validación TLS únicamente en esa consulta diagnóstica; esto no equivale a certificar HTTPS desde todos los clientes. No se cambió la configuración TLS del proyecto. EasyPanel debe mantener la renovación y su redirección HTTPS.

## Google Search Console y migración

El código de verificación proporcionado por el propietario está incluido. Se probó que aparece en el HTML servido, sin ejecutar JavaScript. **Todavía no se ha pulsado Verificar, enviado el sitemap ni solicitado indexación desde la cuenta de Google.** Es necesario desplegar esta versión y completar esos pasos siguiendo `DEPLOY.md`.

Usar la propiedad de prefijo `https://transportes-huancas.stkkft.easypanel.host/`. No usar todavía `transporteshuancas.com` como canonical. Cuando se compre, configurar DNS y HTTPS, cambiar `SITE_URL`, mantener las rutas y establecer redirecciones 301 desde el temporal. Verificar ambas propiedades y notificar el cambio cuando corresponda. [Guía de migración de Google](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

## Pendientes que requieren información del propietario

- Confirmar los tres servicios adicionales antes de activar sus páginas.
- Validar afirmaciones previas del sitio, como atención 24/7, cobertura nacional y capacidades de pasajeros/equipaje; se preservan para no alterar el contenido y comportamiento existente, pero no se añadieron a los datos estructurados.
- Proporcionar perfiles sociales oficiales si se desea usarlos en `sameAs`. Los enlaces genéricos previos de Facebook/Instagram se conservan por la restricción de no retirar botones.
- Publicar el ZIP actualizado y completar las acciones de Search Console con la cuenta autorizada.

La preparación técnica y el envío de un sitemap no garantizan indexación ni posiciones en Google.

## Validación funcional

`npm run build`, `npm test` y validación XML del sitemap completados. La prueba HTTP recorre las ocho páginas y veinte recursos, comprueba redirecciones, etiquetas, JSON-LD y rutas no publicadas.

En Chrome a 390 × 844 se comprobó el menú móvil, cierre con Escape y los cuatro pasos del asistente hasta generar el enlace final de WhatsApp. También se comprobó el formulario de Contacto con el calendario: se capturó el enlace generado sin abrir WhatsApp ni enviar mensajes. No hubo desbordamiento horizontal en las pantallas revisadas.

Con JavaScript deshabilitado, el H1, el contenido de portada y los enlaces de rutas siguen disponibles y el contenido animado queda visible. Se revisaron capturas de la portada antes/después y de la nueva página Piura–Huarmaca en móvil.

Docker no está instalado en el equipo, por lo que no se afirma haber construido o ejecutado la imagen localmente. La compilación y el arranque de Node sí se probaron; revisar el build de EasyPanel al publicar.
