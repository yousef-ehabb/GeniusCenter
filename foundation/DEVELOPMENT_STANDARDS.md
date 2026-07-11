# Genius Center — Development Standards

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Active |
| **Authority** | Subordinate to `PROJECT_CONSTITUTION.md` |
| **Applies When** | Application codebase exists — standards are binding from first line of code |

---

## 1. Purpose

This document defines **how** Genius Center is built. Every agent and developer implements against these standards. Deviations require an ADR.

---

## 2. Folder Structure

Follow `PROJECT_STRUCTURE.md`. Summary of code placement:

| Location | Contains |
|---|---|
| `apps/server/` | Local API server (Hono/Express), route handlers, infrastructure |
| `apps/server/src/routes/` | HTTP route handlers (replaces IPC handlers) |
| `apps/server/src/services/` | Domain services (authoritative business logic) |
| `apps/server/src/infrastructure/` | Prisma client, backup, USB HID, PDF, logger |
| `apps/server/src/security/` | Auth, RBAC, session middleware |
| `apps/ui/src/features/` | Feature modules (UI only) |
| `apps/ui/src/components/` | Shared UI components |
| `packages/contracts/` | Zod schemas, HTTP API types, shared DTOs |
| `packages/domain/` | Pure domain logic (money, dates, rules evaluation) |
| `packages/ui-kit/` | Design system components (when extracted) |
| `prisma/` | Schema, migrations, seed |

**Rule:** Business logic lives in `services/` or `packages/domain/` — never in React components.

---

## 3. Naming Conventions

### 3.1 General

| Element | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `lan-qr-server/` |
| TypeScript files | `kebab-case.ts` / `.tsx` | `student-service.ts` |
| React components | `PascalCase.tsx` | `StudentCard.tsx` |
| Tests | `[name].test.ts` / `[name].e2e.ts` | `invoice-service.test.ts` |
| Constants | `SCREAMING_SNAKE_CASE` | `DEFAULT_GRACE_PERIOD_MINUTES` |
| Enums (Prisma) | `SCREAMING_SNAKE_CASE` values | `AttendanceStatus.PRESENT` |

### 3.2 TypeScript Symbols

| Element | Convention | Example |
|---|---|---|
| Interfaces/Types | `PascalCase` | `StudentDto`, `CreatePaymentInput` |
| Classes | `PascalCase` | `StudentService`, `AuditRepository` |
| Functions/methods | `camelCase` | `markAttendance`, `allocatePayment` |
| React hooks | `use` + `PascalCase` | `useStudents`, `useMarkAttendance` |
| Boolean variables | `is/has/can/should` prefix | `isLocked`, `hasPermission` |
| IPC channels | `domain:action` | `students:create`, `attendance:mark` |

### 3.3 Database (Prisma)

| Element | Convention | Example |
|---|---|---|
| Models | `PascalCase` singular | `Student`, `ClassSession` |
| Fields | `camelCase` | `fullName`, `amountMinor` |
| Relation fields | descriptive camelCase | `enrollments`, `markedBy` |
| Enum types | `PascalCase` | `InvoiceStatus` |
| Enum values | `SCREAMING_SNAKE_CASE` | `PARTIALLY_PAID` |
| Table mapping | default Prisma (PascalCase model → matching table) | — |
| Indexes | `@@index([tenantId, status])` on hot filters | — |

**Avoid:** Model named `Session` — use `ClassSession` (PRD §13.1).

---

## 4. File Naming

- One primary export per service file
- Co-locate test files: `student-service.ts` → `student-service.test.ts`
- Feature folders mirror domain: `features/students/`, `features/attendance/`
- Index barrel files (`index.ts`) allowed for public API surfaces only — avoid deep re-export chains
- IPC handlers: `apps/desktop/electron/ipc/[domain].ipc.ts`

---

## 5. React Conventions

### 5.1 Component Structure

```tsx
// 1. Imports (external → internal → types)
// 2. Types/props interface
// 3. Component function
// 4. Sub-components (if small and private)
// 5. No business logic beyond display formatting
```

### 5.2 Rules

