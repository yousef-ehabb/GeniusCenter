# Deployment Strategy

This document outlines how Genius Center is deployed across different environments, adhering to the principle that **the customer experience should require no terminal commands**.

## 1. Development Environment

**Target Audience:** Developers, AI Agents.

During development, the application is run from source using standard Node.js tooling.
- **Tools:** `pnpm`, `tsx`, `vite`.
- **Command:** `pnpm dev` at the repository root.
- **Behavior:** This command utilizes `concurrently` to launch both the local Node.js API server (Hono) and the Vite frontend dev server. Hot Module Replacement (HMR) is active. The developer accesses the UI via `http://localhost:5173`.

## 2. Demo Environment

**Target Audience:** Stakeholders, Beta Testers, Sales.

For demonstration purposes, the application can be packaged to run easily on a target machine without development overhead, or hosted temporarily on a cloud provider (since the architecture is standard Node.js + SQLite).
- **Local Demo Build:** A script (`pnpm build`) compiles the TypeScript backend to JavaScript and the React frontend to static assets. The backend is configured to serve the frontend's static assets folder. A simple `npm start` (or a `.bat`/`.sh` script) launches the Node server and opens the browser.
- **Cloud Demo (Optional):** Because it is a Node.js web app, it can be easily deployed to platforms like Render, Vercel (using a serverless adapter), or Railway with an ephemeral or attached SQLite volume for remote showcasing.

## 3. Customer Installation (Production)

**Target Audience:** Private Tutors (Non-technical end users).

The production distribution must abstract away Node.js, `npm`, and the command line entirely. The user should experience a standard desktop software installation.

### Packaging
- The application will be compiled into a **single standalone executable** (or a bundled directory) using tools like `pkg`, `nexe`, or `node-sea` (Single Executable Applications).
- The package will contain:
  1. The compiled Node.js runtime.
  2. The compiled Hono API server code.
  3. The static `apps/ui/dist` React assets.
  4. The Prisma query engine and SQLite binaries.

### Installation & Execution
- **Installer:** A standard Windows installer (e.g., Inno Setup or NSIS) will be provided (`GeniusCenter-Setup.exe`). It will place the bundled application in `C:\Program Files\Genius Center` and create Desktop/Start Menu shortcuts.
- **Execution:** When the user double-clicks the Genius Center shortcut, it executes a lightweight launcher.
- **Startup Flow:**
  1. The launcher binds the Node.js API to an available local port.
  2. It initializes or connects to the SQLite database located in the user's `AppData` folder.
  3. It uses the system's default web browser (via a library like `open`) to launch `http://localhost:<PORT>`.
  4. A system tray icon is created to allow the user to easily access settings, view server status, or gracefully shut down the application.

This guarantees a zero-configuration, zero-terminal deployment that looks and feels like a local desktop app, while leveraging the robust Offline-First Web Architecture underneath.
