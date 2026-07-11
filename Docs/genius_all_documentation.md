# Genius

## Project Description
Here's a strong, professional project description you can use:

---

**Project Description**

I want to build a comprehensive desktop ERP system for private tutors that helps them manage every aspect of their teaching business from a single application. The first release is designed for individual tutors, but the architecture should be scalable so it can later support tutoring centers with multiple branches, teachers, and staff without major redesign.

The application will be an **offline-first desktop system** with a local database, ensuring it works without an internet connection. Cloud synchronization and remote access can be added later as optional features.

The system should include:

* Student management with detailed profiles and parent information.
* Group and class management with schedules and classrooms.
* Attendance tracking using multiple methods (manual selection, search, QR code scanning via a mobile phone, etc.).
* Payment management supporting monthly subscriptions, per-session payments, courses, and installments.
* Financial management, including income, expenses, cash flow, and profit reports.
* Staff management with user accounts, roles, permissions, salaries, and attendance.
* Exam and grade management.
* Homework and assignment tracking.
* Reporting and analytics dashboards.
* Receipt printing and student cards.
* Automated notifications (WhatsApp, SMS, or email integration).
* Backup and restore functionality.
* System settings, audit logs, and activity history.

The goal is **not** to build a minimal MVP. Instead, I want to build a polished, production-ready application that a private tutor can immediately use to replace spreadsheets, notebooks, and multiple disconnected tools.

The system should be modular, maintainable, and scalable, allowing future expansion into a complete management solution for tutoring centers, including multi-branch support, multiple teachers, parent portals, mobile applications, cloud synchronization, and AI-powered insights.

## Product Requirements Document
# Product Requirements Document (PRD): Genius ERP

## 1. Executive Summary
Genius is an offline-first, professional-grade desktop ERP system designed to streamline the operations of private tutors. It replaces fragmented tools (spreadsheets/paper logs) with a unified, scalable, and secure local application. While optimized for individual tutors, the architecture prioritizes modularity to support future expansion into multi-branch tutoring centers.

## 2. Goals and Objectives
* Primary Goal: Deliver a production-ready, Windows-native desktop application for student, financial, and administrative management.
* Secondary Goal: Ensure the technical foundation (SQLite + Prisma) allows for seamless future migration to cloud-based SQL databases.
* Key Constraint: Must be fully functional offline; all data remains local unless external sync is explicitly enabled later.

## 3. Core Functional Requirements
### 3.1 Student Management
* Detailed student profiles (personal info, contact, parent/guardian details, grade level).
* Automated QR code generation for student identification.
* Ability to group students by subject, grade, or course.

### 3.2 Attendance Tracking
* Manual attendance logging.
* USB HID-compliant barcode/QR scanner integration.
* Mobile-based QR scanner support via local network web-interface/companion tool.
* Comprehensive attendance history per student and per class.

### 3.3 Financial & Payment Management
* Manual recording of student payments (subscriptions, per-session, installments).
* Expense tracking (utilities, rent, staff salaries).
* Receipt generation (printable via local printers).
* Automated overdue payment flags.

### 3.4 Operational Modules
* Class/Schedule management with recurring and ad-hoc event support.
* Exam, Grade, and Homework/Assignment tracking.
* Staff management with Roles and Permissions (RBAC).
* Audit log tracking for all sensitive data mutations.

## 4. Reporting and Analytics
* Dashboard KPIs: Active students, current balance, monthly P&L (Revenue vs. Expenses), attendance trends.
* Export capabilities: PDF (Printable), Excel (.xlsx), and CSV.
* Advanced filtering: Date ranges, status, payment state, group, and subject.

## 5. Technical Specifications
* Platform: Windows 10/11 (64-bit).
* Database: SQLite (via Prisma ORM).
* Backup: One-click local backup and restore functionality.
* Messaging: Modular notification abstraction layer supporting pre-filled templates for WhatsApp, SMS, and Email.
* Security:
    * Password hashing (Argon2 or equivalent).
    * Role-Based Access Control (RBAC).
    * Automatic session locking.
    * Prepared for SQLCipher integration.

