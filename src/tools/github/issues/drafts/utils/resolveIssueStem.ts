import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveIssueStem(
  reference: string,
  context: Pick<DraftsContext, "repository" | "registry">,
): string {
  const parsed = parseReference(reference);

  if (parsed === undefined) {
    throw new Error(`${reference} is not a reference`);
  }

  return resolveStem(parsed, context).stem;
}
