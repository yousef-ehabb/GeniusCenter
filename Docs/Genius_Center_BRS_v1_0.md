# Genius Center — Business Rules Specification (BRS)

**Version:** 1.0
**Companion Document:** Genius Center PRD v2.0
**Status:** Draft for stakeholder review
**Scope:** Business logic, operational workflows, and policy rules for tutoring center/private tutor management

---

## 1. Purpose

The Product Requirements Document (PRD) defines **what** Genius Center is: its modules, technology stack, data model, and system architecture. It answers the engineering question of what needs to be built.

This Business Rules Specification (BRS) exists to answer a different question: **how should the system behave in every real-life situation a tutor or tutoring center actually encounters?**

A tutoring platform is not just a database with a UI on top of it. It is a system that has to reflect decisions tutors already make every day, often informally — decisions about who gets charged when they miss a session, whether a late arrival counts as absence, what happens when a teacher cancels, or how a student who disappears for two months should be treated in the system. If these decisions are not written down explicitly, they end up being decided arbitrarily inside code, differently by different developers, at different points in time — which produces inconsistent and untrustworthy software.

The BRS is written so that:

- **Developers** know exactly what to implement, without guessing at business intent.
- **QA engineers** have a concrete, testable definition of "correct behavior" for every scenario, including edge cases.
- **Designers** understand the behavior they need to support, even if this document deliberately avoids visual design.
- **Business stakeholders** (tutors, center owners, administrators) can review, challenge, and approve the actual rules that will govern their business — before those rules are frozen into code.

This document is **complementary to the PRD, not a replacement for it.** The PRD remains the single source of truth for architecture, modules, and data structures. The BRS is the single source of truth for policies, workflows, and business logic. Where the PRD says "the system has an Attendance module," the BRS says "here is every rule that determines what a valid attendance record is, who can create it, and what happens as a result of it."

Wherever a rule described here implies a data field, workflow trigger, or module capability, it is assumed the PRD's architecture can support it. If a conflict is discovered between this document and the PRD, it should be raised as an explicit **Open Question** (see Section 16) rather than silently resolved by either document.

---

## 2. Business Philosophy

Genius Center is built to serve real tutoring businesses in Egypt — ranging from a single private tutor running one-on-one sessions from a small office, to a multi-branch tutoring center with dozens of teachers, hundreds of students, and multiple daily session slots. These businesses do not all work the same way, and the system must not force them to.

The following principles guide every business rule in this document:

**2.1 The system should adapt to the tutor's workflow, not the other way around.**
Tutors already have working (if informal) processes for attendance, billing, and student management. Genius Center should digitize and enforce those processes, not impose a foreign workflow that requires the business to change how it operates just to use the software.

**2.2 Business rules should be configurable, not assumed.**
What counts as "late," how a monthly fee is calculated, whether an absent student is charged — these vary from one tutor to another, and sometimes from one group to another within the same center. The system must expose these as settings, not bury them as fixed logic.

**2.3 No business logic should be hardcoded.**
Any rule that could plausibly differ between two real tutoring businesses must live in configuration, not in application code. Hardcoding a policy (e.g., "absences are never billed") turns a business decision into a permanent constraint that only a developer can change later.

**2.4 Global defaults, with per-group or per-student overrides.**
A center should be able to set sensible defaults once (e.g., a standard monthly fee, a standard attendance policy) and then override them for specific groups, specific students, or specific circumstances (e.g., a scholarship student, an exam-prep group with a different billing cycle) — without duplicating configuration everywhere.

**2.5 Offline-first.**
Internet connectivity in many tutoring centers, especially outside major cities, is inconsistent. Attendance, in particular, must be recordable without an active connection and synced later. No core daily operation should hard-depend on real-time connectivity.

**2.6 Historical data must be preserved, never silently overwritten.**
When a student transfers groups, a price changes, or a teacher is reassigned, the system must preserve what was true *at the time* — for billing accuracy, dispute resolution, and reporting. Changing a setting today should not silently rewrite yesterday's invoices or attendance records.

**2.7 Every financial operation must be auditable.**
Money is the most sensitive part of this system. Every charge, discount, refund, and payment must be traceable to who performed it, when, and why. "Silent" financial edits are not permitted anywhere in the system.

**2.8 Favor explicit business reasoning over technical convenience.**
Where a rule could be implemented in a way that is easier for engineering but less faithful to how the business actually works, the business reality takes precedence. This document exists specifically to protect that priority.

---

## 3. Global Business Policies

Global policies are the top-level configuration switches that define how a specific tutoring business operates. Every policy in this section has a system-wide default, and — unless stated otherwise — can be overridden at the group or student level (see Sections 4 and 5).

### 3.1 Business Type

The system must support two fundamentally different operating modes, selected during setup:

| Setting | Private Tutor | Tutoring Center |
|---|---|---|
| Number of teachers | One (the owner) | Multiple, with roles/permissions |
| Groups | Typically small, owner-taught | Many groups, cross-teacher |
| Billing entity | The tutor | The center (teachers may or may not be paid a cut) |
| Reporting focus | Personal income, student list | Center-wide financial and operational KPIs |
| Payroll module | Not applicable | Applicable (Section 9) |

Business Type is set once during onboarding and changes to it later (e.g., a private tutor growing into a center) must be treated as a **migration event**, not a simple settings toggle — existing data must be reinterpreted (e.g., the owner becomes "Teacher #1" with associated payroll records).

### 3.2 Attendance Policy

Defines, by default:
- Which attendance methods are enabled (manual, QR, USB scanner, search — see Section 7).
- What counts as "late" (e.g., grace period in minutes after session start).
- Whether attendance can be edited after the session ends, and by whom.
- Whether unexcused absence has an automatic financial consequence (linked to Billing Policy).

### 3.3 Billing Policy

Defines, by default:
- Billing model: monthly, per-session, per-course, or custom (Section 8).
- Whether new students are charged full price or a prorated amount depending on enrollment date.
- Whether the center bills in advance (start of month) or in arrears (end of month).
- Default grace period before a payment is considered "late."

### 3.4 Notification Policy

Defines, by default:
- Which events trigger a notification (Section 10).
- Default channel(s): SMS, WhatsApp, in-app, email — dependent on what the PRD's technology stack supports.
- Quiet hours during which non-urgent notifications are queued rather than sent immediately.

### 3.5 Student Status Policy

Defines, by default:
- After how many consecutive unexplained absences a student is automatically flagged "at risk."
- After how long a student is automatically moved from "Active" to "Inactive" (Section 4.5).
- Whether moving to "Inactive" is fully automatic, or requires staff confirmation.

### 3.6 Group Capacity Policy

Defines, by default:
- Whether groups have a hard capacity limit or a soft (warn-but-allow) limit.
- Whether a waiting list is enabled when a group is full.
- Whether exceeding capacity requires explicit manager/owner approval.

### 3.7 Teacher Policy

Defines, by default:
- Whether teachers can independently cancel/reschedule sessions or require approval.
- Whether teachers can see/edit billing information for their own students, or only attendance and academic data.
- Default payroll basis: fixed salary, per-session rate, per-student rate, or percentage of collected revenue (Section 9).

### 3.8 Financial Policy

Defines, by default:
- Base currency and rounding rules (relevant given EGP is typically whole-pound in practice).
- Whether discounts require approval above a certain threshold.
- Whether refunds require a second approver (four-eyes principle) above a certain amount.

### 3.9 Automation Policy

Defines, by default, whether each automated workflow in Section 11 is:
- **Fully automatic** (system acts without human confirmation),
- **Suggested** (system proposes the action, a staff member confirms), or
- **Disabled** (must be performed manually).

This distinction matters enormously in practice: many tutors are comfortable with the system *flagging* an overdue invoice, but not with the system *automatically* removing a student from a group over an unpaid bill. Automation Policy is what lets both preferences coexist in the same product.

---

## 4. Student Business Rules

Every rule in this section follows the same structure: **Description**, **Configuration**, **Default Behavior**, **Edge Cases**.

### 4.1 Registration

**Description:** The process of creating a new student record in the system before any enrollment takes place.

**Configuration:** Which fields are mandatory (name, phone, parent phone, school/grade, ID) can be configured per center; some centers register informally (name + phone only) and complete the profile later.

