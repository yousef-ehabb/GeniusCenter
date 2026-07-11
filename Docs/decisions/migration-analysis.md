# Migration Analysis — Electron → Offline-First Local Web Application

| | |
|---|---|
| **Document Type** | Migration Analysis |
| **Date** | 2026-07-09 |
| **ADR Reference** | [ADR-ARCH-001](./ADR-ARCH-001_LocalWebApp_Architecture.md) |
| **Status** | Accepted — documentation phase complete |

---

## Summary

This document provides a component-by-component analysis of what changes, what stays, and what is removed when migrating Genius Center from an Electron desktop application to an Offline-First Local Web Application.

The architectural pivot affects only the **runtime and transport layer**. All business requirements, rules, database schema, domain logic, and UI components are unchanged.

---

## 1. Completely Unchanged (Zero Effort)

These components require no modification. They work identically in both architectures.

### Business and Product Documents

| Document | Status |
|---|---|
| `Docs/Genius_Center_PRD_v2.0.md` §1–10, §13–17 | ✅ Unchanged (business requirements) |
| `Docs/Genius_Center_BRS_v1_0.md` | ✅ Unchanged (all business rules) |
| `Docs/Genius_Center_FS_v1_0.md` | ✅ Unchanged (all screen and workflow specs) |
| `Docs/Genius_Center_ETBS_v1_0.md` | ✅ Unchanged (all real-world scenarios) |
| `Docs/Domain_Model.md` | ✅ Unchanged (domain entities and relationships) |

### Database Layer

| Asset | Status | Notes |
|---|---|---|
| `prisma/schema.prisma` | ✅ Unchanged | Provider: `sqlite`; schema identical |
| `prisma/migrations/` | ✅ Unchanged | All migrations valid and applied |
| `prisma/seed.ts` | ✅ Unchanged | Dev seed logic has no transport dependency |

### Shared Packages

| Package | Status | Notes |
|---|---|---|
| `packages/contracts/` | ✅ Unchanged (concept) | Zod schemas are reused as HTTP request/response types instead of IPC channel types. The schemas themselves do not change — only how they are referenced changes. |
| `packages/domain/` | ✅ Unchanged | Pure TypeScript/Node.js — no Electron, no React dependency. Money helpers, date helpers, rule evaluators are identical. |
| `packages/ui-kit/` | ✅ Unchanged | React components — no Electron dependency. |

### UI Feature Code

All React feature code in `apps/desktop/renderer/src/features/` is **fully reusable**. React components, hooks, TanStack Query hooks, and form logic have no Electron dependency. The only change is replacing `window.api.students.create(input)` calls with `fetch('/api/students', { method: 'POST', body: JSON.stringify(input) })` calls — a mechanical one-line change per call site.

---

## 2. Changed (Effort Required)

### 2.1 Transport Layer — IPC → HTTP

**What changes:** Electron IPC (`ipcMain`, `ipcRenderer`, `contextBridge`) is replaced by an HTTP API layer (Hono route handlers + `fetch` in the browser).

| Before (Electron IPC) | After (Local HTTP API) |
|---|---|
| `apps/desktop/electron/ipc/[domain].ipc.ts` | `apps/server/src/routes/[domain].routes.ts` |
| `ipcMain.handle('students:create', handler)` | `app.post('/api/students', zValidator('json', schema), handler)` |
| `window.api.students.create(input)` in renderer | `fetch('/api/students', { method: 'POST', ... })` in browser |
| `contextBridge.exposeInMainWorld('api', {...})` | ❌ Removed entirely |
| `preload.ts` | ❌ Removed entirely |

**Effort assessment:** Mechanical translation. The business logic inside each IPC handler does not change — only the handler registration syntax changes. Estimated effort: **1 hour per domain module** for a developer familiar with Hono.

**Domain modules to migrate:**

| Module | IPC handlers → HTTP routes |
|---|---|
| Students | `students:create/update/list/get/archive` → `POST/PATCH/GET /api/students` |
| Attendance | `attendance:mark/list/session-summary` → `POST/GET /api/attendance` |
| Payments | `payments:record/list/allocate` → `POST/GET /api/payments` |
| Finance | `invoices:create/list`, `expenses:create/list` → routes |
| Staff | `users:create/update/list` → routes |
| Reports | `reports:generate/export` → routes |
| Settings | `settings:get/update` → routes |
| Backup | `backup:create/restore/list` → routes |
| Auth | `auth:login/logout/pin/lock` → routes (with session cookie) |

### 2.2 Auth / Session Model

