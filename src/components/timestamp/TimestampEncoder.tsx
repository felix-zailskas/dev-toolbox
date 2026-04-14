import { useMemo } from "react";
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

export default function TimestampEncoder() {
  const [fields, setFields] = useSessionState<DateFields>("timestamp:encoder:fields", nowFields());

  const errors = useMemo(() => {
    const errs: Partial<Record<keyof DateFields, string>> = {};
    for (const key of FIELD_ORDER) {
      const err = validateField(key, fields[key], fields);
      if (err) errs[key] = err;
    }
    return errs;
  }, [fields]);

  const hasErrors = Object.keys(errors).length > 0;

  const result = useMemo(() => {
    if (hasErrors) return null;
    return encodeTimestamp(fields);
  }, [fields, hasErrors]);

  const handleFieldChange = (key: keyof DateFields, raw: string) => {
    const value = raw === "" ? 0 : parseInt(raw, 10);
    if (isNaN(value)) return;
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleNow = () => setFields(nowFields());

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
                type="number"
                value={fields[key]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
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
