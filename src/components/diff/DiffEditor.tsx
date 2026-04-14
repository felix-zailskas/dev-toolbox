import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/components/ui/copy-button";

interface DiffEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function DiffEditor({ label, value, onChange }: DiffEditorProps) {
  const charCount = value.length;
  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {wordCount} words · {charCount} chars
          </span>
          <CopyButton value={value} size="icon" className="h-6 w-6" />
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