**Default Behavior:** A student can be registered without being enrolled in any group. Registration alone does not trigger billing.

**Edge Cases:**
- Duplicate registration (same phone number, similar name): the system should warn, not block, since siblings may share a guardian phone.
- A student registered but never enrolled within a configurable period (e.g., 60 days) should be flagged for cleanup, not silently deleted.

### 4.2 Enrollment

**Description:** Attaching a registered student to a specific group, which is what actually starts billing and attendance tracking.

**Configuration:** Whether enrollment requires an upfront payment (registration fee) before the student attends the first session.

**Default Behavior:** Enrollment date is recorded and used as the reference point for prorated billing (Section 8.3). A student may be enrolled in multiple groups simultaneously (Section 4.9).

**Edge Cases:**
- Mid-cycle enrollment: billing must prorate based on Billing Policy, not charge a full month by default.
- Enrollment into a group that is already at capacity: governed by Group Capacity Policy (3.6).

### 4.3 Transfer

**Description:** Moving a student from one group to another (e.g., changing time slot, level, or teacher).

**Configuration:** Whether a transfer requires the current billing cycle to close first, or can happen mid-cycle with prorated adjustment.

**Default Behavior:** A transfer preserves the student's attendance and payment history under the original group; it does not delete or merge history. The new group's price and schedule apply from the transfer date forward.

**Edge Cases:**
- Transfer to a group with a different price mid-cycle: system must calculate a fair adjustment (credit or additional charge), not simply switch the price going forward and ignore the difference already paid.
- Transfer requested by parent vs. initiated by staff due to a scheduling conflict: both must be supported, with the reason logged.

### 4.4 Pause

**Description:** A temporary, student-initiated suspension of enrollment (e.g., travel, illness) with an expected return.

**Configuration:** Maximum pause duration before the student is automatically reclassified as Inactive; whether billing is suspended during a pause.

**Default Behavior:** A paused student does not appear in active attendance rosters and is not billed for the paused period. Their seat in the group is **not guaranteed** to be held unless the center's Group Capacity Policy explicitly reserves it.

**Edge Cases:**
- Student pauses but the group is later filled by another student: the returning student's original slot may not exist; this must be a visible decision point for staff, not a silent conflict.

### 4.5 Inactive

**Description:** A system-determined (or staff-determined) state for a student who has stopped attending without a formal dropout.

**Configuration:** Number of consecutive unexplained absences or elapsed weeks before auto-flagging as Inactive (Student Status Policy, 3.5).

**Default Behavior:** Becoming Inactive stops future billing but does not erase past balances owed. Inactive students are excluded from active dashboards/KPIs by default but remain fully queryable in reports and history.

**Edge Cases:**
- A student who was paused and never returned, versus a student who simply stopped showing up — both may end in "Inactive," but the audit trail must distinguish how they got there.

### 4.6 Dropout

**Description:** A confirmed, intentional end to a student's enrollment, as opposed to the ambiguous "Inactive" state.

**Configuration:** Whether a dropout requires a reason to be recorded (useful for retention analysis).

**Default Behavior:** Dropout is a manual action (never fully automatic) because it represents a confirmed business fact, not an inference. It closes the enrollment, finalizes any outstanding balance for follow-up, but does not delete historical attendance or payment records.

**Edge Cases:**
- A "dropout" who re-registers months later must be treated as Section 4.7 (Return After Absence), not a fresh, unrelated registration — to preserve their history.

### 4.7 Return After Absence

**Description:** A previously Inactive, Paused, or Dropped-out student who resumes attendance.

**Configuration:** Whether returning students are charged a re-registration fee (if one applies to new students) or exempt from it.

**Default Behavior:** The system re-links the returning student to their original record and history rather than creating a duplicate profile. A new enrollment record is created for the new group/cycle, but the student's identity and history remain continuous.

**Edge Cases:**
- If the original record was archived/merged, staff must be able to search and restore it deliberately — the system should never make finding old records harder than creating a new (duplicate) one, as this is what causes data fragmentation in practice.

### 4.8 Graduation

**Description:** A student completing a course, level, or program — a "successful exit," distinct from dropout.

**Configuration:** Whether graduation is tied to an academic milestone (e.g., finishing a curriculum) or a calendar milestone (e.g., end of school year).

**Default Behavior:** Graduation closes active enrollment but is tagged distinctly from Dropout in reporting, since the two carry very different business meaning (retention/success metric vs. churn).

**Edge Cases:**
- A graduating student who immediately enrolls in a follow-on group/course (e.g., moving from one grade's group to the next) should have that continuity reflected, not treated as churn followed by new acquisition.

### 4.9 Multiple Groups

**Description:** A single student enrolled in more than one group at the same time (e.g., Math and Physics, or a regular group plus an exam-prep group).

**Configuration:** Whether billing across multiple groups is combined into a single invoice or kept separate per group.

**Default Behavior:** Each enrollment is billed according to its own group's pricing and cycle; attendance is tracked independently per group. The student profile is shared, but enrollment records are distinct.

**Edge Cases:**
- A multi-group discount (e.g., 10% off when enrolled in 2+ groups) must be configurable at the student level and clearly reflected on whichever invoice(s) it applies to.

### 4.10 Parent Relationships

**Description:** Linking a student to one or more guardians for communication and, in many centers, billing responsibility.

**Configuration:** Whether a student can have multiple linked guardians (e.g., separated parents), and who receives financial notifications.

**Default Behavior:** At least one guardian contact is expected for notification purposes, but the system must function for adult students with no guardian on file (e.g., university-level tutoring).

**Edge Cases:**
- Siblings enrolled under the same guardian: the system should support viewing/paying combined family balances without merging the students' academic records.

### 4.11 Historical Records

**Description:** The principle that a student's full history (enrollments, transfers, attendance, payments, status changes) is preserved indefinitely unless explicitly and deliberately deleted.

**Configuration:** Data retention period, if the center is subject to any local data retention requirements.

**Default Behavior:** No status change (dropout, transfer, inactivation) ever deletes prior records; it only adds new records and updates current status. This is the same principle stated in Section 2.6, applied specifically to student data.

**Edge Cases:**
- GDPR-style deletion requests are out of scope for a typical Egyptian tutoring center's regulatory environment, but if requested, this must be a manual, logged, irreversible action taken by an owner/admin, never a routine cleanup task.

---

## 5. Group Business Rules

### 5.1 Group Lifecycle

A group moves through the following states: **Planned → Active → Full → Closed/Archived**. "Planned" allows staff to build a group (schedule, price, teacher) before opening it for enrollment. "Closed/Archived" preserves the group's full history (roster, attendance, financials) for reporting, distinct from deletion.

### 5.2 Capacity

Governed by Group Capacity Policy (3.6). A group's capacity can be a hard limit (enrollment blocked once reached) or a soft limit (warning shown, override allowed with permission). Default: soft limit for Private Tutor business type, hard limit for Tutoring Center business type — reflecting that centers usually plan classroom-size constraints more rigidly than a single tutor does.

### 5.3 Transfers (Group-Level View)

See Section 4.3 for the student-side rule. From the group's perspective: a transfer out reduces the group's active roster and current-cycle revenue projection; a transfer in increases both, effective from the transfer date.

### 5.4 Subgroups

**Description:** A group split into smaller sections that share a curriculum/teacher but meet at different times or in different rooms (e.g., "Grade 10 Math — Section A / Section B").

**Default Behavior:** Subgroups inherit the parent group's price and curriculum by default but can override schedule and capacity independently.

### 5.5 Review Groups

**Description:** Supplementary groups focused on revision before exams, which may or may not be billed separately.

**Configuration:** Whether review-group sessions count toward a student's regular monthly session count (flagged as an Open Question, Section 16) or are tracked/billed independently.

### 5.6 Exam Groups

**Description:** Groups or sessions organized specifically for mock exams or assessments.

**Default Behavior:** Typically free or nominally priced, and excluded from regular attendance-based billing calculations by default, but this is configurable per center.

### 5.7 Temporary Groups

**Description:** Short-lived groups created for a specific purpose (e.g., a one-week intensive workshop) with a defined start and end date.

**Default Behavior:** Automatically move to "Closed/Archived" state after their end date without requiring manual closure, while preserving full history like any other group.

### 5.8 Special Groups

**Description:** Any group requiring non-standard rules — e.g., a scholarship group, a free trial group, or a corporate-sponsored group.

**Default Behavior:** Special groups exist specifically to hold overrides (pricing = 0, custom billing cycle, exempt from certain automations) without needing to modify per-student settings for every member.

### 5.9 Inheritance From System Defaults

Every group is created with the center's global defaults (Section 3) automatically applied: attendance policy, billing policy, notification policy. This ensures a new group is billable and functional immediately without manual configuration.

### 5.10 Override Rules

Any global default can be overridden at the group level, and — where the PRD's data model supports it — at the individual student-within-group level (e.g., one scholarship student inside an otherwise full-price group). Overrides must be visibly flagged in the UI (a group or student that deviates from defaults should never look identical to one that doesn't), and the system must always be able to show *why* a given student's price or policy differs from the group default (traceability, per Section 2.7's audit principle extended to non-financial policy as well).

