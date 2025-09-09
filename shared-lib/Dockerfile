FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --no-audit --no-fund || true
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS final
WORKDIR /app
COPY --from=deps /app/dist ./dist
COPY package.json ./package.json
CMD ["node", "-e", "console.log('shared-lib build complete')"]
