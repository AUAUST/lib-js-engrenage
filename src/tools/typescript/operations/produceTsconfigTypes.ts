import { isArray, isString, iterable } from "@auaust/toolkit";
import { filter, toArray } from "@auaust/toolkit/array";

import { engrenage } from "#constants";
import { resolveListOption } from "#foundation/options/index";
import { apiLibraryGroups } from "#project/baseline/constants";
import { includesEsLibrary, type Runtime } from "#project/baseline/index";
import {
  readTsconfigValue,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigExecution } from "#tools/typescript/operations/resolveTsconfigExecution";
import { resolveTsconfigLibrary } from "#tools/typescript/operations/resolveTsconfigLibrary";
import type { JsonEdit } from "#foundation/json/index";
import type { Reporter } from "#foundation/reports/index";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedExecution } from "#project/environments/index";

const apiTypesPrefix = `${engrenage}/apis/`;

async function createDefaultTypes(
  config: LoadedConfig,
  target: TsconfigTarget,
  {
    runtime,
    apis,
  }: { runtime: Runtime | undefined; apis: ResolvedExecution["apis"] },
): Promise<() => readonly string[]> {
  if (runtime === undefined) {
    return () => [];
  }

  const tool = await resolveToolTypes(config, target);

  if (runtime.kind === "node") {
    return () => {
      return ["node", ...tool];
    };
  }

  const library = (
    (await resolveTsconfigLibrary(config, target)) || runtime.lib
  ).map((name) => name.toLowerCase());

  return () => {
    return [
      ...listBaselineTypes(target, apis, library, config.context.reporter),
      ...tool,
    ];
  };
}

async function resolveToolTypes(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly string[]> {
  if (target.key !== "src") {
    return [];
  }

  const tool = await config.resolve("build.tool");

  return tool === false ? [] : (tool.types ?? []);
}

function listBaselineTypes(
  target: TsconfigTarget,
  apis: readonly string[],
  library: readonly string[],
  reporter: Reporter,
): readonly string[] {
  // @debt includesEsLibrary only knows the generated editions: a lib it does not know (`esnext.*`, `ESNext`, `DOM`) never counts as including a library group
  return toArray(
    iterable.map(
      iterable.filter(apis, (api) => {
        if (!isLibraryGroup(api)) {
          return true;
        }

        const name = apiLibraryGroups[api].slice(
          "lib.".length,
          -".d.ts".length,
        );

        if (!includesEsLibrary(library, name)) {
          return true;
        }

        reporter.warn(
          `The ${target.key} environment's execution.apis lists ${api}, whose lib ${name} is already in its tsconfig lib: it is left out of types; remove it from execution.apis`,
        );

        return false;
      }),
      (api) => `${apiTypesPrefix}${api}`,
    ),
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

  const execution = await resolveTsconfigExecution(config, key);

  const runtime = execution?.runtime;

  if (runtime === undefined && (option == null || option === true)) {
    return removeBaselineTypes(config, target);
  }

  const types = resolveListOption(
    option,
    await createDefaultTypes(config, target, {
      runtime,
      apis: execution?.apis ?? [],
    }),
    `${key}.tsconfig.types`,
    config.context.reporter,
  );

  return types === false
    ? []
    : [{ path: ["compilerOptions", "types"], value: [...types] }];
}
