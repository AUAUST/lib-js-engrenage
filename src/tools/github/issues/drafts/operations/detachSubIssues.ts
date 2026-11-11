import { splitRepository } from "#tools/github/issues/api/index";
import { isSameIssue } from "#tools/github/issues/contract/index";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export async function detachSubIssues(
  { context, numbers }: Publication,
  draft: PublishedDraft,
): Promise<void> {
  const { manifest, remote, access } = draft;

  if (manifest.subIssues === undefined) {
    return;
  }

  const desired = listDraftReferences(manifest.subIssues).map((reference) => {
    return resolveIssueLocation(reference, context, numbers);
  });

  for (const child of remote?.subIssues ?? []) {
    if (!desired.some((location) => isSameIssue(location, child))) {
      await access.client.request(
        "DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue",
        {
          ...splitRepository(access.repository),
          issue_number: findPublishedLocation(draft, context, numbers).number,
          sub_issue_id: child.id,
        },
      );
    }
  }
}
