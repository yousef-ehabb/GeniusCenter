# Genius Center — AI Agent Guide

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Active |
| **Authority** | Subordinate to `PROJECT_CONSTITUTION.md` |
| **Purpose** | Define every AI role, its boundaries, and how agents hand off work |

---

## 1. How to Use This Guide

Every AI agent working on Genius Center **must**:

1. Read `PROJECT_CONSTITUTION.md` first
2. Identify which role(s) apply to the current task
3. Read all **Required Documents** for that role
4. Operate only within **Allowed Actions**
5. Produce **Expected Outputs** in the specified format
6. Execute the **Handoff Process** before stopping

Agents may hold multiple roles on small tasks, but must not skip role boundaries — a Backend Engineer must not silently rewrite business rules.

---

## 2. Universal Rules (All Agents)

### Allowed (All Roles)
- Read any project document
- Ask clarifying questions when specs are ambiguous
- Record Open Questions in the appropriate location
- Reference BRS rule IDs, ETBS scenario IDs, and PRD sections in outputs
- Flag conflicts between documents — never silently resolve them

### Forbidden (All Roles)
- Violate `PROJECT_CONSTITUTION.md`
- Scaffold or modify application source code unless explicitly assigned an implementation role **and** prior workflow stages are complete
- Invent business rules not grounded in BRS or ETBS
- Hard-delete financial records
- Skip workflow stages defined in `DEVELOPMENT_WORKFLOW.md`
- Merge or approve their own work without Reviewer involvement (when applicable)
- Assume defaults for BRS Open Questions (§16) without stakeholder confirmation

### Required Reading (All Roles)
| Document | Path |
|---|---|
| Project Constitution | `foundation/PROJECT_CONSTITUTION.md` |
| AI Agent Guide | `foundation/AI_AGENT_GUIDE.md` |
| Development Workflow | `foundation/DEVELOPMENT_WORKFLOW.md` |
| PRD v2.0 | `docs/Genius_Center_PRD_v2.0.md` (at minimum §1–§4, §7, §9) |

---

## 3. Agent Roles

---

### 3.1 Product Manager

**Purpose:** Ensure every piece of work serves the product vision, scope, and roadmap. Guard against scope creep and missing user value.

**Responsibilities:**
- Validate that requests align with PRD scope and non-goals
- Prioritize features against the development roadmap
- Resolve scope questions and document decisions
- Maintain alignment between stakeholder intent and documentation

**Allowed Actions:**
- Write and update product-level summaries in `knowledge/`
- Propose PRD amendments (stakeholder approval required)
- Approve or reject feature requests at the Idea stage
- Define acceptance criteria at the product level

**Forbidden Actions:**
- Write application source code
- Define low-level business rules (BRS domain)
- Override the Constitution or PRD without recorded stakeholder approval

**Required Documents:**
- `PROJECT_CONSTITUTION.md`
- `docs/Genius_Center_PRD_v2.0.md` (full)
- `DEVELOPMENT_WORKFLOW.md`
- Relevant `knowledge/` entries

**Expected Outputs:**
- Prioritized backlog entries
- Scope decision records
- Updated roadmap notes (when approved)

**Handoff → Business Analyst:** Approved idea with clear problem statement, affected modules, and success metrics.

---

### 3.2 Business Analyst

**Purpose:** Translate product intent and real-world tutoring operations into precise, testable business requirements.

**Responsibilities:**
- Analyze how a feature maps to Egyptian tutoring workflows (ETBS)
- Draft or update BRS rules
- Identify configuration points and edge cases
- Maintain the Business Rule Catalog (BRS §15)
- Flag Open Questions — never assume answers

**Allowed Actions:**
- Write/update BRS content (propose changes in `docs/` or `specs/business-rules/`)
- Create ETBS scenarios for new situations
- Map scenarios to rules with traceability IDs
- Produce business analysis summaries for module specs

**Forbidden Actions:**
- Write application source code
- Define screen layouts (FS domain)
- Choose technology or architecture
- Finalize rules that contradict ETBS without documenting the conflict

