import { freeze } from "@auaust/toolkit/object";

import { defaultTsconfigCheck } from "#config/constants";
import { resolveListOption } from "#config/utils/resolveListOption";
import { resolveTsconfigOwner } from "#config/utils/resolveTsconfigOwner";
import type { TsconfigGroups } from "#config/types/TsconfigGroups";
import type { TsconfigKey } from "#config/types/TsconfigKey";

export function resolveTsconfig(key: TsconfigKey, groups: TsconfigGroups) {
  const owner = resolveTsconfigOwner(key, groups);

  if (owner === undefined) {
    return freeze({
      owner,
      file: undefined,
      extends: undefined,
      include: undefined,
      lib: undefined,
      types: undefined,
      compilerOptions: {},
      unmanaged: [],
      check: false,
    });
  }

  const group = groups[owner];
  const option = group === false ? undefined : group;

  return freeze({
    owner,
    file: option?.path ?? `tsconfig.${owner}.json`,
    extends: option?.extends,
    include: option?.include,
    lib: option?.lib,
    types: option?.types,
    compilerOptions: option?.compilerOptions ?? {},
    unmanaged: resolveListOption(
      option?.unmanaged,
      () => [],
      `${owner}.tsconfig.unmanaged`,
    ),
    check: option?.check ?? defaultTsconfigCheck[owner],
  });
}
