import { stringify } from "yaml";

import { endMarker } from "#tools/agents/constants";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";

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

  return `${header}${formatReferenceMarker(reference)}\n\n${body.trim()}\n\n${endMarker}\n`;
}
