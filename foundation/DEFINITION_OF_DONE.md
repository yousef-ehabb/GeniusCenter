# Genius Center — Definition of Done

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Active |
| **Authority** | Subordinate to `PROJECT_CONSTITUTION.md` |
| **Rule** | Work is **not Done** until every applicable item below is satisfied |

---

## 1. Purpose

"Done" in Genius Center means **production-ready, spec-compliant, review-approved, and documented** — not merely "code compiles" or "happy path works."

This document defines the universal completion criteria. Task-level and module-level criteria in `TASK_TEMPLATE.md` and `MODULE_SPEC_TEMPLATE.md` add to these — they do not replace them.

---

## 2. Scope Levels

| Level | Applies To | Additional Criteria |
|---|---|---|
| **Task** | Single TASK-XXX | Task acceptance criteria + this document |
| **Module** | Full module (e.g., Attendance) | Module spec AC-XXX + all module tasks Done |
| **Phase** | PRD roadmap phase | All phase modules Done + phase integration verified |
| **Release** | Shippable version | Full regression + release checklist |

---

## 3. Universal Definition of Done

Every completed task must satisfy **all applicable sections** below.

---

### 3.1 Specification Compliance

- [ ] Work traces to an approved **module spec** or explicitly scoped task
- [ ] All **acceptance criteria** in the task/module spec verified Pass
- [ ] All referenced **BRS rules** implemented with correct defaults and configuration
- [ ] All referenced **ETBS scenarios** handled (normal, alternative, exception paths)
- [ ] All referenced **FS screens/workflows** implemented
- [ ] **PRD** architectural constraints followed (HTTP API, service layer, schema)
- [ ] No **Open Questions** silently assumed — resolved or formally deferred
- [ ] **Traceability matrix** updated (ETBS → BRS → FS → code → test)

---

### 3.2 Constitutional Compliance

- [ ] **Offline-first:** core paths work without network
- [ ] **Arabic-first:** all strings via i18n keys
- [ ] **RTL-native:** logical properties, visually verified
- [ ] **No hidden business logic** in UI or API route handlers
- [ ] **Financial integrity:** no hard deletes, audit on all financial writes
- [ ] **Historical preservation:** no retroactive data mutation
- [ ] **Configurable rules** not hardcoded where BRS requires configuration

---

### 3.3 Code Quality

- [ ] Follows `DEVELOPMENT_STANDARDS.md` completely
- [ ] TypeScript strict mode — zero `any` at boundaries
- [ ] No commented-out code or debug artifacts
- [ ] No TODO/FIXME without linked task ID
- [ ] Consistent with existing module patterns
- [ ] Dependencies respect allowed direction (browser UI ↛ Prisma)
- [ ] Code reviewed and approved per `REVIEW_CHECKLIST.md`

---

### 3.4 Architecture

- [ ] Business logic in **service layer** or `packages/domain/`
- [ ] All writes through **repository pattern**
- [ ] **Zod validation** at HTTP API boundaries (route handlers)
- [ ] **RBAC** enforced in service layer (authoritative)
- [ ] **Typed HTTP routes** — no unvalidated ad-hoc endpoints
- [ ] HTTP session: server-side, HTTP-only signed cookie
- [ ] Multi-step writes in **transactions**
- [ ] ADR written if architectural decision deviates from standards

---

### 3.5 Data & Money

- [ ] Schema changes via **Prisma migration** (reviewed by Database Engineer)
- [ ] UUID primary keys, `tenantId`, soft delete fields present
- [ ] Money stored as **integer minor units** — no floats
- [ ] Dates stored **UTC**, displayed in tenant timezone
- [ ] Foreign keys indexed on hot paths
- [ ] Seed data updated if schema affects dev workflow

---

### 3.6 Audit & Security

- [ ] **Audit log** entry for every create/update/void on sensitive data
- [ ] Audit includes: actor, action, entity, entityId, timestamp, before/after JSON
- [ ] Audit emitted **structurally** via repository decorator
- [ ] Permission denial returns explicit error — not silent failure
- [ ] No credentials, PINs, or hashes in logs
- [ ] Security review complete for auth/financial/backup modules

---

### 3.7 User Interface

- [ ] All screens match **FS** functional specification
- [ ] **Empty state** implemented with helpful Arabic message and action
- [ ] **Loading state** implemented (skeleton or spinner — not blank screen)
- [ ] **Error state** implemented with recovery path
- [ ] **Success feedback** (toast/confirmation) for write operations
- [ ] **Permission-gated** buttons/sections hidden or disabled appropriately
- [ ] **Keyboard path** exists for primary workflow
- [ ] **RTL visually verified** — not just attribute set
- [ ] Design system tokens/components used — no one-off styling
- [ ] Information density appropriate for ERP — not stripped for aesthetics

---

### 3.8 Localization

- [ ] **Zero hardcoded** user-facing strings in code
- [ ] All new keys added to **Arabic i18n bundle**
- [ ] Error messages, validation text, toasts, dialogs — all keyed
- [ ] Currency formatted with `MoneyLabel` / locale-aware formatter
- [ ] Dates formatted with `DateLabel` / tenant timezone
- [ ] Tabular numerals for financial columns
- [ ] Notification template variables validated before send

---

### 3.9 Accessibility

- [ ] WCAG AA contrast on all text
- [ ] All form fields have associated labels
- [ ] Icon-only buttons have `aria-label`
- [ ] Focus order correct in RTL
- [ ] Visible focus ring on interactive elements
- [ ] Modals: focus trap, Escape closes
- [ ] Primary actions reachable via keyboard

---

### 3.10 Testing

