import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
}

export default function CopyButton({ value, className, size = "icon-xs" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <Button variant="ghost" size={size} onClick={handleCopy} className={cn("shrink-0", className)}>
      {copied ? (
        <Check className="h-3 w-3 text-primary" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}
