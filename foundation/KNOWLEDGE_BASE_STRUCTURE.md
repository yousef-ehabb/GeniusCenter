# Genius Center — Knowledge Base Structure

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Active |
| **Purpose** | Design the long-term, evolving knowledge repository for market intelligence, decisions, and learnings |
| **Location** | `knowledge/` (see `PROJECT_STRUCTURE.md`) |

---

## 1. Purpose

Genius Center serves Egyptian tutoring businesses — a market that varies by city, scale, subject, and business culture. The PRD, BRS, and ETBS capture **decisions**; the knowledge base captures **discovery** — the raw intelligence that informs those decisions over time.

This repository grows continuously as we:

- Interview tutors and center owners
- Observe operations in the field
- Analyze competitors
- Make architecture and product choices
- Ship features and learn from usage
- Research UI patterns for Arabic ERP software

**Rule:** Knowledge base entries inform the BRS and ETBS — they do not override the Constitution or PRD without formal amendment.

---

## 2. Design Principles

| Principle | Description |
|---|---|
| **Capture early** | Record insights when discovered — not after they're forgotten |
| **Source everything** | Date, source type, and confidence level on every entry |
| **Separate raw from decided** | Research notes ≠ approved business rules |
| **Evolve openly** | Supersede outdated entries — don't delete history |
| **Cross-link** | Reference ETBS IDs, BRS rules, ADRs, and module specs |
| **Bilingual metadata** | Titles in English for agent parsing; quotes may be Arabic |
| **Offline-friendly** | Markdown files in git — no external wiki dependency |

---

## 3. Folder Structure

```
knowledge/
├── README.md                          # Index and contribution guide
├── _templates/                        # Entry templates per section
│   ├── interview-template.md
│   ├── competitor-template.md
│   ├── discovery-template.md
│   ├── adr-template.md
│   └── lesson-learned-template.md
│
├── market-research/                   # §4.1
│   ├── README.md
│   ├── YYYY-MM-[topic].md
│   └── segments/
│       ├── private-tutors.md
│       └── tutoring-centers.md
│
├── competitor-analysis/               # §4.2
│   ├── README.md
│   └── [competitor-name].md
│
├── teacher-interviews/                # §4.3
│   ├── README.md
│   └── YYYY-MM-DD-[subject]-[location].md
│
├── business-discoveries/              # §4.4
│   ├── README.md
│   └── YYYY-MM-[discovery-slug].md
│
├── architecture-decisions/            # §4.5
│   ├── README.md
│   └── ADR-NNN-[title].md
│
├── ui-research/                       # §4.6
│   ├── README.md
│   ├── rtl-patterns/
│   ├── erp-reference-apps/
│   └── arabic-typography/
│
├── future-ideas/                      # §4.7
│   ├── README.md
│   └── IDEA-[NNN]-[title].md
│
└── lessons-learned/                   # §4.8
    ├── README.md
    └── YYYY-MM-[topic].md
```

---

## 4. Section Definitions

---

### 4.1 Market Research

**Purpose:** Understand the Egyptian tutoring market — size, segments, trends, pricing norms, technology adoption, regional differences.

**Contents:**
- Market segment profiles (private tutor vs. center vs. hybrid)
- Geographic notes (Cairo, Alexandria, Delta, Upper Egypt)
- Pricing benchmarks by subject and grade
- Technology adoption levels (cash vs. wallet, paper vs. digital attendance)
- Regulatory or cultural factors affecting software adoption

**Entry format:** `knowledge/market-research/YYYY-MM-[topic].md`

**Template fields:**
- Title, Date, Author/Agent
- Source type (desk research / field observation / report)
- Confidence (High / Medium / Low)
- Summary
- Key findings (bullet list)
- Implications for Genius Center
- Links to ETBS scenarios or BRS rules influenced

**When to write:** During product discovery, before major module design, when entering a new segment.

---

### 4.2 Competitor Analysis

**Purpose:** Document existing tools tutors use — spreadsheets, WhatsApp, local software, international LMS — to inform differentiation and feature priority.

**Contents:**
- Product name, URL (if applicable), target segment
- Feature matrix vs. Genius Center
- Strengths and weaknesses
- Pricing model
- Why tutors use or abandon it
- Screenshots or workflow notes (stored in `knowledge/competitor-analysis/assets/` if needed)

**Entry format:** `knowledge/competitor-analysis/[competitor-name].md`

