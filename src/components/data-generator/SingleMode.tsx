import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
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
            <CopyButton value={values[field]} size="icon" className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