## 6. UI/UX Design Requirements
* Language: Arabic (Primary).
* Direction: Full Right-to-Left (RTL) implementation.
* Typography: Rubik font family.
* Design Language: Clean, professional, minimalist business software.
* Layout: Dashboard-centric, responsive to monitor sizes, clean iconography.

## 7. Scalability and Future-Proofing
* Architecture: N-tier architecture separating Data Access, Business Logic, and UI.
* Data Integrity: Use of UUIDs as primary keys to facilitate future synchronization/merging of data.
* Modularization: Notification and Attendance scanners must be implemented as distinct services/providers to allow swapping logic (e.g., adding a specific WhatsApp API provider later) without touching the core business logic.

## 8. Success Metrics
* Deployment: Fully operational installation package delivered by July 15.
* Usability: Tutors can perform daily tasks (attendance, payment recording) in under 3 clicks from the dashboard.
* Reliability: Zero critical data loss during power failure or unexpected app closure.
* Performance: Instant search and data retrieval for up to 2,000 student records.

## 9. Constraints
* Windows-only for v1.0.
* No automatic payment gateway integrations (manual entry only).
* SQLite-only for initial release.

## Technology Stack
# TECHSTACK: Genius ERP

## 1. Overview
The Genius ERP system is engineered as an offline-first, high-performance desktop application. The technology stack is selected to provide a balance between immediate ease of use for individual tutors and long-term architectural readiness for multi-branch, cloud-enabled tutoring centers.

## 2. Core Framework & Runtime
- **Runtime:** Node.js (LTS version)
- **Desktop Framework:** Electron
    - Justification: Provides a robust foundation for building cross-platform desktop apps using web technologies. Its mature ecosystem is essential for native Windows integration, file system access (for local SQLite databases), and hardware peripheral management.
- **Frontend Framework:** React
    - Justification: Enables a component-based architecture which is critical for maintaining complex, dashboard-heavy ERP interfaces. Its ecosystem for data-grid handling and charting is best-in-class.

## 3. Database & Data Layer
- **Primary Database:** SQLite
    - Justification: Perfect for single-user offline desktop environments. It requires zero configuration, is fast, and supports atomic transactions which are vital for financial record keeping.
- **ORM:** Prisma
    - Justification: Ensures type-safe database access and schema management. Prisma’s abstraction layer allows us to switch the underlying provider from SQLite to PostgreSQL or SQL Server in the future with minimal refactoring.
- **Schema Strategy:** Normalized relational design using UUIDs as primary keys to ensure data integrity during future cloud migration and multi-client synchronization.

## 4. UI/UX & Styling
- **Styling Strategy:** Tailwind CSS
    - Justification: Allows for rapid, consistent styling while maintaining a clean, minimalist professional aesthetic. Excellent support for RTL (Right-to-Left) layouts.
- **UI Component Library:** Headless UI + Radix UI
    - Justification: Provides accessible, unstyled primitives. This ensures the design remains "premium" and "custom" without being constrained by pre-defined, flashy design patterns common in heavy UI kits.
- **Font:** Rubik
    - Justification: Selected for its modern, clean appearance which ensures high readability in Arabic.
- **Charts/Dashboard:** Recharts
    - Justification: Lightweight, responsive, and highly customizable for displaying operational KPIs and financial trends.

## 5. Hardware & Peripherals
- **QR Scanning (Mobile):** Local Web Server Integration
    - The desktop app will host a lightweight, local-network-only API endpoint. A mobile-responsive web view (PWA) will allow teachers to scan codes, which are then pushed to the local SQLite database via the desktop app's socket/API layer.
- **QR Scanning (USB):** HID Keyboard Emulation
    - Standard USB scanners will be handled via native Electron keyboard event listeners, allowing seamless integration without specific driver dependencies.
