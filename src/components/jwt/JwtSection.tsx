interface JwtSectionProps {
  label: string;
  data: Record<string, unknown> | null;
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span style="color:var(--syntax-key)">${match}</span>`;
        }
        return `<span style="color:var(--syntax-string)">${match}</span>`;
      }
      return `<span style="color:var(--syntax-number)">${match}</span>`;
    }
  );
}

export default function JwtSection({ label, data }: JwtSectionProps) {
  const formatted = data ? JSON.stringify(data, null, 2) : "";
  const highlighted = data ? syntaxHighlight(formatted) : "";

  return (
    <div className="flex flex-col gap-2 flex-1">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <pre
        className="bg-card border border-border rounded-md p-4 font-mono text-sm overflow-auto min-h-[80px]"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
