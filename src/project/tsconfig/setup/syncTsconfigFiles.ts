import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { tsconfigEnvironments } from "#project/config/constants";
import { jsonIndentation } from "#project/format/constants";
import { tsconfigProducers } from "#project/tsconfig/operations/tsconfigProducers";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { ManagedListOption } from "#project/config/types/ManagedListOption";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

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
  }: ProjectConfig["src"]["tsconfig"],
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
function isActive(config: ProjectConfig, key: TsconfigKey): boolean {
  return key === "tests.dist" ? config.tests.active : config[key].active;
}

function findTsconfig(config: ProjectConfig, key: TsconfigKey) {
  return key === "tests.dist"
    ? config.tests.dist.tsconfig
    : config[key].tsconfig;
}

interface PlannedTarget {
  target: TsconfigTarget;
  create: boolean;
}

function collectTargets(config: ProjectConfig): PlannedTarget[] {
  const { tsconfig } = config.typescript;

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
    const resolved = findTsconfig(config, key);

    if (resolved.owner !== key || !isActive(config, key)) {
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

function inheritsTestsTsconfig(
  config: ProjectConfig,
  target: TsconfigTarget,
): boolean {
  return (
    target.key === "tests.dist" &&
    config.tests.tsconfig.owner === "tests" &&
    isDefaultOption(target.extends)
  );
}

function listInheritedPaths(
  config: ProjectConfig,
  target: TsconfigTarget,
): readonly string[][] {
  if (!inheritsTestsTsconfig(config, target)) {
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

function isLeftAlone(edit: JsonEdit, leftAlone: readonly string[]): boolean {
  const path = edit.path.join(".");

  return leftAlone.some((alone) => {
    return path === alone || path.startsWith(`${alone}.`);
  });
}

// @debt same JSON round-trip as serialize in defineSchema; one shared JSON-value converter could serve both
function toJsonValue(value: unknown, subject: string): JsonValue {
  const expression = JSON.stringify(value);

  if (expression === undefined) {
    throw new TypeError(`${subject} is not JSON-serializable`);
  }

  return JSON.parse(expression);
}

function createEdits(
  config: ProjectConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const leftAlone = [...listPaths(target), ...target.unmanaged];

  const inherited = map(
    listInheritedPaths(config, target),
    (path): JsonEdit => {
      return { path, value: undefined };
    },
  );

  const inheritedPaths = map(inherited, ({ path }) => path.join("."));

  const produced = flatMap(tsconfigProducers, (produce) => {
    return produce(config, target);
  }).filter((edit) => {
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

export function syncTsconfigFiles(config: ProjectConfig) {
  for (const { target, create } of collectTargets(config)) {
    const current = config.filesystem.read(target.file);

    if (current === undefined && !create) {
      continue;
    }

    config.filesystem.write(
      target.file,
      applyJsonEdits(
        current ?? emptyObjectFile,
        target.file,
        createEdits(config, target),
        jsonIndentation,
      ),
    );
  }
}
