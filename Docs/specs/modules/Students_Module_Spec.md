# Module Specification Template

| | |
|---|---|
| **Document Type** | Module Specification |
| **Version** | 1.0 (Frozen) |
| **Usage** | Module specification for Students |
| **Authority** | Subordinate to PRD, BRS, FS — supersedes task-level decisions |

---

## Metadata

| Field | Value |
|---|---|
| **Module ID** | `MOD-STU` |
| **Module Name** | Students |
| **Version** | 1.0 |
| **Status** | Approved / Frozen |
| **Author** | Antigravity AI |
| **Reviewers** | Owner / System Administrator |
| **Created** | 2026-07-06 |
| **Last Updated** | 2026-07-06 |
| **PRD Reference** | §8.1 |
| **FS Reference** | §3.2, §4.2-4.4, §5.1 |
| **Architecture Review** | `architecture/reviews/students.md` |

---

## 1. Purpose

**What is this module and why does it exist?**

The Students module is the foundation of the ERP. It manages the core identity of a student, including personal profile data and identity-level status (Active/Archived). It generates the unique identifiers and QR codes used across the system to establish identity for attendance, enrollment, and billing.

---

## 2. Goals

List measurable outcomes this module must achieve.

| # | Goal | Success Metric |
|---|---|---|
| G1 | Maintain a single source of truth for student identity | Zero duplicate active records for the same physical student. |
| G2 | Facilitate rapid attendance entry | Every student has an auto-generated, tenant-unique QR code and ID. |
| G3 | Expose identity to other modules | Strict separation of identity from academic and financial states. |

---

## 3. Non-Goals

Explicitly list what this module does **not** do in this version.

| # | Non-Goal | Reason |
|---|---|---|
| NG1 | Enrollment lifecycle | Transfers, Pause, Graduation, and Dropout are handled by the Enrollment module. |
| NG2 | Parent lifecycle | Parent entities and family logic are owned by the Parents module. |
| NG3 | Direct attendance tracking | The Students module owns identity; Attendance is a separate module that references students. |

---

## 4. Actors

List roles that interact with this module (PRD §16 base roles).

| Actor | Description | Primary Actions |
|---|---|---|
| Secretary | Front desk staff | Register students, print QR codes, update profiles. |
| Owner / Teacher | Business owner/educator | View student directory, archive records. |
| Assistant | Class assistant | View student list, check QR codes. |

---

## 5. Business Rules

Summarize module-specific business behavior. Do not duplicate full BRS text — reference by ID.

| Rule ID | Title | Summary | Configurable? | Default |
|---|---|---|---|---|
| STU-001 | Duplicate Warning | Warn on duplicate registration (same phone/name) | No | Warning only |
| BRS §4.1 | Registration vs. Enrollment | Registration creates identity but does not trigger billing | No | N/A |
| BRS §4.11| Historical Records | Full history preserved indefinitely; records are archived, never deleted | No | N/A |

### 5.1 Configuration Matrix

| Setting Key | Scope (Tenant/Group/Student) | Type | Default | BRS Ref |
|---|---|---|---|---|
| None | | | | |

### 5.2 Open Questions

List unresolved BRS §16 items affecting this module.

| Question ID | Question | Status | Decision |
|---|---|---|---|
| | None identified specifically blocking Student core logic. | | |

---

## 6. Referenced BRS Rules

Complete list of BRS rule IDs this module implements.

| Rule ID | Title | Implemented In (service/file) |
|---|---|---|
| STU-001 | Duplicate Warning | `StudentService.register` |

---

## 7. Referenced ETBS Scenarios

Complete list of ETBS scenario IDs this module must handle.

| Scenario ID | Title | Covered By (workflow/test) |
|---|---|---|
| ETBS-001 | Basic Registration | WF-STU-01 |

---

## 8. Entities

List data entities this module owns or consumes (PRD §13).

### 8.1 Owned Entities

| Entity | Description | Key Fields | Soft Delete? |
|---|---|---|---|
| `Student` | Core student profile and identity | `code`, `qrToken`, `name`, `phone`, `identityStatus` | Yes (Archived) |

### 8.2 Consumed Entities

| Entity | Owner Module | Usage |
|---|---|---|
| `Parent` | Parents Module | Linked to student during registration (join table managed by Parents/Enrollment or specifically consumed here) |
| `Enrollment` | Enrollment Module | Displayed on the student profile to show current academic status |

### 8.3 Schema Notes

- New tables/migrations required: Yes
- Migration description: `CREATE TABLE students (...)`
- Index requirements: Unique constraint on `qr_token` and `code`. Index on `phone` for fast lookup and duplicate checks.

---

## 9. Screens

List every screen from FS that this module implements.

| Screen ID | FS Ref | Name (Arabic) | Route | Primary Actor |
|---|---|---|---|---|
| SCR-STU-01 | FS §4.2 | قائمة الطلاب (Student List) | `/students` | Secretary / Assistant |
| SCR-STU-02 | FS §4.3 | الملف الشخصي (Student Profile)| `/students/:id` | Secretary / Assistant |
| SCR-STU-03 | FS §4.4 | إضافة طالب (New Student) | `/students/new` | Secretary |

### 9.1 Screen Details

#### SCR-STU-01: Student List
| Element | Specification |
|---|---|
| **Purpose** | View, search, and filter all students by identity |
| **Entry Points** | Sidebar navigation |
| **Layout Sections** | Search bar, filters (status), paginated data table |
| **Actions** | Create New Student, Export, View Profile |
| **Empty State** | "No students found. Click Add Student to begin." |
| **Loading State** | Skeleton table rows |
| **Error States** | Fetch error placeholder with retry |
| **Keyboard Shortcuts** | Ctrl+F to focus search |

