import { structureEnvironmentNames } from "#project/structure/constants";
import type { Entity } from "#project/structure/types/Entity";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";

export function isStructureEnvironment(
  name: Entity["environment"],
): name is StructureEnvironmentName {
  return structureEnvironmentNames.some((environment) => environment === name);
}
