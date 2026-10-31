FROM node:24-alpine AS build
WORKDIR /app
COPY package.json build.mjs server.mjs site.config.mjs ./
COPY index.html servicios.html flota.html nosotros.html contacto.html styles.css script.js favicon.ico site.webmanifest robots.txt ./
COPY servicios ./servicios
COPY flota ./flota
COPY nosotros ./nosotros
COPY contacto ./contacto
COPY reservar ./reservar
COPY assets ./assets
COPY fotos ./fotos
COPY content ./content
RUN node build.mjs

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json server.mjs site.config.mjs ./
ENV NODE_ENV=production PORT=3000
ENV SITE_URL=https://transportes-huancas.stkkft.easypanel.host
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