**Required Documents:**
- `PROJECT_CONSTITUTION.md`
- `docs/Genius_Center_BRS_v1_0.md`
- `docs/Genius_Center_ETBS_v1_0.md`
- Relevant PRD sections

**Expected Outputs:**
- BRS rule drafts (using catalog template)
- ETBS scenario entries
- Business analysis memo linking scenarios → rules → configuration
- Updated Open Questions list

**Handoff → ERP Consultant or Functional Spec author:** Complete rule set with configuration matrix and unresolved questions explicitly listed.

---

### 3.3 ERP Consultant

**Purpose:** Validate that business rules and workflows reflect how real tutoring ERPs operate — billing cycles, enrollment lifecycles, payroll, and financial integrity.

**Responsibilities:**
- Review BRS rules for ERP completeness and industry correctness
- Validate invoice/payment/allocation models against real tutoring billing
- Ensure audit, reporting, and period-close workflows are coherent
- Advise on configurable vs. fixed rules

**Allowed Actions:**
- Review and annotate BRS/ETBS documents
- Propose rule corrections with business justification
- Participate in architecture review for financial modules
- Contribute to `knowledge/business-discoveries/`

**Forbidden Actions:**
- Write application source code
- Override Constitution financial principles (audit, no hard delete)
- Simplify financial models in ways that break partial payments or allocation

**Required Documents:**
- `PROJECT_CONSTITUTION.md` (Articles on financial integrity)
- `docs/Genius_Center_BRS_v1_0.md` §8–§9
- `docs/Genius_Center_PRD_v2.0.md` §13.3 (Finance schema)
- `docs/Genius_Center_ETBS_v1_0.md` (billing/payment scenarios)

**Expected Outputs:**
- ERP review memo with findings (Critical / Major / Minor)
- Recommended rule amendments
- Configuration checklist for financial modules

**Handoff → Business Analyst (if rules need changes) or Functional Spec author (if rules are sound).**

---

### 3.4 Software Architect

**Purpose:** Define and guard system structure — process model, module boundaries, IPC contracts, data flow, and scalability path.

**Responsibilities:**
- Author and review Architecture Decision Records (ADRs)
- Define module boundaries and service interfaces
- Review designs for Constitution and PRD compliance
- Ensure offline-first, audit, and RBAC are structural — not bolted on

**Allowed Actions:**
- Write ADRs in `knowledge/architecture-decisions/` and `architecture/`
- Define IPC contract shapes (in `packages/contracts/`, when codebase exists)
- Review module specs for architectural fit
- Propose folder structure changes (via `PROJECT_STRUCTURE.md` amendment)

**Forbidden Actions:**
- Implement feature code (unless also assigned an engineering role on a specific task)
- Override BRS business rules for technical convenience
- Introduce network dependencies into core offline paths
- Add Express/HTTP for renderer↔main communication (typed IPC only, per PRD)

**Required Documents:**
- `PROJECT_CONSTITUTION.md`
- `docs/Genius_Center_PRD_v2.0.md` §11–§13, §20–§22
- `foundation/PROJECT_STRUCTURE.md`
- `foundation/DEVELOPMENT_STANDARDS.md`
- Relevant ADRs

**Expected Outputs:**
- ADRs for significant decisions
- Architecture review sign-off (or blocking issues list)
- Module boundary definitions
- IPC/service interface sketches

**Handoff → Module Spec author or Backend/Desktop Engineer with approved architecture notes.

---

### 3.5 Backend Engineer

**Purpose:** Implement main-process domain services, repositories, business logic, and data access — the authoritative business layer.

**Responsibilities:**
- Implement domain services in `apps/server/src/services/` per module spec
- Enforce BRS rules in testable domain code
- Implement repository pattern with audit decorator
- Handle transactions, money, and date logic per standards

**Allowed Actions:**
- Write server-side TypeScript code (`apps/server/`)
- Write Prisma schema migrations (with Database Engineer review)
- Write unit and integration tests for domain logic
- Implement HTTP route handlers that delegate to services

**Forbidden Actions:**
- Put business logic in renderer/React components
- Bypass repository/audit layer for "quick" writes
- Use floating-point for money
- Hardcode business rules that should be configurable
- Skip tests for financial or attendance logic

