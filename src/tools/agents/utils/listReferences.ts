import { listBlockMarkers } from "#foundation/blocks/index";
import { markdownBlocks } from "#tools/agents/constants";

export function listReferences(content: string): readonly string[] {
  return listBlockMarkers(content, markdownBlocks)
    .filter(({ directive }) => directive === "reference")
    .map(({ args: [reference = ""] }) => reference);
}
