import { toDraftBody } from "#tools/github/issues/drafts/utils/toDraftBody";
import type { IssueContract } from "#tools/github/issues/contract/index";

export function mergeDraftBody(
  {
    base,
    remote,
    local,
  }: {
    readonly base: string;
    readonly remote: string;
    readonly local: string;
  },
  repository: string,
  contract: IssueContract | undefined,
): string | undefined {
  const fetched = toDraftBody(base, repository, contract);

  const published = toDraftBody(remote, repository, contract);

  if (local === fetched || local === published) {
    return published;
  }

  return published === fetched ? local : undefined;
}
