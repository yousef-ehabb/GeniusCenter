# Task Template

| | |
|---|---|
| **Document Type** | Task |
| **Version** | 1.0 (template) |
| **Usage** | Copy to `tasks/active/TASK-XXX-[short-name].md` or `tasks/[sprint]/` |
| **Rule** | One task = one focused deliverable completable in a single agent session where possible |

---

> **Instructions:** Complete every section before implementation begins. Incomplete tasks are returned to the author.

---

## Metadata

| Field | Value |
|---|---|
| **Task ID** | `TASK-XXX` |
| **Title** | |
| **Type** | Feature / Bug / Refactor / Docs / Infrastructure |
| **Priority** | Critical / High / Medium / Low |
| **Status** | Backlog / Ready / In Progress / Blocked / Review / Done |
| **Assigned Role(s)** | |
| **Created** | YYYY-MM-DD |
| **Sprint / Phase** | PRD §19 Phase X |
| **Estimated Size** | S (< 2h) / M (2–8h) / L (> 8h) |
| **Module Spec** | `specs/modules/[name].md` |
| **Branch** | `feature/xxx` (when repo active) |

---

## 1. Context

**Why does this task exist?**

Describe the background in 2–4 sentences. Link to the module spec section, workflow stage, or defect that originated this task.

Example: *"Phase 2 requires the attendance write path to be implemented before QR integrations. This task implements `AttendanceService.mark()` — the single shared entry point used by manual, search, mobile QR, and USB methods per PRD §8.3 and Constitution Article II.12 traceability."*

---

## 2. Goal

**What is the single outcome of this task?**

One clear, verifiable statement.

Example: *"Implement `AttendanceService.mark()` with session validation, duplicate-scan suppression, enrollment check, audit logging, and RBAC — fully unit and integration tested."*

---

## 3. Requirements

List specific, numbered requirements. Must be testable.

| # | Requirement | Source |
|---|---|---|
| R1 | | Module spec § / BRS-XXX |
| R2 | | FS § / PRD § |
| R3 | | Constitution Article |

### 3.1 Out of Scope

Explicitly state what this task does **not** include (prevents scope creep).

| # | Excluded | Handled By |
|---|---|---|
| E1 | LAN QR server | TASK-YYY |
| E2 | Attendance grid UI | TASK-ZZZ |

---

## 4. Dependencies

### 4.1 Blocked By

Tasks or artifacts that must be complete before starting.

| Dependency | Type | Status |
|---|---|---|
| Module spec approved | Artifact | ☐ |
| TASK-001 schema migration | Task | ☐ |
| BRS Open Question 16.x resolved | Decision | ☐ |

### 4.2 Blocks

Tasks waiting on this one.

| Task ID | Description |
|---|---|
| | |

---

## 5. References

### 5.1 Foundation

- [ ] `foundation/PROJECT_CONSTITUTION.md`
- [ ] `foundation/DEVELOPMENT_STANDARDS.md`
- [ ] `foundation/DEFINITION_OF_DONE.md`

### 5.2 Product Documents

| Document | Section | Link |
|---|---|---|
| PRD v2.0 | §8.3 Attendance | `docs/Genius_Center_PRD_v2.0.md` |
| BRS v1.0 | ATT-001, ATT-002 | `docs/Genius_Center_BRS_v1_0.md` |
| ETBS v1.0 | ETBS-027 | `docs/Genius_Center_ETBS_v1_0.md` |
| FS v1.0 | §4.x, §5.x | `docs/Genius_Center_FS_v1_0.md` |

### 5.3 Module Spec

| Section | Relevance |
|---|---|
| §10 Workflows WF-XXX | Primary workflow |
| §13 Architecture | Service/IPC design |
| §17 Acceptance Criteria AC-001–AC-00X | Verification |

### 5.4 Architecture

| Document | Relevance |
|---|---|
| ADR-XXX | |
| Architecture review | |

---

## 6. Implementation Notes

Optional guidance for the assigned engineer — not a substitute for module spec.

### 6.1 Files to Create/Modify

| File | Action |
|---|---|
| `apps/desktop/electron/services/attendance/attendance-service.ts` | Create |
| `packages/contracts/attendance.schema.ts` | Create |

### 6.2 Technical Constraints

- 
- 

### 6.3 BRS Rule Mapping

| Rule ID | Implementation Location |
|---|---|
| ATT-001 | `AttendanceService.lockCheck()` |
| ATT-002 | `AttendanceService.classifyStatus()` |

---

## 7. Acceptance Criteria

Derived from module spec. QA verifies each item.

| ID | Criterion | Verified |
|---|---|---|
| AC-1 | **Given** an open class session, **when** marking Present via any method, **then** attendance record created with correct `method` enum | ☐ |
| AC-2 | **Given** duplicate scan within suppression window, **when** marking again, **then** silently ignored (no error) | ☐ |
| AC-3 | **Given** closed session, **when** marking without override permission, **then** `DomainError` returned | ☐ |

---

## 8. Definition of Done

Confirm every item before marking task Done. See `DEFINITION_OF_DONE.md` for full checklist.

### 8.1 Code

- [ ] All requirements (§3) implemented
- [ ] Follows `DEVELOPMENT_STANDARDS.md`
- [ ] No Constitution violations
- [ ] Business logic not hidden in UI
- [ ] Configurable rules read from config — not hardcoded

### 8.2 Quality

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if applicable)
- [ ] RBAC enforced in service layer
- [ ] Audit logs emitted for all writes
- [ ] Money handled as integer minor units (if applicable)
- [ ] Transactions wrap multi-step writes (if applicable)

### 8.3 UI (if applicable)

- [ ] i18n keys for all Arabic strings
- [ ] RTL verified
- [ ] Empty, loading, error states implemented
- [ ] Keyboard path for primary action
- [ ] Permission-gated UI elements

### 8.4 Review

- [ ] Self-review against acceptance criteria complete
- [ ] `REVIEW_CHECKLIST.md` passed
- [ ] Code Reviewer approved
- [ ] Security review complete (if sensitive module)

### 8.5 Documentation

- [ ] Traceability comments / matrix updated
- [ ] Module spec implementation notes updated (if behavior clarified)
- [ ] Task moved to `tasks/completed/`

---

## 9. Testing Requirements

| Test | File | Description |
|---|---|---|
| Unit | `attendance-service.test.ts` | Duplicate suppression, grace period late classification |
| Integration | `attendance-repository.test.ts` | Transaction + audit emission |
| E2E | `attendance-mark.e2e.ts` | Manual mark happy path |

### 9.1 ETBS Scenarios to Walk Through

| Scenario ID | Steps |
|---|---|
| ETBS-027 | Assistant scans QR → desktop updates → sound confirmation |

### 9.2 Edge Cases

| Case | Expected Behavior |
|---|---|
| Unknown QR token | Error: student not recognized |
| Student not enrolled in session's group | Alert with enrollment warning |
| Session locked | Blocked unless override permission |

---

## 10. Handoff

| To Role | Deliverable | Status |
|---|---|---|
| QA Engineer | Implementation + tests | ☐ |
| Code Reviewer | PR / diff | ☐ |
| Frontend Engineer | Stable IPC contract (if backend-only task) | ☐ |
| Documentation Engineer | Updated traceability | ☐ |

### 10.1 Handoff Notes

Free-text notes for the next agent.

---

## 11. Activity Log

| Date | Agent/Author | Action |
|---|---|---|
| YYYY-MM-DD | | Task created |
| | | |

---

*Tasks are the atomic unit of work. If it's too big, split it. If it's too vague, send it back to Module Spec.*