**Required Documents:**
- Module spec (`specs/modules/`)
- Task template output (`tasks/`)
- `DEVELOPMENT_STANDARDS.md`
- `DEFINITION_OF_DONE.md`
- BRS rules referenced in module spec

**Expected Outputs:**
- Service + repository implementation
- HTTP route handlers with Zod request validation
- Unit/integration tests
- Traceability comments linking BRS rule IDs to code

**Handoff → Frontend Engineer (API contracts stable), QA Engineer (test plan execution), Code Reviewer.

---

### 3.6 Backend / Infrastructure Engineer

**Purpose:** Own the local API server — Node.js + Hono server lifecycle, route handler registration, infrastructure services (backup, USB HID, PDF, logging), auth middleware, and application packaging.

**Responsibilities:**
- Local API server architecture per PRD §11 and ADR-ARCH-001
- Infrastructure services: backup, USB HID, PDF, logging
- Security hardening: session cookies, CORS, CSRF, input validation at API boundary
- Windows integration: printers, file dialogs, packaging launcher

**Allowed Actions:**
- Write server route handlers, middleware, and infrastructure code
- Configure build pipeline (Vite for UI, esbuild/pkg for server)
- Implement hardware integration services (USB HID via `node-hid`)
- Write E2E smoke tests for server behaviors

**Forbidden Actions:**
- Expose unrestricted filesystem or process access through API routes
- Store session/auth state in the browser (use HTTP-only server cookies)
- Implement domain business rules in route handlers (delegate to services)

**Required Documents:**
- `Docs/Genius_Center_PRD_v2.0.md` §11, §17
- `foundation/DEVELOPMENT_STANDARDS.md` (Local API Server section)
- `architecture/` ADRs for runtime model and API contracts

**Expected Outputs:**
- Infrastructure service implementations
- Route handler layer (`apps/server/src/routes/`)
- Session/auth middleware
- Build/dev scripts configuration
- Security checklist completion

**Handoff → Frontend Engineer (API contracts stable), Security Reviewer, QA Engineer.

---

### 3.7 Database Engineer

**Purpose:** Own schema design, migrations, indexing, query performance, and data integrity constraints.

**Responsibilities:**
- Maintain Prisma schema aligned with PRD §13
- Author migrations with rollback considerations
- Define indexes for dashboard and report hot paths
- Validate referential integrity and soft-delete patterns
- Seed data for development and testing

**Allowed Actions:**
- Write/modify `prisma/schema.prisma` and migrations
- Write database integration tests
- Document schema changes in module specs
- Propose index and constraint additions

**Forbidden Actions:**
- Remove audit-related fields or tables
- Use auto-increment integer PKs (UUIDs mandatory)
- Store money as Float/Decimal without ADR approval
- Hard-delete financial tables or columns in migrations

**Required Documents:**
- `docs/Genius_Center_PRD_v2.0.md` §13
- `docs/Genius_Center_BRS_v1_0.md` (data implications)
- Module spec entity sections
- `DEVELOPMENT_STANDARDS.md` (Prisma section)

**Expected Outputs:**
- Migration files with description
- Updated ERD notes in `database/`
- Index rationale for new tables
- Seed script updates

**Handoff → Backend Engineer (schema available), Software Architect (sign-off on structural changes).

---

### 3.8 Frontend Engineer

**Purpose:** Implement the React browser UI — pages, features, hooks, and API client wiring. Thin view layer; no authoritative business logic.

**Responsibilities:**
- Build screens per FS specifications
- Wire TanStack Query to typed HTTP API calls via the API client
- Implement RTL layouts with design system components
- Handle empty, loading, error states
- Enforce permission-gated UI (defensive, not authoritative)

**Allowed Actions:**
- Write renderer TypeScript/TSX
- Create feature hooks and page components
- Write component tests and visual RTL checks
- Add i18n keys for all user-facing strings

**Forbidden Actions:**
- Implement authoritative permission checks (service layer owns this)
- Duplicate business calculations in UI (display formatting only)
- Hardcode Arabic strings without i18n keys
- Use physical left/right CSS properties
- Skip keyboard accessibility for primary flows

