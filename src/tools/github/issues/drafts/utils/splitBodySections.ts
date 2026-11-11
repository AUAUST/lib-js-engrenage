import type { BodySection } from "#tools/github/issues/drafts/types/BodySection";

const fencePattern = /^\s*(```|~~~)/;
const sectionPattern = /^## (.+?)\s*$/;

// @debt a second fence-aware section splitter beside `parseIssueBody`'s, which trims the lines this one keeps
export function splitBodySections(body: string): readonly BodySection[] {
  const sections: {
    name: string | undefined;
    lines: string[];
  }[] = [{ name: undefined, lines: [] }];

  let fenced = false;

  for (const line of body.replaceAll("\r\n", "\n").split("\n")) {
    const opensFence = fencePattern.test(line);

    const name = fenced || opensFence
      ? undefined
      : sectionPattern.exec(line)?.[1];

    if (opensFence) {
      fenced = !fenced;
    }

    if (name === undefined) {
      sections.at(-1)?.lines.push(line);
    } else {
      sections.push({ name, lines: [line] });
    }
  }

  return sections;
}
