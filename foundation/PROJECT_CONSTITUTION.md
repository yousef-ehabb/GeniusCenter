# Genius Center — Project Constitution

| | |
|---|---|
| **Authority Level** | **Highest** — supersedes all other project guidance except explicit stakeholder decisions recorded in `docs/` |
| **Version** | 1.1 — Architecture pivot to Offline-First Local Web Application (ADR-ARCH-001) |
| **Status** | Active |
| **Applies To** | Every AI agent, developer, reviewer, and contributor |
| **Companion Documents** | `AI_AGENT_GUIDE.md`, `DEVELOPMENT_WORKFLOW.md`, `DEVELOPMENT_STANDARDS.md` |

---

## Preamble

Genius Center is a production-grade ERP for private tutors and tutoring centers in Egypt. This Constitution defines the **non-negotiable principles** that govern every decision — architectural, functional, visual, and operational.

When any document, task, pull request, or agent output conflicts with this Constitution, **this document wins** unless a stakeholder explicitly records an approved exception in `knowledge/architecture-decisions/`.

No feature, refactor, or shortcut is exempt from these principles.

---

## Article I — Product Identity

Genius Center is:

- An **offline-first local web application** — a modern browser-based UI served by a local Node.js API server on the user's own machine
- **Arabic-first** and **RTL-native** — not translated, not mirrored as an afterthought
- A **business operations system** for real tutoring businesses in Egypt — not a generic CRUD app, not an LMS, not a payment gateway
- Built for **individual tutors today** and **multi-branch centers tomorrow** — without rewriting the foundation
- **Data-sovereign by default** — all customer data lives on the customer's own machine; cloud features are optional extensions, never v1.0 requirements

---

## Article II — Non-Negotiable Principles

Each principle below is mandatory. Violating any principle is grounds for rejection at review, regardless of how elegant or fast the implementation appears.

---

### 1. Offline First

**What it means:** Every core workflow — student management, attendance, payments, reports, backup — must function with **zero network connectivity**. The local SQLite database is the system of record. Network features (LAN QR scanning, future cloud sync) are enhancements, never dependencies.

**Why it exists:** Tutoring centers across Egypt, especially outside major cities, operate with unreliable internet. Attendance at the door cannot wait for a connection. A tutor who loses connectivity mid-session must not lose the ability to run their business.

**Implications:**
- No core feature may require an API call to function
- Data writes go to local storage first, always
- Sync (when it exists) is additive, not foundational
- Offline state must be visible and honest in the UI — never silently fail

---

### 2. Arabic First

**What it means:** Arabic is the **primary and only shipping language in v1.0**. All user-facing strings, error messages, validation text, report labels, and notification templates are authored in Arabic first. English is not a fallback in the UI.

**Why it exists:** Genius Center serves Egyptian tutors who think, teach, and communicate in Arabic. Software that reads like a translation feels untrustworthy and unprofessional. Arabic-first means Arabic shapes the UX — label length, form layout, and tone — not the other way around.

**Implications:**
- All strings go through i18n keys (see `DEVELOPMENT_STANDARDS.md`) even when only Arabic ships
- Copy is written for Egyptian tutoring context, not generic MSA bureaucracy
- Date, number, and currency formatting respect local conventions

---

### 3. RTL Native

**What it means:** Right-to-left layout is the **default and native** reading direction. Sidebars anchor to the right. Logical CSS properties are mandatory. Directional icons are mirrored. RTL is designed in, not patched on.

**Why it exists:** LTR-first development with RTL bolted on produces broken layouts, reversed tab order, and misaligned tables — especially in data-dense ERP interfaces. Our users read right-to-left; our software must too.

**Implications:**
- Use `margin-inline-*`, `padding-inline-*`, `inset-inline-*` — never hardcoded `left`/`right`
- Test every screen in RTL before marking it done
- Third-party components must be RTL-safe or wrapped in adapters
- Numeric columns align left; text columns align right (RTL convention)

---

### 4. Local Web Application First

**What it means:** v1.0 is a **local web application** running entirely on the user's own Windows 10/11 machine. The user starts a local Node.js server and opens the app in their browser at `localhost`. There is no Electron shell. There is no mandatory cloud. The UI is a standard browser-based React application; the backend is a local HTTP API server (Node.js + Hono/Express) backed by SQLite via Prisma.

**Why this replaces Electron:** Removing the Electron shell eliminates a significant maintenance surface (Electron versioning, packaging, preload security model, IPC boilerplate, installer pipelines) while preserving everything the product actually needs — offline capability, local SQLite database, filesystem access for backups, and Windows-native hardware integrations (USB HID scanners, printers) — all of which are accessible from a Node.js process without Electron's overhead.

**What this changes:**
- The transport layer between UI and business logic changes from Electron IPC (`ipcMain`/`ipcRenderer`) to a typed local HTTP API (REST with Zod-validated request/response)
- The app is packaged as a self-contained Node.js executable (e.g., via `pkg` or `electron`-free bundler) rather than an Electron installer
- The user experience is identical: the tutor opens the app on their PC; the UI opens in a browser window automatically

