# Module Specification Template

| | |
|---|---|
| **Document Type** | Module Specification |
| **Version** | 1.0 |
| **Usage** | Module specification for Parents |
| **Authority** | Subordinate to PRD, BRS, FS — supersedes task-level decisions |

---

## Metadata

| Field | Value |
|---|---|
| **Module ID** | `MOD-PAR` |
| **Module Name** | Parents |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Antigravity AI |
| **Reviewers** | Owner / System Administrator |
| **Created** | 2026-07-06 |
| **Last Updated** | 2026-07-06 |
| **PRD Reference** | §8.1 |
| **FS Reference** | §3.3, §4.6, §4.7 |
| **Architecture Review** | `architecture/reviews/parents.md` |

---

## 1. Purpose

**What is this module and why does it exist?**

The Parents module isolates the management of parent/guardian profiles from student profiles. It serves as the single source of truth for guardian contact information, family relationships (linking multiple students/siblings to the same payer), notification preferences, and consolidated family billing views.

---

## 2. Goals

List measurable outcomes this module must achieve.

| # | Goal | Success Metric |
|---|---|---|
| G1 | Unify family billing and communication | 100% of siblings share a single parent record instead of duplicate records. |
| G2 | Resolve duplicated data entry | Provide a safe merge tool to combine accidental duplicate parent records. |
| G3 | Manage notification targeting | Ensure the primary contact flag dictates who receives automated SMS/alerts. |

---

## 3. Non-Goals

Explicitly list what this module does **not** do in this version.

| # | Non-Goal | Reason |
|---|---|---|
| NG1 | Payment Processing | The Parents module displays combined balances, but the Payments module handles the transaction itself. |
| NG2 | Student Enrollment | Parents do not own student academic history or status. |
| NG3 | Parent Mobile Portal | This specification focuses on the desktop ERP staff interface. The Parent App API is a separate concern. |

---

## 4. Actors

List roles that interact with this module (PRD §16 base roles).

| Actor | Description | Primary Actions |
|---|---|---|
| Secretary | Front desk staff | Link parents to students, update phone numbers, merge duplicates. |
| Owner | Business owner | View family balances, intervene in payment disputes. |
| Accountant | Financial staff | View combined family balances (read-only contact info). |

---

## 5. Business Rules

Summarize module-specific business behavior. Do not duplicate full BRS text — reference by ID.

| Rule ID | Title | Summary | Configurable? | Default |
|---|---|---|---|---|
| BRS §4.10| Parent Relationships | A student may have multiple guardians. | No | N/A |
| BRS §4.10| Primary Contact | At least one linked parent per student should be designated as primary. | No | N/A |
| BRS §4.10| Sibling Linkage | Multiple students can link to the exact same parent record to support family billing. | No | N/A |
| ETBS-013 | Combined Billing | Parent profile must calculate and display a unified balance across all linked children. | No | N/A |

### 5.1 Configuration Matrix

| Setting Key | Scope (Tenant/Group/Student) | Type | Default | BRS Ref |
|---|---|---|---|---|
| None | | | | |

### 5.2 Open Questions

List unresolved BRS §16 items affecting this module. **Implementation blocked until resolved or explicitly deferred with stakeholder approval.**

| Question ID | Question | Status | Decision |
|---|---|---|---|
| | None identified blocking Parent core logic. | | |

---

## 6. Referenced BRS Rules

Complete list of BRS rule IDs this module implements.

| Rule ID | Title | Implemented In (service/file) |
|---|---|---|
| N/A | Parent rules are currently implicit in BRS §4.10 | `ParentService` |

---

## 7. Referenced ETBS Scenarios

Complete list of ETBS scenario IDs this module must handle.

| Scenario ID | Title | Covered By (workflow/test) |
|---|---|---|
| ETBS-013 | Parent Pays for Two Children | WF-PAR-02 (Viewing Balance), Billing module for payment |
| ETBS-085 | Parent Opts Out of SMS | `ParentService.updateNotificationPrefs` |
| ETBS-089 | Duplicate Parent Entry | WF-PAR-03 (Merge Parents) |

---

## 8. Entities

List data entities this module owns or consumes (PRD §13).

### 8.1 Owned Entities

| Entity | Description | Key Fields | Soft Delete? |
|---|---|---|---|
| `Parent` | Guardian profile | `name`, `phone`, `altPhone`, `email`, `notes`, `notificationPrefs` | Yes |
| `StudentParentLink` | Relationship edge | `studentId`, `parentId`, `relationType`, `isPrimary` | No |

