import { flatMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import type { StructureDiagnostic } from "#batiment/report/index";
import type { ResolvedStructure } from "#batiment/structure/types/ResolvedStructure";

export function listBlockingDiagnostics(
  structure: ResolvedStructure,
): StructureDiagnostic[] {
  return flatMap(values(structure), (environment) => {
    return (environment?.diagnostics ?? []).filter(({ blocking }) => {
      return blocking === true;
    });
  });
}
