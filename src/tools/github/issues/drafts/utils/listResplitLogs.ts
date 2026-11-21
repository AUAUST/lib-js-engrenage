import {
  isSameIssue,
  renderReference,
  type IssueLocation,
} from "#tools/github/issues/contract/index";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { Resplit } from "#tools/github/issues/drafts/types/Resplit";
import type { ResplitLog } from "#tools/github/issues/drafts/types/ResplitLog";

export function listResplitLogs(
  resplits: readonly Resplit[],
  context: DraftsContext,
  numbers: ReadonlyMap<string, IssueLocation>,
  date: string,
): readonly ResplitLog[] {
  const plans: { plan: IssueLocation; reasons: Map<string, string[]> }[] = [];

  for (const { draft, plan, reason } of resplits) {
    const location = resolveIssueLocation(plan, context, numbers);

    let entry = plans.find((known) => isSameIssue(known.plan, location));

    if (entry === undefined) {
      entry = { plan: location, reasons: new Map() };

      plans.push(entry);
    }

    const text = reason.trim().replaceAll(/\s+/g, " ");

    const references = entry.reasons.get(text) ?? [];

    references.push(
      renderReference(
        findPublishedLocation(draft, context, numbers),
        location.repository,
      ),
    );

    entry.reasons.set(text, references);
  }

  return plans.map(({ plan, reasons }) => {
    return {
      plan,
      lines: [...reasons].map(([reason, references]) => {
        return `- ${date} · ${references.join(", ")}: ${reason}`;
      }),
    };
  });
}
