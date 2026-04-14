import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/ui/copy-button";
import { decodeTimestamp, isMilliseconds } from "@/lib/timestamp";
import { useSessionState } from "@/hooks/useSessionState";

function OutputRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-mono text-foreground flex-1 break-all">{value}</span>
      <CopyButton value={value} />
    </div>
  );
}

export default function TimestampDecoder() {
  const [input, setInput] = useSessionState("timestamp:decoder:input", "");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return decodeTimestamp(input);
  }, [input]);

  const isError = result !== null && "error" in result;
  const isValid = result !== null && !isError;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Unix Timestamp</span>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 1713100200 or 1713100200000"
          className="font-mono text-sm bg-card border-border"
        />
        {input.trim() && !isError && (
          <span className="text-xs text-muted-foreground">
            Detected: {isMilliseconds(input.trim()) ? "milliseconds" : "seconds"}
          </span>
        )}
      </div>

      {isError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {result.error}
        </div>
      )}

      {!input.trim() && (
        <p className="text-sm text-muted-foreground">Enter a timestamp above to decode.</p>
      )}

      {isValid && (
        <>
          <div className="bg-card border border-border rounded-md p-4">
            <OutputRow label="ISO 8601" value={result.iso8601} />
            <OutputRow label="RFC 2822" value={result.rfc2822} />
            <OutputRow label="Relative" value={result.relative} />
            <OutputRow label="Local Time" value={result.local} />
            <OutputRow label="UTC" value={result.utc} />
          </div>
          <div className="bg-card border border-border rounded-md p-4">
            <span className="text-sm font-medium text-foreground">Local Fields</span>
            <div className="flex gap-4 flex-wrap mt-2">
              {(["year", "month", "day", "hour", "minute", "second", "millisecond"] as const).map((key) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground capitalize">{key === "millisecond" ? "Ms" : key}</span>
                  <span className="text-sm font-mono text-foreground">{result.fields[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
