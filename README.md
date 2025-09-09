<!-- PROJECT HEADER -->
# Multi-Agent AI Automation for Business Workflow

> Orchestrate end‑to‑end business processes with collaborating AI agents, resilient workflow execution, and unified observability.

Short tagline: AI‑augmented workflow orchestration (front to back).

## 🚀 Elevator Pitch
An event‑driven, AI‑assisted orchestration platform where specialized autonomous agents (classification, planning, summarization) collaborate with domain microservices (auth, notification, workflow engine) to execute, monitor, and optimize multi‑step business processes across internal services and external APIs.

## ❓ Problem
Modern SaaS & internal platforms accumulate ad‑hoc scripts, manual approvals, and brittle chained API calls. There is little visibility, no adaptive optimization, and adding AI reasoning later is costly.

## ✅ Solution
Provide a central “workflow brain” that:
* Executes declarative workflow/state-machine/DAG definitions.
* Delegates enrichment & dynamic branching to AI agents.
* Persists state, retries failures with policy, compensates on terminal errors.
* Emits consistent structured telemetry for full process lineage.
* Surfaces human‑readable summaries and audit trails.

## 🧩 Core Concepts
| Component | Role |
|-----------|------|
| api-gateway | Edge ingress, auth delegation, request correlation, simple aggregation. |
| auth-service | Issuing & validating JWT tokens, future RBAC & refresh flows. |
| workflow-service | Orchestrates multi-step processes (state, retries, transitions). |
| notification-service | Asynchronous delivery (email / future channels) & queue workers. |
| shared-lib | Contracts, types, logging helpers, error taxonomy. |
| frontend | Operations console (status, history, admin actions). |
| mongo | Durable state (users, workflow instances, step history). |
| redis | Ephemeral coordination + BullMQ job queues. |
| otel-collector | Central tracing & metrics pipeline (OpenTelemetry). |

## 🏗 Architecture (Current Phase)
```
	 [ Client / UI ]
				 |
	 (Vercel Frontend)
				 |
	 HTTPS -> API Gateway --> Auth Service
					|        \--> Workflow Service --> Redis Queue --> Workers (notification / future agents)
					|                      |                              |
					|                      +--> Mongo (workflow state)    +--> External APIs
					|                      +--> AI Agents (planned hooks)
					|
					+--> Notification Service --> Email / Channels

	 Observability: Services -> OTEL Collector -> (Jaeger / Tempo / Honeycomb etc.)
```

## 📦 Repository / Monorepo Layout (Target)
```
root/
	package.json            # npm workspaces (planned)
	shared-lib/
	api-gateway/
	auth-service/
	workflow-service/
	notification-service/
	frontend/
	infra/
		terraform/            # Terraform modules (ECS, ECR, IAM, VPC, Redis/Mongo providers)
		cdk/                  # Optional CDK apps (alternative to Terraform)
	scripts/
	.github/workflows/      # CI pipelines (app, infra)
	docker-compose.yml
	docker-compose.override.yml
```

## 🧪 Local Development
```bash
cp .env.example .env        # adjust as needed
docker compose up --build
# Frontend: http://localhost:3000
# Gateway health: http://localhost:4000/health
```
Hot reload (dev): `docker compose -f docker-compose.yml -f docker-compose.override.yml up` (services using `node --watch`, shared-lib `tsc --watch`).

## 🌐 Deployment Targets
### Frontend (Vercel)
Deploy only `frontend/` directory:
1. Import GitHub repo → set root directory to `frontend`.
2. Build command: `npm install --workspaces --include-workspace-root=false && npm run build` (future once workspaces added).
3. Env vars: `NEXT_PUBLIC_API_BASE=https://api.example.com`.

### Backend Services (AWS ECS Fargate)
* CI builds Docker images tagged with `git-sha` + `main`.
* Terraform: ECR repositories, ECS cluster + task defs (one per service), ALB for `api-gateway`.
* Redis (Elasticache) & MongoDB Atlas (or self‑managed) endpoints passed via task env.

### Hybrid Flow
1. Merge to `main` → Actions builds & pushes images.
2. Terraform apply updates task definitions (image tag param).
3. Vercel auto‑deploys frontend referencing API base URL.