**What this does NOT change:**
- SQLite remains the database — data stays on the user's machine
- All offline-first guarantees remain (Principle §1)
- All Arabic/RTL requirements remain (Principles §2–§3)
- All business rules, domain logic, and audit requirements remain unchanged
- Performance targets in `Docs/Genius_Center_PRD_v2.0.md` §3.2 and §18 apply to mid-range Windows laptops

**Implications:**
- IPC layer (`ipcMain`, `preload.ts`, `contextBridge`) is replaced by local HTTP route handlers
- Printer and USB HID integrations are implemented in the local Node.js server process (not an Electron main process)
- Backup/restore operates on local filesystem via the server process
- Cloud features (sync, parent portal, remote access) remain optional and deferred to post-v1.0

---

### 5. Simplicity Before Complexity

**What it means:** Choose the simplest solution that correctly satisfies the requirement. Do not introduce abstractions, patterns, or infrastructure until a **proven need** exists. Prefer one clear code path over three configurable ones.

**Why it exists:** ERP systems die from over-engineering. Premature generalization slows delivery, confuses contributors, and makes business rules harder to trace. A tutor needs reliable attendance recording — not a plugin architecture for attendance strategies nobody asked for.

**Implications:**
- No speculative "future-proofing" beyond what the PRD explicitly requires
- YAGNI applies unless the PRD or BRS documents a future extension point
- Complexity must be justified in writing before implementation begins

---

### 6. Business Rules Before Features

**What it means:** No feature is implemented until its **business rules are defined, reviewed, and traceable**. Features serve rules; rules do not emerge from features.

**Why it exists:** Tutoring businesses vary — billing models, absence policies, proration rules, notification preferences. Code written without explicit rules encodes someone's guess as permanent behavior. That produces software tutors cannot trust.

**Implications:**
- Every module links to BRS rules and ETBS scenarios before coding starts
- Open questions in `docs/Genius_Center_BRS_v1_0.md` §16 must be resolved or explicitly deferred — never silently assumed
- If a rule doesn't exist, the Business Analyst agent creates it before the Backend Engineer writes code

---

### 7. Every Business Rule Must Be Configurable

**What it means:** Any rule that could plausibly differ between two real tutoring businesses must live in **configuration** (tenant settings, group overrides, student overrides) — not hardcoded in application logic.

**Why it exists:** A private tutor in Alexandria and a multi-teacher center in Cairo do not share identical policies for lateness, absence charging, or proration. Hardcoded policy forces businesses to adapt to the software.

**Implications:**
- Global defaults with per-group and per-student overrides (per BRS §2.4)
- Configuration changes apply **prospectively** — never retroactively rewrite history
- Default values are documented; changing a default is a stakeholder decision

---

### 8. No Hidden Business Logic

**What it means:** All business logic lives in **explicit, named, testable locations** — domain services, rule engines, configuration-driven evaluators. UI components, IPC handlers, and database triggers must not contain buried policy.

**Why it exists:** Hidden logic in React components or IPC glue code is untestable, unreviewable, and duplicated by the next agent who doesn't know it's there. Financial and attendance rules must be findable by searching the codebase for the BRS rule ID.

**Implications:**
- Map BRS rule IDs to code locations in module specs
- If a calculation affects money or attendance, it has unit tests
- "Magic numbers" and unexplained conditionals are defects

---

### 9. Never Delete Financial Records

**What it means:** Invoices, payments, allocations, expenses, salary payouts, and adjustments are **never hard-deleted**. Corrections happen through voiding, reversing, or linked adjustment records — never by erasing history.

**Why it exists:** Financial records are legal and trust artifacts. Parents dispute charges. Tutors reconcile monthly. Tax reporting depends on continuity. A deleted payment is an unanswerable question.

**Implications:**
- Soft delete (`deletedAt`) for operational records; financial records use status transitions (Void, Reversed)
- Receipt/invoice numbering never reuses voided numbers
- Refunds link to original payments — they do not replace them

---

### 10. Preserve Historical Data

**What it means:** When a student transfers groups, a price changes, or a teacher is reassigned, the system preserves **what was true at the time**. Historical attendance, invoices, and enrollments remain queryable and unchanged.

**Why it exists:** Tutors need to answer "what did this student owe in March?" and "who taught this group in Term 1?" Retroactive mutation destroys reporting integrity and billing audit trails.

**Implications:**
- Enrollment records are time-bounded; transfers create new records, not overwrites
- Price overrides apply from an effective date forward
- Archived entities remain in reports and audit logs

---

### 11. Every Financial Operation Must Be Auditable

**What it means:** Every create, update, void, refund, allocation, and adjustment on financial data produces an **audit log entry** with actor, timestamp, entity, and before/after state. Audit logging is structural — not optional per feature.

**Why it exists:** Money is the most sensitive domain. When a parent asks "who changed my balance?" the system must answer definitively. Audit is not a nice-to-have; it is the trust layer.

