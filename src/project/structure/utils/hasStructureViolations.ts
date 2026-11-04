import { values } from "@auaust/toolkit/object";

import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";

export function hasStructureViolations(structure: ResolvedStructure): boolean {
  return values(structure).some((environment) => {
    return (
      environment?.strictness === "strict" &&
      environment.unclassified.length > 0
    );
  });
}