## 🛠 Infrastructure as Code
Two parallel tracks (choose one per environment):
| Tool | Use Case |
|------|----------|
| Terraform | Declarative, module reuse across environments. |
| AWS CDK | Imperative constructs + TypeScript synergy for complex logic. |

Planned structure:
```
infra/terraform/
	main.tf        # providers, remote state
	vpc.tf         # networking
	ecr.tf         # repositories per service
	ecs.tf         # cluster, services, task defs
	redis.tf       # Elasticache (optional Upstash alternative)
	outputs.tf

infra/cdk/
	bin/
	lib/
	package.json
```

## 🔐 Security & Governance (Planned)
* Principle of least privilege IAM roles for GitHub OIDC deploy.
* Signed workflow definitions (future) & immutable event log.
* CODEOWNERS for `infra/` & `shared-lib/`.
* Secret handling via AWS Secrets Manager / Vercel secrets (never commit `.env`).

## 🧠 AI Agent Hooks (Roadmap)
| Agent | Function | Trigger |
|-------|----------|---------|
| Classifier | Determine intent / priority | Workflow start |
| Planner | Expand abstract node → concrete tasks | Pre-execution per branch |
| Summarizer | Human-readable digest | On status change / completion |
| Optimizer (future) | Path scoring, batching | Periodic analysis |

## 🛣 Roadmap Phases
| Phase | Focus |
|-------|-------|
| M0 | Stable container stack, basic sequential workflows, health & logging |
| M1 | Parallel steps, retries, compensation hooks |
| M2 | AI classification + summarization agents integrated |
| M3 | DSL for workflow definitions + approval gates |
| M4 | Metrics-driven optimization + adaptive branching |
| M5 | Natural language → DSL authoring pipeline |

## 🧪 Testing Strategy (Planned)
* Unit: shared-lib utilities & service handlers.
* Integration: spin services via docker compose (GitHub Action matrix) hitting real endpoints.
* Contract: OpenAPI schema diff + JSON schema validation for events.
* Load (later): k6 / Artillery for workflow throughput & retry behavior.

## 📊 Observability
* Correlated request IDs propagated via headers.
* OpenTelemetry traces → collector → vendor sink (to be configured).
* Health endpoints aggregate dependency status (gateway + per-service).

## 🧩 When to Revisit Architecture
Remove `workflow-service` temporarily if orchestration logic remains trivial (<3 steps, no retries). Keep internal module boundary for quick re‑extraction.

## 🗂 Current Services & Ports
| Service | Port | Notes |
|---------|------|-------|
| frontend | 3000 | Next.js UI (Vercel target) |
| api-gateway | 4000 | Public edge & aggregation |
| auth-service | 5001 | JWT issuing / auth checks |
| workflow-service | 5002 | Orchestration engine (early) |
| notification-service | 5003 | Async jobs & notifications |
| mongo | 27017 | Persistence |
| redis | 6379 | Queue / cache |

## 🧭 Developer Workflow
1. Branch, implement, ensure `docker compose up` green.
2. Run tests (coming soon) & lint.
3. Commit with conventional message (e.g., `feat(workflow): add retry policy`).
4. PR triggers CI (path filters skip infra-only changes).
5. Merge → images built & pushed; optional Terraform apply job after approval.

## 📝 Contributing (Initial Guidelines)
* Keep shared-lib minimal & version bump when changing contracts.
* Avoid cross-service imports (only shared-lib).
* Prefer additive migrations; document breaking changes in PR body.
* Add or update README sections for new architectural elements.

## 🔒 Non-Goals
* Not implementing full BPMN 2.0 engine.
* Not a general-purpose LLM hosting platform.
* Not a data warehouse or analytics suite.

## 📄 License
Choose a license (MIT / Apache-2.0 / Proprietary) and update this section.

## 🏷 Repository Description (Use on GitHub)
Multi-agent AI powered workflow orchestration platform: declarative processes, resilient execution, and adaptive automation across microservices.

## 🙋 FAQ (Seed)
Q: Can I deploy only the frontend?  
A: Yes—Vercel for `frontend/`, with backend endpoints pointing at ECS or another host.  
Q: Do I need workflow-service now?  
A: Keep only if multi-step orchestration + retries exist; otherwise fold into gateway and re-split later.

---
Initial expanded documentation created: 2025-09-09.
