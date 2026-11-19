import { listBlockMarkers } from "#foundation/blocks/index";
import { listCodeRanges } from "#foundation/markdown/index";
import { markdownBlocks } from "#tools/agents/constants";

/**
 * The block markers of an instruction file, in order, leaving out those inside
 * code, which show markers rather than open blocks.
 */
export function listInstructionMarkers(content: string) {
  const code = listCodeRanges(content);

  return listBlockMarkers(content, markdownBlocks).filter(({ index }) => {
    return !code.some(({ start, end }) => {
      return index >= start && index < end;
    });
  });
}
