FROM node:21 AS webapp

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/srv/node_modules \
    npm install --prefer-offline

COPY public public
COPY src src
COPY .env ./
RUN npm run build

FROM alpine:3.15

RUN apk add --no-cache nginx nginx-mod-http-lua
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx/default.conf /etc/nginx/http.d/default.conf
COPY --from=webapp /app/build /srv/estratti

EXPOSE 80
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
