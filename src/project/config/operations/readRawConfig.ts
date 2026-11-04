import { existsSync } from "node:fs";
import { dirname } from "node:path";

import { constant } from "@auaust/toolkit/constant";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { memoized } from "@auaust/toolkit/memoized";

import { files } from "#constants";
import { importConfigFile } from "#foundation/filesystem/operations/importConfigFile";
import { resolve } from "#foundation/filesystem/utils/resolve";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface FoundConfig {
  root: Directory;
  configFile: File | undefined;
  input: unknown;
}

const warnMissingConfig = memoized(function (root: Directory) {
  console.warn(`No engrenage config found in ${root}, using defaults`);
}, constant(true));

async function findConfigFile(
  directory: Directory,
): Promise<FoundConfig | undefined> {
  const { config, cwd, _configFile } = await importConfigFile(
    directory,
    files.engrenageConfig,
  );

  if (_configFile === undefined) {
    return;
  }

  if (cwd === undefined) {
    throw new Error(`c12 resolved ${_configFile} without its directory`);
  }

  return {
    root: cwd,
    configFile: _configFile,
    input: config,
  };
}

async function findConfigIn(root: Directory): Promise<FoundConfig> {
  return (
    (await findConfigFile(root)) ?? {
      root,
      configFile: undefined,
      input: {},
    }
  );
}

async function findConfig(
  start: Directory,
  directory: Directory = start,
): Promise<FoundConfig> {
  const found = await findConfigFile(directory);

  if (found !== undefined) {
    return found;
  }

  if (existsSync(resolve(directory, files.packageJson))) {
    return {
      root: directory,
      configFile: undefined,
      input: {},
    };
  }

  const parent = dirname(directory);

  if (parent === directory) {
    return {
      root: start,
      configFile: undefined,
      input: {},
    };
  }

  return findConfig(start, parent);
}

export async function readRawConfig(
  start: Directory,
  { searchParents = true }: { searchParents?: boolean } = {},
): Promise<{ root: Directory; configFile: File | undefined; raw: RawConfig }> {
  const { root, configFile, input } = searchParents
    ? await findConfig(start)
    : await findConfigIn(start);

  if (configFile === undefined) {
    warnMissingConfig(root);
  }

  if (!isPlainObject(input)) {
    throw new TypeError(`${configFile ?? root} must export a config object`);
  }

  return {
    root,
    configFile,
    raw: input,
  };
}
