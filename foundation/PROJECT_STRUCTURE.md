# Genius Center — Project Structure

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Active — pre-implementation blueprint |
| **Authority** | Subordinate to `PROJECT_CONSTITUTION.md` and PRD §20 |
| **Rule** | No application code until Phase 0 begins. This structure is the target layout. |

---

## 1. Purpose

This document defines the **complete repository structure** for Genius Center before a single line of application code is written. Every folder has a defined purpose. Agents and developers place artifacts in the correct location — never ad hoc.

---

## 2. Repository Overview

```
genius-center/                         # Repository root
│
├── foundation/                        # AI development operating system
├── docs/                              # Approved product documentation
├── specs/                             # Implementation-ready specifications
├── knowledge/                         # Evolving market & decision intelligence
├── tasks/                             # Work tracking for agents and developers
├── architecture/                      # Engineering architecture artifacts
├── design-system/                     # UI tokens, components, patterns
├── database/                          # Schema docs, ERD, migration notes
│
├── apps/                              # Application packages (Phase 0+)
├── packages/                          # Shared libraries (Phase 0+)
├── prisma/                            # Database schema & migrations (Phase 0+)
├── scripts/                           # Build, dev, and ops scripts (Phase 0+)
├── tests/                             # Cross-cutting test infrastructure (Phase 0+)
│
├── .github/                           # CI/CD workflows (when repo initialized)
├── .vscode/                           # Editor settings (optional)
└── README.md                          # Project entry point
```

---

## 3. Folder Definitions

---

### 3.1 `foundation/`

**Purpose:** The AI Development Foundation — how every agent thinks, decides, implements, and reviews.

**Authority:** Highest operational authority (after Constitution principles).

**Contents:**

| File | Purpose |
|---|---|
| `PROJECT_CONSTITUTION.md` | Non-negotiable principles |
| `AI_AGENT_GUIDE.md` | Agent roles and boundaries |
| `DEVELOPMENT_WORKFLOW.md` | Idea → Release pipeline |
| `DEVELOPMENT_STANDARDS.md` | Engineering conventions |
| `MODULE_SPEC_TEMPLATE.md` | Module specification template |
| `TASK_TEMPLATE.md` | Task template |
| `REVIEW_CHECKLIST.md` | Mandatory review gate |
| `DEFINITION_OF_DONE.md` | Completion criteria |
| `KNOWLEDGE_BASE_STRUCTURE.md` | Knowledge repository design |
| `PROJECT_STRUCTURE.md` | This document |

**Who writes here:** Foundation documents amended by Product Manager + Architect with stakeholder approval.

**When to read:** Before every task — all agents.

---

### 3.2 `docs/`

**Purpose:** Approved, canonical product documentation — the "what" and "why" of Genius Center.

**Authority:** PRD is architecture/product authority; BRS is business rules authority; FS is screen/workflow authority; ETBS is scenario authority.

**Contents:**

```
docs/
├── Genius_Center_PRD_v2.0.md          # Product Requirements (canonical)
├── Genius_Center_BRS_v1_0.md            # Business Rules Specification
├── Genius_Center_FS_v1_0.md             # Functional Specification
├── Genius_Center_ETBS_v1_0.md           # Egyptian Tutoring Business Scenarios
├── genius_all_documentation.md          # Legacy draft — DO NOT USE (superseded)
└── changelog.md                         # Documentation change history
```

**Who writes here:** Business Analyst, Documentation Engineer, Product Manager (with review).

**When to read:** Every agent, per role requirements in `AI_AGENT_GUIDE.md`.

---

### 3.3 `specs/`

**Purpose:** Implementation-ready specifications derived from docs — closer to code than PRD/BRS/FS.

**Authority:** Module specs supersede tasks; docs supersede module specs on conflict.

**Contents:**

```
specs/
├── README.md                          # Index of all specs
├── modules/                           # Approved module specifications
│   ├── MOD-STU-students.md
│   ├── MOD-ATT-attendance.md
│   ├── MOD-PAY-payments.md
│   └── ...
├── functional/                        # FS supplements per feature (if not in docs/)
├── business-rules/                    # BRS supplements / rule drafts in progress
├── scenarios/                         # ETBS supplements / new scenarios in progress
├── analysis/                          # Business analysis memos (workflow stage 2)
└── traceability/                      # Master traceability matrices
    └── master-matrix.md
```

