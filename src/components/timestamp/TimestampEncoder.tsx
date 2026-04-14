import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RotateCcw } from "lucide-react";
import { encodeTimestamp, validateField, nowFields, type DateFields } from "@/lib/timestamp";
import { useSessionState } from "@/hooks/useSessionState";

const FIELD_ORDER: (keyof DateFields)[] = ["year", "month", "day", "hour", "minute", "second", "millisecond"];

const FIELD_LABELS: Record<keyof DateFields, string> = {
  year: "Year",
  month: "Month",
  day: "Day",
  hour: "Hour",
  minute: "Minute",
  second: "Second",
  millisecond: "Ms",
};

type RawFields = Record<keyof DateFields, string>;

function fieldsToRaw(fields: DateFields): RawFields {
  return Object.fromEntries(
    FIELD_ORDER.map((key) => [key, String(fields[key])]),
  ) as RawFields;
}

export default function TimestampEncoder() {
  const [fields, setFields] = useSessionState<DateFields>("timestamp:encoder:fields", nowFields());
  const [rawFields, setRawFields] = useState<RawFields>(() => fieldsToRaw(fields));
  const [errors, setErrors] = useState<Partial<Record<keyof DateFields, string>>>({});

  const hasErrors = Object.keys(errors).length > 0;

  const result = useMemo(() => {
    if (hasErrors) return null;
    return encodeTimestamp(fields);
  }, [fields, hasErrors]);

  const handleFieldChange = (key: keyof DateFields, raw: string) => {
    // Allow empty or digits only (no leading zeros except for a single "0")
    if (raw !== "" && !/^\d+$/.test(raw)) return;
    setRawFields((prev) => ({ ...prev, [key]: raw }));
  };

  const handleFieldBlur = (key: keyof DateFields) => {
    const raw = rawFields[key];
    const value = raw === "" ? 0 : parseInt(raw, 10);
    if (isNaN(value)) return;
    // Normalize display (strip leading zeros)
    setRawFields((prev) => ({ ...prev, [key]: String(value) }));
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      // Validate on blur
      const err = validateField(key, value, next);
      setErrors((prevErr) => {
        const updated = { ...prevErr };
        if (err) updated[key] = err;
        else delete updated[key];
        return updated;
      });
      return next;
    });
  };

  const handleNow = () => {
    const now = nowFields();
    setFields(now);
    setRawFields(fieldsToRaw(now));
    setErrors({});
  };

  const handleCopy = (value: string) => navigator.clipboard.writeText(value);

  return (
    <div className="flex flex-col gap-4">
      {/* Date/time field inputs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Date & Time (Local)</span>
          <Button variant="secondary" size="sm" onClick={handleNow}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Now
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FIELD_ORDER.map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{FIELD_LABELS[key]}</label>
              <Input
                type="text"
                inputMode="numeric"
                value={rawFields[key]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                onBlur={() => handleFieldBlur(key)}
                className={`w-20 font-mono text-sm bg-card border-border ${key === "year" ? "w-24" : ""} ${errors[key] ? "border-destructive" : ""}`}
              />
              {errors[key] && (
                <span className="text-xs text-destructive">{errors[key]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      {result && (
        <div className="bg-card border border-border rounded-md p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground w-32">Seconds</span>
            <span className="text-sm font-mono text-foreground flex-1">{result.seconds}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(String(result.seconds))}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground w-32">Milliseconds</span>
            <span className="text-sm font-mono text-foreground flex-1">{result.milliseconds}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(String(result.milliseconds))}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground w-32">UTC</span>
            <span className="text-sm font-mono text-foreground flex-1">{result.utc}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(result.utc)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
