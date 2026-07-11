# Module Specification Template

| | |
|---|---|
| **Document Type** | Module Specification |
| **Version** | 1.0 |
| **Usage** | Module specification for Settings |
| **Authority** | Subordinate to PRD, BRS, FS — supersedes task-level decisions |

---

## Metadata

| Field | Value |
|---|---|
| **Module ID** | `MOD-SET` |
| **Module Name** | Settings |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Antigravity AI |
| **Reviewers** | Owner / System Administrator |
| **Created** | 2026-07-06 |
| **Last Updated** | 2026-07-06 |
| **PRD Reference** | §8.9, §17 |
| **FS Reference** | §10, §3.15, §4.40 |
| **Architecture Review** | `architecture/reviews/settings.md` |

---

## 1. Purpose

**What is this module and why does it exist?**

The Settings module allows the System Administrator and Owner to configure global business policies, application preferences, UI behaviors, and security parameters. It serves as the control panel for customizing the ERP to fit the specific operational reality of the tutor or center without requiring code changes.

---

## 2. Goals

List measurable outcomes this module must achieve.

| # | Goal | Success Metric |
|---|---|---|
| G1 | Centralize all business rules and configurations | All configurable BRS rules have a corresponding UI toggle/input. |
| G2 | Restrict access to critical configurations | Only users with the `settings.read/write` permission can view/edit settings. |
| G3 | Provide auditability for all configuration changes | 100% of setting mutations emit a `SettingsChanged` audit event. |

---

## 3. Non-Goals

Explicitly list what this module does **not** do in this version.

| # | Non-Goal | Reason |
|---|---|---|
| NG1 | Per-User Preferences | Current scope focuses on global tenant-level configuration. User-level preferences (e.g., dark mode) are distinct. |
| NG2 | Complex rule building (visual flow editors) | Keep the UI simple; settings are mapped directly to predefined BRS configuration options. |

---

## 4. Actors

List roles that interact with this module (PRD §16 base roles).

| Actor | Description | Primary Actions |
|---|---|---|
| Owner | The primary business owner | View and modify all settings, change business type. |
| System Administrator | Technical support user | Manage technical settings (Backup, Security) and system configuration. |

---

## 5. Business Rules

Summarize module-specific business behavior. Do not duplicate full BRS text — reference by ID.

| Rule ID | Title | Summary | Configurable? | Default |
|---|---|---|---|---|
| BRS §3.1 | Business Type | Private Tutor or Tutoring Center | Yes | Private Tutor |
| D-006 | Subject Taught | Optional free-text subject the tutor teaches (v1.0 only) | Yes | Empty (optional) |
| BRS §3.2 | Attendance Methods | Enabled input methods for attendance | Yes | All enabled |
| ATT-002 | Late Grace Period | Minutes before marking student late | Yes | 10 min |
| ATT-001 | Attendance Locking | Buffer before attendance is locked | Yes | Immediate |
| BRS §3.3 | Billing Model Default | Monthly, Per-Session, Course | Yes | Monthly |
| BIL-003 | Monthly Calc Method | Calendar, Session-count, Custom | Yes | Calendar month |
| STU-002 | Mid-Cycle Proration | Enable proration on enrollment | Yes | Enabled |
| BRS §8.4 | Payment Timing | In advance or In arrears | Yes | In advance |
| BIL-001 | Absence Charging | Charge unless excused policy | Yes | Charge unless excused |
| BRS §8.5 | Late Grace Period (Billing) | Days until payment is late | Yes | N/A (Configurable) |
| BRS §8.5 | Late Fee | Flat, Percentage, or Disabled | Yes | Disabled |
| BRS §3.8 | Refund Threshold | Amount requiring second approver | Yes | N/A (Configurable) |
| BRS §3.8 | Discount Threshold | Amount requiring manager approval | Yes | N/A (Configurable) |
| BRS §3.4 | Notification Events | Toggle specific notification events | Yes | All enabled |
| BRS §3.4 | Quiet Hours | Time range to queue notifications | Yes | N/A (Configurable) |
| NOT-001 | Payment Reminders | Schedule for late payment reminders | Yes | Day 3 & Day 10 |
| STU-003 | At-Risk Absence | Unexplained absences threshold | Yes | 4 consecutive |
| BRS §3.5 | Inactive Auto-Flag | Auto flag inactive students | Yes | Fully automatic |
| GRP-001 | Capacity Enforcement | Hard/Soft/None capacity checks | Yes | Soft |
| BRS §3.6 | Waiting List | Enable/Disable waiting lists | Yes | Configurable |
| BRS §3.7 | Teacher Session | Require approval for reschedule | Yes | Configurable |
| BRS §3.7 | Teacher Billing Vis | Visibility into student financials | Yes | Configurable |
| BRS §9.4 | Payroll Basis Def | Fixed, Per-Session, Per-Student, % | Yes | Configurable |
| BRS §8.19| Currency & Rounding | Rounding rules applied consistently | Yes | EGP, whole-pound |
| AUTO-001 | Automation Confirm | Automatic/Suggested/Disabled | Yes | Suggested for financial |
| PRD §17 | Backup Schedule | Daily/Weekly/Manual | Yes | Manual only |
| PRD §17 | Session-Lock Timeout | Inactivity timeout | Yes | Configurable |

