---
date: 2026-03-27T16:00:00
author: Claude
topic: "Phase 5: Data Generator"
status: approved
---

# Phase 5: Data Generator

## Overview

Build the data generator with two modes: Single (form with editable fields) and List (bulk table with export). A tab toggle switches between modes. Uses `@faker-js/faker` with locale support.

## Prerequisites
- [ ] Phase 4 completed
- [ ] Install faker: `npm install @faker-js/faker`

## Changes Required

### 1. Faker utility wrapper

**File:** `src/lib/faker.ts`

Wraps faker-js with locale switching. Exposes a `generateRecord` function and the supported field types.

```typescript
import { Faker, en, en_GB, de, nl, fr } from "@faker-js/faker";

export const LOCALES = {
  en_US: { label: "English (US)", locale: en },
  en_GB: { label: "English (UK)", locale: en_GB },
  de_DE: { label: "German", locale: de },
  nl_NL: { label: "Dutch", locale: nl },
  fr_FR: { label: "French", locale: fr },
} as const;

export type LocaleKey = keyof typeof LOCALES;

export const FIELDS = ["uuid", "firstName", "lastName", "email", "iban"] as const;
export type FieldKey = (typeof FIELDS)[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
  uuid: "UUID",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  iban: "IBAN",
};

function createFaker(locale: LocaleKey): Faker {
  return new Faker({ locale: [LOCALES[locale].locale, en] });
}

export function generateRecord(
  locale: LocaleKey,
  fields: FieldKey[] = [...FIELDS]
): Record<FieldKey, string> {
  const faker = createFaker(locale);
  const record = {} as Record<FieldKey, string>;

  for (const field of fields) {
    switch (field) {
      case "uuid":
        record.uuid = faker.string.uuid();
        break;
      case "firstName":
        record.firstName = faker.person.firstName();
        break;
      case "lastName":
        record.lastName = faker.person.lastName();
        break;
      case "email":
        record.email = faker.internet.email();
        break;
      case "iban":
        record.iban = faker.finance.iban();
        break;
    }
  }

  return record;
}

export function generateRecords(
  locale: LocaleKey,
  fields: FieldKey[],
  count: number
): Record<FieldKey, string>[] {
  return Array.from({ length: count }, () => generateRecord(locale, fields));
}
```

---

### 2. SingleMode component

**File:** `src/components/data-generator/SingleMode.tsx`

Form view: all 5 fields as editable text inputs with copy buttons. "Generate" button regenerates all values. Locale selector.

