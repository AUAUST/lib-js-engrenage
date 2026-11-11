import { findShortName } from "#tools/github/issues/drafts/utils/findShortName";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { IssueLocation } from "#tools/github/issues/drafts/types/IssueLocation";

export function toLocalStem(
  { repository, number }: IssueLocation,
  context: Pick<DraftsContext, "repository" | "registry">,
): string {
  if (repository.toLowerCase() === context.repository.toLowerCase()) {
    return String(number);
  }

  const short = findShortName(repository, context);

  if (short === undefined) {
    throw new Error(
      `${repository}#${number} is in a repository that is not registered: add it to \`github.repositories\``,
    );
  }

  return `${short}.${number}`;
}
