import { formatBlockMarker } from "#foundation/blocks/index";
import { markdownBlocks } from "#metalbrain/instructions/constants";

/**
 * The `<!-- @reference <reference> -->` marker line of a reference block.
 */
export function formatReferenceMarker(reference: string): string {
  return formatBlockMarker(markdownBlocks, "reference", [reference]);
}
