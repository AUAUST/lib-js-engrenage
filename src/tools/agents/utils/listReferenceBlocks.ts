import { listBlockMarkers } from "#foundation/blocks/index";
import { listCodeRanges } from "#foundation/markdown/index";
import { markdownBlocks } from "#tools/agents/constants";

/**
 * The `@reference` blocks of an instruction file with an argument, in order, each
 * with the text from its marker line to the next marker, leaving out markers
 * inside code, which show markers rather than open blocks.
 */
export function listReferenceBlocks(
  content: string,
): readonly { reference: string; body: string }[] {
  const code = listCodeRanges(content);

  const markers = listBlockMarkers(content, markdownBlocks).filter(
    ({ index }) => {
      return !code.some(({ start, end }) => {
        return index >= start && index < end;
      });
    },
  );

  const blocks: { reference: string; body: string }[] = [];

  for (const [position, { directive, args, index }] of markers.entries()) {
    const [reference] = args;

    if (directive !== "reference" || reference === undefined) {
      continue;
    }

    const lineEnd = content.indexOf("\n", index);
    const start = lineEnd === -1 ? content.length : lineEnd + 1;
    const end = markers[position + 1]?.index ?? content.length;

    blocks.push({ reference, body: content.slice(start, end) });
  }

  return blocks;
}
