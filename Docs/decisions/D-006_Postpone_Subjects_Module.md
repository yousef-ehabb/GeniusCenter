# Architecture Decision Record — D-006

| | |
|---|---|
| **Decision ID** | D-006 |
| **Title** | Postpone Subjects Module to Version 2.0 |
| **Status** | **Accepted** |
| **Date** | 2026-07-08 |
| **Decision Maker** | Stakeholder (Product Owner) |
| **Affects** | PRD Roadmap, Module Specs, Prisma Schema, Settings Module |

---

## Context

Genius Center v1.0 targets a **single private tutor** who typically teaches one subject. The original roadmap included a full Subjects module (`MOD-SUB`) as part of the data foundation milestone (M1), with CRUD operations, archival logic, color coding, display ordering, and a dedicated Prisma model.

Upon reviewing the roadmap against the v1.0 target persona, this module adds unnecessary complexity:

- A single-subject tutor does not need a Subject entity, service, repository, IPC channels, or CRUD screens.
- The Subject module's primary value emerges in v2.0 (Tutoring Center Edition), where multiple teachers teach multiple subjects, and Groups reference Subjects as a first-class entity.
- Building the module now would consume implementation time on code that serves no v1.0 user need.

---

## Decision

1. **Remove** the Subjects module from the v1.0 implementation roadmap.
2. **Do NOT implement** Subject CRUD, Prisma model, service, repository, IPC channels, or screens in v1.0.
3. **Add** an optional `subject_taught` field to the Settings schema (informational only).
   - This allows the tutor to specify what they teach (e.g., "Mathematics", "Physics").
   - The value may be displayed in reports, invoices, or printed documents.
   - It is a free-text string, not a foreign key to a Subject entity.
4. **Preserve** the existing Subjects Module Spec (`Subjects_Module_Spec.md`) for v2.0 reference, marked as **Deferred**.
5. **Retain** the architecture's extensibility — introducing the Subjects module in v2.0 must not require redesigning existing modules.

---

## v2.0 Expansion Plan

When v2.0 (Tutoring Center Edition) is implemented:

- `Subject` becomes a first-class business entity with its own Prisma model, service, and repository.
- Teachers may teach multiple subjects.
- Groups will reference Subjects.
- The `subject_taught` setting may be migrated into the Subject entity or retained as a display preference.
- Multiple teachers and subjects will be supported.

---

## Impact

| Area | Change |
|---|---|
| **v1.0 Roadmap** | Subjects module removed from M1. M1 becomes: Students + Parents only. |
| **Prisma Schema** | No `Subject` model in v1.0. |
| **Settings Schema** | New optional `subject_taught: string` field added. |
| **Settings UI** | New text input in the Business tab. |
| **Module Specs** | `Subjects_Module_Spec.md` marked as Deferred to v2.0. |
| **Implementation Velocity** | Faster. Removes ~2 days of work from M1. |
| **Architecture** | No changes. System remains extensible. |

---

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| Build full Subjects module in v1.0 | Unnecessary complexity for single-subject tutor. No user value. |
| Hardcode subject as a constant | Not flexible. Tutor should be able to specify their subject. |
| Use an enum for subject selection | Too rigid. Subject names vary (e.g., "رياضيات" vs "رياضة بحتة"). Free text is more appropriate for v1.0. |

---

## Traceability

- **PRD §8.2**: Subjects module — deferred.
- **FS §3**: General Setup — `subject_taught` added to Settings.
- **Domain Model §1.2 (Academic Core)**: Subject entity — deferred to v2.0.
- **BRS Rules**: SUB-001 through SUB-004 — deferred.
- **Module Spec**: `Docs/specs/modules/Subjects_Module_Spec.md` — status changed to Deferred.
