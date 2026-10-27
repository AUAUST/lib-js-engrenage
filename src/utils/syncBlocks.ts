import { keys } from "@auaust/toolkit/object";

import type { BlockFillers } from "#types/BlockFillers";
import type { BlockSyntax } from "#types/BlockSyntax";

export function syncBlocks(
  content: string,
  { open, close, padding }: BlockSyntax,
  fillers: BlockFillers,
): string {
  const marker = new RegExp(
    `^${RegExp.escape(open)}@(\\w+)((?: \\S+)*)${RegExp.escape(close)}$`,
    "gm",
  );

  const markers = [...content.matchAll(marker)];

  let result = "";
  let cursor = 0;
  let isBlockOpen = false;

  for (const [index, match] of markers.entries()) {
    const [line, directive = "", argumentList = ""] = match;

    if (directive === "end") {
      if (!isBlockOpen) {
        throw new Error(`"${line}" closes no block`);
      }

      isBlockOpen = false;

      continue;
    }

    const fill = fillers[directive];

    if (fill === undefined) {
      throw new Error(
        `Unknown directive in "${line}"; expected one of @${[...keys(fillers), "end"].join(", @")}`,
      );
    }

    const next = markers[index + 1];

    if (next === undefined) {
      throw new Error(`Missing "@end" marker after "${line}"`);
    }

    const filled = fill(...argumentList.split(" ").slice(1)).trim();

    if (filled.match(marker) !== null) {
      throw new Error(`Content of "${line}" contains a block marker`);
    }

    const blockStart = match.index + line.length;

    result += `${content.slice(cursor, blockStart)}${padding}${filled}${padding}`;

    cursor = next.index;
    isBlockOpen = true;
  }

  return result + content.slice(cursor);
}
