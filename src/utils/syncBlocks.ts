import { map } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import type { BlockFillers } from "#types/BlockFillers";
import type { BlockSyntax } from "#types/BlockSyntax";

export function syncBlocks(
  content: string,
  { open, close, padding }: BlockSyntax,
  fillers: BlockFillers,
): string {
  const directives = map(keys(fillers), (directive) => {
    return RegExp.escape(directive);
  });

  const marker = new RegExp(
    `^${RegExp.escape(open)}@(?:(${directives.join("|")}) (\\S+)|end)${RegExp.escape(close)}$`,
    "gm",
  );

  const markers = [...content.matchAll(marker)];

  let result = "";
  let cursor = 0;

  for (const [index, match] of markers.entries()) {
    const [opening, directive, reference] = match;

    if (directive === undefined || reference === undefined) {
      continue;
    }

    const next = markers[index + 1];

    if (next === undefined) {
      throw new Error(`Missing "@end" marker after "${opening}"`);
    }

    const fill = fillers[directive];

    if (fill === undefined) {
      throw new Error(`No filler for "@${directive}" markers`);
    }

    const filled = fill(reference).trim();

    if (filled.match(marker) !== null) {
      throw new Error(`Content of "${reference}" contains a block marker`);
    }

    const blockStart = match.index + opening.length;

    result += `${content.slice(cursor, blockStart)}${padding}${filled}${padding}`;

    cursor = next.index;
  }

  return result + content.slice(cursor);
}
