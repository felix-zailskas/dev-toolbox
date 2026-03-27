---
date: 2026-03-27T16:00:00
author: Claude
topic: "Phase 1: Project Scaffolding + Tauri Shell"
status: approved
---

# Phase 1: Project Scaffolding + Tauri Shell

## Overview

Set up the entire project foundation: Vite + React + TypeScript, Tailwind v4, shadcn/ui with Monokai theme, Tauri v2 native window, React Router, and the layout shell (sidebar + topbar). By the end, `tauri dev` opens a native macOS window with a working sidebar that navigates between placeholder pages.

## Prerequisites
- [x] Rust toolchain installed via rustup
- [ ] Node.js + npm available

## Changes Required

### 1. Scaffold Vite + Tauri project

**Step 1: Create the project**

```bash
npm create tauri-app@latest dev-toolbox -- --template react-ts
cd dev-toolbox
npm install
```

This generates both the Vite React app and the `src-tauri/` Rust scaffold in one shot.

**Step 2: Verify it works**

Run: `npm run tauri dev`
Expected: A native macOS window opens showing the default Vite React template with hot-reload.

**Step 3: Commit**

```
feat: scaffold Tauri v2 + Vite + React + TypeScript project
```

---

### 2. Configure Tauri window

**File:** `src-tauri/tauri.conf.json`

Update the window config:

```json
{
  "productName": "DevToolbox",
  "identifier": "com.devtoolbox.app",
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "DevToolbox",
        "width": 1280,
        "height": 800,
        "minWidth": 900,
        "minHeight": 600
      }
    ]
  }
}
```

**Step: Run `npm run tauri dev` and verify window title says "DevToolbox" with the right dimensions.**

**Commit:**
```
chore: configure Tauri window title and dimensions
```

---

### 3. Install shadcn/ui + Tailwind CSS v4

**Step 1: Initialize shadcn**

```bash
npx shadcn@latest init -t vite
```

This sets up:
- `@tailwindcss/vite` plugin in `vite.config.ts`
- `components.json` with path aliases
- `src/lib/utils.ts` (cn helper)
- Base CSS variables in `src/index.css`

**Step 2: Install required components**

```bash
npx shadcn@latest add button input textarea card tabs select checkbox slider table
```

**Step 3: Verify it works**

Run `npm run tauri dev`, drop a `<Button>` into `App.tsx`, confirm it renders styled in the native window.

**Step 4: Commit**

```
feat: add shadcn/ui with Tailwind CSS v4
```

---

### 4. Apply Monokai theme

**File:** `src/index.css`

Replace the generated CSS variables with the Monokai palette from the spec. Since this is dark-only, we set them on `:root` directly (no `.dark` class needed):

```css
@import "tailwindcss";

:root {
  --background: #272822;
  --foreground: #f8f8f2;
  --card: #2d2e27;
  --card-foreground: #f8f8f2;
  --primary: #A6E22E;
  --primary-foreground: #272822;
  --secondary: #AE81FF;
  --secondary-foreground: #f8f8f2;
  --muted: #333333;
  --muted-foreground: #878b91;
  --accent: #66D9EF;
  --accent-foreground: #272822;
  --destructive: #f92672;
  --destructive-foreground: #f8f8f2;
  --border: #3e3f37;
  --input: #3e3f37;
  --ring: #A6E22E;
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

**Step: Run `npm run tauri dev`, confirm the window has the dark Monokai background (#272822) and light text (#f8f8f2).**

**Commit:**
```
feat: apply Monokai color palette to shadcn theme
```

---

### 5. Install React Router + set up routing

**Step 1: Install**

```bash
npm install react-router
```

**Step 2: Create placeholder pages**

Create four minimal page components that just render their name:

**File:** `src/pages/Dashboard.tsx`
```typescript
export default function Dashboard() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Dashboard</h1></div>;
}
```

**File:** `src/pages/TextDiff.tsx`
```typescript
export default function TextDiff() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Text Diff</h1></div>;
}
```

**File:** `src/pages/JwtDecoder.tsx`
```typescript
export default function JwtDecoder() {
  return <div className="p-6"><h1 className="text-2xl font-bold">JWT Decoder</h1></div>;
}
```

**File:** `src/pages/DataGenerator.tsx`
```typescript
export default function DataGenerator() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Data Generator</h1></div>;
}
```

**Step 3: Set up router in App.tsx**

**File:** `src/App.tsx`
```typescript
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import TextDiff from "./pages/TextDiff";
import JwtDecoder from "./pages/JwtDecoder";
import DataGenerator from "./pages/DataGenerator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diff" element={<TextDiff />} />
          <Route path="/jwt" element={<JwtDecoder />} />
          <Route path="/generator" element={<DataGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Step 4: Run `npm run tauri dev`, navigate between pages — each shows its heading.**

**Commit:**
```
feat: add React Router with placeholder pages
```

---

### 6. Build layout shell (Sidebar + TopBar + AppLayout)

**File:** `src/components/layout/TopBar.tsx`
```typescript
export default function TopBar() {
  return (
    <header className="h-12 border-b border-border flex items-center px-4">
      <span className="text-sm font-semibold text-foreground">DevToolbox</span>
    </header>
  );
}
```

**File:** `src/components/layout/Sidebar.tsx`

Uses `NavLink` from React Router. Four links: Dashboard, Text Diff, JWT Decoder, Data Generator. Each with a Lucide icon. Active link gets `bg-muted` highlight.

```typescript
import { NavLink } from "react-router";
import { LayoutDashboard, FileDiff, KeyRound, Database } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/diff", label: "Text Diff", icon: FileDiff },
  { to: "/jwt", label: "JWT Decoder", icon: KeyRound },
  { to: "/generator", label: "Data Generator", icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-border flex flex-col gap-1 p-3">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
```

**File:** `src/components/layout/AppLayout.tsx`

Wraps TopBar + Sidebar + main content area using `<Outlet>`:

```typescript
import { Outlet } from "react-router";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**Step: Run `npm run tauri dev`. Native window shows TopBar with "DevToolbox", left sidebar with 4 links, clicking them navigates between placeholder pages. Active link is highlighted.**

**Commit:**
```
feat: add layout shell with sidebar navigation and topbar
```

---

## Success Criteria

### Automated Verification
- [ ] `npm run tauri dev` opens native macOS window
- [ ] TypeScript compiles without errors
- [ ] Vite builds without errors (`npm run build`)

### Manual Verification
- [ ] Window title is "DevToolbox", size ~1280x800
- [ ] Monokai dark background (#272822) with light text
- [ ] Sidebar shows 4 nav links with icons
- [ ] Clicking links navigates between pages, active link highlighted
- [ ] Hot-reload works (edit a placeholder page, see change instantly)

## Dependencies
- `react-router`
- `@tauri-apps/cli`, `@tauri-apps/api` (from scaffold)
- `@tailwindcss/vite` (from shadcn init)
- `lucide-react` (from shadcn init)
- shadcn components: button, input, textarea, card, tabs, select, checkbox, slider, table
