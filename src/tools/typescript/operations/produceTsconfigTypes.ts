import { filter, map } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";

import { engrenage } from "#constants";
import { resolveListOption } from "#foundation/options/index";
import { apiLibraryGroups } from "#project/baseline/constants";
import { includesEsLibrary, type Runtime } from "#project/baseline/index";
import { sourceSection } from "#project/environments/index";
import {
  readTsconfigValue,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigLibrary } from "#tools/typescript/operations/resolveTsconfigLibrary";
import { resolveTsconfigRuntime } from "#tools/typescript/operations/resolveTsconfigRuntime";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";

const apiTypesPrefix = `${engrenage}/apis/`;

async function createDefaultTypes(
  config: LoadedConfig,
  target: TsconfigTarget,
  runtime: Runtime | undefined,
): Promise<() => readonly string[]> {
  if (runtime === undefined) {
    return () => [];
  }

  if (runtime.kind === "node") {
    return () => ["node"];
  }

  const library = (
    (await resolveTsconfigLibrary(config, target)) || runtime.lib
  ).map((name) => name.toLowerCase());

  const { apis } = await config.resolve(sourceSection);

  return () => listBaselineTypes(target, apis, library);
}

function listBaselineTypes(
  target: TsconfigTarget,
  apis: readonly string[],
  library: readonly string[],
): readonly string[] {
  // @debt includesEsLibrary only knows the generated editions: a lib it does not know (`esnext.*`, `ESNext`, `DOM`) never counts as including a library group
  return map(
    filter(apis, (api) => {
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

async function removeBaselineTypes(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const current = await readTsconfigValue(config, target, [
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

export async function produceTsconfigTypes(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const { key, types: option } = target;

  if (key === "base") {
    return [];
  }

  const runtime = await resolveTsconfigRuntime(config, key);

  if (runtime === undefined && (option == null || option === true)) {
    return removeBaselineTypes(config, target);
  }

  const types = resolveListOption(
    option,
    await createDefaultTypes(config, target, runtime),
    `${key}.tsconfig.types`,
  );

  return types === false
    ? []
    : [{ path: ["compilerOptions", "types"], value: [...types] }];
}
