# ADR-ARCH-002: Offline Strategy

## Status
Accepted

## Context
Genius Center is designed for private tutors in Egypt, where internet connectivity can be unreliable, intermittent, or completely unavailable in learning centers. A traditional cloud SaaS model poses an unacceptable risk to business continuity, especially during critical operations like taking attendance via barcode or accepting student payments. 

The application must function smoothly offline by default, while feeling like a modern web application.

## Decision
We will implement an **Offline-First Local Web Application** architecture. 

### Local Persistence
- **Database**: SQLite (via Prisma) running entirely on the user's local filesystem.
- **Server**: A local Node.js API server (Hono) that directly interfaces with SQLite.
- **Frontend**: A React SPA that communicates exclusively with `localhost:PORT`.
- Because the entire stack (Database, Server, UI) runs locally on the same hardware, "offline" is actually the system's natural state. It does not require a network connection to operate.

### Cache Strategy
- The frontend will utilize **TanStack Query** with a Stale-While-Revalidate (SWR) cache strategy.
- While latency is negligible (all requests are `localhost`), caching prevents unnecessary re-rendering, provides instant UI navigation, and maintains state across component unmounts without over-fetching the local API.

### Startup Behavior
- When the user launches the application, a launcher script/executable will first bind and start the Node.js (Hono) API server.
- Once the API is healthy, the launcher will serve the static React assets (or proxy them in dev) and open the user's default web browser to the local URL.
- The UI will stall at a loading screen if it cannot reach the local API.

### Browser Refresh Behavior
- As a standard Single Page Application (SPA) using client-side routing (`react-router-dom`), browser refreshes will be caught by the local server and fall back to serving `index.html`.
- Since the API remains available locally, refreshing the page will immediately re-hydrate the application state from the local SQLite database via the Hono API.

### Future Synchronization Strategy (v2+)
- **Cloud Backup & Sync**: In a future version where cloud synchronization is introduced (e.g., for multi-device sync or remote parent portals), the local SQLite database remains the authoritative source of truth for the local application.
- **Queueing**: The local server will queue offline mutations (e.g., new payments) locally and synchronize them with a central cloud server once an internet connection is detected.
- The UI will not need to manage offline queues or `ServiceWorker` sync; the Node.js backend will handle all cloud synchronization transparently.

## Consequences
- **Positive**: Zero latency. 100% uptime regardless of internet status. Data privacy is guaranteed by default since data never leaves the user's machine unless explicitly configured.
- **Negative**: Users must manage their own machine health. Hardware failure means data loss unless local/USB backups are strictly maintained (which is why automated local backups are a Phase 1 requirement).
