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
    if (field === "uuid") return;
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
