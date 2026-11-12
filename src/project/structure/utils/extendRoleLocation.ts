import { freeze } from "@auaust/toolkit/object";

import type { RoleLocation } from "#project/roles/index";
import type { StructureNode } from "#project/structure/types/StructureNode";

// @debt mirrors how the structure walker builds the `RoleLocation` a `file` callback receives instead of sharing one owner, so the two can drift
export function extendRoleLocation(
  location: RoleLocation,
  {
    kind,
    name,
    path,
    role,
  }: Pick<StructureNode, "kind" | "name" | "path" | "role">,
): RoleLocation {
  if (kind === "namespace" || kind === "domain") {
    return freeze({
      ...location,
      lineage: freeze([
        ...location.lineage,
        freeze({
          name,
          path,
          kind,
        }),
      ]),
    });
  }

  return kind === "role" && role !== undefined
    ? freeze({
        ...location,
        roles: freeze([...location.roles, role]),
      })
    : location;
}
