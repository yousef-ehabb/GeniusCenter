# Module Backlog

## Scope Decisions

### D-006: Subjects Module Deferred to v2.0 (2026-07-08)

The Subjects module (`MOD-SUB`) has been **deferred to Version 2.0** (Tutoring Center Edition). Version 1.0 targets a single private tutor who teaches one subject. See [D-006](file:///d:/Course/Projects/Genius%20Center/Docs/decisions/D-006_Postpone_Subjects_Module.md) for the full decision record.

**v1.0 Replacement:** An optional `subject_taught` free-text field in the Settings module allows the tutor to specify what they teach. This value is informational only and may appear in reports and invoices.

**v2.0 Expansion:** Subjects will become a first-class entity with a dedicated Prisma model, service, repository, and CRUD UI. The existing [Subjects_Module_Spec.md](file:///d:/Course/Projects/Genius%20Center/Docs/specs/modules/Subjects_Module_Spec.md) is preserved as a starting reference.

---

## Settings Module v1.1 Enhancements

The following enhancements have been identified for future implementation in the Settings Module (v1.1) and should not block v1.0 development:

### 1. Policy Hierarchy
Every configurable setting should explicitly define its configuration scope (e.g., System, Teacher, Group, Enrollment, Student) to determine how configuration inheritance works.

### 2. Configuration Dependencies
For every setting, document which modules are affected (e.g., Business Type affects Students, Groups, Permissions, Reports, Dashboard). This dependency map will aid future maintenance.

### 3. Runtime Behavior
Document whether a setting applies immediately, requires a cache refresh, requires a module reload, or requires an application restart. This is essential for future cloud synchronization.

### 4. Configuration Categories
Internally organize settings into logical configuration groups (e.g., General, Academic, Attendance, Billing, Finance, Staff, Notification, Automation, Security, Backup). This is an architectural improvement and should not change the UI.

### 5. Configuration Metadata
Eventually, every configurable setting should have metadata (e.g., Name, Type, Scope, Default Value, Validation, Requires Restart, Cacheable, Auditable, Affected Modules) to make the configuration engine easier to maintain.
