# Module Specification — Subjects

> [!CAUTION]
> **⛔ DEFERRED TO VERSION 2.0** — Decision [D-006](file:///d:/Course/Projects/Genius%20Center/Docs/decisions/D-006_Postpone_Subjects_Module.md)
>
> This module is **not part of the v1.0 implementation roadmap.** Version 1.0 targets a single private tutor who teaches one subject. The teacher's subject is stored as an optional informational field (`subject_taught`) in the Settings module instead.
>
> This specification is preserved as a reference for v2.0 (Tutoring Center Edition), when Subjects will become a first-class business entity. **Do NOT implement** Subject CRUD, Prisma model, service, repository, IPC channels, or screens until v2.0.

| | |
|---|---|
| **Document Type** | Module Specification |
| **Version** | 1.0 |
| **Usage** | Module specification for Subjects |
| **Authority** | Subordinate to PRD, BRS, FS — supersedes task-level decisions |

---

## Metadata

| Field | Value |
|---|---|
| **Module ID** | `MOD-SUB` |
| **Module Name** | Subjects |
| **Version** | 1.0 |
| **Status** | **⛔ Deferred to v2.0** (Decision D-006) |
| **Author** | Antigravity AI |
| **Reviewers** | Owner / System Administrator |
| **Created** | 2026-07-06 |
| **Last Updated** | 2026-07-08 |
| **PRD Reference** | §8.2 (implied under academic structure) |
| **FS Reference** | FS §3 (General Setup) |
| **Architecture Review** | `architecture/reviews/subjects.md` |

---

## 1. Purpose

**What is this module and why does it exist?**

The Subjects module manages the academic subjects offered by the teacher or tutoring center (e.g., Mathematics, Physics, Arabic). It acts strictly as an identity registry for the academic curriculum, providing standard, unified taxonomy for other modules (like Groups, Reports, and Enrollments) to reference without tying itself to scheduling, pricing, or teacher assignment.

---

## 2. Goals

List measurable outcomes this module must achieve.

| # | Goal | Success Metric |
|---|---|---|
| G1 | Maintain a clean taxonomy of subjects | Zero duplicate active subjects within a tenant. |
| G2 | Guarantee historical referential integrity | 100% of archived subjects are preserved for past group history. |
| G3 | Provide visual consistency | Display ordering and color coding remain uniform across UI elements consuming subjects. |

---

## 3. Non-Goals

Explicitly list what this module does **not** do in this version.

| # | Non-Goal | Reason |
|---|---|---|
| NG1 | Pricing Configuration | Pricing varies by group and enrollment, not inherently by the subject itself. |
| NG2 | Scheduling | Scheduling is a property of a Group/Class Session, not a Subject. |
| NG3 | Teacher Assignment | Teachers are assigned to Groups or Sessions, not globally to Subjects. |
| NG4 | Enrollments & Attendance | Student metrics are managed downstream in specific operational modules. |

---

## 4. Actors

List roles that interact with this module (PRD §16 base roles).

| Actor | Description | Primary Actions |
|---|---|---|
| Owner | Business owner | Add, edit, and archive subjects. Configure display order. |
| Secretary | Front desk staff | Read-only view (to assign groups or answer inquiries). |
| Teacher | Educator | Read-only view. |

---

## 5. Business Rules

Summarize module-specific business behavior. Do not duplicate full BRS text — reference by ID.

| Rule ID | Title | Summary | Configurable? | Default |
|---|---|---|---|---|
| SUB-001 | Uniqueness | Subject names must be unique within the same tenant. | No | N/A |
| SUB-002 | Archival Preservation | Subjects can be archived but never permanently deleted to preserve historical references. | No | N/A |
| SUB-003 | Archival Usage | Archived subjects cannot be assigned to new groups, but existing groups keep references. | No | N/A |
| SUB-004 | Reusability | Subjects are reusable across multiple groups simultaneously. | No | N/A |

### 5.1 Configuration Matrix

| Setting Key | Scope (Tenant/Group/Student) | Type | Default | BRS Ref |
|---|---|---|---|---|
| None | | | | |

### 5.2 Open Questions

List unresolved BRS §16 items affecting this module.

| Question ID | Question | Status | Decision |
|---|---|---|---|
| | None identified blocking Subject logic. | | |

---

## 6. Referenced BRS Rules

Complete list of BRS rule IDs this module implements.

| Rule ID | Title | Implemented In (service/file) |
|---|---|---|
| SUB-001 | Uniqueness | `SubjectService.create` |
| SUB-002 | Archival Preservation | `SubjectService.archive` |

---

## 7. Referenced ETBS Scenarios

Complete list of ETBS scenario IDs this module must handle.

| Scenario ID | Title | Covered By (workflow/test) |
|---|---|---|
| ETBS-001 | Center Setup | WF-SUB-01 |

---

## 8. Entities

List data entities this module owns or consumes (PRD §13).

### 8.1 Owned Entities

| Entity | Description | Key Fields | Soft Delete? |
|---|---|---|---|
| `Subject` | Academic subject identity | `name`, `color`, `icon`, `displayOrder`, `status` (Active/Archived) | Yes (Archived) |

### 8.2 Consumed Entities

None.

### 8.3 Schema Notes

- New tables/migrations required: Yes
- Migration description: `CREATE TABLE subjects (id TEXT PRIMARY KEY, tenant_id TEXT, name TEXT, color TEXT, icon TEXT, display_order INT, status TEXT)`
- Index requirements: Unique constraint on `(tenant_id, name)`.

---

## 9. Screens

List every screen from FS that this module implements.

| Screen ID | FS Ref | Name (Arabic) | Route | Primary Actor |
|---|---|---|---|---|
| SCR-SUB-01 | FS Setup | إعدادات المواد (Subjects Setup) | `/settings/subjects` | Owner |

### 9.1 Screen Details

#### SCR-SUB-01: Subjects Setup
| Element | Specification |
|---|---|
| **Purpose** | Add, edit, and organize academic subjects |
| **Entry Points** | Settings Hub -> Subjects Tab |
| **Layout Sections** | Draggable list of subjects for ordering, "Add Subject" modal |
| **Actions** | Add, Edit (Name, Color, Icon), Archive, Reorder |
| **Empty State** | "لا توجد مواد مضافة بعد." |
| **Loading State** | Skeleton list items |
| **Error States** | Validation error if name is duplicate |
| **Keyboard Shortcuts** | Enter to save on form |

---

## 10. Workflows

Define step-by-step workflows. Reference FS §5 where complete.

### WF-SUB-01: Add/Edit Subject

| Field | Value |
|---|---|
| **Trigger** | User clicks "Add Subject" or "Edit" |
| **Primary Actor** | Owner |
| **Preconditions** | User has `settings.write` or specific `subjects.write` permission |
| **BRS Rules** | SUB-001 |

**Steps:**

1. User provides a Name, and optionally selects a Color and Icon.
2. System validates that the Name is unique within the tenant (ignoring archived subjects or preventing recreation based on business preference — here, unique among Active).
3. System saves the `Subject`.

**Postconditions:**
Subject is available to be selected in Group creation.

**Failure Paths:**

| Failure | System Response | User Message (Arabic key) |
|---|---|---|
| Duplicate Name | Prevent save | `subjects.error.duplicate` |

### WF-SUB-02: Archive Subject
**Steps:**
1. Select an Active subject.
2. Click "Archive".
3. System marks `status` as Archived.
4. Subject is removed from active dropdowns but remains visible in historical reports.

### WF-SUB-03: Reorder Subjects
**Steps:**
1. User drags and drops subjects in the list.
2. System updates the `displayOrder` integer for the affected records in a batch operation.

---

## 11. Permissions

Map every action to permission keys (PRD §16).

| Action | Permission Key | Owner | Teacher | Assistant | Secretary | Accountant |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| View List | `subjects.read` | ✔ | ✔ | ✔ | ✔ | ✔ |
| Add/Edit | `subjects.write` | ✔ | | | | |
| Archive | `subjects.delete`| ✔ | | | | |

**Enforcement:**
- [x] Service layer checks documented
- [x] UI gates documented (defensive)

---

## 12. Validations

| Field / Input | Rule | Error Key | BRS Ref |
|---|---|---|---|
| Name | Required, min 2 chars | `errors.subject.name` | |
| Name Uniqueness| Must be unique in tenant | `errors.subject.duplicate` | SUB-001 |
| Color | Valid Hex string (optional)| `errors.subject.color` | |

### 12.1 Cross-Field Validations

None.

### 12.2 Business Validations (Domain)

| Rule | Service Method | Error Type |
|---|---|---|
| Archived usage | `validateSubjectActive` | `SubjectArchivedError` |

---

## 13. Architecture

### 13.1 Service Layer

| Service | Responsibility |
|---|---|
| `SubjectService` | CRUD, archival, reordering logic, uniqueness checks. |

### 13.2 Repositories

| Repository | Entity |
|---|---|
| `SubjectRepository` | `Subject` |

### 13.3 IPC Channels

| Channel | Input Schema | Output | Auth Required |
|---|---|---|---|
| `subjects:list` | `{includeArchived: boolean}`| `SubjectDto[]` | Yes |
| `subjects:create` | `CreateSubjectSchema` | `SubjectDto` | Yes |
| `subjects:reorder`| `{id: string, newOrder: number}[]`| `void` | Yes |

### 13.4 Infrastructure Dependencies

| Service | Usage |
|---|---|
| `AuditService` | All writes |

### 13.5 Transaction Boundaries

| Operation | Transaction Scope |
|---|---|
| `subjects:reorder`| Batch update of multiple `displayOrder` fields |

---

## 14. Audit Requirements

| Action | Entity | Audit Fields (before/after) |
|---|---|---|
| Create | `Subject` | `name` |
| Archive | `Subject` | `status` (Active -> Archived) |

Confirm: audit emitted via repository decorator — not manual per call site.

---

## 15. Notifications

None.

---

## 16. Reports

| Report | Filters | Export Formats |
|---|---|---|
| Subjects Catalog| Active/Archived | PDF / Excel |

---

## 17. Acceptance Criteria

Testable criteria — QA derives test plan directly from this section.

### AC-SUB-001: Prevent duplicate subjects

**Given** an Active subject named "Mathematics"
**When** the Owner attempts to create a new subject named "Mathematics"
**Then** the system rejects the creation with a duplication error.

**References:** SUB-001

---

### AC-SUB-002: Archive instead of delete

**Given** a subject linked to past groups
**When** the Owner archives the subject
**Then** the subject status changes to Archived, it no longer appears in the "New Group" dropdown, but historical groups still display the subject correctly.

**References:** SUB-002, SUB-003

---

## 18. Testing Requirements

| Test Type | Scope | Priority |
|---|---|---|
| Unit | Validation, Archival state logic | Required |
| E2E | Create, Reorder, Archive workflows | Required |
| RTL | Display correctly in RTL | Required |

### 18.1 Critical Test Cases

| ID | Description | ETBS/BRS Ref |
|---|---|---|
| TC-SUB-001 | Verify batch reordering transaction succeeds | |

---

## 19. Performance Requirements

| Operation | Target | PRD Ref |
|---|---|---|
| List fetch | < 50ms (Cacheable) | §18 |

---

## 20. i18n Requirements

List all new i18n key namespaces for this module.

| Namespace | Example Keys |
|---|---|
| `subjects.title` | "المواد الدراسية" |
| `subjects.add` | "إضافة مادة" |

All error messages, labels, toasts, and confirmations must have keys.

---

## 21. Future Extensions

Document PRD §7.2 or BRS future considerations without implementing now.

| Extension | Description | Schema/UI Hook |
|---|---|---|
| Sub-Subjects | Creating topics within a subject | `parentId` linking to itself |

---

## 22. Traceability Matrix

| ETBS | BRS Rule | FS Screen/Workflow | Service | Test Case |
|---|---|---|---|---|
| ETBS-001 | SUB-001 | WF-SUB-01 | `SubjectService` | TC-SUB-001 |

---

## 23. Approval

| Role | Name | Date | Status |
|---|---|---|---|
| Business Analyst | Antigravity AI | 2026-07-06 | ☐ Approved |
| Software Architect | Antigravity AI | 2026-07-06 | ☐ Approved |
| ERP Consultant (if financial) | N/A | | ☐ N/A |
| QA Engineer | Antigravity AI | 2026-07-06 | ☐ Test plan feasible |

---