- **Functional components only** — no class components
- **Props interfaces** named `[ComponentName]Props`
- **Data fetching** via TanStack Query hooks — not `useEffect` + fetch
- **Mutations** via TanStack Query `useMutation` calling typed IPC
- **Forms** use controlled inputs with shared Zod schema from `packages/contracts`
- **No direct Prisma or filesystem access** in renderer
- **Permission gates** hide/disable UI — service layer enforces authoritatively

### 5.3 Feature Module Layout

```
features/students/
├── components/       # Feature-specific UI
├── hooks/            # useStudents, useCreateStudent
├── pages/            # Route-level pages
└── index.ts          # Public exports
```

### 5.4 State

| State Type | Tool |
|---|---|
| Server/local DB data | TanStack Query |
| UI ephemeral state | `useState` / `useReducer` |
| Global UI (sidebar, theme) | Minimal context or Zustand (if needed) |
| Auth session indicator | Main process authoritative; renderer reads via IPC |

---

## 6. Local API Server Conventions

### 6.1 Architecture Model

Genius Center is a **local web application**. The UI is a browser-based React app (Vite + React + TypeScript). The backend is a local HTTP API server (Node.js + Hono) running on the same machine. All data flows through typed, Zod-validated HTTP requests — no Electron IPC, no preload, no `contextBridge`.

```
Browser UI (React + Vite)
       ↓ HTTP (localhost:PORT) — Zod-validated
Local API Server (Node.js + Hono)
       ↓
Prisma + SQLite (on user's filesystem)
       ↓
Infrastructure (backup, USB HID, PDF, logger)
```

### 6.2 Route Handler Pattern

Route handlers replace IPC handlers. Every handler follows the same contract:

```typescript
// packages/contracts/students.schema.ts — shared Zod schema
// apps/server/src/routes/students.routes.ts — Hono route registration
// apps/server/src/services/students/student-service.ts — business logic
// apps/ui/src/features/students/ — calls fetch('/api/students/create', ...)
```

Every route handler:
1. Validates request body/params with Zod (`@contracts` schema)
2. Checks RBAC via auth middleware
3. Delegates to domain service
4. Returns typed JSON result or typed error envelope
5. Never catches and swallows audit-relevant failures

### 6.3 API Contract Rules

- **Resource-based routing:** Organize endpoints by resource (e.g., `/api/auth`, `/api/settings`, `/api/students`, `/api/groups`, `/api/attendance`, `/api/payments`).
- **Avoid action-based URLs** where possible. Use standard HTTP methods against resource paths.
- All API routes are prefixed `/api/`
- Request and response shapes are defined in `packages/contracts/` as Zod schemas
- API response envelope: `{ ok: true, data: T }` or `{ ok: false, error: { type, message, fields? } }`
- Auth is enforced via HTTP-only session cookie (server-side JWT validation in middleware)
- No business logic in route handlers — pass-through to service layer only
- **Absolute Separation:** The UI (`apps/ui`) must NEVER access Prisma, the database, or the filesystem directly. All communication between UI and SQLite must pass through the Hono API.

### 6.4 Infrastructure Services

| Service | Location |
|---|---|
| Backup/Restore | `apps/server/src/infrastructure/backup/` |
| QR Attendance | Handled natively in browser (camera) or USB HID on server |
| USB HID | `apps/server/src/infrastructure/usb-hid/` |
| PDF Generation | `apps/server/src/infrastructure/pdf/` |
| Logger | `apps/server/src/infrastructure/logger/` |

---

## 7. TypeScript Conventions

- **Strict mode:** `"strict": true` — no exceptions
- **No `any`:** Use `unknown` + type guards at boundaries
- **No `@ts-ignore`:** Fix the type or add ADR
- **Explicit return types** on all service public methods
- **Discriminated unions** for result types: `{ ok: true, data } | { ok: false, error }`
- **Path aliases** configured in tsconfig — use `@contracts/`, `@domain/`, `@renderer/`
- **Barrel exports** sparingly — prefer direct imports for tree-shaking clarity

---

## 8. Prisma Conventions

### 8.1 Schema Rules

- UUID primary keys: `@id @default(uuid())`
- Every business table: `tenantId`, `createdAt`, `updatedAt`, `deletedAt?`
- Money: `Int` fields named `*Minor` (e.g., `amountMinor`, `totalMinor`)
- Currency: `currencyCode` at tenant level — not duplicated per row unless multi-currency future requires
- Foreign keys indexed
- Composite indexes on `(tenantId, status)`, `(tenantId, groupId, startsAt)` etc.

