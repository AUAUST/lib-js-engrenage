import type { RoadmapEntry } from "#tools/github/issues/drafts/types/RoadmapEntry";

// @debt GitHub suffixes the anchor of a repeated heading with `-<k>`, which links to a repeated plan heading miss
function toAnchor(heading: string) {
  return heading
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
    .replaceAll(" ", "-");
}

function renderSection(section: string, headings: ReadonlySet<string>) {
  return headings.has(section)
    ? `[${section}](#${toAnchor(section)})`
    : section;
}

export function renderRoadmap(
  entries: readonly RoadmapEntry[],
  headings: readonly string[],
  members: ReadonlyMap<string, readonly string[]>,
): string {
  const linked = new Set(headings);

  return entries
    .flatMap(({ ref, gist, sections }, index) => {
      const marker = `${index + 1}. `;

      const sectionList = sections
        .map((section) => renderSection(section, linked))
        .join(", ");

      const line = `${marker}${ref}: ${gist}${sectionList === "" ? "" : ` · ${sectionList}`}`;

      return [
        line,
        ...(members.get(ref) ?? []).map((member) => {
          return `${" ".repeat(marker.length)}- ${member}`;
        }),
      ];
    })
    .join("\n");
}
