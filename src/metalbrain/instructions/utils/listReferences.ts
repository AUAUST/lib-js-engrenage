import { listBlockMarkers } from "#foundation/blocks/index";
import { markdownBlocks } from "#metalbrain/instructions/constants";

// @debt counts reference markers inside code, unlike listInstructionMarkers; syncBlocks fills those too, so one definition of an instruction's markers is missing
export function listReferences(content: string): readonly string[] {
  return listBlockMarkers(content, markdownBlocks)
    .filter(({ directive }) => directive === "reference")
    .map(({ args: [reference = ""] }) => reference);
}