**Implications:**
- All writes go through repositories that emit audit events (per PRD §11.3)
- Approvals (refunds above threshold, discounts above threshold) log the approver
- Audit logs are read-only and never deleted

---

### 12. Every Feature Must Be Traceable

**What it means:** Every implemented feature traces backward through: **Task → Module Spec → FS Screen/Workflow → BRS Rule → ETBS Scenario → PRD Module**. Forward traceability (rule ID → code → test) is equally required.

**Why it exists:** ERP systems grow for years. Without traceability, no one knows why code exists, whether it's still needed, or what breaks if it changes. Traceability is how agents and humans collaborate without telepathy.

**Implications:**
- Module specs and tasks carry reference IDs
- PR comments and commit messages cite rule/scenario IDs where applicable
- Orphan code — code with no spec or rule reference — is rejected at review

---

### 13. Modular Architecture

**What it means:** The system is organized into **bounded modules** with clear boundaries: students, attendance, payments, finance, staff, reports, etc. Modules communicate through defined service interfaces — not through shared mutable state or cross-module database hacks.

**Why it exists:** Genius Center is large. Modularity allows parallel agent work, isolated testing, and future scaling to multi-branch without spaghetti dependencies.

**Implications:**
- Follow the folder structure in `PROJECT_STRUCTURE.md`
- Cross-module calls go through the local API server's service layer
- Shared types live in `packages/contracts`; shared domain logic in `packages/domain`

---

### 14. Consistency Over Cleverness

**What it means:** Follow established patterns even if an alternative is theoretically better. Match naming, file layout, error handling, and UI patterns already in the codebase. Introduce new patterns only through an Architecture Decision Record.

**Why it exists:** Genius Center will be touched by many agents and developers. Clever one-offs become inconsistent UX and unpredictable bugs. Predictability beats brilliance.

**Implications:**
- Read existing modules before implementing new ones
- Reuse components from the design system — do not reinvent
- Deviations require an ADR in `knowledge/architecture-decisions/`

---

### 15. User Experience Over Technical Elegance

**What it means:** When UX requirements conflict with technical preferences, **UX wins** unless security, data integrity, or audit requirements override. Daily tasks (attendance, payment recording) must complete in ≤ 3 clicks from the dashboard (PRD §3.2).

**Why it exists:** Tutors are not engineers. They measure software by whether it saves time at the door and at the desk. An elegant abstraction that adds clicks is a failure.

**Implications:**
- Optimize for the tutor's daily workflow, not code aesthetics
- Keyboard shortcuts for high-frequency actions
- Empty, loading, and error states are required — not optional polish

---

### 16. Official Typography Standard

**What it means:** The entire application must use the bundled local font **ABC Diatype Arabic**. The operating system fonts must never affect the UI.

**Why it exists:** Typography is a core part of the Genius brand identity. The application must render identically on every Windows machine, regardless of installed system fonts.

**Implications:**
- The font must always be loaded from the local bundled assets (`assets/fonts/`).
- Do NOT rely on Windows installed fonts.
- Do NOT use Google Fonts or any external font provider.
- Tabular numbers must be enabled wherever numbers are displayed (Invoices, Payments, Codes, Dates, etc.).

---

## Article III — Hierarchy of Authority

When documents conflict, resolve in this order:

1. **Stakeholder decision** (explicit, recorded)
2. **This Constitution** (`foundation/PROJECT_CONSTITUTION.md`)
3. **PRD** (`docs/Genius_Center_PRD_v2.0.md`) — product and architecture authority
4. **BRS** (`docs/Genius_Center_BRS_v1_0.md`) — business rules authority
5. **ETBS** (`docs/Genius_Center_ETBS_v1_0.md`) — real-world scenario authority
6. **FS** (`docs/Genius_Center_FS_v1_0.md`) — screen and workflow authority
7. **Module Specs** (`specs/modules/`) — module-level authority
8. **Architecture Decision Records** (`knowledge/architecture-decisions/`)
9. **Development Standards** (`foundation/DEVELOPMENT_STANDARDS.md`)

If a conflict is discovered, **stop and record an Open Question** — do not silently pick a side.

---

## Article IV — Amendment Process

1. Proposed change is documented with rationale and impact analysis
2. Affected documents are listed (PRD, BRS, Constitution, etc.)
3. Stakeholder approval is recorded in `knowledge/architecture-decisions/` or an ADR
4. Constitution version is incremented
5. All active tasks are reviewed for impact

No agent or developer may unilaterally amend this Constitution.

---

## Article V — Enforcement

- **Review stage:** Every implementation passes `REVIEW_CHECKLIST.md`
- **Definition of Done:** `DEFINITION_OF_DONE.md` incorporates constitutional compliance
- **Rejection:** Work that violates any Article II principle is returned without merge — no exceptions for "small" or "temporary" violations

---

*This Constitution is the operating conscience of Genius Center. Read it before every task. Cite it during every review.*
