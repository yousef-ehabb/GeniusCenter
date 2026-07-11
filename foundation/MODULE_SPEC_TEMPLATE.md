# Module Specification Template

| | |
|---|---|
| **Document Type** | Module Specification |
| **Version** | 1.0 (template) |
| **Usage** | Copy this file to `specs/modules/[module-name].md` and complete every section |
| **Authority** | Subordinate to PRD, BRS, FS — supersedes task-level decisions |

---

> **Instructions:** Do not delete section headers. Mark N/A only with justification. Every module spec must be approved by Software Architect before tasks are created.

---

## Metadata

| Field | Value |
|---|---|
| **Module ID** | `MOD-XXX` |
| **Module Name** | |
| **Version** | 1.0 |
| **Status** | Draft / In Review / Approved |
| **Author** | |
| **Reviewers** | |
| **Created** | YYYY-MM-DD |
| **Last Updated** | YYYY-MM-DD |
| **PRD Reference** | § |
| **FS Reference** | § |
| **Architecture Review** | `architecture/reviews/[name].md` |

---

## 1. Purpose

**What is this module and why does it exist?**

Describe the module's role in Genius Center from the tutor's perspective. One paragraph maximum.

Example prompt: *"The Attendance module allows tutors and assistants to record whether each student attended a class session — via manual grid, search, mobile QR, or USB scanner — with all methods enforcing the same business rules."*

---

## 2. Goals

List measurable outcomes this module must achieve.

| # | Goal | Success Metric |
|---|---|---|
| G1 | | |
| G2 | | |
| G3 | | |

Link to PRD §3.2 success metrics where applicable.

---

## 3. Non-Goals

Explicitly list what this module does **not** do in this version.

| # | Non-Goal | Reason |
|---|---|---|
| NG1 | | |

---

## 4. Actors

List roles that interact with this module (PRD §16 base roles).

| Actor | Description | Primary Actions |
|---|---|---|
| Owner | | |
| Teacher | | |
| Assistant | | |
| Secretary | | |
| Accountant | | |
| Custom Roles | | |

---

## 5. Business Rules

Summarize module-specific business behavior. Do not duplicate full BRS text — reference by ID.

| Rule ID | Title | Summary | Configurable? | Default |
|---|---|---|---|---|
| | | | Yes/No | |

### 5.1 Configuration Matrix

| Setting Key | Scope (Tenant/Group/Student) | Type | Default | BRS Ref |
|---|---|---|---|---|
| | | | | |

### 5.2 Open Questions

List unresolved BRS §16 items affecting this module. **Implementation blocked until resolved or explicitly deferred with stakeholder approval.**

| Question ID | Question | Status | Decision |
|---|---|---|---|
| | | Open / Deferred / Resolved | |

---

## 6. Referenced BRS Rules

Complete list of BRS rule IDs this module implements.

| Rule ID | Title | Implemented In (service/file) |
|---|---|---|
| BIL-001 | | |
| ATT-001 | | |

---

## 7. Referenced ETBS Scenarios

Complete list of ETBS scenario IDs this module must handle.

| Scenario ID | Title | Covered By (workflow/test) |
|---|---|---|
| ETBS-001 | | |
| ETBS-027 | | |

---

## 8. Entities

List data entities this module owns or consumes (PRD §13).

### 8.1 Owned Entities

| Entity | Description | Key Fields | Soft Delete? |
|---|---|---|---|
| | | | |

### 8.2 Consumed Entities

| Entity | Owner Module | Usage |
|---|---|---|
| | | |

### 8.3 Schema Notes

- New tables/migrations required: Yes / No
- Migration description:
- Index requirements:

---

## 9. Screens

List every screen from FS that this module implements.

| Screen ID | FS Ref | Name (Arabic) | Route | Primary Actor |
|---|---|---|---|---|
| SCR-001 | FS §4.x | | | |

### 9.1 Screen Details

Repeat for each screen or reference FS section if fully specified there.

#### SCR-XXX: [Screen Name]

| Element | Specification |
|---|---|
| **Purpose** | |
| **Entry Points** | |
| **Layout Sections** | |
| **Actions** | |
| **Empty State** | |
| **Loading State** | |
| **Error States** | |
| **Keyboard Shortcuts** | |

---

## 10. Workflows

Define step-by-step workflows. Reference FS §5 where complete.

### WF-XXX: [Workflow Name]