- **Printing:** Electron Printer API
    - Leverages standard Windows print drivers to generate PDF reports and student ID cards.

## 6. Communication & Notifications
- **Abstraction Layer:** Notification Provider Interface
    - The system will implement an Adapter Pattern. This allows the core code to trigger an `AttendanceNotification` without knowing the underlying service, enabling easy switching between future providers like WhatsApp Business API, Twilio (SMS), or Nodemailer (SMTP).

## 7. Security & Compliance
- **Authentication:** Local-only PBKDF2/Argon2 password hashing. No credentials will ever leave the local machine.
- **Audit Logging:** A dedicated `audit_logs` table tracking all CRUD operations on sensitive data (Financial/Student records).
- **Data Protection:** Filesystem-level security and future-ready architecture for encryption-at-rest using SQLCipher.

## 8. Development & Build Tools
- **Build Tool:** Vite
    - Justification: Significantly faster than Webpack, providing an improved developer experience for the Electron build pipeline.
- **State Management:** TanStack Query (React Query)
    - Justification: Ideal for managing server-like state (even locally), handling caching, and synchronizing the UI with the SQLite backend.
- **Testing:** Playwright (for E2E) and Vitest (for Unit testing)
    - Justification: Ensures the stability of critical modules like financial calculations and attendance logic.
- **Version Control:** Git (GitHub/GitLab) for code repository.

## Project Structure
PROJECT STRUCTURE: GENIUS ERP

1. OVERVIEW
The Genius project utilizes a modular, clean-architecture approach to ensure maintainability and scalability. By leveraging a domain-driven structure, the application separates concerns between the UI, business logic, and data persistence layers. This structure is designed to support the transition from a local SQLite-based desktop application to a networked, cloud-synchronized multi-user system.

2. DIRECTORY HIERARCHY

/genius-erp
├── /assets              # Static files: fonts (Rubik), images, and branding.
├── /prisma             # Database schema, migrations, and seed scripts.
├── /public             # Public assets for the UI layer (e.g., icons).
├── /src
│   ├── /api            # Abstraction layer for communication (WhatsApp, SMS, Email).
│   ├── /components     # Shared UI components (RTL-ready, styled with system design guidelines).
│   ├── /config         # Environment variables and system configurations.
│   ├── /core           # Core business logic and domain entities (Student, Finance, Attendance).
│   ├── /database       # SQLite connection manager and repository pattern implementations.
│   ├── /hooks          # Custom React/UI hooks for state and lifecycle management.
│   ├── /lib            # Third-party service wrappers (e.g., printing, PDF generation).
│   ├── /pages          # Main view controllers (Dashboard, Students, Finance, Settings).
│   ├── /services       # Application-level services (Auth, Backup, Audit Log, Reporting).
│   ├── /store          # State management (Global application state).
│   ├── /types          # TypeScript interfaces and shared type definitions.
│   └── /utils          # Helper functions: QR code generation, date formatting, validation.
├── /tests              # Unit and integration testing suites.
├── .env                # Local environment configurations (database path, security keys).
└── package.json        # Project dependencies and build scripts.

3. KEY MODULE EXPLANATIONS

- /prisma: Contains schema.prisma. This file uses UUIDs for primary keys to ensure compatibility when scaling to PostgreSQL. Migrations are stored here to allow database versioning and seamless updates.
- /src/core: Acts as the "Brain" of the application. Business logic (e.g., calculating monthly profit or attendance rates) is centralized here rather than in the UI components, keeping the view layer thin.
- /src/services/backup: Handles the one-click SQLite snapshot process. Includes routines for verifying database integrity before and after restores.
- /src/api: Implements the provider-agnostic communication service. It defines an interface for "NotificationProviders," allowing new integrations (e.g., WhatsApp API) to be added without touching existing business logic.
- /src/components: Designed for RTL support. Components are built with standard spacing and typography (Rubik) to ensure the UI feels native and professional.