| Requirement | Applies When |
|---|---|
| Unit tests for business logic | Always |
| Unit tests for money/date calculations | Financial modules |
| Integration tests for repositories | Data writes |
| Integration tests for audit emission | All write paths |
| Integration tests for transactions | Multi-step operations |
| E2E happy path | Every user-facing workflow |
| E2E edge cases from ETBS | Attendance, billing, enrollment |
| Permission denial tests (service layer) | Protected actions |
| All tests pass locally and in CI | Always |

- [ ] Test coverage includes **failure paths** — not just happy path
- [ ] No flaky tests introduced
- [ ] QA report written and passing

---

### 3.11 Performance

Applicable per PRD §18 and module spec §19:

| Metric | Target | Verified |
|---|---|---|
| Cold start | < 2.5s | ⬜ N/A until app shell |
| Dashboard load (5K students) | < 800ms | ⬜ |
| Attendance (20 students, QR) | < 45s | ⬜ |
| Payment recording | < 20s | ⬜ |
| Search response | Instant at 5K students | ⬜ |

- [ ] Large lists **paginated or virtualized** (>50 records)
- [ ] No obvious N+1 queries in new code
- [ ] Indexes added for new query patterns

---

### 3.12 Error Handling

- [ ] Typed error hierarchy used (`ValidationError`, `PermissionError`, `DomainError`, `InfraError`)
- [ ] User sees **Arabic safe message** — never stack trace
- [ ] Form validation shows **inline field errors**
- [ ] Global errors show toast/banner with recovery action
- [ ] Transaction failures roll back completely — no partial state
- [ ] Offline/infra failures handled gracefully with user guidance

---

### 3.13 Documentation

- [ ] **Task** moved to `tasks/completed/` with activity log updated
- [ ] **Traceability matrix** updated in module spec
- [ ] **Module spec** updated if implementation clarified behavior
- [ ] **BRS/FS** updated if rules or screens were refined (via Documentation Engineer)
- [ ] **ADR** written for significant technical decisions
- [ ] **Lessons learned** captured if notable discovery (optional but encouraged)
- [ ] Code comments reference BRS rule IDs for non-obvious logic

---

### 3.14 Review & Approval

- [ ] **`REVIEW_CHECKLIST.md`** completed — all [BLOCKING] items Pass
- [ ] **Code Reviewer** verdict: Approve
- [ ] **QA Engineer** sign-off on acceptance criteria
- [ ] **Security Reviewer** sign-off (auth, financial, backup, API surface changes)
- [ ] **Documentation Engineer** confirms docs synchronized
- [ ] No open **Critical** or **High** defects

---

## 4. Module Definition of Done

A module is Done when:

- [ ] All tasks for the module are Done (§3 above)
- [ ] All module spec **acceptance criteria** (AC-XXX) pass
- [ ] All module spec **workflows** have E2E coverage
- [ ] **Traceability matrix** in module spec is complete
- [ ] Cross-module integration verified (e.g., attendance → billing triggers)
- [ ] Module spec **approval table** (§23) fully signed
- [ ] Module added to regression test suite

---

## 5. Phase Definition of Done

A roadmap phase (PRD §19) is Done when:

- [ ] All modules in the phase meet Module Definition of Done
- [ ] Phase integration tests pass
- [ ] No regression in prior phase modules
- [ ] Performance spot-check against PRD targets
- [ ] RTL regression on all new screens
- [ ] Stakeholder demo completed (when applicable)
- [ ] Phase retrospective captured in `knowledge/lessons-learned/`

---

## 6. Release Definition of Done

A release is Done when:

- [ ] All included phases/modules meet their Definition of Done
- [ ] Full regression suite passes
- [ ] Installer/build artifact produced and smoke-tested on clean Windows VM
- [ ] Backup and restore verified on release build
- [ ] Database integrity check passes
- [ ] Release notes written (Arabic summary for users, English for devs)
- [ ] Version tagged in repository
- [ ] Known issues documented with severity
- [ ] Stakeholder sign-off for release

---

## 7. What Is NOT Done

The following do **not** satisfy Definition of Done:

| Anti-Pattern | Why It Fails |
|---|---|
| "It works on my machine" | No tests, no review |
| Happy path only | ETBS exceptions not handled |
| UI-only permission hiding | Service layer not enforced |
| Hardcoded Arabic strings | Not i18n-ready |
| `// TODO: add audit later` | Audit is structural, not optional |
| Skipped REVIEW_CHECKLIST | Review is mandatory |
| Missing empty/error states | FS requires all states |
| Float money calculations | Constitution violation |
| Direct Prisma in React | Architecture violation |
| Feature without traceability | Constitution Article II.12 |

---

## 8. Waiver Process

A Done criterion may be waived only when:

1. Written waiver request with justification
2. Stakeholder or Product Manager approval
3. Waiver recorded in task file and `knowledge/architecture-decisions/`
4. Follow-up task created with deadline for permanent fix
5. Waiver does **not** apply to Constitutional [BLOCKING] items

**Waivable:** Performance optimization deferred, recommended accessibility item, nice-to-have keyboard shortcut  
**Never waivable:** Audit, financial integrity, RBAC service enforcement, RTL, i18n, security hardening

---

## 9. Quick Reference Checklist

Copy for daily use:

```
☐ Spec compliant (task/module AC pass)
☐ Constitution compliant
☐ DEVELOPMENT_STANDARDS followed
☐ Service layer + repository + Zod HTTP API validation
☐ RBAC in service layer
☐ Audit on all writes
☐ i18n keys (no hardcoded Arabic)
☐ RTL verified
☐ Empty / loading / error states
☐ Unit + integration + E2E tests pass
☐ REVIEW_CHECKLIST approved
☐ Docs + traceability updated
```

---

*Done means a tutor can trust this feature with their business data. Anything less is incomplete.*
