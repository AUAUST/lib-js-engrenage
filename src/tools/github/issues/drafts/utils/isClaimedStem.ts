import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";

export function isClaimedStem(stem: string): boolean {
  return parseStem(stem)?.kind === "issue";
}