### 5.1 Configuration Matrix

*(Refer to FS §10 Settings table for exhaustive matrix).*

| Setting Key | Scope (Tenant/Group/Student) | Type | Default | BRS Ref |
|---|---|---|---|---|
| `business_type` | Tenant | Enum | `PRIVATE_TUTOR` | BRS §3.1 |
| `subject_taught` | Tenant | String (optional) | `""` (empty) | D-006 |
| `attendance_grace_period` | Tenant (overridable) | Integer | 10 | ATT-002 |
| `billing_model_default` | Tenant | Enum | `MONTHLY` | BRS §3.3 |

### 5.2 Open Questions

List unresolved BRS §16 items affecting this module. **Implementation blocked until resolved or explicitly deferred with stakeholder approval.**

| Question ID | Question | Status | Decision |
|---|---|---|---|
| 16.5 | Scholarship/Discount Stacking Order | Open | Deferred |
| 16.9 | Registration Fee | Open | Deferred |
| 16.10 | Returning Student Re-Registration Fee | Open | Deferred |
| 16.4 | Extra Session Default Charge | Open | Deferred |
| 16.3 | Review Session Quota Counting | Open | Deferred |

---

## 6. Referenced BRS Rules

Complete list of BRS rule IDs this module implements.

| Rule ID | Title | Implemented In (service/file) |
|---|---|---|
| AUTO-001 | Automation Confirmation Level | `SettingsService` |
| ATT-001 | Attendance Editing After Lock | `SettingsService` |
| ATT-002 | Late Grace Period | `SettingsService` |
| BIL-001 | Absence Charging Policy | `SettingsService` |
| BIL-003 | Monthly Calculation Method | `SettingsService` |
| STU-002 | Proration on Mid-Cycle Enrollment | `SettingsService` |
| STU-003 | At-Risk Absence Threshold | `SettingsService` |
| GRP-001 | Group Capacity Enforcement | `SettingsService` |
| NOT-001 | Payment Reminder Schedule | `SettingsService` |

---

## 7. Referenced ETBS Scenarios

Complete list of ETBS scenario IDs this module must handle.

| Scenario ID | Title | Covered By (workflow/test) |
|---|---|---|
| ETBS-001 | Center Setup | Settings UI / Setup Wizard |

---

## 8. Entities

List data entities this module owns or consumes (PRD §13).

### 8.1 Owned Entities

| Entity | Description | Key Fields | Soft Delete? |
|---|---|---|---|
| `GlobalSetting` | Key-value store for configurations | `key`, `value`, `dataType` | No |

### 8.2 Consumed Entities

| Entity | Owner Module | Usage |
|---|---|---|
| None | | |

### 8.3 Schema Notes

