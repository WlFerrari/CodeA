# --- Build stage ---
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build client assets
RUN npm run build

# --- Production stage ---
FROM node:20-bookworm
WORKDIR /app
ENV NODE_ENV=production
# Default DB client to sqlite for simplest deploy
ENV DB_CLIENT=sqlite
# Ensure data directory is persisted if a volume is mounted
VOLUME ["/app/data"]
# Install only prod deps (better-sqlite3 needs build tools; reuse from builder cache by copying node_modules)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Copy server and built client
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist
# Expose API port
EXPOSE 3001
# Default envs
ENV API_PORT=3001
# Start API server (serves /dist and /api)
CMD ["node", "--enable-source-maps", "-e", "import('tsx').then(()=>import('./server/index.ts'))"]
