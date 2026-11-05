import { keys } from "@auaust/toolkit/object";

import type { BlockFillers } from "#types/BlockFillers";
import type { BlockSyntax } from "#types/BlockSyntax";

export function syncBlocks(
  content: string,
  { open, close, padding }: BlockSyntax,
  fillers: BlockFillers,
): string {
  const marker = new RegExp(
    String.raw`^${RegExp.escape(open)}@(\w+)((?: \S+)*)${RegExp.escape(close)}$`,
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

    // @debt Temporary: skips `@debt` comments, which fd4f415 (debug: lazy CLI subcommand loading) places on lines the marker regex reads as directives. Remove once that commit is reverted or the parser tells block markers from other comments.
    if (directive === "debt") {
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

    const filled = fill(...argumentList.split(" ").slice(1))?.trim();

    isBlockOpen = true;

    if (filled === undefined) {
      continue;
    }

    if (filled.match(marker) !== null) {
      throw new Error(`Content of "${line}" contains a block marker`);
    }

    const blockStart = match.index + line.length;

    result += `${content.slice(cursor, blockStart)}${padding}${filled}${padding}`;

    cursor = next.index;
  }

  return result + content.slice(cursor);
}
