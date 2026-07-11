# Genius Center — Development Workflow

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Active |
| **Authority** | Subordinate to `PROJECT_CONSTITUTION.md` |
| **Rule** | **No feature may skip any stage.** Shortcuts require explicit stakeholder exception recorded in `knowledge/architecture-decisions/`. |

---

## 1. Overview

This document defines the **mandatory pipeline** from idea to release. Every feature, fix, or module passes through defined stages with explicit **entry criteria** (what must be true before starting) and **exit criteria** (what must be true before advancing).

The pipeline ensures business intent is captured before code, architecture is validated before implementation, and quality gates are enforced before release.

---

## 2. Pipeline Diagram

```
┌─────────┐
│  IDEA   │
└────┬────┘
     ▼
┌─────────────────┐
│ BUSINESS        │
│ ANALYSIS        │
└────┬────────────┘
     ▼
┌─────────────────┐
│ ETBS SCENARIO   │
└────┬────────────┘
     ▼
┌─────────────────┐
│ BUSINESS RULES  │
└────┬────────────┘
     ▼
┌─────────────────┐
│ FUNCTIONAL      │
│ SPECIFICATION   │
└────┬────────────┘
     ▼
┌─────────────────┐
│ ARCHITECTURE    │
│ REVIEW          │
└────┬────────────┘
     ▼
┌─────────────────┐
│ MODULE          │
│ SPECIFICATION   │
└────┬────────────┘
     ▼
┌─────────────────┐
│ TASK            │
│ BREAKDOWN       │
└────┬────────────┘
     ▼
┌─────────────────┐
│ IMPLEMENTATION  │
└────┬────────────┘
     ▼
┌─────────────────┐
│ TESTING         │
└────┬────────────┘
     ▼
┌─────────────────┐
│ REVIEW          │
└────┬────────────┘
     ▼
┌─────────────────┐
│ DOCUMENTATION   │
│ UPDATE          │
└────┬────────────┘
     ▼
┌─────────────────┐
│ RELEASE         │
└─────────────────┘
```

---

## 3. Stage Definitions

---

### Stage 1: Idea

**Owner:** Product Manager  
**Agent Role:** Product Manager

**Purpose:** Capture a raw need, problem, or opportunity without committing to solution or scope.

**Activities:**
- Describe the problem from the tutor's perspective
- Identify affected personas (PRD §6)
- Estimate impact: revenue, time saved, risk reduced
- Check alignment with PRD scope and non-goals

**Entry Criteria:**
- None — ideas can originate from anywhere (stakeholder, ETBS gap, user feedback, market research)

**Exit Criteria:**
- [ ] Problem statement written (not solution statement)
- [ ] Affected PRD modules identified
- [ ] Alignment with Constitution confirmed (or conflict flagged)
- [ ] Priority assigned (Critical / High / Medium / Low / Deferred)
- [ ] Decision: Proceed to Business Analysis **or** Reject **or** Defer with reason
- [ ] Idea recorded in `tasks/backlog/` or `knowledge/future-ideas/`

**Artifacts:** Idea brief (1 page max)

**Handoff → Business Analysis**

---

### Stage 2: Business Analysis

**Owner:** Business Analyst  
**Agent Role:** Business Analyst, ERP Consultant (consult)

**Purpose:** Understand the real-world tutoring context and map the idea to operational impact.

**Activities:**
- Research existing ETBS scenarios for overlap
- Interview knowledge base / stakeholder input if available
- Identify actors, preconditions, and decision points
- List configuration requirements
- Identify dependencies on other modules

**Entry Criteria:**
- [ ] Approved Idea brief exists
- [ ] Product Manager sign-off to proceed

**Exit Criteria:**
- [ ] Business analysis memo complete
- [ ] Affected workflows identified
- [ ] Configuration matrix drafted (what varies between tutors)
- [ ] New ETBS scenarios identified (if any) — list with provisional titles
- [ ] New BRS rules identified (if any) — list with provisional IDs
- [ ] Open Questions documented (no silent assumptions)
- [ ] ERP Consultant review requested if financial/payroll/billing involved

**Artifacts:** `specs/analysis/[feature]-business-analysis.md`

**Handoff → ETBS Scenario (new scenarios) and/or Business Rules (new/updated rules)

---

### Stage 3: ETBS Scenario

**Owner:** Business Analyst  
**Agent Role:** Business Analyst

