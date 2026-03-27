---
date: 2026-03-27T16:00:00
author: Claude
topic: "Phase 2: Dashboard"
status: approved
---

# Phase 2: Dashboard

## Overview

Build the landing page with 3 tool cards. Each card has the tool name, a one-line description, and a button that navigates to that tool. Uses shadcn `Card` components. Minimal — no decoration.

## Prerequisites
- [ ] Phase 1 completed

## Changes Required

### 1. Dashboard page

**File:** `src/pages/Dashboard.tsx`

Replace the placeholder with tool cards:

```typescript
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDiff, KeyRound, Database } from "lucide-react";

const tools = [
  {
    to: "/diff",
    title: "Text Diff",
    description: "Compare two texts with line-based and word-level highlighting.",
    icon: FileDiff,
  },
  {
    to: "/jwt",
    title: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens with signature verification.",
    icon: KeyRound,
  },
  {
    to: "/generator",
    title: "Data Generator",
    description: "Generate fake data records for development and testing.",
    icon: Database,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map(({ to, title, description, icon: Icon }) => (
          <Card key={to} className="bg-card border-border">
            <CardHeader>
              <Icon className="h-6 w-6 text-accent mb-2" />
              <CardTitle className="text-foreground">{title}</CardTitle>
              <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate(to)} variant="secondary" className="w-full">
                Open
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Step: Run `npm run tauri dev`. Dashboard shows 3 cards. Clicking "Open" navigates to the tool page.**

**Commit:**
```
feat: add dashboard with tool cards
```

## Success Criteria

### Automated Verification
- [ ] TypeScript compiles without errors
- [ ] Vite builds without errors

### Manual Verification
- [ ] Three cards displayed in a grid
- [ ] Each card has icon, title, description, and "Open" button
- [ ] Clicking "Open" navigates to the correct tool page
- [ ] Cards use Monokai card background (#2d2e27)
