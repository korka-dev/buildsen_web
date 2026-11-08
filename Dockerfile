# Frontend BUILDSEN (Next.js, sortie « standalone »). Image Debian légère : sharp (images d'aperçu) y fonctionne sans réglage.
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Adresse interne de l'API, inscrite dans le relais /api au moment du build (voir docker-compose.yml)
ARG BACKEND_URL=http://backend:8000
ENV BACKEND_URL=$BACKEND_URL
# Formules et paiement visibles sur le site (valeur figée au build ; doit correspondre à PLANS_ENABLED côté API)
ARG NEXT_PUBLIC_SHOW_PRICING=false
ENV NEXT_PUBLIC_SHOW_PRICING=$NEXT_PUBLIC_SHOW_PRICING
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN useradd --create-home --uid 10001 buildsen
COPY --from=build --chown=buildsen /app/.next/standalone ./
COPY --from=build --chown=buildsen /app/.next/static ./.next/static
COPY --from=build --chown=buildsen /app/public ./public
USER buildsen
EXPOSE 3000
# BACKEND_URL : figée au build pour le relais /api, relue au démarrage pour les pages rendues côté serveur
CMD ["node", "server.js"]