- New tables/migrations required: Yes
- Migration description: `CREATE TABLE global_settings (key TEXT PRIMARY KEY, value JSON, updated_at DATETIME, updated_by TEXT)`
- Index requirements: None (in-memory caching or primary key access).

---

## 9. Screens

List every screen from FS that this module implements.

| Screen ID | FS Ref | Name (Arabic) | Route | Primary Actor |
|---|---|---|---|---|
| SCR-SET-01 | FS §4.40 | الإعدادات (Settings Hub) | `/settings` | Owner / System Admin |

### 9.1 Screen Details

Repeat for each screen or reference FS section if fully specified there.

#### SCR-SET-01: Settings Hub

| Element | Specification |
|---|---|
| **Purpose** | Central location to manage all configurable policies |
| **Entry Points** | Sidebar navigation |
| **Layout Sections** | Categorized tabs: Business, Attendance, Billing, Staff, Notifications, Security, Backup |
| **Actions** | Update Setting, Revert to Default |
| **Empty State** | N/A |
| **Loading State** | Skeleton loader for setting fields |
| **Error States** | Validation errors on invalid inputs (e.g., negative grace period) |
| **Keyboard Shortcuts** | Ctrl+S to save changes |

---

## 10. Workflows

Define step-by-step workflows. Reference FS §5 where complete.

### WF-SET-01: Update Global Setting

| Field | Value |
|---|---|
| **Trigger** | User modifies a setting field and clicks Save |
| **Primary Actor** | Owner / System Admin |
| **Preconditions** | User has `settings.write` permission |
| **BRS Rules** | N/A |
| **ETBS Scenarios** | ETBS-001 |

**Steps:**

1. User navigates to Settings Hub.
2. User modifies one or more settings.
3. User clicks Save.
4. System validates the new values.
5. System updates `global_settings` table.
6. System emits `SettingsChanged` audit event.

**Postconditions:**

- Settings are persisted.
- Audit log is updated.
- Application state (if cached) is refreshed.

**Failure Paths:**

| Failure | System Response | User Message (Arabic key) |
|---|---|---|
| Validation Error | Prevent save, highlight field | `settings.error.validation` |
| Permission Denied | Reject request, log error | `errors.unauthorized` |

---

## 11. Permissions

Map every action to permission keys (PRD §16).

| Action | Permission Key | Owner | Teacher | Assistant | Secretary | Accountant |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| View Settings | `settings.read` | ✔ | | | | |
| Modify Settings | `settings.write` | ✔ | | | | |

**Enforcement:**
- [x] Service layer checks documented
- [x] UI gates documented (defensive)

---

## 12. Validations

| Field / Input | Rule | Error Key | BRS Ref |
|---|---|---|---|
| Grace Period | Integer >= 0 | `settings.validation.grace_period` | ATT-002 |
| Thresholds | Numeric >= 0 | `settings.validation.threshold` | BRS §3.8 |
| Email / Phone | Valid format (if applicable) | `settings.validation.format` | BRS §3.4 |

### 12.1 Cross-Field Validations

| Rule | Description |
|---|---|
| Quiet Hours | End time must be after start time (handling midnight wrap) |

### 12.2 Business Validations (Domain)

| Rule | Service Method | Error Type |
|---|---|---|
| Type Change | `updateBusinessType` | `MigrationRequiredError` |

---

## 13. Architecture

### 13.1 Service Layer

| Service | Responsibility |
|---|---|
| `SettingsService` | Read, update, and validate global settings. |

### 13.2 Repositories

| Repository | Entity |
|---|---|
| `SettingsRepository` | `GlobalSetting` |

### 13.3 IPC Channels

| Channel | Input Schema | Output | Auth Required |
|---|---|---|---|
| `settings:get` | `[]Keys` | `Record<string, any>` | Yes |
| `settings:update` | `Record<string, any>` | `void` | Yes (`settings.write`) |

### 13.4 Infrastructure Dependencies

| Service | Usage |
|---|---|
| `AuditService` | All writes |

