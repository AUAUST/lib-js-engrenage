import { freeze } from "@auaust/toolkit/object";

import { resolveTsconfigOwner } from "#project/tsconfig/utils/resolveTsconfigOwner";
import type { TsconfigGroups } from "#project/tsconfig/types/TsconfigGroups";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

export function resolveTsconfig(key: TsconfigKey, groups: TsconfigGroups) {
  const owner = resolveTsconfigOwner(key, groups);

  if (owner === undefined) {
    return freeze({
      owner: undefined,
      file: undefined,
      location: undefined,
      extends: undefined,
      include: undefined,
      exclude: undefined,
      lib: undefined,
      types: undefined,
      compilerOptions: {},
      unmanaged: [],
      check: false,
    });
  }

  const { group } = owner;

  return freeze({
    owner: owner.key,
    file: group.path.file,
    location: group.path,
    extends: group.extends,
    include: group.include,
    exclude: group.exclude,
    lib: group.lib,
    types: group.types,
    compilerOptions: group.compilerOptions,
    unmanaged: group.unmanaged,
    check: group.check,
  });
}
