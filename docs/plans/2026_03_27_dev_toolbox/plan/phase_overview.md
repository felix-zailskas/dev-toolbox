---
date: 2026-03-27T16:00:00
author: Claude
topic: "DevToolbox Implementation Plan - Phase Overview"
status: approved
---

# DevToolbox - Phase Overview

## Based On
- Specification: `docs/plans/2026_03_27_dev_toolbox/specification.md`

## Phases

| Phase | Name | Dependencies | Status |
|-------|------|-------------|--------|
| 1 | Project Scaffolding + Tauri Shell | None | Pending |
| 2 | Dashboard | Phase 1 | Pending |
| 3 | Text Diff Tool | Phase 2 | Pending |
| 4 | JWT Decoder | Phase 3 | Pending |
| 5 | Data Generator | Phase 4 | Pending |

## Phase Summaries

### Phase 1: Project Scaffolding + Tauri Shell
- Scaffold Vite + React + TypeScript via `create-tauri-app`
- Configure Tauri window (title, dimensions)
- Install shadcn/ui + Tailwind CSS v4
- Apply Monokai color palette
- Install React Router with placeholder pages
- Build layout shell (Sidebar + TopBar + AppLayout)

### Phase 2: Dashboard
- Replace placeholder with 3 tool cards (Text Diff, JWT Decoder, Data Generator)
- Each card navigates to its tool page

### Phase 3: Text Diff Tool
- `src/lib/diff.ts` — wrapper around `diff` npm package
- `DiffEditor` component — textarea with live word/char counts + copy
- `DiffViewer` component — unified diff with line numbers + word-level highlighting
- `TextDiff` page — ties editors + viewer together with Run/Reset buttons

### Phase 4: JWT Decoder
- `src/lib/jwt.ts` — base64url decode, token parsing, HMAC verification via Web Crypto API
- `JwtInput` component — token textarea with clear button
- `JwtSection` component — syntax-highlighted JSON display (Monokai colors)
- `SignatureVerify` component — secret key input + HMAC verify
- `JwtDecoder` page — ties all components together with metadata display

### Phase 5: Data Generator
- `src/lib/faker.ts` — faker-js wrapper with locale support (en_US, en_GB, de_DE, nl_NL, fr_FR)
- `SingleMode` component — form with 5 editable fields + copy buttons
- `ListMode` component — field checkboxes, count input, table with pagination, JSON/CSV export
- `DataGenerator` page — tab toggle between modes + shared locale selector

## Dependencies (all phases)
- `react-router`
- `diff` + `@types/diff`
- `@faker-js/faker`
- `@tauri-apps/cli`, `@tauri-apps/api` (from scaffold)
- `@tailwindcss/vite` (from shadcn init)
- `lucide-react` (from shadcn init)
- shadcn components: button, input, textarea, card, tabs, select, checkbox, slider, table

## Execution
Each phase is sequential. Use `/phased-implementation:implement` to execute.
