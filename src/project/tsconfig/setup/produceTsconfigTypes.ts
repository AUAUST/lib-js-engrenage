import { filter, map } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";

import { apiLibraryGroups } from "#baseline/constants";
import { includesEsLibrary } from "#baseline/utils/includesEsLibrary";
import { resolveListOption } from "#config/utils/resolveListOption";
import { engrenage } from "#constants";
import { readTsconfigValue } from "#tsconfig/utils/readTsconfigValue";
import { resolveTsconfigLibrary } from "#tsconfig/utils/resolveTsconfigLibrary";
import { resolveTsconfigRuntime } from "#tsconfig/utils/resolveTsconfigRuntime";
import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

const apiTypesPrefix = `${engrenage}/apis/`;

function listDefaultTypes(
  config: ResolvedConfig,
  target: TsconfigTarget,
  runtime: Runtime | undefined,
): readonly string[] {
  if (runtime === undefined) {
    return [];
  }

  if (runtime.kind === "node") {
    return ["node"];
  }

  const library = (resolveTsconfigLibrary(config, target) || runtime.lib).map(
    (name) => name.toLowerCase(),
  );

  // @debt includesEsLibrary only knows the generated editions: a lib it does not know (`esnext.*`, `ESNext`, `DOM`) never counts as including a library group
  return map(
    filter(config.src.apis, (api) => {
      if (!isLibraryGroup(api)) {
        return true;
      }

      const name = apiLibraryGroups[api].slice("lib.".length, -".d.ts".length);

      if (!includesEsLibrary(library, name)) {
        return true;
      }

      console.warn(
        `src.apis lists ${api}, whose lib ${name} is already in the ${target.key} tsconfig lib: it is left out of types; remove it from src.apis`,
      );

      return false;
    }),
    (api) => `${apiTypesPrefix}${api}`,
  );
}

function isLibraryGroup(group: string): group is keyof typeof apiLibraryGroups {
  return group in apiLibraryGroups;
}

function removeBaselineTypes(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const current = readTsconfigValue(config, target, [
    "compilerOptions",
    "types",
  ]);

  if (!isArray(current)) {
    return [];
  }

  // @debt the removed prefix is stated apart from what listDefaultTypes writes for a baseline runtime, so a new kind of baseline type must be added in both places
  const kept = filter(current, (type) => {
    return !isString(type) || !type.startsWith(apiTypesPrefix);
  });

  if (kept.length === current.length) {
    return [];
  }

  return [
    {
      path: ["compilerOptions", "types"],
      value: kept.length === 0 ? undefined : kept,
    },
  ];
}

export function produceTsconfigTypes(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const { key, types: option } = target;

  if (key === "base") {
    return [];
  }

  const runtime = resolveTsconfigRuntime(config, key);

  if (runtime === undefined && (option == null || option === true)) {
    return removeBaselineTypes(config, target);
  }

  const types = resolveListOption(
    option,
    () => listDefaultTypes(config, target, runtime),
    `${key}.tsconfig.types`,
  );

  return types === false
    ? []
    : [{ path: ["compilerOptions", "types"], value: [...types] }];
}
