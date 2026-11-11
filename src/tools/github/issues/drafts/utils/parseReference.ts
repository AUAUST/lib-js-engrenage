import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import type { DraftReference } from "#tools/github/issues/drafts/types/DraftReference";

export function parseReference(text: string): DraftReference | undefined {
  const issue = /^#(\d+)$/.exec(text)?.[1];

  if (issue !== undefined) {
    return {
      kind: "issue",
      short: undefined,
      number: Number(issue),
    };
  }

  const inner = /^#\{([^{}\s]+)\}$/.exec(text)?.[1];

  const parsed = inner === undefined ? undefined : parseStem(inner);

  return parsed?.kind === "issue" && parsed.short === undefined
    ? undefined
    : parsed;
}
