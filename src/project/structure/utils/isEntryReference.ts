import { entryRoleName } from "#project/roles/constants";
import type { ImportEdge } from "#project/structure/types/ImportEdge";

export function isEntryReference({
  importer,
  target,
  resolved,
}: ImportEdge): boolean {
  return (
    resolved?.kind === "alias" &&
    importer?.environment === "src" &&
    importer.role !== entryRoleName &&
    target !== undefined &&
    target.kind !== "role" &&
    target.role === entryRoleName &&
    target.public &&
    importer.domain !== target.domain
  );
}