```typescript
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  generateRecord,
  FIELDS,
  FIELD_LABELS,
  type FieldKey,
  type LocaleKey,
} from "@/lib/faker";

interface SingleModeProps {
  locale: LocaleKey;
}

export default function SingleMode({ locale }: SingleModeProps) {
  const [values, setValues] = useState<Record<FieldKey, string>>(() =>
    generateRecord(locale)
  );

  const handleGenerate = () => setValues(generateRecord(locale));

  const handleChange = (field: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopy = (value: string) => navigator.clipboard.writeText(value);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={handleGenerate}>Generate</Button>
      </div>
      <div className="flex flex-col gap-3">
        {FIELDS.map((field) => (
          <div key={field} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-24 shrink-0">
              {FIELD_LABELS[field]}
            </span>
            <Input
              value={values[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="font-mono text-sm bg-card border-border flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(values[field])}
              className="h-8 w-8 shrink-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 3. ListMode component

**File:** `src/components/data-generator/ListMode.tsx`

Field selection checkboxes (UUID always included), record count input (1-1000), generate button, results table with pagination, copy-all (JSON) and export (JSON/CSV) buttons.

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Download } from "lucide-react";
import {
  generateRecords,
  FIELDS,
  FIELD_LABELS,
  type FieldKey,
  type LocaleKey,
} from "@/lib/faker";

interface ListModeProps {
  locale: LocaleKey;
}

const PAGE_SIZE = 25;

export default function ListMode({ locale }: ListModeProps) {
  const [selectedFields, setSelectedFields] = useState<FieldKey[]>([...FIELDS]);
  const [count, setCount] = useState(10);
  const [records, setRecords] = useState<Record<FieldKey, string>[]>([]);
  const [page, setPage] = useState(0);

  const toggleField = (field: FieldKey) => {
    if (field === "uuid") return; // always included
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleGenerate = () => {
    const clamped = Math.max(1, Math.min(1000, count));
    setCount(clamped);
    setRecords(generateRecords(locale, selectedFields, clamped));
    setPage(0);
  };

  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const pageRecords = records.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(records, null, 2));
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    downloadBlob(blob, "data.json");
  };

  const handleExportCsv = () => {
    const headers = selectedFields.map((f) => FIELD_LABELS[f]).join(",");
    const rows = records.map((r) =>
      selectedFields.map((f) => `"${r[f]?.replace(/"/g, '""') ?? ""}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "data.csv");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Config row */}
      <div className="flex items-end gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          {FIELDS.map((field) => (
            <label key={field} className="flex items-center gap-1.5 text-sm">
              <Checkbox
                checked={selectedFields.includes(field)}
                onCheckedChange={() => toggleField(field)}
                disabled={field === "uuid"}
              />
              {FIELD_LABELS[field]}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Count:</span>
          <Input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 bg-card border-border text-sm"
          />
        </div>
        <Button onClick={handleGenerate}>Generate</Button>
      </div>

      {/* Results */}
      {records.length > 0 && (
        <>
          {/* Export buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyAll}>
              <Copy className="h-3 w-3 mr-1" /> Copy JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Download className="h-3 w-3 mr-1" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </div>

          {/* Table */}
          <div className="border border-border rounded-md overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  {selectedFields.map((field) => (
                    <TableHead key={field}>{FIELD_LABELS[field]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRecords.map((record, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">
                      {page * PAGE_SIZE + i + 1}
                    </TableCell>
                    {selectedFields.map((field) => (
                      <TableCell key={field} className="font-mono text-sm">
                        {record[field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {page + 1} of {totalPages} ({records.length} records)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

### 4. DataGenerator page (mode toggle + locale selector)

**File:** `src/pages/DataGenerator.tsx`

Tabs for Single/List mode, shared locale selector at the top. Each mode retains its own state independently.

```typescript
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SingleMode from "@/components/data-generator/SingleMode";
import ListMode from "@/components/data-generator/ListMode";
import { LOCALES, type LocaleKey } from "@/lib/faker";

export default function DataGenerator() {
  const [locale, setLocale] = useState<LocaleKey>("en_US");

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Generator</h1>
        <Select value={locale} onValueChange={(v) => setLocale(v as LocaleKey)}>
          <SelectTrigger className="w-44 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LOCALES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <SingleMode locale={locale} />
        </TabsContent>
        <TabsContent value="list">
          <ListMode locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Step: Run `npm run tauri dev`. Navigate to Data Generator. Single mode shows 5 editable fields with copy buttons. Switch to List mode, configure fields/count, generate table. Switch locale — regenerating produces localized data. Export JSON/CSV works.**

**Commit:**
```
feat: add data generator with single and list modes
```

---

## Success Criteria

### Automated Verification
- [ ] TypeScript compiles without errors
- [ ] Vite builds without errors

### Manual Verification

**Single Mode:**
- [ ] All 5 fields displayed as editable text inputs with generated values
- [ ] Each field has a working copy-to-clipboard button
- [ ] "Generate" button regenerates all values
- [ ] Fields are editable after generation
- [ ] Locale selector (en_US, en_GB, de_DE, nl_NL, fr_FR) affects generated names/emails

**List Mode:**
- [ ] Field selection via checkboxes (UUID always checked, disabled)
- [ ] Record count input (1-1000) works
- [ ] Generated data displayed in a table with pagination (25 per page)
- [ ] Copy JSON button copies all records
- [ ] Export JSON downloads `data.json`
- [ ] Export CSV downloads `data.csv`
- [ ] Locale selector affects output

**Mode Toggle:**
- [ ] Tabs switch between Single and List mode
- [ ] Each mode retains its own state when switching back and forth

## Dependencies
- `@faker-js/faker`
