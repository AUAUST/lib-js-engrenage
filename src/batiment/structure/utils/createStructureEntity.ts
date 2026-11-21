import { freeze } from "@auaust/toolkit/object";

import type { Entity } from "#batiment/structure/types/Entity";
import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { Directory } from "#types/Directory";

const noLineage: readonly LineageMember[] = freeze([]);

export function createStructureEntity(
  environment: Entity["environment"],
  path: Directory,
  scope: Entity["scope"],
): Entity {
  return freeze({
    scope,
    environment,
    path,
    kind: undefined,
    group: false,
    lineage: noLineage,
    location: freeze({
      // @debt a file outside every environment of its scope gets a role location with an empty environment, where it should get no role location
      environment: environment ?? "",
      lineage: freeze([]),
      roles: freeze([]),
    }),
    domain: undefined,
    surface: freeze([]),
    collects: freeze([]),
    role: undefined,
    fileRole: undefined,
    contract: undefined,
    effects: undefined,
    public: false,
    variant: undefined,
  });
}