4. DESIGN PRINCIPLES
- Offline-First: All operations occur against the local SQLite store; the architecture prevents hard-coding of network-dependent logic.
- Modularity: Each major feature (e.g., Attendance, Finance, Student Management) lives in a self-contained domain within /src, minimizing side effects during feature development.
- Security: The /src/services/auth module handles encryption/hashing and audit logging. Every sensitive database interaction flows through a repository layer that logs entries to the audit_logs table automatically.

5. SCALABILITY CONSIDERATIONS
- The separation of the Database/Persistence layer from the UI ensures that switching to PostgreSQL in the future only requires updating the prisma/schema.prisma file and the connection string in the configuration.
- All financial and student data models include tenant-ready fields (e.g., branch_id) to facilitate the transition to multi-branch support later."

## Database Schema Design
### 3. SCHEMA DESIGN

The Genius ERP database is designed using a normalized relational model, implemented via Prisma ORM to ensure database agnosticism and future-proof migration to PostgreSQL or SQL Server. The schema utilizes UUIDs as primary keys to prevent ID collisions during future multi-branch synchronization and cloud merging.

#### 3.1 Core Entity Relationships
* **Identity & Access Management:** Users are categorized by Roles (Owner, Teacher, Assistant, etc.). Permissions are linked to these roles, controlling access to sensitive financial and student data.
* **Student & Enrollment:** Students are the central entities. A 'Student' is linked to 'Groups' through an 'Enrollment' join table, allowing many-to-many relationships. This supports tracking student history across different subjects and academic terms.
* **Financial Ledger:** All financial activity (payments, expenses, salaries) is stored in a unified 'Transaction' table with a discriminator field (type) to allow for complex queries across all income and expense categories.
* **Attendance:** The 'Attendance' table records sessions and individual student status (Present, Absent, Excused, Late). It links directly to 'Sessions' to ensure granular reporting.

#### 3.2 Data Models (Prisma Schema Overview)

**System & Security**
- User: {id, username, passwordHash, roleId, isActive, createdAt}
- Role: {id, name, permissions: JSON}
- AuditLog: {id, userId, action, entityType, entityId, timestamp, metadata}

**Academic Management**
- Student: {id, fullName, phone, parentPhone, email, gradeLevel, status, qrCodeString, createdAt}
- Group: {id, name, subject, teacherId, academicYear, isActive}
- Session: {id, groupId, scheduledDate, startTime, endTime, topic, isCompleted}
- Attendance: {id, sessionId, studentId, status, timestamp, scannedBy}

**Financial Management**
- Transaction: {id, type (INCOME/EXPENSE), category, amount, date, description, paymentMethod, referenceNumber, createdBy}
- Salary: {id, userId, amount, payDate, monthCovered, status}

**Communication**
- NotificationTemplate: {id, name, content, triggerType}
- NotificationHistory: {id, recipientId, templateId, sentAt, status, provider}

#### 3.3 Scalability & Design Patterns
* **UUID Implementation:** Every table uses `String` UUIDs instead of auto-incrementing integers. This is mandatory for offline-to-online synchronization, ensuring that locally generated IDs remain unique when merged into a central cloud database.
* **Soft Deletes:** Tables include a `deletedAt` field to support soft-deletion, preventing permanent data loss and allowing for audit recovery.
* **Normalization vs. Performance:** While the schema is highly normalized, JSON fields are used for non-query-intensive settings (like UI preferences or notification metadata) to maintain schema flexibility.
* **Offline Synchronization Hooks:** Every record includes `version` (for optimistic concurrency) and `updatedAt` timestamps, which will serve as the foundation for conflict resolution logic when moving to a cloud-synced architecture.

#### 3.4 Future-Proofing for Multi-Branch
The schema includes a 'Branch' identifier field in every primary entity. Currently, the system defaults to a single branch context. When the transition to a tutoring center model occurs, the application logic will filter queries by the `branchId` context, allowing the existing tables to support multiple locations seamlessly without structural changes.

