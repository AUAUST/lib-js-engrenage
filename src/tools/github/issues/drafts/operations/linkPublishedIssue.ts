import { splitRepository } from "#tools/github/issues/api/index";
import { linkSubIssues } from "#tools/github/issues/drafts/operations/linkSubIssues";
import { findPublishedNumber } from "#tools/github/issues/drafts/utils/findPublishedNumber";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { resolveDraftNumber } from "#tools/github/issues/drafts/utils/resolveDraftNumber";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export async function linkPublishedIssue(
  publication: Publication,
  draft: PublishedDraft,
): Promise<void> {
  const { access, lookup, numbers } = publication;

  const { manifest, remote } = draft;

  const number = findPublishedNumber(draft, numbers);

  const route = { ...splitRepository(access.repository), issue_number: number };

  if (manifest.subIssues !== undefined) {
    const desired = listDraftReferences(manifest.subIssues).map((reference) => {
      return resolveDraftNumber(reference, numbers);
    });

    const current = (remote?.subIssues ?? [])
      .map((child) => child.number)
      .filter((child) => desired.includes(child));

    await linkSubIssues(access, lookup, number, current, desired);
  }

  if (manifest.blockedBy === undefined) {
    return;
  }

  const blocking = manifest.blockedBy.map((reference) => {
    return resolveDraftNumber(reference, numbers);
  });

  for (const { id, number: blocker } of remote?.blockedBy ?? []) {
    if (!blocking.includes(blocker)) {
      await access.client.request(
        "DELETE /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by/{issue_id}",
        { ...route, issue_id: id },
      );
    }
  }

  const blocked = new Set(
    (remote?.blockedBy ?? []).map((blocker) => {
      return blocker.number;
    }),
  );

  for (const blocker of blocking.filter((candidate) => {
    return !blocked.has(candidate);
  })) {
    const { id } = await lookup.find(blocker);

    await access.client.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by",
      { ...route, issue_id: id },
    );
  }
}