### 8.2 Migration Rules

- One logical change per migration when possible
- Migration name: `YYYYMMDDHHMMSS_descriptive_name`
- Never edit applied migrations — create new migration to fix
- Seed data in `prisma/seed.ts` for dev defaults only

### 8.3 Repository Pattern

```typescript
// All writes go through repositories
// Repositories wrap Prisma and emit audit events
// Services call repositories — never call Prisma directly from services (except via repo)
```

- `find*` methods: respect soft delete (`deletedAt IS NULL`) by default
- `delete*` methods: soft delete unless entity has zero history (BRS UI-001 archive vs delete)
- Financial entities: status transitions, not delete

---

## 9. Validation Standards

- **Single source of truth:** Zod schemas in `packages/contracts/`
- Same schema validates IPC input (main) and form input (renderer)
- Validation errors return structured field errors with Arabic messages (i18n key → Arabic string)
- Server-side validation is authoritative — client validation is UX convenience only
- Validate at IPC boundary before any service call

### Common Validators

| Field | Rule |
|---|---|
| Phone (Egypt) | Configurable regex; default supports 01X mobile format |
| Money input | Positive integer minor units; reject floats |
| Dates | ISO 8601 in storage; localized display only |
| UUIDs | `z.string().uuid()` |
| Required Arabic text | Min length 1 after trim; no Latin-only names for person fields |

---

## 10. Logging Standards

- **Structured JSON logs** in main process
- Log location: user app-data directory (per PRD §18)
- **Log levels:** `error`, `warn`, `info`, `debug`
- **Always log:** startup, backup, restore, auth failures, IPC errors, integrity check results
- **Never log:** passwords, PINs, password hashes, full payment card data (N/A in v1), PII in debug unless explicitly enabled diagnostics mode
- **Correlation:** include `tenantId`, `userId`, `requestId` where applicable
- Renderer errors: capture via error boundary → report to main via IPC

---

## 11. Error Handling

### 11.1 Error Hierarchy (PRD §11.3)

| Type | When | User Message |
|---|---|---|
| `ValidationError` | Invalid input | Arabic field-level message |
| `PermissionError` | RBAC denial | Arabic "insufficient permissions" |
| `DomainError` | Business rule violation | Arabic rule-specific message |
| `InfraError` | DB, filesystem, hardware failure | Arabic safe message + technical log |

### 11.2 Rules

- Never expose stack traces to users
- Financial errors must be explicit — never silent partial success
- Transaction failures roll back completely
- IPC returns typed error envelope — not thrown exceptions across boundary
- UI shows toast/banner for errors; inline for form validation

---

## 12. Transaction Handling

- **All multi-step writes** wrapped in Prisma `$transaction`
- Attendance mark + audit log: same transaction
- Payment + allocation + invoice status update: same transaction
- Backup: checkpoint WAL before copy (PRD §11.5)
- Retry: idempotency via `clientOpId` for payments and attendance (PRD §22)
- Never hold transactions open across IPC await boundaries unnecessarily

---

## 13. Money Handling

**Constitution Article II.9–II.11 — non-negotiable.**

| Rule | Standard |
|---|---|
| Storage | Integer minor units (`amountMinor: Int`) |
| Currency | `currencyCode` from tenant (default `EGP`) |
| Display | Format via `MoneyLabel` / `Intl` with tabular nums |
| Input | `MoneyInput` component — accepts pounds, stores piastres |
| Calculation | Use `packages/domain/money` helpers — no raw arithmetic in services |
| Floats | **Forbidden** in financial path |
| Rounding | Single documented rule in domain layer (BRS §8.19) |
| Refunds | Negative amount or dedicated refund type — linked to original payment |

---

## 14. Date Handling

| Rule | Standard |
|---|---|
| Storage | UTC in database (`DateTime` ISO 8601) |
| Display | Tenant timezone (`Africa/Cairo` default) via `Intl` |
| Labels | `DateLabel` component — Gregorian default, Hijri toggle per PRD §14.3 |
| Comparisons | Always in UTC or explicit timezone — never ambiguous local strings |
| Scheduling | `ClassSession.startsAt` / `endsAt` as DateTime; `GroupSchedule` times as `"HH:mm"` strings |
| Billing periods | Explicit `periodStart` / `periodEnd` on invoices |