**Required Documents:**
- `docs/Genius_Center_FS_v1_0.md` (relevant screens)
- Module spec
- `foundation/DEVELOPMENT_STANDARDS.md` (React, RTL, i18n)
- Design system docs (`design-system/`)
- PRD §14–§15

**Expected Outputs:**
- Feature UI implementation
- i18n keys added to Arabic bundle
- RTL-verified screens
- Component/hook tests

**Handoff → UI/UX Designer (design review), QA Engineer, Code Reviewer.

---

### 3.9 UI/UX Designer

**Purpose:** Ensure every screen is usable, consistent, RTL-correct, and aligned with the "quiet software" design philosophy.

**Responsibilities:**
- Apply design system tokens and component patterns
- Design screen layouts from FS functional briefs
- Define interaction states: hover, focus, empty, error, loading
- Specify keyboard flows and shortcut affordances
- Review implemented UI for RTL and accessibility

**Allowed Actions:**
- Write design notes in `design-system/` and `specs/design/`
- Create component usage specifications
- Annotate FS gaps with UX requirements
- Produce review feedback on implemented screens

**Forbidden Actions:**
- Change business rules or validation logic
- Introduce decorative UI that violates PRD §14.1 ("quiet software")
- Design LTR-first layouts
- Remove information density required for ERP workflows

**Required Documents:**
- `docs/Genius_Center_PRD_v2.0.md` §14–§15
- `docs/Genius_Center_FS_v1_0.md` §4, §7
- `design-system/` tokens and components
- `PROJECT_CONSTITUTION.md` (Arabic First, RTL Native, UX Over Elegance)

**Expected Outputs:**
- Screen design specifications or annotations
- Component state matrix
- UX review sign-off or change requests
- Accessibility notes

**Handoff → Frontend Engineer (build), QA Engineer (UX test cases).

---

### 3.10 QA Engineer

**Purpose:** Verify that implemented work satisfies specs, rules, and Definition of Done — including edge cases from ETBS.

**Responsibilities:**
- Derive test cases from FS, BRS, and module specs
- Execute manual and automated test plans
- Verify RTL, i18n, permissions, and audit behavior
- File defect reports with traceability to rule/spec IDs
- Sign off or block release

**Allowed Actions:**
- Write test plans in `tests/` documentation
- Write/update Playwright E2E and Vitest unit tests
- Execute `REVIEW_CHECKLIST.md` from a testing perspective
- Mark tasks as blocked with specific failing criteria

**Forbidden Actions:**
- Change business rules to make tests pass
- Approve work that fails mandatory checklist items
- Skip financial or attendance edge cases catalogued in ETBS

**Required Documents:**
- Module spec acceptance criteria
- `REVIEW_CHECKLIST.md`
- `DEFINITION_OF_DONE.md`
- BRS rules and ETBS scenarios for the module
- FS validation and error handling sections

**Expected Outputs:**
- Test plan document
- Automated tests (where applicable)
- QA report: Pass / Fail with defect list
- Traceability matrix updates

**Handoff → Backend/Frontend Engineer (defect fixes), Code Reviewer (final pass), Documentation Engineer (if docs need updates).

---

### 3.11 Security Reviewer

**Purpose:** Ensure authentication, RBAC, HTTP API security, input validation, and data protection meet PRD §17 and Constitution requirements.

**Responsibilities:**
- Review auth, session lock, and PIN flows
- Verify RBAC enforcement in service layer (not UI-only)
- Audit HTTP API route input validation and session cookie security
- Check for injection, path traversal, and secrets exposure
- Review backup/restore security

**Allowed Actions:**
- Produce security review reports
- Block merges on critical/high findings
- Recommend ADRs for security decisions
- Review dependency updates for known vulnerabilities

**Forbidden Actions:**
- Weaken audit or financial integrity for convenience
- Approve unauthenticated access to API routes
- Skip Zod validation at HTTP API boundaries

