import { findShortName } from "#tools/github/issues/drafts/utils/findShortName";
import type { IssueLocation } from "#tools/github/issues/contract/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function toLocalStem(
  { repository, number }: IssueLocation,
  source: string,
  context: Pick<DraftsContext, "repository" | "registry">,
): string {
  const current = context.repository.toLowerCase();

  if (
    repository.toLowerCase() === current &&
    source.toLowerCase() === current
  ) {
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
