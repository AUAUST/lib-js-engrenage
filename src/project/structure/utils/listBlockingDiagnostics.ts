import { flatMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureDiagnostic } from "#project/structure/types/StructureDiagnostic";

export function listBlockingDiagnostics(
  structure: ResolvedStructure,
): StructureDiagnostic[] {
  return flatMap(values(structure), (environment) => {
    return (environment?.diagnostics ?? []).filter(({ blocking }) => {
      return blocking === true;
    });
  });
}