**Who writes here:** Software Architect, Business Analyst, after workflow stages 5–7.

**Naming:** Module specs: `MOD-[CODE]-[name].md` (e.g., `MOD-ATT-attendance.md`)

---

### 3.4 `knowledge/`

**Purpose:** Long-term evolving intelligence — market research, interviews, discoveries, ADRs, lessons learned.

**Authority:** Informs docs and specs — does not override them without formal amendment.

**Structure:** See `KNOWLEDGE_BASE_STRUCTURE.md`.

**Who writes here:** All agents contribute; domain owners review.

---

### 3.5 `tasks/`

**Purpose:** Atomic work units for agents and developers — the operational backlog.

**Contents:**

```
tasks/
├── README.md                          # Task index and status summary
├── backlog/                           # Ideas approved but not yet taskified
├── active/                            # Current sprint / in-progress tasks
├── blocked/                           # Tasks waiting on dependency or decision
├── completed/                         # Done tasks (archive)
└── templates/                         # Symlink or copy of foundation/TASK_TEMPLATE.md
```

**Naming:** `TASK-NNN-[short-kebab-name].md`

**Who writes here:** Software Architect (breakdown), assigned agents (updates), Documentation Engineer (archive).

---

### 3.6 `architecture/`

**Purpose:** Engineering architecture artifacts — diagrams, IPC contracts, reviews, security notes.

**Contents:**

```
architecture/
├── README.md
├── overview.md                        # System context diagram, layer diagram
├── runtime-model.md                   # Local web app: server, browser, launcher
├── api/                               # HTTP API contract registry
│   ├── README.md
│   └── [domain].contract.md
├── reviews/                           # Architecture review memos
│   └── [feature]-architecture-review.md
├── decisions/                         # Mirror/link to knowledge ADRs
├── security/                          # Threat model, hardening checklist
├── diagrams/                          # Mermaid, PNG architecture diagrams
└── sync/                              # Future cloud sync design (PRD §21)
```

**Who writes here:** Software Architect, Backend Engineer, Security Reviewer.

**When to read:** Before implementation (stage 6+) and during review.

---

### 3.7 `design-system/`

**Purpose:** UI design system — tokens, components, patterns, RTL guidelines.

**Contents:**

```
design-system/
├── README.md
├── tokens/                            # Colors, typography, spacing, shadows
│   ├── colors.md
│   ├── typography.md
│   └── motion.md
├── components/                      # Component specifications
│   ├── button.md
│   ├── data-table.md
│   ├── money-input.md
│   └── ...
├── patterns/                          # Composite UI patterns
│   ├── form-stack.md
│   ├── filter-bar.md
│   └── empty-state.md
├── rtl/                               # RTL-specific guidance
└── references/                        # Reference app screenshots/notes
```

**Authority:** PRD §14–§15 for tokens; this folder expands for implementation.

**Who writes here:** UI/UX Designer, Frontend Engineer.

**Note:** Runtime component code lives in `packages/ui-kit/` or `apps/desktop/renderer/src/components/` once codebase exists. This folder is the **specification** for those components.

---

### 3.8 `database/`

**Purpose:** Database documentation beyond raw Prisma schema — ERD, indexing strategy, migration notes.

**Contents:**

```
database/
├── README.md
├── erd.md                             # Entity relationship documentation
├── indexing-strategy.md               # Index rationale per table
├── migration-guide.md                 # How to author/review migrations
├── seed-data.md                       # Seed scenario documentation
└── performance-notes.md               # Query patterns, scale targets
```

**Authority:** PRD §13 for schema truth; this folder explains **why**.

**Who writes here:** Database Engineer, Software Architect.

**Note:** Actual schema files live in `prisma/` at repo root.

---

### 3.9 `apps/`

**Purpose:** Deployable application packages.

