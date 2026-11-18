import { dirname } from "node:path";

import { isPlainObject } from "@auaust/toolkit";

import { files } from "#constants";
import {
  importConfigFile,
  pathExists,
  resolve,
} from "#foundation/filesystem/index";
import type { Reporter } from "#foundation/reports/index";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface FoundConfig {
  root: Directory;
  configFile: File | undefined;
  input: unknown;
}

const warnedRoots = new WeakMap<Reporter, Set<Directory>>();

function warnMissingConfig(root: Directory, reporter: Reporter): void {
  const warned = warnedRoots.get(reporter) ?? new Set<Directory>();

  if (warned.has(root)) {
    return;
  }

  warned.add(root);
  warnedRoots.set(reporter, warned);

  reporter.warn(`No engrenage config found in ${root}, using defaults`);
}

async function findConfigFile(
  directory: Directory,
): Promise<FoundConfig | undefined> {
  const {
    layers,
    cwd,
    _configFile,
  } = await importConfigFile(directory, files.engrenageConfig);

  if (_configFile === undefined) {
    return;
  }

  if (cwd === undefined) {
    throw new Error(`c12 resolved ${_configFile} without its directory`);
  }

  return {
    root: cwd,
    configFile: _configFile,
    input: layers?.find(({ configFile }) => configFile !== undefined)?.config,
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

  if (await pathExists(resolve(directory, files.packageJson))) {
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
  {
    searchParents = true,
    reporter,
  }: { searchParents?: boolean; reporter: Reporter },
): Promise<{
  root: Directory;
  configFile: File | undefined;
  raw: RawConfig;
}> {
  const {
    root,
    configFile,
    input,
  } = searchParents ? await findConfig(start) : await findConfigIn(start);

  if (configFile === undefined) {
    warnMissingConfig(root, reporter);
  }

  if (!isPlainObject(input)) {
    throw new TypeError(
      `${configFile ?? root} must export a config object or a function returning one`,
    );
  }

  return {
    root,
    configFile,
    raw: input,
  };
}
