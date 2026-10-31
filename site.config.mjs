// Dominio temporal activo. Cambiar SITE_URL al migrar al dominio comercial.
export const defaultSiteUrl = 'https://transportes-huancas.stkkft.easypanel.host';
// Es un identificador público: Google lo comprueba en el HTML servido.
export const defaultGoogleSiteVerification = '8nTc8Vg7Wr7lIfbRFdPOd2Z2ySLX1CafOjxLbJ-UJlU';
export const baseRoutes = ['/', '/servicios/', '/flota/', '/nosotros/', '/contacto/'];
export const routePages = ['/piura-chiclayo/', '/piura-huarmaca/', '/chiclayo-huarmaca/'];
export const publicRoutes = [...baseRoutes, ...routePages];
