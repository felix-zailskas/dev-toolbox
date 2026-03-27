---
date: 2026-03-27T15:00:00
author: Claude
topic: "DevToolbox - Local Developer Utility Suite"
tags: [specification, devtoolbox, react, typescript, shadcn]
status: approved
---

# Specification: DevToolbox

## Overview

A local-first developer utility web application running on macOS. It provides three client-side tools: a Text Diff viewer with word/char counting, a JWT Decoder, and a fake Data Generator. All processing happens in the browser - no backend, no data leaves the machine.

The UI follows a Monokai color palette and uses shadcn/ui components for a clean, minimal interface.

## Goals

- Provide a fast, local text diff tool with line-based + inline word-level highlighting
- Decode JWTs with header/payload display and optional signature verification
- Generate fake data (single record form or bulk list) for development/testing
- Clean, uncluttered UI that stays out of the way

## Non-Goals (Out of Scope)

- No backend or API server
- No user accounts, authentication, or cloud sync
- No history/persistence across sessions
- No additional tool categories beyond the initial three
- No light theme (dark only, Monokai)
- No mobile-first design (desktop tool, responsive is nice-to-have)

## Requirements

### Functional Requirements

#### 1. Shared Layout
- **Description**: Fixed left sidebar with navigation links (Dashboard, Text Diff, JWT Decoder, Data Generator). Simple top bar with app name "DevToolbox". Client-side routing between pages.
- **Acceptance Criteria**: Clicking sidebar links navigates between tools. Active page is visually indicated. Layout is consistent across all pages.

#### 2. Dashboard
- **Description**: Simple landing page with cards linking to each of the 3 tools. Each card has the tool name, a one-line description, and a launch button. No decorative elements, stats, logs, or category filters.
- **Acceptance Criteria**: Three tool cards displayed. Clicking a card navigates to that tool.

#### 3. Text Diff Tool
- **Description**: Two side-by-side text areas (Source A, Source B) for pasting text. Each shows live word count and character count. A "Run Comparison" button computes the diff. Results display in a unified diff viewer below with line numbers, added/removed line highlighting, and inline word-level highlighting within changed lines. A "Reset" button clears both text areas and results.
- **Acceptance Criteria**:
  - Word and character counts update live as user types/pastes
  - Diff computation uses line-based algorithm with inline word highlighting
  - Added lines highlighted green, removed lines highlighted red
  - Within changed lines, specific changed words/characters are highlighted inline
  - Copy button per source text area
  - Reset clears everything

#### 4. JWT Decoder
- **Description**: A text area to paste a JWT. On input (live or via decode button), the token is split and base64url-decoded to show the Header and Payload as formatted JSON in separate read-only panels. A signature verification section lets the user enter a secret key and see whether the signature is valid. Shows token metadata (algorithm, expiration status).
- **Acceptance Criteria**:
  - Pasting a JWT decodes header and payload with syntax-highlighted JSON
  - Invalid tokens show a clear error state
  - Secret key input for HMAC signature verification (HS256/HS384/HS512)
  - Shows whether token is expired based on `exp` claim
  - Clear/delete button to reset

#### 5. Data Generator - Single Mode
- **Description**: A form view where each enabled field (UUID, First Name, Last Name, Email, IBAN) is rendered as an editable text input showing a generated value. Each field has a copy-to-clipboard button. A "Generate" button regenerates all fields at once. A locale selector controls the locale used for generation.
- **Acceptance Criteria**:
  - All 5 fields displayed as editable text inputs with generated values
  - Each field has a copy-to-clipboard button
  - "Generate" button regenerates all values
  - Fields are editable after generation for manual adjustments
  - Locale selector (en_US, de_DE, fr_FR, ja_JP) affects generated names/emails

#### 6. Data Generator - List Mode
- **Description**: Configure which fields to include via checkboxes, set a record count (1-1000), select locale, and generate a table of fake records. Table supports copy-all and export.
- **Acceptance Criteria**:
  - Field selection via checkboxes (UUID always included)
  - Record count slider/input (1-1000)
  - Generated data displayed in a table with pagination
  - Copy all data to clipboard (JSON)
  - Export as JSON or CSV
  - Locale selector affects output

#### 7. Data Generator - Mode Toggle
- **Description**: A toggle/tab to switch between Single and List mode on the Data Generator page.
- **Acceptance Criteria**: Toggle switches between form view and table view. Each mode retains its own state independently.

### Technical Requirements

