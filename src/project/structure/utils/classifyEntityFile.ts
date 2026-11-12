import { indexRoleName } from "#project/roles/constants";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import { isPlaced } from "#project/structure/utils/isPlaced";
import { matchFileRole } from "#project/structure/utils/matchFileRole";
import type { Entity } from "#project/structure/types/Entity";
import type { LocatedEntity } from "#project/structure/types/LocatedEntity";
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