---

## 15. Localization (i18n)

- Library: project-standard i18n (determined at Phase 0 ADR)
- **All UI strings** via i18n keys: `students.form.fullName.label`
- Arabic bundle: `apps/desktop/renderer/src/i18n/ar.json` (or equivalent)
- Error messages: keyed — `errors.validation.required`
- No string concatenation for sentences — use interpolation: `t('invoice.overdue', { days })`
- Pluralization rules supported even for Arabic-only v1 (future-proof)
- Notification templates: stored in DB with variable placeholders `{StudentName}`

---

## 16. RTL Standards

- `dir="rtl"` on root layout
- **Logical properties only:** `ms-*`, `me-*`, `ps-*`, `pe-*`, `start`, `end`
- Sidebar: anchored to **right** (native RTL, not mirrored LTR)
- Icons: mirror directional icons (chevrons, arrows)
- Tables: text right-aligned, numbers left-aligned
- Toasts: top-start (RTL convention)
- Test every screen in RTL before marking done
- Third-party libs: whitelist RTL-safe; wrap others

---

## 17. Accessibility

- WCAG AA contrast minimum (PRD §14.6)
- All interactive elements keyboard reachable
- Focus ring visible (`--focus-ring` token)
- `aria-*` labels on icon-only buttons
- Form fields: associated labels, error announced
- Modals: focus trap, Escape to close
- Data tables: proper `th` scope, row headers where applicable
- Skip link to main content (when shell exists)

---

## 18. Comments

- **Prefer self-documenting code** over comments
- Comment **why**, not what
- Required comments:
  - BRS rule ID when implementing non-obvious business logic: `// BRS: BIL-004 — locked invoice immutability`
  - Workarounds with ticket/ADR reference
  - Public service method JSDoc: params, returns, throws
- Forbidden: commented-out code in merged branches, changelog comments in files

---

## 19. Code Organization

### Service Layer

```typescript
// student-service.ts
export class StudentService {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async create(input: CreateStudentInput, ctx: RequestContext): Promise<Student> {
    // 1. Permission check
    // 2. Validate business rules (BRS refs)
    // 3. Transaction
    // 4. Return
  }
}
```

### Dependency Direction

```
Browser UI (React) → HTTP fetch → route handlers → services → repositories → Prisma
                                                       ↓
                                                  packages/domain (pure functions)
                                                       ↓
                                                  packages/contracts (types/schemas)
```

**Forbidden dependencies:**
- `packages/domain` → Node HTTP frameworks, Prisma, React
- `packages/contracts` → anything except Zod
- Browser UI → Prisma directly
- services → React
- route handlers → Prisma directly (use repositories)

---

## 20. Dependency Rules

- **Minimize dependencies** — justify each in ADR if non-obvious
- Prefer built-in Node.js APIs where sufficient
- Pin versions in lockfile
- No dependency may break RTL or offline-first
- Security audit before adding auth/crypto/network libs
- Radix/Headless UI for accessible primitives (PRD §12)

---

## 21. Testing Standards

| Layer | Tool | Required For |
|---|---|---|
| Unit | Vitest | Domain logic, money, dates, rule evaluation |
| Integration | Vitest + temp SQLite | Repositories, transactions, audit emission |
| E2E | Playwright (browser) | Critical flows: attendance, payment, backup |
| RTL visual | Manual + future regression | Every UI feature |

- Test file naming: `[module].test.ts`
- Financial tests: cover edge cases from ETBS (partial payment, refund, proration)
- Attendance tests: all four methods converge on same write path
- Permission tests: verify service-layer denial, not just UI hiding

---

## 22. Git Conventions (When Repository Active)

- Branch: `feature/[module]-[short-description]`, `fix/[issue]-[description]`
- Commits: imperative mood, reference task/rule IDs when applicable
  - `feat(students): add enrollment proration per BIL-003`
- No force push to main
- PR required for merge; review checklist attached

---

*Standards exist to make the right thing the easy thing. Follow them.*
