import { stringify } from "yaml";

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