---

## 6. Session Business Rules

### 6.1 Session Types

| Type | Business Meaning | Billed by Default? |
|---|---|---|
| Regular | Normal, scheduled curriculum session | Yes — counted in monthly/session billing |
| Make-up | Replaces a missed regular session (teacher- or student-caused) | No additional charge — see 6.3 |
| Extra | Additional session beyond the regular schedule (e.g., pre-exam) | Configurable — free by default, chargeable by override (Open Question, 16) |
| Review | Revision-focused session, may belong to a Review Group (5.5) | Configurable, typically not separately billed |
| Exam | Assessment session | Not billed by default |

### 6.2 Session Status

Sessions move through: **Scheduled → Completed / Cancelled / Rescheduled.**

**Business effect of each status:**

- **Scheduled:** Appears on rosters and calendars; attendance cannot yet be recorded.
- **Completed:** Attendance is locked in (subject to the editing window in Section 7.9); this is the state that feeds billing calculations for per-session billing models.
- **Cancelled:** No attendance is expected; by default does not count against a student's absence record or a teacher's session count. The reason (teacher unavailable, holiday, force majeure) should be recorded, since a teacher-caused cancellation and a center-wide holiday have very different downstream effects (see 8.11, teacher cancellation billing impact).
- **Rescheduled:** The original slot is cancelled and a new session is created/linked; the system must keep the two sessions linked so reporting doesn't count them as two independent events (e.g., double-counting toward a monthly session quota).

### 6.3 Make-Up Sessions

A make-up session exists to compensate for a Cancelled session (usually teacher-initiated) or, in centers that allow it, a student's excused absence. Make-up sessions are not separately billed; they fulfill an obligation already paid for. The system must track which original session a make-up session compensates for, to prevent a student from being charged twice or a teacher from being paid twice for what is functionally one delivered session.

---

## 7. Attendance Business Rules

### 7.1 Attendance Methods

- **Manual:** Staff/teacher marks each student present/absent from a roster. Always available as a fallback, regardless of what other methods are enabled — this is the offline-first guarantee (2.5).
- **QR:** Each student (or session) has a rotating or static QR code; scanning marks attendance. Must function without live internet connectivity, queuing the record for sync (consistent with Attendify-style rotating-QR attendance approaches).
- **USB Scanner:** A barcode/ID-card scanner marks attendance by scanning a physical card. Functionally equivalent to QR from a business-rules perspective — same statuses, same locking rules apply.
- **Search:** Staff types a student's name to mark attendance quickly in a large group, without a physical roster or code.

All methods write to the same underlying attendance record structure; the method used is stored as metadata (for audit) but does not change what the record means.

### 7.2 Attendance Statuses

| Status | Meaning | Default Financial Effect |
|---|---|---|
| Present | Attended on time | None (already accounted for in billing) |
| Late | Attended after the grace period | None by default; configurable to trigger a notification |
| Absent | Did not attend, no excuse provided | Configurable — see Section 8.13 (absence charging) |
| Excused | Did not attend, but with an approved reason (illness, prior notice) | Never charged by default; eligible for make-up session (6.3) |

### 7.3 Compensation Attendance

When a student attends a make-up session, the system must record attendance against **both** the make-up session and (as a cross-reference) the original session it compensates for, so that reports correctly reflect "this student ultimately attended" rather than showing a permanent, unresolved absence.

### 7.4 Attendance Locking

Once a session's attendance is finalized (typically at session end, or after a configurable buffer), the attendance record is **locked** by default. Locking exists to protect billing integrity — per-session billing calculations should not silently shift after an invoice has already been generated.

### 7.5 Attendance Reopening

