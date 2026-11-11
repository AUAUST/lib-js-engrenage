import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { IssueLocation } from "#tools/github/issues/drafts/types/IssueLocation";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export function findPublishedLocation(
  { stem }: PublishedDraft,
  context: DraftsContext,
  numbers: ReadonlyMap<string, IssueLocation>,
): IssueLocation {
  return resolveIssueLocation(toDraftReference(stem), context, numbers);
}