---

## 10. Workflows

Define step-by-step workflows. Reference FS §5 where complete.

### WF-STU-01: Register Student Identity

| Field | Value |
|---|---|
| **Trigger** | User clicks "New Student" and submits form |
| **Primary Actor** | Secretary |
| **Preconditions** | User has `students.write` |
| **BRS Rules** | STU-001 |
| **ETBS Scenarios** | ETBS-001 |

**Steps:**

1. User enters student profile details (Name, Phone, Grade, etc.).
2. User provides parent lookup data (which invokes the Parents module to link or create).
3. System validates student uniqueness (warns on similar name/phone).
4. System generates unique `code` and `qrToken`.
5. System saves `Student` record.

**Postconditions:**
Student identity is created with an `Active` identity status and a printable QR code.

**Failure Paths:**

| Failure | System Response | User Message (Arabic key) |
|---|---|---|
| Validation | Prevent save | `students.error.validation` |

---

## 11. Permissions

Map every action to permission keys (PRD §16).

| Action | Permission Key | Owner | Teacher | Assistant | Secretary | Accountant |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| View List | `students.read` | ✔ | ✔ | ✔ | ✔ | |
| Add/Edit | `students.write` | ✔ | | ✔ | ✔ | |
| Archive | `students.delete`| ✔ | | | | |

**Enforcement:**
- [x] Service layer checks documented
- [x] UI gates documented (defensive)

---

## 12. Validations

| Field / Input | Rule | Error Key | BRS Ref |
|---|---|---|---|
| Name | Required, min 2 chars | `errors.student.name` | |
| Phone | Optional, valid format | `errors.student.phone` | |

### 12.1 Cross-Field Validations

| Rule | Description |
|---|---|
| Unique Check | Warn if Phone is identical to another active student |

### 12.2 Business Validations (Domain)

| Rule | Service Method | Error Type |
|---|---|---|
| Status Update | `updateIdentityStatus` | `InvalidTransitionError` |

---

## 13. Architecture

### 13.1 Service Layer

| Service | Responsibility |
|---|---|
| `StudentService` | Identity registration, profile updates, QR generation, archival. |

### 13.2 Repositories

| Repository | Entity |
|---|---|
| `StudentRepository` | `Student` |

### 13.3 IPC Channels

| Channel | Input Schema | Output | Auth Required |
|---|---|---|---|
| `students:create` | `CreateStudentSchema` | `StudentDto` | Yes |

### 13.4 Infrastructure Dependencies

| Service | Usage |
|---|---|
| `AuditService` | All writes |
| `ParentService`| Cross-module call to link parent during registration |

### 13.5 Transaction Boundaries

| Operation | Transaction Scope |
|---|---|
| `students:create` | Atomic creation of the student identity |

---

## 14. Audit Requirements

| Action | Entity | Audit Fields (before/after) |
|---|---|---|
| Create | `Student` | `name`, `phone` |
| Identity Change| `Student` | `oldStatus` (e.g. Active), `newStatus` (e.g. Archived) |

Confirm: audit emitted via repository decorator — not manual per call site.

---

## 15. Notifications

| Trigger | Template Key | Channel | Recipient | Auto/Manual |
|---|---|---|---|---|
| Identity Created | `student.welcome` | SMS/Internal | Parent (via Parent Module)| Auto |

---

## 16. Reports

| Report | Filters | Export Formats |
|---|---|---|
| Student Directory| Identity Status | PDF / Excel |

---

## 17. Acceptance Criteria

Testable criteria — QA derives test plan directly from this section.

### AC-STU-001: Register identity

**Given** an authenticated Secretary
**When** completing the New Student form
**Then** the student is saved with an Active identity status and a generated QR code.

**References:** BRS §4.1

---

## 18. Testing Requirements

| Test Type | Scope | Priority |
|---|---|---|
| Unit | QR generation, identity logic | Required |
| Integration | Repository + audit | Required |
| E2E | Register workflow | Required |
| Permission | Service-layer denial | Required |
| RTL | All screens | Required |

### 18.1 Critical Test Cases

| ID | Description | ETBS/BRS Ref |
|---|---|---|
| TC-STU-001 | Verify QR code uniqueness generation | |

---

## 19. Performance Requirements

| Operation | Target | PRD Ref |
|---|---|---|
| List fetch | < 100ms | §18 |

---

## 20. i18n Requirements

List all new i18n key namespaces for this module.

| Namespace | Example Keys |
|---|---|
| `students.list.title` | "قائمة الطلاب" |
| `students.profile.identity` | "بيانات الهوية" |

All error messages, labels, toasts, and confirmations must have keys.

---

## 21. Future Extensions

Document PRD §7.2 or BRS future considerations without implementing now.

| Extension | Description | Schema/UI Hook |
|---|---|---|
| Custom ID Formats | Configurable sequence for student codes | System Settings |

---

## 22. Traceability Matrix

| ETBS | BRS Rule | FS Screen/Workflow | Service | Test Case |
|---|---|---|---|---|
| ETBS-001 | BRS §4.1 | SCR-STU-03 | `StudentService` | TC-STU-001 |

---

## 23. Approval

| Role | Name | Date | Status |
|---|---|---|---|
| Business Analyst | Antigravity AI | 2026-07-06 | ☑ Approved |
| Software Architect | Antigravity AI | 2026-07-06 | ☑ Approved |
| ERP Consultant (if financial) | N/A | | ☑ N/A |
| QA Engineer | Antigravity AI | 2026-07-06 | ☑ Test plan feasible |

---
