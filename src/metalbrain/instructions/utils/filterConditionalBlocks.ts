import { listInstructionMarkers } from "#metalbrain/instructions/utils/listInstructionMarkers";
import type { FragmentConditions } from "#metalbrain/instructions/types/FragmentConditions";

type Marker = ReturnType<typeof listInstructionMarkers>[number];

const listItem = /^\s*(?:[-*+]|\d+\.)\s/u;

// @debt the formatter's blank lines around a marker are undone by guessing from the neighboring lines, since the filter does not parse the Markdown it edits
function dropLines(
  lines: readonly string[],
  first: number,
  last: number,
  dropped: Set<number>,
) {
  for (let line = first; line <= last; line++) {
    dropped.add(line);
  }

  if (lines[first - 1] !== "" || lines[last + 1] !== "") {
    return;
  }

  dropped.add(last + 1);

  if (
    listItem.test(lines[first - 2] ?? "") &&
    listItem.test(lines[last + 2] ?? "")
  ) {
    dropped.add(first - 1);
  }
}

function isConditional({ directive }: Marker) {
  return directive === "extension" || directive === "file";
}

function findEnd(markers: readonly Marker[], open: number, name: string) {
  let depth = 0;

  for (let position = open + 1; position < markers.length; position++) {
    const marker = markers[position];

    if (marker === undefined) {
      break;
    }

    if (isConditional(marker)) {
      throw new Error(`${name} nests another conditional block`);
    }

    if (marker.directive !== "end") {
      depth++;
    } else if (depth === 0) {
      return marker;
    } else {
      depth--;
    }
  }

  throw new Error(`${name} has no <!-- @end -->`);
}

/**
 * Keeps the `@extension` and `@file` blocks of a fragment whose condition holds,
 * without their marker lines, and drops the others whole.
 */
export async function filterConditionalBlocks(
  body: string,
  conditions: FragmentConditions,
): Promise<string> {
  const markers = listInstructionMarkers(body);

  const lines = body.split("\n");
  const dropped = new Set<number>();

  for (const [position, marker] of markers.entries()) {
    if (!isConditional(marker)) {
      continue;
    }

    const [argument] = marker.args;

    if (argument === undefined || marker.args.length !== 1) {
      throw new Error(`Expected one argument for @${marker.directive}`);
    }

    const end = findEnd(markers, position, `@${marker.directive} ${argument}`);

    const kept = marker.directive === "extension"
      ? conditions.extensions.has(argument)
      : await conditions.exists(argument);

    const first = marker.line - 1;
    const last = end.line - 1;

    if (kept) {
      dropLines(lines, first, first, dropped);
      dropLines(lines, last, last, dropped);
    } else {
      dropLines(lines, first, last, dropped);
    }
  }

  return lines.filter((_, line) => !dropped.has(line)).join("\n");
}
