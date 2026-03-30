import { diffLines, diffWords, type Change } from "diff";

export interface LineDiff {
  type: "added" | "removed" | "unchanged";
  value: string;
  lineNumber: { left?: number; right?: number };
}

export interface WordDiff {
  type: "added" | "removed" | "unchanged";
  value: string;
}

export function computeLineDiff(a: string, b: string): LineDiff[] {
  const changes = diffLines(a, b);
  const result: LineDiff[] = [];
  let leftLine = 1;
  let rightLine = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    for (const line of lines) {
      if (change.added) {
        result.push({ type: "added", value: line, lineNumber: { right: rightLine++ } });
      } else if (change.removed) {
        result.push({ type: "removed", value: line, lineNumber: { left: leftLine++ } });
      } else {
        result.push({ type: "unchanged", value: line, lineNumber: { left: leftLine++, right: rightLine++ } });
      }
    }
  }

  return result;
}

export function computeWordDiff(a: string, b: string): WordDiff[] {
  return diffWords(a, b).map((change: Change) => ({
    type: change.added ? "added" : change.removed ? "removed" : "unchanged",
    value: change.value,
  }));
}