**Purpose:** Ground the feature in documented real-world Egyptian tutoring scenarios before rules are written.

**Activities:**
- Write scenarios using ETBS template (see `docs/Genius_Center_ETBS_v1_0.md` §3)
- Assign permanent Scenario IDs (`ETBS-NNN`)
- Document normal flow, alternatives, exceptions, and business decisions
- Cross-reference related existing scenarios

**Entry Criteria:**
- [ ] Business analysis memo complete
- [ ] At least one scenario required OR explicit note "fully covered by existing ETBS-XXX"

**Exit Criteria:**
- [ ] All new scenarios written with complete template fields
- [ ] Scenario IDs assigned and recorded in ETBS document or `specs/scenarios/`
- [ ] Expected system behavior stated for each scenario
- [ ] Scenarios reviewed for Egyptian market authenticity
- [ ] Scenarios linked to business analysis memo

**Artifacts:** ETBS entries in `docs/Genius_Center_ETBS_v1_0.md` or `specs/scenarios/`

**Handoff → Business Rules

---

### Stage 4: Business Rules

**Owner:** Business Analyst  
**Agent Role:** Business Analyst, ERP Consultant (review)

**Purpose:** Define precise, testable, configurable rules that govern system behavior.

**Activities:**
- Write/update BRS rules using catalog template (BRS §15)
- Assign Rule IDs (`[MODULE]-[NNN]`)
- Define defaults, configuration options, and edge cases
- Map rules to ETBS scenario IDs
- Resolve or explicitly defer Open Questions

**Entry Criteria:**
- [ ] ETBS scenarios complete (or coverage confirmed)
- [ ] ERP Consultant engaged for financial modules

**Exit Criteria:**
- [ ] All rules written with full catalog template
- [ ] Rule IDs assigned
- [ ] Each rule references ≥1 ETBS scenario
- [ ] Configuration options and defaults documented
- [ ] Open Questions either resolved or listed in BRS §16 with deferral rationale
- [ ] ERP Consultant sign-off for financial/billing rules
- [ ] No conflict with Constitution or PRD (or conflict escalated)

**Artifacts:** BRS updates in `docs/Genius_Center_BRS_v1_0.md` or `specs/business-rules/`

**Handoff → Functional Specification

---

### Stage 5: Functional Specification

**Owner:** Business Analyst + UX input  
**Agent Role:** Business Analyst, UI/UX Designer (consult)

**Purpose:** Translate rules into concrete screens, workflows, validations, and error states.

**Activities:**
- Write screen specs using FS template (FS §4.0)
- Define step-by-step workflows
- Specify field-level validation and error messages (Arabic)
- Define permission requirements per screen/action
- Flag unresolved BRS Open Questions on affected screens

**Entry Criteria:**
- [ ] BRS rules complete and signed off
- [ ] All referenced ETBS scenarios exist

**Exit Criteria:**
- [ ] Screen specifications complete for all affected screens
- [ ] Workflow specifications complete (FS §5)
- [ ] Validation rules documented (FS §6)
- [ ] Error handling documented (FS §8)
- [ ] Permission matrix per screen/action
- [ ] Traceability: each screen links to BRS rules and ETBS scenarios
- [ ] UI/UX Designer review for interaction feasibility

**Artifacts:** FS updates in `docs/Genius_Center_FS_v1_0.md` or `specs/functional/`

**Handoff → Architecture Review

---

### Stage 6: Architecture Review

**Owner:** Software Architect  
**Agent Role:** Software Architect, Database Engineer (consult), Security Reviewer (consult)

**Purpose:** Validate that the feature fits system architecture, data model, and security model before module spec and implementation.

**Activities:**
- Review against PRD §11 architecture
- Identify new entities, services, IPC channels, indexes
- Assess offline-first compliance
- Assess audit, RBAC, and transaction requirements
- Author ADR if significant decision required

**Entry Criteria:**
- [ ] Functional specification complete
- [ ] PRD data model reviewed for entity fit

**Exit Criteria:**
- [ ] Architecture review memo: Approved / Approved with conditions / Blocked
- [ ] New ADRs written if needed (`knowledge/architecture-decisions/`)
- [ ] Entity and service boundary list confirmed
- [ ] IPC contract outline defined (channel names, input/output shapes)
- [ ] Schema change requirements identified (if any)
- [ ] Security Reviewer consulted for auth/financial features
- [ ] Performance considerations noted (indexes, pagination, virtualization)
- [ ] No Constitution violations

