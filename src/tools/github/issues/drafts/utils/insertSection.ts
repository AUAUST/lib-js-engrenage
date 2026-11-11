import { max } from "@auaust/toolkit/math";

import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";

export function insertSection(
  body: string,
  name: string,
  content: string,
  order: readonly string[],
): string {
  const sections = [...splitBodySections(body)];

  const preceding = new Set(order.slice(0, order.indexOf(name)));

  const anchor = sections.findLastIndex((section) => {
    return section.name !== undefined && preceding.has(section.name);
  });

  const previous = sections[max(anchor, 0)];

  const separator = (
    previous !== undefined &&
    previous.lines.length > 0 &&
    previous.lines.at(-1) !== ""
  )
    ? [""]
    : [];

  sections.splice(max(anchor, 0) + 1, 0, {
    name,
    lines: [...separator, `## ${name}`, "", ...content.split("\n"), ""],
  });

  return sections
    .flatMap(({ lines }) => lines)
    .join("\n")
    .trim();
}
