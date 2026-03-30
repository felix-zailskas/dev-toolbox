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