**Template fields:**
- Competitor name, Date reviewed
- Target segment
- Feature comparison table
- What tutors love
- What tutors hate
- Gaps Genius Center fills
- Threats / risks

**When to write:** When a stakeholder mentions a competitor, before positioning decisions, during roadmap prioritization.

---

### 4.3 Teacher Interviews

**Purpose:** Capture primary research from tutors, center owners, assistants, and parents — the ground truth that ETBS scenarios are built from.

**Contents:**
- Interview transcript or structured notes
- Persona mapping (PRD §6)
- Verbatim quotes (Arabic preserved)
- Workflow descriptions in their own words
- Pain points ranked by severity
- Feature requests (raw — not committed)

**Entry format:** `knowledge/teacher-interviews/YYYY-MM-DD-[subject]-[location].md`

**Privacy:** No real student names. Anonymize: "Tutor A, Cairo, Math, ~120 students."

**Template fields:**
- Date, Interviewer, Subject taught
- Business type (Private Tutor / Center)
- Location (city/region)
- Scale (student count, group count)
- Current tools used
- Top 3 pain points
- Quoted workflows
- Surprising discoveries
- Suggested ETBS scenarios to create

**When to write:** After every interview or field visit. Before writing new ETBS scenarios.

---

### 4.4 Business Discoveries

**Purpose:** Record operational insights that emerge during development, support, or stakeholder conversations — things that aren't full interviews but affect business rules.

**Contents:**
- "We discovered that centers in X always do Y"
- Billing edge cases found during implementation
- Configuration patterns observed in the wild
- Contradictions between assumed and actual behavior

**Entry format:** `knowledge/business-discoveries/YYYY-MM-[discovery-slug].md`

**Template fields:**
- Date, Discoverer
- Context (how discovered)
- Discovery statement
- Affected modules
- Recommended BRS/ETBS action
- Status (New / Incorporated / Rejected)

**When to write:** Anytime an agent or developer learns something that could affect rules — during Business Analysis, Implementation, or QA.

---

### 4.5 Architecture Decisions

**Purpose:** Record significant technical decisions with context, alternatives, and consequences — the ADR pattern.

**Contents:**
- Decision title and status (Proposed / Accepted / Deprecated / Superseded)
- Context and problem
- Options considered
- Decision and rationale
- Consequences (positive and negative)
- Links to PRD sections and module specs

**Entry format:** `knowledge/architecture-decisions/ADR-NNN-[title].md`

Also mirrored in `architecture/decisions/` for engineering convenience — `knowledge/` is the canonical long-term store.

**Numbering:** Sequential ADR-001, ADR-002, ...

**Required ADRs before Phase 0 (PRD §23.3):**
1. Local web application runtime model (ADR-ARCH-001 — already written)
2. Prisma + SQLite WAL configuration
3. Money and currency representation
4. Time and timezone handling
5. RBAC model
6. Sync protocol evolution path
7. Backup file format and versioning

**When to write:** Before any significant architectural choice. When deviating from DEVELOPMENT_STANDARDS.

---

### 4.6 UI Research

**Purpose:** Collect reference material and findings for Arabic RTL ERP interface design.

**Contents:**
- Screenshots and notes from reference apps (Linear, Notion, Stripe, JetBrains, Arabic SaaS)
- RTL layout patterns that work / fail
- Arabic typography findings (Rubik weights, line heights, numeral preferences)
- Data table density benchmarks
- Keyboard shortcut patterns in business software
- Accessibility findings for Arabic interfaces

**Subfolders:**
- `rtl-patterns/` — layout, mirroring, logical properties
- `erp-reference-apps/` — per-app notes
- `arabic-typography/` — font, sizing, numerals

**Entry format:** `knowledge/ui-research/[subfolder]/YYYY-MM-[topic].md`

**When to write:** During design system creation, before new complex screens, when RTL issues are found.

---

### 4.7 Future Ideas

**Purpose:** Park ideas that are out of scope for v1.0 but worth preserving — prevents re-discussion and captures stakeholder wishes.

**Contents:**
- Feature ideas with problem statement
- Parent portal concepts
- AI insights ideas
- Multi-branch UI concepts
- Integration wishes (WhatsApp API, payment gateways)

**Entry format:** `knowledge/future-ideas/IDEA-[NNN]-[title].md`

**Template fields:**
- IDEA ID, Title, Date
- Submitted by
- Problem statement
- Proposed solution (brief)
- PRD §7.2 alignment (Future tag)
- Priority (when revisited)
- Dependencies

