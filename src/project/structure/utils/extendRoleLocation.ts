import { freeze } from "@auaust/toolkit/object";

import type { RoleLocation } from "#project/roles/index";
import type { StructureNode } from "#project/structure/types/StructureNode";

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
