# Memory Index

## Project
- [project] Always create a new dedicated branch for major code changes → project-conventions.md

## Decisions
- [D-006] Subjects module deferred to v2.0. v1.0 uses an optional `subject_taught` setting instead. No Subject CRUD, model, service, or screens in v1.0. See `Docs/decisions/D-006_Postpone_Subjects_Module.md`.
- [D-006] v1.0 milestone M1 is now Students + Parents only (Subjects removed).
- [ADR-ARCH-001] Architecture pivot accepted (2026-07-09): Genius Center is an **Offline-First Local Web Application**. No Electron shell. Stack: Node.js + Hono (local API server) → React + Vite (browser UI at localhost) → Prisma → SQLite. Transport: HTTP/JSON with Zod validation. Session: HTTP-only signed cookie. All previous IPC references are invalid. See `Docs/decisions/ADR-ARCH-001_LocalWebApp_Architecture.md`.
