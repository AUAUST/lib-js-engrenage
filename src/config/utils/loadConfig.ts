import { existsSync } from "node:fs";
import { dirname } from "node:path";

import { loadConfig as loadConfigFile } from "c12";

import { constant } from "@auaust/toolkit/constant";
import { memoized } from "@auaust/toolkit/memoized";

import { configSchema } from "#config/config/schemas/configSchema";
import {
  configFileName,
  defaultDistTsconfigFile,
  defaultGitignoreFile,
  defaultPrettierignoreFile,
  defaultTsconfigFile,
  packageFile,
} from "#config/constants";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { resolve } from "#support/filesystem/utils/resolve";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface FoundConfig {
  root: Directory;
  configFile: File | undefined;
  input: unknown;
}

const loadedConfigs = new Map<Directory, Promise<ResolvedConfig>>();

const warnMissingConfig = memoized(function (root: Directory) {
  console.warn(`No engrenage config found in ${root}, using defaults`);
}, constant(true));

async function loadConfigIn(directory: Directory) {
  return loadConfigFile({
    cwd: directory,
    configFile: configFileName,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
    envName: false,
    extend: false,
    giget: false,
  });
}

async function findConfig(
  start: Directory,
  directory: Directory = start,
): Promise<FoundConfig> {
  const { config, cwd, _configFile } = await loadConfigIn(directory);

  if (_configFile !== undefined) {
    if (cwd === undefined) {
      throw new Error(`c12 resolved ${_configFile} without its directory`);
    }

    return {
      root: cwd,
      configFile: _configFile,
      input: config,
    };
  }

  if (existsSync(resolve(directory, packageFile))) {
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

function resolveSourceFile({
  root,
  configured,
  fallback,
}: {
  root: Directory;
  configured?: File | undefined;
  fallback: File;
}): File | undefined {
  if (configured === undefined) {
    const path = resolveWithin(root, fallback);

    return existsSync(path) ? path : undefined;
  }

  const path = resolveWithin(root, configured);

  if (!existsSync(path)) {
    throw new Error(`The configured ${configured} does not exist in ${root}`);
  }

  return path;
}

async function readConfig(start: Directory): Promise<ResolvedConfig> {
  const { root, configFile, input } = await findConfig(start);

  if (configFile === undefined) {
    warnMissingConfig(root);
  }

  const raw = validate(configSchema, input, configFile ?? root);

  const tsconfigPath = resolveSourceFile({
    root,
    configured: raw.files?.tsconfig,
    fallback: defaultTsconfigFile,
  });

  const distTsconfigPath = resolveSourceFile({
    root,
    configured: raw.files?.distTsconfig,
    fallback: defaultDistTsconfigFile,
  });

  return createResolvedConfig({
    root,
    raw,
    packageJsonPath: resolveSourceFile({
      root,
      fallback: packageFile,
    }),
    tsconfigPath,
    distTsconfigPath: distTsconfigPath ?? tsconfigPath,
    gitignorePath: resolveSourceFile({
      root,
      configured: raw.files?.gitignore,
      fallback: defaultGitignoreFile,
    }),
    prettierignorePath: resolveSourceFile({
      root,
      configured: raw.files?.prettierignore,
      fallback: defaultPrettierignoreFile,
    }),
  });
}

export function loadConfig(
  cwd: Directory | URL = process.cwd(),
): Promise<ResolvedConfig> {
  const start = resolve(cwd);

  const cached = loadedConfigs.get(start);

  if (cached !== undefined) {
    return cached;
  }

  const loaded = readConfig(start);

  loadedConfigs.set(start, loaded);

  loaded.catch(() => {
    loadedConfigs.delete(start);
  });

  return loaded;
}
