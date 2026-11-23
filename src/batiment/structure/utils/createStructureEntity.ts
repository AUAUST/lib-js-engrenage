import { freeze } from "@auaust/toolkit/object";

import type { Entity } from "#batiment/structure/types/Entity";
import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { Directory } from "#types/Directory";

const noLineage: readonly LineageMember[] = freeze([]);

export function createStructureEntity(
  namespace: Entity["namespace"],
  path: Directory,
  scope: Entity["scope"],
): Entity {
  return freeze({
    scope,
    namespace,
    path,
    kind: undefined,
    group: false,
    lineage: noLineage,
    location: freeze({
      // @debt a file outside every namespace of its scope gets a role location with an empty environment, where it should get no role location
      namespace: namespace ?? "",
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
    environment: undefined,
  });
}
