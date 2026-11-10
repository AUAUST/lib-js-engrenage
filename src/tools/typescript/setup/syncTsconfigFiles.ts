import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits, type JsonEdit } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import {
  isLeftAlone,
  toJsonValue,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { listTsconfigTargets } from "#tools/typescript/operations/listTsconfigTargets";
import { tsconfigProducers } from "#tools/typescript/operations/tsconfigProducers";
import type { ManagedListOption } from "#foundation/options/index";
import type { LoadedConfig } from "#project/config/index";

function listPaths({
  extends: extended,
  include,
  exclude,
  lib,
  types,
}: TsconfigTarget) {
  const unmanagedLists = [
    [["extends"], extended],
    [["include"], include],
    [["exclude"], exclude],
    [["compilerOptions", "lib"], lib],
    [["compilerOptions", "types"], types],
  ] as const;

  return flatMap(unmanagedLists, ([path, option]) => {
    return option === false ? [path.join(".")] : [];
  });
}

function isDefaultOption(option: ManagedListOption<string> | undefined) {
  return option == null || option === true;
}

async function inheritsTestsTsconfig(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<boolean> {
  const tests = await config.resolve("tests");

  return (
    target.key === "tests.dist" &&
    tests.tsconfig.owner === "tests" &&
    isDefaultOption(target.extends)
  );
}

async function listInheritedPaths(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly string[][]> {
  if (!(await inheritsTestsTsconfig(config, target))) {
    return [];
  }

  const inheritedLists = [
    [["exclude"], target.exclude],
    [["compilerOptions", "target"], undefined],
    [["compilerOptions", "lib"], target.lib],
    [["compilerOptions", "types"], target.types],
  ] as const;

  return flatMap(inheritedLists, ([path, option]) => {
    return isDefaultOption(option) ? [[...path]] : [];
  });
}

async function createEdits(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const leftAlone = [...listPaths(target), ...target.unmanaged];

  const inherited = map(
    await listInheritedPaths(config, target),
    (path): JsonEdit => {
      return { path, value: undefined };
    },
  );

  const inheritedPaths = map(inherited, ({ path }) => path.join("."));

  const edits: JsonEdit[] = [];

  for (const produce of tsconfigProducers) {
    edits.push(...(await produce(config, target)));
  }

  const produced = edits.filter((edit) => {
    return !isLeftAlone(edit, inheritedPaths);
  });

  const managed = [...produced, ...inherited].filter((edit) => {
    return !isLeftAlone(edit, leftAlone);
  });

  // @debt configured compilerOptions are only ever set: one removed from the config stays in the tsconfig file and `sync --check` still passes
  const custom = map(
    entries(target.compilerOptions),
    ([name, value]): JsonEdit => {
      return {
        path: ["compilerOptions", name],
        value: toJsonValue(value, `compilerOptions.${name} of ${target.file}`),
      };
    },
  );

  return [...managed, ...custom];
}

export async function syncTsconfigFiles(config: LoadedConfig) {
  const filesystem = config.context.filesystem;

  for (const target of await listTsconfigTargets(config)) {
    const current = await filesystem.read(target.file);

    await filesystem.write(
      target.file,
      applyJsonEdits(
        current ?? emptyObjectFile,
        target.file,
        await createEdits(config, target),
        jsonIndentation,
      ),
    );
  }
}
