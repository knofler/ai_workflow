SHELL := /bin/bash

build-shared:
	npm --workspace shared-lib run build

up:
	docker compose up --build

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=200

gateway-health:
	curl -s http://localhost:4000/aggregate/health | jq . || curl -s http://localhost:4000/aggregate/health

fresh: ## Full clean rebuild (containers, images, volumes) then up
	bash scripts/fresh.sh

fresh-nocache: ## Full clean rebuild with --no-cache build
	bash scripts/fresh.sh --no-cache
