import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { tsconfigEnvironments } from "#config/constants";
import { emptyObjectFile } from "#support/json/constants";
import { applyJsonEdits } from "#support/json/utils/applyJsonEdits";
import { tsconfigProducers } from "#typescript/setup/tsconfigProducers";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { JsonValue } from "#support/json/types/JsonValue";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

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
  }: ResolvedConfig["src"]["tsconfig"],
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

function isActive(config: ResolvedConfig, key: TsconfigKey): boolean {
  return key === "tests.dist" ? config.tests.active : config[key].active;
}

function findTsconfig(config: ResolvedConfig, key: TsconfigKey) {
  return key === "tests.dist"
    ? config.tests.dist.tsconfig
    : config[key].tsconfig;
}

interface PlannedTarget {
  target: TsconfigTarget;
  create: boolean;
}

function collectTargets(config: ResolvedConfig): PlannedTarget[] {
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
      create: false,
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

function isLeftAlone(edit: JsonEdit, leftAlone: readonly string[]): boolean {
  const path = edit.path.join(".");

  return leftAlone.some((alone) => {
    return path === alone || path.startsWith(`${alone}.`);
  });
}

function toJsonValue(value: unknown, subject: string): JsonValue {
  const expression = JSON.stringify(value);

  if (expression === undefined) {
    throw new TypeError(`${subject} is not JSON-serializable`);
  }

  return JSON.parse(expression);
}

function createEdits(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const leftAlone = [...listPaths(target), ...target.unmanaged];

  const managed = flatMap(tsconfigProducers, (produce) => {
    return produce(config, target);
  }).filter((edit) => {
    return !isLeftAlone(edit, leftAlone);
  });

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

export function syncTsconfigFiles(config: ResolvedConfig) {
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
      ),
    );
  }
}
