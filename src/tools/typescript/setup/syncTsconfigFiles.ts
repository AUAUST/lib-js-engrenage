import { iterable } from "@auaust/toolkit";
import { flatMap, map } from "@auaust/toolkit/array";
import { entries, keys } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits, type JsonEdit } from "#foundation/json/index";
import {
  listTsconfigRegistrations,
  resolveEnvironmentTsconfig,
} from "#project/environments/index";
import { jsonIndentation } from "#project/format/constants";
import { readGeneratedKeys, writeGeneratedKeys } from "#project/sync/index";
import {
  isLeftAlone,
  toJsonValue,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { listTsconfigTargets } from "#tools/typescript/operations/listTsconfigTargets";
import { tsconfigProducers } from "#tools/typescript/operations/tsconfigProducers";
import type { ManagedListOption } from "#foundation/options/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

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
  if (target.key !== "tests.dist") {
    return false;
  }

  const tests = await resolveEnvironmentTsconfig(config, "tests");

  return tests.file !== undefined && isDefaultOption(target.extends);
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

function toCompilerOptionsPart({ file }: TsconfigTarget) {
  return `${file}#compilerOptions`;
}

function removeDroppedOptions(
  target: TsconfigTarget,
  recorded: readonly string[] | undefined,
  kept: readonly string[],
): JsonEdit[] {
  const configured = keys(target.compilerOptions);

  return (recorded ?? [])
    .filter((name) => !configured.includes(name))
    .map((name): JsonEdit => {
      return { path: ["compilerOptions", name], value: undefined };
    })
    .filter((edit) => !isLeftAlone(edit, kept));
}

async function createEdits(
  config: LoadedConfig,
  target: TsconfigTarget,
  recorded: readonly string[] | undefined,
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

  const dropped = removeDroppedOptions(target, recorded, [
    ...leftAlone,
    ...map(managed, ({ path }) => path.join(".")),
  ]);

  const custom = iterable.map(
    entries(target.compilerOptions),
    ([name, value]): JsonEdit => {
      return {
        path: ["compilerOptions", name],
        value: toJsonValue(value, `compilerOptions.${name} of ${target.file}`),
      };
    },
  );

  return [...managed, ...dropped, ...custom];
}

async function writeTsconfig(config: LoadedConfig, target: TsconfigTarget) {
  const filesystem = config.context.filesystem;

  const part = toCompilerOptionsPart(target);

  const recorded = await readGeneratedKeys(config, part);

  const current = await filesystem.read(target.file);

  await filesystem.write(
    target.file,
    applyJsonEdits(
      current ?? emptyObjectFile,
      target.file,
      await createEdits(config, target, recorded),
      jsonIndentation,
    ),
  );

  const configured = keys(target.compilerOptions);

  if (recorded !== undefined || configured.length > 0) {
    await writeGeneratedKeys(config, part, configured);
  }
}

async function listDeclaredTsconfigFiles(
  config: LoadedConfig,
): Promise<readonly File[]> {
  const registrations = await listTsconfigRegistrations(config);

  const files: File[] = [];

  for (const key of [...registrations.map(({ name }) => name), "tests.dist"]) {
    const { file } = await resolveEnvironmentTsconfig(config, key);

    if (file !== undefined) {
      files.push(file);
    }
  }

  return files;
}

export async function syncTsconfigFiles(config: LoadedConfig) {
  const filesystem = config.context.filesystem;

  const targets = await listTsconfigTargets(config);

  const synced = new Set(targets.map(({ file }) => file));

  for (const file of await listDeclaredTsconfigFiles(config)) {
    if (!synced.has(file) && (await filesystem.exists(file))) {
      await filesystem.remove(file);
    }
  }

  for (const target of targets) {
    await writeTsconfig(config, target);
  }
}
