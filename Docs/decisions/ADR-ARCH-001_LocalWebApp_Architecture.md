# ADR-ARCH-001 — Offline-First Local Web Application Architecture

| | |
|---|---|
| **ADR ID** | ARCH-001 |
| **Status** | Accepted |
| **Date** | 2026-07-09 |
| **Decided By** | Stakeholder (product owner) |
| **Affects** | `foundation/PROJECT_CONSTITUTION.md`, `foundation/DEVELOPMENT_STANDARDS.md`, `foundation/PROJECT_STRUCTURE.md`, `Docs/Genius_Center_PRD_v2.0.md` |
| **Supersedes** | PRD §11 (Process Model), PRD §12 (Technology Stack — Desktop shell row) |

---

## Context

Genius Center was originally designed as a traditional **Electron desktop application** (Electron + Vite + React + TypeScript, with `ipcMain`/`ipcRenderer` as the transport layer between UI and backend). Phase 0 implementation had begun on this basis.

Before Phase 1 implementation started, a deliberate architectural review raised the following concerns:

1. **Electron maintenance burden:** Electron applications carry significant platform-specific complexity — installer pipelines (NSIS/Squirrel), frequent Electron version upgrades, preload security model (contextBridge), IPC boilerplate, and OS-level packaging.
2. **IPC rigidity:** Electron IPC couples the UI tightly to the main process API surface. HTTP is a simpler, better-documented, more testable transport that any developer or agent can reason about.
3. **Portability:** A local HTTP API server can eventually serve multiple frontends (browser tab, future mobile PWA, future LAN multi-device) without rearchitecting the backend.
4. **Ecosystem:** Node.js HTTP frameworks (Hono, Express, Fastify) have vastly more tooling, documentation, middleware, and contributor familiarity than Electron's main-process patterns.

The offline-first and data-sovereignty requirements remain unchanged and are fully satisfiable without Electron.

---

## Decision

Replace the Electron shell with a **local web application** architecture:

- **Frontend:** React + Vite + TypeScript — runs in the user's default browser at `localhost:PORT`
- **Backend:** Node.js + Hono — a local HTTP API server running on the user's machine
- **Transport:** Typed HTTP (REST + JSON with Zod-validated request/response envelopes)
- **Database:** SQLite + Prisma — unchanged; data stays on the user's machine
- **Launcher:** A small script/executable that starts the Node.js server and opens the browser automatically

There is **no Electron shell**. There is **no mandatory cloud**. There is **no network requirement** for any core workflow.

---

## What This Changes

| Component | Before (Electron) | After (Local Web App) |
|---|---|---|
| **Shell** | Electron main process | Node.js process (no browser engine bundled) |
| **UI delivery** | Electron renderer (Chromium bundled) | User's default browser (Chrome/Edge) at `localhost` |
| **Transport** | `ipcMain` / `ipcRenderer` / `contextBridge` | HTTP fetch + Hono route handlers |
| **Auth session** | Main-process in-memory state | HTTP-only signed session cookie |
| **API contract** | Electron IPC channel names (`students:create`) | REST routes (`POST /api/students`) + Zod schemas |
| **Packaging** | NSIS/Squirrel installer via `electron-builder` | Self-contained Node.js executable (pkg or similar) |
| **Hardware (USB HID)** | Electron main process via `node-hid` | Node.js server process via `node-hid` (identical) |
| **PDF/Print** | Electron main process | Node.js server process via `pdfkit`/`puppeteer` |
| **Backup/Restore** | Electron main process filesystem access | Node.js server process filesystem access |
| **E2E Testing** | Playwright + Electron driver | Playwright + browser (standard, simpler) |

---

## What This Does NOT Change

The following are **completely unchanged** by this decision:

- All business requirements (PRD, BRS, FS, ETBS)
- All business rules and their implementations
- SQLite as the database — all data stays on the user's machine
- Prisma as the ORM — schema is identical
- Offline-first guarantee — no core workflow requires internet
- Arabic-first, RTL-native UI requirements
- Domain service layer logic (`packages/domain`, `packages/contracts`)
- Financial data integrity rules (audit logs, soft delete, immutable history)
- All module-level functional requirements
- Performance targets (PRD §3.2, §18)

---

## What is Preserved from the Existing Codebase

| Asset | Status | Action |
|---|---|---|
| `prisma/schema.prisma` | ✅ Preserved | Schema unchanged; provider confirmed as `sqlite` |
| `prisma/migrations/` | ✅ Preserved | All migrations valid |
| `prisma/seed.ts` | ✅ Preserved | Seed logic unchanged |
| `packages/contracts/` | ✅ Preserved | Zod schemas reused as HTTP request/response types instead of IPC types |
| `packages/domain/` | ✅ Preserved | Pure logic — no transport dependency |
| `packages/ui-kit/` | ✅ Preserved | React components — no Electron dependency |
| `apps/desktop/electron/services/` | ✅ Portable | Domain services are Node.js; move to `apps/server/src/services/` |
| `apps/desktop/renderer/src/features/` | ✅ Reusable | React feature code — move to `apps/ui/src/features/`; replace `window.api.*` calls with `fetch('/api/...')` |
| `apps/desktop/electron/ipc/` | ⚠️ Replaced | IPC handlers replaced by Hono route handlers |
| `apps/desktop/electron/main.ts` | ❌ Removed | Electron entry point — not needed |
| `apps/desktop/electron/preload.ts` | ❌ Removed | `contextBridge` — not needed |
| `apps/desktop/electron-builder.config.ts` | ❌ Removed | Electron packaging config — not needed |

---

## Consequences

### Positive

- Simpler transport (HTTP is well-understood by every developer and every AI agent)
- Standard testing (Playwright browser E2E is simpler than Playwright Electron E2E)
- Faster Phase 0 scaffold — no Electron installation or packaging setup
- Smaller production bundle — no bundled Chromium (~150 MB savings)
- Cleaner future path to multi-device access (LAN, optional cloud) without rearchitecting

### Negative / Trade-offs

- **Browser tab aesthetics:** The app runs in a browser tab, not a native window frame. This is mitigated by the launcher auto-opening the browser in app mode (`--app=http://localhost:PORT`) which removes the browser chrome.
- **Packaging complexity:** Distributing a Node.js executable to non-technical Windows users requires a different approach (e.g., `pkg`, `ncc`, or a simple batch file with a bundled Node.js runtime) rather than NSIS. This is addressed in Phase 7.
- **Session security model:** Without Electron's context isolation, session security relies on standard web security practices (HTTP-only cookies, CORS restricted to `localhost`, CSRF tokens). This is well-understood and sufficient for a local-only application.

---

## Migration Effort

See [migration-analysis.md](./migration-analysis.md) for the detailed component-by-component analysis.

**Summary:** ~90% of business logic, domain services, Prisma schema, Zod schemas, and React UI components are fully reusable. The primary rewrite effort is:
1. Replacing IPC handlers with Hono route handlers (mechanical translation)
2. Replacing `window.api.*` calls in the renderer with `fetch('/api/...')` calls (mechanical translation)
3. Replacing Electron packaging with Node.js executable packaging (Phase 7 concern)

---

## Review

This ADR was accepted by the product stakeholder on 2026-07-09 before Phase 1 implementation began. All foundation documents, PRD, and development standards have been updated to reflect this decision.
