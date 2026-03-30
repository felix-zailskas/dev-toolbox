import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface JwtInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

const PART_COLORS = [
  "#f92672",  // header — pink
  "#AE81FF",  // payload — purple
  "#66D9EF",  // signature — blue
];

function colorize(text: string): string {
  if (!text) return "";
  const parts = text.split(".");
  return parts
    .map((part, i) => {
      const color = PART_COLORS[i] ?? "inherit";
      return `<span style="color:${color}">${escapeHtml(part)}</span>`;
    })
    .join('<span style="color:#75715E">.</span>');
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function JwtInput({ value, onChange, onClear }: JwtInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    // Get plain text from contentEditable
    const text = el.innerText.replace(/\n/g, "");
    onChange(text);
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").replace(/\n/g, "").trim();
    document.execCommand("insertText", false, text);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Token</span>
        <Button variant="ghost" size="icon" onClick={onClear} className="h-6 w-6">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value ? colorize(value) : "" }}
        data-placeholder="Paste JWT here..."
        className="min-h-[100px] max-h-[200px] overflow-auto p-3 font-mono text-sm bg-card border border-border rounded-md break-all outline-none focus:ring-1 focus:ring-ring empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        spellCheck={false}
      />
    </div>
  );
}
