import { type LineDiff, computeWordDiff, type WordDiff } from "@/lib/diff";
import { CircleMinus, CirclePlus } from "lucide-react";

interface DiffViewerProps {
  diffs: LineDiff[];
}

interface PanelLine {
  type: "added" | "removed" | "unchanged";
  lineNumber?: number;
  content: React.ReactNode;
}

function WordHighlight({ words, side }: { words: WordDiff[]; side: "left" | "right" }) {
  // Left panel shows unchanged + removed words, right panel shows unchanged + added words
  const showType = side === "left" ? "removed" : "added";
  const hideType = side === "left" ? "added" : "removed";
  const highlightClass =
    side === "left"
      ? "bg-destructive/30 rounded px-0.5"
      : "bg-primary/30 rounded px-0.5";

  return (
    <>
      {words.map((word, i) =>
        word.type === hideType ? null : (
          <span key={i} className={word.type === showType ? highlightClass : ""}>
            {word.value}
          </span>
        )
      )}
    </>
  );
}

function buildPanels(diffs: LineDiff[]): { left: PanelLine[]; right: PanelLine[] } {
  const left: PanelLine[] = [];
  const right: PanelLine[] = [];
  let i = 0;

  while (i < diffs.length) {
    const current = diffs[i];

    if (
      current.type === "removed" &&
      i + 1 < diffs.length &&
      diffs[i + 1].type === "added"
    ) {
      const next = diffs[i + 1];
      const wordDiffs = computeWordDiff(current.value, next.value);

      left.push({
        type: "removed",
        lineNumber: current.lineNumber.left,
        content: <WordHighlight words={wordDiffs} side="left" />,
      });
      right.push({
        type: "added",
        lineNumber: next.lineNumber.right,
        content: <WordHighlight words={wordDiffs} side="right" />,
      });
      i += 2;
    } else if (current.type === "removed") {
      left.push({
        type: "removed",
        lineNumber: current.lineNumber.left,
        content: current.value,
      });
      i++;
    } else if (current.type === "added") {
      right.push({
        type: "added",
        lineNumber: current.lineNumber.right,
        content: current.value,
      });
      i++;
    } else {
      left.push({
        type: "unchanged",
        lineNumber: current.lineNumber.left,
        content: current.value,
      });
      right.push({
        type: "unchanged",
        lineNumber: current.lineNumber.right,
        content: current.value,
      });
      i++;
    }
  }

  return { left, right };
}

function Panel({
  lines,
  side,
  count,
}: {
  lines: PanelLine[];
  side: "removals" | "additions";
  count: number;
}) {
  const isRemovals = side === "removals";

  return (
    <div className="flex-1 border border-border rounded-md overflow-auto">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        {isRemovals ? (
          <CircleMinus className="h-4 w-4 text-destructive" />
        ) : (
          <CirclePlus className="h-4 w-4 text-primary" />
        )}
        <span className={`text-sm font-medium ${isRemovals ? "text-destructive" : "text-primary"}`}>
          {count} {side}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {lines.length} lines
        </span>
      </div>
      <div className="font-mono text-sm">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={
              line.type === "removed"
                ? "bg-destructive/10"
                : line.type === "added"
                  ? "bg-primary/10"
                  : ""
            }
          >
            <div className="flex">
              <span className="w-8 text-right pr-3 text-muted-foreground select-none shrink-0 py-0.5">
                {line.lineNumber}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-all py-0.5 pr-4">
                {line.content}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiffViewer({ diffs }: DiffViewerProps) {
  if (diffs.length === 0) return null;

  const { left, right } = buildPanels(diffs);
  const removalCount = diffs.filter((d) => d.type === "removed").length;
  const additionCount = diffs.filter((d) => d.type === "added").length;

  return (
    <div className="flex gap-4">
      <Panel lines={left} side="removals" count={removalCount} />
      <Panel lines={right} side="additions" count={additionCount} />
    </div>
  );
}
