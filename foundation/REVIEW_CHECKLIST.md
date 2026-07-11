# Genius Center — Review Checklist

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Mandatory for every implementation |
| **Used By** | Code Reviewer, QA Engineer, Security Reviewer |
| **Rule** | All `[BLOCKING]` items must pass. `[RECOMMENDED]` items should pass or have documented waiver. |

---

## How to Use

1. Copy this checklist into the PR description, task file, or review report
2. Mark each item: ✅ Pass · ❌ Fail · ⬜ N/A (with justification)
3. Any ❌ on a `[BLOCKING]` item = **Request Changes**
4. Attach rule/spec IDs for failures

**Review ID:** _______________  
**Task ID:** _______________  
**Module Spec:** _______________  
**Reviewer:** _______________  
**Date:** _______________

---

## 1. Constitutional Compliance

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 1.1 | Offline-first: no core workflow requires network | [BLOCKING] | ⬜ | |
| 1.2 | Arabic-first: all user strings via i18n keys | [BLOCKING] | ⬜ | |
| 1.3 | RTL-native: logical properties, no hardcoded left/right | [BLOCKING] | ⬜ | |
| 1.4 | Windows desktop patterns respected (not mobile-first hacks) | [RECOMMENDED] | ⬜ | |
| 1.5 | Simplicity: no over-engineered abstractions without ADR | [RECOMMENDED] | ⬜ | |
| 1.6 | Business rules not hardcoded where BRS requires configurability | [BLOCKING] | ⬜ | |
| 1.7 | No hidden business logic in UI or API route handlers | [BLOCKING] | ⬜ | |
| 1.8 | Financial records never hard-deleted | [BLOCKING] | ⬜ | |
| 1.9 | Historical data preserved (no retroactive overwrites) | [BLOCKING] | ⬜ | |
| 1.10 | Financial operations auditable | [BLOCKING] | ⬜ | |
| 1.11 | Feature traceable to spec/rule/scenario | [BLOCKING] | ⬜ | |
| 1.12 | Modular boundaries respected | [RECOMMENDED] | ⬜ | |
| 1.13 | Consistent with existing codebase patterns | [RECOMMENDED] | ⬜ | |
| 1.14 | UX prioritized over technical elegance | [RECOMMENDED] | ⬜ | |

---

## 2. PRD Compliance

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 2.1 | Feature within PRD v1.0 scope (§7.1) | [BLOCKING] | ⬜ | |
| 2.2 | Not implementing deferred/future features (§7.2) without flag | [BLOCKING] | ⬜ | |
| 2.3 | Architecture follows PRD §11 (local API server, service layer) | [BLOCKING] | ⬜ | |
| 2.4 | Data model aligns with PRD §13 (UUIDs, tenantId, soft delete) | [BLOCKING] | ⬜ | |
| 2.5 | RBAC permission keys match PRD §16 | [BLOCKING] | ⬜ | |
| 2.6 | Security requirements met (PRD §17) | [BLOCKING] | ⬜ | |
| 2.7 | Performance targets considered (PRD §18) | [RECOMMENDED] | ⬜ | |
| 2.8 | Design system tokens used (PRD §14) | [RECOMMENDED] | ⬜ | |

---

## 3. BRS Compliance

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 3.1 | All module BRS rules implemented | [BLOCKING] | ⬜ | Rule IDs: |
| 3.2 | Default values match BRS defaults | [BLOCKING] | ⬜ | |
| 3.3 | Configuration options exposed where BRS requires | [BLOCKING] | ⬜ | |
| 3.4 | Edge cases from BRS addressed | [BLOCKING] | ⬜ | |
| 3.5 | Open Questions (BRS §16) not silently assumed | [BLOCKING] | ⬜ | |
| 3.6 | Invoice immutability respected (BIL-004) — financial modules | [BLOCKING] | ⬜ | |
| 3.7 | Adjustment linkage respected (FIN-001) — financial modules | [BLOCKING] | ⬜ | |
| 3.8 | Automation policy levels respected (AUTO-001) | [RECOMMENDED] | ⬜ | |
| 3.9 | Archive vs. delete rules respected (UI behavior) | [BLOCKING] | ⬜ | |

---

