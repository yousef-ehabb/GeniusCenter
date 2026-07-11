# Genius Center — Product Requirements Document

| | |
|---|---|
| **Product** | Genius Center |
| **Document Type** | Product Requirements Document (PRD) |
| **Version** | 2.0 (Unified Baseline) |
| **Status** | Approved — Single Source of Truth |
| **Date** | July 5, 2026 |
| **Supersedes** | *Genius* PRD v1.0, *TutorERP* PRD v1.0, *TutorERP* Product Documentation v1.0 |
| **Audience** | Product, Design, Engineering, QA, Stakeholders |
| **Product Language** | Arabic (RTL only) |
| **Documentation Language** | English |

### Revision Note
This document consolidates and supersedes three earlier drafts produced independently under the working names "Genius" and "TutorERP." Where the source drafts conflicted, this version makes an explicit decision and states the reasoning (see §23.1 for a full changelog of reconciled decisions). No prior draft should be treated as authoritative going forward — **this document is canonical.**

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem, Vision & Product Principles](#2-problem-vision--product-principles)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Scope, Constraints & Assumptions](#4-scope-constraints--assumptions)
5. [Risks & Mitigations](#5-risks--mitigations)
6. [User Personas](#6-user-personas)
7. [Feature Inventory](#7-feature-inventory)
8. [Functional Requirements by Module](#8-functional-requirements-by-module)
9. [Information Architecture & Navigation](#9-information-architecture--navigation)
10. [Key User Flows](#10-key-user-flows)
11. [System Architecture](#11-system-architecture)
12. [Technology Stack](#12-technology-stack)
13. [Data Model](#13-data-model)
14. [Design System](#14-design-system)
15. [Component Library](#15-component-library)
16. [Role & Permission Matrix](#16-role--permission-matrix)
17. [Security & Compliance](#17-security--compliance)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [Development Roadmap](#19-development-roadmap)
20. [Project & Folder Structure](#20-project--folder-structure)
21. [Future Cloud Sync API Design](#21-future-cloud-sync-api-design)
22. [Engineering Best Practices](#22-engineering-best-practices)
23. [Appendices](#23-appendices)

---

## 1. Executive Summary

Genius Center is a production-grade, **offline-first desktop ERP** for private tutors, built to fully replace the notebooks, spreadsheets, and paper attendance sheets currently used to run a tutoring business. Version 1.0 targets **individual tutors**; the architecture is deliberately over-built (multi-tenant-shaped schema, modular services, migration-ready database layer) so that the same codebase can later serve **multi-branch tutoring centers** with multiple teachers and staff, without a rewrite.

The product runs natively on **Windows 10/11**, stores all data in a **local SQLite database**, and requires no internet connection for any core workflow. Cloud synchronization, a parent/student portal, and real messaging-provider integrations are explicitly deferred to a post-v1.0 roadmap, but are designed for from day one at the schema and service-interface level.

The product is **Arabic-only and RTL-only** in v1.0, styled as calm, dense, professional business software — closer to Stripe Dashboard or Linear than to a consumer app.

---

## 2. Problem, Vision & Product Principles

### 2.1 Problem
Private tutors currently run their business on a patchwork of tools:
- Paper notebooks for attendance and grades.
- Excel or WhatsApp for schedules and payment tracking.
- Memory (or nothing) for tracking outstanding balances.
- Manual, ad hoc receipts.

This produces lost revenue from forgotten balances, missed follow-ups, unreliable records, no analytics, no audit trail, and a business that cannot scale past one person without collapsing under its own paperwork.

### 2.2 Vision
A single Windows desktop application that unifies students, parents, groups, sessions, attendance, homework, exams, grades, payments, expenses, staff, and reporting — offline by default, Arabic-native (not translated), and polished enough that a tutor could show it to a client without embarrassment.

### 2.3 Product Principles
1. **Offline is the default state, not a fallback.** Every core workflow must work with zero connectivity.
2. **Arabic and RTL are first-class**, designed for, not retrofitted onto an LTR layout.
3. **Data density over decoration.** This is business software; every pixel serves a function.
4. **Every screen has a keyboard path.** Power users should rarely need the mouse.
5. **Everything is auditable.** Soft deletes, audit logs, and backups are non-negotiable, not "nice to have."
6. **Migration-ready from day one.** SQLite today, PostgreSQL/SQL Server tomorrow — without restructuring the schema.
7. **Single-tenant now, multi-tenant-shaped schema always.**

### 2.4 Non-Goals (v1.0)
Explicitly out of scope for the first release:
- **Not a payment gateway.** No online charging, no card processing — manual entry only.
- **Not an LMS.** No video hosting, no course delivery, no content library.
- **Not a marketing/CRM automation platform.**
- **No public parent/student portal.** Parents receive outbound notifications only.
- **No mobile app beyond the QR-scanning companion web view.**
- **No live external messaging providers** (WhatsApp Business API, Twilio, SMTP) — the notification layer is built and testable, but wired to real providers is a v1.1+ activity.
- **Windows-only.** No macOS/Linux build in v1.0.

---

## 3. Goals & Success Metrics

### 3.1 Business Goals
- Give a solo tutor a single tool that replaces at least three of their current tools (notebook, spreadsheet, paper attendance).
- Reduce time spent on administrative tasks, measurably, so the tutor can teach more or work less.
- Establish an architecture that can be sold to tutoring centers (multi-teacher, multi-branch) without a second product.

### 3.2 Measurable Success Metrics

| Metric | Target |
|---|---|
| Record attendance for a 20-student group via QR | < 45 seconds |
| Record a single payment | < 20 seconds |
| Cold application start (mid-range Windows hardware) | < 2.5 seconds |
| Dashboard load with 5,000 students / 200,000 attendance rows | < 800 ms |
| Data loss across 10,000 backup/restore cycles | Zero |
| Support tickets caused by "I can't find X" (via in-app help search) | < 1% of sessions |
| Daily task completion from dashboard (attendance, payment) | ≤ 3 clicks |

These targets replace the vaguer and internally inconsistent goals in the earlier drafts (e.g., an unqualified "instant search" target and a near-term "delivered by July 15" deadline that did not match the actual scope of the product — see §23.1).

---

## 4. Scope, Constraints & Assumptions

### 4.1 Constraints
- Platform: Windows 10/11, 64-bit, only.
- Must run acceptably on an 8 GB RAM laptop.
- Stack: Electron + React + TypeScript + Prisma + SQLite.
- No internet dependency for any core workflow.
- Arabic only, RTL only, Rubik font — no localization framework needed in v1.0, but all strings must still be extracted via i18n keys (see §22) so English/French can be added later without touching component code.
- No online payment gateway integration.

### 4.2 Assumptions
- The tutor owns a Windows PC and a smartphone.
- A local Wi-Fi/LAN network is available at the teaching location for phone-to-desktop QR scanning.
- Any USB QR/barcode scanners used operate in standard HID keyboard-emulation mode (no custom drivers).

### 4.3 In Scope for v1.0
All modules listed in §7 under "Core (v1.0)."

### 4.4 Explicitly Deferred
All modules and capabilities listed in §7 under "Future (Roadmap-Tagged)."

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| SQLite file corruption | Data loss | WAL mode, scheduled + on-exit backups, `PRAGMA integrity_check` run nightly and surfaced on the dashboard. |
| Phone ↔ desktop LAN handshake fails | Attendance blocked | USB scanner and manual/search flows share the identical write path as a fallback — no feature is exclusively dependent on LAN QR. |
| RTL regressions introduced by third-party UI libraries | Broken layout | Whitelist only RTL-safe libraries; wrap all others in RTL adapters; visual regression tests gate every release. |
| Future multi-tenant/multi-branch migration requires schema rewrite | Expensive rework later | `tenantId` present on every table from day one, defaulted to a single seeded tenant; `branchId` nullable and pre-added on hot tables. |
| Currency/locale drift in financial calculations | Incorrect reports, trust loss | All monetary values stored as integer minor units + `currencyCode`; no floats in the financial path anywhere. |
| Underestimating build effort (as happened across earlier drafts, which ranged from "10 days" to "16 months" for the same scope) | Missed expectations | Roadmap in §19 is phase-based with explicit assumptions about team size; no single hard ship date is promised in this document. |

---

## 6. User Personas

### 6.1 Primary — The Individual Tutor
**Profile:** Mid-30s subject tutor (e.g., physics or math), 80–150 active students across 6–10 weekly groups, works from a home studio. Currently uses a notebook for attendance and Excel for money; estimates losing several percent of revenue annually to forgotten balances. Medium tech comfort; prefers keyboard-and-mouse workflows over touch.

**Goals:**
- Centralize student records, grades, and attendance in one place.
- Automate payment tracking and generate receipts without manual math.
- See real income/expense/profit numbers without reconstructing them from memory.
- Spend less time on admin, more time teaching.

**Pain points:**
- Information scattered across notebook, spreadsheet, and phone.
- Manually tracking who owes what is slow and error-prone.
- No way to quickly answer "how did I do this month?"

### 6.2 Secondary — The Assistant / Door Attendant (Future rollout, designed for now)
**Profile:** Part-time helper who checks students in at the door using a phone.

**Goals:** Scan a QR code, see a green confirmation, move to the next student — no admin access needed, no training required.

**Pain points:** Anything that requires more than a phone and a camera is friction at the door.

### 6.3 Secondary — The Secretary / Front-Desk Staff (Future)
**Profile:** Enters payments, prints receipts, calls parents about absences and overdue balances.

**Goals:** A locked-down UI scoped to exactly what she needs — payments, attendance, and student contact info — nothing else.

**Pain points:** Needs up-to-date information without needing to interpret the whole system.

### 6.4 Future — The Center Owner (multi-branch, post-v1.0)
**Profile:** Owns two or more branches, employs a dozen teachers, serves hundreds of students.

**Goals:** Branch-level P&L, teacher payroll, delegated administration, consolidated reporting across branches.

**Pain points:** No current tool bridges "solo tutor software" and "enterprise center software" — this is the reason the schema is multi-tenant-shaped from day one.

---

## 7. Feature Inventory

### 7.1 Core Modules (v1.0)
- Dashboard with KPIs and live activity feed.
- Student management (CRUD, photo, QR code, tags, medical notes, status lifecycle).
- Parent management (many-to-many with students, primary-contact flag).
- Group management (schedule, capacity, pricing model, assigned teacher, room).
- Subject catalog.
- Class session scheduling (recurring + ad hoc).
- Attendance: Manual, Search, QR-Mobile (LAN), QR-USB (HID).
- Homework: assignment, submission tracking, teacher notes.
- Exams: creation, grade entry, ranking, statistics.
- Gradebook per student, per subject, per term.
- Payments: monthly, per-session, course-based, installments, partial payments, credits.
- Invoicing and printable/exportable receipts.
- Financial transactions: income and expense, categorized.
- Cash-flow view.
- Staff accounts with Role-Based Access Control (RBAC).
- Salary management: fixed, per-session, per-hour, commission-based.
- Reporting: Student, Attendance, Payment, Financial, Group, Exam, Homework, Employee — exportable to PDF/Excel/CSV.
- Notification service (internal + templated; external providers stubbed — see §7.2).
- Settings: business profile, currency, working hours, backup schedule.
- Audit log: who did what, when, before/after state.
- Backup & restore (one-click, scheduled).
- Global command palette (`Ctrl+K`) and global search (`Ctrl+F`).
- Session lock: auto-lock after inactivity, PIN unlock.

### 7.2 Future (Roadmap-Tagged, Not in v1.0)
- Multi-branch, multi-teacher, multi-tenant operation (schema is ready; UI is not).
- Bidirectional, conflict-resolving cloud sync.
- Parent/student web portal.
- Live WhatsApp Business API, SMS (Twilio), and Email (SMTP) providers.
- SQLCipher-encrypted database at rest.
- PostgreSQL / SQL Server backend option.
- Mobile app for teachers (beyond the QR-scanning companion view).
- Financial year closing and tax modules.

---

## 8. Functional Requirements by Module

### 8.1 Student Management
- Fields: photo, full name, gender, birthdate, school, grade level, phone, alternate phone, parent link(s), status, enrollment date, medical notes, free-text notes, tags, system-generated QR token.
- A student can have multiple linked parents/guardians via a join relationship, with one flagged as primary contact.
- Auto-generates a unique QR code on creation; printable as a student ID card.
- Status lifecycle: `Active → Paused / Graduated / Dropped → Archived` (soft-deleted, not destroyed).
- Full attendance, payment, grade, and homework history visible on the student profile.

### 8.2 Group & Schedule Management
- Unlimited groups; each has a subject, assigned teacher, optional classroom, capacity, pricing model (Monthly / Per-Session / Course / Custom), and status.
- Recurring weekly schedule entries (weekday + start/end time) per group.
- Students are linked to groups via an Enrollment record with its own start/end date and optional price override — this supports mid-term group changes and historical reporting without losing data.

### 8.3 Attendance
All four entry methods must converge on **one shared write path** so business rules (session-open validation, duplicate-scan suppression, audit logging) are enforced exactly once, regardless of entry method.

| Method | Flow |
|---|---|
| **Manual** | Attendance grid per session; click a status or use keyboard shortcuts `P/A/L/E` with arrow-key navigation. |
| **Search** | Instant search field finds a student; status buttons appear inline. |
| **QR — Mobile (primary)** | Assistant's phone pairs once via a 6-digit code, then opens a local web view; camera scans the student's QR; result posts over the LAN to the desktop app and reflects in real time. |
| **QR — USB (secondary)** | A HID-mode USB scanner emulates keyboard input into a focus-trapped field; the token is validated and routed identically to the mobile path. |

Failure handling:
- Unknown QR code → visible error state ("student not recognized").
- Duplicate scan within a short window → silently ignored with a subtle confirmation, not treated as an error.
- Session closed → blocked, with an option to reopen if the user has permission.

### 8.4 Homework & Exams
- Homework: title, due date, notes, per-student submission status (Assigned/Submitted/Late/Missed/Excused), optional score.
- Exams: title, date, max score, per-student results, automatic ranking and pass-rate statistics.

### 8.5 Payments & Financial Management
- **Nature: a transaction tracker, not a payment gateway.** All entries are manual.
- An **Invoice** represents a monetary obligation (generated from a group's pricing rule, or created manually). Invoices have line items and a running `paidMinor`/`status` (Open / Partial / Paid / Void).
- A **Payment** is money received; it is allocated — potentially split — across one or more invoices via a `PaymentAllocation` record.
- This invoice/payment/allocation separation (rather than storing a single running balance directly on the payment) is a deliberate design choice: it correctly supports partial payments, multi-invoice allocation, overpayment-as-credit, and refunds without ad hoc balance patching. See §13.3 for the schema.
- Refunds are modeled as a negative payment with a required reason, gated by a dedicated `payments.refund` permission.
- Expenses are categorized (Salary, Rent, Utilities, Printing, Marketing, Other) and support optional file attachments (e.g., a scanned receipt).
- Receipts are printable and exportable as PDF, sequentially numbered.

### 8.6 Staff, Roles & Salary
- Roles: Owner, Teacher, Assistant, Secretary, Accountant, plus cloneable Custom roles with permission-by-permission overrides.
- Salary models: Fixed, Per-Session, Per-Hour, Commission (percentage).
- Salary payouts recorded per period with generated payslip PDF.

### 8.7 Reporting
- Report types: Student, Attendance, Payment, Financial, Group, Exam, Homework, Employee, and Dashboard Analytics.
- Export formats: PDF (print-ready), Excel (.xlsx), CSV.
- Filterable by date range, status, payment state, group, subject, teacher, and grade.

### 8.8 Notifications
- Trigger types: automatic (e.g., overdue payment) or manual (broadcast).
- Template-based with variable injection (e.g., `{StudentName}`), previewed before sending.
- Channel-agnostic by design: the calling code never knows whether a message goes out over WhatsApp, SMS, Email, or stays purely internal — see the Adapter Pattern in §11.3.
- Every send is logged with channel, recipient, status, and any error.

### 8.9 Settings, Backup & Audit
- Settings: business profile (name, logo, currency, working hours), notification templates, backup schedule, security (session-lock timeout, PIN).
- Backup: one-click, produces a timestamped local file; scheduled backups supported.
- Restore: requires explicit confirmation with a clear warning, validates database integrity before completing, restarts the application against the restored database.
- Audit log: every create/update/delete on sensitive data records actor, action, entity, timestamp, and before/after state as JSON. This is enforced structurally (a repository-layer decorator — see §11.3), not left to individual features to remember.

---

## 9. Information Architecture & Navigation

```
Genius Center
├── لوحة التحكم (Dashboard)
├── الطلاب (Students)
│   ├── قائمة الطلاب
│   ├── بطاقة الطالب
│   └── بطاقات QR للطباعة
├── أولياء الأمور (Parents)
├── المجموعات (Groups)
│   ├── القائمة
│   ├── الجدول الأسبوعي
│   └── بطاقة المجموعة
├── المواد (Subjects)
├── الحصص (Class Sessions)
│   ├── حصص اليوم
│   ├── التقويم
│   └── جدولة متكررة
├── الحضور (Attendance)
│   ├── تسجيل يدوي
│   ├── بحث
│   └── مسح QR
├── الواجبات (Homework)
├── الامتحانات (Exams) → الدرجات (Grades)
├── المالية (Finance)
│   ├── الفواتير والمدفوعات
│   ├── المصروفات
│   ├── الإيرادات الإضافية
│   ├── التدفق النقدي
│   └── الرواتب
├── الموظفون (Staff)
│   ├── الموظفون
│   ├── الأدوار
│   └── الصلاحيات
├── التقارير (Reports)
├── الإشعارات (Notifications)
│   ├── القوالب
│   └── السجل
├── الإعدادات (Settings)
├── سجل التدقيق (Audit Log)
└── النسخ الاحتياطي (Backup & Restore)
```

**Navigation model:** persistent right-anchored sidebar (RTL-native placement — this is not a mirrored left sidebar, it is the correct sidebar position for a right-to-left reading flow), collapsible, with `Ctrl+1..9` jumping to top-level sections. A top bar carries global search (`Ctrl+F`), the command palette (`Ctrl+K`), a notification bell, and quick-add (`Ctrl+N`). A bottom status bar shows database health, last backup age, and LAN QR server status.

---

## 10. Key User Flows

### 10.1 First-Run Onboarding
Splash → offline license activation → business profile (name, logo, currency, working hours) → owner account creation (password + PIN) → optional Excel student import → Dashboard.

### 10.2 Add Student
Students → "طالب جديد" → form (photo, personal info, parent linking, group assignment, pricing) → save → auto-generated QR → optional immediate card printing.

### 10.3 Record Attendance (QR, Mobile — Primary Path)
Assistant opens the paired local URL on their phone → camera activates → scans student QR → desktop updates instantly with a sound and visual confirmation → ready for the next scan.

### 10.4 Record Attendance (Manual)
Sessions → today's group → attendance grid → click status per student or use `P/A/L/E` keyboard shortcuts → auto-saved.

### 10.5 Record Payment
Student profile → Payments tab → "تسجيل دفعة" → amount, method, date, notes → system auto-suggests allocation to the oldest open/partial invoice (user may override or split) → save → print or share receipt.

### 10.6 Monthly Close
Reports → Financial → select month → review income, expenses, salaries, profit → export PDF/Excel → mark month closed (audit-logged, but never destructively — historical data remains queryable).

### 10.7 Backup & Restore
**Backup:** Settings → Backup → "نسخ احتياطي الآن" → choose folder → timestamped backup file written → confirmation.
**Restore:** Settings → Backup → Restore → select backup file → explicit confirmation dialog with warning → integrity validation → application restarts against the restored database.

---

## 11. System Architecture

### 11.1 Runtime Model

Genius Center is an **Offline-First Local Web Application**. There is no Electron shell. The application runs entirely on the user's own machine:

- **Local API server (Node.js + Hono):** Hosts all authoritative business logic, typed route handlers, Prisma/SQLite access, filesystem operations (backup/restore), hardware integrations (USB HID, PDF/printing), and auth/session management.
- **Browser UI (React + Vite):** Runs in the user's default browser at `localhost:PORT`. Contains zero business logic. All data flows through typed, Zod-validated HTTP requests to the local server.
- **Launcher:** A small native launcher (Node.js script or lightweight executable) starts the local server and opens the browser automatically — identical user experience to a traditional desktop app.

The frontend does not depend on any Electron API and contains no references to `window.api`, `contextBridge`, `ipcRenderer`, or `ipcMain`.

### 11.2 Layered View
```
┌───────────────────────────────────────────┐
│ Browser UI (React + TS + Tailwind + RTL)   │
│  Pages → Features → Components → Hooks    │
└───────────────────────────────────────────┘
              ↓ HTTP/localhost (Zod-validated JSON)
┌───────────────────────────────────────────┐
│ Local API Server (Node.js + Hono)         │
│  Route handlers per domain module          │
│  Auth middleware, RBAC enforcement         │
│  Service layer (students, attendance,      │
│  payments, staff, reports…)               │
│  Cross-cutting: auth, RBAC, audit, i18n    │
└───────────────────────────────────────────┘
              ↓
┌───────────────────────────────────────────┐
│ Data Access (Prisma) — SQLite (WAL mode)  │
│  Repository per aggregate                 │
└───────────────────────────────────────────┘
              ↓
┌───────────────────────────────────────────┐
│ Infrastructure                            │
│  BackupService · UsbHid · PdfService ·    │
│  ExportService · NotificationAdapter       │
└───────────────────────────────────────────┘
```

### 11.3 Cross-Cutting Concerns
- **Auth & session:** local password plus optional PIN; auto-lock after configurable inactivity; session state lives in the server process as an HTTP-only signed cookie — never readable by the browser.
- **RBAC:** permission keys enforced in the service layer *and* used to gate UI elements in the browser — never trust the UI layer alone.
- **Audit:** implemented as a decorator wrapping every write-repository method, capturing actor, before/after JSON diffs. This makes audit logging structural rather than something each feature has to remember to call.
- **Validation:** a single set of Zod schemas shared between browser UI and server — one source of truth for what a valid `Student`, `Payment`, etc. looks like.
- **Notifications:** an Adapter Pattern (`NotificationProvider.send(message)`) with `internal`, `whatsapp`, `sms`, and `email` implementations swappable by configuration, so core business logic never depends on a specific provider.
- **Errors:** a typed error hierarchy (`DomainError`, `ValidationError`, `PermissionError`, `InfraError`) with user-safe Arabic messages. HTTP status codes map to error types.
- **i18n:** a single Arabic locale bundle today; all strings routed through i18n keys so additional languages require no component changes later.

### 11.4 QR / USB Attendance
- **USB HID scanner:** The scanner emulates keyboard input. The server's USB HID listener (or a focused input on the browser page) captures the barcode/QR scan and routes it into `AttendanceService.mark(...)`.
- **Phone camera QR:** The assistant opens the attendance page on their phone browser. The browser's `BarcodeDetector` API (supported in Chrome/Edge) decodes the QR and POSTs the token to `/api/attendance/scan` on the local server. No LAN server setup required — works over the local Wi-Fi network to the local server's IP.
- **Manual entry:** Direct form submission to the same `/api/attendance/mark` endpoint. All three paths write through one `AttendanceService.mark(...)` call.

### 11.5 Data Integrity
- SQLite in WAL mode, `PRAGMA foreign_keys = ON`, checkpointed on every backup.
- Every write wrapped in a transaction.
- Nightly `PRAGMA integrity_check`, surfaced on the dashboard status strip.

---

## 12. Technology Stack

| Layer | Choice | Justification |
|---|---|---|
| **UI framework** | **React + TypeScript** | Component-based architecture suited to a dashboard-heavy ERP; strict typing catches errors before they reach a tutor's live business data. Unchanged from original architecture. |
| **Local API server** | **Node.js + Hono** | Hono is a lightweight, TypeScript-first HTTP framework with middleware support, request/response Zod validation via `@hono/zod-validator`, and fast routing. Replaces Electron's IPC layer with a standard, testable HTTP server. |
| **Database** | **SQLite** | Zero-configuration, fast, supports atomic transactions — appropriate for a local offline system handling financial records. All data stays on the user's machine. Unchanged. |
| **ORM** | **Prisma** | Type-safe schema and queries; the abstraction layer that makes a future PostgreSQL/SQL Server migration a provider swap, not a rewrite. Unchanged. |
| **Styling** | **Tailwind CSS** | Rapid, consistent styling with strong RTL/logical-property support. Unchanged. |
| **UI primitives** | **Radix UI / Headless UI** | Accessible, unstyled primitives. Unchanged. |
| **Charts** | **Recharts** | Lightweight, responsive. Unchanged. |
| **State/data-fetching** | **TanStack Query** | Handles caching and synchronization between the browser UI and the local API server cleanly. Unchanged in concept; now targets HTTP endpoints instead of IPC channels. |
| **Build tool** | **Vite** | Fast dev/build cycle. Unchanged. |
| **Font** | **ABC Diatype Arabic** *(local bundle)* | Bundled with the application — no dependency on OS fonts or external providers. Unchanged. |
| **Validation** | **Zod** | Single schema definition shared across HTTP API boundaries (server and client). Unchanged. |
| **Testing** | **Vitest** (unit + integration) + **Playwright** (E2E in browser) | Unchanged tools; E2E now drives the browser instead of Electron. |
| **Version control** | **Git** | Standard. |

---

## 13. Data Model

### 13.1 Design Principles
- Every table has `id` (UUID), `tenantId` (UUID, defaulted to a single seeded tenant in v1.0), `createdAt`, `updatedAt`, and `deletedAt` (soft delete).
- Money is stored as an **integer in minor units** (e.g., piastres) plus a `currencyCode` at the tenant level — never a float, never a native `Decimal` column (SQLite has no native decimal type, and emulated decimals add complexity without real benefit at this scale).
- UUID primary keys throughout, to prevent ID collisions when data is eventually merged across branches or synced to a cloud store.
- Foreign keys are indexed; composite indexes exist on hot filters such as `(tenantId, status)` and `(tenantId, groupId, startsAt)`.
- A "Session" in the data model refers strictly to a **class occurrence** and is named `ClassSession` specifically to avoid collision with *user/auth session* concepts (login state, session-lock) elsewhere in the product — a naming clash that existed in an earlier draft of this schema.

### 13.2 Entity Relationship Overview
```
Tenant (1) ──< User >── (M) Role ──< Permission
Tenant (1) ──< Student >── (M) StudentParent >── (M) Parent
Student (1) ──< Enrollment >── (M) Group
Group (M) ──> Subject
Group (M) ──> User (teacher)
Group (1) ──< GroupSchedule
Group (1) ──< ClassSession >── (M) Attendance >── (1) Student
Student (1) ──< Invoice >── (M) InvoiceLine
Invoice (1) ──< PaymentAllocation >── (M) Payment
Student (1) ──< Homework >── (1) HomeworkSubmission
Group (1) ──< Exam >── (M) ExamResult >── (1) Student
User (1) ──< SalaryRule
User (1) ──< SalaryPayout
Tenant (1) ──< Expense >── (M) ExpenseCategory
Tenant (1) ──< IncomeExtra >── (M) IncomeCategory
Tenant (1) ──< NotificationTemplate ──< NotificationLog
Tenant (1) ──< AuditLog
Tenant (1) ──< BackupRecord
```

### 13.3 Schema (Prisma-Ready Excerpt)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ── Tenancy & Identity ──────────────────────────────────────────

model Tenant {
  id           String   @id @default(uuid())
  name         String
  currencyCode String   @default("EGP")
  timezone     String   @default("Africa/Cairo")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model User {
  id           String     @id @default(uuid())
  tenantId     String
  fullName     String
  username     String
  passwordHash String
  pinHash      String?
  status       UserStatus @default(ACTIVE)
  roles        UserRole[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  deletedAt    DateTime?
  @@unique([tenantId, username])
}

model Role {
  id       String           @id @default(uuid())
  tenantId String
  key      String           // OWNER, TEACHER, ASSISTANT, SECRETARY, ACCOUNTANT, CUSTOM_*
  name     String
  users    UserRole[]
  perms    RolePermission[]
  @@unique([tenantId, key])
}

model Permission {
  id    String @id @default(uuid())
  key   String @unique   // e.g. students.read, payments.write
  group String
}

model UserRole       { userId String; roleId String; @@id([userId, roleId]) }
model RolePermission { roleId String; permissionId String; @@id([roleId, permissionId]) }

// ── Academic Core ────────────────────────────────────────────────

model Student {
  id             String    @id @default(uuid())
  tenantId       String
  code           String    // human-readable identifier
  fullName       String
  gender         Gender
  birthdate      DateTime?
  school         String?
  grade          String?
  phone          String?
  altPhone       String?
  photoPath      String?
  qrToken        String    @unique
  status         StudentStatus @default(ACTIVE)
  enrollmentDate DateTime  @default(now())
  medicalNotes   String?
  notes          String?
  tags           String?   // comma-separated in v1.0; candidate for normalization later
  parents        StudentParent[]
  enrollments    Enrollment[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?
  @@index([tenantId, status])
  @@index([tenantId, fullName])
}

model Parent {
  id       String @id @default(uuid())
  tenantId String
  fullName String
  phone    String
  altPhone String?
  email    String?
  notes    String?
  links    StudentParent[]
}

model StudentParent {
  studentId String
  parentId  String
  relation  String   // father, mother, guardian
  isPrimary Boolean  @default(false)
  @@id([studentId, parentId])
}

model Subject {
  id       String @id @default(uuid())
  tenantId String
  name     String
  code     String?
}

model Group {
  id           String        @id @default(uuid())
  tenantId     String
  branchId     String?       // nullable; activated when multi-branch ships
  name         String
  subjectId    String
  teacherId    String?
  classroomId  String?
  capacity     Int           @default(0)
  pricingModel PricingModel
  priceMinor   Int           @default(0)
  status       GroupStatus   @default(ACTIVE)
  schedules    GroupSchedule[]
}

model GroupSchedule {
  id       String @id @default(uuid())
  groupId  String
  weekday  Int    // 0–6
  startsAt String // "16:00"
  endsAt   String
}

model Enrollment {
  id         String   @id @default(uuid())
  studentId  String
  groupId    String
  startsAt   DateTime
  endsAt     DateTime?
  priceMinor Int?     // overrides the group's default price
  status     EnrollmentStatus @default(ACTIVE)
  @@unique([studentId, groupId, startsAt])
}

model ClassSession {
  id         String   @id @default(uuid())
  tenantId   String
  groupId    String
  startsAt   DateTime
  endsAt     DateTime
  status     SessionStatus @default(SCHEDULED)
  notes      String?
  attendance Attendance[]
  @@index([tenantId, startsAt])
}

model Attendance {
  id             String   @id @default(uuid())
  classSessionId String
  studentId      String
  status         AttendanceStatus  // PRESENT, ABSENT, LATE, EXCUSED
  markedAt       DateTime @default(now())
  markedBy       String?
  method         AttendanceMethod  // MANUAL, SEARCH, QR_MOBILE, QR_USB
  @@unique([classSessionId, studentId])
}

model Homework {
  id          String @id @default(uuid())
  tenantId    String
  groupId     String
  title       String
  dueDate     DateTime?
  notes       String?
  submissions HomeworkSubmission[]
}

model HomeworkSubmission {
  id         String @id @default(uuid())
  homeworkId String
  studentId  String
  status     SubmissionStatus  // SUBMITTED, LATE, MISSED, EXCUSED
  score      Int?
  notes      String?
  @@unique([homeworkId, studentId])
}

model Exam {
  id       String @id @default(uuid())
  tenantId String
  groupId  String
  title    String
  date     DateTime
  maxScore Int
  results  ExamResult[]
}

model ExamResult {
  id        String @id @default(uuid())
  examId    String
  studentId String
  score     Int
  notes     String?
  @@unique([examId, studentId])
}

// ── Finance ──────────────────────────────────────────────────────
// Invoice → Payment → PaymentAllocation is a deliberate three-table
// design (not a single Payment.balance field) so that partial payments,
// multi-invoice allocation, overpayment-as-credit, and refunds are all
// representable without patching a running balance by hand.

model Invoice {
  id          String   @id @default(uuid())
  tenantId    String
  studentId   String
  number      String
  issuedAt    DateTime @default(now())
  dueAt       DateTime?
  periodStart DateTime?
  periodEnd   DateTime?
  totalMinor  Int
  paidMinor   Int      @default(0)
  status      InvoiceStatus @default(OPEN)  // OPEN, PARTIAL, PAID, VOID
  lines       InvoiceLine[]
  allocations PaymentAllocation[]
  @@unique([tenantId, number])
}

model InvoiceLine {
  id          String @id @default(uuid())
  invoiceId   String
  description String
  quantity    Int    @default(1)
  unitMinor   Int
  totalMinor  Int
}

model Payment {
  id          String   @id @default(uuid())
  tenantId    String
  studentId   String
  amountMinor Int
  method      PaymentMethod  // CASH, TRANSFER, WALLET, OTHER
  paidAt      DateTime @default(now())
  receivedBy  String?
  notes       String?
  allocations PaymentAllocation[]
}

model PaymentAllocation {
  id          String @id @default(uuid())
  paymentId   String
  invoiceId   String
  amountMinor Int
}

model Expense {
  id             String   @id @default(uuid())
  tenantId       String
  categoryId     String
  amountMinor    Int
  spentAt        DateTime @default(now())
  notes          String?
  attachmentPath String?
}

model ExpenseCategory { id String @id @default(uuid()); tenantId String; name String; systemKey String? }
model IncomeExtra     { id String @id @default(uuid()); tenantId String; categoryId String; amountMinor Int; receivedAt DateTime @default(now()); notes String? }
model IncomeCategory  { id String @id @default(uuid()); tenantId String; name String }

model SalaryRule {
  id        String @id @default(uuid())
  userId    String
  model     SalaryModel  // FIXED, PER_SESSION, PER_HOUR, COMMISSION
  baseMinor Int    @default(0)
  rateMinor Int    @default(0)
  percent   Int?
}

model SalaryPayout {
  id          String   @id @default(uuid())
  userId      String
  periodStart DateTime
  periodEnd   DateTime
  amountMinor Int
  paidAt      DateTime @default(now())
  notes       String?
}

// ── Communication, Audit, Ops ───────────────────────────────────

model NotificationTemplate {
  id       String @id @default(uuid())
  tenantId String
  key      String
  channel  NotificationChannel  // WHATSAPP, SMS, EMAIL, INTERNAL
  subject  String?
  body     String
}

model NotificationLog {
  id         String   @id @default(uuid())
  tenantId   String
  templateId String?
  channel    NotificationChannel
  recipient  String
  payload    String
  status     NotificationStatus  // QUEUED, SENT, FAILED
  error      String?
  createdAt  DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  tenantId  String
  actorId   String?
  action    String
  entity    String
  entityId  String?
  before    String?  // JSON snapshot
  after     String?  // JSON snapshot
  createdAt DateTime @default(now())
  @@index([tenantId, entity, createdAt])
}

model BackupRecord {
  id        String   @id @default(uuid())
  tenantId  String
  filePath  String
  sizeBytes Int
  createdAt DateTime @default(now())
  createdBy String?
  kind      BackupKind  // MANUAL, SCHEDULED, PRE_RESTORE
}
```

**Enums:** `Gender`, `UserStatus`, `StudentStatus`, `PricingModel(MONTHLY|PER_SESSION|COURSE|CUSTOM)`, `GroupStatus`, `EnrollmentStatus`, `SessionStatus`, `AttendanceStatus`, `AttendanceMethod`, `SubmissionStatus`, `InvoiceStatus`, `PaymentMethod`, `SalaryModel`, `NotificationChannel`, `NotificationStatus`, `BackupKind`.

### 13.4 Performance & Scale Notes
- Indexes are defined on all frequently queried foreign keys and on `(tenantId, status)`-style composite filters.
- Strong referential integrity (foreign key constraints) is enforced at the database level to prevent orphaned records during backup/restore cycles.
- v1.0 is engineered and tested against a 5,000-student dataset (see §18); the indexing strategy is designed to scale considerably beyond that without schema changes.

---

## 14. Design System

### 14.1 Philosophy
"Quiet software": high information density without clutter, RTL-native (not mirrored-as-an-afterthought), predictable, stable, readable. No decorative elements — every element earns its place. No AI-style gradients, no glassmorphism, no colorful illustrations, no emoji, nothing that reads as a consumer/childish UI.

**Inspirations:** Notion, Linear, Stripe Dashboard, JetBrains IDEs, Microsoft 365.

### 14.2 Color Tokens

```
--bg              #FFFFFF
--surface         #FFFFFF
--surface-muted   #F7F8FA
--surface-hover   #F1F3F6
--border          #E5E7EB
--border-strong   #CBD1D9
--text            #0F172A
--text-muted      #4B5563
--text-subtle     #6B7280
--primary         #1F6FEB
--primary-hover   #175CD3
--primary-fg      #FFFFFF
--success         #128A5B   /* Paid / Present */
--warning         #B45309   /* Overdue / Pending */
--danger          #B42318   /* Absent / Expense */
--info            #0B69A3   /* Notice / Transaction */
--focus-ring      #1F6FEB
--overlay         rgba(15,23,42,0.48)
```
Dark theme is deferred post-v1.0, but tokens are defined on the same scale so it is additive, not a rework.

### 14.3 Typography
- Family: **Rubik** (weights 400/500/600/700). Fallback: `system-ui, Segoe UI, Tahoma`.
- Scale (px/line-height): display 28/36 · h1 22/30 · h2 18/26 · h3 16/24 · body 14/22 · small 13/20 · caption 12/18 · mono 12/18 (`JetBrains Mono` for codes/IDs).
- All numerals in tables and money fields use tabular figures (`font-variant-numeric: tabular-nums`).
- Numbers and dates default to Western digits with Arabic labels; user-toggleable to Arabic-Indic numerals.

### 14.4 Spacing, Radius, Shadow, Motion
- Spacing scale: 2, 4, 8, 12, 16, 20, 24, 32, 40, 56, 72.
- Radius: 4px (inputs), 6px (buttons), 8px (cards), 12px (modals).
- Shadows: `sm 0 1 2 rgba(15,23,42,.06)` · `md 0 4 12 rgba(15,23,42,.08)` · `lg 0 12 32 rgba(15,23,42,.10)`. No neon or decorative glows.
- Motion: durations 120/180/240ms, easing `cubic-bezier(.2,.8,.2,1)`, used only for state transitions, drawers, and toasts — never decoratively.

### 14.5 RTL Rules (Non-Negotiable)
- Logical CSS properties throughout (`margin-inline-*`, `padding-inline-*`, `inset-inline-*`) — never hardcoded `left`/`right`.
- Sidebar anchored to the **right** edge as the native position for RTL, not a mirrored left sidebar.
- Directional icons (arrows, chevrons, "next/previous") are mirrored.
- Toasts appear top-left per RTL convention.
- In data tables: numeric values (currency, counts) align left; text content aligns right.
- Zebra striping is avoided in favor of subtle row borders; hover state shifts row background to `--surface-hover`.

### 14.6 Accessibility
- All text meets WCAG AA contrast (minimum 4.5:1).
- All primary actions reachable via keyboard shortcuts (`Ctrl+S` save, `Esc` close modal, etc. — full list in §9).
- Sidebar collapses and content areas expand fluidly on larger displays without excessive whitespace.

---

## 15. Component Library

- **Buttons:** primary, secondary, ghost, danger, link × sm/md/lg, with loading and icon-only variants.
- **Inputs:** text, number, currency (`MoneyInput`, enforces minor-unit entry), date, time, datetime, phone (Egypt default), select, multi-select, combobox, tag input, textarea, password with reveal, file/photo picker, QR display.
- **Data:** virtualized `DataTable`, `FilterBar`, `SavedViews`, `EmptyState`, `StatCard`/`KpiTile`, `Sparkline`, `Chart` (line/bar/donut), `Timeline`, `ActivityFeed`, `Badge`, `Chip`, `Avatar`, `StatusDot`.
- **Feedback:** `Toast`, `Banner`, `InlineAlert`, `ConfirmDialog`, `DestructiveDialog`, `ProgressBar`, `Spinner`, `Skeleton`.
- **Overlays:** `Dialog`, `Drawer` (RTL-aware), `Popover`, `Tooltip`, `CommandPalette`, `ContextMenu`.
- **Forms:** `Form`, `FormRow`, `FieldGroup`, `FieldError`, `FormFooter`, `AutoSaveIndicator`.
- **Navigation:** `Sidebar`, `SidebarSection`, `TopBar`, `Breadcrumbs`, `Tabs`, `StepIndicator`, `Pagination`.
- **Domain-specific:** `StudentCard`, `StudentPickerModal`, `GroupScheduleGrid`, `AttendanceGrid`, `ReceiptPreview`, `InvoiceLineEditor`, `MoneyLabel`, `DateLabel` (Hijri/Gregorian toggle).

Every component is designed RTL-first, documented with usage examples and props, and built on Radix/Headless UI primitives for accessibility.

---

## 16. Role & Permission Matrix

**Permission key groups (excerpt):** `students.*`, `parents.*`, `groups.*`, `sessions.*`, `attendance.mark`, `attendance.override`, `homework.*`, `exams.*`, `grades.write`, `invoices.*`, `payments.read/write/refund`, `expenses.*`, `salary.read/write`, `staff.*`, `roles.manage`, `reports.view/export`, `notifications.send`, `settings.read/write`, `backup.run/restore`, `audit.read`.

| Permission Group | Owner | Teacher | Assistant | Secretary | Accountant |
|---|:-:|:-:|:-:|:-:|:-:|
| Students — read | ✔ | Assigned groups only | ✔ | ✔ | ✔ |
| Students — write / delete | ✔ / ✔ | — / — | — / — | ✔ / — | — / — |
| Groups & Sessions | ✔ | Read + close own | Read | Read/write schedule | Read |
| Attendance — mark | ✔ | ✔ | ✔ | ✔ | — |
| Attendance — override | ✔ | ✔ | — | ✔ | — |
| Homework / Exams / Grades | ✔ | ✔ (own groups) | — | — | Read only |
| Invoices | ✔ | — | — | ✔ | Read only |
| Payments — write | ✔ | — | — | ✔ | — |
| Payments — refund | ✔ | — | — | — | ✔ |
| Expenses | ✔ | — | — | Write | ✔ |
| Salary | ✔ | Own only | — | — | ✔ |
| Staff & Roles | ✔ | — | — | — | — |
| Reports — view/export | ✔ | Own scope | Limited | ✔ | ✔ |
| Notifications — send | ✔ | Own students | ✔ | ✔ | — |
| Settings — write | ✔ | — | — | — | — |
| Backup — run / restore | ✔ / ✔ | — / — | — / — | ✔ / — | — / — |
| Audit log — read | ✔ | — | — | — | ✔ |

Custom roles may be cloned from any base role with per-permission overrides.

---

## 17. Security & Compliance

- **Authentication:** local password + optional PIN. Passwords hashed with **Argon2id** (or bcrypt as a documented fallback); PIN hashed with a pepper. No credentials ever leave the local machine in v1.0.
- **RBAC:** enforced at both the service layer (authoritative) and the UI layer (defensive — hides actions the user cannot perform).
- **Session security:** automatic session locking after configurable inactivity; PIN-based unlock.
- **Electron hardening:** `contextIsolation: true`, `nodeIntegration: false`, a Content-Security-Policy on the renderer, and signed installers.
- **Audit logging:** every create/update/delete on sensitive data (student, financial, staff records) is captured automatically via the repository decorator — this is structural, not opt-in per feature.
- **Soft deletes:** nothing sensitive is hard-deleted; `deletedAt` supports recovery and audit continuity.
- **Data at rest:** filesystem-level security in v1.0; architecture reserves a path to **SQLCipher** encryption-at-rest as a near-term follow-up, without schema changes.
- **Input validation:** all inputs validated via the shared Zod schemas at the IPC boundary — no untrusted data reaches the data layer unvalidated.

---

## 18. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Cold start < 2.5s; dashboard load < 800ms at 5,000 students / 200,000 attendance rows; attendance for a 20-student group via QR < 45s; payment recording < 20s. |
| **Reliability** | Zero data loss across 10,000 backup/restore cycles; nightly integrity checks surfaced to the user. |
| **Scalability (data)** | Instant search and retrieval performance maintained up to at least 5,000 student records in v1.0, with an indexing strategy designed to scale well beyond that as usage grows. |
| **Scalability (architecture)** | Switching the Prisma provider from SQLite to PostgreSQL/SQL Server should require a schema/connection-string change, not application rewrites. Multi-branch support should require enabling existing `tenantId`/`branchId` filtering, not new tables. |
| **Availability** | Fully functional with zero network connectivity for all core (non-mobile-QR) workflows. |
| **Accessibility** | WCAG AA contrast minimum; full keyboard operability; RTL-correct focus order. |
| **Localization readiness** | All UI strings routed through i18n keys despite v1.0 shipping Arabic-only. |
| **Maintainability** | Strict TypeScript, ESLint/Prettier enforced, unit + integration + E2E test pyramid on all financial and attendance logic. |
| **Security** | See §17 in full. |
| **Supportability** | In-app diagnostics bundle ("copy technical report") for support requests; rotating file logs under the user's app-data directory. |

---

## 19. Development Roadmap

The roadmap below reflects a realistic, phase-based estimate for a team of roughly 2–3 engineers plus 1 product/design owner. It replaces two inconsistent estimates from earlier drafts (one implying a ~10-day delivery, the other a 12–16 month delivery) with a single grounded plan; actual duration should be re-validated once team size and priorities are finalized.

| Phase | Focus | Estimated Duration |
|---|---|---|
| 0 — Foundation | Node.js + Hono + Vite + React + TS scaffold, RTL shell, ABC Diatype Arabic / design tokens, Prisma + SQLite, typed HTTP API with Zod, auth + session middleware + RBAC skeleton, app shell (sidebar, top bar, command palette). | 2 weeks |
| 1 — Core Entities | Students, Parents, Subjects, Groups, Schedules, Enrollments; data tables with filters/saved views/empty states; student profile skeleton. | 3 weeks |
| 2 — Sessions & Attendance | Recurring/ad hoc sessions, calendar; manual + search attendance; QR generation and student-card printing; phone browser QR scanning (via BarcodeDetector API); USB HID listener. | 3 weeks |
| 3 — Finance | Invoices, Payments, Allocations, PDF receipts; Expenses and Extra Income with categories; cash-flow view; overdue detection job. | 3 weeks |
| 4 — Academics | Homework and submissions; Exams, grades, ranking, statistics. | 2 weeks |
| 5 — Staff & Salary | Users, built-in + custom roles, permissions UI; salary rules, payouts, payslip PDF. | 2 weeks |
| 6 — Reports & Notifications | Report engine with filters and PDF/Excel/CSV export; notification service, templates, internal channel (external providers stubbed). | 2 weeks |
| 7 — Ops & Polish | Backup/restore, scheduled backups, integrity checks; audit log viewer; onboarding and empty-state polish; packaged launcher (Node.js self-contained executable). | 2 weeks |
| 8 — Hardening & RC | Performance pass (virtualization, indexes, N+1 elimination); RTL visual regression; full QA cycle; release candidate. | 2 weeks |
| **Total** | | **~21 weeks (~5 months)**, excluding post-launch support |

---

## 20. Project & Folder Structure

```
genius-center/
├── apps/
│   ├── server/                      # Local API server (Node.js + Hono)
│   │   └── src/
│   │       ├── routes/              # HTTP route handlers (per domain)
│   │       ├── services/            # domain services
│   │       │   ├── students/
│   │       │   ├── attendance/
│   │       │   ├── payments/
│   │       │   ├── finance/
│   │       │   ├── staff/
│   │       │   ├── reports/
│   │       │   ├── notifications/
│   │       │   ├── backup/
│   │       │   └── audit/
│   │       ├── infrastructure/
│   │       │   ├── prisma/
│   │       │   ├── usb-hid/
│   │       │   ├── pdf/
│   │       │   └── logger/
│   │       └── security/            # auth, rbac, session middleware
│   └── ui/                          # Browser UI (Vite + React)
│       └── src/
│           ├── app/                 # routes, shell
│           ├── features/            # dashboard, students, parents, groups,
│           │                        # sessions, attendance, homework, exams,
│           │                        # payments, invoices, expenses, staff,
│           │                        # reports, notifications, settings, audit
│           ├── components/          # shared UI kit
│           ├── design-system/       # tokens, primitives
│           ├── hooks/
│           ├── lib/                 # api client, utils
│           ├── i18n/                # ar bundle
│           └── styles/
├── packages/
│   ├── contracts/                   # Zod schemas + TS types, shared server ↔ browser
│   ├── domain/                      # pure domain logic (money, dates, rules)
│   └── ui-kit/                      # optional extraction of the design system
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── scripts/
│   ├── start.ts                     # Launcher: starts server + opens browser
│   ├── backup-check.ts
│   └── seed-dev.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                         # Playwright driving browser
└── Docs/                            # this document, ADRs
```

---

## 21. Future Cloud Sync API Design

Not part of v1.0, but the schema and service boundaries are designed so this can be added without restructuring.

- **Protocol:** REST + JSON, versioned `/v1/`, `Authorization: Bearer <jwt>` + `X-Tenant-Id` on every request.
- **Sync model:** every writable table gains a monotonic `rev` (in addition to the `updatedAt` already present). Clients track the last-seen `rev` per table.
  - Delta pull: `GET /v1/sync/pull?since=<rev>&tables=students,payments,...` → upserts + tombstones.
  - Delta push: `POST /v1/sync/push` with `{ ops: [{ table, op: "upsert"|"delete", data, clientRev }] }`; the server assigns the authoritative `rev`.
  - **Conflict rule (v1):** last-writer-wins per field, with full history retained server-side — deliberately simple to start, with room to evolve toward CRDT/OT if needed.
- **Core resources:** `/v1/students`, `/v1/parents`, `/v1/groups`, `/v1/sessions`, `/v1/attendance`, `/v1/invoices`, `/v1/payments`, `/v1/expenses`, `/v1/salary/rules`, `/v1/salary/payouts`, `/v1/staff`, `/v1/roles`, `/v1/reports/*`, `/v1/notifications/*`, `/v1/audit`, `/v1/backups`. All list endpoints support cursor pagination, a filter DSL, sparse fieldsets, and ETag support.
- **Auth endpoints:** `/v1/auth/login`, `/v1/auth/refresh`, `/v1/auth/logout`, `/v1/auth/pin-unlock`. Short-lived access tokens (15 min) with rotating refresh tokens (30 days).
- **Webhooks (future):** `payment.recorded`, `attendance.marked`, `invoice.overdue`, `student.enrolled` — the eventual hook points for real WhatsApp/SMS/Email providers.

---

## 22. Engineering Best Practices

- **Boundary-first typing:** every HTTP API call and every DB call passes through Zod — no `any` at a boundary.
- **Repositories, not ambient Prisma calls:** every write goes through a repository so audit logging and permission checks happen in exactly one place.
- **Money is never a float.** Minor units + currency code, everywhere, no exceptions.
- **Time is UTC in the database, localized only in the UI**, formatted via `Intl` with the tenant's timezone.
- **Idempotency on writes:** payments, attendance, and (later) sync operations accept a `clientOpId` so retries are safe.
- **Feature flags** gate future/cloud functionality so the same codebase can run fully offline or connected.
- **Testing pyramid:** unit (domain rules) → integration (repository + DB in a temp SQLite instance) → E2E (Playwright driving browser) → smoke (server start + page load test).
- **Observability:** structured logs, error boundaries in the browser UI, and an in-app "copy technical report" diagnostics action.

---

## 23. Appendices

### 23.1 Reconciliation Changelog (What Changed From the Three Prior Drafts, and Why)

| Topic | Earlier drafts said | This document decides | Reason |
|---|---|---|---|
| Product name | "Genius" in one draft, "TutorERP" in the other two | **Genius Center** | Matches current product direction as confirmed by stakeholders. |
| Financial data model | One draft used a single `Payment` row with `outstandingBalanceBefore/After`; another used a full `Invoice/Payment/PaymentAllocation` model | **Invoice/Payment/PaymentAllocation** | The simpler model cannot cleanly represent split payments, overpayments, or partial refunds without manual balance patching; the allocation model can. |
| Money type | One draft used `Decimal`; another used integer minor units | **Integer minor units + currencyCode** | SQLite lacks a native decimal type; integers avoid rounding and precision bugs in financial calculations. |
| Class-occurrence entity name | Named `Session` in two drafts | **Renamed to `ClassSession`** | `Session` collides conceptually with *user/login session* (a real feature: session lock, PIN unlock) elsewhere in the same product. |
| Local API layer | One draft proposed an embedded Express server for all renderer↔main communication | **Typed IPC (Zod) for internal communication; a real HTTP(S) server only for the phone-QR use case** | Avoids unnecessary local attack surface; typed IPC is simpler and faster for in-process communication. |
| Multi-tenancy | One draft only added a `branch_id` field; another fully modeled `Tenant` | **Full `Tenant` model, `branchId` nullable on hot tables** | Tenant-shaped schema is a strict superset that supports both future multi-branch and, if ever needed, multi-customer SaaS — without a second migration path. |
| Success metrics | One draft set a "delivered by July 15" deadline inconsistent with its own scope; performance targets were vague ("instant search") | **Concrete, testable metrics (§3.2)**, phase-based roadmap with no single unqualified ship date | The original date was not achievable for the described scope; vague targets aren't verifiable. |
| Roadmap duration | One draft estimated ~21 weeks; another estimated 12–16 months for the same feature set | **~21 weeks / ~5 months**, explicitly stated as team-size-dependent | The granular, phase-by-phase estimate is more defensible than a high-level guess; the assumption is stated so it can be re-validated. |
| Personas | Overlapping persona sets across two drafts with inconsistent names and detail levels | **Four consolidated personas with goals + pain points** (§6) | Removes duplication while preserving the more useful goals/pain-points structure. |

### 23.2 Glossary
- **Class Session:** a single scheduled occurrence of a group's class.
- **Enrollment:** the relationship between a student and a group over a defined period.
- **Invoice:** a monetary obligation generated by a pricing rule (monthly, per-session, course) or created manually.
- **Allocation:** the portion of a payment applied to a specific invoice.
- **Tenant:** the top-level account boundary — an individual tutor today, a tutoring center tomorrow.

### 23.3 Architecture Decision Records to Author Before Phase 0
1. Electron process model and IPC contract conventions.
2. Prisma + SQLite WAL configuration.
3. Money and currency representation.
4. Time and timezone handling.
5. RBAC model: permission keys vs. policy-based access.
6. Sync protocol evolution path (v1 last-writer-wins → possible v2 CRDT).
7. Backup file format and versioning.

### 23.4 Definition of Done (per feature)
- Spec linked; Zod schemas defined; Prisma migration merged.
- Service + repository layers implemented with unit tests.
- UI includes empty, loading, and error states; full keyboard support; RTL verified visually.
- E2E happy-path test passing.
- Permissions wired and verified for each affected role.
- Audit entries confirmed emitted for all write paths.
- Documentation updated.
- QA sign-off recorded.

### 23.5 Open Questions for Stakeholder Input
These were not fully resolved across the three source drafts and should be decided before or during Phase 0:
1. Is a 5-month/21-week timeline (§19) acceptable, or does scope need to be trimmed for an earlier v1.0?
2. Should SQLCipher encryption-at-rest be pulled into v1.0 given the sensitivity of student and financial data, rather than deferred?
3. What is the actual target student-count ceiling for v1.0 performance testing — 5,000 (used in this document) or higher?
4. Should the mobile QR-scanning companion be a PWA (as currently planned) or a minimal native app, given potential camera-API reliability differences across Android browsers?

---

*End of document.*
