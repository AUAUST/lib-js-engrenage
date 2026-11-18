import {
  findRegisteredRepository,
  requireCurrentRepository,
} from "#tools/github/issues/api/index";
import type { DraftReference } from "#tools/github/issues/drafts/types/DraftReference";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveStem(
  reference: DraftReference,
  {
    repository: current,
    registry,
  }: Pick<DraftsContext, "repository" | "registry">,
): { readonly repository: string; readonly stem: string } {
  const target = reference.kind === "issue"
    ? String(reference.number)
    : reference.stem;

  const repository = reference.short === undefined
    ? requireCurrentRepository(current, target)
    : findRegisteredRepository(registry, reference.short);

  return {
    repository,
    stem: repository === current ? target : `${reference.short}.${target}`,
  };
}