- **Framework**: React 19 + Vite + TypeScript (strict mode)
- **UI Library**: shadcn/ui (with Tailwind CSS v4)
- **Routing**: React Router (client-side)
- **Diff Library**: `diff` npm package (supports line and word-level diffing)
- **Fake Data**: `@faker-js/faker` (supports locales, generates names/emails/IBANs)
- **JWT Decoding**: Manual base64url decode (no heavy library needed for decode-only; use Web Crypto API for HMAC verification)
- **Icons**: Lucide React (ships with shadcn/ui)
- **No backend**: Everything runs client-side
- **Build**: Vite dev server for local development

## Constraints

- macOS only target (local dev tool)
- Dark theme only (Monokai palette)
- No data persistence between sessions
- HMAC signature verification only (RSA/EC verification is complex client-side and out of scope)

## Design Decisions

### Decision 1: Monokai Color Palette mapped to shadcn CSS Variables

**Chosen Approach**: Map the user's terminal Monokai palette to shadcn's CSS variable system.

**Mapping**:
| shadcn variable | Monokai color | Hex |
|---|---|---|
| `--background` | background | `#272822` |
| `--foreground` | foreground | `#f8f8f2` |
| `--card` | slightly lighter bg | `#2d2e27` |
| `--card-foreground` | foreground | `#f8f8f2` |
| `--primary` | green (accent) | `#A6E22E` |
| `--primary-foreground` | dark bg | `#272822` |
| `--secondary` | purple | `#AE81FF` |
| `--secondary-foreground` | foreground | `#f8f8f2` |
| `--muted` | dark gray | `#333333` |
| `--muted-foreground` | mid gray | `#878b91` |
| `--accent` | cyan | `#66D9EF` |
| `--accent-foreground` | dark bg | `#272822` |
| `--destructive` | pink/red | `#f92672` |
| `--destructive-foreground` | foreground | `#f8f8f2` |
| `--border` | dark gray | `#3e3f37` |
| `--input` | dark gray | `#3e3f37` |
| `--ring` | green | `#A6E22E` |

**Rationale**: Keeps the distinctive Monokai look the user wants while working within shadcn's theming system.

### Decision 2: Client-side JWT handling only

**Chosen Approach**: Decode JWT by manually splitting on `.` and base64url-decoding. Use Web Crypto API for HMAC signature verification.

**Rationale**: No need for a JWT library. Decode is trivial (split + atob). Verification uses the browser's native crypto. RSA/EC verification excluded to keep scope small.

**Trade-offs**: Can't verify RSA/EC signed tokens. Acceptable for a dev utility - most use cases are inspecting tokens, not production verification.

### Decision 3: @faker-js/faker for data generation

**Chosen Approach**: Use faker-js with locale support.

**Rationale**: Battle-tested library, supports multiple locales, generates all required field types (names, emails, IBANs, UUIDs). Tree-shakeable.

### Decision 4: Clean minimal UI

**Chosen Approach**: Strip all decorative elements from the original mockups. No stat cards, no terminal log displays, no "join community" CTAs, no fake metrics. Each page focuses on its tool's core functionality only.

**Rationale**: User explicitly wants clean and modern. The mockups contained template decoration that adds visual noise without utility.

## Integration Points

- None. Fully self-contained client-side application.

## File Structure

```
dev-toolbox/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json          # shadcn config
├── src/
│   ├── main.tsx
│   ├── App.tsx              # Router setup
│   ├── index.css            # Tailwind + shadcn CSS variables (Monokai theme)
│   ├── components/
│   │   ├── ui/              # shadcn components (button, input, textarea, card, etc.)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── diff/
│   │   │   ├── DiffEditor.tsx       # Single source text area with counters
│   │   │   └── DiffViewer.tsx       # Unified diff result display
│   │   ├── jwt/
│   │   │   ├── JwtInput.tsx         # Token input textarea
│   │   │   ├── JwtSection.tsx       # Decoded header/payload display
│   │   │   └── SignatureVerify.tsx   # Secret key input + verify
│   │   └── data-generator/
│   │       ├── SingleMode.tsx       # Form view with editable fields
│   │       ├── ListMode.tsx         # Table view with bulk generation
│   │       └── FieldConfig.tsx      # Field checkboxes + locale selector
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── TextDiff.tsx
│   │   ├── JwtDecoder.tsx
│   │   └── DataGenerator.tsx
│   └── lib/
│       ├── diff.ts          # Diff computation wrapper
│       ├── jwt.ts           # JWT decode + verify helpers
│       └── faker.ts         # Faker wrapper with locale support
├── docs/
│   └── plans/
│       └── 2026_03_27_dev_toolbox/
│           └── specification.md
```

## Open Questions

None - all questions resolved.
