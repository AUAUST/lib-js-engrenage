import type { ImportEdge } from "#batiment/structure/types/ImportEdge";
import type { Directory } from "#types/Directory";

export function getTargetScope({
  resolved,
  target,
}: ImportEdge): Directory | undefined {
  return resolved?.kind === "scope" ? resolved.scope : target?.scope;
}
