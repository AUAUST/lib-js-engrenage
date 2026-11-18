import { stringify } from "yaml";

import { formatBlockMarker } from "#foundation/blocks/index";
import { markdownBlocks } from "#tools/agents/constants";

export function createInstructionFile({
  frontmatter,
  reference,
  body,
}: {
  frontmatter?: Record<string, unknown> | undefined;
  reference: string;
  body: string;
}): string {
  const header = frontmatter === undefined
    ? ""
    : `---\n${stringify(frontmatter)}---\n\n`;

  return `${header}${formatBlockMarker(markdownBlocks, "reference", [reference])}\n\n${body.trim()}\n\n${formatBlockMarker(markdownBlocks, "end")}\n`;
}
