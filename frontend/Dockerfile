FROM node:22-alpine AS shared-lib-builder
WORKDIR /repo/shared-lib
COPY shared-lib/package.json shared-lib/package-lock.json* ./
COPY shared-lib/tsconfig.json ./
COPY shared-lib/src ./src
RUN npm install --no-audit --no-fund && npm run build

FROM node:22-alpine AS frontend-builder
WORKDIR /repo/frontend
# IMPORTANT: Use localhost for browser-facing URL baked into client bundle.
ARG NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
ENV NEXT_PUBLIC_GATEWAY_URL=${NEXT_PUBLIC_GATEWAY_URL}
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY frontend/next.config.js ./next.config.js
COPY frontend/tailwind.config.js ./tailwind.config.js
COPY frontend/postcss.config.js ./postcss.config.js
COPY frontend/app ./app
COPY frontend/components ./components
COPY frontend/lib ./lib
# Bring in built shared-lib for any runtime imports
COPY --from=shared-lib-builder /repo/shared-lib/dist ../shared-lib/dist
COPY --from=shared-lib-builder /repo/shared-lib/package.json ../shared-lib/package.json
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp
COPY --from=frontend-builder /repo/frontend/.next ./.next
COPY --from=frontend-builder /repo/frontend/node_modules ./node_modules
COPY --from=frontend-builder /repo/frontend/package.json ./package.json
COPY --from=frontend-builder /repo/frontend/next.config.js ./next.config.js
COPY --from=frontend-builder /repo/shared-lib ./shared-lib
EXPOSE 3000
# Keep for consistency (client uses baked value from build stage)
ARG NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
ENV NEXT_PUBLIC_GATEWAY_URL=${NEXT_PUBLIC_GATEWAY_URL}
ENV NODE_ENV=production
USER nodeusr
CMD ["npm", "run", "start"]
