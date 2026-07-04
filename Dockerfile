FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libstdc++ \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/init-db.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --production \
  && npm rebuild better-sqlite3 \
  && npm cache clean --force \
  && mkdir -p /app/data \
  && chown -R nextjs:nodejs /app/data
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD node init-db.js && npx next start
