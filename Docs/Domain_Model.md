# Genius Center — Domain Model

| | |
|---|---|
| **Product** | Genius Center |
| **Document Type** | Domain Model (DDD) |
| **Version** | 1.0 |
| **Status** | Draft — Awaiting Stakeholder Approval |
| **Date** | July 6, 2026 |
| **Companion Documents** | PRD v2.0, BRS v1.0, ETBS v1.0, FS v1.0 |
| **Audience** | Engineering, Architecture, Product, QA |
| **Purpose** | Canonical business domain model — the single source of truth for what the domain *means* before any implementation begins |

### Document Philosophy

This is **not** a database schema. This is **not** an ERD. This is **not** an implementation document.

This is a **Domain-Driven Design (DDD) domain model** that captures the business reality of running a tutoring business in Egypt. Every entity, aggregate, event, and service defined here represents a real business concept with real business meaning. Implementation artifacts (Prisma models, TypeScript types, database tables) should be *derived from* this model — never the other way around.

**Only after this Domain Model is approved** should database schemas, code scaffolding, or module specifications be created.

---

## Table of Contents

1. [Bounded Contexts](#1-bounded-contexts)
2. [Aggregates](#2-aggregates)
3. [Entities](#3-entities)
4. [Value Objects](#4-value-objects)
5. [Domain Events](#5-domain-events)
6. [Domain Services](#6-domain-services)
7. [Policies](#7-policies)
8. [Cross-Context Communication](#8-cross-context-communication)
9. [Ubiquitous Language](#9-ubiquitous-language)
10. [Future Evolution](#10-future-evolution)

---

## 1. Bounded Contexts

Each bounded context is a self-contained area of the business domain with its own language, rules, and model integrity. Contexts communicate through well-defined interfaces (domain events, shared identifiers) — never by reaching directly into another context's internals.

---

### 1.1 Identity & Access

**Responsibility:** Who can use the system, what they can do, and how they prove their identity.

**Core Concepts:** User, Role, Permission, Authentication Session, PIN Lock.

**Business Justification:** A tutoring business has distinct staff roles (Owner, Teacher, Assistant, Secretary, Accountant) with fundamentally different access needs. The Owner sees everything; a Teacher sees only their groups; an Assistant can mark attendance but cannot touch finances. This is not a technical access-control concern — it reflects real organizational trust boundaries.

**Owns:**
- User accounts and credentials
- Role definitions and permission assignments
- Login sessions and screen-lock state

**Does NOT Own:**
- What a "Student" or "Teacher" means to the Academic context (a User who is assigned a Teacher role in this context is merely an authenticated person; the Academic context assigns them to groups)

---

### 1.2 Student Management

**Responsibility:** The identity, profile, status lifecycle, and family relationships of every student.

**Core Concepts:** Student, Parent/Guardian, Student–Parent Link, Student Status Lifecycle, QR Identity Token.

**Business Justification:** A student is the central entity of a tutoring business. Their profile, contact information, medical notes, tags, and status (Active, Paused, At-Risk, Inactive, Dropped Out, Graduated) are consulted by every other context. But this context does *not* decide what a student owes, whether they attended, or what group they're in — it only knows *who they are* and *what state they're in*.

**Owns:**
- Student registration and profile data
- Parent/Guardian profiles and the many-to-many Student–Parent link
- Student status lifecycle transitions
- QR token generation and identity-card printing

**Does NOT Own:**
- Enrollment (owned by Academic Organization)
- Attendance records (owned by Attendance)
- Financial obligations (owned by Billing)

---

### 1.3 Academic Organization

**Responsibility:** How students are organized for learning — subjects, groups, enrollments, and teacher assignments.

**Core Concepts:** Subject, Group (with subtypes: Regular, Review, Exam, Temporary, Special), Enrollment, Group Capacity, Group Status Lifecycle, Teacher Assignment, Subgroup.

**Business Justification:** A "group" is the fundamental organizational unit of a tutoring business. It defines *who meets, when, with whom, to study what, and at what price*. Enrollment — the relationship binding a student to a group for a period of time — is the bridge between the Student context and everything downstream (scheduling, attendance, billing). This context owns the rules about capacity, transfers, and the price model attached to each group.

**Owns:**
- Subject catalog
- Group creation, configuration, and lifecycle (Planned → Active → Full → Closed/Archived)
- Enrollment records (student-to-group binding with dates, price override, and status)
- Teacher-to-group assignment
- Group capacity enforcement (Hard / Soft / None)
- Group-level policy overrides (pricing model, billing cycle, attendance policy)
- Subgroup relationships

**Does NOT Own:**
- Individual class session occurrences (owned by Scheduling)
- Attendance records (owned by Attendance)
- Invoice generation (owned by Billing — though triggered by enrollment data)

---

### 1.4 Scheduling

**Responsibility:** When classes actually happen — the translation of a group's recurring pattern into concrete, dated, time-bound session occurrences.

**Core Concepts:** Group Schedule (recurring pattern), Class Session (concrete occurrence), Session Type (Regular, Extra, Review, Exam, Make-Up), Session Status (Scheduled, Completed, Cancelled, Rescheduled), Linked Sessions (make-up ↔ original, rescheduled ↔ original).

**Business Justification:** A group's weekly schedule pattern ("Saturday and Tuesday, 5–7 PM") generates individual Class Sessions. Each session has its own lifecycle — it can be completed, cancelled by the teacher, or rescheduled. The distinction between a *pattern* and an *occurrence* is critical: a teacher can cancel one Tuesday session without affecting the pattern. Make-up sessions exist specifically to compensate for cancelled ones, and the system must track this link to prevent double-charging or double-paying.

**Owns:**
- Recurring schedule patterns per group
- Individual ClassSession generation and lifecycle
- Session type classification
- Make-up ↔ original session linkage
- Rescheduled ↔ original session linkage
- Conflict detection (same teacher, same room, same time)

**Does NOT Own:**
- Attendance records for a session (owned by Attendance)
- The billing impact of a cancelled session (owned by Billing, informed by events from this context)

---

### 1.5 Attendance

**Responsibility:** Recording, validating, locking, and correcting who attended which session.

**Core Concepts:** Attendance Record, Attendance Status (Present, Late, Absent, Excused), Attendance Method (Manual, Search, QR-Mobile, QR-USB), Grace Period, Attendance Locking, Attendance Reopening, Compensation Attendance (make-up cross-reference).

**Business Justification:** Attendance is the operational heartbeat of a tutoring business — it is taken every session, it determines who to follow up with, and under per-session billing it directly determines what each student owes. All four entry methods (Manual, Search, QR-Mobile, QR-USB) must converge on a single write path so that business rules (session-open validation, duplicate-scan suppression, late-arrival classification, locking) are enforced identically regardless of how the mark was entered.

**Owns:**
- Attendance records (one per student per session)
- Late-arrival auto-classification based on grace period
- Duplicate scan suppression
- Attendance locking (auto-lock on session completion or after buffer)
- Attendance reopening (permission-gated, always audit-logged)
- Consecutive-absence counter (the raw count; the *reaction* to it is owned by Student Management via a domain event)

**Does NOT Own:**
- The financial consequence of an absence (owned by Billing)
- The student's status change resulting from repeated absence (owned by Student Management, triggered by events from this context)

---

### 1.6 Billing

**Responsibility:** What each student owes, when they owe it, and why — the translation of enrollment, pricing, and attendance into monetary obligations.

**Core Concepts:** Invoice, Invoice Line Item, Invoice Lifecycle (Draft → Issued → Partially Paid → Paid → Overdue → Written Off / Voided), Billing Model (Monthly, Per-Session, Course, Custom), Monthly Calculation Method (Calendar, Session-Count, Custom Cycle), Proration, Discount, Scholarship, Price Override, Absence Charging, Credits, Financial Adjustment.

**Business Justification:** Billing is the most consequential module — errors here cost the business real money or damage trust with families. The three-way separation of Invoice / Payment / Allocation (rather than a running balance) exists precisely because real tutoring businesses encounter partial payments, multi-invoice allocation, overpayment-as-credit, refunds, and disputes that a simple balance field cannot represent cleanly. Every correction happens via a linked Financial Adjustment, never by silently editing an issued invoice.

**Owns:**
- Invoice generation (automatic or manual) based on billing model and enrollment data
- Invoice line items (describing what the charge is for)
- Invoice lifecycle and status transitions
- Proration calculations for mid-cycle enrollment
- Discount application (one-time and recurring)
- Scholarship application (persistent enrollment-level override)
- Price override management
- Absence charging rules (Always / Never / Unless Excused)
- Credit creation, tracking, and auto-application
- Financial Adjustment creation (the general-purpose correction mechanism)
- Make-up entitlement tracking when a teacher cancels a session
- Receipt numbering (sequential, immutable, never reused)

**Does NOT Own:**
- Payment recording or allocation (owned by Payments)
- Expense tracking (owned by Financial Operations)
- Payroll (owned by Payroll)

---

### 1.7 Payments

**Responsibility:** Recording money received, allocating it to specific invoices, and handling refunds.

**Core Concepts:** Payment, Payment Allocation, Payment Method (Cash, Transfer, Wallet, Other), Refund, Unallocated Credit.

**Business Justification:** Payments are separated from Billing because a payment is a discrete real-world event ("a parent handed over 500 EGP") that may or may not correspond neatly to a single invoice. A guardian paying for two siblings in one transaction, or paying three months in advance, or making a partial payment that covers 60% of one invoice — all of these require explicit allocation. Payments must never "guess" which invoice they cover; ambiguous payments sit as unallocated credit until staff assigns them.

**Owns:**
- Payment recording (amount, method, date, receiver)
- Payment-to-invoice allocation (explicit, never automatic guessing)
- Refund processing (linked to original payment/invoice, requires reason, may require second approver above threshold)
- Unallocated credit management

**Does NOT Own:**
- Invoice creation or lifecycle (owned by Billing)
- Expense or salary payouts (owned by Financial Operations and Payroll)

---

### 1.8 Financial Operations

**Responsibility:** The center's own finances — expenses, non-student income, the cashbox ledger, and financial reporting data.

**Core Concepts:** Expense, Expense Category, Extra Income (non-student), Income Category, Cashbox, Receipt Attachment.

**Business Justification:** Beyond student billing and payments, a tutoring business has rent, utilities, printing costs, and occasional non-student income (e.g., a one-off workshop fee). The Cashbox is a running ledger of physical cash, where every movement is a discrete, timestamped entry and the balance is always a *derived total* — never a manually editable number — to prevent drift from transaction history. All financial operations carry the same audit requirements as student-facing billing.

**Owns:**
- Expense recording and categorization
- Recurring expense templates
- Extra income recording and categorization
- Cashbox ledger (derived balance from discrete entries)
- Receipt/document attachments on financial records

**Does NOT Own:**
- Student invoices or payments (owned by Billing and Payments)
- Payroll calculations or payouts (owned by Payroll)

---

### 1.9 Payroll

**Responsibility:** Calculating and recording what each teacher or staff member is owed for a given period.

**Core Concepts:** Salary Rule (the basis: Fixed, Per-Session, Per-Hour, Commission), Payroll Run (the calculation for a period), Salary Payout (the actual payment), Advance, Payslip.

**Business Justification:** In the Egyptian tutoring market, teachers are compensated in fundamentally different ways — a fixed monthly salary, a per-session rate, a per-student rate, or a percentage of collected revenue. Payroll must read from *locked* attendance and *finalized* invoice data, never from data that could still change, to prevent paying a teacher based on figures later corrected. If corrections are needed after payroll finalization, they flow through the next cycle as an adjustment — never a retroactive edit to a finalized record.

**Owns:**
- Salary rule configuration per staff member
- Payroll calculation (reading locked sessions, finalized payments)
- Payroll finalization and payout recording
- Advance recording and deduction
- Payslip generation

**Does NOT Own:**
- Defining who is a "staff member" (owned by Identity & Access)
- Which sessions a teacher delivered (read from Scheduling/Attendance)

---

### 1.10 Notifications

**Responsibility:** Deciding *what* to communicate, *when* to communicate it, and *to whom* — independent of the delivery channel.

**Core Concepts:** Notification Trigger (event-based or manual), Notification Template (with variable substitution), Notification Channel (Internal, WhatsApp, SMS, Email — channel-agnostic by design), Notification Log, Delivery Schedule (immediate vs. offset), Retry Queue, Quiet Hours.

**Business Justification:** A tutor's relationship with parents depends on timely, professional communication — attendance alerts, payment reminders, schedule changes. The notification system is *trigger-first* (business events cause notifications) and *channel-agnostic* (the same "payment overdue" rule works whether the message goes out via WhatsApp or in-app, and switching providers never requires redefining business rules). Templates are editable so a formal center and a casual private tutor can sound like themselves.

**Owns:**
- Template definitions and variable validation
- Trigger configuration (which events generate notifications)
- Delivery scheduling and quiet hours
- Retry queue and failure handling
- Notification log (every attempt, success or failure, is recorded)

**Does NOT Own:**
- The actual delivery infrastructure (WhatsApp API, SMS gateway — these are infrastructure adapters, not domain concerns)
- The business events themselves (produced by other contexts)

---

### 1.11 Reporting & Analytics

**Responsibility:** Aggregating data from all contexts into actionable, filterable, exportable reports and dashboard KPIs.

**Core Concepts:** Dashboard KPI (Active Students, Attendance Rate, Monthly Revenue, Outstanding Balance, At-Risk Students, Group Occupancy, Teacher Load), Report (Attendance, Financial, Student, Teacher, Monthly, Outstanding Balances, Inactive Students, Absence Statistics, Exam, Homework), Export Format (PDF, Excel, CSV).

**Business Justification:** Reports exist to answer the question every tutor asks daily: "How is my business doing?" Every KPI has a single, documented, reproducible calculation. Financial reports must reconcile exactly with the Cashbox and Audit Log — any discrepancy is a data-integrity bug. Reports are read-only consumers of data produced by other contexts; they never write back or modify source data.

**Owns:**
- KPI calculation definitions
- Report generation and filtering logic
- Export formatting (PDF, Excel, CSV)

**Does NOT Own:**
- Any source data — this context is a pure consumer

---

### 1.12 System Administration

**Responsibility:** Global system configuration and the business profile that contextualizes everything else.

**Core Concepts:** Business Profile (name, logo, currency, timezone, working hours), Global Policy Defaults (Attendance Policy, Billing Policy, Notification Policy, Student Status Policy, Group Capacity Policy, Teacher Policy, Financial Policy, Automation Policy), Academic Year configuration, Business Type (Private Tutor vs. Tutoring Center).

**Business Justification:** Every policy in this system has a global default set here, which other contexts (Academic Organization, Scheduling, Billing, etc.) inherit unless explicitly overridden at the group or student level. Business Type — set once during onboarding — fundamentally changes default behaviors (e.g., Soft vs. Hard capacity limits) and determines whether Payroll is relevant at all.

**Owns:**
- Business profile data
- Global policy defaults
- Business Type setting and its implications
- Academic year structure
- Application-wide settings (session-lock timeout, PIN policy, etc.)

**Does NOT Own:**
- Per-group or per-student overrides of policies (owned by the respective contexts that apply them)

---

### 1.13 Backup & Recovery

**Responsibility:** Protecting data against loss and enabling recovery.

**Core Concepts:** Backup Job (Manual, Scheduled, Pre-Restore), Backup Record (file path, size, timestamp), Integrity Check, Restore Process.

**Business Justification:** For a solo tutor whose entire business lives in one local database file, data loss is catastrophic. Backups are not a "nice to have" — they are a core business capability. Scheduled backups run automatically; on-exit backups provide a safety net; pre-restore backups protect against a bad restore. Nightly integrity checks (`PRAGMA integrity_check`) surface problems before they become unrecoverable.

**Owns:**
- Backup creation (manual, scheduled, on-exit, pre-restore)
- Backup record metadata
- Database integrity verification
- Restore workflow (confirmation, validation, application restart)

**Does NOT Own:**
- Any business data — this context operates on the database as a whole

---

### 1.14 Audit

**Responsibility:** An immutable, chronological record of every significant action taken in the system.

**Core Concepts:** Audit Entry (actor, action, entity, entity ID, before-state, after-state, timestamp).

**Business Justification:** "Who did what, when, and what changed?" is a question every tutoring business needs answered, especially around money. The audit log is the ultimate dispute resolution tool. It is implemented structurally — as a decorator wrapping every write-repository method — so it cannot be forgotten or bypassed by individual features. Audit entries are append-only; they are never modified or deleted.

**Owns:**
- Audit log entries
- Before/after JSON snapshots for every write operation
- Actor attribution for every recorded action

**Does NOT Own:**
- The actions themselves — this context passively observes and records what other contexts do

---

## 2. Aggregates

An aggregate is a cluster of entities and value objects that is treated as a single unit for data consistency. Each aggregate has a root entity — the only member accessible from outside the aggregate. All modifications go through the aggregate root.

---

### 2.1 Student (Aggregate Root)

**Context:** Student Management

**Root Entity:** Student

**Contains:**
- Student profile data (name, gender, birthdate, school, grade, phone, photo, medical notes, notes, tags)
- QR identity token
- Student status (value object)

**Related but External:**
- Student–Parent links (see §2.2)
- Enrollments (owned by Academic Organization)

**Invariants:**
- A student must have a unique QR token within the tenant
- A student's status transitions must follow the defined lifecycle (Active → Paused / At-Risk / Inactive / Dropped Out / Graduated; Paused/Inactive/Dropped Out → Active via Return)
- Student code is auto-generated and unique within the tenant

**Consistency Boundary:** A student's profile and status are always consistent within a single transaction. Enrollment, attendance, and billing data reference the student by ID but are governed by their own aggregate consistency rules.

---

### 2.2 Parent (Aggregate Root)

**Context:** Student Management

**Root Entity:** Parent/Guardian

**Contains:**
- Parent profile data (name, phone, alt phone, email, notes)

**Related but External:**
- Student–Parent links (a join aggregate/relationship between Student and Parent)

**Invariants:**
- A parent may be linked to multiple students (siblings are extremely common in Egyptian tutoring)
- At least one parent should be designated as primary contact for notification purposes (soft constraint — the system must function for adult students with no guardian)
- The same parent record is shared across all linked students (no duplication)

**Consistency Boundary:** Parent profile data is self-consistent. The Student–Parent link (with relation type and isPrimary flag) is a lightweight association managed by Student Management but does not require transactional consistency with the Student aggregate beyond referential integrity.

---

### 2.3 Group (Aggregate Root)

**Context:** Academic Organization

**Root Entity:** Group

**Contains:**
- Group configuration (name, subject reference, teacher reference, classroom reference, capacity, status)
- Pricing configuration (billing model, base price, monthly calculation method)
- Policy overrides (attendance policy, billing policy, absence charging policy — all optional, defaulting to global)
- Group schedule patterns (weekday + start/end time entries — these are *part of the aggregate* because changing a schedule pattern affects session generation)

**Related but External:**
- Enrollments (separate aggregate — see §2.4)
- Class Sessions (owned by Scheduling context)

**Invariants:**
- A group's capacity must be ≥ 0 (0 means unlimited)
- A group's status transitions must follow: Planned → Active → Full → Closed/Archived
- Group schedule patterns must not have internal time conflicts (same group, same day, overlapping times)
- A group must reference a valid Subject
- Pricing model and base price must be set before the group can move from Planned to Active

**Consistency Boundary:** Group configuration, schedule patterns, and pricing are always consistent within a single transaction. Enrollment counts affect the Full status but are tracked via enrollment events, not by embedding enrollment records inside the Group aggregate.

---

### 2.4 Enrollment (Aggregate Root)

**Context:** Academic Organization

**Root Entity:** Enrollment

**Contains:**
- Student reference (ID)
- Group reference (ID)
- Enrollment period (start date, optional end date)
- Price override (optional — overrides the group's default price for this specific student)
- Enrollment status (Active, Paused, Ended, Transferred)
- Discount/Scholarship reference (optional)

**Invariants:**
- A student may have multiple active enrollments (multi-group enrollment, e.g., Math and Physics)
- A student may NOT have two active enrollments in the same group at the same time
- Enrollment start date is required; end date is set when the enrollment ends
- Price override, if set, is the authoritative price for billing this student in this group (supersedes group default)
- An enrollment that is Paused stops generating billing obligations but preserves the record
- Transfer creates a new enrollment in the target group and ends the enrollment in the source group — both records are preserved

**Consistency Boundary:** Each enrollment is independently consistent. Cross-enrollment consistency (e.g., "does this student already have an active enrollment in this group?") is enforced at the service layer before creating a new enrollment.

---

### 2.5 Class Session (Aggregate Root)

**Context:** Scheduling

**Root Entity:** ClassSession

**Contains:**
- Session timing (start datetime, end datetime)
- Group reference (ID)
- Session type (Regular, Extra, Review, Exam, Make-Up)
- Session status (Scheduled, Completed, Cancelled, Rescheduled)
- Linked session reference (for Make-Up: the original cancelled session; for Rescheduled: the original session)
- Substitute teacher reference (optional — when a different teacher covers)
- Notes

**Invariants:**
- A session must reference a valid group
- Session status transitions: Scheduled → Completed / Cancelled / Rescheduled (terminal states)
- A Cancelled session must record a reason
- A Make-Up session must reference the original session it compensates for
- A Rescheduled session must reference the original session it replaces
- Sessions are generated from Group Schedule patterns but, once created, are independent entities with their own lifecycle
- A session's end time must be after its start time

**Consistency Boundary:** Each session is independently consistent. Attendance records reference sessions by ID but are a separate aggregate.

---

### 2.6 Attendance Record (Aggregate Root)

**Context:** Attendance

**Root Entity:** AttendanceRecord

**Contains:**
- Class Session reference (ID)
- Student reference (ID)
- Attendance status (Present, Late, Absent, Excused)
- Method used (Manual, Search, QR-Mobile, QR-USB)
- Marked-at timestamp
- Marked-by reference (staff/teacher ID)
- Lock state (locked/unlocked)
- Compensation reference (optional — if this attendance was recorded for a make-up session, references the original session's attendance it resolves)

**Invariants:**
- One attendance record per student per session (unique constraint)
- A duplicate scan for the same student in the same session is silently suppressed (not an error)
- Attendance status is auto-classified: if marked after the grace period, status is "Late" not "Present"
- Once locked, modification requires explicit reopening (permission-gated, audit-logged)
- Reopening a locked attendance does NOT retroactively change already-issued invoices — it creates an adjustment trigger

**Consistency Boundary:** Each attendance record is independently consistent. The lock state is part of the record itself, not a session-wide flag, because individual records may need to be corrected independently.

---

### 2.7 Invoice (Aggregate Root)

**Context:** Billing

**Root Entity:** Invoice

**Contains:**
- Student reference (ID)
- Invoice number (sequential, immutable, never reused)
- Issue date, due date
- Billing period (start, end)
- Invoice line items (entities within the aggregate — each describes one charge: group fee, proration, discount, etc.)
- Total amount (in minor units)
- Paid amount (in minor units, updated by allocation events)
- Invoice status (Draft, Issued, Partially Paid, Paid, Overdue, Written Off, Voided)
- Linked adjustments (references to Financial Adjustment records)

**Invariants:**
- Once Issued, line items and total are **immutable** — corrections happen only via linked Financial Adjustments
- Invoice number is sequential within the tenant and never reused, even for voided invoices
- A Voided invoice retains its number and history; the gap in the sequence is expected
- Status transitions: Draft → Issued → Partially Paid ↔ Paid → (auto) Overdue → Written Off / Voided
- An invoice's paid amount must equal the sum of all payment allocations against it
- An invoice cannot be voided if any non-refunded payments are allocated to it

**Consistency Boundary:** An invoice and its line items are always consistent within a single transaction. Payment allocations update the invoice's paid amount and status but are initiated from the Payments context.

---

### 2.8 Payment (Aggregate Root)

**Context:** Payments

**Root Entity:** Payment

**Contains:**
- Student reference (ID)
- Amount (in minor units)
- Payment method (Cash, Transfer, Wallet, Other)
- Payment date
- Received-by reference (staff ID)
- Notes
- Payment allocations (entities within the aggregate — each binds a portion of this payment to a specific invoice)
- Refund flag and refund metadata (if this is a refund: linked original payment, reason, approver)

**Invariants:**
- A payment's allocation total must not exceed the payment amount
- A refund is modeled as a negative-amount payment with a mandatory reason and a reference to the original payment
- Refunds above a configurable threshold require a second approver (four-eyes principle)
- Unallocated remainder (payment amount minus sum of allocations) exists as implicit credit on the student's account
- A payment, once recorded, is never deleted — only refunded

**Consistency Boundary:** A payment and its allocations are always consistent. When an allocation is created, it also triggers an update to the target invoice's paid amount — this cross-aggregate update is coordinated at the service layer.

---

### 2.9 Expense (Aggregate Root)

**Context:** Financial Operations

**Root Entity:** Expense

**Contains:**
- Category reference
- Amount (in minor units)
- Date
- Notes
- Attachment path (optional receipt/document)

**Invariants:**
- Every expense must have a category
- Every expense is attributed to a staff member (via audit)

**Consistency Boundary:** Each expense is independently consistent.

---

### 2.10 Salary Rule (Aggregate Root)

**Context:** Payroll

**Root Entity:** SalaryRule

**Contains:**
- Staff member reference (User ID)
- Compensation model (Fixed, Per-Session, Per-Hour, Commission)
- Base amount (for Fixed)
- Rate amount (for Per-Session, Per-Hour)
- Commission percentage (for Commission)
- Effective date

**Invariants:**
- A staff member may have one active salary rule at a time (historical rules are preserved)
- Commission percentage must be 0–100

**Consistency Boundary:** Each salary rule is independently consistent. Historical salary rules are retained for audit and for correctly calculating payroll for past periods.

---

### 2.11 Payroll Run (Aggregate Root)

**Context:** Payroll

**Root Entity:** PayrollRun

**Contains:**
- Period (start date, end date)
- Status (Draft, Finalized, Paid)
- Per-staff calculation entries (entities within the aggregate):
  - Staff member reference
  - Calculated amount (based on salary rule + locked session/payment data)
  - Deductions (advances, adjustments)
  - Net amount
  - Payout status and date

**Invariants:**
- A payroll run must only calculate against *locked* attendance and *finalized* invoice data — never against data that could still change
- Once Finalized, a payroll run is immutable — corrections flow through the next payroll cycle as adjustments
- A staff member cannot have two overlapping payroll runs for the same period

**Consistency Boundary:** A payroll run and all its per-staff entries are consistent within a single transaction.

---

### 2.12 Notification (Aggregate Root)

**Context:** Notifications

**Root Entity:** NotificationLog entry

**Contains:**
- Template reference (optional — manual notifications may not use a template)
- Channel
- Recipient
- Rendered payload
- Delivery status (Queued, Sent, Failed)
- Error details (if failed)
- Retry count
- Timestamps (created, last attempted, delivered)

**Invariants:**
- A notification with unresolved template variables (e.g., literal `{{amount}}` in the payload) must be blocked from sending
- Failed notifications are retried up to a configurable maximum, then marked "Failed — needs manual follow-up"
- Every delivery attempt is logged, regardless of outcome

**Consistency Boundary:** Each notification log entry is independently consistent.

---

### 2.13 Audit Entry (Aggregate Root)

**Context:** Audit

**Root Entity:** AuditEntry

**Contains:**
- Actor reference (User ID — nullable for system-initiated actions)
- Action (CREATE, UPDATE, DELETE, LOGIN, LOCK, UNLOCK, etc.)
- Entity type and entity ID
- Before-state JSON snapshot
- After-state JSON snapshot
- Timestamp

**Invariants:**
- Audit entries are **append-only** — they are never modified or deleted
- Every write operation on sensitive data must produce an audit entry (enforced structurally via repository decorator, not per-feature)

**Consistency Boundary:** Each audit entry is independently consistent and immutable once written.

---

### 2.14 Backup Record (Aggregate Root)

**Context:** Backup & Recovery

**Root Entity:** BackupRecord

**Contains:**
- File path
- File size
- Creation timestamp
- Creator reference (User ID or "SYSTEM" for scheduled)
- Kind (Manual, Scheduled, Pre-Restore, On-Exit)
- Integrity check result

**Invariants:**
- A backup record is created only after the backup file is successfully written and verified

**Consistency Boundary:** Each backup record is independently consistent.

---

## 3. Entities

Entities are objects with identity — they are distinguishable from other objects of the same type even if all their attributes are identical.

| Entity | Context | Identity | Description |
|---|---|---|---|
| **User** | Identity & Access | UUID | An authenticated person who can use the system |
| **Role** | Identity & Access | UUID + key | A named set of permissions (Owner, Teacher, Assistant, Secretary, Accountant, Custom) |
| **Student** | Student Management | UUID + code + qrToken | A person receiving tutoring |
| **Parent** | Student Management | UUID | A guardian/family member of one or more students |
| **Subject** | Academic Organization | UUID | A taught discipline (Math, Physics, Arabic, etc.) |
| **Group** | Academic Organization | UUID | An organizational unit binding students, a schedule, a teacher, and a pricing model |
| **Enrollment** | Academic Organization | UUID | The binding of a student to a group for a specific period |
| **ClassSession** | Scheduling | UUID | A single, dated occurrence of a group's class |
| **AttendanceRecord** | Attendance | UUID | A per-student, per-session record of attendance |
| **Invoice** | Billing | UUID + number | A monetary obligation for a student |
| **InvoiceLine** | Billing | UUID (within Invoice) | A single charge line within an invoice |
| **Payment** | Payments | UUID | A discrete money-received event |
| **PaymentAllocation** | Payments | UUID (within Payment) | The binding of a payment portion to a specific invoice |
| **FinancialAdjustment** | Billing | UUID | A correction linked to an original invoice/payment/payroll record |
| **Expense** | Financial Operations | UUID | An outgoing cost recorded by the business |
| **IncomeExtra** | Financial Operations | UUID | Non-student income recorded by the business |
| **SalaryRule** | Payroll | UUID | A staff member's compensation configuration |
| **PayrollRun** | Payroll | UUID | A payroll calculation for a specific period |
| **SalaryPayout** | Payroll | UUID (within PayrollRun) | An individual staff member's payout within a payroll run |
| **NotificationTemplate** | Notifications | UUID + key | A reusable message template with variable placeholders |
| **NotificationLog** | Notifications | UUID | A record of a specific notification attempt |
| **AuditEntry** | Audit | UUID | An immutable log of a system action |
| **BackupRecord** | Backup & Recovery | UUID | Metadata about a database backup |

---

## 4. Value Objects

Value objects have no identity — they are defined entirely by their attributes. Two value objects with the same attributes are interchangeable.

---

### 4.1 Money

**Attributes:** `amountMinor` (integer), `currencyCode` (string, always "EGP" in v1.0)

**Rules:**
- All monetary values stored as integers in minor units (piastres for EGP)
- Never a float, never a decimal — anywhere in the financial path
- Rounding follows a single, documented rule (round half-up) applied consistently across all calculation paths
- Currency code is stored at the tenant level and propagated to all monetary operations

---

### 4.2 Phone Number

**Attributes:** `number` (string)

**Rules:**
- Egyptian format validation (01x-xxxx-xxxx)
- Used for duplicate detection during student registration
- Used as the primary search/lookup field

---

### 4.3 Attendance Status

**Possible Values:** `PRESENT`, `LATE`, `ABSENT`, `EXCUSED`

**Rules:**
- `LATE` is auto-assigned when a mark is recorded after the grace period
- `EXCUSED` requires explicit staff action (never auto-assigned)
- Only `ABSENT` (unexcused) has a potential billing consequence
- `EXCUSED` absences are eligible for make-up sessions

---

### 4.4 Session Type

**Possible Values:** `REGULAR`, `EXTRA`, `REVIEW`, `EXAM`, `MAKEUP`

**Rules:**
- `REGULAR` — counted in monthly/session billing
- `EXTRA` — beyond the regular schedule; free by default, chargeable by override
- `REVIEW` — revision-focused; whether it counts toward session quota is configurable
- `EXAM` — assessment; not billed by default
- `MAKEUP` — compensates for a cancelled session; never separately billed

---

### 4.5 Session Status

**Possible Values:** `SCHEDULED`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`

**Rules:**
- `SCHEDULED` → ready for attendance; attendance cannot yet be recorded
- `COMPLETED` → attendance finalized; feeds billing calculations
- `CANCELLED` → excluded from attendance denominator and billing; reason required
- `RESCHEDULED` → original slot cancelled, linked to a new session

---

### 4.6 Invoice Status

**Possible Values:** `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `WRITTEN_OFF`, `VOIDED`

**Rules:**
- `DRAFT` → editable; not yet a formal obligation
- `ISSUED` → immutable; any correction via Financial Adjustment only
- `OVERDUE` → auto-transitions from `ISSUED` or `PARTIALLY_PAID` when past due date
- `VOIDED` → retains its number; gap in sequence is expected

---

### 4.7 Student Status

**Possible Values:** `ACTIVE`, `PAUSED`, `AT_RISK`, `INACTIVE`, `DROPPED_OUT`, `GRADUATED`

**Rules:**
- `ACTIVE` → standard operating state; billing and attendance active
- `PAUSED` → temporary suspension; billing suspended; seat not guaranteed unless explicitly held
- `AT_RISK` → flagged due to consecutive absences; still Active for billing purposes; triggers staff follow-up
- `INACTIVE` → system- or staff-determined; billing stopped; excluded from active dashboards; history preserved
- `DROPPED_OUT` → confirmed intentional exit; manual action only (never automatic); finalizes outstanding balance
- `GRADUATED` → successful exit; distinct from Dropped Out in reporting (success vs. churn)

---

### 4.8 Payment Method

**Possible Values:** `CASH`, `TRANSFER`, `WALLET`, `OTHER`

**Rules:**
- Cash is the dominant method in the Egyptian market
- Transfer includes bank transfers and Instapay
- Wallet includes Vodafone Cash and similar mobile wallets
- The method is recorded for reporting and audit; it does not change business logic

---

### 4.9 Billing Model

**Possible Values:** `MONTHLY`, `PER_SESSION`, `COURSE`, `CUSTOM`

**Rules:**
- Set per group, with student-level override possible via Enrollment
- Determines how invoices are generated and what attendance data (if any) affects the amount

---

### 4.10 Monthly Calculation Method

**Possible Values:** `CALENDAR`, `SESSION_COUNT`, `CUSTOM_CYCLE`

**Rules:**
- `CALENDAR` — bills for the 1st–end of each calendar month, regardless of session count
- `SESSION_COUNT` — a "month" is N sessions, regardless of calendar weeks spanned
- `CUSTOM_CYCLE` — any other recurring period defined by the center

---

### 4.11 Salary Model

**Possible Values:** `FIXED`, `PER_SESSION`, `PER_HOUR`, `COMMISSION`

**Rules:**
- `FIXED` — fixed amount per period
- `PER_SESSION` — rate × sessions delivered (from locked attendance data)
- `PER_HOUR` — rate × hours delivered
- `COMMISSION` — percentage of collected revenue from the teacher's groups

---

### 4.12 Time Slot

**Attributes:** `weekday` (0–6), `startTime` (HH:mm), `endTime` (HH:mm)

**Rules:**
- Used in Group Schedule patterns
- End time must be after start time
- Time is stored and displayed in the tenant's timezone (Africa/Cairo)
- Database stores UTC; localization happens only in the UI

---

### 4.13 Date Range

**Attributes:** `startDate` (date), `endDate` (date, optional)

**Rules:**
- Used for enrollment periods, billing periods, payroll periods
- An open-ended range (no end date) means "ongoing until explicitly ended"

---

### 4.14 Guardian Relation

**Possible Values:** `FATHER`, `MOTHER`, `GUARDIAN`, `OTHER`

**Rules:**
- Describes the relationship between a Parent and a Student
- One parent per student can be flagged as `isPrimary` for notification purposes
- Multiple parents per student is supported (separated parents, multiple guardians)

---

### 4.15 Enrollment Status

**Possible Values:** `ACTIVE`, `PAUSED`, `ENDED`, `TRANSFERRED`

**Rules:**
- `ACTIVE` — student is currently enrolled and the enrollment generates billing/attendance obligations
- `PAUSED` — enrollment is temporarily suspended (maps to student Pause)
- `ENDED` — enrollment is closed (dropout, graduation, or administrative closure)
- `TRANSFERRED` — enrollment was ended because the student moved to a different group

---

### 4.16 Group Status

**Possible Values:** `PLANNED`, `ACTIVE`, `FULL`, `CLOSED`, `ARCHIVED`

**Rules:**
- `PLANNED` — being configured; not yet open for enrollment
- `ACTIVE` — open for enrollment and session delivery
- `FULL` — at capacity; further enrollment governed by capacity policy
- `CLOSED` — no longer accepting enrollments or delivering sessions; history preserved
- `ARCHIVED` — soft-deleted; hidden from active views but fully queryable

---

### 4.17 Automation Level

**Possible Values:** `AUTOMATIC`, `SUGGESTED`, `DISABLED`

**Rules:**
- Applied per-automation-workflow
- `AUTOMATIC` — system acts without human confirmation
- `SUGGESTED` — system proposes the action; staff must confirm or dismiss
- `DISABLED` — must be performed manually
- Pending suggestions never silently expire — they remain visible until acted on

---

## 5. Domain Events

Domain events are notifications that something significant happened in the business domain. They are the primary mechanism for cross-context communication.

---

### 5.1 Student Management Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `StudentRegistered` | studentId, tenantId | A new student record is created | Notifications (optional welcome message) |
| `StudentStatusChanged` | studentId, previousStatus, newStatus, reason, changedBy | A student's status changes | Billing (stop/start invoicing), Notifications (alerts), Reporting (KPIs), Academic (enrollment state) |
| `StudentFlaggedAtRisk` | studentId, consecutiveAbsences | Absence threshold reached | Notifications (staff alert), Reporting (dashboard KPI) |
| `ParentLinked` | studentId, parentId, relation, isPrimary | A parent is linked to a student | Notifications (contact list update) |

---

### 5.2 Academic Organization Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `GroupCreated` | groupId, tenantId, subjectId, pricingModel | A new group is configured | — |
| `GroupStatusChanged` | groupId, previousStatus, newStatus | Group lifecycle transition | Reporting (occupancy KPIs) |
| `StudentEnrolled` | enrollmentId, studentId, groupId, startDate, priceMinor | A student is enrolled in a group | Billing (start invoicing), Scheduling (include in attendance roster), Notifications (enrollment confirmation) |
| `StudentUnenrolled` | enrollmentId, studentId, groupId, endDate, reason | An enrollment ends | Billing (finalize cycle), Scheduling (remove from roster), Notifications (if applicable) |
| `StudentTransferred` | sourceEnrollmentId, targetEnrollmentId, studentId, sourceGroupId, targetGroupId | Student moves between groups | Billing (proration/reconciliation), Notifications |
| `GroupCapacityReached` | groupId, currentCount, capacity | Enrollment reaches capacity | Notifications (staff alert), Academic (enforce policy) |

---

### 5.3 Scheduling Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `SessionScheduled` | sessionId, groupId, startsAt, endsAt, type | A new session is generated or created | Attendance (prepare roster), Notifications (session reminder) |
| `SessionCompleted` | sessionId, groupId, completedAt | A session is marked completed | Attendance (lock records), Billing (per-session calculation), Payroll (count delivered session) |
| `SessionCancelled` | sessionId, groupId, reason, cancelledBy | A session is cancelled | Billing (create make-up entitlement), Attendance (exclude from calculations), Notifications (alert guardians), Payroll (exclude from teacher count) |
| `SessionRescheduled` | originalSessionId, newSessionId, groupId | A session is moved to a new time | Notifications (schedule change alert) |
| `SubstituteAssigned` | sessionId, originalTeacherId, substituteTeacherId | A different teacher covers a session | Payroll (attribute session correctly) |

---

### 5.4 Attendance Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `AttendanceMarked` | attendanceId, sessionId, studentId, status, method | A student's attendance is recorded | Notifications (attendance alert to guardian), Student Management (update absence counter), Billing (per-session data) |
| `AttendanceCorrected` | attendanceId, previousStatus, newStatus, correctedBy, reason | A locked attendance record is reopened and changed | Billing (adjustment trigger), Audit (explicit correction record) |
| `AttendanceLocked` | sessionId | All attendance for a session is locked | Billing (safe to calculate), Payroll (safe to calculate) |

---

### 5.5 Billing Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `InvoiceGenerated` | invoiceId, studentId, totalMinor, periodStart, periodEnd | A new invoice is created | Notifications (invoice issued alert) |
| `InvoiceStatusChanged` | invoiceId, previousStatus, newStatus | Invoice lifecycle transition | Notifications (overdue reminder), Reporting (KPIs), Dashboard |
| `InvoiceOverdue` | invoiceId, studentId, daysOverdue, amountOwedMinor | Invoice past due date | Notifications (payment reminder), Dashboard (outstanding balance) |
| `CreditCreated` | studentId, amountMinor, reason | A credit is placed on a student's account | Billing (auto-apply to next invoice) |
| `AdjustmentCreated` | adjustmentId, linkedInvoiceId, amountMinor, reason | A financial correction is recorded | Audit, Reporting |
| `MakeUpEntitlementCreated` | studentId, originalSessionId, reason | A student earns a make-up session | Scheduling (track entitlement), Notifications |

---

### 5.6 Payment Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `PaymentReceived` | paymentId, studentId, amountMinor, method | Money is recorded | Billing (update invoice status), Notifications (payment confirmation), Dashboard (revenue KPI) |
| `PaymentAllocated` | paymentId, invoiceId, amountMinor | Payment is applied to an invoice | Billing (update invoice paidMinor and status) |
| `RefundIssued` | refundId, originalPaymentId, amountMinor, reason, approvedBy | A refund is processed | Billing (adjust recognized revenue), Notifications (refund confirmation), Audit |

---

### 5.7 Financial Operations Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `ExpenseRecorded` | expenseId, categoryId, amountMinor | An expense is entered | Dashboard (P&L), Reporting (financial reports), Cashbox |
| `IncomeRecorded` | incomeId, categoryId, amountMinor | Non-student income is entered | Dashboard (P&L), Reporting, Cashbox |
| `CashboxEntryCreated` | entryId, type (in/out), amountMinor | Cash moves in/out | Reporting (reconciliation) |

---

### 5.8 Payroll Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `PayrollCalculated` | payrollRunId, period, totalAmountMinor | A payroll run is drafted | — (awaits finalization) |
| `PayrollFinalized` | payrollRunId | A payroll run is locked | Financial Operations (expense recording), Audit |
| `SalaryPaid` | payrollRunId, userId, amountMinor | A staff member is paid | Cashbox, Audit |
| `AdvanceRecorded` | userId, amountMinor | An advance is given to a staff member | Payroll (deduction in next run), Audit |

---

### 5.9 System Events

| Event | Payload | Raised When | Consumers |
|---|---|---|---|
| `BackupCompleted` | backupId, filePath, sizeBytes, kind | A backup finishes successfully | Dashboard (last backup status) |
| `BackupFailed` | reason | A backup fails | Dashboard (alert), Notifications (staff alert) |
| `IntegrityCheckCompleted` | result (pass/fail), details | Nightly integrity check runs | Dashboard (health indicator) |
| `SettingsChanged` | settingKey, previousValue, newValue, changedBy | A global setting is modified | Audit, affected contexts |
| `UserLoggedIn` | userId | A user authenticates | Audit |
| `SessionLocked` | userId | Screen auto-locks | Audit |

---

## 6. Domain Services

Domain services encapsulate business logic that doesn't naturally belong to a single entity or aggregate. They orchestrate operations across aggregates and enforce cross-cutting business rules.

---

### 6.1 Enrollment Service

**Context:** Academic Organization

**Responsibilities:**
- Validate enrollment eligibility (capacity check, duplicate check, status check)
- Execute mid-cycle proration calculation (delegates to Billing Service for the actual math)
- Coordinate transfer workflow (end source enrollment, create target enrollment, trigger reconciliation)
- Enforce group capacity policy (Hard/Soft/None)

**Key Operations:**
- `enroll(studentId, groupId, startDate, priceOverride?)` → creates Enrollment, emits `StudentEnrolled`
- `transfer(studentId, sourceGroupId, targetGroupId, effectiveDate)` → ends source, creates target, emits `StudentTransferred`
- `pauseEnrollment(enrollmentId, reason)` → pauses enrollment, emits `StudentUnenrolled` variant
- `endEnrollment(enrollmentId, reason)` → closes enrollment, emits `StudentUnenrolled`

---

### 6.2 Session Generation Service

**Context:** Scheduling

**Responsibilities:**
- Generate ClassSession occurrences from a Group's recurring schedule pattern
- Handle bulk generation for a date range (e.g., generate all sessions for the next month)
- Detect and flag scheduling conflicts (same teacher, same room, same time)
- Create linked sessions for make-ups and reschedules

**Key Operations:**
- `generateSessions(groupId, fromDate, toDate)` → creates ClassSession records, emits `SessionScheduled` for each
- `cancelSession(sessionId, reason, cancelledBy)` → transitions session, emits `SessionCancelled`
- `rescheduleSession(sessionId, newStartsAt, newEndsAt)` → creates new session, links to original, emits `SessionRescheduled`
- `createMakeUpSession(originalSessionId, newStartsAt, newEndsAt)` → creates linked make-up session

---

### 6.3 Attendance Service

**Context:** Attendance

**Responsibilities:**
- Provide the **single write path** for all attendance methods (Manual, Search, QR-Mobile, QR-USB)
- Enforce session-open validation (can't mark attendance for a non-Scheduled session)
- Classify late arrivals based on grace period
- Suppress duplicate scans
- Lock attendance on session completion (or after configurable buffer)
- Manage attendance reopening (permission check, audit log)
- Maintain the consecutive-absence counter per student

**Key Operations:**
- `markAttendance(sessionId, studentId, method, markedBy)` → creates/updates record, emits `AttendanceMarked`
- `correctAttendance(attendanceId, newStatus, reason, correctedBy)` → requires reopening, emits `AttendanceCorrected`
- `lockSessionAttendance(sessionId)` → locks all records for a session, emits `AttendanceLocked`

---

### 6.4 Billing Engine

**Context:** Billing

**Responsibilities:**
- Generate invoices based on billing model, calculation method, and enrollment data
- Calculate proration for mid-cycle enrollments
- Apply discounts and scholarships in the correct order
- Determine absence-charging effects based on policy
- Apply credits to new invoices
- Generate Financial Adjustments when corrections are needed
- Track make-up entitlements from teacher cancellations
- Manage receipt numbering
- Transition invoice status on payment events

**Key Operations:**
- `generateInvoice(enrollmentId, period)` → creates Invoice with line items, emits `InvoiceGenerated`
- `generateBulkInvoices(groupId, period)` → generates invoices for all active enrollments in a group
- `calculateProration(enrollmentStartDate, billingPeriod, billingModel, price)` → returns prorated amount
- `applyDiscount(invoiceId, discountType, amount, reason, appliedBy)` → creates adjustment
- `voidInvoice(invoiceId, reason, voidedBy)` → transitions status, emits `InvoiceStatusChanged`
- `createAdjustment(linkedRecordId, amountMinor, reason, createdBy)` → creates FinancialAdjustment, emits `AdjustmentCreated`

---

### 6.5 Payment Service

**Context:** Payments

**Responsibilities:**
- Record incoming payments
- Allocate payments to specific invoices (always explicit, never automatic guessing)
- Suggest allocation to the oldest open invoice (user may override or split)
- Process refunds with approval enforcement
- Track unallocated credit

**Key Operations:**
- `recordPayment(studentId, amount, method, receivedBy, notes)` → creates Payment, emits `PaymentReceived`
- `allocatePayment(paymentId, invoiceId, amount)` → creates PaymentAllocation, emits `PaymentAllocated`
- `processRefund(originalPaymentId, amount, reason, requestedBy, approvedBy?)` → creates negative Payment, emits `RefundIssued`

---

### 6.6 Payroll Engine

**Context:** Payroll

**Responsibilities:**
- Calculate per-staff compensation based on salary rules and locked operational data
- Read only from locked attendance records and finalized invoices
- Apply advance deductions
- Generate payroll drafts for staff review before finalization
- Prevent retroactive edits to finalized payroll

**Key Operations:**
- `calculatePayroll(period)` → creates PayrollRun draft with per-staff entries, emits `PayrollCalculated`
- `finalizePayroll(payrollRunId)` → locks the run, emits `PayrollFinalized`
- `recordPayout(payrollRunId, userId, amountMinor, method)` → records payment to staff, emits `SalaryPaid`
- `recordAdvance(userId, amountMinor, notes)` → records an advance, emits `AdvanceRecorded`

---

### 6.7 Notification Engine

**Context:** Notifications

**Responsibilities:**
- React to domain events by queuing notifications based on trigger configuration
- Render templates with variable substitution (validate all variables are resolved)
- Respect delivery schedule offsets and quiet hours
- Manage retry queue for failed deliveries
- Log every delivery attempt

**Key Operations:**
- `queueNotification(triggeredBy, recipientId, templateKey, variables, channel?)` → creates queued NotificationLog entry
- `processQueue()` → renders templates, dispatches via appropriate channel adapter, updates status
- `retryFailed()` → retries failed notifications up to max attempts

---

### 6.8 Student Status Service

**Context:** Student Management

**Responsibilities:**
- React to attendance events by updating the consecutive-absence counter
- Evaluate the counter against the Student Status Policy threshold
- Transition student status (At-Risk, Inactive) based on policy
- Respect the Automation Level setting (Automatic/Suggested/Disabled) for each transition

**Key Operations:**
- `evaluateStudentStatus(studentId)` → checks absence counter against policy, may transition status or create suggestion
- `manualStatusChange(studentId, newStatus, reason, changedBy)` → explicit staff-initiated status change

---

### 6.9 Cashbox Service

**Context:** Financial Operations

**Responsibilities:**
- Record every cash movement (in and out) as a discrete, timestamped entry
- Derive the current balance from the sum of all entries (never a manually editable number)
- Support reconciliation with financial reports

**Key Operations:**
- `recordEntry(type, amountMinor, reference, notes)` → creates cashbox entry, emits `CashboxEntryCreated`
- `getBalance()` → returns derived sum of all entries
- `reconcile(periodStart, periodEnd)` → compares cashbox balance against payment and expense totals for the period

---

### 6.10 Backup Service

**Context:** Backup & Recovery

**Responsibilities:**
- Create timestamped backup files
- Run scheduled backups on a configurable cadence
- Create pre-restore safety backups
- Verify database integrity before and after restore
- Manage the restore workflow (confirmation, validation, application restart)

**Key Operations:**
- `createBackup(kind, triggeredBy)` → creates backup file, emits `BackupCompleted` or `BackupFailed`
- `runIntegrityCheck()` → executes `PRAGMA integrity_check`, emits `IntegrityCheckCompleted`
- `restoreFromBackup(backupId, confirmedBy)` → pre-restore backup, validate, swap, restart

---

## 7. Policies

Policies are configurable business rules that govern behavior across the system. They follow the hierarchy: **Global Default → Group Override → Student/Enrollment Override**, where each level can optionally override the one above it.

---

### 7.1 Attendance Policy

**Scope:** Global, overridable per group

| Setting | Default | Options |
|---|---|---|
| Enabled methods | All (Manual, Search, QR-Mobile, QR-USB) | Any combination |
| Grace period (minutes) | 10 | Any non-negative integer |
| Attendance editing after lock | Requires permission | Allowed freely / Requires permission / Blocked |
| Auto-lock timing | Immediate on session completion | Immediate / N-hour buffer / End-of-day |

---

### 7.2 Billing Policy

**Scope:** Global, overridable per group

| Setting | Default | Options |
|---|---|---|
| Default billing model | Monthly | Monthly / Per-Session / Course / Custom |
| Monthly calculation method | Calendar | Calendar / Session-Count / Custom Cycle |
| Proration for mid-cycle enrollment | Enabled | Enabled / Disabled (full price always) |
| Payment timing | In-advance | In-advance / In-arrears |
| Payment grace period (days) | 7 | Any non-negative integer |
| Late fee | None | None / Flat amount / Percentage |
| Absence charging | Charge unless excused | Always / Never / Unless Excused |

---

### 7.3 Student Status Policy

**Scope:** Global

| Setting | Default | Options |
|---|---|---|
| At-risk threshold (consecutive absences) | 3 | Any positive integer |
| Inactive threshold (consecutive absences or weeks) | 4 weeks | Any positive integer (sessions or weeks) |
| Inactive transition mode | Automatic | Automatic / Suggested / Disabled |
| Cleanup flag for never-enrolled students (days) | 60 | Any positive integer |

---

### 7.4 Group Capacity Policy

**Scope:** Global, overridable per group

| Setting | Default (Private Tutor) | Default (Tutoring Center) | Options |
|---|---|---|---|
| Capacity enforcement | Soft (warn only) | Hard (block) | Hard / Soft / None |
| Waiting list | Disabled | Enabled | Enabled / Disabled |
| Override requires | — | Owner/Manager approval | Any role |

---

### 7.5 Teacher Policy

**Scope:** Global

| Setting | Default | Options |
|---|---|---|
| Can cancel/reschedule independently | Yes (Private Tutor) / No (Center) | Yes / No (requires approval) |
| Can view billing info for own students | No | Yes / No |
| Default payroll basis | N/A (Private Tutor) / Fixed (Center) | Fixed / Per-Session / Per-Hour / Commission |

---

### 7.6 Financial Policy

**Scope:** Global

| Setting | Default | Options |
|---|---|---|
| Base currency | EGP | (Fixed for v1.0) |
| Rounding rule | Round half-up to nearest piastre | (Fixed — single documented rule) |
| Discount approval threshold | None (all discounts logged) | None / Amount threshold |
| Refund second-approver threshold | Any refund | None / Amount threshold |

---

### 7.7 Notification Policy

**Scope:** Global, overridable per event type

| Setting | Default | Options |
|---|---|---|
| Default channel | Internal | Internal / WhatsApp / SMS / Email |
| Quiet hours | 10 PM – 7 AM | Any time range |
| Payment reminder schedule | Day 3 + Day 10 after due | Configurable N reminders at configurable offsets |
| Max retry attempts | 3 | Any positive integer |

---

### 7.8 Automation Policy

**Scope:** Global, per-workflow

| Workflow | Default Level | Options |
|---|---|---|
| Flag student at-risk | Automatic | Automatic / Suggested / Disabled |
| Transition student to Inactive | Automatic | Automatic / Suggested / Disabled |
| Generate invoices | Automatic | Automatic / Suggested (draft review) / Disabled (manual) |
| Send payment reminders | Automatic | Automatic / Suggested / Disabled |
| Block enrollment when group full | Per capacity policy | Automatic / Suggested / Disabled |
| Restrict attendance for unpaid students | Disabled | Automatic / Suggested / Disabled |

---

## 8. Cross-Context Communication

Bounded contexts communicate through **domain events** — never by directly accessing another context's data store or internal objects. This section defines the producer-consumer relationships.

---

### 8.1 Context Map

```
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────┐
│  Identity &     │────▶│  ALL CONTEXTS         │     │  Audit         │
│  Access         │     │  (actor identity for  │◀────│  (observes all │
│                 │     │   every operation)     │     │   write ops)   │
└─────────────────┘     └──────────────────────┘     └────────────────┘

┌─────────────────┐     ┌──────────────────────┐     ┌────────────────┐
│  Student        │────▶│  Academic             │────▶│  Scheduling    │
│  Management     │     │  Organization         │     │                │
└────────┬────────┘     └──────────┬───────────┘     └───────┬────────┘
         │                         │                          │
         │                         │                          │
         │                         ▼                          ▼
         │              ┌──────────────────────┐     ┌────────────────┐
         │              │  Billing              │◀───│  Attendance    │
         │              │                       │     │                │
         │              └──────────┬───────────┘     └────────────────┘
         │                         │
         │                         ▼
         │              ┌──────────────────────┐     ┌────────────────┐
         │              │  Payments             │────▶│  Financial     │
         │              │                       │     │  Operations    │
         │              └──────────────────────┘     └───────┬────────┘
         │                                                    │
         │                                                    ▼
         │                                           ┌────────────────┐
         └──────────────────────────────────────────▶│  Payroll       │
                                                     └────────────────┘

┌─────────────────┐     ┌──────────────────────┐     ┌────────────────┐
│  System         │     │  Notifications        │◀───│  ALL CONTEXTS  │
│  Administration │     │  (reacts to events    │     │  (event        │
│                 │     │   from all contexts)  │     │   producers)   │
└─────────────────┘     └──────────────────────┘     └────────────────┘

┌─────────────────┐     ┌──────────────────────┐
│  Backup &       │     │  Reporting &          │◀─── ALL CONTEXTS
│  Recovery       │     │  Analytics            │     (read-only consumer)
└─────────────────┘     └──────────────────────┘
```

---

### 8.2 Event Flow Chains

**Chain 1: Student Enrollment → Invoice Generation**
```
Academic: StudentEnrolled
  → Billing: generates invoice for the enrollment period (with proration if mid-cycle)
    → Billing: InvoiceGenerated
      → Notifications: sends enrollment confirmation + invoice to guardian
```

**Chain 2: Session Completed → Attendance Locked → Billing + Payroll**
```
Scheduling: SessionCompleted
  → Attendance: locks all attendance records for the session
    → Attendance: AttendanceLocked
      → Billing: per-session billing calculations now safe
      → Payroll: session now counted toward teacher compensation
```

**Chain 3: Attendance Marked → At-Risk Detection → Notifications**
```
Attendance: AttendanceMarked (status = ABSENT)
  → Student Management: increments consecutive-absence counter
    → Student Management: if counter ≥ threshold → StudentFlaggedAtRisk
      → Notifications: alerts staff to follow up
```

**Chain 4: Teacher Cancels Session → Make-Up + Notifications**
```
Scheduling: SessionCancelled (reason = teacher_unavailable)
  → Billing: creates make-up entitlement for each enrolled student
    → Billing: MakeUpEntitlementCreated
  → Notifications: alerts guardians of cancellation
  → Payroll: excludes session from teacher's count
```

**Chain 5: Payment → Invoice Update → Dashboard**
```
Payments: PaymentReceived
  → Payments: PaymentAllocated (to specific invoice)
    → Billing: updates invoice paidMinor and status
      → Billing: InvoiceStatusChanged
        → Dashboard: outstanding balance KPI recalculated
  → Notifications: payment confirmation to guardian
  → Financial Operations: cashbox entry (if cash)
```

**Chain 6: Invoice Overdue → Reminder Escalation**
```
Billing: InvoiceOverdue
  → Notifications: sends first reminder (Day 3)
  → (if still unpaid) Notifications: sends escalation reminder (Day 10)
  → (if still unpaid after all reminders) Dashboard: flags for manual follow-up
```

---

### 8.3 Shared Kernel

The following concepts are shared across contexts via a shared contracts package (not by reaching into another context's internals):

| Shared Concept | Format | Used By |
|---|---|---|
| Entity IDs | UUID strings | All contexts (referencing entities across boundaries) |
| Money | `{ amountMinor: number, currencyCode: string }` | Billing, Payments, Financial Operations, Payroll |
| Tenant ID | UUID string | All contexts (multi-tenant scoping) |
| Timestamps | UTC DateTime | All contexts |
| Enums | String unions (StudentStatus, InvoiceStatus, etc.) | Contexts that need to interpret another context's states |

---

## 9. Ubiquitous Language

The ubiquitous language is the shared vocabulary between domain experts (tutors, center owners) and developers. Every term below has one and only one meaning in this system. Code, documentation, and conversation should all use these terms identically.

| Term | Definition | NOT to be confused with |
|---|---|---|
| **Student** | A person receiving tutoring, identified by a profile and QR code | A "user" (students are not system users in v1.0) |
| **Parent / Guardian** (ولي الأمر) | A family member responsible for a student, usually the payer and communication recipient | A "user" (parents are not system users in v1.0) |
| **Group** (مجموعة) | An organizational unit — a set of students who meet at a fixed schedule to study a subject with a teacher | A "class" (ambiguous), a "section" (too generic) |
| **Subject** (مادة) | A taught discipline (Math, Physics, Arabic, etc.) | A "course" (which implies a defined start/end and curriculum) |
| **Enrollment** (تسجيل في مجموعة) | The binding of a student to a group for a specific period, carrying its own pricing and status | "Registration" (registration is creating a student record; enrollment is joining a group) |
| **Class Session** (حصة) | A single, dated occurrence of a group's class (e.g., "Group A's session on Tuesday, July 8") | A "user session" (login/auth state), a "schedule" (the pattern, not the occurrence) |
| **Attendance** (حضور) | A per-student, per-session record indicating whether the student was present, late, absent, or excused | — |
| **Invoice** (فاتورة) | A monetary obligation generated by the system or created manually, representing what a student owes | A "bill" (same meaning, but "invoice" is the canonical term), a "payment" (which is money received) |
| **Payment** (دفعة) | A discrete event of money being received from a guardian/student | An "invoice" (which is a charge, not a receipt) |
| **Allocation** (توزيع) | The binding of a portion of a payment to a specific invoice | — |
| **Credit** (رصيد) | A positive balance on a student's account from overpayment, cancellation, or goodwill | A "discount" (which reduces a charge; a credit reduces a balance) |
| **Discount** (خصم) | A reduction applied to a specific invoice or ongoing price, always logged with a reason | A "scholarship" (which is a structural, long-term pricing override) |
| **Scholarship** (منحة) | A persistent, enrollment-level pricing override (e.g., 50% off for the duration of enrollment) | A "discount" (which is typically ad-hoc and short-term) |
| **Financial Adjustment** (تسوية مالية) | A manual correction linked to an original record, with a mandatory reason | An "edit" (adjustments never edit the original; they add a new linked record) |
| **Expense** (مصروفات) | An outgoing cost recorded by the business (rent, utilities, supplies, etc.) | A "payment" (which is incoming money from a student) |
| **Salary Rule** (قاعدة الراتب) | The configured basis for calculating a staff member's compensation | A "salary" (which is the calculated/paid amount; the rule is the configuration) |
| **Payroll Run** (دورة الرواتب) | The calculation of what every staff member is owed for a specific period | A "payout" (which is the actual payment; the run is the calculation) |
| **Make-Up Session** (حصة تعويضية) | A session that compensates for a cancelled session; never separately billed | An "extra session" (which is additional, not compensatory) |
| **Transfer** (نقل) | Moving a student from one group to another, preserving history in both | "Unenroll and re-enroll" (a transfer is a single business operation with financial reconciliation) |
| **Pause** (إيقاف مؤقت) | A temporary, student-initiated suspension of enrollment | "Inactive" (which is system/staff-determined, not student-initiated) |
| **At-Risk** (مهدد بالتسرب) | A student flagged due to consecutive absences exceeding a threshold | "Inactive" (at-risk is a warning state; inactive is a terminal state) |
| **Dropout** (انسحاب) | A confirmed, intentional exit from enrollment — a manual action, never automatic | "Inactive" (which is an inferred state); "Graduated" (which is a positive exit) |
| **Graduated** (تخرج) | A student completing a course/level/program — a positive exit metric | "Dropout" (which is a negative exit metric) |
| **Cashbox** (الصندوق) | A running ledger of physical cash, with a derived (never manually edited) balance | A "bank account" (the cashbox is physical cash on premises) |
| **Tenant** (المؤسسة) | The top-level account boundary — an individual tutor today, a tutoring center with branches tomorrow | A "user" (a tenant contains many users) |
| **Audit Entry** (سجل التدقيق) | An immutable log record of who did what, when, and what changed | A "history" (audit is structural and comprehensive; "history" is informal) |
| **Business Type** | Private Tutor or Tutoring Center — set once during onboarding, affects default behaviors | A "setting" (changing business type is a migration event, not a toggle) |

---

## 10. Future Evolution

This section documents known areas where the domain model will need to expand. These are NOT in scope for v1.0, but the v1.0 model is designed to accommodate them without restructuring.

---

### 10.1 Multi-Branch Operations

**When:** v2.0+ (Tutoring Center scale-up)

**Impact on Domain Model:**
- The `Tenant` aggregate gains a child `Branch` entity
- Groups, Sessions, and Expenses become branch-scoped (via `branchId`, already nullable in the data model)
- Reporting context gains branch-level filtering and cross-branch aggregation
- Identity & Access gains branch-scoped role assignments (a teacher may work at multiple branches)

**Why the current model accommodates this:** `tenantId` is already present on every aggregate. `branchId` is pre-defined as nullable on hot tables. The context boundaries don't change — only the scoping within contexts expands.

---

### 10.2 Cloud Sync

**When:** v1.1+ 

**Impact on Domain Model:**
- Every writable aggregate gains a monotonic `rev` field for delta sync
- A new `Sync` bounded context emerges, responsible for conflict detection and resolution
- The Backup & Recovery context gains cloud-backup capabilities
- All events gain optional sync metadata (client origin, server-assigned rev)

**Why the current model accommodates this:** UUID primary keys prevent ID collisions across synced instances. The event-driven architecture means the Sync context can subscribe to all domain events for change tracking. The shared kernel already defines timestamp and ID formats compatible with multi-device sync.

---

### 10.3 Parent/Student Portal

**When:** v2.0+

**Impact on Domain Model:**
- Identity & Access gains external user types (Parent, Student) with read-only or limited-write permissions
- Student Management gains a self-service profile view
- Billing gains a guardian-facing invoice/payment history view
- Attendance gains a guardian-facing attendance view
- Notifications gains bidirectional messaging (currently outbound-only)

**Why the current model accommodates this:** The separation of Parent and Student as distinct aggregates (not embedded in User) means they can later become authenticated portal users without restructuring the Student Management context. The RBAC model supports role-based scoping that can restrict portal users to only their own student's data.

---

### 10.4 External Messaging Providers

**When:** v1.1+

**Impact on Domain Model:**
- No domain model changes — only infrastructure adapter changes
- The Notification context's channel-agnostic design means WhatsApp, SMS, and Email adapters plug in without modifying any business rules or event definitions

**Why the current model accommodates this:** The Notification context deliberately separates *what* triggers a notification and *when* from *how* it's delivered. Provider-specific concerns (API keys, rate limits, delivery receipts) live in infrastructure adapters outside the domain model.

---

### 10.5 Financial Year Close & Tax Modules

**When:** v2.0+

**Impact on Domain Model:**
- Financial Operations gains a "Period Close" concept (monthly and annual)
- A new Tax context may emerge for Egyptian tax compliance
- Reporting gains year-end roll-up reports

**Why the current model accommodates this:** All financial data already carries timestamps and period markers. The immutability of issued invoices and the adjustment-based correction model mean closed periods are already architecturally safe — no past record can be silently modified.

---

### 10.6 Advanced Academic Features

**When:** v1.x+

**Impact on Domain Model:**
- The Academic Organization context gains Curriculum, Level, and Progression entities
- Exam and Homework may evolve from simple entities to richer aggregates with rubrics, question banks, etc.
- A new "Gradebook" context may emerge if academic tracking becomes complex enough to warrant its own bounded context

**Why the current model accommodates this:** Homework and Exam are already defined as separate entities with extensible attributes. Subject and Grade are already captured. The context boundary between Academic Organization and a future Gradebook context is clean.

---

### 10.7 Database Migration (SQLite → PostgreSQL/SQL Server)

**When:** When multi-branch or cloud operations demand it

**Impact on Domain Model:**
- **No domain model changes** — the domain model is database-agnostic
- Implementation changes: Prisma provider swap, money storage (still integer minor units), connection pooling

**Why the current model accommodates this:** Money is stored as integers (no float/decimal concerns). UUIDs are used as primary keys (no auto-increment issues). The domain model describes business reality, not database structure.

---

*End of Domain Model v1.0.*

*This document is the canonical business domain model for Genius Center. Only after it is approved should database schemas, Prisma models, module specifications, or implementation code be created. All implementation artifacts must be traceable back to concepts defined here.*
