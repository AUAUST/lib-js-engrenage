import { isClaimedStem } from "#tools/github/issues/drafts/utils/isClaimedStem";
import { resolveDraftNumber } from "#tools/github/issues/drafts/utils/resolveDraftNumber";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export function findPublishedNumber(
  { stem }: PublishedDraft,
  numbers: ReadonlyMap<string, number>,
): number {
  return isClaimedStem(stem)
    ? Number(stem)
    : resolveDraftNumber(`#{${stem}}`, numbers);
}
