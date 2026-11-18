import { resolveDraftRepository } from "#tools/github/issues/drafts/utils/resolveDraftRepository";
import type { DraftReference } from "#tools/github/issues/drafts/types/DraftReference";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveStem(
  reference: DraftReference,
  context: Pick<DraftsContext, "repository" | "registry">,
): { readonly repository: string; readonly stem: string } {
  const target = reference.kind === "issue"
    ? String(reference.number)
    : reference.stem;

  const repository = resolveDraftRepository(reference.short, target, context);

  return {
    repository,
    stem: repository === context.repository
      ? target
      : `${reference.short}.${target}`,
  };
}
