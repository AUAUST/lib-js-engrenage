import { entryRoleName } from "#batiment/roles/constants";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";

export function isEntryReference(
  { importer, target, resolved }: ImportEdge,
  entries: readonly string[],
): boolean {
  return (
    resolved?.kind === "alias" &&
    importer?.environment !== undefined &&
    entries.includes(importer.environment) &&
    importer.role !== entryRoleName &&
    target !== undefined &&
    target.kind !== "role" &&
    target.role === entryRoleName &&
    target.public &&
    importer.domain !== target.domain
  );
}
