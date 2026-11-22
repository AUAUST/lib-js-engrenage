import { parseIssueList } from "#tools/github/issues/contract/utils/parseIssueList";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

const providesPattern = /^([^:\n]+?):\s*\S/;

export function parseProvides(parsed: ParsedIssueBody): readonly {
  readonly line: string;
  readonly heading: string | undefined;
}[] {
  const section = parsed.sections.find(({ name }) => name === "Provides");

  const items = section === undefined
    ? []
    : parseIssueList(section.content).items;

  return items.map((item) => {
    const [line = ""] = item.split("\n");

    return { line, heading: providesPattern.exec(line)?.[1]?.trim() };
  });
}
