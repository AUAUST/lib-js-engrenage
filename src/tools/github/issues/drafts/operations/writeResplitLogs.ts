import { splitRepository } from "#tools/github/issues/api/index";
import { fetchIssue, isSameIssue } from "#tools/github/issues/contract/index";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { insertResplitLog } from "#tools/github/issues/drafts/utils/insertResplitLog";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { ResplitLog } from "#tools/github/issues/drafts/types/ResplitLog";

export async function writeResplitLogs(
  { drafts, context, client, numbers }: Publication,
  logs: readonly ResplitLog[],
): Promise<void> {
  const outside = logs.filter(({ plan }) => {
    return !drafts.some((draft) => {
      return isSameIssue(findPublishedLocation(draft, context, numbers), plan);
    });
  });

  for (const { plan, lines } of outside) {
    const { body } = await fetchIssue(
      {
        repository: plan.repository,
        client,
        contractNames: context.contractNames,
      },
      plan.number,
    );

    const known = new Set(body.split("\n"));

    if (lines.every((line) => known.has(line))) {
      continue;
    }

    await client.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
      ...splitRepository(plan.repository),
      issue_number: plan.number,
      body: insertResplitLog(body, body, lines),
    });
  }
}
