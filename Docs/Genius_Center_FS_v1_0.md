# Genius Center — Functional Specification (FS)

| | |
|---|---|
| **Product** | Genius Center |
| **Document Type** | Functional Specification (FS) |
| **Version** | 1.0 |
| **Status** | Draft for stakeholder review |
| **Companion Documents** | Genius Center PRD v2.0 · Genius Center BRS v1.0 · Genius Center ETBS v1.0 |
| **Audience** | Developers, UI/UX Designers, QA Engineers, AI Coding Agents |
| **Scope** | Screen-level and workflow-level functional behavior — no code, no schema, no API design |

---

## Table of Contents
1. [Functional Overview](#1-functional-overview)
2. [User Roles](#2-user-roles)
3. [Functional Modules](#3-functional-modules)
4. [Screen Specifications](#4-screen-specifications)
5. [Workflow Specifications](#5-workflow-specifications)
6. [Validation Rules](#6-validation-rules)
7. [UI Behavior](#7-ui-behavior)
8. [Error Handling](#8-error-handling)
9. [Reports](#9-reports)
10. [Settings](#10-settings)
11. [Traceability Matrix](#11-traceability-matrix)
12. [Future Extension Points](#12-future-extension-points)

---

## 1. Functional Overview

### 1.1 Purpose of This Document

Genius Center now has three documents that each answer a different question:

- The **PRD** answers: *what is the system, architecturally and technically?* — modules, stack, data model, roadmap.
- The **BRS** answers: *how should the business logic behave?* — policies, rules, configuration, edge-case handling.
- The **ETBS** answers: *how does an Egyptian tutoring business actually operate?* — the real-world scenarios the rules must survive contact with.

None of these three documents tells a developer, designer, or QA engineer exactly what appears on a given screen, what happens when a specific button is clicked, what a specific field's validation message says, or what the precise step-by-step sequence of a workflow is. That is the gap this document — the **Functional Specification (FS)** — closes.

The FS is **downstream** of all three other documents. It does not introduce new architecture (that is the PRD's authority), it does not invent new business policy (that is the BRS's authority), and it does not describe new real-world scenarios (that is the ETBS's authority). Instead, it takes the modules defined in the PRD, applies the rules defined in the BRS, grounds them in the scenarios catalogued in the ETBS, and renders all three into concrete, implementation-ready screen and workflow specifications.

### 1.2 Relationship to the PRD, BRS, and ETBS

```
PRD  ──defines modules & data model──┐
BRS  ──defines business rules────────┼──► FS translates all three into:
ETBS ──defines real-world scenarios──┘        • Screens (what the user sees)
                                               • Workflows (what the user does, step by step)
                                               • Validation (what is and isn't allowed)
                                               • Error states (what happens when something goes wrong)
                                               • Reports (what is measured and shown)
                                               • Settings (what is configurable)
```

Every functional element in this document is expected to trace back to at least one of the three source documents. Where a screen implies a business rule that is not yet resolved (see BRS §16, Open Questions), this document flags it explicitly rather than inventing a default of its own — consistent with the project's existing practice of surfacing open questions rather than silently resolving them.

### 1.3 Conventions Used in This Document

- **[BRS §x.x]** — a reference to a specific Business Rules Specification section or Rule ID.
- **[ETBS-NNN]** — a reference to a specific Egyptian Tutoring Business Scenario.
- **[PRD §x.x]** — a reference to a specific Product Requirements Document section.
- **RTL** — all screens are Arabic/RTL-only in v1.0, per [PRD §14.5]; this document describes behavior, not visual layout, so screen specs are written language-agnostically, but any left/right references use *logical* direction (leading/trailing edge), never literal left/right.
- **Required / Optional** fields are marked explicitly in every screen's field table.
- Every screen specification follows an identical template (§4.0) so that any two screens can be compared directly and so the template itself can be reused for future screens not yet detailed here.

### 1.4 What This Document Deliberately Does Not Contain

Per the scope defined for this document:
- No code, pseudocode, or component implementation.
- No database schema (see [PRD §13] for the canonical schema).
- No API or IPC contract definitions (see [PRD §11], [PRD §21]).
- No visual design tokens, colors, or typography (see [PRD §14]).

### 1.5 How to Use This Document

- **Developers** implement each screen and workflow exactly as specified, and raise a documentation change request (not a silent code-level decision) if a spec is found to be incomplete or contradictory during implementation.
- **Designers** use §4 (Screen Specifications) as the functional brief for every layout, and §7 (UI Behavior) for interaction patterns, before applying the PRD's design system.
- **QA Engineers** derive test cases directly from §4 (validation, error, and empty/loading states), §6 (validation rules), §8 (error handling), and §11 (the Traceability Matrix).
- **AI coding agents** should treat this document, together with the PRD's data model, as sufficient to implement a module without needing to infer business intent — any genuine ambiguity should be resolved by checking the BRS and ETBS before falling back to a reasonable, documented assumption.


---

## 2. User Roles

### 2.1 Reconciliation Note

The PRD's data model [PRD §13.3, Role/Permission tables] and Role & Permission Matrix [PRD §16] define exactly **five base roles** — Owner, Teacher, Assistant, Secretary, Accountant — plus cloneable Custom roles. Common industry role names such as "Cashier," "Receptionist," and "Branch Manager" are not separate base roles in Genius Center; introducing them as new base roles would fragment the permission model the PRD already committed to. Instead, this document reconciles them as follows, the same way the PRD reconciled competing drafts in its own Appendix 23.1:

| Requested Role | Reconciliation | Reasoning |
|---|---|---|
| Cashier | Custom role cloned from **Secretary**, scoped to `payments.write`, `invoices.read`, `students.read` only | A cashier is a Secretary whose duties are narrowed to money handling; no new base role or permission key is needed. |
| Receptionist | Custom role cloned from **Secretary**, scoped to `students.read/write`, `attendance.mark`, `notifications.send` | Front-desk duties are a subset of the Secretary's existing permission surface. |
| Branch Manager | **Not available in v1.0.** Modeled as a scoped **Owner** once multi-branch ships [PRD §7.2, Future] — an Owner-equivalent whose authority is filtered to a single `branchId`. | Branch-level ownership is a multi-tenant/multi-branch concept explicitly deferred in the PRD; documented here so the permission model doesn't need rework when that phase begins. |
| System Administrator | **Not a business role.** A technical/support function (local IT person or the tutor themselves) with access to Settings, Backup/Restore, and diagnostics, but no default visibility into student or financial data unless also assigned a business role. | Keeps "who can see student money" (a business concern) separate from "who can maintain the software" (a technical concern). |

The five base roles plus the Custom-role mechanism therefore remain the single source of truth. All screen-level permission references in §4 use the PRD's five base roles and the `permission.key` naming convention from [PRD §16].

### 2.2 Role Definitions

**Owner**
Full, unrestricted access to every module, including Staff & Roles, Settings, Backup/Restore, and the Audit Log. The only role that can approve refunds above the Financial Policy threshold [BRS §3.8], run Backup/Restore, and manage other users' roles. In the Private Tutor business type [BRS §3.1], the Owner is typically also the sole Teacher.

**Teacher**
Full access to their own groups' academic data (attendance, homework, exams, grades) and read access to their own students. Cannot see or edit billing information for their students unless Teacher Policy [BRS §3.7] explicitly grants it. Can independently cancel/reschedule their own sessions only if Teacher Policy allows; otherwise requires Owner/Assistant approval.

**Assistant**
Operational, front-line role focused on attendance marking, day-to-day session support, and basic notifications. No financial or staff-management access. This is the role most likely to be the one physically operating the QR/USB attendance flow [ETBS-027], reflecting real-world usage where the assistant, not the teacher, runs attendance.

**Secretary**
Front-desk and billing-adjacent role: student/parent read-write, invoices, payments (write, not refund), expenses (write), attendance (mark + override), notifications (send). The base role from which Cashier- and Receptionist-style Custom roles are cloned (§2.1).

**Accountant**
Financial oversight role: read-only across most operational data, write access to expenses and salary, and the sole non-Owner role permitted to process refunds [PRD §16]. Has read access to the Audit Log for financial reconciliation [BRS §13.2].

**Custom Roles**
Any role cloned from a base role with individual permission-key overrides [PRD §16, BRS §3.1]. Every Custom role must be visibly labeled as a variant of its base role in the Staff & Roles screens (§4.16), never presented as indistinguishable from a true base role, so that an owner reviewing staff always knows a role's origin and overrides.

### 2.3 Role Permission Summary

This is a functional restatement of [PRD §16] for quick screen-level reference; the PRD's matrix remains authoritative in case of conflict.

| Capability | Owner | Teacher | Assistant | Secretary | Accountant |
|---|:-:|:-:|:-:|:-:|:-:|
| View own dashboard | ✔ | ✔ (scoped) | ✔ (scoped) | ✔ | ✔ |
| Manage students (create/edit) | ✔ | — | — | ✔ | — |
| Delete a student (no-history only) | ✔ | — | — | — | — |
| Mark attendance | ✔ | ✔ | ✔ | ✔ | — |
| Reopen locked attendance | ✔ | ✔ (own session) | — | ✔ | — |
| Create/edit groups | ✔ | — | — | Schedule only | — |
| Issue invoices | ✔ | — | — | ✔ | Read only |
| Record payments | ✔ | — | — | ✔ | — |
| Process refunds | ✔ | — | — | — | ✔ |
| Manage expenses | ✔ | — | — | Write | ✔ |
| Run payroll | ✔ | Own record only | — | — | ✔ |
| Manage staff & roles | ✔ | — | — | — | — |
| Send notifications | ✔ | Own students | ✔ | ✔ | — |
| Change Settings | ✔ | — | — | — | — |
| Run Backup / Restore | ✔ | — | — | — | — |
| View Audit Log | ✔ | — | — | — | ✔ |


---

## 3. Functional Modules

### 3.0 Module List and PRD Reconciliation

The PRD organizes its architecture into service-layer domains [PRD §20] and its navigation into IA sections [PRD §9]. This document exposes **Teachers** and **Users** as two distinct functional modules for usability reasons — a Teacher-scoped view for academic staff and a Users/Roles view for full staff/RBAC administration — even though both are backed by the same `User`/`Role` data model in the PRD [PRD §13.3]. This is a UI-organization decision only; it introduces no new entities.

The 17 modules documented below are: Dashboard, Students, Parents, Teachers, Groups, Sessions, Attendance, Invoices, Payments, Expenses, Payroll, Notifications, Reports, Settings, Backup, Users, Audit Log.

---

### 3.1 Dashboard
- **Purpose:** Single-glance operational and financial health check; the default landing screen after login.
- **Entry Points:** App launch (post-login); sidebar "لوحة التحكم"; `Ctrl+1`.
- **Main Screens:** Dashboard Home (§4.1).
- **Available Actions:** Drill into any KPI tile; jump to today's sessions; jump to overdue invoices; acknowledge/dismiss at-risk student flags.
- **Dependencies:** Student, Enrollment, Attendance, Invoice, Payment, ClassSession records.
- **Permissions:** Every role sees a scoped Dashboard; Owner/Accountant see full financial KPIs; Teacher/Assistant see attendance and session KPIs only.
- **Business Rules Reference:** [BRS §12 — Dashboard Business Rules], all KPI definitions.
- **Related ETBS Scenarios:** [ETBS-104 — Consolidated View].

### 3.2 Students
- **Purpose:** Central registry of every student, independent of enrollment status.
- **Entry Points:** Sidebar "الطلاب"; global search result; "quick-add" (`Ctrl+N`) from anywhere.
- **Main Screens:** Student List (§4.2), Student Profile (§4.3), New/Edit Student Form (§4.4), QR Card Print View (§4.5).
- **Available Actions:** Register, edit, archive, view full history, print QR card, initiate transfer/pause/dropout/graduation, merge/relink a returning student.
- **Dependencies:** Parent, Enrollment, Attendance, Invoice modules for the profile's history tabs.
- **Permissions:** [PRD §16] Students row — full write for Owner/Secretary; read-only for Teacher (own groups)/Assistant/Accountant.
- **Business Rules Reference:** [BRS §4 — Student Business Rules] in full; Rule STU-001, STU-002, STU-003.
- **Related ETBS Scenarios:** [ETBS-001] through [ETBS-018], [ETBS-076], [ETBS-089].

### 3.3 Parents
- **Purpose:** Guardian/payer registry, linked many-to-many to students.
- **Entry Points:** Sidebar "أولياء الأمور"; from within a Student Profile's "Parents" tab.
- **Main Screens:** Parent List (§4.6), Parent Profile (§4.7), New/Edit Parent Form.
- **Available Actions:** Register a parent, link/unlink to students, designate primary billing contact, view combined family balance, restrict a parent's notification access.
- **Dependencies:** Student module (linking); Notification module (guardian messaging); Invoice module (family balance view).
- **Permissions:** Same as Students.
- **Business Rules Reference:** [BRS §4.10 — Parent Relationships].
- **Related ETBS Scenarios:** [ETBS-013], [ETBS-085], [ETBS-089].

### 3.4 Teachers
- **Purpose:** Academic-staff-scoped view of the User/Role model, surfacing only teaching assignments, schedules, and payroll basis.
- **Entry Points:** Sidebar "الموظفون" → "المعلمون" filter; from a Group's "assigned teacher" field.
- **Main Screens:** Teacher List (§4.8), Teacher Profile (§4.9).
- **Available Actions:** Assign to group(s), set payroll basis, view teaching load, mark inactive (departure), record substitute coverage.
- **Dependencies:** Users module (underlying account), Groups module (assignments), Payroll module.
- **Permissions:** Owner manages; Teacher sees own profile read-only.
- **Business Rules Reference:** [BRS §3.7 — Teacher Policy], [BRS §9.4 — Payroll].
- **Related ETBS Scenarios:** [ETBS-028], [ETBS-029], [ETBS-030], [ETBS-103].

### 3.5 Groups
- **Purpose:** The organizing unit for schedule, pricing, capacity, and roster.
- **Entry Points:** Sidebar "المجموعات"; from Student enrollment flow.
- **Main Screens:** Group List (§4.10), Group Profile (§4.11), New/Edit Group Form (§4.12), Weekly Schedule Grid (§4.13).
- **Available Actions:** Create/edit/archive a group, manage roster, configure pricing model and overrides, view occupancy, override capacity.
- **Dependencies:** Subject, Teacher, ClassSession, Enrollment modules.
- **Permissions:** Owner full write; Secretary schedule read/write; Teacher read + close own sessions.
- **Business Rules Reference:** [BRS §5 — Group Business Rules] in full; Rules GRP-001, GRP-002.
- **Related ETBS Scenarios:** [ETBS-011] through [ETBS-035] (Group & Teacher Scenarios section).

### 3.6 Sessions
- **Purpose:** Manage individual scheduled class occurrences (`ClassSession`).
- **Entry Points:** Sidebar "الحصص"; from a Group Profile's schedule tab; calendar view.
- **Main Screens:** Today's Sessions (§4.14), Session Calendar (§4.15), Session Detail (§4.16), Recurring Schedule Builder (§4.17).
- **Available Actions:** Schedule (recurring/ad hoc), cancel, reschedule, mark completed, create make-up/extra/review/exam session types.
- **Dependencies:** Group, Attendance, Notification modules.
- **Permissions:** Owner full; Teacher can close/cancel own sessions (subject to Teacher Policy approval requirement).
- **Business Rules Reference:** [BRS §6 — Session Business Rules] in full; Rule SES-001.
- **Related ETBS Scenarios:** [ETBS-019] through [ETBS-025], [ETBS-066] through [ETBS-074].

### 3.7 Attendance
- **Purpose:** Record and manage attendance across all four supported methods.
- **Entry Points:** Sidebar "الحضور"; from a live Session Detail screen; LAN QR mobile companion view; USB scanner focus-trapped field.
- **Main Screens:** Attendance Grid — Manual (§4.18), Attendance — Search (§4.19), Attendance — QR/USB Live View (§4.20), Attendance History / Reopen (§4.21).
- **Available Actions:** Mark present/absent/late/excused, bulk-mark, reopen a locked record, view per-student attendance history, flag anomaly (duplicate/suspected proxy scan).
- **Dependencies:** Session, Student, Billing (for per-session models) modules.
- **Permissions:** Owner/Teacher/Assistant/Secretary can mark; only Owner/Teacher(own)/Secretary can reopen; Accountant has no access.
- **Business Rules Reference:** [BRS §7 — Attendance Business Rules] in full; Rules ATT-001, ATT-002.
- **Related ETBS Scenarios:** [ETBS-036] through [ETBS-050] (Attendance & Technical Operations section).

### 3.8 Invoices
- **Purpose:** Generate and track monetary obligations per student/enrollment.
- **Entry Points:** Sidebar "المالية" → "الفواتير والمدفوعات"; from a Student Profile's Payments tab; automatic generation job.
- **Main Screens:** Invoice List (§4.22), Invoice Detail (§4.23), New/Manual Invoice Form (§4.24).
- **Available Actions:** Generate (auto/draft/manual), issue, void, write off, link a financial adjustment, print/export.
- **Dependencies:** Student, Enrollment (pricing/proration), Payment, Financial Adjustment.
- **Permissions:** Owner/Secretary write; Accountant read-only; Teacher no access.
- **Business Rules Reference:** [BRS §8 — Billing Business Rules] in full; Rules BIL-001 through BIL-004.
- **Related ETBS Scenarios:** [ETBS-001] through [ETBS-004], [ETBS-051] through [ETBS-065], [ETBS-092], [ETBS-093].

### 3.9 Payments
- **Purpose:** Record money received and allocate it to invoices.
- **Entry Points:** Sidebar "المالية" → "الفواتير والمدفوعات" (Payments tab); Student Profile "تسجيل دفعة" action.
- **Main Screens:** Payment List (§4.25), Record Payment Form (§4.26), Payment Allocation Dialog (§4.27), Refund Form (§4.28).
- **Available Actions:** Record a payment, allocate/split across invoices, hold as unallocated credit, issue a refund, print a receipt.
- **Dependencies:** Invoice module (allocation targets), Cashbox (§3.11).
- **Permissions:** Owner/Secretary can record; only Owner/Accountant can refund.
- **Business Rules Reference:** [BRS §8.6, 8.7, 8.16, 8.17], [BRS §9.5 — Cashbox].
- **Related ETBS Scenarios:** [ETBS-013] through [ETBS-015], [ETBS-059], [ETBS-060].

### 3.10 Expenses
- **Purpose:** Track outgoing costs not related to payroll.
- **Entry Points:** Sidebar "المالية" → "المصروفات".
- **Main Screens:** Expense List (§4.29), New/Edit Expense Form (§4.30), Recurring Expense Template Manager (§4.31).
- **Available Actions:** Record a one-off or recurring expense, attach a receipt, categorize, edit before reconciliation.
- **Dependencies:** Cashbox module for cash-based expenses.
- **Permissions:** Owner/Secretary(write)/Accountant full; others no access.
- **Business Rules Reference:** [BRS §9.1, 9.6, 9.7].
- **Related ETBS Scenarios:** [ETBS-063], [ETBS-082].

### 3.11 Cashbox (Sub-module of Finance)
- **Purpose:** Derived, non-editable running ledger of physical cash.
- **Entry Points:** Sidebar "المالية" → "التدفق النقدي"; surfaced within Payments and Expenses screens for cash-method entries.
- **Main Screens:** Cashbox Ledger View (§4.32).
- **Available Actions:** View running balance, filter by date, flag/investigate a discrepancy.
- **Dependencies:** Payment (cash method), Expense (cash method).
- **Permissions:** Owner/Accountant only.
- **Business Rules Reference:** [BRS §9.5], Rule (Cashbox derived-balance principle).
- **Related ETBS Scenarios:** [ETBS-063], [ETBS-082].

### 3.12 Payroll
- **Purpose:** Calculate and record staff compensation.
- **Entry Points:** Sidebar "المالية" → "الرواتب".
- **Main Screens:** Payroll Run List (§4.33), Payroll Detail per Staff Member (§4.34), Salary Rule Configuration (§4.35).
- **Available Actions:** Configure salary basis, run a payroll period, view calculation breakdown, record a payout, issue a payslip PDF, record an advance.
- **Dependencies:** Attendance (locked records only), Session (delivered count), Financial Adjustment.
- **Permissions:** Owner/Accountant only; Teacher read-only on own record.
- **Business Rules Reference:** [BRS §9.4 — Payroll].
- **Related ETBS Scenarios:** [ETBS-028], [ETBS-030], [ETBS-064], [ETBS-084], [ETBS-103].

### 3.13 Notifications
- **Purpose:** Configure, send, and audit outbound (and internal) messages.
- **Entry Points:** Sidebar "الإشعارات"; triggered automatically per event; notification bell in the top bar.
- **Main Screens:** Notification Log (§4.36), Template Manager (§4.37), Manual/Broadcast Composer (§4.38).
- **Available Actions:** Edit templates, preview with variables, send manual/broadcast messages, retry a failed send, view delivery status.
- **Dependencies:** Every module that triggers an event (Attendance, Invoice, Session, Student Status).
- **Permissions:** Owner/Secretary send; Teacher can send to own students; Assistant can send.
- **Business Rules Reference:** [BRS §10 — Notification Rules] in full.
- **Related ETBS Scenarios:** [ETBS-086], [ETBS-066] (batch notification case).

### 3.14 Reports
- **Purpose:** Read-only analytical and export layer over all operational/financial data.
- **Entry Points:** Sidebar "التقارير".
- **Main Screens:** Report Hub (§4.39), individual report viewers (§9).
- **Available Actions:** Filter, sort, export (PDF/Excel/CSV), print, save a filtered view.
- **Dependencies:** All modules.
- **Permissions:** Scoped per role per [PRD §16] Reports row.
- **Business Rules Reference:** [BRS §13 — Reports Business Rules] in full.
- **Related ETBS Scenarios:** Cross-cutting; see §9 of this document.

### 3.15 Settings
- **Purpose:** Central configuration surface for every global policy defined in the BRS.
- **Entry Points:** Sidebar "الإعدادات".
- **Main Screens:** Settings Hub (§4.40) with sub-sections per §10 of this document.
- **Available Actions:** Configure business profile, all Global Business Policies [BRS §3], notification templates, backup schedule, security.
- **Dependencies:** Every module (policies cascade as defaults, §5.9 BRS).
- **Permissions:** Owner only.
- **Business Rules Reference:** [BRS §3 — Global Business Policies] in full.
- **Related ETBS Scenarios:** [ETBS-096], [ETBS-099] (policy templating).

### 3.16 Backup
- **Purpose:** Protect against data loss; enable recovery.
- **Entry Points:** Sidebar "النسخ الاحتياطي"; Settings → Backup sub-section; bottom status bar backup-age indicator.
- **Main Screens:** Backup & Restore Hub (§4.41).
- **Available Actions:** Run manual backup, configure schedule, restore from a file, view backup history, run integrity check.
- **Dependencies:** None (infrastructure-level, [PRD §11.4]).
- **Permissions:** Owner only.
- **Business Rules Reference:** N/A (technical, [PRD §17]); [ETBS-049] documents the business practice implication.
- **Related ETBS Scenarios:** [ETBS-041], [ETBS-049].

### 3.17 Users (Staff & Roles)
- **Purpose:** Full staff account and RBAC administration.
- **Entry Points:** Sidebar "الموظفون" → "الأدوار"/"الصلاحيات".
- **Main Screens:** User List (§4.42), New/Edit User Form (§4.43), Role & Permission Editor (§4.44).
- **Available Actions:** Create/deactivate a staff account, assign/clone roles, edit permission-key overrides, reset password/PIN.
- **Dependencies:** Teachers module (shared underlying entity).
- **Permissions:** Owner only.
- **Business Rules Reference:** [PRD §16], [BRS §3.7].
- **Related ETBS Scenarios:** [ETBS-081] (turnover/institutional-knowledge risk).

### 3.18 Audit Log
- **Purpose:** Immutable, chronological record of every sensitive action.
- **Entry Points:** Sidebar "سجل التدقيق".
- **Main Screens:** Audit Log Viewer (§4.45).
- **Available Actions:** Filter by actor/entity/date, view before/after diff, export for a regulatory request.
- **Dependencies:** All modules with write operations (structural, via the repository decorator [PRD §11.3]).
- **Permissions:** Owner/Accountant read-only; no one can edit or delete an entry.
- **Business Rules Reference:** [BRS §9.9 — Audit].
- **Related ETBS Scenarios:** [ETBS-080], [ETBS-084], [ETBS-094].


---

## 4. Screen Specifications

### 4.0 Screen Specification Template

Every screen below follows this identical template. Fields not applicable to a given screen are marked "N/A" rather than omitted, so the template's completeness is always visible.

> **Screen ID / Name**
> **Purpose** — one sentence, what this screen is for.
> **Fields** — table of Field | Type | Required/Optional | Notes.
> **Buttons / Toolbar** — every actionable control.
> **Filters / Search / Sorting** — what can be filtered, searched, sorted, per [BRS §14.1–14.3].
> **Bulk Actions** — if any, with the confirmation requirement per [BRS §14.4].
> **Keyboard Shortcuts** — if any, per [PRD §14.6].
> **Validation Rules** — field-level and cross-field.
> **Empty State** — what shows with zero records.
> **Loading State** — what shows while data is fetched.
> **Error State** — what shows on a failed load/save.
> **Permissions** — which roles can view/act.
> **Confirmation Dialogs** — which actions require one, per [BRS §14.6].
> **Success / Warning Messages** — user-facing feedback text (described functionally, in English for this document; actual product copy is Arabic).
> **Navigation** — where this screen is reached from and leads to.
> **Referenced Business Rules / ETBS Scenarios**

This document specifies full detail for every screen central to the v1.0 core workflows (student, group, attendance, and billing screens receive the deepest treatment, mirroring where the BRS itself concentrates its rule density). Simpler, structurally uniform screens (e.g., individual Settings sub-panels) are specified at a slightly more compact but still complete level, using the same template — consistent with the BRS's own Rule Catalog approach [BRS §15], which documents "the highest-priority rules ... additional rules should be added following the exact template" as implementation proceeds.

---

### 4.1 Dashboard Home

**Purpose:** Give any role an at-a-glance operational and financial status the moment they log in.

**Fields (KPI Tiles):** Active Students · Attendance Rate (today / this week) · Monthly Revenue · Outstanding Balance · At-Risk Students · Group Occupancy (avg.) · Teacher Load (today) — each per [BRS §12] exact calculation.

**Buttons / Toolbar:** Date-range selector for revenue/attendance tiles; "عرض التفاصيل" per tile (drills into the relevant report); quick-add (`Ctrl+N`).

**Filters / Search / Sorting:** Date range only (KPIs are not individually filterable beyond that; drill-through opens the full filterable report).

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+1` (navigate here), `Ctrl+F` (global search), `Ctrl+K` (command palette).

**Validation Rules:** N/A (read-only screen).

**Empty State:** New tenant with no data — tiles show "0" / "—" with a one-time onboarding prompt ("ابدأ بإضافة أول طالب") linking to Student registration.

**Loading State:** Skeleton tiles (per [PRD §15] `Skeleton` component) while KPIs compute; dashboard must still load in < 800ms at 5,000 students / 200,000 attendance rows [PRD §18].

**Error State:** If a specific KPI's underlying query fails, that tile alone shows an inline error ("تعذر تحميل هذا المؤشر") with a retry icon — one failed tile must never block the rest of the dashboard from rendering.

**Permissions:** All roles; tile set is scoped per role (§2.3) — e.g., Teacher sees only their groups' occupancy and attendance, not center-wide revenue.

**Confirmation Dialogs:** None.

**Success / Warning Messages:** A non-dismissible warning banner appears if the nightly `PRAGMA integrity_check` [PRD §11.5] last failed, or if the last backup is older than the configured threshold [PRD §17].

**Navigation:** Landing screen post-login; every tile links to its corresponding Report or List screen.

**Referenced Business Rules / ETBS Scenarios:** [BRS §12] all KPI rows; [ETBS-104].

---

### 4.2 Student List

**Purpose:** Primary registry view of all students, the entry point to registration, search, and profile access.

**Fields (columns):** Photo (thumbnail) · Full Name · Code · Status (badge) · Group(s) enrolled · Phone · Guardian Phone · Outstanding Balance · Enrollment Date.

**Buttons / Toolbar:** "طالب جديد" (primary, opens §4.4); "استيراد من Excel" (onboarding-only); "طباعة بطاقات QR" (bulk, opens §4.5 for selection); column customization.

**Filters / Search / Sorting:** Filter by Status (Active/Paused/Inactive/Graduated/Dropped/Archived — combinable, [BRS §14.2]); filter by Group, Grade, Subject. Search across name, phone, guardian phone simultaneously with partial-match support (typing "moh" surfaces "Mohamed") [BRS §14.1]. Sort by name (default: alphabetical) or enrollment date (most recent first) [BRS §14.3].

**Bulk Actions:** Bulk print QR cards; bulk-send a notification to filtered students' guardians; bulk-archive (Active→Archived only where every selected student has no unresolved balance) — each requires an explicit count-confirmation dialog [BRS §14.4, Rule UI-001], and the dialog must state whether the count reflects the current filter or the full unfiltered list.

**Keyboard Shortcuts:** `Ctrl+N` new student; `↑/↓` row navigation; `Enter` opens selected row's profile.

**Validation Rules:** N/A at list level (validation lives in the form, §4.4).

**Empty State:** No students at all — "لا يوجد طلاب بعد" with a prominent "طالب جديد" call to action. No students matching a filter — "لا توجد نتائج مطابقة" with a "مسح الفلاتر" link.

**Loading State:** Virtualized skeleton rows; list must remain responsive at 5,000+ records [PRD §18] via the `DataTable` virtualization.

**Error State:** Full-screen inline error with retry if the list fails to load; does not block navigation to other modules.

**Permissions:** Owner/Secretary full; Teacher sees only students in their own groups; Assistant/Accountant read-only per §2.3.

**Confirmation Dialogs:** Bulk archive (per Bulk Actions above).

**Success / Warning Messages:** Duplicate-phone warning banner appears inline above the list when a new registration (§4.4) matches an existing phone number, per Rule STU-001 — this is a warning, never a block.

**Navigation:** From sidebar "الطلاب"; from global search results; leads to Student Profile (§4.3) or New Student Form (§4.4).

**Referenced Business Rules / ETBS Scenarios:** [BRS Rule STU-001]; [ETBS-001], [ETBS-008].

---

### 4.3 Student Profile

**Purpose:** The single, comprehensive view of one student's full history — the "student 360" screen referenced throughout the PRD and BRS.

**Fields (tabs):** Overview (photo, personal info, status, QR) · Enrollments (current + historical, per group, with price/override visibility) · Attendance (full history, rate, cancelled-session exclusions) · Payments & Invoices (balance, history, allocations) · Homework & Exams · Notes & Medical Info · Status Timeline (Registration → Enrollment → Pauses/Transfers → current state, per [BRS §13.3]).

**Buttons / Toolbar:** "تعديل" (edit); "تسجيل دفعة" (§4.26); "تسجيل حضور"; "نقل" (Transfer, §5.7); "إيقاف مؤقت" (Pause, §5.8); "إنهاء" (Dropout); "تخرج" (Graduate); "طباعة بطاقة QR"; "إرسال إشعار".

**Filters / Search / Sorting:** Within Attendance/Payments tabs: date-range filter; sortable by date (default: most recent first) [BRS §14.3].

**Bulk Actions:** N/A (single-student screen).

**Keyboard Shortcuts:** `Esc` returns to Student List; `Ctrl+S` on the edit form.

**Validation Rules:** Status-change actions are gated: Dropout/Graduate require a reason [BRS §4.6, §4.8]; Transfer requires target group capacity check [BRS Rule GRP-001]; Pause requires a configured maximum-duration check [BRS §4.4].

**Empty State:** A newly registered, unenrolled student shows all tabs present but empty, with each tab's empty state pointing to the relevant next action (e.g., Enrollments tab shows "لم يتم تسجيل الطالب في أي مجموعة بعد" with an "تسجيل في مجموعة" button) — per [BRS §4.1], registration without enrollment is valid and must not be treated as an incomplete/error state.

**Loading State:** Tab-by-tab lazy loading with skeletons; Overview tab loads first and is interactive before other tabs finish.

**Error State:** If the student record itself fails to load, a full error state replaces the screen with a retry action and a "return to list" link.

**Permissions:** Owner/Secretary full edit; Teacher sees Overview/Attendance/Homework/Exams tabs only for their own students, not Payments; Accountant sees Payments/Invoices tab only, read-only.

**Confirmation Dialogs:** Dropout, Archive, and any Delete action (only available for a never-enrolled student with zero history, [BRS §14.5]) all require confirmation.

**Success / Warning Messages:** "تم حفظ التغييرات" on save; a persistent warning banner on this screen if the student has an outstanding balance and is Inactive/Dropout status, per [BRS §4.5] ("stops future billing but does not erase past balances owed") and Edge Case #1 [ETBS-076].

**Navigation:** From Student List row click, global search, or any cross-reference (e.g., from an Invoice's student link).

**Referenced Business Rules / ETBS Scenarios:** [BRS §4] in full; [ETBS-001] through [ETBS-018], [ETBS-076], [ETBS-080].

---

### 4.4 New / Edit Student Form

**Purpose:** Capture or update a student's registration details.

**Fields:**

| Field | Type | Required/Optional | Notes |
|---|---|---|---|
| Photo | Image upload | Optional | |
| Full Name | Text | **Required** | |
| Gender | Select | **Required** | |
| Birthdate | Date | Optional | |
| School | Text | Optional | Configurable as required per center [BRS §4.1] |
| Grade Level | Select | Optional | Configurable as required |
| Phone | Phone (Egypt format) | Optional | Configurable as required |
| Alternate Phone | Phone | Optional | |
| Guardian(s) | Parent picker/link | Optional | At least one recommended but not enforced [BRS §4.10] |
| Status | Select | **Required** | Defaults to Active |
| Medical Notes | Textarea | Optional | |
| Notes | Textarea | Optional | |
| Tags | Tag input | Optional | |

**Buttons / Toolbar:** "حفظ" (`Ctrl+S`); "حفظ وتسجيل في مجموعة" (save + jump directly into Enrollment flow, §5.2); "إلغاء".

**Filters / Search / Sorting:** N/A (form screen); the Guardian picker includes an inline search-before-create step per [ETBS-008] to prevent duplicate parent profiles.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+S` save; `Esc` cancel (with unsaved-changes confirmation if dirty).

**Validation Rules:** Full Name required, min 2 characters. Phone format validated against Egyptian mobile patterns (`01[0-2,5]XXXXXXXX`) when a phone is entered, per [PRD §15] `MoneyInput`-style phone component — inline error, never a rejected submission without explanation [BRS §14.7]. Duplicate phone number → warning (not block) banner, per Rule STU-001. Photo file size/type validated client-side before upload.

**Empty State:** N/A (form always shows its fields).

**Loading State:** Save button shows a spinner and disables during submit; form fields remain visible (not replaced by a skeleton).

**Error State:** Inline field-level errors on validation failure; a top-of-form banner on a save failure unrelated to validation (e.g., database write error), with the entered data preserved, not cleared.

**Permissions:** Owner/Secretary only.

**Confirmation Dialogs:** Canceling with unsaved changes shows "هل تريد تجاهل التغييرات؟" confirmation.

**Success / Warning Messages:** "تم تسجيل الطالب بنجاح" toast on create; duplicate-phone warning inline (Rule STU-001) allowing the user to proceed anyway.

**Navigation:** Opened from Student List "طالب جديد," from Student Profile "تعديل," or from the Registration workflow (§5.1).

**Referenced Business Rules / ETBS Scenarios:** [BRS Rule STU-001]; [ETBS-001], [ETBS-008].

---

### 4.5 QR Card Print View

**Purpose:** Generate a printable student ID card containing the QR code.

**Fields:** Read-only preview: Photo, Name, Code, QR image, Group name (optional), Center logo/name (from Settings).

**Buttons / Toolbar:** "طباعة"; "تصدير PDF"; "إعادة توليد الرمز" (regenerate QR, only visible with permission).

**Filters / Search / Sorting:** N/A; when opened in bulk mode from the Student List, a selectable list of pending cards with a "طباعة الكل" action.

**Bulk Actions:** Bulk print, inherited from Student List bulk selection; shows the affected count before printing [BRS Rule UI-001].

**Keyboard Shortcuts:** `Ctrl+P` print.

**Validation Rules:** N/A.

**Empty State:** N/A (always has at least the one student it was opened for).

**Loading State:** Spinner while the QR image renders/regenerates.

**Error State:** "تعذر توليد رمز QR" with retry, if QR generation fails.

**Permissions:** Owner/Secretary.

**Confirmation Dialogs:** Regenerating a QR code shows a confirmation noting the old code will stop working, per [ETBS-045] — and explicitly reassures that historical attendance tied to the old code is preserved.

**Success / Warning Messages:** "تم إنشاء رمز جديد" on regeneration.

**Navigation:** From Student Profile or Student List bulk action.

**Referenced Business Rules / ETBS Scenarios:** [PRD §8.1]; [ETBS-044], [ETBS-045].


---

### 4.6 Parent List

**Purpose:** Registry of guardians/payers, supporting family-level billing visibility.

**Fields (columns):** Full Name · Phone · Linked Students (count + names) · Combined Outstanding Balance · Primary-Contact-For (which students).

**Buttons / Toolbar:** "ولي أمر جديد"; "دمج" (merge two accidental duplicate parent records).

**Filters / Search / Sorting:** Search by name/phone (partial match); sort by name or by outstanding balance.

**Bulk Actions:** None.

**Keyboard Shortcuts:** `Ctrl+N` new parent.

**Validation Rules:** N/A at list level.

**Empty State:** "لا يوجد أولياء أمور بعد."

**Loading State:** Virtualized skeleton rows.

**Error State:** Full inline error with retry.

**Permissions:** Owner/Secretary full; others read-only where applicable per §2.3.

**Confirmation Dialogs:** Merge action requires confirmation and shows exactly what will combine (linked students, contact info) before proceeding.

**Success / Warning Messages:** "تم دمج الحسابين" on merge.

**Navigation:** From sidebar "أولياء الأمور"; from a Student Profile's Parents tab.

**Referenced Business Rules / ETBS Scenarios:** [BRS §4.10]; [ETBS-013], [ETBS-085].

---

### 4.7 Parent Profile

**Purpose:** View/manage one guardian's linked students, contact info, and combined billing.

**Fields:** Full Name · Phone · Alternate Phone · Email · Notes · Linked Students (with relation type and primary-contact flag per student) · Combined Family Balance · Notification Preferences (per-guardian opt-out, [ETBS-085]).

**Buttons / Toolbar:** "تعديل"; "ربط بطالب"; "تسجيل دفعة عائلية" (opens Payment Allocation Dialog §4.27 pre-scoped to this family's invoices); "إرسال إشعار".

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Esc` back to list.

**Validation Rules:** At least one guardian phone recommended (not enforced) [BRS §4.10]; relation type (father/mother/guardian) required when linking a student.

**Empty State:** A parent linked to zero students (e.g., pending link) shows "لم يتم ربط أي طالب بعد."

**Loading State:** Skeleton on load.

**Error State:** Inline retry on load failure.

**Permissions:** Owner/Secretary full; Accountant read-only (balance visibility only).

**Confirmation Dialogs:** Unlinking a student from a parent shows confirmation if that parent is the sole primary contact.

**Success / Warning Messages:** "تم حفظ البيانات."

**Navigation:** From Parent List; from Student Profile Parents tab.

**Referenced Business Rules / ETBS Scenarios:** [BRS §4.10]; [ETBS-013], [ETBS-085], [ETBS-089].

---

### 4.8 Teacher List

**Purpose:** Academic-staff-scoped roster view.

**Fields (columns):** Photo · Full Name · Assigned Groups (count) · Weekly Sessions · Payroll Basis · Status (Active/Inactive).

**Buttons / Toolbar:** "معلم جديد" (creates a User with Teacher role, §4.43); "عرض الحمل الدراسي" (teaching-load report link).

**Filters / Search / Sorting:** Filter by Status, by Subject taught; search by name; sort by name or teaching load.

**Bulk Actions:** None.

**Keyboard Shortcuts:** `Ctrl+N` new teacher.

**Validation Rules:** N/A at list level.

**Empty State:** "لا يوجد معلمون مسجلون بعد" (relevant mainly once multi-teacher/Tutoring Center business type is active [BRS §3.1]).

**Loading State:** Skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner only manages; Teacher sees own row only, read-only.

**Confirmation Dialogs:** Marking a teacher Inactive (departure) shows confirmation and surfaces any groups still assigned to them, requiring reassignment first or explicit acknowledgment [ETBS-030].

**Success / Warning Messages:** "تم تحديث حالة المعلم."

**Navigation:** From sidebar "الموظفون" filtered to Teacher role; from a Group's teacher field.

**Referenced Business Rules / ETBS Scenarios:** [BRS §3.7, §9.4]; [ETBS-028] through [ETBS-030], [ETBS-103].

---

### 4.9 Teacher Profile

**Purpose:** View one teacher's assignments, schedule, and payroll basis.

**Fields (tabs):** Overview (contact info, status) · Assigned Groups (with weekly schedule) · Payroll (basis, rate, history — links to §4.34) · Substitutions Delivered (sessions covered for other teachers, [ETBS-028]).

**Buttons / Toolbar:** "تعديل"; "تعيين إلى مجموعة"; "عرض كشف الراتب."

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Esc` back to list.

**Validation Rules:** Payroll basis selection required before the teacher can be included in a payroll run [BRS §9.4].

**Empty State:** A newly created teacher with no group assignments shows "لم يتم تعيين أي مجموعة بعد."

**Loading State:** Tab-lazy skeletons.

**Error State:** Inline retry.

**Permissions:** Owner full edit; Teacher (self) read-only.

**Confirmation Dialogs:** Reassigning a teacher's group mid-cycle prompts confirmation noting payroll and student-notification implications [ETBS-010].

**Success / Warning Messages:** "تم حفظ التغييرات."

**Navigation:** From Teacher List; from Group Profile teacher field.

**Referenced Business Rules / ETBS Scenarios:** [BRS §3.7, §9.4]; [ETBS-028], [ETBS-030].

---

### 4.10 Group List

**Purpose:** Registry of all groups across subjects, teachers, and statuses.

**Fields (columns):** Name · Subject · Teacher · Schedule (days/time) · Capacity (enrolled/max, with visual fill indicator) · Pricing Model · Status (Planned/Active/Full/Closed).

**Buttons / Toolbar:** "مجموعة جديدة" (§4.12); "عرض الجدول الأسبوعي" (§4.13).

**Filters / Search / Sorting:** Filter by Status, Subject, Teacher (combinable) [BRS §14.2]; search by group name; sort by name or occupancy %.

**Bulk Actions:** Bulk-archive underperforming/ended groups; shows count confirmation.

**Keyboard Shortcuts:** `Ctrl+N` new group.

**Validation Rules:** N/A at list level.

**Empty State:** "لا توجد مجموعات بعد."

**Loading State:** Skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner full; Secretary read/write schedule only; Teacher read + close own; Assistant/Accountant read-only.

**Confirmation Dialogs:** Archiving a group with active enrollments requires explicit confirmation and blocks outright deletion, directing to Archive instead [BRS §14.5, ETBS-078].

**Success / Warning Messages:** A visible "متجاوز السعة" (over capacity) badge on any group currently overridden past its stated capacity [ETBS-012].

**Navigation:** From sidebar "المجموعات"; from Student enrollment flow's group picker.

**Referenced Business Rules / ETBS Scenarios:** [BRS §5] in full; [ETBS-011] through [ETBS-035].

---

### 4.11 Group Profile

**Purpose:** The single comprehensive view of one group — roster, schedule, pricing, and history.

**Fields (tabs):** Overview (subject, teacher, room, capacity, status, pricing model + calculation method) · Roster (enrolled students with individual price/override visibility, per [BRS §5.10]) · Schedule (weekly recurring pattern + upcoming/past sessions) · Financials (revenue projection, overrides applied) · History (past enrollments, transfers in/out, price-change log per [ETBS-054]).

**Buttons / Toolbar:** "تعديل"; "إضافة طالب" (enroll, §5.2); "نقل مجموعة من طلاب" (bulk transfer, [ETBS-031]); "إغلاق/أرشفة"; "عرض السجل الأسبوعي."

**Filters / Search / Sorting:** Roster tab: search/filter by student status within the group.

**Bulk Actions:** Bulk transfer of multiple students out of this group (merge scenario, [ETBS-031]) — shows affected count and requires per-student reconciliation review before confirming [BRS Rule FIN-001 — bulk adjustments still need individually linked reasoning].

**Keyboard Shortcuts:** `Esc` back to list.

**Validation Rules:** Capacity check on every new enrollment attempt, hard or soft per [BRS Rule GRP-001]; a scholarship/override student is always visibly flagged distinct from standard-price students, never blended into the group's displayed "standard price" [BRS §5.10].

**Empty State:** A newly created (Planned) group shows an empty roster with "لم يتم تسجيل أي طالب بعد — المجموعة في وضع التخطيط."

**Loading State:** Tab-lazy skeletons.

**Error State:** Inline retry per tab.

**Permissions:** Owner full; Secretary schedule-only write; Teacher read + close own sessions.

**Confirmation Dialogs:** Capacity override (manager approval) [ETBS-012]; group archive with active roster [BRS §14.5].

**Success / Warning Messages:** "تم تحديث المجموعة"; a persistent notice on the Overview tab if this group deviates from global defaults (e.g., custom billing cycle), per [BRS §5.10]'s traceability requirement — "why does this group's policy differ."

**Navigation:** From Group List; from a Student's Enrollments tab.

**Referenced Business Rules / ETBS Scenarios:** [BRS §5] in full, Rules GRP-001/GRP-002; [ETBS-009] through [ETBS-012], [ETBS-031], [ETBS-054], [ETBS-057].

---

### 4.12 New / Edit Group Form

**Purpose:** Configure a group's identity, pricing, and policy overrides.

**Fields:**

| Field | Type | Required/Optional | Notes |
|---|---|---|---|
| Name | Text | **Required** | |
| Subject | Select | **Required** | |
| Teacher | Select | Optional (can be assigned later) | |
| Classroom | Text/Select | Optional | |
| Capacity | Number | **Required** | 0 = unlimited |
| Capacity Enforcement | Select (Hard/Soft/None) | **Required** | Default per Business Type [BRS Rule GRP-001] |
| Pricing Model | Select (Monthly/Per-Session/Course/Custom) | **Required** | |
| Price | Money (minor units) | **Required** unless Custom | |
| Monthly Calculation Method | Select (Calendar/Session-count/Custom cycle) | **Required** if Monthly | [BRS Rule BIL-003] |
| Absence Charging Policy | Select (Always/Never/Unless Excused) | Optional (inherits global default) | [BRS Rule BIL-001] |
| Attendance Policy Overrides | Section (grace period, editing window) | Optional (inherits global default) | [BRS §3.2] |
| Group Type | Select (Regular/Subgroup/Review/Exam/Temporary/Special) | **Required** | [BRS §5.4–5.8] |
| Start/End Date | Date range | Required if Temporary | [BRS §5.7] |
| Status | Select | **Required** | Defaults to Planned |

**Buttons / Toolbar:** "حفظ"; "حفظ وإضافة طلاب"; "إلغاء".

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+S` save.

**Validation Rules:** Capacity must be ≥ current roster size if editing an existing group downward. Price required and must be a non-negative integer minor-unit value (never a float, [PRD §22]). Temporary group type requires both start and end dates, with end date after start. Overriding any global default visibly flags the field as "مخصص" (customized) per [BRS §5.10].

**Empty State:** N/A (form).

**Loading State:** Save button spinner.

**Error State:** Inline field errors; top-of-form banner for save failures.

**Permissions:** Owner only (Secretary can edit schedule fields only via a reduced-field variant of this form).

**Confirmation Dialogs:** Reducing capacity below the current roster size is blocked with an explanatory inline error, not a silent clamp.

**Success / Warning Messages:** "تم إنشاء المجموعة بنجاح."

**Navigation:** From Group List "مجموعة جديدة"; from Group Profile "تعديل."

**Referenced Business Rules / ETBS Scenarios:** [BRS §5] in full, Rules GRP-001, BIL-001, BIL-003; [ETBS-011], [ETBS-033] through [ETBS-035].

---

### 4.13 Weekly Schedule Grid

**Purpose:** Visualize and manage all groups' recurring weekly time slots at once, surfacing conflicts.

**Fields:** Grid of Day × Time, each cell showing group name/teacher/room for that slot.

**Buttons / Toolbar:** "إضافة موعد"; "تعديل الجدول"; toggle between Week/Room/Teacher views.

**Filters / Search / Sorting:** Filter by Teacher, Room, Subject.

**Bulk Actions:** None.

**Keyboard Shortcuts:** Arrow-key navigation between cells.

**Validation Rules:** Warns (does not block) on a double-booked teacher or room at the same day/time — a genuine scheduling conflict must be visible, not silently allowed to look fine.

**Empty State:** Empty grid with "لا توجد مواعيد مجدولة" and an "إضافة موعد" prompt.

**Loading State:** Skeleton grid.

**Error State:** Inline retry.

**Permissions:** Owner/Secretary.

**Confirmation Dialogs:** Confirms before saving a change that affects an already-enrolled group's students (schedule change), since it triggers a notification per [BRS §10.1].

**Success / Warning Messages:** Inline conflict warning ("تعارض في الجدول") shown next to overlapping cells.

**Navigation:** From sidebar "المجموعات" → "الجدول الأسبوعي"; from Group Profile Schedule tab.

**Referenced Business Rules / ETBS Scenarios:** [PRD §9]; [ETBS-020], [ETBS-071].


---

### 4.14 Today's Sessions

**Purpose:** Operational hub for "what's happening today" — the most-visited screen for teachers and assistants day-to-day.

**Fields (list):** Time · Group · Teacher · Room · Status (Scheduled/Completed/Cancelled/Rescheduled) · Attendance progress (marked / total).

**Buttons / Toolbar:** "بدء الحضور" per session (jumps into §4.18/4.19/4.20); "إلغاء الحصة"; "إعادة جدولة."

**Filters / Search / Sorting:** Filter by Teacher, Room; default sort by start time ascending.

**Bulk Actions:** "إلغاء عدة حصص" (e.g., holiday bulk-cancel, [ETBS-066]) — shows count of affected sessions/groups and a single batched notification confirmation.

**Keyboard Shortcuts:** `↑/↓` session navigation; `Enter` opens attendance for the selected session.

**Validation Rules:** Cancelling requires a reason category (Teacher unavailable / Holiday / Force majeure / Other) per [BRS §6.2] — the reason drives different downstream billing/make-up handling.

**Empty State:** "لا توجد حصص مجدولة اليوم."

**Loading State:** Skeleton rows.

**Error State:** Inline retry; does not block other dashboard widgets.

**Permissions:** Owner/Teacher(own)/Assistant/Secretary.

**Confirmation Dialogs:** Cancel (single or bulk) always confirms and states the make-up-entitlement consequence [BRS Rule BIL-002] before proceeding.

**Success / Warning Messages:** "تم إلغاء الحصة، سيتم إشعار أولياء الأمور"; a banner naming any session that started >15 minutes ago with zero attendance marked yet, prompting action.

**Navigation:** From sidebar "الحصص" → "حصص اليوم"; from Dashboard.

**Referenced Business Rules / ETBS Scenarios:** [BRS §6.2, §6.3, Rule BIL-002]; [ETBS-019] through [ETBS-021], [ETBS-066], [ETBS-073].

---

### 4.15 Session Calendar

**Purpose:** Month/week calendar view of all scheduled, completed, and cancelled sessions across groups.

**Fields:** Calendar grid with session chips (color-coded by status, not by subject — status is the operationally relevant dimension).

**Buttons / Toolbar:** Month/Week/Day view toggle; "إضافة حصة إضافية" (extra/review/exam session, [BRS §6.1]).

**Filters / Search / Sorting:** Filter by Group, Teacher, Session Type.

**Bulk Actions:** Drag-select a date range to bulk-cancel (e.g., Ramadan/exam-period pause, [ETBS-067], [ETBS-071]).

**Keyboard Shortcuts:** `←/→` navigate periods; `T` jump to today.

**Validation Rules:** Creating a Rescheduled session must link back to the original cancelled slot so reporting doesn't double-count [BRS §6.2].

**Empty State:** Empty calendar with an "إضافة حصة" prompt.

**Loading State:** Skeleton calendar cells.

**Error State:** Inline retry.

**Permissions:** Owner/Secretary full; Teacher sees own groups only.

**Confirmation Dialogs:** Bulk date-range cancellation confirms with total session/group/student count affected.

**Success / Warning Messages:** "تم جدولة الحصة الإضافية."

**Navigation:** From sidebar "الحصص" → "التقويم."

**Referenced Business Rules / ETBS Scenarios:** [BRS §6.1, §6.2]; [ETBS-020], [ETBS-021], [ETBS-034], [ETBS-066] through [ETBS-074].

---

### 4.16 Session Detail

**Purpose:** Single-session operational and historical record.

**Fields:** Group · Scheduled Start/End · Actual Start (if recorded late, per Rule ATT-002 Future Consideration) · Status · Session Type (Regular/Make-up/Extra/Review/Exam) · Notes · Attendance summary (Present/Late/Absent/Excused counts) · Linked Original Session (if Rescheduled/Make-up) · Actual Deliverer (if Substitute, [ETBS-028]).

**Buttons / Toolbar:** "بدء/فتح الحضور"; "إنهاء الحصة" (mark Completed → triggers locking [BRS Rule ATT-001]); "إلغاء"; "إعادة جدولة"; "تعيين معلم بديل."

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `P/A/L/E` shortcuts active within the embedded attendance grid.

**Validation Rules:** Cannot mark Completed with zero attendance recorded without an explicit "تأكيد عدم وجود حضور" confirmation (guards against the ATT-001 Edge Case of a forgotten session).

**Empty State:** N/A (a session always has its scheduled metadata).

**Loading State:** Skeleton.

**Error State:** Inline retry.

**Permissions:** Owner/Teacher(own)/Assistant (attendance only)/Secretary.

**Confirmation Dialogs:** Marking Completed with a locking consequence; reopening a locked session (routes to §4.21).

**Success / Warning Messages:** "تم قفل بيانات الحضور لهذه الحصة" on completion/lock.

**Navigation:** From Today's Sessions, Session Calendar, or Group Profile Schedule tab.

**Referenced Business Rules / ETBS Scenarios:** [BRS §6, §7.4, §7.5, Rule ATT-001]; [ETBS-028], [ETBS-046].

---

### 4.17 Recurring Schedule Builder

**Purpose:** Define a group's weekly recurring pattern, generating future `ClassSession` instances.

**Fields:** Weekday(s) selector · Start Time · End Time · Recurrence End Condition (ongoing / until a specific date / after N occurrences).

**Buttons / Toolbar:** "إنشاء الحصص"; "معاينة" (preview generated sessions before committing).

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A (this screen itself is inherently a bulk-generation action).

**Keyboard Shortcuts:** `Ctrl+S` save.

**Validation Rules:** End time must be after start time; at least one weekday selected; warns (does not block) on conflicts with existing schedules for the same teacher/room, per §4.13's conflict logic.

**Empty State:** N/A.

**Loading State:** "جارٍ إنشاء الحصص..." progress indicator while sessions generate in bulk.

**Error State:** Partial-failure state (e.g., 40 of 52 sessions created before an error) must clearly report which succeeded and allow retry of the remainder, never silently leaving a partial, unexplained set.

**Permissions:** Owner/Secretary.

**Confirmation Dialogs:** Confirms total session count to be generated before committing.

**Success / Warning Messages:** "تم إنشاء 52 حصة بنجاح."

**Navigation:** From Group Profile "الجدول" tab, on group creation.

**Referenced Business Rules / ETBS Scenarios:** [PRD §8.2, §10.1]; [ETBS-005] (regular pattern baseline).

---

### 4.18 Attendance Grid — Manual

**Purpose:** Roster-based manual attendance entry, the universal fallback method [BRS §7.1].

**Fields:** Student rows with Present/Absent/Late/Excused status controls; per-row note field for Excused reason.

**Buttons / Toolbar:** "تحديد الكل حاضر" (bulk-mark, e.g. for retroactive paper-attendance digitization, [BRS §7.8]); "حفظ."

**Filters / Search / Sorting:** Search box to jump to a specific student within a large roster.

**Bulk Actions:** "تحديد الكل حاضر" — requires explicit confirmation before applying, per [BRS §7.8 and Rule UI-001], given how easily bulk actions mask real errors.

**Keyboard Shortcuts:** `P/A/L/E` mark status for the focused row; `↑/↓` move between students [PRD §8.3].

**Validation Rules:** A scan/mark after the configured grace period auto-classifies as Late rather than Present, without requiring manual reclassification [BRS Rule ATT-002]. Duplicate marks for the same student/session are prevented at the data layer (`@@unique([classSessionId, studentId])`, [PRD §13.3]) — the UI simply updates the existing mark rather than creating a second record.

**Empty State:** "لا يوجد طلاب في هذه المجموعة" (should not normally occur for an active session).

**Loading State:** Skeleton roster rows.

**Error State:** If auto-save of a single mark fails, that row shows a small inline error/retry icon without blocking marking of other students.

**Permissions:** Owner/Teacher/Assistant/Secretary.

**Confirmation Dialogs:** "تحديد الكل حاضر" bulk action.

**Success / Warning Messages:** Each mark auto-saves with a subtle inline confirmation (no full-screen toast per mark, to avoid interrupting rapid entry); a session-level "تم الحفظ" indicator once all rows are marked.

**Navigation:** From Session Detail "بدء الحضور"; from Today's Sessions.

**Referenced Business Rules / ETBS Scenarios:** [BRS §7.1, §7.2, §7.7, §7.8, Rule ATT-002]; [ETBS-005], [ETBS-006], [ETBS-036].

---

### 4.19 Attendance — Search

**Purpose:** Fast attendance marking for large groups without a visible roster, by typing a student's name.

**Fields:** Search input (name/phone, partial match); result list with inline status buttons.

**Buttons / Toolbar:** Status buttons appear inline next to each search result.

**Filters / Search / Sorting:** The search itself is the primary interaction; scoped to the current session's enrolled roster by default, with an option to search beyond it for the cross-group attendance case [ETBS-026].

**Bulk Actions:** None (this method is inherently one-at-a-time).

**Keyboard Shortcuts:** `Enter` marks the top match Present by default; number keys `1–4` select status for the matched result.

**Validation Rules:** Same duplicate-scan and late-grace-period rules as §4.18.

**Empty State:** "لا توجد نتائج" while typing an unmatched name.

**Loading State:** Instant, in-memory filter — no network loading state expected for a session roster already loaded.

**Error State:** Save failure shows inline retry per mark.

**Permissions:** Owner/Teacher/Assistant/Secretary.

**Confirmation Dialogs:** None (single-record actions).

**Success / Warning Messages:** Brief inline confirmation per mark ("تم تسجيل حضور [الاسم]").

**Navigation:** From Session Detail; selectable as the active attendance method alongside Manual/QR/USB.

**Referenced Business Rules / ETBS Scenarios:** [BRS §7.1, §14.1]; [ETBS-026].

---

### 4.20 Attendance — QR / USB Live View

**Purpose:** Real-time scan feed for the LAN-QR mobile companion and USB HID scanner methods.

**Fields:** Live-updating feed of scan events: Student photo/name, timestamp, resulting status (Present/Late), method icon (QR/USB).

**Buttons / Toolbar:** "إيقاف الجلسة" (end live scanning); pairing code display (for QR mobile) [PRD §11.4].

**Filters / Search / Sorting:** N/A (chronological feed).

**Bulk Actions:** None.

**Keyboard Shortcuts:** N/A (this screen is scan-driven, not keyboard-driven, though the USB scanner itself emulates keyboard input into a focus-trapped field [PRD §11.1]).

**Validation Rules:** Unknown QR code → visible error state ("الطالب غير معروف") [PRD §8.3]. Duplicate scan within a short window → silently ignored with a subtle, non-alarming confirmation, not treated as an error [BRS §7.6]. Session closed → scan blocked with an option to reopen if permitted [PRD §8.3].

**Empty State:** "في انتظار أول عملية مسح..." before any scan occurs.

**Loading State:** Connection-status indicator while the phone pairs over LAN [PRD §11.4].

**Error State:** "فشل الاتصال بالشبكة المحلية" if the LAN QR bridge server is unreachable, with a fallback prompt directing staff to Manual/Search entry — attendance must never be blocked by this failure [PRD §5, Risks].

**Permissions:** Owner/Teacher/Assistant/Secretary.

**Confirmation Dialogs:** None (each scan is a fast, low-friction, individually reversible action via the underlying grid).

**Success / Warning Messages:** Sound + visual confirmation per successful scan [PRD §10.3]; a distinct anomaly flag (not blocking) if the same card/QR is scanned from what appears to be two different physical entry points within an implausible timeframe [BRS §7.6, ETBS-043].

**Navigation:** From Session Detail; phone opens the paired local URL directly [PRD §10.3].

**Referenced Business Rules / ETBS Scenarios:** [BRS §7.1, §7.3, §7.6]; [ETBS-037], [ETBS-038], [ETBS-042], [ETBS-043], [ETBS-050].

---

### 4.21 Attendance History / Reopen

**Purpose:** View and, with permission, correct locked attendance records.

**Fields:** Per-session, per-student attendance record with lock status, last-modified actor/timestamp, method used.

**Buttons / Toolbar:** "إعادة فتح" (Reopen, permission-gated); "تصحيح."

**Filters / Search / Sorting:** Filter by date range, by student, by "معدّل" (edited) records only.

**Bulk Actions:** None (corrections are inherently individual, traceable actions).

**Keyboard Shortcuts:** N/A.

**Validation Rules:** Reopening requires a reason [BRS §7.5]. A correction that affects an already-issued invoice does not silently edit that invoice; it creates a linked Financial Adjustment instead [BRS §7.5, §8.18, Rule BIL-004].

**Empty State:** N/A (history always reflects what happened, even if empty of edits).

**Loading State:** Skeleton table.

**Error State:** Inline retry.

**Permissions:** Owner full; Teacher can reopen only their own session's records (if Teacher Policy allows); Secretary per policy; Assistant/Accountant no access.

**Confirmation Dialogs:** Reopen action always confirms and requires the reason field before submission [BRS §7.5, Rule UI-001-adjacent].

**Success / Warning Messages:** "تم إعادة فتح السجل، يرجى إجراء التصحيح ثم الحفظ"; on re-lock: "تم حفظ التصحيح وإعادة القفل" plus a note if a Financial Adjustment was generated as a consequence.

**Navigation:** From Student Profile Attendance tab; from Session Detail.

**Referenced Business Rules / ETBS Scenarios:** [BRS §7.5, §8.18, Rule BIL-004]; [ETBS-047], [ETBS-048], [ETBS-080].


---

### 4.22 Invoice List

**Purpose:** All invoices across all students, the primary billing operations screen.

**Fields (columns):** Invoice Number · Student · Issue Date · Due Date · Total · Paid · Status (Draft/Issued/Partially Paid/Paid/Overdue/Void/Written Off) · Group/Enrollment.

**Buttons / Toolbar:** "فاتورة جديدة" (§4.24); "تشغيل الفوترة التلقائية" (manual trigger of the auto-generation job, if Automation Policy = Suggested/Manual).

**Filters / Search / Sorting:** Filter by Status (combinable), Date Range, Group, Student [BRS §14.2]; search by invoice number or student name; sort by date (default: most recent first) or by amount [BRS §14.3].

**Bulk Actions:** "إرسال تذكير للجميع" (send payment reminder to all filtered overdue invoices) — shows exact count and states it reflects the current filter, per Rule UI-001 and its filtered-scope edge case.

**Keyboard Shortcuts:** `Ctrl+N` new manual invoice.

**Validation Rules:** N/A at list level.

**Empty State:** "لا توجد فواتير بعد."

**Loading State:** Virtualized skeleton rows (must paginate/virtualize beyond ~50 records [BRS §14.10]).

**Error State:** Inline retry.

**Permissions:** Owner/Secretary full; Accountant read-only; Teacher no access.

**Confirmation Dialogs:** Bulk reminder send; Void action.

**Success / Warning Messages:** "تم إرسال 23 تذكيرًا" per Rule UI-001's exact example.

**Navigation:** From sidebar "المالية" → "الفواتير والمدفوعات"; from Student Profile Payments tab.

**Referenced Business Rules / ETBS Scenarios:** [BRS §8] in full; [ETBS-051] through [ETBS-065].

---

### 4.23 Invoice Detail

**Purpose:** View one invoice's line items, allocations, and adjustment history — the authoritative, immutable-once-issued record.

**Fields:** Invoice Number · Student · Issue/Due Date · Period (start/end, if applicable) · Line Items (description, quantity, unit price, total) · Total · Paid · Balance · Status · Linked Payments/Allocations · Linked Financial Adjustments (each with reason and actor, [BRS Rule FIN-001]).

**Buttons / Toolbar:** "تسجيل دفعة" (§4.26, pre-scoped to this invoice); "إنشاء تسوية مالية" (Financial Adjustment, only path for correcting an Issued invoice, [BRS Rule BIL-004]); "طباعة"; "إلغاء" (Void, pre-payment only); "شطب" (Write Off).

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+P` print.

**Validation Rules:** Once Issued, line items and total are permanently read-only in this screen — the only mutation path is a new, separately visible Financial Adjustment record referencing this invoice [BRS Rule BIL-004, FIN-001]. Void is only permitted pre-payment; an invoice with any payment applied must be Written Off instead, never Voided, preserving the payment trail.

**Empty State:** N/A (an invoice always has at least one line item).

**Loading State:** Skeleton.

**Error State:** Inline retry.

**Permissions:** Owner/Secretary write (adjustment/void/write-off); Accountant read-only.

**Confirmation Dialogs:** Void, Write Off, and any Financial Adjustment above the approval threshold [BRS §3.8] all require confirmation; the adjustment form itself requires a reason field before it can be submitted [BRS Rule FIN-001].

**Success / Warning Messages:** "تم إصدار الفاتورة"; "تم إنشاء تسوية مالية بقيمة [X] مرتبطة بهذه الفاتورة" — always naming both the amount and the link, never a silent balance change.

**Navigation:** From Invoice List; from Student Profile Payments tab; from Payment Detail's allocation link.

**Referenced Business Rules / ETBS Scenarios:** [BRS §8.15, §8.16, §8.18, Rules BIL-004, FIN-001]; [ETBS-047], [ETBS-059], [ETBS-080].

---

### 4.24 New / Manual Invoice Form

**Purpose:** Create an invoice outside the automatic generation flow (e.g., a custom/one-off charge, a course package, [ETBS-093]).

**Fields:**

| Field | Type | Required/Optional | Notes |
|---|---|---|---|
| Student | Picker | **Required** | |
| Line Items | Repeatable (description, qty, unit price) | **Required**, min 1 | |
| Due Date | Date | Optional | |
| Period Start/End | Date range | Optional | For monthly/course-linked invoices |
| Notes | Textarea | Optional | |

**Buttons / Toolbar:** "إضافة بند"; "حفظ كمسودة"; "إصدار الفاتورة."

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+S` save draft.

**Validation Rules:** At least one line item required; every unit price must be a non-negative integer minor-unit value [PRD §22]; total is calculated, never manually overridden without it being reflected as an explicit adjustment.

**Empty State:** N/A.

**Loading State:** Save/Issue button spinner.

**Error State:** Inline field errors; top-of-form banner for save failures.

**Permissions:** Owner/Secretary.

**Confirmation Dialogs:** "إصدار" (Issue) confirms, since issuing locks the invoice for direct editing thereafter [BRS Rule BIL-004].

**Success / Warning Messages:** "تم حفظ المسودة" / "تم إصدار الفاتورة رقم [N]."

**Navigation:** From Invoice List "فاتورة جديدة"; from Student Profile.

**Referenced Business Rules / ETBS Scenarios:** [BRS §8.1, §8.15]; [ETBS-058], [ETBS-093].

---

### 4.25 Payment List

**Purpose:** All payments received, across all students and methods.

**Fields (columns):** Date · Student · Amount · Method (Cash/Transfer/Wallet/Other) · Allocation Status (Fully Allocated/Partially Allocated/Unallocated Credit) · Received By.

**Buttons / Toolbar:** "تسجيل دفعة" (§4.26).

**Filters / Search / Sorting:** Filter by Method, Allocation Status, Date Range; search by student name; sort by date (default: most recent first).

**Bulk Actions:** None (each payment's allocation is inherently an individual, explicit action, [BRS §8.16]).

**Keyboard Shortcuts:** `Ctrl+N` new payment.

**Validation Rules:** N/A at list level.

**Empty State:** "لا توجد مدفوعات مسجلة بعد."

**Loading State:** Virtualized skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner/Secretary full; Accountant read-only.

**Confirmation Dialogs:** N/A at list level.

**Success / Warning Messages:** A visible badge on any payment sitting as an Unallocated Credit for longer than a configurable threshold, prompting staff follow-up [BRS §8.16, §8.7].

**Navigation:** From sidebar "المالية" → "الفواتير والمدفوعات" (Payments tab).

**Referenced Business Rules / ETBS Scenarios:** [BRS §8.6, §8.7, §8.16]; [ETBS-013] through [ETBS-015], [ETBS-060].

---

### 4.26 Record Payment Form

**Purpose:** Capture a payment received and route it into allocation.

**Fields:**

| Field | Type | Required/Optional | Notes |
|---|---|---|---|
| Student | Picker | **Required** | Pre-filled if opened from a Student/Invoice context |
| Amount | Money | **Required** | Integer minor units |
| Method | Select (Cash/Transfer/Wallet/Other) | **Required** | |
| Date | Date | **Required** | Defaults to today; editable for same-day backdated cash entry [ETBS-040] |
| Notes | Textarea | Optional | |

**Buttons / Toolbar:** "التالي: تخصيص الدفعة" (proceeds to §4.27); "حفظ كرصيد غير مخصص" (skip allocation, hold as credit).

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+S`.

**Validation Rules:** Amount must be > 0. The system auto-suggests allocation to the oldest open/partial invoice [PRD §10.5] but never auto-applies without confirmation on the following allocation screen.

**Empty State:** N/A.

**Loading State:** Button spinner.

**Error State:** Inline field errors.

**Permissions:** Owner/Secretary.

**Confirmation Dialogs:** None at this step (confirmation happens at allocation, §4.27).

**Success / Warning Messages:** N/A (this step transitions directly into allocation).

**Navigation:** From Payment List, Student Profile, or Invoice Detail (pre-scoped).

**Referenced Business Rules / ETBS Scenarios:** [BRS §8.6, §8.16]; [ETBS-003], [ETBS-004], [ETBS-014], [ETBS-040], [ETBS-060].

---

### 4.27 Payment Allocation Dialog

**Purpose:** Explicitly apply a received payment to one or more invoices — the screen that enforces "the system must never guess" [BRS §8.16].

**Fields:** List of the student's (or family's, if opened from Parent Profile) open/partial invoices with an editable "amount to allocate" per invoice; running "remaining unallocated" total.

**Buttons / Toolbar:** "توزيع تلقائي على الأقدم" (auto-suggest oldest-first, per [PRD §10.5]); "تأكيد التخصيص."

**Filters / Search / Sorting:** N/A (scoped list of open invoices only).

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+Enter` confirm.

**Validation Rules:** Sum of allocated amounts cannot exceed the payment total; any remainder is automatically routed to Unallocated Credit [BRS §8.7, §8.16], never silently discarded or forced to zero. Allocating across multiple students' invoices (family payment, [ETBS-013]) is supported explicitly, not inferred.

**Empty State:** If the student has no open invoices, the dialog defaults directly to "حفظ كرصيد غير مخصص" with an explanation.

**Loading State:** Spinner on confirm.

**Error State:** Inline error if allocation exceeds the payment amount, with the exact overage shown.

**Permissions:** Owner/Secretary.

**Confirmation Dialogs:** Final "تأكيد التخصيص" is itself the confirmation step; a secondary confirmation appears specifically when leaving any amount unallocated, so staff are aware a credit balance is being created rather than fully applied.

**Success / Warning Messages:** "تم تخصيص المبلغ بنجاح"; "تم تسجيل [X] كرصيد غير مخصص" when a remainder exists.

**Navigation:** Reached from Record Payment Form; can be re-opened later from Payment List to allocate a previously-held credit.

**Referenced Business Rules / ETBS Scenarios:** [BRS §8.7, §8.16]; [ETBS-013] through [ETBS-015], [ETBS-060].

---

### 4.28 Refund Form

**Purpose:** Return money already received, always linked to the original payment/invoice.

**Fields:** Original Payment/Invoice (picker, pre-filled if opened in context) · Refund Amount · Reason (**Required**, free text) · Approver (auto-populated if above threshold, [BRS §3.8]).

**Buttons / Toolbar:** "تقديم للموافقة" (if above threshold) / "تنفيذ الاسترداد" (if below).

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** N/A.

**Validation Rules:** Reason is mandatory — cannot submit without it [BRS §8.17]. Amount cannot exceed the original payment's remaining refundable value. Above the configured Financial Policy threshold, a second approver identity is required before execution (four-eyes principle) [BRS §3.8].

**Empty State:** N/A.

**Loading State:** Button spinner.

**Error State:** Inline validation errors (missing reason, amount exceeds limit).

**Permissions:** Owner/Accountant only [PRD §16].

**Confirmation Dialogs:** Always confirms before executing, restating the amount, reason, and the invoice/payment it reverses.

**Success / Warning Messages:** "تم تنفيذ الاسترداد وربطه بالدفعة الأصلية"; refunds are noted as reducing recognized revenue for the reporting period in which they occur [BRS §8.17], surfaced as an inline note on this confirmation.

**Navigation:** From Payment Detail, Invoice Detail, or Student Profile.

**Referenced Business Rules / ETBS Scenarios:** [BRS §8.17, §3.8]; [ETBS-015], [ETBS-017], [ETBS-062].

---

### 4.29 Expense List

**Purpose:** Registry of all outgoing costs.

**Fields (columns):** Date · Category · Amount · Notes · Attachment (icon if present) · Entered By.

**Buttons / Toolbar:** "مصروف جديد" (§4.30); "إدارة المصروفات المتكررة" (§4.31).

**Filters / Search / Sorting:** Filter by Category, Date Range; sort by date (default: most recent first) or amount.

**Bulk Actions:** None.

**Keyboard Shortcuts:** `Ctrl+N` new expense.

**Validation Rules:** N/A at list level.

**Empty State:** "لا توجد مصروفات مسجلة."

**Loading State:** Virtualized skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner/Secretary(write)/Accountant full; others no access.

**Confirmation Dialogs:** N/A at list level.

**Success / Warning Messages:** N/A.

**Navigation:** From sidebar "المالية" → "المصروفات."

**Referenced Business Rules / ETBS Scenarios:** [BRS §9.1, §9.6, §9.7]; [ETBS-063], [ETBS-082].

---

### 4.30 New / Edit Expense Form

**Purpose:** Record a single outgoing cost.

**Fields:**

| Field | Type | Required/Optional | Notes |
|---|---|---|---|
| Category | Select | **Required** | Salary/Rent/Utilities/Printing/Marketing/Other |
| Amount | Money | **Required** | |
| Date | Date | **Required** | Defaults to today; backdatable for same-day cash entry [ETBS-040] |
| Notes | Textarea | Optional | |
| Attachment | File upload | Optional | Documentation only, never authoritative over the structured amount [BRS §9.7] |

**Buttons / Toolbar:** "حفظ"; "حفظ كمصروف متكرر" (converts to a recurring template, §4.31).

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+S`.

**Validation Rules:** Amount must be > 0; Category required; a cash-method expense affects the Cashbox derived balance immediately on save [BRS §9.5].

**Empty State:** N/A.

**Loading State:** Button spinner.

**Error State:** Inline field errors.

**Permissions:** Owner/Secretary(write)/Accountant.

**Confirmation Dialogs:** None for a standard entry (low-risk, easily correctable via a Financial Adjustment if needed).

**Success / Warning Messages:** "تم تسجيل المصروف."

**Navigation:** From Expense List "مصروف جديد."

**Referenced Business Rules / ETBS Scenarios:** [BRS §9.1, §9.6, §9.7]; [ETBS-040], [ETBS-082].

---

### 4.31 Recurring Expense Template Manager

**Purpose:** Avoid manual re-entry of predictable recurring costs (e.g., monthly rent) while still generating an individually auditable record each occurrence [BRS §9.1].

**Fields:** Template Name · Category · Amount · Recurrence (monthly/custom interval) · Next Occurrence Date · Active toggle.

**Buttons / Toolbar:** "قالب جديد"; "إيقاف/تفعيل."

**Filters / Search / Sorting:** Sort by next occurrence date.

**Bulk Actions:** None.

**Keyboard Shortcuts:** `Ctrl+N` new template.

**Validation Rules:** Amount and category required, identical to a manual expense; each generated occurrence is still its own auditable Expense record, never a single recurring balance [BRS §9.1].

**Empty State:** "لا توجد قوالب متكررة."

**Loading State:** Skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner/Accountant.

**Confirmation Dialogs:** Deactivating a template confirms (does not delete past-generated expense records).

**Success / Warning Messages:** "تم إنشاء القالب، سيتم توليد مصروف تلقائيًا كل شهر."

**Navigation:** From Expense List "إدارة المصروفات المتكررة."

**Referenced Business Rules / ETBS Scenarios:** [BRS §9.1].

---

### 4.32 Cashbox Ledger View

**Purpose:** Read-only, derived running ledger of physical cash — never manually editable as a single number [BRS §9.5].

**Fields:** Chronological list of cash movements (payment received / expense paid), each with running balance; discrepancy-investigation entries if logged [ETBS-063].

**Buttons / Toolbar:** "بدء تسوية" (start a reconciliation count); "تسجيل فرق" (log a discrepancy adjustment, requires reason).

**Filters / Search / Sorting:** Filter by date range; sort chronological (default).

**Bulk Actions:** None.

**Keyboard Shortcuts:** N/A.

**Validation Rules:** The displayed balance is always a computed sum of entries — there is no field anywhere to directly type a new balance [BRS §9.5]. A discrepancy adjustment requires a reason and is itself a Financial Adjustment [BRS Rule FIN-001].

**Empty State:** "لا توجد حركات نقدية مسجلة بعد."

**Loading State:** Skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner/Accountant only.

**Confirmation Dialogs:** Logging a discrepancy always confirms and requires the reason field.

**Success / Warning Messages:** A visible warning if a reconciliation count doesn't match the computed balance, per [ETBS-063] — framed as "يتطلب تحقيق" (requires investigation), not an error to auto-correct.

**Navigation:** From sidebar "المالية" → "التدفق النقدي."

**Referenced Business Rules / ETBS Scenarios:** [BRS §9.5, Rule FIN-001]; [ETBS-063], [ETBS-082].

---

### 4.33 Payroll Run List

**Purpose:** View and initiate payroll periods.

**Fields (columns):** Period · Status (Draft/Finalized/Paid) · Total Staff Included · Total Amount.

**Buttons / Toolbar:** "تشغيل الرواتب" (start a new payroll run for a period).

**Filters / Search / Sorting:** Filter by Status; sort by period (most recent first).

**Bulk Actions:** None (each run is itself a batch operation, but its constituent per-staff calculations are individually visible, §4.34).

**Keyboard Shortcuts:** N/A.

**Validation Rules:** A payroll run reads only from locked attendance/session and finalized invoices/payments — it cannot be run against a period with still-unlocked, editable data [BRS §9.4].

**Empty State:** "لم يتم تشغيل أي رواتب بعد."

**Loading State:** Skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner/Accountant.

**Confirmation Dialogs:** Finalizing a payroll run confirms, since finalization is the point past which corrections require a Financial Adjustment against the *next* cycle rather than a retroactive edit [BRS §9.4].

**Success / Warning Messages:** "تم اعتماد رواتب هذا الشهر."

**Navigation:** From sidebar "المالية" → "الرواتب."

**Referenced Business Rules / ETBS Scenarios:** [BRS §9.4]; [ETBS-028], [ETBS-030], [ETBS-084].

---

### 4.34 Payroll Detail per Staff Member

**Purpose:** Breakdown of one staff member's calculated compensation for a period, traceable to underlying data.

**Fields:** Staff Name · Basis (Fixed/Per-Session/Per-Hour/Commission) · Calculation Breakdown (e.g., sessions delivered × rate, with each contributing session listed and linked) · Advances Deducted [ETBS-064] · Adjustments Applied [BRS §9.4] · Net Payable.

**Buttons / Toolbar:** "تسجيل الدفع"; "طباعة كشف الراتب" (payslip PDF); "تسجيل سلفة" (advance).

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+P` print payslip.

**Validation Rules:** Every line in the calculation must be traceable back to a specific locked session/attendance/invoice record [BRS §9.4] — this screen exists specifically to resolve disputes like [ETBS-084] with evidence, not assertion.

**Empty State:** N/A (a payroll detail is only opened once a run exists).

**Loading State:** Skeleton.

**Error State:** Inline retry.

**Permissions:** Owner/Accountant full; Teacher (self) read-only.

**Confirmation Dialogs:** Recording the payout confirms; disputed-and-corrected calculations show a clear adjustment note rather than silently changing the number.

**Success / Warning Messages:** "تم تسجيل صرف الراتب."

**Navigation:** From Payroll Run List; from Teacher Profile Payroll tab.

**Referenced Business Rules / ETBS Scenarios:** [BRS §9.4, Rule FIN-001]; [ETBS-028], [ETBS-030], [ETBS-064], [ETBS-084].

---

### 4.35 Salary Rule Configuration

**Purpose:** Set a staff member's payroll basis and rate.

**Fields:** Staff Member (picker) · Model (Fixed/Per-Session/Per-Hour/Commission) · Base Amount · Rate · Commission Percent (if applicable).

**Buttons / Toolbar:** "حفظ."

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+S`.

**Validation Rules:** Exactly one basis selected; rate/percent required for the selected basis only; changing a rate mid-cycle does not retroactively recalculate an already-finalized payroll period [BRS §9.4, same historical-preservation principle as billing].

**Empty State:** N/A.

**Loading State:** Button spinner.

**Error State:** Inline field errors.

**Permissions:** Owner/Accountant.

**Confirmation Dialogs:** Changing an existing rate confirms and states it applies from the next unfinalized period forward.

**Success / Warning Messages:** "تم تحديث أساس الراتب."

**Navigation:** From Teacher Profile Payroll tab; from Users module.

**Referenced Business Rules / ETBS Scenarios:** [BRS §3.7, §9.4]; [ETBS-030].


---

### 4.36 Notification Log

**Purpose:** Chronological, auditable record of every notification attempted.

**Fields (columns):** Date/Time · Event Type · Recipient · Channel · Status (Queued/Sent/Failed/Failed-Final) · Error (if any).

**Buttons / Toolbar:** "إعادة المحاولة" per failed entry.

**Filters / Search / Sorting:** Filter by Status, Channel, Event Type, Date Range; search by recipient; sort by date (default: most recent first).

**Bulk Actions:** "إعادة محاولة الكل" for filtered failed entries, with count confirmation.

**Keyboard Shortcuts:** N/A.

**Validation Rules:** N/A (read-mostly; retry is the only mutation).

**Empty State:** "لا توجد إشعارات مرسلة بعد."

**Loading State:** Virtualized skeleton rows.

**Error State:** Inline retry for the log itself failing to load (distinct from individual notification failures shown as data).

**Permissions:** Owner/Secretary/Teacher(own sends)/Assistant.

**Confirmation Dialogs:** Bulk retry.

**Success / Warning Messages:** A distinct "فشل نهائي" (Failed-Final) badge once max retry attempts are exhausted [BRS §10.6], clearly distinguished from a still-retrying "فشل" state.

**Navigation:** From sidebar "الإشعارات" → "السجل."

**Referenced Business Rules / ETBS Scenarios:** [BRS §10.5, §10.6]; general cross-cutting.

---

### 4.37 Template Manager

**Purpose:** Edit the wording of every notification type without a developer.

**Fields:** Template list (by Event Type) → Editor with Subject (if applicable) · Body (with variable placeholders, e.g. `{StudentName}`) · Channel (WhatsApp/SMS/Email/Internal) · Live preview pane substituting sample data.

**Buttons / Toolbar:** "حفظ"; "معاينة"; "استعادة الافتراضي."

**Filters / Search / Sorting:** Filter template list by Event Type or Channel.

**Bulk Actions:** None.

**Keyboard Shortcuts:** `Ctrl+S`.

**Validation Rules:** The system validates that all variables the template declares are actually available for that event type before allowing save — a template that would produce a literal, unfilled `{{amount}}` in production must be blocked at edit time, not discovered at send time [BRS §10.3].

**Empty State:** N/A (every event type ships with a default template).

**Loading State:** Skeleton editor.

**Error State:** Inline validation error naming the specific unresolvable variable.

**Permissions:** Owner/Secretary.

**Confirmation Dialogs:** "استعادة الافتراضي" confirms before discarding a custom template.

**Success / Warning Messages:** "تم حفظ القالب."

**Navigation:** From sidebar "الإشعارات" → "القوالب."

**Referenced Business Rules / ETBS Scenarios:** [BRS §10.2, §10.3, §10.7].

---

### 4.38 Manual / Broadcast Composer

**Purpose:** Send an ad hoc message to one or many guardians/students outside an automated trigger.

**Fields:** Recipient Selector (individual / filtered group, e.g. "all overdue," "all in Group X") · Template picker (optional starting point) · Message Body · Channel.

**Buttons / Toolbar:** "معاينة"; "إرسال."

**Filters / Search / Sorting:** Recipient selection reuses the same filter/search patterns as Student List (§4.2).

**Bulk Actions:** The send itself is the bulk action when multiple recipients are selected — shows exact recipient count before sending [BRS Rule UI-001].

**Keyboard Shortcuts:** N/A.

**Validation Rules:** Same variable-completeness check as §4.37 before send is enabled.

**Empty State:** N/A.

**Loading State:** "جارٍ الإرسال..." progress for a large broadcast.

**Error State:** Partial-failure reporting (e.g., "تم الإرسال إلى 45 من 50" with the 5 failures individually visible in the Notification Log).

**Permissions:** Owner/Secretary/Assistant/Teacher(own students).

**Confirmation Dialogs:** Always confirms before sending to more than one recipient, stating the exact count [BRS Rule UI-001].

**Success / Warning Messages:** "تم إرسال [N] رسالة بنجاح."

**Navigation:** From sidebar "الإشعارات"; from a filtered Student/Invoice list's "إرسال إشعار" bulk action.

**Referenced Business Rules / ETBS Scenarios:** [BRS §10.1, §10.3, Rule UI-001]; [ETBS-066] (holiday batch case).

---

### 4.39 Report Hub

**Purpose:** Central launch point for every report type.

**Fields:** Grid/list of report cards (Student, Attendance, Payment, Financial, Group, Exam, Homework, Employee, Monthly Rollup, Outstanding Balances, Inactive Students, Absence Statistics — per [BRS §13]).

**Buttons / Toolbar:** Each card opens its dedicated report viewer (§9).

**Filters / Search / Sorting:** Search reports by name.

**Bulk Actions:** None.

**Keyboard Shortcuts:** N/A.

**Validation Rules:** N/A.

**Empty State:** N/A (report list itself is static/configuration-driven, not data-driven).

**Loading State:** N/A.

**Error State:** N/A.

**Permissions:** Scoped per role — a Teacher sees only reports relevant to their own scope [PRD §16].

**Confirmation Dialogs:** None.

**Success / Warning Messages:** None.

**Navigation:** From sidebar "التقارير"; each card leads into §9's individual report specs.

**Referenced Business Rules / ETBS Scenarios:** [BRS §13] in full.

---

### 4.40 Settings Hub

**Purpose:** Central navigation to every configuration sub-section (detailed in §10 of this document).

**Fields:** Navigation list: Business Profile · Global Business Policies (Attendance/Billing/Notification/Student Status/Group Capacity/Teacher/Financial/Automation, [BRS §3]) · Notification Templates (links to §4.37) · Backup Schedule (links to §4.41) · Security (session-lock timeout, PIN policy).

**Buttons / Toolbar:** N/A (navigation only at hub level).

**Filters / Search / Sorting:** Search settings by name.

**Bulk Actions:** None.

**Keyboard Shortcuts:** N/A.

**Validation Rules:** N/A at hub level (validation lives per sub-section).

**Empty State:** N/A.

**Loading State:** N/A.

**Error State:** N/A.

**Permissions:** Owner only.

**Confirmation Dialogs:** None at hub level.

**Success / Warning Messages:** None at hub level.

**Navigation:** From sidebar "الإعدادات."

**Referenced Business Rules / ETBS Scenarios:** [BRS §3] in full; see §10 of this document for per-setting detail.

---

### 4.41 Backup & Restore Hub

**Purpose:** Run and manage database backups; restore from a prior backup.

**Fields:** Last Backup (timestamp, size) · Backup Schedule (frequency) · Backup History (list: date, size, kind — Manual/Scheduled/Pre-Restore) · Integrity Check Status (last run result).

**Buttons / Toolbar:** "نسخ احتياطي الآن"; "استعادة"; "تشغيل فحص السلامة الآن."

**Filters / Search / Sorting:** Sort backup history by date (default: most recent first).

**Bulk Actions:** None.

**Keyboard Shortcuts:** N/A.

**Validation Rules:** Restore requires selecting a specific backup file and passes it through integrity validation before the application restarts against it [PRD §10.7]. A pre-restore backup of the current (about-to-be-replaced) database is automatically taken first, per `BackupKind.PRE_RESTORE` [PRD §13.3].

**Empty State:** "لا توجد نسخ احتياطية بعد" prompting an immediate first backup.

**Loading State:** Progress indicator during backup/restore (these are not instant operations).

**Error State:** "فشلت عملية النسخ الاحتياطي" / "فشل التحقق من سلامة النسخة المحددة" — a failed integrity check on a restore candidate blocks the restore rather than proceeding with a possibly-corrupt file.

**Permissions:** Owner only.

**Confirmation Dialogs:** Restore requires an explicit, clearly-worded warning dialog (data since the backup will be lost) before proceeding [PRD §10.7, §17].

**Success / Warning Messages:** "تم إنشاء نسخة احتياطية بنجاح"; a persistent dashboard-level warning if the last backup exceeds the configured age threshold.

**Navigation:** From sidebar "النسخ الاحتياطي"; from Settings → Backup.

**Referenced Business Rules / ETBS Scenarios:** [PRD §10.7, §11.5, §17]; [ETBS-041], [ETBS-049].

---

### 4.42 User List (Staff)

**Purpose:** Administer every staff account.

**Fields (columns):** Photo · Full Name · Username · Role(s) · Status (Active/Inactive) · Last Login.

**Buttons / Toolbar:** "موظف جديد" (§4.43); "إدارة الأدوار والصلاحيات" (§4.44).

**Filters / Search / Sorting:** Filter by Role, Status; search by name/username; sort by name.

**Bulk Actions:** None.

**Keyboard Shortcuts:** `Ctrl+N` new user.

**Validation Rules:** N/A at list level.

**Empty State:** N/A (at least the Owner account always exists post-onboarding).

**Loading State:** Skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner only.

**Confirmation Dialogs:** Deactivating a user with active group assignments (if a Teacher) prompts the same reassignment check as §4.8.

**Success / Warning Messages:** "تم تحديث حالة المستخدم."

**Navigation:** From sidebar "الموظفون" → "الموظفون."

**Referenced Business Rules / ETBS Scenarios:** [PRD §16]; [ETBS-081].

---

### 4.43 New / Edit User Form

**Purpose:** Create or update a staff account and its role assignment.

**Fields:** Full Name (**Required**) · Username (**Required**, unique per tenant) · Password (**Required** on create) · PIN (Optional) · Role (**Required**, base or Custom) · Status.

**Buttons / Toolbar:** "حفظ"; "إعادة تعيين كلمة المرور."

**Filters / Search / Sorting:** N/A.

**Bulk Actions:** N/A.

**Keyboard Shortcuts:** `Ctrl+S`.

**Validation Rules:** Username uniqueness enforced per tenant [PRD §13.3]. Password strength requirements shown inline. Role selection required; if a Custom role is selected, its base-role origin and overrides are shown for confirmation before saving, per [PRD §16]'s cloneable-with-overrides model.

**Empty State:** N/A.

**Loading State:** Button spinner.

**Error State:** Inline field errors (e.g., "اسم المستخدم مستخدم بالفعل").

**Permissions:** Owner only.

**Confirmation Dialogs:** Password reset confirms before invalidating the current credential.

**Success / Warning Messages:** "تم إنشاء الحساب بنجاح."

**Navigation:** From User List "موظف جديد."

**Referenced Business Rules / ETBS Scenarios:** [PRD §16, §17].

---

### 4.44 Role & Permission Editor

**Purpose:** View base roles and manage Custom role clones with per-permission overrides.

**Fields:** Role Name · Base Role (if Custom) · Permission Matrix (checkbox grid per permission key, grouped by module, per [PRD §16] key groups).

**Buttons / Toolbar:** "استنساخ دور" (clone a base role into a new Custom role); "حفظ."

**Filters / Search / Sorting:** Filter permission matrix by module.

**Bulk Actions:** None.

**Keyboard Shortcuts:** `Ctrl+S`.

**Validation Rules:** The five base roles (Owner, Teacher, Assistant, Secretary, Accountant) cannot be deleted or renamed, only cloned [PRD §16, §2.1 of this document]. Any Custom role must remain visibly labeled with its base-role origin everywhere it appears in the UI, never presented as indistinguishable from a base role [§2.2 of this document].

**Empty State:** N/A (five base roles always exist).

**Loading State:** Skeleton matrix.

**Error State:** Inline retry.

**Permissions:** Owner only.

**Confirmation Dialogs:** Removing a permission from a role in active use confirms and states how many current staff members are affected.

**Success / Warning Messages:** "تم حفظ الصلاحيات."

**Navigation:** From sidebar "الموظفون" → "الأدوار"/"الصلاحيات."

**Referenced Business Rules / ETBS Scenarios:** [PRD §16]; [§2.1 of this document].

---

### 4.45 Audit Log Viewer

**Purpose:** Immutable, searchable record of every sensitive create/update/delete across the system.

**Fields (columns):** Timestamp · Actor · Action (Create/Update/Delete) · Entity Type · Entity Reference · Before/After (expandable JSON diff view).

**Buttons / Toolbar:** "تصدير" (for a regulatory/dispute request, [ETBS-094]).

**Filters / Search / Sorting:** Filter by Actor, Entity Type, Date Range (combinable); sort by timestamp (default: most recent first); must be paginated, never loaded in full [BRS §14.10].

**Bulk Actions:** None (the log itself is never bulk-modified — it is write-once).

**Keyboard Shortcuts:** N/A.

**Validation Rules:** N/A (read-only; no user-facing mutation is possible on this screen by design — entries are generated structurally by the repository decorator [PRD §11.3], never hand-entered).

**Empty State:** N/A in practice (any live system quickly accumulates entries); a brand-new tenant shows "لا توجد أحداث مسجلة بعد."

**Loading State:** Virtualized skeleton rows.

**Error State:** Inline retry.

**Permissions:** Owner/Accountant read-only. No role can edit or delete an entry.

**Confirmation Dialogs:** None (no mutating actions exist on this screen).

**Success / Warning Messages:** "تم تصدير السجل" on export.

**Navigation:** From sidebar "سجل التدقيق"; from any record's "عرض السجل" cross-reference (e.g., an Invoice's adjustment history links here filtered to that entity).

**Referenced Business Rules / ETBS Scenarios:** [BRS §9.9, §2.7]; [ETBS-080], [ETBS-084], [ETBS-094].


---

## 5. Workflow Specifications

Each workflow below is documented as a numbered, testable sequence of steps, with decision points and BRS/ETBS grounding made explicit. These are the canonical sequences QA should convert directly into test scripts.

### 5.1 Register Student

1. Staff opens Students → "طالب جديد," or is prompted mid-conversation via `Ctrl+N`.
2. **Decision point:** Is this possibly a returning family? Staff performs a search-before-create check (name/phone) directly from the form's guardian picker, per the "search before create" principle [ETBS-008].
   - If a matching record is found → staff opens Return After Absence (§5.9) instead of continuing registration.
   - If no match → continue.
3. Staff completes the New Student Form (§4.4): required fields per center configuration [BRS §4.1] (some centers require only name + phone at this stage).
4. If a duplicate phone number is detected → system shows a non-blocking warning [Rule STU-001]; staff confirms intent to proceed.
5. Staff saves. The student is created with status **Active** but **not yet enrolled** — registration alone never triggers billing [BRS §4.1].
6. **Optional immediate follow-on:** Staff selects "حفظ وتسجيل في مجموعة" to proceed directly into Enrollment (§5.2), or exits to the Student Profile.
7. System auto-generates a unique QR token [PRD §8.1]; card printing (§4.5) is offered but optional at this step.

**BRS/ETBS References:** [BRS §4.1, Rule STU-001]; [ETBS-001], [ETBS-008].

### 5.2 Enrollment

1. From a Student Profile or Group Profile, staff selects "تسجيل في مجموعة" / "إضافة طالب."
2. Staff selects the target Group.
3. **Decision point — Capacity check** [BRS Rule GRP-001]:
   - Hard limit + Full → enrollment blocked; staff is offered a waitlist or an alternate group.
   - Soft limit + Full → warning shown; staff may override with permission, logged as an explicit override action [ETBS-012].
   - Capacity available → proceed.
4. **Decision point — Timing:**
   - Start of cycle → standard full-cycle fee applies.
   - Mid-cycle → system calculates a prorated fee per the group's Monthly Calculation Method and the center's proration policy [BRS §4.2, §8.3, Rule STU-002]; if below the configured "counts as next cycle" threshold, treat as next-cycle enrollment instead [ETBS-002].
5. Staff confirms any price override (scholarship, negotiated rate) if applicable — visibly flagged, never blended into the standard price display [BRS §5.10].
6. Enrollment record created with a start date (and no end date, until closed).
7. Enrollment becomes Active; billing and attendance tracking begin from this record forward.

**BRS/ETBS References:** [BRS §4.2, §5.2, §5.10, §8.3, Rules GRP-001, STU-002]; [ETBS-001], [ETBS-002], [ETBS-011], [ETBS-012].

### 5.3 Schedule Session (Recurring)

1. From Group Profile → Schedule tab, staff opens the Recurring Schedule Builder (§4.17).
2. Staff defines weekday(s), start/end time, and a recurrence end condition.
3. System previews the sessions to be generated; staff reviews for schedule conflicts (warned, not blocked) [§4.13].
4. Staff confirms generation; system bulk-creates `ClassSession` records for the defined pattern.
5. Generated sessions appear on Today's Sessions / Session Calendar as they come due.

**BRS/ETBS References:** [PRD §8.2]; [ETBS-005].

### 5.4 Record Attendance (Any Method)

1. Staff opens a live Session (from Today's Sessions or Session Calendar) and selects an attendance method: Manual, Search, QR-Mobile, or QR/USB.
2. For each student: mark Present/Absent/Late/Excused (manual/search), or the student's code is scanned (QR/USB).
3. **Decision point — Timing check** [BRS Rule ATT-002]: if the mark/scan occurs after the group's configured grace period, the system auto-classifies as **Late** rather than Present, without staff intervention.
4. **Decision point — Duplicate check** [BRS §7.6]: a second scan for an already-marked student in the same session is ignored for attendance purposes; optionally logged as an anomaly if scans occur from implausibly different contexts [ETBS-043].
5. Each mark auto-saves individually (no batch "save" step required for manual/search entry, consistent with autosave rules for non-billing-critical, in-progress states [BRS §14.8] — though see step 7 below once locked).
6. Staff (or the system, via a configured buffer) marks the session **Completed**.
7. On Completed, attendance **locks** [BRS Rule ATT-001] — no further edits without the Reopening workflow (§5.5).

**BRS/ETBS References:** [BRS §7.1–7.8, Rules ATT-001, ATT-002]; [ETBS-005], [ETBS-006], [ETBS-036] through [ETBS-043].

### 5.5 Reopen Locked Attendance

1. Authorized staff (Owner, or Teacher on their own session, or Secretary per Teacher Policy) opens Attendance History (§4.21) for the affected session.
2. Staff selects "إعادة فتح" and **must** enter a reason [BRS §7.5].
3. System reopens the specific record(s); staff makes the correction.
4. **Decision point — Billing impact:** if the correction affects a per-session billing calculation and an invoice was already issued for the affected cycle, the system does **not** edit the existing invoice; it creates a linked Financial Adjustment instead [BRS §7.5, §8.18, Rule BIL-004].
5. Staff re-saves; the record re-locks; the reopen event (actor, reason, timestamp, before/after) is written to the Audit Log [BRS §9.9].

**BRS/ETBS References:** [BRS §7.5, §8.18, Rule BIL-004]; [ETBS-047], [ETBS-048], [ETBS-080].

### 5.6 Generate Invoice

1. Trigger: automatic (per Automation Policy [BRS §3.9]) at cycle start (in-advance) or end (in-arrears), or manual/draft per policy.
2. **Decision point — Overlapping billing state check** [BRS §8.14 Edge Case]: system checks the enrollment hasn't already been transferred, paused, or dropped mid-cycle in a way that would produce a duplicate or incorrect full-price invoice.
3. System calculates the base amount per the group's billing model and Monthly Calculation Method [BRS §8.1, §8.2].
4. System applies any active discounts, scholarships, and price overrides, in the center's configured/documented order [BRS §8.19, Open Question 16.5].
5. System applies the absence-charging policy result for the period, if per-session billing [BRS §8.13].
6. System applies any pending Credit balance [BRS §8.7].
7. **Decision point — Automation Policy:**
   - Automatic → invoice is issued directly.
   - Suggested → a Draft is created, pending staff confirmation.
   - Disabled → staff must create the invoice manually via §4.24.
8. Once Issued, the invoice's line items and total become immutable [BRS Rule BIL-004]; any future correction is a Financial Adjustment, never a direct edit.

**BRS/ETBS References:** [BRS §8.1–8.14, §8.19, Rules BIL-001 through BIL-004]; [ETBS-001] through [ETBS-004], [ETBS-051] through [ETBS-058].

### 5.7 Transfer Student

1. From Student Profile, staff selects "نقل" and chooses a target group.
2. **Decision point — Capacity:** same check as Enrollment step 3 (§5.2) for the target group.
3. **Decision point — Timing:**
   - At a cycle boundary → new price applies cleanly from the next cycle; no reconciliation needed.
   - Mid-cycle → system calculates a price reconciliation (credit or additional charge) comparing the value already paid under the old group's price to the value owed under the new group's price for the remaining period [BRS Rule GRP-002].
4. Staff reviews the calculated reconciliation; may waive a credit as goodwill if the new price is lower — this must be a visible, deliberate choice, not a forced refund [ETBS-009].
5. Old enrollment is closed (not deleted); new enrollment is created effective the transfer date; both remain visible in the student's Enrollments history [BRS §4.3].
6. Reason for transfer is recorded (schedule conflict, level mismatch, teacher complaint, administrative error, etc.) [ETBS-010, ETBS-083].

**BRS/ETBS References:** [BRS §4.3, Rule GRP-002]; [ETBS-009], [ETBS-010], [ETBS-031], [ETBS-083], [ETBS-098].

### 5.8 Pause Student

1. From Student Profile, staff selects "إيقاف مؤقت."
2. Staff optionally sets an expected return date.
3. Enrollment status changes to **Paused**; student is excluded from active attendance rosters; billing suspends for the pause duration [BRS §4.4].
4. **Decision point — Seat retention** [BRS §4.4, Open Question 16.6]: unless the center's policy explicitly reserves the seat, the group may fill it with another student while the original student is paused — this is surfaced as a visible decision point for staff at re-activation, never a silent conflict.
5. **Decision point — Return timing:**
   - Returns within the configured maximum pause window → enrollment reactivates, billing resumes from the return date.
   - Exceeds the window with no return → auto-transitions to **Inactive** per Student Status Policy [BRS §3.5, §4.5].

**BRS/ETBS References:** [BRS §4.4, §3.5]; [ETBS-071] (bulk/extended pause case).

### 5.9 Return After Absence

1. Family re-contacts the center; staff performs a search (name/phone) **before** creating any new record — this is the single highest-leverage step for preventing data fragmentation [ETBS-008].
2. **Decision point — Record found?**
   - Yes → staff reopens/relinks the existing student profile.
   - No → staff is flagged for manual review before creating a new profile, minimizing accidental duplication.
3. Staff creates a new Enrollment in the current, applicable group (which may differ from the student's original group if that no longer exists).
4. **Decision point — Outstanding balance:** if the student had an unresolved balance from before their absence, it is surfaced explicitly for a staff/owner decision — never hidden, never automatically written off, and never automatically re-charged without a decision [BRS §4.7].
5. **Decision point — Re-registration fee:** per policy, apply or exempt per [BRS Open Question 16.10].
6. New enrollment proceeds through standard Enrollment (§5.2) mechanics from this point.

**BRS/ETBS References:** [BRS §4.7, Open Questions 16.9–16.10]; [ETBS-008], [ETBS-076].

### 5.10 Create Expense

1. Staff opens Expenses → "مصروف جديد" (§4.30).
2. Staff selects category, enters amount and date, optionally attaches a receipt image.
3. **Decision point — Cash method:** if this expense was paid in cash, it is immediately reflected in the Cashbox's derived running balance [BRS §9.5].
4. Staff saves; the record is immutable except via a Financial Adjustment [BRS Rule FIN-001], and is timestamped with both "collected/spent at" and "entered at" if backdated [ETBS-040].
5. **Optional:** staff converts this entry into a Recurring Expense Template (§4.31) to avoid manual re-entry next period, while each future occurrence still generates its own individually auditable record.

**BRS/ETBS References:** [BRS §9.1, §9.5–9.7]; [ETBS-040], [ETBS-063], [ETBS-082].

### 5.11 Run Payroll

1. Owner/Accountant opens Payroll Run List → "تشغيل الرواتب" for a period.
2. System reads **only** from locked attendance/session records and finalized invoices/payments for that period [BRS §9.4] — data that could still change is explicitly excluded from the calculation.
3. Per staff member, system calculates compensation per their configured basis (Fixed/Per-Session/Per-Hour/Commission) [BRS §3.7, §9.4], deducting any recorded advances [ETBS-064].
4. Owner/Accountant reviews the per-staff breakdown (§4.34), each line traceable to specific underlying records.
5. **Decision point — Dispute during review:** if a teacher disputes a figure before finalization, the underlying attribution (e.g., a substitute-covered session, [ETBS-028]) is corrected at the source before finalizing, not patched after the fact.
6. Owner/Accountant finalizes the run; payslips are generated (PDF).
7. **Post-finalization correction:** any error discovered after finalization is handled as a Financial Adjustment against the **next** payroll cycle, never a retroactive edit to the finalized run [BRS §9.4].

**BRS/ETBS References:** [BRS §3.7, §9.4, Rule FIN-001]; [ETBS-028], [ETBS-030], [ETBS-064], [ETBS-084].

### 5.12 Backup Database

1. Staff (Owner) opens Backup & Restore Hub → "نسخ احتياطي الآن," or the configured schedule triggers automatically.
2. System checkpoints the WAL-mode SQLite database and writes a timestamped backup file to the configured location [PRD §11.5].
3. A `BackupRecord` (kind: Manual or Scheduled) is created [PRD §13.3].
4. Confirmation is shown; the dashboard's "last backup age" indicator updates.

**BRS/ETBS References:** [PRD §10.7, §11.5]; [ETBS-041], [ETBS-049].

### 5.13 Restore Database

1. Owner opens Backup & Restore Hub → "استعادة" and selects a backup file.
2. System shows an explicit, clearly-worded warning: all data recorded since that backup will be lost [PRD §10.7].
3. Owner confirms.
4. System automatically takes a **Pre-Restore** backup of the current database first (`BackupKind.PRE_RESTORE`) [PRD §13.3] — this is a safety net that must never be skipped, even under time pressure.
5. System validates the selected backup file's integrity before proceeding; a failed validation blocks the restore outright rather than proceeding with a possibly-corrupt file.
6. Application restarts against the restored database.
7. **Decision point — Data gap:** if a gap exists between the restored backup and the incident that necessitated restoration, staff reconstruct it manually from any paper fallback or recollection, as a documented, accepted limitation rather than a system failure [ETBS-049].

**BRS/ETBS References:** [PRD §10.7, §17]; [ETBS-041], [ETBS-049].


---

## 6. Validation Rules

This section consolidates every validation referenced across §4/§5 into a single lookup table, organized by domain. Each row states the rule, when it fires, and whether it blocks or merely warns — the block/warn distinction matters enormously in this product, since several BRS rules (e.g., duplicate registration) are deliberately warn-only.

| # | Domain | Rule | Trigger | Block or Warn | Reference |
|---|---|---|---|---|---|
| V-01 | Student | Full Name required, min 2 characters | Student save | Block | [PRD §8.1] |
| V-02 | Student | Phone format (Egyptian mobile pattern) | Phone field entry, if provided | Block (inline, field-level) | [PRD §15] |
| V-03 | Student | Duplicate phone number (same or similar guardian phone) | Student save | **Warn only** | [BRS Rule STU-001] |
| V-04 | Student | Delete only permitted with zero history (no enrollment ever) | Delete action | Block otherwise, redirect to Archive | [BRS §14.5] |
| V-05 | Parent | At least one guardian recommended, not enforced (adult students exempt) | Student save | Warn only, non-blocking | [BRS §4.10] |
| V-06 | Group | Capacity cannot be reduced below current roster size | Group edit | Block | [FS §4.12] |
| V-07 | Group | Enrollment beyond hard capacity | Enrollment attempt | Block, unless Owner/Manager override with logged reason | [BRS Rule GRP-001] |
| V-08 | Group | Enrollment beyond soft capacity | Enrollment attempt | Warn, allow with permission | [BRS Rule GRP-001] |
| V-09 | Group | Price/discount/scholarship override | Group/enrollment save | Allowed, but must be visibly flagged and traceable | [BRS §5.10, §8.10] |
| V-10 | Session | End time must be after start time | Schedule save | Block | [FS §4.17] |
| V-11 | Session | Reschedule must link to the original slot | Reschedule action | Block if unlinked | [BRS §6.2] |
| V-12 | Attendance | Duplicate scan/mark for same student + session | Second scan/mark | Ignored silently for attendance purposes; optionally logged as anomaly | [BRS §7.6] |
| V-13 | Attendance | Mark after grace period | Scan/manual mark | Auto-reclassified to Late, not blocked | [BRS Rule ATT-002] |
| V-14 | Attendance | Edit after locking | Attempted edit on locked record | Block; requires Reopen workflow (§5.5) | [BRS §7.4, §7.5] |
| V-15 | Attendance | Reopen without a reason | Reopen submission | Block | [BRS §7.5] |
| V-16 | Billing | Invoice line item amount must be a non-negative integer minor-unit value | Invoice save | Block | [PRD §22] |
| V-17 | Billing | Issued invoice cannot be edited directly | Any edit attempt post-issue | Block; redirect to Financial Adjustment | [BRS Rule BIL-004] |
| V-18 | Billing | Void only permitted pre-payment | Void action | Block if any payment applied; redirect to Write Off | [BRS §8.15] |
| V-19 | Payment | Amount must be > 0 | Payment save | Block | [FS §4.26] |
| V-20 | Payment | Allocation sum cannot exceed payment total | Allocation confirm | Block, show exact overage | [BRS §8.16] |
| V-21 | Payment | Ambiguous/unmatched payment | Allocation | Never auto-guessed; held as Unallocated Credit | [BRS §8.16] |
| V-22 | Refund | Reason required | Refund submission | Block | [BRS §8.17] |
| V-23 | Refund | Amount above threshold | Refund submission | Block until second approver identified | [BRS §3.8] |
| V-24 | Financial Adjustment | Must reference the original record + reason + actor | Adjustment save | Block if any missing | [BRS Rule FIN-001] |
| V-25 | Cashbox | Balance is never directly editable | N/A — no such field exists | Structural block (no UI path) | [BRS §9.5] |
| V-26 | Payroll | Run cannot include unlocked/unfinalized underlying data | Payroll run trigger | Block for the affected staff member's line, not the whole run | [BRS §9.4] |
| V-27 | Notification | Template with unresolved variables | Template save / send attempt | Block | [BRS §10.3] |
| V-28 | Users | Username uniqueness per tenant | User save | Block | [PRD §13.3] |
| V-29 | Users | Base roles cannot be deleted/renamed | Role edit attempt | Block | [PRD §16] |
| V-30 | Backup | Restore candidate fails integrity check | Restore confirm | Block | [PRD §17] |
| V-31 | General | Bulk action on more than one record | Any bulk trigger | Requires explicit count-confirmation | [BRS Rule UI-001] |
| V-32 | General | All required fields validated at point of entry with inline messaging | Any form submission | Block with field-specific message, never a generic rejection | [BRS §14.7] |


---

## 7. UI Behavior

This section describes interaction behavior only — never visual design, which remains the PRD's authority [PRD §14].

### 7.1 Dialogs
- **Confirmation dialogs** are used exclusively for the actions enumerated in [BRS §14.6]: bulk actions, Delete, financial adjustments/refunds above threshold, and reopening locked attendance. They state the specific consequence in plain language (e.g., naming the exact record count for a bulk action) rather than a generic "هل أنت متأكد؟"
- **Destructive dialogs** (Delete, Void, Restore) use a visually and behaviorally distinct variant requiring the user to actively confirm (not a single default-focused "OK") to reduce accidental confirmation.
- Dialogs never stack more than one level deep; a dialog that would trigger another dialog instead resolves its own state first.

### 7.2 Dropdowns & Select Inputs
- Single-select for mutually exclusive states (Status, Billing Model, Pricing Method).
- Multi-select for combinable filters (§7.4).
- Every select with more than ~8 options becomes a searchable combobox rather than a long static list (e.g., Group picker, Student picker).

### 7.3 Autocomplete
- Student/Parent pickers autocomplete against name, phone, and guardian phone simultaneously [BRS §14.1], surfacing partial matches (typing "moh" surfaces "Mohamed") without requiring the user to pick which field to search by first.
- Autocomplete results always show enough disambiguating context (e.g., name + phone + current group) to prevent a staff member from picking the wrong near-duplicate record.

### 7.4 Search & Filtering
- Global search (`Ctrl+F`) spans Students, Parents, Groups, and Invoices simultaneously, with results grouped by entity type.
- Per-list filters are always combinable, never mutually exclusive [BRS §14.2] — e.g., Status = Active AND Group = X can both apply at once.
- Active filters are always visibly displayed as removable chips above the list, so a filtered "empty" state is never confused with a genuinely empty dataset.

### 7.5 Sorting
- Every list defaults to the most operationally relevant sort: most-recent-first for transactional lists (invoices, payments, audit log), alphabetical for reference lists (students, groups) [BRS §14.3].
- Sort state persists per list within a session but resets to default on next login (not stored as a permanent per-user preference in v1.0).

### 7.6 Pagination / Virtualization
- Any list that can realistically exceed ~50 records is virtualized, never paginated with a "load more" click that could tempt a user to load an entire multi-thousand-row table into memory at once [BRS §14.10, PRD §18].
- Infinite scroll is not used; virtualized scrolling within a fixed-height container is preferred, since it keeps a consistent scrollbar-driven mental model for a dense business application.

### 7.7 Date Picker
- Gregorian calendar by default, matching [PRD §14.3]'s Western-digit default; a Hijri/Gregorian toggle is available on date-labeling components used for reporting periods.
- Relative quick-picks ("اليوم," "هذا الأسبوع," "هذا الشهر") are always available alongside the full calendar picker for date-range filters.

### 7.8 Context Menu
- Right-click (or long-press equivalent) context menus are available on list rows for the most common single-record actions (Edit, Archive, Print), mirroring the same actions available via the row's own action buttons — never introducing an action unavailable elsewhere.

### 7.9 Drag & Drop
- Used only in the Weekly Schedule Grid (§4.13, moving a session slot) and the Session Calendar (§4.15, bulk date-range selection for cancellation). Not used elsewhere in v1.0, to avoid inconsistent interaction patterns across a dense business UI.

### 7.10 Undo
- Attendance marks (before locking) support an immediate, single-level "تراجع" undo toast for the most recent mark, given how error-prone rapid marking can be.
- No general-purpose undo exists for financial actions (payments, invoices, refunds) — these are corrected via the explicit Financial Adjustment mechanism instead [BRS Rule FIN-001], which is deliberately more visible and traceable than a silent undo would be.

### 7.11 Toast Notifications
- Toasts appear in the leading-top corner per RTL convention [PRD §14.5].
- Used for transient, non-blocking confirmations ("تم الحفظ," "تم الإرسال"); never used for anything requiring the user to make a decision — that is always a dialog (§7.1).
- Auto-dismiss after a few seconds, but remain manually dismissible and do not stack more than 3 deep (older toasts collapse into a "+N" summary).

### 7.12 Autosave
- Long, multi-step forms (e.g., New Group Form's full configuration) autosave a draft to prevent data loss on navigation-away or crash.
- Autosave **never** applies to actions that change billing or attendance state for an already-active record [BRS §14.8] — issuing an invoice, recording a payment, or marking attendance always requires an explicit save/confirm action, never a silent background save.


---

## 8. Error Handling

Every error state below specifies: the trigger, the user-facing message (functional description; actual copy is Arabic), and the required resolution path. Per [PRD §11.3], all errors surface through a typed error hierarchy (`DomainError`, `ValidationError`, `PermissionError`, `InfraError`) with user-safe Arabic messages — no raw stack traces or technical identifiers are ever shown to a non-technical user.

| # | Error | Type | Trigger | User-Facing Behavior | Resolution Path |
|---|---|---|---|---|---|
| E-01 | Student Already Exists (phone match) | Domain (Warn) | Registering a new student with a matching phone | Non-blocking inline warning banner with a link to the existing profile | Staff confirms intent or opens the existing record instead [Rule STU-001] |
| E-02 | Group Full | Domain | Enrollment attempt beyond capacity | Blocking (hard) or warning (soft) message naming the exact capacity and current count | Waitlist, alternate group, or permitted override [Rule GRP-001] |
| E-03 | Invoice Already Paid | Domain | Attempt to void a fully-paid invoice, or record a payment against a Paid invoice | Blocking message explaining Void isn't available post-payment | Use Write Off or Financial Adjustment instead [Rule BIL-004] |
| E-04 | Attendance Already Recorded | Domain | Duplicate scan/mark for the same student+session | Silent ignore for attendance purposes (not shown as an error to the scanning user); optionally an anomaly flag for staff review | None required by the scanning user [BRS §7.6] |
| E-05 | QR Already Assigned | Domain | Attempt to assign an active QR token already linked to another student | Blocking message identifying the conflict | Regenerate a new token for one of the two students [ETBS-045] |
| E-06 | Attendance Locked | Domain | Attempt to edit a completed/locked session's attendance | Blocking message directing to the Reopen workflow | Reopen with permission + reason (§5.5) |
| E-07 | No Internet (LAN QR) | Infra | Phone cannot reach the local QR bridge server | Non-blocking banner on the QR live view; attendance flow is **not** halted | Fall back to Manual/Search entry immediately [PRD §5 Risks] |
| E-08 | Backup Failed | Infra | Manual or scheduled backup write fails (disk full, permission error) | Blocking error dialog naming the underlying cause where safely surfaceable (e.g., "لا توجد مساحة كافية") | Retry after resolving the underlying condition; dashboard warning persists until a successful backup occurs |
| E-09 | Database Locked | Infra | A concurrent write conflict occurs (e.g., two operations racing on the same record) | Blocking error with automatic retry (transaction-level); if retry exhausts, user is shown a "حاول مرة أخرى" prompt | Retry the specific action; underlying transactions are atomic so no partial write occurs [PRD §11.5] |
| E-10 | Permission Denied | Permission | User attempts an action their role/permission key doesn't allow | Blocking message; in most cases the action is not even rendered in the UI for that role (defensive UI, [PRD §11.3]), so this is a defense-in-depth case, not the primary UX | None — action is simply unavailable; contact an Owner for role adjustment |
| E-11 | Restore Integrity Check Failed | Infra | Selected backup file fails `PRAGMA integrity_check` | Blocking; restore does not proceed | Select a different, valid backup file |
| E-12 | Payment Allocation Exceeds Amount | Validation | Sum of allocated amounts > payment total in §4.27 | Blocking inline error showing the exact overage | Adjust allocation amounts before confirming |
| E-13 | Refund Exceeds Refundable Value | Validation | Refund amount greater than what remains refundable on the original payment | Blocking inline error | Reduce the refund amount or verify the correct original payment |
| E-14 | Notification Template Incomplete | Validation | A required template variable has no available data source for the triggering event | Blocking at template-save time (§4.37) and again as a final safety check before any send | Fix the template before it can be used live; message is never sent with a literal unfilled placeholder [BRS §10.3] |
| E-15 | Session Closed (Attendance) | Domain | Scan/mark attempted after a session is closed | Blocking message; option to request reopening shown if the user has permission | Reopen with permission (§5.5), or accept the session is closed |
| E-16 | Duplicate Username | Validation | New user creation with an existing username | Blocking inline error | Choose a different username |
| E-17 | Capacity Reduced Below Roster | Validation | Editing a group's capacity below its current enrolled count | Blocking inline error stating the current roster size | Transfer students out first, or set capacity ≥ current roster |
| E-18 | Payroll Run on Unlocked Data | Domain | Attempting to run payroll for a period with unfinalized attendance/invoices for a given staff member | That staff member's line is excluded/flagged in the run, rather than blocking the entire run | Lock/finalize the underlying data first, or accept the exclusion and correct via next-cycle adjustment [BRS §9.4] |
| E-19 | Unresolved Financial Dispute Data Gap | Domain | Underlying attendance/session data needed to resolve a dispute doesn't exist (e.g., predigitization period) | Informational, non-blocking message acknowledging the gap honestly | Business judgment call by staff; system does not fabricate a resolution [ETBS-048] |
| E-20 | Concurrent Offline Attendance Conflict | Infra | Two devices independently record the same session offline, then sync | Flagged for manual staff review rather than silently duplicating or silently picking one | Staff manually resolves which record is authoritative [ETBS-039] |


---

## 9. Reports

Every report supports the baseline capabilities defined in [BRS §13]: filterable by date range, group, and (where applicable) individual student/teacher; exportable to PDF, Excel, and CSV [PRD §8.7]; printable. Only report-specific detail is listed below.

### 9.1 Attendance Report
- **Purpose:** Per-student and per-group attendance history and rate.
- **Columns:** Date · Student · Group · Status · Method.
- **Filters:** Date range, Group, Student, Status.
- **Grouping:** By Student or by Group.
- **Sorting:** Date (default), Student name.
- **KPIs shown:** Attendance Rate [BRS §12 row 2], with Cancelled sessions clearly excluded from the denominator, distinct from genuine Absences [BRS §13.1, Rule SES-001].

### 9.2 Financial Report
- **Purpose:** Revenue, expenses, and net position for a period.
- **Columns:** Category · Type (Income/Expense) · Amount · Date.
- **Filters:** Date range, Category.
- **Grouping:** By category, by income-source (student billing vs. other).
- **Sorting:** Date, amount.
- **Reconciliation requirement:** Totals must exactly match the Cashbox and Audit Log for the same period; any mismatch is treated as a defect, not a rounding footnote [BRS §13.2, Rule RPT-001].

### 9.3 Student Report
- **Purpose:** Per-student summary.
- **Columns:** Enrollment History · Attendance Rate · Payment History · Current Balance · Status Timeline.
- **Filters:** Student, date range.
- **Grouping:** N/A (single-student view).
- **Sorting:** N/A.

### 9.4 Teacher / Employee Report
- **Purpose:** Per-teacher/staff summary.
- **Columns:** Sessions Delivered · Students Taught · Attendance Rate (their groups) · Payroll Basis/Amount for the period.
- **Filters:** Teacher, date range.
- **Grouping:** By teacher.
- **Sorting:** Sessions delivered, name.

### 9.5 Monthly Rollup Report
- **Purpose:** Combines Attendance, Financial, Student, and Teacher reports at the center level — the standard "how did this month go" view [BRS §13.5].
- **Columns:** Section-per-topic rollup.
- **Filters:** Month.
- **Grouping:** By section.
- **Sorting:** N/A.

### 9.6 Outstanding Balances Report
- **Purpose:** Collections follow-up list.
- **Columns:** Student · Guardian · Amount Owed · Days Overdue.
- **Filters:** Date range, minimum amount.
- **Grouping:** N/A.
- **Sorting:** Default: most-overdue first [BRS §13.6].

### 9.7 Inactive Students Report
- **Purpose:** Win-back / retention support.
- **Columns:** Student · Last Attended Date · Outstanding Balance at Inactivation.
- **Filters:** Date range of inactivation.
- **Grouping:** N/A.
- **Sorting:** Last attended date.

### 9.8 Absence Statistics Report
- **Purpose:** Spot systemic attendance patterns.
- **Columns:** Group/Student/Day-of-Week · Absence Count · Absence Rate.
- **Filters:** Group, date range, day of week.
- **Grouping:** By group, by day of week, by student.
- **Sorting:** Absence rate descending (default).

### 9.9 Exam Report
- **Purpose:** Results/attendance for exam-type sessions, kept separate from regular academic attendance since the business purpose (assessment, not billing) differs [BRS §13.9].
- **Columns:** Student · Exam Title · Score · Max Score · Rank.
- **Filters:** Group, Exam, date range.
- **Grouping:** By exam.
- **Sorting:** Score descending (for ranking).

### 9.10 Homework Report
- **Purpose:** Completion tracking. **Status:** Pending confirmation of scope per [BRS Open Question 16.8]; this report specification is retained here consistent with the Homework module existing in the PRD's Feature Inventory [PRD §7.1], but should be removed if 16.8 resolves to out-of-scope.
- **Columns:** Student · Homework Title · Due Date · Submission Status · Score.
- **Filters:** Group, date range.
- **Grouping:** By group, by student.
- **Sorting:** Due date.

### 9.11 Group Report
- **Purpose:** Per-group operational and financial summary.
- **Columns:** Group · Occupancy · Revenue Projection vs. Collected · Attendance Rate · Teacher.
- **Filters:** Group, date range.
- **Grouping:** By subject.
- **Sorting:** Occupancy, revenue.


---

## 10. Settings

Every setting below is a direct functional rendering of a BRS Global Business Policy [BRS §3] into a configurable UI control. Defaults match the BRS's stated defaults exactly; where the BRS lists an Open Question instead of a firm default, this is noted rather than inventing one.

| Setting | Default | Possible Values | Affected Modules | Related Business Rule |
|---|---|---|---|---|
| Business Type | Set once at onboarding | Private Tutor / Tutoring Center | Staff, Groups, Payroll, Reporting scope | [BRS §3.1] |
| Attendance Methods Enabled | All four enabled | Manual (always on) / QR / USB / Search (toggle QR/USB/Search) | Attendance | [BRS §3.2] |
| Late Grace Period | 10 minutes | Any non-negative integer (minutes), overridable per group | Attendance | [BRS Rule ATT-002] |
| Attendance Editing After Lock | Requires Reopen + reason | Configurable buffer before auto-lock (immediate / N-hour buffer) | Attendance, Billing | [BRS §3.2, Rule ATT-001] |
| Billing Model Default | Monthly | Monthly / Per-Session / Course / Custom, overridable per group | Groups, Billing | [BRS §3.3, §8.1] |
| Monthly Calculation Method Default | Calendar month | Calendar / Session-count / Custom cycle, overridable per group | Billing | [BRS Rule BIL-003] |
| Proration on Mid-Cycle Enrollment | Enabled | Enabled (by days/sessions) / Disabled (full price) | Billing | [BRS §8.3, Rule STU-002] |
| Payment Timing | In advance | In advance / In arrears, per group | Billing | [BRS §8.4] |
| Absence Charging Policy | Charge unless excused | Always charge / Never charge / Charge unless excused, per group | Billing | [BRS §8.13, Rule BIL-001] |
| Late Payment Grace Period | Configurable, no fixed BRS default | Any positive integer (days) | Billing, Notifications | [BRS §8.5] |
| Late Fee | Disabled by default | Flat / Percentage / Disabled | Billing | [BRS §8.5] |
| Refund Approval Threshold | Configurable, no fixed BRS default | Any amount; above it requires second approver | Payments | [BRS §3.8, §8.17] |
| Discount Approval Threshold | Configurable, no fixed BRS default | Any amount; above it requires manager/owner approval | Billing | [BRS §3.8, §8.8] |
| Scholarship/Discount Stacking Order | **Unresolved — Open Question** | Scholarship-first / Discount-first | Billing | [BRS Open Question 16.5] |
| Notification Events Enabled | Per event, individually toggleable | Enabled / Disabled per event type | Notifications | [BRS §3.4, §10.1] |
| Notification Channels | Dependent on PRD stack availability | WhatsApp / SMS / Email / Internal | Notifications | [BRS §3.4, §10.7] |
| Quiet Hours | Configurable, no fixed BRS default | Time range during which non-urgent notifications queue | Notifications | [BRS §3.4] |
| Payment Reminder Schedule | Day 3 and Day 10 after due date | 0–N reminders with configurable offsets | Notifications, Billing | [BRS Rule NOT-001] |
| At-Risk Absence Threshold | 4 consecutive unexplained absences | Any positive integer; Automatic/Suggested/Disabled | Students, Dashboard | [BRS §3.5, Rule STU-003] |
| Inactive Auto-Flag | Fully automatic | Automatic / Suggested / Disabled | Students, Billing | [BRS §3.5, §4.5] |
| Group Capacity Enforcement Default | Soft (Private Tutor) / Hard (Tutoring Center) | Hard / Soft / None, per group | Groups | [BRS §3.6, Rule GRP-001] |
| Waiting List | Configurable | Enabled / Disabled | Groups | [BRS §3.6] |
| Teacher Session Approval | Configurable, no fixed BRS default | Teachers can cancel/reschedule independently / Require approval | Sessions, Groups | [BRS §3.7] |
| Teacher Billing Visibility | Configurable, no fixed BRS default | Full billing visibility / Attendance & academic only | Teachers, Billing | [BRS §3.7] |
| Teacher Payroll Basis Default | Configurable, no fixed BRS default | Fixed / Per-Session / Per-Student / % of Revenue | Payroll | [BRS §3.7, §9.4] |
| Currency & Rounding | EGP, whole-pound rounding | Configurable rounding rule, applied consistently across all calculation paths | Billing | [BRS §3.8, §8.19] |
| Automation Confirmation Level (per workflow) | Varies per workflow, financially-impactful ones default to Suggested | Automatic / Suggested / Disabled, individually per Section 11 workflow | All modules with automation | [BRS §3.9, Rule AUTO-001] |
| Backup Schedule | Configurable, no fixed BRS default | Daily / Weekly / Manual only | Backup | [PRD §17] |
| Session-Lock Timeout | Configurable, no fixed BRS default | Any duration (minutes) of inactivity | Security | [PRD §17] |
| Registration Fee | **Unresolved — Open Question** | Charged / Not charged; refundable if never attended | Students, Billing | [BRS Open Question 16.9] |
| Returning Student Re-Registration Fee | **Unresolved — Open Question** | Same as new / Exempt | Students, Billing | [BRS Open Question 16.10] |
| Extra Session Default Charge | Free by default | Free / Chargeable per override | Sessions, Billing | [BRS Open Question 16.4] |
| Review Session Quota Counting | **Unresolved — Open Question** | Counts toward session-count quota / Does not count | Sessions, Billing | [BRS Open Question 16.3] |


---

## 11. Traceability Matrix

This matrix links each major PRD requirement/module to the BRS rule(s) that govern it, the ETBS scenario(s) that ground it in reality, the FS screen(s)/workflow(s) that implement it, and a suggested future test-case identifier. It is deliberately structured the same way the BRS's own Rule Catalog (§15) is structured: **the highest-priority, highest-risk chains are documented in full here; this matrix is designed to grow, and every new business rule added to the BRS should receive a corresponding row here before implementation is considered complete.**

| PRD Requirement | Business Rule (BRS) | ETBS Scenario | Functional Screen / Workflow (FS) | Suggested Test Case ID |
|---|---|---|---|---|
| [PRD §8.1] Student Management | [BRS Rule STU-001] Duplicate warning | [ETBS-001], [ETBS-008] | §4.2, §4.4, §5.1 | TC-STU-001 |
| [PRD §8.1] Student status lifecycle | [BRS §4.4–4.8] Pause/Inactive/Dropout/Graduation | [ETBS-006]–[ETBS-018] | §4.3, §5.8, §5.9 | TC-STU-002 |
| [PRD §8.2] Group & Schedule Management | [BRS Rule GRP-001] Capacity enforcement | [ETBS-011], [ETBS-012] | §4.10–4.12, §5.2 | TC-GRP-001 |
| [PRD §8.2] Enrollment with price override | [BRS §5.10] Override traceability | [ETBS-009], [ETBS-054], [ETBS-057] | §4.11, §5.2, §5.7 | TC-GRP-002 |
| [PRD §8.3] Attendance — all four methods | [BRS §7.1] Method equivalence | [ETBS-027], [ETBS-036]–[ETBS-038] | §4.18–4.20, §5.4 | TC-ATT-001 |
| [PRD §8.3] Attendance locking | [BRS Rule ATT-001] | [ETBS-046] | §4.16, §5.4 step 6–7 | TC-ATT-002 |
| [PRD §8.3] Attendance reopening | [BRS §7.5] | [ETBS-047], [ETBS-048], [ETBS-080] | §4.21, §5.5 | TC-ATT-003 |
| [PRD §8.3] Duplicate scan handling | [BRS §7.6] | [ETBS-042], [ETBS-043] | §4.20, V-12 | TC-ATT-004 |
| [PRD §8.5] Invoice/Payment/Allocation model | [BRS §8.1–8.16, Rules BIL-001–004] | [ETBS-051]–[ETBS-065] | §4.22–4.28, §5.6 | TC-BIL-001 |
| [PRD §8.5] Locked invoice immutability | [BRS Rule BIL-004] | [ETBS-077], [ETBS-079] | §4.23, V-17 | TC-BIL-002 |
| [PRD §8.5] Payment allocation explicitness | [BRS §8.16] | [ETBS-013]–[ETBS-015], [ETBS-060] | §4.27, §5.6 | TC-BIL-003 |
| [PRD §8.5] Refunds with approval threshold | [BRS §8.17, §3.8] | [ETBS-015], [ETBS-017], [ETBS-062] | §4.28, V-22/V-23 | TC-BIL-004 |
| [PRD §8.6] Staff, Roles & Salary | [BRS §3.7, §9.4] | [ETBS-028]–[ETBS-030], [ETBS-064], [ETBS-084] | §4.8–4.9, §4.33–4.35, §5.11 | TC-PAY-001 |
| [PRD §8.7] Reporting | [BRS §12, §13, Rule RPT-001] | Cross-cutting | §9 (all reports) | TC-RPT-001 |
| [PRD §8.8] Notifications, provider-independent | [BRS §10.1–10.7] | [ETBS-066], [ETBS-086] | §4.36–4.38 | TC-NOT-001 |
| [PRD §8.9] Backup & Restore | [PRD §17] (technical); business practice per ETBS | [ETBS-041], [ETBS-049] | §4.41, §5.12–5.13 | TC-BAK-001 |
| [PRD §8.9] Audit Log, structural | [BRS §9.9, §2.7] | [ETBS-080], [ETBS-084], [ETBS-094] | §4.45 | TC-AUD-001 |
| [PRD §13.1] Money as integer minor units | [BRS §2.7 audit; §8.19 rounding] | [ETBS financial examples, §7 of ETBS] | V-16, all Billing screens | TC-BIL-005 |
| [PRD §16] RBAC, five base roles | [BRS §3.7 Teacher Policy interplay] | [ETBS-081] | §2 (this doc), §4.42–4.44 | TC-USR-001 |
| [PRD §7.2] Multi-tenant-shaped schema | [BRS §3.1 Business Type migration event] | [ETBS-096]–[ETBS-105] | §12 (this doc) | TC-FUT-001 |
| [PRD §11.4] LAN QR Bridge | [BRS §7.1] method equivalence, offline-first [BRS §2.5] | [ETBS-037], [ETBS-039], [ETBS-041] | §4.20, E-07 | TC-ATT-005 |
| [PRD §14.5] RTL as first-class | N/A (design, not business rule) | N/A | All screens, §1.3 conventions | TC-UI-001 |
| Cashbox derived-ledger integrity | [BRS §9.5] | [ETBS-063], [ETBS-082] | §4.32, V-25 | TC-FIN-001 |
| Financial Adjustment mandatory linkage | [BRS Rule FIN-001] | [ETBS-047], [ETBS-059], [ETBS-084] | §4.23 "إنشاء تسوية مالية", V-24 | TC-FIN-002 |
| Automation Policy confirmation levels | [BRS Rule AUTO-001] | Cross-cutting §3, §11 of BRS | §10 (Settings), §4.16/4.14 workflows | TC-AUT-001 |
| Historical preservation (non-retroactivity) | [BRS §2.6] | [ETBS-077], [ETBS-079], [ETBS-100] | §5.6 step 8, §5.7, §5.11 step 7 | TC-HIST-001 |

**Open Question Coverage:** Every BRS Open Question [BRS §16] that remains unresolved is explicitly flagged wherever it surfaces in this document (see §10 Settings table rows marked "Unresolved") rather than being quietly defaulted — this matrix should be updated the moment any Open Question is resolved, adding the resulting rule, its screen, and its test case as a new row.


---

## 12. Future Extension Points

The PRD explicitly over-builds the v1.0 architecture (multi-tenant-shaped schema, modular services, provider-swappable notification layer, [PRD §1]) so later phases plug in without redesigning existing functionality. This section documents, functionally, where each future capability attaches.

### 12.1 Cloud Sync
**Plugs into:** Every writable table already carries `tenantId`, `createdAt`, `updatedAt` [PRD §13.1]; the future sync layer adds a monotonic `rev` per table and delta pull/push endpoints [PRD §21]. **Functional impact:** No existing screen changes; a new Settings sub-section ("المزامنة السحابية") and a sync-status indicator in the bottom status bar are the only new UI surface required.

### 12.2 Parent Mobile App / Student Mobile App
**Plugs into:** The Notification module's provider-independent Adapter Pattern [PRD §11.3] and the future `/v1/students`, `/v1/attendance`, `/v1/invoices` REST resources [PRD §21]. **Functional impact:** Existing Parent Profile (§4.7) notification-preference fields become the parent-app's own settings; no rework needed to the desktop screens themselves.

### 12.3 Online Booking
**Plugs into:** The Group Capacity Policy [BRS §3.6] and Enrollment workflow (§5.2) already model capacity, waitlisting, and approval gating — an online booking front-end would simply be a new entry point into the same Enrollment decision logic, not a new business rule set.

### 12.4 Online Payments
**Plugs into:** The Payment module's method field already includes `TRANSFER`/`WALLET`/`OTHER` [PRD §13.3]; a payment gateway would add a new method value and an automated allocation trigger, without changing the Invoice/Payment/PaymentAllocation model itself [PRD §23.1].

### 12.5 WhatsApp Business API / SMS (Twilio) / Email (SMTP)
**Plugs into:** The Notification module's channel-agnostic Adapter Pattern [PRD §11.3, §7.2] — these are new `NotificationProvider` implementations. **Functional impact:** None on the Template Manager (§4.37) or Notification Log (§4.36) screens, which are already channel-agnostic by design.

### 12.6 AI Analytics
**Plugs into:** The existing Reports module (§9) and Dashboard KPIs (§4.1, [BRS §12]) as a new report type or predictive tile (e.g., churn-risk scoring building on the existing At-Risk flag [BRS Rule STU-003]). **Functional impact:** Additive only; no existing KPI definition changes, since [BRS §12]'s general rule requires every KPI definition to remain the single authoritative source even as new derived metrics are added alongside it.

### 12.7 Branch Management / Multi-Teacher Centers
**Plugs into:** The `Tenant`/`branchId` fields already present (nullable) on hot tables [PRD §13.1, §23.1]; the Business Type migration event [BRS §3.1] and the Branch Manager role reconciliation already anticipated in §2.1 of this document. **Functional impact:** Every screen in §4 that currently shows a single-tenant view gains an optional branch filter/scope; no screen is redesigned, only re-scoped.

### 12.8 Inventory
**Not currently modeled in the PRD's schema.** Would require a new `InventoryItem`/`StockMovement` domain, most naturally attaching to the Expenses module (§3.10) for purchase tracking. Flagged here as a genuine future schema addition, not a same-schema extension like the items above — consistent with this document's practice of being explicit about which extensions are "free" versus which require new modeling.

### 12.9 Learning Management (LMS)
**Explicitly a Non-Goal for v1.0 and beyond in the PRD's current scope** [PRD §2.4] — "Not an LMS. No video hosting, no course delivery, no content library." If ever pursued, it would be a distinct product surface attaching loosely to the Homework module (§3.6-equivalent) rather than a natural extension of the ERP core; recorded here only so the boundary is explicit, not to imply near-term intent.

---

*End of Genius Center Functional Specification v1.0. This document should be treated as a living reference, extended screen-by-screen and rule-by-rule as implementation proceeds — following the same template discipline (§4.0) throughout — and updated immediately whenever a BRS Open Question (§16 of the BRS) is resolved, a new ETBS scenario is documented, or a PRD module changes. It should be reviewed alongside Genius Center PRD v2.0, BRS v1.0, and ETBS v1.0, none of which this document supersedes.*
