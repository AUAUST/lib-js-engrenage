import type { BlockSyntax } from "#types/BlockSyntax";

export function syncBlocks(
  content: string,
  { open, close, padding }: BlockSyntax,
  fill: (reference: string) => string,
): string {
  const marker = new RegExp(
    `^${RegExp.escape(open)}@(?:reference (\\S+)|end)${RegExp.escape(close)}$`,
    "gm",
  );

  const markers = [...content.matchAll(marker)];

  let result = "";
  let cursor = 0;

  for (const [index, match] of markers.entries()) {
    const [opening, reference] = match;

    if (reference === undefined) {
      continue;
    }

    const next = markers[index + 1];

    if (next === undefined) {
      throw new Error(`Missing "@end" marker after "${opening}"`);
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
