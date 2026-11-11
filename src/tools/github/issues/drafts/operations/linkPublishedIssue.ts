import { splitRepository } from "#tools/github/issues/api/index";
import { linkSubIssues } from "#tools/github/issues/drafts/operations/linkSubIssues";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { isSameIssue } from "#tools/github/issues/drafts/utils/isSameIssue";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export async function linkPublishedIssue(
  { context, lookup, numbers }: Publication,
  draft: PublishedDraft,
): Promise<void> {
  const { manifest, remote, access } = draft;

  const { number } = findPublishedLocation(draft, context, numbers);

  const route = { ...splitRepository(access.repository), issue_number: number };

  if (manifest.subIssues !== undefined) {
    const desired = listDraftReferences(manifest.subIssues).map((reference) => {
      return resolveIssueLocation(reference, context, numbers);
    });

    const current = (remote?.subIssues ?? []).filter((child) => {
      return desired.some((location) => isSameIssue(location, child));
    });

    await linkSubIssues(access, lookup, number, current, desired);
  }

  if (manifest.blockedBy === undefined) {
    return;
  }

  const blocking = manifest.blockedBy.map((reference) => {
    return resolveIssueLocation(reference, context, numbers);
  });

  for (const blocker of remote?.blockedBy ?? []) {
    if (!blocking.some((location) => isSameIssue(location, blocker))) {
      await access.client.request(
        "DELETE /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by/{issue_id}",
        { ...route, issue_id: blocker.id },
      );
    }
  }

  for (const blocker of blocking.filter((location) => {
    return !(remote?.blockedBy ?? []).some((entry) => {
      return isSameIssue(entry, location);
    });
  })) {
    const { id } = await lookup.find(blocker);

    await access.client.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by",
      { ...route, issue_id: id },
    );
  }
}
