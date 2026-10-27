import { existsSync } from "node:fs";
import { dirname } from "node:path";

import { loadConfig as loadConfigFile } from "c12";

import { constant } from "@auaust/toolkit/constant";
import { memoized } from "@auaust/toolkit/memoized";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { files } from "#constants";
import { resolve } from "#support/filesystem/utils/resolve";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
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

async function loadConfigIn(directory: Directory) {
  return loadConfigFile({
    cwd: directory,
    configFile: files.engrenageConfig,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
    envName: false,
    extend: false,
    giget: false,
  });
}

async function findConfigFile(
  directory: Directory,
): Promise<FoundConfig | undefined> {
  const { config, cwd, _configFile } = await loadConfigIn(directory);

  if (_configFile === undefined) {
    return undefined;
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

export async function readConfig(
  start: Directory,
  { searchParents = true }: { searchParents?: boolean } = {},
): Promise<ResolvedConfig> {
  const { root, configFile, input } = searchParents
    ? await findConfig(start)
    : await findConfigIn(start);

  if (configFile === undefined) {
    warnMissingConfig(root);
  }

  return createResolvedConfig({
    root,
    raw: validate(configSchema, input, configFile ?? root),
    configFile,
  });
}