**Status:** Created at Phase 0 — **empty until implementation begins**.

**Contents:**

```
apps/
├── server/                            # Local API server (Node.js + Hono)
│   └── src/
│       ├── index.ts                   # Server entry point
│       ├── routes/                    # HTTP route handlers (per domain)
│       ├── services/                  # Domain services (authoritative logic)
│       │   ├── students/
│       │   ├── attendance/
│       │   ├── payments/
│       │   ├── finance/
│       │   ├── staff/
│       │   ├── reports/
│       │   ├── notifications/
│       │   ├── backup/
│       │   └── audit/
│       ├── infrastructure/            # Prisma, backup, USB HID, PDF, logger
│       └── security/                  # Auth, RBAC, session middleware
└── ui/                                # Browser UI (Vite + React)
    └── src/
        ├── app/                       # Routes, shell, providers
        ├── features/                  # Feature modules (by domain)
        ├── components/                # Shared UI components
        ├── design-system/             # Token consumers, primitives
        ├── hooks/
        ├── lib/                       # API client, fetch utilities
        ├── i18n/                      # Arabic locale bundle
        └── styles/
```

**Who writes here:** Backend Engineer, Frontend Engineer.

---

### 3.10 `packages/`

**Purpose:** Shared libraries consumed by `apps/desktop` — types, schemas, pure domain logic, UI kit.

**Status:** Created at Phase 0.

**Contents:**

```
packages/
├── contracts/                         # Zod schemas + TypeScript types (IPC shared)
│   ├── src/
│   │   ├── students.schema.ts
│   │   ├── attendance.schema.ts
│   │   └── ...
│   └── package.json
├── domain/                            # Pure domain logic (no Electron/React/Prisma)
│   ├── src/
│   │   ├── money/
│   │   ├── dates/
│   │   └── rules/                     # Configurable rule evaluators
│   └── package.json
└── ui-kit/                            # Shared design system components (optional extract)
    ├── src/
    └── package.json
```

**Dependency rules:**
- `contracts` → Zod only
- `domain` → no framework dependencies
- `ui-kit` → React + design tokens
- `apps/server` and `apps/ui` may import all packages; packages never import apps

---

### 3.11 `prisma/`

**Purpose:** Database schema, migrations, and seed scripts.

**Contents:**

```
prisma/
├── schema.prisma                      # Canonical schema (PRD §13.3)
├── migrations/                        # Versioned migrations
└── seed.ts                            # Development seed data
```

**Who writes here:** Database Engineer (with Architect review).

---

### 3.12 `scripts/`

**Purpose:** Build, development, and operational scripts.

**Contents:**

```
scripts/
├── start.ts                           # Launcher: starts server + opens browser
├── backup-check.ts                    # Integrity check utility
└── seed-dev.ts                        # Extended dev seeding
```

**Who writes here:** Backend Engineer, Database Engineer.

---

### 3.13 `tests/`

**Purpose:** Cross-cutting test infrastructure, shared fixtures, E2E config, QA reports.

**Contents:**

```
tests/
├── README.md                          # Testing strategy
├── unit/                              # Shared unit test utilities
├── integration/                       # DB integration test setup
├── e2e/                               # Playwright + Browser E2E tests
│   ├── attendance/
│   ├── payments/
│   └── fixtures/
├── reports/                           # QA reports per feature
│   └── [feature]-qa-report.md
└── fixtures/                          # Shared test data
```

**Note:** Co-located tests (`*.test.ts` next to source) are preferred for unit tests. This folder holds cross-cutting and E2E infrastructure.

---

## 4. Root Files

