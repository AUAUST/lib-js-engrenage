import {
  renderReference,
  replaceOutsideCode,
  type IssueLocation,
} from "#tools/github/issues/contract/index";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function renderDraftReferences(
  text: string,
  target: string,
  context: Pick<DraftsContext, "repository" | "registry">,
  numbers: ReadonlyMap<string, IssueLocation>,
): string {
  return replaceOutsideCode(
    text,
    /(?<![\w/&])#\d+\b|#\{[^{}\s]+\}/g,
    (match) => {
      return renderReference(
        resolveIssueLocation(match, context, numbers),
        target,
      );
    },
  );
}
