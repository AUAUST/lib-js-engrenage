import { parseInstruction } from "#metalbrain/instructions/operations/parseInstruction";
import { listInstructionMarkers } from "#metalbrain/instructions/utils/listInstructionMarkers";

export function removeReferenceBlock(
  content: string,
  reference: string,
): string | undefined {
  const markers = listInstructionMarkers(content).filter(({ directive }) => {
    return directive === "reference" || directive === "end";
  });

  const lines = content.split("\n");
  const dropped = new Set<number>();

  for (const [position, marker] of markers.entries()) {
    if (marker.directive !== "reference" || marker.args[0] !== reference) {
      continue;
    }

    const next = markers[position + 1];

    const last = next === undefined
      ? lines.length
      : next.directive === "end"
        ? next.line
        : next.line - 1;

    for (let line = marker.line; line <= last; line++) {
      dropped.add(line);
    }
  }

  const kept: string[] = [];

  let isTrimming = false;

  for (const [index, line] of lines.entries()) {
    if (dropped.has(index + 1)) {
      isTrimming = (kept.at(-1) ?? "").trim() === "";

      continue;
    }

    if (isTrimming && line.trim() === "") {
      continue;
    }

    isTrimming = false;

    kept.push(line);
  }

  const remaining = kept.join("\n");

  return parseInstruction(remaining, "").body.trim() === ""
    ? undefined
    : remaining;
}