**Artifacts:** `architecture/reviews/[feature]-architecture-review.md`, ADRs

**Handoff → Module Specification

---

### Stage 7: Module Specification

**Owner:** Software Architect + Business Analyst  
**Agent Role:** Software Architect, Business Analyst

**Purpose:** Produce the implementation-ready module document consolidating all prior stages.

**Activities:**
- Complete `MODULE_SPEC_TEMPLATE.md` for the module/feature
- Consolidate traceability matrix
- Define acceptance criteria
- Identify future extension points

**Entry Criteria:**
- [ ] Architecture review approved
- [ ] FS, BRS, ETBS references complete

**Exit Criteria:**
- [ ] Module spec complete using standard template
- [ ] All BRS rules and ETBS scenarios referenced by ID
- [ ] All FS screens and workflows referenced
- [ ] Entities, permissions, validations listed
- [ ] Acceptance criteria testable and complete
- [ ] Module spec stored in `specs/modules/[module-name].md`
- [ ] Architect sign-off

**Artifacts:** `specs/modules/[module-name].md`

**Handoff → Task Breakdown

---

### Stage 8: Task Breakdown

**Owner:** Software Architect or assigned Tech Lead agent  
**Agent Role:** Software Architect, relevant Engineers

**Purpose:** Decompose module spec into atomic, assignable tasks with clear dependencies.

**Activities:**
- Create tasks using `TASK_TEMPLATE.md`
- Order tasks by dependency (schema → services → IPC → UI)
- Assign agent roles per task
- Estimate complexity (S/M/L)

**Entry Criteria:**
- [ ] Approved module spec exists

**Exit Criteria:**
- [ ] All tasks created in `tasks/active/` or `tasks/[sprint]/`
- [ ] Each task uses standard template
- [ ] Dependencies explicitly listed
- [ ] Tasks are atomic (one agent session completable where possible)
- [ ] Testing and documentation tasks included — not just implementation
- [ ] Task breakdown reviewed for missing audit, i18n, RTL, permission tasks

**Artifacts:** Task files in `tasks/`

**Handoff → Implementation

---

### Stage 9: Implementation

**Owner:** Assigned Engineers  
**Agent Role:** Backend Engineer, Desktop Engineer, Database Engineer, Frontend Engineer (as assigned)

**Purpose:** Build the feature per module spec and development standards.

**Activities:**
- Implement per `DEVELOPMENT_STANDARDS.md`
- Follow module spec exactly; raise spec gaps — do not silently improvise
- Write unit tests alongside domain logic
- Write integration tests for repositories
- Add i18n keys for all Arabic strings

**Entry Criteria:**
- [ ] Task assigned with complete template
- [ ] Module spec approved
- [ ] Prior dependency tasks complete
- [ ] Development environment ready (when codebase exists)

**Exit Criteria:**
- [ ] All task requirements implemented
- [ ] Code follows `DEVELOPMENT_STANDARDS.md`
- [ ] Unit tests written for business logic
- [ ] Integration tests written for data layer (where applicable)
- [ ] No hardcoded business rules that should be configurable
- [ ] Audit logging verified for all write paths
- [ ] RBAC enforced in service layer
- [ ] i18n keys added; no hardcoded UI strings
- [ ] RTL verified on affected screens
- [ ] Self-review against task acceptance criteria complete

**Artifacts:** Source code, tests, updated traceability comments

**Handoff → Testing

---

### Stage 10: Testing

**Owner:** QA Engineer  
**Agent Role:** QA Engineer

**Purpose:** Verify behavior against specs, rules, and scenarios — including edge cases.

**Activities:**
- Execute test plan derived from module spec acceptance criteria
- Run ETBS scenario walkthroughs manually or via E2E
- Verify RTL, i18n, permissions, audit logs
- Run automated test suite
- File defects with traceability references

**Entry Criteria:**
- [ ] Implementation exit criteria met
- [ ] Test environment available
- [ ] Test plan exists or is created from module spec

**Exit Criteria:**
- [ ] All acceptance criteria verified Pass or explicitly waived with stakeholder approval
- [ ] ETBS scenarios for this feature verified
- [ ] BRS rules verified with edge cases
- [ ] FS validation and error states verified
- [ ] Automated tests pass
- [ ] Defects filed for failures; no Critical/High defects open
- [ ] QA report written: `tests/reports/[feature]-qa-report.md`