**What changes:** In Electron, session state lived in the main process in-memory (no HTTP transport). In the local web app, session state is managed via an HTTP-only signed cookie (JWT or opaque token).

**What stays the same:** All authentication business rules, PIN logic, auto-lock behavior, and RBAC enforcement are identical.

**Effort assessment:** Low. The session middleware wraps all authenticated routes in Hono. The `AuthService` and `RbacService` logic is unchanged.

### 2.3 UI API Client

**What changes:** The renderer called `window.api.students.create(input)` (synchronous Electron IPC). The browser UI will call a typed API client function `api.students.create(input)` which makes an HTTP `fetch` call.

**Pattern:** Create `apps/ui/src/lib/api-client.ts` — a typed wrapper around `fetch` that mirrors the old `window.api` surface. This means TanStack Query hooks in feature modules change by exactly **one line** (the query function body), not the hook interface or component props.

**Effort assessment:** Low-medium. Creating the API client takes ~1 day. Updating call sites in features is mechanical.

---

## 3. Removed (No Equivalent Needed)

| Component | Reason |
|---|---|
| `apps/desktop/electron/main.ts` | Electron main process entry point — replaced by `apps/server/src/index.ts` (Hono server) |
| `apps/desktop/electron/preload.ts` | `contextBridge` exposure — not applicable to HTTP transport |
| `apps/desktop/electron-builder.config.ts` | Electron packaging — replaced by Node.js executable packaging in Phase 7 |
| Electron LAN QR server (separate HTTPS server in main process) | Functionality preserved in Phase 2 via `BarcodeDetector` API in the browser + phone posts to local server IP |
| `scripts/build-installer.ts` | NSIS installer — replaced by `scripts/start.ts` launcher |
| `scripts/dev-lan-cert.ts` | LAN certificate generation — not needed; phone accesses server directly via local IP over HTTP |

---

## 4. New Components Required

| Component | Purpose | Effort |
|---|---|---|
| `apps/server/src/index.ts` | Hono server entry point, middleware registration, startup | Low |
| `apps/server/src/routes/` | Route handlers for all domain modules (translated from IPC handlers) | Medium |
| `apps/server/src/security/session.middleware.ts` | HTTP-only session cookie auth middleware | Low |
| `apps/ui/src/lib/api-client.ts` | Typed `fetch` wrapper mirroring old `window.api` surface | Low |
| `scripts/start.ts` | Launcher: starts server, opens browser in app mode | Low |
| Phase 7 packaging | Self-contained Node.js executable distribution for Windows | Medium |

---

## 5. Effort Estimate

| Category | Effort |
|---|---|
| **Documentation update** (this session) | ✅ Complete |
| **Project structure cleanup** (removing `apps/desktop`) | 1 hour |
| **Server scaffold** (Hono, middleware, CORS, session) | 1 day |
| **Route handler translation** (9 domain modules × ~1 hour) | ~2 days |
| **API client** (`apps/ui/src/lib/api-client.ts`) | ~4 hours |
| **UI call-site updates** (`window.api.*` → `fetch`) | ~1 day |
| **Auth/session middleware** | ~4 hours |
| **Phase 0 scaffold validation** | ~4 hours |
| **Total** | **~1 week** (replaces Phase 0 foundation work) |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Packaging complexity for non-technical users | Medium | High | Document packaging approach clearly in Phase 7. Use `pkg` or a bundled Node.js runtime. |
| Session security without Electron isolation | Low | Medium | Use HTTP-only cookies, restrict CORS to `localhost`, add CSRF token. Standard, well-understood patterns. |
| USB HID on Node.js | Low | High | `node-hid` works identically in a Node.js server process as in Electron's main process. |
| PDF generation | Low | Medium | `pdfkit` or `puppeteer` work in plain Node.js. |
| Phone QR attendance over local network | Low | Medium | Phone POSTs to server's LAN IP. Server must bind to `0.0.0.0`, not `127.0.0.1`. Document this configuration. |

---

## 7. What Does NOT Change (Summary)

For clarity: the following items are **100% unchanged** by this architectural pivot.

- All business rules (BRS, FS, ETBS)
- All database schema (Prisma, SQLite)
- All domain logic (money, dates, rule evaluators)
- All UI components and feature modules (React, Tailwind, Radix UI)
- All financial integrity requirements (audit log, soft delete, immutable history)
- All RTL and Arabic-first requirements
- All performance targets
- All security principles (auth, RBAC, audit)
- All offline-first guarantees

The product the tutor sees and uses is **identical**. Only the plumbing changed.