#### 3.5 Database Performance
* **Indexing:** SQLite indexes are defined for frequently queried foreign keys (`studentId`, `groupId`, `sessionId`, `transactionDate`) to ensure that reporting dashboards remain snappy even as the student population grows to 20,000+.
* **Constraints:** Strong referential integrity (Foreign Key constraints) is enforced at the database level to prevent orphaned records during manual backup/restore cycles.

## User Flow
USERFLOW DOCUMENT: GENIUS ERP

1. OVERVIEW
The Genius ERP user flow is designed for an RTL, Windows-native experience. The navigation follows a hub-and-spoke model, with a persistent left-hand sidebar for primary modules and a top-level global action bar.

2. CORE USER JOURNEYS

2.1. Attendance Tracking (Hybrid Flow)
- Trigger: User clicks "Attendance" in the sidebar or selects a specific class from the Dashboard.
- Mode Selection:
  - USB Scanner: Input field gains focus automatically. Scanning a code triggers a lookup, marks attendance, and displays a "Success" toast with student profile summary.
  - Mobile/Web Scan: User clicks "Activate Remote Scanner." A modal displays a local URL or QR code for mobile connection. Once a remote scan is received via the local network, the desktop UI reflects the change in real-time.
- Validation: System checks for enrollment status and class schedule; displays "Alert" if the student is not registered for the specific session.

2.2. Student Onboarding & QR Generation
- Entry: "Students" module -> "Add New Student."
- Interaction: 
  - User fills profile (Name, Parent Info, Grade, Group).
  - Upon submission, system generates a unique UUID-based QR code.
  - Navigation: Auto-redirect to "Card Printing" screen where the QR is previewed on a template.
- Output: Print/Export PDF button.

2.3. Financial Recording (Ledger Flow)
- Entry: "Finances" module -> "New Transaction."
- Interaction:
  - User selects Type (Income/Expense).
  - Search field auto-populates "Student" or "Vendor" via a smart-dropdown.
  - "Split Payment" toggle allows tracking installments.
  - "Attach to Class" link allows linking income to specific course cycles.
- Completion: Audit log records timestamp, user ID, and transaction details automatically.

3. WIREFRAME DESCRIPTIONS

3.1. Main Dashboard
- Layout: 3-column grid.
- Column 1: Operational KPIs (Total Students, Revenue, Net Profit).
- Column 2: "Quick Actions" (Scan Attendance, Register Student, Issue Receipt).
- Column 3: Alerts Feed (Overdue Payments, Absenteeism Reports).

3.2. Data Tables (All Modules)
- Pattern:
  - Toolbar: Global search bar, Filter pills (Date, Status, Group), Export button (PDF/Excel).
  - Interaction: Hover-row highlights, right-click context menu (Edit, Delete, View Profile, Send Message).
  - Pagination: Infinite scroll or classic pagination based on record volume.

4. INTERACTION PATTERNS

4.1. RTL Optimization
- Navigation: Sidebar is pinned to the right side of the screen.
- Icons: Directional icons (back, forward, chevron) are flipped.
- Text: Rubik font alignment is force-set to right-aligned for inputs and table labels.

4.2. Feedback Mechanisms
- Toasts: Success/Error messages appear in the top-left (RTL convention) for 3 seconds.
- Modals: Centered, dimming the background for focus. Escape key closes current modal/layer.
- Form Validation: Inline red border and clear text explanation appearing immediately upon field blur.

5. NOTIFICATION FLOW
- Trigger: Automatic (overdue payment) or Manual (broadcast message).
- Composition: User selects recipient(s) -> System pulls "Template" (e.g., Payment Reminder) -> Variables like {StudentName} are injected -> Preview modal -> "Send" button invokes the modular Communication Service.
- History: Each record in the "Sent Logs" contains status (Pending/Sent) and channel used.

6. SECURITY & AUDIT FLOW
- Authentication: Login screen with persistent "Remember Me" option (encrypted).
- Role Access: UI elements are hidden/disabled at the component level based on RBAC (e.g., "Accountant" cannot see "Exam Grades").
- Audit Logging: Every Create/Update/Delete (CUD) operation triggers an internal log entry containing User ID, Action, Timestamp, and previous/new state for database recovery.

