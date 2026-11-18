import { keys } from "@auaust/toolkit/object";

import type { BlockFillers } from "#types/BlockFillers";
import type { BlockSyntax } from "#types/BlockSyntax";

export async function syncBlocks(
  content: string,
  { open, close, padding }: BlockSyntax,
  fillers: BlockFillers,
  {
    markers: mode = "keep",
    known = new Set(),
  }: { markers?: "keep" | "drop"; known?: ReadonlySet<string> } = {},
): Promise<string> {
  const marker = new RegExp(
    String.raw`^${RegExp.escape(open)}@([\w-]+)((?: \S+)*)${RegExp.escape(close)}$`,
    "gm",
  );

  const markers = [...content.matchAll(marker)];

  let result = "";
  let cursor = 0;
  let isBlockOpen = false;

  for (const [index, match] of markers.entries()) {
    const [line, directive = "", argumentList = ""] = match;

    const at = `line ${content.slice(0, match.index).split("\n").length}: `;

    if (directive === "end") {
      if (!isBlockOpen) {
        throw new Error(`${at}"${line}" closes no block`);
      }

      isBlockOpen = false;

      if (mode === "drop") {
        cursor = match.index + line.length;
      }

      continue;
    }

    if (known.has(directive)) {
      continue;
    }

    const fill = fillers[directive];

    if (fill === undefined) {
      throw new Error(
        `${at}Unknown directive in "${line}"; expected one of @${[...keys(fillers), "end"].join(", @")}`,
      );
    }

    const next = markers[index + 1];

    if (next === undefined || (mode === "drop" && next[1] !== "end")) {
      throw new Error(`${at}Missing "@end" marker after "${line}"`);
    }

    let returned: string | undefined;

    try {
      returned = await fill(...argumentList.split(" ").slice(1));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(`${at}${message}`, { cause: error });
    }

    const blockStart = match.index + line.length;

    const filled = returned?.trim();

    isBlockOpen = true;

    if (filled === undefined) {
      if (mode === "drop") {
        result += `${content.slice(cursor, match.index)}${content.slice(blockStart, next.index).trim()}`;

        cursor = next.index;
      }

      continue;
    }

    if (filled.match(marker) !== null) {
      throw new Error(`${at}Content of "${line}" contains a block marker`);
    }

    result += mode === "drop"
      ? `${content.slice(cursor, match.index)}${filled}`
      : `${content.slice(cursor, blockStart)}${padding}${filled}${padding}`;

    cursor = next.index;
  }

  return result + content.slice(cursor);
}