### 13.5 Transaction Boundaries

| Operation | Transaction Scope |
|---|---|
| `settings:update` | Batch update of multiple settings inside a single SQLite transaction |

---

## 14. Audit Requirements

| Action | Entity | Audit Fields (before/after) |
|---|---|---|
| Update | `GlobalSetting` | `key`, `oldValue`, `newValue` |

Confirm: audit emitted via repository decorator — not manual per call site.

---

## 15. Notifications

| Trigger | Template Key | Channel | Recipient | Auto/Manual |
|---|---|---|---|---|
| N/A | | | | |

---

## 16. Reports

| Report | Filters | Export Formats |
|---|---|---|
| N/A | | |

---

## 17. Acceptance Criteria

Testable criteria — QA derives test plan directly from this section.

### AC-SET-001: Update a valid setting

**Given** an authenticated user with `settings.write` permissions
**When** the user updates "Late Grace Period" to 15 minutes and saves
**Then** the new value is persisted, an audit log is created, and the application uses the new value immediately.

**References:** ATT-002

---

### AC-SET-002: Attempt invalid setting update

**Given** an authenticated user with `settings.write` permissions
**When** the user sets "Late Grace Period" to -5 minutes and saves
**Then** the system rejects the input with a validation error and no changes are saved.

**References:** ATT-002

---

### AC-SET-003: Unauthorized access

**Given** an authenticated user without `settings.write` permissions
**When** the user attempts to view or update settings
**Then** the UI hides the Settings navigation and the IPC endpoint rejects any update requests.

**References:** PRD §16

---

## 18. Testing Requirements

| Test Type | Scope | Priority |
|---|---|---|
| Unit | Validation logic for all setting types | Required |
| Integration | SettingsRepository + Audit logs | Required |
| E2E | Update settings through the UI | Required |
| Permission | Service-layer denial | Required |
| RTL | Settings Hub layout | Required |

### 18.1 Critical Test Cases

| ID | Description | ETBS/BRS Ref |
|---|---|---|
| TC-SET-001 | Verify all default values match BRS | BRS §3 |
| TC-SET-002 | Business Type migration enforcement | BRS §3.1 |

---

## 19. Performance Requirements

| Operation | Target | PRD Ref |
|---|---|---|
| `settings:get` | < 50ms | PRD §18 |

---

## 20. i18n Requirements

List all new i18n key namespaces for this module.

| Namespace | Example Keys |
|---|---|
| `settings.hub.title` | "الإعدادات" |
| `settings.section.attendance` | "إعدادات الحضور" |
| `settings.field.grace_period` | "فترة السماح (دقائق)" |

All error messages, labels, toasts, and confirmations must have keys.

---

## 21. Future Extensions

Document PRD §7.2 or BRS future considerations without implementing now.

| Extension | Description | Schema/UI Hook |
|---|---|---|
| Multi-branch Settings | Branch-specific overrides | Add `branchId` to `global_settings` |
| Cloud Sync | Sync settings across devices | Add `rev` field |
| Subjects Module (v2.0) | Migrate `subject_taught` setting to a full Subject entity when multi-teacher support is added. See [D-006](file:///d:/Course/Projects/Genius%20Center/Docs/decisions/D-006_Postpone_Subjects_Module.md). | New `Subject` model; `subject_taught` may become a FK or be retained alongside. |

---

## 22. Traceability Matrix

| ETBS | BRS Rule | FS Screen/Workflow | Service | Test Case |
|---|---|---|---|---|
| ETBS-001 | BRS §3 | SCR-SET-01 | `SettingsService` | TC-SET-001 |

---

## 23. Approval

| Role | Name | Date | Status |
|---|---|---|---|
| Business Analyst | Antigravity AI | 2026-07-06 | ☐ Approved |
| Software Architect | Antigravity AI | 2026-07-06 | ☐ Approved |
| ERP Consultant (if financial) | N/A | | ☐ N/A |
| QA Engineer | Antigravity AI | 2026-07-06 | ☐ Test plan feasible |

---
