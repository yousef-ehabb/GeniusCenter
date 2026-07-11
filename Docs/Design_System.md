# Genius Center Design System

This document outlines the visual language and components of Genius Center, ensuring consistency across the entire application.

---

## 1. Typography

Genius Center uses **ABC Diatype Arabic** exclusively across the entire application to maintain strict brand identity and guarantee identical rendering on all Windows machines without relying on external or system fonts.

### 1.1 Primary Font

- **Font Family**: `"ABC Diatype Arabic"`
- **Source**: Local bundle (`assets/fonts/`)
- **Fallback**: `system-ui, sans-serif` (never intended to be seen, as the font is bundled)

### 1.2 Available Weights and Usage Guidelines

The font comes in multiple weights, mapped as follows in Tailwind:

| Weight | Tailwind Class | Recommended Usage |
|---|---|---|
| **Thin** (100) | `font-thin` | Reserved only for future marketing material. |
| **Light** (300) | `font-light` | Large decorative headings only. |
| **Regular** (400) | `font-normal` | Body text, Inputs, Forms, Descriptions. |
| **Medium** (500) | `font-medium` | Buttons, Navigation, Sidebar, Tabs, Badges. |
| **Bold** (700) | `font-bold` | Card titles, Dialog titles, Table headers. |
| **Black** (800) | `font-black` | Page titles only. |
| **Heavy / Ultra** (900+) | N/A | Reserved for future branding. Do not use in the application UI unless explicitly required. |

### 1.3 Numeric Typography

Tabular numbers are mandatory wherever numbers are displayed in vertical alignment or dynamic counters to prevent layout shifting.

- **Implementation**: Uses `font-variant-numeric: tabular-nums` (via Tailwind class `tabular-nums` or custom `.tabular` utility).
- **Required Locations**:
  - Invoices and Financial Reports
  - Payments and Balances
  - Student Codes
  - Attendance Counts
  - Dashboard KPIs
  - Dates and Times
  - All Tables containing numeric data

### 1.4 Global Enforcement

The typography rules are enforced globally:
- Every page, dialog, table, input, button, menu, dropdown, tooltip, toast, and chart label.
- Every printed report and generated PDF.
- Defined in `project/src/index.css` via `@font-face` declarations.
- Configured in `project/tailwind.config.js` as the default `sans` font family.
