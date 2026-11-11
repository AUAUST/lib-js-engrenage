import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { IssueLocation } from "#tools/github/issues/contract/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveIssueLocation(
  reference: string,
  context: Pick<DraftsContext, "repository" | "registry">,
  numbers: ReadonlyMap<string, IssueLocation>,
): IssueLocation {
  const parsed = parseReference(reference);

  if (parsed === undefined) {
    throw new Error(`${reference} is not a reference`);
  }

  const { repository, stem } = resolveStem(parsed, context);

  const location = parsed.kind === "issue"
    ? { repository, number: parsed.number }
    : numbers.get(stem);

  if (location === undefined) {
    throw new Error(`${reference} has no issue number to publish`);
  }

  return location;
}
