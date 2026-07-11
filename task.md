# Genius Center — Tasks

## Phase 1: Database & Backend Server Setup
- [x] Initialize Prisma and set datasource provider to sqlite.
- [x] Create `schema.prisma` matching the PRD data model.
- [x] Scaffold Hono API server in `src/server/index.ts`.
- [x] Create Zod validation schemas.

## Phase 2: Frontend Migration & Infrastructure
- [x] Add ABC Diatype Arabic font and update `tailwind.config.js`.
- [x] Install TanStack Query.
- [x] Replace `lib/repo.ts` with API clients using React Query.
- [x] Replace Supabase Auth with local SQLite authentication.

## Phase 3: Core Business Logic (Critical Fixes)
- [x] Refactor Financial Model to use integer minor units and Invoice/Payment allocation.
- [x] Refactor Student/Parent relation to many-to-many.

## Phase 4: Feature Completion
- [ ] Implement QR code auto-generation and scanning in Attendance.
- [ ] Implement Report exports (PDF, Excel, CSV).
- [ ] Implement Charts (Recharts) on Dashboard/Finance.
- [ ] Implement Audit Logging on the Hono server.
