import { listBlockMarkers } from "#foundation/blocks/index";
import { listCodeRanges } from "#foundation/markdown/index";
import { markdownBlocks } from "#tools/agents/constants";

/**
 * The block markers of an instruction file with one of `directives`, in order,
 * leaving out those inside code, which show markers rather than open blocks.
 */
export function listInstructionMarkers(
  content: string,
  directives: readonly string[],
) {
  const code = listCodeRanges(content);

  return listBlockMarkers(content, markdownBlocks).filter(
    ({ directive, index }) => {
      return (
        directives.includes(directive) &&
        !code.some(({ start, end }) => {
          return index >= start && index < end;
        })
      );
    },
  );
}
