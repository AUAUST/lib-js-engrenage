import { freeze } from "@auaust/toolkit/object";

import type { Entity } from "#project/structure/types/Entity";
import type { LineageMember } from "#project/structure/types/LineageMember";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

const noLineage: readonly LineageMember[] = freeze([]);

export function createStructureEntity(
  environment: Entity["environment"],
  path: Directory,
  workspace?: Glob,
): Entity {
  return freeze({
    environment,
    workspace,
    path,
    kind: undefined,
    commands: false,
    lineage: noLineage,
    location: freeze({
      environment,
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