| Field | Value |
|---|---|
| **Trigger** | |
| **Primary Actor** | |
| **Preconditions** | |
| **BRS Rules** | |
| **ETBS Scenarios** | |

**Steps:**

1. 
2. 
3. 

**Postconditions:**

**Failure Paths:**

| Failure | System Response | User Message (Arabic key) |
|---|---|---|
| | | |

---

## 11. Permissions

Map every action to permission keys (PRD §16).

| Action | Permission Key | Owner | Teacher | Assistant | Secretary | Accountant |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| | `module.action` | ✔ | | | | |

**Enforcement:**
- [ ] Service layer checks documented
- [ ] UI gates documented (defensive)

---

## 12. Validations

| Field / Input | Rule | Error Key | BRS Ref |
|---|---|---|---|
| | Required, min 1 char | `errors.xxx` | |

### 12.1 Cross-Field Validations

| Rule | Description |
|---|---|
| | |

### 12.2 Business Validations (Domain)

| Rule | Service Method | Error Type |
|---|---|---|
| | | `DomainError` |

---

## 13. Architecture

### 13.1 Service Layer

| Service | Responsibility |
|---|---|
| | |

### 13.2 Repositories

| Repository | Entity |
|---|---|
| | |

### 13.3 IPC Channels

| Channel | Input Schema | Output | Auth Required |
|---|---|---|---|
| `domain:action` | `CreateXSchema` | `XDto` | Yes |

### 13.4 Infrastructure Dependencies

| Service | Usage |
|---|---|
| AuditService | All writes |
| | |

### 13.5 Transaction Boundaries

| Operation | Transaction Scope |
|---|---|
| | |

---

## 14. Audit Requirements

| Action | Entity | Audit Fields (before/after) |
|---|---|---|
| Create | | |
| Update | | |
| Void/Archive | | |

Confirm: audit emitted via repository decorator — not manual per call site.

---

## 15. Notifications

| Trigger | Template Key | Channel | Recipient | Auto/Manual |
|---|---|---|---|---|
| | | INTERNAL | | |

---

## 16. Reports

| Report | Filters | Export Formats |
|---|---|---|
| | | PDF / Excel / CSV |

---

## 17. Acceptance Criteria

Testable criteria — QA derives test plan directly from this section.

### AC-001: [Criterion Title]

**Given** [precondition]
**When** [action]
**Then** [expected result]

**References:** BRS-XXX, ETBS-XXX

---

### AC-002: [Criterion Title]

**Given**
**When**
**Then**

**References:**

(Add as many as required — minimum one per workflow and one per BRS rule.)

---

## 18. Testing Requirements

| Test Type | Scope | Priority |
|---|---|---|
| Unit | Domain rules, money, validations | Required |
| Integration | Repository + audit + transactions | Required |
| E2E | Happy path workflows | Required |
| E2E | Edge cases from ETBS | Required |
| Permission | Service-layer denial | Required |
| RTL | All screens | Required |

### 18.1 Critical Test Cases

| ID | Description | ETBS/BRS Ref |
|---|---|---|
| TC-001 | | |

---

## 19. Performance Requirements

| Operation | Target | PRD Ref |
|---|---|---|
| | | §18 |

---

## 20. i18n Requirements

List all new i18n key namespaces for this module.

| Namespace | Example Keys |
|---|---|
| `attendance.grid.status.present` | |

All error messages, labels, toasts, and confirmations must have keys.

---

## 21. Future Extensions

Document PRD §7.2 or BRS future considerations without implementing now.

| Extension | Description | Schema/UI Hook |
|---|---|---|
| Multi-branch filtering | | `branchId` already nullable |
| Cloud sync | | `rev` field when added |

---

## 22. Traceability Matrix

| ETBS | BRS Rule | FS Screen/Workflow | Service | Test Case |
|---|---|---|---|---|
| ETBS-001 | STU-002 | WF-003 | `EnrollmentService.prorate` | TC-004 |

---

## 23. Approval

| Role | Name | Date | Status |
|---|---|---|---|
| Business Analyst | | | ☐ Approved |
| Software Architect | | | ☐ Approved |
| ERP Consultant (if financial) | | | ☐ Approved / N/A |
| QA Engineer | | | ☐ Test plan feasible |

---

*Module specs are contracts. Implementation that deviates requires a spec amendment and re-approval.*
