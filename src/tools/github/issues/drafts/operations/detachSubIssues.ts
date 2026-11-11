import { splitRepository } from "#tools/github/issues/api/index";
import { findPublishedNumber } from "#tools/github/issues/drafts/utils/findPublishedNumber";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { resolveDraftNumber } from "#tools/github/issues/drafts/utils/resolveDraftNumber";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export async function detachSubIssues(
  publication: Publication,
  draft: PublishedDraft,
): Promise<void> {
  const { access, numbers } = publication;

  const { manifest, remote } = draft;

  if (manifest.subIssues === undefined) {
    return;
  }

  const desired = new Set(
    listDraftReferences(manifest.subIssues).map((reference) => {
      return resolveDraftNumber(reference, numbers);
    }),
  );

  for (const { id, number } of remote?.subIssues ?? []) {
    if (!desired.has(number)) {
      await access.client.request(
        "DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue",
        {
          ...splitRepository(access.repository),
          issue_number: findPublishedNumber(draft, numbers),
          sub_issue_id: id,
        },
      );
    }
  }
}
