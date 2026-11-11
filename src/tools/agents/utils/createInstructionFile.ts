import { stringify } from "yaml";

// @debt writes the fragment body unrendered: a fragment holding filler directives nests their markers inside its `@reference` block, which the next sync rejects; creators lack the loaded config the fillers need
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

  return `${header}<!-- @reference ${reference} -->\n\n${body.trim()}\n\n<!-- @end -->\n`;
}