| File | Purpose |
|---|---|
| `README.md` | Project overview, quick start for agents (links to foundation/) |
| `package.json` | Monorepo root (workspaces: apps/*, packages/*) |
| `pnpm-workspace.yaml` | Workspace config (or npm/yarn equivalent — decided at ADR) |
| `tsconfig.base.json` | Shared TypeScript config |
| `.gitignore` | Standard ignores + SQLite dev DB, logs, build output |
| `.env.example` | Example environment variables (no secrets) |
| `LICENSE` | License (when determined) |

---

## 5. What Goes Where — Decision Guide

| I have a... | Put it in... |
|---|---|
| New business rule | `docs/` BRS or `specs/business-rules/` draft → then docs |
| New real-world scenario | `docs/` ETBS or `specs/scenarios/` draft |
| New screen/workflow spec | `docs/` FS or `specs/functional/` |
| Module ready to implement | `specs/modules/MOD-XXX.md` |
| Task for an agent | `tasks/active/TASK-XXX.md` |
| Architecture decision | `knowledge/architecture-decisions/ADR-XXX.md` |
| Tutor interview notes | `knowledge/teacher-interviews/` |
| Domain service code | `apps/server/src/services/` |
| React feature code | `apps/ui/src/features/` |
| Shared Zod schema | `packages/contracts/src/` |
| HTTP API contract | `architecture/api/[domain].contract.md` + `packages/contracts/` |
| Money calculation logic | `packages/domain/src/money/` |
| Prisma migration | `prisma/migrations/` |
| QA report | `tests/reports/` |
| Review checklist result | Task file or PR description |

---

## 6. Monorepo Conventions

- **Package manager:** pnpm (confirmed — pnpm-workspace.yaml at repo root)
- **Workspaces:** `apps/*`, `packages/*`
- **Build order:** `contracts` → `domain` → `ui-kit` → `apps/server` + `apps/ui`
- **Single Prisma schema** at repo root — not per-package
- **Single version** for the local application in v1.0 — no independent package publishing

---

## 7. Git Branch Structure (When Repository Active)

```
main              # Production-ready, tagged releases
develop           # Integration branch (optional)
feature/*         # Feature tasks
fix/*             # Bug fixes
docs/*            # Documentation-only changes
```

---

## 8. Creation Sequence

When implementation begins (PRD Phase 0), create in this order:

| Step | Action |
|---|---|
| 1 | Initialize git repository and root `package.json` |
| 2 | Create `packages/contracts/` scaffold |
| 3 | Create `packages/domain/` scaffold |
| 4 | Create `apps/server/` (Node.js + Hono) scaffold |
| 5 | Create `apps/ui/` (Vite + React) scaffold |
| 6 | Create `prisma/schema.prisma` from PRD §13.3 |
| 7 | Create `architecture/overview.md` and ADR-001 through ADR-007 |
| 8 | Create `design-system/tokens/` from PRD §14 |
| 9 | Populate `specs/modules/MOD-FOUNDATION-app-shell.md` |
| 10 | Create Phase 0 tasks in `tasks/active/` |

**Do not create steps 1–9 until explicitly instructed to begin Phase 0.**

---

## 9. Current Repository State

As of foundation creation:

| Folder | Status |
|---|---|
| `foundation/` | ✅ Created |
| `docs/` | ✅ Exists (PRD, BRS, FS, ETBS) |
| `specs/` | 📋 To be created when first module spec is written |
| `knowledge/` | 📋 To be created per KNOWLEDGE_BASE_STRUCTURE.md |
| `tasks/` | 📋 To be created when first task is written |
| `architecture/` | 📋 To be created at Architecture Review stage |
| `design-system/` | 📋 To be created before UI implementation |
| `database/` | 📋 To be created with first schema work |
| `apps/` | ⛔ Not until Phase 0 |
| `packages/` | ⛔ Not until Phase 0 |
| `prisma/` | ⛔ Not until Phase 0 |
| `scripts/` | ⛔ Not until Phase 0 |
| `tests/` | ⛔ Not until Phase 0 |

---

## 10. README.md Template

When the root README is created, it should contain:

1. One-paragraph project description
2. Link to `foundation/PROJECT_CONSTITUTION.md` — **start here**
3. Link to `foundation/AI_AGENT_GUIDE.md` — for AI agents
4. Link to `docs/Genius_Center_PRD_v2.0.md` — product authority
5. Documentation map (foundation / docs / specs / knowledge)
6. Current phase status
7. Explicit note: "No application code until Phase 0"

---

*Structure creates clarity. Clarity creates speed. Speed without structure creates debt.*
