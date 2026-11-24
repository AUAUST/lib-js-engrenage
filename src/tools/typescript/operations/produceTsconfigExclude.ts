import { posix } from "node:path";

import { iterable } from "@auaust/toolkit";
import { isNonEmptyArray, toArray } from "@auaust/toolkit/array";

import { filesIn, withExtensions } from "#foundation/filesystem/index";
import { resolveListOption } from "#foundation/options/index";
import {
  readEnvironmentLanguages,
  type LanguageEntry,
} from "#project/environments/index";
import { toTsconfigGlobs, type TsconfigTarget } from "#project/tsconfig/index";
import { isBelow } from "#tools/typescript/utils/isBelow";
import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import { toTsconfigOptionPath } from "#tools/typescript/utils/toTsconfigOptionPath";
import type { EnvironmentInstance } from "#batiment/environments/index";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";

function listChildDirectories(files: Files, dir: Directory): Directories {
  return toArray(
    iterable.unique(
      iterable.filterMap(files, (file) => {
        if (!isBelow(dir, file)) {
          return;
        }

        const [child, ...rest] = file.slice(dir.length + 1).split("/");

        return rest.length === 0 ? undefined : `${dir}/${child}`;
      }),
    ),
  );
}

interface KeptPlacements {
  readonly dirs: Directories;
  readonly files: Files;
}

interface LevelExclusion {
  readonly files: Files;
  readonly languages: readonly LanguageEntry[];
}

function excludeLevel(
  dir: Directory,
  kept: Files,
  { files, languages }: LevelExclusion,
): readonly Glob[] {
  const extensions = languages.flatMap((language) => language.extensions);

  if (!kept.some((file) => posix.dirname(file) === dir)) {
    return languages.map((language) => {
      return withExtensions(`${dir}/*`, language.extensions);
    });
  }

  return files.filter((file) => {
    return (
      posix.dirname(file) === dir &&
      !kept.includes(file) &&
      extensions.some((extension) => file.endsWith(extension))
    );
  });
}

function excludeAround(
  dir: Directory,
  kept: KeptPlacements,
  level: LevelExclusion,
): readonly Glob[] {
  if (![...kept.dirs, ...kept.files].some((path) => isBelow(dir, path))) {
    return [`${dir}/**`];
  }

  return [
    ...excludeLevel(dir, kept.files, level),
    ...listChildDirectories(level.files, dir)
      .filter((child) => !kept.dirs.includes(child))
      .flatMap((child) => excludeAround(child, kept, level)),
  ];
}

async function listNestedPlacements(
  config: LoadedConfig,
  instance: EnvironmentInstance | undefined,
): Promise<readonly Glob[]> {
  if (instance === undefined) {
    return [];
  }

  const languages = await readEnvironmentLanguages(
    await config.context.scope(instance.scope),
    instance.environment,
  );

  const kept = [...instance.dirs, ...instance.files];

  const excluded = await Promise.all(
    instance.nested.map(async ({ dir }) => {
      const files = kept.some((path) => isBelow(dir, path))
        ? await config.context.filesystem.list(dir)
        : [];

      // @debt the directories present at sync spell out the subtree around its own placements, and the files present at sync the levels holding its file placements, so a directory or file added there leaves the tsconfig stale until the next sync, which `sync --check` reports
      return excludeAround(dir, instance, { files, languages });
    }),
  );

  return toArray(iterable.unique(iterable.flat(excluded)));
}

async function listScopeFixtures(
  config: LoadedConfig,
  scope: Directory,
): Promise<readonly Glob[]> {
  const scoped = await config.context.scope(scope);

  const tests = await scoped.resolve("tests");

  return filesIn(tests.dirs, tests.fixtures);
}

async function createDefaultExclude(
  config: LoadedConfig,
  { key, file, scope, instance }: TsconfigTarget,
): Promise<() => readonly string[]> {
  const name = toTsconfigEnvironment(key);

  const fixtures = name === "tests"
    ? await listScopeFixtures(config, scope)
    : [];

  const nested = await listNestedPlacements(config, instance);

  return () => toTsconfigGlobs(file, [...fixtures, ...nested]);
}

export async function produceTsconfigExclude(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const { key, exclude: option } = target;

  if (key === "base") {
    return [];
  }

  const exclude = resolveListOption(
    option,
    await createDefaultExclude(config, target),
    `${toTsconfigOptionPath(key)}.exclude`,
    config.context.reporter,
  );

  const isDefault = option == null || option === true;

  if (exclude === false || (!isNonEmptyArray(exclude) && isDefault)) {
    return [];
  }

  return [{ path: ["exclude"], value: [...exclude] }];
}
