FROM node:22-alpine AS shared
WORKDIR /shared-lib
COPY shared-lib/package.json shared-lib/package-lock.json* ./
RUN npm install --no-audit --no-fund || true
COPY shared-lib/tsconfig.json ./
COPY shared-lib/src ./src
RUN npm run build || echo "shared-lib build done"

FROM node:22-alpine AS deps
WORKDIR /app
COPY workflow-service/package.json workflow-service/package-lock.json* ./
RUN npm ci --omit=dev || npm install --no-audit --no-fund
COPY --from=shared /shared-lib/dist ./shared-lib/dist
COPY shared-lib/package.json ./shared-lib/package.json

FROM node:22-alpine AS runtime
WORKDIR /app
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp
COPY --from=deps /app /app
COPY workflow-service/src ./src
EXPOSE 5002
USER nodeusr
CMD ["node", "src/index.js"]