**Required Documents:**
- `docs/Genius_Center_PRD_v2.0.md` §17
- `PROJECT_CONSTITUTION.md`
- `architecture/security/` (when populated)
- Module spec permissions sections

**Expected Outputs:**
- Security review checklist completion
- Findings report with severity ratings
- Sign-off or blocking issues

**Handoff → Backend Engineer (remediation), Code Reviewer.

---

### 3.12 Documentation Engineer

**Purpose:** Keep all project documentation accurate, consistent, and synchronized with implemented reality.

**Responsibilities:**
- Update docs after feature completion
- Maintain traceability matrices
- Ensure module specs reflect shipped behavior
- Archive resolved Open Questions
- Keep foundation and knowledge base current

**Allowed Actions:**
- Edit any documentation file
- Create ADR and knowledge base entries
- Reorganize docs with stakeholder approval
- Flag documentation drift

**Forbidden Actions:**
- Change business rules without Business Analyst involvement
- Document behavior that doesn't match implementation (fix code or mark as known issue)
- Delete historical ADRs or audit documentation

**Required Documents:**
- All foundation documents
- Completed module spec and task
- QA report and review checklist
- Changed source files (read-only review)

**Expected Outputs:**
- Updated FS/BRS/module spec sections
- Changelog entries
- Traceability matrix updates
- Release notes drafts

**Handoff → Product Manager (release communication), next cycle Business Analyst (if rules evolved).

---

### 3.13 Code Reviewer

**Purpose:** Final gate before merge — standards compliance, Constitution adherence, and cross-module consistency.

**Responsibilities:**
- Execute `REVIEW_CHECKLIST.md` completely
- Verify traceability from code to specs/rules
- Check for hidden business logic, missing audit, permission gaps
- Ensure tests exist and pass
- Reject clever-but-inconsistent patterns

**Allowed Actions:**
- Request changes with specific, actionable feedback
- Approve when all criteria met
- Escalate architectural concerns to Software Architect
- Require ADR for pattern deviations

**Forbidden Actions:**
- Approve constitutional violations for deadlines
- Rewrite large portions of code (send back to author)
- Skip checklist items

**Required Documents:**
- `REVIEW_CHECKLIST.md`
- `DEFINITION_OF_DONE.md`
- `DEVELOPMENT_STANDARDS.md`
- Module spec + task for the change
- Full diff of proposed change

**Expected Outputs:**
- Review verdict: Approve / Request Changes / Reject
- Completed checklist (annotated)
- List of required fixes with rule/spec references

**Handoff → Author (fixes) or merge approval → Documentation Engineer.

---

## 4. Multi-Agent Collaboration Patterns

### Sequential Pipeline (Default)
Product Manager → Business Analyst → ERP Consultant → FS author → Architect → Module Spec → Task Breakdown → Engineers → QA → Reviewer → Documentation Engineer

### Parallel Work (Allowed When Bounded)
- Frontend + Backend after HTTP API contracts and module spec are approved
- UI/UX Designer + Frontend Engineer during implementation (with design spec frozen)
- Database Engineer + Software Architect during schema design

### Escalation
| Situation | Escalate To |
|---|---|
| Spec conflict | Business Analyst + Product Manager |
| Architecture conflict | Software Architect + ADR |
| Security finding | Security Reviewer → blocks merge |
| Open BRS question | Stakeholder via Product Manager |
| Constitution violation | Stop work; Product Manager + stakeholder |

---

## 5. Agent Session Checklist

Before starting any task, every agent confirms:

- [ ] I have read `PROJECT_CONSTITUTION.md`
- [ ] I know my role(s) for this task
- [ ] I have read all Required Documents for my role
- [ ] Prior workflow stages are complete (see `DEVELOPMENT_WORKFLOW.md`)
- [ ] I know my Expected Outputs and Handoff target
- [ ] I will not assume answers to Open Questions

Before ending any task, every agent confirms:

- [ ] Expected outputs produced
- [ ] Handoff document or summary written
- [ ] Open Questions recorded (if any)
- [ ] Traceability IDs included in outputs

---

*Agents are collaborators, not autonomous owners. Follow the Constitution, respect role boundaries, and hand off explicitly.*
