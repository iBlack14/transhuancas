FROM node:24-alpine
WORKDIR /app
COPY package.json build.mjs server.mjs ./
COPY index.html servicios.html flota.html nosotros.html contacto.html styles.css script.js favicon.ico site.webmanifest robots.txt ./
COPY servicios ./servicios
COPY flota ./flota
COPY nosotros ./nosotros
COPY contacto ./contacto
COPY reservar ./reservar
COPY assets ./assets
COPY fotos ./fotos
RUN node build.mjs
ENV NODE_ENV=production PORT=3000
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
