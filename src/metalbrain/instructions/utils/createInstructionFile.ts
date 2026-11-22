import { stringify } from "yaml";

import { endMarker } from "#metalbrain/instructions/constants";
import { formatReferenceMarker } from "#metalbrain/instructions/utils/formatReferenceMarker";

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
