import type { BlockSyntax } from "#types/BlockSyntax";

export function syncBlocks(
  content: string,
  { open, close, padding }: BlockSyntax,
  fill: (id: string) => string,
): string {
  const openingMarker = new RegExp(
    `${RegExp.escape(open)}engrenage:([\\w./-]+)${RegExp.escape(close)}`,
    "g",
  );

  let result = "";
  let cursor = 0;

  for (const match of content.matchAll(openingMarker)) {
    const [opening, id] = match;

    if (id === undefined || match.index < cursor) {
      continue;
    }

    const blockStart = match.index + opening.length;

    const closing = `${open}/engrenage:${id}${close}`;

    const blockEnd = content.indexOf(closing, blockStart);

    if (blockEnd === -1) {
      throw new Error(`Missing closing marker "${closing}" for "${opening}"`);
    }

    const filled = fill(id).trim();

    result += `${content.slice(cursor, blockStart)}${padding}${filled}${padding}`;

    cursor = blockEnd;
  }

  return result + content.slice(cursor);
}