## 4. ETBS Compliance

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 4.1 | All referenced ETBS scenarios handled | [BLOCKING] | ⬜ | Scenario IDs: |
| 4.2 | Normal flows work as documented | [BLOCKING] | ⬜ | |
| 4.3 | Alternative flows supported or explicitly deferred | [RECOMMENDED] | ⬜ | |
| 4.4 | Exception paths handled with correct user feedback | [BLOCKING] | ⬜ | |
| 4.5 | Egyptian market conventions respected (billing, cash, parents) | [RECOMMENDED] | ⬜ | |

---

## 5. Functional Specification Compliance

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 5.1 | All specified screens implemented | [BLOCKING] | ⬜ | Screen IDs: |
| 5.2 | Workflows match FS step sequences | [BLOCKING] | ⬜ | |
| 5.3 | Field validations match FS §6 | [BLOCKING] | ⬜ | |
| 5.4 | Error handling matches FS §8 | [BLOCKING] | ⬜ | |
| 5.5 | Empty, loading states present | [BLOCKING] | ⬜ | |
| 5.6 | Permission matrix per screen implemented | [BLOCKING] | ⬜ | |
| 5.7 | Keyboard shortcuts implemented where specified | [RECOMMENDED] | ⬜ | |

---

## 6. Module Spec Compliance

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 6.1 | Implementation matches approved module spec | [BLOCKING] | ⬜ | |
| 6.2 | All acceptance criteria (AC-XXX) met | [BLOCKING] | ⬜ | |
| 6.3 | HTTP API routes match spec contract | [BLOCKING] | ⬜ | |
| 6.4 | Traceability matrix updated | [BLOCKING] | ⬜ | |
| 6.5 | Deviations documented with spec amendment | [BLOCKING] | ⬜ | |

---

## 7. Development Standards

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 7.1 | Folder structure per `PROJECT_STRUCTURE.md` | [RECOMMENDED] | ⬜ | |
| 7.2 | Naming conventions followed | [RECOMMENDED] | ⬜ | |
| 7.3 | TypeScript strict — no `any` | [BLOCKING] | ⬜ | |
| 7.4 | Zod validation at HTTP API boundaries | [BLOCKING] | ⬜ | |
| 7.5 | Repository pattern for all writes | [BLOCKING] | ⬜ | |
| 7.6 | No direct Prisma calls from renderer | [BLOCKING] | ⬜ | |
| 7.7 | HTTP session: server-side, HTTP-only signed cookie; CORS restricted to localhost | [BLOCKING] | ⬜ | |
| 7.8 | Structured logging for errors | [RECOMMENDED] | ⬜ | |
| 7.9 | Typed error hierarchy used | [RECOMMENDED] | ⬜ | |
| 7.10 | Transactions for multi-step writes | [BLOCKING] | ⬜ | |
| 7.11 | Money as integer minor units — no floats | [BLOCKING] | ⬜ | |
| 7.12 | Dates stored UTC, displayed localized | [RECOMMENDED] | ⬜ | |
| 7.13 | Dependency direction rules respected | [BLOCKING] | ⬜ | |

---

## 8. Business Rules Implementation

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 8.1 | Every BRS rule has corresponding code location | [BLOCKING] | ⬜ | |
| 8.2 | Rule IDs referenced in code comments where non-obvious | [RECOMMENDED] | ⬜ | |
| 8.3 | Configurable rules read from settings — not constants | [BLOCKING] | ⬜ | |
| 8.4 | Business logic unit tested | [BLOCKING] | ⬜ | |
| 8.5 | No duplicate rule implementation across modules | [RECOMMENDED] | ⬜ | |

---

## 9. Validations

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 9.1 | Shared Zod schemas in `packages/contracts/` | [BLOCKING] | ⬜ | |
| 9.2 | Server-side validation authoritative | [BLOCKING] | ⬜ | |
| 9.3 | Arabic error messages for all validation failures | [BLOCKING] | ⬜ | |
| 9.4 | Cross-field validations implemented | [BLOCKING] | ⬜ | |
| 9.5 | Domain validations throw typed DomainError | [BLOCKING] | ⬜ | |

---

## 10. Localization

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 10.1 | Zero hardcoded user-facing strings | [BLOCKING] | ⬜ | |
| 10.2 | All new i18n keys added to Arabic bundle | [BLOCKING] | ⬜ | |
| 10.3 | Interpolation used — no string concatenation | [RECOMMENDED] | ⬜ | |
| 10.4 | Number/currency/date formatting localized | [BLOCKING] | ⬜ | |
| 10.5 | Notification templates support variable substitution | [RECOMMENDED] | ⬜ | |

---

