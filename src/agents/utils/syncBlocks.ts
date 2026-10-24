const openingMarker = /<!-- engrenage:([a-z]+\/[a-z0-9-]+) -->/g;

function closingMarkerFor(id: string): string {
  return `<!-- /engrenage:${id} -->`;
}

export function syncBlocks(
  content: string,
  readFragment: (id: string) => string,
): string {
  let result = "";
  let cursor = 0;

  for (const match of content.matchAll(openingMarker)) {
    const [opening, id] = match;

    if (id === undefined || match.index < cursor) {
      continue;
    }

    const blockStart = match.index + opening.length;

    const closing = closingMarkerFor(id);

    const blockEnd = content.indexOf(closing, blockStart);

    if (blockEnd === -1) {
      throw new Error(`Missing closing marker "${closing}" for "${opening}"`);
    }

    const fragment = readFragment(id).trim();

    result += `${content.slice(cursor, blockStart)}\n\n${fragment}\n\n`;

    cursor = blockEnd;
  }

  return result + content.slice(cursor);
}
