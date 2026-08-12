# FIBI API — Node + Prisma (PostgreSQL)
FROM node:22-alpine AS base
WORKDIR /app
# openssl + libc6-compat are required by the Prisma query engine on musl.
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
# postinstall runs `prisma generate`, and `prisma migrate deploy` runs at
# container start, so the Prisma CLI (a devDependency) must stay in the image —
# do not add --omit=dev here.
RUN npm ci

FROM deps AS release
COPY . .
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs fibi

# `uploads` is excluded by .dockerignore, so this directory would otherwise not
# exist in the image. Docker seeds a fresh named volume from the image path it
# is mounted over, including ownership — creating it as fibi:nodejs here is what
# makes the mounted volume writable by the non-root user. Without this, multer
# fails with EACCES on the first project image upload.
RUN mkdir -p /app/uploads && chown -R fibi:nodejs /app

USER fibi
EXPOSE 5000

# Compose waits on this before routing traffic; see /health in index.js.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "index.js"]
