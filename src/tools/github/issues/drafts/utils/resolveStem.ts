import { findRegisteredRepository } from "#tools/github/issues/api/index";
import type { DraftReference } from "#tools/github/issues/drafts/types/DraftReference";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveStem(
  reference: DraftReference,
  {
    repository: current,
    registry,
  }: Pick<DraftsContext, "repository" | "registry">,
): { readonly repository: string; readonly stem: string } {
  const repository = reference.short === undefined
    ? current
    : findRegisteredRepository(registry, reference.short);

  const target = reference.kind === "issue"
    ? String(reference.number)
    : reference.stem;

  return {
    repository,
    stem: repository === current ? target : `${reference.short}.${target}`,
  };
}
