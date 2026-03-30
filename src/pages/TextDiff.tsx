import { useState } from "react";
import { Button } from "@/components/ui/button";
import DiffEditor from "@/components/diff/DiffEditor";
import DiffViewer from "@/components/diff/DiffViewer";
import { computeLineDiff, type LineDiff } from "@/lib/diff";
import { useSessionState } from "@/hooks/useSessionState";

export default function TextDiff() {
  const [sourceA, setSourceA] = useSessionState("diff:sourceA", "");
  const [sourceB, setSourceB] = useSessionState("diff:sourceB", "");
  const [diffs, setDiffs] = useState<LineDiff[]>([]);

  const handleCompare = () => {
    setDiffs(computeLineDiff(sourceA, sourceB));
  };

  const handleReset = () => {
    setSourceA("");
    setSourceB("");
    setDiffs([]);
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Text Diff</h1>
        <div className="flex gap-2">
          <Button onClick={handleCompare}>Run Comparison</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
        </div>
      </div>
      <DiffViewer diffs={diffs} />
      <div className="flex gap-4">
        <DiffEditor label="Original text" value={sourceA} onChange={setSourceA} />
        <DiffEditor label="Changed text" value={sourceB} onChange={setSourceB} />
      </div>
    </div>
  );
}
