---
date: 2026-03-27T16:00:00
author: Claude
topic: "Phase 3: Text Diff Tool"
status: approved
---

# Phase 3: Text Diff Tool

## Overview

Build the full text diff tool: two side-by-side text areas with live word/character counts, a "Run Comparison" button that computes a line-based diff with inline word-level highlighting, and a "Reset" button. Uses the `diff` npm package.

## Prerequisites
- [ ] Phase 2 completed
- [ ] Install `diff` package: `npm install diff && npm install -D @types/diff`

## Changes Required

### 1. Diff computation library wrapper

**File:** `src/lib/diff.ts`

Wraps the `diff` package to provide two functions:
- `computeLineDiff(a, b)` — returns an array of line-level changes (added/removed/unchanged)
- `computeWordDiff(a, b)` — returns word-level changes within a single line pair

```typescript
import { diffLines, diffWords, type Change } from "diff";

export interface LineDiff {
  type: "added" | "removed" | "unchanged";
  value: string;
  lineNumber: { left?: number; right?: number };
}

export interface WordDiff {
  type: "added" | "removed" | "unchanged";
  value: string;
}

export function computeLineDiff(a: string, b: string): LineDiff[] {
  const changes = diffLines(a, b);
  const result: LineDiff[] = [];
  let leftLine = 1;
  let rightLine = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    for (const line of lines) {
      if (change.added) {
        result.push({ type: "added", value: line, lineNumber: { right: rightLine++ } });
      } else if (change.removed) {
        result.push({ type: "removed", value: line, lineNumber: { left: leftLine++ } });
      } else {
        result.push({ type: "unchanged", value: line, lineNumber: { left: leftLine++, right: rightLine++ } });
      }
    }
  }

  return result;
}

export function computeWordDiff(a: string, b: string): WordDiff[] {
  return diffWords(a, b).map((change: Change) => ({
    type: change.added ? "added" : change.removed ? "removed" : "unchanged",
    value: change.value,
  }));
}
```

**Step: This is a pure utility — no visual test yet. Verified in subsequent steps.**

---

### 2. DiffEditor component (single text area with counters)

**File:** `src/components/diff/DiffEditor.tsx`

A labeled textarea with live word count, character count, and a copy button.

```typescript
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface DiffEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function DiffEditor({ label, value, onChange }: DiffEditorProps) {
  const charCount = value.length;
  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  const handleCopy = () => navigator.clipboard.writeText(value);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {wordCount} words · {charCount} chars
          </span>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paste ${label.toLowerCase()} here...`}
        className="min-h-[200px] font-mono text-sm bg-card border-border resize-y"
      />
    </div>
  );
}
```

---

### 3. DiffViewer component (unified diff result display)

**File:** `src/components/diff/DiffViewer.tsx`

Renders the diff result as a unified view with line numbers, line-level coloring (green/red), and inline word-level highlighting within changed lines. Pairs adjacent removed+added lines to compute word-level diffs between them.

```typescript
import { type LineDiff, computeWordDiff, type WordDiff } from "@/lib/diff";

interface DiffViewerProps {
  diffs: LineDiff[];
}

function WordHighlight({ words, type }: { words: WordDiff[]; type: "added" | "removed" }) {
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className={
            word.type === type
              ? type === "added"
                ? "bg-primary/30 rounded px-0.5"
                : "bg-destructive/30 rounded px-0.5"
              : ""
          }
        >
          {word.value}
        </span>
      ))}
    </>
  );
}

