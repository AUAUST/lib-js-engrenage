import { listBlockMarkers } from "#foundation/blocks/index";
import { listCodeRanges } from "#foundation/markdown/index";
import { markdownBlocks } from "#tools/agents/constants";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";

export function removeReferenceBlock(
  content: string,
  reference: string,
): string | undefined {
  const code = listCodeRanges(content);

  const markers = listBlockMarkers(content, markdownBlocks).filter(
    ({ directive, index }) => {
      return (
        (directive === "reference" || directive === "end") &&
        !code.some(({ start, end }) => {
          return index >= start && index < end;
        })
      );
    },
  );

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

  const remaining = lines
    .filter((_, index) => {
      return !dropped.has(index + 1);
    })
    .join("\n");

  return parseInstruction(remaining, "").body.trim() === ""
    ? undefined
    : remaining;
}
