# Build Vite app, then serve static assets with nginx
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Same-origin API: leave VITE_API_URL empty. Override for split domains.
ARG VITE_API_URL=
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_FACEBOOK_APP_ID=
ARG VITE_APPLE_CLIENT_ID=
ARG VITE_APPLE_REDIRECT_URI=

# Where the prerenderer reads the project list, so /projects/<id> ships as real
# HTML instead of a spinner. Build-time only — it is never baked into the
# bundle, and the browser still calls the API through VITE_API_URL.
#
# Must be reachable from the build container, which is NOT on the compose
# network: use the public origin (https://fibicommunity.org), not http://backend.
# Left empty the build still succeeds and warns, skipping project pages.
ARG PRERENDER_API_URL=

ENV VITE_API_URL=$VITE_API_URL
ENV PRERENDER_API_URL=$PRERENDER_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_FACEBOOK_APP_ID=$VITE_FACEBOOK_APP_ID
ENV VITE_APPLE_CLIENT_ID=$VITE_APPLE_CLIENT_ID
ENV VITE_APPLE_REDIRECT_URI=$VITE_APPLE_REDIRECT_URI

RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/healthz || exit 1