export default function DiffViewer({ diffs }: DiffViewerProps) {
  if (diffs.length === 0) return null;

  // Pair adjacent removed+added lines for word-level diffing
  const rows: React.ReactNode[] = [];
  let i = 0;

  while (i < diffs.length) {
    const current = diffs[i];

    if (
      current.type === "removed" &&
      i + 1 < diffs.length &&
      diffs[i + 1].type === "added"
    ) {
      const next = diffs[i + 1];
      const wordDiffs = computeWordDiff(current.value, next.value);

      rows.push(
        <DiffLine key={`r-${i}`} type="removed" lineNumber={current.lineNumber.left}>
          <WordHighlight words={wordDiffs} type="removed" />
        </DiffLine>
      );
      rows.push(
        <DiffLine key={`a-${i}`} type="added" lineNumber={next.lineNumber.right}>
          <WordHighlight words={wordDiffs} type="added" />
        </DiffLine>
      );
      i += 2;
    } else {
      rows.push(
        <DiffLine
          key={`l-${i}`}
          type={current.type}
          lineNumber={current.lineNumber.left ?? current.lineNumber.right}
        >
          {current.value}
        </DiffLine>
      );
      i++;
    }
  }

  return (
    <div className="border border-border rounded-md overflow-auto font-mono text-sm">
      {rows}
    </div>
  );
}

function DiffLine({
  type,
  lineNumber,
  children,
}: {
  type: "added" | "removed" | "unchanged";
  lineNumber?: number;
  children: React.ReactNode;
}) {
  const bgClass =
    type === "added"
      ? "bg-primary/10"
      : type === "removed"
        ? "bg-destructive/10"
        : "";

  const prefix = type === "added" ? "+" : type === "removed" ? "-" : " ";

  return (
    <div className={`flex ${bgClass}`}>
      <span className="w-12 text-right pr-3 text-muted-foreground select-none shrink-0 py-0.5">
        {lineNumber}
      </span>
      <span className="w-4 text-center text-muted-foreground select-none shrink-0 py-0.5">
        {prefix}
      </span>
      <span className="flex-1 whitespace-pre-wrap break-all py-0.5 pr-4">{children}</span>
    </div>
  );
}
```

---

### 4. TextDiff page (ties it all together)

**File:** `src/pages/TextDiff.tsx`

Two side-by-side DiffEditors, "Run Comparison" and "Reset" buttons, DiffViewer below.

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DiffEditor from "@/components/diff/DiffEditor";
import DiffViewer from "@/components/diff/DiffViewer";
import { computeLineDiff, type LineDiff } from "@/lib/diff";

export default function TextDiff() {
  const [sourceA, setSourceA] = useState("");
  const [sourceB, setSourceB] = useState("");
  const [diffs, setDiffs] = useState<LineDiff[]>([]);

  const handleCompare = () => {
    setDiffs(computeLineDiff(sourceA, sourceB));
  };

  const handleReset = () => {
    setSourceA("");
    setSourceB("");
    setDiffs([]);
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Text Diff</h1>
        <div className="flex gap-2">
          <Button onClick={handleCompare}>Run Comparison</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
        </div>
      </div>
      <div className="flex gap-4">
        <DiffEditor label="Source A" value={sourceA} onChange={setSourceA} />
        <DiffEditor label="Source B" value={sourceB} onChange={setSourceB} />
      </div>
      <DiffViewer diffs={diffs} />
    </div>
  );
}
```

**Step: Run `npm run tauri dev`. Navigate to Text Diff. Paste text in both areas, see live word/char counts. Click "Run Comparison" — see unified diff with green/red lines and word-level highlighting. Click "Reset" — everything clears.**

**Commit:**
```
feat: add text diff tool with word-level highlighting
```

---

## Success Criteria

### Automated Verification
- [ ] TypeScript compiles without errors
- [ ] Vite builds without errors

### Manual Verification
- [ ] Word and character counts update live as user types/pastes
- [ ] "Run Comparison" produces a unified diff below the editors
- [ ] Added lines highlighted green, removed lines highlighted red
- [ ] Within changed lines, specific changed words are highlighted inline
- [ ] Copy button copies the source text area content
- [ ] "Reset" clears both text areas and diff results
- [ ] Empty inputs produce no diff output

## Dependencies
- `diff` + `@types/diff`
