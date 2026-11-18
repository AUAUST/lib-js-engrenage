import { splitSections } from "#foundation/markdown/index";
import type { BodySection } from "#tools/github/issues/drafts/types/BodySection";

export function splitBodySections(body: string): readonly BodySection[] {
  return splitSections(body.replaceAll("\r\n", "\n"), 2).map(
    ({ name, source }) => {
      return { name, lines: source.split("\n") };
    },
  );
}
