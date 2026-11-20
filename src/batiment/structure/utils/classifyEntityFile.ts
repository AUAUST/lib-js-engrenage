import { indexRoleName } from "#batiment/roles/constants";
import { getIndexFile } from "#batiment/roles/index";
import { isPlaced } from "#batiment/structure/utils/isPlaced";
import { matchFileRole } from "#batiment/structure/utils/matchFileRole";
import type { Entity } from "#batiment/structure/types/Entity";
import type { LocatedEntity } from "#batiment/structure/types/LocatedEntity";
import type { Directory } from "#types/Directory";

export function classifyEntityFile(
  name: string,
  directory: Directory,
  { entity, roles, named }: LocatedEntity,
): Pick<Entity, "role" | "fileRole" | "contract" | "effects"> {
  const atRoot = directory === entity.path;

  const matched = matchFileRole(name, {
    named: atRoot ? named : [],
    enclosing: entity.role,
    roles,
  });

  const nested = named.find((candidate) => candidate.name === matched);

  if (atRoot && nested !== undefined) {
    return {
      role: nested.name,
      fileRole: nested.name,
      contract: nested.contract,
      effects: nested.contract.effects,
    };
  }

  if (entity.role !== undefined) {
    const isBarrel = (
      entity.contract !== undefined &&
      isPlaced(entity.contract.index, entity.domain === undefined) &&
      roles !== undefined &&
      name === getIndexFile(roles)
    );

    return {
      role: entity.role,
      fileRole: isBarrel ? indexRoleName : undefined,
      contract: entity.contract,
      effects: entity.effects,
    };
  }

  const role = atRoot ? matched : undefined;

  const contract = role === undefined ? undefined : roles?.roles[role];

  return {
    role,
    fileRole: matched,
    contract,
    effects: contract?.effects,
  };
}