**When to write:** Anytime an idea arises that is explicitly out of v1.0 scope. During Idea stage if rejected/deferred.

---

### 4.8 Lessons Learned

**Purpose:** Capture what went well and poorly after tasks, phases, and releases — continuous improvement for agents and humans.

**Contents:**
- Retrospective notes per phase
- "We should have done X earlier"
- Common agent mistakes and corrections
- Workflow bottlenecks
- Documentation gaps discovered
- Test failures that revealed spec gaps

**Entry format:** `knowledge/lessons-learned/YYYY-MM-[topic].md`

**Template fields:**
- Date, Context (phase/task/release)
- What happened
- What we learned
- Action items (with owner)
- Foundation/docs updated? (Y/N)

**When to write:** End of every roadmap phase. After significant review rejections. After production incidents.

---

## 5. Entry Lifecycle

```
Discovery → Draft entry in knowledge/
         → Review by relevant agent (BA, Architect, PM)
         → If affects rules: propose BRS/ETBS update
         → If affects product: propose PRD update
         → If affects architecture: create ADR
         → Mark entry status: Incorporated / Deferred / Rejected
```

**Statuses:**

| Status | Meaning |
|---|---|
| `Draft` | Captured, not reviewed |
| `Reviewed` | Validated by domain agent |
| `Incorporated` | Reflected in BRS/ETBS/PRD/ADR |
| `Deferred` | Valid but not acting on now |
| `Rejected` | Decided not to act — reason recorded |
| `Superseded` | Replaced by newer entry — link provided |

---

## 6. Index and Discovery

### 6.1 Master Index

`knowledge/README.md` maintains:

- Table of all sections with counts
- Recently updated entries (last 10)
- Open discoveries awaiting incorporation
- Pending ADRs

### 6.2 Cross-Reference Tags

Use consistent tags in entry metadata for searchability:

```
Tags: #billing #attendance #cairo #private-tutor #competitor #rtl
Related: ETBS-001, BRS-BIL-003, ADR-003, MOD-ATTENDANCE
```

### 6.3 Agent Search Guidance

When an agent needs context on a topic:

1. Search `knowledge/` for tags and keywords
2. Check related ETBS/BRS entries linked from knowledge entries
3. Check ADRs for technical constraints
4. Check `lessons-learned/` for known pitfalls

---

## 7. Contribution Rules

| Rule | Detail |
|---|---|
| Who can write | Any agent or contributor |
| Who reviews | Domain owner agent (BA for business, Architect for ADR, Designer for UI) |
| Format | Markdown only, UTF-8, Arabic content welcome |
| Length | Prefer concise; link to attachments for long transcripts |
| Naming | Lowercase kebab-case filenames with date prefix where specified |
| Deletes | Never delete — mark Superseded with link to replacement |
| Secrets | No real phone numbers, student data, or credentials |

---

## 8. Relationship to Other Documentation

```
knowledge/          → Raw intelligence, research, decisions in progress
docs/               → Approved product documents (PRD, BRS, FS, ETBS)
specs/              → Implementation-ready module and functional specs
foundation/         → How we work (this operating system)
architecture/       → Engineering diagrams, HTTP API contracts (when codebase exists)
```

**Flow:** `knowledge/` informs → `docs/` and `specs/` decide → `foundation/` governs how we implement

---

## 9. Initial Population Plan

When the knowledge base is first created, seed with:

| Section | Initial Content |
|---|---|
| market-research | Segment profiles from ETBS §2 and PRD §6 personas |
| competitor-analysis | Placeholder README — populate as competitors identified |
| teacher-interviews | Empty — awaiting first interview |
| business-discoveries | PRD §23.1 reconciliation decisions |
| architecture-decisions | PRD §23.3 required ADRs (as Proposed) |
| ui-research | PRD §14 design inspirations and RTL rules |
| future-ideas | PRD §7.2 deferred features as IDEA entries |
| lessons-learned | Documentation consolidation notes from PRD v2.0 unification |

---

## 10. Quality Bar for Knowledge Entries

An entry is **useful** when another agent can read it and:

- Understand what was learned without reading the full source
- Know how confident to be in the finding
- Know what action it implies (or that no action is needed)
- Find related rules, scenarios, and decisions via links

An entry is **not useful** when it is vague ("tutors want better software"), unsourced, or duplicates an existing ETBS scenario without adding new insight.

---

*The knowledge base is the project's memory. A company that remembers learns faster than one that rediscovers.*
