#!/usr/bin/env bash
set -euo pipefail

# Full fresh rebuild: stop & remove containers, images (project), volumes, then start clean.
# Usage:
#   ./scripts/fresh.sh            # rebuild with cache (faster)
#   ./scripts/fresh.sh --no-cache # force rebuild of every layer

PROJECT_PREFIX=workflow-platform

echo "[fresh] Bringing down any running stack (containers, networks, volumes)..."
docker compose down --remove-orphans --volumes || true

# Remove images built for this project (filter by repo prefix)
IMAGES=$(docker images --format '{{.Repository}}:{{.Tag}}' | grep "^${PROJECT_PREFIX}-" || true)
if [[ -n "${IMAGES}" ]]; then
  echo "[fresh] Removing images:" $IMAGES
  docker rmi -f $IMAGES || true
fi

# Optional: prune dangling images (safe)
DANGLING=$(docker images -f dangling=true -q || true)
if [[ -n "${DANGLING}" ]]; then
  docker rmi -f ${DANGLING} || true
fi

NO_CACHE=false
if [[ "${1:-}" == "--no-cache" ]]; then
  NO_CACHE=true
fi

echo "[fresh] Building images (no-cache=${NO_CACHE})..."
if $NO_CACHE; then
  docker compose build --no-cache
else
  docker compose build
fi

echo "[fresh] Starting containers..."
docker compose up -d

echo "[fresh] Waiting for core service health (mongo, auth, api-gateway)..."
# Simple polling loop (max 60s)
for svc in mongo auth-service api-gateway; do
  for i in {1..30}; do
    if docker compose ps --format '{{.Service}} {{.Status}}' | grep -q "${svc}.*(healthy)"; then
      echo "[fresh] ${svc} healthy"; break
    fi
    sleep 2
    if [[ $i -eq 30 ]]; then
      echo "[fresh] Timeout waiting for ${svc}"; exit 1
    fi
  done
done

echo "[fresh] Aggregate gateway health:" || true
curl -sf http://localhost:4000/aggregate/health || echo "(aggregate health not ready)"

echo "[fresh] Frontend: http://localhost:3000"