### 8.2 Consumed Entities

| Entity | Owner Module | Usage |
|---|---|---|
| `Student` | Students Module | Displayed in linked student list |
| `Invoice` | Billing Module | Queried to aggregate total family balance |

### 8.3 Schema Notes

- New tables/migrations required: Yes
- Migration description: `CREATE TABLE parents (...)`, `CREATE TABLE student_parents (...)`
- Index requirements: Index on `phone` for fast duplicate detection.

---

## 9. Screens

List every screen from FS that this module implements.

| Screen ID | FS Ref | Name (Arabic) | Route | Primary Actor |
|---|---|---|---|---|
| SCR-PAR-01 | FS §4.6 | قائمة أولياء الأمور (Parent List) | `/parents` | Secretary |
| SCR-PAR-02 | FS §4.7 | ملف ولي الأمر (Parent Profile)| `/parents/:id` | Secretary |

### 9.1 Screen Details

#### SCR-PAR-01: Parent List
| Element | Specification |
|---|---|
| **Purpose** | Registry of guardians/payers |
| **Entry Points** | Sidebar navigation |
| **Layout Sections** | Search bar, paginated table (Name, Phone, Linked Students, Family Balance) |
| **Actions** | New Parent, Merge Duplicates |
| **Empty State** | "لا يوجد أولياء أمور بعد." |
| **Loading State** | Skeleton table rows |
| **Error States** | Fetch error placeholder with retry |
| **Keyboard Shortcuts** | Ctrl+N (New Parent) |

#### SCR-PAR-02: Parent Profile
| Element | Specification |
|---|---|
| **Purpose** | View/manage one guardian's info and family billing |
| **Entry Points** | Parent List, Student Profile -> Parents tab |
| **Layout Sections** | Contact details, Linked Students list, Combined Balance, Notification Preferences |
| **Actions** | Edit, Link Student, Unlink Student, Send Notification, Record Family Payment |
| **Empty State** | If no linked students: "لم يتم ربط أي طالب بعد." |
| **Loading State** | Skeleton on load |

---

## 10. Workflows

Define step-by-step workflows. Reference FS §5 where complete.

### WF-PAR-01: Link Student to Parent

| Field | Value |
|---|---|
| **Trigger** | User clicks "Link Student" on Parent Profile (or vice versa) |
| **Primary Actor** | Secretary |
| **Preconditions** | User has `parents.write` and `students.write` |
| **BRS Rules** | BRS §4.10 |

**Steps:**

