import {
  findRegisteredRepository,
  requireCurrentRepository,
} from "#tools/github/issues/api/index";
import { backlogFallbackHint } from "#tools/github/issues/drafts/constants";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveDraftRepository(
  short: string | undefined,
  subject: string,
  { repository, registry }: Pick<DraftsContext, "repository" | "registry">,
): string {
  return short === undefined
    ? requireCurrentRepository(repository, subject, backlogFallbackHint)
    : findRegisteredRepository(registry, short, backlogFallbackHint);
}