**Artifacts:** QA report, automated tests, defect list

**Handoff → Review

---

### Stage 11: Review

**Owner:** Code Reviewer  
**Agent Role:** Code Reviewer, Security Reviewer (when applicable)

**Purpose:** Final quality gate before merge/release.

**Activities:**
- Complete `REVIEW_CHECKLIST.md` in full
- Verify Definition of Done
- Security review for sensitive modules

**Entry Criteria:**
- [ ] QA report: Pass (no open Critical/High defects)
- [ ] All automated tests green

**Exit Criteria:**
- [ ] `REVIEW_CHECKLIST.md` fully completed
- [ ] Code Reviewer verdict: Approve
- [ ] Security Reviewer sign-off (if required)
- [ ] All requested changes addressed
- [ ] No Constitution violations

**Artifacts:** Completed review checklist, review comments

**Handoff → Documentation Update

---

### Stage 12: Documentation Update

**Owner:** Documentation Engineer  
**Agent Role:** Documentation Engineer

**Purpose:** Synchronize all documentation with shipped reality.

**Activities:**
- Update module spec if behavior diverged (with rationale)
- Update FS/BRS if rules were clarified during implementation
- Update traceability matrix
- Write release notes entry
- Archive completed tasks

**Entry Criteria:**
- [ ] Review approved

**Exit Criteria:**
- [ ] Documentation reflects actual behavior
- [ ] Traceability matrix updated
- [ ] ADRs written for any implementation decisions
- [ ] Lessons learned captured (if significant)
- [ ] Task moved to `tasks/completed/`
- [ ] Open Questions resolved or updated

**Artifacts:** Updated docs, changelog, release notes draft

**Handoff → Release

---

### Stage 13: Release

**Owner:** Product Manager + Documentation Engineer  
**Agent Role:** Product Manager, QA Engineer (smoke), Desktop Engineer (installer)

**Purpose:** Ship the feature in a release artifact with verified integrity.

**Activities:**
- Version bump per semver policy
- Run full regression on critical paths
- Build installer (when applicable)
- Publish release notes

**Entry Criteria:**
- [ ] Documentation update complete
- [ ] All stage exit criteria met for included features
- [ ] Release scope defined

**Exit Criteria:**
- [ ] Release notes published
- [ ] Installer/build artifact verified (when applicable)
- [ ] Smoke tests pass on clean install
- [ ] Backup/restore verified unaffected
- [ ] Stakeholder notified

**Artifacts:** Release tag, release notes, installer (when applicable)

---

## 4. Workflow Variants

### Bug Fix (Production Defect)
Minimum path: **Task Breakdown** (bug task) → **Implementation** → **Testing** → **Review** → **Documentation Update** → **Release**

Still required: reference to BRS rule or FS spec that defines correct behavior. If none exists, **stop and add Business Analysis stage**.

### Documentation-Only Change
Path: **Task Breakdown** → **Documentation Update** → **Review** (Documentation Engineer + affected domain owner)

### Refactor (No Behavior Change)
Path: **Architecture Review** (light) → **Task Breakdown** → **Implementation** → **Testing** (regression) → **Review**

Must prove zero behavior change via existing tests + explicit statement.

---

## 5. Stage Skipping Policy

| Stage | Skippable? | Condition |
|---|---|---|
| Idea | Never | — |
| Business Analysis | Never for new features | — |
| ETBS Scenario | Only if existing scenarios fully cover | Document coverage IDs |
| Business Rules | Never | — |
| Functional Specification | Never for UI features | — |
| Architecture Review | Never for schema/service changes | — |
| Module Specification | Never | — |
| Task Breakdown | Never | — |
| Implementation | Never | — |
| Testing | Never | — |
| Review | Never | — |
| Documentation Update | Never | — |
| Release | N/A for non-shipping work | Use "Merged" instead |

---

## 6. Workflow Metrics

Track per feature for continuous improvement:

- Time in each stage
- Number of Open Questions at each stage
- Defects found in Testing vs. Review
- Review rejection rate and top reasons
- Documentation drift incidents post-release

Store metrics in `knowledge/lessons-learned/`.

---

*The workflow is the immune system of Genius Center. Trust it.*