1. User searches for existing Student (or Parent).
2. User selects the relation type (e.g., Father, Mother, Guardian).
3. User toggles whether this is the Primary Contact.
4. System saves `StudentParentLink` record.
5. If marked primary, system updates other links to ensure only one primary contact exists (if that is the center's policy, or leaves multiple).

**Postconditions:**
Student and Parent are linked. Family balance automatically updates.

### WF-PAR-02: View Family Balance
**Steps:**
1. Navigate to Parent Profile.
2. System queries all `Invoice` records associated with all `studentId`s linked to this parent.
3. System aggregates and displays the total outstanding balance.

### WF-PAR-03: Merge Duplicate Parents
**Steps:**
1. Select two Parent records from the Parent List and click "Merge".
2. System displays a confirmation dialog showing which links and contact info will be consolidated into the primary record.
3. User confirms.
4. System updates all `student_parents` rows pointing to the secondary parent to point to the primary parent.
5. System soft-deletes the secondary parent record.

---

## 11. Permissions

Map every action to permission keys (PRD §16).

| Action | Permission Key | Owner | Teacher | Assistant | Secretary | Accountant |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| View List | `parents.read` | ✔ | | | ✔ | ✔ (Balance only) |
| Add/Edit | `parents.write` | ✔ | | | ✔ | |
| Merge/Del | `parents.delete`| ✔ | | | | |

**Enforcement:**
- [x] Service layer checks documented
- [x] UI gates documented (defensive)

---

## 12. Validations

| Field / Input | Rule | Error Key | BRS Ref |
|---|---|---|---|
| Phone | Required, valid format | `errors.parent.phone` | |
| Relation Type | Required for linking | `errors.parent.relation` | |

### 12.1 Cross-Field Validations

| Rule | Description |
|---|---|
| Merge Guard | Cannot merge a parent into themselves |

### 12.2 Business Validations (Domain)

| Rule | Service Method | Error Type |
|---|---|---|
| Primary Contact | `linkStudent` | `MissingPrimaryContactWarning` (Soft validation) |

---

## 13. Architecture

### 13.1 Service Layer

| Service | Responsibility |
|---|---|
| `ParentService` | CRUD operations, linking students, merging records, aggregating family balances. |

### 13.2 Repositories

| Repository | Entity |
|---|---|
| `ParentRepository` | `Parent`, `StudentParentLink` |

### 13.3 IPC Channels

| Channel | Input Schema | Output | Auth Required |
|---|---|---|---|
| `parents:merge` | `{primaryId, secondaryId}`| `void` | Yes (`parents.delete`) |
| `parents:link` | `{parentId, studentId, type, primary}`| `void` | Yes |

### 13.4 Infrastructure Dependencies

| Service | Usage |
|---|---|
| `AuditService` | All writes |
| `BillingService`| Queried dynamically to calculate family balance |

### 13.5 Transaction Boundaries

| Operation | Transaction Scope |
|---|---|
| `parents:merge` | Updates foreign keys in join table and soft deletes parent inside a single transaction. |

---

## 14. Audit Requirements

| Action | Entity | Audit Fields (before/after) |
|---|---|---|
| Merge | `Parent` | `secondaryParentId` merged into `primaryParentId` |
| Update Prefs | `Parent` | `oldNotificationPrefs`, `newNotificationPrefs` |

Confirm: audit emitted via repository decorator — not manual per call site.

---

## 15. Notifications

| Trigger | Template Key | Channel | Recipient | Auto/Manual |
|---|---|---|---|---|
| Opt-Out | N/A | N/A | System | N/A (Updates preference) |

---

## 16. Reports

| Report | Filters | Export Formats |
|---|---|---|
| Family Balances | Min balance threshold | PDF / Excel |

---

## 17. Acceptance Criteria

Testable criteria — QA derives test plan directly from this section.

### AC-PAR-001: Merge duplicate records

**Given** an authenticated Secretary
**When** merging Parent B into Parent A
**Then** all students linked to Parent B become linked to Parent A, Parent B is marked deleted, and the new family balance is the sum of all students' balances.

**References:** ETBS-089

---

### AC-PAR-002: Link sibling

**Given** Parent A is linked to Student X
**When** the user links Student Y to Parent A
**Then** Parent A is listed on both Student Profiles, and Parent A's profile shows a combined balance for X and Y.

**References:** ETBS-013

---

## 18. Testing Requirements

| Test Type | Scope | Priority |
|---|---|---|
| Unit | Balance aggregation, merge logic | Required |
| Integration | Transaction rollback on merge failure | Required |
| E2E | Link sibling and verify balance | Required |
| Permission | Service-layer denial | Required |
| RTL | All screens | Required |

### 18.1 Critical Test Cases

| ID | Description | ETBS/BRS Ref |
|---|---|---|
| TC-PAR-001 | Verify merge successfully reassigns join tables | ETBS-089 |

---

## 19. Performance Requirements

| Operation | Target | PRD Ref |
|---|---|---|
| Family Balance | < 100ms | §18 |

---

## 20. i18n Requirements

List all new i18n key namespaces for this module.

| Namespace | Example Keys |
|---|---|
| `parents.list.title` | "قائمة أولياء الأمور" |
| `parents.merge.confirm` | "هل أنت متأكد من دمج الحسابين؟" |

All error messages, labels, toasts, and confirmations must have keys.

---

## 21. Future Extensions

Document PRD §7.2 or BRS future considerations without implementing now.

| Extension | Description | Schema/UI Hook |
|---|---|---|
| Family Wallet | A shared prepaid balance for the entire family | Requires ledger rewrite |

---

## 22. Traceability Matrix

| ETBS | BRS Rule | FS Screen/Workflow | Service | Test Case |
|---|---|---|---|---|
| ETBS-013 | BRS §4.10 | WF-PAR-02 | `ParentService` | TC-PAR-002 |
| ETBS-089 | N/A | WF-PAR-03 | `ParentService` | TC-PAR-001 |

---

## 23. Approval

| Role | Name | Date | Status |
|---|---|---|---|
| Business Analyst | Antigravity AI | 2026-07-06 | ☐ Approved |
| Software Architect | Antigravity AI | 2026-07-06 | ☐ Approved |
| ERP Consultant (if financial) | N/A | | ☐ N/A |
| QA Engineer | Antigravity AI | 2026-07-06 | ☐ Test plan feasible |

---