## 11. RTL

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 11.1 | Logical CSS properties used throughout | [BLOCKING] | ⬜ | |
| 11.2 | Sidebar/nav positioned correctly (right anchor) | [BLOCKING] | ⬜ | |
| 11.3 | Directional icons mirrored | [RECOMMENDED] | ⬜ | |
| 11.4 | Table alignment: text right, numbers left | [RECOMMENDED] | ⬜ | |
| 11.5 | Toast placement correct (top-start) | [RECOMMENDED] | ⬜ | |
| 11.6 | Focus order follows RTL reading flow | [BLOCKING] | ⬜ | |
| 11.7 | Visually verified in RTL — not just `dir=rtl` attribute | [BLOCKING] | ⬜ | |

---

## 12. Permissions & Security

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 12.1 | RBAC checked in service layer for every protected action | [BLOCKING] | ⬜ | |
| 12.2 | UI permission gates present (defensive) | [RECOMMENDED] | ⬜ | |
| 12.3 | Permission denial returns PermissionError — not silent no-op | [BLOCKING] | ⬜ | |
| 12.4 | Session/auth state in main process only | [BLOCKING] | ⬜ | |
| 12.5 | Input sanitized at HTTP API boundary (Zod at route handler) | [BLOCKING] | ⬜ | |
| 12.6 | No secrets in code or logs | [BLOCKING] | ⬜ | |
| 12.7 | Refund/approval thresholds enforced (if applicable) | [BLOCKING] | ⬜ | |

---

## 13. Audit

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 13.1 | All sensitive writes emit audit log entries | [BLOCKING] | ⬜ | |
| 13.2 | Audit includes actor, action, entity, timestamp | [BLOCKING] | ⬜ | |
| 13.3 | Before/after JSON captured for updates | [BLOCKING] | ⬜ | |
| 13.4 | Audit via repository decorator — not manual per call | [BLOCKING] | ⬜ | |
| 13.5 | Financial voids/refunds/adjustments audited with reason | [BLOCKING] | ⬜ | |

---

## 14. Testing

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 14.1 | Unit tests for business logic | [BLOCKING] | ⬜ | |
| 14.2 | Integration tests for repositories/transactions | [BLOCKING] | ⬜ | |
| 14.3 | E2E test for primary happy path | [BLOCKING] | ⬜ | |
| 14.4 | Edge cases from ETBS covered in tests | [BLOCKING] | ⬜ | |
| 14.5 | Permission denial tested at service layer | [BLOCKING] | ⬜ | |
| 14.6 | All tests pass in CI/local | [BLOCKING] | ⬜ | |
| 14.7 | No flaky tests introduced | [RECOMMENDED] | ⬜ | |

---

## 15. Documentation

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 15.1 | Task acceptance criteria all verified | [BLOCKING] | ⬜ | |
| 15.2 | Traceability matrix updated | [BLOCKING] | ⬜ | |
| 15.3 | Module spec updated if behavior clarified | [RECOMMENDED] | ⬜ | |
| 15.4 | ADR written if architectural decision made | [RECOMMENDED] | ⬜ | |
| 15.5 | Open Questions updated if resolved | [RECOMMENDED] | ⬜ | |

---

## 16. Performance & Accessibility

| # | Item | Severity | Status | Notes |
|---|---|---|---|---|
| 16.1 | Large lists paginated or virtualized | [RECOMMENDED] | ⬜ | |
| 16.2 | No N+1 query patterns in hot paths | [RECOMMENDED] | ⬜ | |
| 16.3 | WCAG AA contrast on text | [RECOMMENDED] | ⬜ | |
| 16.4 | Keyboard operable primary flows | [BLOCKING] | ⬜ | |
| 16.5 | Focus visible on interactive elements | [RECOMMENDED] | ⬜ | |

---

## Review Verdict

| Verdict | Condition |
|---|---|
| **✅ APPROVE** | All [BLOCKING] items pass |
| **🔄 REQUEST CHANGES** | Any [BLOCKING] item fails |
| **❌ REJECT** | Constitutional violation or missing spec |

### Summary of Failures

| Item # | Issue | Required Fix |
|---|---|---|
| | | |

### Reviewer Sign-Off

**Reviewer:** _______________  
**Role:** Code Reviewer / Security Reviewer / QA  
**Date:** _______________  
**Verdict:** Approve / Request Changes / Reject

---

*If in doubt, reject and ask. Trust is built by verified compliance, not by speed.*