A locked attendance record can be reopened, but only by a role with explicit permission (teacher's own session vs. admin-level override — governed by Teacher Policy, 3.7), and every reopen action must be logged with who reopened it and why. Reopening does not retroactively regenerate an already-issued invoice automatically; if the change affects billing, it must create a visible financial adjustment (Section 8.16) rather than silently editing a past invoice.

### 7.6 Duplicate Scans

If a student is scanned twice for the same session (common with QR/USB methods — a student scanning by mistake, or a parent scanning on their behalf twice), the second scan must be ignored for attendance purposes but may optionally be logged for anomaly detection (e.g., detecting a shared/copied QR code being used suspiciously).

### 7.7 Late Arrival

Governed by the grace period in Attendance Policy (3.2). A scan/mark after the grace period automatically records "Late" rather than "Present," without requiring staff to manually reclassify it.

### 7.8 Attendance Editing

Before locking, any attendance status can be freely changed. After locking, editing requires the Section 7.5 reopening process. Bulk editing (e.g., marking an entire group "Present" for a session that used informal paper attendance before digitization) must remain available but should require an explicit confirmation step (see UI Behavior, Section 14) given how easily bulk actions can mask real errors.

---

## 8. Billing Business Rules

Billing is the most consequential module in the system: errors here directly cost the business money or damage trust with parents. Every rule in this section must be traceable, reversible (via adjustment, never silent edits), and configurable per Section 2's philosophy.

### 8.1 Billing Models Supported

The system must support four billing models, selectable per group (with student-level override where the PRD's data model allows):

- **Monthly billing:** A fixed fee per calendar or custom cycle, regardless of exact session count attended (subject to absence-charging rules, 8.13).
- **Per-session billing:** The student is charged for each session actually scheduled/attended, at a per-session rate.
- **Course billing:** A single fixed price for an entire defined course/program (e.g., a 12-week exam-prep course), independent of monthly cycles.
- **Custom billing:** Any manually defined arrangement (e.g., a negotiated flat rate, an installment plan) that doesn't fit the above three cleanly.

### 8.2 Monthly Calculation Methods

Because "a month" is ambiguous in a tutoring context, the system must support three interpretations, set per group:

- **Calendar month:** Bills for the 1st–end of each calendar month regardless of how many sessions fall within it (some months have 4 sessions, some 5, at the same fixed price).
- **Session-count month:** A "month" is defined as a fixed number of sessions (e.g., 8 sessions), regardless of how many calendar weeks that spans — common when a center wants price parity across months of different session counts.
- **Custom cycle:** Any other recurring period defined by the center (e.g., a 4-week cycle that doesn't align with calendar months).

### 8.3 New Student / Mid-Cycle Enrollment Rules

**Default behavior:** A student enrolling mid-cycle is prorated based on the billing model:
- Calendar month → charged proportionally to remaining days/sessions in the current month.
- Session-count month → charged proportionally to remaining sessions in the current cycle.
- Course billing → typically charged in full, since a partial course is a distinct business decision (Open Question, 16).

**Configuration:** A center may instead choose to always charge a full cycle regardless of enrollment date (common with smaller centers that prefer simplicity over precision). This must be a policy toggle, not a hardcoded proration formula.

### 8.4 Payment Timing

Configurable per group/center: **in advance** (charged at the start of the cycle, before sessions are delivered) or **in arrears** (charged at the end, based on delivered sessions). This choice affects both cash flow and how absence-charging (8.13) interacts with the invoice — in-advance billing may require a credit/adjustment for excused absences, while in-arrears billing can simply exclude them from the calculation.

### 8.5 Late Payment

**Description:** A payment not received by the configured due date.

**Configuration:** Grace period length; whether a late fee applies (flat or percentage); whether repeated late payment triggers an automated notification escalation (Section 11) or a manual flag for staff follow-up.

**Default Behavior:** Late payment does not automatically suspend a student's attendance or group membership — that escalation (if enabled at all) is a separate, explicit automation rule (Section 11), never an implicit side effect of billing logic.

### 8.6 Partial Payment

**Description:** A payment that is less than the full invoiced amount.

**Default Behavior:** The system records the partial payment against the invoice, leaves the invoice in a "Partially Paid" state, and tracks the remaining balance. Partial payments are never silently rounded up or treated as "close enough" to full payment.

**Edge Cases:** A guardian paying for multiple siblings in one transaction must be splittable across multiple students' invoices, with the allocation explicitly recorded (see 8.15).

### 8.7 Credits

**Description:** A positive balance held on a student's account, resulting from overpayment, a cancelled service already paid for, or a goodwill adjustment.

**Default Behavior:** Credits are automatically applied to the next invoice generated for that student unless the center specifies a different treatment (e.g., manual refund only). Credits never expire silently; if a center wants credit expiration, it must be an explicit configurable policy.

### 8.8 Discounts

**Description:** A reduction applied to a specific invoice or a student's ongoing price.

**Configuration:** Discount type (flat amount or percentage), whether it's one-time or recurring, and an approval threshold above which a manager/owner must authorize it (Financial Policy, 3.8).

**Default Behavior:** Every discount is logged with a reason and the staff member who applied it — an undocumented discount is treated as a data-integrity issue, not a normal transaction.

### 8.9 Scholarships

**Description:** A structural, typically long-term or full-course discount, distinct from a one-off discount — e.g., a student who pays 0% or 50% for the duration of their enrollment.

**Default Behavior:** Implemented as a persistent override at the student-enrollment level (see 5.10), so it applies automatically to every future invoice without staff needing to re-apply a discount each cycle. Scholarships are reported separately from ad-hoc discounts, since centers typically track them for different purposes (community goodwill / marketing vs. simple negotiation).

### 8.10 Price Override

**Description:** A one-off or persistent custom price for a specific student that differs from their group's standard price, for reasons other than a discount or scholarship (e.g., a grandfathered legacy price after a center-wide price increase).

**Default Behavior:** Functions like Section 5.10's override mechanism — visibly flagged, always traceable to a reason, never silently blending into the "standard" price shown for the group.

### 8.11 Teacher Cancellation (Billing Impact)

**Description:** When a teacher cancels a scheduled session, the student has effectively pre-paid (in advance billing) or will owe (in arrears billing) for a session not delivered.

**Default Behavior:** A teacher-cancelled session does not reduce the student's obligation permanently — it converts into an entitlement to a make-up session (6.3). If a make-up cannot be scheduled within the current cycle, the unresolved session should surface as a visible credit/adjustment candidate, not disappear silently at the cycle's close.

**Open Question:** Should a teacher cancellation extend the billing cycle by one session/day, or always resolve via make-up/credit instead? (See Section 16.)

### 8.12 Student Absence (Billing Impact)

See also Section 7.2. Whether an unexcused absence is charged depends entirely on the billing model:
- **Monthly billing:** Absence typically has no billing effect — the student already owes the fixed monthly fee regardless of attendance. This is the default.
- **Per-session billing:** An unexcused absence is, by default, still billed (the session was held and the slot reserved), while an excused absence is not.

**Open Question:** Should absent students always be charged under per-session billing, even with a valid excuse submitted after the fact? (See Section 16.)

### 8.13 Absence Charging — General Rule

Configurable per group: **Always charge**, **Never charge**, or **Charge unless excused**. Default is **Charge unless excused**, since this best matches how most Egyptian tutoring businesses informally already operate (the session slot and teacher time were reserved regardless of attendance).

### 8.14 Automatic Invoice Generation

**Default Behavior:** Invoices are generated automatically at the start (in-advance) or end (in-arrears) of each billing cycle, based on the group's billing model and calculation method. Automatic generation respects Automation Policy (3.9) — it can run fully automatically, generate as a draft pending staff review, or be fully manual, per center preference.

**Edge Cases:** A student transferred, paused, or dropped mid-cycle must not receive a duplicate or a full-price invoice for a cycle they didn't complete under the original group — the invoice generation logic must check for exactly this kind of overlapping/conflicting billing state before creating a new invoice.

### 8.15 Invoice Lifecycle

Invoices move through: **Draft → Issued → Partially Paid → Paid → Overdue → (optionally) Written Off / Cancelled.**
An invoice, once Issued, is never edited in place — any correction happens via a linked adjustment (8.16) that references the original invoice, preserving a clean audit trail (2.7).

### 8.16 Payment Allocation

**Description:** The process of applying a received payment to one or more specific invoices, especially relevant when a guardian pays for multiple students or multiple months at once.

**Default Behavior:** Payment allocation is always explicit — the system should never guess which invoice a lump payment covers. If ambiguous, the payment sits as an unallocated credit (8.7) until staff assign it.

### 8.17 Refunds

**Description:** Returning money already received, whether due to a cancellation, an error, or a goodwill gesture.

**Configuration:** Refund approval threshold (Financial Policy, 3.8) — above a certain amount, a second approver is required.

**Default Behavior:** A refund is always linked to the original payment/invoice it reverses and always requires a recorded reason. Refunds reduce recognized revenue in financial reporting for the period in which they occur — they are never simply deleted from history.

### 8.18 Financial Adjustments

**Description:** Any manual correction to a student's financial record that isn't a standard payment, discount, or refund — e.g., correcting a data-entry error from months ago.

**Default Behavior:** An adjustment always references the record it corrects, always requires a reason, and is always attributable to a specific staff member — this is the general-purpose escape hatch that keeps Sections 8.5–8.17 from needing to individually handle every conceivable correction scenario, while still preserving the audit principle (2.7).

### 8.19 Edge Cases Summary

- A student enrolled in two groups with two different billing models must receive clearly separated line items — never a single ambiguous combined charge.
- A discount and a scholarship applying to the same student simultaneously must be calculated in a defined order (e.g., scholarship percentage applied first, then flat discount) — this order must itself be configurable or at minimum explicitly documented, to avoid silent inconsistency between staff members' mental models of "how much this student actually owes."
- Currency/rounding: fractional pound amounts arising from proration or percentage discounts must round consistently (a single, documented rounding rule) rather than differently across different calculation paths in the system.

---

## 9. Financial Business Rules

This section covers the center's own finances, as distinct from student-facing billing (Section 8).

### 9.1 Expenses

Any outgoing cost not related to teacher payroll (rent, utilities, printing, supplies). Every expense entry requires a category, amount, date, and — where applicable — an attachment (9.6). Recurring expenses (e.g., monthly rent) should be supported as a template to avoid manual re-entry, but each occurrence still generates its own auditable record.

### 9.2 Income

All incoming revenue, primarily aggregated from student payments (Section 8) but also supporting manual income entries (e.g., a one-off workshop fee not tied to a regular group). Income records must distinguish source (student billing vs. other) to keep financial reporting (Section 13) accurate.

### 9.3 Salary

A teacher's or staff member's fixed periodic compensation, independent of session count.

### 9.4 Payroll

**Description:** The calculation and recording of what each teacher/staff member is owed for a given period, based on their configured basis (Teacher Policy, 3.7): fixed salary, per-session rate, per-student rate, or percentage of collected revenue.

**Default Behavior:** Payroll calculation reads from locked attendance/session records (Section 7.4) and finalized invoices/payments — it never calculates against data that could still change, to avoid a teacher being paid based on figures that are later corrected. If underlying data changes after payroll is finalized, the difference is handled as a financial adjustment (8.18) against the next payroll cycle, not a silent retroactive edit to a finalized payroll record.

### 9.5 Cashbox

**Description:** A running ledger of physical/manual cash on hand at the center, separate from digital payment tracking.

**Default Behavior:** Every cashbox movement (cash payment received, cash expense paid) is a discrete, timestamped entry; the cashbox balance is always a derived total of its entries, never a manually editable single number — this prevents the balance from silently drifting from its actual transaction history.

### 9.6 Manual Transactions

Any income or expense entered directly by staff rather than generated automatically by the billing engine. Manual transactions carry the same audit requirements as automated ones (Section 2.7): who entered it, when, and why.

### 9.7 Attachments

Receipts, invoices from vendors, or supporting documents can be attached to expense and income records. Attachments are for documentation only and are never treated as the authoritative record of the transaction — the structured data (amount, date, category) is.

### 9.8 Receipt Numbering

**Default Behavior:** Receipts/invoices are numbered sequentially and immutably once issued (per Section 8.15). Numbering must never be reused, even for a cancelled or voided invoice — a gap in the sequence is expected and correct behavior for a voided document, not an error to be silently fixed by renumbering.

### 9.9 Audit

Every financial action anywhere in the system (Sections 8 and 9) is captured in a single, chronological, unmodifiable audit log: actor, action, timestamp, before/after values where applicable, and — for anything requiring approval — the approver's identity. This audit log is the ultimate reference for resolving any financial dispute, whether raised by a parent, a teacher, or an owner reviewing the books.

---

## 10. Notification Rules

### 10.1 Notification Events

The system should be able to trigger a notification on any of the following (each individually enable/disable-able, per Notification Policy, 3.4):

- Enrollment confirmation
- Upcoming session reminder
- Attendance recorded (present/absent/late) — typically sent to guardians
- Invoice issued
- Payment received (confirmation)
- Payment overdue / reminder
- Group schedule change
- Session cancelled / rescheduled
- Student flagged "at risk" (internal, to staff — not the guardian)
- Student moved to Inactive

### 10.2 Message Templates

Every notification type has an editable template, so wording can match the center's tone (formal for a corporate-style center, casual for a smaller private tutor) without a developer needing to change code.

### 10.3 Variables

Templates support variable substitution (student name, group name, amount due, session date/time, etc.). The system must validate that all required variables for a template are available before sending — a partially-filled message (e.g., literal "{{amount}}" left in the text) must never reach a guardian.

### 10.4 Scheduling

Some notifications are immediate (payment received), others are scheduled relative to an event (session reminder sent X hours before start; payment reminder sent X days before/after due date). The offsets must be configurable per notification type.

### 10.5 Failures

If a notification fails to send (e.g., invalid number, provider error), it must be logged with the failure reason and surfaced to staff — never silently dropped, since a missed payment reminder directly affects the center's cash flow and a missed attendance alert affects a parent's trust.

### 10.6 Retry Queue

Failed notifications are retried on a configurable backoff schedule up to a maximum attempt count, after which they are marked "Failed — needs manual follow-up" rather than retried indefinitely.

### 10.7 Provider Independence

Business rules for *what* triggers a notification and *when* must remain independent of *which* messaging provider (SMS gateway, WhatsApp Business API, email) delivers it — switching providers is a technical/PRD concern and should never require redefining the underlying business events.

---

## 11. Automation Rules

Every automation below is subject to Automation Policy (3.9): it can run as **Fully Automatic**, **Suggested (requires confirmation)**, or **Disabled**, per center preference.

**When attendance is recorded...**
→ The system updates the student's consecutive-absence counter (resetting on Present/Late/Excused), checks it against the Student Status Policy threshold, and — if exceeded — flags the student "at risk" and optionally notifies staff.

**When an invoice becomes overdue...**
→ The system sends the configured payment-reminder notification(s) on the configured schedule and, if repeated overdue cycles occur, escalates by flagging the student's account for staff review (never by automatically restricting attendance, unless the center has explicitly enabled that stricter automation).

**When a student becomes inactive...**
→ The system removes them from active rosters/dashboards, stops future automatic invoice generation for their enrollment, and preserves their outstanding balance (if any) as a visible, unresolved item rather than writing it off.

**When a teacher cancels a session...**
→ The system marks the session Cancelled (6.2), creates a make-up entitlement for every enrolled student (6.3), and notifies affected guardians of the cancellation.

**When a payment is recorded...**
→ The system updates the invoice status (8.15), applies any resulting credit (8.7), and sends a payment-confirmation notification.

**When a group becomes full...**
→ The system blocks further enrollment (if capacity is a hard limit, 3.6) or warns staff (if soft), and — if a waiting list is enabled — offers to add the new student to it.

---

## 12. Dashboard Business Rules

Every KPI below must document its calculation, update timing, and data source, so that a number shown on a dashboard can always be explained and reproduced.

| KPI | Calculation | Updates | Data Source |
|---|---|---|---|
| Active Students | Count of students with at least one Active enrollment | Real-time | Student + Enrollment records |
| Attendance Rate | Present + Late ÷ (Present + Late + Absent), excluding Excused, over selected period | Real-time as attendance is recorded | Attendance records |
| Monthly Revenue | Sum of payments recorded within the selected period | Real-time as payments are recorded | Payment records |
| Outstanding Balance | Sum of (Issued + Partially Paid + Overdue invoice amounts − payments applied) | Real-time | Invoice + Payment records |
| At-Risk Students | Count of students currently flagged per Student Status Policy | Updated on each attendance event (Section 11) | Student status field |
| Group Occupancy | Enrolled ÷ Capacity, per group | Real-time as enrollment changes | Group + Enrollment records |
| Teacher Load | Sessions delivered (or scheduled) per teacher, per period | Real-time / end of day | Session + Teacher records |

**General rule:** No KPI may silently exclude data (e.g., quietly ignoring Inactive students from "Active Students" is correct and expected; quietly ignoring overdue invoices from "Outstanding Balance" would not be). Every KPI's definition in this table is the single authoritative definition — if the UI needs to show a variant (e.g., "Revenue This Month" vs. "Revenue Last 30 Days"), that variant must be documented here as its own row, not left to interpretation.

---

## 13. Reports Business Rules

All reports must be filterable by date range, group, and (where applicable) individual student/teacher, and must be exportable in a format the PRD's technology stack supports.

### 13.1 Attendance Reports
Per-student and per-group attendance history, including status breakdown (Present/Late/Absent/Excused) and attendance rate (12, row 2). Must clearly indicate which sessions were Cancelled (6.2) and therefore excluded from the denominator, versus sessions the student was simply absent from.

### 13.2 Financial Reports
Revenue, expenses, and net position over a selected period, broken down by category (student billing, other income, expense type). Must reconcile exactly with the Cashbox (9.5) and Audit Log (9.9) for the same period — any discrepancy is a data-integrity bug, not an acceptable rounding artifact.

### 13.3 Student Reports
Per-student summary: enrollment history, attendance rate, payment history, current balance, and status timeline (Registration → Enrollment → any Pauses/Transfers → current state).

### 13.4 Teacher Reports
Per-teacher summary: sessions delivered, students taught, attendance rates of their groups, and payroll calculation basis/amount for the period (linking to Section 9.4).

### 13.5 Monthly Reports
A rollup combining 13.1–13.4 at the center level, intended as the standard "how did this month go" report for an owner.

### 13.6 Outstanding Balances
List of all students/guardians with a non-zero owed amount, sorted by how overdue, to directly support collections follow-up.

### 13.7 Inactive Students
List of students currently in Inactive status (4.5), with their last-attended date and outstanding balance at the time of inactivation — this report exists specifically to support win-back/retention efforts.

### 13.8 Absence Statistics
Aggregate absence patterns (by group, by day of week, by individual student) to help a center or teacher spot systemic issues (e.g., a group with unusually high Friday absences).

### 13.9 Exam Reports
Results/attendance for Exam-type sessions and Exam Groups (5.6), kept separate from regular academic attendance reporting since the business purpose (assessment, not billing) differs.

### 13.10 Homework Reports
Completion tracking, if the PRD's data model includes a homework/assignment feature — included here for completeness since it is a natural companion to attendance in a tutoring context, pending confirmation that this is in scope (see Open Questions, 16).

---

## 14. UI Behavior Rules

This section describes **behavior**, not visual design (which belongs to the PRD/design system).

### 14.1 Search
Search must operate across the most common lookup fields (student name, phone number, guardian phone) simultaneously, without requiring the user to first select which field they're searching by. Partial matches must be supported (searching "moh" should surface "Mohamed").

### 14.2 Filtering
Every list view (students, groups, invoices, sessions) must support filtering by status at minimum (e.g., Active/Inactive/Paused for students; Issued/Paid/Overdue for invoices). Filters must be combinable, not mutually exclusive.

### 14.3 Sorting
Every list view must support sorting by at least one date field (most recent first, by default) and one name/identifier field.

### 14.4 Bulk Actions
Bulk actions (e.g., marking a whole roster's attendance, sending a reminder to all overdue accounts) must always show an explicit count of affected records and require a confirmation step (14.6) before executing — bulk actions are the highest-risk category of UI action in this system, since a single mistaken click affects many records at once.

### 14.5 Archive vs. Delete
**Archive** hides a record from active views while fully preserving it (this is the default action for groups, students, and any record with financial/attendance history). **Delete** permanently removes a record and must only be available for records with no history at all (e.g., a student registered by mistake, never enrolled) — this directly enforces the historical-preservation principle (2.6).

### 14.6 Confirmation Dialogs
Required for: bulk actions (14.4), any Delete action, any financial adjustment/refund above the approval threshold (8.17), and reopening locked attendance (7.5). Not required for routine, easily-reversible actions (e.g., toggling a filter), to avoid confirmation fatigue that trains users to click "confirm" without reading.

### 14.7 Validation
Required fields and format rules (phone numbers, amounts) are validated at the point of entry, with clear inline messaging — never a rejected submission with no explanation of which field failed.

### 14.8 Autosave
Long forms (e.g., building out a new group's full configuration) should autosave drafts to prevent data loss, but autosave must never apply to anything that changes billing or attendance state for an already-active record — those changes require explicit save/confirm actions.

### 14.9 Keyboard Shortcuts
Not business-critical, but where implemented, shortcuts for high-frequency actions (marking attendance, moving between students in a roster) should be documented and consistent across the app rather than introduced ad hoc per screen.

### 14.10 Pagination
Any list that can realistically exceed ~50 records (students, sessions, invoices, audit log) must be paginated or virtualized — never loaded in full — both for performance and so staff aren't scrolling through years of historical data by default.

---

## 15. Business Rule Catalog

This catalog is the authoritative, extensible register of individual business rules. Every rule referenced narratively in Sections 3–14 has a corresponding formal entry here. **New rules discovered during implementation or QA must be added here using the same template** — this section is designed to grow with the product.

**Rule ID numbering scheme:** `[MODULE]-[NNN]`, where MODULE is one of: `STU` (Student), `GRP` (Group), `SES` (Session), `ATT` (Attendance), `BIL` (Billing), `FIN` (Financial), `NOT` (Notification), `AUTO` (Automation), `DASH` (Dashboard), `RPT` (Reports), `UI` (UI Behavior).

---

### Rule ID: STU-001
**Module:** Student
**Title:** Duplicate Registration Warning
**Description:** When a new student is registered with a phone number that already exists in the system, the system warns staff instead of blocking registration.
**Business Reason:** Siblings frequently share a guardian's phone number; blocking would prevent legitimate registrations.
**Configuration Options:** Warning can be based on phone match only, or phone + similar name.
**Default Value:** Warn on phone match only.
**Possible Values:** Warn / Block / Ignore.
**Dependencies:** None.
**Affected Modules:** Student, Reports (duplicate detection reports).
**Edge Cases:** Two unrelated students sharing a family member's phone (e.g., a tutor who registers as an emergency contact for multiple unrelated families).
**Examples:** Two siblings, "Ahmed Ali" and "Sara Ali," both registered under the same guardian mobile number — system warns but allows.
**Future Considerations:** Optional fuzzy-matching on guardian name in addition to phone number.

---

### Rule ID: STU-002
**Module:** Student
**Title:** Mid-Cycle Enrollment Proration
**Description:** A student enrolling after a billing cycle has started is charged a prorated amount rather than a full-cycle fee, unless the center disables proration.
**Business Reason:** Charging a full month for a student who joins on day 20 is commonly seen as unfair and damages trust with new parents.
**Configuration Options:** Enable/disable proration; proration basis (days remaining vs. sessions remaining).
**Default Value:** Enabled; basis matches the group's Monthly Calculation Method (8.2).
**Possible Values:** Prorate by days / Prorate by sessions / Always full price.
**Dependencies:** BIL-003 (Monthly Calculation Method).
**Affected Modules:** Billing, Financial Reports.
**Edge Cases:** Enrollment on the very last day of a cycle — proration may result in a near-zero charge; center may want a configurable minimum charge.
**Examples:** A calendar-month group charges 800 EGP/month; a student enrolling on the 21st of a 30-day month is charged approximately 267 EGP for the remaining 10 days.
**Future Considerations:** Configurable minimum-charge floor for very-late enrollments.

---

### Rule ID: STU-003
**Module:** Student
**Title:** Auto-Flag Inactive Status
**Description:** A student with no attendance for a configurable number of consecutive sessions/weeks is automatically flagged Inactive.
**Business Reason:** Keeps active rosters and dashboards accurate without requiring staff to manually track disengaged students.
**Configuration Options:** Threshold (sessions or calendar weeks); whether auto-flagging requires staff confirmation before taking effect.
**Default Value:** 4 consecutive unexplained absences; requires no confirmation (fully automatic).
**Possible Values:** Any positive integer threshold; Automatic / Suggested / Disabled (per Automation Policy, 3.9).
**Dependencies:** ATT-002 (Absence status), AUTO general rules (Section 11).
**Affected Modules:** Student, Dashboard, Billing (stops future invoice generation), Notifications (optional staff alert).
**Edge Cases:** A student on an approved Pause (STU-004 equivalent, Section 4.4) must not be counted toward this threshold.
**Examples:** A student misses 4 consecutive weekly sessions with no Excused status recorded → automatically moved to Inactive; outstanding balance, if any, remains visible.
**Future Considerations:** Different thresholds per group type (e.g., stricter for high-frequency groups).

---

### Rule ID: GRP-001
**Module:** Group
**Title:** Hard vs. Soft Capacity Enforcement
**Description:** Determines whether a group can be over-enrolled beyond its stated capacity.
**Business Reason:** Tutoring centers with fixed classroom sizes need hard enforcement; a single private tutor teaching from home may prefer flexibility.
**Configuration Options:** Hard limit / Soft limit (warn only) / No limit.
**Default Value:** Soft limit for Private Tutor business type; Hard limit for Tutoring Center business type.
**Possible Values:** Hard / Soft / None.
**Dependencies:** Business Type setting (3.1).
**Affected Modules:** Group, Student (enrollment flow), Dashboard (Group Occupancy KPI).
**Edge Cases:** Manager override of a hard limit for a VIP/priority student — must still require explicit permission and be logged.
**Examples:** A 20-seat group at a tutoring center blocks a 21st enrollment attempt with an explicit error, unless an admin overrides it.
**Future Considerations:** Waiting-list auto-promotion when a seat opens (see NOT rules).

---

### Rule ID: GRP-002
**Module:** Group
**Title:** Mid-Cycle Transfer Price Reconciliation
**Description:** When a student transfers between groups with different prices mid-cycle, the system calculates a fair credit or additional charge for the partial period already paid under the old price.
**Business Reason:** Prevents both overcharging and undercharging when a student's group changes mid-cycle.
**Configuration Options:** Reconciliation basis (days or sessions remaining); whether reconciliation is automatic or requires staff review before finalizing.
**Default Value:** Automatic, calculated on the same basis as the group's Monthly Calculation Method.
**Possible Values:** Automatic / Staff-reviewed draft.
**Dependencies:** STU-002 (proration logic, shared calculation basis), BIL-003.
**Affected Modules:** Billing, Financial Reports, Audit Log.
**Edge Cases:** Transfer to a Special Group (5.8) with a scholarship price — reconciliation must correctly value the "old" period at the old price, not retroactively apply the new discounted rate.
**Examples:** A student pays 800 EGP for Group A (calendar-month billing); transfers to Group B (1,000 EGP/month) on day 15 of a 30-day month → charged an additional prorated difference for the remaining 15 days.
**Future Considerations:** Configurable rounding rule for reconciliation amounts.

---

### Rule ID: SES-001
**Module:** Session
**Title:** Cancelled Session Exclusion From Attendance Denominator
**Description:** A Cancelled session is excluded from a student's attendance-rate calculation entirely — it neither counts as attended nor as absent.
**Business Reason:** A cancellation is the center's/teacher's decision, not the student's behavior; penalizing attendance rate for it would misrepresent the student.
**Configuration Options:** None — this is treated as a structural rule, not a preference, since any alternative would produce misleading attendance data.
**Default Value:** N/A (fixed rule).
**Possible Values:** N/A.
**Dependencies:** ATT reporting calculations, DASH-002 (Attendance Rate KPI).
**Affected Modules:** Attendance, Dashboard, Reports.
**Edge Cases:** A session Rescheduled rather than Cancelled must not create a duplicate exclusion — only the originally Cancelled event (if any) is excluded; the new session is scored normally.
**Examples:** A group has 8 scheduled sessions in a month; 1 is Cancelled by the teacher → attendance rate is calculated out of 7, not 8.
**Future Considerations:** None identified.

---

### Rule ID: ATT-001
**Module:** Attendance
**Title:** Attendance Locking at Session Completion
**Description:** Attendance records lock automatically once a session is marked Completed, or after a configurable buffer period following the scheduled end time.
**Business Reason:** Protects the integrity of billing calculations that depend on finalized attendance.
**Configuration Options:** Buffer duration (e.g., lock immediately vs. lock 2 hours after session end, to allow same-day corrections).
**Default Value:** Lock immediately on marking Completed.
**Possible Values:** Immediate / N-hour buffer.
**Dependencies:** None.
**Affected Modules:** Attendance, Billing (per-session calculations), Payroll (9.4).
**Edge Cases:** A teacher forgetting to mark a session Completed — the system should have a fallback auto-completion rule (e.g., end-of-day) so attendance doesn't remain indefinitely unlocked and editable.
**Examples:** A session scheduled 4:00–5:00 PM is marked Completed at 5:05 PM by the teacher → attendance locks at that moment.
**Future Considerations:** Configurable end-of-day auto-completion fallback.

---

### Rule ID: ATT-002
**Module:** Attendance
**Title:** Late Arrival Auto-Classification
**Description:** A scan or manual mark recorded after the configured grace period automatically records status "Late" rather than "Present."
**Business Reason:** Removes the need for staff to manually judge lateness on every scan, and produces consistent data for reporting.
**Configuration Options:** Grace period length (minutes), settable per group.
**Default Value:** 10 minutes.
**Possible Values:** Any non-negative integer (minutes).
**Dependencies:** Session scheduled start time.
**Affected Modules:** Attendance, Reports (Absence Statistics), Notifications (optional late-arrival alert).
**Edge Cases:** A session that starts late itself (teacher delayed) should not cause students arriving on time relative to the *actual* start to be marked Late relative to the *scheduled* start — this requires the actual session start to be recorded, not just the scheduled time.
**Examples:** Grace period is 10 minutes; session starts 5:00 PM; a student scans at 5:12 PM → marked Late.
**Future Considerations:** Distinguish "teacher-caused" delay from "student-caused" lateness in the underlying record.

---

### Rule ID: BIL-001
**Module:** Billing
**Title:** Absence Charging Policy
**Description:** Determines whether an unexcused absence results in a charge, under per-session billing.
**Business Reason:** The session slot and teacher time are reserved regardless of attendance; most centers bill for the reservation, not the physical presence.
**Configuration Options:** Always charge / Never charge / Charge unless excused.
**Default Value:** Charge unless excused.
**Possible Values:** Always / Never / Unless Excused.
**Dependencies:** ATT status values (7.2).
**Affected Modules:** Billing, Financial Reports.
**Edge Cases:** A student who submits an excuse *after* the invoice has already been generated — see BIL-004.
**Examples:** Per-session group at 100 EGP/session; a student is Absent (unexcused) for one session → still billed 100 EGP for it.
**Future Considerations:** See Open Question 16.1.

---

### Rule ID: BIL-002
**Module:** Billing
**Title:** Teacher-Cancellation Make-Up Entitlement
**Description:** When a teacher cancels a scheduled session, every enrolled student automatically receives a make-up-session entitlement rather than a refund/credit by default.
**Business Reason:** Preserves revenue continuity for the center while still fulfilling the value promised to the student.
**Configuration Options:** Default resolution (Make-up / Automatic credit); expiration window for unused make-up entitlements.
**Default Value:** Make-up entitlement, no expiration within the current billing cycle; converts to credit if unused by cycle end.
**Possible Values:** Make-up only / Credit only / Make-up with credit fallback.
**Dependencies:** SES-001, Section 6.3.
**Affected Modules:** Session, Billing, Notifications.
**Edge Cases:** A center-wide cancellation (e.g., public holiday) affecting many groups at once — must be batchable without generating an overwhelming number of individual notifications.
**Examples:** A teacher cancels a Tuesday session; all 12 enrolled students receive a make-up entitlement and a notification with rescheduling information.
**Future Considerations:** See Open Question 16.2.

---

### Rule ID: BIL-003
**Module:** Billing
**Title:** Monthly Calculation Method Selection
**Description:** Defines how "a month" is interpreted for billing purposes: calendar month, session-count month, or custom cycle.
**Business Reason:** Different centers have different pricing philosophies — some want calendar-consistent pricing, others want session-count-consistent pricing.
**Configuration Options:** Calendar month / Session-count month / Custom cycle length.
**Default Value:** Calendar month.
**Possible Values:** Calendar / Session-count (N sessions) / Custom (N days).
**Dependencies:** None.
**Affected Modules:** Billing, all proration-dependent rules (STU-002, GRP-002).
**Edge Cases:** A month with a public holiday reducing the actual session count under a calendar-month model — center must decide (via BIL-001/Open Questions) whether this affects price at all.
**Examples:** A session-count group set to "8 sessions per cycle" bills identically whether those 8 sessions span 4 weeks or 5.
**Future Considerations:** None identified beyond Open Question 16.3 (review sessions counting toward quota).

---

### Rule ID: BIL-004
**Module:** Billing
**Title:** Locked Invoice Immutability
**Description:** Once an invoice is Issued, its line items and total can never be edited directly; corrections must occur via a linked Financial Adjustment.
**Business Reason:** Protects financial audit integrity and prevents disputes about what a parent was actually charged and when.
**Configuration Options:** None — structural rule.
**Default Value:** N/A (fixed rule).
**Possible Values:** N/A.
**Dependencies:** FIN-001 (Adjustment linkage), Section 8.15, 8.18.
**Affected Modules:** Billing, Financial, Audit Log.
**Edge Cases:** A late-submitted excuse that would change an already-issued invoice's absence charge (BIL-001) must be resolved by an adjustment against the *next* invoice or a manual credit, never by editing the issued invoice retroactively.
**Examples:** An invoice for 800 EGP is issued; a data-entry correction is needed → a −50 EGP adjustment is created and linked to the original invoice, producing a net-payable of 750 EGP, with both records visible in history.
**Future Considerations:** None identified.

---

### Rule ID: FIN-001
**Module:** Financial
**Title:** Mandatory Adjustment Linkage
**Description:** Every financial adjustment must reference the specific invoice, payment, or payroll record it corrects, and must include a reason and responsible staff member.
**Business Reason:** Enables full reconstruction of "why does this number look different from what was originally recorded" at any point in the future.
**Configuration Options:** None — structural rule.
**Default Value:** N/A (fixed rule).
**Possible Values:** N/A.
**Dependencies:** BIL-004, Section 9.9 (Audit).
**Affected Modules:** Financial, Billing, Payroll, Reports.
**Edge Cases:** Bulk adjustments (e.g., correcting a systemic pricing error affecting 50 students) must still create individually linked, individually reasoned records — a single generic bulk note is not sufficient audit detail.
**Examples:** A payroll calculation error is discovered after finalization → an adjustment record is created referencing the original payroll entry, with reason "session count miscalculation, corrected."
**Future Considerations:** None identified.

---

### Rule ID: NOT-001
**Module:** Notification
**Title:** Payment Overdue Reminder Schedule
**Description:** Automatically sends a configurable sequence of reminders once an invoice passes its due date without full payment.
**Business Reason:** Reduces manual collections effort while maintaining a professional, consistent tone with guardians.
**Configuration Options:** Number of reminders; offset (days after due date) for each; escalation tone/template per reminder.
**Default Value:** Two reminders — day 3 and day 10 after due date.
**Possible Values:** 0–N reminders with configurable offsets.
**Dependencies:** BIL invoice status (8.15), Section 10.4.
**Affected Modules:** Notification, Billing, Dashboard (Outstanding Balances).
**Edge Cases:** A partial payment received between scheduled reminders should adjust (not cancel) the reminder to reflect the remaining balance, not the original full amount.
**Examples:** Invoice due June 1st, unpaid → reminder sent June 4th; still unpaid → second, firmer reminder sent June 11th.
**Future Considerations:** Optional automatic staff task creation after the final reminder goes unanswered.

---

### Rule ID: AUTO-001
**Module:** Automation
**Title:** Automation Confirmation Levels
**Description:** Every automated workflow in Section 11 can independently be set to Fully Automatic, Suggested (requires confirmation), or Disabled.
**Business Reason:** Different tutors have very different risk tolerance for letting software take action on their behalf, especially around student status and money.
**Configuration Options:** Per-workflow selector: Automatic / Suggested / Disabled.
**Default Value:** Varies per workflow (documented individually in Section 11); financially-impactful automations default to Suggested where reasonable.
**Possible Values:** Automatic / Suggested / Disabled.
**Dependencies:** All Section 11 automation rules.
**Affected Modules:** All modules with automated behavior.
**Edge Cases:** A "Suggested" automation that is never confirmed by staff must not silently expire and disappear — it should remain visible as a pending suggestion until acted on or explicitly dismissed.
**Examples:** "When a student becomes inactive" is set to Suggested → the system shows a staff prompt ("Mark Ahmed as Inactive?") rather than changing status automatically.
**Future Considerations:** None identified.

---

### Rule ID: DASH-001
**Module:** Dashboard
**Title:** Outstanding Balance Real-Time Accuracy
**Description:** The Outstanding Balance KPI must always reflect (Issued + Partially Paid + Overdue invoices) minus applied payments, recalculated in real time as payments are recorded.
**Business Reason:** This is typically the single most-checked number by a center owner; staleness directly undermines trust in the whole system.
**Configuration Options:** None — structural rule.
**Default Value:** N/A (fixed rule).
**Possible Values:** N/A.
**Dependencies:** BIL-004, Section 12.
**Affected Modules:** Dashboard, Billing, Reports.
**Edge Cases:** A payment recorded but not yet allocated to a specific invoice (Section 8.16) must not be double-counted as both an unallocated credit and a reduction of outstanding balance.
**Examples:** N/A (structural/calculation rule).
**Future Considerations:** None identified.

---

### Rule ID: RPT-001
**Module:** Reports
**Title:** Financial Report Reconciliation Requirement
**Description:** Any Financial Report's totals for a given period must exactly reconcile with the Cashbox and Audit Log totals for the same period.
**Business Reason:** A tutoring center's financial reports are frequently the basis for tax/accounting purposes; any discrepancy is a critical defect, not a rounding footnote.
**Configuration Options:** None — structural rule.
**Default Value:** N/A (fixed rule).
**Possible Values:** N/A.
**Dependencies:** Section 9.5, 9.9, 13.2.
**Affected Modules:** Reports, Financial.
**Edge Cases:** Manual cashbox entries (9.6) made outside of standard invoice/payment flow must still flow into the same reconciliation, not be tracked in a parallel, unreconciled system.
**Examples:** N/A (structural/validation rule).
**Future Considerations:** Automated reconciliation-check alert if a discrepancy is ever detected.

---

### Rule ID: UI-001
**Module:** UI Behavior
**Title:** Bulk Action Confirmation Requirement
**Description:** Any action affecting more than one record simultaneously must display the exact count of affected records and require explicit confirmation before executing.
**Business Reason:** Bulk actions are the highest-risk single click in the system; an unconfirmed bulk action (e.g., "mark all absent") could corrupt a full session's billing-relevant data instantly.
**Configuration Options:** None — structural rule.
**Default Value:** N/A (fixed rule).
**Possible Values:** N/A.
**Dependencies:** Section 14.4, 14.6.
**Affected Modules:** All modules exposing bulk actions (Attendance, Billing, Notifications).
**Edge Cases:** A bulk action triggered on a filtered list must clearly state that the count reflects the *filtered* subset, not the full unfiltered dataset, to avoid staff misunderstanding scope.
**Examples:** Staff selects "Send payment reminder to all overdue accounts" → dialog reads "This will send 23 reminders. Continue?" before proceeding.
**Future Considerations:** None identified.

---

*This catalog currently documents the highest-priority rules referenced throughout Sections 3–14. As implementation and QA proceed, additional rules should be added following the exact template above, keeping the `[MODULE]-[NNN]` numbering sequential within each module.*

---

## 16. Open Questions

These are business decisions that still require stakeholder (owner/tutor) confirmation before the corresponding rules can be finalized and locked into default behavior. Each should be resolved and moved into the relevant section above once decided.

**16.1 — Should absent students always be charged?**
Currently defaulted to "charge unless excused" under per-session billing (BIL-001). Needs confirmation on: what qualifies as a valid excuse, whether excuses submitted after invoice generation are honored, and whether this default should differ between Private Tutor and Tutoring Center business types.

**16.2 — Should teacher cancellation extend the billing cycle?**
Currently defaulted to resolving via make-up session or end-of-cycle credit (BIL-002), without extending the cycle itself. Needs confirmation on whether some centers would instead prefer the entire cycle to shift by one session/day whenever a teacher-side cancellation occurs.

**16.3 — Should review sessions count toward the monthly session count?**
Relevant to Review Groups (5.5) and session-count-month billing (BIL-003). Needs confirmation on whether a review session delivered in addition to the regular schedule effectively gives the student a "free extra" session, or whether it's meant to substitute for a regular session in the count.

**16.4 — Should extra sessions be free by default?**
Currently defaulted to free (Section 6.1) pending confirmation. Needs input on whether pre-exam or make-up-adjacent "extra" sessions should ever carry a nominal or full charge by default, versus always requiring an explicit per-case override.

**16.5 — Should a scholarship and a manual discount be allowed to stack, and in what order?**
Section 8.19 notes this must be resolved explicitly (e.g., scholarship percentage applied first, then flat discount) rather than left ambiguous. Needs stakeholder confirmation of the intended calculation order and whether stacking is even permitted at all.

**16.6 — What happens to a reserved seat during a student Pause?**
Section 4.4 notes that a paused student's seat is not automatically held. Needs confirmation on whether certain groups (e.g., small, high-demand groups) should support an explicit "reserve seat during pause" option, and whether that carries any holding fee.

**16.7 — Should repeated late payment automatically restrict a student's attendance or group access?**
Section 8.5 and Section 11 explicitly keep this disabled by default, since it's a sensitive, relationship-affecting decision. Needs confirmation on whether any centers using the system would want this stricter automation available as an opt-in, and if so, after how many overdue cycles.

**16.8 — Is a Homework/Assignment tracking feature in scope for this version of the product?**
Section 13.10 includes a placeholder Homework Report pending confirmation that this feature exists in the PRD's scope at all. If out of scope for v1, this section should be removed rather than left as a dangling reference.

**16.9 — Should new students be charged a registration fee, and is it refundable if they never attend?**
Touched on in Section 4.1/4.2 but not fully resolved. Needs a clear default (e.g., non-refundable registration fee) plus an explicit override mechanism for centers that don't charge one at all.

**16.10 — Should a returning student (Section 4.7) ever be charged a second registration fee?**
Directly related to 16.9. Needs confirmation on whether "returning" is treated identically to "new" for fee purposes, or whether returning students are exempt by default.

---

*End of Business Rules Specification v1.0. This document should be reviewed alongside Genius Center PRD v2.0 and updated whenever a business rule changes, a new module is introduced, or an Open Question above is resolved.*