7. BACKUP & SYSTEM MAINTENANCE
- Entry: Settings -> Data Management.
- Action: "Perform Backup" creates a compressed SQLite file with a .db-backup timestamp.
- Restore: User selects file -> System prompts for confirmation -> Validates database integrity -> Restarts application service.

## Styling Guidelines
# STYLING GUIDELINES: GENIUS ERP

## 1. Design Philosophy
Genius is built for professional utility. The visual language follows a "Quiet Software" approach: 
- High information density without visual clutter.
- RTL-native layout architecture.
- Predictable, stable, and readable.
- No decorative fluff—every pixel must serve a functional purpose.

## 2. Color Palette
The color scheme is designed for long-term usage (minimizing eye strain) and clear status indication.

### Core Foundation
- Background (Surface): #FFFFFF
- Secondary Surface (Cards/Sidebars): #F9FAFB
- Border/Dividers: #E5E7EB
- Primary Text: #111827 (Gray-900)
- Secondary Text: #6B7280 (Gray-500)

### Brand & Action
- Primary Brand Color: #2563EB (Blue-600)
- Primary Hover/Active: #1D4ED8 (Blue-700)

### Status Indicators
- Success (Paid/Present): #059669 (Emerald-600)
- Warning (Overdue/Pending): #D97706 (Amber-600)
- Danger (Absent/Expense): #DC2626 (Red-600)
- Info (Notice/Transaction): #0284C7 (Sky-600)

## 3. Typography
- Primary Font: Rubik
- Language Support: Full Arabic (RTL) implementation.
- Hierarchy:
  - H1 (Page Title): 24px Semi-Bold
  - H2 (Section Header): 18px Medium
  - Body (Primary): 14px Regular
  - Labels (Form/Inputs): 12px Medium
  - Data (Tables): 13px Regular
- Line Height: 1.5 for readability across all text sizes.

## 4. UI/UX Principles

### RTL Implementation
- Layouts are strictly RTL. Sidebars are anchored to the right, progress bars fill from right-to-left, and icon directional indicators are mirrored where contextually appropriate (e.g., "Next/Previous" arrows).
- Tab indices and navigation flows follow the right-to-left logical reading order.

### Layout & Spacing
- Grid System: 4px baseline grid.
- Corner Radius: 6px (sm) for buttons/inputs, 8px (md) for containers.
- Shadows: Subtle, soft-drop shadows (elevation) used only for modal overlays and active navigation elements to prevent interface "flatness."

### Form & Input Design
- High contrast borders for input fields.
- Clear validation states (Icon + border color change).
- Focus states must be highly visible (using Primary Brand Color).
- Labels are placed above inputs for clean, scalable form stacks.

### Data Tables
- Zebra striping is prohibited in favor of subtle row borders.
- Hover state: Row background shift to #F3F4F6.
- Column alignment: Numeric values (currency/attendance) align to the left in RTL; text content aligns to the right.

## 5. Components & Icons
- Icons: Use a consistent set (e.g., Heroicons or Lucide) at 20px size for navigation and 16px for utility.
- Buttons:
  - Primary: Solid fill.
  - Secondary: Outlined with Gray-300 borders.
  - Tertiary/Ghost: No background, only icon/text color change on hover.
- Notifications: Toasts are positioned at the top-left (RTL convention) and slide in with a subtle fade-in transition.

## 6. Accessibility & Responsiveness
- High Contrast Ratio: All text must meet WCAG AA standards (minimum 4.5:1 ratio).
- Responsiveness: The interface should leverage a flex/grid fluid layout that allows the sidebar to collapse and content areas to expand on large displays without creating excessive whitespace.
- Interaction: All primary actions are accessible via keyboard shortcuts (e.g., Ctrl+S to save, Esc to close modals).
