import { toDraftBody } from "#tools/github/issues/drafts/utils/toDraftBody";
import type { IssueContract } from "#tools/github/issues/contract/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

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
  source: string,
  context: Pick<DraftsContext, "repository" | "registry">,
  contract: IssueContract | undefined,
): string | undefined {
  const fetched = toDraftBody(base, source, context, contract);

  const published = toDraftBody(remote, source, context, contract);

  if (local === fetched || local === published) {
    return published;
  }

  return published === fetched ? local : undefined;
}
