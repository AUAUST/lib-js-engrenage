import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits, type JsonEdit } from "#foundation/json/index";
import { testsSection } from "#project/environments/index";
import { jsonIndentation } from "#project/format/constants";
import { tsconfigEnvironments } from "#project/tsconfig/constants";
import {
  isLeftAlone,
  toJsonValue,
  typescriptSection,
  type ResolvedEnvironmentTsconfig,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { tsconfigProducers } from "#tools/typescript/operations/tsconfigProducers";
import type { ManagedListOption } from "#foundation/options/index";
import type { LoadedConfig } from "#project/config/index";

const variantKeys: readonly TsconfigKey[] = [
  ...tsconfigEnvironments,
  "tests.dist",
];

function toTarget(
  key: TsconfigKey,
  {
    file,
    extends: extended,
    include,
    exclude,
    lib,
    types,
    compilerOptions,
    unmanaged,
  }: ResolvedEnvironmentTsconfig,
): TsconfigTarget | undefined {
  return file === undefined
    ? undefined
    : {
        key,
        file,
        extends: extended,
        include,
        exclude,
        lib,
        types,
        compilerOptions,
        unmanaged,
      };
}

// @debt "tests.dist" does not fit the config shape, so it is special-cased here and in createResolvedConfig, resolveTsconfigEnvironments and the extends, paths and skipLibCheck producers; a single lookup from tsconfig key to its environment would remove the branches
async function isActive(
  config: LoadedConfig,
  key: TsconfigKey,
): Promise<boolean> {
  const { active } = await resolveTsconfigEnvironment(
    config,
    key === "tests.dist" ? "tests" : key,
  );

  return active;
}

async function findTsconfig(config: LoadedConfig, key: TsconfigKey) {
  if (key === "tests.dist") {
    const { dist } = await config.resolve(testsSection);

    return dist.tsconfig;
  }

  const { tsconfig } = await resolveTsconfigEnvironment(config, key);

  return tsconfig;
}

interface PlannedTarget {
  target: TsconfigTarget;
  create: boolean;
}

async function collectTargets(config: LoadedConfig): Promise<PlannedTarget[]> {
  const { tsconfig } = await config.resolve(typescriptSection);

  const targets: PlannedTarget[] = [
    {
      target: {
        key: "base",
        file: tsconfig.file,
        extends: tsconfig.extends,
        include: undefined,
        exclude: undefined,
        lib: undefined,
        types: undefined,
        compilerOptions: tsconfig.compilerOptions,
        unmanaged: tsconfig.unmanaged,
      },
      create: true,
    },
  ];

  for (const key of variantKeys) {
    const resolved = await findTsconfig(config, key);

    if (resolved.owner !== key || !(await isActive(config, key))) {
      continue;
    }

    const target = toTarget(key, resolved);

    if (target !== undefined) {
      targets.push({ target, create: true });
    }
  }

  return targets;
}

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
  const tests = await config.resolve(testsSection);

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
    [["include"], target.include],
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

  for (const { target, create } of await collectTargets(config)) {
    const current = await filesystem.read(target.file);

    if (current === undefined && !create) {
      continue;
    }

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
