# Application Flow

This document details the standard lifecycle and navigation flow of the Genius Center application, from cold start to the core business modules.

## 1. Application Start
When the application is launched (either via the desktop shortcut in production or `pnpm dev` in development):
- The local Node.js (Hono) server spins up and binds to a port.
- The React Frontend (SPA) is loaded in the browser.

## 2. Setup Check
The very first action the frontend performs is checking the system's setup status.
- The UI calls `GET /api/setup/status`.
- This endpoint checks the local SQLite database to see if an `OWNER` role and user account exist.

## 3. Setup Wizard (First Run Only)
If `isSetupComplete` is `false`:
- The user is forcefully redirected to the `/setup` route.
- The multi-step **Setup Wizard** is displayed.
- The user enters Business Information, Owner Details, and finalizes the setup.
- `POST /api/setup` creates the default Tenant, Roles, User, and default System Configurations.
- The backend establishes an HTTP-only JWT session cookie.
- The UI automatically redirects the newly authenticated Owner to the Dashboard.

## 4. Login
If `isSetupComplete` is `true` but the user is **not** authenticated (or their session has expired):
- The user is directed to the `/login` screen.
- They select their account and enter their password to authenticate.

## 5. Dashboard
Once authenticated, the user lands on the `/dashboard` route.
- This serves as the home screen, displaying relevant widgets, KPIs, and quick actions based on their role permissions.

## 6. Business Modules
From the Dashboard (or via the main navigation menu), the user can access specialized business modules:
- `/settings`: System and Business configurations.
- `/students`: Student directory, enrollment, and profiles.
- `/parents`: Parent directory and communications.
- `/groups`: Group management and scheduling.
- `/attendance`: Barcode/QR scanning and manual attendance tracking.
- `/finance`: Payment processing and financial reports.
