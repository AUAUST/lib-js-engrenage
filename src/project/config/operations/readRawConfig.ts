import { dirname } from "node:path";

import { minimatch } from "minimatch";
import { parse } from "yaml";

import { isArray, isPlainObject, isString } from "@auaust/toolkit";

import { files } from "#constants";
import {
  importConfigFile,
  isWithin,
  pathExists,
  readTextFile,
  relativeWithin,
  resolve,
} from "#foundation/filesystem/index";
import type { Reporter } from "#nexus/reports/index";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

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

interface Workspace {
  root: Directory;
  packages: readonly Glob[];
}

function readWorkspacePackages(content: string, file: File): readonly Glob[] {
  const settings: unknown = parse(content);

  if (settings == null) {
    return [];
  }

  if (!isPlainObject(settings)) {
    throw new TypeError(`${file} must contain a YAML mapping`);
  }

  const { packages } = settings;

  if (packages == null) {
    return [];
  }

  if (!isArray(packages) || !packages.every((glob) => isString(glob))) {
    throw new TypeError(`packages in ${file} must be a list of globs`);
  }

  return packages;
}

// @debt duplicates the pnpm-workspace.yaml reading of `tools/pnpm`, which sits above `project/config` and cannot be imported here
async function findWorkspace(
  directory: Directory,
): Promise<Workspace | undefined> {
  const file = resolve(directory, files.pnpmWorkspace);

  const content = await readTextFile(file);

  if (content !== undefined) {
    return {
      root: directory,
      packages: readWorkspacePackages(content, file),
    };
  }

  const parent = dirname(directory);

  return parent === directory ? undefined : findWorkspace(parent);
}

function isWorkspacePackage(
  directory: Directory,
  { root, packages }: Workspace,
): boolean {
  if (!isWithin(root, directory)) {
    return false;
  }

  const path = relativeWithin(root, directory);

  const included = packages.some((glob) => {
    return !glob.startsWith("!") && minimatch(path, glob);
  });

  return (
    included &&
    !packages.some((glob) => {
      return glob.startsWith("!") && minimatch(path, glob.slice(1));
    })
  );
}

async function isProjectRoot(
  directory: Directory,
  workspace: Workspace | undefined,
): Promise<boolean> {
  if (directory === workspace?.root) {
    return true;
  }

  if (!(await pathExists(resolve(directory, files.packageJson)))) {
    return false;
  }

  return workspace === undefined || !isWorkspacePackage(directory, workspace);
}

async function findConfig(
  start: Directory,
  workspace: Workspace | undefined,
  directory: Directory = start,
): Promise<FoundConfig> {
  const found = await findConfigFile(directory);

  if (found !== undefined) {
    return found;
  }

  if (await isProjectRoot(directory, workspace)) {
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

  return findConfig(start, workspace, parent);
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
  const { root, configFile, input } = searchParents
    ? await findConfig(start, await findWorkspace(start))
    : await findConfigIn(start);

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
