import { freeze } from "@auaust/toolkit/object";

import type { CardinalityViolation } from "#project/structure/types/CardinalityViolation";
import type { NamedFileRole } from "#project/structure/types/NamedFileRole";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { File } from "#types/File";

export function getStructureCardinality(
  assigned: readonly (readonly [File, string | undefined])[],
  owned: readonly NamedFileRole[],
): Pick<StructureNode, "cardinality"> {
  const filesByRole = new Map<string, File[]>();

  for (const [file, role] of assigned) {
    if (role !== undefined) {
      filesByRole.set(role, [...(filesByRole.get(role) ?? []), file]);
    }
  }

  const violations = owned.flatMap(
    ({ name, contract, globs }): CardinalityViolation[] => {
      const files = filesByRole.get(name) ?? [];

      if (contract.unique && files.length > 1) {
        return [
          freeze({
            role: name,
            reason: "unique",
            files: freeze(files),
            globs,
          }),
        ];
      }

      if (contract.required && files.length === 0) {
        return [
          freeze({
            role: name,
            reason: "required",
            files: freeze([]),
            globs,
          }),
        ];
      }

      return [];
    },
  );

  return violations.length === 0 ? {} : { cardinality: freeze(violations) };
}
